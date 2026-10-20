import argparse
import json
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


def run(url, output):
    output.mkdir(parents=True, exist_ok=True)
    reports = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for width, height in [(1366, 768), (390, 844)]:
            context = browser.new_context(viewport={"width": width, "height": height})
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(url)
            expect(page.locator("#library")).to_be_hidden()
            payload = page.evaluate("""async () => {
              const {encryptDocument} = await import(new URL('../assets/js/private-crypto.js', location.href));
              const titles = ['TI クイズ一覧','TI 用途・特徴クイズ','TI デジタルセミナークイズ','TI ブロック図・回路クイズ','TI アナログセミナークイズ','TI セミナークイズ','TI Product Learning Lab','MCU・Processorの資料','TI PSDS 2026｜アナログ電源設計の学習ノート','ブロック図で理解するTIの電子システム','セミナー学習ノート','業界・競合・キャリア'];
              const documents = titles.map((title,index) => ({id: index === 0 ? 'TI_Quiz_Index.html' : `fixture-${index}.html`, title, html: `<html><body><h1>${title}</h1><a href="TI_Quiz_Index.html">旧クイズへの既存リンク</a></body></html>`}));
              return encryptDocument(JSON.stringify({type:'private-library',version:1,documents}), 'synthetic-test-only');
            }""")
            page.route("**/assets/private/content.json", lambda route: route.fulfill(json=payload))
            page.get_by_label("パスワード", exact=True).fill("wrong-password")
            page.get_by_role("button", name="資料一覧を開く").click()
            expect(page.locator("#status")).to_contain_text("パスワードが違う")
            expect(page.locator("#library")).to_be_hidden()
            page.get_by_label("パスワード", exact=True).fill("synthetic-test-only")
            page.get_by_role("button", name="資料一覧を開く").click()
            expect(page.locator("#library")).to_be_visible()
            expect(page.locator("#library-list .library-card")).to_have_count(6)
            expect(page.locator(".material-category")).to_have_count(6)
            expect(page.get_by_role("link", name="学習を始める")).to_have_attribute("href", "/ando_profile/fae-simulator/")
            assert page.locator(".simulator-hero").bounding_box()["y"] < page.locator("#library-list").bounding_box()["y"]
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
            page.screenshot(path=str(output / f"portal-{width}.png"), full_page=True)
            page.get_by_role("button", name="TI Product Learning Lab", exact=False).click()
            page.frame_locator("#document").get_by_role("link", name="旧クイズへの既存リンク").click()
            expect(page.locator("#document-title")).to_have_text("TI クイズ一覧")
            expect(page.locator("#document")).to_have_attribute("sandbox", "allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox")
            page.get_by_role("button", name="資料一覧へ", exact=False).click()
            expect(page.locator("#library")).to_be_visible()
            page.get_by_role("button", name="ロックする").click()
            expect(page.locator("#library")).to_be_hidden()
            expect(page.locator("#library-list")).to_be_empty()
            assert page.locator("#document").get_attribute("srcdoc") is None
            assert page.evaluate("localStorage.length + sessionStorage.length") == 0
            assert errors == [], errors
            reports.append({"width": width, "height": height, "status": "pass"})
            context.close()
        browser.close()
    (output / "portal-report.json").write_text(json.dumps(reports, indent=2))
    print(json.dumps(reports))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:4180/ando_profile/admin/")
    parser.add_argument("--output", type=Path, default=Path("/tmp/fae-portal-browser"))
    args = parser.parse_args()
    run(args.url, args.output)
