#!/usr/bin/env python3
"""Offline Jekyll/Notion Markdown ZIP conversion with review-only output."""

import argparse
import csv
import hashlib
import html
import json
import re
import shutil
import subprocess
import sys
import zipfile
from datetime import date
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import quote, unquote, urlsplit

import yaml


FIELDS = ("Jekyll source", "公開日", "カテゴリ", "パーマリンク", "元記事URL")
LIQUID = re.compile(r"{{.*?}}|{%.*?%}", re.DOTALL)
MARKDOWN_LINK = re.compile(r"(!?\[[^\]\n]*\]\()(<[^>]+>|[^\s)]+)([^)\n]*\))")
NOTION_ID = re.compile(r" [0-9a-f]{32}$")
MAX_ARCHIVE_BYTES = 512 * 1024 * 1024


def digest(data):
    return hashlib.sha256(data).hexdigest()


def split_frontmatter(text):
    match = re.match(r"\A---\r?\n(.*?)\r?\n---(?:\r?\n|$)", text, re.DOTALL)
    if not match:
        raise ValueError("YAML Front Matterがありません")
    metadata = yaml.safe_load(match[1]) or {}
    if not isinstance(metadata, dict):
        raise ValueError("Front Matterはmappingである必要があります")
    return text[: match.end()], metadata, text[match.end() :]


def safe_name(value):
    return re.sub(r"[^\w.-]+", "-", value, flags=re.UNICODE).strip(".-") or "article"


def table_escape(value):
    return str(value).replace("|", "&#124;").replace("\n", " ")


def header(title, values):
    rows = "\n".join(f"| {key} | {table_escape(values[key])} |" for key in FIELDS)
    return f"# {title}\n\n| 項目 | 値 |\n| --- | --- |\n{rows}\n\n"


def parse_page(text):
    heading = re.match(r"\A\s*# ([^\n]+)\n", text)
    if not heading:
        raise ValueError("Notionページの先頭に # タイトルが必要です")
    title = heading[1].strip()
    body = text[heading.end() :]
    values = {}
    table = re.match(r"\s*\| 項目 \| 値 \|\n\|[ -]+\|[ -]+\|\n", body)
    if table:
        body = body[table.end() :]
        while body.startswith("|"):
            row, separator, rest = body.partition("\n")
            parts = row.strip().strip("|").split("|")
            if len(parts) != 2 or parts[0].strip() not in FIELDS:
                break
            values[parts[0].strip()] = html.unescape(parts[1].strip())
            body = rest if separator else ""
    return title, values, body.lstrip("\n")


class HtmlToMarkdown(HTMLParser):
    def __init__(self, warning):
        super().__init__(convert_charrefs=False)
        self.parts = []
        self.warning = warning
        self.links = []
        self.in_frame = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "img":
            alt = html.escape(attrs.get("alt", ""), quote=False).replace("[", "\\[").replace("]", "\\]")
            self.parts.append(f"![{alt}](<{attrs.get('src', '')}>)")
        elif tag == "iframe":
            self.in_frame = True
            label = attrs.get("title") or "埋め込みコンテンツ"
            self.parts.append(f"[{label}](<{attrs.get('src', '')}>)")
            self.warning("iframeをリンクへ変換（Notionで必要なら埋め込み直してください）")
        elif tag in ("figure", "div"):
            self.parts.append("\n")
        elif tag == "span":
            pass
        elif tag == "a":
            decorative = attrs.get("aria-hidden") == "true"
            if decorative and attrs.get("href", "") not in "".join(self.parts):
                decorative = False
            self.links.append((attrs.get("href", ""), decorative))
            if not decorative:
                self.parts.append("[")
        elif tag == "br":
            self.parts.append("\n")
        else:
            self.parts.append(self.get_starttag_text())
            self.warning(f"HTMLタグを保持・Notion表示未確認: {tag}")

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        if tag == "iframe":
            self.in_frame = False
        elif tag in ("figure", "div"):
            self.parts.append("\n")
        elif tag == "span":
            pass
        elif tag == "a" and self.links:
            address, decorative = self.links.pop()
            if not decorative:
                self.parts.append(f"](<{address}>)")
        elif tag not in ("img", "br"):
            self.parts.append(f"</{tag}>")

    def handle_data(self, data):
        if not self.in_frame and not any(decorative for _, decorative in self.links):
            self.parts.append(data)

    def handle_entityref(self, name):
        self.parts.append(f"&{name};")

    def handle_charref(self, name):
        self.parts.append(f"&#{name};")


