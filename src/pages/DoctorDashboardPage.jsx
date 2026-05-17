import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Chip, Card, CardContent, Stack,
    CircularProgress, Alert, Grid, Avatar,
} from '@mui/material'
import {
    CalendarMonthOutlined,
    AccessTimeOutlined,
    CheckCircleOutlined,
    PersonOutlined,
    ArrowForwardIosRounded,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { getMyAppointmentsAsDoctor } from '../api/doctor'

const STATUS_CFG = {
    SCHEDULED:  { label: 'Scheduled',   color: '#1565C0', bg: '#E3F2FD' },
    IN_PROGRESS:{ label: 'In Progress', color: '#2E7D32', bg: '#E8F5E9' },
    COMPLETED:  { label: 'Completed',   color: '#6B5E4E', bg: '#F3EDE4' },
    CANCELLED:  { label: 'Cancelled',   color: '#B71C1C', bg: '#FFEBEE' },
    NO_SHOW:    { label: 'No Show',     color: '#E65100', bg: '#FFF3E0' },
}

const COMPLEXITY_COLOR = {
    SIMPLE: '#2E7D32', MEDIUM: '#E65100', COMPLEX: '#B71C1C', EMERGENCY: '#7B1FA2',
}

function AppointmentCard({ appt, onClick }) {
    const cfg = STATUS_CFG[appt.status] || STATUS_CFG.SCHEDULED
    const start = appt.startTime ? new Date(appt.startTime) : null
    const timeLabel = start
        ? start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : '—'
    const dateLabel = start
        ? start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
        : '—'
    const patientName = appt.patientFirstName
        ? `${appt.patientFirstName} ${appt.patientLastName}`
        : `Patient #${appt.patientId}`

    return (
        <Card elevation={0} onClick={onClick} sx={{
            bgcolor: '#FFFCF8', border: '1px solid #E8DDD0',
            borderLeft: `4px solid ${cfg.color}`, borderRadius: 3, mb: 1.5,
            cursor: 'pointer', transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: '0 4px 20px rgba(139,115,85,0.15)' },
        }}>
            <CardContent sx={{ py: 2, px: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: cfg.bg, color: cfg.color, width: 40, height: 40 }}>
                            <PersonOutlined sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Box>
                            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.05rem', fontWeight: 700, color: '#3D2B1F' }}>
                                {patientName}
                            </Typography>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.3 }}>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <CalendarMonthOutlined sx={{ fontSize: 13, color: '#A89070' }} />
                                    <Typography sx={{ fontFamily: '"Lato", sans-serif', fontSize: '0.75rem', color: '#A89070' }}>
                                        {dateLabel}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <AccessTimeOutlined sx={{ fontSize: 13, color: '#A89070' }} />
                                    <Typography sx={{ fontFamily: '"Lato", sans-serif', fontSize: '0.75rem', color: '#A89070' }}>
                                        {timeLabel} · {appt.durationMinutes} min
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {appt.complexityLevel && (
                            <Chip label={appt.complexityLevel} size="small" sx={{
                                bgcolor: `${COMPLEXITY_COLOR[appt.complexityLevel]}15`,
                                color: COMPLEXITY_COLOR[appt.complexityLevel],
                                fontFamily: '"Lato", sans-serif', fontWeight: 700, fontSize: '0.68rem',
                            }} />
                        )}
                        <Chip label={cfg.label} size="small" sx={{
                            bgcolor: cfg.bg, color: cfg.color,
                            fontFamily: '"Lato", sans-serif', fontWeight: 700, fontSize: '0.68rem',
                        }} />
                        <ArrowForwardIosRounded sx={{ fontSize: 14, color: '#C4A882' }} />
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    )
}

export default function DoctorDashboardPage() {
    const { token, user } = useAuth()
    const navigate = useNavigate()
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        getMyAppointmentsAsDoctor(token)
            .then(data => { setAppointments(Array.isArray(data) ? data : []); setLoading(false) })
            .catch(() => { setError('Could not load appointments.'); setLoading(false) })
    }, [token])

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
    const doctorName = user?.firstName ? `Dr. ${user.firstName}` : 'Doctor'

    const upcoming   = appointments.filter(a => a.status === 'SCHEDULED')
    const inProgress = appointments.filter(a => a.status === 'IN_PROGRESS')
    const completed  = appointments.filter(a => a.status === 'COMPLETED')

    const goToConsultation = (appt) =>
        navigate(`/doctor/consultation/${appt.id}`, { state: { appt } })

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 4, p: 3, bgcolor: '#4A6741', borderRadius: 3 }}>
                <Typography sx={{ fontFamily: '"Lato", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.5 }}>
                    {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </Typography>
                <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', fontWeight: 700, color: 'white' }}>
                    {greeting}, {doctorName}
                </Typography>
            </Box>

            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Upcoming', value: upcoming.length, icon: <CalendarMonthOutlined />, color: '#1565C0', bg: '#E3F2FD' },
                    { label: 'In Progress', value: inProgress.length, icon: <AccessTimeOutlined />, color: '#2E7D32', bg: '#E8F5E9' },
                    { label: 'Completed', value: completed.length, icon: <CheckCircleOutlined/>, color: '#6B5E4E', bg: '#F3EDE4' },
                ].map(s => (
                    <Grid item xs={4} key={s.label}>
                        <Card elevation={0} sx={{ bgcolor: s.bg, border: 'none', borderRadius: 3, p: 0.5 }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography sx={{ fontFamily: '"Lato", sans-serif', fontSize: '0.75rem', color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            {s.label}
                                        </Typography>
                                        <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', fontWeight: 700, color: s.color }}>
                                            {s.value}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ color: s.color, opacity: 0.6 }}>{s.icon}</Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
                    <CircularProgress sx={{ color: '#4A6741' }} />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : appointments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CalendarMonthOutlined sx={{ fontSize: 56, color: '#D4C4B0', mb: 2 }} />
                    <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', color: '#A89070' }}>
                        No appointments yet
                    </Typography>
                </Box>
            ) : (
                <>
                    {inProgress.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.2rem', fontWeight: 600, color: '#2E7D32', mb: 1.5 }}>
                                🟢 In Progress ({inProgress.length})
                            </Typography>
                            {inProgress.map(a => <AppointmentCard key={a.id} appt={a} onClick={() => goToConsultation(a)} />)}
                        </Box>
                    )}
                    {upcoming.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.2rem', fontWeight: 600, color: '#3D2B1F', mb: 1.5 }}>
                                Upcoming ({upcoming.length})
                            </Typography>
                            {upcoming.map(a => <AppointmentCard key={a.id} appt={a} onClick={() => goToConsultation(a)} />)}
                        </Box>
                    )}
                    {completed.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.2rem', fontWeight: 600, color: '#6B5E4E', mb: 1.5 }}>
                                Completed ({completed.length})
                            </Typography>
                            {completed.map(a => <AppointmentCard key={a.id} appt={a} onClick={() => goToConsultation(a)} />)}
                        </Box>
                    )}
                </>
            )}
        </Box>
    )
}