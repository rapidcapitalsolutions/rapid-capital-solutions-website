/**
 * Branded Rapid Capital Solutions funding application PDF (pdf-lib).
 */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const INK = rgb(12 / 255, 18 / 255, 34 / 255);
const COPPER = rgb(184 / 255, 115 / 255, 51 / 255);
const MIST = rgb(100 / 255, 110 / 255, 125 / 255);
const LINE = rgb(220 / 255, 224 / 255, 230 / 255);
const PAPER = rgb(250 / 255, 249 / 255, 246 / 255);

function money(n) {
  const digits = String(n ?? '').replace(/[^\d.]/g, '');
  if (!digits) return '—';
  const v = parseFloat(digits);
  if (Number.isNaN(v)) return String(n);
  return '$' + Math.round(v).toLocaleString('en-US');
}

function maskSsn(ssn) {
  const d = String(ssn || '').replace(/\D/g, '');
  if (d.length < 4) return '***-**-****';
  return '***-**-' + d.slice(-4);
}

function uint8ToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * @param {object} record — KV application record with fields + signature
 * @returns {Promise<{ filename: string, content: string }>} base64 PDF for Resend
 */
export async function buildApplicationPdf(record) {
  const f = record.fields || {};
  const s = record.signature || {};
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageW = 612;
  const pageH = 792;
  const margin = 48;
  let page = doc.addPage([pageW, pageH]);
  let y = pageH - margin;

  function newPage() {
    page = doc.addPage([pageW, pageH]);
    y = pageH - margin;
    drawFooter();
  }

  function ensure(space) {
    if (y - space < 56) newPage();
  }

  function drawFooter() {
    page.drawText('Rapid Capital Solutions  ·  Confidential funding application', {
      x: margin,
      y: 28,
      size: 8,
      font,
      color: MIST,
    });
    page.drawText(String(record.application_id || ''), {
      x: pageW - margin - 90,
      y: 28,
      size: 8,
      font,
      color: MIST,
    });
  }

  function headerBanner() {
    page.drawRectangle({
      x: 0,
      y: pageH - 78,
      width: pageW,
      height: 78,
      color: INK,
    });
    page.drawRectangle({
      x: 0,
      y: pageH - 82,
      width: pageW,
      height: 4,
      color: COPPER,
    });
    page.drawText('RAPID CAPITAL SOLUTIONS', {
      x: margin,
      y: pageH - 36,
      size: 16,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page.drawText('Business Funding Application', {
      x: margin,
      y: pageH - 54,
      size: 11,
      font,
      color: COPPER,
    });
    page.drawText(String(record.application_id || ''), {
      x: pageW - margin - 110,
      y: pageH - 40,
      size: 10,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    y = pageH - 100;
  }

  function section(title) {
    ensure(36);
    y -= 8;
    page.drawText(title.toUpperCase(), {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: COPPER,
    });
    y -= 6;
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageW - margin, y },
      thickness: 1,
      color: LINE,
    });
    y -= 16;
  }

  function row(label, value, opts = {}) {
    const val = value == null || value === '' ? '—' : String(value);
    const labelW = 168;
    const size = 9;
    const maxW = pageW - margin * 2 - labelW;
    const lines = wrap(val, maxW, size, font);
    const h = Math.max(14, lines.length * 12);
    ensure(h + 4);
    page.drawText(label, {
      x: margin,
      y: y - 2,
      size,
      font: fontBold,
      color: INK,
    });
    lines.forEach((line, i) => {
      page.drawText(line, {
        x: margin + labelW,
        y: y - 2 - i * 12,
        size,
        font,
        color: opts.muted ? MIST : INK,
        maxWidth: maxW,
      });
    });
    y -= h + 2;
  }

  function wrap(text, maxWidth, size, fnt) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (fnt.widthOfTextAtSize(test, size) > maxWidth && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : ['—'];
  }

  headerBanner();
  drawFooter();

  page.drawText(
    'Signed electronically' + (s.signed_at ? ' · ' + s.signed_at : ''),
    {
      x: margin,
      y,
      size: 9,
      font,
      color: MIST,
    }
  );
  y -= 22;

  section('Business information');
  row('Legal name', f.legal_name);
  row('DBA', f.dba);
  row('Website', f.website);
  row('Business phone', f.business_phone);
  row('Entity type', f.business_type);
  row('EIN', f.ein);
  row('Industry', f.industry);
  row('Start date', f.date_started);
  row('State of org.', f.state_of_organization || f.state);
  row('Address', [f.street, f.city, f.state, f.zip].filter(Boolean).join(', '));

  section('Primary owner');
  row('Name', f.owner_name);
  row('Email', f.owner_email);
  row('Cell phone', f.owner_phone);
  row('Date of birth', f.owner_dob);
  row('SSN', f.owner_ssn || '');
  row('Driver license', f.owner_dl);
  row('Ownership %', f.owner_ownership);
  row('Credit score', f.fico_score);
  row('Home address', [f.owner_address, f.owner_city, f.owner_state, f.owner_zip].filter(Boolean).join(', '));

  if (f.owner2_name) {
    section('Second owner');
    row('Name', f.owner2_name);
    row('Email', f.owner2_email);
    row('Phone', f.owner2_phone);
    row('Ownership %', f.owner2_ownership);
    row('SSN', f.owner2_ssn || '');
  }

  section('Funding request');
  row('Amount requested', money(f.funding_requested));
  row('Annual revenue', money(f.annual_revenue));
  row('Avg bank balance', money(f.avg_bank_balance));
  row('Monthly CC volume', f.monthly_cc_volume ? money(f.monthly_cc_volume) : '—');
  row('Use of funds', f.purpose_of_funds);
  row('Judgments / liens', f.has_liens);
  if (f.liens_detail) row('Liens detail', f.liens_detail);
  row('ERC grant applied', f.erc_grant);
  row('Bank statements', f.submit_bank_stmts);
  row('CC statements', f.submit_cc_stmts);
  row('Uploaded files', f.statement_file_names || f.statement_files_count);
  row('Current advance', f.has_current_advance);
  if (String(f.has_current_advance).toLowerCase() === 'yes') {
    row('Advance balance', money(f.current_advance_balance));
    row('Daily payment', money(f.current_advance_daily));
    row('Held with', f.current_advance_holder);
    row('Advance date', f.current_advance_date);
  }

  section('Electronic signature');
  row('Signer name', s.typed_name);
  row('Signed at (UTC)', s.signed_at);
  row('IP address', s.ip);
  row('Document SHA-256', s.document_hash, { muted: true });

  if (s.signature_data_url && s.signature_data_url.startsWith('data:image/png;base64,')) {
    try {
      const b64 = s.signature_data_url.replace(/^data:image\/png;base64,/, '');
      const pngBytes = decodeBase64(b64);
      const png = await doc.embedPng(pngBytes);

      // Fixed signature box so drawn pads and small test images both read clearly
      const boxW = 300;
      const boxH = 110;
      const pad = 10;
      const fit = Math.min((boxW - pad * 2) / png.width, (boxH - pad * 2) / png.height);
      const w = Math.max(1, png.width * fit);
      const h = Math.max(1, png.height * fit);
      const imgX = margin + pad + (boxW - pad * 2 - w) / 2;
      const imgY = y - 8 - boxH + pad + (boxH - pad * 2 - h) / 2;

      ensure(boxH + 36);
      page.drawText('Signature', {
        x: margin,
        y,
        size: 9,
        font: fontBold,
        color: INK,
      });
      y -= 8;
      page.drawRectangle({
        x: margin,
        y: y - boxH,
        width: boxW,
        height: boxH,
        color: rgb(1, 1, 1),
        borderColor: COPPER,
        borderWidth: 1.25,
      });
      page.drawImage(png, {
        x: imgX,
        y: imgY,
        width: w,
        height: h,
      });
      y -= boxH + 20;
    } catch (err) {
      console.log('PDF_SIGNATURE_EMBED_FAILED', err && err.message ? err.message : err);
      row('Signature', '(image could not be embedded — see PNG attachment)');
    }
  }

  ensure(48);
  y -= 8;
  page.drawText(
    'This document was generated by Rapid Capital Solutions. The electronic signature is the legal equivalent of a handwritten signature under the ESIGN Act.',
    {
      x: margin,
      y,
      size: 8,
      font,
      color: MIST,
      maxWidth: pageW - margin * 2,
      lineHeight: 11,
    }
  );

  const pdfBytes = await doc.save();
  return {
    filename: `${record.application_id || 'RCS'}-funding-application.pdf`,
    content: uint8ToBase64(pdfBytes),
  };
}

function decodeBase64(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export { maskSsn, money };
