import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { generateVerificationToken } from '@/lib/blockchain/token'
import { getParentVerificationEmail } from '@/lib/email/templates'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
    try {
        // Check if Resend API key is configured
        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY is not configured!')
            return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
        }

        const { userId } = await req.json()
        console.log('Sending parent email for userId:', userId)

        const supabase = await createClient()

        // Get user and startup data
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const { data: startup } = await supabase
            .from('startups')
            .select('company_name')
            .eq('user_id', userId)
            .single()

        if (!startup) {
            return NextResponse.json({ error: 'Startup not found' }, { status: 404 })
        }

        // Generate verification token
        const token = generateVerificationToken()
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

        // Save token to database
        const { error: tokenError } = await supabase
            .from('parent_tokens')
            .insert({
                user_id: userId,
                token,
                expires_at: expiresAt.toISOString(),
                email_sent: true,
            })

        if (tokenError) {
            console.error('Token insert error:', tokenError)
            return NextResponse.json({ error: 'Failed to create verification token' }, { status: 500 })
        }

        // Create verification URL
        const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify-parent/${token}`

        // Get email template
        const emailContent = getParentVerificationEmail({
            parentName: user.parent_name,
            teenName: user.name,
            teenAge: user.age,
            startupName: startup.company_name,
            verificationUrl,
        })

        // Send email via Resend (using test domain for free tier)
        console.log('Attempting to send email to:', user.parent_email)
        console.log('Verification URL:', verificationUrl)

        const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'TiMint Finance <onboarding@resend.dev>',
            to: user.parent_email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
        })

        if (emailError) {
            console.error('Resend API error:', emailError)
            return NextResponse.json({ error: 'Failed to send email: ' + JSON.stringify(emailError) }, { status: 500 })
        }

        console.log('Email sent successfully! Email ID:', emailData?.id)

        return NextResponse.json({
            success: true,
            message: 'Verification email sent successfully',
            parentEmail: user.parent_email
        })
    } catch (error: any) {
        console.error('Send parent email error:', error)
        return NextResponse.json({
            error: error.message || 'Failed to send verification email'
        }, { status: 500 })
    }
}
