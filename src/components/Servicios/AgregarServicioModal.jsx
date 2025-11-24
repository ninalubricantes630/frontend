"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  Portal,
  Card,
  CardContent,
  Divider,
} from "@mui/material"
import {
  Add as AddIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material"
import ProductoSelectorServicio from "./ProductoSelectorServicio"
import CantidadModal from "../Ventas/CantidadModal"
import { formatQuantity as formatQuantityUtil } from "../../utils/formatters"
import { NumericFormat } from "react-number-format"

const AgregarServicioModal = ({ isOpen, onClose, onAddItem, tiposServicios = [], sucursalId, editingItem }) => {
  const [currentItem, setCurrentItem] = useState({
    tipoServicioId: editingItem?.tipoServicioId || null,
    tipoServicioNombre: editingItem?.tipoServicioNombre || "",
    observaciones: editingItem?.observaciones || "",
    notas: editingItem?.notas || "",
    productos: editingItem?.productos || [],
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTipos, setFilteredTipos] = useState([])
  const [showTiposList, setShowTiposList] = useState(false)
  const [selectedTipoServicio, setSelectedTipoServicio] = useState(
    editingItem ? { id: editingItem.tipoServicioId, nombre: editingItem.tipoServicioNombre } : null,
  )

  const [showCantidadModal, setShowCantidadModal] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [editandoProductoId, setEditandoProductoId] = useState(null)
  const [showManualPriceModal, setShowManualPriceModal] = useState(false)
  const [manualPrice, setManualPrice] = useState("")

  const searchFieldRef = useRef(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    if (editingItem) {
      setCurrentItem({
        tipoServicioId: editingItem.tipoServicioId,
        tipoServicioNombre: editingItem.tipoServicioNombre,
        observaciones: editingItem.observaciones || "",
        notas: editingItem.notas || "",
        productos: editingItem.productos || [],
      })
      setSelectedTipoServicio({
        id: editingItem.tipoServicioId,
        nombre: editingItem.tipoServicioNombre,
      })
    }
  }, [editingItem, isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  useEffect(() => {
    if (searchTerm && !selectedTipoServicio) {
      const filtered = tiposServicios.filter((tipo) => tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredTipos(filtered)
      setShowTiposList(true)

      if (searchFieldRef.current) {
        const rect = searchFieldRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        })
      }
    } else {
      setFilteredTipos([])
      setShowTiposList(false)
    }
  }, [searchTerm, tiposServicios, selectedTipoServicio])

  const handleSelectTipoServicio = (tipo) => {
    setSelectedTipoServicio(tipo)
    setCurrentItem((prev) => ({
      ...prev,
      tipoServicioId: tipo.id,
      tipoServicioNombre: tipo.nombre,
    }))
    setSearchTerm("")
    setFilteredTipos([])
    setShowTiposList(false)
  }

  const handleClearTipoServicio = () => {
    setSelectedTipoServicio(null)
    setCurrentItem((prev) => ({
      ...prev,
      tipoServicioId: null,
      tipoServicioNombre: "",
      productos: [],
    }))
    setSearchTerm("")
  }

  const handleSelectProducto = (producto) => {
    setProductoSeleccionado({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      unidad_medida: producto.unidad_medida,
      descripcion: producto.descripcion,
      codigo: producto.codigo,
    })
    setEditandoProductoId(null)
    setShowCantidadModal(true)
  }

  const handleEditProducto = (producto) => {
    setProductoSeleccionado({
      id: producto.producto_id,
      nombre: producto.nombre,
      precio: producto.precio_unitario,
      stock: producto.stock_disponible,
      unidad_medida: producto.unidad_medida,
      descripcion: producto.descripcion,
    })
    setEditandoProductoId(producto.producto_id)
    setShowCantidadModal(true)
  }

  const handleConfirmarCantidad = (cantidad) => {
    if (productoSeleccionado) {
      if (editandoProductoId) {
        setCurrentItem((prev) => ({
          ...prev,
          productos: prev.productos.map((p) =>
            p.producto_id === editandoProductoId ? { ...p, cantidad: cantidad } : p,
          ),
        }))
      } else {
        const productoExistente = currentItem.productos.find((p) => p.producto_id === productoSeleccionado.id)

        if (productoExistente) {
          setCurrentItem((prev) => ({
            ...prev,
            productos: prev.productos.map((p) =>
              p.producto_id === productoSeleccionado.id ? { ...p, cantidad: p.cantidad + cantidad } : p,
            ),
          }))
        } else {
          const nuevoProducto = {
            producto_id: productoSeleccionado.id,
            nombre: productoSeleccionado.nombre,
            precio_unitario: productoSeleccionado.precio,
            cantidad: cantidad,
            stock_disponible: productoSeleccionado.stock,
            unidad_medida: productoSeleccionado.unidad_medida,
            descripcion: productoSeleccionado.descripcion,
          }

          setCurrentItem((prev) => ({
            ...prev,
            productos: [...prev.productos, nuevoProducto],
          }))
        }
      }

      setShowCantidadModal(false)
      setProductoSeleccionado(null)
      setEditandoProductoId(null)
    }
  }

  const handleRemoveProducto = (productoId) => {
    setCurrentItem((prev) => ({
      ...prev,
      productos: prev.productos.filter((p) => p.producto_id !== productoId),
    }))
  }

  const calcularPrecioTotal = () => {
    return currentItem.productos.reduce((total, prod) => total + prod.precio_unitario * prod.cantidad, 0)
  }

  const handleAddItem = () => {
    if (currentItem.tipoServicioId) {
      if (currentItem.productos.length === 0) {
        setShowManualPriceModal(true)
        return
      }

      const newItem = {
        ...currentItem,
        id: editingItem?.id || Date.now(),
        total: calcularPrecioTotal(),
      }

      onAddItem(newItem)
      handleClose()
    }
  }

  const handleClose = () => {
    setCurrentItem({
      tipoServicioId: null,
      tipoServicioNombre: "",
      observaciones: "",
      notas: "",
      productos: [],
    })
    setSearchTerm("")
    setShowTiposList(false)
    setSelectedTipoServicio(null)
    setShowCantidadModal(false)
    setProductoSeleccionado(null)
    setEditandoProductoId(null)
    setShowManualPriceModal(false)
    setManualPrice("")
    onClose()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  const getUnidadLabel = (unidadMedida) => {
    return unidadMedida === "litro" ? "litros" : "unidades"
  }

  const handleConfirmarPrecioManual = () => {
    let precioNumerico = Number.parseFloat(manualPrice)
    if (isNaN(precioNumerico)) {
      precioNumerico = 0
    }


    const newItem = {
      ...currentItem,
      id: editingItem?.id || Date.now(),
      total: precioNumerico,
    }


    onAddItem(newItem)
    handleClose()
    setManualPrice("")
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box
          sx={{
            backgroundColor: "#fff",
            borderBottom: "1px solid #e5e7eb",
            p: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 8,
                height: 32,
                backgroundColor: "#dc2626",
                borderRadius: 1,
              }}
            />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: "#171717" }}>
              {editingItem ? "Editar Servicio" : "Agregar Nuevo Servicio"}
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: "#6b7280",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 3,
            backgroundColor: "#fafafa",
          }}
        >
          <Grid container spacing={3}>
            {/* Left Column - Service Type and Added Products */}
            <Grid item xs={12} md={6}>
              {/* Tipo de Servicio */}
              <Box
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 1.5,
                  p: 2.5,
                  border: "1px solid #e5e7eb",
                  mb: 2.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <BuildIcon sx={{ fontSize: 18, color: "#dc2626" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Tipo de Servicio *
                  </Typography>
                </Box>

                {!selectedTipoServicio ? (
                  <TextField
                    ref={searchFieldRef}
                    fullWidth
                    size="small"
                    placeholder="Buscar tipo de servicio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                        backgroundColor: "#fafafa",
                        "&:hover fieldset": { borderColor: "#dc2626" },
                        "&.Mui-focused fieldset": { borderColor: "#dc2626" },
                      },
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <BuildIcon sx={{ color: "#dc2626", fontSize: 20 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#171717" }}>
                        {selectedTipoServicio.nombre}
                      </Typography>
                      {selectedTipoServicio.descripcion && (
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          {selectedTipoServicio.descripcion}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      onClick={handleClearTipoServicio}
                      size="small"
                      sx={{
                        color: "#dc2626",
                        "&:hover": { bgcolor: "rgba(220, 38, 38, 0.1)" },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {currentItem.tipoServicioId && (
                <Box
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: 1.5,
                    border: "1px solid #e5e7eb",
                    mb: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderBottom: "1px solid #e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ShoppingCartIcon sx={{ fontSize: 18, color: "#dc2626" }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                        Productos Agregados
                      </Typography>
                    </Box>
                    {currentItem.productos.length > 0 && (
                      <Chip
                        label={currentItem.productos.length}
                        size="small"
                        sx={{ bgcolor: "#dc2626", color: "white", fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  <Box sx={{ p: 2 }}>
                    {currentItem.productos.length === 0 ? (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 3,
                          px: 2,
                          bgcolor: "#f8fafc",
                          borderRadius: 1,
                          border: "1px dashed #cbd5e1",
                        }}
                      >
                        <ShoppingCartIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          No hay productos agregados
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          Busca y agrega productos desde el selector (opcional)
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {currentItem.productos.map((producto) => (
                          <Card
                            key={producto.producto_id}
                            elevation={0}
                            onClick={() => handleEditProducto(producto)}
                            sx={{
                              border: "1px solid #fecaca",
                              borderRadius: 1,
                              bgcolor: "#fef2f2",
                              transition: "all 0.2s",
                              cursor: "pointer",
                              "&:hover": {
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                borderColor: "#dc2626",
                              },
                            }}
                          >
                            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600, color: "#0f172a" }}>
                                  {producto.nombre}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveProducto(producto.producto_id)
                                  }}
                                  sx={{
                                    color: "#dc2626",
                                    "&:hover": { bgcolor: "#fee2e2" },
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Box>

                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="caption" sx={{ color: "#64748b" }}>
                                  {formatQuantityUtil(producto.cantidad, producto.unidad_medida)}{" "}
                                  {getUnidadLabel(producto.unidad_medida)} ×
                                </Typography>

                                <Typography variant="caption" sx={{ color: "#64748b" }}>
                                  {formatCurrency(producto.precio_unitario)}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{ ml: "auto", fontWeight: 700, color: "#dc2626", fontFamily: "monospace" }}
                                >
                                  {formatCurrency(producto.precio_unitario * producto.cantidad)}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}

                        <Divider />
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                            Precio del Servicio:
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#dc2626", fontFamily: "monospace" }}>
                            {formatCurrency(calcularPrecioTotal())}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Observaciones y Notas */}
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: 1.5,
                      p: 2.5,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#2196f3" }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                        Observaciones
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      placeholder="Observaciones específicas del cliente o del vehículo..."
                      value={currentItem.observaciones}
                      onChange={(e) => setCurrentItem((prev) => ({ ...prev, observaciones: e.target.value }))}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1.5,
                          backgroundColor: "#fafafa",
                          "&:hover fieldset": { borderColor: "#dc2626" },
                          "&.Mui-focused fieldset": { borderColor: "#dc2626" },
                        },
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: 1.5,
                      p: 2.5,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#4caf50" }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                        Notas Internas
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      placeholder="Notas para el equipo técnico, recordatorios..."
                      value={currentItem.notas}
                      onChange={(e) => setCurrentItem((prev) => ({ ...prev, notas: e.target.value }))}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1.5,
                          backgroundColor: "#fafafa",
                          "&:hover fieldset": { borderColor: "#dc2626" },
                          "&.Mui-focused fieldset": { borderColor: "#dc2626" },
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* Right Column - Product Selector */}
            <Grid item xs={12} md={6}>
              {currentItem.tipoServicioId ? (
                <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, height: "100%" }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderBottom: "1px solid #e5e7eb",
                      bgcolor: "#fef2f2",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                      Buscar Productos del Inventario
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Haz clic en un producto para seleccionar cantidad
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 2 }}>
                    <ProductoSelectorServicio
                      onSelectProducto={handleSelectProducto}
                      productosAgregados={currentItem.productos}
                      sucursalId={sucursalId}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed #cbd5e1",
                    borderRadius: 2,
                    p: 4,
                    textAlign: "center",
                    bgcolor: "#f8fafc",
                  }}
                >
                  <Box>
                    <InventoryIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
                    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                      Selecciona un tipo de servicio primero
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 0.5 }}>
                      Luego podrás agregar productos del inventario
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        {showTiposList && filteredTipos.length > 0 && !selectedTipoServicio && (
          <Portal>
            <Paper
              sx={{
                position: "fixed",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 1500,
                maxHeight: 200,
                overflow: "auto",
                border: "1px solid #e0e0e0",
                boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.2), 0 4px 8px -2px rgba(0, 0, 0, 0.1)",
              }}
            >
              <List disablePadding>
                {filteredTipos.map((tipo, index) => (
                  <ListItem key={tipo.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleSelectTipoServicio(tipo)}
                      sx={{
                        borderBottom: index < filteredTipos.length - 1 ? "1px solid #f0f0f0" : "none",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "#d84315",
                            flexShrink: 0,
                          }}
                        />
                        <ListItemText
                          primary={tipo.nombre}
                          secondary={tipo.descripcion}
                          primaryTypographyProps={{ fontWeight: "medium" }}
                        />
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Portal>
        )}

        <Box
          sx={{
            borderTop: "1px solid #e5e7eb",
            p: 2.5,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
            backgroundColor: "#fff",
            flexShrink: 0,
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              borderColor: "#d1d5db",
              color: "#6b7280",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f9fafb",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddItem}
            variant="contained"
            disabled={!currentItem.tipoServicioId}
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: "#dc2626",
              "&:hover": {
                backgroundColor: "#b91c1c",
              },
              "&:disabled": {
                backgroundColor: "#e5e7eb",
                color: "#9ca3af",
              },
            }}
          >
            {editingItem ? "Actualizar Servicio" : "Agregar Servicio"}
          </Button>
        </Box>
      </Dialog>

      <Dialog
        open={showManualPriceModal}
        onClose={() => {
          setShowManualPriceModal(false)
          setManualPrice("")
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <Box
          sx={{
            backgroundColor: "#fff",
            borderBottom: "1px solid #e5e7eb",
            p: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#171717" }}>
            Ingrese el Precio del Servicio
          </Typography>
          <IconButton
            onClick={() => {
              setShowManualPriceModal(false)
              setManualPrice("")
            }}
            size="small"
            sx={{
              color: "#6b7280",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 2.5 }}>
            Este tipo de servicio no tiene productos. Ingrese el precio manualmente. Puede ingresar 0 si no desea
            cobrar.
          </Typography>

          <NumericFormat
            customInput={TextField}
            fullWidth
            label="Precio"
            value={manualPrice}
            onValueChange={(values) => {
              setManualPrice(values.floatValue || "")
            }}
            thousandSeparator="."
            decimalSeparator=","
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                backgroundColor: "#fafafa",
                "&:hover fieldset": { borderColor: "#dc2626" },
                "&.Mui-focused fieldset": { borderColor: "#dc2626" },
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 1.5, mt: 3, justifyContent: "flex-end" }}>
            <Button
              onClick={() => {
                setShowManualPriceModal(false)
                setManualPrice("")
              }}
              variant="outlined"
              sx={{
                borderColor: "#d1d5db",
                color: "#6b7280",
                "&:hover": {
                  borderColor: "#9ca3af",
                  backgroundColor: "#f9fafb",
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarPrecioManual}
              variant="contained"
              sx={{
                backgroundColor: "#dc2626",
                "&:hover": {
                  backgroundColor: "#b91c1c",
                },
              }}
            >
              Confirmar
            </Button>
          </Box>
        </Box>
      </Dialog>

      {showCantidadModal && productoSeleccionado && (
        <CantidadModal
          open={showCantidadModal}
          onClose={() => {
            setShowCantidadModal(false)
            setProductoSeleccionado(null)
            setEditandoProductoId(null)
          }}
          onConfirm={handleConfirmarCantidad}
          producto={productoSeleccionado}
          cantidadInicial={
            editandoProductoId
              ? currentItem.productos.find((p) => p.producto_id === editandoProductoId)?.cantidad || 1
              : 1
          }
        />
      )}
    </>
  )
}

export default AgregarServicioModal
