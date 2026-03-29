// src/pages/GalleryPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Container, Avatar, CircularProgress, Dialog,
  IconButton, Chip, Skeleton, useMediaQuery
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getPersonPhotos, getGroupPhotos } from '../api.js';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GroupsIcon from '@mui/icons-material/Groups';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// ---- Enhanced Lightbox with swipe & loading state ----
function Lightbox({ photos, index, onClose }) {
  const [cur, setCur] = useState(index);
  const [imgLoading, setImgLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const containerRef = useRef();

  const prev = () => {
    setCur((c) => (c - 1 + photos.length) % photos.length);
    setImgLoading(true);
  };
  const next = () => {
    setCur((c) => (c + 1) % photos.length);
    setImgLoading(true);
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cur]);

  // Touch swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) {
      diff > 0 ? prev() : next();
    }
    setTouchStart(null);
  };

  // Click on left/right side of image
  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) prev();
    else next();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          background: 'rgba(4,8,7,0.98)',
          backdropFilter: 'blur(24px)',
          borderRadius: 3,
          overflow: 'hidden',
          maxWidth: '94vw',
          maxHeight: '94vh',
          position: 'relative',
        },
      }}
    >
      <Box
        ref={containerRef}
        sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 20,
            bgcolor: 'rgba(0,0,0,0.5)',
            color: '#5fb49c',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Main image with click zones */}
        <Box
          onClick={handleImageClick}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '70vh',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={cur}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'relative' }}
            >
              {imgLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 5,
                  }}
                >
                  <CircularProgress size={48} sx={{ color: '#5fb49c' }} />
                </Box>
              )}
              <img
                src={photos[cur]?.publicUrl}
                alt={photos[cur]?.caption || ''}
                style={{
                  maxWidth: '88vw',
                  maxHeight: '76vh',
                  objectFit: 'contain',
                  display: 'block',
                  opacity: imgLoading ? 0 : 1,
                  transition: 'opacity 0.2s',
                }}
                onLoad={() => setImgLoading(false)}
              />
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Caption */}
        {photos[cur]?.caption && (
          <Typography
            sx={{
              color: '#a8d5c2',
              px: 3,
              py: 1.5,
              textAlign: 'center',
              fontSize: '0.85rem',
              fontStyle: 'italic',
              bgcolor: 'rgba(0,0,0,0.3)',
              borderRadius: 2,
              mt: 1,
            }}
          >
            {photos[cur].caption}
          </Typography>
        )}

        {/* Navigation buttons + counter */}
        {photos.length > 1 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mt: 2, pb: 2 }}>
            <IconButton onClick={prev} sx={{ color: '#5fb49c', border: '1px solid rgba(95,180,156,0.4)' }}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography sx={{ color: '#7a9e90', fontSize: '0.9rem' }}>
              {cur + 1} / {photos.length}
            </Typography>
            <IconButton onClick={next} sx={{ color: '#5fb49c', border: '1px solid rgba(95,180,156,0.4)' }}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Dialog>
  );
}

// ---- Lazy image with skeleton ----
function LazyImage({ src, alt, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
  }, [src]);

  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid rgba(95,180,156,0.1)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          borderColor: 'rgba(95,180,156,0.5)',
          transform: 'scale(1.02)',
          boxShadow: '0 8px 24px rgba(95,180,156,0.15)',
        },
      }}
    >
      {!loaded && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={200}
          sx={{ bgcolor: '#1f302a' }}
          animation="wave"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{
          width: '100%',
          display: loaded ? 'block' : 'none',
          objectFit: 'cover',
        }}
      />
      <Box
        className="overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(0,0,0,0.2)',
          opacity: 0,
          transition: 'opacity 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': { opacity: 1 },
        }}
      >
        <Typography sx={{ color: '#fff', fontSize: '1.8rem' }}>⊕</Typography>
      </Box>
    </Box>
  );
}

