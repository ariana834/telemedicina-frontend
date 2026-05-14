import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Dacă ai token în localStorage = ești logat = intri
// Dacă nu ai token = ești redirecționat la /login
export default function ProtectedRoute({ children }) {
    const { token } = useAuth()
    return token ? children : <Navigate to="/login" replace />
}