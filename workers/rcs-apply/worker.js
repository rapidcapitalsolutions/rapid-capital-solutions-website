/**
 * Rapid Capital Solutions — apply + e-sign Worker
 * Route: rapidcapitalsolutions.com/api/*
 *
 * Secrets:
 *   RESEND_API_KEY     — required for email (https://resend.com)
 *   NOTIFY_EMAIL       — default submissions@rapidcapitalsolutions.com
 *   FROM_EMAIL         — verified sender e.g. applications@rapidcapitalsolutions.com
 *   SIGN_BASE_URL      — https://rapidcapitalsolutions.com
 *
 * Bindings:
 *   RCS_APPS (KV)
 */

const CORS = {
  'Access-Control-Allow-Origin': 'https://rapidcapitalsolutions.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const DISCLOSURES = [
  'Electronic Signature Consent — I agree to sign this funding application electronically and that my electronic signature is the legal equivalent of my handwritten signature.',
  'Accuracy — I certify that the information provided is true and complete to the best of my knowledge.',
  'Credit Authorization — I authorize Rapid Capital Solutions and its funding partners to obtain consumer and/or commercial credit reports in connection with this application (soft pull where applicable).',
  'Communication — I consent to be contacted by phone, email, and text regarding this inquiry. Message and data rates may apply.',
];

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return json({ ok: true });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    try {
      if (request.method === 'GET' && path === '/api/health') {
        return json({
          ok: true,
          service: 'rcs-apply',
          email_configured: Boolean(env.RESEND_API_KEY),
        });
      }

      if (request.method === 'POST' && path === '/api/apply') {
        return await handleApply(request, env);
      }

      if (request.method === 'GET' && path.startsWith('/api/sign/')) {
        const token = path.split('/').pop();
        return await handleGetSign(token, env);
      }

      if (request.method === 'POST' && path.startsWith('/api/sign/')) {
        const token = path.split('/').pop();
        return await handlePostSign(request, token, env);
      }

      return text('Not found', 404);
    } catch (err) {
      return json({ ok: false, error: err.message || 'server_error' }, 500);
    }
  },
};

async function handleApply(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const fields = body.fields || {};
  if (!fields.consent || !fields.owner_email || !fields.legal_name) {
    return json({ ok: false, error: 'missing_required_fields' }, 400);
  }

  const applicationId = fields.application_id || ('RCS-' + crypto.randomUUID().slice(0, 8).toUpperCase());
  const token = crypto.randomUUID().replace(/-/g, '');
  const now = new Date().toISOString();
  const ip = request.headers.get('cf-connecting-ip') || '';
  const ua = request.headers.get('user-agent') || '';

  const record = {
    application_id: applicationId,
    token,
    status: 'pending_signature',
    fields: { ...fields, application_id: applicationId },
    created_at: now,
    apply_ip: ip,
    apply_ua: ua,
    signature: null,
  };

  await env.RCS_APPS.put('app:' + token, JSON.stringify(record), {
    expirationTtl: 60 * 60 * 24 * 30,
  });
  await env.RCS_APPS.put('id:' + applicationId, token, {
    expirationTtl: 60 * 60 * 24 * 30,
  });

  const signBase = (env.SIGN_BASE_URL || 'https://rapidcapitalsolutions.com').replace(/\/$/, '');
  const signUrl = signBase + '/sign.html?t=' + token;

  await sendEmail(env, {
    to: env.NOTIFY_EMAIL || 'submissions@rapidcapitalsolutions.com',
    subject: `[RCS] New application pending signature — ${fields.legal_name} [${applicationId}]`,
    html: pendingEmailHtml(record, signUrl),
    text: pendingEmailText(record, signUrl),
  });

  return json({
    ok: true,
    application_id: applicationId,
    sign_url: signUrl,
    message: 'Application received. Continue to electronic signature.',
  });
}

async function handleGetSign(token, env) {
  if (!token || token.length < 16) return json({ ok: false, error: 'invalid_token' }, 400);
  const raw = await env.RCS_APPS.get('app:' + token);
  if (!raw) return json({ ok: false, error: 'not_found' }, 404);
  const record = JSON.parse(raw);

  if (record.status === 'signed') {
    return json({
      ok: true,
      status: 'signed',
      application_id: record.application_id,
      signed_at: record.signature && record.signature.signed_at,
    });
  }

  const f = record.fields || {};
  return json({
    ok: true,
    status: 'pending_signature',
    application_id: record.application_id,
    disclosures: DISCLOSURES,
    preview: {
      business_name: f.legal_name || '',
      dba: f.dba || '',
      business_type: f.business_type || '',
      industry: f.industry || '',
      address: [f.street, f.city, f.state, f.zip].filter(Boolean).join(', '),
      ein: f.ein ? maskEin(f.ein) : '',
      owner_name: f.owner_name || '',
      owner_email: f.owner_email || '',
      owner_phone: f.owner_phone || '',
      ownership: f.owner_ownership || '',
      funding_requested: f.funding_requested || '',
      annual_revenue: f.annual_revenue || '',
      purpose: f.purpose_of_funds || '',
      fico_score: f.fico_score || '',
      date_started: f.date_started || '',
    },
  });
}

