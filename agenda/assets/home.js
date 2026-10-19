// Home page "Planos & Preços": Mensal / Ano letivo toggle and plan selection.
// Ano letivo = 10 months at 10% off. The avulso session price never changes.

const ACTIVE = ["bg-primary", "text-dark", "shadow-md"];
const INACTIVE = ["text-gray-dark/70", "hover:text-dark"];
const SELECTED = ["border-primary", "shadow-2xl"];
const UNSELECTED = ["border-white/50", "hover:border-primary/50"];

const cards = [...document.querySelectorAll("[data-plan]")];
const badge = document.querySelector("[data-selected-badge]");

function setBilling(annual) {
  document.querySelectorAll("[data-billing]").forEach((b) => {
    const on = (b.dataset.billing === "anual") === annual;
    b.classList.remove(...(on ? INACTIVE : ACTIVE));
    b.classList.add(...(on ? ACTIVE : INACTIVE));
  });
  cards.forEach((card) => {
    if (card.dataset.plan === "avulso") return;
    const price = card.querySelector("[data-price]");
    const period = card.querySelector("[data-period]");
    const monthly = parseInt(price.dataset.price, 10);
    price.textContent = annual ? Math.round(10 * monthly * 0.9) : monthly;
    period.textContent = annual ? "por ano letivo" : period.dataset.period;
  });
}

function select(card) {
  cards.forEach((c) => {
    const on = c === card;
    c.classList.remove(...(on ? UNSELECTED : SELECTED));
    c.classList.add(...(on ? SELECTED : UNSELECTED));
  });
  card.appendChild(badge);
}

document.querySelectorAll("[data-billing]").forEach((b) =>
  b.addEventListener("click", () => setBilling(b.dataset.billing === "anual")),
);
cards.forEach((card) => {
  card.addEventListener("click", () => select(card));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(card);
    }
  });
});
