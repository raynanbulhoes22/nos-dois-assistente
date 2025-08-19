import { useState } from "react";
import { useFaturasFuturas } from "@/hooks/useFaturasFuturas";
import { useCartoes } from "@/hooks/useCartoes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FaturaFuturaForm } from "./FaturaFuturaForm";
import { formatCurrency } from "@/lib/utils";
import { 
  Calendar,
  Plus,
  TrendingUp,
  AlertTriangle,
  Clock
} from "lucide-react";

export const FaturasFuturasSection = () => {
  const { faturas, getTotalFaturasFuturas, getProximasFaturas } = useFaturasFuturas();
  const { cartoes } = useCartoes();
  const [showFaturaModal, setShowFaturaModal] = useState(false);

  const totalFaturas = getTotalFaturasFuturas();
  const proximasFaturas = getProximasFaturas(3);
  const cartoesAtivos = cartoes.filter(c => c.ativo);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <CardTitle>Faturas Futuras</CardTitle>
              <p className="text-sm text-muted-foreground">
                Programe suas próximas faturas
              </p>
            </div>
          </div>
          
          <Dialog open={showFaturaModal} onOpenChange={setShowFaturaModal}>
            <DialogTrigger asChild>
              <Button disabled={cartoesAtivos.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Programar Fatura
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
      </CardHeader>
      
      <CardContent>
        {cartoesAtivos.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-warning/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium">Nenhum cartão ativo</p>
              <p className="text-sm text-muted-foreground">
                Adicione um cartão para programar faturas futuras
              </p>
            </div>
          </div>
        ) : faturas.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Organize suas faturas futuras</h3>
            <p className="text-muted-foreground mb-4">
              Programe as faturas dos seus cartões para um melhor controle financeiro
            </p>
            <Button onClick={() => setShowFaturaModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Programar Primeira Fatura
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Programado</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(totalFaturas)}
                </p>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground">Faturas Agendadas</p>
                <p className="text-2xl font-bold">
                  {faturas.length}
                </p>
              </div>
            </div>

            {/* Próximas faturas */}
            {proximasFaturas.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Próximas Faturas
                </h4>
                <div className="space-y-2">
                  {proximasFaturas.map(fatura => (
                    <div key={fatura.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                      <div>
                        <p className="font-medium">{fatura.descricao}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{fatura.apelido_cartao}</span>
                          {fatura.ultimos_digitos && (
                            <Badge variant="outline" className="text-xs">
                              •••• {fatura.ultimos_digitos}
                            </Badge>
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
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};