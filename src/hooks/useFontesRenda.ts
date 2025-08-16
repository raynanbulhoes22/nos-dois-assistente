import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { startOfMonth, endOfMonth } from "date-fns";

export interface FonteRenda {
  id: string;
  user_id: string;
  tipo: string;
  valor: number;
  descricao?: string;
  ativa: boolean;
  created_at: string;
}

export const useFontesRenda = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fontes, setFontes] = useState<FonteRenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFontes = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('fontes_renda')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFontes(data || []);
    } catch (error) {
      console.error('Erro ao buscar fontes de renda:', error);
      setError('Erro ao carregar fontes de renda');
    } finally {
      setIsLoading(false);
    }
  };

  const addFonte = async (fonte: Omit<FonteRenda, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('fontes_renda')
        .insert({
          ...fonte,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "✅ Sucesso!",
        description: "Fonte de renda adicionada com sucesso!"
      });

      await fetchFontes();
      return true;
    } catch (error) {
      console.error('Erro ao adicionar fonte de renda:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível adicionar a fonte de renda.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateFonte = async (id: string, updates: Partial<FonteRenda>) => {
    try {
      const { error } = await supabase
        .from('fontes_renda')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso!",
        description: "Fonte de renda atualizada com sucesso!"
      });

      await fetchFontes();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar fonte de renda:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar a fonte de renda.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteFonte = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fontes_renda')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso!",
        description: "Fonte de renda removida com sucesso!"
      });

      await fetchFontes();
      return true;
    } catch (error) {
      console.error('Erro ao remover fonte de renda:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível remover a fonte de renda.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getTotalRendaAtiva = () => {
    return fontes
      .filter(fonte => fonte.ativa)
      .reduce((total, fonte) => total + fonte.valor, 0);
  };

  const checkRecebimentoMesAtual = async (fonte: FonteRenda) => {
    if (!user) return null;

    try {
      // Mapeamento inteligente para fontes de renda
      const categoriasRendaRelacionadas: { [key: string]: string[] } = {
        // Rendas principais
        'Salário': ['Salário', 'Pagamento', 'Folha', 'Holerite', 'Pix recebido', 'Depósito recebido'],
        'Freelancer': ['Pagamento de cliente', 'Pix recebido', 'Venda realizada', 'Depósito recebido', 'Freelancer'],
        'Autônomo': ['Pagamento de cliente', 'Pix recebido', 'Venda realizada', 'Depósito recebido', 'Autônomo'],
        'Comissões': ['Comissão', 'Pagamento de cliente', 'Venda realizada', 'Pix recebido'],
        'Pensão': ['Benefício', 'Pensão', 'INSS', 'Auxílio', 'Depósito recebido'],
        'Benefícios': ['Benefício', 'Pensão', 'INSS', 'Auxílio', 'Depósito recebido'],
        'Aluguel Recebido': ['Aluguel', 'Depósito recebido', 'Pix recebido'],
        'Renda Extra': ['Pix recebido', 'Venda realizada', 'Reembolso', 'Depósito recebido'],
        'Investimentos': ['Rendimento', 'Dividendo', 'Juros', 'Depósito recebido']
      };

      // Palavras-chave para busca por tipo ou descrição da fonte
      const palavrasChaveRenda: { [key: string]: string[] } = {
        'salário': ['Salário', 'Pix recebido', 'Depósito recebido', 'Pagamento'],
        'freelancer': ['Pagamento de cliente', 'Pix recebido', 'Freelancer'],
        'autônomo': ['Pagamento de cliente', 'Pix recebido', 'Autônomo'],
        'comissão': ['Comissão', 'Pagamento de cliente', 'Pix recebido'],
        'pensão': ['Pensão', 'Benefício', 'Depósito recebido'],
        'benefício': ['Benefício', 'INSS', 'Depósito recebido'],
        'aluguel': ['Aluguel', 'Depósito recebido', 'Pix recebido'],
        'investimento': ['Rendimento', 'Dividendo', 'Depósito recebido'],
        'renda': ['Pix recebido', 'Venda realizada', 'Depósito recebido']
      };

      // Determinar categorias para buscar
      let categoriasParaBuscar = categoriasRendaRelacionadas[fonte.tipo] || [];
      
      // Se não encontrou por tipo, tentar por palavras-chave no tipo ou descrição
      if (categoriasParaBuscar.length === 0) {
        const textoFonte = `${fonte.tipo} ${fonte.descricao || ''}`.toLowerCase();
        for (const [palavra, categorias] of Object.entries(palavrasChaveRenda)) {
          if (textoFonte.includes(palavra)) {
            categoriasParaBuscar = categorias;
            break;
          }
        }
      }
      
      // Fallback: usar categorias gerais de entrada
      if (categoriasParaBuscar.length === 0) {
        categoriasParaBuscar = ['Pix recebido', 'Depósito recebido', 'Pagamento de cliente', 'Salário'];
      }
      
      const hoje = new Date();
      const inicioMes = startOfMonth(hoje);
      const fimMes = endOfMonth(hoje);
      
      const { data, error } = await supabase
        .from('registros_financeiros')
        .select('*')
        .eq('user_id', user.id)
        .in('categoria', categoriasParaBuscar)
        .gte('data', inicioMes.toISOString().split('T')[0])
        .lte('data', fimMes.toISOString().split('T')[0])
        .gt('valor', 0) // Apenas entradas positivas
        .order('data', { ascending: false });

      if (error) throw error;

      // Estratégias de matching em ordem de prioridade:
      
      // 1. Match exato por valor (prioridade máxima)
      let registroEncontrado = data?.find(registro => Math.abs(registro.valor) === fonte.valor);
      
      if (!registroEncontrado) {
        // 2. Match por valor com tolerância de ±5% (para valores próximos)
        const tolerancia = 0.05;
        const valorMinimo = fonte.valor * (1 - tolerancia);
        const valorMaximo = fonte.valor * (1 + tolerancia);
        
        registroEncontrado = data?.find(registro => {
          const valorRegistro = Math.abs(registro.valor);
          return valorRegistro >= valorMinimo && valorRegistro <= valorMaximo;
        });
      }
      
      if (!registroEncontrado) {
        // 3. Match por descrição/empresa (busca por palavras da descrição da fonte)
        if (fonte.descricao) {
          const palavrasDescricao = fonte.descricao.toLowerCase().split(' ').filter(p => p.length > 2);
          registroEncontrado = data?.find(registro => {
            const textoRegistro = `${registro.titulo || ''} ${registro.estabelecimento || ''} ${registro.categoria || ''}`.toLowerCase();
            return palavrasDescricao.some(palavra => textoRegistro.includes(palavra));
          });
        }
      }
      
      if (!registroEncontrado) {
        // 4. Match flexível por valor (tolerância de ±15% para casos especiais)
        const toleranciaFlexivel = 0.15;
        const valorMinimoFlexivel = fonte.valor * (1 - toleranciaFlexivel);
        const valorMaximoFlexivel = fonte.valor * (1 + toleranciaFlexivel);
        
        registroEncontrado = data?.find(registro => {
          const valorRegistro = Math.abs(registro.valor);
          return valorRegistro >= valorMinimoFlexivel && valorRegistro <= valorMaximoFlexivel;
        });
      }

      return registroEncontrado || null;
    } catch (error) {
      console.error('Erro ao verificar recebimento da renda:', error);
      return null;
    }
  };

  const getFontesRendaComStatus = async () => {
    if (!fontes.length) return [];

    const fontesComStatus = await Promise.all(
      fontes.map(async (fonte) => {
        if (!fonte.ativa) return { ...fonte, recebido: false, registroDetectado: null };
        
        const registroDetectado = await checkRecebimentoMesAtual(fonte);
        return {
          ...fonte,
          recebido: !!registroDetectado,
          registroDetectado
        };
      })
    );

    return fontesComStatus;
  };

  useEffect(() => {
    fetchFontes();
  }, [user]);

  return {
    fontes,
    isLoading,
    error,
    addFonte,
    updateFonte,
    deleteFonte,
    refetch: fetchFontes,
    getTotalRendaAtiva,
    checkRecebimentoMesAtual,
    getFontesRendaComStatus
  };
};