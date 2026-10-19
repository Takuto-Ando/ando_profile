import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

from browser_workflow import legacy_state


def run(url: str, output: Path):
    output.mkdir(parents=True, exist_ok=True)
    root = Path(__file__).resolve().parents[1]
    fixtures = json.loads(
        subprocess.check_output(
            [
                str(root / "node_modules/.bin/tsx"),
                "-e",
                "import {shortQuestions} from './src/short-questions.ts';import {icShortQuestions,validateIcLibrary} from './src/ic-reference.ts';import {existsSync,readFileSync} from 'node:fs';const path='public/data/ic-reference.json';const extra=existsSync(path)?icShortQuestions(validateIcLibrary(JSON.parse(readFileSync(path,'utf8')))):[];process.stdout.write(JSON.stringify([...shortQuestions,...extra]));",
            ],
            cwd=root,
            text=True,
        )
    )
    errors = []
    external = []
    original = legacy_state()
    original_file = output / "legacy.json"
    original_file.write_text(json.dumps(original))
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(
            viewport={"width": 1440, "height": 1000},
            permissions=["clipboard-read", "clipboard-write"],
        )
        page = context.new_page()
        page.set_default_timeout(15000)
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on(
            "request",
            lambda request: external.append(request.url)
            if not request.url.startswith(url)
            else None,
        )
        page.goto(url)
        expect(page.get_by_role("heading", name="1分からのFAE学習")).to_be_visible()
        expect(page.get_by_role("button", name="1分問題を始める")).to_be_visible()
        page.evaluate("navigator.serviceWorker.ready")
        page.wait_for_function("navigator.serviceWorker.controller !== null")

        def state():
            return page.evaluate("""async () => {
              const db = await new Promise((resolve, reject) => {const req=indexedDB.open('fae-design-win',1);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
              return new Promise((resolve, reject) => {const tx=db.transaction('state','readonly');const req=tx.objectStore('state').get('learning');tx.oncomplete=()=>{db.close();resolve(req.result);};tx.onerror=()=>reject(tx.error);});
            }""")

        def nav(label):
            page.get_by_role("navigation", name="メインナビゲーション").get_by_role(
                "button", name=label, exact=False
            ).click()

        def level(value):
            if not page.get_by_role("group", name="学習レベル").is_visible():
                page.get_by_text("レベルを変更する", exact=False).click()
            page.get_by_role("group", name="学習レベル").get_by_role("button").nth(
                value - 1
            ).click()

        def active_question(value):
            title = page.locator("#short-question-title").inner_text()
            return next(
                question
                for question in fixtures
                if question["title"] == title and question["level"] == value
            )

        def choose(value, wrong=False):
            question = active_question(value)
            options = question["selection"]["options"]
            option = next(
                option
                for option in options
                if (option["id"] != question["selection"]["correctId"]) == wrong
            )
            page.get_by_role("group", name="製品・機能の選択肢").get_by_role(
                "button", name=option["text"], exact=True
            ).click()
            return question

        def saved():
            expect(
                page.get_by_text("回答・ヒント利用を保存済み", exact=False)
            ).to_be_visible()

        page.screenshot(path=str(output / "levels-home-desktop.png"), full_page=True)
        page.set_viewport_size({"width": 390, "height": 844})
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        expect(page.get_by_role("button", name="1分問題を始める")).to_be_in_viewport()
        page.screenshot(path=str(output / "levels-home-mobile.png"), full_page=True)
        page.set_viewport_size({"width": 1440, "height": 1000})
        nav("データ管理")
        page.get_by_label("履歴JSONをインポート", exact=True).set_input_files(
            str(original_file)
        )
        expect(page.get_by_role("status")).to_contain_text("履歴を統合")
        nav("1分からの学習")
        page.get_by_role("button", name="1分問題を始める").click()
        expect(page.locator(".short-question")).to_have_count(1)
        expect(page.locator("textarea")).to_have_count(0)
        expect(
            page.get_by_role("button", name="要件を整理して提案に進む")
        ).to_have_count(0)
        options = page.get_by_role("group", name="製品・機能の選択肢").get_by_role(
            "button"
        )
        expect(options).to_have_count(4)
        for step in range(1, 4):
            page.get_by_role("button", name=f"ヒント{step}を見る").click()
        expect(options).to_have_count(2)
        page.evaluate("""() => {
          const original = IDBObjectStore.prototype.put;
          IDBObjectStore.prototype.put = function(value, key) {
            if (key === 'learning' && value.shortAttempts?.length) {
              IDBObjectStore.prototype.put = original;
              throw new DOMException('Test storage failure', 'QuotaExceededError');
            }
            return original.call(this, value, key);
          };
        }""")
        first = choose(1, wrong=True)
        expect(page.get_by_role("alert")).to_contain_text("保存できませんでした")
        expect(
            page.get_by_text("製品・機能の選択：不正解（減点なし）", exact=True)
        ).to_be_visible()
        expect(page.get_by_role("button", name="次の1問へ")).to_be_disabled()
        page.get_by_role("button", name="保存を再試行").click()
        saved()
        expect(
            page.get_by_text("製品・機能の選択：不正解（減点なし）", exact=True)
        ).to_be_visible()
        expect(page.get_by_role("heading", name="10秒で読む基本解説")).to_be_visible()
        assert len(state()["shortAttempts"]) == 1
        assert state()["shortAttempts"][0]["hintsUsed"] == 3
        page.get_by_role("button", name="まだ曖昧", exact=True).click()
        expect(
            page.get_by_role("button", name="まだ曖昧", exact=True)
        ).to_have_attribute("aria-pressed", "true")
        saved()
        page.screenshot(path=str(output / "lv1-feedback-desktop.png"), full_page=True)
        page.set_viewport_size({"width": 390, "height": 844})
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.screenshot(path=str(output / "lv1-feedback-mobile.png"), full_page=True)
        page.set_viewport_size({"width": 1440, "height": 1000})
        page.get_by_role("button", name="次の1問へ").click()
        assert active_question(1)["id"] != first["id"]
        choose(1)
        saved()
        page.get_by_role("button", name="理解できた", exact=True).click()
        saved()
        page.get_by_role("button", name="1問で終了する").click()
        expect(
            page.get_by_role("group", name="学習レベル").get_by_role("button").first
        ).to_have_attribute("aria-pressed", "true")
        page.get_by_label("連続演習").select_option("3")
        page.get_by_role("button", name="1分問題を始める").click()
        session = []
        for index in range(3):
            session.append(choose(1)["id"])
            saved()
            page.get_by_role(
                "button",
                name="次の問題へ" if index < 2 else "この演習を終了",
                exact=True,
            ).click()
        assert len(set(session)) == 3
        expect(
            page.get_by_role("heading", name="ここまでで終了しても大丈夫。")
        ).to_be_visible()

        level(2)
        page.get_by_label("連続演習").select_option("1")
        page.get_by_role("button", name="Lv.2を始める").click()
        question = choose(2)
        expect(page.locator("textarea")).to_have_count(0)
        reason = next(
            option
            for option in question["reason"]["options"]
            if option["id"] != question["reason"]["correctId"]
        )
        page.get_by_role("region", name="選定理由").get_by_role(
            "button", name=reason["text"], exact=True
        ).click()
        saved()
        assert state()["shortAttempts"][-1]["result"] == {
            "selectionCorrect": True,
            "reasonCorrect": False,
        }
        level(3)
        page.get_by_role("button", name="Lv.3を始める").click()
        choose(3)
        page.get_by_label("短い提案", exact=True).fill(
            "MCUを候補に、ADCから処理へつなぎます。入力電圧と精度を顧客へ確認します。"
        )
        page.get_by_text("Notionの実例を使って提案する（任意）", exact=True).click()
        option_value = (
            page.get_by_label("関連する実例")
            .locator("option")
            .nth(1)
            .get_attribute("value")
        )
        page.get_by_label("関連する実例").select_option(option_value)
        page.get_by_role("button", name="短い提案を保存して振り返る").click()
        saved()
        expect(
            page.get_by_text(
                "自由文の技術正誤・個別型番の適合は評価不能。", exact=False
            )
        ).to_be_visible()
        page.get_by_text("ChatGPTで提案を振り返る", exact=True).click()
        page.get_by_role("button", name="ChatGPT用プロンプトをコピー").click()
        copied = page.evaluate("navigator.clipboard.readText()")
        assert "Notion" in copied and "notionContext" in copied and "評価不能" in copied
        page.get_by_text("同じテーマを本格演習へつなぐ（任意）", exact=True).click()
        page.get_by_role("button", name="Lv.4の関連案件を選ぶ").click()
        page.get_by_role("button", name="Lv.4の案件を開く").first.click()
        expect(
            page.get_by_role("button", name="要件を整理して提案に進む")
        ).to_have_count(0)
        for field in page.locator("form textarea").all()[:5]:
            field.fill(
                "入力センサから処理、出力へ構成を整理します。要求と根拠が不足しているため顧客に確認し、既存製品との移行コストを比較して評価条件を決めます。"
            )
        page.get_by_role("button", name="回答を保存して参考情報と比較").click()
        expect(
            page.get_by_role("heading", name="暫定評価", exact=False)
        ).to_be_visible()
        data = state()
        assert data["attempts"][0] == original["attempts"][0]
        assert data["attempts"][-1]["learningLevel"] == 4
        assert "workflow" not in data["attempts"][-1]
        assert data["shortAttempts"][-1]["question"]["notionContext"]["record"]
        nav("1分からの学習")
        level(5)
        page.get_by_role("button", name="Lv.5の案件を開く").first.click()
        expect(
            page.get_by_role("button", name="要件を整理して提案に進む")
        ).to_be_visible()

        nav("回答履歴")
        expect(
            page.get_by_role("heading", name=re.compile("短時間学習の履歴"))
        ).to_contain_text("7件")
        with page.expect_download() as download:
            page.get_by_role("button", name="履歴JSONをエクスポート").click()
        backup = output / "mixed-history.json"
        download.value.save_as(str(backup))
        exported = json.loads(backup.read_text())
        assert len(exported["shortAttempts"]) == 7 and len(exported["attempts"]) == 2
        second_context = browser.new_context()
        second = second_context.new_page()
        second.goto(url)
        second.get_by_role("button", name="データ管理", exact=False).click()
        second.get_by_label("履歴JSONをインポート", exact=True).set_input_files(
            str(backup)
        )
        expect(second.get_by_role("status")).to_contain_text("履歴を統合")
        second.get_by_role("button", name="回答履歴", exact=False).click()
        expect(
            second.get_by_role("heading", name=re.compile("短時間学習の履歴"))
        ).to_contain_text("7件")
        second_context.close()

        context.set_offline(True)
        page.reload()
        expect(page.get_by_role("heading", name="1分からのFAE学習")).to_be_visible()
        page.get_by_label("間違い・曖昧・苦手カテゴリを復習").check()
        page.get_by_role("button", name="1分問題を始める").click()
        assert active_question(1)["conceptId"] == first["conceptId"]
        choose(1)
        saved()
        assert len(state()["shortAttempts"]) == 8
        page.set_viewport_size({"width": 390, "height": 844})
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        assert not errors, errors
        assert not external, external
        browser.close()
    report = {
        "status": "pass",
        "shortAttempts": 8,
        "legacyPreserved": True,
        "levels": [1, 2, 3, 4, 5],
        "flows": [
            "default-lv1",
            "four-choices",
            "three-hints",
            "immediate-feedback",
            "save-failure-retry-no-duplicate",
            "self-assessment",
            "next-single",
            "one-question-exit",
            "three-question-session",
            "no-auto-level-up",
            "lv2-reason",
            "lv3-proposal-notion-prompt",
            "lv4-no-hearing",
            "lv5-hearing-preserved",
            "mixed-history-export-import",
            "targeted-review",
            "offline-save",
            "mobile-no-overflow",
        ],
        "pageErrors": errors,
        "externalRequests": external,
    }
    (output / "levels-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2)
    )
    sys.stdout.write(json.dumps(report, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:4178")
    parser.add_argument("--output", type=Path, default=Path("/tmp/fae-browser-levels"))
    arguments = parser.parse_args()
    run(arguments.url.rstrip("/"), arguments.output)
