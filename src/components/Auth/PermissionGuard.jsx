"use client"

import { useAuth } from "../../contexts/AuthContext"

const PermissionGuard = ({ children, requiredPermission, fallback = null }) => {
  const { hasPermissionSlug, user, isAdmin } = useAuth()

  // Para módulos, permitir acceso si tiene AL MENOS UN permiso del módulo
  const hasAccess = () => {
    if (isAdmin()) return true

    if (!requiredPermission) return true

    if (!user?.permisos || user.permisos.length === 0) return false

    // Si el permiso requerido contiene "_", es un permiso específico (ej: stock_ver)
    // Si es solo un módulo (ej: "stock"), verificar si tiene al menos un permiso de ese módulo
    if (requiredPermission.includes("_")) {
      return hasPermissionSlug(requiredPermission)
    } else {
      return user.permisos.some((p) => p.codigo.startsWith(requiredPermission + "_"))
    }
  }

  if (!hasAccess()) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Acceso Restringido</h2>
            <p className="text-gray-600">No tienes permiso para acceder a esta funcionalidad</p>
          </div>
        </div>
      )
    )
  }

  return children
}

export default PermissionGuard
