import axios from 'axios'

const api = axios.create({
  baseURL: 'https://tawangmemories-backend.deployhub.online/api'
});

export const getPlaces = () => api.get('/places')
export const getPlace = (slug) => api.get(`/places/${slug}`)
export const getPersonPhotos = (slug, personId) => api.get(`/places/${slug}/person/${personId}`)
export const getGroupPhotos = (slug) => api.get(`/places/${slug}/group`)
export const getPersons = () => api.get('/admin/persons')

// Admin
export const verifyAdmin = (password) =>
  api.post('/admin/verify', {}, { headers: { 'x-admin-password': password } })

export const seedData = (password) =>
  api.post('/admin/seed', {}, { headers: { 'x-admin-password': password } })

export const createPerson = (formData, password) =>
  api.post('/admin/persons', formData, {
    headers: { 'x-admin-password': password, 'Content-Type': 'multipart/form-data' }
  })

export const updatePerson = (id, formData, password) =>
  api.put(`/admin/persons/${id}`, formData, {
    headers: { 'x-admin-password': password, 'Content-Type': 'multipart/form-data' }
  })

export const deletePerson = (id, password) =>
  api.delete(`/admin/persons/${id}`, { headers: { 'x-admin-password': password } })

export const createPlace = (formData, password) =>
  api.post('/places', formData, {
    headers: { 'x-admin-password': password, 'Content-Type': 'multipart/form-data' }
  })

export const updatePlace = (id, formData, password) =>
  api.put(`/places/${id}`, formData, {
    headers: { 'x-admin-password': password, 'Content-Type': 'multipart/form-data' }
  })

export const deletePlace = (id, password) =>
  api.delete(`/places/${id}`, { headers: { 'x-admin-password': password } })

export const uploadPhoto = (formData, password) =>
  api.post('/photos/upload', formData, {
    headers: { 'x-admin-password': password, 'Content-Type': 'multipart/form-data' }
  })

export const deletePhoto = (id, password) =>
  api.delete(`/photos/${id}`, { headers: { 'x-admin-password': password } })
