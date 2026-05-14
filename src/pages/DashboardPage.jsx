import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import { getDoctors } from '../api/doctors'
import { Alert, AlertTitle } from '@mui/material'
import { Box, Typography, Grid, Card, CardActionArea, CardContent,
    Chip, Avatar, Skeleton, Button } from '@mui/material'
import SubscriptionBanner from '../components/SubscriptionBanner';

// Health tips — se rotesc după ziua săptămânii
const healthTips = [
    { tip: 'Drink at least 8 glasses of water daily to stay properly hydrated.',           icon: '💧' },
    { tip: 'A 30-minute walk each day significantly reduces cardiovascular risk.',         icon: '🚶' },
    { tip: 'Getting 7–9 hours of sleep helps your immune system stay strong.',             icon: '😴' },
    { tip: 'Eating a handful of nuts daily can improve heart health.',                     icon: '🥜' },
    { tip: 'Regular handwashing is one of the best ways to prevent illness.',              icon: '🧼' },
    { tip: 'Reducing screen time before bed improves sleep quality significantly.',        icon: '📵' },
    { tip: 'Deep breathing exercises for 5 minutes can lower stress and blood pressure.',  icon: '🧘' },
]

const quickActions = [
    { label: 'New Consultation', sub: 'Start an evaluation', icon: '🩺', bg: '#F0EBE3', path: '/consultations/new' },
    { label: 'Appointments',     sub: 'View your schedule',  icon: '📅', bg: '#EAF3DE', path: '/appointments' },
    { label: 'Prescriptions',    sub: 'Medical records',     icon: '📋', bg: '#E6F1FB', path: '/prescriptions' },
    { label: 'My Profile',       sub: 'Edit your details',   icon: '👤', bg: '#FAEEDA', path: '/profile' },
]

export default function DashboardPage() {
    const {token, profile } = useAuth()
    const navigate = useNavigate()
    const [doctors, setDoctors]   = useState([])
    const [loadingDr, setLoadingDr] = useState(true)

    // Tip-ul zilei bazat pe ziua săptămânii (0-6)
    const todayTip = healthTips[new Date().getDay() % healthTips.length]

    // Data formatată
    const today = new Date().toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })

    useEffect(() => {
        getDoctors(token)
            .then(res => setDoctors(res.data.slice(0, 3))) // primii 3 doctori
            .catch(() => setDoctors([]))
            .finally(() => setLoadingDr(false))
    }, [token])


    const hasProfile = profile !== null

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F3EE' }}>
            <Sidebar />

            {/* Conținut principal */}
            <Box sx={{ flex: 1, p: { xs: 3, sm: 4 }, overflowY: 'auto' }}>

                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography sx={{
                        fontFamily: '"Cormorant Garamond", serif',
                        fontSize: '2rem', fontWeight: 600, color: '#2C2416',
                    }}>
                        Good {getGreeting()}, {profile?.firstName ?? 'there'} 👋
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {today}
                    </Typography>
                </Box>

                {!hasProfile && (
                    <Alert
                        severity="warning"
                        sx={{
                            mb: 3,
                            backgroundColor: '#FDF6EC',
                            border: '1px solid #F0D9A8',
                            borderRadius: 2,
                            '& .MuiAlert-icon': { color: '#B07D30' },
                        }}
                        action={
                            <Button
                                size="small"
                                onClick={() => navigate('/profile')}
                                sx={{ color: '#8B7355', fontWeight: 600, whiteSpace: 'nowrap' }}
                            >
                                Complete now →
                            </Button>
                        }
                    >
                        <AlertTitle sx={{ color: '#6B4C1E', fontWeight: 600 }}>
                            Profile incomplete
                        </AlertTitle>
                        <Typography variant="body2" sx={{ color: '#8B6023' }}>
                            You need to complete your patient profile before booking a consultation.
                        </Typography>
                    </Alert>
                )}

                <SubscriptionBanner />

                {/* Quick actions */}
                <Typography sx={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'text.secondary', mb: 1.5 }}>
                    QUICK ACTIONS
                </Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {quickActions.map((a) => (
                        <Grid item xs={6} sm={3} key={a.path}>
                            <Card sx={{ border: '1px solid #EDE5D8', boxShadow: 'none', borderRadius: 2,
                                transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(139,115,85,0.1)', borderColor: '#8B7355' } }}>
                                <CardActionArea onClick={() => navigate(a.path)} sx={{ p: 2 }}>
                                    <Box sx={{ width: 44, height: 44, borderRadius: 2, backgroundColor: a.bg,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', mb: 1.5 }}>
                                        {a.icon}
                                    </Box>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#2C2416', mb: 0.3 }}>
                                        {a.label}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        {a.sub}
                                    </Typography>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Bottom row — Health tip + Doctors */}
                <Grid container spacing={3}>

                    {/* Health tip */}
                    <Grid item xs={12} md={5}>
                        <Card sx={{ border: '1px solid #EDE5D8', boxShadow: 'none', borderRadius: 2, height: '100%', backgroundColor: '#FFFCF8' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography sx={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'text.secondary', mb: 2 }}>
                                    TODAY'S HEALTH TIP
                                </Typography>
                                <Box sx={{ fontSize: '2.5rem', mb: 2 }}>{todayTip.icon}</Box>
                                <Typography sx={{ fontSize: '0.95rem', color: '#2C2416', lineHeight: 1.7 }}>
                                    {todayTip.tip}
                                </Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 2 }}>
                                    Tip {(new Date().getDay() % healthTips.length) + 1} of {healthTips.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Doctors */}
                    <Grid item xs={12} md={7}>
                        <Card sx={{ border: '1px solid #EDE5D8', boxShadow: 'none', borderRadius: 2, backgroundColor: '#FFFCF8' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography sx={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'text.secondary', mb: 2 }}>
                                    OUR DOCTORS
                                </Typography>
                                {loadingDr
                                    ? [1,2,3].map(i => <Skeleton key={i} height={56} sx={{ mb: 1, borderRadius: 1 }} />)
                                    : doctors.length === 0
                                        ? <Typography variant="body2" color="text.secondary">No doctors available.</Typography>
                                        : doctors.map((doc) => (
                                            <Box key={doc.id} sx={{
                                                display: 'flex', alignItems: 'center', gap: 2,
                                                p: 1.5, borderRadius: 1.5, mb: 1,
                                                '&:hover': { backgroundColor: '#F0EBE3', cursor: 'pointer' },
                                            }}>
                                                <Avatar sx={{ bgcolor: '#8B7355', width: 40, height: 40, fontSize: '0.85rem' }}>
                                                    {doc.firstName?.[0]}{doc.lastName?.[0]}
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#2C2416' }}>
                                                        Dr. {doc.firstName} {doc.lastName}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                                        {doc.specialization ?? 'General Medicine'}
                                                    </Typography>
                                                </Box>
                                                <Chip label="Available" size="small"
                                                      sx={{ backgroundColor: '#EAF3DE', color: '#3B6D11', fontSize: '0.7rem', fontWeight: 500 }} />
                                            </Box>
                                        ))
                                }
                            </CardContent>
                        </Card>
                    </Grid>

                </Grid>
            </Box>
        </Box>
    )
}

// Helper funcție greeting
function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return 'morning'
    if (h < 18) return 'afternoon'
    return 'evening'
}