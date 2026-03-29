// src/pages/PlacePage.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardActionArea, Avatar, Chip,
  CircularProgress, Button, Tooltip, IconButton, Dialog, Fade, Skeleton,
  Breadcrumbs, Link
} from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getPlace, downloadPlacePhotos } from '../api.js';
import GroupsIcon from '@mui/icons-material/Groups';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// ---- Lightbox Component ----
function Lightbox({ photos, index, onClose }) {
  const [cur, setCur] = useState(index);
  const prev = () => setCur((c) => (c - 1 + photos.length) % photos.length);
  const next = () => setCur((c) => (c + 1) % photos.length);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <Dialog open onClose={onClose} maxWidth={false}
      PaperProps={{ sx: { bgcolor: 'rgba(4,8,7,0.96)', backdropFilter: 'blur(24px)', borderRadius: 3, overflow: 'hidden', maxWidth: '94vw', maxHeight: '94vh' } }}>
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10, bgcolor: 'rgba(0,0,0,0.5)', color: '#5fb49c' }}>
          <CloseIcon />
        </IconButton>
        <Fade in key={cur}>
          <img src={photos[cur]?.publicUrl} alt=""
            style={{ maxWidth: '86vw', maxHeight: '76vh', objectFit: 'contain', margin: '2rem 0' }} />
        </Fade>
        {photos[cur]?.caption && (
          <Typography sx={{ color: '#a8d5c2', mb: 2, px: 3, textAlign: 'center', fontSize: '0.85rem' }}>
            {photos[cur].caption}
          </Typography>
        )}
        {photos.length > 1 && (
          <Box sx={{ display: 'flex', gap: 3, pb: 2 }}>
            <IconButton onClick={prev} sx={{ color: '#5fb49c', border: '1px solid rgba(95,180,156,0.3)' }}><ChevronLeftIcon /></IconButton>
            <Typography sx={{ color: '#7a9e90' }}>{cur+1} / {photos.length}</Typography>
            <IconButton onClick={next} sx={{ color: '#5fb49c', border: '1px solid rgba(95,180,156,0.3)' }}><ChevronRightIcon /></IconButton>
          </Box>
        )}
      </Box>
    </Dialog>
  );
}

// ---- Person Card (without photo previews) ----
function PersonCard({ person, photoCount, placeSlug, index }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card sx={{
        bgcolor: 'rgba(17,24,22,0.9)',
        border: '1px solid rgba(95,180,156,0.12)',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': { borderColor: 'rgba(95,180,156,0.45)', transform: 'translateY(-6px)', boxShadow: '0 20px 40px rgba(95,180,156,0.1)' }
      }}>
        <CardActionArea onClick={() => navigate(`/place/${placeSlug}/person/${person._id}`)} sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Avatar src={person.avatar} sx={{
              width: 72, height: 72, mb: 1.5,
              border: '2px solid rgba(95,180,156,0.4)',
              bgcolor: 'rgba(95,180,156,0.1)', color: '#5fb49c'
            }}>
              {person.name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography sx={{ fontWeight: 600, color: '#e8f0ec', fontSize: '0.95rem' }}>{person.name}</Typography>
            {person.bio && <Typography sx={{ color: '#7a9e90', fontSize: '0.7rem', mb: 1 }}>{person.bio}</Typography>}
            <Chip label={`${photoCount} photos`} size="small" sx={{ bgcolor: 'rgba(95,180,156,0.1)', color: '#5fb49c', fontSize: '0.7rem' }} />
          </Box>
        </CardActionArea>
      </Card>
    </motion.div>
  );
}

// ---- Group Card (without photo previews) ----
function GroupCard({ photoCount, placeSlug }) {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card sx={{
        bgcolor: 'rgba(95,180,156,0.04)',
        border: '1px solid rgba(95,180,156,0.25)',
        borderRadius: 3,
        transition: 'all 0.3s',
        '&:hover': { borderColor: '#5fb49c', transform: 'translateY(-6px)' }
      }}>
        <CardActionArea onClick={() => navigate(`/place/${placeSlug}/group`)} sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <GroupsIcon sx={{ fontSize: '3rem', color: '#5fb49c', mb: 1 }} />
            <Typography sx={{ fontWeight: 600, color: '#5fb49c', fontSize: '0.95rem' }}>Group</Typography>
            <Typography sx={{ color: '#7a9e90', fontSize: '0.7rem', mb: 1 }}>Everyone together</Typography>
            <Chip label={`${photoCount} photos`} size="small" sx={{ bgcolor: 'rgba(95,180,156,0.15)', color: '#5fb49c' }} />
          </Box>
        </CardActionArea>
      </Card>
    </motion.div>
  );
}

