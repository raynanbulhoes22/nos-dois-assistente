/**
 * Dados dos estados brasileiros com seus respectivos DDDs
 */

export interface BrazilianState {
  code: string // Código ISO do estado (AC, AL, etc.)
  name: string // Nome completo do estado
  ddds: string[] // Lista de DDDs do estado
}

export const brazilianStates: BrazilianState[] = [
  { code: "AC", name: "Acre", ddds: ["68"] },
  { code: "AL", name: "Alagoas", ddds: ["82"] },
  { code: "AP", name: "Amapá", ddds: ["96"] },
  { code: "AM", name: "Amazonas", ddds: ["92", "97"] },
  { code: "BA", name: "Bahia", ddds: ["71", "73", "74", "75", "77"] },
  { code: "CE", name: "Ceará", ddds: ["85", "88"] },
  { code: "DF", name: "Distrito Federal", ddds: ["61"] },
  { code: "ES", name: "Espírito Santo", ddds: ["27", "28"] },
  { code: "GO", name: "Goiás", ddds: ["62", "64"] },
  { code: "MA", name: "Maranhão", ddds: ["98", "99"] },
  { code: "MT", name: "Mato Grosso", ddds: ["65", "66"] },
  { code: "MS", name: "Mato Grosso do Sul", ddds: ["67"] },
  { code: "MG", name: "Minas Gerais", ddds: ["31", "32", "33", "34", "35", "37", "38"] },
  { code: "PA", name: "Pará", ddds: ["91", "93", "94"] },
  { code: "PB", name: "Paraíba", ddds: ["83"] },
  { code: "PR", name: "Paraná", ddds: ["41", "42", "43", "44", "45", "46"] },
  { code: "PE", name: "Pernambuco", ddds: ["81", "87"] },
  { code: "PI", name: "Piauí", ddds: ["86", "89"] },
  { code: "RJ", name: "Rio de Janeiro", ddds: ["21", "22", "24"] },
  { code: "RN", name: "Rio Grande do Norte", ddds: ["84"] },
  { code: "RS", name: "Rio Grande do Sul", ddds: ["51", "53", "54", "55"] },
  { code: "RO", name: "Rondônia", ddds: ["69"] },
  { code: "RR", name: "Roraima", ddds: ["95"] },
  { code: "SC", name: "Santa Catarina", ddds: ["47", "48", "49"] },
  { code: "SP", name: "São Paulo", ddds: ["11", "12", "13", "14", "15", "16", "17", "18", "19"] },
  { code: "SE", name: "Sergipe", ddds: ["79"] },
  { code: "TO", name: "Tocantins", ddds: ["63"] }
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
  displayName: string; // "São Paulo (11)" ou "Bahia (71)"
}

export const getDDDOptions = (): DDDOption[] => {
  const options: DDDOption[] = [];
  
  for (const state of brazilianStates) {
    for (const ddd of state.ddds) {
      options.push({
        state,
        ddd,
        displayName: `${state.name} (${ddd})`
      });
    }
  }
  
  // Ordenar por DDD
  return options.sort((a, b) => a.ddd.localeCompare(b.ddd));
};