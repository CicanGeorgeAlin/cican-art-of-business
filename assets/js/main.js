(() => {
  const button = document.querySelector(".menu");
  const nav = document.querySelector(".site-nav");
  const close = () => {
    if (!button || !nav) return;
    nav.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open navigation");
    button.textContent = "☰";
  };

  if (button && nav) {
    button.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      button.textContent = open ? "×" : "☰";
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", close));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") close();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) close();
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
