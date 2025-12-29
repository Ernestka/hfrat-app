import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import ReporterForm from './pages/ReporterForm'
import MonitorDashboard from './pages/MonitorDashboard'
import Landing from './pages/Landing'
import AdminUserCreator from './pages/AdminUserCreator'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
    const links = [
        { to: '/', label: 'Home' },
        { to: '/login', label: 'Login' },
        { to: '/reporter', label: 'Reporter' },
        { to: '/dashboard', label: 'Dashboard' },
    ]

    return (
        <div style={styles.shell}>
            <div style={styles.navWrapper}>
                <div style={styles.brand}>HFRAT</div>
                <nav style={styles.nav}>
                    {links.map((link) => (
                        <Link key={link.to} to={link.to} style={styles.navLink}>
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <main style={styles.content}>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/reporter" element={<ProtectedRoute><ReporterForm /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><MonitorDashboard /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute><AdminUserCreator /></ProtectedRoute>} />
                    <Route path="*" element={<div>Not Found</div>} />
                </Routes>
            </main>
        </div>
    )
}

const styles = {
    shell: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e5e7eb 30%, #e0f2fe 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        padding: '1.5rem',
        boxSizing: 'border-box',
    },
    navWrapper: {
        maxWidth: '1600px',
        margin: '0 auto 1.5rem',
        padding: '0.85rem 1.2rem',
        backgroundColor: '#ffffffcc',
        backdropFilter: 'blur(8px)',
        borderRadius: '14px',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid #e5e7eb',
    },
    brand: {
        fontWeight: 800,
        letterSpacing: '0.5px',
        fontSize: '1.1rem',
        padding: '0.35rem 0.75rem',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
        color: '#ffffff',
        boxShadow: '0 8px 18px rgba(37, 99, 235, 0.28)',
    },
    nav: {
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
    },
    navLink: {
        textDecoration: 'none',
        color: '#1f2937',
        fontWeight: 700,
        padding: '0.65rem 0.95rem',
        borderRadius: '10px',
        transition: 'all 0.15s ease',
        border: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc',
        boxShadow: '0 8px 16px rgba(15, 23, 42, 0.08)',
    },
    content: {
        maxWidth: '1600px',
        margin: '0 auto',
        backgroundColor: '#ffffffcc',
        borderRadius: '18px',
        boxShadow: '0 18px 36px rgba(15, 23, 42, 0.12)',
        border: '1px solid #e5e7eb',
        padding: '1rem',
        backdropFilter: 'blur(6px)',
    },
}
