import { useAdminAuth } from '@/hooks/useAdminAuth';
import { CustomerManagement } from '@/components/admin/CustomerManagement';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { PixelDashboard } from '@/components/admin/PixelDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigate } from 'react-router-dom';
import { Shield, Users, BarChart3, Target } from 'lucide-react';

export const SuperAdmin = () => {
  const { isAdmin } = useAdminAuth();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
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