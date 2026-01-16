'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Step = 1 | 2 | 3

export default function RegisterPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>(1)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        parent_name: '',
        parent_email: '',
        company_name: '',
        description: '',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateStep = (currentStep: Step): boolean => {
        const newErrors: Record<string, string> = {}

        if (currentStep === 1) {
            if (!formData.name || formData.name.length < 2) newErrors.name = 'Name is required'
            if (!formData.age || parseInt(formData.age) < 13 || parseInt(formData.age) > 17) {
                newErrors.age = 'Age must be between 13-17'
            }
            if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Valid email required'
            }
            if (!formData.password || formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters'
            }
            if (!formData.phone || formData.phone.length < 10) newErrors.phone = 'Valid phone required'
            if (!formData.address || formData.address.length < 10) newErrors.address = 'Full address required'
        }

        if (currentStep === 2) {
            if (!formData.parent_name || formData.parent_name.length < 2) {
                newErrors.parent_name = 'Parent name required'
            }
            if (!formData.parent_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parent_email)) {
                newErrors.parent_email = 'Valid parent email required'
            }
        }

        if (currentStep === 3) {
            if (!formData.company_name || formData.company_name.length < 2) {
                newErrors.company_name = 'Startup name required'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep(step)) {
            setStep((prev) => Math.min(prev + 1, 3) as Step)
        }
    }

    const handleBack = () => {
        setStep((prev) => Math.max(prev - 1, 1) as Step)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateStep(3)) return

        setIsLoading(true)
        setError('')

        try {
            // Call server-side API route
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    age: formData.age,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    address: formData.address,
                    parent_name: formData.parent_name,
                    parent_email: formData.parent_email,
                    company_name: formData.company_name,
                    description: formData.description,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed')
            }

            // Now sign in the user
            const supabase = createClient()
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            })

            if (signInError) {
                console.error('Sign in error:', signInError)
                // Registration succeeded but sign-in failed
                setError('Account created! Please try logging in.')
                setTimeout(() => router.push('/login'), 2000)
                return
            }

            // Success - redirect to dashboard
            router.push('/dashboard?registered=true')
        } catch (err: any) {
            console.error('Registration error:', err)
            setError(err.message || 'Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const stepTitles = {
        1: 'Personal Information',
        2: 'Guardian Details',
        3: 'Startup Registration'
    }

    const stepSubtitles = {
        1: 'Tell us about yourself',
        2: 'For verification and approval',
        3: 'Secure your startup name'
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
                        "Empowering the next generation of entrepreneurs with secure,
                        guardian-approved digital ownership."
                    </p>
                </div>

                <div style={{ marginTop: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
                        {[1, 2, 3].map((s) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                                <div
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        background: step >= s ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                                        color: step >= s ? 'var(--navy-900)' : 'rgba(255,255,255,0.5)',
                                    }}
                                >
                                    {step > s ? <CheckCircle size={16} /> : s}
                                </div>
                                {s < 3 && (
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '2px',
                                            background: step > s ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                                            marginLeft: '8px',
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                        Step {step} of 3
                    </p>
                </div>

                <p className="brand-established">ESTABLISHED 2026</p>
            </div>

            {/* Right Panel - Form */}
            <div className="split-right">
                <div className="form-container">
                    <div className="form-header">
                        <h2 className="form-title">{stepTitles[step]}</h2>
                        <p className="form-subtitle">{stepSubtitles[step]}</p>
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
                        {/* Step 1: Personal Info */}
                        {step === 1 && (
                            <>
                                <div className="field-group">
                                    <label className="field-label">Full Name <span>*</span></label>
                                    <input
                                        type="text"
                                        className={`field-input ${errors.name ? 'error' : ''}`}
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                    />
                                    {errors.name && <p className="field-error">{errors.name}</p>}
                                </div>

                                <div className="field-row">
                                    <div className="field-group">
                                        <label className="field-label">Age <span>*</span></label>
                                        <input
                                            type="number"
                                            min="13"
                                            max="17"
                                            className={`field-input ${errors.age ? 'error' : ''}`}
                                            placeholder="13-17"
                                            value={formData.age}
                                            onChange={(e) => updateField('age', e.target.value)}
                                        />
                                        {errors.age && <p className="field-error">{errors.age}</p>}
                                    </div>

                                    <div className="field-group">
                                        <label className="field-label">Phone <span>*</span></label>
                                        <input
                                            type="tel"
                                            className={`field-input ${errors.phone ? 'error' : ''}`}
                                            placeholder="+1 234 567 8900"
                                            value={formData.phone}
                                            onChange={(e) => updateField('phone', e.target.value)}
                                        />
                                        {errors.phone && <p className="field-error">{errors.phone}</p>}
                                    </div>
                                </div>

                                <div className="field-group">
                                    <label className="field-label">Email Address <span>*</span></label>
                                    <input
                                        type="email"
                                        className={`field-input ${errors.email ? 'error' : ''}`}
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                    />
                                    {errors.email && <p className="field-error">{errors.email}</p>}
                                </div>

                                <div className="field-group">
                                    <label className="field-label">Password <span>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className={`field-input ${errors.password ? 'error' : ''}`}
                                            placeholder="Minimum 8 characters"
                                            style={{ paddingRight: '48px' }}
                                            value={formData.password}
                                            onChange={(e) => updateField('password', e.target.value)}
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
                                    {errors.password && <p className="field-error">{errors.password}</p>}
                                </div>

                                <div className="field-group">
                                    <label className="field-label">Address <span>*</span></label>
                                    <textarea
                                        rows={2}
                                        className={`field-input ${errors.address ? 'error' : ''}`}
                                        placeholder="Your full residential address"
                                        style={{ resize: 'none' }}
                                        value={formData.address}
                                        onChange={(e) => updateField('address', e.target.value)}
                                    />
                                    {errors.address && <p className="field-error">{errors.address}</p>}
                                </div>
                            </>
                        )}

                        {/* Step 2: Guardian Info */}
                        {step === 2 && (
                            <>
                                <div style={{
                                    padding: '16px',
                                    marginBottom: '24px',
                                    borderRadius: '6px',
                                    background: 'var(--gray-50)',
                                    border: '1px solid var(--gray-200)'
                                }}>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                        Your parent/guardian will receive a verification email to approve your
                                        registration and complete KYC verification.
                                    </p>
                                </div>

                                <div className="field-group">
                                    <label className="field-label">Parent/Guardian Full Name <span>*</span></label>
                                    <input
                                        type="text"
                                        className={`field-input ${errors.parent_name ? 'error' : ''}`}
                                        placeholder="Enter guardian's full name"
                                        value={formData.parent_name}
                                        onChange={(e) => updateField('parent_name', e.target.value)}
                                    />
                                    {errors.parent_name && <p className="field-error">{errors.parent_name}</p>}
                                </div>

                                <div className="field-group">
                                    <label className="field-label">Parent/Guardian Email <span>*</span></label>
                                    <input
                                        type="email"
                                        className={`field-input ${errors.parent_email ? 'error' : ''}`}
                                        placeholder="guardian@email.com"
                                        value={formData.parent_email}
                                        onChange={(e) => updateField('parent_email', e.target.value)}
                                    />
                                    {errors.parent_email && <p className="field-error">{errors.parent_email}</p>}
                                </div>
                            </>
                        )}

                        {/* Step 3: Startup Info */}
                        {step === 3 && (
                            <>
                                <div className="field-group">
                                    <label className="field-label">Startup Name <span>*</span></label>
                                    <input
                                        type="text"
                                        className={`field-input ${errors.company_name ? 'error' : ''}`}
                                        placeholder="Your startup or company name"
                                        value={formData.company_name}
                                        onChange={(e) => updateField('company_name', e.target.value)}
                                    />
                                    {errors.company_name && <p className="field-error">{errors.company_name}</p>}
                                </div>

                                <div className="field-group">
                                    <label className="field-label">Description <span style={{ color: 'var(--gray-400)' }}>(optional)</span></label>
                                    <textarea
                                        rows={3}
                                        className="field-input"
                                        placeholder="What does your startup do?"
                                        style={{ resize: 'none' }}
                                        value={formData.description}
                                        onChange={(e) => updateField('description', e.target.value)}
                                    />
                                </div>

                                <div style={{
                                    padding: '16px',
                                    marginBottom: '24px',
                                    borderRadius: '6px',
                                    background: 'rgba(201, 162, 39, 0.1)',
                                    border: '1px solid rgba(201, 162, 39, 0.3)'
                                }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)', marginBottom: '8px' }}>
                                        You will receive:
                                    </p>
                                    <ul style={{ fontSize: '0.8rem', color: 'var(--gray-600)', paddingLeft: '16px' }}>
                                        <li>TMIT Token (soulbound ownership proof)</li>
                                        <li>Verification ID for your badge</li>
                                        <li>Downloadable digital certificate</li>
                                    </ul>
                                </div>
                            </>
                        )}

                        {/* Navigation Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            {step > 1 && (
                                <button type="button" onClick={handleBack} className="btn-secondary" style={{ flex: 1 }}>
                                    <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                                    Back
                                </button>
                            )}

                            {step < 3 ? (
                                <button type="button" onClick={handleNext} className="btn-primary" style={{ flex: 1 }}>
                                    Continue
                                    <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                                </button>
                            ) : (
                                <button type="submit" disabled={isLoading} className="btn-primary" style={{ flex: 1 }}>
                                    {isLoading ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="spinner" />
                                            Creating Account...
                                        </span>
                                    ) : (
                                        'Complete Registration'
                                    )}
                                </button>
                            )}
                        </div>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '32px' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: 'var(--navy-700)', fontWeight: 500, textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </p>

                    <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: '24px', maxWidth: '360px', margin: '24px auto 0' }}>
                        By registering, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    )
}
