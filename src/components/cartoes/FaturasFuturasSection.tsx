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
  Clock,
  CreditCard,
  ArrowRight,
  Target
} from "lucide-react";

export const FaturasFuturasSection = () => {
  const { faturas, getTotalFaturasFuturas, getProximasFaturas } = useFaturasFuturas();
  const { cartoes } = useCartoes();
  const [showFaturaModal, setShowFaturaModal] = useState(false);

  const totalFaturas = getTotalFaturasFuturas();
  const proximasFaturas = getProximasFaturas(3);
  const cartoesAtivos = cartoes.filter(c => c.ativo);

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Faturas Futuras</h2>
            <p className="text-muted-foreground">
              Organize e programe suas próximas faturas
            </p>
          </div>
        </div>
        
        <Dialog open={showFaturaModal} onOpenChange={setShowFaturaModal}>
          <DialogTrigger asChild>
            <Button 
              disabled={cartoesAtivos.length === 0}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-5 w-5 mr-2" />
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

      {cartoesAtivos.length === 0 ? (
        <Card className="border-2 border-dashed border-warning/30 bg-warning/5">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-warning/10 rounded-full w-fit mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum cartão ativo</h3>
            <p className="text-muted-foreground mb-4">
              Adicione um cartão ativo para começar a programar suas faturas futuras
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Verificar Cartões
            </Button>
          </CardContent>
        </Card>
      ) : faturas.length === 0 ? (
        <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full w-fit mx-auto mb-6">
              <Calendar className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Organize suas faturas futuras</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Programe as faturas dos seus cartões para ter um controle financeiro perfeito e nunca mais se surpreender
            </p>
            <Button 
              size="lg" 
              onClick={() => setShowFaturaModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Programar Primeira Fatura
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Cards de Resumo Melhorados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50 border-red-100">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-full -mr-12 -mt-12"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600/80 mb-1">Total Programado</p>
                    <p className="text-3xl font-bold text-red-600">
                      {formatCurrency(totalFaturas)}
                    </p>
                    <p className="text-xs text-red-500/70 mt-1">
                      Próximas faturas a vencer
                    </p>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full -mr-12 -mt-12"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600/80 mb-1">Faturas Agendadas</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {faturas.length}
                    </p>
                    <p className="text-xs text-emerald-500/70 mt-1">
                      Organizadas por mês
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl">
                    <Target className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Próximas Faturas */}
          {proximasFaturas.length > 0 && (
            <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-blue-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-blue-900">Próximas Faturas</CardTitle>
                      <p className="text-sm text-blue-600/70">
                        Suas faturas mais urgentes
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-100">
                    Ver todas
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {proximasFaturas.map((fatura, index) => (
                    <div 
                      key={fatura.id} 
                      className="group flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border border-blue-100/50 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg group-hover:scale-110 transition-transform">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{fatura.descricao}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="font-medium">{fatura.apelido_cartao}</span>
                            {fatura.ultimos_digitos && (
                              <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                                •••• {fatura.ultimos_digitos}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-600">
                          {formatCurrency(fatura.valor)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(fatura.data).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};