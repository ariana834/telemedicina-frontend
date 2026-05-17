import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Avatar, Divider, Button } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardIcon     from '@mui/icons-material/GridViewRounded'
import ConsultIcon       from '@mui/icons-material/HealingRounded'
import CalendarIcon      from '@mui/icons-material/CalendarMonthRounded'
import PrescriptionIcon  from '@mui/icons-material/DescriptionRounded'
import SubscriptionIcon  from '@mui/icons-material/CreditCardRounded'
import ReferralIcon      from '@mui/icons-material/ScienceRounded'
import DoctorsIcon       from '@mui/icons-material/MedicalInformationRounded'
import LogoutIcon        from '@mui/icons-material/LogoutRounded'
import AddIcon           from '@mui/icons-material/AddRounded'

const navItems = [
    { label: 'Dashboard',     icon: <DashboardIcon />,    path: '/dashboard' },
    { label: 'Consultations', icon: <ConsultIcon />,      path: '/consultations' },
    { label: 'Appointments',  icon: <CalendarIcon />,     path: '/appointments' },
    { label: 'Prescriptions', icon: <PrescriptionIcon />, path: '/prescriptions' },
    { label: 'Referrals',     icon: <ReferralIcon />,     path: '/referrals' },
    { label: 'Doctors',       icon: <DoctorsIcon />,      path: '/doctors' },
    { label: 'Subscription',  icon: <SubscriptionIcon />, path: '/subscription' },
]

export default function Sidebar() {
    const navigate  = useNavigate()
    const location  = useLocation()
    const { user, logout, profile, email } = useAuth()

    // eslint-disable-next-line no-unused-vars
    const displayName = profile
        ? `${profile.firstName} ${profile.lastName}`
        : (email ?? 'Patient')

    const initials = profile
        ? `${profile.firstName?.[0]}${profile.lastName?.[0]}`.toUpperCase()
        : (email?.[0]?.toUpperCase() ?? '?')

    const handleLogout = () => { logout(); navigate('/login') }

    return (
        <Box sx={{
            width: 260,
            minHeight: '100vh',
            backgroundColor: '#8B7355',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
        }}>
            {/* Logo */}
            <Box sx={{ p: 3, pb: 2.5, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                <Typography sx={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: '1.3rem', fontWeight: 600, color: 'white',
                }}>
                    Telemedicină
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', mt: 0.3 }}>
                    Patient Portal
                </Typography>
            </Box>

            {/* New Consultation CTA */}
            <Box sx={{ px: 1.5, pt: 2, pb: 1 }}>
                <Button
                    fullWidth
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/consultations/new')}
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        borderRadius: 2,
                        fontFamily: '"Lato", sans-serif',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        border: '1px solid rgba(255,255,255,0.25)',
                        py: 1,
                        '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.25)',
                            border: '1px solid rgba(255,255,255,0.4)',
                        },
                    }}
                >
                    New Consultation
                </Button>
            </Box>

            {/* Nav links */}
            <List sx={{ flex: 1, px: 1, py: 1 }}>
                {navItems.map(({ label, icon, path }) => {
                    const active = location.pathname === path
                    return (
                        <ListItem
                            key={path}
                            onClick={() => navigate(path)}
                            sx={{
                                borderRadius: 1.5, mb: 0.5, cursor: 'pointer', px: 1.5,
                                backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, color: active ? 'white' : 'rgba(255,255,255,0.55)', '& svg': { fontSize: 20 } }}>
                                {icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={label}
                                sx={{
                                    fontSize: '0.875rem',
                                    fontWeight: active ? 600 : 400,
                                    color: active ? 'white' : 'rgba(255,255,255,0.6)',
                                    fontFamily: '"Lato", sans-serif',
                                }}
                            />
                        </ListItem>
                    )
                })}
            </List>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

            {/* User + logout */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
                    {initials}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.8rem', color: 'white', fontWeight: 500, noWrap: true }}>
                        {user?.firstName} {user?.lastName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                        Patient
                    </Typography>
                </Box>
                <LogoutIcon
                    onClick={handleLogout}
                    sx={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', '&:hover': { color: 'white' } }}
                />
            </Box>
        </Box>
    )
}