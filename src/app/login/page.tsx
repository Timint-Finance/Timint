'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const supabase = createClient()

            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            })

            if (authError) throw authError

            if (data.user) {
                router.push('/dashboard')
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="split-layout">
            {/* Left Panel - Brand */}
            <div className="split-left">
                <div>
                    <h1 className="brand-logo">TIMINT</h1>
                    <p className="brand-tagline">Digital Startup Registry</p>
                </div>

                <div className="brand-quote">
                    <p>
                        "Excellence in financial stewardship through institutional-grade
                        identity tokenization and asset management."
                    </p>
                </div>

                <p className="brand-established">ESTABLISHED 2026</p>
            </div>

            {/* Right Panel - Form */}
            <div className="split-right">
                <div className="form-container">
                    <div className="form-header">
                        <h2 className="form-title">Welcome Back</h2>
                        <p className="form-subtitle">Sign in to access your dashboard</p>
                    </div>

                    {error && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 16px',
                            marginBottom: '24px',
                            borderRadius: '6px',
                            background: 'rgba(220, 38, 38, 0.1)',
                            color: 'var(--error)',
                            fontSize: '0.875rem'
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
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
                            <label className="field-label">Password <span>*</span></label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="field-input"
                                    placeholder="Enter your password"
                                    style={{ paddingRight: '48px' }}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--gray-400)',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.875rem',
                            marginBottom: '24px'
                        }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--gray-600)' }}>
                                <input type="checkbox" style={{ accentColor: 'var(--navy-700)' }} />
                                Remember me
                            </label>
                            <Link href="/forgot-password" style={{ color: 'var(--navy-700)', textDecoration: 'none' }}>
                                Forgot password?
                            </Link>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary">
                            {isLoading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="spinner" />
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '32px' }}>
                        Don't have an account?{' '}
                        <Link href="/register" style={{ color: 'var(--navy-700)', fontWeight: 500, textDecoration: 'none' }}>
                            Register now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
