const API = 'http://localhost:8084';

export const getMyReferrals = (token) =>
    fetch(`${API}/api/v1/referrals/my`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

export const getReferralById = (token, id) =>
    fetch(`${API}/api/v1/referrals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

export const getReferralByConsultation = (token, consultationId) =>
    fetch(`${API}/api/referrals/consultation/${consultationId}`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());