import { useState, useEffect } from 'react'
import {
    Box, Typography, TextField, Button, MenuItem,
    Grid, Alert, CircularProgress, Divider,
    Stepper, Step, StepLabel, Chip, IconButton
} from '@mui/material'
import AddIcon    from '@mui/icons-material/Add'
import DeleteIcon from "@mui/icons-material/Delete"
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createProfile } from '../api/patient'
import axios from 'axios'
import { API } from '../api/auth'
import Sidebar from '../components/Sidebar'

const GENDERS     = ['MALE', 'FEMALE', 'OTHER']
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const SEVERITIES  = ['MILD', 'MODERATE', 'SEVERE']
const STEPS       = ['Personal Info', 'Chronic Conditions', 'Guardian']
const authHeader  = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

export default function ProfilePage() {
    const { token, refreshProfile, profile } = useAuth()
    const navigate = useNavigate()

    const [activeStep,  setActiveStep]  = useState(0)
    const [patientId,   setPatientId]   = useState(profile?.id ?? null)
    const [ageCategory, setAgeCategory] = useState(profile?.ageCategory ?? null)
    const [viewMode,    setViewMode]    = useState(false) // se setează după verificare
    const [checking,    setChecking]    = useState(true)  // loading la verificare inițială

    const [error,   setError]   = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const [form, setForm] = useState({
        firstName: profile?.firstName ?? '',
        lastName:  profile?.lastName  ?? '',
        birthDate: profile?.birthDate ?? '',
        gender:    profile?.gender    ?? '',
        bloodType: profile?.bloodType ?? '',
        phone:     profile?.phone     ?? '',
        cnp:       profile?.cnp       ?? '',
        address:   profile?.address   ?? '',
    })
    const [conditions,   setConditions]   = useState([])
    const [newCondition, setNewCondition] = useState({ conditionName: '', severity: 'MILD', diagnosedDate: '' })
    const [guardian,     setGuardian]     = useState({ firstName: '', lastName: '', phone: '', email: '', relationship: 'PARENT' })

    const set      = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }))
    const setGuard = (f) => (e) => setGuardian(prev => ({ ...prev, [f]: e.target.value }))
    const setCond  = (f) => (e) => setNewCondition(prev => ({ ...prev, [f]: e.target.value }))
    const fieldSx  = { backgroundColor: '#FFFCF8' }

    // La încărcare — verifică dacă profilul e complet
    useEffect(() => {
        const check = async () => {
            if (!profile) {
                // Nu are profil — rămâne la step 0
                setChecking(false)
                return
            }

            if (profile.ageCategory !== 'CHILD') {
                // Adult/Senior — profilul e complet
                setViewMode(true)
                setChecking(false)
                return
            }

            // Copil — verifică dacă are guardian
            try {
                await axios.get(`${API}/api/v1/patients/${profile.id}/guardian`, authHeader(token))
                setViewMode(true) // Are guardian — complet
            } catch {
                // Nu are guardian — du-l la step 3
                setPatientId(profile.id)
                setAgeCategory(profile.ageCategory)
                setActiveStep(2)
            } finally {
                setChecking(false)
            }
        }
        check()
    }, [profile, token])

    const handleSaveProfile = async () => {
        if (!form.firstName || !form.lastName || !form.birthDate || !form.gender) {
            setError('Please fill in all required fields.')
            return
        }
        setError('')
        setLoading(true)
        try {
            const res = await createProfile(token, {
                firstName: form.firstName, lastName: form.lastName,
                birthDate: form.birthDate, gender:    form.gender,
                bloodType: form.bloodType || null,   phone: form.phone    || null,
                cnp:       form.cnp       || null, address: form.address  || null,
            })
            refreshProfile()
            setPatientId(res.data.id)
            setAgeCategory(res.data.ageCategory)
            setActiveStep(1)
        } catch (err) {
            setError(err.response?.data?.message ?? 'Could not save profile.')
        } finally {
            setLoading(false)
        }
    }

    const handleAddCondition = async () => {
        if (!newCondition.conditionName) return
        setLoading(true)
        try {
            await axios.post(`${API}/api/v1/patients/chronic-conditions`, newCondition, authHeader(token))
            setConditions(prev => [...prev, newCondition])
            setNewCondition({ conditionName: '', severity: 'MILD', diagnosedDate: '' })
        } catch (err) {
            setError(err.response?.data?.message ?? 'Could not add condition.')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveGuardian = async () => {
        if (!guardian.firstName || !guardian.lastName) {
            setError('Please fill in guardian first and last name.')
            return
        }
        setError('')
        setLoading(true)
        try {
            await axios.post(`${API}/api/v1/patients/${patientId}/guardian`, guardian, authHeader(token))
            setSuccess(true)
            refreshProfile()
            setTimeout(() => navigate('/dashboard'), 1500)
        } catch (err) {
            setError(err.response?.data?.message ?? 'Could not save guardian.')
        } finally {
            setLoading(false)
        }
    }

    if (checking) {
        return (
            <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F3EE' }}>
                <Sidebar />
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress sx={{ color: '#8B7355' }} />
                </Box>
            </Box>
        )
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F3EE' }}>
            <Sidebar />

            {/* ── VIEW MODE: profil complet ── */}
            {viewMode && (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                    <Box sx={{ textAlign: 'center', maxWidth: 420 }}>
                        <Typography sx={{ fontSize: '4rem', mb: 2 }}>✅</Typography>
                        <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', fontWeight: 600, color: '#2C2416', mb: 1 }}>
                            Profile complete
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#2C2416', fontWeight: 500, mb: 0.5 }}>
                            {profile?.firstName} {profile?.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {profile?.gender?.charAt(0) + profile?.gender?.slice(1).toLowerCase()} · Blood type: {profile?.bloodType ?? 'not set'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            {profile?.phone ?? 'No phone'} · {profile?.address ?? 'No address'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button variant="outlined" onClick={() => navigate('/dashboard')}
                                    sx={{ borderColor: '#D4C5B0', color: 'text.secondary' }}>
                                Back to Dashboard
                            </Button>
                            <Button variant="contained" color="primary" onClick={() => setViewMode(false)}>
                                Edit Profile
                            </Button>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* ── EDIT MODE ── */}
            {!viewMode && (
                <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 3, sm: 5 } }}>
                    <Box sx={{ maxWidth: 680, mx: 'auto' }}>

                        <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', fontWeight: 600, color: '#2C2416', mb: 0.5 }}>
                            Patient Profile
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            Complete your profile in 3 steps to unlock all features.
                        </Typography>

                        <Stepper activeStep={activeStep} sx={{ mb: 5,
                            '& .MuiStepIcon-root.Mui-active':    { color: '#8B7355' },
                            '& .MuiStepIcon-root.Mui-completed': { color: '#7A9E7E' },
                        }}>
                            {STEPS.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                        </Stepper>

                        {error   && <Alert severity="error"   sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Profile complete! Redirecting...</Alert>}

                        {/* ── STEP 1 ── */}
                        {activeStep === 0 && (
                            <Box>
                                <Typography sx={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'text.secondary', mb: 2 }}>
                                    PERSONAL INFORMATION
                                </Typography>
                                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                                    <Grid item xs={6}>
                                        <TextField fullWidth required label="First Name"
                                                   value={form.firstName} onChange={set('firstName')} sx={fieldSx} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField fullWidth required label="Last Name"
                                                   value={form.lastName} onChange={set('lastName')} sx={fieldSx} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField fullWidth required label="Date of Birth" type="date"
                                                   value={form.birthDate} onChange={set('birthDate')}
                                                   slotProps={{ inputLabel: { shrink: true } }} sx={fieldSx} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField fullWidth required select label="Gender"
                                                   value={form.gender} onChange={set('gender')} sx={fieldSx}>
                                            {GENDERS.map(g => (
                                                <MenuItem key={g} value={g}>
                                                    {g.charAt(0) + g.slice(1).toLowerCase()}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ borderColor: '#EDE5D8', mb: 3 }} />
                                <Typography sx={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'text.secondary', mb: 2 }}>
                                    MEDICAL & CONTACT
                                </Typography>
                                <Grid container spacing={2.5} sx={{ mb: 4 }}>
                                    <Grid item xs={6}>
                                        <TextField fullWidth select label="Blood Type"
                                                   value={form.bloodType} onChange={set('bloodType')} sx={fieldSx}>
                                            <MenuItem value=""><em>Not specified</em></MenuItem>
                                            {BLOOD_TYPES.map(bt => <MenuItem key={bt} value={bt}>{bt}</MenuItem>)}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField fullWidth label="CNP" placeholder="13 digits"
                                                   value={form.cnp} onChange={set('cnp')}
                                                   inputProps={{ maxLength: 13 }} sx={fieldSx} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField fullWidth label="Phone" placeholder="+40 7XX XXX XXX"
                                                   value={form.phone} onChange={set('phone')} sx={fieldSx} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Address" placeholder="Street, City, County"
                                                   value={form.address} onChange={set('address')}
                                                   multiline rows={2} sx={fieldSx} />
                                    </Grid>
                                </Grid>

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                    <Button variant="outlined" onClick={() => navigate('/dashboard')}
                                            sx={{ borderColor: '#D4C5B0', color: 'text.secondary' }}>
                                        Cancel
                                    </Button>
                                    <Button variant="contained" color="primary"
                                            onClick={handleSaveProfile} disabled={loading} sx={{ px: 4 }}>
                                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Save & Continue →'}
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        {/* ── STEP 2 ── */}
                        {activeStep === 1 && (
                            <Box>
                                <Typography sx={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'text.secondary', mb: 1 }}>
                                    ADD CHRONIC CONDITIONS
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Optional — add any known chronic conditions. You can skip this step.
                                </Typography>

                                {conditions.length > 0 && (
                                    <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {conditions.map((c, i) => (
                                            <Chip key={i} label={`${c.conditionName} · ${c.severity}`}
                                                  onDelete={() => setConditions(prev => prev.filter((_, j) => j !== i))}
                                                  deleteIcon={<DeleteIcon />}
                                                  sx={{ backgroundColor: '#F0EBE3', color: '#2C2416' }} />
                                        ))}
                                    </Box>
                                )}

                                <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
                                    <Grid item xs={12} sm={5}>
                                        <TextField fullWidth label="Condition name" placeholder="e.g. Diabetes Type 2"
                                                   value={newCondition.conditionName} onChange={setCond('conditionName')} sx={fieldSx} />
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <TextField fullWidth select label="Severity"
                                                   value={newCondition.severity} onChange={setCond('severity')} sx={fieldSx}>
                                            {SEVERITIES.map(s => (
                                                <MenuItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <TextField fullWidth label="Diagnosed" type="date"
                                                   value={newCondition.diagnosedDate} onChange={setCond('diagnosedDate')}
                                                   slotProps={{ inputLabel: { shrink: true } }} sx={fieldSx} />
                                    </Grid>
                                    <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <IconButton onClick={handleAddCondition} disabled={loading}
                                                    sx={{ backgroundColor: '#8B7355', color: 'white', borderRadius: 1,
                                                        '&:hover': { backgroundColor: '#6B5940' } }}>
                                            <AddIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Button variant="outlined" onClick={() => setActiveStep(0)}
                                            sx={{ borderColor: '#D4C5B0', color: 'text.secondary' }}>← Back</Button>
                                    <Button variant="contained" color="primary"
                                            onClick={() => setActiveStep(2)} sx={{ px: 4 }}>Continue →</Button>
                                </Box>
                            </Box>
                        )}

                        {/* ── STEP 3 ── */}
                        {activeStep === 2 && (
                            <Box>
                                {ageCategory !== 'CHILD' ? (
                                    <Box sx={{ textAlign: 'center', py: 6 }}>
                                        <Typography sx={{ fontSize: '3rem', mb: 2 }}>✅</Typography>
                                        <Typography variant="h6" sx={{ color: '#2C2416', mb: 1 }}>
                                            Profile complete!
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                            Guardian information is only required for child patients.
                                        </Typography>
                                        <Button variant="contained" color="primary"
                                                onClick={() => navigate('/dashboard')} sx={{ px: 5 }}>
                                            Go to Dashboard
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Typography sx={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'text.secondary', mb: 1 }}>
                                            GUARDIAN INFORMATION
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            Since this is a child patient, a guardian is required.
                                        </Typography>
                                        <Grid container spacing={2.5} sx={{ mb: 4 }}>
                                            <Grid item xs={6}>
                                                <TextField fullWidth required label="Guardian First Name"
                                                           value={guardian.firstName} onChange={setGuard('firstName')} sx={fieldSx} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField fullWidth required label="Guardian Last Name"
                                                           value={guardian.lastName} onChange={setGuard('lastName')} sx={fieldSx} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField fullWidth label="Phone"
                                                           value={guardian.phone} onChange={setGuard('phone')} sx={fieldSx} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField fullWidth label="Email"
                                                           value={guardian.email} onChange={setGuard('email')} sx={fieldSx} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField fullWidth select label="Relationship"
                                                           value={guardian.relationship} onChange={setGuard('relationship')} sx={fieldSx}>
                                                    {['PARENT', 'LEGAL_GUARDIAN', 'GRANDPARENT', 'SIBLING'].map(r => (
                                                        <MenuItem key={r} value={r}>{r.replace('_', ' ')}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                        </Grid>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Button variant="outlined" onClick={() => setActiveStep(1)}
                                                    sx={{ borderColor: '#D4C5B0', color: 'text.secondary' }}>← Back</Button>
                                            <Button variant="contained" color="primary"
                                                    onClick={handleSaveGuardian} disabled={loading} sx={{ px: 4 }}>
                                                {loading ? <CircularProgress size={20} color="inherit" /> : 'Complete Profile'}
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        )}

                    </Box>
                </Box>
            )}
        </Box>
    )
}