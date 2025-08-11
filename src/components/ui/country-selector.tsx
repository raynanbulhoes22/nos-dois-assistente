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

export interface Country {
  code: string
  name: string
  dialCode: string
  mask?: string
}

export const countries: Country[] = [
  { code: "BR", name: "Brasil", dialCode: "+55", mask: "(99) 99999-9999" },
  { code: "AR", name: "Argentina", dialCode: "+54" },
  { code: "AU", name: "Austrália", dialCode: "+61" },
  { code: "AT", name: "Áustria", dialCode: "+43" },
  { code: "BE", name: "Bélgica", dialCode: "+32" },
  { code: "BO", name: "Bolívia", dialCode: "+591" },
  { code: "CA", name: "Canadá", dialCode: "+1" },
  { code: "CL", name: "Chile", dialCode: "+56" },
  { code: "CN", name: "China", dialCode: "+86" },
  { code: "CO", name: "Colômbia", dialCode: "+57" },
  { code: "CR", name: "Costa Rica", dialCode: "+506" },
  { code: "DK", name: "Dinamarca", dialCode: "+45" },
  { code: "EC", name: "Equador", dialCode: "+593" },
  { code: "EG", name: "Egito", dialCode: "+20" },
  { code: "SV", name: "El Salvador", dialCode: "+503" },
  { code: "ES", name: "Espanha", dialCode: "+34" },
  { code: "US", name: "Estados Unidos", dialCode: "+1" },
  { code: "FI", name: "Finlândia", dialCode: "+358" },
  { code: "FR", name: "França", dialCode: "+33" },
  { code: "DE", name: "Alemanha", dialCode: "+49" },
  { code: "GT", name: "Guatemala", dialCode: "+502" },
  { code: "HN", name: "Honduras", dialCode: "+504" },
  { code: "IN", name: "Índia", dialCode: "+91" },
  { code: "IT", name: "Itália", dialCode: "+39" },
  { code: "JP", name: "Japão", dialCode: "+81" },
  { code: "MX", name: "México", dialCode: "+52" },
  { code: "NL", name: "Holanda", dialCode: "+31" },
  { code: "NZ", name: "Nova Zelândia", dialCode: "+64" },
  { code: "NO", name: "Noruega", dialCode: "+47" },
  { code: "PA", name: "Panamá", dialCode: "+507" },
  { code: "PY", name: "Paraguai", dialCode: "+595" },
  { code: "PE", name: "Peru", dialCode: "+51" },
  { code: "PL", name: "Polônia", dialCode: "+48" },
  { code: "PT", name: "Portugal", dialCode: "+351" },
  { code: "GB", name: "Reino Unido", dialCode: "+44" },
  { code: "RU", name: "Rússia", dialCode: "+7" },
  { code: "SE", name: "Suécia", dialCode: "+46" },
  { code: "CH", name: "Suíça", dialCode: "+41" },
  { code: "UY", name: "Uruguai", dialCode: "+598" },
  { code: "VE", name: "Venezuela", dialCode: "+58" }
]

// Component to render flag icon
const FlagIcon = ({ code, className }: { code: string; className?: string }) => (
  <span className={cn(`fi fi-${code.toLowerCase()}`, className)} />
)

interface CountrySelectorProps {
  value?: Country
  onSelect: (country: Country) => void
  disabled?: boolean
}

export function CountrySelector({ value, onSelect, disabled }: CountrySelectorProps) {
  const [open, setOpen] = React.useState(false)

  // Brasil always first, then others alphabetically
  const sortedCountries = React.useMemo(() => {
    const brazil = countries.find(c => c.code === "BR")!
    const others = countries.filter(c => c.code !== "BR").sort((a, b) => a.name.localeCompare(b.name))
    return [brazil, ...others]
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[100px] sm:w-[120px] justify-between shrink-0"
          disabled={disabled}
        >
          {value ? (
            <div className="flex items-center gap-2">
              <FlagIcon code={value.code} className="w-4 h-3" />
              <span className="text-sm font-mono">{value.dialCode}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FlagIcon code="BR" className="w-4 h-3" />
              <span className="text-sm font-mono">+55</span>
            </div>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar país..." />
          <CommandList>
            <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
            <CommandGroup>
              {sortedCountries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.dialCode}`}
                  onSelect={() => {
                    onSelect(country)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <FlagIcon code={country.code} className="w-4 h-3" />
                    <div className="flex-1">
                      <span className="text-sm">{country.name}</span>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      {country.dialCode}
                    </span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        value?.code === country.code ? "opacity-100" : "opacity-0"
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