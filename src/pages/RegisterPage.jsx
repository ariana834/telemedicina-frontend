import { useState } from 'react'
import { Box, Typography, TextField, Button, Link, Alert, CircularProgress} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { registerRequest } from '../api/auth'

// Importăm BrandPanel — același panel maro ca la Login
function BrandPanel() {
    return (
        <Box sx={{
            flex: 1,
            backgroundColor: '#8B7355',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 6,
        }}>
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
                fontSize: '0.95rem', textAlign: 'center',
                lineHeight: 1.8, maxWidth: 220,
            }}>
                Sănătatea ta,<br />la un click distanță
            </Typography>
            <Box sx={{ width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', mt: 4 }} />
        </Box>
    )
}

export default function RegisterPage() {
    const [form, setForm]       = useState({ email: '', password: '', firstName: '', lastName: '' })
    const [error, setError]     = useState('')
    const [loading, setLoading] = useState(false)
    const navigate              = useNavigate()

    const handleChange = (field) => (e) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }))

    const handleSubmit = async () => {
        setError('')
        setLoading(true)
        try {
            await registerRequest(form)
            navigate('/login')
        } catch {
            setError('Înregistrare eșuată. Verifică datele introduse.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F3EE' }}>

            <BrandPanel />

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
                        Cont nou
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Creează-ți un cont pe platformă
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <TextField
                        fullWidth label="Prenume"
                        value={form.firstName}
                        onChange={handleChange('firstName')}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth label="Nume"
                        value={form.lastName}
                        onChange={handleChange('lastName')}
                        sx={{ mb: 2 }}
                    />

                    <TextField fullWidth label="Adresă email"
                               value={form.email} onChange={handleChange('email')} sx={{ mb: 2 }} />
                    <TextField fullWidth label="Parolă" type="password"
                               value={form.password} onChange={handleChange('password')} sx={{ mb: 4 }} />

                    <Button
                        fullWidth variant="contained" color="primary"
                        onClick={handleSubmit} disabled={loading}
                        sx={{ py: 1.5, mb: 3 }}
                    >
                        {loading ? <CircularProgress size={22} color="inherit" /> : 'Creează cont'}
                    </Button>

                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Ai deja cont?{' '}
                        <Link href="/login" color="primary" underline="hover">Autentifică-te</Link>
                    </Typography>

                </Box>
            </Box>
        </Box>
    )
}