import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const tokenResponse = await api.post('token/', { username, password })
            localStorage.setItem('access_token', tokenResponse.data.access)

            const userResponse = await api.get('health/')
            const userRole = userResponse.data.role || 'MONITOR'

            localStorage.setItem('user_role', userRole)

            // Dispatch custom event to update App navigation
            window.dispatchEvent(new Event('authChange'))

            if (userRole === 'ADMIN') {
                navigate('/admin', { replace: true })
            } else if (userRole === 'REPORTER') {
                navigate('/reporter', { replace: true })
            } else if (userRole === 'MONITOR') {
                navigate('/dashboard', { replace: true })
            } else {
                setError('Unauthorized role for this application.')
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Welcome Back</h2>
                    <p style={styles.subtitle}>Sign in to continue to HFRAT</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                            style={styles.input}
                        />
                    </div>

                    {error && (
                        <div style={styles.error}>
                            <svg style={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            ...(loading ? styles.buttonDisabled : {}),
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1rem',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
    },
    header: {
        marginBottom: '2rem',
        textAlign: 'center',
    },
    title: {
        fontSize: '1.875rem',
        fontWeight: '700',
        color: '#1a202c',
        margin: '0 0 0.5rem 0',
    },
    subtitle: {
        fontSize: '0.875rem',
        color: '#718096',
        margin: 0,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
    },
    input: {
        width: '100%',
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.2s',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '0.875rem 1rem',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#ffffff',
        backgroundColor: '#667eea',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginTop: '0.5rem',
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
    },
    error: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        borderRadius: '8px',
        fontSize: '0.875rem',
        border: '1px solid #fecaca',
    },
    errorIcon: {
        width: '1.25rem',
        height: '1.25rem',
        flexShrink: 0,
    },
}
