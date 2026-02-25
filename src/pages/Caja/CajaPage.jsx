"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Button, Alert, CircularProgress, Card, Chip } from "@mui/material"
import {
  Add as AddIcon,
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalanceWallet as WalletIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import { useCaja } from "../../hooks/useCaja"
import AbrirCajaModal from "../../components/Caja/AbrirCajaModal"
import CerrarCajaModal from "../../components/Caja/CerrarCajaModal"
import MovimientoModal from "../../components/Caja/MovimientoModal"
import MovimientosTable from "../../components/Caja/MovimientosTable"
import DetalleIngresosModal from "../../components/Caja/DetalleIngresosModal"
import cajaService from "../../services/cajaService"
import PermissionGuard from "../../components/Auth/PermissionGuard"

export default function CajaPage() {
  const { user, hasPermissionSlug } = useAuth()
  const {
    sesionActiva,
    movimientos,
    loading,
    error,
    loadSesionActiva,
    loadMovimientos,
    abrirCaja,
    cerrarCaja,
    registrarMovimiento,
  } = useCaja()

  const [abrirModal, setAbrirModal] = useState(false)
  const [cerrarModal, setCerrarModal] = useState(false)
  const [movimientoModal, setMovimientoModal] = useState(false)
  const [ingresosModal, setIngresosModal] = useState(false)
  const [detalleIngresos, setDetalleIngresos] = useState(null)
  const [loadingIngresos, setLoadingIngresos] = useState(false)
  const [detalleCC, setDetalleCC] = useState(null)
  const [loadingDetalleCC, setLoadingDetalleCC] = useState(false)

  const sucursalPrincipal = user?.sucursales?.find((s) => s.es_principal)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.parseFloat(value))
  }

  useEffect(() => {
    if (sucursalPrincipal) {
      loadSesionActiva(sucursalPrincipal.id)
    }
  }, [sucursalPrincipal])

  useEffect(() => {
    if (sesionActiva) {
      loadMovimientos(sesionActiva.id)
    }
  }, [sesionActiva])

  useEffect(() => {
    if (
      sesionActiva &&
      (Number(sesionActiva.cantidad_ventas_cuenta_corriente) > 0 ||
        Number(sesionActiva.cantidad_servicios_cuenta_corriente) > 0)
    ) {
      setLoadingDetalleCC(true)
      setDetalleCC(null)
      cajaService
        .getCuentaCorrienteDetalle(sesionActiva.id)
        .then((data) => setDetalleCC(data))
        .catch(() => setDetalleCC({ ventas: [], servicios: [] }))
        .finally(() => setLoadingDetalleCC(false))
    } else {
      setDetalleCC(null)
    }
  }, [sesionActiva?.id, sesionActiva?.cantidad_ventas_cuenta_corriente, sesionActiva?.cantidad_servicios_cuenta_corriente])

  const handleAbrirCaja = async (data) => {
    const success = await abrirCaja({
      ...data,
      sucursalId: sucursalPrincipal.id,
    })
    if (success) {
      setAbrirModal(false)
      loadSesionActiva(sucursalPrincipal.id)
    }
  }

  const handleCerrarCaja = async (data) => {
    const success = await cerrarCaja(sesionActiva.id, data)
    if (success) {
      setCerrarModal(false)
      loadSesionActiva(sucursalPrincipal.id)
    }
  }

  const handleRegistrarMovimiento = async (data) => {
    const success = await registrarMovimiento({
      ...data,
      sesionId: sesionActiva.id,
    })
    if (success) {
      setMovimientoModal(false)
      loadMovimientos(sesionActiva.id)
    }
  }

  const handleVerDetalleIngresos = async () => {
    if (!sesionActiva) return

    setIngresosModal(true)
    setLoadingIngresos(true)
    setDetalleIngresos(null) // Reset data before loading

    try {
      const response = await cajaService.getDetalleIngresos(sesionActiva.id)
      setDetalleIngresos(response)
    } catch (error) {
      console.error("Error al cargar detalle de ingresos:", error)
      setDetalleIngresos(null)
    } finally {
      setLoadingIngresos(false)
    }
  }

  const totalIngresos =
    detalleIngresos?.total_general ||
    movimientos
      .filter((m) => m.tipo === "INGRESO" && m.concepto !== "Apertura de caja")
      .reduce((sum, m) => sum + Number.parseFloat(m.monto), 0)

  const totalEgresos = movimientos
    .filter((m) => m.tipo === "EGRESO")
    .reduce((sum, m) => sum + Number.parseFloat(m.monto), 0)

  const montoActual = sesionActiva ? Number.parseFloat(sesionActiva.monto_inicial) + totalIngresos - totalEgresos : 0

  return (
    <PermissionGuard requiredPermission="view_caja">
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", p: 2, bgcolor: "#fafafa" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress sx={{ color: "#dc2626" }} />
          </Box>
        ) : !sucursalPrincipal ? (
          <Box p={2}>
            <Alert severity="error">No tienes una sucursal principal asignada. Contacta al administrador.</Alert>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                pb: 2,
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <Box>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: "#0f172a", mb: 0.5 }}>
                  Caja - {sucursalPrincipal.nombre}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  {sesionActiva ? (
                    <Chip
                      label="Abierta"
                      size="small"
                      sx={{
                        bgcolor: "#dcfce7",
                        color: "#166534",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        height: 22,
                      }}
                    />
                  ) : (
                    <Chip
                      label="Cerrada"
                      size="small"
                      sx={{
                        bgcolor: "#fee2e2",
                        color: "#991b1b",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        height: 22,
                      }}
                    />
                  )}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1.5 }}>
                {sesionActiva ? (
                  <>
                    {hasPermissionSlug("registrar_movimiento_caja") && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                        onClick={() => setMovimientoModal(true)}
                        sx={{
                          bgcolor: "#dc2626",
                          color: "white",
                          px: 2.5,
                          fontWeight: 500,
                          textTransform: "none",
                          boxShadow: "none",
                          "&:hover": {
                            bgcolor: "#b91c1c",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        Registrar Movimiento
                      </Button>
                    )}
                    {hasPermissionSlug("cerrar_caja") && (
                      <Button
                        variant="outlined"
                        startIcon={<CloseIcon sx={{ fontSize: 18 }} />}
                        onClick={() => setCerrarModal(true)}
                        sx={{
                          borderColor: "#dc2626",
                          color: "#dc2626",
                          px: 2.5,
                          fontWeight: 500,
                          textTransform: "none",
                          "&:hover": {
                            borderColor: "#b91c1c",
                            bgcolor: "#fef2f2",
                          },
                        }}
                      >
                        Cerrar Caja
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {hasPermissionSlug("abrir_caja") && (
                      <Button
                        variant="contained"
                        startIcon={<MoneyIcon sx={{ fontSize: 18 }} />}
                        onClick={() => setAbrirModal(true)}
                        sx={{
                          bgcolor: "#059669",
                          color: "white",
                          px: 2.5,
                          fontWeight: 500,
                          textTransform: "none",
                          boxShadow: "none",
                          "&:hover": {
                            bgcolor: "#047857",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        Abrir Caja
                      </Button>
                    )}
                  </>
                )}
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, py: 0.5 }}>
                {error}
              </Alert>
            )}

            {sesionActiva ? (
              <>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Card
                    sx={{
                      p: 2,
                      bgcolor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: 1,
                      boxShadow: "none",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <WalletIcon sx={{ fontSize: 18, color: "#64748b" }} />
                      <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                        Monto Inicial
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#0f172a" }}>
                      ${formatCurrency(sesionActiva.monto_inicial)}
                    </Typography>
                  </Card>

                  <Card
                    onClick={handleVerDetalleIngresos}
                    sx={{
                      p: 2,
                      bgcolor: "#dcfce7",
                      border: "1px solid #bbf7d0",
                      borderRadius: 1,
                      boxShadow: "none",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "#bbf7d0",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <TrendingUpIcon sx={{ fontSize: 18, color: "#166534" }} />
                      <Typography variant="body2" sx={{ color: "#166534", fontWeight: 500 }}>
                        Total Ingresos
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#166534" }}>
                      ${formatCurrency(totalIngresos)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#166534", opacity: 0.8, mt: 0.5, display: "block" }}>
                      Click para ver detalle
                    </Typography>
                  </Card>

                  <Card
                    sx={{
                      p: 2,
                      bgcolor: "#fee2e2",
                      border: "1px solid #fecaca",
                      borderRadius: 1,
                      boxShadow: "none",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <TrendingDownIcon sx={{ fontSize: 18, color: "#991b1b" }} />
                      <Typography variant="body2" sx={{ color: "#991b1b", fontWeight: 500 }}>
                        Total Egresos
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#991b1b" }}>
                      ${formatCurrency(totalEgresos)}
                    </Typography>
                  </Card>

                  <Card
                    sx={{
                      p: 2,
                      bgcolor: "#dbeafe",
                      border: "1px solid #bfdbfe",
                      borderRadius: 1,
                      boxShadow: "none",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <MoneyIcon sx={{ fontSize: 18, color: "#1e40af" }} />
                      <Typography variant="body2" sx={{ color: "#1e40af", fontWeight: 500 }}>
                        Monto Actual
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e40af" }}>
                      ${formatCurrency(montoActual)}
                    </Typography>
                  </Card>

                  {(Number(sesionActiva.cantidad_ventas_cuenta_corriente) > 0 ||
                    Number(sesionActiva.cantidad_servicios_cuenta_corriente) > 0) && (
                    <Card
                      sx={{
                        p: 2,
                        bgcolor: "#fef3c7",
                        border: "1px solid #fde68a",
                        borderRadius: 1,
                        boxShadow: "none",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <ReceiptIcon sx={{ fontSize: 18, color: "#b45309" }} />
                        <Typography variant="body2" sx={{ color: "#b45309", fontWeight: 500 }}>
                          Cuenta corriente (referencia)
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "#92400e", display: "block", mb: 0.5 }}>
                        No afecta caja. Estimado de lo facturado en CC en esta sesión.
                      </Typography>
                      {Number(sesionActiva.cantidad_ventas_cuenta_corriente) > 0 && (
                        <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 500 }}>
                          Ventas: {sesionActiva.cantidad_ventas_cuenta_corriente} — $
                          {formatCurrency(sesionActiva.total_ventas_cuenta_corriente)}
                        </Typography>
                      )}
                      {Number(sesionActiva.cantidad_servicios_cuenta_corriente) > 0 && (
                        <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 500 }}>
                          Servicios: {sesionActiva.cantidad_servicios_cuenta_corriente} — $
                          {formatCurrency(sesionActiva.total_servicios_cuenta_corriente)}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#b45309", mt: 0.5 }}>
                        Total ref. CC: $
                        {formatCurrency(
                          (Number(sesionActiva.total_ventas_cuenta_corriente) || 0) +
                            (Number(sesionActiva.total_servicios_cuenta_corriente) || 0),
                        )}
                      </Typography>

                      {(loadingDetalleCC || detalleCC) && (
                        <Box sx={{ mt: 1.5, pt: 1, borderTop: "1px solid #fde68a" }}>
                          {loadingDetalleCC ? (
                            <Typography variant="caption" sx={{ color: "#92400e" }}>
                              Cargando detalle...
                            </Typography>
                          ) : detalleCC && (detalleCC.ventas?.length > 0 || detalleCC.servicios?.length > 0) ? (
                            <>
                              {detalleCC.ventas?.length > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="caption" sx={{ color: "#92400e", fontWeight: 600, display: "block", mb: 0.5 }}>
                                    Ventas en CC
                                  </Typography>
                                  {detalleCC.ventas.map((v) => (
                                    <Box key={`v-${v.id}`} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.25, px: 0.5 }}>
                                      <Typography variant="caption" sx={{ color: "#0f172a" }}>
                                        {v.numero} — {v.cliente || "Sin cliente"}
                                      </Typography>
                                      <Typography variant="caption" sx={{ fontWeight: 600, color: "#b45309" }}>
                                        ${formatCurrency(v.total)}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              )}
                              {detalleCC.servicios?.length > 0 && (
                                <Box>
                                  <Typography variant="caption" sx={{ color: "#92400e", fontWeight: 600, display: "block", mb: 0.5 }}>
                                    Servicios en CC
                                  </Typography>
                                  {detalleCC.servicios.map((s) => (
                                    <Box key={`s-${s.id}`} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.25, px: 0.5 }}>
                                      <Typography variant="caption" sx={{ color: "#0f172a" }}>
                                        {s.numero} — {s.cliente || "Sin cliente"}
                                      </Typography>
                                      <Typography variant="caption" sx={{ fontWeight: 600, color: "#b45309" }}>
                                        ${formatCurrency(s.total)}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </>
                          ) : null}
                        </Box>
                      )}
                    </Card>
                  )}
                </Box>

                <Card
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: 1,
                    boxShadow: "none",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonIcon sx={{ fontSize: 18, color: "#64748b" }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                          Abierta por
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "#0f172a" }}>
                          {sesionActiva.usuario_apertura_nombre || "No disponible"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarIcon sx={{ fontSize: 18, color: "#64748b" }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                          Fecha de apertura
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "#0f172a" }}>
                          {new Date(sesionActiva.fecha_apertura).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>

                    {sesionActiva.observaciones_apertura && (
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                          Observaciones
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#0f172a" }}>
                          {sesionActiva.observaciones_apertura}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Card>

                <Box
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                    bgcolor: "white",
                    borderRadius: 1,
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#0f172a", fontSize: "1rem" }}>
                      Movimientos de Caja
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, overflow: "auto" }}>
                    <MovimientosTable movimientos={movimientos} />
                  </Box>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "white",
                  borderRadius: 1,
                  border: "1px solid #e5e7eb",
                }}
              >
                <Box sx={{ textAlign: "center", py: 5, px: 3 }}>
                  <MoneyIcon sx={{ fontSize: 80, color: "#cbd5e1", mb: 2 }} />
                  <Typography variant="h6" sx={{ color: "#64748b", mb: 1, fontWeight: 500 }}>
                    No hay una caja abierta
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
                    Abre una caja para comenzar a registrar movimientos
                  </Typography>
                  {hasPermissionSlug("abrir_caja") && (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<MoneyIcon />}
                      onClick={() => setAbrirModal(true)}
                      sx={{
                        bgcolor: "#059669",
                        color: "white",
                        px: 3,
                        py: 1.5,
                        fontWeight: 500,
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: "#047857",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      Abrir Caja
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Modals */}
            <AbrirCajaModal open={abrirModal} onClose={() => setAbrirModal(false)} onAbrirCaja={handleAbrirCaja} />
            <CerrarCajaModal
              open={cerrarModal}
              onClose={() => setCerrarModal(false)}
              onCerrarCaja={handleCerrarCaja}
              sesionActual={sesionActiva}
            />
            <MovimientoModal
              open={movimientoModal}
              onClose={() => setMovimientoModal(false)}
              onRegistrarMovimiento={handleRegistrarMovimiento}
            />
            <DetalleIngresosModal
              open={ingresosModal}
              onClose={() => setIngresosModal(false)}
              detalleIngresos={detalleIngresos}
              loading={loadingIngresos}
            />
          </>
        )}
      </Box>
    </PermissionGuard>
  )
}
