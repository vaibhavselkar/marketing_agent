import connectDB from '../../lib/db.js';
import Client from '../../lib/models/Client.js';
import GoogleSheetsClient from '../../lib/google-sheets.js';
import WhatsAppClient from '../../lib/whatsapp.js';
import EmailClient from '../../lib/email.js';
import TelegramClient from '../../lib/telegram.js';

/**
 * Lead Capture API
 * Called when someone submits the public lead form at /lead-form/[clientId]
 * Runs the full lead pipeline: CRM → WhatsApp → Email → Telegram alert
 */
export default async function handler(req, res) {
  // Allow cross-origin so the form can be embedded on any website
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: 'clientId required' });

  const { name, phone, email, interest = '', source = 'Lead Form' } = req.body;

  // Basic validation
  if (!name || (!phone && !email)) {
    return res.status(400).json({ error: 'Name and at least phone or email are required' });
  }

  await connectDB();
  const cfg = await Client.findOne({ clientId, isActive: true }).lean();
  if (!cfg) return res.status(404).json({ error: 'Client not found' });

  const results = {};

  // 1. Save to Google Sheets CRM
  if (cfg.googleSheetId && cfg.googleClientEmail && cfg.googlePrivateKey) {
    try {
      const sheets = new GoogleSheetsClient(cfg);
      await sheets.addLead({ name, phone: phone || '', email: email || '', source, interest });
      results.crm = true;
    } catch (err) {
      console.error('Sheets error:', err.message);
      results.crm = false;
    }
  }

  // 2. WhatsApp welcome message
  if (cfg.aiSensyApiKey && phone) {
    try {
      const wa = new WhatsAppClient(cfg);
      await wa.sendWelcomeMessage({ phone, name });
      results.whatsapp = true;
    } catch (err) {
      console.error('WhatsApp error:', err.message);
      results.whatsapp = false;
    }
  }

  // 3. Welcome email
  if (cfg.gmailUser && cfg.gmailAppPassword && email) {
    try {
      const emailClient = new EmailClient(cfg);
      await emailClient.sendWelcomeEmail({ email, name });
      results.email = true;
    } catch (err) {
      console.error('Email error:', err.message);
      results.email = false;
    }
  }

  // 4. Telegram alert to admin
  if (cfg.telegramBotToken && cfg.telegramChatId) {
    try {
      const telegram = new TelegramClient(cfg);
      await telegram.notifyNewLead({ name, phone: phone || 'N/A', email: email || 'N/A', source });
      results.telegram = true;
    } catch (err) {
      console.error('Telegram error:', err.message);
      results.telegram = false;
    }
  }

  return res.status(200).json({ success: true, results });
}
