import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Lightbulb } from "lucide-react";

interface ContextualTooltipProps {
  children: ReactNode;
  title: string;
  description: string;
  tip?: string;
  type?: "help" | "tip";
  side?: "top" | "bottom" | "left" | "right";
}

export const ContextualTooltip = ({ 
  children, 
  title, 
  description, 
  tip, 
  type = "help",
  side = "top" 
}: ContextualTooltipProps) => {
  const Icon = type === "help" ? HelpCircle : Lightbulb;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative group cursor-help">
            {children}
            <Icon className="h-3 w-3 text-muted-foreground/60 group-hover:text-muted-foreground absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="font-medium">{title}</span>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            {tip && (
              <div className="pt-2 border-t">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-3 w-3 mt-0.5 text-yellow-500" />
                  <p className="text-xs text-muted-foreground">{tip}</p>
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};