import argparse
import json
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


def run(url, output):
    output.mkdir(parents=True, exist_ok=True)
    root = Path(__file__).resolve().parents[1]
    questions = json.loads(subprocess.check_output([
        str(root / "node_modules/.bin/tsx"), "-e",
        "import {decisionQuestions} from './src/decision-questions.ts';process.stdout.write(JSON.stringify(decisionQuestions));",
    ], cwd=root, text=True))
    errors = []
    measurements = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for width, height in [(1366, 768), (1280, 600), (390, 844)]:
            context = browser.new_context(viewport={"width": width, "height": height})
            page = context.new_page()
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(url)
            page.get_by_role("button", name="1分問題を始める").click()
            options = page.get_by_role("group", name="技術方式の選択肢")
            next_button = page.locator(".short-actions [data-quiz-next]").first

            def current(level=1):
                title = page.locator("#short-question-title").inner_text()
                return next(question for question in questions if question["title"] == title and question["level"] == level)

            def choose(level=1, reason=False):
                question = current(level)
                task = question["reason" if reason else "selection"]
                key = next(index + 1 for index, option in enumerate(task["options"]) if option["id"] == task["correctId"])
                page.keyboard.press(str(key))

            def stored():
                return page.evaluate("""async () => {
                    const db = await new Promise(resolve => {const r=indexedDB.open('fae-design-win',1); r.onsuccess=()=>resolve(r.result);});
                    return new Promise(resolve => {const r=db.transaction('state').objectStore('state').get('learning');r.onsuccess=()=>{db.close();resolve(r.result);};});
                }""")

            before = options.bounding_box()
            page.keyboard.press("2")
            expect(next_button).to_be_enabled()
            expect(page.get_by_role("heading", name="不正解（減点なし）")).to_be_visible()
            after = options.bounding_box()
            assert abs(before["y"] - after["y"]) < 1
            assert abs(before["height"] - after["height"]) < 1
            expect(page.locator(".feedback-detail")).not_to_have_attribute("open", "")
            expect(page.get_by_text("理解できた", exact=True)).to_be_visible()
            if width >= 1000:
                expect(next_button).to_be_in_viewport(ratio=1)
            measurements.append({"width": width, "height": height, "optionsBefore": before, "optionsAfter": after, "next": next_button.bounding_box()})
            page.screenshot(path=str(output / f"feedback-{width}-{height}.png"), full_page=True)
            assert len(stored()["shortAttempts"]) == 1
            page.keyboard.press("n")
            expect(page.locator("#short-question-title")).not_to_have_text("小さなセンサノードの処理構成")
            expect(page.locator(".short-feedback")).to_have_count(0)
            for step in range(1, 4):
                page.get_by_role("button", name=f"ヒント{step}を見る", exact=True).click()
            question = current()
            hidden_key = next(index + 1 for index, option in enumerate(question["selection"]["options"]) if option["id"] not in question["hints"][2])
            page.keyboard.press(str(hidden_key))
            expect(page.locator(".short-feedback")).to_have_count(0)
            page.evaluate("""() => { const input=document.createElement('textarea'); input.id='tempo-input'; document.body.append(input); input.focus(); }""")
            page.keyboard.press("1")
            page.keyboard.press("n")
            expect(page.locator("#tempo-input")).to_have_value("1n")
            expect(page.locator(".short-feedback")).to_have_count(0)
            page.evaluate("document.querySelector('#tempo-input').remove()")
            page.evaluate("""() => {const editor=document.createElement('div');editor.id='tempo-editor';editor.contentEditable='true';document.body.append(editor);editor.focus();}""")
            page.keyboard.press("1")
            expect(page.locator("#tempo-editor")).to_have_text("1")
            expect(page.locator(".short-feedback")).to_have_count(0)
            page.evaluate("document.querySelector('#tempo-editor').remove()")
            page.evaluate("""() => { const dialog=document.createElement('dialog');dialog.id='tempo-dialog';dialog.innerHTML='<button>dialog action</button>';document.body.append(dialog);dialog.showModal(); }""")
            page.keyboard.press("1")
            expect(page.locator(".short-feedback")).to_have_count(0)
            page.evaluate("document.querySelector('#tempo-dialog').remove()")
            page.evaluate("document.dispatchEvent(new KeyboardEvent('keydown',{key:'1',repeat:true,bubbles:true}))")
            page.evaluate("document.dispatchEvent(new KeyboardEvent('keydown',{key:'1',ctrlKey:true,bubbles:true}))")
            expect(page.locator(".short-feedback")).to_have_count(0)
            choose()
            expect(next_button).to_be_enabled()
            assert stored()["shortAttempts"][-1]["hintsUsed"] == 3
            old_title = page.locator("#short-question-title").inner_text()
            page.evaluate("""() => {document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',repeat:true,bubbles:true}));}""")
            expect(page.locator("#short-question-title")).not_to_have_text(old_title)
            assert len(stored()["shortAttempts"]) == 2
            page.evaluate("document.querySelector('.short-stem').append(' 長い顧客条件の表示試験。'.repeat(180))")
            choose()
            expect(next_button).to_be_enabled()
            dock = page.get_by_role("navigation", name="短時間クイズの固定ナビ")
            expect(dock).to_be_visible()
            expect(dock.get_by_role("button")).to_be_in_viewport(ratio=1)
            assert page.locator(".short-question").evaluate("el=>parseFloat(getComputedStyle(el).paddingBottom)") >= dock.bounding_box()["height"]
            dock.get_by_role("button").click()
            expect(page.locator(".quiz-dock")).to_have_count(0)
            expect(page.locator(".short-stem")).to_be_in_viewport()
            choose()
            expect(next_button).to_be_enabled()
            page.get_by_text("詳しい解説・復習", exact=True).click()
            page.get_by_text("詳しい解説・関連製品・根拠", exact=True).click()
            expect(page.get_by_role("heading", name="各選択肢を設計判断として振り返る")).to_be_visible()
            page.get_by_role("button", name="まだ曖昧", exact=True).click()
            expect(next_button).to_be_enabled()
            assert stored()["shortAttempts"][-1]["selfAssessment"] == "unclear"
            old_title = page.locator("#short-question-title").inner_text()
            next_button.evaluate("element => {element.click(); element.click();}")
            expect(page.locator("#short-question-title")).not_to_have_text(old_title)
            expect(page.locator(".short-feedback")).to_have_count(0)
            assert len(stored()["shortAttempts"]) == 4
            page.get_by_text("レベルを変更する", exact=False).click()
            page.get_by_role("group", name="学習レベル").get_by_role("button").nth(1).click()
            page.get_by_role("button", name="Lv.2を始める").click()
            choose(2)
            choose(2, reason=True)
            expect(next_button).to_be_enabled()
            if width >= 1000 and height >= 768:
                expect(next_button).to_be_in_viewport(ratio=1)
            assert stored()["shortAttempts"][-1]["question"]["level"] == 2
            page.keyboard.press("Enter")
            expect(page.locator(".short-feedback")).to_have_count(0)
            title = page.locator("#short-question-title").inner_text()
            page.keyboard.press("n")
            expect(page.locator("#short-question-title")).to_have_text(title)
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
            page.screenshot(path=str(output / f"next-{width}-{height}.png"), full_page=True)
            context.close()
        assert not errors, errors
        browser.close()
    report = {"status": "pass", "measurements": measurements, "pageErrors": errors}
    (output / "tempo-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    sys.stdout.write(json.dumps(report, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:4180/ando_profile/fae-simulator/")
    parser.add_argument("--output", type=Path, default=Path("/tmp/fae-tempo-browser"))
    args = parser.parse_args()
    run(args.url, args.output)
