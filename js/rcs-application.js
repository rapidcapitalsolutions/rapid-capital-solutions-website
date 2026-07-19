/**
 * Rapid Capital Solutions — standalone funding application.
 * Field mapping inspired by manual-application PDF APIs (same JSON shape as
 * apply.profundingoptions.com/api/generate-manual-pdf.php) but for RCS only.
 * Does NOT connect to CRM or Pro Funding Options.
 */
(function (global) {
  'use strict';

  const BRAND = {
    name: 'Rapid Capital Solutions',
    applicationPrefix: 'RCS',
    defaultPurpose: 'working capital',
  };

  /** Form fields shown on apply.html (internal key, label). */
  const FORM_FIELDS = [
    ['legal_name', 'Business legal name'],
    ['dba', 'DBA'],
    ['business_type', 'Business type'],
    ['industry', 'Industry / description'],
    ['ein', 'Federal tax ID (EIN)'],
    ['street', 'Business street address'],
    ['city', 'Business city'],
    ['state', 'Business state'],
    ['zip', 'Business ZIP'],
    ['date_started', 'Business start date'],
    ['annual_revenue', 'Annual gross revenue'],
    ['funding_requested', 'Requested funding amount'],
    ['monthly_cc_volume', 'Monthly credit card volume'],
    ['purpose_of_funds', 'Purpose of funds'],
    ['owner_first', 'Owner first name'],
    ['owner_last', 'Owner last name'],
    ['owner_email', 'Owner email'],
    ['owner_phone', 'Owner mobile phone'],
    ['owner_dob', 'Owner date of birth'],
    ['owner_ssn', 'Owner SSN'],
    ['owner_ownership', 'Ownership %'],
    ['owner_address', 'Owner street address'],
    ['owner_city', 'Owner city'],
    ['owner_state', 'Owner state'],
    ['owner_zip', 'Owner ZIP'],
    ['fico_score', 'Estimated FICO score'],
  ];

  function stripMoney(val) {
    return String(val || '').replace(/[^\d.]/g, '');
  }

  function splitName(full) {
    const parts = String(full || '').trim().split(/\s+/);
    if (!parts.length) return { first: '', last: '' };
    return { first: parts[0], last: parts.slice(1).join(' ') };
  }

  function newApplicationId() {
    const hex = Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    return BRAND.applicationPrefix + '-' + hex.slice(0, 8);
  }

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }

  /** Read website FormData into flat object. */
  function fieldsFromFormData(formData) {
    const raw = {};
    formData.forEach((v, k) => {
      raw[k] = String(v || '').trim();
    });
    const ownerName = [raw.owner_first, raw.owner_last].filter(Boolean).join(' ');
    return {
      legal_name: raw.legal_name || '',
      dba: raw.dba || raw.legal_name || '',
      business_type: raw.business_type || 'LLC',
      industry: raw.industry || '',
      state_of_organization: raw.state_of_organization || raw.state || '',
      date_started: raw.date_started || '',
      annual_revenue: raw.annual_revenue || '',
      funding_requested: stripMoney(raw.funding_requested) || raw.funding_requested || '',
      monthly_cc_volume: raw.monthly_cc_volume || '',
      purpose_of_funds: raw.purpose_of_funds || BRAND.defaultPurpose,
      street: raw.street || '',
      city: raw.city || '',
      state: raw.state || '',
      zip: raw.zip || '',
      ein: raw.ein || '',
      owner_name: ownerName,
      owner_dob: raw.owner_dob || '',
      owner_ssn: raw.owner_ssn || '',
      owner_ownership: raw.owner_ownership || '',
      owner_address: raw.owner_address || raw.street || '',
      owner_city: raw.owner_city || raw.city || '',
      owner_state: raw.owner_state || raw.state || '',
      owner_zip: raw.owner_zip || raw.zip || '',
      owner_email: raw.owner_email || '',
      owner_phone: raw.owner_phone || '',
      fico_score: raw.fico_score || '',
      consent: raw.consent ? '1' : '',
      source: 'rapidcapitalsolutions.com',
    };
  }

  /**
   * JSON body for manual-application PDF generator APIs.
   * Set your own base URL + password on the Cloudflare Worker — not PFO/CRM.
   */
  function toManualApiPayload(fields) {
    const f = fields || {};
    const appId = f.application_id || newApplicationId();
    const names = splitName(f.owner_name);
    const first = names.first;
    const last = names.last;
    const ownerEmail = f.owner_email || '';
    return {
      application_id: appId,
      backdate_enabled: true,
      application_date: f.application_date || todayIso(),
      business_name: f.legal_name || '',
      dba_name: f.dba || f.legal_name || '',
      business_type: f.business_type || 'LLC',
      business_industry: f.industry || '',
      state_of_organization: f.state_of_organization || f.state || '',
      business_start_date: f.date_started || '',
      yearly_revenue: stripMoney(f.annual_revenue),
      requested_funding_amount: stripMoney(f.funding_requested),
      monthly_cc_volume: stripMoney(f.monthly_cc_volume),
      funding_purpose: f.purpose_of_funds || BRAND.defaultPurpose,
      address: f.street || '',
      city: f.city || '',
      state: f.state || '',
      zip_code: f.zip || '',
      email: ownerEmail,
      phone: f.owner_phone || '',
      first_name: first,
      last_name: last,
      dob: f.owner_dob || '',
      ssn: f.owner_ssn || '',
      ein: f.ein || '',
      ownership_percentage: stripMoney(f.owner_ownership),
      estimated_fico: f.fico_score || '',
      authorized_owner: f.consent === '1' ? '1' : '',
      owner_address: f.owner_address || '',
      owner_city: f.owner_city || '',
      owner_state: f.owner_state || '',
      owner_zip_code: f.owner_zip || '',
      owner_email: ownerEmail,
      owner_phone: f.owner_phone || '',
      audit_trail_enabled: false,
      brand: BRAND.name,
    };
  }

  /** Plain-text summary for email fallback. */
  function toEmailBody(fields) {
    const lines = [];
    for (const [key, label] of FORM_FIELDS) {
      if (key === 'owner_first' || key === 'owner_last') continue;
      const val = fields[key];
      if (val) lines.push(label + ': ' + val);
    }
    if (fields.owner_name) lines.push('Owner full name: ' + fields.owner_name);
    if (fields.application_id) lines.push('Application ID: ' + fields.application_id);
    lines.push('Source: ' + (fields.source || BRAND.name));
    return lines.join('\n');
  }

  global.RCSApplication = {
    BRAND,
    FORM_FIELDS,
    fieldsFromFormData,
    toManualApiPayload,
    toEmailBody,
    newApplicationId,
  };
})(typeof window !== 'undefined' ? window : globalThis);
