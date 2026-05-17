// src/pages/NewConsultationPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box, Typography, Card, Button, TextField,
    Chip, CircularProgress, Collapse, Alert, Stepper, Step,
    StepLabel, Divider, Stack, LinearProgress, Fade, IconButton,
} from '@mui/material';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EventIcon from '@mui/icons-material/Event';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ErrorIcon from '@mui/icons-material/Error';
import { useAuth } from '../context/AuthContext';
import {
    createConsultation,
    addSymptom,
    getForm,
    submitAnswers,
    diagnose,
    scheduleAppointment,
    prescribe,
} from '../api/consultation';

const SEVERITY_OPTIONS = [
    { value: 'MILD',     label: 'Mild',     color: '#4CAF50', bg: 'rgba(76,175,80,0.1)' },
    { value: 'MODERATE', label: 'Moderate', color: '#FF9800', bg: 'rgba(255,152,0,0.1)' },
    { value: 'SEVERE',   label: 'Severe',   color: '#F44336', bg: 'rgba(244,67,54,0.1)' },
];

const COMPLEXITY_META = {
    SIMPLE:    { label: 'Simple',    color: '#4CAF50', bg: 'rgba(76,175,80,0.1)',   icon: '✅' },
    MEDIUM:    { label: 'Medium',    color: '#FF9800', bg: 'rgba(255,152,0,0.1)',   icon: '⚠️' },
    COMPLEX:   { label: 'Complex',   color: '#9C27B0', bg: 'rgba(156,39,176,0.1)', icon: '🔬' },
    EMERGENCY: { label: 'Emergency', color: '#F44336', bg: 'rgba(244,67,54,0.1)',  icon: '🚨' },
};

const STEPS = ['Symptoms', 'Medical Form', 'Diagnosis & Action'];

