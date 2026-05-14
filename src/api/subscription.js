import { API } from './auth';

const authHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` },
});

// GET /api/v1/subscriptions/active
export const getActiveSubscription = async (token) => {
    const res = await fetch(`${API}/api/v1/subscriptions/active`, authHeaders(token));
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch active subscription');
    return res.json();
};

// GET /api/v1/subscriptions — toate abonamentele (istoric)
export const getAllSubscriptions = async (token) => {
    const res = await fetch(`${API}/api/v1/subscriptions`, authHeaders(token));
    if (!res.ok) throw new Error('Failed to fetch subscriptions');
    return res.json();
};

// POST /api/v1/subscriptions — body: { type: "MONTHLY" | "ANNUAL" }
export const createSubscription = async (token, type) => {
    const res = await fetch(`${API}/api/v1/subscriptions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create subscription');
    }
    return res.json();
};

// POST /api/v1/subscriptions/{id}/pay — body: { amount, paymentMethod: "CARD" }
export const paySubscription = async (token, subscriptionId, amount) => {
    const res = await fetch(`${API}/api/v1/subscriptions/${subscriptionId}/pay`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, paymentMethod: 'CARD' }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Payment failed');
    }
    return res.json();
};

// GET /api/v1/subscriptions/{id}/payments — istoricul plăților
export const getPaymentHistory = async (token, subscriptionId) => {
    const res = await fetch(
        `${API}/api/v1/subscriptions/${subscriptionId}/payments`,
        authHeaders(token)
    );
    if (!res.ok) throw new Error('Failed to fetch payment history');
    return res.json();
};