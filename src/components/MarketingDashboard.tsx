import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Target, DollarSign, Eye, MousePointer } from 'lucide-react';
import { usePixel } from '@/contexts/PixelContext';
import { supabase } from '@/integrations/supabase/client';

interface ConversionMetrics {
  signUps: number;
  subscriptions: number;
  totalRevenue: number;
  pageViews: number;
  uniqueUsers: number;
}

export const MarketingDashboard = () => {
  const [metrics, setMetrics] = useState<ConversionMetrics>({
    signUps: 0,
    subscriptions: 0,
    totalRevenue: 0,
    pageViews: 0,
    uniqueUsers: 0,
  });
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const { isMarketingEnabled, isAnalyticsEnabled } = usePixel();

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const loadMetrics = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // Get subscription data
      const { data: subscriptions } = await supabase
        .from('subscribers')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Get user registrations
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      setMetrics({
        signUps: profiles?.length || 0,
        subscriptions: subscriptions?.filter(s => s.subscribed)?.length || 0,
        totalRevenue: subscriptions?.reduce((acc, sub) => {
          if (sub.subscription_tier === 'solo') return acc + 29.90;
          if (sub.subscription_tier === 'casal') return acc + 49.90;
          return acc;
        }, 0) || 0,
        pageViews: Math.floor(Math.random() * 1000) + 500, // Mock data
        uniqueUsers: profiles?.length || 0,
      });
    } catch (error) {
      console.error('Error loading marketing metrics:', error);
    }
  };

  const conversionRate = metrics.signUps > 0 ? (metrics.subscriptions / metrics.signUps * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Marketing Dashboard</h2>
        <Tabs value={period} onValueChange={(value) => setPeriod(value as any)}>
          <TabsList>
            <TabsTrigger value="7d">7 dias</TabsTrigger>
            <TabsTrigger value="30d">30 dias</TabsTrigger>
            <TabsTrigger value="90d">90 dias</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Páginas visualizadas no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cadastros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.signUps}</div>
            <p className="text-xs text-muted-foreground">
              Novos usuários registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.subscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Conversões para assinatura
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita gerada no período
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Taxa de Conversão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {conversionRate.toFixed(1)}%
          </div>
          <p className="text-muted-foreground">
            {metrics.subscriptions} assinaturas de {metrics.signUps} cadastros
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status do Rastreamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Cookies Analíticos</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              isAnalyticsEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isAnalyticsEnabled ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Cookies de Marketing</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              isMarketingEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isMarketingEnabled ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </CardContent>
      </Card>

      {(!isAnalyticsEnabled || !isMarketingEnabled) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800">
              <MousePointer className="h-5 w-5" />
              <p className="font-medium">Rastreamento Limitado</p>
            </div>
            <p className="text-orange-700 mt-1">
              Alguns cookies estão desabilitados. Para métricas completas, 
              é necessário que os usuários aceitem todos os tipos de cookies.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};