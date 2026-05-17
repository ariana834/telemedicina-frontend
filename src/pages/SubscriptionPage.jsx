import { useState, useEffect} from 'react';
import {
    Box, Typography, Card, CardContent, Chip, Button,
    Dialog, DialogContent, DialogTitle, DialogActions,
    CircularProgress, Divider, LinearProgress, Stack,
    TextField, InputAdornment, Fade, Collapse, Alert,
    IconButton,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import VerifiedIcon from '@mui/icons-material/Verified';
import HistoryIcon from '@mui/icons-material/History';
import { useAuth } from '../context/AuthContext';
import {
    getActiveSubscription,
    createSubscription,
    paySubscription,
    getPaymentHistory,
} from '../api/subscription';

const daysRemaining = (endDate) => {
    const diff = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
const daysTotal = (startDate, endDate) =>
    Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
const fmt = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
const fmtShort = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const PLANS = [
    {
        type: 'MONTHLY', label: 'Monthly', price: 50, period: 'per month', badge: null,
        perks: ['Unlimited telemedicine consultations','AI-powered medical form generation','Automatic appointment scheduling','Digital prescriptions & referrals','Full consultation history'],
    },
    {
        type: 'ANNUAL', label: 'Annual', price: 500, period: 'per year', badge: 'Best Value — Save 100 RON',
        perks: ['Everything in Monthly','Priority specialist matching','Extended medical history analytics','Annual health summary report','Early access to new features'],
    },
];

const inputSx = {
    '& .MuiOutlinedInput-root': { fontFamily: 'Lato', fontSize: '0.9rem', bgcolor: '#FDFAF6', '& fieldset': { borderColor: '#EDE5D8' }, '&:hover fieldset': { borderColor: '#8B7355' }, '&.Mui-focused fieldset': { borderColor: '#8B7355' } },
    '& .MuiInputLabel-root': { fontFamily: 'Lato', color: '#9E8B72' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#8B7355' },
};

function PlanCard({ plan, onSelect, loading }) {
    const isAnnual = plan.type === 'ANNUAL';
    return (
        <Card elevation={0} sx={{ flex: 1, minWidth: 280, maxWidth: 400, border: isAnnual ? '2px solid #8B7355' : '1.5px solid #EDE5D8', borderRadius: 3, bgcolor: isAnnual ? '#FFFCF8' : '#FDFAF6', position: 'relative', overflow: 'visible', transition: 'transform 0.18s, box-shadow 0.18s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(139,115,85,0.13)' } }}>
            {plan.badge && (
                <Box sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', bgcolor: '#8B7355', color: '#FFFCF8', px: 2, py: 0.4, borderRadius: 10, fontSize: '0.72rem', fontFamily: 'Lato, sans-serif', fontWeight: 700, letterSpacing: 0.4, whiteSpace: 'nowrap' }}>
                    {plan.badge}
                </Box>
            )}
            <CardContent sx={{ p: 3.5 }}>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 600, color: '#5C4A32', mb: 0.5 }}>{plan.label}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, mb: 0.5 }}>
                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', fontWeight: 700, color: '#8B7355', lineHeight: 1 }}>{plan.price}</Typography>
                    <Typography sx={{ fontFamily: 'Lato', color: '#8B7355', fontWeight: 600, fontSize: '1rem' }}>RON</Typography>
                    <Typography sx={{ fontFamily: 'Lato', color: '#9E8B72', fontSize: '0.85rem' }}>/ {plan.period}</Typography>
                </Box>
                {isAnnual && <Typography sx={{ fontFamily: 'Lato', fontSize: '0.8rem', color: '#8B7355', mb: 2, opacity: 0.8 }}>≈ 41.67 RON/month</Typography>}
                <Divider sx={{ borderColor: '#EDE5D8', my: 2 }} />
                <Stack spacing={1.2} sx={{ mb: 3 }}>
                    {plan.perks.map((perk, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: '1rem', color: '#8B7355', mt: 0.3, flexShrink: 0 }} />
                            <Typography sx={{ fontFamily: 'Lato', fontSize: '0.88rem', color: '#6B5A47' }}>{perk}</Typography>
                        </Box>
                    ))}
                </Stack>
                <Button fullWidth variant={isAnnual ? 'contained' : 'outlined'} disabled={loading} onClick={() => onSelect(plan)}
                        sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, letterSpacing: 0.6, py: 1.3, borderRadius: 2, bgcolor: isAnnual ? '#8B7355' : 'transparent', borderColor: '#8B7355', color: isAnnual ? '#FFFCF8' : '#8B7355', '&:hover': { bgcolor: isAnnual ? '#7A6348' : 'rgba(139,115,85,0.07)', borderColor: '#7A6348' } }}>
                    {loading ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : `Choose ${plan.label}`}
                </Button>
            </CardContent>
        </Card>
    );
}

