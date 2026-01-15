import Link from 'next/link'
import { Shield, FileText, Award, Link2, ArrowRight, CheckCircle } from 'lucide-react'
import Navbar, { Footer } from '@/components/Navigation'

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        paddingTop: '120px',
        paddingBottom: '64px',
        background: 'linear-gradient(180deg, var(--gray-50) 0%, var(--white) 100%)'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'var(--white)',
            border: '1px solid var(--gray-200)',
            borderRadius: '24px',
            fontSize: '0.8rem',
            color: 'var(--navy-700)',
            marginBottom: '24px'
          }}>
            <Shield size={14} />
            Blockchain Secured • Guardian Approved
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: '2.75rem',
            fontWeight: 700,
            color: 'var(--navy-900)',
            lineHeight: 1.2,
            marginBottom: '16px'
          }}>
            Register Your Startup Name<br />
            <span style={{ color: 'var(--navy-600)' }}>With Digital Ownership</span>
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: 'var(--gray-500)',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            The first platform enabling teens to secure their startup names with
            guardian approval, blockchain verification, and official certification.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ width: 'auto', padding: '14px 32px' }}>
              Get Started Free
              <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </Link>
            <Link href="/about" className="btn-secondary">
              Learn More
            </Link>
          </div>

          {/* Trust Indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '48px',
            flexWrap: 'wrap'
          }}>
            {['Parent Verification Required', 'KYC Protected', 'Immutable Records'].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">FEATURES</p>
            <h2 className="section-title">Everything You Need to Secure Your Startup</h2>
            <p className="section-subtitle">Professional-grade digital ownership with guardian oversight</p>
          </div>

          <div className="feature-list">
            {[
              {
                icon: Shield,
                title: 'Blockchain Secured',
                desc: 'Your startup name is cryptographically recorded with an immutable timestamp'
              },
              {
                icon: CheckCircle,
                title: 'Guardian Approved',
                desc: 'Parent/guardian verification and KYC ensures compliance and trust'
              },
              {
                icon: Award,
                title: 'TMIT Token',
                desc: 'Receive a soulbound, non-transferable token proving your ownership'
              },
              {
                icon: FileText,
                title: 'Official Certificate',
                desc: 'Download your digital certificate with all registration details'
              },
            ].map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-icon">
                  <feature.icon size={24} />
                </div>
                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section section-light">
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">PROCESS</p>
            <h2 className="section-title">How It Works</h2>
          </div>

          <div className="process-container">
            {[
              {
                num: '01',
                title: 'Register',
                desc: "Fill in your details and your startup information. Add your parent/guardian's email."
              },
              {
                num: '02',
                title: 'Verify',
                desc: 'Your guardian receives a verification link. They complete KYC to approve your registration.'
              },
              {
                num: '03',
                title: 'Receive',
                desc: 'Get your TMIT Token, Verification ID, and downloadable certificate with legal proof.'
              },
            ].map((step, index) => (
              <div key={index} className="process-step">
                <p className="process-number">{step.num}</p>
                <h3 className="process-title">{step.title}</h3>
                <p className="process-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">BENEFITS</p>
            <h2 className="section-title">What You Receive</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>
            {/* Left - Benefits List */}
            <div>
              {[
                { icon: Award, title: 'TMIT Token', desc: 'Soulbound, non-transferable proof of ownership' },
                { icon: FileText, title: 'Digital Certificate', desc: 'PDF with all your registration details' },
                { icon: Link2, title: 'Verification Badge', desc: 'Embeddable trust seal for your website' },
                { icon: Shield, title: 'Blockchain Record', desc: 'Immutable timestamp on IPFS' },
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '8px',
                  transition: 'background 0.2s'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'var(--gray-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--navy-700)'
                  }}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--navy-900)', marginBottom: '4px' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right - Certificate Preview */}
            <div className="certificate-preview">
              <div className="certificate-seal">
                <span>OFFICIAL<br />SEAL</span>
              </div>
              <div className="certificate-header">
                <p className="certificate-company">Your Company LLC</p>
                <p className="certificate-founder">John Doe</p>
                <div className="certificate-badge">
                  <CheckCircle size={12} />
                  Verified
                </div>
                <p className="certificate-token">TMIT-1737012358-a3f2b1c9</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Notice */}
      <section className="section-dark" style={{ padding: '48px 24px' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '700px' }}>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
            TiMint Finance is a private digital registry providing proof-of-ownership for startup names.
            This service does not constitute government incorporation, trademark registration, or legal
            business formation. The TMIT Token serves as digital evidence of first registration within
            the TiMint ecosystem.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 24px',
        background: 'var(--navy-900)',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--white)', marginBottom: '16px' }}>
            Ready to Secure Your Startup Name?
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>
            Join thousands of young entrepreneurs protecting their business identity.
          </p>
          <Link
            href="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '16px 32px',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--navy-900)',
              background: 'var(--white)',
              borderRadius: '8px',
              textDecoration: 'none',
            }}
          >
            Start Registration
            <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
