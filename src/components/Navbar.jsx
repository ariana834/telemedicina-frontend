import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // Inițialele userului pentru avatar
    const initials = user?.firstName
        ? `${user.firstName[0]}${user.lastName?.[0] ?? ''}`.toUpperCase()
        : '?'

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: '#FFFCF8',
                borderBottom: '1px solid #EDE5D8',
                color: 'text.primary',
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>

                {/* Logo stânga */}
                <Typography
                    sx={{
                        fontFamily: '"Cormorant Garamond", serif',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#8B7355',
                        cursor: 'pointer',
                    }}
                    onClick={() => navigate('/dashboard')}
                >
                    Telemedicină
                </Typography>

                {/* Dreapta — avatar + nume + logout */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#8B7355', width: 36, height: 36, fontSize: '0.85rem' }}>
                        {initials}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary"
                                sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {user?.firstName} {user?.lastName}
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleLogout}
                        sx={{
                            borderColor: '#D4C5B0',
                            color: 'text.secondary',
                            '&:hover': { borderColor: '#8B7355', color: '#8B7355', backgroundColor: 'transparent' },
                        }}
                    >
                        Ieși
                    </Button>
                </Box>

            </Toolbar>
        </AppBar>
    )
}