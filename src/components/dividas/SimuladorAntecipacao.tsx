import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  Percent,
  Clock
} from "lucide-react";

interface SimuladorAntecipacaoProps {
  contasParceladas: any[];
}

export function SimuladorAntecipacao({ contasParceladas }: SimuladorAntecipacaoProps) {
  const [contaSelecionada, setContaSelecionada] = useState<string>("");
  const [tipoSimulacao, setTipoSimulacao] = useState<"antecipacao" | "quitacao">("antecipacao");
  const [valorSimulacao, setValorSimulacao] = useState<string>("");
  const [parcelasAntecipadas, setParcelasAntecipadas] = useState<string>("1");

  const contasAtivas = contasParceladas.filter(conta => conta.ativa);

  const contaEscolhida = contasAtivas.find(conta => conta.id === contaSelecionada);

  // Calcular simulação de antecipação
  const calcularAntecipacao = () => {
    if (!contaEscolhida || !valorSimulacao) return null;

    const parcelasRestantes = contaEscolhida.total_parcelas - contaEscolhida.parcelas_pagas;
    const valorParcela = Number(contaEscolhida.valor_parcela);
    const valorTotal = valorParcela * parcelasRestantes;
    const valorAntecipacao = Number(valorSimulacao);
    const taxaJuros = Number(contaEscolhida.taxa_juros || 0);

    if (tipoSimulacao === "quitacao") {
      // Simulação de quitação total
      const desconto = valorTotal * 0.1; // Assumindo 10% de desconto
      const valorQuitacao = valorTotal - desconto;
      const economiaJuros = parcelasRestantes * valorParcela * (taxaJuros / 100);
      const economiaTotal = desconto + economiaJuros;

      return {
        tipo: "quitacao",
        valorOriginal: valorTotal,
        valorComDesconto: valorQuitacao,
        desconto,
        economiaJuros,
        economiaTotal,
        mesesEconomizados: parcelasRestantes
      };
    } else {
      // Simulação de antecipação de parcelas
      const parcelasAAntecipar = Math.min(Number(parcelasAntecipadas), parcelasRestantes);
      const valorNecessario = valorParcela * parcelasAAntecipar;
      const jurosEconomizados = valorNecessario * (taxaJuros / 100);
      const novasParcelasRestantes = parcelasRestantes - parcelasAAntecipar;
      
      // Calcular data de término antecipada
      const dataAtual = new Date();
      const mesesAntecipados = parcelasAAntecipar;
      const novaDataTermino = new Date(dataAtual);
      novaDataTermino.setMonth(novaDataTermino.getMonth() + novasParcelasRestantes);

      return {
        tipo: "antecipacao",
        parcelasAntecipadas: parcelasAAntecipar,
        valorNecessario,
        jurosEconomizados,
        novasParcelasRestantes,
        mesesEconomizados: parcelasAAntecipar,
        novaDataTermino,
        comprometimentoMensal: valorParcela
      };
    }
  };

  const simulacao = calcularAntecipacao();

  // Calcular viabilidade da simulação
  const calcularViabilidade = () => {
    if (!simulacao || !valorSimulacao) return null;

    const valorDisponivel = Number(valorSimulacao);
    
    if (simulacao.tipo === "quitacao") {
      const viavel = valorDisponivel >= simulacao.valorComDesconto;
      return {
        viavel,
        diferenca: simulacao.valorComDesconto - valorDisponivel,
        percentualCoberto: (valorDisponivel / simulacao.valorComDesconto) * 100
      };
    } else {
      const viavel = valorDisponivel >= simulacao.valorNecessario;
      return {
        viavel,
        diferenca: simulacao.valorNecessario - valorDisponivel,
        percentualCoberto: (valorDisponivel / simulacao.valorNecessario) * 100
      };
    }
  };

  const viabilidade = calcularViabilidade();

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Controles de Simulação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Configurar Simulação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="conta">Selecionar Dívida</Label>
              <Select value={contaSelecionada} onValueChange={setContaSelecionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma dívida" />
                </SelectTrigger>
                <SelectContent>
                  {contasAtivas.map(conta => (
                    <SelectItem key={conta.id} value={conta.id}>
                      {conta.nome} - {formatCurrency(Number(conta.valor_parcela))}/mês
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipo">Tipo de Simulação</Label>
              <Select value={tipoSimulacao} onValueChange={(value: "antecipacao" | "quitacao") => setTipoSimulacao(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="antecipacao">Antecipação de Parcelas</SelectItem>
                  <SelectItem value="quitacao">Quitação Total</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor">Valor Disponível</Label>
              <Input
                id="valor"
                type="number"
                value={valorSimulacao}
                onChange={(e) => setValorSimulacao(e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>

            {tipoSimulacao === "antecipacao" && (
              <div>
                <Label htmlFor="parcelas">Parcelas a Antecipar</Label>
                <Input
                  id="parcelas"
                  type="number"
                  value={parcelasAntecipadas}
                  onChange={(e) => setParcelasAntecipadas(e.target.value)}
                  min="1"
                  max={contaEscolhida ? contaEscolhida.total_parcelas - contaEscolhida.parcelas_pagas : 1}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações da Dívida Selecionada */}
      {contaEscolhida && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{contaEscolhida.nome}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Valor da parcela:</span>
                <p className="font-medium">{formatCurrency(Number(contaEscolhida.valor_parcela))}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Parcelas restantes:</span>
                <p className="font-medium">
                  {contaEscolhida.total_parcelas - contaEscolhida.parcelas_pagas}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor total restante:</span>
                <p className="font-medium">
                  {formatCurrency(
                    Number(contaEscolhida.valor_parcela) * 
                    (contaEscolhida.total_parcelas - contaEscolhida.parcelas_pagas)
                  )}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Taxa de juros:</span>
                <p className="font-medium">
                  {contaEscolhida.taxa_juros ? `${contaEscolhida.taxa_juros}%` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado da Simulação */}
      {simulacao && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resultado da Simulação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {simulacao.tipo === "quitacao" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-destructive" />
                      <span className="font-medium">Valor para Quitação</span>
                    </div>
                    <p className="text-2xl font-bold text-destructive">
                      {formatCurrency(simulacao.valorComDesconto)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Era {formatCurrency(simulacao.valorOriginal)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Percent className="h-5 w-5 text-success" />
                      <span className="font-medium">Economia Total</span>
                    </div>
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(simulacao.economiaTotal)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Desconto + Juros
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Meses Livres</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-500">
                      {simulacao.mesesEconomizados}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sem pagamentos
                    </p>
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Detalhamento:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Desconto negociado:</span>
                      <span className="text-success">{formatCurrency(simulacao.desconto)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Economia em juros:</span>
                      <span className="text-success">{formatCurrency(simulacao.economiaJuros)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Valor Necessário</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-500">
                      {formatCurrency(simulacao.valorNecessario)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Para {simulacao.parcelasAntecipadas} parcelas
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                      <span className="font-medium">Juros Economizados</span>
                    </div>
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(simulacao.jurosEconomizados)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Em {simulacao.mesesEconomizados} meses
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Nova Quitação</span>
                    </div>
                    <p className="text-lg font-bold text-blue-500">
                      {formatarData(simulacao.novaDataTermino)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {simulacao.novasParcelasRestantes} parcelas restantes
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Viabilidade */}
      {viabilidade && valorSimulacao && (
        <Card className={viabilidade.viavel ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                {viabilidade.viavel ? (
                  <>
                    <TrendingUp className="h-6 w-6 text-success" />
                    <h3 className="text-lg font-semibold text-success">Simulação Viável!</h3>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-6 w-6 text-destructive" />
                    <h3 className="text-lg font-semibold text-destructive">Valor Insuficiente</h3>
                  </>
                )}
              </div>
              
              {viabilidade.viavel ? (
                <p className="text-muted-foreground">
                  Você tem {formatCurrency(Math.abs(viabilidade.diferenca))} a mais do que o necessário!
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Faltam {formatCurrency(viabilidade.diferenca)} para realizar esta operação.
                  Você cobriu {viabilidade.percentualCoberto.toFixed(1)}% do valor necessário.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}