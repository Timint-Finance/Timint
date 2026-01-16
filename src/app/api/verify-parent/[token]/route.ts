import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        console.log('🔍 Looking up token:', token)
        const supabase = await createClient()

        // Find the token
        const { data: tokenData, error: tokenError } = await supabase
            .from('parent_tokens')
            .select('*, users(*), startups(*)')
            .eq('token', token)
            .single()

        console.log('📊 Token lookup result:', { found: !!tokenData, error: tokenError })

        if (tokenError || !tokenData) {
            console.error('❌ Token not found:', tokenError)
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 })
        }

        // Check if token is expired
        const now = new Date()
        const expiresAt = new Date(tokenData.expires_at)

        if (now > expiresAt) {
            return NextResponse.json({ error: 'Verification link has expired' }, { status: 400 })
        }

        // Check if already used
        if (tokenData.used) {
            return NextResponse.json({ error: 'Verification link already used' }, { status: 400 })
        }

        // Return token data for the page to display
        return NextResponse.json({
            valid: true,
            user: tokenData.users,
            startup: tokenData.startups,
        })
    } catch (error: any) {
        console.error('Verify parent token error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Approve or reject registration
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        const { action } = await req.json() // 'approve' or 'reject'

        const supabase = await createClient()

        // Find the token
        const { data: tokenData, error: tokenError } = await supabase
            .from('parent_tokens')
            .select('user_id, used, expires_at')
            .eq('token', token)
            .single()

        if (tokenError || !tokenData) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
        }

        // Check expiry and usage
        if (tokenData.used) {
            return NextResponse.json({ error: 'Already processed' }, { status: 400 })
        }

        if (new Date() > new Date(tokenData.expires_at)) {
            return NextResponse.json({ error: 'Expired' }, { status: 400 })
        }

        if (action === 'approve') {
            // Mark parent as verified
            await supabase
                .from('users')
                .update({ parent_verified: true })
                .eq('id', tokenData.user_id)

            // DON'T mark token as used yet - wait until KYC documents are uploaded
            // This allows the parent to continue using the same link for KYC upload

            return NextResponse.json({
                success: true,
                message: 'Registration approved. Please upload documents for KYC verification.',
                userId: tokenData.user_id
            })
        } else if (action === 'reject') {
            // Delete the user and their data
            await supabase
                .from('users')
                .delete()
                .eq('id', tokenData.user_id)

            return NextResponse.json({
                success: true,
                message: 'Registration rejected and removed.'
            })
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }
    } catch (error: any) {
        console.error('Process verification error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
