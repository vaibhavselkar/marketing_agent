import { google } from 'googleapis';

/**
 * Google Sheets Client for Marketing Automation
 * Handles all Google Sheets operations for CRM, leads, and analytics
 */
class GoogleSheetsClient {
  /**
   * @param {object} cfg - Client config from MongoDB
   */
  constructor(cfg) {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: cfg.googleClientEmail,
        private_key: cfg.googlePrivateKey?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.spreadsheetId = cfg.googleSheetId;
  }

  /**
   * Log Instagram conversation
   * @param {string} username - Instagram username
   * @param {string} message - Customer message
   * @param {string} response - AI-generated response
   * @param {string} channel - Communication channel
   * @returns {Promise<void>}
   */
  async logConversation(username, message, response, channel = 'Instagram') {
    try {
      const values = [
        [
          username,
          message,
          response,
          new Date().toISOString(),
          channel,
          new Date().toLocaleDateString(),
          new Date().toLocaleTimeString()
        ]
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Conversations!A:G',
        valueInputOption: 'RAW',
        requestBody: {
          values
        }
      });
    } catch (error) {
      console.error('Google Sheets Conversation Logging Error:', error);
      throw error;
    }
  }

  /**
   * Add new lead to CRM
   * @param {object} leadData - Lead information
   * @returns {Promise<void>}
   */
  async addLead(leadData) {
    try {
      const values = [
        [
          leadData.name || '',
          leadData.phone || '',
          leadData.email || '',
          leadData.source || 'Unknown',
          leadData.interest || 'General',
          new Date().toISOString(),
          'new',
          leadData.tags || '',
          leadData.lastContact || '',
          leadData.notes || ''
        ]
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Leads!A:J',
        valueInputOption: 'RAW',
        requestBody: {
          values
        }
      });
    } catch (error) {
      console.error('Google Sheets Lead Addition Error:', error);
      throw error;
    }
  }

  /**
   * Update lead status
   * @param {string} phone - Lead phone number
   * @param {string} status - New status
   * @param {string} lastContact - Last contact date
   * @returns {Promise<void>}
   */
  async updateLeadStatus(phone, status, lastContact = new Date().toISOString()) {
    try {
      // Get all leads to find the row
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Leads!A:J',
      });

      const rows = response.data.values || [];
      let targetRow = null;

      // Find the row with matching phone number
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][1] === phone) {
          targetRow = i + 1; // +1 because Google Sheets is 1-indexed
          break;
        }
      }

      if (targetRow) {
        // Update status and last contact
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Leads!G${targetRow}:H${targetRow}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[status, lastContact]]
          }
        });
      }
    } catch (error) {
      console.error('Google Sheets Lead Update Error:', error);
      throw error;
    }
  }

  /**
   * Get new leads for processing
   * @returns {Promise<Array>} Array of new leads
   */
  async getNewLeads() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Leads!A:J',
      });

      const rows = response.data.values || [];
      const headers = rows[0];
      const newLeads = [];

      // Skip header row and find new leads
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const status = row[6]; // Status column

        if (status === 'new' || status === 'New') {
          const lead = {
            id: i,
            name: row[0],
            phone: row[1],
            email: row[2],
            source: row[3],
            interest: row[4],
            dateAdded: row[5],
            status: row[6],
            tags: row[7],
            lastContact: row[8],
            notes: row[9]
          };
          newLeads.push(lead);
        }
      }

      return newLeads;
    } catch (error) {
      console.error('Google Sheets Get New Leads Error:', error);
      throw error;
    }
  }

  /**
   * Add customer to customers sheet
   * @param {object} customerData - Customer information
   * @returns {Promise<void>}
   */
  async addCustomer(customerData) {
    try {
      const values = [
        [
          customerData.name || '',
          customerData.phone || '',
          customerData.email || '',
          customerData.lastPurchase || new Date().toISOString(),
          customerData.totalSpent || 0,
          customerData.orderCount || 1,
          customerData.status || 'active',
          customerData.tags || '',
          new Date().toISOString()
        ]
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Customers!A:I',
        valueInputOption: 'RAW',
        requestBody: {
          values
        }
      });
    } catch (error) {
      console.error('Google Sheets Add Customer Error:', error);
      throw error;
    }
  }

  /**
   * Update customer purchase
   * @param {string} phone - Customer phone number
   * @param {number} amount - Purchase amount
   * @returns {Promise<void>}
   */
  async updateCustomerPurchase(phone, amount) {
    try {
      // Get all customers to find the row
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Customers!A:I',
      });

      const rows = response.data.values || [];
      let targetRow = null;
      let currentData = null;

      // Find the row with matching phone number
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][1] === phone) {
          targetRow = i + 1; // +1 because Google Sheets is 1-indexed
          currentData = {
            totalSpent: parseFloat(rows[i][4]) || 0,
            orderCount: parseInt(rows[i][5]) || 0
          };
          break;
        }
      }

      if (targetRow) {
        // Update total spent and order count
        const newTotalSpent = currentData.totalSpent + amount;
        const newOrderCount = currentData.orderCount + 1;

        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Customers!E${targetRow}:F${targetRow}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[newTotalSpent, newOrderCount]]
          }
        });
      }
    } catch (error) {
      console.error('Google Sheets Update Customer Error:', error);
      throw error;
    }
  }

  /**
   * Get analytics data
   * @returns {Promise<object>} Analytics data
   */
  async getAnalytics() {
    try {
      // Get leads data
      const leadsResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Leads!A:J',
      });

      // Get customers data
      const customersResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Customers!A:I',
      });

      // Get conversations data
      const conversationsResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Conversations!A:G',
      });

      const leads = leadsResponse.data.values || [];
      const customers = customersResponse.data.values || [];
      const conversations = conversationsResponse.data.values || [];

      // Calculate metrics
      const totalLeads = leads.length - 1; // -1 for header
      const newLeads = leads.filter(row => row[6] === 'new').length;
      const totalCustomers = customers.length - 1; // -1 for header
      const totalConversations = conversations.length - 1; // -1 for header

      // Calculate conversion rate
      const conversionRate = totalLeads > 0 ? ((totalCustomers / totalLeads) * 100).toFixed(2) : 0;

      return {
        totalLeads,
        newLeads,
        totalCustomers,
        totalConversations,
        conversionRate: parseFloat(conversionRate),
        leadsBySource: this.groupBy(leads, 3), // Source column
        leadsByInterest: this.groupBy(leads, 4), // Interest column
        recentActivity: conversations.slice(-10) // Last 10 conversations
      };
    } catch (error) {
      console.error('Google Sheets Analytics Error:', error);
      throw error;
    }
  }

  /**
   * Group data by column
   * @private
   */
  groupBy(data, columnIndex) {
    const groups = {};
    for (let i = 1; i < data.length; i++) {
      const value = data[i][columnIndex] || 'Unknown';
      groups[value] = (groups[value] || 0) + 1;
    }
    return groups;
  }

  /**
   * Validate Google Sheets connection
   * @returns {Promise<boolean>} True if connection is valid
   */
  async validateConnection() {
    try {
      await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });
      return true;
    } catch (error) {
      console.error('Google Sheets Connection Error:', error);
      return false;
    }
  }
}

export default GoogleSheetsClient;