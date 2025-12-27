'use server'

import { Resend } from 'resend';

// 🟢 ADDED: 'role' parameter with a default value of 'view'
export async function sendInvite(email: string, dashboardTitle: string, shareToken: string, role: string = 'view') {
    try {
        // 🟢 MOVED INSIDE: Prevents crash if key is missing
        if (!process.env.RESEND_API_KEY) {
            console.error("❌ MISSING RESEND_API_KEY");
            return { success: false, error: "Server configuration error: Missing Email Key" };
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const link = `https://usevisible.app/join/${shareToken}?email=${encodeURIComponent(email)}`;

        // Determine the display role text
        const roleText = role === 'edit' ? 'Editor' : 'Viewer';

        const { data, error } = await resend.emails.send({
            from: 'Visible <support@usevisible.app>', // Kept original sender
            to: [email],
            subject: `You've been invited to join ${dashboardTitle} on Visible`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You're invited!</h2>
          <p>Join <strong>${dashboardTitle}</strong> on Visible as a <strong>${roleText}</strong>.</p>
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