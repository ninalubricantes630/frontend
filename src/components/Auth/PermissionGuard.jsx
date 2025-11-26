"use client"

import { useAuth } from "../../contexts/AuthContext"

const PermissionGuard = ({ children, requiredPermission, fallback = null }) => {
  const { hasPermissionSlug, user, isAdmin } = useAuth()

  const hasAccess = () => {
    console.log("[v0] PermissionGuard.hasAccess - iniciando validación")
    console.log("[v0] PermissionGuard.hasAccess - requiredPermission:", requiredPermission)
    console.log("[v0] PermissionGuard.hasAccess - user:", user)
    console.log("[v0] PermissionGuard.hasAccess - isAdmin():", isAdmin())

    if (isAdmin()) {
      console.log("[v0] PermissionGuard.hasAccess - usuario es admin, permitiendo acceso")
      return true
    }

    if (!requiredPermission) {
      console.log("[v0] PermissionGuard.hasAccess - no hay permiso requerido, permitiendo acceso")
      return true
    }

    if (!user?.permisos || user.permisos.length === 0) {
      console.log("[v0] PermissionGuard.hasAccess - usuario sin permisos")
      return false
    }

    console.log("[v0] PermissionGuard.hasAccess - permisos del usuario:", user.permisos)

    // Si el permiso requerido contiene "_", es un permiso específico (ej: view_stock)
    // Si es solo un módulo (ej: "stock"), verificar si tiene al menos un permiso de ese módulo
    if (requiredPermission.includes("_")) {
      console.log("[v0] PermissionGuard.hasAccess - verificando permiso específico:", requiredPermission)
      const result = user.permisos.some((p) => p.codigo === requiredPermission)
      console.log("[v0] PermissionGuard.hasAccess - resultado permiso específico:", result)
      return result
    } else {
      console.log("[v0] PermissionGuard.hasAccess - verificando módulo:", requiredPermission)
      const result = user.permisos.some((p) => p.modulo === requiredPermission)
      console.log("[v0] PermissionGuard.hasAccess - resultado módulo:", result)
      console.log(
        "[v0] PermissionGuard.hasAccess - módulos disponibles:",
        user.permisos.map((p) => p.modulo),
      )
      return result
    }
  }

  const hasAccessResult = hasAccess()
  console.log("[v0] PermissionGuard - hasAccess resultado final:", hasAccessResult)

  if (!hasAccessResult) {
    console.log("[v0] PermissionGuard - mostrando fallback (acceso denegado)")
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

  console.log("[v0] PermissionGuard - permitiendo acceso")
  return children
}

export default PermissionGuard
