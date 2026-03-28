import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Container, Avatar, CircularProgress,
  Dialog, IconButton, Chip
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getPersonPhotos, getGroupPhotos } from '../api.js'
import CloseIcon from '@mui/icons-material/Close'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import GroupsIcon from '@mui/icons-material/Groups'

function Lightbox({ photos, index, onClose }) {
  const [current, setCurrent] = useState(index)

  const prev = () => setCurrent(c => (c - 1 + photos.length) % photos.length)
  const next = () => setCurrent(c => (c + 1) % photos.length)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          background: 'rgba(4,6,8,0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          overflow: 'hidden',
          maxWidth: '92vw',
          maxHeight: '92vh',
        }
      }}
    >
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10, color: '#c8a96e', background: 'rgba(0,0,0,0.4)' }}
        >
          <CloseIcon />
        </IconButton>

        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={photos[current]?.publicUrl}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            style={{ maxWidth: '88vw', maxHeight: '78vh', objectFit: 'contain', display: 'block' }}
          />
        </AnimatePresence>

        {/* Caption */}
        {photos[current]?.caption && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography sx={{ color: '#9a8a72', fontSize: '0.88rem', fontStyle: 'italic' }}>
              {photos[current].caption}
            </Typography>
          </Box>
        )}

        {/* Nav */}
        {photos.length > 1 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, pb: 2 }}>
            <IconButton onClick={prev} sx={{ color: '#c8a96e', border: '1px solid rgba(200,169,110,0.3)' }}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography sx={{ color: '#9a8a72', fontSize: '0.85rem' }}>
              {current + 1} / {photos.length}
            </Typography>
            <IconButton onClick={next} sx={{ color: '#c8a96e', border: '1px solid rgba(200,169,110,0.3)' }}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Dialog>
  )
}

export default function PersonPage({ isGroup }) {
  const { slug, personId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightboxIdx, setLightboxIdx] = useState(null)

  useEffect(() => {
    const fetch = isGroup ? getGroupPhotos(slug) : getPersonPhotos(slug, personId)
    fetch
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [slug, personId, isGroup])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#080c0f' }}>
        <CircularProgress sx={{ color: '#c8a96e' }} />
      </Box>
    )
  }

  const photos = data?.photos || []
  const person = data?.person
  const place = data?.place

  return (
    <Box sx={{ background: '#080c0f', minHeight: '100vh', pt: 11, pb: 10 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6, mt: 3 }}>
            {isGroup ? (
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: '2px solid rgba(200,169,110,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(200,169,110,0.1), rgba(200,169,110,0.03))',
                }}
              >
                <GroupsIcon sx={{ fontSize: '2rem', color: '#c8a96e' }} />
              </Box>
            ) : (
              <Avatar
                src={person?.avatar}
                sx={{
                  width: 80,
                  height: 80,
                  border: '2px solid rgba(200,169,110,0.4)',
                  fontSize: '2rem',
                  background: 'linear-gradient(135deg, #1a2a3a, #2a1a3a)',
                  color: '#c8a96e',
                }}
              >
                {person?.name?.[0]?.toUpperCase()}
              </Avatar>
            )}

            <Box>
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: { xs: '1.6rem', md: '2.2rem' },
                  color: '#f0e8d8',
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {isGroup ? 'Group' : person?.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
                {place && (
                  <Typography sx={{ color: '#c8a96e', fontSize: '0.88rem', fontStyle: 'italic' }}>
                    @ {place.name}
                  </Typography>
                )}
                <Chip
                  label={`${photos.length} photo${photos.length !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{ background: 'rgba(200,169,110,0.12)', color: '#c8a96e', fontSize: '0.72rem', height: 22 }}
                />
              </Box>
              {person?.bio && (
                <Typography sx={{ color: '#9a8a72', fontSize: '0.82rem', mt: 0.5 }}>
                  {person.bio}
                </Typography>
              )}
            </Box>
          </Box>
        </motion.div>

        {/* Gallery */}
        {photos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ color: '#9a8a72', fontSize: '1rem' }}>No photos uploaded yet.</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              columns: { xs: 2, sm: 3, md: 4 },
              gap: '12px',
              '& > *': { breakInside: 'avoid', mb: '12px' },
            }}
          >
            {photos.map((photo, i) => (
              <motion.div
                key={photo._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                style={{ cursor: 'pointer' }}
                onClick={() => setLightboxIdx(i)}
              >
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid rgba(200,169,110,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: '1px solid rgba(200,169,110,0.4)',
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 32px rgba(200,169,110,0.15)',
                      '& .overlay': { opacity: 1 },
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={photo.publicUrl}
                    alt={photo.caption || `Photo ${i + 1}`}
                    sx={{ width: '100%', display: 'block', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <Box
                    className="overlay"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.3)',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography sx={{ color: '#fff', fontSize: '1.5rem' }}>⊕</Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        )}
      </Container>

      {lightboxIdx !== null && (
        <Lightbox photos={photos} index={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </Box>
  )
}
