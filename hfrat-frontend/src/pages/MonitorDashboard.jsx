import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'

export default function MonitorDashboard() {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL') // ALL | CRITICAL | OK
    const [selectedFacility, setSelectedFacility] = useState('')
    const [activeSlice, setActiveSlice] = useState(-1)
    const [showSeries, setShowSeries] = useState({ beds: true, vents: true, staff: true })

    useEffect(() => {
        let isMounted = true

        const fetchReports = async () => {
            try {
                const { data } = await api.get('monitor/dashboard/')
                if (isMounted) {
                    setReports(data || [])
                    setError('')
                }
            } catch (err) {
                if (isMounted) {
                    const msg = err.response?.data?.detail || 'Failed to load dashboard data. Please try again.'
                    setError(msg)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchReports()

        return () => {
            isMounted = false
        }
    }, [])

    const formatDate = (value) => {
        if (!value) return '—'
        const date = new Date(value)
        return date.toLocaleString()
    }

    const metrics = useMemo(() => {
        if (!reports || reports.length === 0) {
            return {
                totalFacilities: 0,
                criticalCount: 0,
                okCount: 0,
                totalBeds: 0,
                totalVents: 0,
                totalStaff: 0,
                lastUpdated: null,
                maxima: { beds: 1, vents: 1, staff: 1 },
            }
        }

        const criticalCount = reports.filter((r) => r.status === 'CRITICAL').length
        const okCount = reports.length - criticalCount
        const totalBeds = reports.reduce((sum, r) => sum + (Number(r.icu_beds_available) || 0), 0)
        const totalVents = reports.reduce((sum, r) => sum + (Number(r.ventilators_available) || 0), 0)
        const totalStaff = reports.reduce((sum, r) => sum + (Number(r.staff_on_duty) || 0), 0)
        const lastUpdated = reports.reduce((latest, r) => {
            const d = r.last_updated ? new Date(r.last_updated) : null
            return d && (!latest || d > latest) ? d : latest
        }, null)

        const maxima = {
            beds: Math.max(...reports.map((r) => Number(r.icu_beds_available) || 0), 1),
            vents: Math.max(...reports.map((r) => Number(r.ventilators_available) || 0), 1),
            staff: Math.max(...reports.map((r) => Number(r.staff_on_duty) || 0), 1),
        }

        return {
            totalFacilities: reports.length,
            criticalCount,
            okCount,
            totalBeds,
            totalVents,
            totalStaff,
            lastUpdated,
            maxima,
        }
    }, [reports])

    const chartData = useMemo(() => {
        const statusData = [
            { name: 'CRITICAL', value: metrics.criticalCount },
            { name: 'OK', value: metrics.okCount },
        ]

        const facilityData = (reports || []).map((r) => ({
            name: r.facility_name,
            beds: Number(r.icu_beds_available) || 0,
            vents: Number(r.ventilators_available) || 0,
            staff: Number(r.staff_on_duty) || 0,
            total: (Number(r.icu_beds_available) || 0) + (Number(r.ventilators_available) || 0) + (Number(r.staff_on_duty) || 0),
        }))
        facilityData.sort((a, b) => b.total - a.total)
        const topFacilities = facilityData.slice(0, 8)

        return { statusData, topFacilities }
    }, [reports, metrics])

    const filteredReports = useMemo(() => {
        let arr = reports || []
        if (statusFilter === 'CRITICAL' || statusFilter === 'OK') {
            arr = arr.filter((r) => r.status === statusFilter)
        }
        return arr
    }, [reports, statusFilter])

    const statusStyle = (status) => {
        const base = {
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            fontWeight: 700,
            fontSize: '0.9rem',
            letterSpacing: '0.5px',
        }

        if (status === 'CRITICAL') {
            return { ...base, backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }
        }

        return { ...base, backgroundColor: '#ecfdf3', color: '#166534', border: '1px solid #bbf7d0' }
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.iconBadge}>📈</div>
                <h1 style={styles.title}>Central Monitor Dashboard</h1>
                <p style={styles.subtitle}>Live view of facility resource availability</p>
                {metrics.totalFacilities > 0 && (
                    <p style={styles.meta}>
                        Tracking {metrics.totalFacilities} facilities · Last update {metrics.lastUpdated ? metrics.lastUpdated.toLocaleString() : '—'}
                    </p>
                )}
            </div>

            <div style={styles.card}>
                {loading ? (
                    <div style={styles.stateBox}>Loading dashboard data...</div>
                ) : error ? (
                    <div style={{ ...styles.stateBox, ...styles.errorBox }}>{error}</div>
                ) : reports.length === 0 ? (
                    <div style={styles.stateBox}>No data available yet.</div>
                ) : (
                    <>
                        <div style={styles.chipGroup}>
                            {['ALL', 'CRITICAL', 'OK'].map((key) => (
                                <button
                                    key={key}
                                    onClick={() => { setStatusFilter(key); setSelectedFacility(''); }}
                                    style={{
                                        ...styles.chip,
                                        ...(statusFilter === key ? styles.chipActive : {}),
                                        ...(key === 'CRITICAL' ? { color: '#b91c1c', borderColor: '#fecaca' } : key === 'OK' ? { color: '#166534', borderColor: '#bbf7d0' } : {}),
                                    }}
                                >
                                    {key}
                                </button>
                            ))}
                            {statusFilter !== 'ALL' && (
                                <button onClick={() => setStatusFilter('ALL')} style={{ ...styles.chip, marginLeft: '0.5rem' }}>Clear Filter</button>
                            )}
                            {selectedFacility && (
                                <button onClick={() => setSelectedFacility('')} style={{ ...styles.chip, marginLeft: '0.5rem' }}>Clear Selection</button>
                            )}
                        </div>
                        <div style={styles.summaryGrid}>
                            <div style={{ ...styles.summaryCard, ...styles.summaryPrimary }}>
                                <div style={styles.summaryLabel}>Facilities</div>
                                <div style={styles.summaryValue}>{metrics.totalFacilities}</div>
                                <div style={styles.summaryMeta}>Active records</div>
                            </div>
                            <div style={styles.summaryCard}>
                                <div style={styles.summaryLabel}>Critical</div>
                                <div style={{ ...styles.summaryValue, color: '#b91c1c' }}>{metrics.criticalCount}</div>
                                <div style={{ ...styles.summaryBadge, backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fecaca' }}>CRITICAL</div>
                            </div>
                            <div style={styles.summaryCard}>
                                <div style={styles.summaryLabel}>OK</div>
                                <div style={{ ...styles.summaryValue, color: '#166534' }}>{metrics.okCount}</div>
                                <div style={{ ...styles.summaryBadge, backgroundColor: '#ecfdf3', color: '#166534', borderColor: '#bbf7d0' }}>OK</div>
                            </div>
                            <div style={styles.summaryCard}>
                                <div style={styles.summaryLabel}>Last Update</div>
                                <div style={{ ...styles.summaryValue, fontSize: '1.1rem' }}>
                                    {metrics.lastUpdated ? metrics.lastUpdated.toLocaleTimeString() : '—'}
                                </div>
                                <div style={styles.summaryMeta}>Local time</div>
                            </div>
                        </div>

                        <div style={styles.chartsGrid}>
                            <div style={styles.chartCard}>
                                <div style={styles.chartHeader}>Status Distribution</div>
                                <div style={{ width: '100%', height: 240 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={chartData.statusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={activeSlice >= 0 ? 90 : 80}
                                                label
                                            >
                                                {chartData.statusData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.name === 'CRITICAL' ? '#fca5a5' : '#86efac'}
                                                        onMouseEnter={() => setActiveSlice(index)}
                                                        onMouseLeave={() => setActiveSlice(-1)}
                                                        onClick={() => setStatusFilter(entry.name)}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div style={styles.chartCard}>
                                <div style={styles.chartHeader}>Top Facilities by Resources</div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                    {[
                                        { key: 'beds', label: 'ICU Beds', color: '#60a5fa' },
                                        { key: 'vents', label: 'Ventilators', color: '#34d399' },
                                        { key: 'staff', label: 'Staff', color: '#a78bfa' },
                                    ].map((s) => (
                                        <label key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#1f2937' }}>
                                            <input
                                                type="checkbox"
                                                checked={showSeries[s.key]}
                                                onChange={(e) => setShowSeries((prev) => ({ ...prev, [s.key]: e.target.checked }))}
                                            />
                                            <span style={{ display: 'inline-block', width: 10, height: 10, backgroundColor: s.color, borderRadius: 2 }} />
                                            {s.label}
                                        </label>
                                    ))}
                                </div>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart
                                            data={chartData.topFacilities}
                                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                            onClick={(e) => { if (e && e.activeLabel) setSelectedFacility(e.activeLabel) }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} height={50} />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            {showSeries.beds && <Bar dataKey="beds" name="ICU Beds" fill="#60a5fa" />}
                                            {showSeries.vents && <Bar dataKey="vents" name="Ventilators" fill="#34d399" />}
                                            {showSeries.staff && <Bar dataKey="staff" name="Staff" fill="#a78bfa" />}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div style={{ ...styles.chartCard, gridColumn: 'span 2' }}>
                                <div style={styles.chartHeader}>Facility Details</div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Facility</th>
                                                <th style={styles.th}>ICU Beds</th>
                                                <th style={styles.th}>Ventilators</th>
                                                <th style={styles.th}>Staff</th>
                                                <th style={styles.th}>Status</th>
                                                <th style={styles.th}>Last Updated</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredReports.map((row, idx) => (
                                                <tr key={`${row.facility_name}-${idx}`} style={{
                                                    ...styles.tr,
                                                    ...(selectedFacility === row.facility_name ? styles.selectedRow : {}),
                                                }}>
                                                    <td style={styles.td}>{row.facility_name}</td>
                                                    <td style={styles.td}>{row.icu_beds_available}</td>
                                                    <td style={styles.td}>{row.ventilators_available}</td>
                                                    <td style={styles.td}>{row.staff_on_duty}</td>
                                                    <td style={styles.td}>
                                                        <span style={statusStyle(row.status)}>{row.status || 'OK'}</span>
                                                    </td>
                                                    <td style={styles.td}>{formatDate(row.last_updated)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f5f7fb',
        padding: '2.5rem 1rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        boxSizing: 'border-box',
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    iconBadge: {
        display: 'inline-block',
        fontSize: '2.25rem',
        width: '64px',
        height: '64px',
        lineHeight: '64px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f5ff 100%)',
        color: '#3730a3',
        boxShadow: '0 8px 16px rgba(55, 48, 163, 0.15)',
        marginBottom: '1rem',
    },
    title: {
        fontSize: '2.2rem',
        fontWeight: 800,
        color: '#1f2937',
        margin: 0,
    },
    subtitle: {
        fontSize: '1rem',
        color: '#6b7280',
        marginTop: '0.4rem',
    },
    meta: {
        fontSize: '0.95rem',
        color: '#4b5563',
        marginTop: '0.3rem',
        fontWeight: 600,
    },
    card: {
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        boxShadow: '0 12px 32px rgba(31, 41, 55, 0.08)',
        padding: '1.5rem',
        border: '1px solid #e5e7eb',
    },
    stateBox: {
        padding: '1rem 1.25rem',
        backgroundColor: '#f8fafc',
        color: '#475569',
        borderRadius: '10px',
        textAlign: 'center',
        fontWeight: 600,
    },
    errorBox: {
        backgroundColor: '#fef2f2',
        color: '#b91c1c',
        border: '1px solid #fecaca',
    },
    table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0,
        fontSize: '0.97rem',
        color: '#1f2937',
    },
    th: {
        textAlign: 'left',
        padding: '0.9rem 0.9rem',
        backgroundColor: '#f9fafb',
        color: '#374151',
        fontWeight: 700,
        borderBottom: '2px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 1,
    },
    tr: {
        transition: 'background-color 0.15s ease',
    },
    selectedRow: {
        backgroundColor: '#eef2ff',
    },
    td: {
        padding: '0.85rem 0.9rem',
        borderBottom: '1px solid #e5e7eb',
        color: '#4b5563',
        fontWeight: 500,
        backgroundColor: '#ffffff',
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
    },
    summaryCard: {
        padding: '1rem 1.25rem',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        boxShadow: '0 8px 18px rgba(17, 24, 39, 0.04)',
    },
    summaryPrimary: {
        background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
        borderColor: '#cbd5ff',
    },
    summaryLabel: {
        fontSize: '0.9rem',
        color: '#6b7280',
        fontWeight: 700,
        marginBottom: '0.35rem',
    },
    summaryValue: {
        fontSize: '1.75rem',
        fontWeight: 800,
        color: '#111827',
    },
    summaryMeta: {
        fontSize: '0.85rem',
        color: '#6b7280',
        marginTop: '0.35rem',
        fontWeight: 600,
    },
    summaryBadge: {
        marginTop: '0.5rem',
        display: 'inline-block',
        padding: '0.25rem 0.65rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 700,
        border: '1px solid transparent',
    },
    chartsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '1rem',
    },
    chipGroup: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
    },
    chip: {
        padding: '0.5rem 0.8rem',
        borderRadius: '999px',
        border: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        fontWeight: 700,
        cursor: 'pointer',
    },
    chipActive: {
        backgroundColor: '#eef2ff',
        borderColor: '#cbd5ff',
    },
    chartCard: {
        padding: '1.25rem',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        boxShadow: '0 10px 20px rgba(17, 24, 39, 0.05)',
    },
    chartHeader: {
        fontSize: '1rem',
        fontWeight: 800,
        color: '#111827',
        marginBottom: '0.75rem',
    },
    barRow: {
        display: 'grid',
        gridTemplateColumns: '120px 1fr 60px',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.6rem',
    },
    barLabel: {
        fontSize: '0.9rem',
        fontWeight: 700,
        color: '#1f2937',
    },
    barTrack: {
        height: '12px',
        backgroundColor: '#e5e7eb',
        borderRadius: '999px',
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: '999px',
        transition: 'width 0.4s ease',
    },
    barValue: {
        textAlign: 'right',
        fontWeight: 700,
        color: '#111827',
    },
}
