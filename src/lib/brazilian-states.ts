/**
 * Dados dos estados brasileiros com seus respectivos DDDs
 */

export interface BrazilianState {
  code: string // Código ISO do estado (AC, AL, etc.)
  name: string // Nome completo do estado
  ddds: string[] // Lista de DDDs do estado
  emoji: string // Emoji representativo do estado
}

export const brazilianStates: BrazilianState[] = [
  { code: "AC", name: "Acre", ddds: ["68"], emoji: "🌲" },
  { code: "AL", name: "Alagoas", ddds: ["82"], emoji: "🏖️" },
  { code: "AP", name: "Amapá", ddds: ["96"], emoji: "🌿" },
  { code: "AM", name: "Amazonas", ddds: ["92", "97"], emoji: "🐆" },
  { code: "BA", name: "Bahia", ddds: ["71", "73", "74", "75", "77"], emoji: "⛵" },
  { code: "CE", name: "Ceará", ddds: ["85", "88"], emoji: "🏄" },
  { code: "DF", name: "Distrito Federal", ddds: ["61"], emoji: "🏛️" },
  { code: "ES", name: "Espírito Santo", ddds: ["27", "28"], emoji: "⛰️" },
  { code: "GO", name: "Goiás", ddds: ["62", "64"], emoji: "🌾" },
  { code: "MA", name: "Maranhão", ddds: ["98", "99"], emoji: "🐂" },
  { code: "MT", name: "Mato Grosso", ddds: ["65", "66"], emoji: "🐊" },
  { code: "MS", name: "Mato Grosso do Sul", ddds: ["67"], emoji: "🦜" },
  { code: "MG", name: "Minas Gerais", ddds: ["31", "32", "33", "34", "35", "37", "38"], emoji: "⛏️" },
  { code: "PA", name: "Pará", ddds: ["91", "93", "94"], emoji: "🦌" },
  { code: "PB", name: "Paraíba", ddds: ["83"], emoji: "🌴" },
  { code: "PR", name: "Paraná", ddds: ["41", "42", "43", "44", "45", "46"], emoji: "🌲" },
  { code: "PE", name: "Pernambuco", ddds: ["81", "87"], emoji: "🐠" },
  { code: "PI", name: "Piauí", ddds: ["86", "89"], emoji: "🌵" },
  { code: "RJ", name: "Rio de Janeiro", ddds: ["21", "22", "24"], emoji: "🏖️" },
  { code: "RN", name: "Rio Grande do Norte", ddds: ["84"], emoji: "🧂" },
  { code: "RS", name: "Rio Grande do Sul", ddds: ["51", "53", "54", "55"], emoji: "🐎" },
  { code: "RO", name: "Rondônia", ddds: ["69"], emoji: "🌳" },
  { code: "RR", name: "Roraima", ddds: ["95"], emoji: "🏔️" },
  { code: "SC", name: "Santa Catarina", ddds: ["47", "48", "49"], emoji: "🏝️" },
  { code: "SP", name: "São Paulo", ddds: ["11", "12", "13", "14", "15", "16", "17", "18", "19"], emoji: "🏙️" },
  { code: "SE", name: "Sergipe", ddds: ["79"], emoji: "🥥" },
  { code: "TO", name: "Tocantins", ddds: ["63"], emoji: "🌊" }
];

/**
 * Função para encontrar o estado pelo DDD
 */
export const findStateByDDD = (ddd: string): BrazilianState | undefined => {
  return brazilianStates.find(state => state.ddds.includes(ddd));
};

/**
 * Função para obter todos os DDDs como lista plana
 */
export const getAllDDDs = (): string[] => {
  return brazilianStates.flatMap(state => state.ddds).sort();
};

/**
 * Função para expandir estados com múltiplos DDDs em opções individuais
 */
export interface DDDOption {
  state: BrazilianState;
  ddd: string;
  displayName: string; // "SP (11)" ou "BA (71)"
}

export const getDDDOptions = (): DDDOption[] => {
  const options: DDDOption[] = [];
  
  for (const state of brazilianStates) {
    for (const ddd of state.ddds) {
      options.push({
        state,
        ddd,
        displayName: `${state.code} (${ddd})`
      });
    }
  }
  
  // Ordenar por DDD
  return options.sort((a, b) => a.ddd.localeCompare(b.ddd));
};