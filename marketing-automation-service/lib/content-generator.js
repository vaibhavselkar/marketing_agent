import axios from 'axios';

/**
 * AI Content Generator
 * Uses Gemini to write ready-to-post content for Reddit, Instagram, Telegram
 * Each piece is platform-specific — tone, length, format are all different
 */
class ContentGenerator {
  constructor(cfg) {
    this.cfg    = cfg;
    this.apiKey = cfg.geminiApiKey;
    this.apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
  }

  get isConfigured() {
    return !!this.apiKey;
  }

  /** Call Gemini with a prompt, return raw text */
  async callGemini(prompt, maxTokens = 600) {
    const res = await axios.post(this.apiUrl, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.85, maxOutputTokens: maxTokens },
    });
    return res.data.candidates[0].content.parts[0].text.trim();
  }

  /**
   * Generate content for all channels at once
   * @param {string} contentType - product_showcase | festival | educational | offer | new_arrival
   * @param {string} topic - Optional: specific product name or topic to write about
   * @returns {{ reddit, instagram, telegram }}
   */
  async generateAll(contentType = 'product_showcase', topic = '') {
    if (!this.isConfigured) throw new Error('Gemini API key not configured');

    const context = this.buildContext(contentType, topic);

    const [reddit, instagram, telegram] = await Promise.all([
      this.generateReddit(context),
      this.generateInstagram(context),
      this.generateTelegram(context),
    ]);

    return { reddit, instagram, telegram, contentType, topic, generatedAt: new Date().toISOString() };
  }

  /** Generate Reddit post — value-first, not salesy, organic */
  async generateReddit(context) {
    const prompt = `
You are writing a Reddit post for ${this.cfg.businessName} (${this.cfg.tagline}, based in ${this.cfg.country}).
They sell: ${this.cfg.productType}
Content goal: ${context.goal}
Topic/focus: ${context.topic}
Today: ${context.todayContext}

REDDIT RULES — very important:
- Reddit BANS promotional posts. Write as a genuine community member sharing useful info.
- Title: A question, insight, or helpful tip — NOT a product pitch
- Body: Share genuine value, tips, or a story first (150-200 words)
- Mention the business very naturally at the end only if it fits (or skip it)
- No "Buy now", no "Check out our store", no explicit ads
- Write like a real person, not a marketer

Return ONLY this JSON (no markdown, no extra text):
{
  "title": "the reddit post title",
  "body": "the full post body"
}`;

    const raw = await this.callGemini(prompt, 500);
    return this.parseJSON(raw, { title: 'Helpful tips post', body: 'Content generation failed.' });
  }

  /** Generate Instagram caption + hashtags */
  async generateInstagram(context) {
    const prompt = `
You are a social media manager for ${this.cfg.businessName} (${this.cfg.tagline}).
They sell: ${this.cfg.productType} in ${this.cfg.country}
Content goal: ${context.goal}
Topic/focus: ${context.topic}
Today: ${context.todayContext}
Discount code: ${this.cfg.discountCode || 'none'}

Write an Instagram caption that:
- Starts with a hook (question, bold statement, or emotion — first 3 words matter)
- 80-120 words total
- 2-3 relevant emojis (not excessive)
- Clear CTA at end (DM us, tap link in bio, use code ${this.cfg.discountCode || 'WELCOME'})
- 20 hashtags on a new line after the caption (mix of popular + niche)

Return ONLY this JSON (no markdown, no extra text):
{
  "caption": "the full instagram caption with emojis and CTA",
  "hashtags": "#tag1 #tag2 #tag3 ... (20 hashtags as one string)"
}`;

    const raw = await this.callGemini(prompt, 400);
    return this.parseJSON(raw, { caption: 'Caption generation failed.', hashtags: '' });
  }

  /** Generate Telegram broadcast message — short, direct */
  async generateTelegram(context) {
    const prompt = `
Write a Telegram broadcast message for ${this.cfg.businessName}.
They sell: ${this.cfg.productType}
Content goal: ${context.goal}
Topic/focus: ${context.topic}
Today: ${context.todayContext}
Currency: ${this.cfg.currency || '₹'}
Discount code: ${this.cfg.discountCode || 'none'}

Rules:
- 40-70 words max
- Direct announcement style
- 1-2 emojis
- Clear offer or announcement
- End with action step (Reply to this message / Visit website / DM us)

Return ONLY this JSON (no markdown, no extra text):
{
  "message": "the telegram message"
}`;

    const raw = await this.callGemini(prompt, 200);
    const parsed = this.parseJSON(raw, { message: 'Message generation failed.' });
    return parsed.message;
  }

  /** Build shared context object for all generators */
  buildContext(contentType, topic) {
    const day   = new Date().toLocaleDateString('en-IN', { weekday: 'long' });
    const month = new Date().toLocaleDateString('en-IN', { month: 'long' });

    const goals = {
      product_showcase: 'Showcase a specific product, highlight features and benefits',
      festival:         'Create festive content tied to upcoming Indian festivals or seasons',
      educational:      'Educate the audience about the product category, share tips or insights',
      offer:            'Promote a discount or special offer, drive urgency',
      new_arrival:      'Announce a new product or collection launch',
    };

    const topicStr = topic
      ? topic
      : `${this.cfg.productType} by ${this.cfg.businessName}`;

    return {
      goal:         goals[contentType] || goals.product_showcase,
      topic:        topicStr,
      todayContext: `${day}, ${month} — write content relevant to this time of year in ${this.cfg.country}`,
    };
  }

  /** Safely parse JSON from Gemini (it sometimes adds extra text) */
  parseJSON(raw, fallback) {
    try {
      // Strip markdown code blocks if present
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const match   = cleaned.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      return fallback;
    } catch {
      return fallback;
    }
  }
}

export default ContentGenerator;
