// api/contact.js
// Handles contact form POST submissions.
// - Validates input
// - Saves message to PostgreSQL (Vercel Postgres)
// - Sends email notification to owner via Resend
// - Returns JSON response

import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const OWNER_EMAIL = process.env.ADMIN_EMAIL || 'sulemansaqib34917@gmail.com';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  // ── CORS headers (allow requests from the portfolio domain) ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Parse & validate body ──
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { name, email, message, website } = body || {};

  // ── Honeypot bot protection (silent discard) ──
  if (website && website.trim().length > 0) {
    return res.status(200).json({ ok: true, message: 'Message received.' });
  }

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Please provide a valid name (min 2 characters).' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return res.status(400).json({ error: 'Message must be at least 10 characters long.' });
  }

  const safeName    = name.trim().slice(0, 200);
  const safeEmail   = email.trim().toLowerCase().slice(0, 300);
  const safeMessage = message.trim().slice(0, 5000);
  const ip          = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();

  // ── Save to PostgreSQL via Prisma ──
  let savedId;
  try {
    const newMessage = await prisma.messages.create({
      data: {
        name: safeName,
        email: safeEmail,
        message: safeMessage,
        ip: ip,
      }
    });
    savedId = newMessage.id;
  } catch (dbErr) {
    console.error('DB insert error:', dbErr);
    return res.status(500).json({ error: 'Failed to save your message. Please try again.' });
  }

  // ── Send email notification via Resend ──
  try {
    await resend.emails.send({
      from:    'Portfolio Contact <onboarding@resend.dev>',
      to:      [OWNER_EMAIL],
      subject: `📬 New message from ${safeName} — Portfolio`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0A0908; color: #E8DFD8; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #D4AF37, #8C6D4F); padding: 28px 32px;">
            <h1 style="margin: 0; font-size: 22px; color: #0A0908; letter-spacing: 1px;">New Contact Message</h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: rgba(10,9,8,0.7);">Via sulemansaqib.vercel.app · Message #${savedId}</p>
          </div>
          <div style="padding: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #9A8A7A; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; width: 80px;">Name</td>
                <td style="padding: 10px 0; color: #E8DFD8; font-weight: 600;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #9A8A7A; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Email</td>
                <td style="padding: 10px 0;"><a href="mailto:${safeEmail}" style="color: #D4AF37; text-decoration: none;">${safeEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #9A8A7A; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; vertical-align: top;">Message</td>
                <td style="padding: 10px 0; color: #E8DFD8; line-height: 1.7; white-space: pre-wrap;">${safeMessage}</td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid rgba(212,175,55,0.15); margin: 24px 0;">
            <a href="mailto:${safeEmail}?subject=Re: Your message on my portfolio" 
               style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #D4AF37, #8C6D4F); color: #0A0908; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 12px; letter-spacing: 1px;">
              Reply to ${safeName}
            </a>
          </div>
          <div style="padding: 16px 32px; background: rgba(255,255,255,0.03); font-size: 11px; color: #9A8A7A;">
            Sent from your portfolio contact form · IP: ${ip || 'unknown'}
          </div>
        </div>
      `,
    });
  } catch (emailErr) {
    // Don't fail the request if email fails — message is already saved to DB
    console.error('Resend email error:', emailErr);
  }

  return res.status(200).json({
    ok: true,
    message: 'Your message has been received! I will get back to you soon.',
    id: savedId,
  });
}
