import { useAdminAuth } from '@/hooks/useAdminAuth';
import { CustomerManagement } from '@/components/admin/CustomerManagement';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { PixelDashboard } from '@/components/admin/PixelDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigate } from 'react-router-dom';
import { Shield, Users, BarChart3, Target } from 'lucide-react';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const SuperAdmin = () => {
  const { isAdmin, loading, user } = useAdminAuth();

  console.log('[SuperAdmin] isAdmin:', isAdmin, 'loading:', loading, 'user:', user?.email);

  // Aguardar o carregamento da autenticação antes de fazer redirect
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não há usuário logado, mostrar tela de login
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Super Admin</CardTitle>
            </div>
            <CardDescription>
              Faça login para acessar o painel administrativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminLoginForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se há usuário mas não é admin, mostrar acesso negado
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta área.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Painel Super Admin</h1>
        </div>

        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="pixel" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Pixel & Marketing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers">
            <CustomerManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="pixel">
            <PixelDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};