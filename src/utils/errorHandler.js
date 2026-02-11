// Utilidades para manejo consistente de errores
import logger from "./logger"

export class AppError extends Error {
  constructor(message, code = "UNKNOWN_ERROR", statusCode = 500) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.statusCode = statusCode
  }
}

export const errorCodes = {
  NETWORK_ERROR: "NETWORK_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  SERVER_ERROR: "SERVER_ERROR",
  DUPLICATE_ERROR: "DUPLICATE_ERROR",
}

export const getErrorMessage = (error) => {
  if (error instanceof AppError) {
    return error.message
  }

  if (error.response) {
    // Error de respuesta HTTP
    const { status, data } = error.response

    switch (status) {
      case 400:
        return data?.error || data?.message || "Datos inválidos"
      case 401:
        return "Credenciales inválidas"
      case 403:
        return "No tienes permisos para realizar esta acción"
      case 404:
        return "Recurso no encontrado"
      case 409:
        return data?.error || data?.message || "El recurso ya existe"
      case 422:
        return data?.error || data?.message || "Error de validación"
      case 500:
        return "Error interno del servidor"
      case 503:
        return data?.message || "El servicio no está disponible temporalmente. Intenta de nuevo en unos segundos."
      default:
        return data?.error || data?.message || "Error desconocido"
    }
  }

  if (error.request) {
    // Error de red
    return "Error de conexión. Verifique su conexión a internet."
  }

  return error.message || "Error desconocido"
}

export const handleApiError = (error, showToast = null) => {
  const message = getErrorMessage(error)

  logger.error("API Error", {
    message,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  })

  if (showToast) {
    showToast({
      title: "Error",
      description: message,
      variant: "destructive",
    })
  }

  return message
}

export const validateFormData = (data, schema) => {
  try {
    schema.validateSync(data, { abortEarly: false })
    return { isValid: true, errors: {} }
  } catch (error) {
    const errors = {}

    if (error.inner) {
      error.inner.forEach((err) => {
        errors[err.path] = err.message
      })
    }

    return { isValid: false, errors }
  }
}

export const createFormValidator = (schema) => {
  return (data) => validateFormData(data, schema)
}