export default function GalleryPage({ isGroup }) {
  const { slug, personId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const fetch = isGroup ? getGroupPhotos(slug) : getPersonPhotos(slug, personId);
    fetch
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, personId, isGroup]);

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#0b0f0e', minHeight: '100vh', pt: 11 }}>
        <Container>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6 }}>
            <Skeleton variant="circular" width={78} height={78} sx={{ bgcolor: '#1f302a' }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="60%" height={40} sx={{ bgcolor: '#1f302a' }} />
              <Skeleton width="40%" height={24} sx={{ mt: 1, bgcolor: '#1f302a' }} />
            </Box>
          </Box>
          <Box sx={{ columns: { xs: 2, sm: 3, md: 4 }, gap: '12px' }}>
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={180}
                sx={{ mb: '12px', bgcolor: '#1f302a', borderRadius: 2 }}
              />
            ))}
          </Box>
        </Container>
      </Box>
    );
  }

  const photos = data?.photos || [];
  const person = data?.person;
  const place = data?.place;
  const dateStr = place?.date
    ? new Date(place.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <Box sx={{ background: '#0b0f0e', minHeight: '100vh', pt: 11, pb: 10 }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6, mt: 3, flexWrap: 'wrap' }}>
            {isGroup ? (
              <Box
                sx={{
                  width: 78,
                  height: 78,
                  borderRadius: '50%',
                  border: '2px solid rgba(95,180,156,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(95,180,156,0.1), rgba(95,180,156,0.03))',
                }}
              >
                <GroupsIcon sx={{ fontSize: '2rem', color: '#5fb49c' }} />
              </Box>
            ) : (
              <Avatar
                src={person?.avatar}
                sx={{
                  width: 78,
                  height: 78,
                  border: '2px solid rgba(95,180,156,0.4)',
                  background: 'linear-gradient(135deg, #1a2e28, #0d1f1a)',
                  color: '#5fb49c',
                  fontSize: '1.8rem',
                }}
              >
                {person?.name?.[0]?.toUpperCase()}
              </Avatar>
            )}
            <Box>
              <Typography
                variant="h3"
                sx={{
                  color: '#e8f0ec',
                  fontSize: { xs: '1.7rem', md: '2.3rem' },
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {isGroup ? 'Group Photos' : person?.name}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.8 }}>
                {place && (
                  <Chip
                    icon={<PlaceIcon sx={{ fontSize: '0.68rem !important' }} />}
                    label={place.name}
                    size="small"
                    sx={{
                      background: 'rgba(95,180,156,0.1)',
                      color: '#5fb49c',
                      border: '1px solid rgba(95,180,156,0.2)',
                      fontSize: '0.7rem',
                    }}
                  />
                )}
                {dateStr && (
                  <Chip
                    icon={<CalendarMonthIcon sx={{ fontSize: '0.68rem !important' }} />}
                    label={dateStr}
                    size="small"
                    sx={{
                      background: 'rgba(95,180,156,0.08)',
                      color: '#a8d5c2',
                      border: '1px solid rgba(95,180,156,0.15)',
                      fontSize: '0.7rem',
                    }}
                  />
                )}
                <Chip
                  label={`${photos.length} photo${photos.length !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    background: 'rgba(95,180,156,0.1)',
                    color: '#5fb49c',
                    fontSize: '0.7rem',
                  }}
                />
              </Box>
              {person?.bio && (
                <Typography sx={{ color: '#7a9e90', fontSize: '0.8rem', mt: 0.5 }}>
                  {person.bio}
                </Typography>
              )}
            </Box>
          </Box>
        </motion.div>

        {photos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ fontSize: '2.5rem', mb: 2 }}>📷</Typography>
            <Typography sx={{ color: '#7a9e90' }}>No photos uploaded yet.</Typography>
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
              <LazyImage
                key={photo._id}
                src={photo.publicUrl}
                alt={photo.caption || `Photo ${i + 1}`}
                onClick={() => setLightboxIdx(i)}
              />
            ))}
          </Box>
        )}
      </Container>

      {lightboxIdx !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </Box>
  );
}