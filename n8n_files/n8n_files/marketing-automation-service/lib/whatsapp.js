import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * WhatsApp API Client for Marketing Automation
 * Handles WhatsApp messaging via Twilio API
 */
class WhatsAppClient {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    this.apiBaseUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`;
  }

  /**
   * Send WhatsApp message
   * @param {string} to - Recipient phone number
   * @param {string} message - Message content
   * @param {string} mediaUrl - Optional media URL
   * @returns {Promise<object>} Message response
   */
  async sendMessage(to, message, mediaUrl = null) {
    try {
      // Format phone number for WhatsApp
      const formattedTo = this.formatPhoneNumber(to);

      const data = new URLSearchParams();
      data.append('To', formattedTo);
      data.append('From', this.whatsappNumber);
      data.append('Body', message);

      if (mediaUrl) {
        data.append('MediaUrl', mediaUrl);
      }

      const response = await axios.post(
        `${this.apiBaseUrl}/Messages.json`,
        data,
        {
          auth: {
            username: this.accountSid,
            password: this.authToken
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        success: true,
        sid: response.data.sid,
        status: response.data.status,
        to: response.data.to,
        from: response.data.from,
        body: response.data.body
      };
    } catch (error) {
      console.error('WhatsApp Message Error:', error.response?.data || error.message);
      throw new Error('Failed to send WhatsApp message');
    }
  }

  /**
   * Send WhatsApp template message
   * @param {string} to - Recipient phone number
   * @param {string} templateName - Template name
   * @param {Array} parameters - Template parameters
   * @returns {Promise<object>} Message response
   */
  async sendTemplateMessage(to, templateName, parameters = []) {
    try {
      const formattedTo = this.formatPhoneNumber(to);

      const data = new URLSearchParams();
      data.append('To', formattedTo);
      data.append('From', this.whatsappNumber);
      data.append('ContentSid', templateName);
      data.append('ContentVariables', JSON.stringify({ parameters }));

      const response = await axios.post(
        `${this.apiBaseUrl}/Messages.json`,
        data,
        {
          auth: {
            username: this.accountSid,
            password: this.authToken
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        success: true,
        sid: response.data.sid,
        status: response.data.status,
        to: response.data.to,
        from: response.data.from
      };
    } catch (error) {
      console.error('WhatsApp Template Message Error:', error.response?.data || error.message);
      throw new Error('Failed to send WhatsApp template message');
    }
  }

  /**
   * Send welcome message to new lead
   * @param {string} phone - Lead phone number
   * @param {string} name - Lead name
   * @returns {Promise<object>} Message response
   */
  async sendWelcomeMessage(phone, name) {
    try {
      const message = `Hi ${name} ✨ Welcome to Adorn Silver! We handcraft premium 925 silver jewellery for women who love elegant, meaningful pieces. Here's 10% off your first order: ADORN10. Browse our collection: https://adornsilver.com\n\nTeam Adorn Silver`;

