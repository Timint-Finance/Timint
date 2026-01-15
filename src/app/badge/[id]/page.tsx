import { CheckCircle, ExternalLink, Award, FileText } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface Props {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()
    const { data: startup } = await supabase.from('startups').select('company_name').eq('id', id).eq('verified', true).single()
    if (!startup) return { title: 'Not Found | TiMint Finance' }
    return {
        title: `${startup.company_name} - Verified | TiMint Finance`,
        description: `${startup.company_name} is a verified startup registered with TiMint Finance.`,
    }
}

export default async function BadgePage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    const { data: startup } = await supabase.from('startups').select('*').eq('id', id).eq('verified', true).single()
    if (!startup) notFound()

    const { data: user } = await supabase.from('users').select('name, parent_name, parent_verified, kyc_status').eq('id', startup.user_id).single()

    const registrationId = `TMT-${startup.id.slice(0, 8).toUpperCase()}`
    const registrationDate = new Date(startup.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--white) 100%)' }}>
            {/* Header */}
            <header style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '16px 24px' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--navy-900)', textDecoration: 'none' }}>
                        TIMINT
                    </Link>
                    <span className="badge badge-success"><CheckCircle size={12} /> Verified Startup</span>
                </div>
            </header>

            <main className="container" style={{ maxWidth: '600px', padding: '48px 24px' }}>
                {/* Verification Card */}
                <div className="card card-elevated" style={{ textAlign: 'center', border: '2px solid var(--gold)' }}>
                    {/* Seal */}
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 0 0 4px var(--gold), 0 0 0 8px rgba(201,162,39,0.2)'
                    }}>
                        <CheckCircle size={36} color="white" />
                    </div>

                    <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '8px' }}>{startup.company_name}</h1>
                    <p style={{ fontSize: '1rem', color: 'var(--success)', fontWeight: 600, marginBottom: '32px' }}>✓ Verified by TiMint Finance</p>

                    <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                        {[
                            { label: 'Founder', value: user?.name },
                            { label: 'Guardian', value: user?.parent_name },
                            { label: 'Guardian Verified', value: user?.parent_verified ? '✓ Approved' : 'Pending', badge: true },
                            { label: 'KYC Status', value: user?.kyc_status === 'verified' ? '✓ Verified' : user?.kyc_status, badge: true },
                            { label: 'Registration ID', value: registrationId, mono: true },
                            { label: 'Registered On', value: registrationDate },
                        ].map((item, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-200)' }}>
                                <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{item.label}</span>
                                {item.badge ? (
                                    <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>{item.value}</span>
                                ) : item.mono ? (
                                    <code style={{ fontSize: '0.8rem', color: 'var(--navy-700)' }}>{item.value}</code>
                                ) : (
                                    <span style={{ fontWeight: 600, color: 'var(--navy-900)', fontSize: '0.875rem' }}>{item.value}</span>
                                )}
                            </div>
                        ))}
                        {startup.token_id && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-200)' }}>
                                <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>TMIT Token</span>
                                <code style={{ fontSize: '0.7rem', color: 'var(--navy-700)', maxWidth: '180px', textAlign: 'right', wordBreak: 'break-all' }}>{startup.token_id}</code>
                            </div>
                        )}
                        {startup.blockchain_tx && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                                <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Blockchain</span>
                                <a href={`https://gateway.pinata.cloud/ipfs/${startup.blockchain_tx}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--navy-700)', textDecoration: 'none' }}>
                                    View on IPFS <ExternalLink size={12} />
                                </a>
                            </div>
                        )}
                    </div>

                    {startup.description && (
                        <div style={{ marginTop: '24px', padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', textAlign: 'left' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '4px' }}>About</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)' }}>{startup.description}</p>
                        </div>
                    )}
                </div>

                {/* Features */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '32px' }}>
                    {[
                        { icon: Award, title: 'TMIT Token', sub: 'Ownership proof' },
                        { icon: CheckCircle, title: 'Guardian', sub: 'KYC Verified' },
                        { icon: FileText, title: 'Blockchain', sub: 'Immutable record' },
                    ].map((item, index) => (
                        <div key={index} className="card" style={{ textAlign: 'center', padding: '20px 12px' }}>
                            <item.icon size={24} style={{ color: 'var(--navy-700)', marginBottom: '8px' }} />
                            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '2px' }}>{item.title}</h3>
                            <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{item.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Legal */}
                <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.7rem', color: 'var(--gray-400)', maxWidth: '500px', margin: '32px auto 0' }}>
                    TiMint Finance is a private digital registry. This verification does not constitute government incorporation
                    or trademark registration. It serves as proof of name ownership within the TiMint ecosystem.
                </p>

                {/* CTA */}
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <Link href="/register" className="btn-primary" style={{ width: 'auto', display: 'inline-flex', padding: '12px 24px' }}>
                        Register Your Startup
                    </Link>
                </div>
            </main>
        </div>
    )
}
