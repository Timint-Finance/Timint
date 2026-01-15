'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, X, ExternalLink, Eye, Loader } from 'lucide-react'
import Link from 'next/link'

interface KYCUser {
    id: string
    name: string
    age: number
    email: string
    parent_name: string
    parent_email: string
    created_at: string
    startups: any[]
    document_urls: {
        selfie: string
        document: string
    }
}

export default function AdminKYCReview() {
    const [users, setUsers] = useState<KYCUser[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)

    useEffect(() => {
        fetchPendingKYC()
    }, [])

    const fetchPendingKYC = async () => {
        try {
            const res = await fetch('/api/admin/kyc-review')
            const data = await res.json()
            setUsers(data.users || [])
            setLoading(false)
        } catch (err) {
            console.error('Failed to fetch KYC reviews:', err)
            setLoading(false)
        }
    }

    const handleAction = async (userId: string, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this KYC request?`)) {
            return
        }

        setProcessing(userId)

        try {
            const res = await fetch('/api/admin/approve-kyc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action }),
            })

            const result = await res.json()

            if (!res.ok) {
                alert(`Failed: ${result.error}`)
                setProcessing(null)
                return
            }

            alert(result.message)
            // Refresh the list
            await fetchPendingKYC()
            setProcessing(null)
        } catch (err) {
            alert('Action failed')
            setProcessing(null)
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: '32px', height: '32px' }} />
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)', padding: '40px 20px' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>KYC Review Dashboard</h1>
                    <p style={{ color: 'var(--gray-500)' }}>
                        Review and approve parent documents for startups
                    </p>
                </div>

                {users.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                        <p style={{ color: 'var(--gray-500)', fontSize: '1rem' }}>
                            No pending KYC reviews
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {users.map((user) => (
                            <div key={user.id} className="card card-elevated">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{user.name}</h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                                            {user.age} years old · {user.email}
                                        </p>
                                    </div>
                                    <span className="badge badge-warning">Under Review</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '4px' }}>Startup</p>
                                        <p style={{ fontWeight: 600 }}>{user.startups?.[0]?.company_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '4px' }}>Parent/Guardian</p>
                                        <p style={{ fontWeight: 600 }}>{user.parent_name}</p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{user.parent_email}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '4px' }}>Registered</p>
                                        <p style={{ fontWeight: 600 }}>{new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {user.document_urls && (
                                    <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                                        <p style={{ fontWeight: 600, marginBottom: '12px', fontSize: '0.875rem' }}>KYC Documents:</p>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <a
                                                href={user.document_urls.selfie}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-secondary"
                                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', padding: '10px' }}
                                            >
                                                <Eye size={16} style={{ marginRight: '6px' }} />
                                                View Selfie
                                            </a>
                                            <a
                                                href={user.document_urls.document}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-secondary"
                                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', padding: '10px' }}
                                            >
                                                <Eye size={16} style={{ marginRight: '6px' }} />
                                                View ID Document
                                            </a>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => handleAction(user.id, 'reject')}
                                        disabled={processing === user.id}
                                        className="btn-secondary"
                                        style={{ flex: 1, opacity: processing === user.id ? 0.6 : 1 }}
                                    >
                                        {processing === user.id ? <Loader size={16} className="spinner" style={{ marginRight: '8px' }} /> : <X size={16} style={{ marginRight: '8px' }} />}
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(user.id, 'approve')}
                                        disabled={processing === user.id}
                                        className="btn-primary"
                                        style={{ flex: 1, opacity: processing === user.id ? 0.6 : 1 }}
                                    >
                                        {processing === user.id ? <Loader size={16} className="spinner" style={{ marginRight: '8px' }} /> : <CheckCircle size={16} style={{ marginRight: '8px' }} />}
                                        Approve & Register on Blockchain
                                    </button>
                                </div>

                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '12px', textAlign: 'center' }}>
                                    📋 Approving will delete documents, verify user, and register on Polygon Mumbai blockchain
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <Link href="/dashboard" className="btn-secondary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
