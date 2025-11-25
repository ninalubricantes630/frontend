"use client"

import { useState, useEffect, useCallback } from "react"
import sucursalesService from "../services/sucursalesService"

export const useSucursales = () => {
  const [sucursales, setSucursales] = useState([])
  const [sucursalesActivas, setSucursalesActivas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [cachedSucursales, setCachedSucursales] = useState(null)
  const [cacheTimestamp, setCacheTimestamp] = useState(null)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  const loadSucursales = useCallback(
    async (params = {}) => {
      try {
        const now = Date.now()
        if (cachedSucursales && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
          setSucursales(cachedSucursales)
          return
        }

        setLoading(true)
        setError(null)
        const response = await sucursalesService.getAll(params)

        setSucursales(response.data?.sucursales || [])
        setCachedSucursales(response.data?.sucursales || [])
        setCacheTimestamp(now)
        setPagination({
          page: response.data?.pagination?.page || 1,
          limit: response.data?.pagination?.limit || 10,
          total: response.data?.pagination?.total || 0,
          totalPages: response.data?.pagination?.totalPages || 0,
        })
      } catch (error) {
        console.error("[v0] Error loading sucursales:", error)
        setError(error.message || "Error al cargar sucursales")
      } finally {
        setLoading(false)
      }
    },
    [cachedSucursales, cacheTimestamp],
  )

  const loadSucursalesActivas = useCallback(async () => {
    try {
      const response = await sucursalesService.getActivas()
      setSucursalesActivas(response.data || [])
    } catch (error) {
      console.error("Error loading sucursales activas:", error)
    }
  }, [])

  const createSucursal = useCallback(async (sucursalData) => {
    try {
      setError(null)
      const response = await sucursalesService.create(sucursalData)
      return response
    } catch (error) {
      console.error("Error creating sucursal:", error)
      setError(error.message || "Error al crear sucursal")
      throw error
    }
  }, [])

  const updateSucursal = useCallback(async (id, sucursalData) => {
    try {
      setError(null)
      const response = await sucursalesService.update(id, sucursalData)
      return response
    } catch (error) {
      console.error("Error updating sucursal:", error)
      setError(error.message || "Error al actualizar sucursal")
      throw error
    }
  }, [])

  const deleteSucursal = useCallback(async (id) => {
    try {
      setError(null)
      const response = await sucursalesService.delete(id)
      return response
    } catch (error) {
      console.error("Error deleting sucursal:", error)
      setError(error.message || "Error al eliminar sucursal")
      throw error
    }
  }, [])

  const handlePageChange = useCallback(
    (page, limit) => {
      loadSucursales({ page, limit })
    },
    [loadSucursales],
  )

  useEffect(() => {
    loadSucursales()
  }, [])

  return {
    sucursales,
    sucursalesActivas,
    loading,
    error,
    pagination,
    loadSucursales,
    handlePageChange,
    loadSucursalesActivas,
    createSucursal,
    updateSucursal,
    deleteSucursal,
  }
}

export default useSucursales