function PaymentModal({ open, plan, onClose, onConfirm, paying }) {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry]         = useState('');
    const [cvv, setCvv]               = useState('');
    const [name, setName]             = useState('');
    const formatCard   = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    const formatExpiry = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d; };
    const filled = cardNumber.replace(/\s/g,'').length === 16 && expiry.length === 5 && cvv.length === 3 && name.trim();
    return (
        <Dialog open={open} onClose={!paying ? onClose : undefined} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: '#FFFCF8', border: '1.5px solid #EDE5D8' } }}>
            <DialogTitle sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 600, color: '#5C4A32', pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Payment Details</span>
                {!paying && <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" sx={{ color: '#9E8B72' }} /></IconButton>}
            </DialogTitle>
            <DialogContent sx={{ pt: 1.5 }}>
                {plan && (
                    <Box sx={{ bgcolor: 'rgba(139,115,85,0.07)', border: '1px solid #EDE5D8', borderRadius: 2, p: 2, mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography sx={{ fontFamily: 'Lato', fontSize: '0.8rem', color: '#9E8B72' }}>Selected plan</Typography>
                            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, color: '#5C4A32', fontSize: '1.1rem' }}>{plan.label} Subscription</Typography>
                        </Box>
                        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, color: '#8B7355', fontSize: '1.4rem' }}>{plan.price} RON</Typography>
                    </Box>
                )}
                <Stack spacing={2}>
                    <TextField label="Cardholder Name" value={name} onChange={(e) => setName(e.target.value)} size="small" fullWidth disabled={paying} sx={inputSx} />
                    <TextField label="Card Number" value={cardNumber} onChange={(e) => setCardNumber(formatCard(e.target.value))} size="small" fullWidth placeholder="0000 0000 0000 0000" disabled={paying} InputProps={{ endAdornment: <InputAdornment position="end"><CreditCardIcon sx={{ color: '#9E8B72', fontSize: '1.2rem' }} /></InputAdornment> }} sx={inputSx} />
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <TextField label="Expiry" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} size="small" placeholder="MM/YY" disabled={paying} sx={{ ...inputSx, flex: 1 }} />
                        <TextField label="CVV" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g,'').slice(0,3))} size="small" placeholder="···" disabled={paying} sx={{ ...inputSx, flex: 1 }} />
                    </Box>
                </Stack>
                <Typography sx={{ fontFamily: 'Lato', fontSize: '0.74rem', color: '#B0A090', mt: 2, textAlign: 'center' }}>
                    🔒 This is a simulated payment — no real charges will be made
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
                <Button fullWidth variant="contained" disabled={!filled || paying} onClick={() => onConfirm(plan)}
                        sx={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, py: 1.3, borderRadius: 2, bgcolor: '#8B7355', '&:hover': { bgcolor: '#7A6348' }, '&:disabled': { bgcolor: '#D4C9B8', color: '#9E8B72' } }}>
                    {paying ? <Box sx={{ display:'flex', alignItems:'center', gap:1 }}><CircularProgress size={16} sx={{ color:'#FFFCF8' }} /><span>Processing...</span></Box> : `Pay ${plan?.price ?? ''} RON`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function SuccessModal({ open, plan, subscription, onClose }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: '#FFFCF8', border: '1.5px solid #EDE5D8', overflow: 'hidden' } }}>
            <Box sx={{ bgcolor: '#8B7355', py: 3.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <VerifiedIcon sx={{ fontSize: '3rem', color: '#FFFCF8' }} />
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#FFFCF8', fontWeight: 600 }}>Subscription Activated!</Typography>
            </Box>
            <DialogContent sx={{ textAlign: 'center', pt: 3 }}>
                <Typography sx={{ fontFamily: 'Lato', color: '#6B5A47', fontSize: '0.9rem', mb: 2 }}>
                    Your <strong>{plan?.label}</strong> subscription is now active. You have full access to all telemedicine services.
                </Typography>
                {subscription && (
                    <Box sx={{ bgcolor: 'rgba(139,115,85,0.06)', border: '1px solid #EDE5D8', borderRadius: 2, p: 2, mb: 2 }}>
                        <Stack spacing={0.8}>
                            <Box sx={{ display:'flex', justifyContent:'space-between' }}>
                                <Typography sx={{ fontFamily:'Lato', fontSize:'0.82rem', color:'#9E8B72' }}>Start date</Typography>
                                <Typography sx={{ fontFamily:'Lato', fontSize:'0.82rem', color:'#5C4A32', fontWeight:600 }}>{fmtShort(subscription.startDate)}</Typography>
                            </Box>
                            <Box sx={{ display:'flex', justifyContent:'space-between' }}>
                                <Typography sx={{ fontFamily:'Lato', fontSize:'0.82rem', color:'#9E8B72' }}>Valid until</Typography>
                                <Typography sx={{ fontFamily:'Lato', fontSize:'0.82rem', color:'#5C4A32', fontWeight:600 }}>{fmtShort(subscription.endDate)}</Typography>
                            </Box>
                        </Stack>
                    </Box>
                )}
                <Button fullWidth variant="contained" onClick={onClose} sx={{ fontFamily:'Lato', fontWeight:700, py:1.2, borderRadius:2, bgcolor:'#8B7355', '&:hover':{ bgcolor:'#7A6348' } }}>
                    Start a Consultation
                </Button>
            </DialogContent>
        </Dialog>
    );
}

