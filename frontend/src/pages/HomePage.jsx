import React, { useEffect, useState } from 'react'
import { Box, Typography, Grid, Card, CardActionArea, Chip, CircularProgress, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { getPlaces } from '../api.js'
import ExploreIcon from '@mui/icons-material/Explore'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

const PLACE_EMOJIS = {
  'dirang': '🌸',
  'sela-pass': '❄️',
  'jaswant-garh': '🎖️',
  'nuranang-falls': '💧',
  'tawang-monastery': '🛕',
  'madhuri-lake': '🏔️',
  'pt-tso': '🌊',
  'bum-la-pass': '🗺️',
  'sangti-valley': '🦢',
}

const DAY_LABELS = {
  1: 'Day 1 — Guwahati → Dirang',
  2: 'Day 2 — Dirang → Tawang',
  3: 'Day 3 — Bum La Excursion',
  4: 'Day 4 — Tawang → Dirang',
  5: 'Day 5 — Return',
}

const HERO_IMAGE = 'https://api-devload.cloudcoderhub.in/public/69c6aa04b72bd53163742dc2/1774682147864c39c16fcce69b701513c0f5b.jpg'

function ParallaxHero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 200])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#080c0f',
      }}
    >
      {/* Skeleton shimmer while image loads */}
      <AnimatePresence>
        {!imgLoaded && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{ position: 'absolute', inset: 0, zIndex: 1 }}
          >
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #080c0f 0%, #0d1a28 50%, #080c0f 100%)' }} />
            <Box
              component={motion.div}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              sx={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(105deg, transparent 30%, rgba(200,169,110,0.07) 50%, transparent 70%)',
              }}
            />
            <Box
              component={motion.div}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              sx={{ position: 'absolute', bottom: 0, width: '100%' }}
            >
              <svg viewBox="0 0 1440 300" preserveAspectRatio="none" style={{ width: '100%', height: 300, display: 'block' }}>
                <polygon points="0,300 200,120 400,200 600,80 800,160 1000,50 1200,140 1440,100 1440,300" fill="rgba(200,169,110,0.05)" />
                <polygon points="0,300 300,180 550,240 750,150 950,210 1150,130 1440,190 1440,300" fill="rgba(200,169,110,0.03)" />
              </svg>
            </Box>
            <Box sx={{ position: 'absolute', bottom: 36, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={13} sx={{ color: 'rgba(200,169,110,0.45)' }} />
              <Typography sx={{ color: 'rgba(200,169,110,0.4)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                Loading
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parallax background image */}
      <motion.div style={{ y, position: 'absolute', top: '-10%', left: 0, right: 0, bottom: '-10%', zIndex: 0 }}>
        <motion.img
          src={HERO_IMAGE}
          onLoad={() => setImgLoaded(true)}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={imgLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.06 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </motion.div>

      {/* Overlay gradient */}
      <Box
        sx={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: `linear-gradient(to bottom,
            rgba(8,12,15,0.5) 0%,
            rgba(8,12,15,0.25) 35%,
            rgba(8,12,15,0.6) 70%,
            rgba(8,12,15,1) 100%)`,
        }}
      />

      {/* Stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <Box
          key={i}
          component={motion.div}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4 }}
          sx={{
            position: 'absolute', zIndex: 2,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            borderRadius: '50%',
            background: '#fff',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 40}%`,
          }}
        />
      ))}

      {/* Hero text */}
      <motion.div style={{ opacity, position: 'relative', zIndex: 3, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '0.85rem', md: '1rem' },
              color: '#c8a96e',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              mb: 2,
            }}
          >
            Arunachal Pradesh · 2024
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', sm: '4.5rem', md: '6.5rem' },
              fontWeight: 700,
              color: '#f0e8d8',
              lineHeight: 1.05,
              mb: 1,
            }}
          >
            Tawang
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
              fontWeight: 400,
              fontStyle: 'italic',
              color: '#c8a96e',
              lineHeight: 1,
              mb: 3,
            }}
          >
            Memories
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Typography
            sx={{
              color: '#9a8a72',
              fontSize: { xs: '0.9rem', md: '1.05rem' },
              maxWidth: 480,
              mx: 'auto',
              lineHeight: 1.8,
              fontWeight: 300,
            }}
          >
            A 5-day journey through sacred monasteries, high mountain passes, and pristine Himalayan lakes
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Box
            component={motion.div}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            sx={{ mt: 6, color: '#c8a96e', fontSize: '1.5rem' }}
          >
            ↓
          </Box>
        </motion.div>
      </motion.div>
    </Box>
  )
}

