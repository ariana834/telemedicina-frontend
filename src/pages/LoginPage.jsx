import { useState } from 'react'
import { Box, Typography, TextField, Button, Link, Alert, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginRequest } from '../api/auth'

// Panoul stâng maro — același pe ambele pagini
function BrandPanel() {
    return (
        <Box sx={{
            flex: 1,
            backgroundColor: '#8B7355',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 6,
            // Pe mobil dispare, rămâne doar formularul
            display: { xs: 'none', md: 'flex' },
        }}>
            {/* Cerc cu iconiță */}
            <Box sx={{
                width: 72, height: 72,
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mb: 3,
            }}>
                <Typography sx={{ fontSize: 32 }}>🩺</Typography>
            </Box>

            <Typography sx={{
                color: 'rgba(255,255,255,0.95)',
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '2rem', fontWeight: 600, mb: 2,
            }}>
                Telemedicină
            </Typography>

            <Typography sx={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: '0.95rem',
                textAlign: 'center',
                lineHeight: 1.8,
                maxWidth: 220,
            }}>
                Sănătatea ta,<br />la un click distanță
            </Typography>

            {/* Linie decorativă */}
            <Box sx={{
                width: 40, height: 2,
                backgroundColor: 'rgba(255,255,255,0.3)',
                mt: 4,
            }} />
        </Box>
    )
}

export default function LoginPage() {
    const [email, setEmail]       = useState('')
    const [password, setPassword] = useState('')
    const [error, setError]       = useState('')
    const [loading, setLoading]   = useState(false)

    const { login } = useAuth()
    const navigate  = useNavigate()

    const handleSubmit = async () => {
        setError('')
        setLoading(true)
        try {
            const res = await loginRequest(email, password)
            login(res.data.token, res.data)
            if (res.data.role === 'DOCTOR') {
                navigate('/doctor/dashboard')
            } else {
                navigate('/dashboard')
            }
        } catch {
            setError('Email sau parolă incorectă.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F3EE' }}>

            <BrandPanel />

            {/* Panoul drept — formularul */}
            <Box sx={{
                flex: 1.2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 3, sm: 6 },
                backgroundColor: '#FFFCF8',
            }}>
                <Box sx={{ width: '100%', maxWidth: 400 }}>

                    <Typography variant="h4" color="primary" sx={{
                        fontFamily: '"Cormorant Garamond", serif',
                        fontSize: '2rem', mb: 1,
                    }}>
                        Bine ai revenit
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Introdu datele tale pentru a continua
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <TextField
                        fullWidth label="Adresă email"
                        value={email} onChange={e => setEmail(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth label="Parolă" type="password"
                        value={password} onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        sx={{ mb: 4 }}
                    />

                    <Button
                        fullWidth variant="contained" color="primary"
                        onClick={handleSubmit} disabled={loading}
                        sx={{ py: 1.5, mb: 3 }}
                    >
                        {loading ? <CircularProgress size={22} color="inherit" /> : 'Intră în cont'}
                    </Button>

                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Nu ai cont?{' '}
                        <Link href="/register" color="primary" underline="hover">
                            Înregistrează-te
                        </Link>
                    </Typography>

                </Box>
            </Box>
        </Box>
    )
}