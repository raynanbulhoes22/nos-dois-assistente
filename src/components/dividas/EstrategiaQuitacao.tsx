import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { 
  Snowflake, 
  Flame, 
  Calculator,
  TrendingDown,
  DollarSign,
  Calendar
} from "lucide-react";

interface EstrategiaQuitacaoProps {
  contasParceladas: any[];
  cartoes: any[];
}

export function EstrategiaQuitacao({ contasParceladas, cartoes }: EstrategiaQuitacaoProps) {
  const [valorExtra, setValorExtra] = useState<string>("500");
  const [estrategiaSelecionada, setEstrategiaSelecionada] = useState<"bola-neve" | "avalanche">("bola-neve");

  // Preparar dados das dívidas para análise
  const prepararDividas = () => {
    const dividasParceladas = contasParceladas.map(conta => {
      const parcelasRestantes = conta.total_parcelas - conta.parcelas_pagas;
      const valorRestante = Number(conta.valor_parcela) * parcelasRestantes;
      
      return {
        id: conta.id,
        nome: conta.nome,
        tipo: 'parcelamento',
        valorMinimo: Number(conta.valor_parcela),
        valorTotal: valorRestante,
        parcelas: parcelasRestantes,
        juros: Number(conta.taxa_juros || 0)
      };
    });

    const dividasCartoes = cartoes.map(cartao => {
      const limite = Number(cartao.limite || 0);
      const limiteDisponivel = Number(cartao.limite_disponivel || limite);
      const valorUsado = limite - limiteDisponivel;
      
      return {
        id: cartao.id,
        nome: cartao.apelido,
        tipo: 'cartao',
        valorMinimo: valorUsado * 0.05, // 5% do valor usado como mínimo
        valorTotal: valorUsado,
        parcelas: Math.ceil(valorUsado / (valorUsado * 0.05)), // Estimativa
        juros: 12 // Estimativa de juros mensal para cartão
      };
    }).filter(cartao => cartao.valorTotal > 0);

    return [...dividasParceladas, ...dividasCartoes];
  };

  const dividas = prepararDividas();

  // Estratégia Bola de Neve (menor saldo primeiro)
  const calcularBolaDeNeve = () => {
    const dividasOrdenadas = [...dividas].sort((a, b) => a.valorTotal - b.valorTotal);
    let valorExtraDisponivel = Number(valorExtra);
    let totalEconomizado = 0;
    let mesesEconomizados = 0;

    const resultado = dividasOrdenadas.map((divida, index) => {
      let pagamentoMensal = divida.valorMinimo;
      let mesesParaQuitar = divida.parcelas;
      let jurosEconomizados = 0;

      if (valorExtraDisponivel > 0) {
        // Aplicar valor extra na primeira dívida disponível
        if (index === 0) {
          pagamentoMensal += valorExtraDisponivel;
          mesesParaQuitar = Math.ceil(divida.valorTotal / pagamentoMensal);
          
          // Calcular juros economizados
          const jurosSemExtra = (divida.parcelas - mesesParaQuitar) * divida.valorMinimo * (divida.juros / 100);
          jurosEconomizados = Math.max(0, jurosSemExtra);
          totalEconomizado += jurosEconomizados;
          mesesEconomizados += (divida.parcelas - mesesParaQuitar);
        }
      }

      return {
        ...divida,
        pagamentoMensal,
        mesesParaQuitar,
        jurosEconomizados,
        prioridade: index + 1
      };
    });

    return { resultado, totalEconomizado, mesesEconomizados };
  };

  // Estratégia Avalanche (maior juros primeiro)
  const calcularAvalanche = () => {
    const dividasOrdenadas = [...dividas].sort((a, b) => b.juros - a.juros);
    let valorExtraDisponivel = Number(valorExtra);
    let totalEconomizado = 0;
    let mesesEconomizados = 0;

    const resultado = dividasOrdenadas.map((divida, index) => {
      let pagamentoMensal = divida.valorMinimo;
      let mesesParaQuitar = divida.parcelas;
      let jurosEconomizados = 0;

      if (valorExtraDisponivel > 0) {
        if (index === 0) {
          pagamentoMensal += valorExtraDisponivel;
          mesesParaQuitar = Math.ceil(divida.valorTotal / pagamentoMensal);
          
          const jurosSemExtra = (divida.parcelas - mesesParaQuitar) * divida.valorMinimo * (divida.juros / 100);
          jurosEconomizados = Math.max(0, jurosSemExtra);
          totalEconomizado += jurosEconomizados;
          mesesEconomizados += (divida.parcelas - mesesParaQuitar);
        }
      }

      return {
        ...divida,
        pagamentoMensal,
        mesesParaQuitar,
        jurosEconomizados,
        prioridade: index + 1
      };
    });

    return { resultado, totalEconomizado, mesesEconomizados };
  };

  const resultadoBolaDeNeve = calcularBolaDeNeve();
  const resultadoAvalanche = calcularAvalanche();

  const resultadoAtual = estrategiaSelecionada === "bola-neve" ? resultadoBolaDeNeve : resultadoAvalanche;

  const getIconeEstrategia = (estrategia: string) => {
    return estrategia === "bola-neve" ? Snowflake : Flame;
  };

  const getCorTipo = (tipo: string) => {
    return tipo === "cartao" ? "destructive" : "secondary";
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Configurar Estratégia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor-extra">Valor extra mensal disponível</Label>
              <Input
                id="valor-extra"
                type="number"
                value={valorExtra}
                onChange={(e) => setValorExtra(e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Estratégia de Quitação</Label>
              <div className="flex gap-2">
                <Button
                  variant={estrategiaSelecionada === "bola-neve" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEstrategiaSelecionada("bola-neve")}
                  className="flex-1"
                >
                  <Snowflake className="h-4 w-4 mr-2" />
                  Bola de Neve
                </Button>
                <Button
                  variant={estrategiaSelecionada === "avalanche" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEstrategiaSelecionada("avalanche")}
                  className="flex-1"
                >
                  <Flame className="h-4 w-4 mr-2" />
                  Avalanche
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparação de Estratégias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Snowflake className="h-4 w-4 text-blue-500" />
              Método Bola de Neve
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Quita primeiro as menores dívidas para gerar motivação
            </p>
            <div className="flex justify-between">
              <span>Economia estimada:</span>
              <span className="font-medium text-success">
                {formatCurrency(resultadoBolaDeNeve.totalEconomizado)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Meses economizados:</span>
              <span className="font-medium">{resultadoBolaDeNeve.mesesEconomizados}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Flame className="h-4 w-4 text-orange-500" />
              Método Avalanche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Quita primeiro as dívidas com maiores juros
            </p>
            <div className="flex justify-between">
              <span>Economia estimada:</span>
              <span className="font-medium text-success">
                {formatCurrency(resultadoAvalanche.totalEconomizado)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Meses economizados:</span>
              <span className="font-medium">{resultadoAvalanche.mesesEconomizados}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plano de Quitação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
          {estrategiaSelecionada === "bola-neve" ? (
            <Snowflake className="h-5 w-5" />
          ) : (
            <Flame className="h-5 w-5" />
          )}
            Plano de Quitação - {estrategiaSelecionada === "bola-neve" ? "Bola de Neve" : "Avalanche"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {resultadoAtual.resultado.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma dívida encontrada
            </p>
          ) : (
            <div className="space-y-4">
              {resultadoAtual.resultado.map(divida => (
                <div key={divida.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{divida.nome}</h4>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={getCorTipo(divida.tipo)} className="text-xs">
                          {divida.tipo === "cartao" ? "Cartão" : "Parcelamento"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Prioridade {divida.prioridade}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(divida.valorTotal)}</p>
                      <p className="text-xs text-muted-foreground">
                        {divida.juros > 0 ? `${divida.juros}% juros` : 'Sem juros'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Pagamento mensal:</span>
                      <p className="font-medium">{formatCurrency(divida.pagamentoMensal)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Meses para quitar:</span>
                      <p className="font-medium">{divida.mesesParaQuitar}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Economia em juros:</span>
                      <p className="font-medium text-success">
                        {formatCurrency(divida.jurosEconomizados)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor original:</span>
                      <p className="font-medium">{formatCurrency(divida.valorMinimo)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo da Estratégia */}
      {resultadoAtual.resultado.length > 0 && (
        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-success" />
                  <span className="font-medium">Economia Total</span>
                </div>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(resultadoAtual.totalEconomizado)}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Tempo Economizado</span>
                </div>
                <p className="text-2xl font-bold text-blue-500">
                  {resultadoAtual.mesesEconomizados} meses
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Valor Extra Usado</span>
                </div>
                <p className="text-2xl font-bold text-orange-500">
                  {formatCurrency(Number(valorExtra))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}