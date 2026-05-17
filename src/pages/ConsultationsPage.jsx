import { useEffect, useState } from 'react';
import {
    Box, Typography, Chip, Card, CardContent, CardActionArea,
    Collapse, Divider, Button, CircularProgress, Alert,
    Stack, IconButton, Tab, Tabs,
} from '@mui/material';
import {
    CheckCircleOutlined, EventOutlined, CancelOutlined,
    HourglassEmptyOutlined, LocalHospitalOutlined,
    MedicalServicesOutlined, ScienceOutlined, ExpandMoreOutlined,
    ExpandLessOutlined, AddOutlined, FiberManualRecord,
    AssignmentOutlined, MonitorHeartOutlined, ArrowBackOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8084';

const getMyConsultations = (token) =>
    fetch(`${API}/api/consultations/my`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

/* ─── Status config ──────────────────────────────────────── */
const STATUS = {
    COMPLETED:           { label: 'Completed',         color: '#4CAF50', bg: '#E8F5E9', Icon: CheckCircleOutlined },
    SCHEDULED:           { label: 'Scheduled',         color: '#1565C0', bg: '#E3F2FD', Icon: EventOutlined },
    IN_PROGRESS:         { label: 'In Progress',       color: '#E65100', bg: '#FFF3E0', Icon: HourglassEmptyOutlined },
    CANCELLED:           { label: 'Cancelled',         color: '#B71C1C', bg: '#FFEBEE', Icon: CancelOutlined },
    EMERGENCY_REDIRECT:  { label: 'Emergency',         color: '#B71C1C', bg: '#FFEBEE', Icon: LocalHospitalOutlined },
    DIAGNOSIS_PENDING:   { label: 'Diagnosis Pending', color: '#6A1B9A', bg: '#F3E5F5', Icon: MedicalServicesOutlined },
    FORM_COMPLETED:      { label: 'Form Completed',    color: '#00796B', bg: '#E0F2F1', Icon: AssignmentOutlined },
    FORM_GENERATED:      { label: 'Form Ready',        color: '#0277BD', bg: '#E1F5FE', Icon: AssignmentOutlined },
    PENDING_FORM:        { label: 'Pending Form',      color: '#827717', bg: '#F9FBE7', Icon: HourglassEmptyOutlined },
};

const COMPLEXITY = {
    SIMPLE:    { label: 'Simple',    color: '#2E7D32', bg: '#C8E6C9' },
    MEDIUM:    { label: 'Medium',    color: '#E65100', bg: '#FFE0B2' },
    COMPLEX:   { label: 'Complex',   color: '#4A148C', bg: '#E1BEE7' },
    EMERGENCY: { label: 'Emergency', color: '#B71C1C', bg: '#FFCDD2' },
};

const ALL_TABS = ['All', 'Completed', 'Scheduled', 'Cancelled'];

function StatusChip({ status }) {
    const cfg = STATUS[status] || { label: status, color: '#8B7355', bg: '#F5F0E8', Icon: MonitorHeartOutlined };
    return (
        <Chip
            icon={<cfg.Icon sx={{ fontSize: '14px !important', color: `${cfg.color} !important` }} />}
            label={cfg.label}
            size="small"
            sx={{
                bgcolor: cfg.bg,
                color: cfg.color,
                fontFamily: 'Lato, sans-serif',
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.03em',
                border: `1px solid ${cfg.color}30`,
            }}
        />
    );
}

function ComplexityDot({ level }) {
    const cfg = COMPLEXITY[level];
    if (!cfg) return null;
    return (
        <Chip
            label={cfg.label}
            size="small"
            sx={{
                bgcolor: cfg.bg,
                color: cfg.color,
                fontFamily: 'Lato, sans-serif',
                fontWeight: 600,
                fontSize: '0.68rem',
            }}
        />
    );
}

function ConsultationCard({ consultation }) {
    const [expanded, setExpanded] = useState(false);
    const c = consultation;

    const date = c.createdAt
        ? new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—';

    const statusCfg = STATUS[c.status] || {};
    const lineColor = statusCfg.color || '#8B7355';

    /* Primary diagnosis (prefer CONFIRMED, then AUTO_GENERATED, then PRELIMINARY) */
    const diagnoses = c.diagnoses || [];
    const primaryDx =
        diagnoses.find((d) => d.diagnosisType === 'CONFIRMED') ||
        diagnoses.find((d) => d.diagnosisType === 'AUTO_GENERATED') ||
        diagnoses[0];

    const symptoms = c.symptoms || c.consultationSymptoms || [];

    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 2, position: 'relative' }}>
            {/* Timeline spine */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                <Box
                    sx={{
                        width: 14, height: 14, borderRadius: '50%',
                        bgcolor: lineColor, mt: '18px', flexShrink: 0,
                        boxShadow: `0 0 0 3px ${lineColor}30`,
                        transition: 'box-shadow 0.2s',
                    }}
                />
                <Box sx={{ width: 2, bgcolor: `${lineColor}30`, flexGrow: 1, mt: '4px', minHeight: 24 }} />
            </Box>

            {/* Card */}
            <Card
                elevation={0}
                sx={{
                    flexGrow: 1,
                    bgcolor: '#FFFCF8',
                    border: `1px solid #E8DDD0`,
                    borderRadius: 3,
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                    '&:hover': {
                        boxShadow: '0 4px 20px rgba(139,115,85,0.12)',
                        borderColor: '#C4A882',
                    },
                }}
            >
                {/* Card header — always visible */}
                <CardActionArea onClick={() => setExpanded((p) => !p)} sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ py: 2, px: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.72rem', color: '#A89070', mb: 0.5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    {date}
                                </Typography>
                                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 600, color: '#3D2B1F', lineHeight: 1.3 }}>
                                    {primaryDx ? primaryDx.diagnosisName : (c.notes || `Consultation #${c.id}`)}
                                </Typography>
                                {primaryDx?.icdCode && (
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.7rem', color: '#A89070', mt: 0.25 }}>
                                        ICD-10: {primaryDx.icdCode}
                                    </Typography>
                                )}
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <StatusChip status={c.status} />
                                {c.complexityLevel && <ComplexityDot level={c.complexityLevel} />}
                                <IconButton size="small" sx={{ color: '#8B7355' }}>
                                    {expanded ? <ExpandLessOutlined fontSize="small" /> : <ExpandMoreOutlined fontSize="small" />}
                                </IconButton>
                            </Stack>
                        </Stack>

                        {/* Symptoms pills */}
                        {symptoms.length > 0 && (
                            <Stack direction="row" spacing={0.75} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.75 }}>
                                {symptoms.map((s, i) => (
                                    <Chip
                                        key={i}
                                        label={s.symptomName || s}
                                        size="small"
                                        sx={{
                                            bgcolor: '#F2EAE0',
                                            color: '#6B4F35',
                                            fontFamily: 'Lato, sans-serif',
                                            fontSize: '0.7rem',
                                            fontWeight: 500,
                                            height: 22,
                                        }}
                                    />
                                ))}
                            </Stack>
                        )}
                    </CardContent>
                </CardActionArea>

                {/* Expanded content */}
                <Collapse in={expanded} timeout="auto">
                    <Divider sx={{ borderColor: '#E8DDD0' }} />
                    <CardContent sx={{ pt: 2, pb: 2.5, px: 3 }}>

                        {/* All diagnoses */}
                        {diagnoses.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.72rem', color: '#8B7355', mb: 1, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                    Diagnoses
                                </Typography>
                                <Stack spacing={0.75}>
                                    {diagnoses.map((d, i) => (
                                        <Stack key={i} direction="row" alignItems="center" spacing={1}>
                                            <FiberManualRecord sx={{ fontSize: 7, color: d.diagnosisType === 'CONFIRMED' ? '#4CAF50' : '#C4A882' }} />
                                            <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.85rem', color: '#4A3728', flexGrow: 1 }}>
                                                {d.diagnosisName}
                                            </Typography>
                                            <Chip
                                                label={d.diagnosisType?.replace('_', ' ')}
                                                size="small"
                                                sx={{
                                                    height: 18, fontSize: '0.62rem', fontFamily: 'Lato, sans-serif', fontWeight: 700,
                                                    bgcolor: d.diagnosisType === 'CONFIRMED' ? '#E8F5E9' : '#FFF3E0',
                                                    color: d.diagnosisType === 'CONFIRMED' ? '#2E7D32' : '#E65100',
                                                }}
                                            />
                                            {d.confidenceScore && (
                                                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.72rem', color: '#A89070', minWidth: 40, textAlign: 'right' }}>
                                                    {d.confidenceScore}%
                                                </Typography>
                                            )}
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {/* Outcome badges */}
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                            {c.appointment && (
                                <Chip
                                    icon={<EventOutlined sx={{ fontSize: '14px !important' }} />}
                                    label={`Appointment: ${new Date(c.appointment.startTime || c.appointment.start_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                                    size="small"
                                    sx={{ bgcolor: '#E3F2FD', color: '#1565C0', fontFamily: 'Lato, sans-serif', fontWeight: 600, fontSize: '0.72rem', border: '1px solid #BBDEFB' }}
                                />
                            )}
                            {c.prescription && (
                                <Chip
                                    icon={<MedicalServicesOutlined sx={{ fontSize: '14px !important' }} />}
                                    label={c.prescription.isAutoGenerated || c.prescription.auto_generated ? 'Auto Prescription' : 'Prescription Issued'}
                                    size="small"
                                    sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontFamily: 'Lato, sans-serif', fontWeight: 600, fontSize: '0.72rem', border: '1px solid #C8E6C9' }}
                                />
                            )}
                            {c.referral && (
                                <Chip
                                    icon={<ScienceOutlined sx={{ fontSize: '14px !important' }} />}
                                    label={`${c.referral.referralType || c.referral.referral_type} Referral`}
                                    size="small"
                                    sx={{ bgcolor: '#F3E5F5', color: '#6A1B9A', fontFamily: 'Lato, sans-serif', fontWeight: 600, fontSize: '0.72rem', border: '1px solid #E1BEE7' }}
                                />
                            )}
                        </Stack>

                        {/* Notes */}
                        {c.notes && (
                            <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.82rem', color: '#7A6352', mt: 1.5, fontStyle: 'italic' }}>
                                {c.notes}
                            </Typography>
                        )}
                    </CardContent>
                </Collapse>
            </Card>
        </Box>
    );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function ConsultationsPage() {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState(0);

    useEffect(() => {
        getMyConsultations(token)
            .then((data) => {
                setConsultations(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setError('Could not load consultations. Please try again.');
                setLoading(false);
            });
    }, [token]);

    const filtered = consultations.filter((c) => {
        if (tab === 0) return true;
        if (tab === 1) return c.status === 'COMPLETED';
        if (tab === 2) return ['SCHEDULED', 'IN_PROGRESS', 'FORM_GENERATED', 'FORM_COMPLETED', 'DIAGNOSIS_PENDING', 'PENDING_FORM'].includes(c.status);
        if (tab === 3) return ['CANCELLED', 'EMERGENCY_REDIRECT'].includes(c.status);
        return true;
    });

    const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 860, mx: 'auto' }}>
            {/* Back */}
            <IconButton
                onClick={() => navigate('/dashboard')}
                sx={{ mb: 2, color: '#8B7355', '&:hover': { bgcolor: '#F2EAE0' } }}
            >
                <ArrowBackOutlined />
            </IconButton>

            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 4 }}>
                <Box>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.75rem', color: '#A89070', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.5 }}>
                        Medical Records
                    </Typography>
                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, color: '#3D2B1F', lineHeight: 1.1 }}>
                        My Consultations
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddOutlined />}
                    onClick={() => navigate('/consultations/new')}
                    sx={{
                        bgcolor: '#8B7355', color: '#fff', borderRadius: 3,
                        fontFamily: 'Lato, sans-serif', fontWeight: 600, textTransform: 'none',
                        px: 2.5, py: 1,
                        '&:hover': { bgcolor: '#6D5840' },
                    }}
                >
                    New Consultation
                </Button>
            </Stack>

            {/* Tabs */}
            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                    mb: 3,
                    '& .MuiTab-root': {
                        fontFamily: 'Lato, sans-serif', fontSize: '0.82rem', fontWeight: 600,
                        textTransform: 'none', color: '#A89070', minWidth: 'auto', px: 2,
                    },
                    '& .Mui-selected': { color: '#8B7355 !important' },
                    '& .MuiTabs-indicator': { bgcolor: '#8B7355' },
                }}
            >
                {ALL_TABS.map((t) => (
                    <Tab key={t} label={t} />
                ))}
            </Tabs>

            {/* Content */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
                    <CircularProgress sx={{ color: '#8B7355' }} />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            ) : sorted.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <MonitorHeartOutlined sx={{ fontSize: 56, color: '#D4C4B0', mb: 2 }} />
                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#A89070' }}>
                        No consultations found
                    </Typography>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.85rem', color: '#C4A882', mt: 1 }}>
                        Start a new consultation to see your medical history here.
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/consultations/new')}
                        sx={{ mt: 3, borderColor: '#8B7355', color: '#8B7355', borderRadius: 3, fontFamily: 'Lato, sans-serif', textTransform: 'none', fontWeight: 600 }}
                    >
                        Start Consultation
                    </Button>
                </Box>
            ) : (
                <Box>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.78rem', color: '#A89070', mb: 2 }}>
                        {sorted.length} {sorted.length === 1 ? 'record' : 'records'} found
                    </Typography>
                    {sorted.map((c) => (
                        <ConsultationCard key={c.id} consultation={c} />
                    ))}
                </Box>
            )}
        </Box>
    );
}