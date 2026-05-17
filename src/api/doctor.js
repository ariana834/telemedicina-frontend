const API = 'http://localhost:8084'

const h = (token) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
})

export const getMyAppointmentsAsDoctor = (token) =>
    fetch(`${API}/api/v1/appointments/doctor/my`, { headers: h(token) }).then(r => r.json())

export const getAppointmentById = (token, id) =>
    fetch(`${API}/api/v1/appointments/${id}`, { headers: h(token) }).then(r => r.json())

export const startAppointment = (token, id) =>
    fetch(`${API}/api/v1/appointments/${id}/start`, { method: 'POST', headers: h(token) }).then(r => r.json())

export const completeAppointment = (token, id) =>
    fetch(`${API}/api/v1/appointments/${id}/complete`, { method: 'POST', headers: h(token) }).then(r => r.json())

export const markNoShow = (token, id) =>
    fetch(`${API}/api/v1/appointments/${id}/no-show`, { method: 'POST', headers: h(token) }).then(r => r.json())

export const updateNotes = (token, id, notes) =>
    fetch(`${API}/api/v1/appointments/${id}/notes`, {
        method: 'PATCH', headers: h(token), body: JSON.stringify({ notes }),
    }).then(r => r.json())

export const createPrescription = (token, data) =>
    fetch(`${API}/api/v1/prescriptions`, {
        method: 'POST', headers: h(token), body: JSON.stringify(data),
    }).then(r => r.json())

export const createReferral = (token, data) =>
    fetch(`${API}/api/v1/referrals`, {
        method: 'POST', headers: h(token), body: JSON.stringify(data),
    }).then(r => r.json())