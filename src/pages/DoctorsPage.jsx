import { useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CardActionArea,
    Stack, Avatar, Chip, CircularProgress, Alert, Dialog,
    DialogContent, IconButton, Divider, TextField,
    InputAdornment, Fade,
} from '@mui/material';
import {
    ArrowBackOutlined, CloseOutlined, SearchOutlined,
    EventOutlined, AccessTimeOutlined, LocalHospitalOutlined,
    BadgeOutlined, PhoneOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8084';
const h   = (token) => ({ Authorization: `Bearer ${token}` });

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const SPECIALTY_COLOR = {
    'Cardiologie':        { bg: '#FFEBEE', color: '#B71C1C' },
    'Pneumologie':        { bg: '#E3F2FD', color: '#1565C0' },
    'Gastroenterologie':  { bg: '#E8F5E9', color: '#2E7D32' },
    'ORL':                { bg: '#F3E5F5', color: '#6A1B9A' },
    'Pediatrie':          { bg: '#FFF3E0', color: '#E65100' },
    'Medicina Interna':   { bg: '#F5EFE6', color: '#8B7355' },
    'Medicina de Familie':{ bg: '#E0F7FA', color: '#006064' },
};

const specCfg = (s) => SPECIALTY_COLOR[s] || { bg: '#F5EFE6', color: '#8B7355' };
const initials = (doc) => `${doc.firstName?.[0] || ''}${doc.lastName?.[0] || ''}`;

function DoctorModal({ doctor, token, open, onClose }) {
    const [detail, setDetail]   = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!open || !doctor) return;
        fetch(`${API}/api/v1/doctors/${doctor.id}`, { headers: h(token) })
            .then(r => r.json())
            .then(d => { setDetail(d); setLoading(false); })
            .catch(() => { setDetail(doctor); setLoading(false); });
    }, [open, doctor, token]);

    if (!doctor) return null;
     specCfg(doctor.specialization);

    const schedules = (detail?.schedules || detail?.doctorSchedules || detail?.schedule || []);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3, bgcolor: '#FFFCF8', border: '1.5px solid #EDE5D8', overflow: 'hidden' } }}>

            {/* Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #3D2B1F 0%, #8B7355 100%)', px: 3, py: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 56, height: 56, background: 'rgba(255,252,248,0.2)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFCF8', border: '2px solid rgba(255,252,248,0.3)' }}>
                            {initials(doctor)}
                        </Avatar>
                        <Box>
                            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFCF8' }}>
                                Dr. {doctor.firstName} {doctor.lastName}
                            </Typography>
                            <Chip label={doctor?.specialization || ''} size="small"
                                  sx={{ bgcolor: 'rgba(255,252,248,0.2)', color: '#FFFCF8', fontFamily: 'Lato, sans-serif', fontSize: '0.7rem', fontWeight: 700, mt: 0.5 }} />
                        </Box>
                    </Stack>
                    <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,252,248,0.7)', '&:hover': { color: '#FFFCF8', bgcolor: 'rgba(255,252,248,0.1)' } }}>
                        <CloseOutlined fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>

            <DialogContent sx={{ p: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress sx={{ color: '#8B7355' }} />
                    </Box>
                ) : (
                    <Fade in>
                        <Stack spacing={2.5}>
                            {/* Bio */}
                            {(detail?.bio || doctor?.bio) && (
                                <Box>
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.65rem', color: '#A89070', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.75 }}>
                                        About
                                    </Typography>
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.88rem', color: '#4A3728', lineHeight: 1.7 }}>
                                        {detail?.bio || doctor?.bio}
                                    </Typography>
                                </Box>
                            )}

                            <Divider sx={{ borderColor: '#E8DDD0' }} />

                            {/* Contact */}
                            <Box>
                                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.65rem', color: '#A89070', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                                    Contact & License
                                </Typography>
                                <Stack spacing={0.75}>
                                    {(detail?.phone || doctor?.phone) && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <PhoneOutlined sx={{ fontSize: 16, color: '#8B7355' }} />
                                            <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.85rem', color: '#3D2B1F' }}>
                                                {detail?.phone || doctor?.phone}
                                            </Typography>
                                        </Stack>
                                    )}
                                    {(detail?.licenseNumber || doctor?.licenseNumber) && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <BadgeOutlined sx={{ fontSize: 16, color: '#8B7355' }} />
                                            <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.85rem', color: '#3D2B1F' }}>
                                                License: {detail?.licenseNumber || doctor?.licenseNumber}
                                            </Typography>
                                        </Stack>
                                    )}
                                </Stack>
                            </Box>

                            {/* Schedule */}
                            {schedules.length > 0 && (
                                <>
                                    <Divider sx={{ borderColor: '#E8DDD0' }} />
                                    <Box>
                                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.65rem', color: '#A89070', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.25 }}>
                                            Weekly Schedule
                                        </Typography>
                                        <Stack spacing={0.75}>
                                            {schedules.filter(s => s.isActive !== false).map((s, i) => (
                                                <Stack key={i} direction="row" justifyContent="space-between" alignItems="center"
                                                       sx={{ px: 1.5, py: 1, bgcolor: '#F5EFE6', borderRadius: 2 }}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <EventOutlined sx={{ fontSize: 14, color: '#8B7355' }} />
                                                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#3D2B1F' }}>
                                                            {DAYS[s.dayOfWeek ?? s.day_of_week]}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <AccessTimeOutlined sx={{ fontSize: 13, color: '#A89070' }} />
                                                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.8rem', color: '#7A6352' }}>
                                                            {s.startTime || s.start_time} – {s.endTime || s.end_time}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Box>
                                </>
                            )}
                        </Stack>
                    </Fade>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default function DoctorsPage() {
    const { token } = useAuth();
    const navigate  = useNavigate();

    const [doctors, setDoctors]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [search, setSearch]     = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch(`${API}/api/v1/doctors`, { headers: h(token) })
            .then(r => r.json())
            .then(d => { setDoctors(Array.isArray(d) ? d : (d.data || [])); setLoading(false); })
            .catch(() => { setError('Could not load doctors.'); setLoading(false); });
    }, [token]);

    const filtered = doctors.filter(d =>
        `${d.firstName} ${d.lastName} ${d.specialization}`.toLowerCase().includes(search.toLowerCase())
    );

    // group by specialty
    const bySpecialty = filtered.reduce((acc, d) => {
        const s = d.specialization || 'General';
        if (!acc[s]) acc[s] = [];
        acc[s].push(d);
        return acc;
    }, {});

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>

            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 3 }}>
                <Box>
                    <IconButton onClick={() => navigate('/dashboard')} sx={{ mb: 0.5, color: '#8B7355', '&:hover': { bgcolor: '#F2EAE0' } }}>
                        <ArrowBackOutlined />
                    </IconButton>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.72rem', color: '#A89070', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.5 }}>
                        Medical Team
                    </Typography>
                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, color: '#3D2B1F', lineHeight: 1.1 }}>
                        Our Doctors
                    </Typography>
                </Box>
            </Stack>

            {/* Search */}
            <TextField fullWidth placeholder="Search by name or specialty..." value={search}
                       onChange={e => setSearch(e.target.value)} size="small"
                       InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ color: '#A89070', fontSize: 20 }} /></InputAdornment> }}
                       sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: '#FFFCF8', fontFamily: 'Lato, sans-serif', '& fieldset': { borderColor: '#E8DDD0' }, '&:hover fieldset': { borderColor: '#8B7355' }, '&.Mui-focused fieldset': { borderColor: '#8B7355' } } }} />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress sx={{ color: '#8B7355' }} /></Box>
            ) : error ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            ) : (
                <Stack spacing={3.5}>
                    {Object.entries(bySpecialty).map(([specialty, docs]) => {
                        const cfg = specCfg(specialty);
                        return (
                            <Box key={specialty}>
                                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.75 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cfg.color }} />
                                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 600, color: '#3D2B1F' }}>
                                        {specialty}
                                    </Typography>
                                    <Chip label={docs.length} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: cfg.bg, color: cfg.color, fontFamily: 'Lato, sans-serif', fontWeight: 700 }} />
                                </Stack>
                                <Grid container spacing={2}>
                                    {docs.map(doc => (
                                        <Grid item xs={12} sm={6} md={4} key={doc.id}>
                                            <Card elevation={0} sx={{
                                                border: '1px solid #E8DDD0', borderRadius: 3, bgcolor: '#FFFCF8',
                                                transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(139,115,85,0.12)', borderColor: '#C4A882' }
                                            }}>
                                                <CardActionArea onClick={() => setSelected(doc)} sx={{ p: 0 }}>
                                                    {/* Colored top strip */}
                                                    <Box sx={{ height: 4, bgcolor: cfg.color, borderRadius: '12px 12px 0 0', opacity: 0.7 }} />
                                                    <CardContent sx={{ pt: 2, pb: 2.5, px: 2.5 }}>
                                                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                                                            <Avatar sx={{ width: 44, height: 44, background: `linear-gradient(135deg, ${cfg.color}aa, ${cfg.color})`, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                                                                {initials(doc)}
                                                            </Avatar>
                                                            <Box sx={{ minWidth: 0 }}>
                                                                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#2C2416', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    Dr. {doc.firstName} {doc.lastName}
                                                                </Typography>
                                                                <Chip label={specialty} size="small"
                                                                      sx={{ height: 18, fontSize: '0.6rem', fontFamily: 'Lato, sans-serif', fontWeight: 600, bgcolor: cfg.bg, color: cfg.color, mt: 0.3 }} />
                                                            </Box>
                                                        </Stack>
                                                        {doc.bio && (
                                                            <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.75rem', color: '#A89070', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                                {doc.bio}
                                                            </Typography>
                                                        )}
                                                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.25 }}>
                                                            <LocalHospitalOutlined sx={{ fontSize: 13, color: doc.isAvailable !== false ? '#4CAF50' : '#B71C1C' }} />
                                                            <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.68rem', fontWeight: 700, color: doc.isAvailable !== false ? '#4CAF50' : '#B71C1C' }}>
                                                                {doc.isAvailable !== false ? 'Available' : 'Unavailable'}
                                                            </Typography>
                                                        </Stack>
                                                    </CardContent>
                                                </CardActionArea>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        );
                    })}
                </Stack>
            )}

            <DoctorModal doctor={selected} token={token} open={!!selected} onClose={() => setSelected(null)} />
        </Box>
    );
}