import axios from 'axios'
import { API } from './auth'

export const getDoctors = (token) =>
    axios.get(`${API}/api/v1/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
    })