import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

        // Send verification email to parent
        try {
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-parent-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: authData.user.id }),
            })
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
