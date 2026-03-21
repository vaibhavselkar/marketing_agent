import connectDB from '../../lib/db.js';
import Client from '../../lib/models/Client.js';
import crypto from 'crypto';

function requireAdminKey(req) {
  const key = req.headers['x-admin-key'];
  return !key || key !== process.env.ADMIN_API_KEY;
}

export default async function handler(req, res) {
  if (requireAdminKey(req)) return res.status(401).json({ success: false, error: 'Unauthorized' });

  await connectDB();

  if (req.method === 'GET') {
    try {
      const clients = await Client.find({}, '-googlePrivateKey -gmailAppPassword -whatsappAccessToken -apiKey').lean();
      return res.status(200).json({ success: true, data: clients });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      const clientId = body.clientId || crypto.randomBytes(6).toString('hex');
      const apiKey   = body.apiKey   || crypto.randomBytes(20).toString('hex');
      const client   = await Client.create({ ...body, clientId, apiKey });
      return res.status(201).json({
        success: true,
        data: {
          clientId: client.clientId,
          apiKey:   client.apiKey,
          businessName: client.businessName,
          webhooks: {
            whatsapp:  `/api/whatsapp-leads?clientId=${client.clientId}`,
            instagram: `/api/instagram-dm?clientId=${client.clientId}`,
            email:     `/api/email-campaigns?clientId=${client.clientId}`,
          }
        }
      });
    } catch (error) {
      return res.status(error.code === 11000 ? 409 : 500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { clientId, ...updates } = req.body;
      if (!clientId) return res.status(400).json({ success: false, error: 'clientId is required' });
      const client = await Client.findOneAndUpdate({ clientId }, { $set: updates }, { new: true }).lean();
      if (!client) return res.status(404).json({ success: false, error: 'Client not found' });
      return res.status(200).json({ success: true, data: { clientId: client.clientId, businessName: client.businessName } });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const clientId = req.query.clientId;
      if (!clientId) return res.status(400).json({ success: false, error: 'clientId is required' });
      await Client.findOneAndUpdate({ clientId }, { isActive: false });
      return res.status(200).json({ success: true, message: `Client ${clientId} deactivated` });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
