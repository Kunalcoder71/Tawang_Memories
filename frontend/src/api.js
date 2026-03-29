import axios from 'axios'

const api = axios.create({ baseURL: 'https://tawangmemories-backend.deployhub.online' })
const auth = (pw) => ({ 'x-admin-password': pw })

// Places
export const getPlaces = () => api.get('/places')
export const getPlace = (slug) => api.get(`/places/${slug}`)
export const getPersonPhotos = (slug, personId) => api.get(`/places/${slug}/person/${personId}`)
export const getGroupPhotos = (slug) => api.get(`/places/${slug}/group`)

// Persons
export const getPersonsByPlace = (slug) => api.get(`/persons/place/${slug}`)

// Stats
export const getStats = () => api.get('/stats')

// Admin auth
export const verifyAdmin = (pw) => api.post('/admin/verify', {}, { headers: auth(pw) })

// Admin — places
export const createPlace = (fd, pw) => api.post('/places', fd, { headers: { ...auth(pw), 'Content-Type': 'multipart/form-data' } })
export const updatePlace = (id, fd, pw) => api.put(`/places/${id}`, fd, { headers: { ...auth(pw), 'Content-Type': 'multipart/form-data' } })
export const deletePlace = (id, pw) => api.delete(`/places/${id}`, { headers: auth(pw) })

// Admin — persons
export const createPerson = (fd, pw) => api.post('/persons', fd, { headers: { ...auth(pw), 'Content-Type': 'multipart/form-data' } })
export const deletePerson = (id, pw) => api.delete(`/persons/${id}`, { headers: auth(pw) })

// Admin — photos
export const uploadPhoto = (fd, pw) => api.post('/photos/upload', fd, { headers: { ...auth(pw), 'Content-Type': 'multipart/form-data' } })
export const deletePhoto = (id, pw) => api.delete(`/photos/${id}`, { headers: auth(pw) })

// Download zip
export const downloadPlacePhotos = (slug) => window.open(`/api/photos/download/${slug}`, '_blank')
