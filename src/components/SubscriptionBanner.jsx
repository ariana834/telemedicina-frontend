// src/components/SubscriptionBanner.jsx
// Înlocuiește bannerul static din DashboardPage.
// Importă și folosește în DashboardPage.jsx astfel:
//   import SubscriptionBanner from '../components/SubscriptionBanner';
//   ...
//   <SubscriptionBanner />   (se poate pune oriunde în pagina de dashboard)

import { useState, useEffect} from 'react';
import { Box, Typography, Button, Chip, Skeleton, LinearProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getActiveSubscription } from '../api/subscription';

const daysRemaining = (endDate) =>
    Math.max(0, Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)));

export default function SubscriptionBanner() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [sub, setSub] = useState(undefined); // undefined = loading, null = no sub
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getActiveSubscription(token)
            .then(setSub)
            .catch(() => setSub(null))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <Skeleton
                variant="rounded"
                height={64}
                sx={{ bgcolor: 'rgba(139,115,85,0.08)', borderRadius: 2, mb: 2 }}
            />
        );
    }

    // ── no subscription ──────────────────────────────────────────────────────
    if (!sub) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    bgcolor: 'rgba(192,57,43,0.06)',
                    border: '1.5px solid rgba(192,57,43,0.2)',
                    borderRadius: 2,
                    px: 2.5,
                    py: 1.8,
                    mb: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <ErrorOutlineIcon sx={{ color: '#C0392B', fontSize: '1.3rem' }} />
                    <Box>
                        <Typography sx={{ fontFamily: 'Lato', fontWeight: 700, color: '#C0392B', fontSize: '0.88rem' }}>
                            No Active Subscription
                        </Typography>
                        <Typography sx={{ fontFamily: 'Lato', color: '#6B5A47', fontSize: '0.8rem' }}>
                            Subscribe to access consultations and medical services
                        </Typography>
                    </Box>
                </Box>
                <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate('/subscription')}
                    sx={{
                        fontFamily: 'Lato', fontWeight: 700, fontSize: '0.8rem',
                        bgcolor: '#8B7355', '&:hover': { bgcolor: '#7A6348' },
                        borderRadius: 1.5, px: 2, py: 0.8,
                    }}
                >
                    View Plans
                </Button>
            </Box>
        );
    }

    const days = daysRemaining(sub.endDate);
    const isExpiringSoon = days <= 7;
    const total = Math.ceil((new Date(sub.endDate) - new Date(sub.startDate)) / (1000 * 60 * 60 * 24));
    const progress = Math.max(0, Math.min(100, ((total - days) / total) * 100));

    // ── expiring soon ────────────────────────────────────────────────────────
    if (isExpiringSoon) {
        return (
            <Box
                sx={{
                    bgcolor: 'rgba(245,176,65,0.08)',
                    border: '1.5px solid rgba(245,176,65,0.35)',
                    borderRadius: 2,
                    px: 2.5,
                    py: 1.8,
                    mb: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <WarningAmberIcon sx={{ color: '#E67E22', fontSize: '1.3rem' }} />
                        <Box>
                            <Typography sx={{ fontFamily: 'Lato', fontWeight: 700, color: '#E67E22', fontSize: '0.88rem' }}>
                                Subscription Expiring Soon
                            </Typography>
                            <Typography sx={{ fontFamily: 'Lato', color: '#6B5A47', fontSize: '0.8rem' }}>
                                {sub.type === 'MONTHLY' ? 'Monthly' : 'Annual'} plan · {days} day{days !== 1 ? 's' : ''} remaining
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate('/subscription')}
                        sx={{
                            fontFamily: 'Lato', fontWeight: 700, fontSize: '0.8rem',
                            borderColor: '#E67E22', color: '#E67E22',
                            '&:hover': { bgcolor: 'rgba(230,126,34,0.07)', borderColor: '#E67E22' },
                            borderRadius: 1.5, px: 2, py: 0.8,
                        }}
                    >
                        Renew
                    </Button>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                        mt: 1.5, height: 4, borderRadius: 2, bgcolor: 'rgba(245,176,65,0.2)',
                        '& .MuiLinearProgress-bar': { bgcolor: '#E67E22', borderRadius: 2 },
                    }}
                />
            </Box>
        );
    }

    // ── active & healthy ─────────────────────────────────────────────────────
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
                bgcolor: 'rgba(139,115,85,0.06)',
                border: '1.5px solid #EDE5D8',
                borderRadius: 2,
                px: 2.5,
                py: 1.8,
                mb: 2,
                cursor: 'pointer',
                transition: 'border-color 0.15s',
                '&:hover': { borderColor: '#8B7355' },
            }}
            onClick={() => navigate('/subscription')}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <CheckCircleIcon sx={{ color: '#8B7355', fontSize: '1.3rem' }} />
                <Box>
                    <Typography sx={{ fontFamily: 'Lato', fontWeight: 700, color: '#5C4A32', fontSize: '0.88rem' }}>
                        {sub.type === 'MONTHLY' ? 'Monthly' : 'Annual'} Subscription — Active
                    </Typography>
                    <Typography sx={{ fontFamily: 'Lato', color: '#9E8B72', fontSize: '0.8rem' }}>
                        {days} day{days !== 1 ? 's' : ''} remaining · Valid until{' '}
                        {new Date(sub.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Typography>
                </Box>
            </Box>
            <Chip
                label={`${sub.price} RON`}
                size="small"
                sx={{
                    fontFamily: 'Lato', fontWeight: 700, fontSize: '0.78rem',
                    bgcolor: 'rgba(139,115,85,0.1)', color: '#8B7355',
                    border: '1px solid #EDE5D8',
                }}
            />
        </Box>
    );
}