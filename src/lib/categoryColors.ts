// Função para gerar uma cor consistente baseada no hash da string
export const getCategoryColor = (category: string): string => {
  if (!category) return 'bg-muted text-muted-foreground';
  
  // Lista de cores pré-definidas com boa legibilidade
  const colors = [
    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800',
    'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800',
    'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800',
    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
    'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800',
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800',
    'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800',
    'bg-lime-100 text-lime-700 border-lime-200 dark:bg-lime-900/20 dark:text-lime-300 dark:border-lime-800',
    'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
    'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800',
    'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/20 dark:text-fuchsia-300 dark:border-fuchsia-800',
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800'
  ];

  // Gerar hash simples da categoria
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    const char = category.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converter para 32-bit integer
  }

  // Garantir que o hash seja positivo e selecionar cor
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Cores específicas para grupos de categorias para melhor organização visual
export const getCategoryGroupColor = (categoryGroup: string): string => {
  const groupColors: Record<string, string> = {
    'Essenciais': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    'Trabalho / Profissional': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    'Consumo': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    'Lazer e Pessoal': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    'Financeiras': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    'Entradas': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
  };

  return groupColors[categoryGroup] || getCategoryColor(categoryGroup);
};

// Função para determinar se uma categoria pertence a qual grupo
export const getCategoryGroup = (category: string): string | null => {
  const categoryGroups = {
    'Essenciais': [
      'Aluguel', 'Água', 'Energia', 'Internet', 'Transporte', 'Combustível',
      'Alimentação', 'Supermercado', 'Farmácia', 'Saúde', 'Escola / Faculdade'
    ],
    'Trabalho / Profissional': [
      'Ferramentas', 'Software', 'Internet de trabalho', 'Freelancers / Terceiros',
      'Transporte de trabalho', 'Escritório', 'Impostos / Contador'
    ],
    'Consumo': [
      'Roupas', 'Calçados', 'Eletrodomésticos', 'Eletrônicos',
      'Compras online', 'Lojas em geral'
    ],
    'Lazer e Pessoal': [
      'Restaurante', 'Bar', 'Cinema / Streaming', 'Viagens',
      'Presentes', 'Academia', 'Estética / Salão', 'Petshop'
    ],
    'Financeiras': [
      'Transferência (PIX, TED, DOC)', 'Pagamento de boletos', 'Cartão de crédito',
      'Empréstimos', 'Investimentos', 'Saque em dinheiro', 'Depósito'
    ],
    'Entradas': [
      'Salário', 'Pagamento de cliente', 'Reembolso', 'Pix recebido',
      'Depósito recebido', 'Venda realizada'
    ]
  };

  for (const [group, categories] of Object.entries(categoryGroups)) {
    if (categories.includes(category)) {
      return group;
    }
  }

  return null;
};

// Função principal que usa grupos quando possível, senão usa hash individual
export const getCategoryColorClass = (category: string): string => {
  if (!category) return 'bg-muted text-muted-foreground border-border';
  
  const group = getCategoryGroup(category);
  if (group) {
    return getCategoryGroupColor(group);
  }
  
  return getCategoryColor(category);
};