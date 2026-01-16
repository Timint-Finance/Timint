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

        // Create PDF
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage([595, 842]) // A4 size

        // Embed fonts
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)

        const { width, height } = page.getSize()

        // Header background
        page.drawRectangle({
            x: 0,
            y: height - 120,
            width: width,
            height: 120,
            color: rgb(0.043, 0.145, 0.271) // #0B2545
        })

        // Title
        page.drawText('CERTIFICATE OF DIGITAL STARTUP REGISTRATION', {
            x: 50,
            y: height - 60,
            size: 20,
            font: helveticaBold,
            color: rgb(1, 1, 1),
            maxWidth: width - 100,
        })

        // Subtitle
        page.drawText('Pursuant to the TiMint Digital Startup Protocol (2026)', {
            x: 50,
            y: height - 85,
            size: 10,
            font: helvetica,
            color: rgb(0.553, 0.663, 0.769), // #8DA9C4
        })

        let yPos = height - 160

        // Main content
        page.drawText('THIS IS TO CERTIFY THAT', {
            x: width / 2 - 80,
            y: yPos,
            size: 12,
            font: helveticaBold,
            color: rgb(0.043, 0.145, 0.271),
        })

        yPos -= 30
        page.drawText(startup.company_name, {
            x: width / 2 - (startup.company_name.length * 4),
            y: yPos,
            size: 18,
            font: helveticaBold,
            color: rgb(0.075, 0.251, 0.455),
        })

        yPos -= 40
        const registrationText = `has been duly recorded and registered within the TiMint Finance Digital Registry on ${new Date(startup.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}, following successful guardian verification and compliance review.`

        // Wrap text
        const words = registrationText.split(' ')
        let line = ''
        for (const word of words) {
            const testLine = line + word + ' '
            if (testLine.length * 5 > width - 100) {
                page.drawText(line, { x: 50, y: yPos, size: 11, font: helvetica, color: rgb(0.278, 0.337, 0.412) })
                yPos -= 15
                line = word + ' '
            } else {
                line = testLine
            }
        }
        if (line) {
            page.drawText(line, { x: 50, y: yPos, size: 11, font: helvetica, color: rgb(0.278, 0.337, 0.412) })
        }

        yPos -= 40

        // Founder Details
        page.drawText('FOUNDER DETAILS', {
            x: 50,
            y: yPos,
            size: 14,
            font: helveticaBold,
            color: rgb(0.043, 0.145, 0.271),
        })

        yPos -= 5
        page.drawLine({
            start: { x: 50, y: yPos },
            end: { x: width - 50, y: yPos },
            thickness: 1,
            color: rgb(0.886, 0.910, 0.941),
        })

        yPos -= 20
        const addDetailRow = (label: string, value: string) => {
            page.drawText(`${label}:`, { x: 50, y: yPos, size: 10, font: helvetica, color: rgb(0.392, 0.455, 0.545) })
            page.drawText(value, { x: 200, y: yPos, size: 10, font: helveticaBold, color: rgb(0.059, 0.090, 0.161) })
            yPos -= 18
        }

        addDetailRow('Founder Name', user.name)
        addDetailRow('Guardian (Parent)', user.parent_name)
        addDetailRow('Residential Address', user.address)
        addDetailRow('Phone Number', user.phone)

        yPos -= 20

        // Guardian & KYC
        page.drawText('GUARDIAN & KYC STATUS', {
            x: 50,
            y: yPos,
            size: 14,
            font: helveticaBold,
            color: rgb(0.043, 0.145, 0.271),
        })

        yPos -= 5
        page.drawLine({
            start: { x: 50, y: yPos },
            end: { x: width - 50, y: yPos },
            thickness: 1,
            color: rgb(0.886, 0.910, 0.941),
        })

        yPos -= 20
        addDetailRow('Guardian Approval', user.parent_verified ? '[APPROVED]' : 'Pending')
        addDetailRow('KYC Status', user.kyc_status === 'verified' ? '[VERIFIED]' : user.kyc_status)
        addDetailRow('Verification Authority', 'TiMint Finance Approved KYC Partner')

        yPos -= 20

        // Registry Details
        page.drawText('REGISTRY DETAILS', {
            x: 50,
            y: yPos,
            size: 14,
            font: helveticaBold,
            color: rgb(0.043, 0.145, 0.271),
        })

        yPos -= 5
        page.drawLine({
            start: { x: 50, y: yPos },
            end: { x: width - 50, y: yPos },
            thickness: 1,
            color: rgb(0.886, 0.910, 0.941),
        })

        yPos -= 20
        const regId = `TMT-${startup.id.slice(0, 8).toUpperCase()}`
        const tokenId = startup.token_id || `TMIT-${Date.now()}-${startup.id.slice(0, 8)}`

        addDetailRow('TiMint Registration ID', regId)
        addDetailRow('TMIT Token', tokenId)
        addDetailRow('Date of Issue', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))

        yPos -= 30

        // Legal Notice
        page.drawRectangle({
            x: 50,
            y: yPos - 60,
            width: width - 100,
            height: 80,
            color: rgb(0.996, 0.953, 0.780), // #FEF3C7
        })

        page.drawText('LEGAL NOTICE', {
            x: 60,
            y: yPos - 20,
            size: 10,
            font: helveticaBold,
            color: rgb(0.573, 0.251, 0.055),
        })

        const noticeText = 'This certificate does not constitute government incorporation, does not replace trademarks or statutory company registration. It serves as digital proof of ownership, guardianship approval, and registry record within the TiMint ecosystem.'
        const noticeWords = noticeText.split(' ')
        let noticeLine = ''
        let noticeY = yPos - 35
        for (const word of noticeWords) {
            const testLine = noticeLine + word + ' '
            if (testLine.length * 4.5 > width - 120) {
                page.drawText(noticeLine, { x: 60, y: noticeY, size: 9, font: helvetica, color: rgb(0.573, 0.251, 0.055) })
                noticeY -= 12
                noticeLine = word + ' '
            } else {
                noticeLine = testLine
            }
        }
        if (noticeLine) {
            page.drawText(noticeLine, { x: 60, y: noticeY, size: 9, font: helvetica, color: rgb(0.573, 0.251, 0.055) })
        }

        yPos -= 120

        // Footer
        page.drawText('AUTHORIZED BY', {
            x: width / 2 - 50,
            y: yPos,
            size: 10,
            font: helveticaBold,
            color: rgb(0.043, 0.145, 0.271),
        })

        yPos -= 20
        page.drawText('Registrar – Digital Startups', {
            x: width / 2 - 70,
            y: yPos,
            size: 10,
            font: helvetica,
            color: rgb(0.043, 0.145, 0.271),
        })

        yPos -= 15
        page.drawText('TiMint Finance', {
            x: width / 2 - 40,
            y: yPos,
            size: 10,
            font: helvetica,
            color: rgb(0.043, 0.145, 0.271),
        })

        // Seal
        page.drawCircle({
            x: width - 100,
            y: yPos + 20,
            size: 35,
            borderColor: rgb(0.788, 0.635, 0.153), // #C9A227
            borderWidth: 2,
        })

        page.drawText('OFFICIAL', {
            x: width - 120,
            y: yPos + 25,
            size: 6,
            font: helveticaBold,
            color: rgb(0.788, 0.635, 0.153),
        })

        page.drawText('SEAL', {
            x: width - 112,
            y: yPos + 17,
            size: 6,
            font: helveticaBold,
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
