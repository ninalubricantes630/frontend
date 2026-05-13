"use client"

import { useMemo, useState, useEffect } from "react"
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Tabs,
  Tab,
  alpha,
} from "@mui/material"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import HandymanIcon from "@mui/icons-material/Handyman"
import PaymentsIcon from "@mui/icons-material/Payments"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const ROJO = "#dc2626"
const SLATE = "#64748b"
const SLATE_DARK = "#0f172a"
const GRAFICO_PALETTE = ["#dc2626", "#0f172a", "#475569", "#94a3b8", "#b91c1c", "#e11d48", "#334155", "#78716c"]

const fmtMoney = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0)

const fmtFechaCorta = (iso) => {
  if (!iso) return ""
  const [y, m, d] = String(iso).split("-")
  if (!y || !m || !d) return iso
  return `${d}/${m}`
}

const labelTipoPago = (t) => {
  const map = {
    EFECTIVO: "Efectivo",
    TARJETA_CREDITO: "Tarjeta",
    TRANSFERENCIA: "Transferencia",
    CUENTA_CORRIENTE: "Cuenta corr.",
    PAGO_MULTIPLE: "Pago múltiple",
  }
  return map[t] || t || "—"
}

const montoVentaRow = (v) => {
  const t = v.total_con_interes_tarjeta
  if (t != null && t !== "" && Number(t) !== 0) return Number(t)
  return Number(v.total || 0)
}

function mergeDaily(ventasPorDia, serviciosPorDia) {
  const keys = new Set()
  ;(ventasPorDia || []).forEach((r) => keys.add(r.fecha))
  ;(serviciosPorDia || []).forEach((r) => keys.add(r.fecha))
  return Array.from(keys)
    .sort()
    .map((fecha) => {
      const v = (ventasPorDia || []).find((x) => x.fecha === fecha)
      const s = (serviciosPorDia || []).find((x) => x.fecha === fecha)
      return {
        fecha,
        label: fmtFechaCorta(fecha),
        ventas: v?.total ?? 0,
        servicios: s?.total ?? 0,
      }
    })
}

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "#fff",
        height: "100%",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              color: ROJO,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontSize: "0.65rem",
              display: "block",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "#171717",
              fontSize: { xs: "1rem", sm: "1.05rem" },
              lineHeight: 1.25,
              mt: 0.5,
              wordBreak: "break-word",
            }}
          >
            {value}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, fontSize: "0.7rem" }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {Icon ? (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(ROJO, 0.1),
              color: ROJO,
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Box>
        ) : null}
      </Stack>
    </Paper>
  )
}

function ChartFrame({ title, subtitle, children, minHeight = 300 }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "#fff",
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: subtitle ? 0.25 : 1 }}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
          {subtitle}
        </Typography>
      ) : null}
      <Box sx={{ width: "100%", minHeight, minWidth: 0 }}>{children}</Box>
    </Paper>
  )
}

const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} id={`reporte-tabpanel-${index}`} {...other}>
    {value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null}
  </div>
)

function formatDateTime(d) {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })
  } catch {
    return String(d)
  }
}

