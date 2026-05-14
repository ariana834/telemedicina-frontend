import axios from 'axios'

// URL-ul backend-ului tău Spring Boot
const API = 'http://localhost:8084'

// POST /api/v1/auth/login
export const loginRequest = (email, password) =>
    axios.post(`${API}/api/v1/auth/login`, { email, password })

// POST /api/v1/auth/register
export const registerRequest = (data) =>
    axios.post(`${API}/api/v1/auth/register`, data)