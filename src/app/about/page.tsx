import { Target, Award, CheckCircle, Shield } from 'lucide-react'
import Navbar, { Footer } from '@/components/Navigation'

export const metadata = {
    title: 'About Us | TiMint Finance',
    description: 'Learn about TiMint Finance - the first digital startup registry for teen entrepreneurs.',
}

export default function AboutPage() {
    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar />

            {/* Hero */}
            <section style={{
                paddingTop: '120px',
                paddingBottom: '64px',
                background: 'var(--gray-50)'
            }}>
                <div className="container" style={{ textAlign: 'center', maxWidth: '700px' }}>
                    <p className="section-eyebrow">ABOUT US</p>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '16px' }}>
                        Empowering Young Entrepreneurs
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: 'var(--gray-500)' }}>
                        TiMint Finance was created to solve a fundamental problem: teens with brilliant
                        startup ideas have no way to officially claim their business names.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="section">
                <div className="container" style={{ maxWidth: '900px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        <div className="card card-elevated">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '8px',
                                background: 'var(--gray-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                                color: 'var(--navy-700)'
                            }}>
                                <Target size={24} />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>Our Mission</h2>
                            <p style={{ fontSize: '0.95rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>
                                To democratize startup registration for teen entrepreneurs by providing a secure,
                                guardian-approved digital ownership system that validates their ideas before they turn 18.
                            </p>
                        </div>

                        <div className="card card-elevated">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '8px',
                                background: 'rgba(201, 162, 39, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                                color: 'var(--gold)'
                            }}>
                                <Award size={24} />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>Our Vision</h2>
                            <p style={{ fontSize: '0.95rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>
                                A world where age is not a barrier to entrepreneurship. Where every young innovator
                                can protect their startup identity with the backing of their guardians.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* What We Are / Are Not */}
            <section className="section section-light">
                <div className="container" style={{ maxWidth: '900px' }}>
                    <div className="section-header">
                        <h2 className="section-title">Understanding TiMint</h2>
                        <p className="section-subtitle">Complete transparency about what we offer</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        {/* What We ARE */}
                        <div className="card" style={{ borderTop: '3px solid var(--success)' }}>
                            <h3 style={{
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: 'var(--success)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '20px'
                            }}>
                                <CheckCircle size={18} />
                                What TiMint IS
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {[
                                    'Proof-of-ownership system for startup names',
                                    'Guardian-approved with parent KYC verification',
                                    'Blockchain timestamp with immutable records',
                                    'TMIT Token - soulbound, non-transferable',
                                    'Trust badge: "Verified by TiMint Finance"',
                                ].map((item, index) => (
                                    <li key={index} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '10px',
                                        marginBottom: '12px',
                                        fontSize: '0.9rem',
                                        color: 'var(--gray-700)'
                                    }}>
                                        <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* What We ARE NOT */}
                        <div className="card" style={{ borderTop: '3px solid var(--error)' }}>
                            <h3 style={{
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: 'var(--error)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '20px'
                            }}>
                                <Shield size={18} />
                                What TiMint is NOT
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {[
                                    'Trademark registration authority',
                                    'Legal business incorporation service',
                                    'Government-recognized registry',
                                    'Tradable cryptocurrency platform',
                                    'Substitute for legal counsel',
                                ].map((item, index) => (
                                    <li key={index} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '10px',
                                        marginBottom: '12px',
                                        fontSize: '0.9rem',
                                        color: 'var(--gray-700)'
                                    }}>
                                        <span style={{
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '50%',
                                            border: '2px solid var(--error)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            fontSize: '0.6rem',
                                            fontWeight: 700,
                                            color: 'var(--error)',
                                            marginTop: '2px'
                                        }}>✕</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Helps */}
            <section className="section">
                <div className="container" style={{ maxWidth: '700px' }}>
                    <div className="section-header">
                        <h2 className="section-title">How TiMint Helps</h2>
                    </div>

                    {[
                        { num: '1', title: 'Guardian as Paper Authority', desc: 'Your parent/guardian handles the official paperwork and KYC verification. They remain the legal guardian until you turn 18, but you maintain operational control.' },
                        { num: '2', title: 'Blockchain Proof', desc: 'Your startup name is timestamped on blockchain. If anyone tries to claim your name later, your TMIT Token proves you registered it first.' },
                        { num: '3', title: 'Automatic Transfer at 18', desc: 'When you reach legal adulthood, full control automatically transfers to you. No additional fees or registration required.' },
                    ].map((item, index) => (
                        <div key={index} style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'var(--gray-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: 'var(--navy-700)'
                            }}>
                                {item.num}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>{item.title}</h3>
                                <p style={{ fontSize: '0.95rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section className="section-dark" style={{ padding: '48px 24px' }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '32px',
                        textAlign: 'center'
                    }}>
                        {[
                            { num: '1000+', label: 'Startups Registered' },
                            { num: '100%', label: 'Guardian Verified' },
                            { num: '256-bit', label: 'Encryption' },
                            { num: '24/7', label: 'Support' },
                        ].map((stat, index) => (
                            <div key={index}>
                                <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--white)' }}>{stat.num}</p>
                                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