export default function ReporteDashboardView({ reportData }) {
  const [tab, setTab] = useState(0)
  const meta = reportData?.meta
  const resumen = reportData?.resumen
  const series = reportData?.series
  const distribucion = reportData?.distribucion
  const listas = reportData?.listas
  const tipo = meta?.tipo_reporte

  const mergedDaily = useMemo(
    () => mergeDaily(series?.ventas_por_dia, series?.servicios_por_dia),
    [series?.ventas_por_dia, series?.servicios_por_dia],
  )

  const pieVentas = useMemo(
    () =>
      (distribucion?.ventas_por_tipo_pago || []).map((r) => ({
        name: labelTipoPago(r.tipo_pago),
        value: Number(r.total || 0),
      })),
    [distribucion?.ventas_por_tipo_pago],
  )

  const pieServicios = useMemo(
    () =>
      (distribucion?.servicios_por_tipo_pago || []).map((r) => ({
        name: labelTipoPago(r.tipo_pago),
        value: Number(r.total || 0),
      })),
    [distribucion?.servicios_por_tipo_pago],
  )

  const categoriasChart = distribucion?.ventas_por_categoria || []
  const hayVentas = tipo === "ventas" || tipo === "ambos"
  const hayServicios = tipo === "servicios" || tipo === "ambos"

  const tabIndex = useMemo(() => {
    let i = 0
    const o = { resumen: i++ }
    if (hayVentas) o.ventas = i++
    if (hayServicios) o.servicios = i++
    if (hayVentas) o.detalle = i++
    return o
  }, [hayVentas, hayServicios])

  useEffect(() => {
    setTab(0)
  }, [meta?.generado_at])

  const handleTabChange = (_, v) => setTab(v)

  const tooltipStyle = {
    borderRadius: 12,
    border: "none",
    boxShadow: "0 8px 30px rgba(15,23,42,0.12)",
    fontSize: 12,
  }

  if (!meta || !resumen) return null

  return (
    <Stack spacing={2} sx={{ mt: 0 }}>
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "#fff" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
              {meta.sucursal?.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {meta.periodo_label} · {meta.fecha_desde} → {meta.fecha_hasta}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              label={tipo === "ambos" ? "Ventas y servicios" : tipo === "ventas" ? "Solo ventas" : "Solo servicios"}
              sx={{ bgcolor: alpha("#0f172a", 0.05), fontWeight: 600, fontSize: "0.75rem" }}
            />
            <Chip size="small" variant="outlined" label={new Date(meta.generado_at).toLocaleString("es-AR")} sx={{ fontSize: "0.75rem" }} />
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {hayVentas ? (
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="VENTAS"
              value={fmtMoney(resumen.ventas_total_monto)}
              subtitle={`${resumen.ventas_total_count} comprobantes`}
              icon={ReceiptLongIcon}
            />
          </Grid>
        ) : null}
        {hayServicios ? (
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="SERVICIOS"
              value={fmtMoney(resumen.servicios_total_monto)}
              subtitle={`${resumen.servicios_total_count} órdenes`}
              icon={HandymanIcon}
            />
          </Grid>
        ) : null}
        {tipo === "ambos" ? (
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="COMBINADO"
              value={fmtMoney(resumen.combinado_monto)}
              subtitle="Ventas + servicios"
              icon={TrendingUpIcon}
            />
          </Grid>
        ) : null}
        <Grid item xs={12} sm={6} lg={tipo === "ambos" ? 3 : 6}>
          <StatCard
            title="ALCANCE DE TABLAS"
            value={`${resumen.ventas_lista_count + resumen.servicios_lista_count}`}
            subtitle="Filas en pestañas (orden reciente)"
            icon={PaymentsIcon}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {resumen.ventas_truncado ? (
          <Chip color="warning" size="small" label="Lista de ventas truncada: exportá Excel para ver todo" />
        ) : null}
        {resumen.servicios_truncado ? (
          <Chip color="warning" size="small" label="Lista de servicios truncada: exportá Excel para ver todo" />
        ) : null}
        {resumen.detalle_truncado ? (
          <Chip color="warning" size="small" label="Detalle de productos truncado en pantalla" />
        ) : null}
      </Stack>

      {mergedDaily.length > 0 && (hayVentas || hayServicios) ? (
        <ChartFrame
          title="Evolución diaria de ingresos"
          subtitle="Montos por día según filtros aplicados"
          minHeight={320}
        >
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={mergedDaily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ROJO} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={ROJO} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorServ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SLATE_DARK} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={SLATE_DARK} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(SLATE, 0.25)} />
              <XAxis dataKey="label" tick={{ fill: SLATE, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: SLATE, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                }
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => fmtMoney(value)}
                labelFormatter={(_, p) => (p?.[0]?.payload?.fecha ? `Fecha ${p[0].payload.fecha}` : "")}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {hayVentas ? (
                <Area
                  type="monotone"
                  dataKey="ventas"
                  name="Ventas"
                  stroke={ROJO}
                  fillOpacity={1}
                  fill="url(#colorVentas)"
                  strokeWidth={2}
                />
              ) : null}
              {hayServicios ? (
                <Area
                  type="monotone"
                  dataKey="servicios"
                  name="Servicios"
                  stroke={SLATE_DARK}
                  fillOpacity={1}
                  fill="url(#colorServ)"
                  strokeWidth={2}
                />
              ) : null}
            </AreaChart>
          </ResponsiveContainer>
        </ChartFrame>
      ) : (
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 2, border: "1px dashed #e5e7eb", textAlign: "center", bgcolor: "#fff" }}
        >
          <Typography color="text.secondary">No hay datos diarios para graficar en este periodo.</Typography>
        </Paper>
      )}

      <Grid container spacing={2}>
        {hayVentas && pieVentas.length > 0 ? (
          <Grid item xs={12} md={6}>
            <ChartFrame title="Ventas por tipo de pago" subtitle="Distribución del monto" minHeight={300}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieVentas}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {pieVentas.map((_, i) => (
                      <Cell key={i} fill={GRAFICO_PALETTE[i % GRAFICO_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtMoney(v)} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartFrame>
          </Grid>
        ) : null}
        {hayServicios && pieServicios.length > 0 ? (
          <Grid item xs={12} md={6}>
            <ChartFrame title="Servicios por tipo de pago" subtitle="Distribución del monto" minHeight={300}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieServicios}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {pieServicios.map((_, i) => (
                      <Cell key={i} fill={GRAFICO_PALETTE[(i + 2) % GRAFICO_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtMoney(v)} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartFrame>
          </Grid>
        ) : null}
      </Grid>

      {hayVentas && categoriasChart.length > 0 ? (
        <ChartFrame title="Ventas por categoría de producto" subtitle="Suma de subtotales en líneas de detalle" minHeight={360}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart layout="vertical" data={categoriasChart} margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(SLATE, 0.2)} />
              <XAxis
                type="number"
                tick={{ fill: SLATE, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => fmtMoney(v)}
              />
              <YAxis
                type="category"
                dataKey="categoria"
                width={120}
                tick={{ fill: SLATE_DARK, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtMoney(v)} />
              <Bar dataKey="total" name="Monto" fill={ROJO} radius={[0, 6, 6, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
      ) : null}

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minHeight: 44 },
            "& .Mui-selected": { color: `${ROJO} !important` },
            "& .MuiTabs-indicator": { bgcolor: ROJO, height: 3, borderRadius: 1.5 },
          }}
        >
          <Tab label="Resumen rápido" />
          {hayVentas ? <Tab label={`Ventas (${listas?.ventas?.length ?? 0})`} /> : null}
          {hayServicios ? <Tab label={`Servicios (${listas?.servicios?.length ?? 0})`} /> : null}
          {hayVentas ? <Tab label="Detalle productos" /> : null}
        </Tabs>
      </Box>

      <TabPanel value={tab} index={tabIndex.resumen}>
        <Grid container spacing={2}>
          {hayVentas ? (
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Ventas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monto total: {fmtMoney(resumen.ventas_total_monto)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comprobantes: {resumen.ventas_total_count}
                </Typography>
              </Paper>
            </Grid>
          ) : null}
          {hayServicios ? (
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Servicios
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monto total: {fmtMoney(resumen.servicios_total_monto)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Órdenes: {resumen.servicios_total_count}
                </Typography>
              </Paper>
            </Grid>
          ) : null}
        </Grid>
      </TabPanel>

      {hayVentas ? (
        <TabPanel value={tab} index={tabIndex.ventas}>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Pago</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(listas?.ventas || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Sin registros
                    </TableCell>
                  </TableRow>
                ) : (
                  listas.ventas.map((row) => (
                    <TableRow key={row.id} hover sx={{ "&:nth-of-type(even)": { bgcolor: "rgba(15, 23, 42, 0.02)" } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{row.numero}</TableCell>
                      <TableCell>{formatDateTime(row.created_at)}</TableCell>
                      <TableCell>{(row.cliente_nombre || "").trim() || "—"}</TableCell>
                      <TableCell>{labelTipoPago(row.tipo_pago)}</TableCell>
                      <TableCell>{row.estado}</TableCell>
                      <TableCell align="right">{fmtMoney(montoVentaRow(row))}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      ) : null}

      {hayServicios ? (
        <TabPanel value={tab} index={tabIndex.servicios}>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Vehículo</TableCell>
                  <TableCell>Pago</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(listas?.servicios || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Sin registros
                    </TableCell>
                  </TableRow>
                ) : (
                  listas.servicios.map((row, idx) => (
                    <TableRow key={`${row.numero}-${idx}`} hover sx={{ "&:nth-of-type(even)": { bgcolor: "rgba(15, 23, 42, 0.02)" } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{row.numero}</TableCell>
                      <TableCell>{formatDateTime(row.created_at)}</TableCell>
                      <TableCell>{(row.cliente_nombre || "").trim() || "—"}</TableCell>
                      <TableCell>{[row.vehiculo_patente, row.vehiculo_marca].filter(Boolean).join(" · ") || "—"}</TableCell>
                      <TableCell>{labelTipoPago(row.tipo_pago)}</TableCell>
                      <TableCell align="right">{fmtMoney(row.total)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      ) : null}

      {hayVentas ? (
        <TabPanel value={tab} index={tabIndex.detalle}>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", maxHeight: 440, bgcolor: "#fff" }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Venta</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Cant.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(listas?.detalle_productos || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Sin líneas
                    </TableCell>
                  </TableRow>
                ) : (
                  listas.detalle_productos.map((row, idx) => (
                    <TableRow key={`${row.venta_numero}-${idx}`} hover sx={{ "&:nth-of-type(even)": { bgcolor: "rgba(15, 23, 42, 0.02)" } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{row.venta_numero}</TableCell>
                      <TableCell>{row.categoria || "—"}</TableCell>
                      <TableCell>{row.producto_nombre}</TableCell>
                      <TableCell align="right">{row.cantidad}</TableCell>
                      <TableCell align="right">{fmtMoney(row.subtotal_linea)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      ) : null}
    </Stack>
  )
}
