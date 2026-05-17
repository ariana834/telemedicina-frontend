import { useEffect, useState } from 'react';
import {
    Box, Typography, Chip, Card, CardContent, Stack,
    CircularProgress, Alert, Divider, IconButton,
} from '@mui/material';
import {
    LocalHospitalOutlined, ScienceOutlined, ArrowBackOutlined,
    ErrorOutlined, WarningAmberOutlined, InfoOutlined,
    PlaceOutlined, NotesOutlined,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyReferrals } from '../api/referrals';

/* ─── Config ─────────────────────────────────────────────── */
const REFERRAL_TYPE = {
    HOSPITAL:      { label: 'Hospital',      color: '#B71C1C', bg: '#FFEBEE', Icon: LocalHospitalOutlined },
    INVESTIGATION: { label: 'Investigation', color: '#1A237E', bg: '#E8EAF6', Icon: ScienceOutlined },
};

const PRIORITY = {
    ROUTINE:   { label: 'Routine',   color: '#2E7D32', bg: '#E8F5E9', Icon: InfoOutlined, order: 1 },
    URGENT:    { label: 'Urgent',    color: '#E65100', bg: '#FFF3E0', Icon: WarningAmberOutlined, order: 2 },
    EMERGENCY: { label: 'Emergency', color: '#B71C1C', bg: '#FFEBEE', Icon: ErrorOutlined, order: 3 },
};

function ReferralCard({ referral: r }) {
    const typeCfg  = REFERRAL_TYPE[r.referralType  || r.referral_type]  || REFERRAL_TYPE.HOSPITAL;
    const prioCfg  = PRIORITY[r.priority]  || PRIORITY.ROUTINE;
    const doctor   = r.doctor || {};
    const doctorName = doctor.fullName || doctor.full_name || r.doctorName || null;

    const issuedAt = r.issuedAt || r.issued_at;
    const issuedLabel = issuedAt
        ? new Date(issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—';

    const destination = r.destination;
    const reason = r.reason;

    return (
        <Card
            elevation={0}
            sx={{
                bgcolor: '#FFFCF8',
                border: `1px solid #E8DDD0`,
                borderLeft: `4px solid ${prioCfg.color}`,
                borderRadius: 3,
                mb: 2,
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 4px 20px rgba(139,115,85,0.12)' },
            }}
        >
            <CardContent sx={{ py: 2.5, px: 3 }}>
                {/* Header row */}
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        {/* Type icon circle */}
                        <Box
                            sx={{
                                width: 42, height: 42, borderRadius: '50%',
                                bgcolor: typeCfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <typeCfg.Icon sx={{ fontSize: 20, color: typeCfg.color }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 700, color: '#3D2B1F', lineHeight: 1.2 }}>
                                {typeCfg.label} Referral
                            </Typography>
                            <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.75rem', color: '#A89070' }}>
                                Issued {issuedLabel}
                                {doctorName ? ` · Dr. ${doctorName}` : ''}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Priority badge */}
                    <Chip
                        icon={<prioCfg.Icon sx={{ fontSize: '14px !important', color: `${prioCfg.color} !important` }} />}
                        label={prioCfg.label}
                        size="small"
                        sx={{
                            bgcolor: prioCfg.bg, color: prioCfg.color,
                            fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.72rem',
                            border: `1px solid ${prioCfg.color}30`,
                            alignSelf: 'flex-start',
                        }}
                    />
                </Stack>

                {/* Details */}
                {(destination || reason) && (
                    <>
                        <Divider sx={{ my: 1.75, borderColor: '#E8DDD0' }} />
                        <Stack spacing={1}>
                            {destination && (
                                <Stack direction="row" alignItems="flex-start" spacing={1}>
                                    <PlaceOutlined sx={{ fontSize: 16, color: '#8B7355', mt: 0.15 }} />
                                    <Box>
                                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.7rem', color: '#A89070', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.15 }}>
                                            Destination
                                        </Typography>
                                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.85rem', color: '#4A3728', fontWeight: 600 }}>
                                            {destination}
                                        </Typography>
                                    </Box>
                                </Stack>
                            )}
                            {reason && (
                                <Stack direction="row" alignItems="flex-start" spacing={1}>
                                    <NotesOutlined sx={{ fontSize: 16, color: '#8B7355', mt: 0.15 }} />
                                    <Box>
                                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.7rem', color: '#A89070', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.15 }}>
                                            Reason
                                        </Typography>
                                        <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.82rem', color: '#7A6352' }}>
                                            {reason}
                                        </Typography>
                                    </Box>
                                </Stack>
                            )}
                        </Stack>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function ReferralsPage() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getMyReferrals(token)
            .then((data) => {
                setReferrals(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setError('Could not load referrals.');
                setLoading(false);
            });
    }, [token]);

    /* Sort by priority severity, then by date desc */
    const sorted = [...referrals].sort((a, b) => {
        const pa = PRIORITY[a.priority]?.order || 0;
        const pb = PRIORITY[b.priority]?.order || 0;
        if (pb !== pa) return pb - pa;
        return new Date(b.issuedAt || b.issued_at) - new Date(a.issuedAt || a.issued_at);
    });

    const hospitals     = sorted.filter((r) => (r.referralType || r.referral_type) === 'HOSPITAL');
    const investigations = sorted.filter((r) => (r.referralType || r.referral_type) === 'INVESTIGATION');

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 860, mx: 'auto' }}>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ mb: 2, color: '#8B7355', '&:hover': { bgcolor: '#F2EAE0' } }}>
                <ArrowBackOutlined />
            </IconButton>
            <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.75rem', color: '#A89070', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.5 }}>
                    Medical Records
                </Typography>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, color: '#3D2B1F', lineHeight: 1.1 }}>
                    My Referrals
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
                    <CircularProgress sx={{ color: '#8B7355' }} />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            ) : referrals.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <ScienceOutlined sx={{ fontSize: 56, color: '#D4C4B0', mb: 2 }} />
                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#A89070' }}>
                        No referrals found
                    </Typography>
                    <Typography sx={{ fontFamily: 'Lato, sans-serif', fontSize: '0.85rem', color: '#C4A882', mt: 1 }}>
                        Referrals from your doctors will appear here.
                    </Typography>
                </Box>
            ) : (
                <>
                    {hospitals.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <LocalHospitalOutlined sx={{ fontSize: 20, color: '#B71C1C' }} />
                                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontWeight: 600, color: '#3D2B1F' }}>
                                    Hospital Referrals ({hospitals.length})
                                </Typography>
                            </Stack>
                            {hospitals.map((r) => <ReferralCard key={r.id} referral={r} />)}
                        </Box>
                    )}

                    {investigations.length > 0 && (
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <ScienceOutlined sx={{ fontSize: 20, color: '#1A237E' }} />
                                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontWeight: 600, color: '#3D2B1F' }}>
                                    Investigation Referrals ({investigations.length})
                                </Typography>
                            </Stack>
                            {investigations.map((r) => <ReferralCard key={r.id} referral={r} />)}
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}