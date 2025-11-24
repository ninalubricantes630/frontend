"use client"

import ClienteCard from "./ClienteCard"
import VehiculoCard from "./VehiculoCard"
import { Box, Typography, Card, CardContent, Skeleton, Stack } from "@mui/material"
import { Search } from "lucide-react"

const SearchResults = ({ results, loading, searchTerm, searchMode }) => {
  if (loading) {
    return (
      <Stack spacing={2.5}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Skeleton variant="text" width="25%" height={28} />
                <Skeleton variant="text" width="35%" height={20} />
                <Box
                  sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 1.5, mt: 1.5 }}
                >
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    )
  }

  if (!searchTerm) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Search style={{ fontSize: "2.5rem", color: "#d1d5db", marginBottom: "12px" }} />
        <Typography variant="h6" sx={{ color: "#171717", mb: 0.5, fontWeight: "600", fontSize: "1.125rem" }}>
          Buscar clientes o vehículos
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.875rem" }}>
          Utiliza el buscador para encontrar información de clientes y sus vehículos
        </Typography>
      </Box>
    )
  }

  if (results.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Search style={{ fontSize: "2.5rem", color: "#d1d5db", marginBottom: "12px" }} />
        <Typography variant="h6" sx={{ color: "#171717", mb: 0.5, fontWeight: "600", fontSize: "1.125rem" }}>
          No se encontraron resultados
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.875rem" }}>
          No hay resultados para "{searchTerm}" en {searchMode === "cliente" ? "clientes" : "patentes"}
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
        <Typography variant="h6" sx={{ color: "#171717", fontWeight: "600", fontSize: "1.125rem" }}>
          Resultados de búsqueda
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.875rem" }}>
          {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        {results.map((item) =>
          searchMode === "patente" ? (
            <VehiculoCard key={item.id} vehiculo={item} />
          ) : (
            <ClienteCard key={item.id} cliente={item} />
          ),
        )}
      </Stack>
    </Box>
  )
}

export default SearchResults
