import argparse
import json
import re
import sys
import zipfile
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


def run(url: str, output: Path) -> None:
    output.mkdir(parents=True, exist_ok=True)
    errors = []
    external = []
    failed_requests = []
    console_errors = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(
            viewport={"width": 1440, "height": 1000},
            permissions=["clipboard-read", "clipboard-write"],
        )
        page = context.new_page()
        page.set_default_timeout(10000)
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.on("requestfailed", lambda request: failed_requests.append({"url": request.url, "failure": request.failure}))
        page.on("request", lambda request: external.append(request.url) if not request.url.startswith(url) else None)
        page.goto(url)
        page.get_by_role("button", name="ダッシュボード", exact=False).click()
        expect(page.get_by_role("heading", name=re.compile("顧客の課題から、"))).to_be_visible()
        page.evaluate("navigator.serviceWorker.ready")
        page.wait_for_function("navigator.serviceWorker.controller !== null")
        page.screenshot(path=str(output / "dashboard-desktop.png"), full_page=True)
        page.set_viewport_size({"width": 390, "height": 844})
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.screenshot(path=str(output / "dashboard-mobile.png"), full_page=True)
        page.set_viewport_size({"width": 1440, "height": 1000})
        page.get_by_role("button", name="案件トレーニングを始める").click()
        expect(page.locator(".question-card")).to_have_count(8)
        page.get_by_role("searchbox").fill("サーボ")
        expect(page.locator(".question-card")).to_have_count(1)
        page.get_by_role("searchbox").fill("")
        page.get_by_label("ジャンル", exact=True).select_option("無線")
        expect(page.locator(".question-card")).to_have_count(1)
        page.get_by_label("ジャンル", exact=True).select_option("")
        page.get_by_label("案件の複雑度", exact=True).select_option("1")
        expect(page.locator(".question-card")).to_have_count(2)
        page.get_by_label("案件の複雑度", exact=True).select_option("")
        page.locator(".question-card").first.get_by_role("button", name="お気に入り").click()
        page.get_by_label("お気に入りのみ").check()
        expect(page.locator(".question-card")).to_have_count(1)
        page.get_by_label("お気に入りのみ").uncheck()
        page.locator(".question-card").first.get_by_role("button", name="Lv.5の案件を開く").click()

        answer = "制御周期50μsを目標として顧客の電圧と安全条件を確認します。入力センサからMCU処理、出力PWMへ信号を流し、TI型番のデータシート定格を照合します。既存STM32との比較はソフト移行コストを含めるため、評価基板で最悪遅延を測定します。2週のPoCで顧客担当と合格基準を決め、条件が満たせなければ現行維持を提案します。"

        def submit_answer():
            begin = page.get_by_role("button", name="要件を整理して提案に進む")
            if begin.count():
                begin.click()
            for field in page.locator("form textarea").all()[:5]:
                field.fill(answer)
            page.get_by_role("button", name="回答を保存して参考情報と比較").click()
            expect(page.get_by_role("heading", name="暫定評価", exact=False)).to_be_visible()
            expect(page.locator(".evaluation")).to_have_count(5)

        submit_answer()
        page.get_by_label("自己評価", exact=True).select_option("1")
        page.get_by_label("追加で質問したい内容").fill("現行維持の判断を検証して")
        page.get_by_role("button", name="自己評価・追加質問を保存").click()
        expect(page.get_by_role("status")).to_contain_text("保存しました")
        page.get_by_role("button", name="ChatGPT用プロンプトをコピー").click()
        expect(page.get_by_role("status")).to_contain_text("コピーしました")
        copied = page.evaluate("navigator.clipboard.readText()")
        assert "Notionへ貼れる復習ノート" in copied and "現行維持の判断を検証して" in copied
        page.get_by_role("button", name="プロンプトを表示", exact=True).click()
        expect(page.get_by_label("ChatGPT用復習プロンプト")).to_have_value(copied)
        page.screenshot(path=str(output / "result-desktop.png"), full_page=True)

        page.get_by_role("button", name="ダッシュボード", exact=False).click()
        page.get_by_role("button", name="Design Win逆算 ↗").click()
        expect(page.locator(".question-card").filter(has_not_text="Excel採用記載から提案:")).to_have_count(351)
        page.locator(".question-card").first.get_by_role("button", name="Lv.5の案件を開く").click()
        expect(page.get_by_text("顧客・搭載製品（記載確認、外部未検証）", exact=False)).to_have_count(0)
        for _ in range(3):
            page.get_by_role("button", name="次の情報を開示", exact=False).click()
        expect(page.locator(".reveal")).to_have_count(3)
        submit_answer()
        page.get_by_role("button", name="ChatGPT用プロンプトをコピー").click()
        expect(page.get_by_role("status")).to_contain_text("コピーしました")
        assert "sha256" in page.evaluate("navigator.clipboard.readText()")
        page.get_by_role("button", name="ダッシュボード", exact=False).click()
        page.get_by_role("button", name="競合対策 ↗").click()
        expect(page.locator(".question-card")).to_have_count(5)
        page.locator(".question-card").first.get_by_role("button", name="Lv.5の案件を開く").click()
        submit_answer()
        page.get_by_role("button", name="ダッシュボード", exact=False).click()
        page.get_by_role("button", name=re.compile("復習 ↗")).click()
        assert page.locator(".question-card").count() > 0

        page.get_by_role("button", name="回答履歴", exact=False).click()
        expect(page.locator(".history-row")).to_have_count(3)
        with page.expect_download() as download_info:
            page.get_by_role("button", name="履歴JSONをエクスポート").click()
        history_file = output / "history.json"
        download_info.value.save_as(str(history_file))
        history = json.loads(history_file.read_text())
        assert len(history["attempts"]) == 3 and history["attempts"][0]["selfRating"] == 1
        assert history["favorites"] == ["virtual-servo"]
        page.reload()
        page.get_by_role("button", name="回答履歴", exact=False).click()
        expect(page.locator(".history-row")).to_have_count(3)

        page.get_by_role("button", name="データ管理", exact=False).click()
        page.get_by_label("履歴JSONをインポート", exact=True).set_input_files(str(history_file))
        expect(page.get_by_role("status")).to_contain_text("履歴を統合")
        invalid_file = output / "invalid-history.json"
        invalid_file.write_text('{"schemaVersion": 2, "attempts": [], "favorites": []}')
        page.get_by_label("履歴JSONをインポート", exact=True).set_input_files(str(invalid_file))
        expect(page.get_by_role("alert")).to_contain_text("不正")
        zip_file = output / "fixture.zip"
        with zipfile.ZipFile(zip_file, "w") as archive:
            archive.writestr("case.md", "# 再取込テスト\n会社名: 架空顧客\nTI製品: MCU\n課題: センサ精度\n")
            archive.writestr("attachment.txt", "metadata only")
        page.get_by_label("ファイル／ZIPを選択").set_input_files(str(zip_file))
        expect(page.get_by_role("status")).to_contain_text("1件を取り込み")
        expect(page.get_by_text("正規化 1件", exact=True)).to_be_visible()
        page.get_by_role("button", name="回答履歴", exact=False).click()
        expect(page.locator(".history-row")).to_have_count(3)
        page.locator(".history-row").nth(1).get_by_role("button", name="回答・復習を開く").click()
        expect(page.get_by_role("heading", name="参考解答と出典")).to_be_visible()

        restored = browser.new_context()
        restore_page = restored.new_page()
        restore_page.goto(url)
        restore_page.get_by_role("button", name="データ管理", exact=False).click()
        restore_page.get_by_label("履歴JSONをインポート", exact=True).set_input_files(str(history_file))
        expect(restore_page.get_by_role("status")).to_contain_text("履歴を統合")
        restore_page.get_by_role("button", name="回答履歴", exact=False).click()
        expect(restore_page.locator(".history-row")).to_have_count(3)
        restore_page.evaluate("navigator.serviceWorker.ready")
        restore_page.wait_for_function("navigator.serviceWorker.controller !== null")
        restored.set_offline(True)
        restore_page.reload()
        restore_page.get_by_role("button", name="データ管理", exact=False).click()
        expect(restore_page.get_by_text("正規化 413件", exact=True)).to_be_visible()
        restored.close()

        offline_assets = []
        page.on("response", lambda response: offline_assets.append(response.from_service_worker) if response.url.endswith((".js", ".css")) else None)
        context.new_cdp_session(page).send("Network.clearBrowserCache")
        context.set_offline(True)
        page.reload()
        try:
            expect(page.locator("nav")).to_be_visible()
        except AssertionError:
            cache_state = page.evaluate("async () => {const names=await caches.keys();return {controller:navigator.serviceWorker.controller?.scriptURL,names,urls:await Promise.all(names.map(async name=>(await(await caches.open(name)).keys()).map(request=>request.url)))};}")
            (output / "offline-failure.json").write_text(json.dumps({"url": page.url, "errors": errors, "consoleErrors": console_errors, "failedRequests": failed_requests, "cache": cache_state, "html": page.content()}, ensure_ascii=False))
            page.screenshot(path=str(output / "offline-failure.png"), full_page=True)
            raise
        page.get_by_role("button", name="データ管理", exact=False).click()
        expect(page.get_by_text("正規化 1件", exact=True)).to_be_visible()
        page.get_by_role("button", name="ダッシュボード", exact=False).click()
        page.get_by_role("button", name="仮想顧客案件 ↗").click()
        page.locator(".question-card").first.get_by_role("button", name="Lv.5の案件を開く").click()
        submit_answer()
        page.get_by_role("button", name="回答履歴", exact=False).click()
        expect(page.locator(".history-row")).to_have_count(4)
        assert len(offline_assets) >= 2 and all(offline_assets), offline_assets
        page.set_viewport_size({"width": 390, "height": 844})
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.screenshot(path=str(output / "history-mobile-offline.png"), full_page=True)
        assert not errors, errors
        assert not external, external
        assert not console_errors, console_errors
        assert not failed_requests, failed_requests
        browser.close()
    report = {"status": "pass", "pageErrors": errors, "externalRequests": external, "flows": ["all-four-modes", "search-filters", "favorites", "staged-reveal", "answer-score", "clipboard", "self-rating", "indexeddb-reload", "history-merge-reject-restore", "notion-zip-reimport", "snapshot-preservation", "offline-reload-and-submit", "desktop-mobile-no-overflow"]}
    (output / "browser-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    sys.stdout.write(json.dumps(report, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:4178")
    parser.add_argument("--output", type=Path, default=Path("/tmp/fae-browser-smoke"))
    arguments = parser.parse_args()
    run(arguments.url.rstrip("/"), arguments.output)
