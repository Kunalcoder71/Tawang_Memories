// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardActionArea, Chip, CircularProgress,
  Container, Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getPlaces } from '../api.js';
import ExploreIcon from '@mui/icons-material/Explore';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PeopleIcon from '@mui/icons-material/People';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// ---- Place Card (same as before, but slightly polished) ----
function PlaceCard({ place, index }) {
  const navigate = useNavigate();
  const dateStr = place.date
    ? new Date(place.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.07, ease: 'easeOut' }}
    >
      <Card
        sx={{
          background: 'rgba(17,24,22,0.9)',
          border: '1px solid rgba(95,180,156,0.1)',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.4s ease',
          '&:hover': {
            border: '1px solid rgba(95,180,156,0.4)',
            transform: 'translateY(-6px)',
            boxShadow: '0 20px 60px rgba(95,180,156,0.1)',
            '& .cover-img': { transform: 'scale(1.07)' },
          },
        }}
      >
        <CardActionArea onClick={() => navigate(`/place/${place.slug}`)}>
          <Box
            sx={{
              position: 'relative',
              height: 220,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #111816, #0d1f1a)',
            }}
          >
            {place.coverImage ? (
              <Box
                className="cover-img"
                component="img"
                src={place.coverImage}
                alt={place.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease',
                  display: 'block',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontSize: '4rem' }}>🗺️</Typography>
              </Box>
            )}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(11,15,14,0.9) 0%, transparent 55%)',
              }}
            />

            {dateStr && (
              <Chip
                icon={<CalendarMonthIcon sx={{ fontSize: '0.7rem !important' }} />}
                label={dateStr}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background: 'rgba(11,15,14,0.75)',
                  backdropFilter: 'blur(8px)',
                  color: '#a8d5c2',
                  border: '1px solid rgba(95,180,156,0.3)',
                  fontSize: '0.68rem',
                  fontWeight: 500,
                }}
              />
            )}

            <Box
              sx={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                display: 'flex',
                gap: 1,
              }}
            >
              {place.photoCount > 0 && (
                <Chip
                  icon={<PhotoLibraryIcon sx={{ fontSize: '0.65rem !important' }} />}
                  label={place.photoCount}
                  size="small"
                  sx={{
                    background: 'rgba(95,180,156,0.2)',
                    backdropFilter: 'blur(8px)',
                    color: '#5fb49c',
                    border: '1px solid rgba(95,180,156,0.25)',
                    fontSize: '0.68rem',
                    height: 22,
                  }}
                />
              )}
              {place.personCount > 0 && (
                <Chip
                  icon={<PeopleIcon sx={{ fontSize: '0.65rem !important' }} />}
                  label={place.personCount}
                  size="small"
                  sx={{
                    background: 'rgba(95,180,156,0.2)',
                    backdropFilter: 'blur(8px)',
                    color: '#5fb49c',
                    border: '1px solid rgba(95,180,156,0.25)',
                    fontSize: '0.68rem',
                    height: 22,
                  }}
                />
              )}
            </Box>
          </Box>

          <Box sx={{ p: 2.5 }}>
            {place.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                <PlaceIcon sx={{ fontSize: '0.78rem', color: '#5fb49c' }} />
                <Typography
                  sx={{
                    color: '#5fb49c',
                    fontSize: '0.74rem',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                  }}
                >
                  {place.location}
                </Typography>
              </Box>
            )}
            <Typography
              variant="h5"
              sx={{
                color: '#e8f0ec',
                mb: 0.8,
                fontSize: '1.25rem',
                lineHeight: 1.2,
              }}
            >
              {place.name}
            </Typography>
            {place.description && (
              <Typography
                sx={{
                  color: '#7a9e90',
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
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: '#5fb49c',
              }}
            >
              <ExploreIcon sx={{ fontSize: '0.85rem' }} />
              <Typography
                sx={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                }}
              >
                EXPLORE
              </Typography>
            </Box>
          </Box>
        </CardActionArea>
      </Card>
    </motion.div>
  );
}

