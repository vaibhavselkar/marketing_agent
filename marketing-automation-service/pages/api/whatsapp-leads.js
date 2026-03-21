import GoogleSheetsClient from '../../lib/google-sheets.js';
import WhatsAppClient from '../../lib/whatsapp.js';
import EmailClient from '../../lib/email.js';
import { getClientConfig } from '../../lib/config.js';
import { log, formatPhoneNumber, validateEmail } from '../../lib/utils.js';

export default async function handler(req, res) {
  const clientId = req.query.clientId || req.body?.clientId;

  if (!clientId) return res.status(400).json({ success: false, error: 'clientId is required' });

  let cfg;
  try {
    cfg = await getClientConfig(clientId);
  } catch (e) {
    return res.status(404).json({ success: false, error: e.message });
  }

  // GET — lead statistics
  if (req.method === 'GET') {
    try {
      const sheetsClient = new GoogleSheetsClient(cfg);
      if (!(await sheetsClient.validateConnection()))
        return res.status(500).json({ success: false, error: 'Google Sheets not configured' });
      const analytics = await sheetsClient.getAnalytics();
      return res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST — process new leads from Google Sheets
  if (req.method === 'POST') {
    try {
      const sheetsClient   = new GoogleSheetsClient(cfg);
      const whatsappClient = new WhatsAppClient(cfg);
      const emailClient    = new EmailClient(cfg);

      if (!(await sheetsClient.validateConnection()))
        return res.status(500).json({ success: false, error: 'Google Sheets not configured' });
      if (!(await whatsappClient.validateCredentials()))
        return res.status(500).json({ success: false, error: 'WhatsApp credentials not configured' });

      const newLeads = await sheetsClient.getNewLeads();
      log(`Found ${newLeads.length} new leads for ${cfg.businessName}`, 'info');

      const results = [];

      for (const lead of newLeads) {
        try {
          if (!lead.phone) continue;

          const whatsappResult = await whatsappClient.sendWelcomeMessage(lead.phone, lead.name || 'Customer');

          let emailResult = null;
          if (lead.email && validateEmail(lead.email))
            emailResult = await emailClient.sendWelcomeEmail(lead.email, lead.name || 'Customer');

          await whatsappClient.notifyAdminNewLead(lead);
          await sheetsClient.updateLeadStatus(lead.phone, 'contacted');

          results.push({ name: lead.name, phone: lead.phone, whatsappResult, emailResult, status: 'processed' });
        } catch (err) {
          results.push({ name: lead.name, phone: lead.phone, error: err.message, status: 'failed' });
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          totalLeads: newLeads.length,
          processedLeads: results.filter(r => r.status === 'processed').length,
          failedLeads: results.filter(r => r.status === 'failed').length,
          results
        }
      });
    } catch (error) {
      log(`WhatsApp Leads Error: ${error.message}`, 'error');
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT — manually add a lead
  if (req.method === 'PUT') {
    try {
      const { name, phone, email, source, interest } = req.body;
      if (!name || !phone) return res.status(400).json({ success: false, error: 'name and phone are required' });

      const sheetsClient   = new GoogleSheetsClient(cfg);
      const whatsappClient = new WhatsAppClient(cfg);
      const emailClient    = new EmailClient(cfg);

      const leadData = { name, phone: formatPhoneNumber(phone), email: email || '', source: source || 'Manual', interest: interest || 'General' };
      await sheetsClient.addLead(leadData);

      const whatsappResult = await whatsappClient.sendWelcomeMessage(leadData.phone, leadData.name);
      await whatsappClient.notifyAdminNewLead(leadData);

      let emailResult = null;
      if (leadData.email && validateEmail(leadData.email))
        emailResult = await emailClient.sendWelcomeEmail(leadData.email, leadData.name);

      return res.status(200).json({ success: true, data: { lead: leadData, whatsappResult, emailResult } });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // PATCH — update lead status
  if (req.method === 'PATCH') {
    try {
      const { phone, status, lastContact } = req.body;
      if (!phone || !status) return res.status(400).json({ success: false, error: 'phone and status are required' });
      const sheetsClient = new GoogleSheetsClient(cfg);
      await sheetsClient.updateLeadStatus(formatPhoneNumber(phone), status, lastContact);
      return res.status(200).json({ success: true, message: 'Lead status updated' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