// ---- Main PlacePage ----
export default function PlacePage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [allPhotos, setAllPhotos] = useState([]);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 0.5], [0, -120]);

  useEffect(() => {
    getPlace(slug)
      .then(r => {
        setData(r.data);
        const groupPhotos = r.data.groupPhotos || [];
        const personPhotosArray = Object.values(r.data.personPhotos).flatMap(pp => pp.photos || []);
        setAllPhotos([...groupPhotos, ...personPhotosArray]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PlaceSkeleton />;
  if (!data) return <NotFound />;

  const { place, persons, personPhotos, groupPhotos } = data;
  const dateStr = place.date ? new Date(place.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const totalPhotos = groupPhotos.length + persons.reduce((s, p) => s + (personPhotos[p._id]?.photos?.length || 0), 0);

  return (
    <Box sx={{ bgcolor: '#0b0f0e', minHeight: '100vh' }}>
      {/* Hero with Parallax */}
      <Box ref={heroRef} sx={{ position: 'relative', height: { xs: '55vh', md: '70vh' }, overflow: 'hidden' }}>
        <motion.div style={{ y: yHero, height: '100%' }}>
          {place.coverImage ? (
            <Box component="img" src={place.coverImage}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45)' }} />
          ) : (
            <Box sx={{ width: '100%', height: '100%', bgcolor: '#0d1f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '5rem' }}>🏔️</Typography>
            </Box>
          )}
        </motion.div>
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, #0b0f0e 95%)' }} />
        <Container maxWidth="lg" sx={{ position: 'absolute', bottom: { xs: 40, md: 70 }, left: 0, right: 0 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#5fb49c' }} />} sx={{ mb: 2 }}>
              <Link component={RouterLink} to="/" underline="hover" sx={{ display: 'flex', alignItems: 'center', color: '#7a9e90', '&:hover': { color: '#5fb49c' } }}>
                <HomeIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> Home
              </Link>
              <Typography sx={{ color: '#5fb49c' }}>{place.name}</Typography>
            </Breadcrumbs>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
              {place.location && <Chip icon={<PlaceIcon />} label={place.location} size="small" sx={{ bgcolor: 'rgba(95,180,156,0.15)', color: '#5fb49c' }} />}
              {dateStr && <Chip icon={<CalendarMonthIcon />} label={dateStr} size="small" sx={{ bgcolor: 'rgba(95,180,156,0.1)', color: '#a8d5c2' }} />}
              {totalPhotos > 0 && <Chip icon={<PhotoLibraryIcon />} label={`${totalPhotos} photos`} size="small" sx={{ bgcolor: 'rgba(95,180,156,0.1)', color: '#a8d5c2' }} />}
            </Box>
            <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 600, color: '#e8f0ec', lineHeight: 1.1 }}>
              {place.name}
            </Typography>
            {place.description && (
              <Typography sx={{ color: '#cbdcd5', maxWidth: '70%', mt: 1.5, fontSize: '0.95rem', opacity: 0.9 }}>
                {place.description}
              </Typography>
            )}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              {totalPhotos > 0 && (
                <Tooltip title="Download all photos as ZIP">
                  <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadPlacePhotos(slug)}
                    sx={{ borderColor: '#5fb49c', color: '#5fb49c', '&:hover': { bgcolor: 'rgba(95,180,156,0.1)' } }}>
                    Download All
                  </Button>
                </Tooltip>
              )}
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 5, pb: 8 }}>
        {/* Who was here - Persons & Group (without recent gallery) */}
        <Box>
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
              <Box sx={{ width: 3, height: 22, bgcolor: '#5fb49c', borderRadius: 2 }} />
              <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.3rem', fontStyle: 'italic', color: '#5fb49c' }}>
                Who was here
              </Typography>
            </Box>
          </motion.div>
          <Grid container spacing={2.5}>
            {groupPhotos.length > 0 && (
              <Grid item xs={6} sm={4} md={2.4}>
                <GroupCard photoCount={groupPhotos.length} placeSlug={slug} />
              </Grid>
            )}
            {persons.map((person, i) => {
              const photoCount = personPhotos[person._id]?.photos?.length || 0;
              return (
                <Grid item xs={6} sm={4} md={2.4} key={person._id}>
                  <PersonCard person={person} photoCount={photoCount} placeSlug={slug} index={i} />
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {persons.length === 0 && groupPhotos.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: '#7a9e90' }}>No memories captured here yet. ✨</Typography>
          </Box>
        )}
      </Container>

      {lightboxIndex !== null && (
        <Lightbox photos={allPhotos} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </Box>
  );
}

// ---- Skeleton Loader ----
function PlaceSkeleton() {
  return (
    <Box sx={{ bgcolor: '#0b0f0e', minHeight: '100vh', pt: 8 }}>
      <Skeleton variant="rectangular" height={400} sx={{ bgcolor: '#1a2a24' }} />
      <Container sx={{ mt: 4 }}>
        <Skeleton width="40%" height={40} sx={{ bgcolor: '#1f302a' }} />
        <Skeleton width="60%" height={24} sx={{ mt: 1, bgcolor: '#1f302a' }} />
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {[1,2,3,4,5].map(i => <Grid item xs={6} sm={4} md={2.4} key={i}><Skeleton variant="rounded" height={200} sx={{ bgcolor: '#1f302a' }} /></Grid>)}
        </Grid>
      </Container>
    </Box>
  );
}

function NotFound() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#0b0f0e' }}>
      <Typography sx={{ color: '#7a9e90' }}>Place not found.</Typography>
    </Box>
  );
}