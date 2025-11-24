"use client"

import { useState, useCallback } from "react"
import tarjetasService from "../services/tarjetasService"

export const useTarjetas = () => {
  const [tarjetas, setTarjetas] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const loadTarjetas = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const response = await tarjetasService.getAll(params)


      setTarjetas(response.data?.tarjetas || [])
      setPagination({
        page: response.data?.pagination?.page || 1,
        limit: response.data?.pagination?.limit || 10,
        total: response.data?.pagination?.total || 0,
        totalPages: response.data?.pagination?.totalPages || 0,
      })
    } catch (error) {
      console.error("[v0] Error al cargar tarjetas:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePageChange = useCallback(
    (page, limit) => {
      loadTarjetas({ page, limit })
    },
    [loadTarjetas],
  )

  const createTarjeta = useCallback(
    async (data) => {
      setLoading(true)
      try {
        await tarjetasService.create(data)
        await loadTarjetas({ page: pagination.page, limit: pagination.limit })
      } catch (error) {
        console.error("[v0] Error al crear tarjeta:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [loadTarjetas, pagination.page, pagination.limit],
  )

  const updateTarjeta = useCallback(
    async (id, data) => {
      setLoading(true)
      try {
        await tarjetasService.update(id, data)
        await loadTarjetas({ page: pagination.page, limit: pagination.limit })
      } catch (error) {
        console.error("[v0] Error al actualizar tarjeta:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [loadTarjetas, pagination.page, pagination.limit],
  )

  const deleteTarjeta = useCallback(
    async (id) => {
      setLoading(true)
      try {
        await tarjetasService.delete(id)
        await loadTarjetas({ page: pagination.page, limit: pagination.limit })
      } catch (error) {
        console.error("[v0] Error al eliminar tarjeta:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [loadTarjetas, pagination.page, pagination.limit],
  )

  return {
    tarjetas,
    loading,
    pagination,
    loadTarjetas,
    handlePageChange,
    createTarjeta,
    updateTarjeta,
    deleteTarjeta,
  }
}
