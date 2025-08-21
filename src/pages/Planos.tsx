import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const Planos = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Escolha o melhor plano para você
            </h1>
            <p className="text-xl text-muted-foreground">
              Comece grátis e evolua conforme suas necessidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Gratuito</CardTitle>
                <div className="text-3xl font-bold">R$ 0</div>
                <p className="text-muted-foreground">Para começar</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    Até 50 transações/mês
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    Relatórios básicos
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    Suporte por email
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  Começar Grátis
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <div className="text-3xl font-bold">R$ 19,90</div>
                <p className="text-muted-foreground">Por mês</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    Transações ilimitadas
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    Relatórios avançados
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    Suporte prioritário
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    Exportação de dados
                  </li>
                </ul>
                <Button className="w-full mt-6">
                  Escolher Pro
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <div className="text-3xl font-bold">R$ 49,90</div>
                <p className="text-muted-foreground">Por mês</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    Tudo do Pro
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    API integrations
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    Suporte 24/7
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    Consultoria financeira
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  Falar com vendas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planos;