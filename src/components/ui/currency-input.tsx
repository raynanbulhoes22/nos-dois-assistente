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

    // Format number to Brazilian currency format for display
    const formatCurrency = (num: number): string => {
      if (num === 0) return "";
      return num.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      });
    };

    // Parse Brazilian format to number
    const parseCurrency = (str: string): number => {
      if (!str || str.trim() === "") return 0;
      
      // Remove all non-digit characters except comma and dot
      let cleaned = str.replace(/[^\d,.-]/g, '');
      
      // Handle Brazilian format (1.234,56) or US format (1,234.56)
      if (cleaned.includes(',') && cleaned.includes('.')) {
        // If both exist, assume last one is decimal separator
        const lastComma = cleaned.lastIndexOf(',');
        const lastDot = cleaned.lastIndexOf('.');
        
        if (lastComma > lastDot) {
          // Brazilian format: 1.234,56
          cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else {
          // US format: 1,234.56
          cleaned = cleaned.replace(/,/g, '');
        }
      } else if (cleaned.includes(',')) {
        // Only comma - could be thousands separator or decimal
        const parts = cleaned.split(',');
        if (parts.length === 2 && parts[1].length <= 2) {
          // Likely decimal separator
          cleaned = cleaned.replace(',', '.');
        } else {
          // Likely thousands separator
          cleaned = cleaned.replace(/,/g, '');
        }
      }
      
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Update display value when value prop changes
    React.useEffect(() => {
      setDisplayValue(formatCurrency(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setDisplayValue(input);
      
      const numericValue = parseCurrency(input);
      onChange(numericValue);
    };

    const handleBlur = () => {
      // Reformat on blur
      setDisplayValue(formatCurrency(value));
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(className)}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";