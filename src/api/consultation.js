// src/api/consultation.js
import { API } from './auth';

const authHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` },
});

const jsonHeaders = (token) => ({
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
});

// POST /api/consultations?notes=...
export const createConsultation = async (token, notes = '') => {
    const url = notes
        ? `${API}/api/consultations?notes=${encodeURIComponent(notes)}`
        : `${API}/api/consultations`;
    const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create consultation');
    }
    return res.json();
};

// POST /api/consultations/{id}/symptoms
// body: { symptomName, severity: "MILD"|"MODERATE"|"SEVERE" }
export const addSymptom = async (token, consultationId, symptomName, severity = 'MODERATE') => {
    const res = await fetch(`${API}/api/consultations/${consultationId}/symptoms`, {
        ...jsonHeaders(token),
        body: JSON.stringify({ symptomName, severity }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to add symptom');
    }
    return res.json(); // ConsultationResponse cu status actualizat
};

// GET /api/consultations/{id}/form
// returneaza List<MedicalFormResponse>
export const getForm = async (token, consultationId) => {
    const res = await fetch(`${API}/api/consultations/${consultationId}/form`, authHeaders(token));
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch form');
    }
    return res.json(); // [{ id, questionText, questionType, options, orderIndex, isRequired }]
};

// POST /api/consultations/{id}/answers
// body: { answers: [{ questionId, answerText }] }
export const submitAnswers = async (token, consultationId, answers) => {
    const res = await fetch(`${API}/api/consultations/${consultationId}/answers`, {
        ...jsonHeaders(token),
        body: JSON.stringify({ answers }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to submit answers');
    }
    return res.json(); // ConsultationDetailResponse
};

// POST /api/consultations/{id}/diagnose
export const diagnose = async (token, consultationId) => {
    const res = await fetch(`${API}/api/consultations/${consultationId}/diagnose`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to compute diagnosis');
    }
    return res.json(); // ConsultationDetailResponse cu diagnoses
};

// POST /api/consultations/{id}/schedule
// returneaza { appointmentId }
export const scheduleAppointment = async (token, consultationId) => {
    const res = await fetch(`${API}/api/consultations/${consultationId}/schedule`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to schedule appointment');
    }
    return res.json(); // { appointmentId }
};

// POST /api/consultations/{id}/prescribe
// returneaza { prescriptionId }
export const prescribe = async (token, consultationId) => {
    const res = await fetch(`${API}/api/consultations/${consultationId}/prescribe`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to generate prescription');
    }
    return res.json(); // { prescriptionId }
};

// GET /api/consultations/my
export const getMyConsultations = async (token) => {
    const res = await fetch(`${API}/api/consultations/my`, authHeaders(token));
    if (!res.ok) throw new Error('Failed to fetch consultations');
    return res.json();
};

// GET /api/consultations/{id}
export const getConsultation = async (token, consultationId) => {
    const res = await fetch(`${API}/api/consultations/${consultationId}`, authHeaders(token));
    if (!res.ok) throw new Error('Failed to fetch consultation');
    return res.json();
};