const inputSx = {
    '& .MuiOutlinedInput-root': {
        fontFamily: 'Lato',
        bgcolor: '#FDFAF6',
        '& fieldset': { borderColor: '#EDE5D8' },
        '&:hover fieldset': { borderColor: '#8B7355' },
        '&.Mui-focused fieldset': { borderColor: '#8B7355', borderWidth: 2 },
    },
    '& .MuiInputLabel-root': { fontFamily: 'Lato', color: '#9E8B72' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#8B7355' },
};

const PREDEFINED_SYMPTOMS = [
    { name: 'fever',           label: 'Fever',           icon: '🌡️' },
    { name: 'abdominal pain',  label: 'Abdominal Pain',  icon: '🫃' },
    { name: 'headache',        label: 'Headache',        icon: '🤕' },
    { name: 'vomiting',        label: 'Vomiting',        icon: '🤢' },
    { name: 'cough',           label: 'Cough',           icon: '😮‍💨' },
    { name: 'chest pain',      label: 'Chest Pain',      icon: '💔' },
    { name: 'breathing',       label: 'Breathing Diff.', icon: '😮' },
    { name: 'fatigue',         label: 'Fatigue',         icon: '😴' },
    { name: 'sore throat',     label: 'Sore Throat',     icon: '🔴' },
    { name: 'ear pain',        label: 'Ear Pain',        icon: '👂' },
    { name: 'rash',            label: 'Rash',            icon: '🔵' },
    { name: 'no appetite',     label: 'No Appetite',     icon: '🍽️' },
]

function SymptomStep({ consultation, onSymptomAdded, onEmergency }) {
    const { token } = useAuth()
    const [selected, setSelected]   = useState(null)   // symptom selectat din grid
    const [severity, setSeverity]   = useState('MODERATE')
    const [loading, setLoading]     = useState(false)
    const [error, setError]         = useState('')
    const [symptoms, setSymptoms]   = useState([])

    const count  = symptoms.length
    const canAdd = selected !== null && count < 3
    const alreadyAdded = (name) => symptoms.some(s => s.name === name)

    const handleAdd = async () => {
        if (!canAdd) return
        setLoading(true); setError('')
        try {
            const updated = await addSymptom(token, consultation.id, selected.name, severity)
            const newList = [...symptoms, { name: selected.name, severity }]
            setSymptoms(newList)
            setSelected(null); setSeverity('MODERATE')
            if (updated.status === 'EMERGENCY_REDIRECT') { onEmergency(updated); return }
            if (updated.status === 'FORM_GENERATED' || newList.length === 3) { onSymptomAdded(updated) }
        } catch (e) { setError(e.message) }
        finally { setLoading(false) }
    }

    return (
        <Fade in timeout={400}>
            <Box>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 600, color: '#3D2E1E', mb: 0.5 }}>
                    Describe your symptoms
                </Typography>
                <Typography sx={{ fontFamily: 'Lato', color: '#9E8B72', fontSize: '0.88rem', mb: 3 }}>
                    Add up to 3 main symptoms. After the third, our system will generate a personalized medical form.
                </Typography>

                {/* Simptome adăugate */}
                <Stack spacing={1.5} sx={{ mb: 3 }}>
                    {[0, 1, 2].map((i) => {
                        const s = symptoms[i]
                        return (
                            <Box key={i} sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.8, borderRadius: 2,
                                border: s ? '1.5px solid #C8B8A2' : '1.5px dashed #D8CFC4',
                                bgcolor: s ? 'rgba(139,115,85,0.05)' : 'transparent', transition: 'all 0.2s',
                            }}>
                                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: s ? '#8B7355' : '#EDE5D8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {s ? <CheckCircleIcon sx={{ fontSize: '1rem', color: '#FFFCF8' }} />
                                        : <Typography sx={{ fontFamily: 'Lato', fontWeight: 700, color: '#9E8B72', fontSize: '0.78rem' }}>{i + 1}</Typography>}
                                </Box>
                                {s ? (
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontFamily: 'Lato', fontWeight: 700, color: '#5C4A32', fontSize: '0.9rem', textTransform: 'capitalize' }}>{s.name}</Typography>
                                        <Chip label={s.severity} size="small" sx={{ mt: 0.3, fontSize: '0.7rem', fontFamily: 'Lato', fontWeight: 700,
                                            bgcolor: SEVERITY_OPTIONS.find(x => x.value === s.severity)?.bg,
                                            color: SEVERITY_OPTIONS.find(x => x.value === s.severity)?.color }} />
                                    </Box>
                                ) : (
                                    <Typography sx={{ fontFamily: 'Lato', color: '#B0A090', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                        {count === i ? 'Next symptom' : `Symptom ${i + 1}`}
                                    </Typography>
                                )}
                            </Box>
                        )
                    })}
                </Stack>

                <Collapse in={!!error}>
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontFamily: 'Lato' }} onClose={() => setError('')}>{error}</Alert>
                </Collapse>

                {count < 3 && (
                    <Card elevation={0} sx={{ border: '1.5px solid #EDE5D8', borderRadius: 2, p: 2.5, bgcolor: '#FFFCF8' }}>
                        <Typography sx={{ fontFamily: 'Lato', fontWeight: 700, color: '#5C4A32', fontSize: '0.85rem', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Symptom {count + 1} of 3 — Select from list
                        </Typography>

                        {/* Grid simptome predefinite */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2.5 }}>
                            {PREDEFINED_SYMPTOMS.map((s) => {
                                const isSelected = selected?.name === s.name
                                const isAdded    = alreadyAdded(s.name)
                                return (
                                    <Box key={s.name}
                                         onClick={() => !isAdded && setSelected(isSelected ? null : s)}
                                         sx={{
                                             p: 1.5, borderRadius: 2, textAlign: 'center', cursor: isAdded ? 'not-allowed' : 'pointer',
                                             border: isSelected ? '2px solid #8B7355' : '1.5px solid #EDE5D8',
                                             bgcolor: isAdded ? '#F5F0EA' : isSelected ? 'rgba(139,115,85,0.1)' : 'transparent',
                                             opacity: isAdded ? 0.45 : 1,
                                             transition: 'all 0.15s',
                                             '&:hover': { borderColor: isAdded ? '#EDE5D8' : '#8B7355', bgcolor: isAdded ? '#F5F0EA' : 'rgba(139,115,85,0.05)' },
                                         }}>
                                        <Typography sx={{ fontSize: '1.4rem', mb: 0.3 }}>{s.icon}</Typography>
                                        <Typography sx={{ fontFamily: 'Lato', fontSize: '0.75rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#8B7355' : '#6B5A47' }}>
                                            {s.label}
                                        </Typography>
                                    </Box>
                                )
                            })}
                        </Box>

                        {/* Severity */}
                        {selected && (
                            <Fade in timeout={200}>
                                <Box>
                                    <Typography sx={{ fontFamily: 'Lato', fontSize: '0.8rem', color: '#9E8B72', mb: 1 }}>
                                        Severity for <strong style={{ color: '#5C4A32' }}>{selected.label}</strong>
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
                                        {SEVERITY_OPTIONS.map((opt) => (
                                            <Box key={opt.value} onClick={() => setSeverity(opt.value)} sx={{
                                                flex: 1, textAlign: 'center', py: 1, borderRadius: 1.5,
                                                border: severity === opt.value ? `2px solid ${opt.color}` : '1.5px solid #EDE5D8',
                                                bgcolor: severity === opt.value ? opt.bg : 'transparent',
                                                cursor: 'pointer', transition: 'all 0.15s',
                                                '&:hover': { borderColor: opt.color },
                                            }}>
                                                <Typography sx={{ fontFamily: 'Lato', fontWeight: 700, fontSize: '0.8rem', color: severity === opt.value ? opt.color : '#9E8B72' }}>
                                                    {opt.label}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Fade>
                        )}

                        <Button fullWidth variant="contained" disabled={!canAdd || loading} onClick={handleAdd}
                                startIcon={loading ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <AddCircleOutlinedIcon />}
                                sx={{ fontFamily: 'Lato', fontWeight: 700, py: 1.2, borderRadius: 2,
                                    bgcolor: '#8B7355', '&:hover': { bgcolor: '#7A6348' },
                                    '&:disabled': { bgcolor: '#D4C9B8', color: '#9E8B72' } }}>
                            {loading ? 'Adding...' : count === 2 ? 'Add & Generate Form' : `Add Symptom ${count + 1}`}
                        </Button>
                    </Card>
                )}
            </Box>
        </Fade>
    )
}

function MedicalFormStep({ consultationId, onFormSubmitted }) {
    const { token } = useAuth();
    const [questions, setQuestions]   = useState([]);
    const [answers, setAnswers]       = useState({});
    const [loading, setLoading]       = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');

    useEffect(() => {
        getForm(token, consultationId)
            .then((qs) => {
                const sorted = qs.sort((a, b) => a.orderIndex - b.orderIndex);
                setQuestions(sorted);
                const init = {};
                sorted.forEach((q) => { init[q.id] = q.questionType === 'CHECKBOX' ? [] : ''; });
                setAnswers(init);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [token, consultationId]);

    const setAnswer = (qId, value) => setAnswers((prev) => ({ ...prev, [qId]: value }));
    const toggleCheckbox = (qId, option) => {
        setAnswers((prev) => {
            const current = prev[qId] || [];
            return { ...prev, [qId]: current.includes(option) ? current.filter((x) => x !== option) : [...current, option] };
        });
    };
    const isComplete = () => questions.every((q) => {
        if (!q.isRequired) return true;
        const ans = answers[q.id];
        return q.questionType === 'CHECKBOX' ? ans && ans.length > 0 : ans && ans.trim() !== '';
    });

    const handleSubmit = async () => {
        setSubmitting(true); setError('');
        try {
            const seen = new Set();
            const payload = questions.map((q) => {
                const raw = answers[q.id];
                const answerText = q.questionType === 'CHECKBOX' ? (Array.isArray(raw) ? raw.join(', ') : raw || '') : (raw || '');
                return { questionId: q.id, answerText };
            }).filter((a) => { if (!a.answerText || a.questionId == null) return false; if (seen.has(a.questionId)) return false; seen.add(a.questionId); return true; });
            await submitAnswers(token, consultationId, payload);
            const withDiagnosis = await diagnose(token, consultationId);
            onFormSubmitted(withDiagnosis);
        } catch (e) { setError(e.message); }
        finally { setSubmitting(false); }
    };

    if (loading) return (
        <Box sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#8B7355', mb: 2 }} />
            <Typography sx={{ fontFamily: 'Lato', color: '#9E8B72' }}>Loading your personalized medical form...</Typography>
        </Box>
    );

    const answered = questions.filter((q) => { const ans = answers[q.id]; return q.questionType === 'CHECKBOX' ? ans?.length > 0 : ans?.trim(); }).length;

    return (
        <Fade in timeout={400}>
            <Box>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 600, color: '#3D2E1E', mb: 0.5 }}>Medical Assessment Form</Typography>
                <Typography sx={{ fontFamily: 'Lato', color: '#9E8B72', fontSize: '0.88rem', mb: 0.5 }}>This form was generated based on your symptoms and medical history. Please answer carefully.</Typography>
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                        <Typography sx={{ fontFamily: 'Lato', fontSize: '0.78rem', color: '#9E8B72' }}>{answered} of {questions.length} answered</Typography>
                        <Typography sx={{ fontFamily: 'Lato', fontSize: '0.78rem', color: '#8B7355', fontWeight: 700 }}>{Math.round((answered / Math.max(questions.length, 1)) * 100)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(answered / Math.max(questions.length, 1)) * 100} sx={{ height: 5, borderRadius: 3, bgcolor: '#EDE5D8', '& .MuiLinearProgress-bar': { bgcolor: '#8B7355', borderRadius: 3 } }} />
                </Box>
                <Collapse in={!!error}><Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontFamily: 'Lato' }} onClose={() => setError('')}>{error}</Alert></Collapse>
                <Stack spacing={2.5} sx={{ mb: 3 }}>
                    {questions.map((q, idx) => (
                        <Card key={q.id} elevation={0} sx={{ border: '1.5px solid #EDE5D8', borderRadius: 2, bgcolor: '#FFFCF8', p: 2.5 }}>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'flex-start' }}>
                                <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#8B7355', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.2 }}>
                                    <Typography sx={{ fontFamily: 'Lato', fontSize: '0.7rem', fontWeight: 700, color: '#FFFCF8' }}>{idx + 1}</Typography>
                                </Box>
                                <Typography sx={{ fontFamily: 'Lato', fontWeight: 600, color: '#3D2E1E', fontSize: '0.92rem', lineHeight: 1.5 }}>
                                    {q.questionText}{q.isRequired && <span style={{ color: '#C0392B', marginLeft: 4 }}>*</span>}
                                </Typography>
                            </Box>
                            {q.questionType === 'YES_NO' && (
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    {['Yes', 'No'].map((opt) => (
                                        <Box key={opt} onClick={() => setAnswer(q.id, opt)} sx={{ flex: 1, textAlign: 'center', py: 1.2, borderRadius: 1.5, border: answers[q.id] === opt ? '2px solid #8B7355' : '1.5px solid #EDE5D8', bgcolor: answers[q.id] === opt ? 'rgba(139,115,85,0.08)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s', '&:hover': { borderColor: '#8B7355' } }}>
                                            <Typography sx={{ fontFamily: 'Lato', fontWeight: 700, fontSize: '0.88rem', color: answers[q.id] === opt ? '#8B7355' : '#9E8B72' }}>{opt}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                            {q.questionType === 'MULTIPLE_CHOICE' && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {(q.options || []).map((opt) => (
                                        <Chip key={opt} label={opt} onClick={() => setAnswer(q.id, opt)} sx={{ fontFamily: 'Lato', fontSize: '0.82rem', cursor: 'pointer', border: answers[q.id] === opt ? '1.5px solid #8B7355' : '1.5px solid #EDE5D8', bgcolor: answers[q.id] === opt ? 'rgba(139,115,85,0.1)' : 'transparent', color: answers[q.id] === opt ? '#8B7355' : '#6B5A47', fontWeight: answers[q.id] === opt ? 700 : 400, '&:hover': { bgcolor: 'rgba(139,115,85,0.07)' } }} />
                                    ))}
                                </Box>
                            )}
                            {q.questionType === 'CHECKBOX' && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {(q.options || []).map((opt) => {
                                        const selected = (answers[q.id] || []).includes(opt);
                                        return <Chip key={opt} label={opt} onClick={() => toggleCheckbox(q.id, opt)} icon={selected ? <CheckCircleIcon sx={{ fontSize: '0.9rem !important', color: '#8B7355 !important' }} /> : undefined} sx={{ fontFamily: 'Lato', fontSize: '0.82rem', cursor: 'pointer', border: selected ? '1.5px solid #8B7355' : '1.5px solid #EDE5D8', bgcolor: selected ? 'rgba(139,115,85,0.1)' : 'transparent', color: selected ? '#8B7355' : '#6B5A47', fontWeight: selected ? 700 : 400, '&:hover': { bgcolor: 'rgba(139,115,85,0.07)' } }} />;
                                    })}
                                </Box>
                            )}
                            {q.questionType === 'OPEN_TEXT' && (
                                <TextField fullWidth multiline rows={2} placeholder="Your answer..." value={answers[q.id] || ''} onChange={(e) => setAnswer(q.id, e.target.value)} size="small" sx={inputSx} />
                            )}
                        </Card>
                    ))}
                </Stack>
                <Button fullWidth variant="contained" disabled={!isComplete() || submitting} onClick={handleSubmit}
                        sx={{ fontFamily: 'Lato', fontWeight: 700, py: 1.4, borderRadius: 2, fontSize: '0.95rem', bgcolor: '#8B7355', '&:hover': { bgcolor: '#7A6348' }, '&:disabled': { bgcolor: '#D4C9B8', color: '#9E8B72' } }}>
                    {submitting ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={18} sx={{ color: '#FFFCF8' }} /><span>Computing diagnosis...</span></Box> : 'Submit & Get Diagnosis'}
                </Button>
            </Box>
        </Fade>
    );
}

function DiagnosisStep({ consultationDetail, consultationId, onDone }) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const [result, setResult]   = useState(null);

    const diagnoses  = consultationDetail?.diagnoses || [];
    const complexity = consultationDetail?.complexityLevel;
    const meta       = COMPLEXITY_META[complexity] || COMPLEXITY_META.MEDIUM;
    const primary    = diagnoses[0];
    const secondary  = diagnoses[1];

    // Diagnoses eligible for auto prescription (must match backend list)
    const ELIGIBLE_FOR_PRESCRIPTION = [
        'Upper Respiratory Tract Infection (Cold)',
        'Influenza (Flu)',
        'Food Poisoning',
        'Acute Gastroenteritis',
    ];
    const isEligibleForPrescription = primary && ELIGIBLE_FOR_PRESCRIPTION.includes(primary.diagnosisName);
    // Effective action: even if SIMPLE, if diagnosis not eligible → schedule
    const effectiveAction = (complexity === 'SIMPLE' && isEligibleForPrescription) ? 'PRESCRIBE'
        : (complexity === 'EMERGENCY') ? 'EMERGENCY'
            : 'SCHEDULE';

    const handleSchedule = async () => {
        setLoading(true); setError('');
        try { const res = await scheduleAppointment(token, consultationId); setResult({ type: 'appointment', id: res.appointmentId }); }
        catch (e) { setError(e.message); } finally { setLoading(false); }
    };
    const handlePrescribe = async () => {
        setLoading(true); setError('');
        try { const res = await prescribe(token, consultationId); setResult({ type: 'prescription', id: res.prescriptionId }); }
        catch (e) { setError(e.message); } finally { setLoading(false); }
    };

    if (result) return (
        <Fade in timeout={400}>
            <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'rgba(139,115,85,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    {result.type === 'prescription' ? <MedicalServicesIcon sx={{ fontSize: '2rem', color: '#8B7355' }} /> : <EventIcon sx={{ fontSize: '2rem', color: '#8B7355' }} />}
                </Box>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 700, color: '#3D2E1E', mb: 1 }}>
                    {result.type === 'prescription' ? 'Prescription Generated' : 'Appointment Scheduled'}
                </Typography>
                <Typography sx={{ fontFamily: 'Lato', color: '#9E8B72', fontSize: '0.9rem', mb: 3 }}>
                    {result.type === 'prescription' ? `Prescription #${result.id} generated with OTC medications. View it in your Prescriptions section.` : `Appointment #${result.id} scheduled automatically. Check your Appointments section for details.`}
                </Typography>
                <Stack direction="row" spacing={1.5} justifyContent="center">
                    <Button variant="outlined" onClick={() => onDone(result.type === 'prescription' ? '/prescriptions' : '/appointments')} sx={{ fontFamily: 'Lato', fontWeight: 700, borderColor: '#8B7355', color: '#8B7355', borderRadius: 2, '&:hover': { bgcolor: 'rgba(139,115,85,0.07)' } }}>
                        View {result.type === 'prescription' ? 'Prescription' : 'Appointment'}
                    </Button>
                    <Button variant="contained" onClick={() => onDone('/dashboard')} sx={{ fontFamily: 'Lato', fontWeight: 700, bgcolor: '#8B7355', borderRadius: 2, '&:hover': { bgcolor: '#7A6348' } }}>
                        Back to Dashboard
                    </Button>
                </Stack>
            </Box>
        </Fade>
    );

    return (
        <Fade in timeout={400}>
            <Box>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 600, color: '#3D2E1E', mb: 0.5 }}>Diagnosis Results</Typography>
                <Typography sx={{ fontFamily: 'Lato', color: '#9E8B72', fontSize: '0.88rem', mb: 3 }}>Based on your symptoms and form responses, our system generated the following preliminary assessment.</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, borderRadius: 2, mb: 3, bgcolor: meta.bg, border: `1.5px solid ${meta.color}33` }}>
                    <Typography sx={{ fontSize: '1.4rem' }}>{meta.icon}</Typography>
                    <Box>
                        <Typography sx={{ fontFamily: 'Lato', fontWeight: 700, color: meta.color, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Case Complexity — {meta.label}</Typography>
                        <Typography sx={{ fontFamily: 'Lato', color: '#6B5A47', fontSize: '0.82rem' }}>
                            {complexity === 'SIMPLE' && 'This case can be resolved with an automatic prescription.'}
                            {complexity === 'MEDIUM' && 'A specialist consultation is recommended.'}
                            {complexity === 'COMPLEX' && 'Complex case — requires an in-depth consultation with a doctor.'}
                            {complexity === 'EMERGENCY' && 'Immediate emergency care required.'}
                        </Typography>
                    </Box>
                </Box>
                <Stack spacing={2} sx={{ mb: 3 }}>
                    {[primary, secondary].filter(Boolean).map((d, i) => (
                        <Card key={d.id} elevation={0} sx={{ border: '1.5px solid #EDE5D8', borderRadius: 2, bgcolor: '#FFFCF8', p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontFamily: 'Lato', fontSize: '0.72rem', color: '#9E8B72', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>{i === 0 ? 'Primary diagnosis' : 'Secondary diagnosis'}</Typography>
                                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', fontWeight: 700, color: '#3D2E1E' }}>{d.diagnosisName}</Typography>
                                    {d.icdCode && <Chip label={`ICD: ${d.icdCode}`} size="small" sx={{ mt: 0.5, fontFamily: 'Lato', fontSize: '0.7rem', bgcolor: '#EDE5D8', color: '#6B5A47' }} />}
                                </Box>
                                {d.confidenceScore != null && (
                                    <Box sx={{ textAlign: 'center', ml: 2 }}>
                                        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 700, color: '#8B7355', lineHeight: 1 }}>{d.confidenceScore}%</Typography>
                                        <Typography sx={{ fontFamily: 'Lato', fontSize: '0.68rem', color: '#9E8B72' }}>confidence</Typography>
                                    </Box>
                                )}
                            </Box>
                            {d.notes && (<><Divider sx={{ borderColor: '#EDE5D8', my: 1.2 }} /><Typography sx={{ fontFamily: 'Lato', fontSize: '0.83rem', color: '#6B5A47', lineHeight: 1.6 }}>{d.notes}</Typography></>)}
                        </Card>
                    ))}
                </Stack>
                <Collapse in={!!error}><Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontFamily: 'Lato' }} onClose={() => setError('')}>{error}</Alert></Collapse>
                {complexity === 'EMERGENCY' && (
                    <Box sx={{ bgcolor: 'rgba(244,67,54,0.06)', border: '2px solid rgba(244,67,54,0.3)', borderRadius: 2, p: 3, textAlign: 'center' }}>
                        <ErrorIcon sx={{ fontSize: '2.5rem', color: '#F44336', mb: 1 }} />
                        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 700, color: '#C0392B', mb: 1 }}>Emergency — Go to the nearest ER</Typography>
                        <Typography sx={{ fontFamily: 'Lato', fontSize: '0.88rem', color: '#6B5A47', mb: 2 }}>Your symptoms indicate a potentially serious condition requiring immediate in-person evaluation.</Typography>
                        <Button variant="contained" onClick={() => onDone('/dashboard')} sx={{ fontFamily: 'Lato', fontWeight: 700, bgcolor: '#F44336', borderRadius: 2, '&:hover': { bgcolor: '#D32F2F' } }}>Back to Dashboard</Button>
                    </Box>
                )}
                {complexity === 'SIMPLE' && (
                    <Card elevation={0} sx={{ border: '1.5px solid #EDE5D8', borderRadius: 2, bgcolor: '#FFFCF8', p: 2.5 }}>
                        <Typography sx={{ fontFamily: 'Lato', fontWeight: 700, color: '#5C4A32', mb: 0.5 }}>Automatic Prescription</Typography>
                        <Typography sx={{ fontFamily: 'Lato', fontSize: '0.85rem', color: '#9E8B72', mb: 2 }}>Your case is straightforward. We can generate an OTC prescription with standard medications — no antibiotics.</Typography>
                        <Button fullWidth variant="contained" disabled={loading} onClick={handlePrescribe} startIcon={loading ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <MedicalServicesIcon />}
                                sx={{ fontFamily: 'Lato', fontWeight: 700, py: 1.2, borderRadius: 2, bgcolor: '#8B7355', '&:hover': { bgcolor: '#7A6348' } }}>
                            {loading ? 'Generating...' : 'Generate Prescription'}
                        </Button>
                    </Card>
                )}
                {(effectiveAction === 'SCHEDULE' && complexity !== 'EMERGENCY') && (
                    <Card elevation={0} sx={{ border: '1.5px solid #EDE5D8', borderRadius: 2, bgcolor: '#FFFCF8', p: 2.5 }}>
                        <Typography sx={{ fontFamily: 'Lato', fontWeight: 700, color: '#5C4A32', mb: 0.5 }}>Schedule a Consultation</Typography>
                        <Typography sx={{ fontFamily: 'Lato', fontSize: '0.85rem', color: '#9E8B72', mb: 2 }}>
                            {complexity === 'COMPLEX'
                                ? 'Your case requires a detailed evaluation. We will find the next available specialist slot.'
                                : !isEligibleForPrescription && complexity === 'SIMPLE'
                                    ? 'Your symptoms require a doctor evaluation. We will find the earliest available appointment with the right specialist.'
                                    : 'A doctor consultation is recommended. Our system will find the earliest available appointment.'}
                        </Typography>
                        <Button fullWidth variant="contained" disabled={loading} onClick={handleSchedule} startIcon={loading ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <EventIcon />}
                                sx={{ fontFamily: 'Lato', fontWeight: 700, py: 1.2, borderRadius: 2, bgcolor: '#8B7355', '&:hover': { bgcolor: '#7A6348' } }}>
                            {loading ? 'Scheduling...' : 'Schedule Appointment'}
                        </Button>
                    </Card>
                )}
                <Typography sx={{ fontFamily: 'Lato', fontSize: '0.75rem', color: '#B0A090', mt: 2, textAlign: 'center', lineHeight: 1.5 }}>
                    ⚕️ This is a preliminary AI-generated assessment. It does not replace professional medical advice.
                </Typography>
            </Box>
        </Fade>
    );
}

