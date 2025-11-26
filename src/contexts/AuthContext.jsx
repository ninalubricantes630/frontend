"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { authService } from "../services/authService"
import secureStorage from "../utils/secureStorage"

const AuthContext = createContext()

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        loading: true,
        error: null,
      }
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      }
    case "LOGIN_ERROR":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      }
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      }
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      }
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[v0] AuthProvider.checkAuth - iniciando")
        const token = secureStorage.getToken()
        console.log("[v0] AuthProvider.checkAuth - token encontrado:", !!token)

        if (token) {
          const user = await authService.getCurrentUser()
          console.log("[v0] AuthProvider.checkAuth - usuario cargado:", user)
          console.log("[v0] AuthProvider.checkAuth - permisos cargados:", user?.permisos)
          dispatch({ type: "LOGIN_SUCCESS", payload: user })
        } else {
          console.log("[v0] AuthProvider.checkAuth - sin token, no autenticado")
          dispatch({ type: "SET_LOADING", payload: false })
        }
      } catch (error) {
        console.error("[v0] AuthProvider.checkAuth - error:", error)
        secureStorage.clearAll()
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      dispatch({ type: "LOGIN_START" })
      console.log("[v0] AuthContext.login - iniciando login")

      const response = await authService.login(credentials)
      console.log("[v0] AuthContext.login - response de login:", response)

      let userData = response

      console.log("[v0] AuthContext.login - userData completo:", userData)
      console.log("[v0] AuthContext.login - userData.userId:", userData.userId)
      console.log("[v0] AuthContext.login - userData.role:", userData.role)
      console.log("[v0] AuthContext.login - userData.permisos:", userData.permisos)
      console.log("[v0] AuthContext.login - userData.permisos length:", userData.permisos?.length)

      if (!userData.sucursales || userData.sucursales.length === 0) {
        console.log("[v0] AuthContext.login - sin sucursales, obteniendo nuevamente")
        try {
          userData = await authService.getCurrentUser()
          console.log("[v0] AuthContext.login - userData después de getCurrentUser:", userData)
        } catch (error) {
          console.error("[v0] AuthContext.login - error en getCurrentUser:", error)
          // Silent fail - user data will load on next request
        }
      }

      console.log("[v0] AuthContext.login - dispatching LOGIN_SUCCESS con:", userData)
      dispatch({ type: "LOGIN_SUCCESS", payload: userData })
      return response
    } catch (error) {
      console.error("[v0] AuthContext.login - error capturado:", error)
      const errorMessage = error.message || "Error de conexión"
      dispatch({ type: "LOGIN_ERROR", payload: errorMessage })
      throw error
    }
  }

  const changePassword = async (passwordData) => {
    try {
      const response = await authService.changePassword(passwordData)
      return response
    } catch (error) {
      throw error
    }
  }

  const hasPermission = (requiredRole) => {
    if (!state.user) return false
    if (state.user.role === "admin") return true
    return state.user.role === requiredRole
  }

  const hasPermissionSlug = (permissionCode) => {
    console.log("[v0] AuthContext.hasPermissionSlug - verificando permiso:", permissionCode)
    console.log("[v0] AuthContext.hasPermissionSlug - user:", state.user)
    console.log("[v0] AuthContext.hasPermissionSlug - user.role:", state.user?.role)

    if (!state.user) {
      console.log("[v0] AuthContext.hasPermissionSlug - sin usuario")
      return false
    }

    if (state.user.role === "admin") {
      console.log("[v0] AuthContext.hasPermissionSlug - usuario es admin")
      return true
    }

    console.log("[v0] AuthContext.hasPermissionSlug - permisos del usuario:", state.user.permisos)
    console.log("[v0] AuthContext.hasPermissionSlug - es array:", Array.isArray(state.user.permisos))

    if (state.user.permisos && Array.isArray(state.user.permisos)) {
      const hasIt = state.user.permisos.some((p) => p.codigo === permissionCode)
      console.log("[v0] AuthContext.hasPermissionSlug - resultado:", hasIt)
      return hasIt
    }

    console.log("[v0] AuthContext.hasPermissionSlug - permisos no es array")
    return false
  }

  const isAdmin = () => {
    return state.user?.role === "admin"
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error("Error en logout:", error)
    } finally {
      secureStorage.clearAll()
      dispatch({ type: "LOGOUT" })
    }
  }

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" })
  }

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData })
  }

  const value = {
    ...state,
    login,
    logout,
    changePassword,
    hasPermission,
    hasPermissionSlug,
    isAdmin,
    clearError,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider")
  }
  return context
}
