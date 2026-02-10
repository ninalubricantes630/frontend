"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Box,
  TextField,
  Typography,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
} from "@mui/material"
import {
  Search as SearchIcon,
  Inventory as InventoryIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from "@mui/icons-material"
import { productosService } from "../../services/productosService"
import { formatQuantity } from "../../utils/formatters"

const ProductoSelectorServicio = ({ onSelectProducto, productosAgregados = [], sucursalId }) => {
  const [busqueda, setBusqueda] = useState("")
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [mostrarResultados, setMostrarResultados] = useState(5)
  const searchInputRef = useRef(null)

  const buscarProductos = useCallback(
    async (searchTerm) => {
      if (!searchTerm || searchTerm.trim().length < 2) {
        setProductos([])
        setMostrarResultados(5)
        return
      }

      if (!sucursalId) {
        setProductos([])
        return
      }

      setLoading(true)
      try {
        const params = {
          page: 1,
          limit: 100,
          search: searchTerm.trim(),
          sucursales_ids: sucursalId.toString(),
        }

        const response = await productosService.getAll(params)

        let productosData = []

        // El backend devuelve { success, data: { productos: [...], pagination: {...} } }
        // Y productosService.getAll() devuelve response.data
        if (response && response.data && response.data.productos) {
          productosData = response.data.productos
        } else if (response && response.productos) {
          productosData = response.productos
        } else if (Array.isArray(response)) {
          productosData = response
        } else if (response && response.data && Array.isArray(response.data)) {
          productosData = response.data
        }

        setProductos(productosData)
      } catch (error) {
        setProductos([])
      } finally {
        setLoading(false)
      }
    },
    [sucursalId],
  )

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarProductos(busqueda)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [busqueda, buscarProductos])

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Permitir usar/vender productos con stock 0 (el stock puede quedar en negativo, igual que en ventas)
  const handleProductoClick = (producto) => {
    onSelectProducto(producto)
  }

  const handleClearSearch = () => {
    setBusqueda("")
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  const productoYaAgregado = (productoId) => {
    return productosAgregados.some((p) => p.producto_id === productoId)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  const formatStockDisplay = (stock, unidadMedida) => {
    return formatQuantity(stock, unidadMedida)
  }

  const productosFiltrados = productos.slice(0, mostrarResultados)
  const hayMasResultados = productos.length > mostrarResultados

  return (
    <Box>
      <TextField
        fullWidth
        inputRef={searchInputRef}
        placeholder="Buscar productos por nombre, código o categoría..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#dc2626" }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {busqueda && (
                <IconButton onClick={handleClearSearch} size="small" sx={{ mr: 0.5 }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
              {loading && <CircularProgress size={20} sx={{ color: "#dc2626" }} />}
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            borderRadius: 1.5,
            bgcolor: "white",
            "&:hover fieldset": { borderColor: "#dc2626" },
            "&.Mui-focused fieldset": { borderColor: "#dc2626" },
          },
        }}
      />

      {!sucursalId && busqueda.trim().length >= 2 && (
        <Alert severity="warning" sx={{ borderRadius: 1.5, mb: 2 }}>
          Selecciona una sucursal primero para buscar productos
        </Alert>
      )}

      {busqueda.trim().length >= 2 && sucursalId && (
        <Box>
          {productos.length === 0 && !loading && (
            <Alert severity="info" sx={{ borderRadius: 1.5 }}>
              No se encontraron productos con "{busqueda}" en esta sucursal
            </Alert>
          )}

          {productosFiltrados.length > 0 && (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <InventoryIcon sx={{ color: "#dc2626", fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                  Productos Encontrados
                </Typography>
                <Chip
                  label={productos.length}
                  size="small"
                  sx={{ bgcolor: "#dc2626", color: "white", fontWeight: 600 }}
                />
              </Box>

              <List sx={{ p: 0 }}>
                {productosFiltrados.map((producto) => {
                  const yaAgregado = productoYaAgregado(producto.id)
                  const stockDisponible = producto.stock || 0

                  return (
                    <ListItem
                      key={producto.id}
                      disablePadding
                      sx={{
                        mb: 1,
                        border: yaAgregado ? "2px solid #16a34a" : "1px solid #e5e7eb",
                        borderRadius: 1.5,
                        bgcolor: yaAgregado ? "#f0fdf4" : "white",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: yaAgregado ? "#16a34a" : "#dc2626",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          bgcolor: yaAgregado ? "#f0fdf4" : "#fef2f2",
                        },
                        cursor: "pointer",
                      }}
                      button
                      onClick={() => handleProductoClick(producto)}
                    >
                      <Box sx={{ p: 2, width: "100%", display: "flex", alignItems: "center", gap: 2 }}>
                        {/* Producto Info */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0f172a", mb: 0.5 }}>
                            {producto.nombre}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <Chip
                              label={formatCurrency(producto.precio)}
                              size="small"
                              sx={{
                                bgcolor: "#fef2f2",
                                color: "#dc2626",
                                fontWeight: 600,
                                height: 24,
                              }}
                            />
                            <Chip
                              label={`Stock: ${formatStockDisplay(stockDisponible, producto.unidad_medida)} ${producto.unidad_medida === "litro" ? "l" : "u"}`}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: stockDisponible > 0 ? "#16a34a" : "#ef4444",
                                color: stockDisponible > 0 ? "#16a34a" : "#ef4444",
                                height: 24,
                              }}
                            />
                            {producto.codigo && (
                              <Typography variant="caption" sx={{ color: "#64748b" }}>
                                Cód: {producto.codigo}
                              </Typography>
                            )}
                            {producto.categoria_nombre && (
                              <Chip
                                label={producto.categoria_nombre}
                                size="small"
                                variant="outlined"
                                sx={{ height: 24 }}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Status Badge */}
                        {yaAgregado && (
                          <Chip
                            label="Agregado"
                            size="small"
                            sx={{
                              bgcolor: "#16a34a",
                              color: "white",
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Box>
                    </ListItem>
                  )
                })}
              </List>

              {hayMasResultados && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ExpandMoreIcon />}
                    onClick={() => setMostrarResultados((prev) => prev + 5)}
                    sx={{
                      borderColor: "#e5e7eb",
                      color: "#64748b",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "#dc2626",
                        color: "#dc2626",
                        bgcolor: "#fef2f2",
                      },
                    }}
                  >
                    Ver más resultados ({productos.length - mostrarResultados} restantes)
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {busqueda.trim().length < 2 && (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            px: 2,
            bgcolor: "#f8fafc",
            borderRadius: 1.5,
            border: "1px dashed #cbd5e1",
          }}
        >
          <SearchIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
          <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 500 }}>
            Escribe al menos 2 caracteres para buscar productos
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 0.5 }}>
            Haz clic en un producto para seleccionar cantidad y agregarlo
          </Typography>
          {!sucursalId && (
            <Typography variant="caption" sx={{ color: "#f59e0b", display: "block", mt: 1, fontWeight: 500 }}>
              ⚠️ Asegúrate de seleccionar una sucursal primero
            </Typography>
          )}
        </Box>
      )}
    </Box>
  )
}

export default ProductoSelectorServicio
