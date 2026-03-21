import GoogleSheetsClient from '../../lib/google-sheets.js';
import EmailClient from '../../lib/email.js';
import { getClientConfig } from '../../lib/config.js';
import { log, getCurrentTimestamp } from '../../lib/utils.js';

export default async function handler(req, res) {
  const clientId = req.query.clientId || req.body?.clientId;

  if (!clientId) return res.status(400).json({ success: false, error: 'clientId is required' });

  let cfg;
  try {
    cfg = await getClientConfig(clientId);
  } catch (e) {
    return res.status(404).json({ success: false, error: e.message });
  }

  if (req.method === 'GET') {
    try {
      const sheetsClient = new GoogleSheetsClient(cfg);
      if (!(await sheetsClient.validateConnection()))
        return res.status(500).json({ success: false, error: 'Google Sheets not configured' });

      const analytics = await sheetsClient.getAnalytics();
      return res.status(200).json({
        success: true,
        data: {
          campaignStats: {
            totalLeads: analytics.totalLeads,
            newLeads: analytics.newLeads,
            conversionRate: analytics.conversionRate,
            leadsBySource: analytics.leadsBySource,
            leadsByInterest: analytics.leadsByInterest
          },
          lastUpdated: getCurrentTimestamp('datetime')
        }
      });
    } catch (error) {
      log(`Campaign Statistics Error: ${error.message}`, 'error');
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { campaignType, testEmail, festival, offer, link } = req.body;

      const sheetsClient = new GoogleSheetsClient(cfg);
      const emailClient  = new EmailClient(cfg);

      if (!(await sheetsClient.validateConnection()))
        return res.status(500).json({ success: false, error: 'Google Sheets not configured' });
      if (!(await emailClient.validateConfiguration()))
        return res.status(500).json({ success: false, error: 'Email not configured' });

      let results = [];

      if (testEmail) {
        const r = await emailClient.sendWelcomeEmail(testEmail, 'Test Customer');
        results = [{ email: testEmail, success: r.success, campaign: 'test' }];
      } else {
        const leads = await sheetsClient.getNewLeads();

        for (const lead of leads) {
          if (!lead.email) continue;
          try {
            let result;
            if (campaignType === 'welcome') {
              result = await emailClient.sendWelcomeEmail(lead.email, lead.name || 'Customer');
              await sheetsClient.updateLeadStatus(lead.phone, 'welcome_sent');
            } else if (campaignType === 'follow_up') {
              result = await emailClient.sendFollowUpEmail(lead.email, lead.name || 'Customer', cfg.website);
              await sheetsClient.updateLeadStatus(lead.phone, 'follow_up_sent');
            } else if (campaignType === 'festival') {
              if (!festival || !offer || !link)
                return res.status(400).json({ success: false, error: 'festival, offer, and link are required' });
              result = await emailClient.sendFestivalEmail(lead.email, lead.name || 'Customer', festival, offer, link);
            } else if (campaignType === 'reengagement') {
              result = await emailClient.sendReengagementEmail(lead.email, lead.name || 'Customer', '20% OFF', cfg.website);
            } else if (campaignType === 'review_request') {
              result = await emailClient.sendReviewRequestEmail(lead.email, lead.name || 'Customer', `${cfg.website}/reviews`);
            } else {
              return res.status(400).json({ success: false, error: 'Invalid campaignType' });
            }
            results.push({ name: lead.name, email: lead.email, success: result.success, campaign: campaignType });
          } catch (err) {
            results.push({ name: lead.name, email: lead.email, success: false, error: err.message });
          }
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          campaignType,
          totalEmails: results.length,
          sentEmails: results.filter(r => r.success).length,
          failedEmails: results.filter(r => !r.success).length,
          results
        }
      });
    } catch (error) {
      log(`Email Campaigns Error: ${error.message}`, 'error');
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
