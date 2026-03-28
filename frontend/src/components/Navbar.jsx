import React, { useState, useEffect } from 'react'
import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { motion } from 'framer-motion'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isAdmin = location.pathname === '/admin'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: scrolled ? 'rgba(8,12,15,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(200,169,110,0.15)' : 'none',
        transition: 'all 0.4s ease',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 5 }, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isHome && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <IconButton onClick={() => navigate(-1)} sx={{ color: '#c8a96e', mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              onClick={() => navigate('/')}
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontSize: { xs: '1.1rem', md: '1.4rem' },
                fontStyle: 'italic',
                color: '#c8a96e',
                cursor: 'pointer',
                letterSpacing: '0.02em',
                '&:hover': { color: '#e8d5b0' },
                transition: 'color 0.3s',
              }}
            >
              Tawang Memories
            </Typography>
          </motion.div>
        </Box>

        {!isAdmin && (
          <Tooltip title="Admin Panel">
            <IconButton
              onClick={() => navigate('/admin')}
              sx={{
                color: 'rgba(200,169,110,0.5)',
                '&:hover': { color: '#c8a96e' },
                transition: 'color 0.3s',
              }}
            >
              <AdminPanelSettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    </AppBar>
  )
}
