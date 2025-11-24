"use client"

import { useState, useCallback } from "react"
import cajaService from "../services/cajaService"
import logger from "../utils/logger"

export const useCaja = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sesionActiva, setSesionActiva] = useState(null)
  const [historial, setHistorial] = useState([])
  const [movimientos, setMovimientos] = useState([]) // Initialize movimientos as empty array to prevent filter errors
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Obtener sesión activa
  const loadSesionActiva = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await cajaService.getSesionActiva()
      setSesionActiva(data)
      return data
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Error al cargar sesión activa"
      setError(errorMsg)
      logger.error("Error al cargar sesión activa", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Abrir caja
  const abrirCaja = useCallback(async (data) => {
    try {
      setLoading(true)
      setError(null)
      const result = await cajaService.abrirCaja(data)
      setSesionActiva(result)
      return true
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Error al abrir caja"
      setError(errorMsg)
      logger.error("Error al abrir caja", err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Cerrar caja
  const cerrarCaja = useCallback(async (sesionId, data) => {
    try {
      setLoading(true)
      setError(null)
      await cajaService.cerrarCaja(sesionId, data)
      setSesionActiva(null)
      return true
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Error al cerrar caja"
      setError(errorMsg)
      logger.error("Error al cerrar caja", err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener historial
  const loadHistorial = useCallback(
    async (params = {}) => {
      try {
        setLoading(true)
        setError(null)
        const data = await cajaService.getHistorial(params)
        setHistorial(data)
        setPagination(data.pagination || pagination)
        return data
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Error al cargar historial"
        setError(errorMsg)
        logger.error("Error al cargar historial", err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [pagination],
  )

  // Obtener movimientos
  const loadMovimientos = useCallback(async (sesionId, params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const data = await cajaService.getMovimientos(sesionId, params)
      setMovimientos(data.movimientos || []) // Extract movimientos array from response object
      return data
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Error al cargar movimientos"
      setError(errorMsg)
      logger.error("Error al cargar movimientos", err)
      setMovimientos([]) // Set empty array on error to prevent filter errors
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Registrar movimiento manual
  const registrarMovimiento = useCallback(async (data) => {
    try {
      setLoading(true)
      setError(null)
      await cajaService.registrarMovimiento(data)
      return true
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Error al registrar movimiento"
      setError(errorMsg)
      logger.error("Error al registrar movimiento", err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    sesionActiva,
    historial,
    movimientos,
    pagination,
    loadSesionActiva,
    abrirCaja,
    cerrarCaja,
    loadHistorial,
    loadMovimientos,
    registrarMovimiento,
  }
}
