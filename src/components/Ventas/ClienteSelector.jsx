"use client"

import { useState, useEffect, useRef } from "react"
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

export default function ClienteSelector({ open, onClose, onSelect }) {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredClientes, setFilteredClientes] = useState([])
  const [displayedClientes, setDisplayedClientes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const searchInputRef = useRef(null)
  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    if (open) {
      loadClientes()
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }, 100)
    }
  }, [open])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClientes(Array.isArray(clientes) ? clientes : [])
    } else {
      const clientesArray = Array.isArray(clientes) ? clientes : []
      const filtered = clientesArray.filter(
        (cliente) =>
          cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cliente.dni?.includes(searchTerm) ||
          cliente.telefono?.includes(searchTerm),
      )
      setFilteredClientes(filtered)
    }
    setCurrentPage(1)
  }, [searchTerm, clientes])

  useEffect(() => {
    const clientesArray = Array.isArray(filteredClientes) ? filteredClientes : []
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    setDisplayedClientes(clientesArray.slice(startIndex, endIndex))
    setTotalItems(clientesArray.length)
  }, [filteredClientes, currentPage])

  const loadClientes = async () => {
    try {
      setLoading(true)
      const response = await clientesService.getAll(1, 1000)

      let clientesData = []

      if (response.data && Array.isArray(response.data)) {
        clientesData = response.data
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        clientesData = response.data.data
      } else if (response.clientes && Array.isArray(response.clientes)) {
        clientesData = response.clientes
      }


      setClientes(clientesData)
      setFilteredClientes(clientesData)
    } catch (error) {
      console.error("Error al cargar clientes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (cliente) => {
    onSelect(cliente)
    onClose()
    setSearchTerm("")
    setCurrentPage(1)
  }

  const hasMoreResults = totalItems > currentPage * ITEMS_PER_PAGE

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
        ) : displayedClientes.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="textSecondary" sx={{ fontSize: "0.95rem" }}>
              {searchTerm ? "No se encontraron clientes" : "No hay clientes registrados"}
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
              {displayedClientes.map((cliente, index) => (
                <ListItem
                  key={cliente.id}
                  disablePadding
                  sx={{
                    borderBottom: index < displayedClientes.length - 1 ? "1px solid #f3f4f6" : "none",
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
                  Mostrando {displayedClientes.length} de {totalItems} clientes
                </Typography>

                {hasMoreResults && (
                  <Button
                    size="small"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    sx={{
                      color: "#dc2626",
                      fontSize: "0.875rem",
                      "&:hover": { bgcolor: "#fef2f2" },
                    }}
                  >
                    Ver más
                  </Button>
                )}

                {currentPage > 1 && (
                  <Button
                    size="small"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    sx={{
                      color: "#6b7280",
                      fontSize: "0.875rem",
                      "&:hover": { bgcolor: "#f3f4f6" },
                    }}
                  >
                    Ver menos
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
