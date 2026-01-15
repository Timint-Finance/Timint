'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link href="/" className="navbar-logo">
                    TIMINT
                </Link>

                {/* Desktop Navigation */}
                <div className="navbar-links" style={{ display: 'none' }} id="desktop-nav">
                    <Link href="/" className="navbar-link">Home</Link>
                    <Link href="/about" className="navbar-link">About</Link>
                    <Link href="/contact" className="navbar-link">Contact</Link>
                </div>
                <style jsx>{`
          @media (min-width: 768px) {
            #desktop-nav { display: flex !important; }
            #mobile-btn { display: none !important; }
          }
        `}</style>

                <div className="navbar-links" style={{ display: 'none' }} id="desktop-nav-cta">
                    <Link href="/login" className="navbar-link">Sign In</Link>
                    <Link href="/register" className="navbar-cta">Register</Link>
                </div>
                <style jsx>{`
          @media (min-width: 768px) {
            #desktop-nav-cta { display: flex !important; }
          }
        `}</style>

                {/* Mobile Menu Button */}
                <button
                    id="mobile-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        padding: '8px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--gray-600)',
                    }}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '64px',
                    left: 0,
                    right: 0,
                    background: 'var(--white)',
                    borderBottom: '1px solid var(--gray-200)',
                    padding: '16px 24px',
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Link href="/" className="navbar-link" onClick={() => setIsOpen(false)}>Home</Link>
                        <Link href="/about" className="navbar-link" onClick={() => setIsOpen(false)}>About</Link>
                        <Link href="/contact" className="navbar-link" onClick={() => setIsOpen(false)}>Contact</Link>
                        <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '8px 0' }} />
                        <Link href="/login" className="navbar-link" onClick={() => setIsOpen(false)}>Sign In</Link>
                        <Link href="/register" className="navbar-cta" style={{ textAlign: 'center' }} onClick={() => setIsOpen(false)}>
                            Register
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <p className="footer-logo">TIMINT</p>
                    <p className="footer-tagline">
                        Empowering the next generation of entrepreneurs with secure,
                        guardian-approved digital startup registration.
                    </p>
                </div>

                <div className="footer-disclaimer">
                    <p>
                        TiMint Finance is a private digital registry providing proof-of-ownership for startup names.
                        This service does not constitute government incorporation, trademark registration, or legal
                        business formation. The TMIT Token serves as digital evidence of first registration within
                        the TiMint ecosystem.
                    </p>
                    <p style={{ marginTop: '16px' }}>
                        © 2026 TiMint Finance. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
