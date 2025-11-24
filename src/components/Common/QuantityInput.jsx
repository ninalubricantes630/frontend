"use client"

import { NumericFormat } from "react-number-format"
import { TextField } from "@mui/material"

/**
 * Input para cantidades que soporta unidades y litros
 * - Para unidades: solo números enteros
 * - Para litros: permite decimales con coma
 */
const QuantityInput = ({
  value,
  onChange,
  unidadMedida = "unidad",
  error,
  helperText,
  label,
  disabled = false,
  onKeyPress,
  ...props
}) => {
  const isLitro = unidadMedida === "litro"

  return (
    <NumericFormat
      value={value}
      onValueChange={(values) => {
        onChange(values.floatValue || 0)
      }}
      onKeyPress={onKeyPress}
      customInput={TextField}
      thousandSeparator={isLitro ? "." : ""}
      decimalSeparator=","
      decimalScale={isLitro ? 3 : 0}
      fixedDecimalScale={false}
      allowNegative={false}
      label={label || `Cantidad (${isLitro ? "litros" : "unidades"})`}
      fullWidth
      error={error}
      helperText={helperText}
      disabled={disabled}
      {...props}
    />
  )
}

export default QuantityInput
