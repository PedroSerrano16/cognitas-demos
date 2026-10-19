// /precario: price tables by nível, the plan simulator and the FAQ.
// Prices come from prices.js.

const { PRICES, PRICE_NOTES, ANNUAL_MONTHS, ANNUAL_DISCOUNT } = window;

const euro = (v) => (typeof v === "number" ? `${Math.round(v)}€` : v);

// Swap between class sets: swap(el, active ? ON : OFF, [ON, OFF, ...]).
function swap(el, wanted, all) {
  all.forEach((set) => el.classList.remove(...set));
  el.classList.add(...wanted);
}
const cls = (s) => s.split(" ");

// ── Price tables ─────────────────────────────────────────────────────────────

const TAB_ON = cls("bg-primary text-dark shadow-lg");
const TAB_OFF = cls("text-gray-dark hover:bg-white/50");
const PACK_ON = cls("bg-primary text-dark shadow-md");
const PACK_OFF = cls("text-gray-dark hover:bg-white/40");
const SUB_ON = cls("text-dark/70");
const SUB_OFF = cls("text-gray-dark/60");

const table = { tier: "basico", pack: "6" };

function renderTable() {
  document.querySelectorAll("[data-tier]").forEach((b) => {
    const on = b.dataset.tier === table.tier;
    swap(b, on ? TAB_ON : TAB_OFF, [TAB_ON, TAB_OFF]);
    const sub = b.querySelector("[data-tier-sub]");
    swap(sub, on ? SUB_ON : SUB_OFF, [SUB_ON, SUB_OFF]);
  });
  document.querySelectorAll("[data-pack]").forEach((b) => {
    const on = b.dataset.pack === table.pack;
    swap(b, on ? PACK_ON : PACK_OFF, [PACK_ON, PACK_OFF]);
  });

  const tier = PRICES[table.tier];
  document.querySelectorAll("[data-slot]").forEach((el) => {
    const slot = el.dataset.slot;
    if (slot.startsWith("recorrente")) {
      el.textContent = euro(tier.individual[slot]);
    } else {
      const [mod, kind] = slot.split(".");
      el.textContent = euro(tier[mod][kind === "pack" ? `pack${table.pack}` : "avulso"]);
    }
  });
  document.querySelectorAll("[data-pack-desc]").forEach((el) => {
    el.textContent = `${table.pack} sessões`;
  });

  const notes = document.querySelector("[data-notes]");
  const template = notes.firstElementChild;
  notes.replaceChildren(
    ...PRICE_NOTES[table.tier].map((text) => {
      const item = template.cloneNode(true);
      item.querySelector("span").textContent = text;
      item.classList.add("is-revealed");
      return item;
    }),
  );
}

document.querySelectorAll("[data-tier]").forEach((b) =>
  b.addEventListener("click", () => {
    table.tier = b.dataset.tier;
    renderTable();
  }),
);
document.querySelectorAll("[data-pack]").forEach((b) =>
  b.addEventListener("click", () => {
    table.pack = b.dataset.pack;
    renderTable();
  }),
);

// ── Simulator ────────────────────────────────────────────────────────────────

const ANOS = {
  "5ano": { label: "5º Ano", nivel: "basico" },
  "6ano": { label: "6º Ano", nivel: "basico" },
  "7ano": { label: "7º Ano", nivel: "basico" },
  "8ano": { label: "8º Ano", nivel: "basico" },
  "9ano": { label: "9º Ano", nivel: "basico" },
  "10ano": { label: "10º Ano", nivel: "secundario" },
  "11ano": { label: "11º Ano", nivel: "secundario" },
  "12ano": { label: "12º Ano", nivel: "secundario" },
  superior: { label: "Superior", nivel: "superior" },
};
const PLANOS = {
  recorrente1: { label: "1h/semana", tipo: "recorrente", horas: 1 },
  recorrente2: { label: "2h/semana", tipo: "recorrente", horas: 2 },
  recorrente3: { label: "3h/semana", tipo: "recorrente", horas: 3 },
  pack6: { label: "Pack 6h", tipo: "pack", sessoes: 6 },
  pack12: { label: "Pack 12h", tipo: "pack", sessoes: 12 },
  avulso: { label: "Avulso", tipo: "avulso" },
};
const MODOS = { presencial: "Presencial", online: "Online" };
const SESSOES = { individual: "Individual", grupo2: "Grupo 2", grupo3: "Grupo 3+" };

const sim = { ano: "9ano", plano: "recorrente2", modo: "presencial", sessao: "individual", annual: false };

// Group sessions aren't offered on recurring plans, and avulso has no annual option.
function normalise() {
  if (PLANOS[sim.plano].tipo === "recorrente") sim.sessao = "individual";
  if (PLANOS[sim.plano].tipo === "avulso") sim.annual = false;
}

