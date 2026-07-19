/**
 * Rapid Capital Solutions — apply form handler.
 * Posts to Cloudflare Worker, then redirects to RCS e-sign.
 * Gate: 4 months bank statements + qualify minimums required.
 */
(function () {
  'use strict';

  const cfg = window.RCS_CONFIG || {};
  const form = document.getElementById('rcs-apply-form');
  const statusEl = document.getElementById('apply-status');
  if (!form || !window.RCSApplication) return;

  const MIN_FILES = 4;
  const MAX_FILES = 8;
  const MAX_FILE_BYTES = 4 * 1024 * 1024;
  const MIN_MONTHS_IN_BUSINESS = 6;
  const ALLOWED_EXT = /\.(pdf|jpe?g|png|gif|webp|docx?|xlsx?|csv)$/i;

  // Prefill amount from homepage slider (?amount=250000)
  try {
    const params = new URLSearchParams(window.location.search);
    const amount = params.get('amount');
    const select = document.getElementById('funding_requested');
    if (amount && select) {
      const n = parseInt(amount, 10);
      const opts = Array.from(select.options);
      let best = null;
      opts.forEach((opt) => {
        const v = parseInt(opt.value, 10);
        if (!v) return;
        if (n <= v && (best == null || v < parseInt(best.value, 10))) best = opt;
      });
      if (!best) best = opts[opts.length - 1];
      if (best && best.value) select.value = best.value;
    }
  } catch (_) { /* ignore */ }

  const advanceDetails = document.getElementById('advance-details');
  const advanceFields = [
    'current_advance_balance',
    'current_advance_daily',
    'current_advance_holder',
    'current_advance_date',
  ];

  function syncAdvance() {
    const yes = form.querySelector('input[name="has_current_advance"][value="Yes"]');
    if (!advanceDetails) return;
    const show = yes && yes.checked;
    advanceDetails.hidden = !show;
    advanceFields.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.required = show;
      if (!show) el.value = '';
    });
  }
  form.querySelectorAll('input[name="has_current_advance"]').forEach((el) => {
    el.addEventListener('change', syncAdvance);
  });
  syncAdvance();

  const liensWrap = document.getElementById('liens_detail_wrap');
  function syncLiens() {
    const yes = form.querySelector('input[name="has_liens"][value="Yes"]');
    if (!liensWrap) return;
    const show = yes && yes.checked;
    liensWrap.hidden = !show;
    const detail = document.getElementById('liens_detail');
    if (detail) detail.required = show;
  }
  form.querySelectorAll('input[name="has_liens"]').forEach((el) => {
    el.addEventListener('change', syncLiens);
  });
  syncLiens();

  const fileInput = document.getElementById('statement_files');
  const fileListEl = document.getElementById('statement-file-list');
  const countHint = document.getElementById('statement-count-hint');

  function formatSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function syncFileList() {
    if (!fileInput || !fileListEl) return;
    const files = Array.from(fileInput.files || []);
    if (!files.length) {
      fileListEl.hidden = true;
      fileListEl.innerHTML = '';
    } else {
      fileListEl.hidden = false;
      fileListEl.innerHTML = files
        .map((f) => `<li><span>${escapeHtml(f.name)}</span><span>${formatSize(f.size)}</span></li>`)
        .join('');
    }
    if (countHint) {
      const n = files.length;
      const ok = n >= MIN_FILES;
      countHint.textContent = ok
        ? n + ' file(s) ready — meets 4-month requirement'
        : n + ' of ' + MIN_FILES + ' months uploaded (need ' + (MIN_FILES - n) + ' more)';
      countHint.classList.toggle('statement-count-hint--ok', ok);
      countHint.classList.toggle('statement-count-hint--bad', !ok);
    }
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  if (fileInput) {
    fileInput.addEventListener('change', syncFileList);
  }
  syncFileList();

  function monthsInBusiness(dateStr) {
    if (!dateStr) return 0;
    const start = new Date(dateStr + 'T00:00:00');
    if (Number.isNaN(start.getTime())) return 0;
    const now = new Date();
    return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  }

  function qualifyGate(fields) {
    const months = monthsInBusiness(fields.date_started);
    if (months < MIN_MONTHS_IN_BUSINESS) {
      return 'Business must be open at least 6 months to continue. Started ' + (fields.date_started || '—') + ' (' + months + ' mo).';
    }
    const rev = parseInt(String(fields.annual_revenue || '').replace(/\D/g, ''), 10) || 0;
    if (rev < 120000) {
      return 'Minimum annual gross sales for review is $120,000.';
    }
    return null;
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const comma = result.indexOf(',');
        resolve({
          filename: file.name,
          content_type: file.type || 'application/octet-stream',
          size: file.size,
          content: comma >= 0 ? result.slice(comma + 1) : result,
        });
      };
      reader.onerror = () => reject(new Error('Could not read ' + file.name));
      reader.readAsDataURL(file);
    });
  }

  async function collectDocuments() {
    const files = Array.from((fileInput && fileInput.files) || []);
    if (files.length < MIN_FILES) {
      throw new Error('Upload at least ' + MIN_FILES + ' bank statement files (last 4 months) before continuing to e-sign.');
    }
    if (files.length > MAX_FILES) {
      throw new Error('Please upload at most ' + MAX_FILES + ' statement files.');
    }
    for (const f of files) {
      if (!ALLOWED_EXT.test(f.name)) {
        throw new Error('Unsupported file type: ' + f.name);
      }
      if (f.size > MAX_FILE_BYTES) {
        throw new Error(f.name + ' is over 4 MB. Please compress or split it.');
      }
    }
    const docs = [];
    for (const f of files) {
      docs.push(await readFileAsBase64(f));
    }
    return docs;
  }

  function setStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = 'apply-status apply-status--' + (type || 'info');
    statusEl.hidden = !msg;
    if (msg) statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function mailtoFallback(fields) {
    const email = cfg.submissionsEmail || 'submissions@rapidcapitalsolutions.com';
    const subject = encodeURIComponent(
      'RCS Application — ' + (fields.legal_name || 'New') + ' [' + (fields.application_id || 'new') + ']'
    );
    const body = encodeURIComponent(window.RCSApplication.toEmailBody(fields));
    window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus('Please complete all required fields before continuing.', 'error');
      return;
    }

    const data = new FormData(form);
    const fields = window.RCSApplication.fieldsFromFormData(data);
    fields.application_id = window.RCSApplication.newApplicationId();
    fields.submit_bank_stmts = 'Uploaded with app — 4 months required';

    const qualifyErr = qualifyGate(fields);
    if (qualifyErr) {
      setStatus(qualifyErr, 'error');
      return;
    }

    const btn = form.querySelector('[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Submitting…';
    }
    setStatus('Checking statements and preparing your application…', 'info');

    const workerUrl = cfg.applyWorkerUrl || '';

    if (!workerUrl) {
      setStatus('Opening email to send your application…', 'info');
      mailtoFallback(fields);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Continue to E-Sign';
      }
      return;
    }

    try {
      const documents = await collectDocuments();
      fields.statement_files_count = String(documents.length);
      fields.statement_file_names = documents.map((d) => d.filename).join(', ');
      setStatus('Uploading ' + documents.length + ' statement file(s)…', 'info');

      const res = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          fields,
          documents,
          api_payload: window.RCSApplication.toManualApiPayload(fields),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        throw new Error(json.detail || json.error || 'Submission failed');
      }

      if (json.sign_url) {
        setStatus('Application saved — redirecting to secure signature…', 'success');
        window.location.href = json.sign_url;
        return;
      }

      form.reset();
      form.hidden = true;
      const thanks = document.getElementById('apply-thanks');
      if (thanks) thanks.hidden = false;
      setStatus('', 'success');
    } catch (err) {
      const msg = err.message || 'Could not submit';
      // Don't mailto-fallback if they simply forgot statements / qualify — that skips the gate
      if (/bank statement|4 month|qualify|6 months|120,000|Unsupported|over 4 MB|at most/i.test(msg)) {
        setStatus(msg, 'error');
      } else {
        setStatus(msg + '. Using email fallback…', 'error');
        setTimeout(() => mailtoFallback(fields), 1200);
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Continue to E-Sign';
      }
    }
  });
})();
