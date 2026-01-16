import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import PDFDocument from 'pdfkit'

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const supabase = await createClient()

        // Fetch user data
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Fetch startup data
        const { data: startup, error: startupError } = await supabase
            .from('startups')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (startupError || !startup) {
            return NextResponse.json({ error: 'Startup not found' }, { status: 404 })
        }

        // Generate PDF
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        })

        const chunks: Buffer[] = []

        doc.on('data', (chunk) => chunks.push(chunk))

        const pdfPromise = new Promise<Buffer>((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)))
        })

        // Header
        doc.rect(0, 0, 595, 120).fill('#0B2545')

        doc.fontSize(24)
            .fillColor('#FFFFFF')
            .text('CERTIFICATE OF DIGITAL STARTUP REGISTRATION', 50, 40, { align: 'center' })

        doc.fontSize(10)
            .fillColor('#8DA9C4')
            .text('Pursuant to the TiMint Digital Startup Protocol (2026)', 50, 75, { align: 'center' })

        doc.moveDown(4)

        // Main Content
        doc.fillColor('#0B2545')
            .fontSize(12)
            .text('THIS IS TO CERTIFY THAT', { align: 'center' })

        doc.moveDown(0.5)

        doc.fontSize(18)
            .fillColor('#134074')
            .text(startup.company_name, { align: 'center' })

        doc.moveDown(0.5)

        doc.fontSize(11)
            .fillColor('#475569')
            .text(`has been duly recorded and registered within the TiMint Finance Digital Registry on ${new Date(startup.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}, following successful guardian verification and compliance review.`, { align: 'center' })

        doc.moveDown(2)

        // Founder Details Section
        doc.fontSize(14)
            .fillColor('#0B2545')
            .text('FOUNDER DETAILS')

        doc.moveDown(0.5)
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E2E8F0')
        doc.moveDown(0.5)

        const addDetailRow = (label: string, value: string) => {
            doc.fontSize(10)
                .fillColor('#64748B')
                .text(label + ':', 50, doc.y, { continued: true, width: 150 })
            doc.fillColor('#0F172A')
                .text(' ' + value)
            doc.moveDown(0.3)
        }

        addDetailRow('Founder Name', user.name)
        addDetailRow('Guardian (Parent)', user.parent_name)
        addDetailRow('Residential Address', user.address)
        addDetailRow('Phone Number', user.phone)

        doc.moveDown(1.5)

        // Guardian & KYC Section
        doc.fontSize(14)
            .fillColor('#0B2545')
            .text('GUARDIAN & KYC STATUS')

        doc.moveDown(0.5)
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E2E8F0')
        doc.moveDown(0.5)

        addDetailRow('Guardian Approval', user.parent_verified ? '✓ Approved' : 'Pending')
        addDetailRow('KYC Status', user.kyc_status === 'verified' ? '✓ Verified' : user.kyc_status)
        addDetailRow('Verification Authority', 'TiMint Finance Approved KYC Partner')

        doc.moveDown(1.5)

        // Ownership Declaration
        doc.fontSize(14)
            .fillColor('#0B2545')
            .text('OWNERSHIP & CONTROL DECLARATION')

        doc.moveDown(0.5)
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E2E8F0')
        doc.moveDown(0.5)

        doc.fontSize(10)
            .fillColor('#475569')
            .text(`This registration confirms that ${user.name} is recognized as the Founder and Digital Owner of the startup name ${startup.company_name} within the TiMint ecosystem.`, { align: 'justify' })

        doc.moveDown(0.5)

        doc.text('As the Founder is currently a minor, all legal guardianship responsibilities and compliance obligations remain with the verified guardian until the Founder reaches the age of 18 years.', { align: 'justify' })

        doc.moveDown(0.5)

        doc.text('Upon attainment of legal adulthood:', { align: 'left' })
        doc.text('• Full operational and ownership control transfers to the Founder', 70)
        doc.text('• Guardian authority over the startup automatically expires', 70)
        doc.text('• No additional registration or payment shall be required', 70)

        doc.moveDown(1.5)

        // Digital Ownership Record
        doc.fontSize(14)
            .fillColor('#0B2545')
            .text('DIGITAL OWNERSHIP RECORD')

        doc.moveDown(0.5)
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E2E8F0')
        doc.moveDown(0.5)

        doc.fontSize(10)
            .fillColor('#475569')
            .text(`The startup name ${startup.company_name} has been:`)

        doc.moveDown(0.3)
        doc.text('• Digitally timestamped', 70)
        doc.text('• Cryptographically recorded', 70)
        doc.text('• Assigned a non-transferable digital ownership token (TMIT Token)', 70)

        doc.moveDown(0.5)

        doc.text('This token serves as proof of first registration and name ownership within the TiMint Digital Registry.')

        doc.moveDown(1.5)

        // Registry Details
        doc.fontSize(14)
            .fillColor('#0B2545')
            .text('REGISTRY DETAILS')

        doc.moveDown(0.5)
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E2E8F0')
        doc.moveDown(0.5)

        const regId = `TMT-${startup.id.slice(0, 8).toUpperCase()}`
        const tokenId = startup.token_id || `TMIT-${Date.now()}-${startup.id.slice(0, 8)}`

        addDetailRow('TiMint Registration ID', regId)
        addDetailRow('TMIT Token', tokenId)
        addDetailRow('Date of Issue', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))

        // Legal Notice Section (new page if needed)
        if (doc.y > 650) {
            doc.addPage()
        }

        doc.moveDown(2)

        doc.rect(50, doc.y, 495, 80).fill('#FEF3C7')

        doc.fontSize(10)
            .fillColor('#92400E')
            .text('LEGAL NOTICE', 60, doc.y - 70)

        doc.moveDown(0.3)

        doc.fontSize(9)
            .fillColor('#92400E')
            .text('This certificate does not constitute government incorporation, does not replace trademarks or statutory company registration. It serves as digital proof of ownership, guardianship approval, and registry record within the TiMint ecosystem.', 60, doc.y, { width: 475, align: 'justify' })

        // Footer
        doc.moveDown(3)

        doc.fontSize(10)
            .fillColor('#0B2545')
            .text('AUTHORIZED BY', { align: 'center' })

        doc.moveDown(0.5)

        doc.fontSize(10)
            .text('Registrar – Digital Startups', { align: 'center' })
            .text('TiMint Finance', { align: 'center' })

        // Seal
        doc.circle(500, doc.y - 30, 35)
            .lineWidth(2)
            .stroke('#C9A227')

        doc.circle(500, doc.y - 30, 30)
            .lineWidth(1)
            .stroke('#C9A227')

        doc.fontSize(6)
            .fillColor('#C9A227')
            .text('OFFICIAL SEAL', 475, doc.y - 45, { width: 50, align: 'center' })
            .text('TiMint Finance', 475, doc.y + 5, { width: 50, align: 'center' })

        // Disclaimer Page
        doc.addPage()

        doc.fontSize(16)
            .fillColor('#0B2545')
            .text('LEGAL DISCLAIMER', { align: 'center' })

        doc.moveDown(2)

        doc.fontSize(11)
            .fillColor('#475569')
            .text('TiMint Finance is a private digital registry and does not represent a government authority.', { align: 'center' })

        doc.moveDown(1)

        doc.text('This document is intended solely as digital proof of startup name registration within the TiMint ecosystem.', { align: 'center' })

        doc.moveDown(2)

        doc.fontSize(10)
            .text('This registration:', { align: 'left' })

        doc.moveDown(0.5)
        doc.text('• Does NOT constitute legal business incorporation', 70)
        doc.text('• Does NOT replace trademark registration', 70)
        doc.text('• Does NOT grant exclusive commercial rights', 70)
        doc.text('• Is NOT recognized by government authorities as a legal business', 70)

        doc.moveDown(1)

        doc.text('This document serves as:', { align: 'left' })

        doc.moveDown(0.5)
        doc.text('• Proof of first registration within TiMint ecosystem', 70)
        doc.text('• Evidence of guardian approval for minor founders', 70)
        doc.text('• Timestamped blockchain record of name ownership claim', 70)
        doc.text('• Digital certificate for display purposes', 70)

        doc.moveDown(2)

        doc.fontSize(9)
            .fillColor('#94A3B8')
            .text('This document is digitally generated and valid without physical signature.', { align: 'center' })
            .text(`Generated on ${new Date().toISOString()}`, { align: 'center' })

        doc.end()

        const pdfBuffer = await pdfPromise

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="TiMint-Certificate-${startup.company_name.replace(/\s+/g, '-')}.pdf"`,
            },
        })
    } catch (error: any) {
        console.error('PDF generation error:', error)
        return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 })
    }
}
