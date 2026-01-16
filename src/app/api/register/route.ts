import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { generateVerificationToken } from '@/lib/blockchain/token'
import { getParentVerificationEmail } from '@/lib/email/templates'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            name,
            age,
            email,
            password,
            phone,
            address,
            parent_name,
            parent_email,
            company_name,
            description,
        } = body

        // Validate required fields
        if (!name || !age || !email || !password || !phone || !address || !parent_name || !parent_email || !company_name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const admin = createAdminClient()

        // Create auth user with admin client
        const { data: authData, error: authError } = await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                name,
                age: parseInt(age),
            }
        })

        if (authError) {
            console.error('Auth creation error:', authError)
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            )
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Failed to create user account' },
                { status: 500 }
            )
        }

        // Insert user data (admin client bypasses RLS)
        const { error: insertError } = await admin
            .from('users')
            .insert({
                id: authData.user.id,
                name,
                age: parseInt(age),
                phone,
                address,
                parent_name,
                parent_email,
            })

        if (insertError) {
            console.error('User insert error:', insertError)
            // Clean up auth user if profile creation fails
            await admin.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json(
                { error: 'Failed to save user information: ' + insertError.message },
                { status: 500 }
            )
        }

        // Insert startup data
        const { error: startupError } = await admin
            .from('startups')
            .insert({
                user_id: authData.user.id,
                company_name,
                description: description || null,
            })

        if (startupError) {
            console.error('Startup insert error:', startupError)
            // Clean up user and auth if startup creation fails
            await admin.from('users').delete().eq('id', authData.user.id)
            await admin.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json(
                { error: 'Failed to save startup information: ' + startupError.message },
                { status: 500 }
            )
        }

        // Send verification email to parent (directly, not via HTTP)
        try {
            console.log('Sending parent email for userId:', authData.user.id)

            // Generate verification token
            const token = generateVerificationToken()
            const expiresAt = new Date()
            expiresAt.setHours(expiresAt.getHours() + 24)

            // Save token to database
            const { error: tokenError } = await admin
                .from('parent_tokens')
                .insert({
                    user_id: authData.user.id,
                    token,
                    expires_at: expiresAt.toISOString(),
                    email_sent: true,
                })

            if (tokenError) {
                console.error('Token insert error:', tokenError)
            } else {
                // Create verification URL
                const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://timint.vercel.app'}/verify-parent/${token}`

                // Get email template
                const emailContent = getParentVerificationEmail({
                    parentName: parent_name,
                    teenName: name,
                    teenAge: parseInt(age),
                    startupName: company_name,
                    verificationUrl,
                })

                console.log('Attempting to send email to:', parent_email)
                console.log('Verification URL:', verificationUrl)

                // Send email via Resend
                const { data: emailData, error: emailError } = await resend.emails.send({
                    from: 'TiMint Finance <onboarding@resend.dev>',
                    to: parent_email,
                    subject: emailContent.subject,
                    html: emailContent.html,
                    text: emailContent.text,
                })

                if (emailError) {
                    console.error('Resend API error:', emailError)
                } else {
                    console.log('Email sent successfully! Email ID:', emailData?.id)
                }
            }
        } catch (emailError) {
            console.error('Failed to send parent email:', emailError)
            // Don't block registration if email fails
        }

        return NextResponse.json({
            success: true,
            userId: authData.user.id,
        })

    } catch (error: any) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: error.message || 'Registration failed' },
            { status: 500 }
        )
    }
}
