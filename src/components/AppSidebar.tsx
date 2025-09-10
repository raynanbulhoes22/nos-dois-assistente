import { 
  Home, 
  TrendingUp, 
  TrendingDown, 
  Crown, 
  Target, 
  CreditCard,
  AlertTriangle, 
  FileText, 
  Settings,
  LogOut,
  Clock,
  HelpCircle,
  Shield
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useHelpCenterContext } from "@/contexts/HelpCenterContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavigationItem {
  title: string;
  url: string;
  icon: any;
  disabled?: boolean;
  comingSoon?: boolean;
}

const mainNavigationItems: NavigationItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Movimentações", url: "/movimentacoes", icon: TrendingUp },
  { title: "Orçamento", url: "/orcamento", icon: Target },
  { title: "Cartões", url: "/cartoes", icon: CreditCard },
  { title: "Dívidas", url: "/dividas", icon: TrendingDown, disabled: true, comingSoon: true },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
];

const bottomNavigationItems = [
  { title: "Meu Plano", url: "/assinaturas", icon: Crown },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { subscriptionStatus } = useAuth();
  const { isAdmin } = useAdminAuth();
  const currentPath = location.pathname;
  const { toast } = useToast();
  const { openHelp } = useHelpCenterContext();

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50";

  // Show all main navigation items - subscription check is handled by ProtectedRoute
  const availableMainItems = mainNavigationItems;
  
  const availableBottomItems = bottomNavigationItems;

  const handleDisabledItemClick = (itemTitle: string) => {
    toast({
      title: "Funcionalidade em breve!",
      description: `${itemTitle} estará disponível em breve.`,
    });
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível fazer logout.",
        variant: "destructive"
      });
    }
  };

  return (
    <Sidebar 
      className={state === "collapsed" ? "w-14" : "w-64 sm:w-64"} 
      collapsible="icon"
    >
      <SidebarContent className="flex flex-col h-full overflow-y-auto">
        {/* Main Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : "px-4 py-2"}>
            Lyvo | LucraAI
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
               {availableMainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.disabled ? (
                      <button
                        onClick={() => handleDisabledItemClick(item.title)}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2 
                          text-sm font-medium transition-all duration-200 
                          touch-manipulation min-h-[44px] sm:min-h-[36px]
                          text-muted-foreground cursor-not-allowed opacity-50 w-full text-left"
                      >
                        <item.icon className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" />
                        {state !== "collapsed" && (
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">{item.title}</span>
                             {item.comingSoon && (
                              <Badge variant="secondary" className="text-xs">Em breve</Badge>
                             )}
                          </div>
                        )}
                      </button>
                    ) : (
                      <NavLink
                        to={item.url}
                        className={({ isActive }) => `${getNavCls({ isActive })} 
                          flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2 
                          text-sm font-medium transition-all duration-200 
                          touch-manipulation min-h-[44px] sm:min-h-[36px]
                          hover:bg-accent/80 active:bg-accent/90`}
                      >
                        <item.icon className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" />
                        {state !== "collapsed" && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Bottom Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {/* Help Center */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => openHelp()}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2 
                      text-sm font-medium transition-all duration-200 
                      touch-manipulation min-h-[44px] sm:min-h-[36px]
                      hover:bg-accent/80 active:bg-accent/90 w-full text-left"
                  >
                    <HelpCircle className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" />
                    {state !== "collapsed" && (
                      <span className="truncate">Central de Ajuda</span>
                    )}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Super Admin - Apenas para admin */}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/super-admin"
                      className={({ isActive }) => `${getNavCls({ isActive })} 
                        flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2 
                        text-sm font-medium transition-all duration-200 
                        touch-manipulation min-h-[44px] sm:min-h-[36px]
                        hover:bg-accent/80 active:bg-accent/90 border border-amber-200 dark:border-amber-800`}
                    >
                      <Shield className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                      {state !== "collapsed" && (
                        <span className="truncate text-amber-600 dark:text-amber-400">Super Admin</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {availableBottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => `${getNavCls({ isActive })} 
                        flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2 
                        text-sm font-medium transition-all duration-200 
                        touch-manipulation min-h-[44px] sm:min-h-[36px]
                        hover:bg-accent/80 active:bg-accent/90`}
                    >
                      <item.icon className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" />
                      {state !== "collapsed" && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Logout Button */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2 
                      text-sm font-medium transition-all duration-200 
                      touch-manipulation min-h-[44px] sm:min-h-[36px]
                      hover:bg-destructive/10 hover:text-destructive w-full text-left"
                  >
                    <LogOut className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" />
                    {state !== "collapsed" && (
                      <span className="truncate">Sair</span>
                    )}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}