// IPFS Service for Blockchain Registration
// Uses Pinata for free IPFS storage

interface StartupRegistration {
    companyName: string
    ownerUserId: string
    founderName: string
    guardianName: string
    timestamp: number
    signature: string
}

interface PinataResponse {
    IpfsHash: string
    PinSize: number
    Timestamp: string
}

export async function pinToIPFS(data: StartupRegistration): Promise<string> {
    const PINATA_API_KEY = process.env.PINATA_API_KEY
    const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY

    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        throw new Error('Pinata API keys not configured')
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
        body: JSON.stringify({
            pinataContent: data,
            pinataMetadata: {
                name: `TiMint-${data.companyName}-${data.timestamp}`,
            },
        }),
    })

    if (!response.ok) {
        throw new Error('Failed to pin to IPFS')
    }

    const result: PinataResponse = await response.json()
    return result.IpfsHash
}

export async function getFromIPFS(cid: string): Promise<StartupRegistration | null> {
    try {
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`)
        if (!response.ok) return null
        return await response.json()
    } catch {
        return null
    }
}

export function generateIPFSUrl(cid: string): string {
    return `https://gateway.pinata.cloud/ipfs/${cid}`
}
