import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: number;
  onChange: (value: number) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);

    // Format number to Brazilian currency format for display
    const formatCurrency = (num: number): string => {
      if (num === 0 || isNaN(num)) return "";
      return num.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      });
    };

    // Simple parser that handles common input formats
    const parseCurrency = (str: string): number => {
      if (!str || str.trim() === "") return 0;
      
      // Remove everything except digits, comma and dot
      let cleaned = str.replace(/[^\d,.-]/g, '');
      
      // If it has both comma and dot, determine which is decimal separator
      if (cleaned.includes(',') && cleaned.includes('.')) {
        const lastComma = cleaned.lastIndexOf(',');
        const lastDot = cleaned.lastIndexOf('.');
        
        if (lastComma > lastDot) {
          // Brazilian format: 1.234,56 -> replace . with nothing, , with .
          cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else {
          // US format: 1,234.56 -> replace , with nothing
          cleaned = cleaned.replace(/,/g, '');
        }
      } else if (cleaned.includes(',')) {
        // Only has comma - if it's in decimal position (last 3 chars), treat as decimal
        const commaIndex = cleaned.lastIndexOf(',');
        const afterComma = cleaned.substring(commaIndex + 1);
        if (afterComma.length <= 2) {
          // Treat as decimal separator
          cleaned = cleaned.replace(',', '.');
        } else {
          // Treat as thousands separator
          cleaned = cleaned.replace(/,/g, '');
        }
      }
      
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Update display value when external value changes and not focused
    React.useEffect(() => {
      if (!isFocused) {
        if (value === 0) {
          setDisplayValue("");
        } else {
          setDisplayValue(formatCurrency(value));
        }
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setDisplayValue(input);
      
      const numericValue = parseCurrency(input);
      onChange(numericValue);
    };

    const handleFocus = () => {
      setIsFocused(true);
      // Convert formatted value back to raw input for easier editing
      if (value > 0) {
        setDisplayValue(value.toString());
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Format the value when leaving the field
      if (value > 0) {
        setDisplayValue(formatCurrency(value));
      } else {
        setDisplayValue("");
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(className)}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";