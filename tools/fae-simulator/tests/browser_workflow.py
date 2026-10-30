import argparse
import json
import sys
from pathlib import Path

from playwright.sync_api import expect, sync_playwright
from browser_state import read_state, seed_state


def legacy_state():
    weights = {"requirements": 20, "architecture": 25, "selection": 20, "competition": 20, "proposal": 15}
    question = {"id": "legacy-question", "mode": "virtual", "title": "旧形式の架空案件fixture", "category": ["MCU"], "difficulty": 1, "brief": "互換検証用の架空案件。採用実績ではない。", "stages": [], "reference": "旧参考解答", "urls": [], "rubric": {key: {"topics": [["確認"]], "expected": "旧論点"} for key in weights}}
    attempt = {"id": "legacy-attempt", "question": question, "answers": {key: "旧回答" for key in weights}, "evaluations": [{"dimension": key, "max": maximum, "points": 10 if key == "requirements" else 0, "matched": [], "missing": [], "explanation": "旧評価を保持", "technicalValidity": "評価不能"} for key, maximum in weights.items()], "createdAt": "2026-10-18T00:00:00Z", "selfRating": 2, "followup": "旧追加質問", "revealedStage": 0}
    return {"schemaVersion": 1, "attempts": [attempt], "favorites": [question["id"]]}


