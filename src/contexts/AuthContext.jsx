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
        const token = secureStorage.getToken()
        if (token) {
          const user = await authService.getCurrentUser()
          dispatch({ type: "LOGIN_SUCCESS", payload: user })
        } else {
          dispatch({ type: "SET_LOADING", payload: false })
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        secureStorage.clearAll()
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      dispatch({ type: "LOGIN_START" })

      const response = await authService.login(credentials)

      let userData = response.user
      if (!userData.sucursales || userData.sucursales.length === 0) {
        try {
          userData = await authService.getCurrentUser()
        } catch (error) {
          // Silent fail - user data will load on next request
        }
      }

      dispatch({ type: "LOGIN_SUCCESS", payload: userData })
      return response
    } catch (error) {
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
