import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()

        // Get all users awaiting KYC review
        const { data: users, error } = await supabase
            .from('users')
            .select(`
        *,
        startups (*),
        kyc_documents (*)
      `)
            .eq('kyc_status', 'under_review')
            .eq('parent_verified', true)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Fetch KYC reviews error:', error)
            return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
        }

        // Generate signed URLs for documents
        const usersWithUrls = await Promise.all(
            users.map(async (user) => {
                if (!user.kyc_documents || user.kyc_documents.length === 0) {
                    return { ...user, document_urls: null }
                }

                const doc = user.kyc_documents[0]

                const { data: selfieUrl } = await supabase.storage
                    .from('kyc-documents')
                    .createSignedUrl(doc.selfie_url, 3600) // 1 hour

                const { data: documentUrl } = await supabase.storage
                    .from('kyc-documents')
                    .createSignedUrl(doc.document_url, 3600)

                return {
                    ...user,
                    document_urls: {
                        selfie: selfieUrl?.signedUrl,
                        document: documentUrl?.signedUrl,
                    },
                }
            })
        )

        return NextResponse.json({ users: usersWithUrls })
    } catch (error: any) {
        console.error('KYC review error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
