import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { 
  CreditCard, 
  FileText, 
  Calendar,
  TrendingUp,
  AlertCircle,
  Clock
} from "lucide-react";

interface DividasOverviewProps {
  contasParceladas: any[];
  cartoes: any[];
}

export function DividasOverview({ contasParceladas, cartoes }: DividasOverviewProps) {
  // Calcular estatísticas das contas parceladas
  const calcularEstatisticasContas = () => {
    return contasParceladas.map(conta => {
      const parcelasRestantes = conta.total_parcelas - conta.parcelas_pagas;
      const valorRestante = Number(conta.valor_parcela) * parcelasRestantes;
      const progresso = (conta.parcelas_pagas / conta.total_parcelas) * 100;
      
      // Calcular data prevista de término
      const dataInicio = new Date(conta.data_primeira_parcela);
      const mesesRestantes = parcelasRestantes;
      const dataTermino = new Date(dataInicio);
      dataTermino.setMonth(dataTermino.getMonth() + conta.total_parcelas);

      return {
        ...conta,
        parcelasRestantes,
        valorRestante,
        progresso,
        dataTermino,
        mesesRestantes
      };
    });
  };

  // Calcular estatísticas dos cartões
  const calcularEstatisticasCartoes = () => {
    return cartoes.map(cartao => {
      const limite = Number(cartao.limite || 0);
      const limiteDisponivel = Number(cartao.limite_disponivel || limite);
      const valorUsado = limite - limiteDisponivel;
      const percentualUso = limite > 0 ? (valorUsado / limite) * 100 : 0;

      return {
        ...cartao,
        valorUsado,
        percentualUso,
        limite
      };
    });
  };

  const contasComEstatisticas = calcularEstatisticasContas();
  const cartoesComEstatisticas = calcularEstatisticasCartoes();

  // Encontrar próximas a vencer
  const proximasVencer = contasComEstatisticas
    .filter(conta => conta.mesesRestantes <= 6)
    .sort((a, b) => a.mesesRestantes - b.mesesRestantes);

  // Cartões com alto uso
  const cartoesAltoUso = cartoesComEstatisticas
    .filter(cartao => cartao.percentualUso > 70)
    .sort((a, b) => b.percentualUso - a.percentualUso);

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusCor = (percentual: number) => {
    if (percentual >= 80) return "destructive";
    if (percentual >= 50) return "secondary";
    return "default";
  };

  return (
    <div className="space-y-6">
      {/* Resumo das Contas Parceladas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Parcelamentos e Financiamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contasComEstatisticas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum parcelamento ativo encontrado
            </p>
          ) : (
            <div className="space-y-4">
              {contasComEstatisticas.map(conta => (
                <div key={conta.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{conta.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        {conta.categoria || conta.tipo_financiamento}
                      </p>
                    </div>
                    <Badge variant={getStatusCor(conta.progresso)}>
                      {conta.parcelas_pagas}/{conta.total_parcelas}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{conta.progresso.toFixed(1)}%</span>
                    </div>
                    <Progress value={conta.progresso} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Valor restante:</span>
                      <p className="font-medium text-destructive">
                        {formatCurrency(conta.valorRestante)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Previsão término:</span>
                      <p className="font-medium">
                        {formatarData(conta.dataTermino)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo dos Cartões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Cartões de Crédito
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartoesComEstatisticas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum cartão ativo encontrado
            </p>
          ) : (
            <div className="space-y-4">
              {cartoesComEstatisticas.map(cartao => (
                <div key={cartao.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{cartao.apelido}</h4>
                      <p className="text-sm text-muted-foreground">
                        Final {cartao.ultimos_digitos}
                      </p>
                    </div>
                    <Badge variant={getStatusCor(cartao.percentualUso)}>
                      {cartao.percentualUso.toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Limite utilizado</span>
                      <span>{formatCurrency(cartao.valorUsado)}</span>
                    </div>
                    <Progress value={cartao.percentualUso} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Limite total:</span>
                      <p className="font-medium">
                        {formatCurrency(cartao.limite)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Disponível:</span>
                      <p className="font-medium text-success">
                        {formatCurrency(cartao.limite - cartao.valorUsado)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas e Oportunidades */}
      {(proximasVencer.length > 0 || cartoesAltoUso.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Próximas a vencer */}
          {proximasVencer.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Próximas ao Fim
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {proximasVencer.slice(0, 3).map(conta => (
                  <div key={conta.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{conta.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {conta.mesesRestantes} meses restantes
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatCurrency(conta.valorRestante)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Cartões com alto uso */}
          {cartoesAltoUso.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  Cartões em Alerta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cartoesAltoUso.slice(0, 3).map(cartao => (
                  <div key={cartao.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{cartao.apelido}</p>
                      <p className="text-xs text-muted-foreground">
                        {cartao.percentualUso.toFixed(1)}% utilizado
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {formatCurrency(cartao.valorUsado)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}