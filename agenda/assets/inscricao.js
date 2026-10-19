// /inscricao: the enrolment form.
//
// The field names, option values and rules match what POST /api/inscricao
// expects (the original backend), so don't rename values without changing it too.

const cls = (s) => s.split(" ");

// ── Options ──────────────────────────────────────────────────────────────────

const OPTIONS = {
  anoEscolaridade: [
    ["5º Ano", "📚"], ["6º Ano", "📖"], ["7º Ano", "✏️"], ["8º Ano", "📝"], ["9º Ano", "🎓"],
    ["10º Ano", "📊"], ["11º Ano", "🎯"], ["12º Ano", "🏆"], ["Ensino Superior", "🎓"],
  ].map(([value, icon]) => ({ value, label: value, icon })),

  disciplinas: [
    ["Matemática", "🔢"], ["Português", "📝"], ["Inglês", "🇬🇧"], ["Francês", "🇫🇷"],
    ["Espanhol", "🇪🇸"], ["História", "📜"], ["Geografia", "🌍"], ["Ciências Naturais", "🔬"],
    ["Física", "⚡"], ["Química", "🧪"], ["Biologia", "🧬"], ["Filosofia", "🤔"],
    ["Economia", "💰"], ["Contabilidade", "📊"], ["Cálculo", "∫"], ["Estatística", "📈"],
    ["Outra", "❓"],
  ].map(([value, icon]) => ({ value, label: value, icon })),

  modalidade: [
    { value: "presencial", label: "Presencial", icon: "🏫", description: "No nosso centro" },
    { value: "online", label: "Online", icon: "💻", description: "Onde estiveres" },
  ],

  sessoesPorSemana: [
    { value: "recorrente-1h", label: "Aluno Recorrente - 1h/semana", description: "Pagamento mensal" },
    { value: "recorrente-2h", label: "Aluno Recorrente - 2h/semana", description: "Pagamento mensal" },
    { value: "recorrente-3h", label: "Aluno Recorrente - 3h/semana", description: "Pagamento mensal" },
    { value: "pack-6h", label: "Pack 6 sessões", description: "Pacote de 6 horas" },
    { value: "pack-12h", label: "Pack 12 sessões", description: "Pacote de 12 horas" },
    { value: "avulso", label: "Sessões avulsas", description: "Sem compromisso" },
    { value: "outro", label: "Outro", description: "Especificar nos comentários" },
  ],

  horarios: [
    { value: "Manhã (9h-12h)", label: "Manhã", icon: "🌅", description: "9h-12h" },
    { value: "Tarde (14h-17h)", label: "Tarde", icon: "☀️", description: "14h-17h" },
    { value: "Final da tarde (17h-20h)", label: "Final da tarde", icon: "🌇", description: "17h-20h" },
    { value: "Noite (20h-22h)", label: "Noite", icon: "🌙", description: "20h-22h" },
    { value: "Fins de semana", label: "Fins de semana", icon: "🏖️", description: "Sábado/Domingo" },
    { value: "Flexível", label: "Flexível", icon: "⏰", description: "A combinar" },
  ],
};
const MAX = { disciplinas: 5, horarios: 6 };

// ── State and validation ─────────────────────────────────────────────────────

const values = {
  nomeAluno: "", nomeEncarregado: "", email: "", telefone: "",
  anoEscolaridade: "", disciplinas: [], modalidade: "", sessoesPorSemana: "",
  horarios: [], comentarios: "",
};
const touched = new Set();

// Returns an error message, or "" when the field is valid.
function validate(name, v) {
  switch (name) {
    case "nomeAluno":
      if (v.trim().length < 2) return "Nome do aluno deve ter pelo menos 2 caracteres";
      if (v.length > 100) return "Nome do aluno deve ter no máximo 100 caracteres";
      return "";
    case "nomeEncarregado":
      return v.length > 100 ? "Nome do encarregado deve ter no máximo 100 caracteres" : "";
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Por favor, insira um email válido";
    case "telefone":
      if (!/^[0-9+\-\s()]*$/.test(v)) return "Formato de telefone inválido";
      if (v.length > 15) return "Número de telefone deve ter no máximo 15 dígitos";
      if (v.replace(/[^0-9]/g, "").length < 9) return "Número de telefone deve ter pelo menos 9 dígitos";
      return "";
    case "anoEscolaridade":
      return v ? "" : "Ano de escolaridade é obrigatório";
    case "disciplinas":
      return v.length ? "" : "Seleciona pelo menos uma disciplina";
    case "modalidade":
      return v ? "" : "Modalidade é obrigatória";
    case "sessoesPorSemana":
      return v ? "" : "Tipo de plano é obrigatório";
    case "horarios":
      return v.length ? "" : "Seleciona pelo menos um horário disponível";
    case "comentarios":
      return v.length > 500 ? "Comentários devem ter no máximo 500 caracteres" : "";
  }
  return "";
}
const REQUIRED = ["nomeAluno", "email", "telefone", "anoEscolaridade", "disciplinas", "modalidade", "sessoesPorSemana", "horarios"];
const isValid = () => Object.keys(values).every((k) => !validate(k, values[k]));

