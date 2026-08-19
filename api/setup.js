// api/setup.js
// ONE-TIME endpoint — visit https://sulemansaqib.vercel.app/api/setup?key=YOUR_ADMIN_SECRET
// to create the messages table in your Postgres database.
// After running once you can leave it — it uses CREATE TABLE IF NOT EXISTS.

export default async function handler(req, res) {
  return res.status(200).json({
    message: 'With Prisma, you do not need this setup endpoint. Run `npx prisma db push` locally to push the schema to your database instead.'
  });
}
