import React, { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, Container, TextField, Button, Card, Tab, Tabs,
  Avatar, IconButton, Grid, Select, MenuItem, FormControl, InputLabel,
  Switch, FormControlLabel, CircularProgress, Alert, Chip, Tooltip, Divider
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import {
  verifyAdmin, getPlaces, createPlace, deletePlace,
  createPerson, deletePerson, getPersonsByPlace,
  uploadPhoto, deletePhoto, getPlace, downloadPlacePhotos
} from '../api.js'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt'
import LockIcon from '@mui/icons-material/Lock'
import ImageIcon from '@mui/icons-material/Image'
import DownloadIcon from '@mui/icons-material/Download'
import PlaceIcon from '@mui/icons-material/Place'

// 👇 New imports for date picker
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'

// ── Login ──────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState(''), [error, setError] = useState(''), [loading, setLoading] = useState(false)
  const handle = async () => {
    setLoading(true); setError('')
    try { await verifyAdmin(pw); onLogin(pw) }
    catch { setError('Invalid password') }
    finally { setLoading(false) }
  }
  return (
    <Box sx={{ minHeight: '100vh', background: '#0b0f0e', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 8 }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <Card sx={{ p: 5, minWidth: 360, background: 'rgba(17,24,22,0.95)', border: '1px solid rgba(95,180,156,0.2)', borderRadius: 3, textAlign: 'center' }}>
          <LockIcon sx={{ color: '#5fb49c', fontSize: '2.5rem', mb: 2 }} />
          <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', color: '#e8f0ec', mb: 1 }}>Admin Panel</Typography>
          <Typography sx={{ color: '#7a9e90', fontSize: '0.84rem', mb: 3 }}>Enter password to continue</Typography>
          <TextField fullWidth type="password" label="Password" value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()} size="small" sx={{ mb: 2 }} />
          {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>{error}</Alert>}
          <Button fullWidth variant="contained" onClick={handle} disabled={loading || !pw}
            sx={{ background: '#5fb49c', color: '#0b0f0e', fontWeight: 700, '&:hover': { background: '#a8d5c2' } }}>
            {loading ? <CircularProgress size={20} /> : 'Enter'}
          </Button>
        </Card>
      </motion.div>
    </Box>
  )
}

// ── Image Drop Zone ────────────────────────────────────────────────────────
function ImageDropZone({ preview, onFile, label = 'Click to select image', height = 140 }) {
  const ref = useRef()
  return (
    <>
      <Box onClick={() => ref.current?.click()} sx={{
        border: '2px dashed rgba(95,180,156,0.3)', borderRadius: 2, p: 2, textAlign: 'center',
        cursor: 'pointer', mb: 2, minHeight: height, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        transition: 'all 0.3s', '&:hover': { borderColor: '#5fb49c', background: 'rgba(95,180,156,0.04)' },
      }}>
        {preview
          ? <Box component="img" src={preview} sx={{ maxHeight: height - 20, maxWidth: '100%', borderRadius: 1 }} />
          : <><ImageIcon sx={{ color: '#5fb49c', fontSize: '2rem', mb: 1 }} /><Typography sx={{ color: '#7a9e90', fontSize: '0.8rem' }}>{label}</Typography></>}
      </Box>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files[0]; if (f) onFile(f) }} />
    </>
  )
}

