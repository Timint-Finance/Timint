import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

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

        // Get user email from auth
        const { data: authUser } = await supabase.auth.admin.getUserById(userId)
        const userEmail = authUser?.user?.email || 'N/A'

        // Create PDF
        const pdfDoc = await PDFDocument.create()

        // Embed fonts
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)

        const pageWidth = 595
        const pageHeight = 842
        const margin = 50

        // Helper function to wrap text
        const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
            const words = text.split(' ')
            const lines: string[] = []
            let currentLine = ''

            for (const word of words) {
                const testLine = currentLine + word + ' '
                const estimatedWidth = testLine.length * (fontSize * 0.5)

                if (estimatedWidth > maxWidth) {
                    if (currentLine) lines.push(currentLine.trim())
                    currentLine = word + ' '
                } else {
                    currentLine = testLine
                }
            }

            if (currentLine) lines.push(currentLine.trim())
            return lines
        }

        // ===== PAGE 1 =====
        const page1 = pdfDoc.addPage([pageWidth, pageHeight])
        let y = pageHeight - margin

        // Header Background
        page1.drawRectangle({
            x: 0,
            y: pageHeight - 120,
            width: pageWidth,
            height: 120,
            color: rgb(0.043, 0.145, 0.271) // Navy #0B2545
        })

        // Title
        page1.drawText('CERTIFICATE OF DIGITAL STARTUP', {
            x: margin + 20,
            y: pageHeight - 50,
            size: 20,
            font: helveticaBold,
            color: rgb(1, 1, 1),
        })

        page1.drawText('REGISTRATION', {
            x: margin + 150,
            y: pageHeight - 72,
            size: 20,
            font: helveticaBold,
            color: rgb(1, 1, 1),
        })

        // Subtitle
        page1.drawText('Pursuant to the TiMint Digital Startup Protocol (2026)', {
            x: margin + 40,
            y: pageHeight - 95,
            size: 10,
            font: helvetica,
            color: rgb(0.553, 0.663, 0.769),
        })

        y = pageHeight - 160

        // "THIS IS TO CERTIFY THAT"
        const certifyText = 'THIS IS TO CERTIFY THAT'
        const certifyWidth = helveticaBold.widthOfTextAtSize(certifyText, 12)
        page1.drawText(certifyText, {
            x: (pageWidth - certifyWidth) / 2,
            y: y,
            size: 12,
            font: helveticaBold,
            color: rgb(0.043, 0.145, 0.271),
        })

        y -= 30

        // Company Name (centered, large)
        const companyWidth = helveticaBold.widthOfTextAtSize(startup.company_name, 18)
        page1.drawText(startup.company_name, {
            x: (pageWidth - companyWidth) / 2,
            y: y,
            size: 18,
            font: helveticaBold,
            color: rgb(0.075, 0.251, 0.455),
        })

        y -= 35

        // Registration text
        const registrationText = `has been duly recorded and registered within the TiMint Finance Digital Registry on ${new Date(startup.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}, following successful guardian verification and compliance review.`
        const regLines = wrapText(registrationText, pageWidth - margin * 2, 11)

        for (const line of regLines) {
            const lineWidth = helvetica.widthOfTextAtSize(line, 11)
            page1.drawText(line, {
                x: (pageWidth - lineWidth) / 2,
                y: y,
                size: 11,
                font: helvetica,
                color: rgb(0.278, 0.337, 0.412),
            })
            y -= 16
        }

        y -= 20

        // FOUNDER DETAILS
        page1.drawText('FOUNDER DETAILS', {
            x: margin,
            y: y,
            size: 14,
            font: helveticaBold,
            color: rgb(0.043, 0.145, 0.271),
        })

        y -= 8
        page1.drawLine({
            start: { x: margin, y: y },
            end: { x: pageWidth - margin, y: y },
            thickness: 1,
            color: rgb(0.886, 0.910, 0.941),
        })

        y -= 20

        const addDetailRow = (label: string, value: string) => {
            page1.drawText(`${label}:`, {
                x: margin,
                y: y,
                size: 10,
                font: helvetica,
                color: rgb(0.392, 0.455, 0.545),
            })
            page1.drawText(value, {
                x: margin + 160,
                y: y,
                size: 10,
                font: helveticaBold,
                color: rgb(0.059, 0.090, 0.161),
            })
            y -= 18
        }

        addDetailRow('Founder Name', user.name)
        addDetailRow('Guardian (Parent)', user.parent_name)
        addDetailRow('Residential Address', user.address)
        addDetailRow('Email Address', userEmail)
        addDetailRow('Phone Number', user.phone)

        y -= 15

        // GUARDIAN & KYC STATUS
        page1.drawText('GUARDIAN & KYC STATUS', {
            x: margin,
            y: y,
            size: 14,
            font: helveticaBold,
            color: rgb(0.043, 0.145, 0.271),
        })

        y -= 8
        page1.drawLine({
            start: { x: margin, y: y },
            end: { x: pageWidth - margin, y: y },
            thickness: 1,
            color: rgb(0.886, 0.910, 0.941),
        })

        y -= 20

        addDetailRow('Guardian Approval', user.parent_verified ? '[APPROVED]' : 'Pending')
        addDetailRow('KYC Status', user.kyc_status === 'verified' ? '[VERIFIED]' : user.kyc_status)
        addDetailRow('Verification Authority', 'TiMint Finance Approved KYC Partner')

        y -= 15

        // OWNERSHIP & CONTROL DECLARATION
        page1.drawText('OWNERSHIP & CONTROL DECLARATION', {
            x: margin,
            y: y,
            size: 14,
            font: helveticaBold,
            color: rgb(0.043, 0.145, 0.271),
        })

        y -= 8
        page1.drawLine({
            start: { x: margin, y: y },
            end: { x: pageWidth - margin, y: y },
            thickness: 1,
            color: rgb(0.886, 0.910, 0.941),
        })

        y -= 18

        const ownershipText1 = `This registration confirms that ${user.name} is recognized as the Founder and Digital Owner of the startup name ${startup.company_name} within the TiMint ecosystem.`
        const ownership1Lines = wrapText(ownershipText1, pageWidth - margin * 2, 10)

        for (const line of ownership1Lines) {
            page1.drawText(line, {
                x: margin,
                y: y,
                size: 10,
                font: helvetica,
                color: rgb(0.278, 0.337, 0.412),
            })
            y -= 14
        }

        y -= 8

        const ownershipText2 = 'As the Founder is currently a minor, all legal guardianship responsibilities and compliance obligations remain with the verified guardian until the Founder reaches the age of 18 years.'
        const ownership2Lines = wrapText(ownershipText2, pageWidth - margin * 2, 10)

        for (const line of ownership2Lines) {
            page1.drawText(line, {
                x: margin,
                y: y,
                size: 10,
                font: helvetica,
                color: rgb(0.278, 0.337, 0.412),
            })
            y -= 14
        }

        y -= 8

        page1.drawText('Upon attainment of legal adulthood:', {
            x: margin,
            y: y,
            size: 10,
            font: helvetica,
            color: rgb(0.278, 0.337, 0.412),
        })

        y -= 16

        const bulletPoints = [
            'Full operational and ownership control must be transferred to the Founder.',
            'Guardian authority over the startup automatically expires.',
            'No additional registration or payment shall be required.'
        ]

        for (const bullet of bulletPoints) {
            page1.drawText('•', {
                x: margin + 10,
                y: y,
                size: 10,
                font: helvetica,
                color: rgb(0.278, 0.337, 0.412),
            })
            page1.drawText(bullet, {
                x: margin + 25,
                y: y,
                size: 10,
                font: helvetica,
                color: rgb(0.278, 0.337, 0.412),
            })
            y -= 14
        }

        // ===== PAGE 2 =====
        const page2 = pdfDoc.addPage([pageWidth, pageHeight])
        y = pageHeight - margin - 20

        // DIGITAL OWNERSHIP RECORD
        page2.drawText('DIGITAL OWNERSHIP RECORD', {
            x: margin,
            y: y,
            size: 14,
            font: helveticaBold,
            color: rgb(0.043, 0.145, 0.271),
        })

        y -= 8
        page2.drawLine({
            start: { x: margin, y: y },
            end: { x: pageWidth - margin, y: y },
            thickness: 1,
            color: rgb(0.886, 0.910, 0.941),
        })

        y -= 18

        page2.drawText(`The startup name ${startup.company_name} has been:`, {
            x: margin,
            y: y,
            size: 10,
            font: helvetica,
            color: rgb(0.278, 0.337, 0.412),
        })

        y -= 16

        const digitalBullets = [
            'Digitally timestamped',
            'Cryptographically recorded',
            'Assigned a non-transferable digital ownership token (TMIT Token)'
        ]

        for (const bullet of digitalBullets) {
            page2.drawText('•', {
                x: margin + 10,
                y: y,
                size: 10,
                font: helvetica,
                color: rgb(0.278, 0.337, 0.412),
            })
            page2.drawText(bullet, {
                x: margin + 25,
                y: y,
                size: 10,
                font: helvetica,
                color: rgb(0.278, 0.337, 0.412),
            })
            y -= 14
        }

        y -= 8

        page2.drawText('This token serves as proof of first registration and name ownership within the', {
            x: margin,
            y: y,
            size: 10,
            font: helvetica,
            color: rgb(0.278, 0.337, 0.412),
        })
        y -= 12
        page2.drawText('TiMint Digital Registry.', {
            x: margin,
            y: y,
            size: 10,
            font: helvetica,
            color: rgb(0.278, 0.337, 0.412),
        })

        y -= 25

        // REGISTRY DETAILS
        page2.drawText('REGISTRY DETAILS', {
            x: margin,
            y: y,
            size: 14,
            font: helveticaBold,
            color: rgb(0.043, 0.145, 0.271),
        })

        y -= 8
        page2.drawLine({
            start: { x: margin, y: y },
            end: { x: pageWidth - margin, y: y },
            thickness: 1,
            color: rgb(0.886, 0.910, 0.941),
        })

        y -= 20

        const regId = `TMT-${startup.id.slice(0, 8).toUpperCase()}`
        const tokenId = startup.token_id || `TMIT-${Date.now()}-${startup.id.slice(0, 8)}`

        const addDetailRow2 = (label: string, value: string) => {
            page2.drawText(`${label}:`, {
                x: margin,
                y: y,
                size: 10,
                font: helvetica,
                color: rgb(0.392, 0.455, 0.545),
            })
            page2.drawText(value, {
                x: margin + 160,
                y: y,
                size: 10,
                font: helveticaBold,
                color: rgb(0.059, 0.090, 0.161),
            })
            y -= 18
        }

        addDetailRow2('TiMint Registration ID', regId)
        addDetailRow2('TMIT Token', tokenId)
        addDetailRow2('Date of Issue', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))

        y -= 30

        // LEGAL NOTICE (Yellow Box)
        page2.drawRectangle({
            x: margin,
            y: y - 110,
            width: pageWidth - margin * 2,
            height: 120,
            color: rgb(0.996, 0.953, 0.780), // #FEF3C7
        })

        page2.drawText('LEGAL NOTICE', {
            x: margin + 10,
            y: y - 20,
            size: 10,
            font: helveticaBold,
            color: rgb(0.573, 0.251, 0.055),
        })

        y -= 35

        page2.drawText('This certificate:', {
            x: margin + 10,
            y: y,
            size: 9,
            font: helveticaBold,
            color: rgb(0.573, 0.251, 0.055),
        })

        y -= 14

        const legalNot = [
            '• Does not constitute government incorporation',
            '• Does not replace trademarks or statutory company registration',
            '• Serves as digital proof of ownership, guardianship approval, and registry record'
        ]

        for (const item of legalNot) {
            page2.drawText(item, {
                x: margin + 10,
                y: y,
                size: 9,
                font: helvetica,
                color: rgb(0.573, 0.251, 0.055),
            })
            y -= 12
        }

        y -= 120

        // Footer
        page2.drawText('AUTHORIZED BY', {
            x: (pageWidth / 2) - 50,
            y: y,
            size: 10,
            font: helveticaBold,
            color: rgb(0.043, 0.145, 0.271),
        })

        y -= 18

        page2.drawText('Registrar - Digital Startups', {
            x: (pageWidth / 2) - 65,
            y: y,
            size: 10,
            font: helvetica,
            color: rgb(0.043, 0.145, 0.271),
        })

        y -= 14

        page2.drawText('TiMint Finance', {
            x: (pageWidth / 2) - 35,
            y: y,
            size: 10,
            font: helvetica,
            color: rgb(0.043, 0.145, 0.271),
        })

        // Official Seal
        page2.drawCircle({
            x: pageWidth - 100,
            y: y + 10,
            size: 35,
            borderColor: rgb(0.788, 0.635, 0.153), // Gold #C9A227
            borderWidth: 2,
        })

        page2.drawCircle({
            x: pageWidth - 100,
            y: y + 10,
            size: 30,
            borderColor: rgb(0.788, 0.635, 0.153),
            borderWidth: 1,
        })

        page2.drawText('OFFICIAL', {
            x: pageWidth - 118,
            y: y + 15,
            size: 6,
            font: helveticaBold,
            color: rgb(0.788, 0.635, 0.153),
        })

        page2.drawText('SEAL', {
            x: pageWidth - 110,
            y: y + 7,
            size: 6,
            font: helveticaBold,
            color: rgb(0.788, 0.635, 0.153),
        })

        page2.drawText('TiMint Finance', {
            x: pageWidth - 122,
            y: y - 1,
            size: 5,
            font: helvetica,
            color: rgb(0.788, 0.635, 0.153),
        })

        // Generate PDF bytes
        const pdfBytes = await pdfDoc.save()

        return new NextResponse(pdfBytes, {
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