// ── Rendering ────────────────────────────────────────────────────────────────

const form = document.querySelector("[data-form]");

const INPUT_STATES = [
  cls("border-red-400 focus:border-red-500 focus:ring-red-200"),
  cls("border-green-400 focus:border-green-500 focus:ring-green-200"),
  cls("border-white/30 focus:border-primary/50 focus:ring-primary/20"),
];

// One error line under each field, created on demand.
function errorSlot(field) {
  const host = field.closest(".relative") ?? field.parentElement;
  let slot = host.parentElement.querySelector(":scope > [data-error]");
  if (!slot) {
    slot = document.createElement("div");
    slot.className = "mt-2 px-2";
    slot.dataset.error = "";
    slot.innerHTML =
      '<p class="text-sm text-red-600 flex items-center gap-2"><span class="w-1 h-1 bg-red-600 rounded-full flex-shrink-0"></span><span></span></p>';
    host.after(slot);
  }
  return slot;
}

function renderField(name) {
  const field = form.querySelector(`[name="${name}"], [data-dropdown="${name}"]`);
  const error = touched.has(name) ? validate(name, values[name]) : "";
  const slot = errorSlot(field);
  slot.hidden = !error;
  slot.querySelector("span:last-child").textContent = error;

  const ok = touched.has(name) && !error && REQUIRED.includes(name);
  INPUT_STATES.forEach((s) => field.classList.remove(...s));
  field.classList.add(...INPUT_STATES[error ? 0 : ok ? 1 : 2]);
  field.querySelector?.(".lucide-chevron-down")?.classList.toggle("text-red-500", !!error);
}

function renderProgress() {
  const filled = REQUIRED.filter((k) => (Array.isArray(values[k]) ? values[k].length : values[k].trim())).length;
  const pct = Math.min(100, Math.round((filled / REQUIRED.length) * 100));
  document.querySelector("[data-progress-text]").textContent = `${pct}%`;
  document.querySelector("[data-progress-bar]").style.transform = `scaleX(${pct / 100})`;
}

const submit = form.querySelector("[data-submit]");
const SUBMIT_OFF = cls("bg-gray-300 text-gray-500 cursor-not-allowed");
const SUBMIT_ON = cls("bg-primary text-dark hover:bg-primary/90 hover:shadow-xl cursor-pointer");
let sending = false;

function renderSubmit() {
  const enabled = isValid() && !sending;
  submit.disabled = !enabled;
  submit.classList.remove(...SUBMIT_OFF, ...SUBMIT_ON);
  submit.classList.add(...(enabled ? SUBMIT_ON : SUBMIT_OFF));
  submit.querySelector("[data-submit-label]").textContent = sending ? "A enviar..." : "Enviar Pedido";
}

function update(name) {
  touched.add(name);
  renderField(name);
  renderProgress();
  renderSubmit();
}

// ── Text fields ──────────────────────────────────────────────────────────────

form.querySelectorAll("input[name], textarea[name]").forEach((el) => {
  el.addEventListener("input", () => {
    values[el.name] = el.value;
    update(el.name);
  });
});

// ── Dropdowns ────────────────────────────────────────────────────────────────

const PANEL =
  "absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden";
const CHECK =
  '<svg class="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>';

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const dropdowns = [];

