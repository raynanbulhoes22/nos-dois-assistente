import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  Check,
  Clock,
  AlertTriangle,
  X,
  Eye,
  Zap
} from "lucide-react";
import { useReconciliacaoFinanceira, EventoConciliado } from "@/hooks/useReconciliacaoFinanceira";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface CompromissosMensaisProps {
  onReconciliarEvento?: (eventoId: string, registroId: string) => void;
}

export const CompromissosMensaisCard = ({ 
  onReconciliarEvento 
}: CompromissosMensaisProps) => {
  const { 
    eventosReconciliados, 
    status, 
    sugestoes, 
    isLoading, 
    reconciliarEvento 
  } = useReconciliacaoFinanceira();

  const [eventoSelecionado, setEventoSelecionado] = useState<EventoConciliado | null>(null);
  const [observacoes, setObservacoes] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getStatusIcon = (status: string, confianca: number) => {
    switch (status) {
      case 'conciliado':
        return <Check className="h-4 w-4 text-success" />;
      case 'pendente':
        if (confianca >= 70) return <Zap className="h-4 w-4 text-warning" />;
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'atrasado':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'nao_aplicavel':
        return <X className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'conciliado':
        return <Badge variant="default" className="bg-success">Conciliado</Badge>;
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'atrasado':
        return <Badge variant="destructive">Atrasado</Badge>;
      case 'nao_aplicavel':
        return <Badge variant="outline">N/A</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const handleReconciliar = async (evento: EventoConciliado, registroId: string) => {
    try {
      await reconciliarEvento(evento.id, registroId, observacoes);
      toast({
        title: "Evento reconciliado",
        description: `${evento.nome} foi reconciliado com sucesso.`
      });
      setEventoSelecionado(null);
      setObservacoes("");
    } catch (error) {
      toast({
        title: "Erro na reconciliação",
        description: "Não foi possível reconciliar o evento.",
        variant: "destructive"
      });
    }
  };

  const getSugestoesPorEvento = (eventoId: string) => {
    return sugestoes.filter(s => s.evento_id === eventoId).slice(0, 3);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Compromissos do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-6 bg-muted rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Compromissos do Mês
          </div>
          <Badge variant="outline">
            {status.conciliados}/{status.total_eventos}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso da Reconciliação</span>
            <span>{status.percentual_conclusao}%</span>
          </div>
          <Progress value={status.percentual_conclusao} className="h-2" />
        </div>

        {/* Lista de Eventos */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {eventosReconciliados.map((evento) => {
            const sugestoesEvento = getSugestoesPorEvento(evento.evento_id);
            const temSugestao = sugestoesEvento.length > 0;
            
            return (
              <div
                key={evento.id}
                className={`p-3 rounded-lg border transition-colors ${
                  evento.status === 'conciliado' 
                    ? 'bg-success/5 border-success/20' 
                    : temSugestao 
                    ? 'bg-warning/5 border-warning/20 hover:bg-warning/10' 
                    : 'bg-muted/5 hover:bg-muted/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(evento.status, evento.confianca_match)}
                      <h4 className="font-medium text-sm truncate">
                        {evento.nome}
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatCurrency(evento.valor_esperado)}</span>
                      <span>•</span>
                      <span>{formatDate(evento.data_esperada)}</span>
                      {evento.valor_real && (
                        <>
                          <span>•</span>
                          <span className="text-success">
                            Real: {formatCurrency(evento.valor_real)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(evento.status)}
                    
                    {evento.status === 'pendente' && temSugestao && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEventoSelecionado(evento)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Reconciliar: {evento.nome}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                              <div>
                                <p className="text-sm font-medium">Valor Esperado</p>
                                <p className="text-lg">{formatCurrency(evento.valor_esperado)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Data Esperada</p>
                                <p className="text-lg">{formatDate(evento.data_esperada)}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-3">Transações Sugeridas</h4>
                              <div className="space-y-2">
                                {sugestoesEvento.map((sugestao) => (
                                  <div
                                    key={sugestao.registro_id}
                                    className="p-3 border rounded-lg hover:bg-muted/10 cursor-pointer"
                                    onClick={() => handleReconciliar(evento, sugestao.registro_id)}
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <p className="font-medium text-sm">
                                          {sugestao.estabelecimento}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {sugestao.motivo}
                                        </p>
                                      </div>
                                      <Badge variant="outline">
                                        {sugestao.confianca}% match
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex justify-between text-sm">
                                      <span>{formatCurrency(sugestao.valor_registro)}</span>
                                      <span>{formatDate(sugestao.data_registro)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Observações (opcional)
                              </label>
                              <Textarea
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                placeholder="Adicione observações sobre esta reconciliação..."
                                className="resize-none"
                                rows={3}
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
                
                {/* Indicador de sugestão */}
                {temSugestao && evento.status === 'pendente' && (
                  <div className="mt-2 pt-2 border-t border-warning/20">
                    <p className="text-xs text-warning flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {sugestoesEvento.length} sugestão{sugestoesEvento.length > 1 ? 'ões' : ''} 
                      ({sugestoesEvento[0].confianca}% de confiança)
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Resumo */}
        {status.total_eventos > 0 && (
          <div className="pt-4 border-t text-center text-sm text-muted-foreground">
            {status.pendentes > 0 ? (
              <span>
                {status.pendentes} {status.pendentes === 1 ? 'compromisso pendente' : 'compromissos pendentes'}
              </span>
            ) : (
              <span className="text-success">✓ Todos os compromissos reconciliados!</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};