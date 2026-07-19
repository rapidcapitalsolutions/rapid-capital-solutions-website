/**
 * Rapid Capital Solutions — standalone funding application.
 * Field set aligned with full MCA broker apps (Fidelity / PFO-style options).
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
    ['website', 'Website'],
    ['business_phone', 'Business phone'],
    ['business_type', 'Legal entity type'],
    ['industry', 'Industry'],
    ['ein', 'Federal tax ID (EIN)'],
    ['street', 'Business street address'],
    ['city', 'Business city'],
    ['state', 'Business state'],
    ['zip', 'Business ZIP'],
    ['state_of_organization', 'State of organization'],
    ['date_started', 'Business start date'],
    ['owner_first', 'Owner first name'],
    ['owner_last', 'Owner last name'],
    ['owner_email', 'Owner email'],
    ['owner_phone', 'Owner cell phone'],
    ['owner_dob', 'Owner date of birth'],
    ['owner_ssn', 'Owner SSN'],
    ['owner_dl', 'Owner driver license'],
    ['owner_ownership', 'Ownership %'],
    ['owner_address', 'Owner street address'],
    ['owner_city', 'Owner city'],
    ['owner_state', 'Owner state'],
    ['owner_zip', 'Owner ZIP'],
    ['fico_score', 'Estimated credit score'],
    ['owner2_name', 'Second owner'],
    ['owner2_ownership', 'Second owner ownership %'],
    ['owner2_email', 'Second owner email'],
    ['owner2_phone', 'Second owner phone'],
    ['owner2_ssn', 'Second owner SSN'],
    ['funding_requested', 'Requested funding amount'],
    ['annual_revenue', 'Annual gross revenue'],
    ['avg_bank_balance', 'Average bank balance'],
    ['monthly_cc_volume', 'Monthly credit card volume'],
    ['purpose_of_funds', 'Purpose of funds'],
    ['has_liens', 'Open judgments / bankruptcy / liens'],
    ['liens_detail', 'Liens detail'],
    ['erc_grant', 'Applied for ERC grant'],
    ['submit_bank_stmts', 'Will submit bank statements'],
    ['submit_cc_stmts', 'Will submit CC statements'],
    ['has_current_advance', 'Current advance balance'],
    ['current_advance_balance', 'Current advance balance amount'],
    ['current_advance_daily', 'Current advance daily payment'],
    ['current_advance_holder', 'Current advance held with'],
    ['current_advance_date', 'Current advance funding date'],
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
    const owner2Name = [raw.owner2_first, raw.owner2_last].filter(Boolean).join(' ');
    return {
      legal_name: raw.legal_name || '',
      dba: raw.dba || '',
      website: raw.website || '',
      business_phone: raw.business_phone || '',
      business_type: raw.business_type || 'LLC',
      industry: raw.industry || '',
      state_of_organization: raw.state_of_organization || raw.state || '',
      date_started: raw.date_started || '',
      annual_revenue: stripMoney(raw.annual_revenue) || raw.annual_revenue || '',
      funding_requested: stripMoney(raw.funding_requested) || raw.funding_requested || '',
      avg_bank_balance: stripMoney(raw.avg_bank_balance) || '',
      monthly_cc_volume: stripMoney(raw.monthly_cc_volume) || '',
      purpose_of_funds: raw.purpose_of_funds || BRAND.defaultPurpose,
      street: raw.street || '',
      city: raw.city || '',
      state: raw.state || '',
      zip: raw.zip || '',
      ein: raw.ein || '',
      owner_name: ownerName,
      owner_first: raw.owner_first || '',
      owner_last: raw.owner_last || '',
      owner_dob: raw.owner_dob || '',
      owner_ssn: raw.owner_ssn || '',
      owner_dl: raw.owner_dl || '',
      owner_ownership: raw.owner_ownership || '',
      owner_address: raw.owner_address || '',
      owner_city: raw.owner_city || '',
      owner_state: raw.owner_state || '',
      owner_zip: raw.owner_zip || '',
      owner_email: raw.owner_email || '',
      owner_phone: raw.owner_phone || '',
      fico_score: raw.fico_score || '',
      owner2_name: owner2Name,
      owner2_ownership: raw.owner2_ownership || '',
      owner2_email: raw.owner2_email || '',
      owner2_phone: raw.owner2_phone || '',
      owner2_ssn: raw.owner2_ssn || '',
      has_liens: raw.has_liens || '',
      liens_detail: raw.liens_detail || '',
      erc_grant: raw.erc_grant || '',
      submit_bank_stmts: raw.submit_bank_stmts || '',
      submit_cc_stmts: raw.submit_cc_stmts || '',
      has_current_advance: raw.has_current_advance || '',
      current_advance_balance: stripMoney(raw.current_advance_balance) || '',
      current_advance_daily: stripMoney(raw.current_advance_daily) || '',
      current_advance_holder: raw.current_advance_holder || '',
      current_advance_date: raw.current_advance_date || '',
      consent: raw.consent ? '1' : '',
      source: 'rapidcapitalsolutions.com',
    };
  }

  /**
   * JSON body for manual-application PDF generator APIs (legacy shape).
   */
  function toManualApiPayload(fields) {
    const f = fields || {};
    const appId = f.application_id || newApplicationId();
    const names = splitName(f.owner_name);
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
      average_bank_balance: stripMoney(f.avg_bank_balance),
      funding_purpose: f.purpose_of_funds || BRAND.defaultPurpose,
      address: f.street || '',
      city: f.city || '',
      state: f.state || '',
      zip_code: f.zip || '',
      email: ownerEmail,
      phone: f.owner_phone || '',
      business_phone: f.business_phone || '',
      website: f.website || '',
      first_name: names.first,
      last_name: names.last,
      dob: f.owner_dob || '',
      ssn: f.owner_ssn || '',
      drivers_license: f.owner_dl || '',
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
      has_liens: f.has_liens || '',
      liens_detail: f.liens_detail || '',
      erc_grant: f.erc_grant || '',
      has_current_advance: f.has_current_advance || '',
      current_advance_balance: f.current_advance_balance || '',
      current_advance_daily: f.current_advance_daily || '',
      current_advance_holder: f.current_advance_holder || '',
      current_advance_date: f.current_advance_date || '',
      audit_trail_enabled: false,
      brand: BRAND.name,
    };
  }

  /** Plain-text summary for email fallback (masks SSN). */
  function toEmailBody(fields) {
    const lines = [];
    for (const [key, label] of FORM_FIELDS) {
      if (key === 'owner_first' || key === 'owner_last') continue;
      let val = fields[key];
      if (!val) continue;
      if (key === 'owner_ssn' || key === 'owner2_ssn') {
        val = maskSsn(val);
      }
      lines.push(label + ': ' + val);
    }
    if (fields.owner_name) lines.push('Owner full name: ' + fields.owner_name);
    if (fields.application_id) lines.push('Application ID: ' + fields.application_id);
    lines.push('Source: ' + (fields.source || BRAND.name));
    return lines.join('\n');
  }

  function maskSsn(ssn) {
    const d = String(ssn || '').replace(/\D/g, '');
    if (d.length < 4) return '***-**-****';
    return '***-**-' + d.slice(-4);
  }

  global.RCSApplication = {
    BRAND,
    FORM_FIELDS,
    fieldsFromFormData,
    toManualApiPayload,
    toEmailBody,
    newApplicationId,
    maskSsn,
  };
})(typeof window !== 'undefined' ? window : globalThis);
