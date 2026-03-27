import { getToken } from 'next-auth/jwt';
import connectDB from '../../lib/db.js';
import Client from '../../lib/models/Client.js';

// Maps each channel to the key credential that indicates it's connected
const CHANNEL_REQUIRED_KEY = {
  whatsapp:    'aiSensyApiKey',
  instagram:   'instagramAccessToken',
  email:       'gmailUser',
  google:      'googleSheetId',
  telegram:    'telegramBotToken',
  reddit:      'redditClientId',
  facebookAds: 'instagramVerifyToken',
};

// All fields that belong to each channel (allowed to be updated via PATCH)
const CHANNEL_FIELDS = {
  whatsapp:  ['aiSensyApiKey', 'adminWhatsappNumber', 'aiSensyWelcomeCampaign', 'aiSensyFollowupCampaign', 'aiSensyAdminCampaign'],
  instagram: ['instagramAccessToken', 'instagramPageId', 'instagramVerifyToken', 'geminiApiKey'],
  email:     ['gmailUser', 'gmailAppPassword'],
  google:    ['geminiApiKey', 'googleSheetId', 'googleClientEmail', 'googlePrivateKey'],
  telegram:  ['telegramBotToken', 'telegramChatId'],
  reddit:    ['redditClientId', 'redditClientSecret', 'redditUsername', 'redditPassword', 'redditSubreddits'],
};

const ALL_ALLOWED_KEYS = Object.values(CHANNEL_FIELDS).flat();

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return res.status(401).json({ error: 'Not logged in' });
  if (!token.clientId) return res.status(400).json({ error: 'No client setup yet — complete onboarding first' });

  await connectDB();
  const client = await Client.findOne({ clientId: token.clientId });
  if (!client) return res.status(404).json({ error: 'Client not found' });

  // GET — return which channels are connected
  if (req.method === 'GET') {
    const connected = {};
    for (const [channel, key] of Object.entries(CHANNEL_REQUIRED_KEY)) {
      connected[channel] = !!(client[key] && client[key].length > 0);
    }
    return res.status(200).json({ success: true, connected });
  }

  // PATCH — update credentials for one or more channels
  if (req.method === 'PATCH') {
    const updates = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (ALL_ALLOWED_KEYS.includes(key)) {
        updates[key] = value;
      }
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided' });
    }
    await Client.findOneAndUpdate({ clientId: token.clientId }, { $set: updates });
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
