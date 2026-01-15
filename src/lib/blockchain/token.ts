import crypto from 'crypto'

/**
 * TMIT Token Generator
 * Creates soulbound (non-transferable) ownership tokens
 */

interface TokenData {
    companyName: string
    userId: string
    timestamp: number
    blockchainTxHash?: string
}

/**
 * Generate a unique TMIT Token from blockchain transaction
 * Format: TMIT-{timestamp}-{first8chars_of_txHash}
 */
export function generateTMITToken(data: TokenData): string {
    const timestamp = data.timestamp || Date.now()

    if (data.blockchainTxHash) {
        // Use blockchain transaction hash (preferred)
        const hashPart = data.blockchainTxHash.slice(2, 10).toUpperCase() // Remove '0x' and take 8 chars
        return `TMIT-${timestamp}-${hashPart}`
    } else {
        // Fallback: Create a unique hash from the data
        const hashInput = `${data.companyName}:${data.userId}:${timestamp}`
        const hash = crypto
            .createHash('sha256')
            .update(hashInput)
            .digest('hex')
            .slice(0, 8)
            .toUpperCase()

        return `TMIT-${timestamp}-${hash}`
    }
}

/**
 * Generate a verification ID for the badge system
 * Format: TMT-{shortId}
 */
export function generateVerificationId(startupId: string): string {
    return `TMT-${startupId.slice(0, 8).toUpperCase()}`
}

/**
 * Verify if a token format is valid
 */
export function isValidTokenFormat(token: string): boolean {
    const pattern = /^TMIT-\d{13}-[A-F0-9]{8}$/
    return pattern.test(token)
}

/**
 * Create a digital signature for the registration
 */
export function createRegistrationSignature(data: {
    companyName: string
    userId: string
    guardianName: string
    timestamp: number
}): string {
    const secret = process.env.TOKEN_ENCRYPTION_KEY || 'default-secret-key'

    const payload = JSON.stringify({
        c: data.companyName,
        u: data.userId,
        g: data.guardianName,
        t: data.timestamp,
    })

    return crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')
}

/**
 * Verify a registration signature
 */
export function verifyRegistrationSignature(
    data: {
        companyName: string
        userId: string
        guardianName: string
        timestamp: number
    },
    signature: string
): boolean {
    const expectedSignature = createRegistrationSignature(data)
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    )
}

/**
 * Generate a secure verification token for parent email
 */
export function generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex')
}
