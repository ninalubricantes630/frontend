"use client"

import { useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"

const SessionManager = () => {
  const { logout, isAuthenticated } = useAuth()

  const resetTimer = useCallback(() => {
    // Auto logout después de 2 horas de inactividad
    const inactivityTimer = setTimeout(
      () => {
        logout()
        alert("Su sesión ha expirado por inactividad")
      },
      2 * 60 * 60 * 1000,
    ) // 2 horas
    return inactivityTimer
  }, [logout])

  useEffect(() => {
    let inactivityTimer

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]

    if (isAuthenticated) {
      events.forEach((event) => {
        document.addEventListener(
          event,
          () => {
            inactivityTimer = resetTimer()
          },
          true,
        )
      })
      inactivityTimer = resetTimer()
    }

    return () => {
      clearTimeout(inactivityTimer)
      events.forEach((event) => {
        document.removeEventListener(
          event,
          () => {
            inactivityTimer = resetTimer()
          },
          true,
        )
      })
    }
  }, [isAuthenticated, logout, resetTimer])

  return null
}

export default SessionManager