function EmergencyScreen({ onBack }) {
    return (
        <Fade in timeout={400}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(244,67,54,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <ErrorIcon sx={{ fontSize: '2.5rem', color: '#F44336' }} />
                </Box>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 700, color: '#C0392B', mb: 1 }}>Emergency Detected</Typography>
                <Typography sx={{ fontFamily: 'Lato', color: '#6B5A47', fontSize: '0.92rem', mb: 3, maxWidth: 420, mx: 'auto', lineHeight: 1.7 }}>
                    Your symptom combination suggests a potentially serious condition requiring <strong>immediate emergency care</strong>. Go to the nearest Emergency Unit (UPU) or call 112 now.
                </Typography>
                <Box sx={{ bgcolor: 'rgba(244,67,54,0.06)', border: '1.5px solid rgba(244,67,54,0.25)', borderRadius: 2, p: 2.5, mb: 3, maxWidth: 360, mx: 'auto' }}>
                    <Typography sx={{ fontFamily: 'Lato', fontWeight: 700, color: '#C0392B', fontSize: '1.1rem' }}>📞 Emergency: 112</Typography>
                    <Typography sx={{ fontFamily: 'Lato', color: '#6B5A47', fontSize: '0.85rem', mt: 0.5 }}>SMURD / Ambulanță Romania</Typography>
                </Box>
                <Button variant="outlined" onClick={onBack} startIcon={<ArrowBackIcon />} sx={{ fontFamily: 'Lato', fontWeight: 700, borderColor: '#8B7355', color: '#8B7355', borderRadius: 2, '&:hover': { bgcolor: 'rgba(139,115,85,0.07)' } }}>
                    Back to Dashboard
                </Button>
            </Box>
        </Fade>
    );
}

