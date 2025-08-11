// Função para gerar uma cor consistente baseada no hash da string
export const getCategoryColor = (category: string): string => {
  if (!category) return 'bg-muted text-muted-foreground';
  
  // Paleta expandida com 60+ cores únicas para as categorias
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
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800',
    // Cores adicionais para garantir 60+ variações únicas
    'bg-blue-200 text-blue-800 border-blue-300 dark:bg-blue-800/20 dark:text-blue-200 dark:border-blue-700',
    'bg-green-200 text-green-800 border-green-300 dark:bg-green-800/20 dark:text-green-200 dark:border-green-700',
    'bg-purple-200 text-purple-800 border-purple-300 dark:bg-purple-800/20 dark:text-purple-200 dark:border-purple-700',
    'bg-orange-200 text-orange-800 border-orange-300 dark:bg-orange-800/20 dark:text-orange-200 dark:border-orange-700',
    'bg-pink-200 text-pink-800 border-pink-300 dark:bg-pink-800/20 dark:text-pink-200 dark:border-pink-700',
    'bg-cyan-200 text-cyan-800 border-cyan-300 dark:bg-cyan-800/20 dark:text-cyan-200 dark:border-cyan-700',
    'bg-indigo-200 text-indigo-800 border-indigo-300 dark:bg-indigo-800/20 dark:text-indigo-200 dark:border-indigo-700',
    'bg-emerald-200 text-emerald-800 border-emerald-300 dark:bg-emerald-800/20 dark:text-emerald-200 dark:border-emerald-700',
    'bg-rose-200 text-rose-800 border-rose-300 dark:bg-rose-800/20 dark:text-rose-200 dark:border-rose-700',
    'bg-amber-200 text-amber-800 border-amber-300 dark:bg-amber-800/20 dark:text-amber-200 dark:border-amber-700',
    'bg-teal-200 text-teal-800 border-teal-300 dark:bg-teal-800/20 dark:text-teal-200 dark:border-teal-700',
    'bg-violet-200 text-violet-800 border-violet-300 dark:bg-violet-800/20 dark:text-violet-200 dark:border-violet-700',
    'bg-lime-200 text-lime-800 border-lime-300 dark:bg-lime-800/20 dark:text-lime-200 dark:border-lime-700',
    'bg-red-200 text-red-800 border-red-300 dark:bg-red-800/20 dark:text-red-200 dark:border-red-700',
    'bg-yellow-200 text-yellow-800 border-yellow-300 dark:bg-yellow-800/20 dark:text-yellow-200 dark:border-yellow-700',
    'bg-sky-200 text-sky-800 border-sky-300 dark:bg-sky-800/20 dark:text-sky-200 dark:border-sky-700',
    'bg-fuchsia-200 text-fuchsia-800 border-fuchsia-300 dark:bg-fuchsia-800/20 dark:text-fuchsia-200 dark:border-fuchsia-700',
    'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800/20 dark:text-slate-200 dark:border-slate-700',
    // Tons mais escuros para ainda mais variedade
    'bg-blue-300 text-blue-900 border-blue-400 dark:bg-blue-700/20 dark:text-blue-100 dark:border-blue-600',
    'bg-green-300 text-green-900 border-green-400 dark:bg-green-700/20 dark:text-green-100 dark:border-green-600',
    'bg-purple-300 text-purple-900 border-purple-400 dark:bg-purple-700/20 dark:text-purple-100 dark:border-purple-600',
    'bg-orange-300 text-orange-900 border-orange-400 dark:bg-orange-700/20 dark:text-orange-100 dark:border-orange-600',
    'bg-pink-300 text-pink-900 border-pink-400 dark:bg-pink-700/20 dark:text-pink-100 dark:border-pink-600',
    'bg-cyan-300 text-cyan-900 border-cyan-400 dark:bg-cyan-700/20 dark:text-cyan-100 dark:border-cyan-600',
    'bg-indigo-300 text-indigo-900 border-indigo-400 dark:bg-indigo-700/20 dark:text-indigo-100 dark:border-indigo-600',
    'bg-emerald-300 text-emerald-900 border-emerald-400 dark:bg-emerald-700/20 dark:text-emerald-100 dark:border-emerald-600',
    'bg-rose-300 text-rose-900 border-rose-400 dark:bg-rose-700/20 dark:text-rose-100 dark:border-rose-600',
    'bg-amber-300 text-amber-900 border-amber-400 dark:bg-amber-700/20 dark:text-amber-100 dark:border-amber-600',
    'bg-teal-300 text-teal-900 border-teal-400 dark:bg-teal-700/20 dark:text-teal-100 dark:border-teal-600',
    'bg-violet-300 text-violet-900 border-violet-400 dark:bg-violet-700/20 dark:text-violet-100 dark:border-violet-600',
    'bg-lime-300 text-lime-900 border-lime-400 dark:bg-lime-700/20 dark:text-lime-100 dark:border-lime-600',
    'bg-red-300 text-red-900 border-red-400 dark:bg-red-700/20 dark:text-red-100 dark:border-red-600',
    'bg-yellow-300 text-yellow-900 border-yellow-400 dark:bg-yellow-700/20 dark:text-yellow-100 dark:border-yellow-600',
    'bg-sky-300 text-sky-900 border-sky-400 dark:bg-sky-700/20 dark:text-sky-100 dark:border-sky-600',
    'bg-fuchsia-300 text-fuchsia-900 border-fuchsia-400 dark:bg-fuchsia-700/20 dark:text-fuchsia-100 dark:border-fuchsia-600',
    'bg-slate-300 text-slate-900 border-slate-400 dark:bg-slate-700/20 dark:text-slate-100 dark:border-slate-600',
    // Tons ainda mais variados
    'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-300 dark:border-zinc-800',
    'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-900/20 dark:text-neutral-300 dark:border-neutral-800',
    'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-900/20 dark:text-stone-300 dark:border-stone-800',
    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800',
    'bg-zinc-200 text-zinc-800 border-zinc-300 dark:bg-zinc-800/20 dark:text-zinc-200 dark:border-zinc-700',
    'bg-neutral-200 text-neutral-800 border-neutral-300 dark:bg-neutral-800/20 dark:text-neutral-200 dark:border-neutral-700',
    'bg-stone-200 text-stone-800 border-stone-300 dark:bg-stone-800/20 dark:text-stone-200 dark:border-stone-700',
    'bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-800/20 dark:text-gray-200 dark:border-gray-700'
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

// Função principal que sempre usa cores únicas por categoria (ignora grupos)
export const getCategoryColorClass = (category: string): string => {
  if (!category) return 'bg-muted text-muted-foreground border-border';
  
  // Sempre usa cores individuais para cada categoria
  return getCategoryColor(category);
};