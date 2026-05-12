/**
 * Construye el objeto guardado en localStorage para recrear / rehacer una venta
 * tras cancelar (misma forma que consume VentasPage con ?recrear=true).
 * @param {object} venta — respuesta de GET /ventas/:id (response.data del cliente API)
 */
export function buildVentaParaRecrearFromApi(venta) {
  if (!venta || typeof venta !== "object") return null

  const detalle = venta.detalle || venta.productos || []
  const productos = detalle.map((d) => ({
    producto_id: d.producto_id,
    producto_nombre: d.producto_nombre,
    nombre: d.producto_nombre,
    descripcion: d.descripcion || "",
    precio_unitario: Number.parseFloat(d.precio_unitario),
    cantidad: Number.parseFloat(d.cantidad),
    unidad_medida: d.unidad_medida || "unidad",
  }))

  const desc = Number.parseFloat(venta.descuento) || 0
  const interesMonto = Number.parseFloat(venta.interes_sistema_monto) || 0
  const subtotal = Number.parseFloat(venta.subtotal) || 0

  const obsRaw = (venta.observaciones || "").trim()
  const obsSinCancel = obsRaw.split("|")[0].trim()

  return {
    sucursal_id: venta.sucursal_id,
    productos,
    detalle: productos,
    subtotal,
    descuento: desc,
    tipo_descuento: desc > 0 ? "monto" : null,
    valor_descuento: desc > 0 ? desc : 0,
    interes_sistema_monto: interesMonto,
    tipo_interes_sistema: venta.tipo_interes_sistema || (interesMonto > 0 ? "monto" : null),
    valor_interes_sistema:
      venta.valor_interes_sistema != null && venta.valor_interes_sistema !== ""
        ? Number.parseFloat(venta.valor_interes_sistema)
        : interesMonto,
    observaciones: obsSinCancel,
    pagoInicial: buildPagoInicialFromVenta(venta),
  }
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

function buildPagoInicialFromVenta(venta) {
  const tipo = String(venta.tipo_pago || "").toUpperCase()
  const esDividido = Number(venta.pago_dividido) === 1 || tipo === "PAGO_MULTIPLE"

  const observaciones = (venta.observaciones || "").trim().split("|")[0].trim()

  if (esDividido) {
    const pagos = venta.pagos || []
    const p1 = pagos[0]
    const p2 = pagos[1]
    if (p1 && p2) {
      return {
        pagoDividido: true,
        metodoPago: mapMetodoPagoApiToUi(p1.metodo_pago),
        metodoPago2: mapMetodoPagoApiToUi(p2.metodo_pago),
        montoPago1: Number.parseFloat(p1.monto),
        montoPago2: Number.parseFloat(p2.monto),
        tarjetaId: venta.tarjeta_id || null,
        numeroCuotas: venta.numero_cuotas || null,
        tasaInteresTarjeta: venta.interes_tarjeta_porcentaje != null ? Number.parseFloat(venta.interes_tarjeta_porcentaje) : null,
        tarjetaId2: venta.tarjeta_id_2 || null,
        numeroCuotas2: venta.numero_cuotas_2 || null,
        tasaInteresTarjeta2:
          venta.tasa_interes_tarjeta_2 != null ? Number.parseFloat(venta.tasa_interes_tarjeta_2) : null,
        clienteId: venta.cliente_id || null,
        clienteNombre: venta.cliente_nombre || null,
        observaciones,
      }
    }
  }

  if (tipo === "CUENTA_CORRIENTE") {
    return {
      pagoDividido: false,
      metodoPago: "cuenta_corriente",
      clienteId: venta.cliente_id || null,
      clienteNombre: venta.cliente_nombre || null,
      observaciones,
    }
  }

  if (tipo === "TARJETA_CREDITO") {
    return {
      pagoDividido: false,
      metodoPago: "tarjeta_credito",
      tarjetaId: venta.tarjeta_id || null,
      numeroCuotas: venta.numero_cuotas || null,
      tasaInteresTarjeta: venta.interes_tarjeta_porcentaje != null ? Number.parseFloat(venta.interes_tarjeta_porcentaje) : null,
      totalConInteresTarjeta:
        venta.total_con_interes_tarjeta != null ? Number.parseFloat(venta.total_con_interes_tarjeta) : null,
      interesTarjetaMonto: venta.interes_tarjeta_monto != null ? Number.parseFloat(venta.interes_tarjeta_monto) : null,
      clienteId: venta.cliente_id || null,
      clienteNombre: venta.cliente_nombre || null,
      observaciones,
    }
  }

  return {
    pagoDividido: false,
    metodoPago: mapMetodoPagoApiToUi(tipo),
    clienteId: venta.cliente_id || null,
    clienteNombre: venta.cliente_nombre || null,
    observaciones,
  }
}