export default function NewConsultationPage() {
    const { token } = useAuth();
    const navigate  = useNavigate();
    const [searchParams] = useSearchParams();

    const [activeStep, setActiveStep]       = useState(0);
    const [consultation, setConsultation]   = useState(null);
    const [consultDetail, setConsultDetail] = useState(null);
    const [isEmergency, setIsEmergency]     = useState(false);
    const [creating, setCreating]           = useState(false);
    const [createError, setCreateError]     = useState('');
    const [started, setStarted]             = useState(false);

    // Resume an existing consultation via ?id=X&step=N
    useEffect(() => {
        const resumeId   = searchParams.get('id');
        const resumeStep = parseInt(searchParams.get('step') || '1', 10);
        if (!resumeId || !token) return;

        setCreating(true);
        fetch(`http://localhost:8084/api/consultations/${resumeId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                setConsultation(data);
                setStarted(true);
                // jump to correct step based on status
                const status = data.status;
                if (status === 'FORM_GENERATED' || status === 'PENDING_FORM') {
                    setActiveStep(1);
                } else if (status === 'FORM_COMPLETED' || status === 'DIAGNOSIS_PENDING') {
                    // need to also load diagnosis detail
                    setConsultDetail(data);
                    setActiveStep(2);
                } else if (status === 'EMERGENCY_REDIRECT') {
                    setIsEmergency(true);
                } else {
                    setActiveStep(resumeStep - 1);
                }
            })
            .catch(() => setCreateError('Could not resume consultation.'))
            .finally(() => setCreating(false));
    }, [searchParams, token]);

    const handleStart = async () => {
        setCreating(true); setCreateError('');
        try { const c = await createConsultation(token); setConsultation(c); setStarted(true); }
        catch (e) { setCreateError(e.message); } finally { setCreating(false); }
    };

    const handleSymptomsDone  = (updated) => { setConsultation(updated); setActiveStep(1); };
    const handleEmergency     = (updated) => { setConsultation(updated); setIsEmergency(true); };
    const handleFormSubmitted = (detail)  => { setConsultDetail(detail); setActiveStep(2); };
    const handleDone          = (path)    => navigate(path);

    return (
        <Box component="main" sx={{ flexGrow: 1, px: { xs: 2.5, md: 5 }, py: 4.5, maxWidth: 760, mx: 'auto', width: '100%', minHeight: '100vh' }}>

            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <IconButton size="small" onClick={() => navigate('/dashboard')} sx={{ color: '#8B7355', '&:hover': { bgcolor: 'rgba(139,115,85,0.08)' } }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <MonitorHeartIcon sx={{ color: '#8B7355', fontSize: '1.6rem' }} />
                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 700, color: '#3D2E1E' }}>
                        New Consultation
                    </Typography>
                </Box>
                <Typography sx={{ fontFamily: 'Lato', color: '#9E8B72', fontSize: '0.92rem', ml: 6 }}>
                    AI-assisted preliminary medical evaluation
                </Typography>
            </Box>

            {isEmergency ? (
                <Card elevation={0} sx={{ border: '1.5px solid #EDE5D8', borderRadius: 3, bgcolor: '#FFFCF8', p: { xs: 2.5, md: 4 } }}>
                    <EmergencyScreen onBack={() => navigate('/dashboard')} />
                </Card>
            ) : !started ? (
                <Card elevation={0} sx={{ border: '1.5px solid #EDE5D8', borderRadius: 3, bgcolor: '#FFFCF8', p: { xs: 2.5, md: 4 } }}>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <LocalHospitalIcon sx={{ fontSize: '3rem', color: '#8B7355', mb: 2 }} />
                        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 700, color: '#3D2E1E', mb: 1 }}>Start Medical Evaluation</Typography>
                        <Typography sx={{ fontFamily: 'Lato', color: '#9E8B72', fontSize: '0.9rem', mb: 4, maxWidth: 440, mx: 'auto', lineHeight: 1.7 }}>
                            You will be guided through 3 steps: entering your symptoms, completing a personalized medical form, and receiving a preliminary diagnosis with recommended action.
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
                            {[{ label: 'Add 3 symptoms', icon: '🩺' }, { label: 'Complete medical form', icon: '📋' }, { label: 'Get diagnosis', icon: '🔬' }].map((item, i) => (
                                <Box key={i} sx={{ width: 130, p: 2.5, borderRadius: 2, border: '1.5px solid #EDE5D8', bgcolor: 'rgba(139,115,85,0.03)', textAlign: 'center' }}>
                                    <Typography sx={{ fontSize: '1.8rem', mb: 1 }}>{item.icon}</Typography>
                                    <Typography sx={{ fontFamily: 'Lato', fontSize: '0.78rem', color: '#6B5A47', fontWeight: 600, lineHeight: 1.4 }}>{item.label}</Typography>
                                </Box>
                            ))}
                        </Box>
                        <Collapse in={!!createError}><Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontFamily: 'Lato', textAlign: 'left' }}>{createError}</Alert></Collapse>
                        <Button variant="contained" size="large" disabled={creating} onClick={handleStart}
                                sx={{ fontFamily: 'Lato', fontWeight: 700, px: 5, py: 1.5, borderRadius: 2, fontSize: '0.95rem', bgcolor: '#8B7355', '&:hover': { bgcolor: '#7A6348' } }}>
                            {creating ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={18} sx={{ color: '#FFFCF8' }} /><span>Starting...</span></Box> : 'Start Consultation'}
                        </Button>
                    </Box>
                </Card>
            ) : (
                <Card elevation={0} sx={{ border: '1.5px solid #EDE5D8', borderRadius: 3, bgcolor: '#FFFCF8', p: { xs: 2.5, md: 4 } }}>
                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {STEPS.map((label) => (
                            <Step key={label}>
                                <StepLabel sx={{ '& .MuiStepLabel-label': { fontFamily: 'Lato', fontSize: '0.82rem', color: '#9E8B72' }, '& .MuiStepLabel-label.Mui-active': { color: '#5C4A32', fontWeight: 700 }, '& .MuiStepLabel-label.Mui-completed': { color: '#8B7355' }, '& .MuiStepIcon-root': { color: '#D4C9B8' }, '& .MuiStepIcon-root.Mui-active': { color: '#8B7355' }, '& .MuiStepIcon-root.Mui-completed': { color: '#8B7355' } }}>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    <Divider sx={{ borderColor: '#EDE5D8', mb: 3 }} />
                    {activeStep === 0 && consultation && <SymptomStep consultation={consultation} onSymptomAdded={handleSymptomsDone} onEmergency={handleEmergency} />}
                    {activeStep === 1 && consultation && <MedicalFormStep consultationId={consultation.id} onFormSubmitted={handleFormSubmitted} />}
                    {activeStep === 2 && consultDetail && <DiagnosisStep consultationDetail={consultDetail} consultationId={consultation.id} onDone={handleDone} />}
                </Card>
            )}
        </Box>
    );
}