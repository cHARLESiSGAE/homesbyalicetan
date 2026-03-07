/**
 * Cloudflare Pages Function: POST /api/contact
 *
 * Sends a contact-form email via Resend.
 *
 * Required env vars (Cloudflare Pages → Settings → Environment variables):
 * - RESEND_API_KEY
 * Optional:
 * - CONTACT_TO_EMAIL (default: homesbyalicetan@gmail.com)
 * - CONTACT_FROM_EMAIL (default: onboarding@resend.dev)
 */

function json(status, data, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function corsHeaders(request) {
  const origin = request.headers.get("origin");
  // Same-origin by default. If you ever host the frontend on a different domain,
  // allowlist it here.
  return origin
    ? {
        "access-control-allow-origin": origin,
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "86400",
        "vary": "origin",
      }
    : {};
}

function pick(obj, key, maxLen = 5000) {
  const v = obj?.[key];
  if (typeof v !== "string") return "";
  return v.trim().slice(0, maxLen);
}

export async function onRequest(context) {
  const { request, env } = context;
  const cors = corsHeaders(request);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...cors } });
  }

  if (request.method !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" }, cors);
  }

  if (!env.RESEND_API_KEY) {
    return json(
      500,
      { ok: false, error: "Server not configured (missing RESEND_API_KEY)" },
      cors,
    );
  }

  let body;
  const ct = request.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      body = await request.json();
    } else {
      const fd = await request.formData();
      body = Object.fromEntries(fd.entries());
    }
  } catch {
    return json(400, { ok: false, error: "Invalid request body" }, cors);
  }

  const name = pick(body, "name", 200);
  const email = pick(body, "email", 300);
  const phone = pick(body, "phone", 100);
  const intent = pick(body, "intent", 80);
  const message = pick(body, "message", 5000);

  if (!name || !email) {
    return json(400, { ok: false, error: "Name and email are required." }, cors);
  }

  const to = env.CONTACT_TO_EMAIL || "homesbyalicetan@gmail.com";
  const from = env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";

  const subject = `New website lead: ${intent || "Inquiry"} — ${name}`;
  const text = [
    "New contact form submission:\n",
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    intent ? `Intent: ${intent}` : null,
    "\nMessage:",
    message || "(no message)",
  ]
    .filter(Boolean)
    .join("\n");

  const resendResp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      reply_to: email,
      text,
    }),
  });

  if (!resendResp.ok) {
    const errText = await resendResp.text().catch(() => "");
    return json(
      502,
      {
        ok: false,
        error: "Failed to send message.",
        providerStatus: resendResp.status,
        providerBody: errText.slice(0, 2000),
      },
      cors,
    );
  }

  return json(200, { ok: true }, cors);
}
