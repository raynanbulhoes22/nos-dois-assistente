import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, TrendingUp, TrendingDown } from "lucide-react";
import { useCartoes } from "@/hooks/useCartoes";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";

interface CartaoGastosCardProps {
  mes: number;
  ano: number;
}

export const CartaoGastosCard = ({ mes, ano }: CartaoGastosCardProps) => {
  const { cartoes } = useCartoes();
  const { movimentacoes } = useMovimentacoes();

  const calcularGastosCartao = (cartaoDigitos: string) => {
    const gastosCartao = movimentacoes.filter(mov => {
      if (mov.isEntrada) return false;
      
      const dataMovimentacao = new Date(mov.data);
      const mesMovimentacao = dataMovimentacao.getMonth() + 1;
      const anoMovimentacao = dataMovimentacao.getFullYear();
      
      const isCartaoCorreto = mov.cartao_final && mov.cartao_final.includes(cartaoDigitos);
      const isPeriodoCorreto = mesMovimentacao === mes && anoMovimentacao === ano;
      
      return isCartaoCorreto && isPeriodoCorreto;
    });
    
    return gastosCartao.reduce((total, gasto) => total + gasto.valor, 0);
  };

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const cartoesComGastos = cartoes
    .filter(cartao => cartao.ativo)
    .map(cartao => ({
      ...cartao,
      gastoAtual: calcularGastosCartao(cartao.ultimos_digitos)
    }))
    .filter(cartao => cartao.gastoAtual > 0);

  if (cartoesComGastos.length === 0) {
    return null;
  }

  const totalGastos = cartoesComGastos.reduce((total, cartao) => total + cartao.gastoAtual, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <CreditCard className="h-4 w-4" />
          Gastos no Cartão - {mes.toString().padStart(2, '0')}/{ano}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cartoesComGastos.map(cartao => {
          const utilizacao = cartao.limite ? (cartao.gastoAtual / cartao.limite) * 100 : 0;
          
          return (
            <div key={cartao.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{cartao.apelido}</span>
                <span className="text-sm font-bold">
                  {formatCurrency(cartao.gastoAtual)}
                </span>
              </div>
              
              {cartao.limite && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Limite: {formatCurrency(cartao.limite)}</span>
                    <span className={`flex items-center gap-1 ${utilizacao > 80 ? 'text-red-600' : utilizacao > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {utilizacao > 50 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {utilizacao.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        utilizacao > 80 ? 'bg-red-500' : 
                        utilizacao > 50 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(utilizacao, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
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