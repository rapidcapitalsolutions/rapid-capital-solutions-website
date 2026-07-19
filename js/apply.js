/**
 * Rapid Capital Solutions — apply form handler (website only).
 * Posts to Cloudflare Worker on your domain when configured — never CRM.
 */
(function () {
  'use strict';

  const cfg = window.RCS_CONFIG || {};
  const form = document.getElementById('rcs-apply-form');
  const statusEl = document.getElementById('apply-status');
  if (!form || !window.RCSApplication) return;

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
    setStatus('Submitting your application…', 'info');

    const workerUrl = cfg.applyWorkerUrl || '';

    if (!workerUrl) {
      setStatus('Opening email to send your application…', 'info');
      mailtoFallback(fields);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Submit Application';
      }
      return;
    }

    try {
      const res = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          fields,
          api_payload: window.RCSApplication.toManualApiPayload(fields),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        throw new Error(json.detail || json.error || 'Submission failed');
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
        btn.textContent = 'Submit Application';
      }
    }
  });
})();
