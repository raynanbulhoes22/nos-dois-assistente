import * as React from "react"
import { Input } from "@/components/ui/input"
import { CountrySelector, Country, countries } from "@/components/ui/country-selector"
import { cn } from "@/lib/utils"
import { normalizePhoneNumber, validatePhoneNumber, formatPhoneForDisplay } from "@/lib/phone-utils"

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
  
  const [phoneNumber, setPhoneNumber] = React.useState("")

  // Parse initial value if provided
  React.useEffect(() => {
    if (value && value !== phoneNumber) {
      console.log('PhoneInput: Parsing initial value:', value);
      
      // Se o valor já está normalizado (como 556992290572), exibir formatado
      if (value.match(/^55\d{10,11}$/)) {
        const formatted = formatPhoneForDisplay(value);
        console.log('PhoneInput: Valor já normalizado, formatando para exibição:', formatted);
        setPhoneNumber(formatted);
        return;
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
  }, [value])

  const formatPhoneNumber = (number: string, country: Country): string => {
    // Remove all non-digits
    const cleaned = number.replace(/\D/g, '')
    
    // Apply country-specific formatting
    if (country.code === "BR" && country.mask) {
      // Brazilian format: (99) 9999-9999 (DDD + 8 dígitos)
      // Limitar a 10 dígitos máximo
      const limitedCleaned = cleaned.slice(0, 10)
      
      if (limitedCleaned.length <= 10) {
        const match = limitedCleaned.match(/^(\d{0,2})(\d{0,4})(\d{0,4})$/)
        if (match) {
          let formatted = ""
          if (match[1]) formatted += `(${match[1]}`
          if (match[1] && match[1].length === 2) formatted += ") "
          if (match[2]) formatted += match[2]
          if (match[2] && match[2].length === 4 && match[3]) formatted += `-${match[3]}`
          return formatted
        }
      }
    }
    
    // For other countries, just return the cleaned number
    return cleaned
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input, selectedCountry);
    setPhoneNumber(formatted);
    
    // For Brazil, only normalize when we have enough digits (DDD + number)
    if (selectedCountry.code === 'BR') {
      const digitsOnly = formatted.replace(/\D/g, '');
      
      // Only normalize if we have at least DDD + some number digits
      if (digitsOnly.length >= 2) {
        // If we have complete number (DDD + 8 digits), normalize it
        if (digitsOnly.length === 10) {
          const normalized = normalizePhoneNumber(digitsOnly);
          onChange?.(normalized);
        } else {
          // Just pass the raw digits for partial numbers
          onChange?.(digitsOnly);
        }
      } else {
        onChange?.(digitsOnly);
      }
    } else {
      // For other countries, just remove formatting and add dial code
      const digitsOnly = formatted.replace(/\D/g, '');
      const withDialCode = selectedCountry.dialCode + digitsOnly;
      onChange?.(withDialCode);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    
    // For Brazil, ensure the phone number is normalized
    if (country.code === 'BR' && phoneNumber) {
      // Extract only the number part without country code for normalization
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      const normalized = normalizePhoneNumber(digitsOnly);
      onChange?.(normalized);
    } else if (phoneNumber) {
      // For other countries, format with new dial code
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      const withDialCode = country.dialCode + digitsOnly;
      onChange?.(withDialCode);
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <CountrySelector
        value={selectedCountry}
        onSelect={handleCountrySelect}
        disabled={disabled}
      />
      <Input
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder={placeholder || selectedCountry.mask || "Digite o número"}
        disabled={disabled}
        className="flex-1"
      />
    </div>
  )
}