import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import "flag-icons/css/flag-icons.min.css"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { brazilianStates, getDDDOptions, type DDDOption, type BrazilianState } from "@/lib/brazilian-states"

// Re-export types for external use
export type { DDDOption, BrazilianState } from "@/lib/brazilian-states"

// Componente para renderizar emoji do estado brasileiro
const StateEmoji = ({ emoji, className }: { emoji: string; className?: string }) => (
  <span className={cn("text-lg", className)}>{emoji}</span>
)

interface DDDSelectorProps {
  value?: DDDOption
  onSelect: (option: DDDOption) => void
  disabled?: boolean
}

export function DDDSelector({ value, onSelect, disabled }: DDDSelectorProps) {
  const [open, setOpen] = React.useState(false)
  
  // Obter todas as opções de DDD
  const dddOptions = React.useMemo(() => getDDDOptions(), [])
  
  // SP e RJ primeiro, depois ordenado por DDD
  const sortedOptions = React.useMemo(() => {
    const spOptions = dddOptions.filter(opt => opt.state.code === "SP")
    const rjOptions = dddOptions.filter(opt => opt.state.code === "RJ")
    const otherOptions = dddOptions
      .filter(opt => opt.state.code !== "SP" && opt.state.code !== "RJ")
      .sort((a, b) => a.ddd.localeCompare(b.ddd))
    
    return [...spOptions, ...rjOptions, ...otherOptions]
  }, [dddOptions])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[120px] sm:w-[140px] justify-between shrink-0"
          disabled={disabled}
        >
          {value ? (
            <div className="flex items-center gap-2">
              <StateEmoji emoji={value.state.emoji} className="w-4 h-4" />
              <span className="text-sm font-mono">{value.state.code} ({value.ddd})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <StateEmoji emoji="🏙️" className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">Estado (DDD)</span>
            </div>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0">
        <Command>
          <CommandInput placeholder="Buscar DDD ou estado..." />
          <CommandList>
            <CommandEmpty>Nenhum DDD encontrado.</CommandEmpty>
            <CommandGroup>
              {sortedOptions.map((option) => (
                <CommandItem
                  key={`${option.state.code}-${option.ddd}`}
                  value={`${option.state.code} ${option.ddd} ${option.state.name}`}
                  onSelect={() => {
                    onSelect(option)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <StateEmoji emoji={option.state.emoji} className="w-4 h-4" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{option.state.code}</span>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      ({option.ddd})
                    </span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        value?.ddd === option.ddd && value?.state.code === option.state.code 
                          ? "opacity-100" 
                          : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Hook para extrair DDD de um número existente
 */
export const useDDDFromPhone = (phoneNumber: string): DDDOption | undefined => {
  return React.useMemo(() => {
    if (!phoneNumber) return undefined
    
    // Remove formatação e extrai apenas números
    const digits = phoneNumber.replace(/\D/g, '')
    
    // Se tem formato completo (55 + DDD + número)
    if (digits.length >= 4 && digits.startsWith('55')) {
      const possibleDDD = digits.substring(2, 4)
      const options = getDDDOptions()
      return options.find(opt => opt.ddd === possibleDDD)
    }
    
    // Se tem formato local (DDD + número)
    if (digits.length >= 2) {
      const possibleDDD = digits.substring(0, 2)
      const options = getDDDOptions()
      return options.find(opt => opt.ddd === possibleDDD)
    }
    
    return undefined
  }, [phoneNumber])
}