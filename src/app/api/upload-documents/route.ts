import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const userId = formData.get('userId') as string
        const selfie = formData.get('selfie') as File
        const document = formData.get('document') as File

        if (!userId || !selfie || !document) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Validate file types
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png']
        if (!validImageTypes.includes(selfie.type) || !validImageTypes.includes(document.type)) {
            return NextResponse.json({ error: 'Only JPG and PNG images are allowed' }, { status: 400 })
        }

        // Validate file sizes (max 5MB each)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (selfie.size > maxSize || document.size > maxSize) {
            return NextResponse.json({ error: 'Files must be under 5MB' }, { status: 400 })
        }

        const supabase = await createClient()

        // Upload selfie
        const selfieExt = selfie.name.split('.').pop()
        const selfiePath = `${userId}/selfie-${Date.now()}.${selfieExt}`

        const { error: selfieError } = await supabase.storage
            .from('kyc-documents')
            .upload(selfiePath, selfie, {
                contentType: selfie.type,
                upsert: false,
            })

        if (selfieError) {
            console.error('Selfie upload error:', selfieError)
            return NextResponse.json({ error: 'Failed to upload selfie' }, { status: 500 })
        }

        // Upload document
        const docExt = document.name.split('.').pop()
        const docPath = `${userId}/document-${Date.now()}.${docExt}`

        const { error: docError } = await supabase.storage
            .from('kyc-documents')
            .upload(docPath, document, {
                contentType: document.type,
                upsert: false,
            })

        if (docError) {
            console.error('Document upload error:', docError)
            // Delete selfie if document fails
            await supabase.storage.from('kyc-documents').remove([selfiePath])
            return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
        }

        // Save document references to database
        const { error: dbError } = await supabase
            .from('kyc_documents')
            .insert({
                user_id: userId,
                selfie_url: selfiePath,
                document_url: docPath,
            })

        if (dbError) {
            console.error('Database insert error:', dbError)
            // Clean up uploaded files
            await supabase.storage.from('kyc-documents').remove([selfiePath, docPath])
            return NextResponse.json({ error: 'Failed to save document info' }, { status: 500 })
        }

        // Update user KYC status to under review
        await supabase
            .from('users')
            .update({ kyc_status: 'under_review' })
            .eq('id', userId)

        return NextResponse.json({
            success: true,
            message: 'Documents uploaded successfully. Your KYC is now under review.'
        })
    } catch (error: any) {
        console.error('Upload documents error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
