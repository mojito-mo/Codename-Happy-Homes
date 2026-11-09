// Vercel serverless function: pushes a Happy Homes landing-page lead into
// Zoho CRM through the CRM team's Lead Push API (create_lead function).
// The zapikey lives only in the Vercel env var ZOHO_ZAPIKEY, never in the
// browser. If the key isn't set or Zoho rejects the lead, this returns a
// non-200 and the browser falls back to the old Web-to-Lead form, so no
// lead is lost either way.

const ZOHO_URL = 'https://www.zohoapis.in/crm/v7/functions/create_lead/actions/execute';
const PROJECT = 'Code Name Happy Homes';
const ALLOWED_HOSTS = /^(www\.)?codenamehappyhomes\.net$|\.vercel\.app$|^localhost$/;

// Channel detected in the browser -> Zoho "Enquiry Source" picklist value.
// CRM team asked for Google Ads AND plain website leads to both go in as
// "Google Ads - Happy Homes". The raw channel is still kept in Description.
const SOURCE_MAP = {
  'Google Ads': 'Google Ads - Happy Homes',
  'Website Lead': 'Google Ads - Happy Homes',
  'Meta Ads': 'Meta Ads',
  'WhatsApp': 'WhatsApp'
};

const UNIT_TYPES = ['1BHK', '1.5BHK', '2BHK', '2.5BHK', '3BHK', '4BHK', '5BHK+'];

function str(v, max) { return (v == null ? '' : String(v)).trim().slice(0, max || 500); }

function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') { try { return Promise.resolve(JSON.parse(req.body)); } catch (_) { return Promise.resolve({}); } }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 20000) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch (_) { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ ok: false, error: 'method' })); }

  // Only accept posts from our own pages
  const origin = req.headers.origin || '';
  if (origin) {
    let host = '';
    try { host = new URL(origin).hostname; } catch (_) {}
    if (!ALLOWED_HOSTS.test(host)) { res.statusCode = 403; return res.end(JSON.stringify({ ok: false, error: 'origin' })); }
  }

  const key = process.env.ZOHO_ZAPIKEY;
  if (!key) { res.statusCode = 503; return res.end(JSON.stringify({ ok: false, error: 'not_configured' })); }

  const p = await readBody(req);
  if (str(p['bot-field'])) { res.statusCode = 200; return res.end(JSON.stringify({ ok: true })); } // honeypot

  const name = str(p.name, 120);
  const phone = str(p.phone, 20);
  if (!name || !/^\+\d{7,15}$/.test(phone)) { res.statusCode = 400; return res.end(JSON.stringify({ ok: false, error: 'invalid' })); }

  const email = str(p.email, 120);
  const channel = str(p.channel, 40) || 'Website Lead';
  const unit = str(p.config, 20).replace(/\s+/g, '').toUpperCase();

  const desc = [];
  if (p.config)   desc.push('Configuration: ' + str(p.config, 40));
  if (p.budget)   desc.push('Budget: ' + str(p.budget, 60));
  if (p.timeline) desc.push('Timeline: ' + str(p.timeline, 60));
  if (p.pickup)   desc.push('Pickup: ' + str(p.pickup, 120));
  if (p.date)     desc.push('Preferred date: ' + str(p.date, 30));
  if (p.slot)     desc.push('Preferred slot: ' + str(p.slot, 30));
  if (p.message)  desc.push('Message: ' + str(p.message, 1000));
  desc.push('Channel: ' + channel + (p.gclid ? ' (gclid ' + str(p.gclid, 200) + ')' : ''));
  desc.push('Form: ' + str(p.source, 60));
  desc.push('Page: ' + str(p.page, 500));

  const lead = {
    Last_Name: name,
    Phone: phone,
    Email: /^[^\s@\/]+@[^\s@\/]+\.[^\s@\/]+$/.test(email) ? email : null,
    Lead_Type: 'Buyer',
    Lead_Source: SOURCE_MAP[channel] || 'Google Ads - Happy Homes',
    Project_Name: PROJECT,
    Preferred_Projects: [PROJECT],
    Preferred_Property_Type: ['Apartment'],
    Property_Category: 'Residential',
    Description: desc.join('\n'),
    Tag: [{ name: 'Happy Homes' }]
  };
  if (UNIT_TYPES.indexOf(unit) > -1) lead.Preferred_Unit_Types = [unit];

  try {
    const r = await fetch(ZOHO_URL + '?auth_type=apikey&zapikey=' + encodeURIComponent(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    const text = await r.text();
    let data = {};
    try { data = JSON.parse(text); } catch (_) {}
    const ok = r.ok && data.code === 'success';
    if (!ok) console.error('Zoho create_lead rejected', r.status, text.slice(0, 500));
    res.statusCode = ok ? 200 : 502;
    return res.end(JSON.stringify({ ok: ok, lead_id: ok && data.details ? data.details.lead_id : undefined }));
  } catch (err) {
    console.error('Zoho create_lead failed', err && err.message);
    res.statusCode = 502;
    return res.end(JSON.stringify({ ok: false, error: 'upstream' }));
  }
};
