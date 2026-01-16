import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateBadgeToken } from '@/lib/badge/jwt'

export async function POST(request: NextRequest) {
    try {
        const { domain } = await request.json()

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
        }

        // Validate domain format
        const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i
        if (!domainRegex.test(domain)) {
            return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
        }

        const supabase = await createClient()

        // Get authenticated user
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's startup
        const { data: startup, error: startupError } = await supabase
            .from('startups')
            .select('id')
            .eq('user_id', authUser.id)
            .eq('verified', true)
            .single()

        if (startupError || !startup) {
            return NextResponse.json({
                error: 'No verified startup found. Complete verification first.'
            }, { status: 404 })
        }

        // Generate JWT token
        const token = generateBadgeToken({
            startupId: startup.id,
            domain: domain.toLowerCase(),
            userId: authUser.id
        })

        // Generate embed code
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://timint.vercel.app'
        const embedCode = `<a href="${siteUrl}/badge/${startup.id}?token=${token}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; background: #0D1E33; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-family: sans-serif;">✓ Ver ified by TiMint Finance</a>`

        return NextResponse.json({
            success: true,
            token,
            domain,
            embedCode,
            expiresIn: '1 year'
        })
    } catch (error: any) {
        console.error('Badge token generation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
