"use client"

import { useState, useEffect, useRef } from "react"
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  Typography,
  Paper,
  Chip,
  Tooltip,
  CircularProgress,
  Button,
} from "@mui/material"
import {
  Search as SearchIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Inventory as InventoryIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from "@mui/icons-material"
import { formatCurrency, formatQuantity } from "../../utils/formatters"

const ProductoSelector = ({
  productos,
  loading,
  onSelectProducto,
  searchTerm,
  onSearchChange,
  hasMore,
  onLoadMore,
  sucursalVenta,
  usuarioTieneMultiplesSucursales,
  searchInputRef,
}) => {
  const [searchMode, setSearchMode] = useState("nombre")
  const localSearchInputRef = useRef(null)
  const ref = searchInputRef || localSearchInputRef

  useEffect(() => {
    if (ref.current) {
      ref.current.focus()
    }
  }, [searchMode, ref])

  const handleToggleSearchMode = () => {
    setSearchMode((prev) => (prev === "nombre" ? "codigo" : "nombre"))
    onSearchChange("")
  }

  const handleClearSearch = () => {
    onSearchChange("")
    if (ref.current) {
      ref.current.focus()
    }
  }

  const handleProductoClick = (producto) => {
    if (producto.stock > 0 && producto.activo) {
      onSelectProducto(producto)
    }
  }

  const getStockColor = (stock) => {
    if (stock === 0) return "error"
    if (stock < 10) return "warning"
    return "success"
  }

  const isProductoDeshabilitado = (producto) => {
    if (producto.stock === 0 || !producto.activo) return true

    if (usuarioTieneMultiplesSucursales && sucursalVenta) {
      return producto.sucursal_id !== sucursalVenta.id
    }

    return false
  }

  const formatStock = (stock, unidadMedida) => {
    const isLitro = unidadMedida === "litro"
    const formattedQty = formatQuantity(stock, unidadMedida)
    return `${formattedQty}${isLitro ? "L" : "u"}`
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ mb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          inputRef={ref}
          placeholder={searchMode === "nombre" ? "Buscar por nombre o descripción..." : "Escanear o ingresar código..."}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#dc2626", fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {searchTerm && (
                  <Tooltip title="Limpiar búsqueda">
                    <IconButton
                      onClick={handleClearSearch}
                      size="small"
                      sx={{
                        color: "#dc2626",
                        "&:hover": { bgcolor: "#fef2f2" },
                        mr: 0.5,
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={searchMode === "nombre" ? "Buscar por código" : "Buscar por nombre"}>
                  <IconButton
                    onClick={handleToggleSearchMode}
                    size="small"
                    sx={{
                      color: searchMode === "codigo" ? "#dc2626" : "#6b7280",
                      "&:hover": { bgcolor: "#fef2f2" },
                    }}
                  >
                    <QrCodeScannerIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1.5,
              "&:hover fieldset": {
                borderColor: "#dc2626",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#dc2626",
              },
            },
          }}
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          border: "1px solid #e5e7eb",
        }}
      >
        {loading && productos.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
            <CircularProgress sx={{ color: "#dc2626" }} size={32} />
          </Box>
        ) : productos.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              p: 4,
            }}
          >
            <InventoryIcon sx={{ fontSize: 56, color: "#d1d5db", mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom sx={{ fontSize: "1rem", fontWeight: 500 }}>
              {searchTerm ? "No se encontraron productos" : "Busca productos para comenzar"}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.875rem" }}>
              {searchTerm ? "Intenta con otro término de búsqueda" : "Escribe en el buscador para ver resultados"}
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ overflow: "auto", flex: 1, p: 0 }}>
              {productos.map((producto) => {
                const deshabilitado = isProductoDeshabilitado(producto)
                const noEsSucursalVenta =
                  usuarioTieneMultiplesSucursales && sucursalVenta && producto.sucursal_id !== sucursalVenta.id

                return (
                  <ListItem
                    key={producto.id}
                    button
                    onClick={() => handleProductoClick(producto)}
                    disabled={deshabilitado}
                    sx={{
                      borderBottom: "1px solid #f3f4f6",
                      "&:hover": {
                        bgcolor: !deshabilitado ? "#fef2f2" : "transparent",
                      },
                      opacity: deshabilitado ? 0.5 : 1,
                      cursor: !deshabilitado ? "pointer" : "not-allowed",
                      py: 1.5,
                      px: 2,
                    }}
                  >
                    <Box sx={{ width: "100%" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ color: "#171717", fontSize: "0.9rem" }}>
                          {producto.nombre}
                        </Typography>
                        <Typography variant="h6" fontWeight={600} sx={{ color: "#dc2626", fontSize: "1rem" }}>
                          {formatCurrency(producto.precio)}
                        </Typography>
                      </Box>

                      {producto.descripcion && (
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontSize: "0.8rem" }}>
                          {producto.descripcion}
                        </Typography>
                      )}

                      {noEsSucursalVenta && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#f59e0b",
                            fontWeight: 500,
                            display: "block",
                            mb: 0.5,
                            bgcolor: "#fef3c7",
                            px: 1,
                            py: 0.3,
                            borderRadius: 0.5,
                            fontSize: "0.75rem",
                          }}
                        >
                          Solo visible - No disponible para esta venta
                        </Typography>
                      )}

                      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", flexWrap: "wrap", mt: 1 }}>
                        {producto.codigo && (
                          <Chip
                            label={`Código: ${producto.codigo}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, fontSize: "0.75rem" }}
                          />
                        )}
                        {producto.categoria_nombre && (
                          <Chip
                            label={producto.categoria_nombre}
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, fontSize: "0.75rem" }}
                          />
                        )}
                        {producto.sucursal_nombre && (
                          <Chip
                            label={producto.sucursal_nombre}
                            size="small"
                            variant="outlined"
                            color={noEsSucursalVenta ? "warning" : "primary"}
                            sx={{ height: 22, fontSize: "0.75rem" }}
                          />
                        )}
                        <Chip
                          label={`Stock: ${formatStock(producto.stock, producto.unidad_medida)}`}
                          size="small"
                          color={getStockColor(producto.stock)}
                          sx={{ height: 22, fontSize: "0.75rem" }}
                        />
                      </Box>
                    </Box>
                  </ListItem>
                )
              })}
            </List>

            {hasMore && (
              <Box sx={{ p: 1.5, borderTop: "1px solid #e5e7eb", textAlign: "center" }}>
                <Button
                  variant="outlined"
                  onClick={onLoadMore}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : <ExpandMoreIcon />}
                  fullWidth
                  size="small"
                  sx={{
                    borderColor: "#d1d5db",
                    color: "#374151",
                    "&:hover": {
                      borderColor: "#dc2626",
                      bgcolor: "#fef2f2",
                    },
                  }}
                >
                  {loading ? "Cargando..." : "Ver más productos"}
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  )
}

export default ProductoSelector
