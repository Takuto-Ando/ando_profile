import argparse
import json
import sys
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import expect, sync_playwright

from browser_workflow import legacy_state


def run(url: str, output: Path):
    output.mkdir(parents=True, exist_ok=True)
    fixture = output / "fictional-case.csv"
    fixture.write_text(
        "事業名,会社名,TI製品,課題\nWeb検証用架空案件,Web検証用架空顧客,MSPM0,計測精度\n"
    )
    legacy = output / "legacy.json"
    legacy.write_text(json.dumps(legacy_state()))
    errors = []
    requests = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()
        page.set_default_timeout(20000)
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on(
            "request",
            lambda request: requests.append(
                {"url": request.url, "method": request.method}
            ),
        )
        page.goto(url)
        expect(page.get_by_role("heading", name="1分からのFAE学習")).to_be_visible()
        expect(page.locator(".sidebar-note")).to_contain_text("Web学習")
        page.evaluate("navigator.serviceWorker.ready")
        page.wait_for_function("navigator.serviceWorker.controller !== null")
        scope = page.evaluate(
            "(async () => (await navigator.serviceWorker.ready).scope)()"
        )
        assert scope == url, scope
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.screenshot(path=str(output / "web-home-mobile.png"), full_page=True)
        page.get_by_role("button", name="1分問題を始める").click()
        page.get_by_role("group", name="製品・機能の選択肢").get_by_role(
            "button", name="MSPM0", exact=True
        ).click()
        expect(
            page.get_by_text("回答・ヒント利用を保存済み", exact=False)
        ).to_be_visible()
        page.get_by_role("button", name="理解できた", exact=True).click()
        expect(
            page.get_by_role("button", name="理解できた", exact=True)
        ).to_have_attribute("aria-pressed", "true")
        page.get_by_role("button", name="データ管理", exact=False).click()
        page.get_by_label("履歴JSONをインポート", exact=True).set_input_files(
            str(legacy)
        )
        expect(page.get_by_role("status")).to_contain_text("履歴を統合")
        page.get_by_label("ファイル／ZIPを選択", exact=True).set_input_files(
            str(fixture)
        )
        expect(page.get_by_role("status")).to_contain_text("1件を取り込み")
        page.get_by_role("button", name="ダッシュボード", exact=False).click()
        page.get_by_role("button", name="Design Win逆算 ↗").click()
        expect(page.locator(".question-card")).to_have_count(1)
        page.locator(".question-card").get_by_role("button", name="案件を開く").click()
        expect(
            page.get_by_role("button", name="要件を整理して提案に進む")
        ).to_be_visible()
        page.get_by_role("button", name="回答履歴", exact=False).click()
        with page.expect_download() as downloading:
            page.get_by_role("button", name="履歴JSONをエクスポート").click()
        backup = output / "web-history.json"
        downloading.value.save_as(str(backup))
        stored = json.loads(backup.read_text())
        assert stored["attempts"] == legacy_state()["attempts"]
        assert len(stored["shortAttempts"]) == 1
        assert stored["shortAttempts"][0]["selfAssessment"] == "understood"
        second_context = browser.new_context(viewport={"width": 390, "height": 844})
        second = second_context.new_page()
        second.goto(url)
        second.get_by_role("button", name="データ管理", exact=False).click()
        second.get_by_label("履歴JSONをインポート", exact=True).set_input_files(
            str(backup)
        )
        expect(second.get_by_role("status")).to_contain_text("履歴を統合")
        second.get_by_role("button", name="回答履歴", exact=False).click()
        expect(
            second.get_by_role("heading", name="短時間学習の履歴", exact=False)
        ).to_contain_text("1件")
        second_context.close()
        cache_urls = page.evaluate("""async () => {
          const keys=await caches.keys(); const urls=[];
          for (const key of keys) if(key.startsWith('fae-simulator-')) {
            for (const request of await (await caches.open(key)).keys()) urls.push(request.url);
          }
          return urls;
        }""")
        assert cache_urls and all(entry.startswith(url) for entry in cache_urls), (
            cache_urls
        )
        assert all("notion.json" not in entry for entry in cache_urls)
        session = context.new_cdp_session(page)
        session.send("Network.clearBrowserCache")
        context.set_offline(True)
        page.goto(url + "offline-route")
        expect(page.get_by_role("heading", name="1分からのFAE学習")).to_be_visible()
        expect(page.locator(".sidebar-note")).to_contain_text("オフライン")
        page.get_by_role("button", name="1分問題を始める").click()
        page.get_by_role("group", name="製品・機能の選択肢").get_by_role(
            "button"
        ).first.click()
        expect(
            page.get_by_text("回答・ヒント利用を保存済み", exact=False)
        ).to_be_visible()
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.screenshot(path=str(output / "web-offline-mobile.png"), full_page=True)
        assert all(entry["method"] == "GET" for entry in requests), requests
        origin = urlparse(url)
        assert all(
            urlparse(entry["url"]).netloc == origin.netloc for entry in requests
        ), requests
        assert not any("data/notion.json" in entry["url"] for entry in requests), (
            requests
        )
        assert not errors, errors
        browser.close()
    report = {
        "status": "pass",
        "url": url,
        "scope": scope,
        "flows": [
            "subpath-assets",
            "public-edition",
            "mobile-lv1",
            "on-device-history",
            "on-device-fictional-notion-import",
            "lv5-hearing",
            "legacy-json-portability",
            "second-browser-import",
            "scoped-cache",
            "offline-subpath-fallback-and-save",
        ],
        "pageErrors": errors,
        "nonGetRequests": [entry for entry in requests if entry["method"] != "GET"],
        "privateDataFetches": [
            entry for entry in requests if "data/notion.json" in entry["url"]
        ],
    }
    (output / "public-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2)
    )
    sys.stdout.write(json.dumps(report, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--url", default="http://127.0.0.1:4180/ando_profile/fae-simulator/"
    )
    parser.add_argument("--output", type=Path, default=Path("/tmp/fae-public-browser"))
    args = parser.parse_args()
    run(args.url.rstrip("/") + "/", args.output)
