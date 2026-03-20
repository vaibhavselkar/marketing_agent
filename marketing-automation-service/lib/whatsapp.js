import axios from 'axios';

/**
 * WhatsApp Cloud API Client (Meta)
 * Uses Meta's official WhatsApp Business Cloud API — free up to 1000 conversations/month
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
class WhatsAppClient {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
    this.apiUrl = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
  }

  /**
   * Send a plain text WhatsApp message
   * @param {string} to - Recipient phone number (any format, auto-cleaned)
   * @param {string} message - Message text
   * @returns {Promise<object>} Message response
   */
  async sendMessage(to, message) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to: this.formatPhoneNumber(to),
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
        to: response.data.contacts?.[0]?.wa_id
      };
    } catch (error) {
      const detail = error.response?.data?.error?.message || error.message;
      console.error('WhatsApp Message Error:', detail);
      throw new Error(`Failed to send WhatsApp message: ${detail}`);
    }
  }

  /**
   * Send a pre-approved template message
   * Templates must be approved in Meta Business Manager before use
   * @param {string} to - Recipient phone number
   * @param {string} templateName - Approved template name
   * @param {string} languageCode - e.g. 'en_US', 'en'
   * @param {Array<string>} bodyParams - Values to fill {{1}}, {{2}} placeholders
   * @returns {Promise<object>} Message response
   */
  async sendTemplateMessage(to, templateName, languageCode = 'en', bodyParams = []) {
    try {
      const components = bodyParams.length > 0
        ? [{
            type: 'body',
            parameters: bodyParams.map(text => ({ type: 'text', text }))
          }]
        : [];

      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to: this.formatPhoneNumber(to),
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id
      };
    } catch (error) {
      const detail = error.response?.data?.error?.message || error.message;
      console.error('WhatsApp Template Error:', detail);
      throw new Error(`Failed to send template message: ${detail}`);
    }
  }

  /**
   * Send welcome message to new lead
   */
  async sendWelcomeMessage(phone, name) {
    const message = `Hi ${name} ✨ Welcome to Adorn Silver! We handcraft premium 925 silver jewellery for women who love elegant, meaningful pieces. Here's 10% off your first order: ADORN10. Browse our collection: https://adornsilver.com\n\nTeam Adorn Silver`;
    return await this.sendMessage(phone, message);
  }

  /**
   * Send follow-up message
   */
  async sendFollowUpMessage(phone, name, link) {
    const message = `Hi ${name}! Did you find something you loved? Here's what's trending: ${link}\n\nTeam Adorn Silver`;
    return await this.sendMessage(phone, message);
  }

  /**
   * Send order confirmation
   */
  async sendOrderConfirmation(phone, name, orderId, amount) {
    const message = `Thank you for your order, ${name}! 🎉\n\nOrder ID: ${orderId}\nAmount: ₹${amount}\n\nWe'll notify you when your order ships. Thank you for choosing Adorn Silver!\n\nTeam Adorn Silver`;
    return await this.sendMessage(phone, message);
  }

  /**
   * Send care tips
   */
  async sendCareTips(phone, name, careLink) {
    const message = `Hi ${name}, your Adorn Silver piece deserves the best care 🌿 Here's how to keep it shining: ${careLink}\n\nTeam Adorn Silver`;
    return await this.sendMessage(phone, message);
  }

  /**
   * Send review request
   */
  async sendReviewRequest(phone, name, reviewLink) {
    const message = `Hi ${name}, we hope you're loving your Adorn Silver jewellery! ✨ Could you share your experience? Your feedback helps us serve you better: ${reviewLink}\n\nTeam Adorn Silver`;
    return await this.sendMessage(phone, message);
  }

  /**
   * Send festival campaign message
   */
  async sendFestivalMessage(phone, name, festival, offer, link) {
    const message = `Happy ${festival}, ${name}! 🎊✨ This festive season, adorn yourself and your loved ones with our handcrafted silver collection. Special offer: ${offer}. Shop now: ${link}\n\nTeam Adorn Silver`;
    return await this.sendMessage(phone, message);
  }

  /**
   * Send re-engagement message
   */
  async sendReengagementMessage(phone, name, offer, link) {
    const message = `We miss you, ${name}! 💫 Here's a special offer just for you: ${offer}. Come see what's new at Adorn Silver: ${link}\n\nTeam Adorn Silver`;
    return await this.sendMessage(phone, message);
  }

  /**
   * Notify admin on their personal WhatsApp when a new lead arrives
   */
  async notifyAdminNewLead(lead) {
    if (!this.adminPhone) return null;
    try {
      const message = `🔔 New Lead Alert!\n\nName: ${lead.name || 'Unknown'}\nPhone: ${lead.phone}\nEmail: ${lead.email || '-'}\nSource: ${lead.source || 'Unknown'}\nInterest: ${lead.interest || 'General'}\n\nReply on WhatsApp or check your dashboard.`;
      return await this.sendMessage(this.adminPhone, message);
    } catch (error) {
      console.error('Admin notification error:', error.message);
      return null;
    }
  }

  /**
   * Validate Meta API credentials by fetching phone number info
   * @returns {Promise<boolean>}
   */
  async validateCredentials() {
    if (!this.accessToken || !this.phoneNumberId) return false;
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v19.0/${this.phoneNumberId}`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error('WhatsApp credentials validation failed:', error.response?.data?.error?.message || error.message);
      return false;
    }
  }

  /**
   * Format phone number to Meta's required format (digits only, with country code)
   * e.g. "+91 98765 43210" → "919876543210"
   * @private
   */
  formatPhoneNumber(phone) {
    const digits = phone.replace(/\D/g, '');
    // If 10-digit Indian number, prepend 91
    if (digits.length === 10) return `91${digits}`;
    return digits;
  }
}

export default WhatsAppClient;
