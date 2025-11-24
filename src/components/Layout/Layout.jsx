"use client"

import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Box, CssBaseline, useMediaQuery, useTheme } from "@mui/material"
import Sidebar from "./Sidebar"
import Header from "./Header"
import SessionManager from "../Auth/SessionManager"

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f5f5" }}>
      <CssBaseline />
      <SessionManager />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <Header onMenuClick={handleSidebarToggle} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: "auto",
            bgcolor: "#f8f9fa",
            p: { xs: 2, sm: 3, lg: 2 },
          }}
        >
          <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
