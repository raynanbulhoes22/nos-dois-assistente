import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Lightbulb } from "lucide-react";

const Sobre = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Sobre o Lyvo
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nossa missão é democratizar o controle financeiro, oferecendo ferramentas 
              simples e inteligentes para todos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nossa Missão</h3>
                <p className="text-muted-foreground">
                  Simplificar a gestão financeira pessoal através da tecnologia, 
                  tornando-a acessível para todos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nossa Visão</h3>
                <p className="text-muted-foreground">
                  Ser a plataforma de referência em organização financeira pessoal 
                  no Brasil.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nossos Valores</h3>
                <p className="text-muted-foreground">
                  Transparência, simplicidade e foco na experiência do usuário 
                  guiam todas nossas decisões.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Nossa História
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                O Lyvo nasceu da necessidade de criar uma solução verdadeiramente 
                simples para controle financeiro pessoal. Percebemos que a maioria 
                das ferramentas disponíveis eram complexas demais ou não atendiam 
                às necessidades reais dos brasileiros.
              </p>
              <p className="text-lg text-muted-foreground">
                Desde o início, nosso foco é criar uma experiência intuitiva que 
                qualquer pessoa possa usar, independente de sua experiência com 
                tecnologia ou conhecimento financeiro.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Entre em Contato
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div>
                <h3 className="font-semibold mb-2">Suporte</h3>
                <p className="text-muted-foreground">suporte@lyvo.com.br</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Comercial</h3>
                <p className="text-muted-foreground">vendas@lyvo.com.br</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sobre;