#!/usr/bin/env python3
"""Import one Notion Markdown export into Jekyll without network access."""

import argparse
import datetime
import json
import re
import sys
import unicodedata
import zipfile
from pathlib import Path, PurePosixPath
from urllib.parse import quote, unquote, urlsplit


MAX_FILE_BYTES = 30 * 1024 * 1024
MAX_TOTAL_BYTES = 100 * 1024 * 1024
IMAGE_LINK = re.compile(r"(!\[[^\]\n]*\]\()(<[^>\n]+>|(?:[^()\n]|\([^()\n]*\))+)(\))")
REFERENCE = re.compile(r"^(\s{0,3}\[[^\]\n]+\]:\s*)(.+)$", re.MULTILINE)


def slugify(title):
    title = re.sub(r"\s+[a-fA-F0-9]{32}$", "", title)
    normalized = unicodedata.normalize("NFKC", title).lower()
    return re.sub(r"[^\w-]+", "-", normalized).strip("-_") or "notion-post"


def safe_member(name):
    path = PurePosixPath(name)
    if path.is_absolute() or ".." in path.parts or "\\" in name:
        raise ValueError(f"ZIP内の不正なパス: {name}")
    return path


def import_post(arguments):
    site = Path(__file__).resolve().parent.parent
    date = datetime.date.fromisoformat(arguments.date)
    with zipfile.ZipFile(arguments.export) as archive:
        members = {}
        for info in archive.infolist():
            safe_member(info.filename)
            if info.is_dir():
                continue
            if info.filename in members:
                raise ValueError(f"ZIP内の重複パス: {info.filename}")
            if info.file_size > MAX_FILE_BYTES:
                raise ValueError(f"ファイルが30MiBを超えています: {info.filename}")
            if (info.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError(f"ZIP内のsymlinkは取り込めません: {info.filename}")
            members[info.filename] = info
        if sum(info.file_size for info in members.values()) > MAX_TOTAL_BYTES:
            raise ValueError("ZIP展開サイズが100MiBを超えています")
        pages = sorted(name for name in members if name.lower().endswith(".md"))
        if arguments.page:
            page = arguments.page
            if page not in pages:
                raise ValueError("--pageにはZIP内のMarkdownパスを指定してください")
        elif len(pages) == 1:
            page = pages[0]
        else:
            raise ValueError(
                "Markdownが1件ではありません。--pageで選択してください:\n"
                + "\n".join(pages)
            )
        body = archive.read(members[page]).decode("utf-8-sig")
        if body.startswith("---\n") or body.startswith("---\r\n"):
            raise ValueError("既存Front MatterがあるMarkdownは取り込めません")
        heading = re.match(r"\s*# ([^\n]+)\r?\n", body)
        title = arguments.title or (
            heading.group(1).strip()
            if heading
            else re.sub(r"\s+[a-fA-F0-9]{32}$", "", PurePosixPath(page).stem)
        )
        if heading:
            body = body[heading.end() :].lstrip("\r\n")
        slug = arguments.slug or slugify(title)
        if not re.fullmatch(r"[\w-]+", slug) or slug in {".", ".."}:
            raise ValueError(
                "slugには文字・数字・underscore・hyphenだけを使ってください"
            )
        post_name = f"{date.isoformat()}-{slug}"
        post = site / "_posts" / f"{post_name}.md"
        asset_directory = site / "assets" / "images" / "posts" / post_name
        assets = {}
        filenames = {}

        def rewrite_target(target):
            target = target.strip()
            if target.startswith("<"):
                closing = target.find(">")
                address, suffix = target[1:closing], target[closing + 1 :]
            else:
                match = re.match(r'^(.*?)((?:\s+["\'].*["\'])?)$', target)
                address, suffix = match.groups()
            if address.startswith(("/", "#", "{{")) or urlsplit(address).scheme:
                return target
            source = str(PurePosixPath(page).parent / unquote(address))
            safe_member(source)
            if source not in members:
                raise ValueError(f"添付ファイルがZIP内にありません: {source}")
            if source.lower().endswith(".md"):
                raise ValueError(
                    f"別ページへの参照は記事化後に確認してください: {source}"
                )
            if source not in assets:
                original = PurePosixPath(source).name
                filename = original
                counter = 2
                while filename.casefold() in filenames:
                    filename = f"{PurePosixPath(original).stem}-{counter}{PurePosixPath(original).suffix}"
                    counter += 1
                filenames[filename.casefold()] = source
                assets[source] = (filename, archive.read(members[source]))
            filename = assets[source][0]
            path = f"/assets/images/posts/{post_name}/{filename}"
            url = (
                "{{ "
                + json.dumps(quote(path, safe="/"), ensure_ascii=False)
                + " | relative_url }}"
            )
            return url + suffix

        def replace_image(match):
            return match.group(1) + rewrite_target(match.group(2)) + match.group(3)

        rewritten = []
        fence = None
        for line in body.splitlines(keepends=True):
            marker = re.match(r"^\s{0,3}(`{3,}|~{3,})", line)
            if marker:
                token = marker.group(1)
                if fence is None:
                    fence = token
                elif token[0] == fence[0] and len(token) >= len(fence):
                    fence = None
                rewritten.append(line)
            elif fence is not None:
                rewritten.append(line)
            else:
                if REFERENCE.match(line) and rewritten and rewritten[-1].strip():
                    rewritten.append("\n")
                line = IMAGE_LINK.sub(replace_image, line)
                line = REFERENCE.sub(
                    lambda match: match.group(1) + rewrite_target(match.group(2)), line
                )
                rewritten.append(line)
        categories = arguments.category or ["engineering"]
        front_matter = [
            "---",
            "title: " + json.dumps(title, ensure_ascii=False),
            f"date: {date.isoformat()} 09:00:00 +09:00",
            "categories:",
        ]
        front_matter.extend(
            "  - " + json.dumps(category, ensure_ascii=False) for category in categories
        )
        front_matter.extend(
            [
                "classes: wide",
                "lang: ja",
                "published: " + ("true" if arguments.publish else "false"),
                "---",
                "",
            ]
        )
        content = "\n".join(front_matter) + "\n" + "".join(rewritten)
        if post.exists() or asset_directory.exists():
            raise ValueError(f"既存記事・画像を上書きしません: {post_name}")
        sys.stdout.write(f"記事: {post.relative_to(site)}\n")
        sys.stdout.write(
            f"添付: {len(assets)}件 / {'公開対象' if arguments.publish else 'ローカル下書き'}\n"
        )
        if arguments.dry_run:
            sys.stdout.write(content + "\n")
            return
        if assets:
            asset_directory.mkdir(parents=True, exist_ok=False)
            for filename, payload in assets.values():
                with (asset_directory / filename).open("xb") as stream:
                    stream.write(payload)
        with post.open("x", encoding="utf-8") as stream:
            stream.write(content)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("export", type=Path, help="Notion Markdown & CSV export ZIP")
    parser.add_argument("--page", help="複数ページZIPの場合のMarkdownパス")
    parser.add_argument("--title")
    parser.add_argument("--slug", help="記事ファイル名と画像フォルダ名")
    parser.add_argument("--date", default=datetime.date.today().isoformat())
    parser.add_argument(
        "--category", action="append", help="複数回指定可能。既定engineering"
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="書き込まず変換結果を表示"
    )
    parser.add_argument(
        "--publish",
        action="store_true",
        help="通常buildにも記事を含める。pushは実行しない",
    )
    arguments = parser.parse_args()
    try:
        import_post(arguments)
    except (ValueError, OSError, zipfile.BadZipFile, UnicodeError) as error:
        parser.exit(1, f"error: {error}\n")


if __name__ == "__main__":
    main()
