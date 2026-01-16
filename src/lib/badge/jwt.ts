// Badge JWT utilities for domain-locked embed codes
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.BADGE_JWT_SECRET || 'default_secret_change_in_production'

export interface BadgeTokenPayload {
    startupId: string
    domain: string
    userId: string
    iat?: number
    exp?: number
}

/**
 * Generate a domain-locked JWT token for badge embedding
 * Token valid for 1 year
 */
export function generateBadgeToken(payload: Omit<BadgeTokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '365d' } // 1 year
    )
}

/**
 * Verify badge token and extract payload
 * Returns null if invalid or expired
 */
export function verifyBadgeToken(token: string): BadgeTokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as BadgeTokenPayload
        return decoded
    } catch (error) {
        console.error('Badge token verification failed:', error)
        return null
    }
}

/**
 * Check if token is valid for a specific domain
 */
export function isTokenValidForDomain(token: string, refererUrl: string | null): { valid: boolean; error?: string } {
    const payload = verifyBadgeToken(token)

    if (!payload) {
        return { valid: false, error: 'Invalid or expired token' }
    }

    // If no referer, allow (for direct access/testing)
    if (!refererUrl) {
        return { valid: true }
    }

    try {
        const refererDomain = new URL(refererUrl).hostname
        const allowedDomain = payload.domain

        // Check if domains match (allows subdomains)
        const isMatch = refererDomain === allowedDomain ||
            refererDomain.endsWith(`.${allowedDomain}`)

        if (!isMatch) {
            return {
                valid: false,
                error: `Token only valid for ${allowedDomain}, used on ${refererDomain}`
            }
        }

        return { valid: true }
    } catch (error) {
        return { valid: false, error: 'Invalid referer URL' }
    }
}
