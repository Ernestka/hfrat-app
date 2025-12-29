import { useState } from 'react'
import api from '../services/api'

export default function ReporterForm() {
    const [form, setForm] = useState({
        icu_beds_available: '',
        ventilators_available: '',
        staff_on_duty: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage('')
        setMessageType('')

        // Validate non-negative values
        const icuBeds = Number(form.icu_beds_available)
        const ventilators = Number(form.ventilators_available)
        const staff = Number(form.staff_on_duty)

        if (icuBeds < 0 || ventilators < 0 || staff < 0) {
            setMessage('All values must be non-negative numbers')
            setMessageType('error')
            return
        }

        if (isNaN(icuBeds) || isNaN(ventilators) || isNaN(staff)) {
            setMessage('Please enter valid numbers for all fields')
            setMessageType('error')
            return
        }

        setLoading(true)

        try {
            const { data } = await api.post('reporter/report/', {
                icu_beds_available: icuBeds,
                ventilators_available: ventilators,
                staff_on_duty: staff
            })

            setMessage(`Report submitted successfully at ${new Date(data.last_updated).toLocaleString()}`)
            setMessageType('success')

            // Keep the form values to show what was submitted
        } catch (err) {
            const errorMessage = err.response?.data?.detail
                || err.response?.data?.message
                || 'Failed to submit report. Please try again.'
            setMessage(errorMessage)
            setMessageType('error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
            {/* Animated background elements */}
            <div style={styles.bgCircle1}></div>
            <div style={styles.bgCircle2}></div>

            <div style={styles.contentWrapper}>
                <div style={styles.header}>
                    <div style={styles.iconBadge}>🏥</div>
                    <h1 style={styles.title}>Resource Availability Report</h1>
                    <p style={styles.subtitle}>Submit current resource status for your facility</p>
                    <div style={styles.divider}></div>
                </div>

                <div style={styles.card}>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <div style={styles.statIcon}>🛏️</div>
                                <div style={styles.statLabel}>ICU Beds</div>
                                <div style={styles.statValue}>
                                    {form.icu_beds_available || '—'}
                                </div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statIcon}>🫁</div>
                                <div style={styles.statLabel}>Ventilators</div>
                                <div style={styles.statValue}>
                                    {form.ventilators_available || '—'}
                                </div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statIcon}>👨‍⚕️</div>
                                <div style={styles.statLabel}>Staff</div>
                                <div style={styles.statValue}>
                                    {form.staff_on_duty || '—'}
                                </div>
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="icu_beds">
                                <span style={styles.labelText}>
                                    <span style={styles.labelIcon}>🛏️</span>
                                    ICU Beds Available
                                </span>
                                <span style={styles.requiredBadge}>Required</span>
                            </label>
                            <div style={styles.inputWrapper}>
                                <input
                                    id="icu_beds"
                                    type="number"
                                    min="0"
                                    placeholder="Enter number of available ICU beds"
                                    value={form.icu_beds_available}
                                    onChange={handleChange('icu_beds_available')}
                                    disabled={loading}
                                    required
                                    style={{
                                        ...styles.input,
                                        ...(loading ? styles.inputDisabled : {})
                                    }}
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="ventilators">
                                <span style={styles.labelText}>
                                    <span style={styles.labelIcon}>🫁</span>
                                    Ventilators Available
                                </span>
                                <span style={styles.requiredBadge}>Required</span>
                            </label>
                            <div style={styles.inputWrapper}>
                                <input
                                    id="ventilators"
                                    type="number"
                                    min="0"
                                    placeholder="Enter number of available ventilators"
                                    value={form.ventilators_available}
                                    onChange={handleChange('ventilators_available')}
                                    disabled={loading}
                                    required
                                    style={{
                                        ...styles.input,
                                        ...(loading ? styles.inputDisabled : {})
                                    }}
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="staff">
                                <span style={styles.labelText}>
                                    <span style={styles.labelIcon}>👨‍⚕️</span>
                                    Staff on Duty
                                </span>
                                <span style={styles.requiredBadge}>Required</span>
                            </label>
                            <div style={styles.inputWrapper}>
                                <input
                                    id="staff"
                                    type="number"
                                    min="0"
                                    placeholder="Enter number of staff currently on duty"
                                    value={form.staff_on_duty}
                                    onChange={handleChange('staff_on_duty')}
                                    disabled={loading}
                                    required
                                    style={{
                                        ...styles.input,
                                        ...(loading ? styles.inputDisabled : {})
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.button,
                                ...(loading ? styles.buttonDisabled : {})
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(49, 130, 206, 0.4)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(49, 130, 206, 0.3)'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={styles.spinner}>⏳</span>
                                    <span>Submitting Report...</span>
                                </>
                            ) : (
                                <>
                                    <span style={styles.buttonIcon}>📊</span>
                                    <span>Submit Resource Report</span>
                                </>
                            )}
                        </button>

                        {message && (
                            <div style={{
                                ...styles.message,
                                ...(messageType === 'error' ? styles.messageError : styles.messageSuccess)
                            }}>
                                <div style={styles.messageContent}>
                                    <span style={styles.messageIcon}>
                                        {messageType === 'error' ? '⚠️' : '✅'}
                                    </span>
                                    <span style={styles.messageText}>{message}</span>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        🔒 All data is securely transmitted and stored
                    </p>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem 1rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
    },
    bgCircle1: {
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        top: '-250px',
        right: '-250px',
        filter: 'blur(60px)',
    },
    bgCircle2: {
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.08)',
        bottom: '-200px',
        left: '-200px',
        filter: 'blur(50px)',
    },
    contentWrapper: {
        position: 'relative',
        zIndex: 1,
    },
    header: {
        textAlign: 'center',
        marginBottom: '2.5rem',
        animation: 'fadeInDown 0.6s ease-out',
    },
    iconBadge: {
        display: 'inline-block',
        fontSize: '3rem',
        width: '80px',
        height: '80px',
        lineHeight: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 8px rgba(255, 255, 255, 0.1)',
        marginBottom: '1.5rem',
        animation: 'float 3s ease-in-out infinite',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: '0.75rem',
        textShadow: '0 2px 20px rgba(0, 0, 0, 0.15)',
        letterSpacing: '-0.5px',
    },
    subtitle: {
        fontSize: '1.1rem',
        color: 'rgba(255, 255, 255, 0.9)',
        margin: 0,
        fontWeight: '400',
    },
    divider: {
        width: '60px',
        height: '4px',
        background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
        margin: '1.5rem auto 0',
        borderRadius: '2px',
    },
    card: {
        maxWidth: '700px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        padding: '3rem',
        animation: 'fadeInUp 0.6s ease-out 0.2s both',
        backdropFilter: 'blur(10px)',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '2rem',
    },
    statCard: {
        textAlign: 'center',
        padding: '1.25rem',
        background: 'linear-gradient(135deg, #f6f8fc 0%, #eef2f9 100%)',
        borderRadius: '12px',
        border: '2px solid #e8ecf4',
        transition: 'all 0.3s ease',
    },
    statIcon: {
        fontSize: '2rem',
        marginBottom: '0.5rem',
    },
    statLabel: {
        fontSize: '0.75rem',
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '0.25rem',
    },
    statValue: {
        fontSize: '1.75rem',
        fontWeight: '700',
        color: '#1e293b',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
    },
    label: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#334155',
    },
    labelText: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flex: 1,
    },
    labelIcon: {
        fontSize: '1.25rem',
    },
    requiredBadge: {
        fontSize: '0.7rem',
        fontWeight: '600',
        color: '#8b5cf6',
        backgroundColor: '#f3e8ff',
        padding: '0.25rem 0.625rem',
        borderRadius: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    inputWrapper: {
        position: 'relative',
    },
    input: {
        width: '100%',
        padding: '1rem 1.25rem',
        fontSize: '1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        outline: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        fontWeight: '500',
    },
    inputDisabled: {
        backgroundColor: '#f8fafc',
        cursor: 'not-allowed',
        opacity: 0.6,
    },
    button: {
        padding: '1.125rem 2rem',
        fontSize: '1.05rem',
        fontWeight: '700',
        color: '#ffffff',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        marginTop: '1rem',
        boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
        letterSpacing: '0.3px',
    },
    buttonDisabled: {
        background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
        cursor: 'not-allowed',
        opacity: 0.7,
        boxShadow: 'none',
    },
    buttonIcon: {
        fontSize: '1.25rem',
    },
    spinner: {
        display: 'inline-block',
        fontSize: '1.25rem',
    },
    message: {
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        marginTop: '1rem',
        animation: 'slideIn 0.4s ease-out',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    messageContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    messageSuccess: {
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        color: '#166534',
        border: '2px solid #86efac',
    },
    messageError: {
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        color: '#991b1b',
        border: '2px solid #fca5a5',
    },
    messageIcon: {
        fontSize: '1.5rem',
        flexShrink: 0,
    },
    messageText: {
        flex: 1,
        fontWeight: '500',
        lineHeight: '1.5',
    },
    footer: {
        textAlign: 'center',
        marginTop: '2rem',
        animation: 'fadeIn 0.6s ease-out 0.4s both',
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '0.875rem',
        fontWeight: '500',
        margin: 0,
    },
}

// Add CSS animations to the document
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style')
    styleSheet.textContent = `
        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-10px);
            }
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        input:focus {
            border-color: #667eea !important;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }
        
        input::placeholder {
            color: #94a3b8;
        }
    `
    if (!document.head.querySelector('#reporter-form-animations')) {
        styleSheet.id = 'reporter-form-animations'
        document.head.appendChild(styleSheet)
    }
}
