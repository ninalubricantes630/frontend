/**
 * Construye el objeto guardado en localStorage para recrear / rehacer un servicio
 * tras cancelar (misma forma que consume ServiciosPage con ?recrear=true).
 * @param {object} servicio — respuesta de GET /servicios/:id
 */
export function buildServicioParaRecrearFromApi(servicio) {
  if (!servicio || typeof servicio !== "object") return null

  const vehiculos = Array.isArray(servicio.vehiculos) ? servicio.vehiculos : []

  const obsSinCancel = stripObsCancelacion(servicio.observaciones)

  const itemsRaw = Array.isArray(servicio.items) ? servicio.items : []
  const seen = new Map()
  for (const it of itemsRaw) {
    const key = `${it.tipo_servicio_id}::${String(it.descripcion || "")}::${String(it.observaciones || "")}::${String(it.notas || "")}`
    if (!seen.has(key)) seen.set(key, it)
  }

  let seq = 0
  const items = [...seen.values()].map((item) => {
    const productos = Array.isArray(item.productos)
      ? item.productos.map((p) => ({
          producto_id: p.producto_id,
          nombre: p.producto_nombre || p.nombre,
          precio_unitario: Number.parseFloat(p.precio_unitario) || 0,
          cantidad: Number.parseFloat(p.cantidad) || 0,
          unidad_medida: p.unidad_medida || "unidad",
          descripcion: p.descripcion || "",
        }))
      : []

    const subLine = Number.parseFloat(item.subtotal) || 0
    const itemTotal =
      productos.length === 0
        ? subLine
        : productos.reduce((s, p) => s + (Number.parseFloat(p.precio_unitario) || 0) * (Number.parseFloat(p.cantidad) || 0), 0)

    return {
      id: Date.now() + ++seq,
      tipoServicioId: item.tipo_servicio_id,
      tipoServicioNombre: item.tipo_servicio_nombre || "",
      descripcion: item.descripcion || "Sin descripción",
      observaciones: item.observaciones || "",
      notas: item.notas || "",
      productos,
      total: itemTotal,
    }
  })

  const subtotalFull = Number.parseFloat(servicio.subtotal) || 0
  const descM = Number.parseFloat(servicio.descuento) || 0
  const interesM = Number.parseFloat(servicio.interes_sistema_monto) || 0
  const interesPctDb = Number.parseFloat(servicio.interes_sistema_porcentaje) || 0

  const descuento =
    descM > 0
      ? {
          tipoDescuento: "monto",
          valorDescuento: descM,
          montoDescuento: descM,
          total: Math.max(0, subtotalFull - descM),
        }
      : null

  let interes = null
  if (interesM > 0) {
    const baseAfterDesc = Math.max(0, subtotalFull - descM)
    let tipoInteres = "monto"
    let valorInteres = interesM
    if (interesPctDb > 0 && baseAfterDesc > 0) {
      const expected = (baseAfterDesc * interesPctDb) / 100
      if (Math.abs(expected - interesM) < 0.02) {
        tipoInteres = "porcentaje"
        valorInteres = interesPctDb
      }
    }
    interes = {
      tipoInteres,
      valorInteres,
      montoInteres: interesM,
      total: baseAfterDesc + interesM,
    }
  }

  const empleados = Array.isArray(servicio.empleados) ? servicio.empleados.map((e) => e.id) : []

  const cliente = {
    id: servicio.cliente_id,
    nombre: servicio.cliente_nombre,
    apellido: servicio.cliente_apellido,
    dni: servicio.cliente_dni,
    telefono: servicio.cliente_telefono,
  }

  return {
    sucursal_id: servicio.sucursal_id,
    cliente_id: servicio.cliente_id,
    cliente,
    vehiculo_ids: vehiculos.map((v) => v.id).filter((id) => id != null),
    vehiculos,
    empleados,
    observaciones: obsSinCancel,
    items,
    descuento,
    interes,
    pagoInicial: buildPagoInicialFromServicio(servicio),
  }
}

function stripObsCancelacion(obs) {
  const raw = String(obs || "").trim()
  if (!raw) return ""
  const cut = raw.indexOf("\n[CANCELADO]")
  if (cut >= 0) return raw.slice(0, cut).trim()
  return raw.split("|")[0].trim()
}

function mapMetodoPagoApiToUi(metodo) {
  const u = String(metodo || "").toUpperCase()
  const map = {
    EFECTIVO: "efectivo",
    TRANSFERENCIA: "transferencia",
    TARJETA_CREDITO: "tarjeta_credito",
    CUENTA_CORRIENTE: "cuenta_corriente",
    CREDITO: "tarjeta_credito",
  }
  return map[u] || "efectivo"
}

function buildPagoInicialFromServicio(s) {
  const tipo = String(s.tipo_pago || "").toUpperCase()
  const esDividido = Number(s.pago_dividido) === 1 || tipo === "PAGO_MULTIPLE"

  const observaciones = stripObsCancelacion(s.observaciones)

  if (esDividido) {
    const pagos = s.pagos || []
    const p1 = pagos[0]
    const p2 = pagos[1]
    if (p1 && p2) {
      return {
        pagoDividido: true,
        metodoPago: mapMetodoPagoApiToUi(p1.metodo_pago),
        metodoPago2: mapMetodoPagoApiToUi(p2.metodo_pago),
        montoPago1: Number.parseFloat(p1.monto),
        montoPago2: Number.parseFloat(p2.monto),
        tarjetaId: s.tarjeta_id || null,
        numeroCuotas: s.numero_cuotas || null,
        tasaInteresTarjeta:
          s.interes_tarjeta_porcentaje != null ? Number.parseFloat(s.interes_tarjeta_porcentaje) : null,
        tarjetaId2: s.tarjeta_id_2 || null,
        numeroCuotas2: s.numero_cuotas_2 || null,
        tasaInteresTarjeta2:
          s.tasa_interes_tarjeta_2 != null ? Number.parseFloat(s.tasa_interes_tarjeta_2) : null,
        clienteId: s.cliente_id || null,
        clienteNombre: s.cliente_nombre || null,
        observaciones,
      }
    }
  }

  if (tipo === "CUENTA_CORRIENTE") {
    return {
      pagoDividido: false,
      metodoPago: "cuenta_corriente",
      clienteId: s.cliente_id || null,
      clienteNombre:
        s.cliente_nombre != null
          ? `${s.cliente_nombre}${s.cliente_apellido ? ` ${s.cliente_apellido}` : ""}`.trim()
          : null,
      observaciones,
    }
  }

  if (tipo === "TARJETA_CREDITO") {
    return {
      pagoDividido: false,
      metodoPago: "tarjeta_credito",
      tarjetaId: s.tarjeta_id || null,
      numeroCuotas: s.numero_cuotas || null,
      tasaInteresTarjeta:
        s.interes_tarjeta_porcentaje != null ? Number.parseFloat(s.interes_tarjeta_porcentaje) : null,
      totalConInteresTarjeta:
        s.total_con_interes_tarjeta != null ? Number.parseFloat(s.total_con_interes_tarjeta) : null,
      interesTarjetaMonto: s.interes_tarjeta_monto != null ? Number.parseFloat(s.interes_tarjeta_monto) : null,
      clienteId: s.cliente_id || null,
      clienteNombre: s.cliente_nombre || null,
      observaciones,
    }
  }

  return {
    pagoDividido: false,
    metodoPago: mapMetodoPagoApiToUi(tipo),
    clienteId: s.cliente_id || null,
    clienteNombre: s.cliente_nombre || null,
    observaciones,
  }
}