// ---- Hero Section (without stats cards) ----
function Hero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -80]);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#0b0f0e',
        pt: 8,
      }}
    >
      {/* Ambient gradient orbs */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 70% 60% at 20% 50%, rgba(95,180,156,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 80% 60%, rgba(95,180,156,0.05) 0%, transparent 60%)
          `,
        }}
      />

      {/* Floating orbs animation */}
      {[
        { w: 300, h: 300, top: '10%', left: '-5%', dur: 8 },
        { w: 200, h: 200, top: '60%', right: '-3%', dur: 11 },
        { w: 150, h: 150, top: '40%', left: '60%', dur: 9 },
      ].map((orb, i) => (
        <Box
          key={i}
          component={motion.div}
          animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut' }}
          sx={{
            position: 'absolute',
            width: orb.w,
            height: orb.h,
            top: orb.top,
            left: orb.left,
            right: orb.right,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(95,180,156,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      ))}

      <motion.div style={{ y, zIndex: 2 }}>
        <Box sx={{ textAlign: 'center', px: 3, maxWidth: 700 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              sx={{
                color: '#5fb49c',
                fontSize: '0.8rem',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                mb: 2,
              }}
            >
              Personal Travel Journal
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3.5rem', md: '5.5rem' },
                fontWeight: 600,
                color: '#e8f0ec',
                lineHeight: 1.05,
                mb: 1,
              }}
            >
              Every Place
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.2rem', md: '3.5rem' },
                fontWeight: 400,
                fontStyle: 'italic',
                color: '#5fb49c',
                lineHeight: 1,
                mb: 3,
              }}
            >
              tells a story.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.35 }}
          >
            <Typography
              sx={{
                color: '#7a9e90',
                fontSize: { xs: '0.92rem', md: '1rem' },
                lineHeight: 1.8,
                maxWidth: 460,
                mx: 'auto',
              }}
            >
              A living archive of places visited, people met, and moments captured
              — all in one place.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Box
              component={motion.div}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              sx={{ mt: 5, color: '#5fb49c', fontSize: '1.4rem' }}
            >
              ↓
            </Box>
          </motion.div>
        </Box>
      </motion.div>
    </Box>
  );
}

// ---- Skeleton loader for places grid ----
function PlacesSkeleton() {
  return (
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Skeleton
            variant="rectangular"
            height={320}
            sx={{ bgcolor: '#1f302a', borderRadius: 3 }}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default function HomePage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlaces()
      .then((res) => setPlaces(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ background: '#0b0f0e', minHeight: '100vh' }}>
      <Hero />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
            <Box
              sx={{
                width: 3,
                height: 28,
                background: '#5fb49c',
                borderRadius: 2,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                color: '#5fb49c',
                fontStyle: 'italic',
                fontSize: { xs: '1.4rem', md: '1.8rem' },
              }}
            >
              All Places
            </Typography>
          </Box>
        </motion.div>

        {loading ? (
          <PlacesSkeleton />
        ) : places.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography sx={{ fontSize: '3rem', mb: 2 }}>🌍</Typography>
            <Typography sx={{ color: '#7a9e90', mb: 1 }}>
              No places yet.
            </Typography>
            <Typography sx={{ color: '#4a6e60', fontSize: '0.85rem' }}>
              Go to Admin panel and add your first place.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {places.map((place, i) => (
              <Grid item xs={12} sm={6} md={4} key={place._id}>
                <PlaceCard place={place} index={i} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Box
        sx={{
          borderTop: '1px solid rgba(95,180,156,0.08)',
          py: 4,
          textAlign: 'center',
        }}
      >
        <Typography
          sx={{
            color: '#2a4a3e',
            fontSize: '0.78rem',
            fontStyle: 'italic',
          }}
        >
          Travel Journal · Every journey deserves to be remembered
        </Typography>
      </Box>
    </Box>
  );
}