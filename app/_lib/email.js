// Email service for booking confirmations
// Install Resend: npm install resend
// Set RESEND_API_KEY in .env

let resend = null;

function getResendClient() {
    if (!resend) {
        // Dynamic import to avoid errors if resend is not installed
        try {
            const { Resend } = require("resend");
            resend = new Resend(process.env.RESEND_API_KEY);
        } catch {
            console.warn("Resend not installed. Run: npm install resend");
            return null;
        }
    }
    return resend;
}

export async function sendBookingConfirmation({ to, booking, cabin }) {
    const client = getResendClient();
    if (!client) {
        console.warn("Email service not available — skipping confirmation email");
        return;
    }

    const { startDate, endDate, numNights, totalPrice, hasBreakfast } = booking;

    try {
        await client.emails.send({
            from: "The Wild Oasis <booking@wildoasis.com>",
            to,
            subject: `Booking Confirmed — Cabin ${cabin.name}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #1a1f2e; color: #e0e0e0;">
          <h1 style="color: #c69963; margin-bottom: 16px;">Booking Confirmed! 🏔️</h1>
          <p>Thank you for booking with The Wild Oasis.</p>

          <div style="background: #242a3b; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h2 style="color: #c69963; font-size: 18px; margin-bottom: 12px;">Cabin ${cabin.name}</h2>
            <table style="width: 100%; color: #c0c0c0;">
              <tr><td style="padding: 4px 0;">📅 Check-in:</td><td style="text-align: right;">${new Date(startDate).toLocaleDateString()}</td></tr>
              <tr><td style="padding: 4px 0;">📅 Check-out:</td><td style="text-align: right;">${new Date(endDate).toLocaleDateString()}</td></tr>
              <tr><td style="padding: 4px 0;">🌙 Nights:</td><td style="text-align: right;">${numNights}</td></tr>
              <tr><td style="padding: 4px 0;">🍳 Breakfast:</td><td style="text-align: right;">${hasBreakfast ? "Included" : "Not included"}</td></tr>
              <tr style="border-top: 1px solid #3a4055;"><td style="padding: 8px 0; font-weight: bold; color: #c69963;">💰 Total:</td><td style="text-align: right; font-weight: bold; color: #c69963;">$${totalPrice}</td></tr>
            </table>
          </div>

          <p style="color: #888;">Payment will be collected upon arrival. We look forward to welcoming you!</p>
          <p style="color: #c69963; font-weight: bold;">— The Wild Oasis Team</p>
        </div>
      `,
        });
    } catch (error) {
        console.error("Failed to send booking confirmation email:", error);
        // Don't throw — email failure shouldn't block the booking
    }
}