def outside_code(text, transform):
    pieces = re.split(r"(^[ \t]*```[^\n]*\n.*?^[ \t]*```[^\n]*(?:\n|$)|`[^`\n]*`)", text, flags=re.MULTILINE | re.DOTALL)
    return "".join(piece if index % 2 else transform(piece) for index, piece in enumerate(pieces))


def new_output(path, repo):
    path = path.resolve()
    if path.exists():
        raise ValueError(f"出力先は新規ディレクトリを指定してください: {path}")
    for protected in (repo / "_posts", repo / "assets", repo / "_pages"):
        if path == protected or protected in path.parents:
            raise ValueError("元記事・assets・ページ配下への直接出力は禁止です")
    return path


def jekyll_urls(repo):
    bundle = shutil.which("bundle3.2") or shutil.which("bundle")
    if not bundle:
        raise ValueError("既存JekyllのURL解決にbundleが必要です")
    program = 'config=Jekyll.configuration({"source"=>Dir.pwd,"quiet"=>true,"unpublished"=>true,"future"=>true}); site=Jekyll::Site.new(config); site.prepare if site.respond_to?(:prepare); puts JSON.generate(Dir.glob("_posts/*.md").sort.map{|path| doc=Jekyll::Document.new(File.expand_path(path),{site: site, collection: site.posts}); doc.read; {"source"=>path,"url"=>doc.url,"date"=>doc.date.iso8601}})'
    result = subprocess.run([bundle, "exec", "ruby", "-rjekyll", "-rjson", "-e", program], cwd=repo, capture_output=True, text=True, check=True)
    return {item["source"]: item for item in json.loads(result.stdout.strip().splitlines()[-1])}


