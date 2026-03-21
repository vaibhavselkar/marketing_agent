import nodemailer from 'nodemailer';

/**
 * Email Client for Marketing Automation
 * Handles email sending via Gmail SMTP
 */
class EmailClient {
  /**
   * @param {object} cfg - Client config from MongoDB
   */
  constructor(cfg) {
    this.cfg = cfg;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: cfg.gmailUser,
        pass: cfg.gmailAppPassword
      }
    });
  }

  /**
   * Send welcome email to new lead
   * @param {string} to - Recipient email
   * @param {string} name - Recipient name
   * @returns {Promise<object>} Email response
   */
  async sendWelcomeEmail(to, name) {
    try {
      const htmlContent = this.buildWelcomeEmailHTML(name);
      
      const mailOptions = {
        from: this.cfg.gmailUser,
        to: to,
        subject: `Welcome to ${this.cfg.businessName}! 💎 Your Journey Starts Here`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        to: to,
        subject: mailOptions.subject
      };
    } catch (error) {
      console.error('Welcome Email Error:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  /**
   * Send follow-up email
   * @param {string} to - Recipient email
   * @param {string} name - Recipient name
   * @param {string} link - Follow-up link
   * @returns {Promise<object>} Email response
   */
  async sendFollowUpEmail(to, name, link) {
    try {
      const htmlContent = this.buildFollowUpEmailHTML(name, link);
      
      const mailOptions = {
        from: this.cfg.gmailUser,
        to: to,
        subject: `Hi ${name}, Discover What You Might Love ✨`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        to: to,
        subject: mailOptions.subject
      };
    } catch (error) {
      console.error('Follow-up Email Error:', error);
      throw new Error('Failed to send follow-up email');
    }
  }

  /**
   * Send order confirmation email
   * @param {string} to - Recipient email
   * @param {string} name - Recipient name
   * @param {string} orderId - Order ID
   * @param {number} amount - Order amount
   * @param {string} items - Order items
   * @returns {Promise<object>} Email response
   */
  async sendOrderConfirmationEmail(to, name, orderId, amount, items) {
    try {
      const htmlContent = this.buildOrderConfirmationEmailHTML(name, orderId, amount, items);
      
      const mailOptions = {
        from: this.cfg.gmailUser,
        to: to,
        subject: `Order Confirmed! 🎉 Order #${orderId}`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        to: to,
        subject: mailOptions.subject
      };
    } catch (error) {
      console.error('Order Confirmation Email Error:', error);
      throw new Error('Failed to send order confirmation email');
    }
  }

  /**
   * Send care tips email
   * @param {string} to - Recipient email
   * @param {string} name - Recipient name
   * @param {string} careLink - Care guide link
   * @returns {Promise<object>} Email response
   */
  async sendCareTipsEmail(to, name, careLink) {
    try {
      const htmlContent = this.buildCareTipsEmailHTML(name, careLink);
      
      const mailOptions = {
        from: this.cfg.gmailUser,
        to: to,
        subject: `${name}, Keep Your ${this.cfg.businessName} ${this.cfg.productType} Shining ✨`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        to: to,
        subject: mailOptions.subject
      };
    } catch (error) {
      console.error('Care Tips Email Error:', error);
      throw new Error('Failed to send care tips email');
    }
  }

  /**
   * Send review request email
   * @param {string} to - Recipient email
   * @param {string} name - Recipient name
   * @param {string} reviewLink - Review link
   * @returns {Promise<object>} Email response
   */
  async sendReviewRequestEmail(to, name, reviewLink) {
    try {
      const htmlContent = this.buildReviewRequestEmailHTML(name, reviewLink);
      
      const mailOptions = {
        from: this.cfg.gmailUser,
        to: to,
        subject: `Share Your ${this.cfg.businessName} Experience, ${name}! ✨`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        to: to,
        subject: mailOptions.subject
      };
    } catch (error) {
      console.error('Review Request Email Error:', error);
      throw new Error('Failed to send review request email');
    }
  }

  /**
   * Send festival campaign email
   * @param {string} to - Recipient email
   * @param {string} name - Recipient name
   * @param {string} festival - Festival name
   * @param {string} offer - Festival offer
   * @param {string} link - Campaign link
   * @returns {Promise<object>} Email response
   */
  async sendFestivalEmail(to, name, festival, offer, link) {
    try {
      const htmlContent = this.buildFestivalEmailHTML(name, festival, offer, link);
      
      const mailOptions = {
        from: this.cfg.gmailUser,
        to: to,
        subject: `Happy ${festival}, ${name}! ✨ Special Silver Surprises Inside`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        to: to,
        subject: mailOptions.subject
      };
    } catch (error) {
      console.error('Festival Email Error:', error);
      throw new Error('Failed to send festival email');
    }
  }

  /**
   * Send re-engagement email
   * @param {string} to - Recipient email
   * @param {string} name - Recipient name
   * @param {string} offer - Re-engagement offer
   * @param {string} link - Re-engagement link
   * @returns {Promise<object>} Email response
   */
  async sendReengagementEmail(to, name, offer, link) {
    try {
      const htmlContent = this.buildReengagementEmailHTML(name, offer, link);
      
      const mailOptions = {
        from: this.cfg.gmailUser,
        to: to,
        subject: `We Miss You, ${name}! 💫 Special Offer Just for You`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        to: to,
        subject: mailOptions.subject
      };
    } catch (error) {
      console.error('Re-engagement Email Error:', error);
      throw new Error('Failed to send re-engagement email');
    }
  }

  /**
   * Send weekly analytics report
   * @param {string} to - Recipient email (business owner)
   * @param {object} analytics - Analytics data
   * @returns {Promise<object>} Email response
   */
  async sendWeeklyReportEmail(to, analytics) {
    try {
      const htmlContent = this.buildWeeklyReportEmailHTML(analytics);
      
      const mailOptions = {
        from: this.cfg.gmailUser,
        to: to,
        subject: 'Weekly Marketing Analytics Report 📊',
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        to: to,
        subject: mailOptions.subject
      };
    } catch (error) {
      console.error('Weekly Report Email Error:', error);
      throw new Error('Failed to send weekly report email');
    }
  }

  /**
   * Build welcome email HTML
   * @private
   */
  buildWelcomeEmailHTML(name) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to ${this.cfg.businessName}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 30px; background: #f8f9fa; }
            .highlight { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .offer { font-size: 24px; font-weight: bold; color: #667eea; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✨ Welcome to ${this.cfg.businessName}!</h1>
            </div>
            <div class="content">
                <p>Hi ${name},</p>
                <p>We're thrilled to have you join our community of silver jewellery lovers! 🎉</p>
                
                <div class="highlight">
                    <p class="offer">🎉 Special Welcome Offer: <strong>${this.cfg.discountCode || 'WELCOME10'}</strong></p>
                    <p>Enjoy ${this.cfg.discountPercent}% off your first order with us. This exclusive offer is our way of saying thank you for choosing ${this.cfg.businessName}.</p>
                </div>

                <p><strong>What makes ${this.cfg.businessName} special?</strong></p>
                <ul>
                    <li>✨ Handcrafted 925 silver jewellery</li>
                    <li>💎 Premium quality, timeless designs</li>
                    <li>🎁 Perfect for gifting or treating yourself</li>
                    <li>🌟 Exceptional customer service</li>
                </ul>

                <a href="${this.cfg.website}" class="cta-button">Explore Our Collection</a>

                ${this.cfg.instagram ? `<p>Follow us on Instagram <a href="https://instagram.com/${this.cfg.instagram.replace('@','')}">@${this.cfg.instagram.replace('@','')}</a> for daily inspiration and exclusive offers!</p>` : ''}
            </div>
            <div class="footer">
                <p>Team ${this.cfg.businessName}</p>
                <p>${this.cfg.tagline} ✨</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Build follow-up email HTML
   * @private
   */
  buildFollowUpEmailHTML(name, link) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Discover What You Might Love</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
            .product-card { border: 1px solid #ddd; padding: 15px; text-align: center; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Hi ${name},</h2>
                <p>We thought you might love these ✨</p>
            </div>
            <div class="content">
                <p>Based on your interests, here are some pieces that might catch your eye:</p>
                
                <div class="product-grid">
                    <div class="product-card">
                        <h4>Elegant Ring</h4>
                        <p>Timeless design</p>
                    </div>
                    <div class="product-card">
                        <h4>Statement Necklace</h4>
                        <p>Perfect for occasions</p>
                    </div>
                </div>

                <a href="${link}" class="cta-button">View More Styles</a>

                <p>Have questions? Simply reply to this email - we're here to help! 💫</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Build order confirmation email HTML
   * @private
   */
  buildOrderConfirmationEmailHTML(name, orderId, amount, items) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Order Confirmed</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8f9fa; }
            .order-details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🎉 Order Confirmed!</h2>
                <p>Thank you for your purchase, ${name}!</p>
            </div>
            <div class="content">
                <div class="order-details">
                    <h3>Order Details</h3>
                    <p><strong>Order ID:</strong> ${orderId}</p>
                    <p><strong>Amount:</strong> ₹${amount}</p>
                    <p><strong>Items:</strong> ${items}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>

                <p>We'll notify you when your order ships. Thank you for choosing ${this.cfg.businessName}!</p>
            </div>
            <div class="footer">
                <p>Team ${this.cfg.businessName}</p>
                <p>Questions? Reply to this email - we're here for you! ✨</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Build care tips email HTML
   * @private
   */
  buildCareTipsEmailHTML(name, careLink) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Care Tips</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ffc107; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .tip-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🌿 Care Tips for Your ${this.cfg.businessName} ${this.cfg.productType}</h2>
                <p>Keep your jewellery shining, ${name}!</p>
            </div>
            <div class="content">
                <div class="tip-box">
                    <h4>✨ Quick Care Tips:</h4>
                    <ul>
                        <li>Store in a dry place, away from moisture</li>
                        <li>Clean with a soft cloth regularly</li>
                        <li>Avoid contact with perfumes and lotions</li>
                        <li>Remove before swimming or showering</li>
                    </ul>
                </div>

                <a href="${careLink}" class="cta-button">Read Complete Care Guide</a>

                <p>Your ${this.cfg.businessName} ${this.cfg.productType} are designed to last. With proper care, they will continue to shine for years to come! ✨</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Build review request email HTML
   * @private
   */
  buildReviewRequestEmailHTML(name, reviewLink) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Share Your Experience</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .review-box { background: #e3f2fd; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>✨ Share Your ${this.cfg.businessName} Experience</h2>
                <p>We'd love to hear from you, ${name}!</p>
            </div>
            <div class="content">
                <p>How are you enjoying your ${this.cfg.businessName} ${this.cfg.productType}? Your feedback helps us serve you better and helps other customers make informed choices.</p>

                <div class="review-box">
                    <h3>🌟 Your opinion matters!</h3>
                    <p>Takes just 2 minutes to share your thoughts</p>
                </div>

                <a href="${reviewLink}" class="cta-button">Share Your Review</a>

                <p>As a thank you, you'll be entered into our monthly draw for a special gift! 🎁</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Build festival email HTML
   * @private
   */
  buildFestivalEmailHTML(name, festival, offer, link) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Festival Special</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 20px; }
            .festival-offer { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 18px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎊 Happy ${festival}! 🎊</h1>
                <p>Wishing you joy and prosperity, ${name}!</p>
            </div>
            <div class="content">
                <div class="festival-offer">
                    <h2>✨ Special ${festival} Offer: ${offer} ✨</h2>
                    <p>Adorn yourself and your loved ones with our handcrafted silver collection. Perfect for gifting and self-indulgence!</p>
                </div>

                <a href="${link}" class="cta-button">Shop Festival Collection</a>

                <p>Available for a limited time only. Don't miss out on these sparkling deals! 💫</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Build re-engagement email HTML
   * @private
   */
  buildReengagementEmailHTML(name, offer, link) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>We Miss You</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6f42c1; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .special-offer { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 18px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>💫 We Miss You, ${name}!</h2>
                <p>It's been a while since we've seen you</p>
            </div>
            <div class="content">
                <div class="special-offer">
                    <h2>🎁 Special Welcome Back Offer: ${offer}</h2>
                    <p>Just for you - because you're special to us!</p>
                </div>

                <a href="${link}" class="cta-button">Rediscover ${this.cfg.businessName}</a>

                <p>We've added some beautiful new pieces that we think you'll love. Come see what's new! ✨</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Build weekly report email HTML
   * @private
   */
  buildWeeklyReportEmailHTML(analytics) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Weekly Analytics Report</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #343a40; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
            .metric-card { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 10px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #667eea; }
            .metric-label { color: #666; font-size: 12px; text-transform: uppercase; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>📊 Weekly Marketing Analytics Report</h2>
                <p>Performance Summary</p>
            </div>
            <div class="content">
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${analytics.totalLeads || 0}</div>
                        <div class="metric-label">Total Leads</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${analytics.totalCustomers || 0}</div>
                        <div class="metric-label">New Customers</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${analytics.totalConversations || 0}</div>
                        <div class="metric-label">Conversations</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${analytics.conversionRate || 0}%</div>
                        <div class="metric-label">Conversion Rate</div>
                    </div>
                </div>

                <h3>📈 Key Insights</h3>
                <ul>
                    <li>Leads by Source: ${JSON.stringify(analytics.leadsBySource || {})}</li>
                    <li>Popular Categories: ${JSON.stringify(analytics.leadsByInterest || {})}</li>
                    <li>Recent Activity: ${analytics.recentActivity?.length || 0} conversations</li>
                </ul>

                <p><strong>Recommendation:</strong> Focus on high-converting sources and popular product categories for next week's campaigns.</p>
            </div>
            <div class="footer">
                <p>Generated by ${this.cfg.businessName} Marketing Automation</p>
                <p>Report Date: ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Validate email configuration
   * @returns {Promise<boolean>} True if email configuration is valid
   */
  async validateConfiguration() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email Configuration Validation Error:', error);
      return false;
    }
  }
}

export default EmailClient;