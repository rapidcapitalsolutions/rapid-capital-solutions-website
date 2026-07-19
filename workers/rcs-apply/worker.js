/**
 * Cloudflare Worker — Rapid Capital Solutions apply endpoint (NOT CRM).
 *
 * Deploy separately in Cloudflare dashboard:
 *   Workers & Pages → Create Worker → paste this file
 *   Route: rapidcapitalsolutions.com/api/apply*
 *
 * Secrets (Worker → Settings → Variables):
 *   RCS_APPLY_API_BASE   optional — your manual-app URL e.g. https://apply.rapidcapitalsolutions.com/
 *   RCS_APPLY_PASSWORD   optional — form password for that manual app
 *   CLIXSIGN_WEBHOOK_URL optional — POST JSON when app submitted (ClixSign integration later)
 *   NOTIFY_EMAIL         optional — submissions inbox
 */

const CORS = {
  'Access-Control-Allow-Origin': 'https://rapidcapitalsolutions.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }
    if (request.method !== 'POST' || !url.pathname.startsWith('/api/apply')) {
      return new Response('Not found', { status: 404 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: 'invalid_json' }, 400);
    }

    const fields = body.fields || {};
    const apiPayload = body.api_payload || {};
    if (!fields.consent || !fields.owner_email) {
      return json({ ok: false, error: 'consent_required' }, 400);
    }

    let pdfGenerated = false;
    const base = (env.RCS_APPLY_API_BASE || '').replace(/\/?$/, '/');
    const password = env.RCS_APPLY_PASSWORD || '';

    if (base && password) {
      try {
        const session = await fetch(base + 'manual-application.php', {
          method: 'POST',
          headers: { 'User-Agent': 'RCS-Website/1.0' },
          body: new URLSearchParams({ form_password: password }),
        });
        if (session.ok) {
          const cookie = session.headers.get('set-cookie') || '';
          const pdfRes = await fetch(base + 'api/generate-manual-pdf.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'RCS-Website/1.0',
              Cookie: cookie,
            },
            body: JSON.stringify(apiPayload),
          });
          pdfGenerated = pdfRes.ok && (await pdfRes.clone().arrayBuffer()).byteLength > 4;
        }
      } catch {
        pdfGenerated = false;
      }
    }

    if (env.CLIXSIGN_WEBHOOK_URL) {
      try {
        await fetch(env.CLIXSIGN_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'rapidcapitalsolutions.com',
            application_id: apiPayload.application_id,
            merchant_email: fields.owner_email,
            merchant_name: fields.owner_name,
            business: fields.legal_name,
            pdf_ready: pdfGenerated,
          }),
        });
      } catch {
        /* ClixSign queue optional */
      }
    }

    return json({
      ok: true,
      application_id: apiPayload.application_id,
      pdf_generated: pdfGenerated,
      message: 'Application received. Our team will contact you shortly.',
    });
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
