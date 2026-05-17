import axios from 'axios'
import { API } from './auth'

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

export const getProfile = (token) =>
    axios.get(`${API}/api/v1/patients/profile`, authHeader(token))

export const createProfile = (token, data) =>
    axios.post(`${API}/api/v1/patients/profile`, data, authHeader(token))

export const updateProfile = (token, data) =>
    axios.put(`${API}/api/v1/patients/profile`, data, authHeader(token))