// Utilidades para formateo de datos

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatQuantity = (quantity, unidadMedida = "unidad") => {
  const num = Number.parseFloat(quantity)
  if (isNaN(num)) return "0"

  if (unidadMedida === "litro") {
    // Para litros: mostrar con hasta 3 decimales, pero sin ceros innecesarios
    return num.toFixed(3).replace(/\.?0+$/, "")
  } else {
    // Para unidades: mostrar sin decimales
    return Math.round(num).toString()
  }
}

export const formatPriceInput = (value) => {
  if (!value) return ""

  // Eliminar todo excepto números y coma
  const cleaned = value.toString().replace(/[^\d,]/g, "")

  // Separar parte entera y decimal
  const parts = cleaned.split(",")
  const integerPart = parts[0]
  const decimalPart = parts[1]

  // Formatear parte entera con puntos como separadores de miles
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

  // Combinar con parte decimal si existe
  return decimalPart !== undefined ? `${formatted},${decimalPart}` : formatted
}

export const parsePriceInput = (value) => {
  if (!value) return 0

  // Eliminar puntos (separadores de miles) y reemplazar coma por punto
  const cleaned = value.toString().replace(/\./g, "").replace(/,/g, ".")
  const parsed = Number.parseFloat(cleaned)

  return isNaN(parsed) ? 0 : parsed
}

export const formatDate = (date) => {
  if (!date) return ""
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

export const formatDateTime = (date) => {
  if (!date) return ""
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export const formatPhone = (phone) => {
  if (!phone) return ""
  // Formato argentino: +54 11 1234-5678
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6)}` // Ajustar el formato para incluir el código de país
  }
  return phone
}

export const formatDNI = (dni) => {
  if (!dni) return ""
  // Formato: 12.345.678
  const cleaned = dni.toString().replace(/\D/g, "")
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}
