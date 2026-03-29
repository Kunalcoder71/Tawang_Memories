import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import Navbar from './components/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import PlacePage from './pages/PlacePage.jsx'
import GalleryPage from './pages/GalleryPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#5fb49c' },
    secondary: { main: '#a8d5c2' },
    background: { default: '#0b0f0e', paper: '#111816' },
    text: { primary: '#e8f0ec', secondary: '#7a9e90' },
  },
  typography: {
    fontFamily: '"Outfit", sans-serif',
    h1: { fontFamily: '"Cormorant Garamond", serif' },
    h2: { fontFamily: '"Cormorant Garamond", serif' },
    h3: { fontFamily: '"Cormorant Garamond", serif' },
    h4: { fontFamily: '"Cormorant Garamond", serif' },
    h5: { fontFamily: '"Cormorant Garamond", serif' },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 8, fontWeight: 500 } } },
    MuiCard: { styleOverrides: { root: { backgroundImage: 'none' } } },
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
          <Route path="/place/:slug/person/:personId" element={<GalleryPage />} />
          <Route path="/place/:slug/group" element={<GalleryPage isGroup />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