function ActiveSubscriptionCard({ subscription, payments }) {
    const remaining      = daysRemaining(subscription.endDate);
    const total          = daysTotal(subscription.startDate, subscription.endDate);
    const progress       = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
    const isExpiringSoon = remaining <= 7;
    return (
        <Fade in timeout={500}>
            <Card elevation={0} sx={{ border: '1.5px solid #EDE5D8', borderRadius: 3, bgcolor: '#FFFCF8', overflow: 'hidden' }}>
                <Box sx={{ bgcolor: '#8B7355', px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LocalHospitalIcon sx={{ color: '#FFFCF8', fontSize: '1.4rem' }} />
                        <Box>
                            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontWeight: 600, color: '#FFFCF8' }}>
                                {subscription.type === 'MONTHLY' ? 'Monthly' : 'Annual'} Subscription
                            </Typography>
                            <Typography sx={{ fontFamily: 'Lato', fontSize: '0.78rem', color: 'rgba(255,252,248,0.75)' }}>Full telemedicine access</Typography>
                        </Box>
                    </Box>
                    <Chip label="ACTIVE" size="small" sx={{ bgcolor: 'rgba(255,252,248,0.2)', color: '#FFFCF8', fontFamily: 'Lato', fontWeight: 700, fontSize: '0.7rem', letterSpacing: 1, border: '1px solid rgba(255,252,248,0.4)' }} />
                </Box>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Start Date',   value: fmt(subscription.startDate), icon: <CalendarTodayIcon sx={{ fontSize: '1rem', color: '#8B7355' }} /> },
                            { label: 'Expiry Date',  value: fmt(subscription.endDate),   icon: <AutorenewIcon     sx={{ fontSize: '1rem', color: '#8B7355' }} /> },
                            { label: 'Price',        value: `${subscription.price} RON`, icon: <CreditCardIcon    sx={{ fontSize: '1rem', color: '#8B7355' }} /> },
                        ].map((item) => (
                            <Box key={item.label} sx={{ flex: '1 1 140px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
                                    {item.icon}
                                    <Typography sx={{ fontFamily: 'Lato', fontSize: '0.75rem', color: '#9E8B72', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</Typography>
                                </Box>
                                <Typography sx={{ fontFamily: 'Lato', fontWeight: 700, color: '#5C4A32', fontSize: '0.95rem' }}>{item.value}</Typography>
                            </Box>
                        ))}
                    </Box>
                    <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                            <Typography sx={{ fontFamily: 'Lato', fontSize: '0.8rem', color: '#9E8B72' }}>Subscription period</Typography>
                            <Typography sx={{ fontFamily: 'Lato', fontSize: '0.8rem', fontWeight: 700, color: isExpiringSoon ? '#C0392B' : '#8B7355' }}>
                                {remaining} day{remaining !== 1 ? 's' : ''} remaining
                            </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, bgcolor: '#EDE5D8', '& .MuiLinearProgress-bar': { bgcolor: isExpiringSoon ? '#C0392B' : '#8B7355', borderRadius: 3 } }} />
                    </Box>
                    {isExpiringSoon && (
                        <Alert severity="warning" sx={{ mt: 2, bgcolor: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 2, fontFamily: 'Lato', fontSize: '0.85rem', '& .MuiAlert-icon': { color: '#C0392B' } }}>
                            Your subscription expires in {remaining} days. Consider renewing to maintain uninterrupted access.
                        </Alert>
                    )}
                </CardContent>
                {payments && payments.length > 0 && (
                    <>
                        <Divider sx={{ borderColor: '#EDE5D8' }} />
                        <Box sx={{ px: 3, py: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <HistoryIcon sx={{ fontSize: '1rem', color: '#8B7355' }} />
                                <Typography sx={{ fontFamily: 'Lato', fontWeight: 700, color: '#5C4A32', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Payment History</Typography>
                            </Box>
                            <Stack spacing={1}>
                                {payments.map((p) => (
                                    <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(139,115,85,0.04)', border: '1px solid #EDE5D8', borderRadius: 1.5, px: 2, py: 1 }}>
                                        <Box>
                                            <Typography sx={{ fontFamily: 'Lato', fontSize: '0.82rem', color: '#5C4A32', fontWeight: 600 }}>{fmtShort(p.paymentDate)}</Typography>
                                            {p.transactionId && <Typography sx={{ fontFamily: 'Lato', fontSize: '0.72rem', color: '#B0A090' }}>{p.transactionId}</Typography>}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Typography sx={{ fontFamily: 'Lato', fontWeight: 700, color: '#5C4A32', fontSize: '0.9rem' }}>{p.amount} RON</Typography>
                                            <Chip label={p.status} size="small" sx={{ fontSize: '0.68rem', fontFamily: 'Lato', fontWeight: 700,
                                                bgcolor: p.status === 'COMPLETED' ? 'rgba(46,125,50,0.1)' : p.status === 'FAILED' ? 'rgba(192,57,43,0.1)' : 'rgba(139,115,85,0.1)',
                                                color:  p.status === 'COMPLETED' ? '#2E7D32'            : p.status === 'FAILED' ? '#C0392B'            : '#8B7355',
                                            }} />
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </>
                )}
            </Card>
        </Fade>
    );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
    const { token } = useAuth();
    const [loading, setLoading]               = useState(true);
    const [active, setActive]                 = useState(null);
    const [payments, setPayments]             = useState([]);
    const [error, setError]                   = useState('');
    const [selectedPlan, setSelectedPlan]     = useState(null);
    const [paying, setPaying]                 = useState(false);
    const [newSubscription, setNewSubscription] = useState(null);
    const [showSuccess, setShowSuccess]       = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true); setError('');
            try {
                const sub = await getActiveSubscription(token);
                setActive(sub);
                if (sub) { const hist = await getPaymentHistory(token, sub.id); setPayments(Array.isArray(hist) ? hist : []); }
            } catch (e) { setError(e.message); }
            finally { setLoading(false); }
        };
        load();
    }, [token]);

    const handlePaymentConfirm = async (plan) => {
        setPaying(true); setError('');
        try {
            const sub     = await createSubscription(token, plan.type);
            await paySubscription(token, sub.id, plan.price);
            const updated = await getActiveSubscription(token);
            const hist    = updated ? await getPaymentHistory(token, updated.id) : [];
            setActive(updated); setPayments(Array.isArray(hist) ? hist : []);
            setNewSubscription(updated || sub); setSelectedPlan(null); setShowSuccess(true);
        } catch (e) { setError(e.message || 'Payment failed.'); setSelectedPlan(null); }
        finally { setPaying(false); }
    };

    return (
        <Box component="main" sx={{ flexGrow: 1, px: { xs: 2.5, md: 5 }, py: 4.5, maxWidth: 860, mx: 'auto', width: '100%', minHeight: '100vh' }}>

            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <ReceiptLongIcon sx={{ color: '#8B7355', fontSize: '1.6rem' }} />
                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 700, color: '#3D2E1E' }}>
                        Subscription
                    </Typography>
                </Box>
                <Typography sx={{ fontFamily: 'Lato', color: '#9E8B72', fontSize: '0.92rem', ml: 0.5 }}>
                    Manage your telemedicine plan and payment history
                </Typography>
            </Box>

            <Collapse in={!!error}>
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2.5, borderRadius: 2, fontFamily: 'Lato' }}>{error}</Alert>
            </Collapse>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: '#8B7355' }} /></Box>
            ) : active ? (
                <ActiveSubscriptionCard subscription={active} payments={payments} />
            ) : (
                <Fade in timeout={400}>
                    <Box>
                        <Card elevation={0} sx={{ border: '1.5px solid #EDE5D8', borderRadius: 3, bgcolor: '#FFFCF8', p: 3, mb: 3, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <LocalHospitalIcon sx={{ color: '#8B7355', fontSize: '1.5rem', mt: 0.3 }} />
                            <Box>
                                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontWeight: 600, color: '#5C4A32', mb: 0.4 }}>No Active Subscription</Typography>
                                <Typography sx={{ fontFamily: 'Lato', fontSize: '0.88rem', color: '#9E8B72', lineHeight: 1.6 }}>
                                    A subscription is required to access telemedicine consultations. Choose a plan below to get started.
                                </Typography>
                            </Box>
                        </Card>
                        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 600, color: '#3D2E1E', mb: 2.5 }}>Choose Your Plan</Typography>
                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                            {PLANS.map((plan) => <PlanCard key={plan.type} plan={plan} onSelect={setSelectedPlan} loading={paying} />)}
                        </Box>
                    </Box>
                </Fade>
            )}

            <PaymentModal open={!!selectedPlan} plan={selectedPlan} onClose={() => setSelectedPlan(null)} onConfirm={handlePaymentConfirm} paying={paying} />
            <SuccessModal open={showSuccess} plan={PLANS.find(p => p.type === newSubscription?.type)} subscription={newSubscription} onClose={() => { setShowSuccess(false); setNewSubscription(null); }} />
        </Box>
    );
}