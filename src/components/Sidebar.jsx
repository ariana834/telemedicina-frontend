import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Avatar, Divider, Button } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardIcon    from '@mui/icons-material/GridViewRounded'
import ConsultIcon      from '@mui/icons-material/HealingRounded'
import CalendarIcon     from '@mui/icons-material/CalendarMonthRounded'
import PrescriptionIcon from '@mui/icons-material/DescriptionRounded'
import SubscriptionIcon from '@mui/icons-material/CreditCardRounded'
import ReferralIcon     from '@mui/icons-material/ScienceRounded'
import DoctorsIcon      from '@mui/icons-material/MedicalInformationRounded'
import LogoutIcon       from '@mui/icons-material/LogoutRounded'
import AddIcon          from '@mui/icons-material/AddRounded'
import StethoscopeIcon  from '@mui/icons-material/MonitorHeartRounded'

const patientNav = [
    { label: 'Dashboard',     icon: <DashboardIcon />,    path: '/dashboard' },
    { label: 'Consultations', icon: <ConsultIcon />,      path: '/consultations' },
    { label: 'Appointments',  icon: <CalendarIcon />,     path: '/appointments' },
    { label: 'Prescriptions', icon: <PrescriptionIcon />, path: '/prescriptions' },
    { label: 'Referrals',     icon: <ReferralIcon />,     path: '/referrals' },
    { label: 'Doctors',       icon: <DoctorsIcon />,      path: '/doctors' },
    { label: 'Subscription',  icon: <SubscriptionIcon />, path: '/subscription' },
]

const doctorNav = [
    { label: 'Dashboard',     icon: <DashboardIcon />,    path: '/doctor/dashboard' },
    { label: 'Appointments',  icon: <CalendarIcon />,     path: '/doctor/appointments' },
]

export default function Sidebar() {
    const navigate  = useNavigate()
    const location  = useLocation()
    const { user, logout, profile, email, role } = useAuth()

    const isDoctor  = role === 'DOCTOR'
    const navItems  = isDoctor ? doctorNav : patientNav

    const displayName = isDoctor
        ? (user?.firstName ? `Dr. ${user.firstName} ${user.lastName ?? ''}` : 'Doctor')
        : (profile ? `${profile.firstName} ${profile.lastName}` : (email ?? 'Patient'))

    const initials = isDoctor
        ? (user?.firstName?.[0] ?? 'D').toUpperCase()
        : (profile
            ? `${profile.firstName?.[0]}${profile.lastName?.[0]}`.toUpperCase()
            : (email?.[0]?.toUpperCase() ?? '?'))

    const handleLogout = () => { logout(); navigate('/login') }

    return (
        <Box sx={{
            width: 260, minHeight: '100vh',
            backgroundColor: isDoctor ? '#4A6741' : '#8B7355',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
        }}>
            {/* Logo */}
            <Box sx={{ p: 3, pb: 2.5, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.3rem', fontWeight: 600, color: 'white' }}>
                    Telemedicină
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', mt: 0.3 }}>
                    {isDoctor ? 'Doctor Portal' : 'Patient Portal'}
                </Typography>
            </Box>

            {/* CTA */}
            {!isDoctor && (
                <Box sx={{ px: 1.5, pt: 2, pb: 1 }}>
                    <Button fullWidth startIcon={<AddIcon />} onClick={() => navigate('/consultations/new')}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: 2,
                                fontFamily: '"Lato", sans-serif', fontWeight: 600, fontSize: '0.8rem',
                                textTransform: 'none', border: '1px solid rgba(255,255,255,0.25)', py: 1,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                            }}>
                        New Consultation
                    </Button>
                </Box>
            )}

            {isDoctor && (
                <Box sx={{ px: 1.5, pt: 2, pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1,
                        bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.2)' }}>
                        <StethoscopeIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }} />
                        <Typography sx={{ fontFamily: '"Lato", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>
                            Doctor Mode
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Nav */}
            <List sx={{ flex: 1, px: 1, py: 1 }}>
                {navItems.map(({ label, icon, path }) => {
                    const active = location.pathname === path || location.pathname.startsWith(path + '/')
                    return (
                        <ListItem key={path} onClick={() => navigate(path)} sx={{
                            borderRadius: 1.5, mb: 0.5, cursor: 'pointer', px: 1.5,
                            backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                        }}>
                            <ListItemIcon sx={{ minWidth: 36, color: active ? 'white' : 'rgba(255,255,255,0.55)', '& svg': { fontSize: 20 } }}>
                                {icon}
                            </ListItemIcon>
                            <ListItemText primary={label} primaryTypographyProps={{
                                fontSize: '0.875rem', fontWeight: active ? 600 : 400,
                                color: active ? 'white' : 'rgba(255,255,255,0.6)',
                                fontFamily: '"Lato", sans-serif',
                            }} />
                        </ListItem>
                    )
                })}
            </List>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
                    {initials}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.8rem', color: 'white', fontWeight: 500 }}>
                        {displayName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                        {isDoctor ? 'Doctor' : 'Patient'}
                    </Typography>
                </Box>
                <LogoutIcon onClick={handleLogout}
                            sx={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', '&:hover': { color: 'white' } }} />
            </Box>
        </Box>
    )
}