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
        'Salário': ['Salário', 'Pagamento', 'Folha', 'Holerite'],
        'Freelancer': ['Pagamento de cliente', 'Pix recebido', 'Venda realizada', 'Depósito recebido'],
        'Autônomo': ['Pagamento de cliente', 'Pix recebido', 'Venda realizada', 'Depósito recebido'],
        'Comissões': ['Comissão', 'Pagamento de cliente', 'Venda realizada'],
        'Pensão': ['Benefício', 'Pensão', 'INSS', 'Auxílio'],
        'Benefícios': ['Benefício', 'Pensão', 'INSS', 'Auxílio'],
        'Aluguel Recebido': ['Aluguel', 'Depósito recebido', 'Pix recebido'],
        'Renda Extra': ['Pix recebido', 'Venda realizada', 'Reembolso'],
        'Investimentos': ['Rendimento', 'Dividendo', 'Juros', 'Depósito recebido']
      };

      // Palavras-chave para busca por tipo ou descrição da fonte
      const palavrasChaveRenda: { [key: string]: string[] } = {
        'salário': ['Salário'],
        'freelancer': ['Pagamento de cliente', 'Pix recebido'],
        'autônomo': ['Pagamento de cliente', 'Pix recebido'],
        'comissão': ['Comissão', 'Pagamento de cliente'],
        'pensão': ['Pensão', 'Benefício'],
        'benefício': ['Benefício', 'INSS'],
        'aluguel': ['Aluguel', 'Depósito recebido'],
        'investimento': ['Rendimento', 'Dividendo'],
        'renda': ['Pix recebido', 'Venda realizada']
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
      
      // Fallback: usar o tipo original se não encontrou nada
      if (categoriasParaBuscar.length === 0) {
        categoriasParaBuscar = [fonte.tipo];
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

      // Buscar o registro mais próximo em valor (tolerância de ±10% para rendas)
      const tolerancia = 0.10;
      const valorMinimo = fonte.valor * (1 - tolerancia);
      const valorMaximo = fonte.valor * (1 + tolerancia);
      
      const registroEncontrado = data?.find(registro => {
        const valorRegistro = Math.abs(registro.valor);
        return valorRegistro >= valorMinimo && valorRegistro <= valorMaximo;
      });

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