import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  status_manual?: string | null;
  status_manual_mes?: number | null;
  status_manual_ano?: number | null;
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

      setFontes((data || []) as FonteRenda[]);
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

    console.log(`🔍 Verificando recebimento da fonte: ${fonte.tipo} - ${fonte.descricao} - R$ ${fonte.valor}`);

    try {
      // Mapeamento mais inteligente para fontes de renda
      const categoriasRendaRelacionadas: { [key: string]: string[] } = {
        // Rendas principais - incluindo formas comuns de recebimento
        'Salário': ['Salário', 'Pagamento', 'Folha', 'Holerite', 'Pix recebido', 'Depósito recebido'], // Salário pode vir via Pix
        'Freelancer': ['Pagamento de cliente', 'Freelancer'], // Freelancer é mais específico
        'Autônomo': ['Pagamento de cliente', 'Autônomo', 'Pix recebido'],
        'Comissões': ['Comissão', 'Pagamento de cliente'],
        'Pensão': ['Benefício', 'Pensão', 'INSS', 'Auxílio'],
        'Benefícios': ['Benefício', 'Pensão', 'INSS', 'Auxílio'],
        'Aluguel Recebido': ['Aluguel', 'Pix recebido'],
        'Renda Extra': ['Renda Extra', 'Pix recebido'],
        'Investimentos': ['Rendimento', 'Dividendo', 'Juros']
      };

      // Determinar categorias para buscar - mais conservador
      let categoriasParaBuscar = categoriasRendaRelacionadas[fonte.tipo] || [];
      
      // Se não encontrou por tipo, não usar fallback genérico
      if (categoriasParaBuscar.length === 0) {
        console.log(`⚠️ Tipo "${fonte.tipo}" não mapeado - retornando null`);
        return null;
      }
      
      console.log(`📋 Categorias para buscar:`, categoriasParaBuscar);
      
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
      console.log(`📊 Registros encontrados:`, data?.length || 0, data);

      // Estratégias de matching em ordem de prioridade - BALANCEADAS:
      
      // 1. Match exato por valor E categoria específica (prioridade máxima)
      let registroEncontrado = data?.find(registro => 
        Math.abs(registro.valor) === fonte.valor && 
        categoriasParaBuscar.includes(registro.categoria)
      );
      console.log(`🎯 Match exato valor + categoria (${fonte.valor}):`, registroEncontrado ? `Encontrado: R$ ${registroEncontrado.valor} - ${registroEncontrado.categoria}` : 'Não encontrado');
      
      if (!registroEncontrado) {
        // 2. Match por valor próximo (±5%) EM categorias relacionadas
        const tolerancia = 0.05;
        const valorMinimo = fonte.valor * (1 - tolerancia);
        const valorMaximo = fonte.valor * (1 + tolerancia);
        
        registroEncontrado = data?.find(registro => {
          const valorRegistro = Math.abs(registro.valor);
          return valorRegistro >= valorMinimo && valorRegistro <= valorMaximo;
        });
        console.log(`📊 Match ±5% (${valorMinimo.toFixed(2)}-${valorMaximo.toFixed(2)}):`, registroEncontrado ? `Encontrado: R$ ${registroEncontrado.valor} - ${registroEncontrado.categoria}` : 'Não encontrado');
      }
      
      if (!registroEncontrado) {
        // 3. Match por descrição/empresa E valor próximo (±10%)
        if (fonte.descricao && fonte.descricao.length > 3) {
          const palavrasDescricao = fonte.descricao.toLowerCase()
            .split(' ')
            .filter(p => p.length > 2) // Palavras com mais de 2 caracteres
            .filter(p => !['para', 'com', 'das', 'dos', 'por', 'ser', 'tem', 'prestados'].includes(p)); // Remove stop words
          
          console.log(`🔍 Palavras da descrição para busca:`, palavrasDescricao);
          
          const tolerancia = 0.10;
          const valorMinimo = fonte.valor * (1 - tolerancia);
          const valorMaximo = fonte.valor * (1 + tolerancia);
          
          registroEncontrado = data?.find(registro => {
            const valorRegistro = Math.abs(registro.valor);
            const valorOk = valorRegistro >= valorMinimo && valorRegistro <= valorMaximo;
            
            if (!valorOk) return false;
            
            const textoRegistro = `${registro.titulo || ''} ${registro.estabelecimento || ''} ${registro.observacao || ''}`.toLowerCase();
            const temDescricao = palavrasDescricao.some(palavra => textoRegistro.includes(palavra));
            
            console.log(`📝 Verificando registro: ${registro.categoria} - R$ ${registro.valor}`);
            console.log(`   Texto: "${textoRegistro}"`);
            console.log(`   Valor OK: ${valorOk}, Tem descrição: ${temDescricao}`);
            
            return temDescricao;
          });
          
          console.log(`🔍 Match por descrição + valor ±10%:`, registroEncontrado ? `Encontrado: ${registroEncontrado.titulo || registroEncontrado.categoria} - R$ ${registroEncontrado.valor}` : 'Não encontrado');
        }
      }
      
      if (!registroEncontrado) {
        // 4. SOMENTE para tipos específicos: Match mais flexível por valor (±15%)
        if (['Salário', 'Freelancer'].includes(fonte.tipo)) {
          const tolerancia = 0.15;
          const valorMinimo = fonte.valor * (1 - tolerancia);
          const valorMaximo = fonte.valor * (1 + tolerancia);
          
          registroEncontrado = data?.find(registro => {
            const valorRegistro = Math.abs(registro.valor);
            return valorRegistro >= valorMinimo && valorRegistro <= valorMaximo;
          });
          
          console.log(`🎲 Match flexível ±15% para ${fonte.tipo} (${valorMinimo.toFixed(2)}-${valorMaximo.toFixed(2)}):`, registroEncontrado ? `Encontrado: R$ ${registroEncontrado.valor} - ${registroEncontrado.categoria}` : 'Não encontrado');
        }
      }

      console.log(`✅ Resultado final:`, registroEncontrado ? `✅ ENCONTRADO: ${registroEncontrado.categoria} - R$ ${registroEncontrado.valor}` : '❌ NÃO ENCONTRADO');
      return registroEncontrado || null;
    } catch (error) {
      console.error('Erro ao verificar recebimento da renda:', error);
      return null;
    }
  };

  const updateStatusManual = async (id: string, status: 'recebido' | 'pendente' | null, mes?: number, ano?: number): Promise<boolean> => {
    try {
      const hoje = new Date();
      const mesAtual = mes || hoje.getMonth() + 1;
      const anoAtual = ano || hoje.getFullYear();

      const { error } = await supabase
        .from('fontes_renda')
        .update({
          status_manual: status,
          status_manual_mes: status ? mesAtual : null,
          status_manual_ano: status ? anoAtual : null
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso!",
        description: `Status atualizado para ${status === 'recebido' ? 'Recebido' : 'Pendente'}!`
      });

      await fetchFontes();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status manual:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getFontesRendaComStatus = useCallback(async (mes?: number, ano?: number) => {
    if (!fontes.length) return [];

    const hoje = new Date();
    const mesAtual = mes || hoje.getMonth() + 1;
    const anoAtual = ano || hoje.getFullYear();

    const fontesComStatus = await Promise.all(
      fontes.map(async (fonte) => {
        if (!fonte.ativa) return { 
          ...fonte, 
          recebido: false, 
          registroDetectado: null, 
          statusTipo: 'inativo' as const
        };
        
        // Verificar se há status manual para o mês atual
        const temStatusManual = fonte.status_manual && 
          fonte.status_manual_mes === mesAtual && 
          fonte.status_manual_ano === anoAtual;

        if (temStatusManual) {
          return {
            ...fonte,
            recebido: fonte.status_manual === 'recebido',
            registroDetectado: null,
            statusTipo: 'manual' as const
          };
        }

        // Caso contrário, usar detecção automática
        const registroDetectado = await checkRecebimentoMesAtual(fonte);
        return {
          ...fonte,
          recebido: !!registroDetectado,
          registroDetectado,
          statusTipo: 'automatico' as const
        };
      })
    );

    return fontesComStatus;
  }, [fontes, user]);

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
    getFontesRendaComStatus,
    updateStatusManual
  };
};