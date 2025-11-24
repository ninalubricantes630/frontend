"use client"

import { useState } from "react"
import SearchBar from "../../components/Dashboard/SearchBar"
import SearchResults from "../../components/Dashboard/SearchResults"
import { Box } from "@mui/material"
import clientesService from "../../services/clientesService"
import vehiculosService from "../../services/vehiculosService"

const DashboardPage = () => {
  const [searchMode, setSearchMode] = useState("patente")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([])
      setSearchTerm("")
      return
    }

    setLoading(true)
    setSearchTerm(term)

    try {
      let results = []

      if (searchMode === "cliente") {
        const response = await clientesService.getClientes({ page: 1, limit: 10, search: term })
        const clientesArray = response?.data || []
        results = Array.isArray(clientesArray) ? clientesArray : []
      } else {
        const response = await vehiculosService.getAll({
          page: 1,
          limit: 10,
          search: term,
          searchCriteria: "patente",
        })
        console.log("[v0] Vehicle search response:", response)
        const vehiculosArray = response?.vehiculos || response?.data?.vehiculos || []
        results = Array.isArray(vehiculosArray) ? vehiculosArray : []
        console.log("[v0] Processed vehiculos results:", results)
      }

      setSearchResults(results)
    } catch (error) {
      console.error("Error en búsqueda:", error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMode = (mode) => {
    setSearchMode(mode)
    setSearchTerm("")
    setSearchResults([])
  }

  return (
    <Box sx={{ p: 2, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
        <Box sx={{ mb: 2, p: 3, bgcolor: "white", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
          <SearchBar onSearch={handleSearch} searchMode={searchMode} onToggleMode={handleToggleMode} />
        </Box>

        <Box sx={{ p: 3, bgcolor: "white", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
          <SearchResults results={searchResults} loading={loading} searchTerm={searchTerm} searchMode={searchMode} />
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardPage
