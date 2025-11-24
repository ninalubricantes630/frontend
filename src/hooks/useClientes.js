"use client"

import { useState, useCallback } from "react"
import { clientesService } from "../services/clientesService.js"
import { useStandardizedErrorHandler } from "../utils/StandardizedErrorHandler.js"
import { useToast } from "./useToast"

export const useClientes = () => {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [currentFilters, setCurrentFilters] = useState({
    search: "",
    searchBy: "",
  })

  const { showToast } = useToast()
  const errorHandler = useStandardizedErrorHandler(showToast)

  const loadClientes = useCallback(
    async (page = 1, limit = 10, search = "", searchBy = "") => {
      setLoading(true)
      setError(null)
      setCurrentFilters({ search, searchBy })


      try {
        const response = await clientesService.getClientes({ page, limit, search, searchBy })


        if (!response || !response.data) {
          setClientes([])
          setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 })
          return
        }

        const clientesData = response.data.data || []
        const paginationData = response.data.pagination || {}


        setClientes(clientesData)
        setPagination({
          page: paginationData.currentPage || page,
          limit: paginationData.limit || limit,
          total: paginationData.total || 0,
          totalPages: paginationData.totalPages || 0,
        })
      } catch (err) {
        console.error("[v0] Error in loadClientes:", err)
        const { userMessage } = errorHandler.handleApiError(err, "cargar clientes")
        setError(userMessage)
        setClientes([])
        setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 })
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  const fetchClientes = useCallback(
    async (params = {}) => {
      const { search = "", limit = 10, page = 1, searchBy = "" } = params

      try {
        const result = await clientesService.getClientes({ page, limit, search, searchBy })
        return result
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "buscar clientes")
        throw new Error(userMessage)
      }
    },
    [errorHandler],
  )

  const createCliente = useCallback(
    async (clienteData) => {
      setLoading(true)
      setError(null)
      try {
        const newCliente = await clientesService.createCliente(clienteData)

        errorHandler.handleSuccess("Cliente creado exitosamente", "crear cliente")

        await loadClientes(pagination.page, pagination.limit, currentFilters.search, currentFilters.searchBy)

        return { success: true, data: newCliente }
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "crear cliente")
        setError(userMessage)
        return { success: false, error: userMessage }
      } finally {
        setLoading(false)
      }
    },
    [loadClientes, pagination.page, pagination.limit, currentFilters, errorHandler],
  )

  const updateCliente = useCallback(
    async (id, clienteData) => {
      setLoading(true)
      setError(null)
      try {
        const updatedCliente = await clientesService.updateCliente(id, clienteData)

        errorHandler.handleSuccess("Cliente actualizado exitosamente", "actualizar cliente")

        setClientes((prev) => prev.map((cliente) => (cliente.id === id ? updatedCliente : cliente)))
        return { success: true, data: updatedCliente }
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "actualizar cliente")
        setError(userMessage)
        return { success: false, error: userMessage }
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  const deleteCliente = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)
      try {
        await clientesService.deleteCliente(id)
        errorHandler.handleSuccess("Cliente eliminado exitosamente", "eliminar cliente")

        setClientes((prev) => prev.filter((cliente) => cliente.id !== id))
        return { success: true }
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "eliminar cliente")

        setError(userMessage)
        return { success: false, error: userMessage }
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  const handlePageChange = useCallback(
    (newPage, newLimit) => {
      if (newLimit !== undefined && newLimit !== pagination.limit) {
        // Si cambia el límite, volver a página 1
        loadClientes(1, newLimit, currentFilters.search, currentFilters.searchBy)
      } else {
        // Solo cambió la página
        loadClientes(newPage, pagination.limit, currentFilters.search, currentFilters.searchBy)
      }
    },
    [loadClientes, pagination.limit, currentFilters],
  )

  return {
    clientes,
    loading,
    error,
    pagination,
    loadClientes,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    handlePageChange,
  }
}
