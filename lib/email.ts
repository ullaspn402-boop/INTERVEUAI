/**
 * Email Service — Server-only
 *
 * Handles sending transactional emails (Password Reset, Email Verification)
 * via Resend API (or console logging when RESEND_API_KEY is unset in dev).
 *
 * Never exposes credentials to browser code.
 */

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.EMAIL_FROM || 'noreply@intervue.ai'

  if (!apiKey) {
    console.log('\n=================== EMAIL (DEV MODE) ===================')
    console.log(`To: ${to}`)
    console.log(`From: ${fromEmail}`)
    console.log(`Subject: ${subject}`)
    console.log(`Text Body:\n${text || html.replace(/<[^>]+>/g, '')}`)
    console.log('========================================================\n')
    return { success: true, id: 'dev-mode-simulated' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
        text,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[Email Service] Resend API error:', data)
      return { success: false, error: data.message || 'Failed to send email' }
    }

    return { success: true, id: data.id }
  } catch (err) {
    console.error('[Email Service] Failed to deliver email:', err)
    return { success: false, error: 'Failed to deliver email' }
  }
}

/**
 * Get the application public base URL.
 * Uses NEXT_PUBLIC_APP_URL, or request header fallback if supplied.
 */
export function getAppBaseUrl(reqUrl?: string): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  if (reqUrl) {
    try {
      const url = new URL(reqUrl)
      return url.origin
    } catch {}
  }
  return 'http://localhost:3000'
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordResetEmail(to: string, rawToken: string, requestUrl?: string): Promise<boolean> {
  const baseUrl = getAppBaseUrl(requestUrl)
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`

  const subject = 'Reset your INTERVUE AI password'
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111827;">
      <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Password Reset Request</h2>
      <p style="font-size: 14px; line-height: 24px; color: #374151; margin-bottom: 24px;">
        We received a request to reset the password for your INTERVUE AI account (${to}). Click the button below to set a new password:
      </p>
      <div style="margin-bottom: 24px;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 13px; line-height: 20px; color: #6b7280; margin-bottom: 16px;">
        Or copy and paste this link into your browser:<br />
        <a href="${resetUrl}" style="color: #2563eb; text-break: break-all;">${resetUrl}</a>
      </p>
      <p style="font-size: 12px; color: #9ca3af; border-t: 1px solid #e5e7eb; padding-top: 16px; margin-top: 24px;">
        This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  `

  const text = `Reset your INTERVUE AI password\n\nVisit this link to set a new password:\n${resetUrl}\n\nThis link will expire in 1 hour.`

  const result = await sendEmail({ to, subject, html, text })
  return result.success
}

/**
 * Send Email Verification Email
 */
export async function sendVerificationEmail(to: string, rawToken: string, requestUrl?: string): Promise<boolean> {
  const baseUrl = getAppBaseUrl(requestUrl)
  const verifyUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(rawToken)}`

  const subject = 'Verify your email address for INTERVUE AI'
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111827;">
      <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Verify Your Email Address</h2>
      <p style="font-size: 14px; line-height: 24px; color: #374151; margin-bottom: 24px;">
        Thank you for signing up for INTERVUE AI. Please confirm your email address (${to}) to verify your account:
      </p>
      <div style="margin-bottom: 24px;">
        <a href="${verifyUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          Verify Email Address
        </a>
      </div>
      <p style="font-size: 13px; line-height: 20px; color: #6b7280; margin-bottom: 16px;">
        Or copy and paste this link into your browser:<br />
        <a href="${verifyUrl}" style="color: #2563eb; text-break: break-all;">${verifyUrl}</a>
      </p>
      <p style="font-size: 12px; color: #9ca3af; border-t: 1px solid #e5e7eb; padding-top: 16px; margin-top: 24px;">
        This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.
      </p>
    </div>
  `

  const text = `Verify your email address for INTERVUE AI\n\nVisit this link to confirm your email:\n${verifyUrl}\n\nThis link will expire in 24 hours.`

  const result = await sendEmail({ to, subject, html, text })
  return result.success
}
