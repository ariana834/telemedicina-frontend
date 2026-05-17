const API = 'http://localhost:8084';

export const getMyPrescriptions = (token) =>
    fetch(`${API}/api/v1/prescriptions/my`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

export const getPrescriptionById = (token, id) =>
    fetch(`${API}/api/v1/prescriptions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

export const getPrescriptionByConsultation = (token, consultationId) =>
    fetch(`${API}/api/v1/prescriptions/consultation/${consultationId}`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());