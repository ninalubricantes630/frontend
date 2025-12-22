"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { Box, Paper, Typography, Alert, Snackbar, Chip, CircularProgress } from "@mui/material"
import { ShoppingCart as ShoppingCartIcon, Store as StoreIcon } from "@mui/icons-material"
import ProductoSelector from "../../components/Ventas/ProductoSelector"
import CarritoVentas from "../../components/Ventas/CarritoVentas"
import CantidadModal from "../../components/Ventas/CantidadModal"
import PagoModal from "../../components/Ventas/PagoModal"
import InteresModal from "../../components/Ventas/InteresModal"
import DescuentoModal from "../../components/Ventas/DescuentoModal"
import SucursalSelector from "../../components/Ventas/SucursalSelector"
import { useVentas } from "../../hooks/useVentas"
import { useProductos } from "../../hooks/useProductos"
import { useAuth } from "../../contexts/AuthContext"
import PermissionGuard from "../../components/Auth/PermissionGuard"

export default function VentasPage() {
  const [carrito, setCarrito] = useState([])
  const [editandoItem, setEditandoItem] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [showCantidadModal, setShowCantidadModal] = useState(false)
  const [showPagoModal, setShowPagoModal] = useState(false)
  const [showInteresModal, setShowInteresModal] = useState(false)
  const [showDescuentoModal, setShowDescuentoModal] = useState(false)
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [sucursalVenta, setSucursalVenta] = useState(null)
  const [interes, setInteres] = useState(null)
  const [descuento, setDescuento] = useState(null)
  const pageRef = useRef(null)
  const searchInputRef = useRef(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const { createVenta, loading } = useVentas()
  const { productos, loading: loadingProductos, loadProductos, pagination } = useProductos()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    const recrear = searchParams.get("recrear")
    if (recrear === "true") {
      const ventaGuardada = localStorage.getItem("ventaParaRecrear")
      if (ventaGuardada) {
        try {
          const ventaData = JSON.parse(ventaGuardada)

          const productosVenta = ventaData.productos || ventaData.detalle || []
          if (productosVenta && Array.isArray(productosVenta)) {
            const carritoRecreado = productosVenta.map((prod) => ({
              producto_id: prod.producto_id,
              nombre: prod.producto_nombre || prod.nombre,
              descripcion: prod.descripcion || "",
              precio_unitario: prod.precio_unitario,
              cantidad: prod.cantidad,
              subtotal: prod.precio_unitario * prod.cantidad,
              stock: 999, // Stock ficticio para permitir edición
              unidad_medida: prod.unidad_medida || "unidad",
            }))
            setCarrito(carritoRecreado)
          }

          // Cargar descuento si existe
          if (ventaData.descuento > 0) {
            setDescuento({
              tipoDescuento: ventaData.tipo_descuento || "porcentaje",
              valorDescuento: ventaData.valor_descuento || 0,
              montoDescuento: ventaData.descuento,
            })
          }

          // Cargar interés del sistema si existe
          if (ventaData.interes_sistema_monto > 0) {
            setInteres({
              tipoInteres: ventaData.tipo_interes_sistema || "porcentaje",
              valorInteres: ventaData.valor_interes_sistema || 0,
              montoInteres: ventaData.interes_sistema_monto,
              total: ventaData.subtotal - (ventaData.descuento || 0) + ventaData.interes_sistema_monto,
            })
          }

          // Limpiar localStorage y query params
          localStorage.removeItem("ventaParaRecrear")
          setSearchParams({})

          showNotification("Venta cargada para recrear. Puedes modificar productos y método de pago.", "info")
        } catch (error) {
          console.error("[v0] Error al cargar venta para recrear:", error)
          localStorage.removeItem("ventaParaRecrear")
          showNotification("Error al cargar la venta para recrear", "error")
        }
      }
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (user?.sucursales && user.sucursales.length > 0) {
      const principal = user.sucursales.find((s) => s.es_principal)
      const sucursalInicial = principal || user.sucursales[0]
      setSucursalVenta(sucursalInicial)
    }
  }, [user])

  useEffect(() => {
    if (pagination) {
      setHasMore(pagination.currentPage < pagination.totalPages)
    }
  }, [pagination])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "F1" &&
        !showCantidadModal &&
        !showPagoModal &&
        !showInteresModal &&
        !showDescuentoModal &&
        carrito.length > 0
      ) {
        e.preventDefault()
        handleProcesarVenta()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [carrito, showCantidadModal, showPagoModal, showInteresModal, showDescuentoModal])

  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setPage(1)

    if (value.trim() && sucursalVenta) {
      buscarProductos(value, 1)
    }
  }

  const buscarProductos = (termino, pageNum = 1) => {
    if (!sucursalVenta || !user?.sucursales) return

    const filters = { search: termino }

    if (user.sucursales.length === 1) {
      filters.sucursales_ids = sucursalVenta.id.toString()
    } else {
      filters.sucursales_ids = user.sucursales.map((s) => s.id).join(",")
    }

    loadProductos(pageNum, 10, filters)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    buscarProductos(searchTerm, nextPage)
  }

  const handleSelectProducto = (producto) => {
    if (!sucursalVenta) {
      showNotification("Error: No hay sucursal de venta seleccionada", "error")
      return
    }

    if (producto.sucursal_id !== sucursalVenta.id) {
      showNotification(
        `No puedes agregar productos de "${producto.sucursal_nombre}". Esta venta es para "${sucursalVenta.nombre}"`,
        "error",
      )
      return
    }

    if (producto.stock <= 0) {
      showNotification("Este producto no tiene stock disponible", "warning")
      return
    }

    if (!producto.activo) {
      showNotification("Este producto está inactivo", "warning")
      return
    }

    setProductoSeleccionado({ ...producto, unidad_medida: producto.unidad_medida })
    setEditandoItem(false)
    setShowCantidadModal(true)
  }

  const handleConfirmarCantidad = (cantidad) => {
    if (productoSeleccionado) {
      const itemExistente = carrito.find((item) => item.producto_id === productoSeleccionado.id)
      if (itemExistente && !editandoItem) {
        handleAgregarProducto(productoSeleccionado, cantidad)
      } else if (editandoItem) {
        handleActualizarCantidad(productoSeleccionado.id, cantidad)
      } else {
        handleAgregarProducto(productoSeleccionado, cantidad)
      }
      setShowCantidadModal(false)
      setProductoSeleccionado(null)
      setEditandoItem(false)

      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }, 100)
    }
  }

  const handleAgregarProducto = (producto, cantidad) => {
    const itemExistente = carrito.find((item) => item.producto_id === producto.id)

    if (itemExistente) {
      setCarrito(
        carrito.map((item) =>
          item.producto_id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + cantidad,
                subtotal: item.precio_unitario * (item.cantidad + cantidad),
              }
            : item,
        ),
      )
    } else {
      setCarrito([
        ...carrito,
        {
          producto_id: producto.id,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio_unitario: producto.precio,
          cantidad: cantidad,
          subtotal: producto.precio * cantidad,
          stock: producto.stock,
          unidad_medida: producto.unidad_medida || "unidad",
        },
      ])
    }

    showNotification("Producto agregado al carrito", "success")
  }

  const handleActualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      handleEliminarProducto(productoId)
      return
    }

    setCarrito(
      carrito.map((item) =>
        item.producto_id === productoId
          ? {
              ...item,
              cantidad: nuevaCantidad,
              subtotal: item.precio_unitario * nuevaCantidad,
            }
          : item,
      ),
    )
  }

  const handleEliminarProducto = (productoId) => {
    setCarrito(carrito.filter((item) => item.producto_id !== productoId))
    showNotification("Producto eliminado del carrito", "info")
  }

  const calcularSubtotal = () => {
    return carrito.reduce((total, item) => total + item.subtotal, 0)
  }

  const calcularTotal = () => {
    const subtotal = calcularSubtotal()
    let total = subtotal

    // Aplicar descuento
    if (descuento && descuento.montoDescuento > 0) {
      total -= descuento.montoDescuento
    }

    // Aplicar interés
    if (interes && interes.montoInteres > 0) {
      total += interes.montoInteres
    }

    return Math.max(0, total)
  }

  const handleProcesarVenta = () => {
    if (carrito.length === 0) {
      showNotification("El carrito está vacío", "warning")
      return
    }
    setShowPagoModal(true)
  }

  const handleConfirmarDescuento = (descuentoData) => {
    if (descuentoData.montoDescuento > 0 && interes && interes.montoInteres > 0) {
      showNotification(
        "No se puede aplicar descuento e interés del sistema simultáneamente. Deselecciona el interés primero.",
        "error",
      )
      return
    }

    if (descuentoData.montoDescuento === 0) {
      setDescuento(null)
    } else {
      setDescuento(descuentoData)
    }
    setShowDescuentoModal(false)
    showNotification("Descuento actualizado", "success")
  }

  const handleConfirmarInteres = (interesData) => {
    if (interesData.montoInteres > 0 && descuento && descuento.montoDescuento > 0) {
      showNotification(
        "No se puede aplicar interés del sistema y descuento simultáneamente. Deselecciona el descuento primero.",
        "error",
      )
      return
    }

    if (interesData.montoInteres === 0) {
      setInteres(null)
    } else {
      setInteres(interesData)
    }
    setShowInteresModal(false)
    showNotification("Interés actualizado", "success")
  }

  const handleConfirmarVenta = async (datosPago) => {
    try {
      if (!sucursalVenta) {
        showNotification("Error: No hay sucursal de venta seleccionada", "error")
        return
      }

      const ventaData = {
        items: carrito.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
        })),
        tipo_pago: datosPago.tipo_pago,
        cliente_id: datosPago.cliente_id || null,
        observaciones: datosPago.observaciones || "",
        sucursal_id: sucursalVenta.id,
        // Información de descuento
        descuento: datosPago.descuento || 0,
        // Información de interés del sistema
        interes_sistema: datosPago.interes_sistema || 0,
        tipo_interes_sistema: datosPago.tipo_interes_sistema || null,
        valor_interes_sistema: datosPago.valor_interes_sistema || 0,
        // Tarjeta
        tarjeta_id: datosPago.tarjeta_id || null,
        numero_cuotas: datosPago.numero_cuotas || null,
        // Totales
        total_con_interes: datosPago.total_con_interes || calcularTotal(),
        total_con_interes_tarjeta: datosPago.total_con_interes_tarjeta || null,
        // Interés de tarjeta
        interes_tarjeta: datosPago.interes_tarjeta || 0,
        tasa_interes_tarjeta: datosPago.tasa_interes_tarjeta || null,
      }

      const result = await createVenta(ventaData)

      if (result.success) {
        setCarrito([])
        setInteres(null)
        setDescuento(null)
        setShowPagoModal(false)
        showNotification("Venta procesada exitosamente", "success")

        if (searchTerm.trim()) {
          buscarProductos(searchTerm, 1)
        }
      } else {
        showNotification(result.error || "Error al procesar la venta", "error")
      }
    } catch (error) {
      console.error("Error al procesar venta:", error)
      showNotification(error.message || "Error al procesar la venta", "error")
    }
  }

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity })
  }

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  const handleAbrirCantidadModal = (item) => {
    setProductoSeleccionado({
      id: item.producto_id,
      nombre: item.nombre,
      precio: item.precio_unitario,
      stock: item.stock,
      unidad_medida: item.unidad_medida,
    })
    setEditandoItem(true)
    setShowCantidadModal(true)
  }

  const handleCambiarSucursal = (nuevaSucursal) => {
    if (carrito.length > 0) {
      const confirmar = window.confirm(
        `¿Estás seguro de que deseas cambiar a la sucursal "${nuevaSucursal.nombre}"?\n\nEsto limpiará el carrito actual ya que los productos pertenecen a otra sucursal.`,
      )

      if (!confirmar) {
        return
      }

      setCarrito([])
      setDescuento(null)
      setInteres(null)
      showNotification(`Carrito limpiado. Ahora puedes agregar productos de "${nuevaSucursal.nombre}"`, "info")
    }

    setSucursalVenta(nuevaSucursal)

    setSearchTerm("")
    setPage(1)

    showNotification(`Sucursal cambiada a "${nuevaSucursal.nombre}"`, "success")
  }

  if (authLoading || (user && user.sucursales === undefined)) {
    return (
      <PermissionGuard requiredPermission="create_venta">
        <Box
          sx={{ p: 2, display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 80px)" }}
        >
          <CircularProgress sx={{ color: "#dc2626" }} />
        </Box>
      </PermissionGuard>
    )
  }

  if (!user?.sucursales || user.sucursales.length === 0) {
    return (
      <PermissionGuard requiredPermission="create_venta">
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
      </PermissionGuard>
    )
  }

  return (
    <PermissionGuard requiredPermission="create_venta">
      <Box
        ref={pageRef}
        sx={{
          p: 2,
          height: "calc(100vh - 80px)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          bgcolor: "#f8fafc",
        }}
        tabIndex={0}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ShoppingCartIcon sx={{ color: "#dc2626", fontSize: 28 }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#1e293b",
                letterSpacing: "-0.02em",
              }}
            >
              Punto de Venta
            </Typography>
          </Box>
          {sucursalVenta && user?.sucursales && user.sucursales.length > 1 ? (
            <SucursalSelector
              sucursales={user.sucursales}
              sucursalSeleccionada={sucursalVenta}
              onSelectSucursal={handleCambiarSucursal}
              disabled={false}
            />
          ) : (
            sucursalVenta && (
              <Chip
                icon={<StoreIcon sx={{ fontSize: 16 }} />}
                label={sucursalVenta.nombre}
                sx={{
                  bgcolor: "#dc2626",
                  color: "white",
                  fontWeight: 500,
                  height: 32,
                  "& .MuiChip-icon": {
                    color: "white",
                  },
                }}
              />
            )
          )}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: 2,
            flex: 1,
            overflow: "hidden",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              bgcolor: "white",
            }}
          >
            <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
              <ProductoSelector
                productos={productos}
                loading={loadingProductos}
                onSelectProducto={handleSelectProducto}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                sucursalVenta={sucursalVenta}
                usuarioTieneMultiplesSucursales={user.sucursales.length > 1}
                searchInputRef={searchInputRef}
              />
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              bgcolor: "white",
            }}
          >
            <CarritoVentas
              items={carrito}
              subtotal={calcularSubtotal()}
              descuento={descuento}
              onEditDescuento={() => setShowDescuentoModal(true)}
              interes={interes}
              onEditInteres={() => setShowInteresModal(true)}
              total={calcularTotal()}
              onRemoveItem={handleEliminarProducto}
              onProcesarVenta={handleProcesarVenta}
              onEditItem={handleAbrirCantidadModal}
              loading={loading}
            />
          </Paper>
        </Box>

        <CantidadModal
          open={showCantidadModal}
          onClose={() => {
            setShowCantidadModal(false)
            setProductoSeleccionado(null)
            setEditandoItem(false)
            setTimeout(() => {
              if (searchInputRef.current) {
                searchInputRef.current.focus()
              }
            }, 100)
          }}
          producto={productoSeleccionado}
          onConfirm={handleConfirmarCantidad}
          isEditing={editandoItem}
        />

        <DescuentoModal
          open={showDescuentoModal}
          onClose={() => setShowDescuentoModal(false)}
          subtotal={calcularSubtotal()}
          onConfirm={handleConfirmarDescuento}
        />

        <InteresModal
          open={showInteresModal}
          onClose={() => setShowInteresModal(false)}
          subtotal={calcularSubtotal()}
          onConfirm={handleConfirmarInteres}
        />

        <PagoModal
          open={showPagoModal}
          onClose={() => setShowPagoModal(false)}
          subtotal={calcularSubtotal()}
          descuento={descuento}
          interes={interes}
          total={calcularTotal()}
          onConfirm={handleConfirmarVenta}
          sucursalVenta={sucursalVenta}
        />

        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{
              width: "100%",
              borderRadius: 2,
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </PermissionGuard>
  )
}
