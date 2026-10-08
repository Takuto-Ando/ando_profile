document.addEventListener("DOMContentLoaded", function () {
  const isEnglish = document.documentElement.lang.startsWith("en");
  document.querySelectorAll("[data-bibtex-copy]").forEach(function (button) {
    button.addEventListener("click", async function () {
      const panel = button.closest(".pub-panel--bibtex");
      const code = panel.querySelector(".pub-panel__code");
      const status = panel.querySelector(".bibtex-copy-status");
      if (!(code instanceof HTMLElement) || !status) return;
      try {
        await navigator.clipboard.writeText(code.textContent.trim());
        status.textContent = isEnglish ? "Copied" : "コピーしました";
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
        code.focus();
        status.textContent = isEnglish
          ? "Select and copy the text manually (Ctrl/Cmd+C)."
          : "選択したテキストを手動でコピーしてください（Ctrl/Cmd+C）。";
      }
    });
  });
});
