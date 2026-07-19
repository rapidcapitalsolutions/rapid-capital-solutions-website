/**
 * RCS electronic signature — sign.html
 */
(function () {
  'use strict';

  const cfg = window.RCS_CONFIG || {};
  const apiBase = (cfg.applyWorkerUrl || '').replace(/\/api\/apply\/?$/, '') || '';

  const params = new URLSearchParams(window.location.search);
  const token = params.get('t') || '';

  const el = {
    loading: document.getElementById('sign-loading'),
    error: document.getElementById('sign-error'),
    errorMsg: document.getElementById('sign-error-msg'),
    done: document.getElementById('sign-done'),
    doneId: document.getElementById('sign-done-id'),
    formWrap: document.getElementById('sign-form-wrap'),
    appId: document.getElementById('sign-app-id'),
    preview: document.getElementById('sign-preview'),
    disclosures: document.getElementById('sign-disclosures'),
    typedName: document.getElementById('typed_name'),
    canvas: document.getElementById('sign-canvas'),
    clear: document.getElementById('sign-clear'),
    submit: document.getElementById('sign-submit'),
    status: document.getElementById('sign-status'),
  };

  let drawing = false;
  let hasInk = false;
  const ctx = el.canvas.getContext('2d');

  function show(which) {
    el.loading.hidden = which !== 'loading';
    el.error.hidden = which !== 'error';
    el.done.hidden = which !== 'done';
    el.formWrap.hidden = which !== 'form';
  }

  function setStatus(msg, type) {
    if (!msg) {
      el.status.hidden = true;
      el.status.textContent = '';
      return;
    }
    el.status.hidden = false;
    el.status.textContent = msg;
    el.status.className = 'apply-status apply-status--' + (type || 'info');
  }

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const rect = el.canvas.getBoundingClientRect();
    const w = Math.max(300, Math.floor(rect.width));
    const h = 200;
    el.canvas.width = w * ratio;
    el.canvas.height = h * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#0c1222';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    hasInk = false;
  }

  function pos(e) {
    const rect = el.canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }

  function start(e) {
    e.preventDefault();
    drawing = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    hasInk = true;
  }

  function end() {
    drawing = false;
  }

  el.canvas.addEventListener('mousedown', start);
  el.canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  el.canvas.addEventListener('touchstart', start, { passive: false });
  el.canvas.addEventListener('touchmove', move, { passive: false });
  el.canvas.addEventListener('touchend', end);
  el.clear.addEventListener('click', resizeCanvas);
  window.addEventListener('resize', () => {
    if (!el.formWrap.hidden) resizeCanvas();
  });

  function money(n) {
    const v = parseInt(String(n || '').replace(/\D/g, ''), 10);
    if (!v) return n || '—';
    return '$' + v.toLocaleString('en-US');
  }

  function renderPreview(preview) {
    const rows = [
      ['Legal business name', preview.business_name],
      ['DBA', preview.dba],
      ['Website', preview.website],
      ['Business phone', preview.business_phone],
      ['Entity type', preview.business_type],
      ['Industry', preview.industry],
      ['Business address', preview.address],
      ['EIN', preview.ein],
      ['Business start date', preview.date_started],
      ['Owner', preview.owner_name],
      ['Owner email', preview.owner_email],
      ['Owner phone', preview.owner_phone],
      ['Owner DOB', preview.owner_dob],
      ['Owner SSN', preview.owner_ssn],
      ['Driver license', preview.owner_dl],
      ['Owner home address', preview.owner_home],
      ['Ownership %', preview.ownership],
      ['Estimated credit score', preview.fico_score],
      ['Second owner', preview.owner2_name],
      ['Funding requested', money(preview.funding_requested)],
      ['Annual revenue', money(preview.annual_revenue)],
      ['Average bank balance', money(preview.avg_bank_balance)],
      ['Monthly CC volume', preview.monthly_cc_volume ? money(preview.monthly_cc_volume) : ''],
      ['Purpose of funds', preview.purpose],
      ['Judgments / liens', preview.has_liens],
      ['ERC grant', preview.erc_grant],
      ['Bank statements', preview.submit_bank_stmts],
      ['Current advance', preview.has_current_advance],
      ['Advance balance', preview.current_advance_balance ? money(preview.current_advance_balance) : ''],
      ['Advance held with', preview.current_advance_holder],
    ];
    el.preview.innerHTML = rows
      .filter((r) => r[1])
      .map((r) => `<div><dt>${escapeHtml(r[0])}</dt><dd>${escapeHtml(r[1])}</dd></div>`)
      .join('');
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function load() {
    if (!token) {
      show('error');
      el.errorMsg.textContent = 'Missing signing token. Submit an application first.';
      return;
    }
    if (!apiBase) {
      show('error');
      el.errorMsg.textContent = 'Signing service is not configured yet.';
      return;
    }

    show('loading');
    try {
      const res = await fetch(apiBase + '/api/sign/' + encodeURIComponent(token));
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Unable to load application');

      if (data.status === 'signed') {
        el.doneId.textContent = data.application_id || '';
        show('done');
        return;
      }

      el.appId.textContent = data.application_id || '';
      renderPreview(data.preview || {});
      el.disclosures.innerHTML = (data.disclosures || [])
        .map((d) => `<li>${escapeHtml(d)}</li>`)
        .join('');
      if (data.preview && data.preview.owner_name) {
        el.typedName.value = data.preview.owner_name;
      }
      show('form');
      requestAnimationFrame(resizeCanvas);
    } catch (err) {
      show('error');
      el.errorMsg.textContent = err.message || 'Unable to load signing session.';
    }
  }

  el.submit.addEventListener('click', async () => {
    const typed = el.typedName.value.trim();
    if (typed.length < 2) {
      setStatus('Type your full legal name.', 'error');
      return;
    }
    if (!hasInk) {
      setStatus('Please draw your signature.', 'error');
      return;
    }
    const consents = {
      electronic: document.getElementById('c-electronic').checked,
      accuracy: document.getElementById('c-accuracy').checked,
      credit: document.getElementById('c-credit').checked,
      communication: document.getElementById('c-communication').checked,
      share: document.getElementById('c-share').checked,
    };
    if (!consents.electronic || !consents.accuracy || !consents.credit || !consents.communication || !consents.share) {
      setStatus('Please check all consent boxes.', 'error');
      return;
    }

    el.submit.disabled = true;
    el.submit.textContent = 'Submitting…';
    setStatus('Finalizing your electronic signature…', 'info');

    try {
      const res = await fetch(apiBase + '/api/sign/' + encodeURIComponent(token), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          typed_name: typed,
          signature_data_url: el.canvas.toDataURL('image/png'),
          consents,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Signature failed');
      el.doneId.textContent = data.application_id || '';
      show('done');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setStatus(err.message || 'Could not complete signature.', 'error');
      el.submit.disabled = false;
      el.submit.textContent = 'Finish & Submit';
    }
  });

  load();
})();
