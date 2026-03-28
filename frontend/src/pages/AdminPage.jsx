import React, { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, Container, TextField, Button, Card,
  Tab, Tabs, Avatar, IconButton, Grid, Select, MenuItem,
  FormControl, InputLabel, Switch, FormControlLabel,
  CircularProgress, Alert, Chip, Tooltip
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import {
  verifyAdmin, getPlaces, getPersons, createPerson, deletePerson,
  createPlace, deletePlace, uploadPhoto, deletePhoto, seedData, getPlace
} from '../api.js'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt'
import SeedIcon from '@mui/icons-material/AutoAwesome'
import LockIcon from '@mui/icons-material/Lock'
import ImageIcon from '@mui/icons-material/Image'

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true); setError('')
    try {
      await verifyAdmin(pw)
      onLogin(pw)
    } catch {
      setError('Invalid admin password')
    } finally { setLoading(false) }
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#080c0f', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 8 }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card sx={{ p: 5, minWidth: 360, background: 'rgba(15,21,25,0.95)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 3, textAlign: 'center' }}>
          <LockIcon sx={{ color: '#c8a96e', fontSize: '2.5rem', mb: 2 }} />
          <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', color: '#f0e8d8', mb: 1 }}>Admin Panel</Typography>
          <Typography sx={{ color: '#9a8a72', fontSize: '0.85rem', mb: 3 }}>Enter your admin password to continue</Typography>
          <TextField fullWidth type="password" label="Password" value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} variant="outlined" size="small" sx={{ mb: 2 }} />
          {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>{error}</Alert>}
          <Button fullWidth variant="contained" onClick={handleLogin} disabled={loading || !pw}
            sx={{ background: '#c8a96e', color: '#080c0f', fontWeight: 700, '&:hover': { background: '#e8d5b0' } }}>
            {loading ? <CircularProgress size={20} /> : 'Enter'}
          </Button>
        </Card>
      </motion.div>
    </Box>
  )
}

// ── Image Drop Zone ───────────────────────────────────────────────────────────
function ImageDropZone({ preview, onFile, label = 'Click to select image', height = 160 }) {
  const ref = useRef()
  return (
    <>
      <Box onClick={() => ref.current?.click()} sx={{
        border: '2px dashed rgba(200,169,110,0.35)', borderRadius: 2, p: 2,
        textAlign: 'center', cursor: 'pointer', mb: 2, minHeight: height,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        transition: 'border-color 0.3s', '&:hover': { borderColor: '#c8a96e', background: 'rgba(200,169,110,0.04)' },
      }}>
        {preview
          ? <Box component="img" src={preview} sx={{ maxHeight: height - 20, maxWidth: '100%', borderRadius: 1 }} />
          : (<><ImageIcon sx={{ color: '#c8a96e', fontSize: '2.2rem', mb: 1 }} />
              <Typography sx={{ color: '#9a8a72', fontSize: '0.82rem' }}>{label}</Typography></>)}
      </Box>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) onFile(f) }} />
    </>
  )
}

