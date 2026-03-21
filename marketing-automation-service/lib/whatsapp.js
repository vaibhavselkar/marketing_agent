import axios from 'axios';

/**
 * WhatsApp Client using AiSensy API
 * Free up to 1,000 conversations/month per client
 * Docs: https://documenter.getpostman.com/view/12530989/UzBnqmgD
 */
class WhatsAppClient {
  constructor(cfg) {
    this.apiKey        = cfg.aiSensyApiKey;
    this.adminPhone    = cfg.adminWhatsappNumber;
    this.cfg           = cfg;
    this.apiUrl        = 'https://backend.aisensy.com/campaign/t1/api';
  }

  /**
   * Core send — calls AiSensy campaign API
   * @param {string} phone - recipient number
   * @param {string} campaignName - campaign created in AiSensy dashboard
   * @param {string} name - recipient name (shown in template)
   * @param {Array}  templateParams - template variable values
   */
  async sendCampaign(phone, campaignName, name = 'Customer', templateParams = []) {
    try {
      const response = await axios.post(this.apiUrl, {
        apiKey:         this.apiKey,
        campaignName,
        destination:    this.formatPhone(phone),
        userName:       name,
        source:         'Marketing Automation',
        media:          {},
        templateParams,
        tags:           [],
        attributes:     {}
      });

      return { success: true, data: response.data };
    } catch (error) {
      const detail = error.response?.data?.message || error.message;
      console.error('AiSensy Error:', detail);
      throw new Error(`WhatsApp send failed: ${detail}`);
    }
  }

  /** Send welcome message */
  async sendWelcomeMessage(phone, name) {
    const params = [
      name,
      this.cfg.businessName,
      this.cfg.discountCode || '',
      this.cfg.website || ''
    ];
    return await this.sendCampaign(phone, this.cfg.aiSensyWelcomeCampaign || 'welcome_message', name, params);
  }

  /** Send follow-up message */
  async sendFollowUpMessage(phone, name, link) {
    return await this.sendCampaign(phone, this.cfg.aiSensyFollowupCampaign || 'follow_up', name, [name, link]);
  }

  /** Send order confirmation */
  async sendOrderConfirmation(phone, name, orderId, amount) {
    return await this.sendCampaign(phone, this.cfg.aiSensyOrderCampaign || 'order_confirmation', name, [name, orderId, `${this.cfg.currency}${amount}`]);
  }

  /** Send festival campaign */
  async sendFestivalMessage(phone, name, festival, offer, link) {
    return await this.sendCampaign(phone, this.cfg.aiSensyFestivalCampaign || 'festival_campaign', name, [name, festival, offer, link]);
  }

  /** Send re-engagement message */
  async sendReengagementMessage(phone, name, offer, link) {
    return await this.sendCampaign(phone, this.cfg.aiSensyReengageCampaign || 're_engagement', name, [name, offer, link]);
  }

  /** Send review request */
  async sendReviewRequest(phone, name, reviewLink) {
    return await this.sendCampaign(phone, this.cfg.aiSensyReviewCampaign || 'review_request', name, [name, reviewLink]);
  }

  /** Notify admin when new lead arrives */
  async notifyAdminNewLead(lead) {
    if (!this.adminPhone) return null;
    try {
      return await this.sendCampaign(
        this.adminPhone,
        this.cfg.aiSensyAdminCampaign || 'new_lead_alert',
        'Admin',
        [lead.name || 'Unknown', lead.phone, lead.email || '-', lead.source || 'Unknown']
      );
    } catch (error) {
      console.error('Admin notification error:', error.message);
      return null;
    }
  }

  /** Validate AiSensy API key */
  async validateCredentials() {
    return !!(this.apiKey && this.apiKey.length > 10);
  }

  /** Format phone: any format → 919876543210 */
  formatPhone(phone) {
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    return digits;
  }
}

export default WhatsAppClient;
