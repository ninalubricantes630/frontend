"use client"

import { useState, useCallback } from "react"
import { productosService } from "../services/productosService"
import { useStandardizedErrorHandler } from "../utils/StandardizedErrorHandler"
import { useToast } from "./useToast"

export const useProductos = () => {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  })

  const { showToast } = useToast()
  const errorHandler = useStandardizedErrorHandler(showToast)

  const loadProductos = useCallback(
    async (page = 1, limit = 10, filters = {}) => {
      setLoading(true)
      setError(null)
      try {

        const params = {
          page,
          limit,
          ...filters,
        }

        const response = await productosService.getAll(params)

        if (!response || !response.data) {
          setProductos([])
          return
        }


        // Acceder a response.data.productos igual que ventas accede a response.data.ventas
        const productosData = response.data.productos || []
        const paginationData = response.data.pagination || {}

      

        setProductos(productosData)
        setPagination({
          total: paginationData.total || 0,
          totalPages: paginationData.totalPages || 1,
          currentPage: paginationData.page || page,
          limit: Number(paginationData.limit || limit),
        })
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "cargar productos")
        setError(userMessage)
        setProductos([])
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  const createProducto = useCallback(
    async (productoData) => {
      setLoading(true)
      setError(null)
      try {
        const newProducto = await productosService.create(productoData)

        errorHandler.handleSuccess("Producto creado exitosamente", "crear producto")

        return { success: true, data: newProducto }
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "crear producto")
        setError(userMessage)
        return { success: false, error: userMessage }
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  const updateProducto = useCallback(
    async (id, productoData) => {
      setLoading(true)
      setError(null)
      try {
        const updatedProducto = await productosService.update(id, productoData)

        errorHandler.handleSuccess("Producto actualizado exitosamente", "actualizar producto")

        return { success: true, data: updatedProducto }
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "actualizar producto")
        setError(userMessage)
        return { success: false, error: userMessage }
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  const deleteProducto = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)
      try {
        await productosService.toggleEstado(id)

        errorHandler.handleSuccess("Producto eliminado exitosamente", "eliminar producto")

        return { success: true }
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "eliminar producto")
        setError(userMessage)
        return { success: false, error: userMessage }
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  const toggleEstado = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)
      try {
        const result = await productosService.toggleEstado(id)

        errorHandler.handleSuccess(
          `Producto ${result.data.activo ? "activado" : "desactivado"} exitosamente`,
          "cambiar estado",
        )

        return { success: true, data: result.data }
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "cambiar estado del producto")
        setError(userMessage)
        return { success: false, error: userMessage }
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  return {
    productos,
    loading,
    error,
    pagination,
    loadProductos,
    createProducto,
    updateProducto,
    deleteProducto,
    toggleEstado,
  }
}

export default useProductos
