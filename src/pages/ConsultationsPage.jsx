import { useEffect, useState } from 'react';
import {
    Box, Typography, Chip, Card, CardContent, CardActionArea,
    Collapse, Divider, Button, CircularProgress, Alert,
    Stack, IconButton, Tab, Tabs, Fade, Dialog, DialogTitle,
    DialogContent, DialogActions,
} from '@mui/material';
import {
    CheckCircleOutlined, EventOutlined, CancelOutlined,
    HourglassEmptyOutlined, LocalHospitalOutlined,
    MedicalServicesOutlined, ScienceOutlined, ExpandMoreOutlined,
    ExpandLessOutlined, AddOutlined, FiberManualRecord,
    AssignmentOutlined, MonitorHeartOutlined, ArrowBackOutlined,
    PlayArrowOutlined, BlockOutlined, WarningAmberOutlined,
    ReceiptOutlined, CloseOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8084';
const h   = (token) => ({ Authorization: `Bearer ${token}` });
const get = (url, token) => fetch(`${API}${url}`, { headers: h(token) }).then(r => r.json());

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

// Statuses that can be continued
const CONTINUABLE = ['FORM_GENERATED', 'PENDING_FORM', 'FORM_COMPLETED', 'DIAGNOSIS_PENDING'];
const STEP_MAP    = { FORM_GENERATED: 2, PENDING_FORM: 2, FORM_COMPLETED: 2, DIAGNOSIS_PENDING: 3 };

const ALL_TABS = ['All', 'Completed', 'Active', 'Cancelled'];

/* ── Cancel Dialog ───────────────────────────────────────── */
function CancelDialog({ open, onClose, onConfirm, loading }) {
    return (
        <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: 3, bgcolor: '#FFFCF8', border: '1.5px solid #EDE5D8' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 700, color: '#3D2B1F' }}>
                    Cancel Consultation?
                </Typography>
                {!loading && <IconButton size="small" onClick={onClose}><CloseOutlined fontSize="small" sx={{ color: '#A89070' }} /></IconButton>}
            </DialogTitle>
            <DialogContent>
                <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
                    <WarningAmberOutlined sx={{ color: '#E65100', mt: 0.25 }} />
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.85rem', color: '#7A6352', lineHeight: 1.7 }}>
                        This will permanently cancel the consultation. Any symptoms and form answers already submitted will be lost.
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button fullWidth variant="outlined" disabled={loading} onClick={onClose}
                        sx={{ borderColor: '#C4A882', color: '#8B7355', borderRadius: 2, fontFamily: 'Lato, sans-serif', fontWeight: 700, textTransform: 'none' }}>
                    Keep It
                </Button>
                <Button fullWidth variant="contained" disabled={loading} onClick={onConfirm}
                        sx={{ bgcolor: '#B71C1C', borderRadius: 2, fontFamily: 'Lato, sans-serif', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#8B0000' } }}>
                    {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Yes, Cancel'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ── Prescription inline ─────────────────────────────────── */
function LinkedPrescription({ consultationId, token }) {
    const [data, setData]   = useState(null);
    const [done, setDone]   = useState(false);

    useEffect(() => {
        get(`/api/v1/prescriptions/consultation/${consultationId}`, token)
            .then(d => { setData(d); setDone(true); })
            .catch(() => setDone(true));
    }, [consultationId, token]);

    if (!done || !data) return null;
    const meds = data.medications || data.prescriptionMedications || [];

    return (
        <Box sx={{ mt: 1.5, p: 1.75, borderRadius: 2, bgcolor: '#E8F5E9', border: '1px solid #C8E6C9' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: meds.length > 0 ? 1 : 0 }}>
                <ReceiptOutlined sx={{ fontSize: 15, color: '#2E7D32' }} />
                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.72rem', color: '#2E7D32', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Prescription #{data.id} · {data.isAutoGenerated ? 'Auto' : 'Doctor issued'}
                </Typography>
            </Stack>
            {meds.slice(0, 3).map((m, i) => (
                <Stack key={i} direction="row" justifyContent="space-between" sx={{ py: 0.3 }}>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#1B5E20' }}>
                        {m.medicationName || m.medication_name}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.72rem', color: '#388E3C' }}>
                        {m.dosage}
                    </Typography>
                </Stack>
            ))}
            {meds.length > 3 && <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.68rem', color: '#66BB6A', mt: 0.5 }}>+{meds.length - 3} more medications</Typography>}
        </Box>
    );
}

/* ── Referral inline ─────────────────────────────────────── */
function LinkedReferral({ consultationId, token }) {
    const [data, setData] = useState(null);
    const [done, setDone] = useState(false);

    useEffect(() => {
        get(`/api/referrals/consultation/${consultationId}`, token)
            .then(d => { setData(d); setDone(true); })
            .catch(() => setDone(true));
    }, [consultationId, token]);

    if (!done || !data) return null;
    const isHospital = (data.referralType || data.referral_type) === 'HOSPITAL';
    const col = isHospital ? '#B71C1C' : '#1A237E';
    const bg  = isHospital ? '#FFEBEE' : '#E8EAF6';

    return (
        <Box sx={{ mt: 1, p: 1.75, borderRadius: 2, bgcolor: bg, border: `1px solid ${col}30` }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <ScienceOutlined sx={{ fontSize: 15, color: col }} />
                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.72rem', color: col, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {data.referralType || data.referral_type} Referral · {data.priority}
                </Typography>
            </Stack>
            {data.destination && (
                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: col, mt: 0.5 }}>→ {data.destination}</Typography>
            )}
            {data.reason && (
                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.75rem', color: col, opacity: 0.8 }}>{data.reason}</Typography>
            )}
        </Box>
    );
}

/* ── Consultation Detail ─────────────────────────────────── */
function ConsultationDetail({ consultationId, status, token }) {
    const [detail, setDetail]   = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        get(`/api/consultations/${consultationId}`, token)
            .then(d => { setDetail(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [consultationId, token]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}><CircularProgress size={18} sx={{ color: '#8B7355' }} /></Box>;
    if (!detail) return null;

    const diagnoses = detail.diagnoses || [];
    const isFinished = ['COMPLETED', 'SCHEDULED', 'CANCELLED', 'EMERGENCY_REDIRECT'].includes(status);

    return (
        <Fade in>
            <Box>
                {/* Diagnoses */}
                {diagnoses.length > 0 && (
                    <Box sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.65rem', color: '#8B7355', mb: 1, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Diagnoses
                        </Typography>
                        <Stack spacing={0.5}>
                            {diagnoses.map((d, i) => (
                                <Stack key={i} direction="row" alignItems="center" justifyContent="space-between"
                                       sx={{ px: 1.5, py: 0.875, bgcolor: '#F5EFE6', borderRadius: 1.5 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <FiberManualRecord sx={{ fontSize: 7, color: d.diagnosisType === 'CONFIRMED' ? '#4CAF50' : '#C4A882' }} />
                                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#3D2B1F' }}>{d.diagnosisName}</Typography>
                                        {d.icdCode && <Chip label={d.icdCode} size="small" sx={{ height: 16, fontSize: '0.58rem', bgcolor: '#EDE5D8', color: '#6B4F35' }} />}
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={0.75}>
                                        <Chip label={d.diagnosisType?.replace('_',' ')} size="small"
                                              sx={{ height: 18, fontSize: '0.6rem', fontFamily: 'Lato, sans-serif', fontWeight: 700,
                                                  bgcolor: d.diagnosisType === 'CONFIRMED' ? '#E8F5E9' : '#FFF3E0',
                                                  color:   d.diagnosisType === 'CONFIRMED' ? '#2E7D32' : '#E65100' }} />
                                        {d.confidenceScore != null && (
                                            <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.7rem', color: '#A89070' }}>{d.confidenceScore}%</Typography>
                                        )}
                                    </Stack>
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Linked prescription + referral (only for finished consultations) */}
                {isFinished && (
                    <>
                        <LinkedPrescription consultationId={consultationId} token={token} />
                        <LinkedReferral     consultationId={consultationId} token={token} />
                    </>
                )}

                {detail.notes && (
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.78rem', color: '#7A6352', mt: 1.5, fontStyle: 'italic' }}>
                        "{detail.notes}"
                    </Typography>
                )}
            </Box>
        </Fade>
    );
}

/* ── Consultation Card ───────────────────────────────────── */
function ConsultationCard({ consultation, onCancelled }) {
    const { token } = useAuth();
    const navigate  = useNavigate();
    const [expanded, setExpanded]   = useState(false);
    const [showCancel, setShowCancel] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const c = consultation;

    const date       = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
    const statusCfg  = STATUS[c.status] || {};
    const lineColor  = statusCfg.color || '#8B7355';
    const symptoms   = c.symptoms || c.consultationSymptoms || [];
    const diagnoses  = c.diagnoses || [];
    const primaryDx  = diagnoses.find(d => d.diagnosisType === 'CONFIRMED') || diagnoses.find(d => d.diagnosisType === 'AUTO_GENERATED') || diagnoses[0];
    const canContinue = CONTINUABLE.includes(c.status);
    const canCancel   = ['PENDING_FORM', 'FORM_GENERATED', 'FORM_COMPLETED'].includes(c.status);

    const handleContinue = () => {
        const step = STEP_MAP[c.status] || 2;
        navigate(`/consultations/new?id=${c.id}&step=${step}`);
    };

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await fetch(`${API}/api/consultations/${c.id}/cancel`, { method: 'POST', headers: h(token) });
            setShowCancel(false);
            onCancelled(c.id);
        } catch {
            setCancelling(false);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                {/* Timeline dot */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
                    <Box sx={{ width: 13, height: 13, borderRadius: '50%', bgcolor: lineColor, mt: '20px', flexShrink: 0, boxShadow: `0 0 0 3px ${lineColor}22` }} />
                    <Box sx={{ width: 2, bgcolor: `${lineColor}20`, flexGrow: 1, mt: '4px', minHeight: 20 }} />
                </Box>

                <Card elevation={0} sx={{ flexGrow: 1, bgcolor: '#FFFCF8', border: '1px solid #E8DDD0', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(139,115,85,0.1)', borderColor: '#C4A882' } }}>
                    {/* Header */}
                    <CardActionArea onClick={() => setExpanded(p => !p)} sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ py: 2, px: 2.5 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.65rem', color: '#A89070', mb: 0.4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                        {date}
                                    </Typography>
                                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', fontWeight: 600, color: '#3D2B1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {primaryDx ? primaryDx.diagnosisName : (c.notes || `Consultation #${c.id}`)}
                                    </Typography>
                                </Box>
                                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ ml: 1, flexShrink: 0 }}>
                                    <Chip icon={<statusCfg.Icon sx={{ fontSize: '12px !important', color: `${statusCfg.color} !important` }} />}
                                          label={statusCfg.label} size="small"
                                          sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.65rem', border: `1px solid ${statusCfg.color}30` }} />
                                    {c.complexityLevel && (
                                        <Chip label={COMPLEXITY[c.complexityLevel]?.label} size="small"
                                              sx={{ height: 20, fontSize: '0.6rem', fontFamily: 'Lato, sans-serif', fontWeight: 700,
                                                  bgcolor: COMPLEXITY[c.complexityLevel]?.bg, color: COMPLEXITY[c.complexityLevel]?.color }} />
                                    )}
                                    <IconButton size="small" sx={{ color: '#8B7355' }}>
                                        {expanded ? <ExpandLessOutlined fontSize="small" /> : <ExpandMoreOutlined fontSize="small" />}
                                    </IconButton>
                                </Stack>
                            </Stack>

                            {symptoms.length > 0 && (
                                <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                                    {symptoms.map((s, i) => (
                                        <Chip key={i} label={s.symptomName || s.symptom_name || s} size="small"
                                              sx={{ bgcolor: '#F2EAE0', color: '#6B4F35', fontFamily: 'Lato, sans-serif', fontSize: '0.65rem', height: 18 }} />
                                    ))}
                                </Stack>
                            )}
                        </CardContent>
                    </CardActionArea>

                    {/* Action buttons for active consultations */}
                    {(canContinue || canCancel) && (
                        <Box sx={{ px: 2.5, pb: 2, pt: 0 }}>
                            <Stack direction="row" spacing={1}>
                                {canContinue && (
                                    <Button size="small" variant="contained" startIcon={<PlayArrowOutlined sx={{ fontSize: '15px !important' }} />}
                                            onClick={handleContinue}
                                            sx={{ bgcolor: '#8B7355', color: '#fff', fontFamily: 'Lato, sans-serif', fontWeight: 700, textTransform: 'none', fontSize: '0.78rem', borderRadius: 2, px: 2, '&:hover': { bgcolor: '#6D5840' } }}>
                                        Continue
                                    </Button>
                                )}
                                {canCancel && (
                                    <Button size="small" variant="outlined" startIcon={<BlockOutlined sx={{ fontSize: '14px !important' }} />}
                                            onClick={(e) => { e.stopPropagation(); setShowCancel(true); }}
                                            sx={{ borderColor: '#FFCDD2', color: '#B71C1C', fontFamily: 'Lato, sans-serif', fontWeight: 700, textTransform: 'none', fontSize: '0.78rem', borderRadius: 2, px: 2, '&:hover': { bgcolor: '#FFEBEE', borderColor: '#B71C1C' } }}>
                                        Cancel
                                    </Button>
                                )}
                            </Stack>
                        </Box>
                    )}

                    {/* Expanded detail */}
                    <Collapse in={expanded} timeout="auto">
                        <Divider sx={{ borderColor: '#E8DDD0' }} />
                        <CardContent sx={{ pt: 2, pb: 2.5, px: 2.5 }}>
                            <ConsultationDetail consultationId={c.id} status={c.status} token={token} />
                        </CardContent>
                    </Collapse>
                </Card>
            </Box>

            <CancelDialog
                open={showCancel}
                onClose={() => setShowCancel(false)}
                onConfirm={handleCancel}
                loading={cancelling}
            />
        </>
    );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function ConsultationsPage() {
    const { token } = useAuth();
    const navigate  = useNavigate();

    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState('');
    const [tab, setTab]                     = useState(0);

    useEffect(() => {
        get('/api/consultations/my', token)
            .then(d => { setConsultations(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => { setError('Could not load consultations.'); setLoading(false); });
    }, [token]);

    const handleCancelled = (id) => {
        setConsultations(prev => prev.map(c => c.id === id ? { ...c, status: 'CANCELLED' } : c));
    };

    const filtered = consultations.filter(c => {
        if (tab === 0) return true;
        if (tab === 1) return c.status === 'COMPLETED';
        if (tab === 2) return ['SCHEDULED','IN_PROGRESS','FORM_GENERATED','FORM_COMPLETED','DIAGNOSIS_PENDING','PENDING_FORM'].includes(c.status);
        if (tab === 3) return ['CANCELLED','EMERGENCY_REDIRECT'].includes(c.status);
        return true;
    });
    const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const activeCount = consultations.filter(c => CONTINUABLE.includes(c.status)).length;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 860, mx: 'auto' }}>

            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 4 }}>
                <Box>
                    <IconButton onClick={() => navigate('/dashboard')} sx={{ mb: 0.5, color: '#8B7355', '&:hover': { bgcolor: '#F2EAE0' } }}>
                        <ArrowBackOutlined />
                    </IconButton>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.72rem', color: '#A89070', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.5 }}>
                        Medical Records
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, color: '#3D2B1F', lineHeight: 1.1 }}>
                            My Consultations
                        </Typography>
                        {activeCount > 0 && (
                            <Chip label={`${activeCount} in progress`} size="small"
                                  sx={{ bgcolor: '#FFF3E0', color: '#E65100', fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.7rem', border: '1px solid #FFE0B2' }} />
                        )}
                    </Stack>
                </Box>
                <Button variant="contained" startIcon={<AddOutlined />} onClick={() => navigate('/consultations/new')}
                        sx={{ bgcolor: '#8B7355', color: '#fff', borderRadius: 3, fontFamily: 'Lato, sans-serif', fontWeight: 600, textTransform: 'none', px: 2.5, py: 1, '&:hover': { bgcolor: '#6D5840' } }}>
                    New
                </Button>
            </Stack>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3,
                '& .MuiTab-root': { fontFamily: 'Lato, sans-serif', fontSize: '0.82rem', fontWeight: 600, textTransform: 'none', color: '#A89070', minWidth: 'auto', px: 2 },
                '& .Mui-selected': { color: '#8B7355 !important' },
                '& .MuiTabs-indicator': { bgcolor: '#8B7355' } }}>
                {ALL_TABS.map(t => <Tab key={t} label={t} />)}
            </Tabs>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress sx={{ color: '#8B7355' }} /></Box>
            ) : error ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            ) : sorted.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <MonitorHeartOutlined sx={{ fontSize: 56, color: '#D4C4B0', mb: 2 }} />
                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#A89070' }}>No consultations found</Typography>
                    <Button variant="outlined" onClick={() => navigate('/consultations/new')}
                            sx={{ mt: 3, borderColor: '#8B7355', color: '#8B7355', borderRadius: 3, fontFamily: 'Lato, sans-serif', textTransform: 'none', fontWeight: 600 }}>
                        Start Consultation
                    </Button>
                </Box>
            ) : (
                <Box>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.75rem', color: '#A89070', mb: 2 }}>
                        {sorted.length} {sorted.length === 1 ? 'record' : 'records'} · click card to expand
                    </Typography>
                    {sorted.map(c => (
                        <ConsultationCard key={c.id} consultation={c} onCancelled={handleCancelled} />
                    ))}
                </Box>
            )}
        </Box>
    );
}