import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminCreateUser } from '../services/api'

export default function AdminUserCreator() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        username: '',
        password: '',
        role: 'REPORTER',
        facility_id: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Basic guard: only allow when role is ADMIN
    useEffect(() => {
        const role = localStorage.getItem('user_role')
        if (role !== 'ADMIN') {
            navigate('/login', { replace: true })
        }
    }, [navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)
        try {
            const payload = {
                username: form.username.trim(),
                password: form.password,
                role: form.role,
                facility_id: form.role === 'REPORTER' ? Number(form.facility_id) : null,
            }
            const data = await adminCreateUser(payload)
            setSuccess(`User created: ${data.username} (${data.role})`)
            setForm({ username: '', password: '', role: 'REPORTER', facility_id: '' })
        } catch (err) {
            setError(err.response?.data?.detail || formatErrors(err.response?.data) || 'Failed to create user.')
        } finally {
            setLoading(false)
        }
    }

    const formatErrors = (data) => {
        if (!data) return ''
        if (typeof data === 'string') return data
        return Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Admin: Create Users</h2>
                <p style={styles.subtitle}>Add Reporter or Monitor accounts</p>

                {error && <div style={styles.alertError}>{error}</div>}
                {success && <div style={styles.alertSuccess}>{success}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>Username</label>
                            <input name="username" value={form.username} onChange={handleChange} required disabled={loading} style={styles.input} />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Password</label>
                            <input name="password" type="password" value={form.password} onChange={handleChange} required disabled={loading} style={styles.input} />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>Role</label>
                            <select name="role" value={form.role} onChange={handleChange} disabled={loading} style={styles.input}>
                                <option value="REPORTER">Reporter</option>
                                <option value="MONITOR">Monitor</option>
                            </select>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Facility ID (for Reporter)</label>
                            <input name="facility_id" type="number" value={form.facility_id} onChange={handleChange} disabled={loading || form.role !== 'REPORTER'} style={styles.input} />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Creating...' : 'Create User'}
                    </button>
                </form>
            </div>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1f2937,#111827)', padding: '2rem'
    },
    card: {
        background: '#0b1220', color: '#e5e7eb', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.4)', width: '100%', maxWidth: 720, padding: '2rem'
    },
    title: { margin: 0, fontSize: '1.75rem', fontWeight: 700 },
    subtitle: { marginTop: 8, color: '#9ca3af', fontSize: '0.95rem' },
    form: { marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    field: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: { fontSize: '0.85rem', color: '#9ca3af' },
    input: { background: '#0f172a', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: 8, padding: '0.75rem', outline: 'none' },
    button: { marginTop: '0.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem', cursor: 'pointer', fontWeight: 600 },
    alertError: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 8, padding: '0.75rem', marginBottom: '0.75rem' },
    alertSuccess: { background: '#dcfce7', color: '#14532d', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.75rem', marginBottom: '0.75rem' },
}
