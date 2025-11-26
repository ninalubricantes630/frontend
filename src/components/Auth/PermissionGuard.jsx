"use client"

import { useAuth } from "../../contexts/AuthContext"

const PermissionGuard = ({ children, requiredPermission, fallback = null }) => {
  const { hasPermissionSlug } = useAuth()

  if (!hasPermissionSlug(requiredPermission)) {
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
