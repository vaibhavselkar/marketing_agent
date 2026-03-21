import { NextResponse } from 'next/server';
import connectDB from '../../lib/db.js';
import Client from '../../lib/models/Client.js';
import { log } from '../../lib/utils.js';
import crypto from 'crypto';

/**
 * Admin-only: Manage client accounts.
 * Protected by ADMIN_API_KEY environment variable.
 */

function requireAdminKey(request) {
  const key = request.headers.get('x-admin-key');
  if (!key || key !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/** GET /api/clients — list all clients */
export async function GET(request) {
  const authError = requireAdminKey(request);
  if (authError) return authError;

  try {
    await connectDB();
    const clients = await Client.find({}, '-googlePrivateKey -gmailAppPassword -whatsappAccessToken -apiKey').lean();
    return NextResponse.json({ success: true, data: clients });
  } catch (error) {
    log(`Clients GET error: ${error.message}`, 'error');
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/** POST /api/clients — create a new client */
export async function POST(request) {
  const authError = requireAdminKey(request);
  if (authError) return authError;

  try {
    await connectDB();
    const body = await request.json();

    // Auto-generate clientId and apiKey if not provided
    const clientId = body.clientId || crypto.randomBytes(6).toString('hex');
    const apiKey   = body.apiKey   || crypto.randomBytes(20).toString('hex');

    const client = await Client.create({ ...body, clientId, apiKey });

    return NextResponse.json({
      success: true,
      message: 'Client created',
      data: {
        clientId: client.clientId,
        apiKey:   client.apiKey,           // show once at creation
        businessName: client.businessName,
        webhooks: {
          whatsapp:  `/api/whatsapp-leads?clientId=${client.clientId}`,
          instagram: `/api/instagram-dm?clientId=${client.clientId}`,
          email:     `/api/email-campaigns?clientId=${client.clientId}`,
        }
      }
    }, { status: 201 });

  } catch (error) {
    log(`Clients POST error: ${error.message}`, 'error');
    const status = error.code === 11000 ? 409 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

/** PATCH /api/clients — update a client by clientId */
export async function PATCH(request) {
  const authError = requireAdminKey(request);
  if (authError) return authError;

  try {
    await connectDB();
    const body = await request.json();
    const { clientId, ...updates } = body;

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'clientId is required' }, { status: 400 });
    }

    const client = await Client.findOneAndUpdate(
      { clientId },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!client) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Client updated', data: { clientId: client.clientId, businessName: client.businessName } });

  } catch (error) {
    log(`Clients PATCH error: ${error.message}`, 'error');
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/** DELETE /api/clients — deactivate (soft delete) a client */
export async function DELETE(request) {
  const authError = requireAdminKey(request);
  if (authError) return authError;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'clientId is required' }, { status: 400 });
    }

    await Client.findOneAndUpdate({ clientId }, { isActive: false });
    return NextResponse.json({ success: true, message: `Client ${clientId} deactivated` });

  } catch (error) {
    log(`Clients DELETE error: ${error.message}`, 'error');
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