async function handlePostSign(request, token, env) {
  if (!token || token.length < 16) return json({ ok: false, error: 'invalid_token' }, 400);
  const raw = await env.RCS_APPS.get('app:' + token);
  if (!raw) return json({ ok: false, error: 'not_found' }, 404);
  const record = JSON.parse(raw);

  if (record.status === 'signed') {
    return json({ ok: true, status: 'already_signed', application_id: record.application_id });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const typedName = String(body.typed_name || '').trim();
  const signatureDataUrl = String(body.signature_data_url || '');
  const consents = body.consents || {};

  if (!typedName || typedName.length < 2) {
    return json({ ok: false, error: 'typed_name_required' }, 400);
  }
  if (!signatureDataUrl.startsWith('data:image/png;base64,')) {
    return json({ ok: false, error: 'signature_required' }, 400);
  }
  if (!consents.electronic || !consents.accuracy || !consents.credit || !consents.communication) {
    return json({ ok: false, error: 'all_consents_required' }, 400);
  }

  const now = new Date().toISOString();
  const ip = request.headers.get('cf-connecting-ip') || '';
  const ua = request.headers.get('user-agent') || '';
  const payloadHash = await sha256Hex(JSON.stringify(record.fields));

  record.status = 'signed';
  record.signature = {
    typed_name: typedName,
    signature_data_url: signatureDataUrl,
    signed_at: now,
    ip,
    user_agent: ua,
    document_hash: payloadHash,
    disclosures: DISCLOSURES,
    consents,
  };

  await env.RCS_APPS.put('app:' + token, JSON.stringify(record), {
    expirationTtl: 60 * 60 * 24 * 365,
  });

  const notify = env.NOTIFY_EMAIL || 'submissions@rapidcapitalsolutions.com';
  const applicant = record.fields.owner_email;

  const sigB64 = signatureDataUrl.replace(/^data:image\/png;base64,/, '');
  const certificateHtml = certificateHtmlDoc(record);

  await sendEmail(env, {
    to: notify,
    subject: `[RCS] SIGNED application — ${record.fields.legal_name} [${record.application_id}]`,
    html: signedEmailHtml(record),
    text: signedEmailText(record),
    attachments: [
      {
        filename: `${record.application_id}-signature.png`,
        content: sigB64,
      },
      {
        filename: `${record.application_id}-certificate.html`,
        content: btoa(unescape(encodeURIComponent(certificateHtml))),
      },
    ],
  });

  if (applicant) {
    await sendEmail(env, {
      to: applicant,
      subject: `Application received — Rapid Capital Solutions [${record.application_id}]`,
      html: applicantConfirmHtml(record),
      text: `Thank you. We received your signed application ${record.application_id}. A funding specialist will contact you shortly.`,
    });
  }

  return json({
    ok: true,
    status: 'signed',
    application_id: record.application_id,
    signed_at: now,
  });
}

async function sendEmail(env, { to, subject, html, text, attachments }) {
  if (!env.RESEND_API_KEY) {
    console.log('EMAIL_SKIPPED (no RESEND_API_KEY)', { to, subject });
    return { skipped: true };
  }
  const from = env.FROM_EMAIL || 'Rapid Capital Solutions <onboarding@resend.dev>';
  const payload = {
    from,
    to: [to],
    subject,
    html,
    text: text || '',
  };
  if (attachments && attachments.length) {
    payload.attachments = attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
    }));
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + env.RESEND_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.log('RESEND_ERROR', res.status, errText);
    throw new Error('email_send_failed');
  }
  return { ok: true };
}

function pendingEmailHtml(record, signUrl) {
  const f = record.fields;
  return `
    <h2>New RCS application (awaiting e-sign)</h2>
    <p><strong>ID:</strong> ${esc(record.application_id)}</p>
    <p><strong>Business:</strong> ${esc(f.legal_name)}</p>
    <p><strong>Owner:</strong> ${esc(f.owner_name)} &lt;${esc(f.owner_email)}&gt;</p>
    <p><strong>Phone:</strong> ${esc(f.owner_phone)}</p>
    <p><strong>Amount:</strong> ${esc(f.funding_requested)}</p>
    <p><strong>Sign link:</strong> <a href="${esc(signUrl)}">${esc(signUrl)}</a></p>
    <hr>
    <pre style="font-family:monospace;white-space:pre-wrap">${esc(formatFields(f))}</pre>
  `;
}

