import connectDB from './db.js';
import Client from './models/Client.js';

/**
 * Fetch a client's full config from MongoDB by clientId.
 * Falls back to env vars for single-tenant / local dev use.
 *
 * @param {string} clientId
 * @returns {Promise<object>} client config object
 */
export async function getClientConfig(clientId) {
  if (!clientId) throw new Error('clientId is required');

  await connectDB();
  const client = await Client.findOne({ clientId, isActive: true }).lean();
  if (!client) throw new Error(`Client "${clientId}" not found or inactive`);

  return client;
}

/**
 * Validate that the request carries a valid apiKey for the given clientId.
 * Pass apiKey via header: x-api-key or in the request body.
 *
 * @param {string} clientId
 * @param {string} apiKey
 * @returns {Promise<boolean>}
 */
export async function validateClientKey(clientId, apiKey) {
  await connectDB();
  const client = await Client.findOne({ clientId, apiKey, isActive: true }).lean();
  return !!client;
}

export default { getClientConfig, validateClientKey };
