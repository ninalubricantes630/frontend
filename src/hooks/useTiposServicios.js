"use client"

import { useState, useEffect, useCallback } from "react"
import tiposServiciosService from "../services/tiposServiciosService"
import { useToast } from "./useToast"
import { useErrorHandler } from "./useErrorHandler"

export const useTiposServicios = () => {
  const [tiposServicios, setTiposServicios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 50,
  })

  const { showToast } = useToast()
  const { handleError } = useErrorHandler()

  const loadTiposServicios = useCallback(
    async (page = 1, limit = null) => {
      const actualLimit = limit || pagination.limit
      setLoading(true)
      setError(null)

      try {
        const response = await tiposServiciosService.getTiposServicios({
          page,
          limit: actualLimit,
        })


        setTiposServicios(response.data?.tiposServicios || [])
        setPagination({
          page: response.data?.pagination?.page || page,
          totalPages: response.data?.pagination?.totalPages || 1,
          total: response.data?.pagination?.total || 0,
          limit: response.data?.pagination?.limit || actualLimit,
        })
      } catch (err) {
        console.error("[v0] Error al cargar tipos de servicios:", err)
        setError(err?.message ?? "Error al cargar tipos de servicios")
        setTiposServicios([])
      } finally {
        setLoading(false)
      }
    },
    [pagination.limit],
  )

  const handlePageChange = useCallback(
    (page, limit) => {
      loadTiposServicios(page, limit)
    },
    [loadTiposServicios],
  )

  const createTipoServicio = async (tipoServicioData) => {
    setLoading(true)
    setError(null)

    try {
      const newTipoServicio = await tiposServiciosService.createTipoServicio(tipoServicioData)
      await loadTiposServicios(pagination.page, pagination.limit)
      showToast("Tipo de servicio creado exitosamente", "success")
      return newTipoServicio
    } catch (err) {
      setError(err.message)
      handleError(err, "Error al crear tipo de servicio")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateTipoServicio = async (id, tipoServicioData) => {
    setLoading(true)
    setError(null)

    try {
      const updatedTipoServicio = await tiposServiciosService.updateTipoServicio(id, tipoServicioData)
      await loadTiposServicios(pagination.page, pagination.limit)
      showToast("Tipo de servicio actualizado exitosamente", "success")
      return updatedTipoServicio
    } catch (err) {
      setError(err.message)
      handleError(err, "Error al actualizar tipo de servicio")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteTipoServicio = async (id) => {
    setLoading(true)
    setError(null)

    try {
      await tiposServiciosService.deleteTipoServicio(id)
      await loadTiposServicios(pagination.page, pagination.limit)
      showToast("Tipo de servicio eliminado exitosamente", "success")
    } catch (err) {
      setError(err.message)
      handleError(err, "Error al eliminar tipo de servicio")
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTiposServicios()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    tiposServicios,
    loading,
    error,
    pagination,
    loadTiposServicios,
    handlePageChange,
    createTipoServicio,
    updateTipoServicio,
    deleteTipoServicio,
  }
}
