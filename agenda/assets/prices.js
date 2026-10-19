// ─────────────────────────────────────────────────────────────────────────────
//  ALL PRICES LIVE HERE. Change a number, rebuild, and both the price tables
//  and the simulator on /precario update together.
//
//  Values in euros. A string instead of a number shows as-is ("Sob consulta").
//  recorrenteN = monthly fee for N hours per week (same for every modalidade).
//  pack6/pack12 = price of the whole pack.  avulso = one session.
// ─────────────────────────────────────────────────────────────────────────────
const C = "Sob consulta";

window.PRICES = {
  basico: {
    individual: { avulso: 25, recorrente1: 90, recorrente2: 170, recorrente3: 250, pack6: 140, pack12: 265 },
    grupo2: { avulso: 20, recorrente1: 90, recorrente2: 170, recorrente3: 250, pack6: 110, pack12: 205 },
    grupo3: { avulso: 18, recorrente1: 90, recorrente2: 170, recorrente3: 250, pack6: 95, pack12: 180 },
  },
  secundario: {
    individual: { avulso: 30, recorrente1: 110, recorrente2: 200, recorrente3: 290, pack6: 170, pack12: 325 },
    grupo2: { avulso: 23, recorrente1: 110, recorrente2: 200, recorrente3: 290, pack6: 130, pack12: 250 },
    grupo3: { avulso: 20, recorrente1: 110, recorrente2: 200, recorrente3: 290, pack6: 110, pack12: 205 },
  },
  superior: {
    individual: { avulso: C, recorrente1: C, recorrente2: C, recorrente3: C, pack6: C, pack12: C },
    grupo2: { avulso: C, recorrente1: C, recorrente2: C, recorrente3: C, pack6: C, pack12: C },
    grupo3: { avulso: C, recorrente1: C, recorrente2: C, recorrente3: C, pack6: C, pack12: C },
  },
};

// "Ano letivo" = 10 months with this discount.
window.ANNUAL_MONTHS = 10;
window.ANNUAL_DISCOUNT = 0.1;

// "Notas explicativas" under the price tables, per nível.
window.PRICE_NOTES = {
  basico: [
    "Cada sessão tem duração de 60 minutos",
    "Aluno Recorrente: pagamento mensal para sessões regulares",
    "Pack Individual: explicação personalizada 1:1 com desconto por volume",
    "Pack Grupo 2: máximo 2 alunos por sessão, preço por aluno",
    "Pack Grupo 3+: 3 ou mais alunos por sessão, maior economia",
    "Material de apoio incluído em todos os packs",
    "Diagnóstico inicial para todos os novos alunos",
  ],
  secundario: [
    "Cada sessão tem duração de 60 minutos",
    "Aluno Recorrente: pagamento mensal",
    "Pack Individual: preparação intensiva e personalizada",
    "Pack Grupo 2: máximo 2 alunos, preparação para exames",
    "Pack Grupo 3+: economia máxima mantendo qualidade",
    "Material de apoio e simulacros incluídos",
    "Acompanhamento na preparação para o ensino superior",
  ],
  superior: [
    "Preços definidos após avaliação das necessidades específicas",
    "Aluno Recorrente: acompanhamento contínuo especializado",
    "Acompanhamento personalizado por especialistas da área",
    "Modalidades: Individual, Grupo 2 ou Grupo 3+ disponíveis",
    "Flexibilidade total de horários e metodologias",
    "Primeira consulta de avaliação para definir plano personalizado",
    "Suporte especializado conforme o curso e universidade",
  ],
};
