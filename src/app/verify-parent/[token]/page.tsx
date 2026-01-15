'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, Upload, X } from 'lucide-react'

interface VerificationData {
    valid: boolean
    user: any
    startup: any
}

export default function VerifyParentPage({ params }: { params: Promise<{ token: string }> }) {
    const router = useRouter()
    const [token, setToken] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<VerificationData | null>(null)
    const [error, setError] = useState('')
    const [step, setStep] = useState<'verify' | 'upload' | 'success'>('verify')
    const [uploading, setUploading] = useState(false)
    const [selfie, setSelfie] = useState<File | null>(null)
    const [document, setDocument] = useState<File | null>(null)

    useEffect(() => {
        params.then(p => {
            setToken(p.token)
            fetchVerificationData(p.token)
        })
    }, [params])

    const fetchVerificationData = async (t: string) => {
        try {
            const res = await fetch(`/api/verify-parent/${t}`)
            if (!res.ok) {
                const errorData = await res.json()
                setError(errorData.error || 'Invalid verification link')
                setLoading(false)
                return
            }
            const result = await res.json()
            setData(result)
            setLoading(false)
        } catch (err) {
            setError('Failed to load verification data')
            setLoading(false)
        }
    }

    const handleAction = async (action: 'approve' | 'reject') => {
        try {
            const res = await fetch(`/api/verify-parent/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            })

            const result = await res.json()

            if (!res.ok) {
                setError(result.error || 'Action failed')
                return
            }

            if (action === 'approve') {
                setStep('upload')
            } else {
                setStep('success')
            }
        } catch (err) {
            setError('Failed to process action')
        }
    }

    const handleUpload = async () => {
        if (!selfie || !document) {
            setError('Please upload both files')
            return
        }

        setUploading(true)
        setError('')

        const formData = new FormData()
        formData.append('userId', data!.user.id)
        formData.append('selfie', selfie)
        formData.append('document', document)

        try {
            const res = await fetch('/api/upload-documents', {
                method: 'POST',
                body: formData,
            })

            const result = await res.json()

            if (!res.ok) {
                setError(result.error || 'Upload failed')
                setUploading(false)
                return
            }

            setStep('success')
        } catch (err) {
            setError('Failed to upload documents')
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: '32px', height: '32px' }} />
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
                <div className="card" style={{ maxWidth: '400px', textAlign: 'center' }}>
                    <AlertCircle size={48} color="var(--error)" style={{ margin: '0 auto 16px' }} />
                    <h2>{error}</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '8px' }}>
                        The verification link may be invalid, expired, or already used.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)', padding: '40px 20px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Verify Step */}
                {step === 'verify' && data && (
                    <div className="card card-elevated">
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Parent Verification</h1>
                        <p style={{ color: 'var(--gray-500)', marginBottom: '32px' }}>
                            Please review the registration details below
                        </p>

                        <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Teen's Name</p>
                                <p style={{ fontWeight: 600 }}>{data.user.name}</p>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Age</p>
                                <p style={{ fontWeight: 600 }}>{data.user.age} years old</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Startup Name</p>
                                <p style={{ fontWeight: 600 }}>{data.startup.company_name}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => handleAction('reject')} className="btn-secondary" style={{ flex: 1 }}>
                                <X size={16} style={{ marginRight: '8px' }} />
                                Reject
                            </button>
                            <button onClick={() => handleAction('approve')} className="btn-primary" style={{ flex: 1 }}>
                                <CheckCircle size={16} style={{ marginRight: '8px' }} />
                                Approve
                            </button>
                        </div>
                    </div>
                )}

                {/* Upload Step */}
                {step === 'upload' && (
                    <div className="card card-elevated">
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Upload KYC Documents</h1>
                        <p style={{ color: 'var(--gray-500)', marginBottom: '32px' }}>
                            Required for identity verification
                        </p>

                        {error && (
                            <div style={{ padding: '12px', background: 'rgba(220,38,38,0.1)', color: 'var(--error)', borderRadius: '6px', marginBottom: '20px' }}>
                                {error}
                            </div>
                        )}

                        <div className="field-group">
                            <label className="field-label">Your Selfie <span>*</span></label>
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                className="field-input"
                                onChange={(e) => setSelfie(e.target.files?.[0] || null)}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                                Clear photo of your face (JPG or PNG, max 5MB)
                            </p>
                        </div>

                        <div className="field-group">
                            <label className="field-label">Aadhaar or Government ID <span>*</span></label>
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                className="field-input"
                                onChange={(e) => setDocument(e.target.files?.[0] || null)}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                                Photo of your ID document (JPG or PNG, max 5MB)
                            </p>
                        </div>

                        <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '6px', marginBottom: '24px' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                🔒 Your documents will be <strong>automatically deleted</strong> after verification is complete. We only store them temporarily for manual review.
                            </p>
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={uploading || !selfie || !document}
                            className="btn-primary"
                            style={{ opacity: (uploading || !selfie || !document) ? 0.6 : 1 }}
                        >
                            {uploading ? (
                                <>
                                    <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} style={{ marginRight: '8px' }} />
                                    Upload Documents
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Success Step */}
                {step === 'success' && (
                    <div className="card card-elevated" style={{ textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <CheckCircle size={32} color="var(--success)" />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>All Done!</h1>
                        <p style={{ color: 'var(--gray-500)' }}>
                            {data ?
                                'Thank you for verifying. The documents have been uploaded and will be reviewed by our team within 24 hours.' :
                                'Registration has been rejected and removed.'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
