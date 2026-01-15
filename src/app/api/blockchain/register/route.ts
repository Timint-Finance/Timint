import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { pinToIPFS } from '@/lib/blockchain/ipfs'
import { generateTMITToken, createRegistrationSignature } from '@/lib/blockchain/token'

export async function POST(request: NextRequest) {
    try {
        const { userId, companyName, description } = await request.json()

        if (!userId || !companyName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = await createClient()

        // Verify user exists and is verified
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (!user.parent_verified || user.kyc_status !== 'verified') {
            return NextResponse.json({ error: 'Verification not complete' }, { status: 403 })
        }

        const timestamp = Date.now()

        // Create registration signature
        const signature = createRegistrationSignature({
            companyName,
            userId,
            guardianName: user.parent_name,
            timestamp,
        })

        // Generate TMIT Token
        const tokenId = generateTMITToken({
            companyName,
            userId,
            timestamp,
        })

        // Pin to IPFS
        let ipfsCid = null
        try {
            ipfsCid = await pinToIPFS({
                companyName,
                ownerUserId: userId,
                founderName: user.name,
                guardianName: user.parent_name,
                timestamp,
                signature,
            })
        } catch (ipfsError) {
            console.error('IPFS error:', ipfsError)
            // Continue without IPFS if it fails (for demo purposes)
        }

        // Update startup record
        const { error: updateError } = await supabase
            .from('startups')
            .update({
                blockchain_tx: ipfsCid,
                token_id: tokenId,
                verified: true,
            })
            .eq('user_id', userId)
            .eq('company_name', companyName)

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update record' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            tokenId,
            ipfsCid,
            message: 'Startup registered on blockchain successfully',
        })
    } catch (error: any) {
        console.error('Blockchain registration error:', error)
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
    }
}
