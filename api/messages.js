// api/messages.js
// Admin endpoint — returns all contact messages from the database.
// Protected by ADMIN_SECRET environment variable.
// Usage: GET /api/messages?key=YOUR_ADMIN_SECRET

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Guard: require admin secret key
  const { key } = req.query;
  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized — invalid or missing key.' });
  }

  try {
    const result = await sql`
      SELECT id, name, email, message, ip, created_at
      FROM messages
      ORDER BY created_at DESC
      LIMIT 200;
    `;

    return res.status(200).json({
      ok:    true,
      count: result.rowCount,
      messages: result.rows,
    });
  } catch (err) {
    console.error('Messages fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch messages.' });
  }
}
