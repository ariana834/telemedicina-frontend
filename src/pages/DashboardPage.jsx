import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDoctors } from '../api/doctors'
import {
    Box, Typography, Grid, Card, CardActionArea, CardContent,
    Chip, Avatar, Skeleton, Button, Stack, Divider, Alert, AlertTitle,
} from '@mui/material'
import SubscriptionBanner from '../components/SubscriptionBanner'
import {
    MonitorHeartOutlined, EventOutlined, MedicalServicesOutlined,
    ScienceOutlined, ArrowForwardOutlined, FiberManualRecord,
    AccessTimeOutlined, CheckCircleOutlined, AddOutlined,
} from '@mui/icons-material'

const API = 'http://localhost:8084'
const get = (url, token) =>
    fetch(`${API}${url}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())

const healthTips = [
    { tip: 'Drink at least 8 glasses of water daily to stay properly hydrated.',          icon: '💧', color: '#2196F3' },
    { tip: 'A 30-minute walk each day significantly reduces cardiovascular risk.',        icon: '🚶', color: '#4CAF50' },
    { tip: 'Getting 7–9 hours of sleep helps your immune system stay strong.',            icon: '😴', color: '#9C27B0' },
    { tip: 'Eating a handful of nuts daily can improve heart health.',                    icon: '🥜', color: '#FF9800' },
    { tip: 'Regular handwashing is one of the best ways to prevent illness.',             icon: '🧼', color: '#00BCD4' },
    { tip: 'Reducing screen time before bed improves sleep quality significantly.',       icon: '📵', color: '#607D8B' },
    { tip: 'Deep breathing exercises for 5 minutes can lower stress and blood pressure.', icon: '🧘', color: '#8BC34A' },
]

const STATUS_COLOR = {
    COMPLETED: '#4CAF50', SCHEDULED: '#1565C0', IN_PROGRESS: '#E65100',
    CANCELLED: '#B71C1C', EMERGENCY_REDIRECT: '#B71C1C',
    DIAGNOSIS_PENDING: '#6A1B9A', FORM_COMPLETED: '#00796B',
    FORM_GENERATED: '#0277BD', PENDING_FORM: '#827717',
}

const quickActions = [
    { label: 'New Consultation', sub: 'Start an evaluation', emoji: '🩺', gradient: 'linear-gradient(135deg, #8B7355 0%, #6D5840 100%)', textColor: '#fff', path: '/consultations/new' },
    { label: 'Appointments',     sub: 'View your schedule',  emoji: '📅', gradient: 'linear-gradient(135deg, #F0EBE3 0%, #E8DDD0 100%)', textColor: '#3D2B1F', path: '/appointments'       },
    { label: 'Prescriptions',    sub: 'Medical records',     emoji: '📋', gradient: 'linear-gradient(135deg, #EAF3DE 0%, #D9EBC8 100%)', textColor: '#2D4A1E', path: '/prescriptions'      },
    { label: 'My Profile',       sub: 'Edit your details',   emoji: '👤', gradient: 'linear-gradient(135deg, #E6F1FB 0%, #D0E4F7 100%)', textColor: '#1A3A5C', path: '/profile'            },
]

function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
}

/* ── Animated stat card ────────────────────────────────────── */
function StatCard({ icon: Icon, value, label, color, onClick }) {
    return (
        <Card elevation={0} onClick={onClick} sx={{
            border: '1px solid #EDE5D8', borderRadius: 3, bgcolor: '#FFFCF8',
            cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
            '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 24px ${color}22`, borderColor: color },
        }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon sx={{ fontSize: 20, color }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 700, color: '#2C2416', lineHeight: 1 }}>
                            {value !== null ? value : <Skeleton width={32} height={32} />}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.68rem', color: '#A89070', lineHeight: 1.2, mt: 0.3 }}>
                            {label}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    )
}

