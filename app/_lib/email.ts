import type { Booking, Cabin } from "./types";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export async function sendBookingConfirmation({
  to,
  booking,
  cabin,
}: {
  to: string;
  booking: Pick<Booking, "startDate" | "endDate" | "numNights" | "totalPrice" | "hasBreakfast">;
  cabin: Pick<Cabin, "name">;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const from = process.env.EMAIL_FROM ?? "The Wild Oasis <onboarding@resend.dev>";
  const { startDate, endDate, numNights, totalPrice, hasBreakfast } = booking;
  const name = escapeHtml(cabin.name);

  const html = `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#1a1f2e;color:#e0e0e0">
    <h1 style="color:#c69963">Booking confirmed</h1>
    <p>Thank you for booking with The Wild Oasis.</p>
    <h2 style="color:#c69963;font-size:18px">Cabin ${name}</h2>
    <table style="width:100%;color:#c0c0c0">
      <tr><td>Check-in</td><td align="right">${new Date(startDate).toDateString()}</td></tr>
      <tr><td>Check-out</td><td align="right">${new Date(endDate).toDateString()}</td></tr>
      <tr><td>Nights</td><td align="right">${numNights}</td></tr>
      <tr><td>Breakfast</td><td align="right">${hasBreakfast ? "Included" : "Not included"}</td></tr>
      <tr><td><b>Total</b></td><td align="right"><b>$${totalPrice}</b></td></tr>
    </table>
    <p style="color:#888">Payment will be collected upon arrival.</p>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: `Booking confirmed — Cabin ${cabin.name}`, html }),
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text());
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
  }
}
