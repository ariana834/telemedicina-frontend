const API = 'http://localhost:8084';

export const getMyAppointments = (token) =>
    fetch(`${API}/api/v1/appointments/my`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

export const getAppointmentById = (token, id) =>
    fetch(`${API}/api/v1/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

export const cancelAppointment = (token, id) =>
    fetch(`${API}/api/v1/appointments/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());