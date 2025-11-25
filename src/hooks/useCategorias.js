"use client"

import { useState, useCallback, useRef } from "react"
import categoriasService from "../services/categoriasService"
import { useToast } from "./useToast"
import { useErrorHandler } from "./useErrorHandler"

export const useCategorias = () => {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 50,
  })
  const [cachedCategorias, setCachedCategorias] = useState(null)
  const [cacheTimestamp, setCacheTimestamp] = useState(null)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  const { showToast } = useToast()
  const { handleError } = useErrorHandler()

  const activeRequestRef = useRef(null)

  const loadCategorias = useCallback(
    async (page = 1, search = "", limit = null) => {
      const actualLimit = limit || pagination.limit

      if (!search && page === 1) {
        const now = Date.now()
        if (cachedCategorias && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
          setCategorias(cachedCategorias)
          return
        }
      }

      setLoading(true)
      setError(null)

      try {
        if (activeRequestRef.current?.cancel) {
          try {
            activeRequestRef.current.cancel()
          } catch (e) {}
        }

        const params = {
          page,
          limit: actualLimit,
        }

        if (search) {
          params.search = search
        }

        const response = await categoriasService.getCategorias(params)

        // Acceder a la estructura response.data.categorias y response.data.pagination
        const categoriasData = response.data?.categorias || []
        const paginationData = response.data?.pagination || {}

        setCategorias(categoriasData)
        if (!search) {
          setCachedCategorias(categoriasData)
          setCacheTimestamp(Date.now())
        }
        setPagination({
          page: paginationData.page || page,
          totalPages: paginationData.totalPages || 1,
          total: paginationData.total || 0,
          limit: paginationData.limit || actualLimit,
        })
      } catch (err) {
        setError(err?.message ?? "Error al cargar categorías")
        setCategorias([])
        setPagination({
          page: 1,
          totalPages: 1,
          total: 0,
          limit: actualLimit,
        })
      } finally {
        setLoading(false)
      }
    },
    [pagination.limit, cachedCategorias, cacheTimestamp],
  )

  const handlePageChange = useCallback(
    async (newPage, newLimit = null) => {
      const actualLimit = newLimit || pagination.limit
      await loadCategorias(newPage, "", actualLimit)
    },
    [loadCategorias, pagination.limit],
  )

  const createCategoria = useCallback(
    async (categoriaData) => {
      setLoading(true)
      setError(null)
      try {
        const newCategoria = await categoriasService.createCategoria(categoriaData)
        await loadCategorias(pagination.page || 1, "", pagination.limit)
        showToast("Categoría creada exitosamente", "success")
        return newCategoria
      } catch (err) {
        setError(err.message)
        handleError(err, "Error al crear categoría")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [loadCategorias, pagination.page, pagination.limit, showToast, handleError],
  )

  const updateCategoria = useCallback(
    async (id, categoriaData) => {
      setLoading(true)
      setError(null)
      try {
        const updatedCategoria = await categoriasService.updateCategoria(id, categoriaData)
        await loadCategorias(pagination.page || 1, "", pagination.limit)
        showToast("Categoría actualizada exitosamente", "success")
        return updatedCategoria
      } catch (err) {
        setError(err.message)
        handleError(err, "Error al actualizar categoría")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [loadCategorias, pagination.page, pagination.limit, showToast, handleError],
  )

  const deleteCategoria = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)
      try {
        await categoriasService.deleteCategoria(id)
        await loadCategorias(pagination.page || 1, "", pagination.limit)
        showToast("Categoría eliminada exitosamente", "success")
      } catch (err) {
        setError(err.message)
        handleError(err, "Error al eliminar categoría")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [loadCategorias, pagination.page, pagination.limit, showToast, handleError],
  )

  const searchCategorias = useCallback(async (query) => {
    setLoading(true)
    setError(null)
    try {
      const response = await categoriasService.searchCategorias(query)
      // Manejar la respuesta de búsqueda
      const data = response?.data || []
      return Array.isArray(data) ? data : []
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || "Error al buscar categorías"
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    categorias,
    loading,
    error,
    pagination,
    loadCategorias,
    handlePageChange,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    searchCategorias,
  }
}
