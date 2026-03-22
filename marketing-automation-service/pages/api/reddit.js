import { getClientConfig } from '../../lib/config';
import RedditClient from '../../lib/reddit';

export default async function handler(req, res) {
  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: 'clientId required' });

  const cfg = await getClientConfig(clientId);
  if (!cfg) return res.status(404).json({ error: 'Client not found' });

  if (req.method === 'GET') {
    const reddit = new RedditClient(cfg);
    const valid = await reddit.validateCredentials();
    return res.json({
      success: true,
      configured: reddit.isConfigured,
      valid,
      subreddits: reddit.subreddits,
    });
  }

  if (req.method === 'POST') {
    const { title, text, body, url, kind, subreddit } = req.body || {};
    const reddit = new RedditClient(cfg);

    if (!reddit.isConfigured) {
      return res.status(400).json({ error: 'Reddit credentials not configured for this client' });
    }

    try {
      let result;

      if (subreddit) {
        // Post to a specific subreddit
        result = await reddit.submitPost({
          subreddit,
          title: title || `${cfg.businessName} — New Update`,
          text: text || body || '',
          url,
          kind: kind || (url ? 'link' : 'self'),
        });
      } else {
        // Broadcast to all configured subreddits
        result = await reddit.postPromotion({
          title: title || `${cfg.businessName} — New Update`,
          body: text || body || '',
          link: url,
        });
      }

      return res.json({ success: true, result });
    } catch (err) {
      console.error('Reddit API error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ error: 'Method not allowed' });
}
