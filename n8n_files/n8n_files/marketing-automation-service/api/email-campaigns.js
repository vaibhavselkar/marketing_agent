import { NextResponse } from 'next/server';
import GoogleSheetsClient from '../../lib/google-sheets.js';
import EmailClient from '../../lib/email.js';
import { log, getCurrentTimestamp, formatRelativeTime } from '../../lib/utils.js';

/**
 * Email Campaigns API Route
 * Handles automated email sequences and campaign management
 */

export async function POST(request) {
  try {
    log('Email campaigns processing triggered', 'info');
    
    const data = await request.json();
    const { campaignType, testEmail } = data;

    // Initialize clients
    const sheetsClient = new GoogleSheetsClient();
    const emailClient = new EmailClient();

    // Validate connections
    if (!(await sheetsClient.validateConnection())) {
      return NextResponse.json({
        success: false,
        error: 'Google Sheets not configured'
      }, { status: 500 });
    }

    if (!(await emailClient.validateConfiguration())) {
      return NextResponse.json({
        success: false,
        error: 'Email configuration not valid'
      }, { status: 500 });
    }

    let results = [];

    if (testEmail) {
      // Send test email
      results = await sendTestEmail(emailClient, testEmail);
    } else {
      // Process campaign based on type
      switch (campaignType) {
        case 'welcome':
          results = await processWelcomeCampaign(sheetsClient, emailClient);
          break;
        case 'follow_up':
          results = await processFollowUpCampaign(sheetsClient, emailClient);
          break;
        case 'festival':
          results = await processFestivalCampaign(sheetsClient, emailClient, data);
          break;
        case 'reengagement':
          results = await processReengagementCampaign(sheetsClient, emailClient);
          break;
        case 'review_request':
          results = await processReviewRequestCampaign(sheetsClient, emailClient);
          break;
        default:
          return NextResponse.json({
            success: false,
            error: 'Invalid campaign type'
          }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email campaign processed successfully',
      data: {
        campaignType: testEmail ? 'test' : campaignType,
        totalEmails: results.length,
        sentEmails: results.filter(r => r.success).length,
        failedEmails: results.filter(r => !r.success).length,
        results
      }
    });

  } catch (error) {
    log(`Email Campaigns Error: ${error.message}`, 'error');
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Process welcome email campaign
 */
async function processWelcomeCampaign(sheetsClient, emailClient) {
  try {
    // Get new leads that haven't received welcome email
    const leads = await sheetsClient.getNewLeads();
    const results = [];

    for (const lead of leads) {
      if (lead.email && lead.status === 'new') {
        try {
          const result = await emailClient.sendWelcomeEmail(
            lead.email,
            lead.name || 'Customer'
          );

          // Update lead status
          await sheetsClient.updateLeadStatus(lead.phone, 'welcome_sent');

          results.push({
            leadId: lead.id,
            name: lead.name,
            email: lead.email,
            success: result.success,
            messageId: result.messageId,
            campaign: 'welcome'
          });

          log(`Welcome email sent to ${lead.name}: ${result.success}`, 'info');

        } catch (error) {
          log(`Error sending welcome email to ${lead.name}: ${error.message}`, 'error');
          results.push({
            leadId: lead.id,
            name: lead.name,
            email: lead.email,
            success: false,
            error: error.message,
            campaign: 'welcome'
          });
        }
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Welcome campaign error: ${error.message}`);
  }
}

/**
 * Process follow-up email campaign
 */
async function processFollowUpCampaign(sheetsClient, emailClient) {
  try {
    // Get leads that received welcome email but no follow-up
    const leads = await sheetsClient.getNewLeads();
    const results = [];

    for (const lead of leads) {
      if (lead.email && lead.status === 'welcome_sent') {
        try {
          const followUpLink = 'https://adornsilver.com/trending';
          
          const result = await emailClient.sendFollowUpEmail(
            lead.email,
            lead.name || 'Customer',
            followUpLink
          );

          // Update lead status
          await sheetsClient.updateLeadStatus(lead.phone, 'follow_up_sent');

          results.push({
            leadId: lead.id,
            name: lead.name,
            email: lead.email,
            success: result.success,
            messageId: result.messageId,
            campaign: 'follow_up'
          });

          log(`Follow-up email sent to ${lead.name}: ${result.success}`, 'info');

        } catch (error) {
          log(`Error sending follow-up email to ${lead.name}: ${error.message}`, 'error');
          results.push({
            leadId: lead.id,
            name: lead.name,
            email: lead.email,
            success: false,
            error: error.message,
            campaign: 'follow_up'
          });
        }
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Follow-up campaign error: ${error.message}`);
  }
}

/**
 * Process festival email campaign
 */
async function processFestivalCampaign(sheetsClient, emailClient, campaignData) {
  try {
    const { festival, offer, link } = campaignData;
    
    if (!festival || !offer || !link) {
      throw new Error('Festival, offer, and link are required for festival campaign');
    }

    // Get all customers and leads
    const leads = await sheetsClient.getNewLeads();
    const results = [];

    for (const lead of leads) {
      if (lead.email) {
        try {
          const result = await emailClient.sendFestivalEmail(
            lead.email,
            lead.name || 'Customer',
            festival,
            offer,
            link
          );

          results.push({
            leadId: lead.id,
            name: lead.name,
            email: lead.email,
            success: result.success,
            messageId: result.messageId,
            campaign: 'festival',
            festival,
            offer
          });

          log(`Festival email sent to ${lead.name}: ${result.success}`, 'info');

        } catch (error) {
          log(`Error sending festival email to ${lead.name}: ${error.message}`, 'error');
          results.push({
            leadId: lead.id,
            name: lead.name,
            email: lead.email,
            success: false,
            error: error.message,
            campaign: 'festival'
          });
        }
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Festival campaign error: ${error.message}`);
  }
}

/**
 * Process re-engagement email campaign
 */
async function processReengagementCampaign(sheetsClient, emailClient) {
  try {
    // Get inactive customers (no activity in 60+ days)
    const leads = await sheetsClient.getNewLeads();
    const results = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 60);

    for (const lead of leads) {
      if (lead.email && lead.lastContact) {
        const lastContactDate = new Date(lead.lastContact);
        
        if (lastContactDate < cutoffDate) {
          try {
            const offer = '20% OFF + Free Shipping';
            const link = 'https://adornsilver.com/new-arrivals';
            
            const result = await emailClient.sendReengagementEmail(
              lead.email,
              lead.name || 'Customer',
              offer,
              link
            );

            results.push({
              leadId: lead.id,
              name: lead.name,
              email: lead.email,
              success: result.success,
              messageId: result.messageId,
              campaign: 'reengagement',
              offer
            });

            log(`Re-engagement email sent to ${lead.name}: ${result.success}`, 'info');

          } catch (error) {
            log(`Error sending re-engagement email to ${lead.name}: ${error.message}`, 'error');
            results.push({
              leadId: lead.id,
              name: lead.name,
              email: lead.email,
              success: false,
              error: error.message,
              campaign: 'reengagement'
            });
          }
        }
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Re-engagement campaign error: ${error.message}`);
  }
}

/**
 * Process review request email campaign
 */
async function processReviewRequestCampaign(sheetsClient, emailClient) {
  try {
    // Get customers who made purchases in last 7 days
    const leads = await sheetsClient.getNewLeads();
    const results = [];

    for (const lead of leads) {
      if (lead.email && lead.lastContact) {
        const lastContactDate = new Date(lead.lastContact);
        const daysSinceContact = (new Date() - lastContactDate) / (1000 * 60 * 60 * 24);
        
        // Send review request 7 days after last contact
        if (daysSinceContact >= 7 && daysSinceContact <= 14) {
          try {
            const reviewLink = 'https://adornsilver.com/reviews';
            
            const result = await emailClient.sendReviewRequestEmail(
              lead.email,
              lead.name || 'Customer',
              reviewLink
            );

            results.push({
              leadId: lead.id,
              name: lead.name,
              email: lead.email,
              success: result.success,
              messageId: result.messageId,
              campaign: 'review_request'
            });

            log(`Review request email sent to ${lead.name}: ${result.success}`, 'info');

          } catch (error) {
            log(`Error sending review request email to ${lead.name}: ${error.message}`, 'error');
            results.push({
              leadId: lead.id,
              name: lead.name,
              email: lead.email,
              success: false,
              error: error.message,
              campaign: 'review_request'
            });
          }
        }
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Review request campaign error: ${error.message}`);
  }
}

/**
 * Send test email
 */
async function sendTestEmail(emailClient, testEmail) {
  try {
    const result = await emailClient.sendWelcomeEmail(
      testEmail,
      'Test Customer'
    );

    return [{
      email: testEmail,
      success: result.success,
      messageId: result.messageId,
      campaign: 'test'
    }];
  } catch (error) {
    throw new Error(`Test email error: ${error.message}`);
  }
}

/**
 * Get campaign statistics
 */
export async function GET(request) {
  try {
    const sheetsClient = new GoogleSheetsClient();
    
    if (!(await sheetsClient.validateConnection())) {
      return NextResponse.json({
        success: false,
        error: 'Google Sheets not configured'
      }, { status: 500 });
    }

    const analytics = await sheetsClient.getAnalytics();

    return NextResponse.json({
      success: true,
      data: {
        campaignStats: {
          totalLeads: analytics.totalLeads,
          newLeads: analytics.newLeads,
          conversionRate: analytics.conversionRate,
          leadsBySource: analytics.leadsBySource,
          leadsByInterest: analytics.leadsByInterest
        },
        lastUpdated: getCurrentTimestamp('datetime'),
        relativeTime: formatRelativeTime(getCurrentTimestamp('iso'))
      }
    });

  } catch (error) {
    log(`Campaign Statistics Error: ${error.message}`, 'error');
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Schedule campaign
 */
export async function PUT(request) {
  try {
    const data = await request.json();
    const { campaignType, scheduleTime, recurring } = data;

    if (!campaignType || !scheduleTime) {
      return NextResponse.json({
        success: false,
        error: 'Campaign type and schedule time are required'
      }, { status: 400 });
    }

    // In a real implementation, you would:
    // 1. Store the scheduled campaign in a database
    // 2. Set up a cron job or scheduled task
    // 3. Trigger the campaign at the specified time

    return NextResponse.json({
      success: true,
      message: 'Campaign scheduled successfully',
      data: {
        campaignType,
        scheduleTime,
        recurring: recurring || false,
        scheduledAt: getCurrentTimestamp()
      }
    });

  } catch (error) {
    log(`Schedule Campaign Error: ${error.message}`, 'error');
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Handle other HTTP methods
 */
export async function DELETE(request) {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 });
}

export async function PATCH(request) {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 });
}