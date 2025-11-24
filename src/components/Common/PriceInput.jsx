"use client"

import { NumericFormat } from "react-number-format"
import { TextField } from "@mui/material"

/**
 * Input para precios en formato argentino (ARS)
 * Formato: 1.234.567,89
 * - Punto (.) como separador de miles
 * - Coma (,) como separador de decimales
 */
const PriceInput = ({ value, onChange, error, helperText, label, disabled = false, ...props }) => {
  return (
    <NumericFormat
      value={value}
      onValueChange={(values) => {
        onChange(values.floatValue || 0)
      }}
      customInput={TextField}
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={2}
      fixedDecimalScale={false}
      allowNegative={false}
      prefix="$"
      label={label || "Precio"}
      fullWidth
      error={error}
      helperText={helperText}
      disabled={disabled}
      {...props}
    />
  )
}

export default PriceInput
