import { NextResponse } from 'next/server';
import GoogleSheetsClient from '../../lib/google-sheets.js';
import WhatsAppClient from '../../lib/whatsapp.js';
import EmailClient from '../../lib/email.js';
import { getClientConfig } from '../../lib/config.js';
import { log, formatPhoneNumber, validateEmail } from '../../lib/utils.js';

/**
 * WhatsApp Lead Capture API Route
 * Handles lead processing from Google Sheets and sends automated messages
 * Requires ?clientId=xxx in the URL
 */

export async function POST(request) {
  try {
    log('WhatsApp leads processing triggered', 'info');

    // Resolve clientId from URL params or request body
    const { searchParams } = new URL(request.url);
    const data = await request.json();
    const clientId = searchParams.get('clientId') || data.clientId;

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'clientId is required' }, { status: 400 });
    }

    // Load this client's config from MongoDB
    let cfg;
    try {
      cfg = await getClientConfig(clientId);
    } catch (e) {
      return NextResponse.json({ success: false, error: e.message }, { status: 404 });
    }

    log(`Processing leads for client: ${cfg.businessName}`, 'info');

    // Initialize clients with this client's config
    const sheetsClient = new GoogleSheetsClient(cfg);
    const whatsappClient = new WhatsAppClient(cfg);
    const emailClient = new EmailClient(cfg);

    // Validate connections
    if (!(await sheetsClient.validateConnection())) {
      return NextResponse.json({
        success: false,
        error: 'Google Sheets not configured'
      }, { status: 500 });
    }

    if (!(await whatsappClient.validateCredentials())) {
      return NextResponse.json({
        success: false,
        error: 'WhatsApp credentials not configured'
      }, { status: 500 });
    }

    if (!(await emailClient.validateConfiguration())) {
      return NextResponse.json({
        success: false,
        error: 'Email configuration not valid'
      }, { status: 500 });
    }

    // Get new leads from Google Sheets
    const newLeads = await sheetsClient.getNewLeads();
    log(`Found ${newLeads.length} new leads`, 'info');

    const results = [];

    // Process each new lead
    for (const lead of newLeads) {
      try {
        // Validate lead data
        if (!lead.phone || !validatePhoneNumber(lead.phone)) {
          log(`Invalid phone number for lead: ${lead.name}`, 'warn');
          continue;
        }

        // Send WhatsApp welcome message
        const whatsappResult = await whatsappClient.sendWelcomeMessage(
          lead.phone,
          lead.name || 'Customer'
        );

        // Send welcome email if email is provided
        let emailResult = null;
        if (lead.email && validateEmail(lead.email)) {
          emailResult = await emailClient.sendWelcomeEmail(
            lead.email,
            lead.name || 'Customer'
          );
        }

        // Notify admin on their WhatsApp about the new lead
        await whatsappClient.notifyAdminNewLead(lead);

        // Update lead status to contacted
        await sheetsClient.updateLeadStatus(lead.phone, 'contacted');

        // Add to results
        results.push({
          leadId: lead.id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          whatsappResult,
          emailResult,
          status: 'processed'
        });

        log(`Processed lead: ${lead.name} - WhatsApp: ${whatsappResult.success}`, 'info');

      } catch (error) {
        log(`Error processing lead ${lead.name}: ${error.message}`, 'error');
        results.push({
          leadId: lead.id,
          name: lead.name,
          phone: lead.phone,
          error: error.message,
          status: 'failed'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Leads processed successfully',
      data: {
        totalLeads: newLeads.length,
        processedLeads: results.filter(r => r.status === 'processed').length,
        failedLeads: results.filter(r => r.status === 'failed').length,
        results
      }
    });

  } catch (error) {
    log(`WhatsApp Leads Error: ${error.message}`, 'error');
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Manual lead addition endpoint
 */
export async function PUT(request) {
  try {
    log('Manual lead addition triggered', 'info');
    
    const data = await request.json();
    
    // Validate required fields
    const { name, phone, email, source, interest } = data;
    
    if (!name || !phone) {
      return NextResponse.json({
        success: false,
        error: 'Name and phone are required'
      }, { status: 400 });
    }

    // Initialize clients
    const sheetsClient = new GoogleSheetsClient();
    const whatsappClient = new WhatsAppClient();
    const emailClient = new EmailClient();

    // Validate connections
    if (!(await sheetsClient.validateConnection())) {
      return NextResponse.json({
        success: false,
        error: 'Google Sheets not configured'
      }, { status: 500 });
    }

    if (!(await whatsappClient.validateCredentials())) {
      return NextResponse.json({
        success: false,
        error: 'WhatsApp credentials not configured'
      }, { status: 500 });
    }

    // Add lead to Google Sheets
    const leadData = {
      name,
      phone: formatPhoneNumber(phone),
      email: email || '',
      source: source || 'Manual',
      interest: interest || 'General'
    };

    await sheetsClient.addLead(leadData);

    // Send welcome message
    const whatsappResult = await whatsappClient.sendWelcomeMessage(
      leadData.phone,
      leadData.name
    );

    let emailResult = null;
    if (leadData.email && validateEmail(leadData.email)) {
      emailResult = await emailClient.sendWelcomeEmail(
        leadData.email,
        leadData.name
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lead added and processed successfully',
      data: {
        lead: leadData,
        whatsappResult,
        emailResult
      }
    });

  } catch (error) {
    log(`Manual Lead Addition Error: ${error.message}`, 'error');
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Get lead statistics
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
      data: analytics
    });

  } catch (error) {
    log(`Lead Statistics Error: ${error.message}`, 'error');
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Update lead status
 */
export async function PATCH(request) {
  try {
    const data = await request.json();
    const { phone, status, lastContact } = data;

    if (!phone || !status) {
      return NextResponse.json({
        success: false,
        error: 'Phone and status are required'
      }, { status: 400 });
    }

    const sheetsClient = new GoogleSheetsClient();
    
    if (!(await sheetsClient.validateConnection())) {
      return NextResponse.json({
        success: false,
        error: 'Google Sheets not configured'
      }, { status: 500 });
    }

    await sheetsClient.updateLeadStatus(
      formatPhoneNumber(phone),
      status,
      lastContact
    );

    return NextResponse.json({
      success: true,
      message: 'Lead status updated successfully'
    });

  } catch (error) {
    log(`Update Lead Status Error: ${error.message}`, 'error');
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone number is valid
 */
function validatePhoneNumber(phone) {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid Indian mobile number (10 digits)
  return cleanPhone.length === 10 && cleanPhone.startsWith('9') || 
         cleanPhone.length === 10 && cleanPhone.startsWith('8') ||
         cleanPhone.length === 10 && cleanPhone.startsWith('7') ||
         cleanPhone.length === 10 && cleanPhone.startsWith('6');
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