import { useEffect, useState } from 'react';
import {
    Box, Typography, Chip, Card, CardContent, Stack, Divider,
    CircularProgress, Alert, Avatar, IconButton,
} from '@mui/material';
import {
    EventOutlined, AccessTimeOutlined, ArrowBackOutlined,
    CheckCircleOutlined, CancelOutlined, HourglassEmptyOutlined,
    DoNotDisturbOutlined, ScheduleOutlined,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyAppointments } from '../api/appointments';

/* ─── Config ─────────────────────────────────────────────── */
const APPT_STATUS = {
    SCHEDULED:   { label: 'Scheduled',   color: '#1565C0', bg: '#E3F2FD', Icon: ScheduleOutlined },
    IN_PROGRESS: { label: 'In Progress', color: '#E65100', bg: '#FFF3E0', Icon: HourglassEmptyOutlined },
    COMPLETED:   { label: 'Completed',   color: '#2E7D32', bg: '#E8F5E9', Icon: CheckCircleOutlined },
    CANCELLED:   { label: 'Cancelled',   color: '#B71C1C', bg: '#FFEBEE', Icon: CancelOutlined },
    NO_SHOW:     { label: 'No Show',     color: '#6D4C41', bg: '#EFEBE9', Icon: DoNotDisturbOutlined },
};

const DURATION_COLOR = {
    10: '#2196F3',
    20: '#FF9800',
    30: '#9C27B0',
};