// ── Upload Photo ──────────────────────────────────────────────────────────────
function PhotoUploader({ password, places, persons }) {
  const [placeId, setPlaceId] = useState('')
  const [placeSlug, setPlaceSlug] = useState('')
  const [personId, setPersonId] = useState('')
  const [isGroup, setIsGroup] = useState(false)
  const [caption, setCaption] = useState('')
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [placePhotos, setPlacePhotos] = useState([])
  const [loadingPhotos, setLoadingPhotos] = useState(false)

  const handlePlaceChange = async (id) => {
    setPlaceId(id)
    const found = places.find(p => p._id === id)
    setPlaceSlug(found?.slug || '')
    if (found?.slug) {
      setLoadingPhotos(true)
      try {
        const res = await getPlace(found.slug)
        const all = res.data
        const arr = []
        if (all.groupPhotos?.length) arr.push(...all.groupPhotos.map(p => ({ ...p, label: 'Group' })))
        Object.values(all.personPhotos || {}).forEach(pp =>
          pp.photos.forEach(ph => arr.push({ ...ph, label: pp.person?.name }))
        )
        setPlacePhotos(arr)
      } catch { }
      setLoadingPhotos(false)
    }
  }

  const handleUpload = async () => {
    if (!file || !placeId) return setMsg({ type: 'error', text: 'Select a place and photo.' })
    if (!isGroup && !personId) return setMsg({ type: 'error', text: 'Select a person or enable Group.' })
    setLoading(true); setMsg(null)
    try {
      const fd = new FormData()
      fd.append('photo', file)
      fd.append('placeId', placeId)
      fd.append('placeSlug', placeSlug)
      fd.append('isGroup', isGroup)
      if (!isGroup) fd.append('personId', personId)
      fd.append('caption', caption)
      await uploadPhoto(fd, password)
      setMsg({ type: 'success', text: 'Photo uploaded successfully!' })
      setFile(null); setPreview(null); setCaption('')
      handlePlaceChange(placeId)
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Upload failed' })
    } finally { setLoading(false) }
  }

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Delete this photo from DevLoad and database?')) return
    try {
      await deletePhoto(photoId, password)
      setPlacePhotos(prev => prev.filter(p => p._id !== photoId))
    } catch (err) { alert('Delete failed: ' + (err.response?.data?.error || err.message)) }
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={5}>
        <Typography sx={{ color: '#c8a96e', fontWeight: 600, mb: 2.5, fontSize: '0.88rem', letterSpacing: '0.08em' }}>UPLOAD NEW PHOTO</Typography>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Select Place *</InputLabel>
          <Select value={placeId} onChange={e => handlePlaceChange(e.target.value)} label="Select Place *">
            {places.map(p => <MenuItem key={p._id} value={p._id}>{p.name} {p.day ? `(Day ${p.day})` : ''}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControlLabel
          control={<Switch checked={isGroup} onChange={e => { setIsGroup(e.target.checked); setPersonId('') }}
            sx={{ '& .MuiSwitch-thumb': { background: '#c8a96e' }, '& .Mui-checked + .MuiSwitch-track': { background: 'rgba(200,169,110,0.4)' } }} />}
          label={<Typography sx={{ color: '#f0e8d8', fontSize: '0.88rem' }}>Group Photo</Typography>}
          sx={{ mb: 2, display: 'block' }}
        />

        {!isGroup && (
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Select Person *</InputLabel>
            <Select value={personId} onChange={e => setPersonId(e.target.value)} label="Select Person *">
              {persons.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
        )}

        <TextField fullWidth size="small" label="Caption (optional)" value={caption}
          onChange={e => setCaption(e.target.value)} sx={{ mb: 2 }} inputProps={{ autoComplete: 'off' }} />

        <ImageDropZone preview={preview} onFile={f => { setFile(f); setPreview(URL.createObjectURL(f)) }}
          label="Click to select photo" height={160} />

        {msg && <Alert severity={msg.type} sx={{ mb: 2, fontSize: '0.8rem' }}>{msg.text}</Alert>}

        <Button fullWidth variant="contained" onClick={handleUpload} disabled={loading || !file || !placeId}
          startIcon={loading ? null : <AddPhotoAlternateIcon />}
          sx={{ background: '#c8a96e', color: '#080c0f', fontWeight: 700, '&:hover': { background: '#e8d5b0' } }}>
          {loading ? <CircularProgress size={18} /> : 'Upload Photo'}
        </Button>
      </Grid>

      <Grid item xs={12} md={7}>
        <Typography sx={{ color: '#c8a96e', fontWeight: 600, mb: 2.5, fontSize: '0.88rem', letterSpacing: '0.08em' }}>
          PHOTOS AT SELECTED PLACE {placePhotos.length > 0 && `(${placePhotos.length})`}
        </Typography>
        {!placeId
          ? <Typography sx={{ color: '#4a3a2a', fontSize: '0.85rem' }}>← Select a place first</Typography>
          : loadingPhotos ? <CircularProgress size={24} sx={{ color: '#c8a96e' }} />
          : placePhotos.length === 0
          ? <Typography sx={{ color: '#4a3a2a', fontSize: '0.85rem' }}>No photos uploaded yet for this place.</Typography>
          : <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, maxHeight: 420, overflowY: 'auto', pr: 1 }}>
              {placePhotos.map(photo => (
                <Box key={photo._id} sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                  <Box component="img" src={photo.publicUrl} sx={{ width: 96, height: 96, objectFit: 'cover', display: 'block' }} />
                  <Chip label={photo.label} size="small"
                    sx={{ position: 'absolute', top: 3, left: 3, fontSize: '0.58rem', height: 16, background: 'rgba(0,0,0,0.75)', color: '#c8a96e', px: 0.3 }} />
                  <IconButton size="small" onClick={() => handleDeletePhoto(photo._id)}
                    sx={{ position: 'absolute', top: 2, right: 2, background: 'rgba(180,0,0,0.8)', color: '#fff', width: 20, height: 20, '&:hover': { background: 'red' } }}>
                    <DeleteIcon sx={{ fontSize: '0.7rem' }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
        }
      </Grid>
    </Grid>
  )
}

// ── Persons Manager ───────────────────────────────────────────────────────────
function PersonsManager({ password }) {
  const [persons, setPersons] = useState([])
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const avatarRef = useRef()

  useEffect(() => { load() }, [])
  const load = () => getPersons().then(res => setPersons(res.data)).catch(() => { })

  const handleCreate = async () => {
    if (!name.trim()) return setMsg({ type: 'error', text: 'Name is required' })
    setLoading(true); setMsg(null)
    try {
      const fd = new FormData()
      fd.append('name', name)
      fd.append('bio', bio)
      if (avatarFile) fd.append('avatar', avatarFile)
      await createPerson(fd, password)
      setName(''); setBio(''); setAvatarFile(null); setAvatarPreview(null)
      if (avatarRef.current) avatarRef.current.value = ''
      setMsg({ type: 'success', text: `${name} added successfully!` })
      load()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to add person' })
    } finally { setLoading(false) }
  }

  const handleDelete = async (person) => {
    if (!window.confirm(`Delete ${person.name}?\n\nThis will also delete:\n• Their profile photo\n• ALL their photos from every location\n\nThis cannot be undone.`)) return
    try {
      const res = await deletePerson(person._id, password)
      setPersons(prev => prev.filter(p => p._id !== person._id))
      alert(`${person.name} deleted. ${res.data.deletedPhotos} photos removed.`)
    } catch (err) { alert('Delete failed: ' + (err.response?.data?.error || err.message)) }
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={5}>
        <Typography sx={{ color: '#c8a96e', fontWeight: 600, mb: 2.5, fontSize: '0.88rem', letterSpacing: '0.08em' }}>ADD NEW PERSON</Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
          <Box>
            <Avatar src={avatarPreview} onClick={() => avatarRef.current?.click()}
              sx={{ width: 72, height: 72, cursor: 'pointer', border: '2px dashed rgba(200,169,110,0.4)',
                '&:hover': { borderColor: '#c8a96e', background: 'rgba(200,169,110,0.1)' },
                background: 'rgba(200,169,110,0.07)', color: '#c8a96e', fontSize: '1.8rem', transition: 'all 0.2s' }}>
              {!avatarPreview && '+'}
            </Avatar>
            <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files[0]; if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)) } }} />
            <Typography sx={{ color: '#9a8a72', fontSize: '0.7rem', mt: 0.5, textAlign: 'center' }}>Click avatar</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField fullWidth size="small" label="Full Name *" value={name} onChange={e => setName(e.target.value)}
              inputProps={{ autoComplete: 'off' }} sx={{ mb: 1.5 }} />
            <TextField fullWidth size="small" label="Bio / Role (optional)" value={bio} onChange={e => setBio(e.target.value)}
              inputProps={{ autoComplete: 'off' }} placeholder="e.g. Trip organizer" />
          </Box>
        </Box>

        {msg && <Alert severity={msg.type} sx={{ mb: 2, fontSize: '0.8rem' }}>{msg.text}</Alert>}

        <Button fullWidth variant="contained" startIcon={loading ? null : <PersonAddIcon />}
          onClick={handleCreate} disabled={loading || !name.trim()}
          sx={{ background: '#c8a96e', color: '#080c0f', fontWeight: 700, '&:hover': { background: '#e8d5b0' } }}>
          {loading ? <CircularProgress size={18} /> : 'Add Person'}
        </Button>
      </Grid>

      <Grid item xs={12} md={7}>
        <Typography sx={{ color: '#c8a96e', fontWeight: 600, mb: 2.5, fontSize: '0.88rem', letterSpacing: '0.08em' }}>
          ALL PERSONS ({persons.length}/5)
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {persons.map(p => (
            <Box key={p._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2,
              background: 'rgba(200,169,110,0.05)', border: '1px solid rgba(200,169,110,0.1)' }}>
              <Avatar src={p.avatar} sx={{ width: 46, height: 46, border: '1px solid rgba(200,169,110,0.3)', color: '#c8a96e', background: 'rgba(200,169,110,0.1)' }}>
                {p.name?.[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ color: '#f0e8d8', fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</Typography>
                {p.bio && <Typography sx={{ color: '#9a8a72', fontSize: '0.75rem' }}>{p.bio}</Typography>}
              </Box>
              <Tooltip title="Delete person + all their photos">
                <IconButton size="small" onClick={() => handleDelete(p)} sx={{ color: '#e57373', '&:hover': { background: 'rgba(229,115,115,0.1)' } }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
          {persons.length === 0 && <Typography sx={{ color: '#4a3a2a', fontSize: '0.85rem' }}>No persons added yet.</Typography>}
        </Box>
      </Grid>
    </Grid>
  )
}

// ── Places Manager ────────────────────────────────────────────────────────────
function PlacesManager({ password }) {
  const [places, setPlaces] = useState([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [day, setDay] = useState('')
  const [order, setOrder] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => { load() }, [])
  const load = () => getPlaces().then(r => setPlaces(r.data)).catch(() => { })

  const handleNameChange = (val) => {
    setName(val)
    if (!slugManual) setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  }

  const resetForm = () => {
    setName(''); setSlug(''); setDescription(''); setDay(''); setOrder('')
    setCoverFile(null); setCoverPreview(null); setSlugManual(false)
  }

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) return setMsg({ type: 'error', text: 'Name and slug are required' })
    setLoading(true); setMsg(null)
    try {
      const fd = new FormData()
      fd.append('name', name)
      fd.append('slug', slug)
      fd.append('description', description)
      fd.append('day', day)
      fd.append('order', order !== '' ? order : String(places.length + 1))
      if (coverFile) fd.append('coverImage', coverFile)
      await createPlace(fd, password)
      resetForm()
      setMsg({ type: 'success', text: 'Place created!' })
      load()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to create place' })
    } finally { setLoading(false) }
  }

  const handleDelete = async (place) => {
    if (!window.confirm(`Delete "${place.name}"?\n\nThis will permanently delete:\n• The place cover image\n• ALL photos at this location\n\nThis cannot be undone.`)) return
    try {
      const res = await deletePlace(place._id, password)
      setPlaces(prev => prev.filter(p => p._id !== place._id))
      alert(`"${place.name}" deleted. ${res.data.deletedPhotos} photos removed.`)
    } catch (err) { alert('Delete failed: ' + (err.response?.data?.error || err.message)) }
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={5}>
        <Typography sx={{ color: '#c8a96e', fontWeight: 600, mb: 2.5, fontSize: '0.88rem', letterSpacing: '0.08em' }}>ADD NEW PLACE</Typography>

        <TextField fullWidth size="small" label="Place Name *" value={name} onChange={e => handleNameChange(e.target.value)}
          placeholder="e.g. Sela Pass" inputProps={{ autoComplete: 'off' }} sx={{ mb: 2 }} />

        <TextField fullWidth size="small" label="Slug (auto-generated)" value={slug}
          onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
          helperText="Used in URL → /place/sela-pass" inputProps={{ autoComplete: 'off' }} sx={{ mb: 2 }} />

        <TextField fullWidth size="small" label="Description" value={description}
          onChange={e => setDescription(e.target.value)} multiline rows={2}
          inputProps={{ autoComplete: 'off' }} sx={{ mb: 2 }} />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Day (1–5)" value={day} onChange={e => setDay(e.target.value)}
              type="number" inputProps={{ min: 1, max: 5, autoComplete: 'off' }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label={`Order (auto: ${places.length + 1})`} value={order}
              onChange={e => setOrder(e.target.value)} type="number" inputProps={{ min: 1, autoComplete: 'off' }} />
          </Grid>
        </Grid>

        <Typography sx={{ color: '#9a8a72', fontSize: '0.78rem', mb: 1 }}>Cover Image (optional)</Typography>
        <ImageDropZone preview={coverPreview} onFile={f => { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)) }}
          label="Click to upload cover image" height={120} />

        {msg && <Alert severity={msg.type} sx={{ mb: 2, fontSize: '0.8rem' }}>{msg.text}</Alert>}

        <Button fullWidth variant="contained" startIcon={loading ? null : <AddLocationAltIcon />}
          onClick={handleCreate} disabled={loading || !name.trim() || !slug.trim()}
          sx={{ background: '#c8a96e', color: '#080c0f', fontWeight: 700, '&:hover': { background: '#e8d5b0' } }}>
          {loading ? <CircularProgress size={18} /> : 'Add Place'}
        </Button>
      </Grid>

      <Grid item xs={12} md={7}>
        <Typography sx={{ color: '#c8a96e', fontWeight: 600, mb: 2.5, fontSize: '0.88rem', letterSpacing: '0.08em' }}>
          ALL PLACES ({places.length})
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 480, overflowY: 'auto', pr: 0.5 }}>
          {places.map(p => (
            <Box key={p._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2,
              background: 'rgba(200,169,110,0.05)', border: '1px solid rgba(200,169,110,0.1)' }}>
              {/* Cover thumbnail */}
              <Box sx={{ width: 52, height: 42, borderRadius: 1, overflow: 'hidden', flexShrink: 0,
                background: 'rgba(200,169,110,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.coverImage
                  ? <Box component="img" src={p.coverImage} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <ImageIcon sx={{ color: 'rgba(200,169,110,0.3)', fontSize: '1.2rem' }} />}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography sx={{ color: '#f0e8d8', fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</Typography>
                  {p.day && <Chip label={`Day ${p.day}`} size="small" sx={{ height: 17, fontSize: '0.62rem', color: '#c8a96e', background: 'rgba(200,169,110,0.12)' }} />}
                </Box>
                <Typography sx={{ color: '#9a8a72', fontSize: '0.72rem' }}>/{p.slug}</Typography>
              </Box>
              <Tooltip title="Delete place + all its photos">
                <IconButton size="small" onClick={() => handleDelete(p)} sx={{ color: '#e57373', '&:hover': { background: 'rgba(229,115,115,0.1)' } }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
          {places.length === 0 && <Typography sx={{ color: '#4a3a2a', fontSize: '0.85rem' }}>No places yet. Click "Seed Tawang Data" to load all locations.</Typography>}
        </Box>
      </Grid>
    </Grid>
  )
}

// ── Main Admin Page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [password, setPassword] = useState(null)
  const [tab, setTab] = useState(0)
  const [places, setPlaces] = useState([])
  const [persons, setPersons] = useState([])
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState(null)

  useEffect(() => {
    if (password) {
      getPlaces().then(r => setPlaces(r.data)).catch(() => { })
      getPersons().then(r => setPersons(r.data)).catch(() => { })
    }
  }, [password, tab])

  const handleSeed = async () => {
    setSeeding(true); setSeedMsg(null)
    try {
      const res = await seedData(password)
      setSeedMsg({ type: res.data.skipped ? 'info' : 'success', text: res.data.message })
      getPlaces().then(r => setPlaces(r.data))
    } catch (err) {
      setSeedMsg({ type: 'error', text: err.response?.data?.error || 'Seed failed' })
    } finally { setSeeding(false) }
  }

  if (!password) return <LoginScreen onLogin={setPassword} />

  return (
    <Box sx={{ background: '#080c0f', minHeight: '100vh', pt: 10, pb: 10 }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif', color: '#f0e8d8' }}>Admin Panel</Typography>
              <Typography sx={{ color: '#9a8a72', fontSize: '0.85rem' }}>Manage your Tawang memories</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {seedMsg && <Alert severity={seedMsg.type} sx={{ fontSize: '0.78rem', py: 0.2 }}>{seedMsg.text}</Alert>}
              <Button startIcon={<SeedIcon />} onClick={handleSeed} disabled={seeding} variant="outlined" size="small"
                sx={{ borderColor: '#c8a96e', color: '#c8a96e', '&:hover': { borderColor: '#e8d5b0', background: 'rgba(200,169,110,0.08)' } }}>
                {seeding ? 'Seeding…' : 'Seed Tawang Data'}
              </Button>
            </Box>
          </Box>

          <Box sx={{ borderBottom: '1px solid rgba(200,169,110,0.15)', mb: 4 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}
              TabIndicatorProps={{ sx: { background: '#c8a96e' } }}
              sx={{ '& .MuiTab-root': { color: '#9a8a72', textTransform: 'none', fontWeight: 500 }, '& .Mui-selected': { color: '#c8a96e !important' } }}>
              <Tab label="Upload Photos" />
              <Tab label="Manage Persons" />
              <Tab label="Manage Places" />
            </Tabs>
          </Box>

          <Card sx={{ p: { xs: 2.5, md: 4 }, background: 'rgba(15,21,25,0.9)', border: '1px solid rgba(200,169,110,0.1)', borderRadius: 3 }}>
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                {tab === 0 && <PhotoUploader password={password} places={places} persons={persons} />}
                {tab === 1 && <PersonsManager password={password} />}
                {tab === 2 && <PlacesManager password={password} />}
              </motion.div>
            </AnimatePresence>
          </Card>
        </motion.div>
      </Container>
    </Box>
  )
}
