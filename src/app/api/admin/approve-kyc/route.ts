import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { pinToIPFS } from '@/lib/blockchain/ipfs'
import { generateTMITToken } from '@/lib/blockchain/token'
import { getKYCApprovedEmail } from '@/lib/email/templates'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
    try {
        const { userId, action } = await req.json() // action: 'approve' | 'reject'

        if (!userId || !action) {
            return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 })
        }

        const supabase = createAdminClient()

        if (action === 'reject') {
            //  Reject KYC - Delete documents and update status
            const { data: kyc_docs } = await supabase
                .from('kyc_documents')
                .select('selfie_url, document_url')
                .eq('user_id', userId)
                .single()

            if (kyc_docs) {
                // Delete files from storage (FREE TIER OPTIMIZATION)
                await supabase.storage
                    .from('kyc-documents')
                    .remove([kyc_docs.selfie_url, kyc_docs.document_url])

                // Delete database record
                await supabase
                    .from('kyc_documents')
                    .delete()
                    .eq('user_id', userId)
            }

            // Update user status
            await supabase
                .from('users')
                .update({ kyc_status: 'rejected' })
                .eq('id', userId)

            return NextResponse.json({
                success: true,
                message: 'KYC rejected. Documents deleted.'
            })
        }

        if (action === 'approve') {
            // Approve KYC - Delete docs, verify user, register on IPFS

            // Get user and startup data
            const { data: user } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            const { data: startup } = await supabase
                .from('startups')
                .select('*')
                .eq('user_id', userId)
                .single()

            if (!user || !startup) {
                return NextResponse.json({ error: 'User or startup not found' }, { status: 404 })
            }

            // 1. DELETE DOCUMENTS (FREE TIER OPTIMIZATION - Delete ASAP!)
            const { data: kyc_docs } = await supabase
                .from('kyc_documents')
                .select('selfie_url, document_url')
                .eq('user_id', userId)
                .single()

            if (kyc_docs) {
                console.log('🗑️ Deleting KYC documents from storage...')
                await supabase.storage
                    .from('kyc-documents')
                    .remove([kyc_docs.selfie_url, kyc_docs.document_url])

                await supabase
                    .from('kyc_documents')
                    .delete()
                    .eq('user_id', userId)

                console.log('✅ Documents deleted successfully')
            }

            //  2. REGISTER ON IPFS (via Pinata)
            console.log('🌐 Uploading to IPFS via Pinata...')
            const ipfsCID = await pinToIPFS({
                companyName: startup.company_name,
                founderName: user.name,
                guardianName: user.parent_name,
                timestamp: Date.now(),
                ownerUserId: user.id,
                signature: `VERIFIED-${Date.now()}`
            })

            console.log('✅ IPFS upload complete. CID:', ipfsCID)

            // 3. GENERATE TMIT TOKEN
            const tmitToken = generateTMITToken({
                companyName: startup.company_name,
                userId: user.id,
                timestamp: Date.now(),
                blockchainTxHash: ipfsCID,
            })

            console.log('🎫 Generated TMIT Token:', tmitToken)

            // 4. UPDATE DATABASE
            await supabase
                .from('users')
                .update({ kyc_status: 'verified' })
                .eq('id', userId)

            await supabase
                .from('startups')
                .update({
                    verified: true,
                    blockchain_tx: ipfsCID, // Store IPFS CID here
                    token_id: tmitToken,
                })
                .eq('user_id', userId)

            // 5. SEND SUCCESS EMAIL
            try {
                const emailContent = getKYCApprovedEmail({
                    teenName: user.name,
                    startupName: startup.company_name,
                    dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
                })

                await resend.emails.send({
                    from: 'TiMint Finance <onboarding@resend.dev>',
                    to: user.email,
                    subject: emailContent.subject,
                    html: emailContent.html,
                    text: emailContent.text,
                })
            } catch (emailError) {
                console.error('Failed to send approval email:', emailError)
                // Don't fail the approval if email fails
            }

            return NextResponse.json({
                success: true,
                message: 'KYC approved! User verified and registered on IPFS.',
                data: {
                    tmitToken,
                    ipfsCID: ipfsCID,
                    ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsCID}`,
                },
            })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        console.error('❌ Approve KYC error:', error)
        return NextResponse.json({
            error: error.message || 'Internal server error'
        }, { status: 500 })
    }
}
