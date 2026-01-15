'use client'

import { useState } from 'react'
import { Mail, MessageSquare, Clock, Send } from 'lucide-react'
import Navbar, { Footer } from '@/components/Navigation'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsSubmitting(false)
        setSubmitted(true)
    }

    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar />

            {/* Hero */}
            <section style={{
                paddingTop: '120px',
                paddingBottom: '64px',
                background: 'var(--gray-50)'
            }}>
                <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
                    <p className="section-eyebrow">CONTACT</p>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '16px' }}>
                        Get in Touch
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: 'var(--gray-500)' }}>
                        Have questions? We're here to help young entrepreneurs succeed.
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section className="section">
                <div className="container" style={{ maxWidth: '1000px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
                        {/* Contact Info */}
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>Contact Information</h2>

                            {[
                                { icon: Mail, title: 'Email', value: 'support@timint.finance', sub: 'We respond within 24 hours' },
                                { icon: MessageSquare, title: 'Live Chat', value: 'Available on dashboard', sub: 'For registered users' },
                                { icon: Clock, title: 'Business Hours', value: 'Monday - Friday: 9 AM - 6 PM', sub: 'EST (UTC-5)' },
                            ].map((item, index) => (
                                <div key={index} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
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
                                        <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{item.title}</h3>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--gray-600)' }}>{item.value}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{item.sub}</p>
                                    </div>
                                </div>
                            ))}

                            {/* FAQ Preview */}
                            <div style={{
                                marginTop: '32px',
                                padding: '20px',
                                borderRadius: '8px',
                                background: 'var(--gray-50)'
                            }}>
                                <h3 style={{ fontWeight: 600, marginBottom: '12px' }}>Frequently Asked</h3>
                                <ul style={{ fontSize: '0.875rem', color: 'var(--gray-600)', paddingLeft: '16px' }}>
                                    <li style={{ marginBottom: '8px' }}>How long does verification take?</li>
                                    <li style={{ marginBottom: '8px' }}>Can I change my startup name later?</li>
                                    <li style={{ marginBottom: '8px' }}>What happens when I turn 18?</li>
                                    <li>Is my TMIT Token transferable?</li>
                                </ul>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="card card-elevated">
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>Send a Message</h2>

                            {submitted ? (
                                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        background: 'rgba(5, 150, 105, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 16px',
                                        color: 'var(--success)'
                                    }}>
                                        <Send size={28} />
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Message Sent!</h3>
                                    <p style={{ color: 'var(--gray-500)' }}>We'll get back to you within 24 hours.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="field-group">
                                        <label className="field-label">Your Name <span>*</span></label>
                                        <input
                                            type="text"
                                            required
                                            className="field-input"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label className="field-label">Email Address <span>*</span></label>
                                        <input
                                            type="email"
                                            required
                                            className="field-input"
                                            placeholder="your@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label className="field-label">Subject <span>*</span></label>
                                        <select
                                            required
                                            className="field-input"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        >
                                            <option value="">Select a topic</option>
                                            <option value="registration">Registration Help</option>
                                            <option value="verification">Verification Issues</option>
                                            <option value="technical">Technical Support</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="field-group">
                                        <label className="field-label">Message <span>*</span></label>
                                        <textarea
                                            required
                                            rows={4}
                                            className="field-input"
                                            placeholder="How can we help you?"
                                            style={{ resize: 'none' }}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        />
                                    </div>

                                    <button type="submit" disabled={isSubmitting} className="btn-primary">
                                        {isSubmitting ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="spinner" />
                                                Sending...
                                            </span>
                                        ) : (
                                            <>
                                                <Send size={16} style={{ marginRight: '8px' }} />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
