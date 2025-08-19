import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { 
  Target, 
  ArrowUp, 
  ArrowDown,
  DollarSign,
  Calendar,
  Percent,
  AlertTriangle,
  TrendingUp,
  Clock
} from "lucide-react";

interface RankingDividasProps {
  contasParceladas: any[];
  cartoes: any[];
}

type CriterioOrdenacao = "valor-total" | "valor-mensal" | "juros" | "prazo" | "prioridade";

export function RankingDividas({ contasParceladas, cartoes }: RankingDividasProps) {
  const [criterio, setCriterio] = useState<CriterioOrdenacao>("prioridade");
  const [ordemCrescente, setOrdemCrescente] = useState(false);

  // Preparar todas as dívidas para análise
  const prepararDividas = () => {
    const dividasParceladas = contasParceladas.map(conta => {
      const parcelasRestantes = conta.total_parcelas - conta.parcelas_pagas;
      const valorRestante = Number(conta.valor_parcela) * parcelasRestantes;
      const progresso = (conta.parcelas_pagas / conta.total_parcelas) * 100;
      
      // Calcular urgência baseada no tempo restante e valor
      const urgencia = (parcelasRestantes <= 6 ? 80 : 50) + (valorRestante > 10000 ? 20 : 0);
      
      return {
        id: conta.id,
        nome: conta.nome,
        tipo: 'parcelamento' as const,
        valorTotal: valorRestante,
        valorMensal: Number(conta.valor_parcela),
        juros: Number(conta.taxa_juros || 0),
        prazoMeses: parcelasRestantes,
        progresso,
        urgencia,
        categoria: conta.categoria || conta.tipo_financiamento,
        icone: '📋',
        detalhes: {
          parcelasPagas: conta.parcelas_pagas,
          totalParcelas: conta.total_parcelas,
          dataInicio: conta.data_primeira_parcela
        }
      };
    });

    const dividasCartoes = cartoes.map(cartao => {
      const limite = Number(cartao.limite || 0);
      const limiteDisponivel = Number(cartao.limite_disponivel || limite);
      const valorUsado = limite - limiteDisponivel;
      const percentualUso = limite > 0 ? (valorUsado / limite) * 100 : 0;
      
      // Cartão tem urgência alta se estiver acima de 80% do limite
      const urgencia = percentualUso >= 80 ? 100 : percentualUso >= 50 ? 60 : 30;
      
      return {
        id: cartao.id,
        nome: cartao.apelido,
        tipo: 'cartao' as const,
        valorTotal: valorUsado,
        valorMensal: valorUsado * 0.05, // 5% como estimativa de pagamento mínimo
        juros: 12, // Estimativa de juros mensal para cartão
        prazoMeses: Math.ceil(valorUsado / (valorUsado * 0.05)), // Estimativa baseada no mínimo
        progresso: percentualUso,
        urgencia,
        categoria: 'Cartão de Crédito',
        icone: '💳',
        detalhes: {
          limite,
          disponivel: limiteDisponivel,
          percentualUso,
          ultimosDigitos: cartao.ultimos_digitos
        }
      };
    }).filter(cartao => cartao.valorTotal > 0);

    return [...dividasParceladas, ...dividasCartoes];
  };

  // Ordenar dívidas por critério
  const ordenarDividas = (dividas: ReturnType<typeof prepararDividas>) => {
    const sortedDividas = [...dividas].sort((a, b) => {
      let valueA: number, valueB: number;

      switch (criterio) {
        case "valor-total":
          valueA = a.valorTotal;
          valueB = b.valorTotal;
          break;
        case "valor-mensal":
          valueA = a.valorMensal;
          valueB = b.valorMensal;
          break;
        case "juros":
          valueA = a.juros;
          valueB = b.juros;
          break;
        case "prazo":
          valueA = a.prazoMeses;
          valueB = b.prazoMeses;
          break;
        case "prioridade":
        default:
          // Prioridade combina urgência com valor
          valueA = a.urgencia + (a.valorTotal / 1000);
          valueB = b.urgencia + (b.valorTotal / 1000);
          break;
      }

      return ordemCrescente ? valueA - valueB : valueB - valueA;
    });

    return sortedDividas;
  };

  const todasDividas = prepararDividas();
  const dividasOrdenadas = ordenarDividas(todasDividas);

  const toggleOrdem = () => setOrdemCrescente(!ordemCrescente);

  const getCorUrgencia = (urgencia: number) => {
    if (urgencia >= 80) return "destructive";
    if (urgencia >= 60) return "secondary";
    return "default";
  };

  const getDescricaoCriterio = (crit: CriterioOrdenacao) => {
    switch (crit) {
      case "valor-total": return "Valor Total";
      case "valor-mensal": return "Valor Mensal";
      case "juros": return "Taxa de Juros";
      case "prazo": return "Prazo Restante";
      case "prioridade": return "Prioridade Inteligente";
      default: return "Prioridade";
    }
  };

  const formatarProgresso = (progresso: number, tipo: string) => {
    if (tipo === 'cartao') {
      return `${progresso.toFixed(1)}% do limite`;
    }
    return `${progresso.toFixed(1)}% concluído`;
  };

  return (
    <div className="space-y-6">
      {/* Controles de Ordenação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Critério de Priorização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(["prioridade", "valor-total", "valor-mensal", "juros", "prazo"] as CriterioOrdenacao[]).map(crit => (
              <Button
                key={crit}
                variant={criterio === crit ? "default" : "outline"}
                size="sm"
                onClick={() => setCriterio(crit)}
                className="flex items-center gap-2"
              >
                {crit === "prioridade" && <AlertTriangle className="h-4 w-4" />}
                {crit === "valor-total" && <DollarSign className="h-4 w-4" />}
                {crit === "valor-mensal" && <Calendar className="h-4 w-4" />}
                {crit === "juros" && <Percent className="h-4 w-4" />}
                {crit === "prazo" && <Clock className="h-4 w-4" />}
                {getDescricaoCriterio(crit)}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleOrdem}
              className="flex items-center gap-2"
            >
              {ordemCrescente ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {ordemCrescente ? "Crescente" : "Decrescente"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista Priorizada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ranking de Dívidas</span>
            <Badge variant="outline">
              {dividasOrdenadas.length} dívidas ativas
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dividasOrdenadas.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-success mb-2">Parabéns!</h3>
              <p className="text-muted-foreground">
                Você não possui dívidas ativas no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dividasOrdenadas.map((divida, index) => (
                <div key={divida.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{divida.icone}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{divida.nome}</h4>
                          <Badge 
                            variant={getCorUrgencia(divida.urgencia)}
                            className="text-xs"
                          >
                            #{index + 1}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{divida.categoria}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(divida.valorTotal)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(divida.valorMensal)}/mês
                      </p>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{formatarProgresso(divida.progresso, divida.tipo)}</span>
                      <span>
                        {divida.tipo === 'cartao' ? 'Limite utilizado' : 'Concluído'}
                      </span>
                    </div>
                    <Progress 
                      value={divida.progresso} 
                      className="h-2"
                    />
                  </div>

                  {/* Detalhes */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Taxa de juros:</span>
                      <p className="font-medium">
                        {divida.juros > 0 ? `${divida.juros}%` : 'Sem juros'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {divida.tipo === 'cartao' ? 'Limite total:' : 'Prazo restante:'}
                      </span>
                      <p className="font-medium">
                        {divida.tipo === 'cartao' 
                          ? formatCurrency(divida.detalhes.limite)
                          : `${divida.prazoMeses} meses`
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Urgência:</span>
                      <p className="font-medium">
                        <Badge variant={getCorUrgencia(divida.urgencia)} className="text-xs">
                          {divida.urgencia >= 80 ? 'Alta' : divida.urgencia >= 60 ? 'Média' : 'Baixa'}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {divida.tipo === 'cartao' ? 'Disponível:' : 'Tipo:'}
                      </span>
                      <p className="font-medium">
                        {divida.tipo === 'cartao' 
                          ? formatCurrency(divida.detalhes.disponivel)
                          : 'Parcelamento'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Recomendações */}
                  {divida.urgencia >= 80 && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-destructive">Ação Recomendada</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {divida.tipo === 'cartao' 
                          ? 'Cartão próximo do limite. Considere quitar parte da fatura ou reduzir o uso.'
                          : 'Dívida em fase final. Considere antecipar parcelas para economizar juros.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo da Estratégia */}
      {dividasOrdenadas.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">💡 Dica de Estratégia</h3>
              <p className="text-muted-foreground">
                {criterio === "prioridade" && 
                  "A priorização inteligente considera urgência, valor e impacto financeiro para otimizar sua estratégia de quitação."
                }
                {criterio === "valor-total" && 
                  "Focando nas maiores dívidas primeiro, você reduz o comprometimento total mais rapidamente."
                }
                {criterio === "valor-mensal" && 
                  "Quitando as maiores parcelas mensais, você libera mais fluxo de caixa para outras estratégias."
                }
                {criterio === "juros" && 
                  "Priorizando dívidas com maiores juros, você economiza mais dinheiro a longo prazo."
                }
                {criterio === "prazo" && 
                  "Focando em dívidas de menor prazo, você reduz rapidamente a quantidade de compromissos."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}