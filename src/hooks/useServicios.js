"use client"

import { useState, useCallback, useRef } from "react"
import serviciosService from "../services/serviciosService.js"
import { useStandardizedErrorHandler } from "../utils/StandardizedErrorHandler"
import { useToast } from "./useToast"

export const useServicios = () => {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  })

  const { showToast } = useToast()
  const errorHandler = useStandardizedErrorHandler(showToast)

  const activeRequestRef = useRef(null)

  const loadServicios = useCallback(
    async (page = 1, search = "", limit = null, additionalParams = {}) => {
      const actualLimit = limit || pagination.limit
      setLoading(true)
      setError(null)

      try {
        if (activeRequestRef.current?.cancel) {
          activeRequestRef.current.cancel()
        }

        const params = {
          page,
          limit: actualLimit,
          ...additionalParams,
        }

        if (search) {
          params.search = search
        }

        const response = await serviciosService.getServicios(params)

        const serviciosData = response.data?.servicios || []
        const paginationData = response.data?.pagination || {}

        setServicios(serviciosData)
        setPagination({
          page: paginationData.page || page,
          totalPages: paginationData.totalPages || 1,
          total: paginationData.total || 0,
          limit: paginationData.limit || actualLimit,
        })
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "cargar servicios")
        setError(userMessage)
        setServicios([])
      } finally {
        setLoading(false)
      }
    },
    [pagination.limit, errorHandler],
  )

  const handlePageChange = useCallback(
    async (page, newLimit = null) => {
      await loadServicios(page, "", newLimit || pagination.limit)
    },
    [loadServicios, pagination.limit],
  )

  const createServicio = async (servicioData) => {
    setLoading(true)
    setError(null)

    try {
      const newServicio = await serviciosService.createServicio(servicioData)
      errorHandler.handleSuccess("Servicio creado exitosamente", "crear servicio")
      await loadServicios(pagination.page || 1, "", pagination.limit)
      return newServicio
    } catch (err) {
      const { userMessage } = errorHandler.handleApiError(err, "crear servicio")
      setError(userMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateServicio = async (id, servicioData) => {
    setLoading(true)
    setError(null)

    try {
      const updatedServicio = await serviciosService.updateServicio(id, servicioData)
      errorHandler.handleSuccess("Servicio actualizado exitosamente", "actualizar servicio")
      await loadServicios(pagination.page || 1, "", pagination.limit)
      return updatedServicio
    } catch (err) {
      const { userMessage } = errorHandler.handleApiError(err, "actualizar servicio")
      setError(userMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteServicio = async (id) => {
    setLoading(true)
    setError(null)

    try {
      await serviciosService.deleteServicio(id)
      errorHandler.handleSuccess("Servicio eliminado exitosamente", "eliminar servicio")
      await loadServicios(pagination.page || 1, "", pagination.limit)
    } catch (err) {
      const { userMessage } = errorHandler.handleApiError(err, "eliminar servicio")
      setError(userMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const searchServicios = async (searchTerm) => {
    if (!searchTerm.trim()) {
      await loadServicios(1, "")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const results = await serviciosService.searchServicios(searchTerm)
      const data = Array.isArray(results) ? results : (results?.data ?? results?.items ?? [])
      setServicios(data)
      setPagination((prev) => ({ ...prev, page: 1, totalPages: 1, total: data.length }))
    } catch (err) {
      const { userMessage } = errorHandler.handleApiError(err, "buscar servicios")
      setError(userMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    servicios,
    loading,
    error,
    pagination,
    loadServicios,
    handlePageChange,
    createServicio,
    updateServicio,
    deleteServicio,
    searchServicios,
  }
}
