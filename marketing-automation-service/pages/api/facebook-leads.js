import connectDB from '../../lib/db.js';
import Client from '../../lib/models/Client.js';
import GoogleSheetsClient from '../../lib/google-sheets.js';
import WhatsAppClient from '../../lib/whatsapp.js';
import EmailClient from '../../lib/email.js';
import TelegramClient from '../../lib/telegram.js';

/**
 * Facebook Lead Ads Webhook
 * When someone fills a Facebook/Instagram Lead Gen Ad form,
 * Meta sends the lead data here instantly.
 *
 * Setup in Facebook:
 * 1. Facebook Developer Console → Your App → Webhooks
 * 2. Subscribe to: leadgen
 * 3. Webhook URL: https://yourdomain.com/api/facebook-leads?clientId=YOUR_CLIENT_ID
 * 4. Verify Token: use the client's instagramVerifyToken
 */
export default async function handler(req, res) {
  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: 'clientId required' });

  await connectDB();
  const cfg = await Client.findOne({ clientId, isActive: true }).lean();
  if (!cfg) return res.status(404).json({ error: 'Client not found' });

  // GET — Facebook webhook verification handshake
  if (req.method === 'GET') {
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === cfg.instagramVerifyToken) {
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Verification failed' });
  }

  // POST — incoming lead from Facebook Lead Ad
  if (req.method === 'POST') {
    try {
      const { entry = [] } = req.body;

      for (const e of entry) {
        const changes = e.changes || [];
        for (const change of changes) {
          if (change.field !== 'leadgen') continue;

          const leadData   = change.value || {};
          const leadId     = leadData.leadgen_id;
          const formId     = leadData.form_id;
          const pageId     = leadData.page_id;
          const fieldData  = leadData.field_data || [];

          // Extract fields from the Lead Ad form
          const lead = extractLeadFields(fieldData);
          lead.source   = 'Facebook Lead Ad';
          lead.interest = `Lead Ad Form ${formId}`;

          // Skip if no contact info
          if (!lead.phone && !lead.email) continue;

          // 1. Save to Google Sheets CRM
          if (cfg.googleSheetId && cfg.googleClientEmail && cfg.googlePrivateKey) {
            try {
              const sheets = new GoogleSheetsClient(cfg);
              await sheets.addLead({
                name:     lead.name || 'Facebook Lead',
                phone:    lead.phone || '',
                email:    lead.email || '',
                source:   lead.source,
                interest: lead.interest,
              });
            } catch (err) {
              console.error('Sheets error:', err.message);
            }
          }

          // 2. Send WhatsApp welcome message
          if (cfg.aiSensyApiKey && lead.phone) {
            try {
              const wa = new WhatsAppClient(cfg);
              await wa.sendWelcomeMessage({
                phone: lead.phone,
                name:  lead.name || 'there',
              });
            } catch (err) {
              console.error('WhatsApp error:', err.message);
            }
          }

          // 3. Send welcome email
          if (cfg.gmailUser && cfg.gmailAppPassword && lead.email) {
            try {
              const emailClient = new EmailClient(cfg);
              await emailClient.sendWelcomeEmail({
                email: lead.email,
                name:  lead.name || 'there',
              });
            } catch (err) {
              console.error('Email error:', err.message);
            }
          }

          // 4. Notify admin on Telegram
          if (cfg.telegramBotToken && cfg.telegramChatId) {
            try {
              const telegram = new TelegramClient(cfg);
              await telegram.notifyNewLead({
                name:   lead.name || 'Facebook Lead',
                phone:  lead.phone || 'N/A',
                email:  lead.email || 'N/A',
                source: lead.source,
              });
            } catch (err) {
              console.error('Telegram error:', err.message);
            }
          }
        }
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Facebook leads webhook error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}

/** Extract name, phone, email from Facebook Lead Ad field_data array */
function extractLeadFields(fieldData) {
  const lead = {};
  for (const field of fieldData) {
    const key   = (field.name || '').toLowerCase();
    const value = Array.isArray(field.values) ? field.values[0] : field.value;

    if (key.includes('name') && !key.includes('last'))  lead.name  = value;
    if (key === 'full_name')                             lead.name  = value;
    if (key.includes('phone') || key.includes('mobile')) lead.phone = value;
    if (key.includes('email'))                           lead.email = value;
    if (key.includes('city') || key.includes('location')) lead.city = value;
  }
  // Combine first + last name if separate
  if (!lead.name && fieldData.find(f => f.name === 'first_name')) {
    const first = fieldData.find(f => f.name === 'first_name')?.values?.[0] || '';
    const last  = fieldData.find(f => f.name === 'last_name')?.values?.[0] || '';
    lead.name   = `${first} ${last}`.trim();
  }
  return lead;
}
