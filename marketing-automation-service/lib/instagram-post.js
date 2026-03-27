import axios from 'axios';

/**
 * Instagram Auto-Posting Client
 * Uses Instagram Graph API to publish image posts + captions automatically
 *
 * Requirements:
 * - Instagram Business or Creator account
 * - Facebook Page linked to that Instagram account
 * - instagramAccessToken (long-lived page access token)
 * - instagramPageId (the Facebook Page ID, used to get IG User ID)
 */
class InstagramPostClient {
  constructor(cfg) {
    this.accessToken = cfg.instagramAccessToken;
    this.pageId      = cfg.instagramPageId;
    this.cfg         = cfg;
    this.baseUrl     = 'https://graph.facebook.com/v19.0';
  }

  get isConfigured() {
    return !!(this.accessToken && this.pageId);
  }

  /** Get the Instagram User ID from the linked Facebook Page */
  async getIgUserId() {
    const res = await axios.get(`${this.baseUrl}/${this.pageId}`, {
      params: { fields: 'instagram_business_account', access_token: this.accessToken },
    });
    const igId = res.data?.instagram_business_account?.id;
    if (!igId) throw new Error('No Instagram Business account linked to this Facebook Page');
    return igId;
  }

  /**
   * Post an image to Instagram
   * @param {string} imageUrl - Publicly accessible image URL (https required)
   * @param {string} caption  - Caption text with hashtags
   * @returns {{ success, postId, postUrl }}
   */
  async postImage(imageUrl, caption) {
    if (!this.isConfigured) throw new Error('Instagram credentials not configured');

    const igUserId = await this.getIgUserId();

    // Step 1: Create media container
    const containerRes = await axios.post(`${this.baseUrl}/${igUserId}/media`, null, {
      params: {
        image_url:    imageUrl,
        caption:      caption,
        access_token: this.accessToken,
      },
    });

    const containerId = containerRes.data?.id;
    if (!containerId) throw new Error('Failed to create Instagram media container');

    // Step 2: Wait a moment for media processing
    await new Promise(r => setTimeout(r, 3000));

    // Step 3: Publish the container
    const publishRes = await axios.post(`${this.baseUrl}/${igUserId}/media_publish`, null, {
      params: {
        creation_id:  containerId,
        access_token: this.accessToken,
      },
    });

    const postId = publishRes.data?.id;
    if (!postId) throw new Error('Failed to publish Instagram post');

    return {
      success: true,
      postId,
      postUrl: `https://www.instagram.com/p/${postId}/`,
    };
  }

  /**
   * Post caption-only (text post via carousel workaround is not supported)
   * Instagram requires an image. If no image URL provided, returns instructions.
   */
  async postCaptionOnly(caption) {
    return {
      success:     false,
      manualPost:  true,
      caption,
      instruction: 'Instagram requires an image to post. Copy the caption below and post manually with a product photo.',
    };
  }

  /** Validate credentials by fetching page info */
  async validateCredentials() {
    if (!this.isConfigured) return false;
    try {
      await this.getIgUserId();
      return true;
    } catch {
      return false;
    }
  }
}

export default InstagramPostClient;