def run(url: str, output: Path):
    output.mkdir(parents=True, exist_ok=True)
    errors = []
    external = []
    baseline = legacy_state()
    legacy_file = output / "legacy-history.json"
    legacy_file.write_text(json.dumps(baseline, ensure_ascii=False))
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, permissions=["clipboard-read", "clipboard-write"])
        page = context.new_page()
        page.set_default_timeout(10000)
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("request", lambda request: external.append(request.url) if not request.url.startswith(url) else None)
        page.goto(url)
        seed_state(page, {"learning": baseline})
        page.get_by_role("button", name="回答履歴", exact=False).click()
        page.get_by_role("button", name="回答・復習を開く").click()
        expect(page.get_by_text("旧形式の回答です。", exact=False)).to_be_visible()
        expect(page.get_by_role("heading", name="暫定評価", exact=False)).to_contain_text("10 / 100")

        def start_servo():
            page.get_by_role("button", name="ダッシュボード", exact=False).click()
            page.get_by_role("button", name="仮想顧客案件 ↗").click()
            page.locator(".question-card").first.get_by_role("button", name="Lv.5の案件を開く").click()

        def ask(text):
            page.get_by_label("顧客への質問", exact=True).fill(text)
            page.get_by_role("button", name="顧客へ質問する", exact=True).click()

        def submit():
            answer = "顧客の制御周期と電圧を確認し、センサ入力からMCU処理、PWM出力までの構成を検証します。TI候補はデータシートの定格と照合し、既存STM32との比較は移行コストとソフトのリスクを含めるため、同条件の評価とPoCを実施します。2週で担当者と合格基準を合意します。"
            for field in page.locator("form textarea").all()[:5]:
                field.fill(answer)
            page.get_by_role("button", name="回答を保存して参考情報と比較").click()
            expect(page.get_by_role("heading", name="5. 構造化条件の成立性検証")).to_be_visible()

        def export_history(name):
            page.get_by_role("button", name="回答履歴", exact=False).click()
            result = read_state(page)
            (output / name).write_text(json.dumps(result, ensure_ascii=False))
            return result

        start_servo()
        ask("入力電圧の動作範囲は？")
        ask("入力電圧の動作範囲は？")
        expect(page.get_by_text("確認した論点：2/5", exact=False)).to_be_visible()
        page.get_by_role("button", name="要件を整理して提案に進む").click()
        page.get_by_label("確認状態 communication", exact=True).select_option("assumed")
        page.get_by_label("能力・条件 制御周期・最悪遅延 TI候補", exact=True).fill("1 ms")
        page.get_by_label("製品・構成 ti", exact=True).fill("架空TI構成（テスト専用）")
        page.get_by_label("提案判断", exact=True).select_option("switch")
        submit()
        expect(page.locator(".technical-status")).to_contain_text("不成立")
        expect(page.locator(".technical-status")).to_contain_text("上限 20/100")
        page.get_by_label("レビュー本文", exact=True).fill("ChatGPTからの参考レビュー。制御周期の単位換算と根拠を再確認する。")
        page.get_by_role("button", name="レビュー本文を保存", exact=True).click()
        expect(page.get_by_role("status")).to_contain_text("参考レビューを保存")
        page.get_by_role("button", name="ChatGPT用プロンプトをコピー").click()
        expect(page.get_by_role("status")).to_contain_text("コピーしました")
        prompt = page.evaluate("navigator.clipboard.readText()")
        assert all(fragment in prompt for fragment in ["unverifiedConditions", "uncheckedAtProposal", "attemptId", "採用確認と採用理由"])
        page.locator(".technical-status").scroll_into_view_if_needed()
        page.screenshot(path=str(output / "fatal-desktop.png"))
        first_export = export_history("with-fatal.json")
        assert first_export["attempts"][0] == baseline["attempts"][0]
        fatal = first_export["attempts"][-1]
        assert fatal["assessment"]["status"] == "failed"
        assert set(fatal["assessment"]["errors"]) == {"technical", "hearing", "evidence", "competition", "migration"}
        assert len(fatal["externalReviews"]) == 1
        assert sum(item["points"] for item in fatal["evaluations"]) <= 20

        def fill_claim(label, value):
            control = page.get_by_label("能力・条件 " + label, exact=True)
            control.fill(value)
            editor = control.locator("xpath=ancestor::fieldset")
            editor.locator("summary").click()
            page.get_by_label("根拠URL " + label, exact=True).fill("https://example.org/fictional-test-report")
            page.get_by_label("該当箇所 " + label, exact=True).fill("架空テスト専用。負荷・温度・測定条件を明示して構成全体を照合した記録。")
            page.get_by_label("確認日 " + label, exact=True).fill("2026-10-19")
            page.get_by_label("原典照合 " + label, exact=True).check()
            editor.locator("summary").click()

        def prepare_keep(counter_value):
            start_servo()
            ask("入力電圧とCAN通信、既存ソフトの移行工数、BOM予算と供給納期は？")
            expect(page.get_by_text("確認した論点：5/5", exact=False)).to_be_visible()
            page.get_by_role("button", name="要件を整理して提案に進む").click()
            page.get_by_label("製品・構成 ti", exact=True).fill("架空TI構成（テスト専用）")
            page.get_by_label("製品・構成 competitor", exact=True).fill("架空現行構成（テスト専用）")
            page.get_by_label("能力・条件 制御周期・最悪遅延 TI候補", exact=True).fill("1 ms")
            for label, value in [("制御周期・最悪遅延", "50 us"), ("入力電源の動作範囲", "18..30 V"), ("制御ネットワークのI/F", "CAN FD")]:
                fill_claim(label + " 現行・競合候補", value)
            for metric in ["BOM（通貨・数量条件を明記）", "移行工数（時間・対象範囲）", "開発リスク（検証・認証・ソフト）", "供給条件（見積日・数量・納期）"]:
                for candidate in ["TI候補", "現行・競合候補"]:
                    fill_claim(metric + " " + candidate, "20 h" if metric.startswith("移行") else "同数量・同条件の架空比較記録")
            page.get_by_label("提案判断", exact=True).select_option("keep")
            page.get_by_label("判断理由と採用・撤退条件", exact=True).fill("現行構成が全要求を満たすため維持する。切替による移行工数と供給リスクを同条件で比較し、改善が証明された場合に再評価する。")
            page.get_by_text("4. 顧客からの追加条件・反証", exact=True).click()
            page.get_by_role("button", name="追加条件を受け取る").click()
            fill_claim("追加条件：周囲温度 現行・競合候補", counter_value)

        prepare_keep("-20..85 °C")
        submit()
        expect(page.locator(".technical-status")).to_contain_text("成立確認済み")
        page.get_by_text("ChatGPTレビューJSONを貼り付ける", exact=True).click()
        page.get_by_label("ChatGPTレビューJSON", exact=True).fill(json.dumps({"schemaVersion":1,"attemptId":"wrong","source":"ChatGPT","reviewedAt":"2026-10-19","content":"別の回答へのレビュー"}))
        page.get_by_role("button", name="レビューJSONを保存", exact=True).click()
        expect(page.get_by_role("alert")).to_contain_text("回答ID")
        keep_export = export_history("with-keep.json")
        keep = keep_export["attempts"][-1]
        assert keep["workflow"]["decision"] == "keep"
        assert keep["workflow"]["counterActive"] is True
        assert keep["assessment"]["status"] == "confirmed"
        assert keep["assessment"]["errors"] == []

        prepare_keep("0..85 °C")
        submit()
        expect(page.locator(".technical-status")).to_contain_text("不成立")
        final = export_history("final-history.json")
        assert final["attempts"][0] == baseline["attempts"][0]
        assert final["attempts"][-1]["assessment"]["scoreCap"] == 20
        page.get_by_role("button", name="ダッシュボード", exact=False).click()
        page.get_by_role("button", name="復習 ↗", exact=False).click()
        page.get_by_label("復習する誤り", exact=True).select_option("technical")
        expect(page.locator(".question-card")).to_have_count(1)
        page.evaluate("navigator.serviceWorker.ready")
        page.wait_for_function("navigator.serviceWorker.controller !== null")
        context.new_cdp_session(page).send("Network.clearBrowserCache")
        context.set_offline(True)
        page.reload()
        page.get_by_role("button", name="回答履歴", exact=False).click()
        expect(page.locator(".history-row")).to_have_count(4)
        page.locator(".history-row").nth(2).get_by_role("button", name="回答・復習を開く").click()
        expect(page.get_by_text("ChatGPT参考レビュー", exact=False)).to_be_visible()
        page.set_viewport_size({"width": 390, "height": 844})
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.locator(".technical-status").scroll_into_view_if_needed()
        page.screenshot(path=str(output / "technical-mobile-offline.png"))
        assert not errors, errors
        assert not external, external
        browser.close()
    report = {"status": "pass", "legacyPreserved": True, "attempts": 4, "flows": ["interview-coverage-not-question-count", "proceed-with-assumptions", "fatal-score-cap", "keep-incumbent", "counterexample-pass-and-fail", "proof-editor", "reviews-save-reject-wrong-id", "prompt-schema", "targeted-review", "offline-legacy-and-new-history", "mobile-no-overflow"], "pageErrors": errors, "externalRequests": external}
    (output / "workflow-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    sys.stdout.write(json.dumps(report, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:4178")
    parser.add_argument("--output", type=Path, default=Path("/tmp/fae-workflow-browser"))
    args = parser.parse_args()
    run(args.url.rstrip("/"), args.output)