def export_articles(args):
    repo = args.repo.resolve()
    output = new_output(args.output, repo)
    config = yaml.safe_load((repo / "_config.yml").read_text())
    base = str(config.get("url", "")).rstrip("/") + str(config.get("baseurl", ""))
    urls = jekyll_urls(repo)
    records = []
    warnings = []
    assets = {}
    external = set()
    archive = {}
    for source in sorted((repo / "_posts").glob("*.md")):
        raw = source.read_text()
        front, metadata, body = split_frontmatter(raw)
        source_key = source.relative_to(repo).as_posix()
        title = metadata.get("title")
        if not isinstance(title, str) or "\n" in title:
            raise ValueError(f"不正なtitle: {source_key}")
        location = urls[source_key]
        categories = metadata.get("categories", [])
        if isinstance(categories, str):
            categories = categories.split()
        values = dict(zip(FIELDS, (source.name, str(metadata.get("date", location["date"])), json.dumps(categories, ensure_ascii=False), str(metadata.get("permalink", "")), base + location["url"])))
        page = f"articles/{source.stem} {safe_name(title)}.md"
        records.append({"source": source_key, "page": page, "title": title, "values": values, "frontmatter": front, "body": body, "sha256": digest(source.read_bytes())})
    page_urls = {}
    for record in records:
        address = record["values"]["元記事URL"]
        if address in page_urls:
            warnings.append({"article": record["source"], "message": f"既存記事URLの重複（元サイト不変更）: {address}"})
            page_urls[address] = None
        else:
            page_urls[address] = record["page"]
    for record in records:
        def warning(message):
            warnings.append({"article": record["source"], "message": message})

        def convert(text):
            text = text.replace("{{ site.url }}{{ site.baseurl }}", base)
            text = re.sub(r"{{\s*(['\"])(.*?)\1\s*\|\s*(?:relative_url|absolute_url)\s*}}", lambda match: base + "/" + match[2].lstrip("/"), text)
            for variable, value in (("site.url", str(config.get("url", ""))), ("site.baseurl", str(config.get("baseurl", "")))):
                text = re.sub(r"{{\s*" + re.escape(variable) + r"\s*}}", lambda _: value, text)
            for expression in LIQUID.findall(text):
                warning(f"未対応Liquidを原文保持: {expression}")
            parser = HtmlToMarkdown(warning)
            parser.feed(text)
            parser.close()
            return "".join(parser.parts)

        converted = outside_code(record["body"], convert)

        def link(match):
            address = html.unescape(match[2].strip("<>"))
            parsed = urlsplit(address)
            if parsed.scheme in ("http", "https") and not address.startswith(base + "/"):
                external.add(address)
                return match[0]
            if page_urls.get(address):
                relative = Path(page_urls[address]).name
                return match[1] + "<" + quote(relative) + ">" + match[3]
            if (parsed.scheme and not address.startswith(base + "/")) or address.startswith(("#", "//")):
                return match[0]
            local = unquote(parsed.path)
            if address.startswith(base + "/"):
                local = unquote(urlsplit(address[len(base) :]).path)
            elif local.startswith(str(config.get("baseurl", "")) + "/"):
                local = local[len(str(config.get("baseurl", ""))) :]
            candidate = (repo / local.lstrip("/")).resolve() if local.startswith("/") else (repo / "_posts" / local).resolve()
            if repo not in candidate.parents or "assets/portfolio-evidence" in candidate.as_posix():
                warning(f"安全性のため収集しないリンク: {address}")
                return match[0]
            if not candidate.is_file():
                warning(f"ローカルリンク解決不能（原文保持）: {address}")
                return match[0]
            asset_key = candidate.relative_to(repo).as_posix()
            target = "attachments/" + asset_key
            assets[target] = candidate.read_bytes()
            relative = "../" + target
            suffix = ("?" + parsed.query if parsed.query else "") + ("#" + parsed.fragment if parsed.fragment else "")
            return match[1] + "<" + quote(relative) + suffix + ">" + match[3]

        converted = outside_code(converted, lambda text: MARKDOWN_LINK.sub(link, text))
        record["converted_body"] = converted
        archive[record["page"]] = (header(record["title"], record["values"]) + converted).encode()
    output.mkdir(parents=True)
    with zipfile.ZipFile(output / "notion-import.zip", "w", compression=zipfile.ZIP_DEFLATED) as package:
        for name, data in {**archive, **assets}.items():
            package.writestr(name, data)
    manifest = {"version": 1, "site": base, "articles": records, "assets": {name: digest(data) for name, data in assets.items()}}
    (output / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    with (output / "articles.csv").open("w", newline="", encoding="utf-8-sig") as stream:
        writer = csv.writer(stream)
        writer.writerow(("タイトル", *FIELDS))
        for record in records:
            writer.writerow((record["title"], *record["values"].values()))
    report = {"articles": len(records), "attachments": len(assets), "warnings": warnings, "external_links_not_checked": sorted(external), "notion_import_verified": False}
    (output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    sys.stdout.write(json.dumps({"output": str(output), "articles": len(records), "attachments": len(assets), "warnings": len(warnings)}, ensure_ascii=False) + "\n")


def archive_files(path):
    with zipfile.ZipFile(path) as package:
        names = set()
        total = 0
        for item in package.infolist():
            name = item.filename
            parts = PurePosixPath(name).parts
            total += item.file_size
            if name in names or name.startswith("/") or ".." in parts or "\\" in name or re.match(r"^[A-Za-z]:", name) or ((item.external_attr >> 16) & 0o170000) == 0o120000 or total > MAX_ARCHIVE_BYTES:
                raise ValueError(f"安全に扱えないZIP: {name}")
            names.add(name)
        return {item.filename: package.read(item) for item in package.infolist() if not item.is_dir()}


def import_articles(args):
    repo = args.repo.resolve()
    output = new_output(args.output, repo)
    files = archive_files(args.zip)
    manifest = json.loads(args.manifest.read_text()) if args.manifest else {"articles": []}
    records = manifest["articles"]
    by_source = {Path(record["source"]).name: record for record in records}
    by_title = {}
    for record in records:
        by_title.setdefault(record["title"], []).append(record)
    results = {}
    warnings = []
    assets = {}
    page_targets = {}
    parsed_pages = []
    for name, content in files.items():
        if not name.lower().endswith(".md"):
            continue
        title, values, body = parse_page(content.decode("utf-8-sig"))
        record = by_source.get(values.get("Jekyll source", ""))
        if values.get("Jekyll source") and record is None:
            raise ValueError(f"台帳にないJekyll source: {name}")
        if record is None and len(by_title.get(title, [])) == 1:
            record = by_title[title][0]
        original_metadata = split_frontmatter(record["frontmatter"])[1] if record else {}
        publication_date = values.get("公開日") or str(original_metadata.get("date", "")) or args.date
        if not publication_date and record:
            publication_date = record["values"]["公開日"]
        if not publication_date or not re.match(r"^\d{4}-\d{2}-\d{2}(?:$|[ T])", publication_date):
            raise ValueError(f"公開日が必要です: {name}（metadata表か--dateで指定）")
        date.fromisoformat(publication_date[:10])
        source = Path(record["source"]).name if record else f"{publication_date[:10]}-{safe_name(NOTION_ID.sub('', Path(name).stem))}.md"
        if source in page_targets.values():
            raise ValueError(f"記事名が重複しています: {source}")
        page_targets[name] = source
        parsed_pages.append((name, title, values, body, record, original_metadata, publication_date, source))
    if not parsed_pages:
        raise ValueError("ZIPにMarkdown記事がありません")
    for name, title, values, body, record, metadata, publication_date, source in parsed_pages:
        unchanged = record and title == record["title"] and values == record["values"] and body == record["converted_body"].lstrip("\n")
        if unchanged:
            original = record["frontmatter"] + record["body"]
            if digest(original.encode()) != record["sha256"]:
                raise ValueError(f"復元台帳の整合性不一致: {name}")
            results["_posts/" + source] = original.encode()
            continue

        def link(match):
            address = html.unescape(match[2].strip("<>"))
            parsed = urlsplit(address)
            if parsed.scheme or address.startswith(("/", "#", "//")):
                return match[0]
            parts = PurePosixPath(name).parent.joinpath(unquote(parsed.path)).parts
            normalized = []
            for part in parts:
                if part == "..":
                    if not normalized:
                        raise ValueError(f"ZIP外へのリンク: {address}")
                    normalized.pop()
                elif part != ".":
                    normalized.append(part)
            target = "/".join(normalized)
            if target in page_targets:
                replacement = "{% post_url " + Path(page_targets[target]).stem + " %}"
                return match[1] + replacement + match[3]
            if target not in files:
                warnings.append({"article": name, "message": f"相対リンク解決不能（原文保持）: {address}"})
                return match[0]
            data = files[target]
            existing = target.removeprefix("attachments/")
            if manifest.get("assets", {}).get(target) == digest(data) and (repo / existing).is_file() and digest((repo / existing).read_bytes()) == digest(data):
                asset = existing
            else:
                asset = "assets/notion/" + safe_name(Path(source).stem) + "/" + digest(data)[:12] + "-" + safe_name(Path(target).name)
                assets[asset] = data
            suffix = ("?" + parsed.query if parsed.query else "") + ("#" + parsed.fragment if parsed.fragment else "")
            replacement = "{{ '/" + quote(asset) + "' | relative_url }}" + suffix
            return match[1] + replacement + match[3]

        body = outside_code(body, lambda text: MARKDOWN_LINK.sub(link, text))
        metadata["title"] = title
        metadata["date"] = publication_date
        if "カテゴリ" in values:
            categories = json.loads(values["カテゴリ"])
            if not isinstance(categories, list) or not all(isinstance(value, str) for value in categories):
                raise ValueError(f"カテゴリはJSON文字列配列で指定してください: {name}")
            metadata["categories"] = categories
        elif not record:
            metadata["categories"] = args.categories
        if values.get("パーマリンク"):
            if not values["パーマリンク"].startswith("/") or LIQUID.search(values["パーマリンク"]):
                raise ValueError(f"不正なパーマリンク: {name}")
            metadata["permalink"] = values["パーマリンク"]
        elif "パーマリンク" in values:
            metadata.pop("permalink", None)
        if not record:
            metadata.setdefault("lang", "ja")
            metadata.setdefault("classes", "wide")
        front = yaml.safe_dump(metadata, allow_unicode=True, sort_keys=False)
        results["_posts/" + source] = ("---\n" + front + "---\n\n" + body).encode()
    output.mkdir(parents=True)
    for name, data in {**results, **assets}.items():
        destination = output / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)
    report = {"articles": len(results), "new_assets": len(assets), "warnings": warnings, "review_required": True, "omitted_originals_not_deleted": sorted(set(by_source) - set(page_targets.values()))}
    (output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    sys.stdout.write(json.dumps({"output": str(output), "articles": len(results), "new_assets": len(assets), "warnings": len(warnings)}, ensure_ascii=False) + "\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    commands = parser.add_subparsers(dest="command", required=True)
    export = commands.add_parser("export", help="Notion用ZIP・CSV・復元台帳を新規出力")
    export.add_argument("--output", type=Path, required=True)
    export.set_defaults(run=export_articles)
    restore = commands.add_parser("import", help="Notion ZIPからJekyll確認用フォルダを生成")
    restore.add_argument("--zip", type=Path, required=True)
    restore.add_argument("--manifest", type=Path)
    restore.add_argument("--output", type=Path, required=True)
    restore.add_argument("--date", help="metadataがない新規記事の公開日 YYYY-MM-DD")
    restore.add_argument("--categories", nargs="*", default=["announcement"])
    restore.set_defaults(run=import_articles)
    args = parser.parse_args()
    try:
        args.run(args)
    except (ValueError, KeyError, OSError, subprocess.CalledProcessError, yaml.YAMLError, zipfile.BadZipFile) as error:
        parser.exit(1, f"変換失敗: {error}\n")


if __name__ == "__main__":
    main()
