import { createContext, useContext, useState, useEffect } from "react"
import { getProfile } from "../api/patient"

const AuthContext = createContext(null)

function decodeJwt(token) {
    try {
        const payload = token.split('.')[1]
        return JSON.parse(atob(payload))
    } catch {
        return {}
    }
}

export function AuthProvider({ children }) {
    const [token,   setToken]   = useState(localStorage.getItem("token"))
    const [user,    setUser]    = useState(JSON.parse(localStorage.getItem("user")))
    const [profile, setProfile] = useState(null)

    const decoded = token ? decodeJwt(token) : {}
    const email   = decoded.sub || null
    const role    = user?.role || decoded.role || null

    useEffect(() => {
        if (!token || role === 'DOCTOR') return
        getProfile(token)
            .then(res => setProfile(res.data))
            .catch(() => setProfile(null))
    }, [token])

    const refreshProfile = () => {
        if (!token || role === 'DOCTOR') return
        getProfile(token)
            .then(res => setProfile(res.data))
            .catch(() => setProfile(null))
    }

    const login = (tokenValue, userData) => {
        localStorage.setItem("token", tokenValue)
        localStorage.setItem("user", JSON.stringify(userData))
        setToken(tokenValue)
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setToken(null)
        setUser(null)
        setProfile(null)
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout, profile, email, role, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}