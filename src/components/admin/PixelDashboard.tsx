import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Facebook, Chrome, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const PixelDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facebook Pixel</CardTitle>
            <Facebook className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="default" className="bg-green-500">Ativo</Badge>
              <span className="text-xs text-muted-foreground">ID: 123456789</span>
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">Eventos hoje: 245</p>
              <p className="text-xs text-muted-foreground">Conversões: 12</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Google Analytics</CardTitle>
            <Chrome className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="default" className="bg-green-500">Ativo</Badge>
              <span className="text-xs text-muted-foreground">GA4</span>
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">Sessões hoje: 156</p>
              <p className="text-xs text-muted-foreground">Bounce rate: 25%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CAC Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 85</div>
            <p className="text-xs text-muted-foreground">
              Por cliente adquirido
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Eventos de Conversão Rastreados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Cadastro</span>
                <Badge variant="outline">245 eventos</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Visualização do Plano</span>
                <Badge variant="outline">189 eventos</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Início do Checkout</span>
                <Badge variant="outline">78 eventos</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Compra Finalizada</span>
                <Badge variant="outline">12 eventos</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Facebook Ads</span>
                <div className="text-right">
                  <div className="text-sm font-medium">8 conversões</div>
                  <div className="text-xs text-muted-foreground">ROAS: 4.2x</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Google Ads</span>
                <div className="text-right">
                  <div className="text-sm font-medium">3 conversões</div>
                  <div className="text-xs text-muted-foreground">ROAS: 3.8x</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Orgânico</span>
                <div className="text-right">
                  <div className="text-sm font-medium">1 conversão</div>
                  <div className="text-xs text-muted-foreground">CAC: R$ 0</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração de Pixels para Anúncios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Público Personalizado - Cadastrados</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Usuários que se cadastraram mas não assinaram ainda
              </p>
              <Badge variant="secondary">156 usuários</Badge>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Público Lookalike - Compradores</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Baseado em usuários que fizeram pelo menos 1 compra
              </p>
              <Badge variant="secondary">1% da população</Badge>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Retargeting - Abandono de Carrinho</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Usuários que iniciaram checkout mas não finalizaram
              </p>
              <Badge variant="secondary">23 usuários</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};