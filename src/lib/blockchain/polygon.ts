// Polygon Mumbai Blockchain Service
import { ethers } from 'ethers'

const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || 'https://rpc-mumbai.maticvigil.com'
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY

if (!PRIVATE_KEY) {
    console.warn('⚠️ BLOCKCHAIN_PRIVATE_KEY not found in environment variables')
}

// Provider for Polygon Mumbai testnet
const provider = new ethers.providers.JsonRpcProvider(POLYGON_RPC_URL)

// Wallet instance (only if private key exists)
let wallet: ethers.Wallet | null = null
if (PRIVATE_KEY) {
    wallet = new ethers.Wallet(PRIVATE_KEY, provider)
}

export interface StartupRegistration {
    startupName: string
    founderName: string
    guardianName: string
    timestamp: number
    userId: string
}

/**
 * Register startup on Polygon Mumbai blockchain
 * Creates a transaction with startup details in the data field
 */
export async function registerOnBlockchain(data: StartupRegistration): Promise<{
    txHash: string
    explorerUrl: string
}> {
    if (!wallet) {
        throw new Error('Blockchain wallet not configured. Add BLOCKCHAIN_PRIVATE_KEY to .env.local')
    }

    try {
        // Create transaction data
        const registrationData = JSON.stringify({
            startup: data.startupName,
            founder: data.founderName,
            guardian: data.guardianName,
            timestamp: data.timestamp,
            userId: data.userId,
        })

        // Convert to hex
        const dataHex = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes(registrationData)
        )

        // Send transaction
        const tx = await wallet.sendTransaction({
            to: wallet.address, // Send to self
            value: 0, // Zero value transaction
            data: dataHex,
            gasLimit: 100000, // Set gas limit
        })

        console.log('📡 Transaction sent:', tx.hash)
        console.log('⏳ Waiting for confirmation...')

        // Wait for confirmation
        const receipt = await tx.wait()

        const explorerUrl = `https://mumbai.polygonscan.com/tx/${tx.hash}`
        console.log('✅ Transaction confirmed:', explorerUrl)

        return {
            txHash: tx.hash,
            explorerUrl,
        }
    } catch (error: any) {
        console.error('❌ Blockchain registration error:', error)
        throw new Error(`Blockchain registration failed: ${error.message}`)
    }
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(): Promise<string> {
    if (!wallet) {
        return '0'
    }

    const balance = await wallet.getBalance()
    return ethers.utils.formatEther(balance)
}

/**
 * Get wallet address
 */
export function getWalletAddress(): string | null {
    return wallet?.address || null
}

/**
 * Generate a new wallet (for initial setup)
 * ONLY run this once and save the private key securely!
 */
export function generateWallet(): { address: string; privateKey: string } {
    const newWallet = ethers.Wallet.createRandom()
    return {
        address: newWallet.address,
        privateKey: newWallet.privateKey,
    }
}

/**
 * Verify a transaction exists on blockchain
 */
export async function verifyTransaction(txHash: string): Promise<boolean> {
    try {
        const receipt = await provider.getTransactionReceipt(txHash)
        return receipt !== null && receipt.status === 1
    } catch {
        return false
    }
}
