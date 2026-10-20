import argparse
import json
import subprocess
from pathlib import Path
from xml.sax.saxutils import escape
from zipfile import ZipFile

from playwright.sync_api import expect, sync_playwright

from browser_workflow import legacy_state


def fixture_workbook(path: Path):
    master = [
        [
            "型番",
            "分類",
            "採用先の例",
            "証拠レベル",
            "情報源の種類",
            "シミュレータ利用",
            "注意事項",
        ]
    ]
    detail = [
        [
            "型番",
            "正式な分類・製品種別",
            "役割・何をするか",
            "信号・接続インターフェース",
            "回路設計で確認するポイント",
            "採用先の例（元データ）",
            "採用証拠レベル（元データ）",
            "シミュレータ扱い",
            "説明の確度",
            "TI製品ページ候補URL",
            "FAE練習問題の観点",
            "検証上の注意",
            "主要仕様（確認済のみ）",
        ]
    ]
    for index in range(6):
        part = f"TEST{index}"
        evidence = (
            "A_公式資料（型番対応あり）" if index < 4 else "D_既存DB記載・個別未検証"
        )
        master.append(
            [
                part,
                "テスト分類",
                f"架空装置{index}",
                evidence,
                "架空資料",
                "verified_case" if index < 4 else "candidate_only",
                "未照合",
            ]
        )
        detail.append(
            [
                part,
                "産業用テストMCU",
                f"架空役割{index}",
                "要確認",
                "電源・I/F照合",
                f"架空装置{index}",
                evidence,
                "verified_case" if index < 4 else "candidate_only",
                "製品固有の機能説明（数値仕様は要データシート）",
                "javascript:alert(1)",
                "学習",
                "外部未検証",
                "未確認",
            ]
        )

    def sheet(rows):
        output = ['<x:worksheet xmlns:x="urn:test"><x:sheetData>']
        for row_index, row in enumerate(rows, 1):
            output.append(f'<x:row r="{row_index}">')
            for column, value in enumerate(row):
                output.append(
                    f'<x:c r="{chr(65 + column)}{row_index}" t="inlineStr"><x:is><x:t>{escape(value)}</x:t></x:is></x:c>'
                )
            output.append("</x:row>")
        output.append("</x:sheetData></x:worksheet>")
        return "".join(output)

    with ZipFile(path, "w") as archive:
        archive.writestr(
            "xl/workbook.xml",
            '<x:workbook xmlns:x="urn:test" xmlns:r="urn:rel"><x:sheets><x:sheet name="IC Master" r:id="m"/><x:sheet name="IC 詳細解説" r:id="d"/></x:sheets></x:workbook>',
        )
        archive.writestr(
            "xl/_rels/workbook.xml.rels",
            '<Relationships><Relationship Id="m" Target="/xl/worksheets/master.xml"/><Relationship Id="d" Target="worksheets/detail.xml"/></Relationships>',
        )
        archive.writestr("xl/worksheets/master.xml", sheet(master))
        archive.writestr("xl/worksheets/detail.xml", sheet(detail))


