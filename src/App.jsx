import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import ProfilePage from './pages/ProfilePage'
import SubscriptionPage from './pages/SubscriptionPage'
import NewConsultationPage from './pages/NewConsultationPage'
import ConsultationsPage from './pages/ConsultationsPage'
import AppointmentsPage from './pages/AppointmentsPage'
import PrescriptionsPage from './pages/PrescriptionsPage'
import ReferralsPage from './pages/ReferralsPage'
import DoctorsPage from './pages/DoctorsPage.jsx'
import DoctorDashboardPage from './pages/DoctorDashboardPage.jsx'
import DoctorConsultationPage from './pages/DoctorConsultationPage.jsx'

function AppLayout({ children }) {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#F7F3EE' }}>
                {children}
            </Box>
        </Box>
    )
}

function RoleRoute({ children, requiredRole }) {
    const { role } = useAuth()
    if (!role) return <Navigate to="/login" />
    if (role !== requiredRole) return <Navigate to={role === 'DOCTOR' ? '/doctor/dashboard' : '/dashboard'} />
    return children
}

export default function App() {
    return (
        <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ── PATIENT ROUTES ── */}
            <Route path="/dashboard" element={
                <ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>
            } />
            <Route path="/subscription" element={
                <ProtectedRoute><AppLayout><SubscriptionPage /></AppLayout></ProtectedRoute>
            } />
            <Route path="/consultations/new" element={
                <ProtectedRoute><AppLayout><NewConsultationPage /></AppLayout></ProtectedRoute>
            } />
            <Route path="/consultations" element={
                <ProtectedRoute><AppLayout><ConsultationsPage /></AppLayout></ProtectedRoute>
            } />
            <Route path="/appointments" element={
                <ProtectedRoute><AppLayout><AppointmentsPage /></AppLayout></ProtectedRoute>
            } />
            <Route path="/prescriptions" element={
                <ProtectedRoute><AppLayout><PrescriptionsPage /></AppLayout></ProtectedRoute>
            } />
            <Route path="/referrals" element={
                <ProtectedRoute><AppLayout><ReferralsPage /></AppLayout></ProtectedRoute>
            } />
            <Route path="/doctors" element={
                <ProtectedRoute><AppLayout><DoctorsPage /></AppLayout></ProtectedRoute>
            } />

            {/* ── DOCTOR ROUTES ── */}
            <Route path="/doctor/dashboard" element={
                <ProtectedRoute>
                    <RoleRoute requiredRole="DOCTOR">
                        <AppLayout><DoctorDashboardPage /></AppLayout>
                    </RoleRoute>
                </ProtectedRoute>
            } />
            <Route path="/doctor/appointments" element={
                <ProtectedRoute>
                    <RoleRoute requiredRole="DOCTOR">
                        <AppLayout><DoctorDashboardPage /></AppLayout>
                    </RoleRoute>
                </ProtectedRoute>
            } />
            <Route path="/doctor/consultation/:appointmentId" element={
                <ProtectedRoute>
                    <RoleRoute requiredRole="DOCTOR">
                        <AppLayout><DoctorConsultationPage /></AppLayout>
                    </RoleRoute>
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    )
}