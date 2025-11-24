"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import Layout from "./components/Layout/Layout"
import LoginPage from "./pages/Auth/LoginPage"
import DashboardPage from "./pages/Dashboard/DashboardPage"
import ClientesPage from "./pages/Clientes/ClientesPage"
import VehiculosPage from "./pages/Vehiculos/VehiculosPage"
import ProtectedRoute from "./components/Auth/ProtectedRoute"
import GestionUsuariosPage from "./pages/Configuracion/GestionUsuariosPage"
import GestionEmpleadosPage from "./pages/Configuracion/GestionEmpleadosPage"
import GestionSucursalesPage from "./pages/Configuracion/GestionSucursalesPage"
import GestionCategoriasPage from "./pages/Configuracion/GestionCategoriasPage"
import ServiciosPage from "./pages/Servicios/ServiciosPage"
import StockPage from "./pages/Stock/StockPage"
import ConfiguracionPage from "./pages/Configuracion/ConfiguracionPage"
import TiposServiciosPage from "./pages/Configuracion/TiposServiciosPage"
import ReportesPage from "./pages/Reportes/ReportesPage"
import VentasPage from "./pages/Ventas/VentasPage"
import ReportesVentasPage from "./pages/Reportes/ReportesVentasPage"
import CajaPage from "./pages/Caja/CajaPage"
import HistorialCajaPage from "./pages/Caja/HistorialCajaPage"
import LoadingSpinner from "./components/Common/LoadingSpinner"
import ToastContainer from "./components/Common/ToastContainer"
import GestionTarjetasPage from "./pages/Configuracion/GestionTarjetasPage"

function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando aplicación..." />
      </div>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="vehiculos" element={<VehiculosPage />} />
          <Route path="servicios" element={<ServiciosPage />} />
          <Route path="stock" element={<StockPage />} />
          <Route path="ventas" element={<VentasPage />} />
          <Route path="caja" element={<CajaPage />} />
          <Route path="caja/historial" element={<HistorialCajaPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="reportes/ventas" element={<ReportesVentasPage />} />
          {/* Configuración */}
          <Route path="configuracion" element={<ConfiguracionPage />} />
          <Route path="configuracion/tipos-servicios" element={<TiposServiciosPage />} />
          <Route path="configuracion/categorias" element={<GestionCategoriasPage />} />
          <Route path="configuracion/empleados" element={<GestionEmpleadosPage />} />
          <Route path="configuracion/sucursales" element={<GestionSucursalesPage />} />
          <Route path="configuracion/tarjetas" element={<GestionTarjetasPage />} />
          <Route
            path="configuracion/usuarios"
            element={
              <ProtectedRoute requiredRole="admin">
                <GestionUsuariosPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <ToastContainer />
    </>
  )
}

export default App
