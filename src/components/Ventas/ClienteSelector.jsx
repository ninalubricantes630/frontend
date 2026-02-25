"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Button,
} from "@mui/material"
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material"
import { clientesService } from "../../services/clientesService"

const LIMIT = 100
const DEBOUNCE_MS = 300

export default function ClienteSelector({ open, onClose, onSelect }) {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [totalItems, setTotalItems] = useState(0)
  const [apiPage, setApiPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const searchInputRef = useRef(null)
  const debounceRef = useRef(null)
  const justOpenedRef = useRef(false)

  const parseClientesFromResponse = useCallback((response) => {
    if (!response) return []
    if (response.data && Array.isArray(response.data)) return response.data
    if (response.data?.data && Array.isArray(response.data.data)) return response.data.data
    if (response.clientes && Array.isArray(response.clientes)) return response.clientes
    return []
  }, [])

  const loadClientes = useCallback(
    async (search = "", page = 1, append = false) => {
      try {
        setLoading(true)
        const response = await clientesService.getClientes({
          page,
          limit: LIMIT,
          search: search.trim(),
        })
        const clientesData = parseClientesFromResponse(response)
        const pagination = response?.data?.pagination || {}
        const total = pagination.total ?? clientesData.length
        const pages = pagination.totalPages ?? 1

        setTotalItems(total)
        setTotalPages(pages)
        setApiPage(page)
        setClientes((prev) => (append ? [...prev, ...clientesData] : clientesData))
      } catch (error) {
        console.error("Error al cargar clientes:", error)
        if (!append) setClientes([])
      } finally {
        setLoading(false)
      }
    },
    [parseClientesFromResponse],
  )

  useEffect(() => {
    if (open) {
      setSearchTerm("")
      justOpenedRef.current = true
      loadClientes("", 1, false)
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }, 100)
    }
  }, [open, loadClientes])

  useEffect(() => {
    if (!open) return
    if (justOpenedRef.current && searchTerm === "") {
      justOpenedRef.current = false
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      loadClientes(searchTerm, 1, false)
      debounceRef.current = null
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchTerm, open, loadClientes])

  const handleVerMas = () => {
    if (apiPage >= totalPages || loading) return
    loadClientes(searchTerm, apiPage + 1, true)
  }

  const hasMoreResults = totalItems > clientes.length

  const handleSelect = (cliente) => {
    onSelect(cliente)
    onClose()
    setSearchTerm("")
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          pb: 1.5,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box
          sx={{
            width: 4,
            height: 32,
            bgcolor: "#dc2626",
            borderRadius: 1,
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#171717", fontSize: "1.1rem" }}>
            Seleccionar Cliente
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#6b7280",
            "&:hover": { bgcolor: "#f3f4f6" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5 }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            ref={searchInputRef}
            fullWidth
            size="small"
            placeholder="Buscar por nombre, DNI o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "#dc2626", fontSize: 20 }} />,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                "&:hover fieldset": { borderColor: "#dc2626" },
                "&.Mui-focused fieldset": { borderColor: "#dc2626" },
              },
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} sx={{ color: "#dc2626" }} />
          </Box>
        ) : clientes.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="textSecondary" sx={{ fontSize: "0.95rem" }}>
              {searchTerm ? "No se encontraron clientes con ese criterio" : "No hay clientes registrados"}
            </Typography>
          </Box>
        ) : (
          <>
            <List
              sx={{
                maxHeight: 300,
                overflow: "auto",
                border: "1px solid #e5e7eb",
                borderRadius: 1.5,
                p: 0,
              }}
            >
              {clientes.map((cliente, index) => (
                <ListItem
                  key={`${cliente.id}-${index}`}
                  disablePadding
                  sx={{
                    borderBottom: index < clientes.length - 1 ? "1px solid #f3f4f6" : "none",
                  }}
                >
                  <ListItemButton
                    onClick={() => handleSelect(cliente)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      "&:hover": { bgcolor: "#fef2f2" },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 500, color: "#171717", fontSize: "0.95rem" }}>
                          {`${cliente.nombre} ${cliente.apellido}`}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ fontSize: "0.875rem", color: "#6b7280" }}>
                          {cliente.dni && `DNI: ${cliente.dni}`}
                          {cliente.telefono && ` • Tel: ${cliente.telefono}`}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {totalItems > 0 && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.85rem" }}>
                  Mostrando {clientes.length} de {totalItems} clientes
                </Typography>

                {hasMoreResults && (
                  <Button
                    size="small"
                    onClick={handleVerMas}
                    disabled={loading}
                    sx={{
                      color: "#dc2626",
                      fontSize: "0.875rem",
                      "&:hover": { bgcolor: "#fef2f2" },
                    }}
                  >
                    {loading ? "Cargando..." : "Ver más"}
                  </Button>
                )}
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
