import { getToken } from 'next-auth/jwt';
import connectDB from '../../lib/db.js';
import Client from '../../lib/models/Client.js';
import User from '../../lib/models/User.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return res.status(401).json({ error: 'Not logged in' });

  try {
    await connectDB();

    // Prevent duplicate onboarding
    const user = await User.findById(token.id);
    if (user.clientId) return res.status(400).json({ error: 'Already onboarded' });

    const clientId = crypto.randomBytes(6).toString('hex');
    const apiKey   = crypto.randomBytes(20).toString('hex');

    const client = await Client.create({ ...req.body, clientId, apiKey });

    // Link client to user
    await User.findByIdAndUpdate(token.id, { clientId });

    res.status(201).json({
      success: true,
      clientId: client.clientId,
      webhooks: {
        whatsapp:  `/api/whatsapp-leads?clientId=${clientId}`,
        instagram: `/api/instagram-dm?clientId=${clientId}`,
        email:     `/api/email-campaigns?clientId=${clientId}`,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