function PlaceCard({ place, index }) {
  const navigate = useNavigate()
  const emoji = PLACE_EMOJIS[place.slug] || '📍'

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Card
        sx={{
          background: 'rgba(15,21,25,0.8)',
          border: '1px solid rgba(200,169,110,0.1)',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.4s ease',
          '&:hover': {
            border: '1px solid rgba(200,169,110,0.4)',
            transform: 'translateY(-6px)',
            boxShadow: '0 20px 60px rgba(200,169,110,0.1)',
            '& .cover-img': { transform: 'scale(1.08)' },
            '& .place-emoji': { transform: 'scale(1.2)' },
          },
        }}
      >
        <CardActionArea onClick={() => navigate(`/place/${place.slug}`)}>
          {/* Image or placeholder */}
          <Box sx={{ position: 'relative', height: 200, overflow: 'hidden', background: 'linear-gradient(135deg, #0f1e2e, #1a2a1a)' }}>
            {place.coverImage ? (
              <Box
                className="cover-img"
                component="img"
                src={place.coverImage}
                alt={place.name}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, rgba(200,169,110,0.05), rgba(100,150,200,0.05))`,
                }}
              >
                <Typography className="place-emoji" sx={{ fontSize: '4rem', transition: 'transform 0.3s ease' }}>
                  {emoji}
                </Typography>
              </Box>
            )}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(8,12,15,0.8) 0%, transparent 60%)',
              }}
            />
            {place.day && (
              <Chip
                icon={<CalendarTodayIcon sx={{ fontSize: '0.7rem !important' }} />}
                label={`Day ${place.day}`}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(200,169,110,0.2)',
                  backdropFilter: 'blur(8px)',
                  color: '#c8a96e',
                  border: '1px solid rgba(200,169,110,0.3)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Playfair Display", serif',
                color: '#f0e8d8',
                mb: 0.8,
                fontSize: '1.1rem',
              }}
            >
              {place.name}
            </Typography>
            {place.description && (
              <Typography
                sx={{
                  color: '#9a8a72',
                  fontSize: '0.82rem',
                  lineHeight: 1.7,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {place.description}
              </Typography>
            )}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5, color: '#c8a96e' }}>
              <ExploreIcon sx={{ fontSize: '0.9rem' }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                EXPLORE
              </Typography>
            </Box>
          </Box>
        </CardActionArea>
      </Card>
    </motion.div>
  )
}

export default function HomePage() {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPlaces()
      .then(res => setPlaces(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  // Group by day
  const byDay = places.reduce((acc, p) => {
    const d = p.day || 0
    if (!acc[d]) acc[d] = []
    acc[d].push(p)
    return acc
  }, {})

  return (
    <Box sx={{ background: '#080c0f', minHeight: '100vh' }}>
      <ParallaxHero />

      <Container maxWidth="lg" sx={{ py: 10 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#c8a96e' }} />
          </Box>
        ) : places.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ color: '#9a8a72', mb: 2 }}>No places yet.</Typography>
            <Typography sx={{ color: '#9a8a72', fontSize: '0.9rem' }}>
              Go to Admin → Seed Data to load the Tawang itinerary.
            </Typography>
          </Box>
        ) : (
          Object.keys(byDay).sort().map(day => (
            <Box key={day} sx={{ mb: 8 }}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                  <Box sx={{ width: 3, height: 28, background: '#c8a96e', borderRadius: 2 }} />
                  <Typography
                    sx={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                      color: '#c8a96e',
                      fontStyle: 'italic',
                    }}
                  >
                    {DAY_LABELS[day] || `Day ${day}`}
                  </Typography>
                </Box>
              </motion.div>

              <Grid container spacing={3}>
                {byDay[day].map((place, i) => (
                  <Grid item xs={12} sm={6} md={4} key={place._id}>
                    <PlaceCard place={place} index={i} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        )}
      </Container>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid rgba(200,169,110,0.1)', py: 4, textAlign: 'center' }}>
        <Typography sx={{ color: '#4a3a2a', fontSize: '0.8rem', fontStyle: 'italic' }}>
          Tawang, Arunachal Pradesh · 5 Days · 5 Friends · Infinite Memories
        </Typography>
      </Box>
    </Box>
  )
}