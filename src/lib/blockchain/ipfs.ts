// IPFS Service for Blockchain Registration
// Uses Pinata Web3 SDK for free IPFS storage

import { PinataSDK } from "pinata-web3"

interface StartupRegistration {
    companyName: string
    ownerUserId: string
    founderName: string
    guardianName: string
    timestamp: number
    signature: string
}

// Initialize Pinata SDK
function getPinata() {
    const jwt = process.env.PINATA_JWT

    if (!jwt) {
        throw new Error('PINATA_JWT not configured in environment variables')
    }

    return new PinataSDK({ pinataJwt: jwt })
}

/**
 * Upload startup registration data to IPFS via Pinata
 * Returns the IPFS CID (Content Identifier)
 */
export async function pinToIPFS(data: StartupRegistration): Promise<string> {
    try {
        const pinata = getPinata()

        // Upload MINIMAL JSON (save 1GB free storage!)
        const upload = await pinata.upload.json({
            name: data.founderName,
            company: data.companyName,
            timestamp: data.timestamp,
            registered: new Date(data.timestamp).toISOString(),
            registry: 'TiMint Finance'
        })

        console.log('✅ IPFS Upload successful:', upload.IpfsHash)
        return upload.IpfsHash
    } catch (error) {
        console.error('❌ Pinata upload error:', error)
        throw new Error('Failed to upload to IPFS')
    }
}

/**
 * Retrieve data from IPFS using CID
 */
export async function getFromIPFS(cid: string): Promise<StartupRegistration | null> {
    try {
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`)
        if (!response.ok) {
            console.error('Failed to fetch from IPFS gateway')
            return null
        }
        return await response.json()
    } catch (error) {
        console.error('Error fetching from IPFS:', error)
        return null
    }
}

/**
 * Generate public gateway URL for a CID
 */
export function generateIPFSUrl(cid: string): string {
    return `https://gateway.pinata.cloud/ipfs/${cid}`
}

/**
 * Check if Pinata is properly configured
 */
export function isPinataConfigured(): boolean {
    return !!process.env.PINATA_JWT
}
