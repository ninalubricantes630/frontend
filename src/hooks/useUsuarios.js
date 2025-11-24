"use client"

import { useState, useCallback, useEffect } from "react"
import usuariosService from "../services/usuariosService"

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const loadUsuarios = useCallback(
    async (params = {}) => {
      try {
        setLoading(true)
        setError(null)

        const fullParams = {
          page: pagination.page,
          limit: pagination.limit,
          ...params,
        }

        const response = await usuariosService.getUsuarios(fullParams)


        setUsuarios(response.data?.users || [])
        setPagination({
          page: response.data?.pagination?.page || fullParams.page,
          limit: response.data?.pagination?.limit || fullParams.limit,
          total: response.data?.pagination?.total || 0,
          totalPages: response.data?.pagination?.totalPages || 0,
        })
      } catch (err) {
        setError(err.message || "Error al cargar usuarios")
        console.error("[v0] Error loading usuarios:", err)
      } finally {
        setLoading(false)
      }
    },
    [pagination.page, pagination.limit],
  )

  const handlePageChange = useCallback((page, limit) => {
    setPagination((prev) => ({ ...prev, page, limit }))
  }, [])

  useEffect(() => {
    loadUsuarios()
  }, [pagination.page, pagination.limit])

  const createUsuario = async (userData) => {
    try {
      setLoading(true)
      const response = await usuariosService.createUsuario(userData)
      await loadUsuarios()
      return response
    } catch (err) {
      setError(err.message || "Error al crear usuario")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateUsuario = async (id, userData) => {
    try {
      setLoading(true)
      const response = await usuariosService.updateUsuario(id, userData)
      await loadUsuarios()
      return response
    } catch (err) {
      setError(err.message || "Error al actualizar usuario")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteUsuario = async (id) => {
    try {
      setLoading(true)
      await usuariosService.deleteUsuario(id)
      await loadUsuarios()
    } catch (err) {
      setError(err.message || "Error al eliminar usuario")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    usuarios,
    loading,
    error,
    pagination,
    loadUsuarios,
    handlePageChange,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    clearError,
  }
}