def run(
    url: str,
    output: Path,
    workbook: Path | None,
    part: str,
    count: int,
    bundled: bool = False,
):
    output.mkdir(parents=True, exist_ok=True)
    if workbook is None and not bundled:
        workbook = output / "fictional-ic.xlsx"
        fixture_workbook(workbook)
    legacy = output / "legacy.json"
    legacy.write_text(json.dumps(legacy_state()))
    notion = output / "fictional.csv"
    notion.write_text("事業名,会社名,TI製品,課題\n架空IC検証,架空会社,MSPM0,精度\n")
    invalid = output / "bad.xlsx"
    invalid.write_text("not an Excel file")
    errors = []
    uploads = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()
        page.set_default_timeout(15000)
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on(
            "request",
            lambda request: uploads.append(request.url)
            if request.method != "GET"
            else None,
        )
        page.goto(url)
        expect(page.get_by_role("heading", name="1分からのFAE学習")).to_be_visible()
        page.evaluate("navigator.serviceWorker.ready")
        page.wait_for_function("navigator.serviceWorker.controller !== null")
        page.get_by_role("button", name="データ管理", exact=False).click()
        page.get_by_label("履歴JSONをインポート", exact=True).set_input_files(
            str(legacy)
        )
        expect(page.get_by_role("status")).to_contain_text("履歴を統合")
        page.get_by_label("ファイル／ZIPを選択", exact=True).set_input_files(
            str(notion)
        )
        expect(page.get_by_role("status")).to_contain_text("1件を取り込み")
        page.get_by_role("button", name="採用ICライブラリ", exact=False).click()
        if not bundled:
            page.get_by_label("IC資料を取り込む", exact=True).set_input_files(
                str(workbook)
            )
            expect(
                page.get_by_text(f"{count}型番を端末内に保存しました。", exact=False)
            ).to_be_visible()
        else:
            expect(
                page.get_by_text("教材は読み込み済みです。", exact=False)
            ).to_be_visible()
            expect(
                page.get_by_label("学習するIC", exact=True).locator("option")
            ).to_have_count(count + 1)
        page.get_by_label("学習するIC", exact=True).select_option(part)
        expect(page.locator(".ic-details")).to_contain_text("採用理由：不明")
        expect(page.locator('.ic-details a[href^="javascript:"]')).to_have_count(0)
        page.screenshot(path=str(output / "ic-library-mobile.png"), full_page=True)
        with page.expect_download() as download:
            page.get_by_role(
                "button", name="IC資料JSONをエクスポート", exact=True
            ).click()
        backup = output / "ic-backup.json"
        download.value.save_as(str(backup))
        library = json.loads(backup.read_text())
        assert len(library["entries"]) == count
        assert len(library["source"]["sha256"]) == 64
        page.get_by_role("button", name="Lv.1 技術判断4択を始める", exact=True).click()
        title = page.locator("#short-question-title").inner_text()
        root = Path(__file__).resolve().parents[1]
        questions = json.loads(subprocess.check_output([str(root / "node_modules/.bin/tsx"), "-e", "import {decisionQuestions} from './src/decision-questions.ts';process.stdout.write(JSON.stringify(decisionQuestions));"], cwd=root, text=True))
        question = next(item for item in questions if item["title"] == title and item["level"] == 1)
        expected_role = next(option["text"] for option in question["selection"]["options"] if option["id"] == question["selection"]["correctId"])
        assert part not in question["selection"]["prompt"]
        page.get_by_role("group", name="技術方式の選択肢").get_by_role(
            "button", name=expected_role, exact=True
        ).click()
        expect(
            page.get_by_text("回答・ヒント利用を保存済み", exact=False)
        ).to_be_visible()
        expect(page.locator('[data-answer-state="correct"]')).to_contain_text(
            expected_role
        )
        page.get_by_role("button", name="採用ICライブラリ", exact=False).click()
        page.get_by_label("学習するIC", exact=True).select_option(part)
        page.get_by_role("button", name="このICの提案演習を始める", exact=True).click()
        page.get_by_text("採用記載ICから提案候補を選ぶ", exact=True).click()
        page.get_by_label("候補IC", exact=True).select_option(part)
        page.get_by_role("button", name="候補を提案に追加", exact=True).click()
        selection = page.locator("form textarea").nth(2)
        assert selection.input_value().startswith(f"候補TI型番: {part}\n")
        before = selection.input_value()
        assert "採用理由: 不明" in before
        assert library["source"]["sha256"] in before
        page.get_by_role("button", name="候補を提案に追加", exact=True).click()
        expect(selection).to_have_value(before)
        for index, text in enumerate(
            [
                "顧客条件が不足しているため定量要件と温度を質問します。",
                "入力、処理、出力の経路を整理し電源保護と通信を確認します。",
                "",
                "現行維持を含め性能と移行コストを同じ条件で比較します。",
                "評価担当と日程を決めて試作し合格基準を確認します。",
            ]
        ):
            if text:
                page.locator("form textarea").nth(index).fill(text)
        page.get_by_role(
            "button", name="回答を保存して参考情報と比較", exact=True
        ).click()
        expect(
            page.get_by_text("Lv.4の提案を保存しました。", exact=False)
        ).to_be_visible()
        page.get_by_role("button", name="プロンプトを表示", exact=True).click()
        prompt = page.locator("textarea[readonly]").first.input_value()
        assert library["source"]["sha256"] in prompt
        assert "採用理由: 不明" in prompt
        page.get_by_role("button", name="回答履歴", exact=False).click()
        with page.expect_download() as download:
            page.get_by_role(
                "button", name="履歴JSONをエクスポート", exact=True
            ).click()
        history_file = output / "history.json"
        download.value.save_as(str(history_file))
        history = json.loads(history_file.read_text())
        assert history["attempts"][0] == legacy_state()["attempts"][0]
        assert len(history["attempts"]) == 2
        assert len(history["shortAttempts"]) == 1
        second = browser.new_context()
        other = second.new_page()
        other.goto(url)
        other.get_by_role("button", name="採用ICライブラリ", exact=False).click()
        other.get_by_label("IC資料を取り込む", exact=True).set_input_files(str(backup))
        expect(
            other.get_by_text(f"{count}型番を端末内に保存しました。", exact=False)
        ).to_be_visible()
        other.get_by_role("button", name="データ管理", exact=False).click()
        other.get_by_label("履歴JSONをインポート", exact=True).set_input_files(
            str(history_file)
        )
        expect(other.get_by_text("履歴を統合しました", exact=False)).to_be_visible()
        second.close()
        page.reload()
        page.get_by_role("button", name="採用ICライブラリ", exact=False).click()
        page.get_by_label("学習するIC", exact=True).select_option(part)
        page.get_by_label("IC資料を取り込む", exact=True).set_input_files(str(invalid))
        expect(page.get_by_role("alert")).to_be_visible()
        expect(page.get_by_label("学習するIC", exact=True)).to_have_value(part)
        page.get_by_role(
            "button", name="顧客確認・成立性検証まで進める（Lv.5）", exact=True
        ).click()
        page.get_by_role("button", name="要件を整理して提案に進む", exact=True).click()
        page.get_by_text("採用記載ICから提案候補を選ぶ", exact=True).click()
        page.get_by_label("候補IC", exact=True).select_option(part)
        page.get_by_role("button", name="候補を提案に追加", exact=True).click()
        expect(page.get_by_label("製品・構成 ti", exact=True)).to_have_value(part)
        assert not page.locator('input[type="checkbox"]:checked').count()
        context.set_offline(True)
        page.reload()
        page.get_by_role("button", name="採用ICライブラリ", exact=False).click()
        page.get_by_label("学習するIC", exact=True).select_option(part)
        expect(page.locator(".ic-details")).to_contain_text(part)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        assert not errors, errors
        assert not uploads, uploads
        browser.close()
    report = {
        "status": "pass",
        "entries": count,
        "part": part,
        "bundledWithoutImport": bundled,
        "flows": [
            "bundled-no-import" if bundled else "xlsx-import",
            "evidence-separation",
            "priority",
            "source-sha",
            "short-quiz",
            "candidate-selection",
            "no-duplicate-selection",
            "proposal-history-snapshot",
            "chatgpt-prompt",
            "legacy-preserved",
            "json-portability",
            "failed-import-preserves-library",
            "lv5-candidate-without-auto-verification",
            "offline-library",
        ],
        "pageErrors": errors,
        "uploads": uploads,
    }
    (output / "ic-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2)
    )
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--workbook", type=Path)
    parser.add_argument("--part", default="TEST0")
    parser.add_argument("--count", type=int, default=6)
    parser.add_argument("--bundled", action="store_true")
    args = parser.parse_args()
    run(args.url, args.output, args.workbook, args.part, args.count, args.bundled)
