/**
 * Rapid Capital Solutions — apply form handler.
 * Posts to Cloudflare Worker, then redirects to RCS e-sign.
 */
(function () {
  'use strict';

  const cfg = window.RCS_CONFIG || {};
  const form = document.getElementById('rcs-apply-form');
  const statusEl = document.getElementById('apply-status');
  if (!form || !window.RCSApplication) return;

  const MAX_FILES = 8;
  const MAX_FILE_BYTES = 4 * 1024 * 1024;
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
  function syncAdvance() {
    const yes = form.querySelector('input[name="has_current_advance"][value="Yes"]');
    if (!advanceDetails) return;
    advanceDetails.hidden = !(yes && yes.checked);
  }
  form.querySelectorAll('input[name="has_current_advance"]').forEach((el) => {
    el.addEventListener('change', syncAdvance);
  });
  syncAdvance();

  const liensWrap = document.getElementById('liens_detail_wrap');
  function syncLiens() {
    const yes = form.querySelector('input[name="has_liens"][value="Yes"]');
    if (!liensWrap) return;
    liensWrap.hidden = !(yes && yes.checked);
  }
  form.querySelectorAll('input[name="has_liens"]').forEach((el) => {
    el.addEventListener('change', syncLiens);
  });
  syncLiens();

  const fileInput = document.getElementById('statement_files');
  const fileListEl = document.getElementById('statement-file-list');
  const stmtsUploaded = document.getElementById('stmts_uploaded');

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
      return;
    }
    fileListEl.hidden = false;
    fileListEl.innerHTML = files
      .map((f) => `<li><span>${escapeHtml(f.name)}</span><span>${formatSize(f.size)}</span></li>`)
      .join('');
    if (stmtsUploaded && files.length) stmtsUploaded.checked = true;
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
    if (!files.length) return [];
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
      return;
    }

    const data = new FormData(form);
    const fields = window.RCSApplication.fieldsFromFormData(data);
    fields.application_id = window.RCSApplication.newApplicationId();

    const btn = form.querySelector('[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Submitting…';
    }
    setStatus('Preparing your application…', 'info');

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
      if (documents.length) {
        fields.statement_files_count = String(documents.length);
        fields.submit_bank_stmts = fields.submit_bank_stmts || 'Uploaded with app';
        setStatus('Uploading ' + documents.length + ' statement file(s)…', 'info');
      } else {
        setStatus('Submitting your application…', 'info');
      }

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
      setStatus((err.message || 'Could not submit online') + '. Using email fallback…', 'error');
      setTimeout(() => mailtoFallback(fields), 1200);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Continue to E-Sign';
      }
    }
  });
})();
