// Standardized error handling utilities
import logger from "./logger"
import { getErrorMessage } from "./errorHandler"

export class StandardizedErrorHandler {
  constructor(showToast = null) {
    this.showToast = showToast
  }

  // Standard API error handling
  handleApiError(error, operation = "operación", showUserFeedback = true) {
    const message = getErrorMessage(error)
    const userMessage = this.getUserFriendlyMessage(error, operation)

    // Log the error
    logger.error(`Error en ${operation}`, {
      message,
      status: error.response?.status,
      data: error.response?.data,
      timestamp: new Date().toISOString(),
    })

    // Show user feedback
    if (showUserFeedback && this.showToast) {
      this.showToast({
        title: "Error",
        description: userMessage,
        variant: "destructive",
      })
    }

    return { message, userMessage }
  }

  // Get user-friendly error messages
  getUserFriendlyMessage(error, operation = "operación") {
    const status = error.response?.status
    const errorData = error.response?.data?.error

    if (
      errorData?.validationErrors &&
      Array.isArray(errorData.validationErrors) &&
      errorData.validationErrors.length > 0
    ) {
      return errorData.validationErrors[0]
    }

    const serverMessage = errorData?.message || error.response?.data?.message

    switch (status) {
      case 400:
        return serverMessage || `Datos inválidos para ${operation}`
      case 401:
        return "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
      case 403:
        return `No tienes permisos para realizar esta ${operation}`
      case 404:
        return `El recurso solicitado no fue encontrado`
      case 409:
        return serverMessage || `Ya existe un registro con estos datos`
      case 422:
        return serverMessage || `Error de validación en los datos`
      case 429:
        return "Demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo."
      case 500:
        return "Error interno del servidor. Nuestro equipo ha sido notificado."
      case 503:
        return serverMessage || "El servicio no está disponible temporalmente. Por favor, intenta de nuevo en unos segundos."
      default:
        if (error.code === "NETWORK_ERROR" || !error.response) {
          return "Error de conexión. Verifica tu conexión a internet."
        }
        return serverMessage || `Error inesperado en ${operation}`
    }
  }

  // Standard success handling
  handleSuccess(message, operation = "operación") {
    logger.info(`Éxito en ${operation}`, { message, timestamp: new Date().toISOString() })

    if (this.showToast) {
      this.showToast({
        title: "Éxito",
        description: message,
        variant: "success",
      })
    }
  }

  // Validation error handling
  handleValidationErrors(errors) {
    const errorMessages = Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(", ")

    logger.warn("Errores de validación", { errors, timestamp: new Date().toISOString() })

    if (this.showToast) {
      this.showToast({
        title: "Error de validación",
        description: `Por favor, corrige los siguientes errores: ${errorMessages}`,
        variant: "destructive",
      })
    }

    return errorMessages
  }
}

// Factory function to create standardized error handlers
export const createErrorHandler = (showToast = null) => {
  return new StandardizedErrorHandler(showToast)
}

// Hook for using standardized error handling
export const useStandardizedErrorHandler = (showToast = null) => {
  return new StandardizedErrorHandler(showToast)
}
