/** Referencias de egreso por cancelación de venta/servicio. */
const REFERENCIAS_EGRESO_ANULACION = new Set(["VENTA_CANCELADA", "SERVICIO_CANCELADO"])

export function esMovimientoActivo(mov) {
  return (mov?.estado || "ACTIVO").toString().toUpperCase() !== "CANCELADO"
}

export function esIngresoCaja(mov) {
  return mov?.tipo === "INGRESO" && mov.concepto !== "Apertura de caja"
}

/** Ingreso vigente (excluye ventas/servicios cancelados). */
export function esIngresoActivo(mov) {
  return esIngresoCaja(mov) && esMovimientoActivo(mov)
}

export function esEgresoAnulacionVenta(mov) {
  if (mov?.tipo !== "EGRESO") return false
  const ref = (mov.referencia_tipo || "").toString().toUpperCase()
  return REFERENCIAS_EGRESO_ANULACION.has(ref)
}

/** Egreso visible en arqueo (cancelaciones, manuales, etc.). */
export function esEgresoArqueo(mov) {
  return mov?.tipo === "EGRESO" && esMovimientoActivo(mov)
}

/** Egreso que impacta saldo operativo (excluye anulaciones ya reflejadas en ingreso CANCELADO). */
export function esEgresoContable(mov) {
  return esEgresoArqueo(mov) && !esEgresoAnulacionVenta(mov)
}

export function normMetodoPago(m) {
  const u = (m || "EFECTIVO").toString().trim().toUpperCase()
  return u || "EFECTIVO"
}

/**
 * Solo ingresos: suma bruta de TODOS los ingresos por método (incluye CANCELADO).
 */
export function buildDesgloseBrutoPorMovimientos(movimientos) {
  const map = new Map()
  for (const mov of movimientos || []) {
    if (!esIngresoCaja(mov)) continue
    const method = normMetodoPago(mov.metodo_pago)
    if (!map.has(method)) map.set(method, { total: 0, cantidad: 0 })
    const o = map.get(method)
    o.total += Number.parseFloat(mov.monto) || 0
    o.cantidad += 1
  }
  return [...map.entries()]
    .map(([metodo_pago, v]) => ({
      metodo_pago,
      total: v.total,
      cantidad: v.cantidad,
    }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total)
}

/**
 * Neto (arqueo): todos los ingresos del método − egresos del método (incl. cancelaciones).
 */
export function buildDesgloseArqueoPorMovimientos(movimientos) {
  const map = new Map()
  for (const mov of movimientos || []) {
    const method = normMetodoPago(mov.metodo_pago)
    if (!map.has(method)) {
      map.set(method, { ing: 0, egr: 0, cIng: 0, cEgr: 0 })
    }
    const o = map.get(method)
    const amt = Number.parseFloat(mov.monto) || 0
    if (esIngresoCaja(mov)) {
      o.ing += amt
      o.cIng += 1
    } else if (esEgresoArqueo(mov)) {
      o.egr += amt
      o.cEgr += 1
    }
  }
  return [...map.entries()]
    .map(([metodo_pago, v]) => ({
      metodo_pago,
      totalIngresos: v.ing,
      totalEgresos: v.egr,
      neto: v.ing - v.egr,
      cantidadIngresos: v.cIng,
      cantidadEgresos: v.cEgr,
    }))
    .filter((r) => r.totalIngresos > 0 || r.totalEgresos > 0)
    .sort((a, b) => Math.abs(b.neto) - Math.abs(a.neto))
}

export function sumIngresosBrutos(movimientos) {
  return (movimientos || [])
    .filter((m) => esIngresoCaja(m))
    .reduce((s, m) => s + (Number.parseFloat(m.monto) || 0), 0)
}

export function sumIngresosActivos(movimientos) {
  return (movimientos || [])
    .filter((m) => esIngresoActivo(m))
    .reduce((s, m) => s + (Number.parseFloat(m.monto) || 0), 0)
}

export function sumEgresosArqueo(movimientos) {
  return (movimientos || [])
    .filter((m) => esEgresoArqueo(m))
    .reduce((s, m) => s + (Number.parseFloat(m.monto) || 0), 0)
}
