(() => {
  const button = document.querySelector(".menu");
  const nav = document.querySelector(".topbar nav");
  const close = () => {
    if (!button || !nav) return;
    nav.classList.remove("open");
    button.setAttribute("aria-expanded","false");
    button.textContent = "☰";
  };
  if (button && nav) {
    button.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
      button.textContent = open ? "×" : "☰";
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
    document.addEventListener("keydown", e => { if(e.key === "Escape") close(); });
    window.addEventListener("resize", () => { if(window.innerWidth > 760) close(); });
  }
})();