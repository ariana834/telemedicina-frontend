import { useEffect, useState, useCallback } from 'react';
import {
    Box, Typography, Chip, Card, CardContent, Stack, Divider,
    CircularProgress, Alert, Avatar, Button, Dialog, DialogContent,
    DialogTitle, IconButton, Fade, Collapse, Skeleton, Tooltip,
} from '@mui/material';
import {
    EventOutlined, AccessTimeOutlined, CheckCircleOutlined,
    CancelOutlined, HourglassEmptyOutlined, DoNotDisturbOutlined,
    ScheduleOutlined, ArrowBackOutlined, CloseOutlined,
    InfoOutlined, WarningAmberOutlined,
    EditCalendarOutlined, PersonOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8084';
const h   = (token) => ({ Authorization: `Bearer ${token}` });

const api = {
    myAppointments: (token) =>
        fetch(`${API}/api/v1/appointments/my`, { headers: h(token) }).then(r => r.json()),
    availableSlots: (token, date, dur) =>
        fetch(`${API}/api/v1/appointments/available-slots?date=${date}&duration=${dur}`, { headers: h(token) }).then(r => r.json()),
    cancel: (token, id) =>
        fetch(`${API}/api/v1/appointments/${id}/cancel`, { method: 'POST', headers: h(token) })
            .then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    reschedule: (token, id, body) =>
        fetch(`${API}/api/v1/appointments/${id}/reschedule`, {
            method: 'PATCH',
            headers: { ...h(token), 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
};

const APPT_STATUS = {
    SCHEDULED:   { label: 'Scheduled',   color: '#1565C0', bg: '#E3F2FD', Icon: ScheduleOutlined },
    IN_PROGRESS: { label: 'In Progress', color: '#E65100', bg: '#FFF3E0', Icon: HourglassEmptyOutlined },
    COMPLETED:   { label: 'Completed',   color: '#2E7D32', bg: '#E8F5E9', Icon: CheckCircleOutlined },
    CANCELLED:   { label: 'Cancelled',   color: '#B71C1C', bg: '#FFEBEE', Icon: CancelOutlined },
    NO_SHOW:     { label: 'No Show',     color: '#6D4C41', bg: '#EFEBE9', Icon: DoNotDisturbOutlined },
};

const DUR_LABEL = { 10: 'Simple · 10 min', 20: 'Medium · 20 min', 30: 'Complex · 30 min' };
const DUR_COLOR = {
    10: { bg: '#E3F2FD', color: '#1565C0' },
    20: { bg: '#FFF3E0', color: '#E65100' },
    30: { bg: '#F3E5F5', color: '#6A1B9A' },
};

const DAYS  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fmtTime   = (dt) => new Date(dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const fmtDate   = (dt, opts) => new Date(dt).toLocaleDateString('en-GB', opts);
const toISODate = (d) => d.toISOString().split('T')[0];
const addDays   = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };


/* ──────────────────────────────────────────────────────────
   CANCEL DIALOG
────────────────────────────────────────────────────────── */
function CancelDialog({ open, appt, loading, error, onClose, onConfirm }) {
    if (!appt) return null;
    const start = appt.startTime || appt.start_time;
    return (
        <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: 3, bgcolor: '#FFFCF8', border: '1.5px solid #EDE5D8' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 700, color: '#3D2B1F' }}>
                    Cancel Appointment?
                </Typography>
                {!loading && <IconButton size="small" onClick={onClose}><CloseOutlined fontSize="small" sx={{ color: '#A89070' }} /></IconButton>}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ bgcolor: '#FFF3E0', border: '1px solid #FFE0B2', borderRadius: 2, p: 2, mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <WarningAmberOutlined sx={{ fontSize: 17, color: '#E65100' }} />
                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#E65100' }}>
                            This action cannot be undone
                        </Typography>
                    </Stack>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.8rem', color: '#7A6352' }}>
                        Appointment on <strong>{fmtDate(start, { weekday: 'long', day: 'numeric', month: 'long' })}</strong> at <strong>{fmtTime(start)}</strong> will be permanently cancelled.
                    </Typography>
                </Box>
                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                <Stack spacing={1.25}>
                    <Button fullWidth variant="contained" disabled={loading} onClick={onConfirm}
                            sx={{ bgcolor: '#B71C1C', borderRadius: 2, fontFamily: 'Lato, sans-serif', fontWeight: 700, textTransform: 'none', py: 1.2, '&:hover': { bgcolor: '#8B0000' } }}>
                        {loading
                            ? <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={16} sx={{ color: '#fff' }} /><span>Cancelling…</span></Stack>
                            : 'Yes, Cancel Appointment'}
                    </Button>
                    <Button fullWidth variant="outlined" disabled={loading} onClick={onClose}
                            sx={{ borderColor: '#C4A882', color: '#8B7355', borderRadius: 2, fontFamily: 'Lato, sans-serif', fontWeight: 700, textTransform: 'none', py: 1.2, '&:hover': { bgcolor: '#F5EFE6' } }}>
                        Keep Appointment
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}


/* ──────────────────────────────────────────────────────────
   RESCHEDULE DIALOG
────────────────────────────────────────────────────────── */
function RescheduleDialog({ open, appt, token, onClose, onSuccess }) {
    const dur = appt?.durationMinutes || appt?.duration_minutes || 20;

    const [selectedDate, setSelectedDate] = useState(addDays(new Date(), 1));
    const [slots, setSlots]               = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [saving, setSaving]             = useState(false);
    const [error, setError]               = useState('');

    const byDoctor = slots.reduce((acc, s) => {
        if (!acc[s.doctorId]) acc[s.doctorId] = { ...s, slots: [] };
        acc[s.doctorId].slots.push(s);
        return acc;
    }, {});

    const loadSlots = useCallback(async (date) => {
        setLoadingSlots(true); setSlots([]); setSelectedSlot(null); setError('');
        try {
            const data = await api.availableSlots(token, toISODate(date), dur);
            setSlots(Array.isArray(data) ? data : []);
        } catch {
            setError('Could not load available slots.');
        } finally {
            setLoadingSlots(false);
        }
    }, [token, dur]);

    useEffect(() => { if (open) { const d = addDays(new Date(), 1); setSelectedDate(d); loadSlots(d); } }, [open, loadSlots]);

    const handleConfirm = async () => {
        if (!selectedSlot) return;
        setSaving(true); setError('');
        try {
            await api.reschedule(token, appt.id, { doctorId: selectedSlot.doctorId, newStartTime: selectedSlot.slotStart });
            onSuccess();
        } catch {
            setError('Could not reschedule. The slot may no longer be available.');
        } finally { setSaving(false); }
    };

    if (!appt) return null;
    const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));

    return (
        <Dialog open={open} onClose={!saving ? onClose : undefined} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3, bgcolor: '#FFFCF8', border: '1.5px solid #EDE5D8', maxHeight: '90vh' } }}>
            <DialogTitle sx={{ pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, color: '#3D2B1F' }}>
                        Reschedule Appointment
                    </Typography>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.75rem', color: '#A89070', mt: 0.25 }}>
                        {DUR_LABEL[dur]} · pick a new slot
                    </Typography>
                </Box>
                {!saving && <IconButton size="small" onClick={onClose} sx={{ mt: 0.5 }}><CloseOutlined fontSize="small" sx={{ color: '#A89070' }} /></IconButton>}
            </DialogTitle>

            <DialogContent sx={{ px: 3, pb: 3 }}>

                {/* 7-day strip */}
                <Stack direction="row" spacing={0.75} sx={{ mb: 2.5 }}>
                    {days.map((d) => {
                        const isSel = toISODate(d) === toISODate(selectedDate);
                        return (
                            <Box key={toISODate(d)}
                                 onClick={() => { setSelectedDate(d); loadSlots(d); }}
                                 sx={{
                                     flex: 1, textAlign: 'center', py: 1.1, borderRadius: 2, cursor: 'pointer',
                                     border: isSel ? '2px solid #8B7355' : '1.5px solid #EDE5D8',
                                     bgcolor: isSel ? '#8B7355' : '#FDFAF6',
                                     transition: 'all 0.15s',
                                     '&:hover': { borderColor: '#8B7355', bgcolor: isSel ? '#8B7355' : '#F5EFE6' },
                                 }}>
                                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.6rem', fontWeight: 700, color: isSel ? 'rgba(255,252,248,0.65)' : '#A89070', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    {DAYS[d.getDay()]}
                                </Typography>
                                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 700, color: isSel ? '#FFFCF8' : '#3D2B1F', lineHeight: 1.2 }}>
                                    {d.getDate()}
                                </Typography>
                            </Box>
                        );
                    })}
                </Stack>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                {/* Slot grid */}
                {loadingSlots ? (
                    <Stack spacing={1}>{[1,2,3].map(i => <Skeleton key={i} height={68} sx={{ borderRadius: 2 }} />)}</Stack>
                ) : Object.keys(byDoctor).length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                        <Typography sx={{ fontSize: '2.5rem', mb: 1.5 }}>📭</Typography>
                        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#A89070' }}>No available slots this day</Typography>
                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.78rem', color: '#C4A882', mt: 0.5 }}>Try another date</Typography>
                    </Box>
                ) : (
                    <Stack spacing={2.5}>
                        {Object.values(byDoctor).map((doc) => (
                            <Box key={doc.doctorId}>
                                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.25 }}>
                                    <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(135deg, #8B7355, #C4A882)', fontSize: '0.78rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 700 }}>
                                        {doc.doctorName.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#3D2B1F' }}>Dr. {doc.doctorName}</Typography>
                                        {doc.specialty && <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.7rem', color: '#A89070' }}>{doc.specialty}</Typography>}
                                    </Box>
                                </Stack>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                    {doc.slots.map((slot) => {
                                        const isSel = selectedSlot?.slotStart === slot.slotStart && selectedSlot?.doctorId === slot.doctorId;
                                        return (
                                            <Box key={slot.slotStart} onClick={() => setSelectedSlot(slot)}
                                                 sx={{
                                                     px: 1.75, py: 0.875, borderRadius: 2, cursor: 'pointer',
                                                     border: isSel ? '2px solid #8B7355' : '1.5px solid #EDE5D8',
                                                     bgcolor: isSel ? '#8B7355' : '#FDFAF6',
                                                     transition: 'all 0.15s',
                                                     '&:hover': { borderColor: '#8B7355', bgcolor: isSel ? '#8B7355' : '#F5EFE6' },
                                                 }}>
                                                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: isSel ? '#FFFCF8' : '#4A3728' }}>
                                                    {fmtTime(slot.slotStart)}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                )}

                {/* Confirm bar */}
                {selectedSlot && (
                    <Fade in>
                        <Box sx={{ mt: 2.5, p: 2, borderRadius: 2.5, bgcolor: '#F5EFE6', border: '1px solid #C4A882' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                <Box>
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.65rem', color: '#A89070', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.25 }}>New slot</Typography>
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#3D2B1F' }}>Dr. {selectedSlot.doctorName}</Typography>
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.78rem', color: '#7A6352' }}>
                                        {fmtDate(selectedSlot.slotStart, { weekday: 'short', day: 'numeric', month: 'short' })} · {fmtTime(selectedSlot.slotStart)} – {fmtTime(selectedSlot.slotEnd)}
                                    </Typography>
                                </Box>
                                <Button variant="contained" disabled={saving} onClick={handleConfirm}
                                        sx={{ bgcolor: '#8B7355', borderRadius: 2, fontFamily: 'Lato, sans-serif', fontWeight: 700, textTransform: 'none', px: 2.5, flexShrink: 0, '&:hover': { bgcolor: '#6D5840' } }}>
                                    {saving
                                        ? <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={15} sx={{ color: '#fff' }} /><span>Saving…</span></Stack>
                                        : 'Confirm'}
                                </Button>
                            </Stack>
                        </Box>
                    </Fade>
                )}
            </DialogContent>
        </Dialog>
    );
}


/* ──────────────────────────────────────────────────────────
   APPOINTMENT CARD
────────────────────────────────────────────────────────── */
function AppointmentCard({ appt, isPast, onCancel, onReschedule }) {
    const [notesOpen, setNotesOpen] = useState(false);
    const [noteEdit,  setNoteEdit]  = useState(false);
    const [noteText,  setNoteText]  = useState(appt.notes || '');
    const [savingNote,setSavingNote]= useState(false);
    const { token } = useAuth();

    const handleSaveNote = async () => {
        setSavingNote(true);
        try {
            await api.saveNotes(token, appt.id, noteText);
            setNoteEdit(false);
        } catch (_e) { /* note save failed silently */ } finally { setSavingNote(false); }
    };
    const statusCfg = APPT_STATUS[appt.status] || APPT_STATUS.SCHEDULED;
    const start     = appt.startTime || appt.start_time;
    const end       = appt.endTime   || appt.end_time;
    const dur       = appt.durationMinutes || appt.duration_minutes;
    const doctorName = appt.doctorFirstName
        ? `${appt.doctorFirstName} ${appt.doctorLastName || ''}`.trim()
        : null;
    const specialty  = appt.doctorSpecialization || '';
    const isToday    = new Date(start).toDateString() === new Date().toDateString();
    const canAct     = appt.status === 'SCHEDULED' && !isPast;
    const durCfg     = DUR_COLOR[dur] || DUR_COLOR[20];

    return (
        <Card elevation={0} sx={{
            border: `1px solid ${isPast ? '#E8DDD0' : '#C4A882'}`,
            borderRadius: 3, bgcolor: '#FFFCF8', mb: 2, overflow: 'hidden',
            opacity: ['CANCELLED', 'NO_SHOW'].includes(appt.status) ? 0.6 : 1,
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: '0 4px 20px rgba(139,115,85,0.1)' },
        }}>
            <Box sx={{ display: 'flex' }}>
                <Box sx={{ width: 4, bgcolor: statusCfg.color, flexShrink: 0, opacity: isPast ? 0.45 : 1 }} />
                <Box sx={{ flex: 1 }}>
                    <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>

                            {/* Date/time */}
                            <Box>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.4 }}>
                                    <EventOutlined sx={{ fontSize: 14, color: '#8B7355' }} />
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#3D2B1F' }}>
                                        {fmtDate(start, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </Typography>
                                    {isToday && <Chip label="Today" size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#FFF3E0', color: '#E65100', fontFamily: 'Lato, sans-serif', fontWeight: 700 }} />}
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ pl: 2.75 }}>
                                    <AccessTimeOutlined sx={{ fontSize: 12, color: '#A89070' }} />
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.8rem', color: '#7A6352' }}>
                                        {fmtTime(start)}{end ? ` – ${fmtTime(end)}` : ''}
                                    </Typography>
                                    {dur && (
                                        <Chip label={DUR_LABEL[dur] || `${dur} min`} size="small"
                                              sx={{ height: 18, fontSize: '0.6rem', fontFamily: 'Lato, sans-serif', fontWeight: 600, bgcolor: durCfg.bg, color: durCfg.color }} />
                                    )}
                                </Stack>
                            </Box>

                            {/* Doctor */}
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Avatar sx={{
                                    width: 36, height: 36, flexShrink: 0,
                                    background: doctorName ? 'linear-gradient(135deg, #8B7355, #C4A882)' : '#E8DDD0',
                                    fontFamily: 'Cormorant Garamond, serif', fontSize: '0.95rem', fontWeight: 700,
                                    color: !!doctorName ? '#fff' : '#A89070',
                                }}>
                                    {doctorName ? doctorName.charAt(0) : <PersonOutlined sx={{ fontSize: 18 }} />}
                                </Avatar>
                                <Box>
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.84rem', color: '#3D2B1F' }}>
                                        {doctorName ? `Dr. ${doctorName}` : 'Doctor not assigned'}
                                    </Typography>
                                    {specialty && <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.7rem', color: '#A89070' }}>{specialty}</Typography>}
                                </Box>
                            </Stack>

                            {/* Status + action icons */}
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
                                <Chip
                                    icon={<statusCfg.Icon sx={{ fontSize: '13px !important', color: `${statusCfg.color} !important` }} />}
                                    label={statusCfg.label} size="small"
                                    sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.7rem', border: `1px solid ${statusCfg.color}30` }}
                                />
                                {canAct && (
                                    <>
                                        <Tooltip title="Reschedule" arrow>
                                            <IconButton size="small" onClick={() => onReschedule(appt)}
                                                        sx={{ color: '#A89070', '&:hover': { color: '#8B7355', bgcolor: '#F5EFE6' } }}>
                                                <EditCalendarOutlined fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Cancel" arrow>
                                            <IconButton size="small" onClick={() => onCancel(appt)}
                                                        sx={{ color: '#A89070', '&:hover': { color: '#B71C1C', bgcolor: '#FFEBEE' } }}>
                                                <CancelOutlined fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                                {(canAct || appt.notes) && (
                                    <Tooltip title="Notes" arrow>
                                        <IconButton size="small" onClick={() => { setNotesOpen(v => !v); }}
                                                    sx={{ color: '#A89070', '&:hover': { color: '#8B7355', bgcolor: '#F5EFE6' } }}>
                                            <InfoOutlined fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Stack>
                        </Stack>
                    </CardContent>

                    <Collapse in={notesOpen}>
                        <Divider sx={{ borderColor: '#EDE5D8', mx: 2.5 }} />
                        <Box sx={{ px: 2.5, py: 1.5 }}>
                            {noteEdit ? (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <input
                                        value={noteText}
                                        onChange={e => setNoteText(e.target.value)}
                                        placeholder="Add a note..."
                                        style={{ flex: 1, fontFamily: 'Lato, sans-serif', fontSize: '0.82rem', border: '1px solid #C4A882', borderRadius: 8, padding: '6px 10px', background: '#FDFAF6', color: '#3D2B1F', outline: 'none' }}
                                    />
                                    <Button size="small" variant="contained" onClick={handleSaveNote} disabled={savingNote}
                                            sx={{ bgcolor: '#8B7355', fontFamily: 'Lato, sans-serif', textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, borderRadius: 1.5, '&:hover': { bgcolor: '#6D5840' } }}>
                                        {savingNote ? '...' : 'Save'}
                                    </Button>
                                    <Button size="small" onClick={() => setNoteEdit(false)} sx={{ color: '#A89070', fontFamily: 'Lato, sans-serif', textTransform: 'none', fontSize: '0.72rem' }}>Cancel</Button>
                                </Stack>
                            ) : (
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.8rem', color: '#7A6352', fontStyle: 'italic' }}>
                                        {noteText || 'No notes yet'}
                                    </Typography>
                                    {canAct && (
                                        <Button size="small" onClick={() => setNoteEdit(true)}
                                                sx={{ color: '#8B7355', fontFamily: 'Lato, sans-serif', textTransform: 'none', fontSize: '0.7rem', fontWeight: 700, ml: 1 }}>
                                            Edit
                                        </Button>
                                    )}
                                </Stack>
                            )}
                        </Box>
                    </Collapse>
                </Box>
            </Box>
        </Card>
    );
}


/* ──────────────────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────────────────── */
export default function AppointmentsPage() {
    const { token } = useAuth();
    const navigate  = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');

    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelling, setCancelling]     = useState(false);
    const [cancelError, setCancelError]   = useState('');

    const [rescheduleTarget, setRescheduleTarget] = useState(null);

    const load = useCallback(() => {
        api.myAppointments(token)
            .then(d => { setAppointments(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => { setError('Could not load appointments.'); setLoading(false); });
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const handleCancelConfirm = async () => {
        setCancelling(true); setCancelError('');
        try {
            await api.cancel(token, cancelTarget.id);
            setAppointments(prev => prev.map(a => a.id === cancelTarget.id ? { ...a, status: 'CANCELLED' } : a));
            setCancelTarget(null);
        } catch { setCancelError('Could not cancel. Please try again.'); }
        finally { setCancelling(false); }
    };

    const now      = new Date();
    const upcoming = appointments
        .filter(a => (new Date(a.startTime || a.start_time) >= now || a.status === 'IN_PROGRESS') && a.status !== 'CANCELLED')
        .sort((a, b) => new Date(a.startTime || a.start_time) - new Date(b.startTime || b.start_time));
    const past     = appointments
        .filter(a => new Date(a.startTime || a.start_time) < now && a.status !== 'IN_PROGRESS')
        .sort((a, b) => new Date(b.startTime || b.start_time) - new Date(a.startTime || a.start_time));

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 860, mx: 'auto' }}>

            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 3 }}>
                <Box>
                    <IconButton onClick={() => navigate('/dashboard')} sx={{ mb: 0.5, color: '#8B7355', '&:hover': { bgcolor: '#F2EAE0' } }}>
                        <ArrowBackOutlined />
                    </IconButton>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.72rem', color: '#A89070', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.5 }}>
                        Medical Records
                    </Typography>
                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, color: '#3D2B1F', lineHeight: 1.1 }}>
                        My Appointments
                    </Typography>
                </Box>

            </Stack>

            {/* Info banner */}
            <Box sx={{ mb: 3, p: 2, borderRadius: 2.5, bgcolor: '#F5EFE6', border: '1px solid #E8DDD0', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <InfoOutlined sx={{ fontSize: 16, color: '#8B7355', mt: 0.15, flexShrink: 0 }} />
                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.77rem', color: '#7A6352', lineHeight: 1.65 }}>
                    Appointments are auto-scheduled after your consultation based on complexity: <strong>10 min</strong> simple · <strong>20 min</strong> medium · <strong>30 min</strong> complex.
                    {' '}Use <EditCalendarOutlined sx={{ fontSize: 13, verticalAlign: 'middle', color: '#8B7355' }} /> to reschedule or{' '}
                    <CancelOutlined sx={{ fontSize: 13, verticalAlign: 'middle', color: '#B71C1C' }} /> to cancel any upcoming appointment.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress sx={{ color: '#8B7355' }} /></Box>
            ) : appointments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography sx={{ fontSize: '3rem', mb: 2 }}>📅</Typography>
                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#A89070' }}>No appointments yet</Typography>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.85rem', color: '#C4A882', mt: 1, mb: 3 }}>
                        Appointments are automatically scheduled after completing a consultation.
                    </Typography>
                    <Button variant="outlined" onClick={() => navigate('/consultations/new')}
                            sx={{ borderColor: '#8B7355', color: '#8B7355', borderRadius: 2.5, fontFamily: 'Lato, sans-serif', fontWeight: 700, textTransform: 'none' }}>
                        Start a Consultation
                    </Button>
                </Box>
            ) : (
                <>
                    {upcoming.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontWeight: 600, color: '#3D2B1F' }}>
                                    Upcoming ({upcoming.length})
                                </Typography>
                                <Chip icon={<EditCalendarOutlined sx={{ fontSize: '12px !important' }} />} label="Tap calendar to reschedule" size="small"
                                      sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.63rem', bgcolor: '#F5EFE6', color: '#8B7355', fontWeight: 600, height: 20, border: '1px solid #E8DDD0' }} />
                            </Stack>
                            {upcoming.map(a => (
                                <AppointmentCard key={a.id} appt={a} isPast={false}
                                                 onCancel={setCancelTarget} onReschedule={setRescheduleTarget} />
                            ))}
                        </Box>
                    )}
                    {past.length > 0 && (
                        <Box>
                            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontWeight: 600, color: '#3D2B1F', mb: 2 }}>
                                Past ({past.length})
                            </Typography>
                            {past.map(a => (
                                <AppointmentCard key={a.id} appt={a} isPast={true}
                                                 onCancel={setCancelTarget} onReschedule={setRescheduleTarget} />
                            ))}
                        </Box>
                    )}
                </>
            )}

            <CancelDialog
                open={!!cancelTarget} appt={cancelTarget}
                loading={cancelling} error={cancelError}
                onClose={() => { setCancelTarget(null); setCancelError(''); }}
                onConfirm={handleCancelConfirm}
            />
            <RescheduleDialog
                open={!!rescheduleTarget} appt={rescheduleTarget} token={token}
                onClose={() => setRescheduleTarget(null)}
                onSuccess={() => { setRescheduleTarget(null); load(); }}
            />
        </Box>
    );
}