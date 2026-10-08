document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".greedy-nav a").forEach(function (link) {
    if (!(link instanceof HTMLAnchorElement)) {
      return;
    }
    const pathname = new URL(link.href, window.location.origin).pathname;
    if (pathname.endsWith("/research/")) {
      link.textContent = "技術/Technology";
    }
  });
});
