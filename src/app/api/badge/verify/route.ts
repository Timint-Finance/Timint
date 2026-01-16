import { NextRequest, NextResponse } from 'next/server'
import { verifyBadgeToken, isTokenValidForDomain } from '@/lib/badge/jwt'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json({
                verified: false,
                error: 'Token required'
            }, { status: 400 })
        }

        // Get referer to check domain
        const referer = request.headers.get('referer')

        // Verify token and domain
        const { valid, error } = isTokenValidForDomain(token, referer)

        if (!valid) {
            return NextResponse.json({
                verified: false,
                error: error || 'Invalid token'
            }, { status: 403 })
        }

        // Extract payload
        const payload = verifyBadgeToken(token)

        if (!payload) {
            return NextResponse.json({
                verified: false,
                error: 'Token verification failed'
            }, { status: 403 })
        }

        // Verify startup still exists and is verified
        const supabase = await createClient()
        const { data: startup } = await supabase
            .from('startups')
            .select('company_name, verified')
            .eq('id', payload.startupId)
            .single()

        if (!startup || !startup.verified) {
            return NextResponse.json({
                verified: false,
                error: 'Startup not found or not verified'
            }, { status: 404 })
        }

        return NextResponse.json({
            verified: true,
            startupId: payload.startupId,
            domain: payload.domain,
            companyName: startup.company_name
        })
    } catch (error: any) {
        console.error('Badge verification error:', error)
        return NextResponse.json({
            verified: false,
            error: 'Verification failed'
        }, { status: 500 })
    }
}
