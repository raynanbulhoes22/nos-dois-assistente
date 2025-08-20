import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { FinancialDataProvider } from "@/contexts/FinancialDataContext";
import { AuthForm } from "@/components/AuthForm";
import { AppSidebar } from "@/components/AppSidebar";
import { SubscriptionRedirect } from "@/components/SubscriptionRedirect";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import { Movimentacoes } from "./pages/Movimentacoes";
import { Assinaturas } from "./pages/Assinaturas";
import { Orcamento } from "./pages/Orcamento";
import { Cartoes } from "./pages/Cartoes";
import { Relatorios } from "./pages/Relatorios";
import { Configuracoes } from "./pages/Configuracoes";
import Dividas from "./pages/Dividas";
import PrimeirosPasos from "./pages/PrimeirosPasos";
import NotFound from "./pages/NotFound";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useViewportHeight } from "@/hooks/use-viewport-height";

const queryClient = new QueryClient();

const App = () => {
  const { user, loading } = useAuth();
  useViewportHeight();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FinancialDataProvider user={user}>
        <BrowserRouter>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          {/* Desktop Sidebar - Hidden on mobile */}
          <div className="hidden sm:block">
            <AppSidebar />
          </div>
          
          <div className="flex-1 flex flex-col w-full">
            {/* Header - Mobile optimized */}
            <header className="hidden sm:flex h-12 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
              <SidebarTrigger className="p-2 touch-manipulation" />
              <div className="ml-4 flex-1 min-w-0">
                <h1 className="text-lg font-semibold truncate">Lyvo | LucraAI - Gestão Financeira</h1>
              </div>
            </header>
            
            {/* Mobile-first main content */}
            <main className="flex-1 overflow-y-auto scroll-touch touch-pan-y pb-20 sm:pb-0 bg-background">
              <SubscriptionRedirect>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      } />
                      <Route path="/movimentacoes" element={
                        <ProtectedRoute>
                          <Movimentacoes />
                        </ProtectedRoute>
                      } />
                      <Route path="/assinaturas" element={<Assinaturas />} />
                      <Route path="/primeiros-passos" element={<PrimeirosPasos />} />
                      <Route path="/orcamento" element={
                        <ProtectedRoute>
                          <Orcamento />
                        </ProtectedRoute>
                      } />
                      <Route path="/cartoes" element={
                        <ProtectedRoute>
                          <Cartoes />
                        </ProtectedRoute>
                      } />
                      <Route path="/dividas" element={
                        <ProtectedRoute>
                          <Dividas />
                        </ProtectedRoute>
                      } />
                      <Route path="/relatorios" element={
                        <ProtectedRoute>
                          <Relatorios />
                        </ProtectedRoute>
                      } />
                      <Route path="/configuracoes" element={
                        <ProtectedRoute>
                          <Configuracoes />
                        </ProtectedRoute>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </SubscriptionRedirect>
                </main>
              </div>
            </div>
            <MobileBottomNav />
            <Toaster />
            <Sonner />
          </SidebarProvider>
        </BrowserRouter>
        </FinancialDataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;