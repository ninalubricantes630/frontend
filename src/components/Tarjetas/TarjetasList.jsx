"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Typography,
} from "@mui/material"
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"
import tarjetasService from "../../services/tarjetasService"

export default function TarjetasList({ onEdit, refreshTrigger }) {
  const [tarjetas, setTarjetas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTarjeta, setSelectedTarjeta] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    cargarTarjetas()
  }, [refreshTrigger])

  const cargarTarjetas = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tarjetasService.getAll()
      setTarjetas(data || [])
    } catch (err) {
      setError("Error al cargar las tarjetas")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (tarjeta) => {
    setSelectedTarjeta(tarjeta)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      await tarjetasService.delete(selectedTarjeta.id)
      setDeleteDialogOpen(false)
      setSelectedTarjeta(null)
      await cargarTarjetas()
    } catch (err) {
      setError("Error al eliminar la tarjeta")
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress sx={{ color: "#dc2626" }} />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!tarjetas.length) {
    return (
      <Alert severity="info" sx={{ borderRadius: 1 }}>
        No hay tarjetas configuradas. Crea la primera tarjeta para comenzar.
      </Alert>
    )
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ borderRadius: 1, border: "1px solid #e2e8f0" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a", textAlign: "center" }}>Cuotas</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a", textAlign: "center" }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a", textAlign: "right" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tarjetas.map((tarjeta) => (
              <TableRow
                key={tarjeta.id}
                sx={{
                  "&:hover": { bgcolor: "#f8fafc" },
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: "#1e293b" }}>
                    {tarjeta.nombre}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    {tarjeta.descripcion || "-"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Chip
                    label={`${tarjeta.total_cuotas || tarjeta.cuotas?.length || 0} cuotas`}
                    size="small"
                    sx={{
                      bgcolor: "#dbeafe",
                      color: "#1e40af",
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Chip
                    label={tarjeta.activo ? "Activo" : "Inactivo"}
                    size="small"
                    sx={{
                      bgcolor: tarjeta.activo ? "#dcfce7" : "#fee2e2",
                      color: tarjeta.activo ? "#166534" : "#991b1b",
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  <IconButton size="small" onClick={() => onEdit(tarjeta)} sx={{ color: "#3b82f6" }} title="Editar">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(tarjeta)}
                    sx={{ color: "#dc2626" }}
                    title="Eliminar"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: "#dc2626" }}>Eliminar Tarjeta</DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body2">
            ¿Estás seguro de que deseas eliminar la tarjeta "{selectedTarjeta?.nombre}"? Esta acción no se puede
            deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            sx={{ bgcolor: "#dc2626", "&:hover": { bgcolor: "#b91c1c" } }}
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
