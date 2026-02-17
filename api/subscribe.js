import { upsertSubscriber } from './db.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sourceRegex = /^[a-z0-9._-]{2,60}$/i;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function parseSource(value, fallback = 'direct-share') {
  if (typeof value === 'string' && sourceRegex.test(value.trim())) {
    return value.trim().toLowerCase();
  }
  return fallback;
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const source = parseSource(body.source);

    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim()
      || req.headers['x-real-ip']?.toString()
      || 'unknown';

    await upsertSubscriber({
      email,
      source,
      ip,
      userAgent: req.headers['user-agent']?.toString() || null,
    });

    return res.status(200).json({ success: true, message: 'Email saved', source });
  } catch (error) {
    console.error('subscribe error', error);
    const details = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: 'Server error', details });
  }
}
