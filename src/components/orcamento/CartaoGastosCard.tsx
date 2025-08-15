import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCartoes } from "@/hooks/useCartoes";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { formatCurrency } from "@/lib/utils";
import { calcularGastoCartao, isPagamentoFatura } from "@/lib/cartao-utils";

interface CartaoGastosCardProps {
  mes: number;
  ano: number;
}

export const CartaoGastosCard = ({ mes, ano }: CartaoGastosCardProps) => {
  const { cartoes, isLoading: loadingCartoes } = useCartoes();
  const { movimentacoes, isLoading: loadingMovimentacoes } = useMovimentacoes();

  // Convertendo movimentações para o formato esperado pela função utilitária
  const transacoesFormatadas = movimentacoes.map(mov => ({
    id: mov.id,
    cartao_final: mov.cartao_final,
    ultimos_digitos: mov.ultimos_digitos,
    apelido: mov.apelido,
    valor: mov.valor,
    data: mov.data,
    isEntrada: mov.isEntrada,
  }));

  const cartoesComGastos = cartoes
    .filter(cartao => cartao.ativo)
    .map(cartao => {
      const gastoAtual = calcularGastoCartao(transacoesFormatadas, cartao, mes, ano);
      const pagamentosFatura = transacoesFormatadas
        .filter(t => t.isEntrada && isPagamentoFatura(t))
        .reduce((total, t) => total + t.valor, 0);
      
      return {
        ...cartao,
        gastoAtual,
        pagamentosFatura,
        utilizacaoPercentual: cartao.limite ? (gastoAtual / cartao.limite) * 100 : 0,
      };
    })
    .filter(cartao => cartao.gastoAtual > 0 || cartao.pagamentosFatura > 0);

  if (loadingCartoes || loadingMovimentacoes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Carregando gastos do cartão...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (cartoesComGastos.length === 0) {
    return null;
  }

  const totalGastos = cartoesComGastos.reduce((total, cartao) => total + cartao.gastoAtual, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          Gastos no Cartão - {mes.toString().padStart(2, '0')}/{ano}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartoesComGastos.map(cartao => (
          <div key={cartao.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{cartao.apelido}</span>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  {formatCurrency(cartao.gastoAtual)}
                </div>
                {cartao.pagamentosFatura > 0 && (
                  <div className="text-xs text-green-600">
                    Pago: {formatCurrency(cartao.pagamentosFatura)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Utilização: {cartao.utilizacaoPercentual.toFixed(1)}%</span>
              <span>Limite: {formatCurrency(cartao.limite || 0)}</span>
            </div>
            <Progress 
              value={cartao.utilizacaoPercentual} 
              className="h-2"
            />
          </div>
        ))}
        
        {cartoesComGastos.length > 1 && (
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center font-medium">
              <span>Total Gasto</span>
              <span>{formatCurrency(totalGastos)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};