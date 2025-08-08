import { 
  Home, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Target, 
  AlertTriangle, 
  FileText, 
  Settings 
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

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

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Movimentações", url: "/movimentacoes", icon: TrendingUp },
  { title: "Meu Plano", url: "/assinaturas", icon: CreditCard },
  { title: "Orçamento", url: "/orcamento", icon: Target },
  { title: "Dívidas", url: "/dividas", icon: AlertTriangle },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { subscriptionStatus } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50";

  // Filter navigation items based on subscription status
  const availableItems = subscriptionStatus?.subscribed 
    ? navigationItems 
    : navigationItems.filter(item => item.url === '/assinaturas');

  return (
    <Sidebar 
      className={state === "collapsed" ? "w-14" : "w-64 sm:w-64"} 
      collapsible="icon"
    >
      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : "px-4 py-2"}>
            LucraAI
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {availableItems.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}