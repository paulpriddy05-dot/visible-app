'use server'

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvite(email: string, dashboardTitle: string, shareToken: string) {
  try {
    const link = `https://usevisible.app/join/${shareToken}?email=${encodeURIComponent(email)}`;
    
    // Customize this HTML to match your brand
    const { data, error } = await resend.emails.send({
      from: 'Visible <onboarding@resend.dev>', // Change to your domain when verified
      to: [email],
      subject: `You've been invited to join ${dashboardTitle} on Visible`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You're invited!</h2>
          <p>You have been invited to collaborate on the dashboard <strong>${dashboardTitle}</strong>.</p>
          <br/>
          <a href="${link}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation
          </a>
          <br/><br/>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy this link:<br/>${link}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to send email" };
  }
}