function setupDropdown(trigger) {
  const name = trigger.dataset.dropdown;
  const options = OPTIONS[name];
  const multi = name in MAX;
  const display = trigger.querySelector(".flex-1.min-w-0, .flex.items-center.gap-2");
  const placeholder = display.innerHTML;
  const chevron = trigger.querySelector(".lucide-chevron-down").parentElement;
  chevron.classList.add("transition-transform", "duration-200");

  const panel = document.createElement("div");
  panel.className = PANEL;
  panel.setAttribute("role", "listbox");
  if (multi) panel.setAttribute("aria-multiselectable", "true");
  panel.hidden = true;
  trigger.after(panel);

  let open = false;
  let active = -1;
  const selected = () => (multi ? values[name] : values[name] ? [values[name]] : []);

  function renderPanel() {
    const sel = selected();
    const full = multi && sel.length >= MAX[name];
    panel.innerHTML = `<div class="py-2">${options
      .map((o, i) => {
        const on = sel.includes(o.value);
        const disabled = full && !on;
        return `<button type="button" role="option" aria-selected="${on}" data-i="${i}" ${disabled ? "disabled" : ""}
          class="w-full px-4 py-3 text-left transition-colors duration-200 flex items-center gap-3 min-w-0
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/10 cursor-pointer"}
          ${i === active ? "bg-primary/10" : ""} ${on ? "bg-primary/20" : ""}">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            ${o.icon ? `<span class="text-lg flex-shrink-0">${o.icon}</span>` : ""}
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate ${on ? "text-primary" : "text-gray-dark"}">${esc(o.label)}</div>
              ${o.description ? `<div class="text-sm text-gray-dark/60 truncate">${esc(o.description)}</div>` : ""}
            </div>
          </div>
          ${on ? CHECK : ""}
        </button>`;
      })
      .join("")}</div>`;
  }

  function renderTrigger() {
    const sel = selected();
    if (!sel.length) {
      display.innerHTML = placeholder;
      return;
    }
    if (!multi) {
      const o = options.find((x) => x.value === sel[0]);
      display.innerHTML = `${o.icon ? `<span class="text-xl flex-shrink-0">${o.icon}</span>` : ""}
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-dark truncate">${esc(o.label)}</div>
          ${o.description ? `<div class="text-sm text-gray-dark/60 truncate">${esc(o.description)}</div>` : ""}
        </div>`;
      display.classList.add("flex", "items-center", "gap-3");
      return;
    }
    display.innerHTML = `<div class="flex flex-wrap gap-2 flex-1">${sel
      .map((v) => {
        const o = options.find((x) => x.value === v);
        return `<span class="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
          ${o.icon ? `<span class="text-xs">${o.icon}</span>` : ""}
          <span class="truncate max-w-20">${esc(o.label)}</span>
          <button type="button" data-remove="${esc(v)}" aria-label="Remover ${esc(o.label)}"
            class="hover:bg-primary/30 rounded-full p-0.5 transition-colors cursor-pointer">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </span>`;
      })
      .join("")}<div class="text-xs text-gray-dark/60 self-center">${sel.length}/${MAX[name]}</div></div>`;
  }

  // The field wrapper may be its own stacking layer (e.g. mid reveal-animation),
  // which would trap the panel under the fields below it. Lift it while open.
  const field = trigger.closest("[data-reveal]") ?? trigger.parentElement;

  function setOpen(next) {
    open = next;
    if (!open) active = -1;
    panel.hidden = !open;
    field.style.position = open ? "relative" : "";
    field.style.zIndex = open ? "30" : "";
    trigger.setAttribute("aria-expanded", open);
    chevron.classList.toggle("rotate-180", open);
    if (open) {
      dropdowns.forEach((d) => d !== api && d.close());
      renderPanel();
    }
  }

  function choose(value) {
    if (multi) {
      const sel = values[name];
      if (sel.includes(value)) values[name] = sel.filter((v) => v !== value);
      else if (sel.length < MAX[name]) values[name] = [...sel, value];
      renderPanel();
    } else {
      values[name] = value;
      setOpen(false);
    }
    renderTrigger();
    update(name);
  }

  trigger.addEventListener("click", (e) => {
    const remove = e.target.closest("[data-remove]");
    if (remove) {
      e.stopPropagation();
      values[name] = values[name].filter((v) => v !== remove.dataset.remove);
      renderTrigger();
      if (open) renderPanel();
      update(name);
      return;
    }
    setOpen(!open);
  });
  panel.addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (b && !b.disabled) choose(options[+b.dataset.i].value);
  });
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "Escape") return setOpen(false);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      const n = options.length;
      active = e.key === "ArrowDown" ? (active + 1) % n : (active - 1 + n) % n;
      renderPanel();
      panel.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open && active >= 0) choose(options[active].value);
      else setOpen(!open);
    }
  });

  const api = {
    root: trigger.parentElement,
    close: () => open && setOpen(false),
    reset: () => {
      values[name] = multi ? [] : "";
      renderTrigger();
    },
  };
  dropdowns.push(api);
}

form.querySelectorAll("[data-dropdown]").forEach(setupDropdown);
document.addEventListener("mousedown", (e) =>
  dropdowns.forEach((d) => !d.root.contains(e.target) && d.close()),
);

// ── Submit ───────────────────────────────────────────────────────────────────

function showError(message) {
  let box = form.querySelector("[data-submit-error]");
  if (!box) {
    box = document.createElement("div");
    box.className = "bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm";
    box.dataset.submitError = "";
    submit.parentElement.before(box);
  }
  box.hidden = !message;
  box.textContent = message || "";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  Object.keys(values).forEach((k) => touched.add(k));
  Object.keys(values).forEach(renderField);
  if (!isValid() || sending) return;

  sending = true;
  showError("");
  renderSubmit();
  try {
    const res = await fetch("/api/inscricao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Erro ao enviar formulário");
    form.hidden = true;
    document.querySelector("[data-success]").hidden = false;
    document.querySelector("[data-success]").scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (err) {
    showError(
      err.message ||
        "Erro ao enviar inscrição. Por favor, tente novamente ou contacte-nos diretamente.",
    );
  } finally {
    sending = false;
    renderSubmit();
  }
});

// "Novo pedido": clear everything and show the form again.
document.querySelector("[data-new-request]").addEventListener("click", () => {
  form.reset();
  Object.keys(values).forEach((k) => (values[k] = Array.isArray(values[k]) ? [] : ""));
  dropdowns.forEach((d) => d.reset());
  touched.clear();
  Object.keys(values).forEach(renderField);
  renderProgress();
  renderSubmit();
  document.querySelector("[data-success]").hidden = true;
  form.hidden = false;
});

renderProgress();
renderSubmit();
