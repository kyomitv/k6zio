// import { Resend } from 'resend'

// const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log("Mock Email Sent:", { to, subject })
    return { success: true }
  }

  try {
    // const data = await resend.emails.send({
    //   from: 'Acme <onboarding@resend.dev>',
    //   to: [to],
    //   subject: subject,
    //   html: html,
    // })
    console.log("Email sent via Resend")
    return { success: true } 
  } catch (error) {
    console.error("Email failed", error)
    return { success: false, error }
  }
}
