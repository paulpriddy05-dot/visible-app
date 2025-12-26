'use server'

import { Resend } from 'resend';

export async function sendInvite(email: string, dashboardTitle: string, shareToken: string) {
  try {
    // 🟢 MOVED INSIDE: Prevents crash if key is missing
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ MISSING RESEND_API_KEY");
      return { success: false, error: "Server configuration error: Missing Email Key" };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const link = `https://usevisible.app/join/${shareToken}?email=${encodeURIComponent(email)}`;
    
    const { data, error } = await resend.emails.send({
      from: 'Visible <onboarding@resend.dev>', // Default testing domain
      to: [email], // ⚠️ SEE NOTE BELOW
      subject: `You've been invited to join ${dashboardTitle} on Visible`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You're invited!</h2>
          <p>Join <strong>${dashboardTitle}</strong> on Visible.</p>
          <a href="${link}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accept Invite</a>
          <br/><br/>
          <p style="color: #666; font-size: 12px;">Link: ${link}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    console.error("Server Action Crash:", e);
    return { success: false, error: "Failed to send email" };
  }
}