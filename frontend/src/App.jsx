import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import HomePage from './pages/HomePage.jsx'
import PlacePage from './pages/PlacePage.jsx'
import PersonPage from './pages/PersonPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import Navbar from './components/Navbar.jsx'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#c8a96e' },
    secondary: { main: '#e8d5b0' },
    background: { default: '#080c0f', paper: '#0f1519' },
    text: { primary: '#f0e8d8', secondary: '#9a8a72' },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: { fontFamily: '"Playfair Display", serif' },
    h2: { fontFamily: '"Playfair Display", serif' },
    h3: { fontFamily: '"Playfair Display", serif' },
    h4: { fontFamily: '"Playfair Display", serif' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 2, fontWeight: 500 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/place/:slug" element={<PlacePage />} />
          <Route path="/place/:slug/person/:personId" element={<PersonPage />} />
          <Route path="/place/:slug/group" element={<PersonPage isGroup />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
