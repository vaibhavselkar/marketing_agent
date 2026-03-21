import axios from 'axios';

/**
 * Google Gemini AI Client for Marketing Automation
 * Handles AI-powered message generation for Instagram DMs and other content
 */
class GeminiClient {
  /**
   * @param {object} cfg - Client config from MongoDB
   */
  constructor(cfg) {
    this.cfg    = cfg;
    this.apiKey = cfg.geminiApiKey;
    this.apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
  }

  /**
   * Generate response for Instagram DM
   * @param {string} message - Customer message
   * @param {string} category - Message category (price, availability, custom, shipping)
   * @param {string} customerName - Customer name for personalization
   * @returns {Promise<string>} Generated response
   */
  async generateInstagramResponse(message, category, customerName = '') {
    try {
      const prompt = this.buildInstagramPrompt(message, category, customerName);
      
      const response = await axios.post(this.apiUrl, {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 32,
          topP: 1,
          maxOutputTokens: 300,
          stopSequences: []
        }
      });

      const generatedText = response.data.candidates[0].content.parts[0].text;
      return this.cleanResponse(generatedText);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Generate email content
   * @param {string} purpose - Purpose of email (welcome, follow-up, campaign)
   * @param {object} context - Context data for personalization
   * @returns {Promise<string>} Generated email content
   */
  async generateEmailContent(purpose, context = {}) {
    try {
      const prompt = this.buildEmailPrompt(purpose, context);
      
      const response = await axios.post(this.apiUrl, {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.6,
          topK: 32,
          topP: 1,
          maxOutputTokens: 800,
          stopSequences: []
        }
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini Email Generation Error:', error);
      throw new Error('Failed to generate email content');
    }
  }

  /**
   * Generate social media caption
   * @param {string} productDescription - Product description
   * @param {string} platform - Social media platform
   * @returns {Promise<string>} Generated caption
   */
  async generateSocialCaption(productDescription, platform = 'Instagram') {
    try {
      const prompt = this.buildCaptionPrompt(productDescription, platform);
      
      const response = await axios.post(this.apiUrl, {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 32,
          topP: 1,
          maxOutputTokens: 200,
          stopSequences: []
        }
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini Caption Generation Error:', error);
      throw new Error('Failed to generate social caption');
    }
  }

  /**
   * Build Instagram response prompt
   * @private
   */
  buildInstagramPrompt(message, category, customerName) {
    const brandVoice = `
You are a marketing assistant for ${this.cfg.businessName}, a ${this.cfg.tagline} based in ${this.cfg.country}.
Your job: write warm, conversion-focused responses for Instagram DMs.

Brand Guidelines:
- Always address the customer by first name when provided
- Tone: warm, aspirational, never pushy
- Instagram messages: max 100 words, 1-2 emojis
- Always include a clear CTA with a link or offer code
- Sign off as: Team ${this.cfg.businessName}
- Responses must sound human, not robotic

Message Category: ${category}
Customer Message: "${message}"
Customer Name: ${customerName || 'Customer'}`;

    const responseGuidelines = `
Generate a response that:
1. Acknowledges the customer's inquiry warmly
2. Provides helpful information about the product/service
3. Includes 1-2 relevant emojis (not excessive)
4. Ends with a gentle CTA (link to collection, discount code, or contact info)
5. Signs off as "Team ${this.cfg.businessName}"

Keep the response under 100 words and make it sound natural and helpful.`;

    return brandVoice + responseGuidelines;
  }

  /**
   * Build email content prompt
   * @private
   */
  buildEmailPrompt(purpose, context) {
    const brandVoice = `
You are a marketing assistant for ${this.cfg.businessName}, a ${this.cfg.tagline} based in ${this.cfg.country}.
Your job: write engaging, professional email content.

Brand Guidelines:
- Warm and professional tone
- Include relevant product/service information
- Clear call-to-action
- Sign off as: Team ${this.cfg.businessName}`;

    const emailGuidelines = `
Purpose: ${purpose}
Context: ${JSON.stringify(context, null, 2)}

Generate email content that is engaging, informative, and aligned with the brand voice.
Include appropriate subject line suggestions and body content.`;

    return brandVoice + emailGuidelines;
  }

  /**
   * Build social media caption prompt
   * @private
   */
  buildCaptionPrompt(productDescription, platform) {
    const brandVoice = `
You are a social media content creator for ${this.cfg.businessName}, a ${this.cfg.tagline} based in ${this.cfg.country}.
Your job: create engaging social media captions.

Brand Guidelines:
- Elegant and aspirational tone
- Use relevant hashtags (3-5)
- Include emojis appropriate for the platform
- Encourage engagement (likes, comments, shares)
- Highlight product features and benefits`;

    const captionGuidelines = `
Product Description: ${productDescription}
Platform: ${platform}

Create a caption that:
1. Grabs attention in the first few words
2. Highlights the product's unique features
3. Uses 1-3 relevant emojis
4. Includes 3-5 relevant hashtags
5. Encourages audience engagement
6. Aligns with brand voice and values

Keep it concise and platform-appropriate.`;

    return brandVoice + captionGuidelines;
  }

  /**
   * Clean and format AI response
   * @private
   */
  cleanResponse(text) {
    // Remove any markdown formatting
    let cleaned = text.replace(/\*\*/g, '').replace(/#/g, '');
    
    // Remove excessive line breaks
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  /**
   * Validate API key
   * @returns {boolean} True if API key is valid
   */
  validateApiKey() {
    return !!this.apiKey && this.apiKey.length > 0;
  }
}

export default GeminiClient;