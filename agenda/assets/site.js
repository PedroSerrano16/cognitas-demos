// Shared behaviour for every page: nav shrink on scroll, mobile menu,
// scroll-reveal animations.

// Elements with data-when="<state>" swap their data-off classes for their
// data-on classes while that state is active.
function setState(state, active) {
  document.querySelectorAll(`[data-when="${state}"]`).forEach((el) => {
    const on = el.dataset.on.split(" ");
    const off = el.dataset.off.split(" ");
    el.classList.remove(...(active ? off : on));
    el.classList.add(...(active ? on : off));
  });
}

// Nav
const onScroll = () => setState("scrolled", window.scrollY > 50);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu
let menuOpen = false;
function setMenu(open) {
  menuOpen = open;
  setState("menu", open);
  document.body.style.overflow = open ? "hidden" : "";
}
document.querySelectorAll("[data-menu-toggle]").forEach((b) =>
  b.addEventListener("click", () => setMenu(!menuOpen)),
);
document.querySelectorAll("[data-menu-close]").forEach((b) =>
  b.addEventListener("click", () => setMenu(false)),
);
document.addEventListener("keydown", (e) => e.key === "Escape" && menuOpen && setMenu(false));

// Scroll reveal. data-reveal holds the starting transform, e.g. "translateY(40px)".
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function reveal(el, delay) {
  el.classList.add("is-revealed");
  if (reduceMotion) return;
  const from = el.dataset.reveal || "none";
  el.animate(
    [
      { opacity: 0, transform: from },
      { opacity: 1, transform: "none" },
    ],
    { duration: 700, delay, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" },
  );
}

const observer = new IntersectionObserver(
  (entries) => {
    entries
      .filter((e) => e.isIntersecting)
      .forEach((e, i) => {
        // Siblings that enter together come in one after another.
        reveal(e.target, i * 80);
        observer.unobserve(e.target);
      });
  },
  { rootMargin: "0px 0px -60px 0px" },
);
document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));

// Shared by the page scripts.
window.TomaNota = { setState };
