import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { useCartoes } from '@/hooks/useCartoes';
import { detectarDadosCartao, encontrarCartaoParaTransacao } from '@/lib/cartao-utils';
import { useToast } from '@/hooks/use-toast';

interface CartaoDetectado {
  ultimosDigitos: string;
  apelido: string;
  transacoesOrfas: number;
  valorTotal: number;
}

/**
 * Hook especializado para detectar cartões órfãos e sugerir criação automática
 */
export const useCartaoDetection = () => {
  const { user } = useAuth();
  const { movimentacoes } = useMovimentacoes();
  const { cartoes, criarCartaoAutomatico, refetch } = useCartoes();
  const { toast } = useToast();
  const [cartoesDetectados, setCartoesDetectados] = useState<CartaoDetectado[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analisarTransacoesOrfas = async () => {
    if (!user || !movimentacoes.length) return;

    setIsAnalyzing(true);

    try {
      const cartoesOrfaos = new Map<string, CartaoDetectado>();

      // Analisar transações de saída sem cartão correspondente
      const saidasSemCartao = movimentacoes.filter(mov => {
        if (mov.isEntrada) return false;
        
        // Verificar se já tem cartão correspondente
        const cartaoExistente = encontrarCartaoParaTransacao(mov, cartoes);
        if (cartaoExistente) return false;

        // Verificar se tem dados de cartão detectáveis
        const dadosDetectados = detectarDadosCartao(mov);
        return dadosDetectados !== null;
      });

      // Agrupar por últimos dígitos
      saidasSemCartao.forEach(transacao => {
        const dados = detectarDadosCartao(transacao);
        if (!dados) return;

        const key = dados.ultimosDigitos;
        const existing = cartoesOrfaos.get(key);

        if (existing) {
          existing.transacoesOrfas++;
          existing.valorTotal += transacao.valor;
        } else {
          cartoesOrfaos.set(key, {
            ultimosDigitos: dados.ultimosDigitos,
            apelido: dados.apelido,
            transacoesOrfas: 1,
            valorTotal: transacao.valor
          });
        }
      });

      setCartoesDetectados(Array.from(cartoesOrfaos.values()));
    } catch (error) {
      console.error('Erro ao analisar transações órfãs:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const criarCartaoDetectado = async (cartaoDetectado: CartaoDetectado) => {
    try {
      const resultado = await criarCartaoAutomatico({
        apelido: cartaoDetectado.apelido,
        ultimos_digitos: cartaoDetectado.ultimosDigitos
      });

      if (resultado) {
        toast({
          title: "✅ Cartão criado!",
          description: `${cartaoDetectado.apelido} foi adicionado com sucesso.`
        });

        // Remover da lista de detectados
        setCartoesDetectados(prev => 
          prev.filter(c => c.ultimosDigitos !== cartaoDetectado.ultimosDigitos)
        );

        // Recarregar cartões
        await refetch();
      }
    } catch (error) {
      console.error('Erro ao criar cartão detectado:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível criar o cartão.",
        variant: "destructive"
      });
    }
  };

  const ignorarCartaoDetectado = (ultimosDigitos: string) => {
    setCartoesDetectados(prev => 
      prev.filter(c => c.ultimosDigitos !== ultimosDigitos)
    );
  };

  useEffect(() => {
    analisarTransacoesOrfas();
  }, [movimentacoes, cartoes]);

  return {
    cartoesDetectados,
    isAnalyzing,
    criarCartaoDetectado,
    ignorarCartaoDetectado,
    reAnalisar: analisarTransacoesOrfas
  };
};