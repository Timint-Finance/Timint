'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Download, Copy, CheckCircle, Clock, AlertCircle,
    ExternalLink, LogOut, Award, FileText, Link2, User
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UserData {
    id: string
    name: string
    age: number
    address: string
    phone: string
    parent_name: string
    parent_email: string
    parent_verified: boolean
    kyc_status: 'pending' | 'verified' | 'rejected'
    created_at: string
}

interface StartupData {
    id: string
    company_name: string
    description: string
    blockchain_tx: string | null
    token_id: string | null
    verified: boolean
    created_at: string
}

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<UserData | null>(null)
    const [startup, setStartup] = useState<StartupData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [copied, setCopied] = useState<string | null>(null)
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
            router.push('/login')
            return
        }

        const { data: userData } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        const { data: startupData } = await supabase.from('startups').select('*').eq('user_id', authUser.id).single()

        setUser(userData)
        setStartup(startupData)
        setIsLoading(false)
    }

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
    }

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopied(field)
        setTimeout(() => setCopied(null), 2000)
    }

    const generatePDF = async () => {
        if (!user || !startup) return
        setIsGeneratingPdf(true)
        try {
            const response = await fetch('/api/certificate/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            })
            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `TiMint-Certificate-${startup.company_name.replace(/\s+/g, '-')}.pdf`
                a.click()
                window.URL.revokeObjectURL(url)
            }
        } catch (error) {
            console.error('Failed to generate PDF:', error)
        } finally {
            setIsGeneratingPdf(false)
        }
    }

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px', borderColor: 'var(--gray-300)', borderTopColor: 'var(--navy-700)' }} />
                    <p style={{ color: 'var(--gray-500)' }}>Loading your dashboard...</p>
                </div>
            </div>
        )
    }

    const isFullyVerified = user?.parent_verified && user?.kyc_status === 'verified' && startup?.verified

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            {/* Header */}
            <header style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
                    <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--navy-900)', textDecoration: 'none' }}>
                        TIMINT
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={16} /> {user?.name}
                        </span>
                        <button onClick={handleLogout} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            fontSize: '0.875rem', color: 'var(--gray-500)',
                            background: 'none', border: 'none', cursor: 'pointer'
                        }}>
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="container" style={{ padding: '32px 24px' }}>
                {/* Welcome Banner */}
                <div style={{
                    background: 'var(--navy-900)',
                    borderRadius: '12px',
                    padding: '32px',
                    marginBottom: '32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--white)', marginBottom: '4px' }}>
                            Welcome, {user?.name}!
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                            {isFullyVerified ? 'Your startup is fully verified and registered' : 'Complete verification to unlock all features'}
                        </p>
                    </div>
                    {startup?.company_name && (
                        <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Startup</p>
                            <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--white)' }}>{startup.company_name}</p>
                        </div>
                    )}
                </div>

                {/* Status Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                    {[
                        { title: 'Guardian Approval', status: user?.parent_verified, verified: `Approved by ${user?.parent_name}`, pending: `Waiting for ${user?.parent_name}` },
                        { title: 'KYC Verification', status: user?.kyc_status === 'verified', verified: 'Identity verified', pending: 'Guardian KYC required' },
                        { title: 'Blockchain Status', status: startup?.verified, verified: 'Name secured', pending: 'Complete verification first' },
                    ].map((card, index) => (
                        <div key={index} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{card.title}</h3>
                                {card.status ? (
                                    <span className="badge badge-success"><CheckCircle size={12} /> Verified</span>
                                ) : (
                                    <span className="badge badge-warning"><Clock size={12} /> Pending</span>
                                )}
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                                {card.status ? card.verified : card.pending}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {/* TMIT Token */}
                    <div className="card" style={{ borderTop: '3px solid var(--gold)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(201,162,39,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
                                <Award size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>TMIT Token</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Soulbound ownership proof</p>
                            </div>
                        </div>
                        {startup?.token_id ? (
                            <>
                                <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '16px' }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginBottom: '6px' }}>Your Token ID</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <code style={{ fontSize: '0.8rem', color: 'var(--navy-700)', wordBreak: 'break-all' }}>{startup.token_id}</code>
                                        <button onClick={() => copyToClipboard(startup.token_id!, 'token')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                                            {copied === 'token' ? <CheckCircle size={16} color="var(--success)" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', background: 'rgba(201,162,39,0.1)', padding: '12px', borderRadius: '6px' }}>
                                    <strong>Non-transferable:</strong> This token cannot be sold or transferred.
                                </p>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gray-400)' }}>
                                <Award size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                <p>Token generated after verification</p>
                            </div>
                        )}
                    </div>

                    {/* Verification Badge */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy-700)' }}>
                                <Link2 size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Verification Badge</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>For your website</p>
                            </div>
                        </div>
                        {startup?.verified && startup?.id ? (
                            <>
                                <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '16px' }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginBottom: '6px' }}>Verification ID</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <code style={{ fontSize: '0.875rem', color: 'var(--navy-700)' }}>TMT-{startup.id.slice(0, 8).toUpperCase()}</code>
                                        <button onClick={() => copyToClipboard(`TMT-${startup.id.slice(0, 8).toUpperCase()}`, 'badge')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                                            {copied === 'badge' ? <CheckCircle size={16} color="var(--success)" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div style={{ padding: '16px', border: '1px solid var(--gray-200)', borderRadius: '8px', marginBottom: '16px' }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginBottom: '8px' }}>Badge Preview</p>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'var(--navy-900)', color: 'var(--white)', borderRadius: '6px', fontSize: '0.8rem' }}>
                                        <CheckCircle size={14} /> Verified by TiMint Finance
                                    </div>
                                </div>

                                {/* Embed Code */}
                                <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '16px' }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginBottom: '6px' }}>Embed on Your Website</p>
                                    <code style={{
                                        display: 'block',
                                        padding: '8px',
                                        background: 'var(--white)',
                                        borderRadius: '4px',
                                        fontSize: '0.7rem',
                                        color: 'var(--gray-700)',
                                        overflowX: 'auto',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-all'
                                    }}>
                                        {`<a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/badge/${startup.id}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; background: #0D1E33; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-family: sans-serif;">✓ Verified by TiMint Finance</a>`}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(`<a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/badge/${startup.id}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; background: #0D1E33; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-family: sans-serif;">✓ Verified by TiMint Finance</a>`, 'embed')}
                                        style={{
                                            marginTop: '8px',
                                            padding: '6px 12px',
                                            fontSize: '0.75rem',
                                            background: 'var(--navy-700)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        {copied === 'embed' ? <><CheckCircle size={12} /> Copied!</> : <><Copy size={12} /> Copy Code</>}
                                    </button>
                                </div>

                                <Link href={`/badge/${startup.id}`} target="_blank" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--navy-700)', textDecoration: 'none' }}>
                                    View public page <ExternalLink size={14} />
                                </Link>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gray-400)' }}>
                                <Link2 size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                <p>Complete verification to get badge</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Download Certificate */}
                <div className="card" style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)' }}>
                            <FileText size={28} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Digital Certificate</h2>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Download your official registration certificate</p>
                        </div>
                    </div>
                    <button onClick={generatePDF} disabled={!isFullyVerified || isGeneratingPdf} className="btn-primary" style={{ width: 'auto', opacity: (!isFullyVerified || isGeneratingPdf) ? 0.5 : 1 }}>
                        {isGeneratingPdf ? (
                            <><div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }} /> Generating...</>
                        ) : (
                            <><Download size={16} style={{ marginRight: '8px' }} /> Download PDF</>
                        )}
                    </button>
                </div>
                {!isFullyVerified && (
                    <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '6px', background: 'rgba(217,119,6,0.1)', color: 'var(--warning)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} /> Complete all verifications to download your certificate
                    </div>
                )}

                {/* Disclaimer */}
                <p style={{ marginTop: '48px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-400)', maxWidth: '600px', margin: '48px auto 0' }}>
                    TiMint Finance is a private digital registry and does not represent a government authority.
                    This dashboard is digital proof of startup name registration within the TiMint ecosystem.
                </p>
            </main>
        </div>
    )
}