function pendingEmailText(record, signUrl) {
  return `New RCS application ${record.application_id}\nSign: ${signUrl}\n\n${formatFields(record.fields)}`;
}

function signedEmailHtml(record) {
  const f = record.fields;
  const s = record.signature;
  return `
    <h2>SIGNED — Rapid Capital Solutions application</h2>
    <p><strong>ID:</strong> ${esc(record.application_id)}</p>
    <p><strong>Signed at:</strong> ${esc(s.signed_at)}</p>
    <p><strong>Signer:</strong> ${esc(s.typed_name)}</p>
    <p><strong>IP:</strong> ${esc(s.ip)}</p>
    <p><strong>Document hash:</strong> ${esc(s.document_hash)}</p>
    <p><img src="${esc(s.signature_data_url)}" alt="Signature" style="max-width:320px;border:1px solid #ddd;background:#fff;padding:8px" /></p>
    <hr>
    <h3>Application details</h3>
    <pre style="font-family:monospace;white-space:pre-wrap">${esc(formatFields(f))}</pre>
  `;
}

function signedEmailText(record) {
  const s = record.signature;
  return `SIGNED ${record.application_id}\nSigner: ${s.typed_name}\nAt: ${s.signed_at}\nIP: ${s.ip}\nHash: ${s.document_hash}\n\n${formatFields(record.fields)}`;
}

function applicantConfirmHtml(record) {
  return `
    <p>Hi ${esc((record.fields.owner_name || '').split(' ')[0] || 'there')},</p>
    <p>We received your signed funding application <strong>${esc(record.application_id)}</strong> for <strong>${esc(record.fields.legal_name)}</strong>.</p>
    <p>A Rapid Capital Solutions specialist will review your file and contact you shortly — usually within one business day.</p>
    <p>Questions? Email <a href="mailto:info@rapidcapitalsolutions.com">info@rapidcapitalsolutions.com</a>.</p>
    <p>— Rapid Capital Solutions</p>
  `;
}

function certificateHtmlDoc(record) {
  const f = record.fields;
  const s = record.signature;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Certificate ${esc(record.application_id)}</title>
  <style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;color:#0c1222;line-height:1.5}
  h1{font-size:1.6rem} .meta{color:#555;font-size:.95rem} img{max-width:280px;border:1px solid #ccc;padding:8px;background:#fff}
  table{width:100%;border-collapse:collapse;margin:1rem 0} td,th{border:1px solid #ddd;padding:8px;text-align:left;font-size:.9rem}</style></head><body>
  <h1>Certificate of Electronic Signature</h1>
  <p class="meta">Rapid Capital Solutions — Electronic Funding Application</p>
  <table>
    <tr><th>Application ID</th><td>${esc(record.application_id)}</td></tr>
    <tr><th>Business</th><td>${esc(f.legal_name)}</td></tr>
    <tr><th>Signer name</th><td>${esc(s.typed_name)}</td></tr>
    <tr><th>Signer email</th><td>${esc(f.owner_email)}</td></tr>
    <tr><th>Signed at (UTC)</th><td>${esc(s.signed_at)}</td></tr>
    <tr><th>IP address</th><td>${esc(s.ip)}</td></tr>
    <tr><th>Document SHA-256</th><td style="word-break:break-all">${esc(s.document_hash)}</td></tr>
  </table>
  <h2>Signature</h2>
  <img src="${esc(s.signature_data_url)}" alt="Signature" />
  <h2>Disclosures acknowledged</h2>
  <ol>${(s.disclosures || []).map((d) => `<li>${esc(d)}</li>`).join('')}</ol>
  <p class="meta">This certificate was generated by Rapid Capital Solutions electronic signature system.</p>
  </body></html>`;
}

function formatFields(f) {
  const rows = [
    ['Business', f.legal_name],
    ['DBA', f.dba],
    ['Type', f.business_type],
    ['Industry', f.industry],
    ['EIN', f.ein],
    ['Address', [f.street, f.city, f.state, f.zip].filter(Boolean).join(', ')],
    ['Start date', f.date_started],
    ['Owner', f.owner_name],
    ['Owner email', f.owner_email],
    ['Owner phone', f.owner_phone],
    ['Ownership %', f.owner_ownership],
    ['FICO', f.fico_score],
    ['Funding requested', f.funding_requested],
    ['Annual revenue', f.annual_revenue],
    ['Purpose', f.purpose_of_funds],
    ['Application ID', f.application_id],
    ['Source', f.source],
  ];
  return rows.filter((r) => r[1]).map((r) => r[0] + ': ' + r[1]).join('\n');
}

function maskEin(ein) {
  const d = String(ein).replace(/\D/g, '');
  if (d.length < 4) return '***';
  return '**-***' + d.slice(-4);
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sha256Hex(str) {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function text(msg, status = 200) {
  return new Response(msg, { status, headers: CORS });
}
