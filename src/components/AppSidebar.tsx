import { 
  Home, 
  TrendingUp, 
  TrendingDown, 
  Crown, 
  Target, 
  AlertTriangle, 
  FileText, 
  Settings,
  LogOut 
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const mainNavigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Movimentações", url: "/movimentacoes", icon: TrendingUp },
  { title: "Orçamento", url: "/orcamento", icon: Target },
  { title: "Dívidas", url: "/dividas", icon: TrendingDown },
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
  const currentPath = location.pathname;
  const { toast } = useToast();

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50";

  // Filter navigation items based on subscription status
  const availableMainItems = subscriptionStatus?.subscribed 
    ? mainNavigationItems 
    : [];
  
  const availableBottomItems = bottomNavigationItems;

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
            LucraAI
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {availableMainItems.map((item) => (
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Bottom Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
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