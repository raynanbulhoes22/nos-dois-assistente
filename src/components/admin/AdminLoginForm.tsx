import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Shield } from "lucide-react";

export const AdminLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('[AdminLoginForm] Starting login process...');
      console.log('[AdminLoginForm] Attempting login with:', { email: email.trim() });
      
      // Test basic connectivity first
      const SUPABASE_URL = "https://hgdwjxmorrpqdmxslwmz.supabase.co";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZHdqeG1vcnJwcWRteHNsd216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODgyNzgsImV4cCI6MjA2Njc2NDI3OH0.RrgvKfuMkFtCFbK28CB-2xd6-eDk6y8CAAwpAfHCfAY";
      
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': SUPABASE_KEY,
          }
        });
        console.log('[AdminLoginForm] Connectivity test:', response.status);
      } catch (connectError) {
        console.error('[AdminLoginForm] Connectivity test failed:', connectError);
        toast.error("Falha na conectividade com Supabase. Verifique as configurações de rede.");
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log('[AdminLoginForm] Login response:', { data, error });

      if (error) {
        console.error('[AdminLoginForm] Login error:', error);
        
        // Check for network/CSP issues
        if (error.message.includes('Failed to fetch') || error.name.includes('AuthRetryableFetchError')) {
          toast.error("Erro de conectividade. Possível bloqueio de segurança do navegador.");
          console.error('[AdminLoginForm] Network/CSP error detected. This might be a sandbox/CSP restriction.');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error("Email ou senha incorretos");
        } else if (error.message.includes('Email not confirmed')) {
          toast.error("Email não confirmado. Verifique sua caixa de entrada.");
        } else {
          toast.error(`Erro ao fazer login: ${error.message}`);
        }
        return;
      }

      if (data?.user) {
        console.log('[AdminLoginForm] Login successful:', data.user.email);
        toast.success("Login realizado com sucesso");
        // Force a page refresh to ensure auth state is updated
        window.location.reload();
      } else {
        console.warn('[AdminLoginForm] No user data received');
        toast.error("Resposta inesperada do servidor");
      }
    } catch (error) {
      console.error('[AdminLoginForm] Unexpected error:', error);
      toast.error("Erro de conectividade. Pode ser um problema de CORS ou CSP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@exemplo.com"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="admin-password">Senha</Label>
        <div className="relative">
          <Input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Entrando...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Entrar no Admin
          </div>
        )}
      </Button>
    </form>
  );
};