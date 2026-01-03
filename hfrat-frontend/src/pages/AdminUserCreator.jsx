import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminCreateUser, adminGetUsers, adminUpdateUser, adminDeleteUser, adminExportUsers } from '../services/api'

export default function AdminUserCreator() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        username: '',
        password: '',
        role: 'REPORTER',
        hospital_name: '',
        country: '',
        city: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [users, setUsers] = useState([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [showUserList, setShowUserList] = useState(true)
    const [isEditMode, setIsEditMode] = useState(false)

    // Basic guard: only allow when role is ADMIN
    useEffect(() => {
        const role = localStorage.getItem('user_role')
        if (role !== 'ADMIN') {
            navigate('/login', { replace: true })
        } else {
            fetchUsers()
        }
    }, [navigate])

    const fetchUsers = async () => {
        setLoadingUsers(true)
        try {
            const data = await adminGetUsers()
            setUsers(data)
        } catch (err) {
            console.error('Failed to fetch users:', err)
        } finally {
            setLoadingUsers(false)
        }
    }

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
                role: form.role,
            }

            // Only include password if it's being changed
            if (form.password) {
                payload.password = form.password
            }

            if (form.role === 'REPORTER') {
                payload.hospital_name = form.hospital_name.trim()
                payload.country = form.country.trim()
                payload.city = form.city.trim()
            }

            if (isEditMode && editingUser) {
                // Update existing user
                const data = await adminUpdateUser(editingUser.id, payload)
                setSuccess(`User updated: ${data.username} (${data.role})`)
                setIsEditMode(false)
                setEditingUser(null)
            } else {
                // Create new user
                payload.password = form.password // Password required for creation
                const data = await adminCreateUser(payload)
                setSuccess(`User created: ${data.username} (${data.role})`)
            }

            setForm({ username: '', password: '', role: 'REPORTER', hospital_name: '', country: '', city: '' })
            fetchUsers() // Refresh user list
        } catch (err) {
            setError(err.response?.data?.detail || formatErrors(err.response?.data) || `Failed to ${isEditMode ? 'update' : 'create'} user.`)
        } finally {
            setLoading(false)
        }
    }

    const formatErrors = (data) => {
        if (!data) return ''
        if (typeof data === 'string') return data
        return Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
    }

    const handleDelete = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) return

        try {
            await adminDeleteUser(userId)
            setSuccess(`User "${username}" deleted successfully`)
            fetchUsers()
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to delete user')
        }
    }

    const handleExport = async () => {
        try {
            const response = await adminExportUsers()
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            const filename = response.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || 'users.xlsx'
            link.setAttribute('download', filename)
            document.body.appendChild(link)
            link.click()
            link.remove()
            setSuccess('Users exported successfully')
        } catch (err) {
            setError('Failed to export users')
        }
    }

    const handleEdit = (user) => {
        setEditingUser(user)
        setIsEditMode(true)
        setForm({
            username: user.username,
            password: '', // Leave empty - user can change it if needed
            role: user.role,
            hospital_name: user.facility?.name || '',
            country: user.facility?.country || '',
            city: user.facility?.city || '',
        })
        setShowUserList(false)
        setError('')
        setSuccess('')
    }

    const handleCancelEdit = () => {
        setIsEditMode(false)
        setEditingUser(null)
        setForm({ username: '', password: '', role: 'REPORTER', hospital_name: '', country: '', city: '' })
        setError('')
        setSuccess('')
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Admin: User Management</h2>
                <p style={styles.subtitle}>Create and manage user accounts</p>

                <div style={styles.tabBar}>
                    <button
                        onClick={() => {
                            setShowUserList(true)
                            handleCancelEdit()
                        }}
                        style={{ ...styles.tab, ...(showUserList ? styles.tabActive : {}) }}
                    >
                        User List ({users.length})
                    </button>
                    <button
                        onClick={() => {
                            setShowUserList(false)
                            if (!isEditMode) {
                                setForm({ username: '', password: '', role: 'REPORTER', hospital_name: '', country: '', city: '' })
                            }
                        }}
                        style={{ ...styles.tab, ...(!showUserList ? styles.tabActive : {}) }}
                    >
                        {isEditMode ? 'Edit User' : 'Create New User'}
                    </button>
                </div>

                {error && <div style={styles.alertError}>{error}</div>}
                {success && <div style={styles.alertSuccess}>{success}</div>}

                {showUserList ? (
                    <div style={styles.userListSection}>
                        <div style={styles.actionBar}>
                            <button onClick={handleExport} style={styles.exportButton}>
                                📊 Export to Excel
                            </button>
                        </div>

                        {loadingUsers ? (
                            <div style={styles.loadingText}>Loading users...</div>
                        ) : users.length === 0 ? (
                            <div style={styles.emptyText}>No users found</div>
                        ) : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>ID</th>
                                            <th style={styles.th}>Username</th>
                                            <th style={styles.th}>Role</th>
                                            <th style={styles.th}>Hospital</th>
                                            <th style={styles.th}>City</th>
                                            <th style={styles.th}>Country</th>
                                            <th style={styles.th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id} style={styles.tr}>
                                                <td style={styles.td}>{user.id}</td>
                                                <td style={styles.td}>{user.username}</td>
                                                <td style={styles.td}>
                                                    <span style={styles.roleBadge}>{user.role}</span>
                                                </td>
                                                <td style={styles.td}>{user.facility?.name || '—'}</td>
                                                <td style={styles.td}>{user.facility?.city || '—'}</td>
                                                <td style={styles.td}>{user.facility?.country || '—'}</td>
                                                <td style={styles.td}>
                                                    <div style={styles.actionButtons}>
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            style={styles.editButton}
                                                            title="Edit user"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.id, user.username)}
                                                            style={styles.deleteButton}
                                                            title="Delete user"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        {isEditMode && (
                            <div style={styles.editNotice}>
                                ✏️ Editing user: <strong>{editingUser?.username}</strong>
                            </div>
                        )}

                        <div style={styles.row}>
                            <div style={styles.field}>
                                <label style={styles.label}>Username</label>
                                <input name="username" value={form.username} onChange={handleChange} required disabled={loading} style={styles.input} />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>
                                    Password {isEditMode && <span style={styles.optionalText}>(leave empty to keep current)</span>}
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required={!isEditMode}
                                    disabled={loading}
                                    style={styles.input}
                                    placeholder={isEditMode ? 'Leave empty to keep current password' : ''}
                                />
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.field}>
                                <label style={styles.label}>Role</label>
                                <select name="role" value={form.role} onChange={handleChange} disabled={loading} style={styles.input}>
                                    <option value="REPORTER">Reporter</option>
                                    <option value="MONITOR">Monitor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>

                        {form.role === 'REPORTER' && (
                            <div style={styles.row}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Hospital</label>
                                    <input
                                        name="hospital_name"
                                        value={form.hospital_name}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        style={styles.input}
                                        placeholder="e.g., Central Hospital"
                                    />
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Country</label>
                                    <input
                                        name="country"
                                        value={form.country}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        style={styles.input}
                                        placeholder="e.g., Rwanda"
                                    />
                                </div>
                            </div>
                        )}

                        {form.role === 'REPORTER' && (
                            <div style={styles.row}>
                                <div style={styles.field}>
                                    <label style={styles.label}>City</label>
                                    <input
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        style={styles.input}
                                        placeholder="e.g., Kigali"
                                    />
                                </div>
                                <div />
                            </div>
                        )}

                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update User' : 'Create User')}
                        </button>

                        {isEditMode && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={loading}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                        )}
                    </form>
                )}
            </div>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1f2937,#111827)', padding: '2rem'
    },
    card: {
        background: '#0b1220', color: '#e5e7eb', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.4)', width: '100%', maxWidth: 1200, padding: '2rem'
    },
    title: { margin: 0, fontSize: '1.75rem', fontWeight: 700 },
    subtitle: { marginTop: 8, color: '#9ca3af', fontSize: '0.95rem' },
    tabBar: { display: 'flex', gap: '0.5rem', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid #1f2937' },
    tab: { padding: '0.75rem 1.5rem', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, borderBottom: '3px solid transparent', transition: 'all 0.2s' },
    tabActive: { color: '#2563eb', borderBottomColor: '#2563eb' },
    form: { marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    field: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: { fontSize: '0.85rem', color: '#9ca3af' },
    input: { background: '#0f172a', color: '#e5e7eb', border: '1px solid #1f2937', borderRadius: 8, padding: '0.75rem', outline: 'none' },
    button: { marginTop: '0.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem', cursor: 'pointer', fontWeight: 600 },
    alertError: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 8, padding: '0.75rem', marginBottom: '0.75rem' },
    alertSuccess: { background: '#dcfce7', color: '#14532d', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.75rem', marginBottom: '0.75rem' },
    userListSection: { marginTop: '1rem' },
    actionBar: { display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' },
    exportButton: { background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' },
    loadingText: { textAlign: 'center', padding: '2rem', color: '#9ca3af' },
    emptyText: { textAlign: 'center', padding: '2rem', color: '#9ca3af' },
    tableWrapper: { overflowX: 'auto', marginTop: '1rem' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
    th: { background: '#1f2937', color: '#e5e7eb', padding: '0.75rem', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #374151' },
    tr: { borderBottom: '1px solid #1f2937' },
    td: { padding: '0.75rem', color: '#d1d5db' },
    roleBadge: { display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 999, background: '#1e3a8a', color: '#93c5fd', fontSize: '0.8rem', fontWeight: 600 },
    actionButtons: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
    editButton: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '1rem' },
    deleteButton: { background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '1rem' },
    editNotice: { background: '#1e40af', color: '#dbeafe', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem', fontWeight: 600 },
    optionalText: { fontSize: '0.75rem', color: '#6b7280', fontWeight: 400, fontStyle: 'italic' },
    cancelButton: { marginTop: '0.5rem', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem', cursor: 'pointer', fontWeight: 600 },
}
