import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, Shield, Target, Settings } from 'lucide-react';
import { useCookieConsent, type CookiePreferences } from '@/hooks/useCookieConsent';

export const CookieConsentBanner = () => {
  const { showBanner, acceptAll, acceptNecessary, savePreferences } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [tempPreferences, setTempPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  if (!showBanner) return null;

  const handleSaveSettings = () => {
    savePreferences(tempPreferences);
    setShowSettings(false);
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
        <Card className="border-primary shadow-lg bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Cookies e Privacidade</CardTitle>
            </div>
            <CardDescription>
              Usamos cookies para melhorar sua experiência e analisar o uso da plataforma. 
              Você pode escolher quais tipos de cookies aceitar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={acceptAll} className="flex-1">
                Aceitar Todos
              </Button>
              <Button 
                variant="outline" 
                onClick={acceptNecessary}
                className="flex-1"
              >
                Apenas Necessários
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSettings(true)}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar Preferências
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configurações de Cookies
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">Cookies Necessários</h4>
                  <p className="text-sm text-muted-foreground">
                    Essenciais para o funcionamento básico da plataforma
                  </p>
                </div>
                <Switch checked={true} disabled />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">Cookies Analíticos</h4>
                  <p className="text-sm text-muted-foreground">
                    Nos ajudam a entender como você usa a plataforma
                  </p>
                </div>
                <Switch 
                  checked={tempPreferences.analytics}
                  onCheckedChange={(checked) => 
                    setTempPreferences(prev => ({ ...prev, analytics: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">Cookies de Marketing</h4>
                  <p className="text-sm text-muted-foreground">
                    Permitem anúncios personalizados e medição de campanhas
                  </p>
                </div>
                <Switch 
                  checked={tempPreferences.marketing}
                  onCheckedChange={(checked) => 
                    setTempPreferences(prev => ({ ...prev, marketing: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">Cookies Funcionais</h4>
                  <p className="text-sm text-muted-foreground">
                    Melhoram a funcionalidade e personalização
                  </p>
                </div>
                <Switch 
                  checked={tempPreferences.functional}
                  onCheckedChange={(checked) => 
                    setTempPreferences(prev => ({ ...prev, functional: checked }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveSettings}>
                Salvar Preferências
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};