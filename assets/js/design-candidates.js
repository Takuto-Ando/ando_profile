document.addEventListener("DOMContentLoaded", function () {
  const design =
    new URLSearchParams(window.location.search).get("design") || "section-band";
  const allowedDesigns = [
    "notebook",
    "index",
    "gallery",
    "hierarchy",
    "link-accent",
    "section-band",
  ];
  if (
    !document.querySelector(".technical") ||
    !allowedDesigns.includes(design)
  ) {
    return;
  }
  document.body.dataset.design = design;
  const hub = document.querySelector(".technical .design-options");
  if (!hub) {
    return;
  }
  hub.querySelectorAll("[data-design]").forEach(function (link) {
    if (link.getAttribute("data-design") === design) {
      link.setAttribute("aria-current", "page");
    }
  });
});
