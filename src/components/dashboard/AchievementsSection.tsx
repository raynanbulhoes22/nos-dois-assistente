import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy,
  Target,
  Star,
  Award,
  CheckCircle
} from "lucide-react";
import { Achievement } from "@/hooks/useSmartDashboard";

interface AchievementsSectionProps {
  conquistas: Achievement[];
}

export const AchievementsSection = ({
  conquistas
}: AchievementsSectionProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const conquistasConcluidas = conquistas.filter(c => c.concluido).length;
  const totalConquistas = conquistas.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Conquistas
          </CardTitle>
          <Badge variant="secondary">
            {conquistasConcluidas}/{totalConquistas}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Acompanhe seu progresso e conquistas financeiras
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {conquistas.length > 0 ? (
          <>
            {/* Resumo das Conquistas */}
            {totalConquistas > 0 && (
              <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progresso Geral</span>
                  <span className="text-sm font-bold">
                    {((conquistasConcluidas / totalConquistas) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={(conquistasConcluidas / totalConquistas) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {conquistasConcluidas > 0 
                    ? `Parabéns! Você já conquistou ${conquistasConcluidas} ${conquistasConcluidas === 1 ? 'meta' : 'metas'}!`
                    : 'Continue se dedicando para conquistar suas primeiras metas!'
                  }
                </p>
              </div>
            )}

            {/* Lista de Conquistas */}
            <div className="space-y-4">
              {conquistas.map((conquista) => (
                <div
                  key={conquista.id}
                  className={`p-4 rounded-lg border transition-all ${
                    conquista.concluido 
                      ? 'bg-success/10 border-success/30' 
                      : 'bg-muted/20 border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      conquista.concluido 
                        ? 'bg-success text-success-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {conquista.concluido ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Target className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm flex items-center gap-2">
                          <span>{conquista.icone}</span>
                          {conquista.titulo}
                        </h5>
                        {conquista.concluido && (
                          <Badge variant="default" className="bg-success">
                            <Star className="h-3 w-3 mr-1" />
                            Concluída
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {conquista.descricao}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">
                            {formatCurrency(conquista.atual)} / {formatCurrency(conquista.meta)}
                          </span>
                        </div>
                        
                        <Progress 
                          value={conquista.progresso} 
                          className={`h-2 ${
                            conquista.concluido 
                              ? '[&>div]:bg-success' 
                              : ''
                          }`}
                        />
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{conquista.progresso.toFixed(1)}% concluído</span>
                          {!conquista.concluido && conquista.progresso > 0 && (
                            <span>
                              Faltam {formatCurrency(Math.max(0, conquista.meta - conquista.atual))}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Award className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h4 className="font-medium text-sm mb-2">Nenhuma meta definida</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Defina metas financeiras para acompanhar seu progresso e conquistar seus objetivos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};