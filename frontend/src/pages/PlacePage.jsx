import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Container, Grid, Card, CardActionArea,
  Avatar, Chip, CircularProgress, Divider
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getPlace } from '../api.js'
import GroupsIcon from '@mui/icons-material/Groups'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'

function PersonCard({ person, photoCount, placeSlug, index }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Card
        sx={{
          background: 'rgba(15,21,25,0.9)',
          border: '1px solid rgba(200,169,110,0.1)',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.35s ease',
          '&:hover': {
            border: '1px solid rgba(200,169,110,0.45)',
            transform: 'translateY(-5px)',
            boxShadow: '0 16px 48px rgba(200,169,110,0.12)',
          },
        }}
      >
        <CardActionArea
          onClick={() => navigate(`/place/${placeSlug}/person/${person._id}`)}
          sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={person.avatar}
              sx={{
                width: 90,
                height: 90,
                border: '2px solid rgba(200,169,110,0.4)',
                fontSize: '2rem',
                background: 'linear-gradient(135deg, #1a2a3a, #2a1a3a)',
                color: '#c8a96e',
              }}
            >
              {person.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                background: '#c8a96e',
                borderRadius: '50%',
                width: 26,
                height: 26,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PhotoLibraryIcon sx={{ fontSize: '0.85rem', color: '#080c0f' }} />
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '1.05rem',
                color: '#f0e8d8',
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              {person.name}
            </Typography>
            {person.bio && (
              <Typography sx={{ color: '#9a8a72', fontSize: '0.78rem', mb: 1 }}>
                {person.bio}
              </Typography>
            )}
            <Chip
              label={`${photoCount} photo${photoCount !== 1 ? 's' : ''}`}
              size="small"
              sx={{
                background: 'rgba(200,169,110,0.12)',
                color: '#c8a96e',
                fontSize: '0.72rem',
                height: 22,
              }}
            />
          </Box>
        </CardActionArea>
      </Card>
    </motion.div>
  )
}

function GroupCard({ photoCount, placeSlug }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0 }}
    >
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(200,169,110,0.08), rgba(200,169,110,0.03))',
          border: '1px solid rgba(200,169,110,0.25)',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.35s ease',
          '&:hover': {
            border: '1px solid rgba(200,169,110,0.55)',
            transform: 'translateY(-5px)',
            boxShadow: '0 16px 48px rgba(200,169,110,0.15)',
          },
        }}
      >
        <CardActionArea
          onClick={() => navigate(`/place/${placeSlug}/group`)}
          sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
        >
          <Box
            sx={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              border: '2px solid rgba(200,169,110,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(200,169,110,0.15), rgba(200,169,110,0.05))',
            }}
          >
            <GroupsIcon sx={{ fontSize: '2.5rem', color: '#c8a96e' }} />
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '1.05rem',
                color: '#c8a96e',
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              Group
            </Typography>
            <Typography sx={{ color: '#9a8a72', fontSize: '0.78rem', mb: 1 }}>
              All together
            </Typography>
            <Chip
              label={`${photoCount} photo${photoCount !== 1 ? 's' : ''}`}
              size="small"
              sx={{
                background: 'rgba(200,169,110,0.15)',
                color: '#c8a96e',
                fontSize: '0.72rem',
                height: 22,
              }}
            />
          </Box>
        </CardActionArea>
      </Card>
    </motion.div>
  )
}

export default function PlacePage() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPlace(slug)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#080c0f' }}>
        <CircularProgress sx={{ color: '#c8a96e' }} />
      </Box>
    )
  }

  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#080c0f' }}>
        <Typography sx={{ color: '#9a8a72' }}>Place not found.</Typography>
      </Box>
    )
  }

  const { place, persons, personPhotos, groupPhotos } = data

  return (
    <Box sx={{ background: '#080c0f', minHeight: '100vh', pt: 12, pb: 10 }}>
      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          mb: 8,
          overflow: 'hidden',
          height: { xs: 220, md: 300 },
          background: place.coverImage
            ? 'transparent'
            : 'linear-gradient(135deg, #0a1520, #1a0a20)',
        }}
      >
        {place.coverImage && (
          <Box
            component="img"
            src={place.coverImage}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)' }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 30%, #080c0f 100%)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pb: 4 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {place.day && (
              <Typography sx={{ color: '#c8a96e', fontSize: '0.8rem', letterSpacing: '0.3em', textTransform: 'uppercase', mb: 1 }}>
                Day {place.day}
              </Typography>
            )}
            <Typography
              variant="h2"
              sx={{ fontFamily: '"Playfair Display", serif', color: '#f0e8d8', fontSize: { xs: '2rem', md: '3.2rem' }, fontWeight: 700 }}
            >
              {place.name}
            </Typography>
            {place.description && (
              <Typography sx={{ color: '#9a8a72', mt: 1, maxWidth: 600, fontSize: '0.92rem', lineHeight: 1.7 }}>
                {place.description}
              </Typography>
            )}
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box sx={{ width: 3, height: 24, background: '#c8a96e', borderRadius: 2 }} />
            <Typography sx={{ fontFamily: '"Playfair Display", serif', color: '#c8a96e', fontSize: '1.1rem', fontStyle: 'italic' }}>
              Who was here
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          {/* Group card first */}
          {groupPhotos?.length > 0 && (
            <Grid item xs={6} sm={4} md={2.4}>
              <GroupCard photoCount={groupPhotos.length} placeSlug={slug} />
            </Grid>
          )}

          {/* Person cards */}
          {persons.map((person, i) => {
            const pData = personPhotos[person._id.toString()] || {}
            const count = pData.photos?.length || 0
            return (
              <Grid item xs={6} sm={4} md={2.4} key={person._id}>
                <PersonCard
                  person={person}
                  photoCount={count}
                  placeSlug={slug}
                  index={i + 1}
                />
              </Grid>
            )
          })}
        </Grid>

        {persons.length === 0 && groupPhotos?.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: '#9a8a72' }}>No photos uploaded yet for this location.</Typography>
          </Box>
        )}
      </Container>
    </Box>
  )
}