// ── Photo Uploader ─────────────────────────────────────────────────────────
function PhotoUploader({ password, places }) {
  const [placeId, setPlaceId] = useState(''), [placeSlug, setPlaceSlug] = useState('')
  const [personId, setPersonId] = useState(''), [isGroup, setIsGroup] = useState(false)
  const [caption, setCaption] = useState(''), [file, setFile] = useState(null), [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false), [msg, setMsg] = useState(null)
  const [placePhotos, setPlacePhotos] = useState([]), [persons, setPersons] = useState([])
  const [loadingPhotos, setLoadingPhotos] = useState(false)

  const handlePlaceChange = async (id) => {
    setPlaceId(id); setPersonId('')
    const found = places.find(p => p._id === id)
    setPlaceSlug(found?.slug || '')
    if (found?.slug) {
      setLoadingPhotos(true)
      try {
        const [placeRes, personsRes] = await Promise.all([getPlace(found.slug), getPersonsByPlace(found.slug)])
        const all = placeRes.data
        const arr = []
        if (all.groupPhotos?.length) arr.push(...all.groupPhotos.map(p => ({ ...p, label: 'Group' })))
        Object.values(all.personPhotos || {}).forEach(pp => pp.photos.forEach(ph => arr.push({ ...ph, label: pp.person?.name })))
        setPlacePhotos(arr)
        setPersons(personsRes.data)
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
      fd.append('photo', file); fd.append('placeId', placeId); fd.append('placeSlug', placeSlug)
      fd.append('isGroup', isGroup); if (!isGroup) fd.append('personId', personId); fd.append('caption', caption)
      await uploadPhoto(fd, password)
      setMsg({ type: 'success', text: 'Photo uploaded!' })
      setFile(null); setPreview(null); setCaption('')
      handlePlaceChange(placeId)
    } catch (err) { setMsg({ type: 'error', text: err.response?.data?.error || 'Upload failed' }) }
    finally { setLoading(false) }
  }

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Delete this photo?')) return
    try { await deletePhoto(photoId, password); setPlacePhotos(prev => prev.filter(p => p._id !== photoId)) }
    catch (err) { alert('Delete failed: ' + (err.response?.data?.error || err.message)) }
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={5}>
        <Typography sx={{ color: '#5fb49c', fontWeight: 600, mb: 2.5, fontSize: '0.85rem', letterSpacing: '0.1em' }}>UPLOAD PHOTO</Typography>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Select Place *</InputLabel>
          <Select value={placeId} onChange={e => handlePlaceChange(e.target.value)} label="Select Place *">
            {places.map(p => <MenuItem key={p._id} value={p._id}>{p.name} {p.date ? `· ${p.date}` : ''}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControlLabel
          control={<Switch checked={isGroup} onChange={e => { setIsGroup(e.target.checked); setPersonId('') }} />}
          label={<Typography sx={{ color: '#e8f0ec', fontSize: '0.86rem' }}>Group Photo</Typography>}
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

        <ImageDropZone preview={preview} onFile={f => { setFile(f); setPreview(URL.createObjectURL(f)) }} label="Click to select photo" />

        {msg && <Alert severity={msg.type} sx={{ mb: 2, fontSize: '0.78rem' }}>{msg.text}</Alert>}
        <Button fullWidth variant="contained" onClick={handleUpload} disabled={loading || !file || !placeId}
          startIcon={loading ? null : <AddPhotoAlternateIcon />}
          sx={{ background: '#5fb49c', color: '#0b0f0e', fontWeight: 700, '&:hover': { background: '#a8d5c2' } }}>
          {loading ? <CircularProgress size={18} /> : 'Upload Photo'}
        </Button>
      </Grid>

      <Grid item xs={12} md={7}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography sx={{ color: '#5fb49c', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.1em' }}>
            PHOTOS {placePhotos.length > 0 && `(${placePhotos.length})`}
          </Typography>
          {placeId && placePhotos.length > 0 && (
            <Button size="small" startIcon={<DownloadIcon />} onClick={() => downloadPlacePhotos(placeSlug)}
              sx={{ color: '#5fb49c', fontSize: '0.75rem', border: '1px solid rgba(95,180,156,0.3)', '&:hover': { background: 'rgba(95,180,156,0.08)' } }}>
              Download ZIP
            </Button>
          )}
        </Box>

        {!placeId ? <Typography sx={{ color: '#2a4a3e', fontSize: '0.84rem' }}>← Select a place first</Typography>
          : loadingPhotos ? <CircularProgress size={22} sx={{ color: '#5fb49c' }} />
          : placePhotos.length === 0 ? <Typography sx={{ color: '#2a4a3e', fontSize: '0.84rem' }}>No photos yet.</Typography>
          : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, maxHeight: 420, overflowY: 'auto' }}>
              {placePhotos.map(photo => (
                <Box key={photo._id} sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                  <Box component="img" src={photo.publicUrl} sx={{ width: 92, height: 92, objectFit: 'cover', display: 'block' }} />
                  <Chip label={photo.label} size="small"
                    sx={{ position: 'absolute', top: 3, left: 3, fontSize: '0.58rem', height: 16, background: 'rgba(0,0,0,0.75)', color: '#5fb49c', px: 0.3 }} />
                  <IconButton size="small" onClick={() => handleDeletePhoto(photo._id)}
                    sx={{ position: 'absolute', top: 2, right: 2, background: 'rgba(180,0,0,0.8)', color: '#fff', width: 20, height: 20, '&:hover': { background: 'red' } }}>
                    <DeleteIcon sx={{ fontSize: '0.68rem' }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
      </Grid>
    </Grid>
  )
}

// ── Persons Manager ────────────────────────────────────────────────────────
function PersonsManager({ password, places }) {
  const [placeId, setPlaceId] = useState(''), [placeSlug, setPlaceSlug] = useState('')
  const [name, setName] = useState(''), [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState(null), [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false), [msg, setMsg] = useState(null)
  const [persons, setPersons] = useState([])
  const avatarRef = useRef()

  const handlePlaceChange = async (id) => {
    setPlaceId(id)
    const found = places.find(p => p._id === id)
    setPlaceSlug(found?.slug || '')
    if (found?.slug) {
      const res = await getPersonsByPlace(found.slug).catch(() => ({ data: [] }))
      setPersons(res.data)
    }
  }

  const handleCreate = async () => {
    if (!name.trim()) return setMsg({ type: 'error', text: 'Name required' })
    if (!placeId) return setMsg({ type: 'error', text: 'Select a place' })
    setLoading(true); setMsg(null)
    try {
      const fd = new FormData()
      fd.append('name', name); fd.append('bio', bio)
      fd.append('placeId', placeId); fd.append('placeSlug', placeSlug)
      if (avatarFile) fd.append('avatar', avatarFile)
      const res = await createPerson(fd, password)
      setPersons(prev => [...prev, res.data])
      setName(''); setBio(''); setAvatarFile(null); setAvatarPreview(null)
      if (avatarRef.current) avatarRef.current.value = ''
      setMsg({ type: 'success', text: `${name} added!` })
    } catch (err) { setMsg({ type: 'error', text: err.response?.data?.error || 'Error' }) }
    finally { setLoading(false) }
  }

  const handleDelete = async (person) => {
    if (!window.confirm(`Delete ${person.name}?\nThis will also delete all their photos at this place.`)) return
    try {
      const res = await deletePerson(person._id, password)
      setPersons(prev => prev.filter(p => p._id !== person._id))
      alert(`${person.name} deleted. ${res.data.deletedPhotos} photos removed.`)
    } catch (err) { alert('Delete failed: ' + (err.response?.data?.error || err.message)) }
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={5}>
        <Typography sx={{ color: '#5fb49c', fontWeight: 600, mb: 2.5, fontSize: '0.85rem', letterSpacing: '0.1em' }}>ADD PERSON TO PLACE</Typography>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Select Place *</InputLabel>
          <Select value={placeId} onChange={e => handlePlaceChange(e.target.value)} label="Select Place *">
            {places.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
          <Box>
            <Avatar src={avatarPreview} onClick={() => avatarRef.current?.click()}
              sx={{ width: 68, height: 68, cursor: 'pointer', border: '2px dashed rgba(95,180,156,0.4)', '&:hover': { borderColor: '#5fb49c' }, background: 'rgba(95,180,156,0.07)', color: '#5fb49c', fontSize: '1.6rem' }}>
              {!avatarPreview && '+'}
            </Avatar>
            <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files[0]; if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)) } }} />
            <Typography sx={{ color: '#4a6e60', fontSize: '0.68rem', mt: 0.5, textAlign: 'center' }}>Avatar</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField fullWidth size="small" label="Full Name *" value={name} onChange={e => setName(e.target.value)} sx={{ mb: 1.5 }} inputProps={{ autoComplete: 'off' }} />
            <TextField fullWidth size="small" label="Bio / Role" value={bio} onChange={e => setBio(e.target.value)} inputProps={{ autoComplete: 'off' }} />
          </Box>
        </Box>

        {msg && <Alert severity={msg.type} sx={{ mb: 2, fontSize: '0.78rem' }}>{msg.text}</Alert>}
        <Button fullWidth variant="contained" startIcon={loading ? null : <PersonAddIcon />} onClick={handleCreate} disabled={loading || !name.trim() || !placeId}
          sx={{ background: '#5fb49c', color: '#0b0f0e', fontWeight: 700, '&:hover': { background: '#a8d5c2' } }}>
          {loading ? <CircularProgress size={18} /> : 'Add Person'}
        </Button>
      </Grid>

      <Grid item xs={12} md={7}>
        <Typography sx={{ color: '#5fb49c', fontWeight: 600, mb: 2.5, fontSize: '0.85rem', letterSpacing: '0.1em' }}>
          PERSONS AT SELECTED PLACE {persons.length > 0 && `(${persons.length})`}
        </Typography>
        {!placeId ? <Typography sx={{ color: '#2a4a3e', fontSize: '0.84rem' }}>← Select a place first</Typography>
          : persons.length === 0 ? <Typography sx={{ color: '#2a4a3e', fontSize: '0.84rem' }}>No persons at this place yet.</Typography>
          : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {persons.map(p => (
                <Box key={p._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, background: 'rgba(95,180,156,0.05)', border: '1px solid rgba(95,180,156,0.1)' }}>
                  <Avatar src={p.avatar} sx={{ width: 44, height: 44, border: '1px solid rgba(95,180,156,0.3)', color: '#5fb49c', background: 'rgba(95,180,156,0.08)' }}>
                    {p.name?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: '#e8f0ec', fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</Typography>
                    {p.bio && <Typography sx={{ color: '#7a9e90', fontSize: '0.74rem' }}>{p.bio}</Typography>}
                  </Box>
                  <Tooltip title="Delete person + all their photos">
                    <IconButton size="small" onClick={() => handleDelete(p)} sx={{ color: '#e57373' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          )}
      </Grid>
    </Grid>
  )
}

// ── Places Manager ─────────────────────────────────────────────────────────
function PlacesManager({ password, places, reload }) {
  const [name, setName] = useState(''), [slug, setSlug] = useState(''), [slugManual, setSlugManual] = useState(false)
  const [location, setLocation] = useState(''), [date, setDate] = useState(''), [description, setDescription] = useState('')
  const [coverFile, setCoverFile] = useState(null), [coverPreview, setCoverPreview] = useState(null)
  const [loading, setLoading] = useState(false), [msg, setMsg] = useState(null)

  const handleNameChange = (v) => {
    setName(v)
    if (!slugManual) setSlug(v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  }

  const reset = () => { setName(''); setSlug(''); setLocation(''); setDate(''); setDescription(''); setCoverFile(null); setCoverPreview(null); setSlugManual(false) }

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) return setMsg({ type: 'error', text: 'Name and slug required' })
    setLoading(true); setMsg(null)
    try {
      const fd = new FormData()
      fd.append('name', name); fd.append('slug', slug); fd.append('location', location)
      fd.append('date', date); fd.append('description', description)
      if (coverFile) fd.append('coverImage', coverFile)
      await createPlace(fd, password)
      reset(); setMsg({ type: 'success', text: 'Place created!' }); reload()
    } catch (err) { setMsg({ type: 'error', text: err.response?.data?.error || 'Error' }) }
    finally { setLoading(false) }
  }

  const handleDelete = async (place) => {
    if (!window.confirm(`Delete "${place.name}"?\n\nThis will delete:\n• Cover image\n• ALL persons at this place\n• ALL photos at this place\n\nCannot be undone.`)) return
    try {
      const res = await deletePlace(place._id, password)
      alert(`Deleted "${place.name}". ${res.data.deletedPersons} persons, ${res.data.deletedPhotos} photos removed.`)
      reload()
    } catch (err) { alert('Delete failed: ' + (err.response?.data?.error || err.message)) }
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={5}>
        <Typography sx={{ color: '#5fb49c', fontWeight: 600, mb: 2.5, fontSize: '0.85rem', letterSpacing: '0.1em' }}>ADD NEW PLACE</Typography>

        <TextField fullWidth size="small" label="Place Name *" value={name} onChange={e => handleNameChange(e.target.value)} sx={{ mb: 2 }} inputProps={{ autoComplete: 'off' }} />
        <TextField fullWidth size="small" label="Slug (auto)" value={slug} onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
          helperText="URL: /place/my-place-name" sx={{ mb: 2 }} inputProps={{ autoComplete: 'off' }} />
        <TextField fullWidth size="small" label="Location (e.g. Manali, HP)" value={location} onChange={e => setLocation(e.target.value)} sx={{ mb: 2 }} inputProps={{ autoComplete: 'off' }} />

        {/* 👇 REPLACED basic TextField with beautiful DatePicker */}
        <DatePicker
          label="Date"
          value={date ? dayjs(date) : null}
          onChange={(newValue) => setDate(newValue ? newValue.format('YYYY-MM-DD') : '')}
          slotProps={{
            textField: {
              fullWidth: true,
              size: 'small',
              sx: { mb: 2 }
            }
          }}
        />

        <TextField fullWidth size="small" label="Description" value={description} onChange={e => setDescription(e.target.value)} multiline rows={2} sx={{ mb: 2 }} inputProps={{ autoComplete: 'off' }} />

        <Typography sx={{ color: '#7a9e90', fontSize: '0.76rem', mb: 1 }}>Cover Image (optional)</Typography>
        <ImageDropZone preview={coverPreview} onFile={f => { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)) }} label="Cover photo" height={110} />

        {msg && <Alert severity={msg.type} sx={{ mb: 2, fontSize: '0.78rem' }}>{msg.text}</Alert>}
        <Button fullWidth variant="contained" startIcon={loading ? null : <AddLocationAltIcon />} onClick={handleCreate} disabled={loading || !name.trim() || !slug.trim()}
          sx={{ background: '#5fb49c', color: '#0b0f0e', fontWeight: 700, '&:hover': { background: '#a8d5c2' } }}>
          {loading ? <CircularProgress size={18} /> : 'Add Place'}
        </Button>
      </Grid>

      <Grid item xs={12} md={7}>
        <Typography sx={{ color: '#5fb49c', fontWeight: 600, mb: 2.5, fontSize: '0.85rem', letterSpacing: '0.1em' }}>ALL PLACES ({places.length})</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 500, overflowY: 'auto' }}>
          {places.map(p => (
            <Box key={p._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, background: 'rgba(95,180,156,0.05)', border: '1px solid rgba(95,180,156,0.1)' }}>
              <Box sx={{ width: 52, height: 42, borderRadius: 1, overflow: 'hidden', flexShrink: 0, background: 'rgba(95,180,156,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.coverImage
                  ? <Box component="img" src={p.coverImage} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <PlaceIcon sx={{ color: 'rgba(95,180,156,0.3)', fontSize: '1.2rem' }} />}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: '#e8f0ec', fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</Typography>
                <Typography sx={{ color: '#7a9e90', fontSize: '0.72rem' }}>
                  {p.location && `${p.location} · `}{p.date || ''} · /{p.slug}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.8, mt: 0.5 }}>
                  {p.photoCount > 0 && <Chip label={`${p.photoCount} photos`} size="small" sx={{ height: 16, fontSize: '0.6rem', color: '#5fb49c', background: 'rgba(95,180,156,0.1)' }} />}
                  {p.personCount > 0 && <Chip label={`${p.personCount} people`} size="small" sx={{ height: 16, fontSize: '0.6rem', color: '#5fb49c', background: 'rgba(95,180,156,0.1)' }} />}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {p.photoCount > 0 && (
                  <Tooltip title="Download photos ZIP">
                    <IconButton size="small" onClick={() => downloadPlacePhotos(p.slug)} sx={{ color: '#5fb49c' }}>
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Delete place + all persons + all photos">
                  <IconButton size="small" onClick={() => handleDelete(p)} sx={{ color: '#e57373' }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
          {places.length === 0 && <Typography sx={{ color: '#2a4a3e', fontSize: '0.84rem' }}>No places yet. Add your first one!</Typography>}
        </Box>
      </Grid>
    </Grid>
  )
}

// ── Main Admin ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [password, setPassword] = useState(null)
  const [tab, setTab] = useState(0)
  const [places, setPlaces] = useState([])

  const loadPlaces = () => { if (password) getPlaces().then(r => setPlaces(r.data)).catch(() => { }) }

  useEffect(() => { loadPlaces() }, [password, tab])

  if (!password) return <LoginScreen onLogin={setPassword} />

  // 👇 Wrapped with LocalizationProvider for DatePicker to work
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ background: '#0b0f0e', minHeight: '100vh', pt: 10, pb: 10 }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontFamily: '"Cormorant Garamond", serif', color: '#e8f0ec' }}>Admin Panel</Typography>
              <Typography sx={{ color: '#7a9e90', fontSize: '0.84rem' }}>Manage your travel journal</Typography>
            </Box>

            <Box sx={{ borderBottom: '1px solid rgba(95,180,156,0.12)', mb: 4 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)}
                TabIndicatorProps={{ sx: { background: '#5fb49c' } }}
                sx={{ '& .MuiTab-root': { color: '#7a9e90', textTransform: 'none', fontWeight: 500 }, '& .Mui-selected': { color: '#5fb49c !important' } }}>
                <Tab label="Upload Photos" />
                <Tab label="Manage Persons" />
                <Tab label="Manage Places" />
              </Tabs>
            </Box>

            <Card sx={{ p: { xs: 2.5, md: 4 }, background: 'rgba(17,24,22,0.9)', border: '1px solid rgba(95,180,156,0.1)', borderRadius: 3 }}>
              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  {tab === 0 && <PhotoUploader password={password} places={places} />}
                  {tab === 1 && <PersonsManager password={password} places={places} />}
                  {tab === 2 && <PlacesManager password={password} places={places} reload={loadPlaces} />}
                </motion.div>
              </AnimatePresence>
            </Card>
          </motion.div>
        </Container>
      </Box>
    </LocalizationProvider>
  )
}