// Email templates for TiMint Finance

interface ParentVerificationEmailData {
    parentName: string
    teenName: string
    teenAge: number
    startupName: string
    verificationUrl: string
}

/**
 * Parent verification email template
 */
export function getParentVerificationEmail(data: ParentVerificationEmailData): {
    subject: string
    html: string
    text: string
} {
    const subject = `Verify Your Teen's Startup Registration - TiMint Finance`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0D1E33; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C9A227; }
    .button { display: inline-block; background: #0D1E33; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    .highlight { color: #C9A227; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; letter-spacing: 0.2em;">TIMINT</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">Digital Startup Registry</p>
    </div>
    
    <div class="content">
      <h2 style="color: #0D1E33;">Parent Verification Required</h2>
      
      <p>Dear <strong>${data.parentName}</strong>,</p>
      
      <p>Your teen <strong>${data.teenName}</strong> (${data.teenAge} years old) has registered their startup <span class="highlight">"${data.startupName}"</span> on TiMint Finance.</p>
      
      <div class="info-box">
        <h3 style="margin-top: 0;">✅ What You Need to Do:</h3>
        <ol>
          <li><strong>Review</strong> the registration details</li>
          <li><strong>Approve or reject</strong> this registration</li>
          <li><strong>Upload</strong> identity documents for KYC verification (if approving)</li>
        </ol>
      </div>
      
      <p><strong>Required documents:</strong></p>
      <ul>
        <li>Your selfie (clear photo of your face)</li>
        <li>Aadhaar card or any government-issued ID</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="${data.verificationUrl}" class="button">Verify Registration</a>
      </div>
      
      <p style="font-size: 13px; color: #666; margin-top: 30px;">
        ⏰ This verification link expires in <strong>24 hours</strong>.<br>
        🔒 Your documents will be automatically deleted after verification is complete.
      </p>
      
      <p style="font-size: 13px; color: #666; margin-top: 20px;">
        If you did not authorize this registration, please reject it immediately.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>TiMint Finance</strong> - Empowering Young Entrepreneurs</p>
      <p style="color: #999;">Questions? Reply to this email for support.</p>
    </div>
  </div>
</body>
</html>
  `

    const text = `
TIMINT Finance - Parent Verification Required

Dear ${data.parentName},

Your teen ${data.teenName} (${data.teenAge} years old) has registered their startup "${data.startupName}" on TiMint Finance.

What You Need to Do:
1. Review the registration details
2. Approve or reject this registration
3. Upload identity documents for KYC verification (if approving)

Required documents:
- Your selfie (clear photo of your face)
- Aadhaar card or any government-issued ID

Verify Registration: ${data.verificationUrl}

⏰ This verification link expires in 24 hours.
🔒 Your documents will be automatically deleted after verification is complete.

If you did not authorize this registration, please reject it immediately.

- TiMint Finance Team
  `

    return { subject, html, text }
}

/**
 * KYC approval notification email
 */
export function getKYCApprovedEmail(data: {
    teenName: string
    startupName: string
    dashboardUrl: string
}): { subject: string; html: string; text: string } {
    const subject = `✅ Your Startup is Verified - TiMint Finance`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .success { background: #059669; color: white; padding: 30px; text-align: center; border-radius: 8px; }
    .content { padding: 30px; }
    .button { display: inline-block; background: #0D1E33; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="success">
      <h1 style="margin: 0;">✅ Congratulations!</h1>
      <p style="margin: 10px 0 0;">Your startup has been verified</p>
    </div>
    
    <div class="content">
      <p>Hi <strong>${data.teenName}</strong>,</p>
      
      <p>Great news! Your startup <strong>"${data.startupName}"</strong> has been successfully verified by TiMint Finance.</p>
      
      <p><strong>You can now:</strong></p>
      <ul>
        <li>View your TMIT Token (proof of ownership)</li>
        <li>Download your digital certificate</li>
        <li>See your blockchain timestamp</li>
        <li>Embed your verification badge</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button">View Dashboard</a>
      </div>
      
      <p style="margin-top: 30px; color: #666; font-size: 13px;">
        Your registration is now permanently timestamped on the Polygon blockchain.
      </p>
    </div>
  </div>
</body>
</html>
  `

    const text = `Congratulations! Your startup "${data.startupName}" has been verified.

View your dashboard: ${data.dashboardUrl}

You can now download your certificate and view your TMIT Token.

- TiMint Finance Team`

    return { subject, html, text }
}
