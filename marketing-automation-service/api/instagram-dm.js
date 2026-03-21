import { NextResponse } from 'next/server';
import GeminiClient from '../../lib/gemini.js';
import GoogleSheetsClient from '../../lib/google-sheets.js';
import { getClientConfig } from '../../lib/config.js';
import { log } from '../../lib/utils.js';

/**
 * Instagram DM Auto-Reply API Route
 * Handles Instagram webhook for new messages and generates AI responses
 * Requires ?clientId=xxx in the URL
 */

export async function POST(request) {
  try {
    log('Instagram DM webhook triggered', 'info');

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    if (!clientId) {
      return NextResponse.json({ success: false, error: 'clientId is required' }, { status: 400 });
    }

    let cfg;
    try {
      cfg = await getClientConfig(clientId);
    } catch (e) {
      return NextResponse.json({ success: false, error: e.message }, { status: 404 });
    }

    const data = await request.json();
    log(`Received Instagram data for ${cfg.businessName}: ${JSON.stringify(data)}`, 'info');

    // Extract message data from webhook
    const entry = data.entry?.[0];
    if (!entry) {
      return NextResponse.json({
        success: false,
        error: 'Invalid webhook data'
      }, { status: 400 });
    }

    const messaging = entry.messaging?.[0];
    if (!messaging) {
      return NextResponse.json({
        success: false,
        error: 'No messaging data found'
      }, { status: 400 });
    }

    const sender = messaging.sender;
    const message = messaging.message;
    
    if (!sender || !message) {
      return NextResponse.json({
        success: false,
        error: 'Missing sender or message data'
      }, { status: 400 });
    }

    const username = sender.username || 'Customer';
    const messageText = message.text;
    const senderId = sender.id;
    const timestamp = entry.time;

    if (!messageText) {
      return NextResponse.json({
        success: false,
        error: 'No message text found'
      }, { status: 400 });
    }

    // Initialize clients with this client's config
    const geminiClient = new GeminiClient(cfg);
    const sheetsClient = new GoogleSheetsClient(cfg);

    // Validate API keys
    if (!geminiClient.validateApiKey()) {
      return NextResponse.json({
        success: false,
        error: 'Gemini API key not configured'
      }, { status: 500 });
    }

    if (!(await sheetsClient.validateConnection())) {
      return NextResponse.json({
        success: false,
        error: 'Google Sheets not configured'
      }, { status: 500 });
    }

    // Detect message category
    const category = detectMessageCategory(messageText);
    log(`Detected category: ${category} for message: ${messageText}`, 'info');

    // Generate AI response
    const responseText = await geminiClient.generateInstagramResponse(
      messageText,
      category,
      username
    );

    log(`Generated response: ${responseText}`, 'info');

    // Send response via Instagram API
    const instagramResponse = await sendInstagramReply(senderId, responseText, cfg);

    // Log conversation to Google Sheets
    await sheetsClient.logConversation(
      username,
      messageText,
      responseText,
      'Instagram'
    );

    // Log the interaction
    log(`Instagram DM processed: ${username} -> ${responseText}`, 'info');

    return NextResponse.json({
      success: true,
      message: 'Instagram DM processed successfully',
      data: {
        username,
        message: messageText,
        response: responseText,
        category,
        instagramResponse
      }
    });

  } catch (error) {
    log(`Instagram DM Error: ${error.message}`, 'error');
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Detect message category based on keywords
 * @param {string} message - Customer message
 * @returns {string} Detected category
 */
function detectMessageCategory(message) {
  const text = message.toLowerCase();
  
  if (text.includes('price') || text.includes('how much') || text.includes('cost')) {
    return 'price_enquiry';
  } else if (text.includes('available') || text.includes('in stock') || text.includes('ready')) {
    return 'availability';
  } else if (text.includes('custom') || text.includes('personalized') || text.includes('bespoke')) {
    return 'custom_order';
  } else if (text.includes('shipping') || text.includes('delivery') || text.includes('cod') || text.includes('dispatch')) {
    return 'shipping';
  } else {
    return 'general_inquiry';
  }
}

/**
 * Send reply via Instagram API
 * @param {string} senderId - Instagram sender ID
 * @param {string} responseText - Response text
 * @returns {Promise<object>} Instagram API response
 */
async function sendInstagramReply(senderId, responseText, cfg) {
  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${cfg.instagramPageId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.instagramAccessToken}`
      },
      body: JSON.stringify({
        recipient: {
          id: senderId
        },
        message: {
          text: responseText
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    log(`Instagram API Error: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Handle GET requests (webhook verification)
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const clientId = url.searchParams.get('clientId');
    let verifyToken = process.env.INSTAGRAM_VERIFY_TOKEN;
    if (clientId) {
      try { const cfg = await getClientConfig(clientId); verifyToken = cfg.instagramVerifyToken; } catch (_) {}
    }

    // Verify token matches
    if (mode === 'subscribe' && token === verifyToken) {
      return NextResponse.json(challenge, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Verification failed'
      }, { status: 403 });
    }
  } catch (error) {
    log(`Instagram GET Error: ${error.message}`, 'error');
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Handle other HTTP methods
 */
export async function PUT(request) {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 });
}

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