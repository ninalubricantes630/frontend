"use client"

import { useState, useCallback } from "react"
import movimientosStockService from "../services/movimientosStockService"
import { useToast } from "./useToast"
import { useErrorHandler } from "./useErrorHandler"

export const useMovimientosStock = () => {
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 50,
  })

  const { showToast } = useToast()
  const { handleError } = useErrorHandler()

  const normalizeResult = (result, requestedPage, requestedLimit) => {
    let data = []
    let currentPage = requestedPage ?? 1
    let totalPages = 1
    let total = 0
    const limit = requestedLimit ?? pagination.limit

    if (Array.isArray(result)) {
      data = result
      total = result.length
      totalPages = Math.max(1, Math.ceil(total / limit))
    } else if (result && Array.isArray(result.data)) {
      data = result.data
      currentPage = result.currentPage ?? result.page ?? currentPage
      totalPages = result.totalPages ?? Math.max(1, Math.ceil((result.total ?? data.length) / limit))
      total = result.total ?? result.totalItems ?? data.length
    } else {
      data = []
      total = 0
      totalPages = 1
    }

    return { data, currentPage, totalPages, total, limit }
  }

  const loadMovimientos = useCallback(
    async (productoId = null, page = 1, limit = null) => {
      const actualLimit = limit || pagination.limit
      setLoading(true)
      setError(null)

      try {
        let result
        if (productoId) {
          result = await movimientosStockService.getByProducto(productoId, page, actualLimit)
        } else {
          result = await movimientosStockService.getAll(page, actualLimit)
        }

        const normalized = normalizeResult(result, page, actualLimit)

        setMovimientos(normalized.data)
        setPagination({
          currentPage: normalized.currentPage,
          totalPages: normalized.totalPages,
          total: normalized.total,
          limit: normalized.limit,
        })
      } catch (err) {
        setError(err?.message ?? "Error al cargar movimientos")
        setMovimientos([])
      } finally {
        setLoading(false)
      }
    },
    [pagination.limit],
  )

  const registrarMovimiento = useCallback(
    async (movimientoData) => {
      setLoading(true)
      setError(null)
      try {
        const result = await movimientosStockService.registrar(movimientoData)
        showToast("Movimiento registrado exitosamente", "success")
        return result
      } catch (err) {
        setError(err.message)
        handleError(err, "Error al registrar movimiento")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [showToast, handleError],
  )

  return {
    movimientos,
    loading,
    error,
    pagination,
    loadMovimientos,
    registrarMovimiento,
    setPagination,
  }
}
