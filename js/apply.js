(function () {
  'use strict';

  const cfg = window.RCS_CONFIG || {};
  const form = document.getElementById('rcs-apply-form');
  const statusEl = document.getElementById('apply-status');
  if (!form) return;

  function setStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = 'apply-status apply-status--' + (type || 'info');
    statusEl.hidden = !msg;
  }

  function parseAmountRange(val) {
    const v = (val || '').trim();
    if (!v) return '';
    const nums = v.match(/[\d,]+/g);
    if (!nums) return v;
    return nums[nums.length - 1].replace(/,/g, '');
  }

  function payloadFromForm(data) {
    const ownerFirst = (data.get('owner_first') || '').trim();
    const ownerLast = (data.get('owner_last') || '').trim();
    const ownerName = [ownerFirst, ownerLast].filter(Boolean).join(' ');
    return {
      legal_name: data.get('legal_name') || data.get('business') || '',
      dba: data.get('dba') || '',
      business_type: data.get('business_type') || 'LLC',
      industry: data.get('industry') || '',
      state_of_organization: data.get('state_of_organization') || data.get('state') || '',
      date_started: data.get('date_started') || '',
      annual_revenue: data.get('annual_revenue') || '',
      funding_requested: parseAmountRange(data.get('funding_requested') || data.get('amount') || ''),
      monthly_cc_volume: data.get('monthly_cc_volume') || '',
      purpose_of_funds: data.get('purpose_of_funds') || data.get('notes') || 'working capital',
      street: data.get('street') || '',
      city: data.get('city') || '',
      state: data.get('state') || '',
      zip: data.get('zip') || '',
      ein: data.get('ein') || '',
      owner_name: ownerName || data.get('owner_name') || data.get('name') || '',
      owner_dob: data.get('owner_dob') || '',
      owner_ssn: data.get('owner_ssn') || '',
      owner_ownership: data.get('owner_ownership') || '',
      owner_address: data.get('owner_address') || '',
      owner_city: data.get('owner_city') || '',
      owner_state: data.get('owner_state') || '',
      owner_zip: data.get('owner_zip') || '',
      owner_email: data.get('owner_email') || data.get('email') || '',
      owner_phone: data.get('owner_phone') || data.get('phone') || '',
      fico_score: data.get('fico_score') || '',
      consent: data.get('consent') ? '1' : '',
      source: 'rapidcapitalsolutions.com',
    };
  }

  function fallbackMailto(payload) {
    const email = cfg.submissionsEmail || 'submissions@rapidcapitalsolutions.com';
    const subject = encodeURIComponent('Funding Application — ' + (payload.legal_name || 'New'));
    const lines = Object.entries(payload).map(([k, v]) => k + ': ' + v);
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = new FormData(form);
    const payload = payloadFromForm(data);
    const btn = form.querySelector('[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.dataset.label = btn.textContent;
      btn.textContent = 'Submitting…';
    }
    setStatus('Submitting your application…', 'info');

    const apiUrl = cfg.applyApiUrl;
    if (!apiUrl) {
      setStatus('Sending via email…', 'info');
      fallbackMailto(payload);
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Submit'; }
      return;
    }

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        form.reset();
        setStatus(
          json.message ||
            'Application received. Check your email for ClixSign documents to e-sign. Our team will contact you shortly.',
          'success'
        );
        form.hidden = true;
        const thanks = document.getElementById('apply-thanks');
        if (thanks) thanks.hidden = false;
        return;
      }
      throw new Error(json.detail || json.error || 'Submission failed');
    } catch (err) {
      setStatus(
        (err.message || 'Could not reach our server') +
          '. Trying email fallback — or call us directly.',
        'error'
      );
      setTimeout(() => fallbackMailto(payload), 1500);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset.label || 'Submit Application';
      }
    }
  });
})();
