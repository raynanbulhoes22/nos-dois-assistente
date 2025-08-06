import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, CreditCard, User, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Cartao {
  id: string;
  nome: string;
  final: string;
  limite: number;
}

interface Profile {
  id: string;
  nome?: string;
  email?: string;
  grupo_id?: string;
  numero_wpp?: string;
}

export const Configuracoes = () => {
  const { user } = useAuth();
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isConnectingWhatsapp, setIsConnectingWhatsapp] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    
    try {
      // Por enquanto, vamos simular dados até que as tabelas sejam criadas
      const mockCartoes: Cartao[] = [
        {
          id: '1',
          nome: 'Cartão Principal',
          final: '4567',
          limite: 5000
        }
      ];
      setCartoes(mockCartoes);

      // Buscar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setProfile(profileData);
      setWhatsappNumber((profileData as any)?.numero_wpp || "");

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizePhoneNumber = (phone: string): string => {
    // Remove todos os caracteres que não são dígitos
    return phone.replace(/\D/g, '');
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const normalized = normalizePhoneNumber(phone);
    // Deve ter entre 10 e 15 dígitos
    return normalized.length >= 10 && normalized.length <= 15;
  };

  const handleConnectWhatsapp = async () => {
    if (!user) return;

    if (!validatePhoneNumber(whatsappNumber)) {
      toast({
        title: "❌ Número inválido",
        description: "Verifique e tente novamente.",
        variant: "destructive"
      });
      return;
    }

    setIsConnectingWhatsapp(true);

    try {
      const normalizedNumber = normalizePhoneNumber(whatsappNumber);
      
      const { error } = await supabase
        .from('profiles')
        .update({ numero_wpp: normalizedNumber } as any)
        .eq('id', user.id);

      if (error) throw error;

      // Atualizar o estado local
      setProfile(prev => prev ? { ...prev, numero_wpp: normalizedNumber } : null);
      
      toast({
        title: "✅ Sucesso!",
        description: "Seu número foi conectado com sucesso!"
      });

    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível conectar seu número. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsConnectingWhatsapp(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>

      <div className="space-y-6">
        {/* Perfil do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={profile?.nome || ""}
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button>Salvar Alterações</Button>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Casal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Sistema de Casal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Modo Individual</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualizar apenas suas próprias transações
                  </p>
                </div>
                <Switch />
              </div>
              
              <Separator />
              
              <div>
                <Label>Código do Grupo</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Digite o código do seu parceiro"
                    value={profile?.grupo_id || ""}
                  />
                  <Button variant="outline">Conectar</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Seu código: <code className="bg-muted px-1 rounded">{user?.id.slice(0, 8)}</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cartões de Crédito */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Cartões de Crédito
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Novo Cartão
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cartoes.length > 0 ? (
              <div className="space-y-3">
                {cartoes.map((cartao) => (
                  <div key={cartao.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{cartao.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        •••• •••• •••• {cartao.final}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Limite: {formatCurrency(cartao.limite)}</p>
                      <Badge variant="outline">Ativo</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum cartão cadastrado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">E-mail</h3>
                  <p className="text-sm text-muted-foreground">
                    Receber relatórios mensais por e-mail
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Lembretes de Pagamento</h3>
                  <p className="text-sm text-muted-foreground">
                    Alertas sobre vencimentos próximos
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Alertas de Orçamento</h3>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando ultrapassar 80% do orçamento
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integração WhatsApp */}
        <Card>
          <CardHeader>
            <CardTitle>Integração WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Conecte seu WhatsApp para registrar gastos por mensagem ou áudio
              </p>
              
              <div className="flex gap-2">
                <Input 
                  placeholder="+55 (11) 99999-9999" 
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  onClick={handleConnectWhatsapp}
                  disabled={isConnectingWhatsapp}
                >
                  {isConnectingWhatsapp ? "Conectando..." : "Conectar"}
                </Button>
              </div>
              
              <div className="p-3 bg-accent/50 rounded-lg">
                <p className="text-sm">
                  <strong>Como usar:</strong> Envie mensagens como "Gastei R$ 50 no supermercado" 
                  para registrar automaticamente suas despesas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metas Financeiras */}
        <Card>
          <CardHeader>
            <CardTitle>Metas Financeiras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meta-economia">Meta de Economia Mensal</Label>
                <Input
                  id="meta-economia"
                  type="number"
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="limite-gastos">Limite de Gastos Mensais</Label>
                <Input
                  id="limite-gastos"
                  type="number"
                  placeholder="3000"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button>Salvar Metas</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};