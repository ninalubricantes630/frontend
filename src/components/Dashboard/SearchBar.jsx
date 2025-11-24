"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  Grid,
} from "@mui/material"
import { Search, Car, User } from "lucide-react"

const SearchBar = ({ onSearch, searchMode, onToggleMode }) => {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      onToggleMode(newMode)
    }
  }

  return (
    <Box sx={{ maxWidth: "900px", mx: "auto" }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          color: "#171717",
          mb: 2,
          textAlign: "center",
        }}
      >
        Buscar por
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
        <ToggleButtonGroup
          value={searchMode}
          exclusive
          onChange={handleModeChange}
          sx={{
            "& .MuiToggleButton-root": {
              borderRadius: 2,
              px: 3,
              py: 0.75,
              border: "1px solid",
              borderColor: "grey.300",
              textTransform: "none",
              fontWeight: "medium",
              fontSize: "0.875rem",
              "&.Mui-selected": {
                backgroundColor: "#dc2626",
                color: "white",
                borderColor: "#dc2626",
                "&:hover": {
                  backgroundColor: "#b91c1c",
                },
              },
              "&:hover": {
                backgroundColor: "grey.50",
              },
            },
          }}
        >
          <ToggleButton value="patente">
            <Car style={{ marginRight: "8px", fontSize: "1rem" }} />
            Por Patente
          </ToggleButton>
          <ToggleButton value="cliente">
            <User style={{ marginRight: "8px", fontSize: "1rem" }} />
            Por Cliente
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box component="form" onSubmit={handleSearch}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder={searchMode === "cliente" ? "Buscar por nombre..." : "Buscar por patente..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search style={{ color: "#666", fontSize: "1.1rem" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "grey.50",
                  "&:hover fieldset": {
                    borderColor: "#dc2626",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#dc2626",
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              startIcon={<Search />}
              sx={{
                backgroundColor: "#dc2626",
                color: "white",
                py: 0.75,
                borderRadius: 2,
                fontWeight: "medium",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#b91c1c",
                },
              }}
            >
              Buscar
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default SearchBar
