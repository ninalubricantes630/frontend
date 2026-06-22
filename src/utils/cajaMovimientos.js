/** Referencias de egreso que anulan un ingreso ya marcado como CANCELADO. */
const REFERENCIAS_EGRESO_ANULACION = new Set(["VENTA_CANCELADA", "SERVICIO_CANCELADO"])

export function esMovimientoActivo(mov) {
  return (mov?.estado || "ACTIVO").toString().toUpperCase() !== "CANCELADO"
}

/** Egreso de cancelación de venta/servicio (solo auditoría; no afecta totales netos). */
export function esEgresoAnulacionVenta(mov) {
  if (mov?.tipo !== "EGRESO") return false
  const ref = (mov.referencia_tipo || "").toString().toUpperCase()
  return REFERENCIAS_EGRESO_ANULACION.has(ref)
}

/** Egreso que impacta saldos y desglose neto. */
export function esEgresoContable(mov) {
  return mov?.tipo === "EGRESO" && esMovimientoActivo(mov) && !esEgresoAnulacionVenta(mov)
}
