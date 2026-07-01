"use client"

import { useAuth } from "../../contexts/AuthContext"

const PermissionGuard = ({ children, requiredPermission, fallback = null }) => {
  const { hasPermissionSlug, user, isAdmin } = useAuth()

  const hasAccess = () => {
    if (isAdmin()) return true
    if (!requiredPermission) return true
    if (!user?.permisos || user.permisos.length === 0) return false

    if (requiredPermission.includes("_")) {
      return user.permisos.some((p) => p.codigo === requiredPermission)
    }
    return user.permisos.some((p) => p.modulo === requiredPermission)
  }

  const permisosNoCargados =
    user && !isAdmin() && user.role === "empleado" && (!user.permisos || user.permisos.length === 0)

  if (permisosNoCargados) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md px-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No se pudieron cargar los permisos</h2>
            <p className="text-gray-600 mb-4">
              El servidor puede estar lento o temporalmente no disponible. Recargá la página o intentá de nuevo en unos
              segundos.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )
    )
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
