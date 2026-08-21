import { createMimeMessage, Mailbox } from "mimetext";
import { EmailMessage } from "cloudflare:email";

const FROM_ADDR = "booking@duosonus.dk";
const TO_ADDR = "duosonus.accordion@gmail.com";

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function handleBooking(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid request." }, 400);
  }

  // honeypot: bots fill every field, real visitors never see/fill this one
  if (data.company) {
    return jsonResponse({ ok: true }, 200);
  }

  const name = (data.name || "").trim();
  const email = (data.email || "").trim();
  const message = (data.message || "").trim();
  const type = (data.type || "Other").trim();
  const date = (data.date || "").trim();
  const location = (data.location || "").trim();

  if (!name || !email || !message) {
    return jsonResponse({ ok: false, error: "Missing required fields." }, 400);
  }

  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Event type: ${type}`,
    date ? `Event date: ${date}` : null,
    location ? `Location: ${location}` : null,
    "",
    message,
  ].filter((l) => l !== null);

  const msg = createMimeMessage();
  msg.setSender({ name: "Duo Sonus — Website", addr: FROM_ADDR });
  msg.setRecipient(TO_ADDR);
  msg.setSubject(`Booking Inquiry — Duo Sonus (${type})`);
  msg.setHeader("Reply-To", new Mailbox({ addr: email }));
  msg.addMessage({ contentType: "text/plain", data: lines.join("\n") });

  try {
    const email_message = new EmailMessage(FROM_ADDR, TO_ADDR, msg.asRaw());
    await env.BOOKING_EMAIL.send(email_message);
  } catch (err) {
    return jsonResponse({ ok: false, error: "Could not send message." }, 502);
  }

  return jsonResponse({ ok: true }, 200);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/api/booking") {
      return handleBooking(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
