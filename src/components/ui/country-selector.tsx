import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  flag: string
  dialCode: string
  mask?: string
}

export const countries: Country[] = [
  { code: "BR", name: "Brasil", flag: "🇧🇷", dialCode: "+55", mask: "(99) 99999-9999" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", dialCode: "+54" },
  { code: "AU", name: "Austrália", flag: "🇦🇺", dialCode: "+61" },
  { code: "AT", name: "Áustria", flag: "🇦🇹", dialCode: "+43" },
  { code: "BE", name: "Bélgica", flag: "🇧🇪", dialCode: "+32" },
  { code: "BO", name: "Bolívia", flag: "🇧🇴", dialCode: "+591" },
  { code: "CA", name: "Canadá", flag: "🇨🇦", dialCode: "+1" },
  { code: "CL", name: "Chile", flag: "🇨🇱", dialCode: "+56" },
  { code: "CN", name: "China", flag: "🇨🇳", dialCode: "+86" },
  { code: "CO", name: "Colômbia", flag: "🇨🇴", dialCode: "+57" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", dialCode: "+506" },
  { code: "DK", name: "Dinamarca", flag: "🇩🇰", dialCode: "+45" },
  { code: "EC", name: "Equador", flag: "🇪🇨", dialCode: "+593" },
  { code: "EG", name: "Egito", flag: "🇪🇬", dialCode: "+20" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", dialCode: "+503" },
  { code: "ES", name: "Espanha", flag: "🇪🇸", dialCode: "+34" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸", dialCode: "+1" },
  { code: "FI", name: "Finlândia", flag: "🇫🇮", dialCode: "+358" },
  { code: "FR", name: "França", flag: "🇫🇷", dialCode: "+33" },
  { code: "DE", name: "Alemanha", flag: "🇩🇪", dialCode: "+49" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", dialCode: "+502" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", dialCode: "+504" },
  { code: "IN", name: "Índia", flag: "🇮🇳", dialCode: "+91" },
  { code: "IT", name: "Itália", flag: "🇮🇹", dialCode: "+39" },
  { code: "JP", name: "Japão", flag: "🇯🇵", dialCode: "+81" },
  { code: "MX", name: "México", flag: "🇲🇽", dialCode: "+52" },
  { code: "NL", name: "Holanda", flag: "🇳🇱", dialCode: "+31" },
  { code: "NZ", name: "Nova Zelândia", flag: "🇳🇿", dialCode: "+64" },
  { code: "NO", name: "Noruega", flag: "🇳🇴", dialCode: "+47" },
  { code: "PA", name: "Panamá", flag: "🇵🇦", dialCode: "+507" },
  { code: "PY", name: "Paraguai", flag: "🇵🇾", dialCode: "+595" },
  { code: "PE", name: "Peru", flag: "🇵🇪", dialCode: "+51" },
  { code: "PL", name: "Polônia", flag: "🇵🇱", dialCode: "+48" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dialCode: "+351" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧", dialCode: "+44" },
  { code: "RU", name: "Rússia", flag: "🇷🇺", dialCode: "+7" },
  { code: "SE", name: "Suécia", flag: "🇸🇪", dialCode: "+46" },
  { code: "CH", name: "Suíça", flag: "🇨🇭", dialCode: "+41" },
  { code: "UY", name: "Uruguai", flag: "🇺🇾", dialCode: "+598" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", dialCode: "+58" }
]

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
          className="w-[180px] justify-between"
          disabled={disabled}
        >
          {value ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{value.flag}</span>
              <span className="text-sm font-mono">{value.dialCode}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-lg">🇧🇷</span>
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
                    <span className="text-lg">{country.flag}</span>
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