import GeminiClient from '../../lib/gemini.js';
import GoogleSheetsClient from '../../lib/google-sheets.js';
import { getClientConfig } from '../../lib/config.js';
import { log } from '../../lib/utils.js';

export default async function handler(req, res) {
  const clientId = req.query.clientId;

  // GET — webhook verification
  if (req.method === 'GET') {
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    let verifyToken = process.env.INSTAGRAM_VERIFY_TOKEN;
    if (clientId) {
      try { const cfg = await getClientConfig(clientId); verifyToken = cfg.instagramVerifyToken; } catch (_) {}
    }

    if (mode === 'subscribe' && token === verifyToken)
      return res.status(200).send(challenge);
    return res.status(403).json({ success: false, error: 'Verification failed' });
  }

  // POST — handle incoming DM
  if (req.method === 'POST') {
    if (!clientId) return res.status(400).json({ success: false, error: 'clientId is required' });

    let cfg;
    try {
      cfg = await getClientConfig(clientId);
    } catch (e) {
      return res.status(404).json({ success: false, error: e.message });
    }

    try {
      const data     = req.body;
      const entry    = data.entry?.[0];
      const messaging = entry?.messaging?.[0];

      if (!entry || !messaging) return res.status(400).json({ success: false, error: 'Invalid webhook data' });

      const senderId   = messaging.sender?.id;
      const messageText = messaging.message?.text;
      const username   = messaging.sender?.username || 'Customer';

      if (!messageText) return res.status(200).json({ success: true, message: 'No text, skipped' });

      const geminiClient = new GeminiClient(cfg);
      const sheetsClient = new GoogleSheetsClient(cfg);

      if (!geminiClient.validateApiKey())
        return res.status(500).json({ success: false, error: 'Gemini API key not configured' });

      const category    = detectCategory(messageText);
      const responseText = await geminiClient.generateInstagramResponse(messageText, category, username);

      await sendInstagramReply(senderId, responseText, cfg);
      await sheetsClient.logConversation(username, messageText, responseText, 'Instagram');

      log(`Instagram DM processed for ${cfg.businessName}: ${username}`, 'info');
      return res.status(200).json({ success: true, data: { username, category, response: responseText } });
    } catch (error) {
      log(`Instagram DM Error: ${error.message}`, 'error');
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

function detectCategory(message) {
  const t = message.toLowerCase();
  if (t.includes('price') || t.includes('how much') || t.includes('cost')) return 'price_enquiry';
  if (t.includes('available') || t.includes('in stock'))                    return 'availability';
  if (t.includes('custom') || t.includes('personalized'))                   return 'custom_order';
  if (t.includes('shipping') || t.includes('delivery'))                     return 'shipping';
  return 'general_inquiry';
}

async function sendInstagramReply(senderId, text, cfg) {
  const r = await fetch(`https://graph.facebook.com/v19.0/${cfg.instagramPageId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.instagramAccessToken}` },
    body: JSON.stringify({ recipient: { id: senderId }, message: { text } })
  });
  if (!r.ok) throw new Error(`Instagram API error: ${r.status}`);
  return r.json();
}
