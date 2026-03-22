import axios from 'axios';

/**
 * Telegram Bot Client — completely free, no rate limits for normal use
 * Create a bot: message @BotFather on Telegram → /newbot
 * Docs: https://core.telegram.org/bots/api
 */
class TelegramClient {
  constructor(cfg) {
    this.token   = cfg.telegramBotToken;
    this.chatId  = cfg.telegramChatId;   // admin/channel chat ID
    this.cfg     = cfg;
    this.apiUrl  = `https://api.telegram.org/bot${this.token}`;
  }

  /** Send a plain text message */
  async sendMessage(chatId, text) {
    try {
      const res = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id:    chatId,
        text,
        parse_mode: 'HTML'
      });
      return { success: true, messageId: res.data.result?.message_id };
    } catch (error) {
      const detail = error.response?.data?.description || error.message;
      console.error('Telegram Error:', detail);
      throw new Error(`Telegram send failed: ${detail}`);
    }
  }

  /** Notify admin when new lead comes in */
  async notifyAdminNewLead(lead) {
    if (!this.chatId) return null;
    try {
      const text = `🔔 <b>New Lead!</b>\n\n👤 <b>Name:</b> ${lead.name || 'Unknown'}\n📞 <b>Phone:</b> ${lead.phone}\n📧 <b>Email:</b> ${lead.email || '-'}\n📌 <b>Source:</b> ${lead.source || 'Unknown'}\n💬 <b>Interest:</b> ${lead.interest || 'General'}`;
      return await this.sendMessage(this.chatId, text);
    } catch (error) {
      console.error('Telegram admin notify error:', error.message);
      return null;
    }
  }

  /** Broadcast a campaign message to a channel or group */
  async sendBroadcast(text) {
    if (!this.chatId) throw new Error('Telegram chat ID not configured');
    return await this.sendMessage(this.chatId, text);
  }

  /** Send weekly analytics report */
  async sendWeeklyReport(analytics) {
    if (!this.chatId) return null;
    try {
      const text = `📊 <b>Weekly Report — ${this.cfg.businessName}</b>\n\n👥 Total Leads: <b>${analytics.totalLeads || 0}</b>\n✅ Conversion Rate: <b>${analytics.conversionRate || 0}%</b>\n💬 Conversations: <b>${analytics.totalConversations || 0}</b>\n📱 WhatsApp Sent: <b>${analytics.whatsappSent || 0}</b>`;
      return await this.sendMessage(this.chatId, text);
    } catch (error) {
      console.error('Telegram weekly report error:', error.message);
      return null;
    }
  }

  /** Post to a Reddit-style content scheduler via Telegram channel */
  async sendContentPost(title, body, link = '') {
    if (!this.chatId) return null;
    try {
      const text = `📢 <b>${title}</b>\n\n${body}${link ? `\n\n🔗 ${link}` : ''}`;
      return await this.sendMessage(this.chatId, text);
    } catch (error) {
      console.error('Telegram content post error:', error.message);
      return null;
    }
  }

  /** Validate credentials */
  async validateCredentials() {
    if (!this.token) return false;
    try {
      const res = await axios.get(`${this.apiUrl}/getMe`);
      return res.data.ok === true;
    } catch {
      return false;
    }
  }
}

export default TelegramClient;
