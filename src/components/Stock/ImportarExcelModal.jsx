"use client"

import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
} from "@mui/material"
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from "@mui/icons-material"
import { useSucursales } from "../../hooks/useSucursales"

const ImportarExcelModal = ({ open, onClose, onImport }) => {
  const { sucursales, loadSucursales } = useSucursales()
  const [file, setFile] = useState(null)
  const [sucursalId, setSucursalId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [previewCount, setPreviewCount] = useState(0)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      const extension = selectedFile.name.split(".").pop().toLowerCase()
      if (extension === "csv" || extension === "txt") {
        setFile(selectedFile)
        setError(null)
        setResult(null)
        setPreviewCount(0)
      } else {
        setError("Solo se permiten archivos CSV o TXT")
        setFile(null)
        setPreviewCount(0)
      }
    }
  }

  const parseCSV = (text) => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "")

    if (lines.length === 0) {
      throw new Error("Archivo vacío")
    }

    const productos = []
    const startIndex = lines[0].includes("Código") || lines[0].includes("Articulo") ? 1 : 0

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i]
      if (!line) continue

      try {
        const columns = line.split(";").map((col) => col.trim())

        if (columns.length < 5) continue

        const codigo = columns[0] || ""
        const nombre = columns[4] || ""

        if (!nombre) continue

        const stock = Number.parseFloat(columns[6]?.replace(",", ".")) || 0
        const precio = Number.parseFloat(columns[10]?.replace(",", ".")) || 0
        let categoria = (columns[17] || "").trim()
        const fabricante = (columns[18] || "").trim()

        if (!categoria || categoria.toLowerCase() === "general") {
          categoria = ""
        }

        productos.push({
          codigo: codigo || null,
          nombre: nombre,
          stock: Math.max(0, stock),
          precio: Math.max(0, precio),
          categoria_nombre: categoria,
          fabricante: fabricante || null,
        })
      } catch (err) {
        console.warn(`Error parseando línea ${i + 1}:`, err)
      }
    }

    return productos
  }

  const handleImport = async () => {
    if (!file) {
      setError("Debe seleccionar un archivo")
      return
    }

    if (!sucursalId) {
      setError("Debe seleccionar una sucursal")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const text = await file.text()
      const productos = parseCSV(text)

      if (productos.length === 0) {
        setError("No se encontraron productos válidos en el archivo")
        setLoading(false)
        return
      }

      setPreviewCount(productos.length)

      const response = await onImport({
        productos,
        sucursal_id: sucursalId,
      })

      setResult(response)
      setFile(null)
      setSucursalId("")
    } catch (err) {
      console.error("Error al importar:", err)
      setError(err.message || "Error al importar productos")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFile(null)
      setSucursalId("")
      setError(null)
      setResult(null)
      setPreviewCount(0)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#f8fafc",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <UploadIcon sx={{ color: "#dc2626" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Importar Productos desde Excel
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={loading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress sx={{ "& .MuiLinearProgress-bar": { bgcolor: "#dc2626" } }} />
            <Typography variant="body2" sx={{ mt: 1, textAlign: "center", color: "#64748b" }}>
              Procesando {previewCount} productos...
            </Typography>
          </Box>
        )}

        {result && (
          <Alert
            severity={result.productosConError > 0 ? "warning" : "success"}
            icon={result.productosConError > 0 ? <ErrorIcon /> : <CheckIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Importación completada
            </Typography>
            <Typography variant="body2">• Productos creados: {result.productosCreados}</Typography>
            <Typography variant="body2">• Productos actualizados: {result.productosActualizados}</Typography>
            <Typography variant="body2">• Total procesados: {result.totalProcesados}</Typography>
            {result.productosConError > 0 && (
              <>
                <Typography variant="body2" sx={{ color: "#dc2626" }}>
                  • Productos con error: {result.productosConError}
                </Typography>
                {result.errores && result.errores.length > 0 && (
                  <Box
                    sx={{
                      mt: 1,
                      pl: 2,
                      maxHeight: 250,
                      overflowY: "auto",
                      bgcolor: "#fef2f2",
                      borderRadius: 1,
                      p: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#991b1b", display: "block", mb: 0.5 }}>
                      Errores detectados
                      {result.totalErrores > result.errores.length
                        ? ` (mostrando ${result.errores.length} de ${result.totalErrores})`
                        : ""}
                      :
                    </Typography>
                    {result.errores.map((err, idx) => (
                      <Typography key={idx} variant="caption" sx={{ display: "block", color: "#64748b", mb: 0.5 }}>
                        {idx + 1}. {err}
                      </Typography>
                    ))}
                  </Box>
                )}
              </>
            )}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth required>
            <InputLabel>Sucursal</InputLabel>
            <Select
              value={sucursalId}
              onChange={(e) => setSucursalId(e.target.value)}
              label="Sucursal"
              disabled={loading}
              onOpen={() => loadSucursales()}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e5e7eb",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#dc2626",
                },
              }}
            >
              {sucursales
                .filter((s) => s.activo)
                .map((sucursal) => (
                  <MenuItem key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText>Seleccione la sucursal donde se cargarán los productos</FormHelperText>
          </FormControl>
        </Box>

        <Box
          sx={{
            border: "2px dashed #cbd5e1",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            bgcolor: "#f8fafc",
            cursor: "pointer",
            "&:hover": {
              borderColor: "#dc2626",
              bgcolor: "#fef2f2",
            },
          }}
          onClick={() => !loading && document.getElementById("file-input").click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".csv,.txt"
            onChange={handleFileChange}
            style={{ display: "none" }}
            disabled={loading}
          />

          <UploadIcon sx={{ fontSize: 48, color: "#94a3b8", mb: 1 }} />

          <Typography variant="body1" sx={{ fontWeight: 600, color: "#334155", mb: 0.5 }}>
            {file ? file.name : "Seleccionar archivo CSV"}
          </Typography>

          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Click para seleccionar o arrastra el archivo aquí
          </Typography>

          <Typography variant="caption" sx={{ display: "block", mt: 2, color: "#64748b" }}>
            Formatos aceptados: CSV, TXT
          </Typography>
        </Box>

        <Box sx={{ mt: 2, p: 2, bgcolor: "#eff6ff", borderRadius: 1, border: "1px solid #bfdbfe" }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "#1e40af", display: "block", mb: 1 }}>
            Formato del archivo (columnas separadas por ;):
          </Typography>
          <Typography variant="caption" sx={{ display: "block", color: "#3b82f6" }}>
            • Columna A: Código de barras
          </Typography>
          <Typography variant="caption" sx={{ display: "block", color: "#3b82f6" }}>
            • Columna E: Nombre del producto (requerido)
          </Typography>
          <Typography variant="caption" sx={{ display: "block", color: "#3b82f6" }}>
            • Columna G: Stock
          </Typography>
          <Typography variant="caption" sx={{ display: "block", color: "#3b82f6" }}>
            • Columna K: Precio
          </Typography>
          <Typography variant="caption" sx={{ display: "block", color: "#3b82f6" }}>
            • Columna R: Categoría
          </Typography>
          <Typography variant="caption" sx={{ display: "block", color: "#3b82f6" }}>
            • Columna S: Fabricante
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: "#f8fafc", borderTop: "1px solid #e5e7eb" }}>
        <Button onClick={handleClose} disabled={loading} sx={{ color: "#64748b" }}>
          {result ? "Cerrar" : "Cancelar"}
        </Button>
        {!result && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={loading || !file || !sucursalId}
            sx={{
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
              "&:disabled": { bgcolor: "#cbd5e1" },
            }}
          >
            Importar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ImportarExcelModal
