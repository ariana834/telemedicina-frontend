import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
    Box, Typography, Chip, Card, CardContent, Stack, Button,
    CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel, IconButton,
} from '@mui/material'
import {
    ArrowBackOutlined, PlayArrowRounded, CheckRounded, PersonOffRounded,
    DescriptionOutlined, ScienceOutlined, AddRounded, DeleteOutlined,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import {
    getAppointmentById, startAppointment, completeAppointment,
    markNoShow, updateNotes, createPrescription, createReferral,
} from '../api/doctor'

const STATUS_COLOR = {
    SCHEDULED: '#1565C0', IN_PROGRESS: '#2E7D32',
    COMPLETED: '#6B5E4E', CANCELLED: '#B71C1C', NO_SHOW: '#E65100',
}
const COMPLEXITY_COLOR = {
    SIMPLE: '#2E7D32', MEDIUM: '#E65100', COMPLEX: '#B71C1C', EMERGENCY: '#7B1FA2',
}

function PrescriptionDialog({ open, onClose, consultationId, token, onSuccess }) {
    const [validDays, setValidDays] = useState(7)
    const [meds, setMeds] = useState([{ medicationName: '', dosage: '', frequency: '', durationDays: '', instructions: '' }])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const addMed = () => setMeds(m => [...m, { medicationName: '', dosage: '', frequency: '', durationDays: '', instructions: '' }])
    const removeMed = (i) => setMeds(m => m.filter((_, idx) => idx !== i))
    const updateMed = (i, field, val) => setMeds(m => m.map((med, idx) => idx === i ? { ...med, [field]: val } : med))

    const handleSubmit = async () => {
        setLoading(true); setError('')
        try {
            await createPrescription(token, {
                consultationId,
                validDays,
                medications: meds.map(m => ({
                    ...m,
                    durationDays: m.durationDays ? parseInt(m.durationDays) : null,
                })),
            })
            onSuccess('Prescription created successfully.')
            onClose()
        } catch {
            setError('Failed to create prescription.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: '#FFFCF8' } }}>
            <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', fontWeight: 700, color: '#3D2B1F' }}>
                Create Prescription
            </DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField label="Valid for (days)" type="number" value={validDays}
                           onChange={e => setValidDays(parseInt(e.target.value))}
                           fullWidth size="small" sx={{ mb: 3, mt: 1 }} />
                <Typography sx={{ fontFamily: '"Lato", sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#8B7355', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
                    Medications
                </Typography>
                {meds.map((med, i) => (
                    <Card key={i} elevation={0} sx={{ border: '1px solid #E8DDD0', borderRadius: 2, p: 2, mb: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                            <Typography sx={{ fontFamily: '"Lato", sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#4A3728' }}>
                                Medication #{i + 1}
                            </Typography>
                            {meds.length > 1 && (
                                <IconButton size="small" onClick={() => removeMed(i)} sx={{ color: '#B71C1C' }}>
                                    <DeleteOutlined fontSize="small" />
                                </IconButton>
                            )}
                        </Stack>
                        <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1.5}>
                                <TextField label="Medication name" value={med.medicationName} onChange={e => updateMed(i, 'medicationName', e.target.value)} fullWidth size="small" />
                                <TextField label="Dosage" value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} size="small" sx={{ width: 140 }} />
                            </Stack>
                            <Stack direction="row" spacing={1.5}>
                                <TextField label="Frequency" value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} fullWidth size="small" />
                                <TextField label="Duration (days)" type="number" value={med.durationDays} onChange={e => updateMed(i, 'durationDays', e.target.value)} size="small" sx={{ width: 140 }} />
                            </Stack>
                            <TextField label="Instructions" value={med.instructions} onChange={e => updateMed(i, 'instructions', e.target.value)} fullWidth size="small" multiline rows={2} />
                        </Stack>
                    </Card>
                ))}
                <Button startIcon={<AddRounded />} onClick={addMed} sx={{ color: '#8B7355', fontFamily: '"Lato", sans-serif', textTransform: 'none' }}>
                    Add medication
                </Button>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, gap: 1 }}>
                <Button onClick={onClose} sx={{ color: '#8B7355', fontFamily: '"Lato", sans-serif', textTransform: 'none' }}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading} variant="contained"
                        sx={{ bgcolor: '#4A6741', '&:hover': { bgcolor: '#3A5332' }, fontFamily: '"Lato", sans-serif', textTransform: 'none', borderRadius: 2 }}>
                    {loading ? 'Creating...' : 'Create Prescription'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

function ReferralDialog({ open, onClose, consultationId, token, onSuccess }) {
    const [form, setForm] = useState({ referralType: 'INVESTIGATION', priority: 'ROUTINE', destination: '', reason: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        setLoading(true); setError('')
        try {
            await createReferral(token, { consultationId, ...form })
            onSuccess('Referral created successfully.')
            onClose()
        } catch {
            setError('Failed to create referral.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: '#FFFCF8' } }}>
            <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', fontWeight: 700, color: '#3D2B1F' }}>
                Create Referral
            </DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select variant="outlined" value={form.referralType} label="Type" onChange={e => setForm(f => ({ ...f, referralType: e.target.value }))}>
                            <MenuItem value="HOSPITAL">Hospital</MenuItem>
                            <MenuItem value="INVESTIGATION">Investigation</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                        <InputLabel>Priority</InputLabel>
                        <Select variant="outlined" value={form.priority} label="Priority" onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                            <MenuItem value="ROUTINE">Routine</MenuItem>
                            <MenuItem value="URGENT">Urgent</MenuItem>
                            <MenuItem value="EMERGENCY">Emergency</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField label="Destination" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} fullWidth size="small" placeholder="e.g. Cardiology Lab — Spitalul Județean" />
                    <TextField label="Reason" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} fullWidth size="small" multiline rows={3} placeholder="Clinical reason for referral..." />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, gap: 1 }}>
                <Button onClick={onClose} sx={{ color: '#8B7355', fontFamily: '"Lato", sans-serif', textTransform: 'none' }}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading || !form.destination || !form.reason} variant="contained"
                        sx={{ bgcolor: '#1565C0', '&:hover': { bgcolor: '#0D47A1' }, fontFamily: '"Lato", sans-serif', textTransform: 'none', borderRadius: 2 }}>
                    {loading ? 'Creating...' : 'Create Referral'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default function DoctorConsultationPage() {
    const { appointmentId } = useParams()
    const { token } = useAuth()
    const navigate = useNavigate()
    const { state } = useLocation()

    const [appt, setAppt]                   = useState(state?.appt || null)
    const [loading, setLoading]             = useState(!state?.appt)
    const [error, setError]                 = useState('')
    const [success, setSuccess]             = useState('')
    const [actionLoading, setActionLoading] = useState(false)
    const [notes, setNotes]                 = useState(state?.appt?.notes || '')
    const [showPrescription, setShowPrescription] = useState(false)
    const [showReferral, setShowReferral]         = useState(false)

    const load = () => {
        getAppointmentById(token, appointmentId)
            .then(data => {
                if (data?.id) { setAppt(data); setNotes(data.notes || '') }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }

    useEffect(() => { if (!state?.appt) load() }, [appointmentId])

    const act = async (fn, successMsg) => {
        setActionLoading(true); setError(''); setSuccess('')
        try {
            await fn()
            setSuccess(successMsg)
            load()
        } catch (e) {
            setError(e?.message || 'Action failed.')
        } finally {
            setActionLoading(false)
        }
    }

    const handleSaveNotes = () => act(
        () => updateNotes(token, appointmentId, notes),
        'Notes saved.'
    )

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
            <CircularProgress sx={{ color: '#4A6741' }} />
        </Box>
    )

    if (!appt) return (
        <Box sx={{ p: 4 }}>
            <Alert severity="error">Could not load appointment.</Alert>
        </Box>
    )

    const status   = typeof appt.status === 'string' ? appt.status : ''
    const canStart  = status === 'SCHEDULED'
    const canNoShow = status === 'SCHEDULED'
    const canAct    = status === 'IN_PROGRESS'

    const patientName = appt.patientFirstName
        ? `${appt.patientFirstName} ${appt.patientLastName}`
        : `Patient #${appt.patientId}`

    const startLabel = appt.startTime
        ? new Date(appt.startTime).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        : '—'

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 860, mx: 'auto' }}>
            <IconButton onClick={() => navigate('/doctor/dashboard')} sx={{ mb: 2, color: '#4A6741', '&:hover': { bgcolor: '#E8F5E9' } }}>
                <ArrowBackOutlined />
            </IconButton>

            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
            {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {/* Header */}
            <Card elevation={0} sx={{ bgcolor: '#FFFCF8', border: '1px solid #E8DDD0', borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
                        <Box>
                            <Typography sx={{ fontFamily: '"Lato", sans-serif', fontSize: '0.7rem', color: '#A89070', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>
                                Consultation
                            </Typography>
                            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 700, color: '#3D2B1F' }}>
                                {patientName}
                            </Typography>
                            <Typography sx={{ fontFamily: '"Lato", sans-serif', fontSize: '0.82rem', color: '#8B7355', mt: 0.5 }}>
                                {startLabel} · {appt.durationMinutes} min
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                            {appt.complexityLevel && (
                                <Chip label={appt.complexityLevel} size="small" sx={{
                                    bgcolor: `${COMPLEXITY_COLOR[appt.complexityLevel]}18`,
                                    color: COMPLEXITY_COLOR[appt.complexityLevel],
                                    fontFamily: '"Lato", sans-serif', fontWeight: 700,
                                }} />
                            )}
                            {status && (
                                <Chip label={status.replace('_', ' ')} size="small" sx={{
                                    bgcolor: `${STATUS_COLOR[status]}18`,
                                    color: STATUS_COLOR[status],
                                    fontFamily: '"Lato", sans-serif', fontWeight: 700,
                                }} />
                            )}
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            {/* Actions */}
            <Card elevation={0} sx={{ bgcolor: '#FFFCF8', border: '1px solid #E8DDD0', borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.15rem', fontWeight: 700, color: '#3D2B1F', mb: 2 }}>
                        Actions
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1.5}>
                        {canStart && (
                            <Button variant="contained" startIcon={<PlayArrowRounded />} disabled={actionLoading}
                                    onClick={() => act(() => startAppointment(token, appointmentId), 'Consultation started.')}
                                    sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' }, fontFamily: '"Lato", sans-serif', textTransform: 'none', borderRadius: 2 }}>
                                Start Consultation
                            </Button>
                        )}
                        {canNoShow && (
                            <Button variant="outlined" startIcon={<PersonOffRounded />} disabled={actionLoading}
                                    onClick={() => act(() => markNoShow(token, appointmentId), 'Marked as no-show.')}
                                    sx={{ color: '#E65100', borderColor: '#E65100', fontFamily: '"Lato", sans-serif', textTransform: 'none', borderRadius: 2,
                                        '&:hover': { borderColor: '#BF360C', bgcolor: '#FFF3E0' } }}>
                                No Show
                            </Button>
                        )}
                        {canAct && (
                            <>
                                <Button variant="outlined" startIcon={<DescriptionOutlined />}
                                        onClick={() => setShowPrescription(true)}
                                        sx={{ color: '#1565C0', borderColor: '#1565C0', fontFamily: '"Lato", sans-serif', textTransform: 'none', borderRadius: 2,
                                            '&:hover': { bgcolor: '#E3F2FD' } }}>
                                    Create Prescription
                                </Button>
                                <Button variant="outlined" startIcon={<ScienceOutlined />}
                                        onClick={() => setShowReferral(true)}
                                        sx={{ color: '#6A1B9A', borderColor: '#6A1B9A', fontFamily: '"Lato", sans-serif', textTransform: 'none', borderRadius: 2,
                                            '&:hover': { bgcolor: '#F3E5F5' } }}>
                                    Create Referral
                                </Button>
                                <Button variant="contained" startIcon={<CheckRounded />} disabled={actionLoading}
                                        onClick={() => act(() => completeAppointment(token, appointmentId), 'Consultation completed.')}
                                        sx={{ bgcolor: '#4A6741', '&:hover': { bgcolor: '#3A5332' }, fontFamily: '"Lato", sans-serif', textTransform: 'none', borderRadius: 2 }}>
                                    Complete
                                </Button>
                            </>
                        )}
                        {status === 'COMPLETED' && (
                            <Typography sx={{ fontFamily: '"Lato", sans-serif', fontSize: '0.85rem', color: '#A89070', py: 1 }}>
                                ✓ This consultation is completed.
                            </Typography>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Notes */}
            <Card elevation={0} sx={{ bgcolor: '#FFFCF8', border: '1px solid #E8DDD0', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.15rem', fontWeight: 700, color: '#3D2B1F', mb: 2 }}>
                        Notes & Observations
                    </Typography>
                    <TextField value={notes} onChange={e => setNotes(e.target.value)}
                               multiline rows={4} fullWidth placeholder="Add clinical notes, observations, recommendations..."
                               sx={{ mb: 2 }} />
                    <Button onClick={handleSaveNotes} disabled={actionLoading} variant="contained"
                            sx={{ bgcolor: '#8B7355', '&:hover': { bgcolor: '#6B5940' }, fontFamily: '"Lato", sans-serif', textTransform: 'none', borderRadius: 2 }}>
                        Save Notes
                    </Button>
                </CardContent>
            </Card>

            <PrescriptionDialog
                open={showPrescription}
                onClose={() => setShowPrescription(false)}
                consultationId={appt.consultationId}
                token={token}
                onSuccess={msg => setSuccess(msg)}
            />
            <ReferralDialog
                open={showReferral}
                onClose={() => setShowReferral(false)}
                consultationId={appt.consultationId}
                token={token}
                onSuccess={msg => setSuccess(msg)}
            />
        </Box>
    )
}