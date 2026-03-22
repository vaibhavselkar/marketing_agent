import axios from 'axios';

/**
 * Reddit API Client — free, organic reach
 * Setup: reddit.com/prefs/apps → Create App → Script type
 * Docs: https://www.reddit.com/dev/api/
 */
class RedditClient {
  constructor(cfg) {
    this.clientId     = cfg.redditClientId;
    this.clientSecret = cfg.redditClientSecret;
    this.username     = cfg.redditUsername?.replace(/^u\//, '');
    this.password     = cfg.redditPassword;
    this.subreddits   = (cfg.redditSubreddits || '')
      .split(',')
      .map(s => s.trim().replace(/^r\//, ''))
      .filter(Boolean);
    this.accessToken  = null;
    this.tokenExpiry  = 0;
    this.cfg          = cfg;
  }

  get isConfigured() {
    return !!(this.clientId && this.clientSecret && this.username && this.password);
  }

  /** Get or refresh OAuth2 access token */
  async getToken() {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken;

    const res = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      `grant_type=password&username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}`,
      {
        auth: { username: this.clientId, password: this.clientSecret },
        headers: { 'User-Agent': `${this.cfg.businessName || 'MarketingBot'}/1.0 by ${this.username}` },
      }
    );

    this.accessToken = res.data.access_token;
    this.tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  /** Post a link or text post to a subreddit */
  async submitPost({ subreddit, title, text = '', url = '', kind = 'self' }) {
    if (!this.isConfigured) throw new Error('Reddit credentials not configured');
    const token = await this.getToken();

    const payload = {
      sr: subreddit,
      title,
      kind,         // 'self' for text post, 'link' for URL post
      resubmit: true,
      nsfw: false,
    };
    if (kind === 'self') payload.text = text;
    if (kind === 'link') payload.url = url;

    const res = await axios.post(
      'https://oauth.reddit.com/api/submit',
      new URLSearchParams(payload).toString(),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': `${this.cfg.businessName || 'MarketingBot'}/1.0 by ${this.username}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const data = res.data?.jquery || res.data;
    if (res.data?.success === false) throw new Error(JSON.stringify(res.data.errors));
    return { success: true, data };
  }

  /** Broadcast a text post to all configured subreddits */
  async broadcastToSubreddits({ title, text, url, kind = 'self' }) {
    if (!this.isConfigured) return { skipped: true, reason: 'Reddit not configured' };
    if (!this.subreddits.length) return { skipped: true, reason: 'No subreddits configured' };

    const results = [];
    for (const subreddit of this.subreddits) {
      try {
        const result = await this.submitPost({ subreddit, title, text, url, kind });
        results.push({ subreddit, success: true });
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.error(`Reddit post to r/${subreddit} failed:`, err.message);
        results.push({ subreddit, success: false, error: err.message });
      }
    }
    return { results };
  }

  /** Post a promotional/informational text post */
  async postPromotion({ title, body, link = '' }) {
    const text = link ? `${body}\n\n${link}` : body;
    return await this.broadcastToSubreddits({ title, text, kind: 'self' });
  }

  /** Validate credentials by fetching account info */
  async validateCredentials() {
    if (!this.isConfigured) return false;
    try {
      const token = await this.getToken();
      const res = await axios.get('https://oauth.reddit.com/api/v1/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': `${this.cfg.businessName || 'MarketingBot'}/1.0 by ${this.username}`,
        },
      });
      return !!res.data?.name;
    } catch {
      return false;
    }
  }
}

export default RedditClient;
