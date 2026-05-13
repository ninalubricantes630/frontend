"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Stack,
} from "@mui/material"
import AssessmentIcon from "@mui/icons-material/Assessment"
import DownloadIcon from "@mui/icons-material/Download"
import RefreshIcon from "@mui/icons-material/Refresh"
import { useAuth } from "../../contexts/AuthContext"
import { useSucursales } from "../../hooks/useSucursales"
import { useCategorias } from "../../hooks/useCategorias"
import reportesService from "../../services/reportesService"
import ReporteDashboardView from "../../components/Reportes/ReporteDashboardView"

const ROJO = "#dc2626"
const PAGE_BG = "#f8fafc"
const CONTENT_MAX = 1760

const hoyISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const mesActualISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

const GenerarReportePage = () => {
  const { user, isAdmin, hasPermissionSlug } = useAuth()
  const { loadSucursales } = useSucursales()
  const { categorias, loadCategorias } = useCategorias()

  const canVentas = isAdmin() || hasPermissionSlug("view_ventas")
  const canServicios = isAdmin() || hasPermissionSlug("view_servicios")
  const canAccess = canVentas || canServicios

  const opcionesTipoReporte = useMemo(() => {
    const opts = []
    if (canVentas) opts.push({ value: "ventas", label: "Solo ventas" })
    if (canServicios) opts.push({ value: "servicios", label: "Solo servicios" })
    if (canVentas && canServicios) opts.push({ value: "ambos", label: "Ventas y servicios" })
    return opts
  }, [canVentas, canServicios])

  const [tipoReporte, setTipoReporte] = useState("ambos")
  const [periodoTipo, setPeriodoTipo] = useState("mensual")
  const [fechaDiaria, setFechaDiaria] = useState(hoyISO)
  const [mesAnio, setMesAnio] = useState(mesActualISO)
  const [anio, setAnio] = useState(String(new Date().getFullYear()))
  const [fechaDesde, setFechaDesde] = useState(hoyISO)
  const [fechaHasta, setFechaHasta] = useState(hoyISO)

  const [sucursalId, setSucursalId] = useState("")
  const [categoriaId, setCategoriaId] = useState("")
  const [tipoPagoVentas, setTipoPagoVentas] = useState("")
  const [estadoVentas, setEstadoVentas] = useState("COMPLETADA")
  const [tipoPagoServicios, setTipoPagoServicios] = useState("")
  const [estadoServicios, setEstadoServicios] = useState("COMPLETADA")

  const [loadingVista, setLoadingVista] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  useEffect(() => {
    if (!canAccess || !user?.sucursales?.length) return
    if (user.sucursales.length === 1) {
      setSucursalId(String(user.sucursales[0].id))
    }
  }, [user, canAccess])

  useEffect(() => {
    if (opcionesTipoReporte.length && !opcionesTipoReporte.some((o) => o.value === tipoReporte)) {
      setTipoReporte(opcionesTipoReporte[0].value)
    }
  }, [opcionesTipoReporte, tipoReporte])

  useEffect(() => {
    loadSucursales({ limit: 100 })
    loadCategorias(1, "", 200)
  }, [loadSucursales, loadCategorias])

  useEffect(() => {
    setReportData(null)
  }, [
    tipoReporte,
    periodoTipo,
    fechaDiaria,
    mesAnio,
    anio,
    fechaDesde,
    fechaHasta,
    sucursalId,
    categoriaId,
    tipoPagoVentas,
    estadoVentas,
    tipoPagoServicios,
    estadoServicios,
  ])

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity })
  }

  const sucursalesUsuario = user?.sucursales || []

  const buildPayload = () => {
    const base = {
      tipo_reporte: tipoReporte,
      periodo_tipo: periodoTipo,
      sucursal_id: Number.parseInt(sucursalId, 10),
      categoria_id: categoriaId ? Number.parseInt(categoriaId, 10) : undefined,
      tipo_pago_ventas: tipoPagoVentas || undefined,
      estado_ventas: estadoVentas || undefined,
      tipo_pago_servicios: tipoPagoServicios || undefined,
      estado_servicios: estadoServicios || undefined,
    }

    if (periodoTipo === "diario") {
      base.fecha = fechaDiaria
    } else if (periodoTipo === "mensual") {
      const [y, m] = mesAnio.split("-")
      base.anio = y
      base.mes = m
    } else if (periodoTipo === "anual") {
      base.anio = anio
    } else {
      base.fecha_desde = fechaDesde
      base.fecha_hasta = fechaHasta
    }

    return base
  }

  const handleGenerarVista = async () => {
    if (!sucursalId) {
      showSnackbar("Seleccione la sucursal del reporte.", "warning")
      return
    }
    const payload = buildPayload()
    if (Number.isNaN(payload.sucursal_id)) {
      showSnackbar("Seleccione una sucursal válida.", "warning")
      return
    }

    try {
      setLoadingVista(true)
      const data = await reportesService.obtenerDatos(payload)
      setReportData(data)
      showSnackbar("Vista del reporte lista.", "success")
    } catch (e) {
      console.error(e)
      setReportData(null)
      showSnackbar(e?.message || "No se pudo cargar el reporte.", "error")
    } finally {
      setLoadingVista(false)
    }
  }

  const handleExportarExcel = async () => {
    if (!sucursalId) {
      showSnackbar("Seleccione la sucursal del reporte.", "warning")
      return
    }
    const payload = buildPayload()
    if (Number.isNaN(payload.sucursal_id)) {
      showSnackbar("Seleccione una sucursal válida.", "warning")
      return
    }

    try {
      setExporting(true)
      const blob = await reportesService.exportarExcel(payload)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reporte_${payload.sucursal_id}_${payload.periodo_tipo}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      showSnackbar("Excel descargado.", "success")
    } catch (e) {
      console.error(e)
      showSnackbar(e?.message || "No se pudo exportar el Excel.", "error")
    } finally {
      setExporting(false)
    }
  }

  if (!canAccess) {
    return (
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3, bgcolor: PAGE_BG }}>
        <Alert severity="warning">
          No tienes permisos para generar reportes. Se requiere acceso a reportes de ventas o de servicios.
        </Alert>
      </Box>
    )
  }

  if (!sucursalesUsuario.length) {
    return (
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3, bgcolor: PAGE_BG }}>
        <Alert severity="warning">No tienes sucursales asignadas. Contacta al administrador.</Alert>
      </Box>
    )
  }

  const muestraVentas = tipoReporte === "ventas" || tipoReporte === "ambos"
  const muestraServicios = tipoReporte === "servicios" || tipoReporte === "ambos"

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: PAGE_BG }}>
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
          px: { xs: 2, sm: 2.5, md: 3 },
          py: { xs: 2, sm: 2.25 },
        }}
      >
        <Box
          sx={{
            maxWidth: CONTENT_MAX,
            mx: "auto",
            width: "100%",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { md: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 700, color: "#0f172a", letterSpacing: "-0.025em" }}
          >
            Generar reporte
          </Typography>
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} alignItems="center">
            <Button
              variant="contained"
              size="medium"
              disabled={!sucursalId || loadingVista}
              onClick={handleGenerarVista}
              startIcon={loadingVista ? <CircularProgress size={18} color="inherit" /> : <AssessmentIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: ROJO,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": { bgcolor: "#b91c1c", boxShadow: "none" },
              }}
            >
              {loadingVista ? "Generando…" : "Ver en pantalla"}
            </Button>
            <Button
              variant="outlined"
              size="medium"
              disabled={!sucursalId || exporting}
              onClick={handleExportarExcel}
              startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon sx={{ fontSize: 18 }} />}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                borderColor: "#e5e7eb",
                color: "#475569",
                bgcolor: "#f8fafc",
                "&:hover": { borderColor: "#cbd5e1", bgcolor: "white" },
              }}
            >
              Excel
            </Button>
            {reportData ? (
              <Button
                variant="outlined"
                size="medium"
                startIcon={<RefreshIcon sx={{ fontSize: 18 }} />}
                onClick={handleGenerarVista}
                disabled={loadingVista}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  borderColor: "#e5e7eb",
                  color: "#475569",
                  bgcolor: "#f8fafc",
                  "&:hover": { borderColor: "#cbd5e1", bgcolor: "white" },
                }}
              >
                Actualizar
              </Button>
            ) : null}
          </Stack>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", py: 2.5, px: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box sx={{ maxWidth: CONTENT_MAX, mx: "auto", width: "100%" }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2,
            border: "1px solid #e5e7eb",
            bgcolor: "#fff",
            mb: 2.5,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary", mb: 1.5 }}>
            Parámetros
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel id="sucursal-label">Sucursal</InputLabel>
                <Select
                  labelId="sucursal-label"
                  label="Sucursal"
                  value={sucursalId}
                  onChange={(e) => setSucursalId(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" } }}
                >
                  {sucursalesUsuario.map((s) => (
                    <MenuItem key={s.id} value={String(s.id)}>
                      {s.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="tipo-reporte-label">Contenido</InputLabel>
                <Select labelId="tipo-reporte-label" label="Contenido" value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value)}>
                  {opcionesTipoReporte.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="periodo-label">Periodo</InputLabel>
                <Select labelId="periodo-label" label="Periodo" value={periodoTipo} onChange={(e) => setPeriodoTipo(e.target.value)}>
                  <MenuItem value="diario">Diario</MenuItem>
                  <MenuItem value="mensual">Mensual</MenuItem>
                  <MenuItem value="anual">Anual</MenuItem>
                  <MenuItem value="personalizado">Rango de fechas</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              {periodoTipo === "diario" && (
                <TextField
                  fullWidth
                  size="small"
                  label="Fecha"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={fechaDiaria}
                  onChange={(e) => setFechaDiaria(e.target.value)}
                />
              )}
              {periodoTipo === "mensual" && (
                <TextField
                  fullWidth
                  size="small"
                  label="Mes"
                  type="month"
                  InputLabelProps={{ shrink: true }}
                  value={mesAnio}
                  onChange={(e) => setMesAnio(e.target.value)}
                />
              )}
              {periodoTipo === "anual" && (
                <TextField
                  fullWidth
                  size="small"
                  label="Año"
                  type="number"
                  inputProps={{ min: 2000, max: 2100 }}
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                />
              )}
              {periodoTipo === "personalizado" && (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Desde"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Hasta"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                  />
                </Stack>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 2.5, borderColor: "#e5e7eb" }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary", mb: 1.5 }}>
            Filtros
          </Typography>

          <Grid container spacing={2}>
            {muestraVentas && (
              <>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Categoría (ventas)</InputLabel>
                    <Select label="Categoría (ventas)" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                      <MenuItem value="">Todas</MenuItem>
                      {categorias.map((c) => (
                        <MenuItem key={c.id} value={String(c.id)}>
                          {c.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de pago (ventas)</InputLabel>
                    <Select label="Tipo de pago (ventas)" value={tipoPagoVentas} onChange={(e) => setTipoPagoVentas(e.target.value)}>
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                      <MenuItem value="TARJETA_CREDITO">Tarjeta de crédito</MenuItem>
                      <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                      <MenuItem value="CUENTA_CORRIENTE">Cuenta corriente</MenuItem>
                      <MenuItem value="PAGO_MULTIPLE">Pago múltiple</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado venta</InputLabel>
                    <Select label="Estado venta" value={estadoVentas} onChange={(e) => setEstadoVentas(e.target.value)}>
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="COMPLETADA">Completada</MenuItem>
                      <MenuItem value="CANCELADA">Cancelada</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {muestraServicios && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de pago (servicios)</InputLabel>
                    <Select label="Tipo de pago (servicios)" value={tipoPagoServicios} onChange={(e) => setTipoPagoServicios(e.target.value)}>
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                      <MenuItem value="TARJETA_CREDITO">Tarjeta de crédito</MenuItem>
                      <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                      <MenuItem value="CUENTA_CORRIENTE">Cuenta corriente</MenuItem>
                      <MenuItem value="PAGO_MULTIPLE">Pago múltiple</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado servicio</InputLabel>
                    <Select label="Estado servicio" value={estadoServicios} onChange={(e) => setEstadoServicios(e.target.value)}>
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="COMPLETADA">Completada</MenuItem>
                      <MenuItem value="CANCELADA">Cancelada</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>

          <Typography variant="caption" sx={{ display: "block", mt: 2, color: "text.secondary" }}>
            Listas en pantalla limitadas; el Excel incluye el detalle completo del periodo.
          </Typography>
        </Paper>

        {reportData ? (
          <ReporteDashboardView key={reportData.meta?.generado_at} reportData={reportData} />
        ) : (
          <Paper
            elevation={0}
            sx={{
              py: 3,
              px: 2,
              textAlign: "center",
              borderRadius: 2,
              border: "1px dashed #e5e7eb",
              bgcolor: "#fff",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Definí sucursal y periodo, luego usá <strong>Ver en pantalla</strong>.
            </Typography>
          </Paper>
        )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default GenerarReportePage
