import argparse
import json
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import expect, sync_playwright
from browser_state import read_state, seed_state
from browser_workflow import legacy_state


def run(url, output):
    output.mkdir(parents=True, exist_ok=True)
    root = Path(__file__).resolve().parents[1]
    fixtures = json.loads(subprocess.check_output([str(root / "node_modules/.bin/tsx"), "-e", "import {bundledIcLibrary as ic} from './src/bundled-ic.ts';import {shortQuestions} from './src/short-questions.ts';import {gradeShort} from './src/short-learning.ts'; const question=shortQuestions[0];const answers={selection:question.selection.correctId,reason:null,proposal:''};process.stdout.write(JSON.stringify({ic,oldShort:{id:'legacy-short',question,answers,result:gradeShort(question,answers),hintsUsed:0,selfAssessment:'unclear',createdAt:'2026-10-18T00:00:00Z'}}));"], cwd=root, text=True))
    errors = []
    requests = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(viewport={"width": 1366, "height": 768})
        page = context.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("request", lambda request: requests.append({"url": request.url, "method": request.method}))
        page.goto(url)
        expect(page.get_by_role("button", name="案件トレーニング", exact=False)).to_be_visible()
        expect(page.get_by_role("navigation", name="メインナビゲーション").get_by_role("button")).to_have_count(3)
        expect(page.get_by_role("button", name="データ管理", exact=False)).to_have_count(0)
        expect(page.get_by_role("button", name="採用ICライブラリ", exact=False)).to_have_count(0)
        expect(page.locator('input[type="file"]')).to_have_count(0)
        expect(page.get_by_label("出題範囲").locator("option")).to_have_count(18)
        page.get_by_role("button", name="IC選定演習を始める", exact=True).click()
        expect(page.locator(".short-options")).to_contain_text("AM2434")
        page.get_by_role("button", name="ジャンル・問題を選び直す", exact=True).click()
        page.get_by_label("問題を選ぶ").select_option("ic-selection-rail-lv1")
        page.get_by_role("button", name="1分問題を始める", exact=True).click()
        expect(page.locator(".ic-option-spec")).to_have_count(4)
        expect(page.locator(".short-stem")).to_contain_text("3.3〜5.0V")
        expect(page.locator(".short-options")).to_contain_text("2.5〜5.5V")
        before = page.locator(".short-options").first.bounding_box()
        page.keyboard.press("4")
        next_button = page.locator(".short-actions [data-quiz-next]").first
        expect(next_button).to_be_enabled()
        expect(page.get_by_role("heading", name="正解！")).to_be_visible()
        after = page.locator(".short-options").first.bounding_box()
        assert before == after
        expect(next_button).to_be_in_viewport(ratio=1)
        assert read_state(page)["shortAttempts"][-1]["question"]["kind"] == "ic-selection"
        page.get_by_text("詳しい解説・復習", exact=True).click()
        expect(page.get_by_role("region", name="IC候補の根拠と適合性")).to_contain_text("成立未検証")
        page.screenshot(path=str(output / "ic-selection-desktop.png"), full_page=True)

        def settings():
            page.get_by_role("button", name="ジャンル・問題を選び直す", exact=True).click()

        def level(value):
            switch = page.locator(".level-switch summary")
            if switch.count() and not page.get_by_role("group", name="学習レベル").is_visible():
                switch.click()
            page.get_by_role("group", name="学習レベル").get_by_role("button").nth(value - 1).click()

        settings()
        page.get_by_label("問題を選ぶ").select_option("ic-selection-24v-lv1")
        page.get_by_role("button", name="1分問題を始める", exact=True).click()
        page.keyboard.press("1")
        expect(next_button).to_be_enabled()
        assert read_state(page)["shortAttempts"][-1]["result"]["selectionCorrect"] is False
        page.get_by_text("詳しい解説・復習", exact=True).click()
        expect(page.locator(".short-feedback")).to_contain_text("24V直結の降圧候補はありません")
        settings()
        page.get_by_label("回答形式").select_option("")
        page.get_by_label("出題範囲").select_option("digital")
        expect(page.get_by_label("問題を選ぶ").locator("option")).to_have_count(34)
        page.get_by_role("button", name="1分問題を始める", exact=True).click()
        expect(page.locator(".short-stem")).to_contain_text("設計レビュー")
        page.keyboard.press("1")
        expect(next_button).to_be_enabled()
        assert read_state(page)["shortAttempts"][-1]["question"]["id"].startswith("curriculum-")
        settings()
        page.get_by_label("出題範囲").select_option("block")
        page.get_by_label("回答形式").select_option("block-diagram")
        page.get_by_role("button", name="1分問題を始める", exact=True).click()
        expect(page.get_by_label("比較するシステムブロック")).to_be_visible()
        settings()
        page.get_by_label("回答形式").select_option("")
        page.get_by_label("出題範囲").select_option("notion")
        level(5)
        expect(page.locator(".question-card")).to_have_count(83)
        page.locator(".question-card").first.get_by_role("button", name="Lv.5の案件を開く").click()
        expect(page.get_by_label("顧客への質問", exact=True)).to_be_visible()
        expect(page.locator('input[type="file"]')).to_have_count(0)
        level(4)
        page.get_by_label("出題範囲").select_option("ic")
        expect(page.locator(".question-card")).to_have_count(27)
        page.locator(".question-card").first.get_by_role("button", name="Lv.4の案件を開く").click()
        page.get_by_text("採用記載ICから提案候補を選ぶ", exact=True).click()
        expect(page.get_by_label("候補IC", exact=True).locator("option")).to_have_count(165)
        page.get_by_label("候補IC", exact=True).select_option("TLV62090")
        page.get_by_role("button", name="候補を提案に追加", exact=True).click()
        assert "TLV62090" in page.locator("form textarea").nth(2).input_value()

        old = legacy_state()
        old["shortAttempts"] = [fixtures["oldShort"]]
        custom = fixtures["ic"]
        custom["source"]["path"] = "saved-custom.xlsx"
        seed_state(page, {"learning": old, "ic-reference": custom})
        page.get_by_role("button", name="回答履歴", exact=False).click()
        expect(page.get_by_role("heading", name="短時間学習の履歴", exact=False)).to_contain_text("1件")
        page.get_by_role("button", name="この問題を復習", exact=True).click()
        expect(page.locator(".short-stem")).not_to_contain_text("汎用MCUのシリーズは")
        assert read_state(page)["attempts"] == old["attempts"]
        assert read_state(page)["shortAttempts"][0] == fixtures["oldShort"]
        assert read_state(page, "ic-reference")["source"]["path"] == "saved-custom.xlsx"
        page.evaluate("navigator.serviceWorker.ready")
        page.wait_for_function("navigator.serviceWorker.controller !== null")
        context.set_offline(True)
        page.reload()
        page.get_by_role("button", name="IC選定演習を始める", exact=True).click()
        page.keyboard.press("1")
        expect(next_button).to_be_enabled()
        assert len(read_state(page)["shortAttempts"]) == 2
        page.set_viewport_size({"width": 390, "height": 844})
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        expect(page.locator('input[type="file"]')).to_have_count(0)
        page.screenshot(path=str(output / "ic-selection-mobile-offline.png"), full_page=True)
        assert not errors, errors
        assert all(request["method"] == "GET" for request in requests)
        browser.close()
    report = {"status": "pass", "flows": ["no-management-or-library-menu", "no-file-input", "bundled-ic-specs", "fatal-24v-rejection", "source-filter", "block-diagram", "bundled-notion-83", "advanced-candidates-164", "legacy-history-preserved", "custom-ic-preserved", "offline", "keyboard", "desktop-mobile"], "pageErrors": errors}
    (output / "catalogue-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    sys.stdout.write(json.dumps(report, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:4180/ando_profile/fae-simulator/")
    parser.add_argument("--output", type=Path, default=Path("/tmp/fae-catalogue-browser"))
    args = parser.parse_args()
    run(args.url, args.output)