/* ── Next Appointment ──────────────────────────────────────── */
function NextAppointmentCard({ appointment, navigate }) {
    if (!appointment) return null
    const start = appointment.startTime || appointment.start_time
    const doctor = appointment.doctor || {}
    const doctorName = doctor.fullName || doctor.full_name || 'Doctor'
    const specialty  = doctor.specialty || doctor.specialization || ''
    const dur        = appointment.durationMinutes || appointment.duration_minutes
    const dateLabel  = new Date(start).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    const timeLabel  = new Date(start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    const isToday    = new Date(start).toDateString() === new Date().toDateString()

    return (
        <Card elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #C4A882',
            background: 'linear-gradient(135deg, #FFFCF8 0%, #F5EFE6 100%)' }}>
            <Box sx={{ display: 'flex' }}>
                <Box sx={{ width: 5, background: 'linear-gradient(180deg, #8B7355 0%, #C4A882 100%)', flexShrink: 0 }} />
                <CardContent sx={{ flex: 1, py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ width: 42, height: 42, background: 'linear-gradient(135deg, #8B7355, #C4A882)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 700 }}>
                                {doctorName.charAt(0)}
                            </Avatar>
                            <Box>
                                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.25 }}>
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.62rem', color: '#A89070', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Next Appointment</Typography>
                                    {isToday && <Chip label="Today" size="small" sx={{ height: 16, fontSize: '0.58rem', bgcolor: '#FFF3E0', color: '#E65100', fontFamily: 'Lato, sans-serif', fontWeight: 700 }} />}
                                </Stack>
                                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#2C2416' }}>
                                    Dr. {doctorName}{specialty ? ` · ${specialty}` : ''}
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack alignItems="flex-end" spacing={0.25}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <EventOutlined sx={{ fontSize: 13, color: '#8B7355' }} />
                                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#4A3728' }}>{dateLabel}</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <AccessTimeOutlined sx={{ fontSize: 12, color: '#A89070' }} />
                                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.75rem', color: '#7A6352' }}>{timeLabel}{dur ? ` · ${dur} min` : ''}</Typography>
                            </Stack>
                            <Button size="small" endIcon={<ArrowForwardOutlined sx={{ fontSize: '11px !important' }} />}
                                    onClick={() => navigate('/appointments')}
                                    sx={{ color: '#8B7355', fontFamily: 'Lato, sans-serif', fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', p: 0, minWidth: 0, mt: 0.25 }}>
                                View all
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Box>
        </Card>
    )
}

/* ── Recent Consultations — with gorgeous empty state ──────── */
function RecentConsultations({ consultations, navigate }) {
    const recent = [...(consultations || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
    const isEmpty = !consultations || consultations.length === 0

    return (
        <Card elevation={0} sx={{ border: '1px solid #EDE5D8', borderRadius: 3, bgcolor: '#FFFCF8', overflow: 'hidden' }}>
            {!isEmpty && (
                <Box sx={{ px: 2.5, pt: 2.5, pb: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.68rem', color: '#A89070', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                            Recent Consultations
                        </Typography>
                        <Button size="small" endIcon={<ArrowForwardOutlined sx={{ fontSize: '12px !important' }} />}
                                onClick={() => navigate('/consultations')}
                                sx={{ color: '#8B7355', fontFamily: 'Lato, sans-serif', fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', p: 0, minWidth: 0 }}>
                            View all
                        </Button>
                    </Stack>
                </Box>
            )}

            {isEmpty ? (
                /* ── Beautiful empty state ── */
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    {/* Decorative rings */}
                    <Box sx={{ position: 'relative', width: 120, height: 120, mx: 'auto', mb: 3 }}>
                        <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid #EDE5D8', animation: 'pulse 3s ease-in-out infinite' }} />
                        <Box sx={{ position: 'absolute', inset: 12, borderRadius: '50%', border: '1.5px solid #D4C4B0', animation: 'pulse 3s ease-in-out infinite 0.5s' }} />
                        <Box sx={{ position: 'absolute', inset: 24, borderRadius: '50%', bgcolor: 'linear-gradient(135deg, #F5EFE6, #EDE5D8)',
                            background: 'linear-gradient(135deg, #F5EFE6 0%, #EDE5D8 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 20px rgba(139,115,85,0.15)' }}>
                            <Typography sx={{ fontSize: '2.2rem', lineHeight: 1 }}>🩺</Typography>
                        </Box>
                    </Box>

                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.35rem', fontWeight: 700, color: '#3D2B1F', mb: 0.75 }}>
                        No consultations yet
                    </Typography>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.82rem', color: '#A89070', lineHeight: 1.7, mb: 3, maxWidth: 240, mx: 'auto' }}>
                        Start your first consultation and let our AI guide you through a personalized medical evaluation.
                    </Typography>

                    {/* Feature pills */}
                    <Stack direction="row" spacing={0.75} justifyContent="center" flexWrap="wrap" sx={{ gap: 0.75, mb: 3 }}>
                        {['AI diagnosis', 'Auto scheduling', 'OTC prescriptions'].map((feat) => (
                            <Chip key={feat} label={feat} size="small" sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.68rem', fontWeight: 600, bgcolor: '#F2EAE0', color: '#6B4F35', height: 22 }} />
                        ))}
                    </Stack>

                    <Button
                        variant="contained"
                        startIcon={<AddOutlined />}
                        onClick={() => navigate('/consultations/new')}
                        sx={{
                            background: 'linear-gradient(135deg, #8B7355 0%, #6D5840 100%)',
                            color: '#fff', borderRadius: 2.5, fontFamily: 'Lato, sans-serif',
                            fontWeight: 700, textTransform: 'none', px: 3, py: 1,
                            fontSize: '0.85rem',
                            boxShadow: '0 4px 16px rgba(139,115,85,0.35)',
                            '&:hover': { background: 'linear-gradient(135deg, #7A6348 0%, #5C4830 100%)', boxShadow: '0 6px 20px rgba(139,115,85,0.45)' },
                        }}>
                        Start your first consultation
                    </Button>
                </Box>
            ) : (
                <Box sx={{ px: 2.5, pb: 2 }}>
                    {recent.map((c, i) => {
                        const diagnoses = c.diagnoses || []
                        const dx = diagnoses.find(d => d.diagnosisType === 'CONFIRMED') || diagnoses.find(d => d.diagnosisType === 'AUTO_GENERATED') || diagnoses[0]
                        const dotColor = STATUS_COLOR[c.status] || '#8B7355'
                        const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'
                        return (
                            <Box key={c.id}>
                                {i > 0 && <Divider sx={{ borderColor: '#F0E8DC', my: 0.25 }} />}
                                <Stack direction="row" alignItems="center" spacing={1.5}
                                       sx={{ py: 1, px: 1, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#F7F3EE' } }}
                                       onClick={() => navigate('/consultations')}>
                                    <FiberManualRecord sx={{ fontSize: 8, color: dotColor, flexShrink: 0 }} />
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#2C2416', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {dx ? dx.diagnosisName : (c.notes || `Consultation #${c.id}`)}
                                    </Typography>
                                    <Chip label={c.status?.replace(/_/g, ' ')} size="small"
                                          sx={{ height: 18, fontSize: '0.58rem', fontFamily: 'Lato, sans-serif', fontWeight: 700, bgcolor: `${dotColor}18`, color: dotColor, flexShrink: 0 }} />
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.7rem', color: '#A89070', flexShrink: 0, minWidth: 44, textAlign: 'right' }}>
                                        {date}
                                    </Typography>
                                </Stack>
                            </Box>
                        )
                    })}
                </Box>
            )}

            <style>{`@keyframes pulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.8;transform:scale(1.04)} }`}</style>
        </Card>
    )
}

/* ── Active Prescriptions ──────────────────────────────────── */
function ActivePrescriptionsCard({ prescriptions, navigate }) {
    const active = (prescriptions || []).filter(p =>
        p.status === 'ACTIVE' && (!(p.validUntil || p.valid_until) || new Date(p.validUntil || p.valid_until) >= new Date())
    ).slice(0, 3)
    if (active.length === 0) return null
    return (
        <Card elevation={0} sx={{ border: '1px solid #EDE5D8', borderRadius: 3, bgcolor: '#FFFCF8' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.68rem', color: '#A89070', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                        Active Prescriptions
                    </Typography>
                    <Button size="small" endIcon={<ArrowForwardOutlined sx={{ fontSize: '12px !important' }} />}
                            onClick={() => navigate('/prescriptions')}
                            sx={{ color: '#8B7355', fontFamily: 'Lato, sans-serif', fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', p: 0, minWidth: 0 }}>
                        View all
                    </Button>
                </Stack>
                <Stack spacing={0.5}>
                    {active.map((p) => {
                        const meds = p.medications || p.prescriptionMedications || p.prescription_medications || []
                        const validUntil = p.validUntil || p.valid_until
                        return (
                            <Stack key={p.id} direction="row" alignItems="center" spacing={1.25}
                                   sx={{ py: 0.75, px: 1, borderRadius: 1.5, '&:hover': { bgcolor: '#F7F3EE' }, cursor: 'pointer' }}
                                   onClick={() => navigate('/prescriptions')}>
                                <CheckCircleOutlined sx={{ fontSize: 15, color: '#4CAF50', flexShrink: 0 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#2C2416', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {meds.length > 0 ? meds.map(m => m.medicationName || m.medication_name).join(', ') : `Prescription #${p.id}`}
                                    </Typography>
                                    {validUntil && (
                                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.68rem', color: '#A89070' }}>
                                            Until {new Date(validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </Typography>
                                    )}
                                </Box>
                            </Stack>
                        )
                    })}
                </Stack>
            </CardContent>
        </Card>
    )
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function DashboardPage() {
    const { token, profile } = useAuth()
    const navigate = useNavigate()

    const [doctors, setDoctors]             = useState([])
    const [loadingDr, setLoadingDr]         = useState(true)
    const [consultations, setConsultations] = useState(null)
    const [appointments, setAppointments]   = useState(null)
    const [prescriptions, setPrescriptions] = useState(null)
    const [referrals, setReferrals]         = useState(null)

    const todayTip = healthTips[new Date().getDay() % healthTips.length]
    const today    = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    useEffect(() => {
        if (!token) return
        getDoctors(token)
            .then(res => setDoctors((res.data || res).slice(0, 4)))
            .catch(() => setDoctors([]))
            .finally(() => setLoadingDr(false))
        get('/api/consultations/my', token).then(d => setConsultations(Array.isArray(d) ? d : [])).catch(() => setConsultations([]))
        get('/api/v1/appointments/my', token).then(d => setAppointments(Array.isArray(d) ? d : [])).catch(() => setAppointments([]))
        get('/api/v1/prescriptions/my', token).then(d => setPrescriptions(Array.isArray(d) ? d : [])).catch(() => setPrescriptions([]))
        get('/api/v1/referrals/my', token).then(d => setReferrals(Array.isArray(d) ? d : [])).catch(() => setReferrals([]))
    }, [token])

    const totalConsultations = consultations?.length ?? null
    const nextAppointment    = appointments
        ?.filter(a => new Date(a.startTime || a.start_time) > new Date() && a.status === 'SCHEDULED')
        .sort((a, b) => new Date(a.startTime || a.start_time) - new Date(b.startTime || b.start_time))[0] ?? null
    const upcomingCount      = appointments?.filter(a => new Date(a.startTime || a.start_time) > new Date() && a.status === 'SCHEDULED').length ?? null
    const activePrescCount   = prescriptions?.filter(p => p.status === 'ACTIVE').length ?? null
    const referralsCount     = referrals?.length ?? null

    return (
        <Box sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: '#F7F3EE', minHeight: '100vh' }}>

            {/* ── Hero header ── */}
            <Box sx={{
                mb: 3, p: 3, borderRadius: 4,
                background: 'linear-gradient(135deg, #3D2B1F 0%, #5C4A32 60%, #8B7355 100%)',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* decorative circles */}
                <Box sx={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />
                <Box sx={{ position: 'absolute', bottom: -20, right: 80, width: 90, height: 90, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.7rem', color: 'rgba(255,252,248,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.5 }}>
                            {today}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 600, color: '#FFFCF8', lineHeight: 1.1 }}>
                            {getGreeting()}, {profile?.firstName ?? 'there'} 👋
                        </Typography>
                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.82rem', color: 'rgba(255,252,248,0.6)', mt: 0.5 }}>
                            Welcome to your patient portal
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddOutlined />}
                        onClick={() => navigate('/consultations/new')}
                        sx={{
                            bgcolor: 'rgba(255,252,248,0.15)', color: '#FFFCF8',
                            border: '1px solid rgba(255,252,248,0.25)',
                            borderRadius: 2.5, fontFamily: 'Lato, sans-serif', fontWeight: 700,
                            textTransform: 'none', px: 2.5, py: 1, fontSize: '0.82rem',
                            backdropFilter: 'blur(10px)',
                            '&:hover': { bgcolor: 'rgba(255,252,248,0.25)' },
                            display: { xs: 'none', sm: 'flex' },
                        }}>
                        New Consultation
                    </Button>
                </Stack>
            </Box>

            {!profile && (
                <Alert severity="warning" sx={{ mb: 2.5, backgroundColor: '#FDF6EC', border: '1px solid #F0D9A8', borderRadius: 2.5, '& .MuiAlert-icon': { color: '#B07D30' } }}
                       action={<Button size="small" onClick={() => navigate('/profile')} sx={{ color: '#8B7355', fontWeight: 700, whiteSpace: 'nowrap' }}>Complete now →</Button>}>
                    <AlertTitle sx={{ color: '#6B4C1E', fontWeight: 600 }}>Profile incomplete</AlertTitle>
                    Complete your patient profile before booking a consultation.
                </Alert>
            )}

            <SubscriptionBanner />

            {/* ── Stats row ── */}
            <Grid container spacing={1.5} sx={{ mb: 2.5, mt: 0.5 }}>
                {[
                    { icon: MonitorHeartOutlined, value: totalConsultations,  label: 'Total consultations',   color: '#8B7355', path: '/consultations' },
                    { icon: EventOutlined,         value: upcomingCount,       label: 'Upcoming appointments', color: '#1565C0', path: '/appointments'  },
                    { icon: MedicalServicesOutlined,value: activePrescCount,   label: 'Active prescriptions',  color: '#2E7D32', path: '/prescriptions' },
                    { icon: ScienceOutlined,        value: referralsCount,     label: 'Referrals',             color: '#6A1B9A', path: '/referrals'     },
                ].map(({ icon, value, label, color, path }) => (
                    <Grid item xs={6} sm={3} key={path}>
                        <StatCard icon={icon} value={value} label={label} color={color} onClick={() => navigate(path)} />
                    </Grid>
                ))}
            </Grid>

            {/* ── Next appointment ── */}
            {nextAppointment && (
                <Box sx={{ mb: 2.5 }}>
                    <NextAppointmentCard appointment={nextAppointment} navigate={navigate} />
                </Box>
            )}

            {/* ── Main 2-col ── */}
            <Grid container spacing={2.5}>

                {/* LEFT */}
                <Grid item xs={12} md={7}>
                    <Stack spacing={2.5}>

                        {/* Quick actions 2×2 */}
                        <Box>
                            <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.68rem', letterSpacing: '0.1em', color: '#A89070', mb: 1.25, fontWeight: 700 }}>
                                QUICK ACTIONS
                            </Typography>
                            <Grid container spacing={1.5}>
                                {quickActions.map((a) => (
                                    <Grid item xs={6} key={a.path}>
                                        <Card elevation={0} sx={{
                                            borderRadius: 3, overflow: 'hidden',
                                            border: '1px solid #EDE5D8',
                                            background: a.gradient,
                                            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                                            '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(139,115,85,0.18)' }
                                        }}>
                                            <CardActionArea onClick={() => navigate(a.path)} sx={{ p: 2.25 }}>
                                                <Typography sx={{ fontSize: '1.6rem', mb: 1 }}>{a.emoji}</Typography>
                                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: a.textColor, mb: 0.2, fontFamily: 'Lato, sans-serif' }}>
                                                    {a.label}
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.72rem', color: a.textColor, opacity: 0.7, fontFamily: 'Lato, sans-serif' }}>
                                                    {a.sub}
                                                </Typography>
                                            </CardActionArea>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        {/* Recent consultations */}
                        <RecentConsultations consultations={consultations} navigate={navigate} />
                    </Stack>
                </Grid>

                {/* RIGHT */}
                <Grid item xs={12} md={5}>
                    <Stack spacing={2.5}>

                        {/* Active prescriptions */}
                        <ActivePrescriptionsCard prescriptions={prescriptions} navigate={navigate} />

                        {/* Doctors */}
                        <Card elevation={0} sx={{ border: '1px solid #EDE5D8', borderRadius: 3, bgcolor: '#FFFCF8' }}>
                            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2 } }}>
                                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.68rem', letterSpacing: '0.1em', color: '#A89070', mb: 2, fontWeight: 700 }}>
                                    OUR DOCTORS
                                </Typography>
                                {loadingDr
                                    ? [1,2,3].map(i => <Skeleton key={i} height={52} sx={{ mb: 0.75, borderRadius: 1 }} />)
                                    : doctors.length === 0
                                        ? <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.82rem', color: '#A89070' }}>No doctors available.</Typography>
                                        : doctors.map((doc) => (
                                            <Stack key={doc.id} direction="row" alignItems="center" spacing={1.5}
                                                   sx={{ p: 1.25, borderRadius: 2, mb: 0.5, '&:hover': { bgcolor: '#F0EBE3', cursor: 'pointer' }, transition: 'background 0.15s' }}>
                                                <Avatar sx={{ background: 'linear-gradient(135deg, #8B7355, #C4A882)', width: 36, height: 36, fontSize: '0.8rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 700 }}>
                                                    {doc.firstName?.[0]}{doc.lastName?.[0]}
                                                </Avatar>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#2C2416', fontFamily: 'Lato, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        Dr. {doc.firstName} {doc.lastName}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '0.7rem', color: '#A89070', fontFamily: 'Lato, sans-serif' }}>
                                                        {doc.specialization ?? 'General Medicine'}
                                                    </Typography>
                                                </Box>
                                                <Chip label="Available" size="small" sx={{ bgcolor: '#EAF3DE', color: '#3B6D11', fontSize: '0.62rem', fontWeight: 700, height: 20, fontFamily: 'Lato, sans-serif' }} />
                                            </Stack>
                                        ))
                                }
                            </CardContent>
                        </Card>

                        {/* Health tip */}
                        <Card elevation={0} sx={{ border: '1px solid #EDE5D8', borderRadius: 3, overflow: 'hidden',
                            background: 'linear-gradient(135deg, #FFFCF8 0%, #F5EFE6 100%)' }}>
                            <Box sx={{ height: 3, background: `linear-gradient(90deg, ${todayTip.color}88, ${todayTip.color}22)` }} />
                            <CardContent sx={{ p: 2.5 }}>
                                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.68rem', letterSpacing: '0.1em', color: '#A89070', mb: 1.5, fontWeight: 700 }}>
                                    TODAY'S HEALTH TIP
                                </Typography>
                                <Box sx={{ fontSize: '1.8rem', mb: 1 }}>{todayTip.icon}</Box>
                                <Typography sx={{ fontSize: '0.85rem', color: '#2C2416', lineHeight: 1.75, fontFamily: 'Lato, sans-serif', fontStyle: 'italic' }}>
                                    "{todayTip.tip}"
                                </Typography>
                                <Typography sx={{ fontSize: '0.65rem', color: '#C4A882', mt: 1.5, fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em' }}>
                                    TIP {(new Date().getDay() % healthTips.length) + 1} OF {healthTips.length}
                                </Typography>
                            </CardContent>
                        </Card>

                    </Stack>
                </Grid>
            </Grid>
        </Box>
    )
}