function AppointmentCard({ appt }) {
    const statusCfg = APPT_STATUS[appt.status] || APPT_STATUS.SCHEDULED;
    const start = appt.startTime || appt.start_time;
    const end = appt.endTime || appt.end_time;
    const dur = appt.durationMinutes || appt.duration_minutes;
    const doctor = appt.doctor || {};
    const doctorName = doctor.fullName || doctor.full_name || appt.doctorName || '—';
    const specialty = doctor.specialty || doctor.specialization || appt.doctorSpecialty || '';

    const dateLabel = start
        ? new Date(start).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : '—';
    const timeLabel = start
        ? new Date(start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : '—';
    const endLabel = end
        ? new Date(end).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : '';

    const isPast = start && new Date(start) < new Date();
    const isToday =
        start &&
        new Date(start).toDateString() === new Date().toDateString();

    return (
        <Card
            elevation={0}
            sx={{
                bgcolor: '#FFFCF8',
                border: `1px solid ${isPast ? '#E8DDD0' : '#C4A882'}`,
                borderRadius: 3,
                mb: 2,
                overflow: 'hidden',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 4px 20px rgba(139,115,85,0.12)' },
            }}
        >
            {/* Left accent bar */}
            <Box sx={{ display: 'flex' }}>
                <Box
                    sx={{
                        width: 4,
                        bgcolor: statusCfg.color,
                        flexShrink: 0,
                        opacity: isPast ? 0.4 : 1,
                    }}
                />
                <CardContent sx={{ py: 2, px: 3, flexGrow: 1 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>

                        {/* Date & time block */}
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                <EventOutlined sx={{ fontSize: 16, color: '#8B7355' }} />
                                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#4A3728' }}>
                                    {dateLabel}
                                </Typography>
                                {isToday && (
                                    <Chip label="Today" size="small" sx={{ height: 18, fontSize: '0.62rem', bgcolor: '#FFF3E0', color: '#E65100', fontFamily: 'Lato, sans-serif', fontWeight: 700 }} />
                                )}
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ pl: 3 }}>
                                <AccessTimeOutlined sx={{ fontSize: 13, color: '#A89070' }} />
                                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.82rem', color: '#7A6352' }}>
                                    {timeLabel}{endLabel ? ` – ${endLabel}` : ''}
                                </Typography>
                                {dur && (
                                    <Chip
                                        label={`${dur} min`}
                                        size="small"
                                        sx={{
                                            height: 18, fontSize: '0.62rem', fontFamily: 'Lato, sans-serif', fontWeight: 700,
                                            bgcolor: `${DURATION_COLOR[dur] || '#8B7355'}18`,
                                            color: DURATION_COLOR[dur] || '#8B7355',
                                        }}
                                    />
                                )}
                            </Stack>
                        </Box>

                        {/* Doctor block */}
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                                sx={{
                                    width: 38, height: 38,
                                    bgcolor: '#8B7355', fontFamily: 'Cormorant Garamond, serif',
                                    fontSize: '1rem', fontWeight: 700,
                                }}
                            >
                                {doctorName !== '—' ? doctorName.charAt(0) : 'D'}
                            </Avatar>
                            <Box>
                                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#3D2B1F' }}>
                                    {doctorName !== '—' ? `Dr. ${doctorName}` : 'Doctor TBD'}
                                </Typography>
                                {specialty && (
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.72rem', color: '#A89070' }}>
                                        {specialty}
                                    </Typography>
                                )}
                            </Box>
                        </Stack>

                        {/* Status */}
                        <Chip
                            icon={<statusCfg.Icon sx={{ fontSize: '14px !important', color: `${statusCfg.color} !important` }} />}
                            label={statusCfg.label}
                            size="small"
                            sx={{
                                bgcolor: statusCfg.bg, color: statusCfg.color,
                                fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.72rem',
                                border: `1px solid ${statusCfg.color}30`,
                                opacity: isPast && appt.status === 'SCHEDULED' ? 0.7 : 1,
                            }}
                        />
                    </Stack>

                    {/* Notes */}
                    {appt.notes && (
                        <>
                            <Divider sx={{ my: 1.5, borderColor: '#E8DDD0' }} />
                            <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.8rem', color: '#7A6352', fontStyle: 'italic' }}>
                                "{appt.notes}"
                            </Typography>
                        </>
                    )}
                </CardContent>
            </Box>
        </Card>
    );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function AppointmentsPage() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getMyAppointments(token)
            .then((data) => {
                setAppointments(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setError('Could not load appointments.');
                setLoading(false);
            });
    }, [token]);

    const now = new Date();
    const upcoming = appointments
        .filter((a) => new Date(a.startTime || a.start_time) >= now || a.status === 'IN_PROGRESS')
        .sort((a, b) => new Date(a.startTime || a.start_time) - new Date(b.startTime || b.start_time));
    const past = appointments
        .filter((a) => new Date(a.startTime || a.start_time) < now && a.status !== 'IN_PROGRESS')
        .sort((a, b) => new Date(b.startTime || b.start_time) - new Date(a.startTime || a.start_time));

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 860, mx: 'auto' }}>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ mb: 2, color: '#8B7355', '&:hover': { bgcolor: '#F2EAE0' } }}>
                <ArrowBackOutlined />
            </IconButton>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.75rem', color: '#A89070', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.5 }}>
                    Medical Records
                </Typography>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, color: '#3D2B1F', lineHeight: 1.1 }}>
                    My Appointments
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
                    <CircularProgress sx={{ color: '#8B7355' }} />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            ) : appointments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <EventOutlined sx={{ fontSize: 56, color: '#D4C4B0', mb: 2 }} />
                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#A89070' }}>
                        No appointments yet
                    </Typography>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.85rem', color: '#C4A882', mt: 1 }}>
                        Appointments are automatically scheduled after your consultation.
                    </Typography>
                </Box>
            ) : (
                <>
                    {upcoming.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontWeight: 600, color: '#3D2B1F', mb: 2 }}>
                                Upcoming ({upcoming.length})
                            </Typography>
                            {upcoming.map((a) => <AppointmentCard key={a.id} appt={a} />)}
                        </Box>
                    )}

                    {past.length > 0 && (
                        <Box>
                            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontWeight: 600, color: '#3D2B1F', mb: 2 }}>
                                Past ({past.length})
                            </Typography>
                            {past.map((a) => <AppointmentCard key={a.id} appt={a} />)}
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}