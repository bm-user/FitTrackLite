(function () {
  const btn = document.querySelector(".site-header_menu-btn");
  const nav = document.querySelector(".site-header_nav");
  if (!btn || !nav) return;

  const mq = window.matchMedia("(min-width: 48rem)");

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  btn.addEventListener("click", function () {
    setOpen(!nav.classList.contains("is-open"));
  });

  mq.addEventListener("change", function () {
    if (mq.matches) setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      btn.focus();
    }
  });
})();
