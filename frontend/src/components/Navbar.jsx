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
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <AppBar position="fixed" elevation={0} sx={{
      background: scrolled ? 'rgba(11,15,14,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(95,180,156,0.12)' : 'none',
      transition: 'all 0.4s ease',
    }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 5 }, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isHome && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <IconButton onClick={() => navigate(-1)} sx={{ color: '#5fb49c', mr: 0.5 }}>
                <ArrowBackIcon />
              </IconButton>
            </motion.div>
          )}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <Typography onClick={() => navigate('/')} sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              fontStyle: 'italic',
              color: '#5fb49c',
              cursor: 'pointer',
              letterSpacing: '0.03em',
              '&:hover': { color: '#a8d5c2' },
              transition: 'color 0.3s',
            }}>
              Travel Journal
            </Typography>
          </motion.div>
        </Box>
        {!isAdmin && (
          <Tooltip title="Admin Panel">
            <IconButton onClick={() => navigate('/admin')} sx={{
              color: 'rgba(95,180,156,0.4)',
              '&:hover': { color: '#5fb49c' },
              transition: 'color 0.3s',
            }}>
              <AdminPanelSettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    </AppBar>
  )
}
