import { useState } from "react";
import { useFaturasFuturas } from "@/hooks/useFaturasFuturas";
import { useCartoes } from "@/hooks/useCartoes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FaturaFuturaForm } from "./FaturaFuturaForm";
import { FaturaFuturasList } from "./FaturaFuturasList";
import { formatCurrency } from "@/lib/utils";
import { 
  Calendar,
  Plus,
  TrendingUp,
  CreditCard,
  AlertTriangle
} from "lucide-react";

export const FaturasFuturasTab = () => {
  const { faturas, isLoading, getTotalFaturasFuturas, getProximasFaturas } = useFaturasFuturas();
  const { cartoes } = useCartoes();
  const [showFaturaModal, setShowFaturaModal] = useState(false);

  const totalFaturas = getTotalFaturasFuturas();
  const proximasFaturas = getProximasFaturas(3);
  const cartoesAtivos = cartoes.filter(c => c.ativo);

  // Agrupar faturas por mês
  const faturasPorMes = faturas.reduce((acc, fatura) => {
    const key = `${fatura.mes}/${fatura.ano}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(fatura);
    return acc;
  }, {} as Record<string, typeof faturas>);

  const getMesNome = (mes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando faturas futuras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão para adicionar */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Faturas Futuras</h3>
          <p className="text-sm text-muted-foreground">
            Programe as faturas dos seus cartões para os próximos meses
          </p>
        </div>
        
        <Dialog open={showFaturaModal} onOpenChange={setShowFaturaModal}>
          <DialogTrigger asChild>
            <Button disabled={cartoesAtivos.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Fatura
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Programar Nova Fatura</DialogTitle>
            </DialogHeader>
            <FaturaFuturaForm
              onSuccess={() => setShowFaturaModal(false)}
              cartoes={cartoesAtivos}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Programado</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(totalFaturas)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturas Programadas</p>
                <p className="text-2xl font-bold">{faturas.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cartões Ativos</p>
                <p className="text-2xl font-bold">{cartoesAtivos.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta se não há cartões */}
      {cartoesAtivos.length === 0 && (
        <Card className="border-warning">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-warning" />
              <div>
                <h4 className="font-medium">Nenhum cartão ativo</h4>
                <p className="text-sm text-muted-foreground">
                  Você precisa ter pelo menos um cartão ativo para programar faturas futuras.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximas faturas */}
      {proximasFaturas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Faturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proximasFaturas.map(fatura => (
                <div key={fatura.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{fatura.descricao}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{fatura.apelido_cartao}</span>
                      {fatura.ultimos_digitos && (
                        <Badge variant="outline">•••• {fatura.ultimos_digitos}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-destructive">
                      {formatCurrency(fatura.valor)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(fatura.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de faturas por mês */}
      {Object.keys(faturasPorMes).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(faturasPorMes)
            .sort(([a], [b]) => {
              const [mesA, anoA] = a.split('/').map(Number);
              const [mesB, anoB] = b.split('/').map(Number);
              return new Date(anoA, mesA - 1).getTime() - new Date(anoB, mesB - 1).getTime();
            })
            .map(([mesAno, faturasMes]) => {
              const [mes, ano] = mesAno.split('/').map(Number);
              const totalMes = faturasMes.reduce((sum, f) => sum + f.valor, 0);
              
              return (
                <Card key={mesAno}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{getMesNome(mes)} {ano}</span>
                      <Badge variant="destructive">
                        {formatCurrency(totalMes)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FaturaFuturasList faturas={faturasMes} cartoes={cartoesAtivos} />
                  </CardContent>
                </Card>
              );
            })}
        </div>
      ) : faturas.length === 0 && cartoesAtivos.length > 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma fatura programada</h3>
            <p className="text-muted-foreground mb-4">
              Comece programando as faturas futuras dos seus cartões para ter um melhor controle financeiro.
            </p>
            <Button onClick={() => setShowFaturaModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Programar Primeira Fatura
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};