function quote() {
  const plano = PLANOS[sim.plano];
  const nivel = ANOS[sim.ano].nivel;
  const row = PRICES[nivel][sim.sessao];
  const base = row[sim.plano];
  if (typeof base === "string") return { consult: true };

  const annual = sim.annual && plano.tipo !== "avulso";
  const price = annual ? Math.round(ANNUAL_MONTHS * base * (1 - ANNUAL_DISCOUNT)) : base;

  let savings = 0;
  if (plano.tipo === "pack") savings = Math.round(row.avulso * plano.sessoes - base);
  if (plano.tipo === "recorrente") savings = Math.round(row.avulso * 4 * plano.horas - base);
  if (annual) savings += Math.round(ANNUAL_MONTHS * base - price);

  const period = annual ? "ano letivo" : { avulso: "sessão", pack: "", recorrente: "mês" }[plano.tipo];
  return { price, avulsa: row.avulso, savings: Math.max(savings, 0), period, annual };
}

const BIG_ON = cls("bg-primary text-dark border-primary shadow-lg scale-105");
const BIG_OFF = cls("bg-white/50 text-gray-dark border-white/30 hover:bg-white/70 hover:scale-102");
const ROW_ON = cls("bg-primary text-dark border-primary shadow-lg");
const ROW_OFF = cls("bg-white/50 text-gray-dark border-white/30 hover:bg-white/70 cursor-pointer");
const ROW_DISABLED = cls("bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50");
const SUB_DISABLED = cls("text-gray-400/60");
const BILL_ON = cls("bg-primary text-dark shadow-md");
const BILL_OFF = cls("text-gray-dark/70 hover:text-dark");

function renderSim() {
  normalise();
  const recurring = PLANOS[sim.plano].tipo === "recorrente";

  document.querySelectorAll("[data-sim]").forEach((b) => {
    const group = b.dataset.sim;
    const on = sim[group] === b.dataset.value;
    const disabled = group === "sessao" && recurring && b.dataset.value !== "individual";
    const big = group === "ano" || group === "plano";
    const all = [BIG_ON, BIG_OFF, ROW_ON, ROW_OFF, ROW_DISABLED];

    b.disabled = disabled;
    swap(b, disabled ? ROW_DISABLED : on ? (big ? BIG_ON : ROW_ON) : big ? BIG_OFF : ROW_OFF, all);
    const sub = b.querySelector("[data-sub]");
    if (sub) swap(sub, disabled ? SUB_DISABLED : on ? SUB_ON : SUB_OFF, [SUB_ON, SUB_OFF, SUB_DISABLED]);
    const note = b.querySelector("[data-unavailable]");
    if (note) note.hidden = !disabled;
  });

  document.querySelectorAll("[data-sim-billing]").forEach((b) => {
    const on = (b.dataset.simBilling === "anual") === sim.annual;
    swap(b, on ? BILL_ON : BILL_OFF, [BILL_ON, BILL_OFF]);
  });

  document.querySelector("[data-sim-summary]").textContent = [
    ANOS[sim.ano].label,
    PLANOS[sim.plano].label,
    MODOS[sim.modo],
    SESSOES[sim.sessao],
  ].join(" • ");

  const q = quote();
  document.querySelector("[data-sim-consult]").hidden = !q.consult;
  document.querySelector("[data-sim-numeric]").hidden = !!q.consult;
  document.querySelector("[data-sim-avulsa]").textContent = q.consult
    ? "Sob consulta"
    : euro(q.avulsa);
  if (q.consult) return;

  document.querySelector("[data-sim-price]").textContent = euro(q.price);
  document.querySelector("[data-sim-period]").textContent = q.period ? ` ${q.period}` : "";
  const savings = document.querySelector("[data-sim-savings]");
  savings.hidden = q.savings <= 0;
  savings.querySelector("[data-sim-savings-text]").textContent = q.annual
    ? `Poupas ${q.savings}€ com ano letivo`
    : `Poupas ${q.savings}€ vs. sessões avulsas`;
}

document.querySelectorAll("[data-sim]").forEach((b) =>
  b.addEventListener("click", () => {
    if (b.disabled) return;
    sim[b.dataset.sim] = b.dataset.value;
    renderSim();
  }),
);
document.querySelectorAll("[data-sim-billing]").forEach((b) =>
  b.addEventListener("click", () => {
    sim.annual = b.dataset.simBilling === "anual" && PLANOS[sim.plano].tipo !== "avulso";
    renderSim();
  }),
);

// ── FAQ ──────────────────────────────────────────────────────────────────────

document.querySelectorAll("[data-faq]").forEach((button) => {
  const item = button.parentElement;
  const panel = button.nextElementSibling;
  const chevron = button.querySelector(".lucide-chevron-down");
  const bar = item.querySelector("[data-faq-bar]");
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", open);
    panel.classList.toggle("grid-rows-[1fr]", open);
    panel.classList.toggle("grid-rows-[0fr]", !open);
    chevron.classList.toggle("rotate-180", open);
    bar.classList.toggle("scale-y-100", open);
    bar.classList.toggle("scale-y-0", !open);
  });
});

renderTable();
renderSim();
