"use client"

import { useState, useCallback } from "react"
import { vehiculosService } from "../services/vehiculosService"
import { useStandardizedErrorHandler } from "../utils/StandardizedErrorHandler"
import { useToast } from "./useToast"

export const useVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
  })
  const [currentFilters, setCurrentFilters] = useState({
    search: "",
    searchCriteria: "patente",
  })

  const { showToast } = useToast()
  const errorHandler = useStandardizedErrorHandler(showToast)

  const loadVehiculos = useCallback(
    async (params = {}) => {
      const { page = 1, limit = 10, search = "", searchCriteria = "patente" } = params

      setLoading(true)
      setError(null)
      setCurrentFilters({ search, searchCriteria })

      try {
        const response = await vehiculosService.getAll({ page, limit, search, searchCriteria })

        if (!response?.data) {
          setVehiculos([])
          setPagination({ total: 0, totalPages: 0, page: 1, limit: 10 })
          return
        }

        const vehiculosData = response.data.vehiculos || []
        const paginationData = response.data.pagination || {}


        setVehiculos(vehiculosData)
        setPagination({
          total: paginationData.total || 0,
          totalPages: paginationData.totalPages || 1,
          page: paginationData.page || page,
          limit: paginationData.limit || limit,
        })
      } catch (err) {
        console.error("Error al cargar vehículos:", err)
        const { userMessage } = errorHandler.handleApiError(err, "cargar vehículos")
        setError(userMessage)
        setVehiculos([])
        setPagination({ total: 0, totalPages: 0, page: 1, limit: 10 })
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  const loadVehiculosByCliente = useCallback(
    async (clienteId) => {
      setLoading(true)
      setError(null)
      try {
        const response = await vehiculosService.getByCliente(clienteId)

        if (!response) {
          setVehiculos([])
          return
        }

        const vehiculosData = response.data || response || []
        setVehiculos(vehiculosData)

        // Reset pagination for client-specific view
        setPagination({
          total: vehiculosData.length,
          totalPages: 1,
          page: 1,
          limit: vehiculosData.length,
        })
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "cargar vehículos del cliente")
        setError(userMessage)
        setVehiculos([])
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  const createVehiculo = useCallback(
    async (vehiculoData) => {
      setLoading(true)
      setError(null)
      try {
        const newVehiculo = await vehiculosService.create(vehiculoData)

        errorHandler.handleSuccess("Vehículo creado exitosamente", "crear vehículo")

        await loadVehiculos({
          page: pagination.page,
          limit: pagination.limit,
          search: currentFilters.search,
          searchCriteria: currentFilters.searchCriteria,
        })

        return { success: true, data: newVehiculo }
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "crear vehículo")
        setError(userMessage)
        return { success: false, error: userMessage }
      } finally {
        setLoading(false)
      }
    },
    [loadVehiculos, pagination.page, pagination.limit, currentFilters, errorHandler],
  )

  const updateVehiculo = useCallback(
    async (id, vehiculoData) => {
      setLoading(true)
      setError(null)
      try {
        const updatedVehiculo = await vehiculosService.update(id, vehiculoData)

        errorHandler.handleSuccess("Vehículo actualizado exitosamente", "actualizar vehículo")

        setVehiculos((prev) => prev.map((vehiculo) => (vehiculo.id === id ? updatedVehiculo : vehiculo)))
        return { success: true, data: updatedVehiculo }
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "actualizar vehículo")
        setError(userMessage)
        return { success: false, error: userMessage }
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  const deleteVehiculo = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)
      try {
        await vehiculosService.delete(id)

        errorHandler.handleSuccess("Vehículo eliminado exitosamente", "eliminar vehículo")

        setVehiculos((prev) => prev.filter((vehiculo) => vehiculo.id !== id))
        return { success: true }
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "eliminar vehículo")
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
      const limit = newLimit !== undefined ? newLimit : pagination.limit
      const page = newLimit !== undefined ? 1 : newPage


      loadVehiculos({
        page,
        limit,
        search: currentFilters.search,
        searchCriteria: currentFilters.searchCriteria,
      })
    },
    [loadVehiculos, pagination.limit, currentFilters],
  )

  const fetchVehiculos = useCallback(
    async (params = {}) => {
      try {
        const result = await vehiculosService.getAll(params)
        return result
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "buscar vehículos")
        throw new Error(userMessage)
      }
    },
    [errorHandler],
  )

  return {
    vehiculos,
    loading,
    error,
    pagination,
    loadVehiculos,
    loadVehiculosByCliente,
    fetchVehiculos,
    createVehiculo,
    updateVehiculo,
    deleteVehiculo,
    handlePageChange, // Exportando handler unificado
  }
}

export const useVehiculoStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    porMarca: {},
  })

  return { stats }
}
