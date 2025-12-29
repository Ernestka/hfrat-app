import { useNavigate } from 'react-router-dom'
import logoUrl from '../assets/hfrat-logo.svg'

export default function Landing() {
    const navigate = useNavigate()
    const goLogin = () => navigate('/login')

    const features = [
        {
            title: 'Real-time resource tracking',
            desc: 'Live updates for ICU beds, ventilators, and staff availability across facilities.',
            icon: '⏱️',
        },
        {
            title: 'Centralized monitoring dashboard',
            desc: 'Unified view for health authorities to coordinate response and capacity.',
            icon: '📊',
        },
        {
            title: 'Critical alerts for low resources',
            desc: 'Highlight critical statuses so decision-makers act immediately.',
            icon: '🚨',
        },
        {
            title: 'Secure, role-based access',
            desc: 'Reporters update data; monitors oversee and analyze. Permissions built-in.',
            icon: '🔒',
        },
    ]

    const steps = [
        {
            title: 'Facilities update resources',
            desc: 'Reporters submit current ICU beds, ventilators, and staff on duty.',
        },
        {
            title: 'Data is securely sent',
            desc: 'Encrypted transfer ensures integrity from facility to central system.',
        },
        {
            title: 'Authorities monitor in real time',
            desc: 'Monitors view live dashboards to coordinate rapid response.',
        },
    ]

    return (
        <div style={styles.page}>
            <section style={styles.hero}>
                <div style={styles.badge}>HFRAT Platform</div>
                <img style={styles.heroLogoSmall} src={logoUrl} alt="HFRAT Logo" />
                <h1 style={styles.title}>Real-Time Health Facility Resource Monitoring</h1>
                <p style={styles.subtitle}>
                    Track ICU beds, ventilators, and staffing across facilities for rapid, coordinated response.
                </p>
                <div style={styles.ctaRow}>
                    <button style={{ ...styles.button, ...styles.buttonPrimary }} onClick={goLogin}>Login as Reporter</button>
                    <button style={{ ...styles.button, ...styles.buttonGhost }} onClick={goLogin}>Login as Monitor</button>
                </div>
                <div style={{ marginTop: '0.75rem', color: '#64748b', fontWeight: 600 }}>Secure access · Role-based permissions</div>
            </section>

            <section style={styles.section}>
                <div style={styles.sectionHeader}>Why teams choose HFRAT</div>
                <div style={styles.cardGrid}>
                    {features.map((item) => (
                        <div key={item.title} style={styles.featureCard}>
                            <div style={styles.featureIcon}>{item.icon}</div>
                            <div style={styles.featureTitle}>{item.title}</div>
                            <div style={styles.featureDesc}>{item.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ ...styles.section, ...styles.sectionAlt }}>
                <div style={styles.sectionHeader}>How it works</div>
                <div style={styles.stepsGrid}>
                    {steps.map((s, i) => (
                        <div key={s.title} style={styles.stepCard}>
                            <div style={styles.stepNumber}>{i + 1}</div>
                            <div>
                                <div style={styles.stepTitle}>{s.title}</div>
                                <div style={styles.stepDesc}>{s.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <footer style={styles.footer}>
                <div style={styles.footerBrand}>HFRAT</div>
                <div style={styles.footerText}>Real-time visibility for critical health resources.</div>
            </footer>
        </div>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 30%, #e0f2fe 100%)',
        padding: '2.5rem 1.25rem',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#0f172a',
    },
    hero: {
        maxWidth: '960px',
        margin: '0 auto 2rem',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.75rem 1.5rem',
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
        border: '1px solid #e5e7eb',
    },
    heroSection: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.75rem',
        alignItems: 'center',
        marginBottom: '2.5rem',
    },
    heroContentSimple: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.5rem 1.75rem',
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
        border: '1px solid #e5e7eb',
    },
    badge: {
        display: 'inline-block',
        padding: '0.5rem 1rem',
        borderRadius: '999px',
        backgroundColor: '#e0f2fe',
        color: '#0369a1',
        fontWeight: 800,
        letterSpacing: '0.6px',
        marginBottom: '1rem',
        fontSize: '0.95rem',
    },
    title: {
        fontSize: '2.6rem',
        fontWeight: 800,
        margin: '0 0 0.75rem',
        letterSpacing: '-0.6px',
        lineHeight: 1.15,
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#475569',
        margin: '0 0 1.5rem',
        lineHeight: 1.6,
        maxWidth: '48ch',
    },
    ctaRow: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginTop: '0.75rem',
    },
    button: {
        padding: '0.8rem 1.2rem',
        fontSize: '1rem',
        fontWeight: 700,
        borderRadius: '10px',
        border: '1px solid transparent',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease, transform 0.15s ease',
        boxShadow: '0 6px 16px rgba(37, 99, 235, 0.16)',
    },
    buttonPrimary: {
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        color: '#ffffff',
        borderColor: '#1d4ed8',
    },
    buttonGhost: {
        backgroundColor: '#ffffff',
        color: '#0f172a',
        borderColor: '#e2e8f0',
        boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
    },
    heroHighlights: undefined,
    highlightItem: undefined,
    heroMediaSimple: {
        display: 'grid',
        placeItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
    heroLogoSmall: {
        width: '100%',
        maxWidth: '380px',
        margin: '0 auto 0.5rem',
        display: 'block',
    },
    heroOverlayCard: undefined,
    overlayTitle: undefined,
    overlayRows: undefined,
    overlayRow: undefined,
    section: {
        maxWidth: '1200px',
        margin: '0 auto 2.5rem',
    },
    sectionAlt: {
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        padding: '1.5rem',
        boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
        border: '1px solid #e5e7eb',
    },
    sectionHeader: {
        fontSize: '1.6rem',
        fontWeight: 800,
        marginBottom: '1.25rem',
        color: '#0f172a',
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
    },
    featureCard: {
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        padding: '1.25rem',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    featureIcon: {
        fontSize: '1.6rem',
    },
    featureTitle: {
        fontWeight: 800,
        fontSize: '1.05rem',
        color: '#0f172a',
    },
    featureDesc: {
        color: '#475569',
        lineHeight: 1.5,
        fontWeight: 500,
    },
    stepsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem',
    },
    stepCard: {
        backgroundColor: '#f8fafc',
        borderRadius: '14px',
        padding: '1.1rem',
        border: '1px solid #e2e8f0',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        backgroundColor: '#2563eb',
        color: '#ffffff',
        fontWeight: 800,
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)',
    },
    stepTitle: {
        fontWeight: 800,
        color: '#0f172a',
        marginBottom: '0.2rem',
    },
    stepDesc: {
        color: '#475569',
        lineHeight: 1.5,
        fontWeight: 500,
    },
    paragraph: {
        maxWidth: '860px',
        color: '#0f172a',
        lineHeight: 1.7,
        fontSize: '1.05rem',
        backgroundColor: '#ffffff',
        padding: '1.4rem 1.2rem',
        borderRadius: '14px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
    },
    footer: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1.5rem 0.5rem 0',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        color: '#1f2937',
    },
    footerBrand: {
        fontWeight: 800,
        letterSpacing: '0.5px',
        color: '#0f172a',
    },
    footerText: {
        color: '#475569',
        fontWeight: 600,
    },
}
