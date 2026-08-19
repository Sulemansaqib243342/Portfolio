// api/setup.js
// ONE-TIME endpoint — visit https://sulemansaqib.vercel.app/api/setup?key=YOUR_ADMIN_SECRET
// to create the messages table in your Postgres database.
// After running once you can leave it — it uses CREATE TABLE IF NOT EXISTS.

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Guard: require admin key
  const { key } = req.query;
  if (key !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(200)  NOT NULL,
        email      VARCHAR(300)  NOT NULL,
        message    TEXT          NOT NULL,
        ip         VARCHAR(60),
        created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );
    `;

    return res.status(200).json({
      ok: true,
      message: 'Table "messages" created (or already existed). You are good to go!',
    });
  } catch (err) {
    console.error('Setup error:', err);
    return res.status(500).json({ error: err.message });
  }
}
