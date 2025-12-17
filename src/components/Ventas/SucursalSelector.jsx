"use client"
import { FormControl, InputLabel, Select, MenuItem, Box, Typography, ListItemIcon, ListItemText } from "@mui/material"
import { Store as StoreIcon, CheckCircle as CheckCircleIcon } from "@mui/icons-material"

const SucursalSelector = ({ sucursales, sucursalSeleccionada, onSelectSucursal, disabled = false }) => {
  const handleChange = (event) => {
    const sucursalId = event.target.value
    const sucursal = sucursales.find((s) => s.id === sucursalId)
    if (sucursal) {
      onSelectSucursal(sucursal)
    }
  }

  if (!sucursales || sucursales.length <= 1) {
    return null
  }

  return (
    <Box sx={{ minWidth: 250, maxWidth: 350 }}>
      <FormControl fullWidth size="small" disabled={disabled}>
        <InputLabel
          id="sucursal-selector-label"
          sx={{
            color: "#dc2626",
            "&.Mui-focused": {
              color: "#dc2626",
            },
          }}
        >
          Sucursal para esta venta
        </InputLabel>
        <Select
          labelId="sucursal-selector-label"
          id="sucursal-selector"
          value={sucursalSeleccionada?.id || ""}
          label="Sucursal para esta venta"
          onChange={handleChange}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#e5e7eb",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#dc2626",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#dc2626",
            },
          }}
          renderValue={(selected) => {
            const sucursal = sucursales.find((s) => s.id === selected)
            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <StoreIcon sx={{ fontSize: 18, color: "#dc2626" }} />
                <Typography variant="body2" fontWeight={500}>
                  {sucursal?.nombre}
                </Typography>
                {sucursal?.es_principal && (
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: "#fef2f2",
                      color: "#dc2626",
                      px: 1,
                      py: 0.3,
                      borderRadius: 0.5,
                      fontSize: "0.7rem",
                      fontWeight: 600,
                    }}
                  >
                    Principal
                  </Typography>
                )}
              </Box>
            )
          }}
        >
          {sucursales.map((sucursal) => (
            <MenuItem key={sucursal.id} value={sucursal.id}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: "auto" }}>
                    <StoreIcon sx={{ fontSize: 20, color: "#6b7280" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" fontWeight={sucursal.es_principal ? 600 : 400}>
                          {sucursal.nombre}
                        </Typography>
                        {sucursal.es_principal && (
                          <Typography
                            variant="caption"
                            sx={{
                              bgcolor: "#fef2f2",
                              color: "#dc2626",
                              px: 0.8,
                              py: 0.2,
                              borderRadius: 0.5,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                            }}
                          >
                            Principal
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </Box>
                {sucursalSeleccionada?.id === sucursal.id && (
                  <CheckCircleIcon sx={{ fontSize: 18, color: "#16a34a", ml: 1 }} />
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {sucursales.length > 1 && (
        <Typography
          variant="caption"
          sx={{
            color: "#6b7280",
            display: "block",
            mt: 0.5,
            fontSize: "0.7rem",
          }}
        >
          Solo puedes agregar productos de la sucursal seleccionada
        </Typography>
      )}
    </Box>
  )
}

export default SucursalSelector
