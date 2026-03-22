import { getClientConfig } from '../../lib/config';
import TelegramClient from '../../lib/telegram';

export default async function handler(req, res) {
  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: 'clientId required' });

  const cfg = await getClientConfig(clientId);
  if (!cfg) return res.status(404).json({ error: 'Client not found' });

  if (req.method === 'GET') {
    // Validate Telegram credentials
    const tg = new TelegramClient(cfg);
    const valid = await tg.validateCredentials();
    return res.json({
      success: true,
      configured: !!(cfg.telegramBotToken && cfg.telegramChatId),
      valid,
    });
  }

  if (req.method === 'POST') {
    const { action, message, title, body, link } = req.body || {};
    const tg = new TelegramClient(cfg);

    try {
      let result;

      if (action === 'broadcast') {
        if (!message && !body) return res.status(400).json({ error: 'message or body required' });
        result = await tg.sendBroadcast(message || body);

      } else if (action === 'post') {
        if (!title || !body) return res.status(400).json({ error: 'title and body required' });
        result = await tg.sendContentPost(title, body, link);

      } else if (action === 'weekly_report') {
        const { analytics } = req.body;
        result = await tg.sendWeeklyReport(analytics || {});

      } else {
        return res.status(400).json({ error: 'Invalid action. Use: broadcast, post, weekly_report' });
      }

      return res.json({ success: true, result });
    } catch (err) {
      console.error('Telegram API error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ error: 'Method not allowed' });
}
