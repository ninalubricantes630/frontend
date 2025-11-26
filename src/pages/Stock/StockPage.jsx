"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  IconButton,
  Grid,
  CircularProgress,
} from "@mui/material"
import {
  Add as AddIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  FilterList as FilterListIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material"
import ProductosList from "../../components/Stock/ProductosList"
import ProductoForm from "../../components/Stock/ProductoForm"
import MovimientoStockModal from "../../components/Stock/MovimientoStockModal"
import HistorialMovimientosModal from "../../components/Stock/HistorialMovimientosModal"
import ImportarExcelModal from "../../components/Stock/ImportarExcelModal"
import { useProductos } from "../../hooks/useProductos"
import { productosService } from "../../services/productosService"
import { useCategorias } from "../../hooks/useCategorias"
import { useSucursales } from "../../hooks/useSucursales"
import { useAuth } from "../../contexts/AuthContext"

const StockPage = () => {
  const { productos, loading, pagination, loadProductos, createProducto, updateProducto, deleteProducto } =
    useProductos()
  const { categorias, loadCategorias } = useCategorias()
  const { sucursales, loadSucursales } = useSucursales()
  const { user, loading: authLoading } = useAuth()

  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    categoria_id: "",
    sucursal_id: "",
    unidad_medida: "",
  })
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [usuarioTieneMultiplesSucursales, setUsuarioTieneMultiplesSucursales] = useState(false)

  const [openForm, setOpenForm] = useState(false)
  const [openMovimiento, setOpenMovimiento] = useState(false)
  const [openHistorial, setOpenHistorial] = useState(false)
  const [openImportar, setOpenImportar] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState(null)
  const [productoParaMovimiento, setProductoParaMovimiento] = useState(null)
  const [productoParaHistorial, setProductoParaHistorial] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  // Initial load for categorias and sucursales only once
  useEffect(() => {
    loadCategorias(1, "", 100)
    loadSucursales()
  }, []) // Empty dependency array - load only once on mount

  // Load productos when user is ready
  useEffect(() => {
    if (user?.sucursales && user.sucursales.length > 0) {
      loadProductos()
    }
  }, [user?.id]) // Only trigger when user ID changes, not on every user prop change

  useEffect(() => {
    if (user?.sucursales && user.sucursales.length > 0) {
      if (user.sucursales.length === 1) {
        // User has only one sucursal - set it as default filter and disable changes
        setFilters((prev) => ({
          ...prev,
          sucursal_id: user.sucursales[0].id,
        }))
        setUsuarioTieneMultiplesSucursales(false)
      } else {
        // User has multiple sucursales - allow filtering
        setUsuarioTieneMultiplesSucursales(true)
        // Don't set a default, show all products from all user's sucursales
      }
    }
  }, [user])

  // Search debounce effect
  useEffect(() => {
    if (!user?.sucursales || user.sucursales.length === 0) return

    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filters, priceRange, user])

  const handleSearch = useCallback(() => {
    if (!user?.sucursales || user.sucursales.length === 0) return

    const params = {}

    if (searchTerm) {
      params.search = searchTerm
    }

    if (filters.categoria_id) {
      params.categoria_id = filters.categoria_id
    }

    if (filters.sucursal_id) {
      // User manually selected a specific sucursal
      params.sucursal_id = filters.sucursal_id
    } else if (user.sucursales.length === 1) {
      // User has only one sucursal - always filter by it
      params.sucursal_id = user.sucursales[0].id
    } else {
      // User has multiple sucursales and didn't select one - show all their sucursales
      params.sucursales_ids = user.sucursales.map((s) => s.id).join(",")
    }

    if (filters.unidad_medida) {
      params.unidad_medida = filters.unidad_medida
    }

    if (priceRange[0] > 0) {
      params.precio_min = priceRange[0]
    }

    if (priceRange[1] < 100000) {
      params.precio_max = priceRange[1]
    }

    loadProductos(1, pagination.limit, params)
  }, [searchTerm, filters, priceRange, pagination.limit, user])

  const handleClearFilters = () => {
    setSearchTerm("")
    const newFilters = {
      categoria_id: "",
      sucursal_id: "",
      unidad_medida: "",
    }

    if (user?.sucursales && user.sucursales.length === 1) {
      newFilters.sucursal_id = user.sucursales[0].id
    }

    setFilters(newFilters)
    setPriceRange([0, 100000])

    const params = {}
    if (user?.sucursales && user.sucursales.length === 1) {
      params.sucursal_id = user.sucursales[0].id
    } else if (user?.sucursales && user.sucursales.length > 1) {
      params.sucursales_ids = user.sucursales.map((s) => s.id).join(",")
    }

    loadProductos(1, pagination.limit, params)
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue)
  }

  const toggleFilters = () => {
    setShowFilters((prev) => !prev)
  }

  const activeFiltersCount = () => {
    let count = 0
    if (filters.categoria_id) count++
    if (usuarioTieneMultiplesSucursales && filters.sucursal_id) count++
    if (filters.unidad_medida) count++
    if (priceRange[0] > 0 || priceRange[1] < 100000) count++
    return count
  }

  const handleOpenForm = (producto = null) => {
    setSelectedProducto(producto)
    setOpenForm(true)
  }

  const handleCloseForm = () => {
    setSelectedProducto(null)
    setOpenForm(false)
  }

  const handleOpenMovimiento = (producto) => {
    setProductoParaMovimiento(producto)
    setOpenMovimiento(true)
  }

  const handleCloseMovimiento = () => {
    setProductoParaMovimiento(null)
    setOpenMovimiento(false)
  }

  const handleOpenHistorial = (producto) => {
    setProductoParaHistorial(producto)
    setOpenHistorial(true)
  }

  const handleCloseHistorial = () => {
    setProductoParaHistorial(null)
    setOpenHistorial(false)
  }

  const handleSubmitForm = async (data) => {
    try {
      if (selectedProducto) {
        await updateProducto(selectedProducto.id, data)
        setSnackbar({
          open: true,
          message: "Producto actualizado correctamente",
          severity: "success",
        })
      } else {
        await createProducto(data)
        setSnackbar({
          open: true,
          message: "Producto creado correctamente",
          severity: "success",
        })
      }
      handleCloseForm()
      handleSearch()
    } catch (error) {
      console.error("Error al guardar producto:", error)
      setSnackbar({
        open: true,
        message: "Error al guardar producto",
        severity: "error",
      })
    }
  }

  const handleSubmitMovimiento = async (data) => {
    try {
      await productosService.registrarMovimiento({
        producto_id: productoParaMovimiento.id,
        tipo: data.tipo.toUpperCase(),
        cantidad: Number.parseFloat(data.cantidad),
        motivo: data.motivo,
      })
      handleCloseMovimiento()
      handleSearch()
      setSnackbar({
        open: true,
        message: "Movimiento registrado correctamente",
        severity: "success",
      })
    } catch (error) {
      console.error("Error al registrar movimiento:", error)
      setSnackbar({
        open: true,
        message: error.message || "Error al registrar movimiento",
        severity: "error",
      })
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteProducto(id)
      handleSearch()
      setSnackbar({
        open: true,
        message: "Producto eliminado correctamente",
        severity: "success",
      })
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      setSnackbar({
        open: true,
        message: error.message || "Error al eliminar producto",
        severity: "error",
      })
    }
  }

  const handleToggle = async (id) => {
    try {
      await productosService.toggleEstado(id)
      handleSearch()
      setSnackbar({
        open: true,
        message: "Estado del producto actualizado correctamente",
        severity: "success",
      })
    } catch (error) {
      console.error("Error al actualizar estado del producto:", error)
      setSnackbar({
        open: true,
        message: error.message || "Error al actualizar estado del producto",
        severity: "error",
      })
    }
  }

  const handleOpenImportar = () => {
    setOpenImportar(true)
  }

  const handleCloseImportar = () => {
    setOpenImportar(false)
  }

  const handleImportar = async (data) => {
    try {
      const result = await productosService.importarExcel(data)
      const { productosCreados, productosActualizados, productosConError } = result

      let mensaje = `Importación completada: ${productosCreados} creados, ${productosActualizados} actualizados`

      if (productosConError > 0) {
        mensaje += `, ${productosConError} con errores`
      }

      setSnackbar({
        open: true,
        message: mensaje,
        severity: productosConError > 0 ? "warning" : "success",
      })

      handleSearch()
      return result
    } catch (error) {
      console.error("Error al importar productos:", error)
      setSnackbar({
        open: true,
        message: error.message || "Error al importar productos",
        severity: "error",
      })
      throw error
    }
  }

  const handlePageChange = (page, newLimit = null) => {
    if (!user?.sucursales || user.sucursales.length === 0) return

    const params = {}

    if (searchTerm) {
      params.search = searchTerm
    }

    if (filters.categoria_id) {
      params.categoria_id = filters.categoria_id
    }

    if (filters.sucursal_id) {
      params.sucursal_id = filters.sucursal_id
    } else if (user.sucursales.length === 1) {
      params.sucursal_id = user.sucursales[0].id
    } else {
      params.sucursales_ids = user.sucursales.map((s) => s.id).join(",")
    }

    if (filters.unidad_medida) {
      params.unidad_medida = filters.unidad_medida
    }

    if (priceRange[0] > 0) {
      params.precio_min = priceRange[0]
    }

    if (priceRange[1] < 100000) {
      params.precio_max = priceRange[1]
    }

    if (newLimit) {
      loadProductos(1, newLimit, params)
    } else {
      loadProductos(page, pagination.limit, params)
    }
  }

  if (authLoading || (user && user.sucursales === undefined)) {
    return (
      <Box sx={{ p: 2, display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 80px)" }}>
        <CircularProgress sx={{ color: "#dc2626" }} />
      </Box>
    )
  }

  if (!user?.sucursales || user.sucursales.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "error.light",
          }}
        >
          Tu usuario no tiene sucursales asignadas. Contacta al administrador para que te asigne una sucursal.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f8fafc" }}>
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e5e7eb",
          px: { xs: 2, sm: 2, md: 2 },
          py: { xs: 2, sm: 2.5 },
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", md: "center" },
            gap: { xs: 2, md: 0 },
          }}
        >
          <Box sx={{ mb: { xs: 0, md: 0 } }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5, letterSpacing: "-0.025em" }}
            >
              Stock
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
              {pagination?.total ?? 0} registros en total
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              alignItems: { xs: "stretch", sm: "center" },
              flexWrap: "wrap",
            }}
          >
            <TextField
              size="small"
              placeholder="Buscar productos en tiempo real..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "#64748b" }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")} sx={{ p: 0.5 }}>
                      <CloseIcon sx={{ fontSize: 18, color: "#64748b" }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: "100%", sm: 320 },
                flex: { xs: "1 1 auto", sm: "0 0 auto" },
                bgcolor: "#f8fafc",
                fontSize: "0.875rem",
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.875rem",
                  "& fieldset": {
                    borderColor: "#e5e7eb",
                  },
                  "&:hover fieldset": {
                    borderColor: "#cbd5e1",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#dc2626",
                    borderWidth: "1px",
                  },
                },
              }}
            />

            <Button
              variant="outlined"
              startIcon={showFilters ? <ExpandLessIcon /> : <FilterListIcon />}
              onClick={toggleFilters}
              sx={{
                minWidth: { xs: "100%", sm: "auto" },
                px: 2.5,
                py: 0.75,
                fontSize: "0.875rem",
                fontWeight: 500,
                borderColor: activeFiltersCount() > 0 ? "#dc2626" : "#e5e7eb",
                color: activeFiltersCount() > 0 ? "#dc2626" : "#475569",
                bgcolor: activeFiltersCount() > 0 ? "#fef2f2" : "#f8fafc",
                textTransform: "none",
                position: "relative",
                "&:hover": {
                  borderColor: activeFiltersCount() > 0 ? "#b91c1c" : "#cbd5e1",
                  bgcolor: activeFiltersCount() > 0 ? "#fee2e2" : "white",
                },
              }}
            >
              Filtros
              {activeFiltersCount() > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    bgcolor: "#dc2626",
                    color: "white",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {activeFiltersCount()}
                </Box>
              )}
            </Button>

            <Button
              variant="outlined"
              startIcon={<UploadIcon sx={{ fontSize: 18 }} />}
              onClick={handleOpenImportar}
              sx={{
                minWidth: { xs: "100%", sm: "auto" },
                px: 2.5,
                py: 0.75,
                fontSize: "0.875rem",
                fontWeight: 500,
                borderColor: "#3b82f6",
                color: "#3b82f6",
                bgcolor: "#eff6ff",
                textTransform: "none",
                "&:hover": {
                  borderColor: "#2563eb",
                  bgcolor: "#dbeafe",
                },
              }}
            >
              Importar Excel
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              onClick={() => handleOpenForm()}
              sx={{
                bgcolor: "#dc2626",
                color: "white",
                minWidth: { xs: "100%", sm: "auto" },
                px: 2.5,
                py: 0.75,
                fontSize: "0.875rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 1px 2px 0 rgba(220, 38, 38, 0.15)",
                "&:hover": {
                  bgcolor: "#b91c1c",
                  boxShadow: "0 4px 6px -1px rgba(220, 38, 38, 0.2)",
                },
              }}
            >
              Nuevo Producto
            </Button>
          </Box>
        </Box>

        <Collapse in={showFilters}>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "#f8fafc",
              borderRadius: 1,
              border: "1px solid #e5e7eb",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={filters.categoria_id}
                    label="Categoría"
                    onChange={(e) => handleFilterChange("categoria_id", e.target.value)}
                    sx={{
                      bgcolor: "white",
                      fontSize: "0.875rem",
                    }}
                  >
                    <MenuItem value="">
                      <em>Todas las categorías</em>
                    </MenuItem>
                    {categorias.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {usuarioTieneMultiplesSucursales && (
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sucursal</InputLabel>
                    <Select
                      value={filters.sucursal_id}
                      label="Sucursal"
                      onChange={(e) => handleFilterChange("sucursal_id", e.target.value)}
                      sx={{
                        bgcolor: "white",
                        fontSize: "0.875rem",
                      }}
                    >
                      <MenuItem value="">
                        <em>Todas mis sucursales</em>
                      </MenuItem>
                      {user.sucursales.map((suc) => (
                        <MenuItem key={suc.id} value={suc.id}>
                          {suc.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} sm={6} md={usuarioTieneMultiplesSucursales ? 4 : 6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Unidad de Medida</InputLabel>
                  <Select
                    value={filters.unidad_medida}
                    label="Unidad de Medida"
                    onChange={(e) => handleFilterChange("unidad_medida", e.target.value)}
                    sx={{
                      bgcolor: "white",
                      fontSize: "0.875rem",
                    }}
                  >
                    <MenuItem value="">
                      <em>Todas</em>
                    </MenuItem>
                    <MenuItem value="unidad">Unidad</MenuItem>
                    <MenuItem value="litro">Litro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={12} md={12}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    mb: 1,
                    display: "block",
                  }}
                >
                  Rango de Precio: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100000}
                  step={1000}
                  sx={{
                    color: "#dc2626",
                    "& .MuiSlider-thumb": {
                      bgcolor: "#dc2626",
                    },
                    "& .MuiSlider-track": {
                      bgcolor: "#dc2626",
                    },
                    "& .MuiSlider-rail": {
                      bgcolor: "#e5e7eb",
                    },
                  }}
                />
              </Grid>
            </Grid>

            {activeFiltersCount() > 0 && (
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  startIcon={<CloseIcon />}
                  onClick={handleClearFilters}
                  sx={{
                    color: "#dc2626",
                    textTransform: "none",
                    fontSize: "0.813rem",
                    "&:hover": {
                      bgcolor: "#fef2f2",
                    },
                  }}
                >
                  Limpiar filtros
                </Button>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", py: 2, overflow: "hidden" }}>
        {productosService.error && (
          <Alert severity="error" sx={{ mb: 2, py: 0.5 }}>
            {productosService.error}
          </Alert>
        )}

        <Box
          sx={{
            flex: 1,
            maxHeight: "calc(100vh - 220px)",
            overflow: "hidden",
            bgcolor: "white",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
          }}
        >
          <ProductosList
            productos={productos}
            loading={loading}
            pagination={pagination}
            onEdit={handleOpenForm}
            onDelete={handleDelete}
            onToggle={handleToggle}
            onMovimiento={handleOpenMovimiento}
            onVerHistorial={handleOpenHistorial}
            onPageChange={handlePageChange}
          />
        </Box>
      </Box>

      <ProductoForm open={openForm} onClose={handleCloseForm} producto={selectedProducto} onSubmit={handleSubmitForm} />

      <MovimientoStockModal
        open={openMovimiento}
        onClose={handleCloseMovimiento}
        producto={productoParaMovimiento}
        onSubmit={handleSubmitMovimiento}
      />

      <HistorialMovimientosModal open={openHistorial} onClose={handleCloseHistorial} producto={productoParaHistorial} />

      <ImportarExcelModal open={openImportar} onClose={handleCloseImportar} onImport={handleImportar} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default StockPage
