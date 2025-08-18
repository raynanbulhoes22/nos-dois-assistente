import * as React from "react"
import { Input } from "@/components/ui/input"
import { CountrySelector, Country, countries } from "@/components/ui/country-selector"
import { DDDSelector, useDDDFromPhone, type DDDOption } from "@/components/ui/ddd-selector"
import { cn } from "@/lib/utils"
import { normalizePhoneNumber, normalizeBrazilianPhone, extractDDDFromPhone, extractNumberFromPhone, validatePhoneNumber, formatPhoneForDisplay } from "@/lib/phone-utils"

interface PhoneInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function PhoneInput({ value = "", onChange, placeholder, disabled, className }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = React.useState<Country>(() => {
    // Default to Brazil
    return countries.find(c => c.code === "BR")!
  })
  
  const [selectedDDD, setSelectedDDD] = React.useState<DDDOption | undefined>()
  const [phoneNumber, setPhoneNumber] = React.useState("")
  
  // Hook para extrair DDD de números existentes
  const extractedDDD = useDDDFromPhone(value)

  // Parse initial value if provided
  React.useEffect(() => {
    if (value && value !== phoneNumber) {
      console.log('PhoneInput: Parsing initial value:', value);
      
      // Para números brasileiros normalizados
      if (value.match(/^55\d{10}$/)) {
        const ddd = extractDDDFromPhone(value);
        const number = extractNumberFromPhone(value);
        
        if (ddd && number && extractedDDD) {
          console.log('PhoneInput: Número brasileiro detectado, DDD:', ddd, 'Número:', number);
          setSelectedDDD(extractedDDD);
          setPhoneNumber(formatBrazilianNumber(number));
          return;
        }
      }
      
      // Try to extract country code and number from international format
      const cleanValue = value.replace(/\D/g, '')
      
      // Find matching country by dial code
      let matchedCountry = countries.find(country => {
        const dialCode = country.dialCode.replace('+', '')
        return cleanValue.startsWith(dialCode)
      })
      
      if (matchedCountry) {
        setSelectedCountry(matchedCountry)
        const dialCode = matchedCountry.dialCode.replace('+', '')
        const number = cleanValue.slice(dialCode.length)
        setPhoneNumber(formatPhoneNumber(number, matchedCountry))
      } else {
        // If no country matched, treat as local number for current country
        setPhoneNumber(formatPhoneNumber(cleanValue, selectedCountry))
      }
    }
  }, [value, extractedDDD])

  const formatBrazilianNumber = (number: string): string => {
    // Remove all non-digits and limit to 8
    const cleaned = number.replace(/\D/g, '').slice(0, 8)
    
    // Format as 9999-9999
    const match = cleaned.match(/^(\d{0,4})(\d{0,4})$/)
    if (match) {
      let formatted = match[1]
      if (match[1] && match[1].length === 4 && match[2]) {
        formatted += `-${match[2]}`
      }
      return formatted
    }
    
    return cleaned
  }

  const formatPhoneNumber = (number: string, country: Country): string => {
    // Remove all non-digits
    const cleaned = number.replace(/\D/g, '')
    
    // For Brazil, don't format here anymore (handled separately)
    if (country.code === "BR") {
      return cleaned
    }
    
    // For other countries, just return the cleaned number
    return cleaned
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    if (selectedCountry.code === 'BR') {
      // Para Brasil, formatar como número de 8 dígitos
      const formatted = formatBrazilianNumber(input);
      setPhoneNumber(formatted);
      
      // Só normalizar se temos DDD selecionado e 8 dígitos
      if (selectedDDD && formatted.replace(/\D/g, '').length === 8) {
        const normalized = normalizeBrazilianPhone(selectedDDD.ddd, formatted.replace(/\D/g, ''));
        console.log('Número brasileiro normalizado:', normalized);
        onChange?.(normalized);
      } else {
        // Limpar valor se não está completo
        onChange?.('');
      }
    } else {
      // Para outros países, usar lógica anterior
      const formatted = formatPhoneNumber(input, selectedCountry);
      setPhoneNumber(formatted);
      
      const digitsOnly = formatted.replace(/\D/g, '');
      const withDialCode = selectedCountry.dialCode + digitsOnly;
      onChange?.(withDialCode);
    }
  };

  const handleDDDSelect = (ddd: DDDOption) => {
    setSelectedDDD(ddd);
    
    // Se já temos um número de 8 dígitos, normalizar imediatamente
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length === 8) {
      const normalized = normalizeBrazilianPhone(ddd.ddd, digitsOnly);
      onChange?.(normalized);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    
    // Reset DDD quando mudar de país
    if (country.code !== 'BR') {
      setSelectedDDD(undefined);
    }
    
    // Para Brasil, limpar campos para nova seleção
    if (country.code === 'BR') {
      setPhoneNumber('');
      onChange?.('');
    } else if (phoneNumber) {
      // For other countries, format with new dial code
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      const withDialCode = country.dialCode + digitsOnly;
      onChange?.(withDialCode);
    }
  };

  // Atualizar DDD quando valor inicial for detectado
  React.useEffect(() => {
    if (extractedDDD && !selectedDDD) {
      setSelectedDDD(extractedDDD);
    }
  }, [extractedDDD, selectedDDD]);

  const isBrazil = selectedCountry.code === 'BR';
  const is8Digits = phoneNumber.replace(/\D/g, '').length === 8;
  const isValidBrazilian = isBrazil && selectedDDD && is8Digits;

  return (
    <div className={cn("flex gap-2", className)}>
      <CountrySelector
        value={selectedCountry}
        onSelect={handleCountrySelect}
        disabled={disabled}
      />
      
      {isBrazil && (
        <DDDSelector
          value={selectedDDD}
          onSelect={handleDDDSelect}
          disabled={disabled}
        />
      )}
      
      <Input
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder={
          isBrazil 
            ? "Digite os 8 dígitos (9999-9999)" 
            : placeholder || selectedCountry.mask || "Digite o número"
        }
        disabled={disabled}
        className={cn(
          "flex-1",
          isBrazil && !isValidBrazilian && phoneNumber ? "border-yellow-500" : ""
        )}
        maxLength={isBrazil ? 9 : undefined} // 8 dígitos + 1 hífen
      />
      
      {isBrazil && phoneNumber && (
        <div className="flex items-center text-xs text-muted-foreground">
          {phoneNumber.replace(/\D/g, '').length}/8
        </div>
      )}
    </div>
  )
}