import { getToken } from 'next-auth/jwt';
import connectDB from '../../lib/db.js';
import Client from '../../lib/models/Client.js';
import ContentGenerator from '../../lib/content-generator.js';
import InstagramPostClient from '../../lib/instagram-post.js';
import RedditClient from '../../lib/reddit.js';
import TelegramClient from '../../lib/telegram.js';

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return res.status(401).json({ error: 'Not logged in' });
  if (!token.clientId) return res.status(400).json({ error: 'Complete onboarding first' });

  await connectDB();
  const cfg = await Client.findOne({ clientId: token.clientId }).lean();
  if (!cfg) return res.status(404).json({ error: 'Client not found' });

  const generator = new ContentGenerator(cfg);

  // GET — generate content (does NOT post anywhere)
  if (req.method === 'GET') {
    const { contentType = 'product_showcase', topic = '' } = req.query;
    try {
      const content = await generator.generateAll(contentType, topic);
      return res.status(200).json({ success: true, content });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST — generate + post to selected channels
  if (req.method === 'POST') {
    const { contentType = 'product_showcase', topic = '', channels = [], imageUrl = '' } = req.body;

    try {
      // Always generate first
      const content = await generator.generateAll(contentType, topic);
      const results = {};

      // Post to each selected channel
      for (const channel of channels) {

        if (channel === 'reddit') {
          try {
            const reddit = new RedditClient(cfg);
            const result = await reddit.postPromotion({
              title: content.reddit.title,
              body:  content.reddit.body,
              link:  cfg.website || '',
            });
            results.reddit = { success: true, result };
          } catch (err) {
            results.reddit = { success: false, error: err.message };
          }
        }

        if (channel === 'telegram') {
          try {
            const telegram = new TelegramClient(cfg);
            await telegram.sendMessage(content.telegram);
            results.telegram = { success: true };
          } catch (err) {
            results.telegram = { success: false, error: err.message };
          }
        }

        if (channel === 'instagram') {
          try {
            const igClient = new InstagramPostClient(cfg);
            const caption  = `${content.instagram.caption}\n\n${content.instagram.hashtags}`;
            if (imageUrl) {
              const result = await igClient.postImage(imageUrl, caption);
              results.instagram = result;
            } else {
              results.instagram = await igClient.postCaptionOnly(caption);
            }
          } catch (err) {
            results.instagram = { success: false, error: err.message };
          }
        }
      }

      return res.status(200).json({ success: true, content, results });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