      return await this.sendMessage(phone, message);
    } catch (error) {
      console.error('Welcome Message Error:', error);
      throw error;
    }
  }

  /**
   * Send follow-up message
   * @param {string} phone - Customer phone number
   * @param {string} name - Customer name
   * @param {string} link - Follow-up link
   * @returns {Promise<object>} Message response
   */
  async sendFollowUpMessage(phone, name, link) {
    try {
      const message = `Hi ${name}! Did you find something you loved? Here's what's trending: ${link}\n\nTeam Adorn Silver`;

      return await this.sendMessage(phone, message);
    } catch (error) {
      console.error('Follow-up Message Error:', error);
      throw error;
    }
  }

  /**
   * Send order confirmation
   * @param {string} phone - Customer phone number
   * @param {string} name - Customer name
   * @param {string} orderId - Order ID
   * @param {number} amount - Order amount
   * @returns {Promise<object>} Message response
   */
  async sendOrderConfirmation(phone, name, orderId, amount) {
    try {
      const message = `Thank you for your order, ${name}! 🎉\n\nOrder ID: ${orderId}\nAmount: ₹${amount}\n\nWe'll notify you when your order ships. Thank you for choosing Adorn Silver!\n\nTeam Adorn Silver`;

      return await this.sendMessage(phone, message);
    } catch (error) {
      console.error('Order Confirmation Error:', error);
      throw error;
    }
  }

  /**
   * Send care tips
   * @param {string} phone - Customer phone number
   * @param {string} name - Customer name
   * @param {string} careLink - Care guide link
   * @returns {Promise<object>} Message response
   */
  async sendCareTips(phone, name, careLink) {
    try {
      const message = `Hi ${name}, your Adorn Silver piece deserves the best care 🌿 Here's how to keep it shining: ${careLink}\n\nTeam Adorn Silver`;

      return await this.sendMessage(phone, message);
    } catch (error) {
      console.error('Care Tips Error:', error);
      throw error;
    }
  }

  /**
   * Send review request
   * @param {string} phone - Customer phone number
   * @param {string} name - Customer name
   * @param {string} reviewLink - Review link
   * @returns {Promise<object>} Message response
   */
  async sendReviewRequest(phone, name, reviewLink) {
    try {
      const message = `Hi ${name}, we hope you're loving your Adorn Silver jewellery! ✨ Could you share your experience? Your feedback helps us serve you better: ${reviewLink}\n\nTeam Adorn Silver`;

      return await this.sendMessage(phone, message);
    } catch (error) {
      console.error('Review Request Error:', error);
      throw error;
    }
  }

  /**
   * Send festival campaign message
   * @param {string} phone - Customer phone number
   * @param {string} name - Customer name
   * @param {string} festival - Festival name
   * @param {string} offer - Festival offer
   * @param {string} link - Campaign link
   * @returns {Promise<object>} Message response
   */
  async sendFestivalMessage(phone, name, festival, offer, link) {
    try {
      const message = `Happy ${festival}, ${name}! 🎊✨ This festive season, adorn yourself and your loved ones with our handcrafted silver collection. Special offer: ${offer}. Shop now: ${link}\n\nTeam Adorn Silver`;

      return await this.sendMessage(phone, message);
    } catch (error) {
      console.error('Festival Message Error:', error);
      throw error;
    }
  }

  /**
   * Send re-engagement message
   * @param {string} phone - Customer phone number
   * @param {string} name - Customer name
   * @param {string} offer - Re-engagement offer
   * @param {string} link - Re-engagement link
   * @returns {Promise<object>} Message response
   */
  async sendReengagementMessage(phone, name, offer, link) {
    try {
      const message = `We miss you, ${name}! 💫 Here's a special offer just for you: ${offer}. Come see what's new at Adorn Silver: ${link}\n\nTeam Adorn Silver`;

      return await this.sendMessage(phone, message);
    } catch (error) {
      console.error('Re-engagement Message Error:', error);
      throw error;
    }
  }

  /**
   * Format phone number for WhatsApp
   * @private
   */
  formatPhoneNumber(phone) {
    // Remove spaces, dashes, and other formatting
    const cleanNumber = phone.replace(/\D/g, '');
    
    // Add country code if not present (assuming India +91)
    if (!cleanNumber.startsWith('91') && cleanNumber.length === 10) {
      return `whatsapp:+91${cleanNumber}`;
    } else if (cleanNumber.startsWith('91')) {
      return `whatsapp:+${cleanNumber}`;
    } else {
      return `whatsapp:+${cleanNumber}`;
    }
  }

  /**
   * Get message status
   * @param {string} messageSid - Message SID
   * @returns {Promise<object>} Message status
   */
  async getMessageStatus(messageSid) {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/Messages/${messageSid}.json`,
        {
          auth: {
            username: this.accountSid,
            password: this.authToken
          }
        }
      );

      return {
        sid: response.data.sid,
        status: response.data.status,
        to: response.data.to,
        from: response.data.from,
        body: response.data.body,
        dateCreated: response.data.date_created,
        dateSent: response.data.date_sent,
        dateUpdated: response.data.date_updated
      };
    } catch (error) {
      console.error('Get Message Status Error:', error.response?.data || error.message);
      throw new Error('Failed to get message status');
    }
  }

  /**
   * Validate Twilio credentials
   * @returns {Promise<boolean>} True if credentials are valid
   */
  async validateCredentials() {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}.json`,
        {
          auth: {
            username: this.accountSid,
            password: this.authToken
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Twilio Credentials Validation Error:', error);
      return false;
    }
  }

  /**
   * Get account usage
   * @returns {Promise<object>} Usage statistics
   */
  async getUsage() {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/Usage/Records/Today.json`,
        {
          auth: {
            username: this.accountSid,
            password: this.authToken
          }
        }
      );

      return {
        messages: response.data.messages,
        price: response.data.price,
        priceUnit: response.data.price_unit
      };
    } catch (error) {
      console.error('Get Usage Error:', error.response?.data || error.message);
      throw new Error('Failed to get usage statistics');
    }
  }
}

export default WhatsAppClient;