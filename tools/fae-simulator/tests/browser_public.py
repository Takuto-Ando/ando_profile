import argparse
import json
import re
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
        page.get_by_role("button", name="採用ICライブラリ", exact=False).click()
        expect(
            page.get_by_text("教材は読み込み済みです。", exact=False)
        ).to_be_visible()
        expect(
            page.get_by_label("学習するIC", exact=True).locator("option")
        ).to_have_count(165)
        page.get_by_label("学習するIC", exact=True).select_option("AM2434")
        expect(
            page.get_by_role("button", name="Lv.1 技術判断4択を始める", exact=True)
        ).to_be_visible()
        page.get_by_role("button", name="統合演習", exact=False).click()
        page.evaluate("navigator.serviceWorker.ready")
        page.wait_for_function("navigator.serviceWorker.controller !== null")
        scope = page.evaluate(
            "(async () => (await navigator.serviceWorker.ready).scope)()"
        )
        assert scope == url, scope
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        expect(page.get_by_role("button", name="1分問題を始める")).to_be_in_viewport(
            ratio=1
        )
        summary = page.locator(".learning-progress summary")
        expect(summary).to_contain_text("全体の進捗：0 /")
        total = int(re.search(r"/\s*(\d+)問", summary.inner_text()).group(1))
        assert total > 0
        summary.click()
        expect(
            page.get_by_role("progressbar", name="全問題の回答進捗")
        ).to_have_attribute("value", "0")
        summary.click()
        page.screenshot(path=str(output / "web-home-mobile.png"), full_page=True)
        page.get_by_role("button", name="1分問題を始める").click()
        expect(page.locator("[data-answer-state]")).to_have_count(0)
        page.get_by_role("group", name="技術方式の選択肢").get_by_role(
            "button", name="画面がなくてもLinux用プロセッサと外部DDRを必須にする", exact=True
        ).click()
        expect(
            page.get_by_text("回答・ヒント利用を保存済み", exact=False)
        ).to_be_visible()
        correct = page.locator('[data-answer-state="correct"]')
        incorrect = page.locator('[data-answer-state="incorrect"]')
        expect(correct).to_have_text("✓ 正解 · 必要なADC・タイマ・通信を持つMCUを中心に構成する")
        expect(incorrect).to_have_text("✕ 不正解 · 画面がなくてもLinux用プロセッサと外部DDRを必須にする")
        expect(correct).to_have_css("background-color", "rgb(232, 246, 237)")
        expect(incorrect).to_have_css("background-color", "rgb(255, 240, 241)")
        expect(page.locator(".short-feedback")).to_contain_text(
            f"全体の進捗：1 / {total}問回答済み"
        )
        correct_context = browser.new_context()
        correct_page = correct_context.new_page()
        correct_page.goto(url)
        correct_page.get_by_role("button", name="1分問題を始める").click()
        correct_page.get_by_role("button", name="必要なADC・タイマ・通信を持つMCUを中心に構成する", exact=True).click()
        expect(correct_page.locator('[data-answer-state="correct"]')).to_have_text(
            "✓ 正解 · 必要なADC・タイマ・通信を持つMCUを中心に構成する"
        )
        expect(correct_page.locator('[data-answer-state="incorrect"]')).to_have_count(0)
        correct_context.close()
        page.get_by_role("button", name="理解できた", exact=True).click()
        expect(
            page.get_by_role("button", name="理解できた", exact=True)
        ).to_have_attribute("aria-pressed", "true")
        expect(
            page.get_by_role("button", name="理解できた", exact=True)
        ).to_be_enabled()
        page.reload()
        expect(page.locator(".learning-progress summary")).to_contain_text(
            f"全体の進捗：1 / {total}問回答済み"
        )
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
        expect(page.locator(".question-card")).to_have_count(28)
        expect(
            page.locator(".question-card").filter(has_not_text="Excel採用記載から提案:")
        ).to_have_count(1)
        page.locator(".question-card").filter(
            has_not_text="Excel採用記載から提案:"
        ).get_by_role("button", name="Lv.5の案件を開く").click()
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
        assert all(
            "notion.json" not in entry and "ic-reference.json" not in entry
            for entry in cache_urls
        )
        session = context.new_cdp_session(page)
        session.send("Network.clearBrowserCache")
        context.set_offline(True)
        page.goto(url + "offline-route")
        expect(page.get_by_role("heading", name="1分からのFAE学習")).to_be_visible()
        expect(page.locator(".sidebar-note")).to_contain_text("オフライン")
        page.get_by_role("button", name="1分問題を始める").click()
        page.get_by_role("group", name="技術方式の選択肢").get_by_role(
            "button"
        ).first.click()
        expect(
            page.get_by_text("回答・ヒント利用を保存済み", exact=False)
        ).to_be_visible()
        expect(page.locator('[data-answer-state="correct"]')).to_have_count(1)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.screenshot(path=str(output / "web-offline-mobile.png"), full_page=True)
        page.get_by_role("button", name="採用ICライブラリ", exact=False).click()
        expect(
            page.get_by_label("学習するIC", exact=True).locator("option")
        ).to_have_count(165)
        assert all(entry["method"] == "GET" for entry in requests), requests
        origin = urlparse(url)
        assert all(
            urlparse(entry["url"]).netloc == origin.netloc for entry in requests
        ), requests
        assert not any(
            any(
                path in entry["url"]
                for path in ["data/notion.json", "data/ic-reference.json"]
            )
            for entry in requests
        ), requests
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
            entry
            for entry in requests
            if any(
                path in entry["url"]
                for path in ["data/notion.json", "data/ic-reference.json"]
            )
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
