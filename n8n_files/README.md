# Adorn Silver Marketing Automation System

A comprehensive n8n-based marketing automation system for Adorn Silver, a premium Indian silver jewellery brand.

## 🌟 System Overview

This marketing automation system handles the complete customer journey from lead capture to post-purchase retention, using AI-powered messaging and multi-channel communication.

### 🎯 Brand Identity
- **Brand**: Adorn Silver
- **Product**: Premium handcrafted 925 silver jewellery
- **Target**: Women aged 22-45, India-based
- **Tone**: Elegant, warm, aspirational - never pushy
- **Key Occasions**: Diwali, Navratri, Weddings, Birthdays, Anniversaries, Valentine's Day, Karva Chauth

## 📊 System Architecture

### 7 Core Workflows

1. **[Lead Capture & Welcome Sequence](workflows/workflow-1-lead-capture.md)**
   - Captures leads from Google Sheets
   - Sends personalized welcome messages via WhatsApp and email
   - Nurtures leads with follow-up sequences

2. **[Instagram DM Auto-Reply](workflows/workflow-2-instagram-dm.md)**
   - AI-powered instant responses to Instagram DMs
   - Keyword-based message categorization
   - 24/7 customer service automation

3. **[Post-Purchase Retention](workflows/workflow-3-post-purchase.md)**
   - Order confirmation and tracking
   - Care tips and review requests
   - Personalized re-engagement after 30 days

4. **[Festival & Campaign Broadcasts](workflows/workflow-4-festival-campaigns.md)**
   - Automated festival-specific campaigns
   - Multi-channel messaging (WhatsApp, Email, Instagram)
   - AI-generated personalized content

5. **[Content Calendar Auto-Posting](workflows/workflow-5-content-calendar.md)**
   - Daily social media content scheduling
   - AI-generated captions and hashtags
   - Automated posting to Instagram and WhatsApp

6. **[Customer Re-engagement](workflows/workflow-6-customer-winback.md)**
   - Identifies inactive customers (60+ days)
   - Sends personalized win-back campaigns
   - Escalates to human support when needed

7. **[Analytics & Weekly Reports](workflows/workflow-7-analytics-reporting.md)**
   - Weekly performance analytics
   - AI-generated business summaries
   - Multi-channel delivery of reports

## 🔧 Technical Stack

### Core Platform
- **n8n**: Workflow automation engine
- **Google Sheets**: CRM database and content calendar
- **Claude AI**: Message generation and content creation

### Communication Channels
- **WhatsApp Business API** (WATI): Customer messaging
- **Instagram Graph API**: DM handling and content posting
- **Gmail/SMTP**: Email sequences
- **Buffer**: Social media scheduling

## 📁 Project Structure

```
adorn-silver-marketing-automation/
├── adorn-silver-marketing-automation.json    # Main n8n workflow configuration
├── README.md                                 # This file
├── google-sheets-crm-schema.md              # Database structure documentation
├── integration-credentials.md               # Setup and configuration guide
└── workflows/                               # Individual workflow documentation
    ├── workflow-1-lead-capture.md
    ├── workflow-2-instagram-dm.md
    ├── workflow-3-post-purchase.md
    ├── workflow-4-festival-campaigns.md
    ├── workflow-5-content-calendar.md
    ├── workflow-6-customer-winback.md
    └── workflow-7-analytics-reporting.md
```

## 🚀 Quick Start

### 1. Prerequisites
- n8n instance (cloud or self-hosted)
- Google account with Sheets access
- Business accounts for WhatsApp and Instagram
- API keys for all integrations

### 2. Setup Process

#### A. Configure Google Sheets
1. Create a new Google Sheet
2. Set up the CRM schema as documented in [google-sheets-crm-schema.md](google-sheets-crm-schema.md)
3. Share the sheet with your n8n service account

#### B. Configure Integrations
1. Follow the setup guide in [integration-credentials.md](integration-credentials.md)
2. Create API keys for all required services
3. Configure environment variables in your n8n instance

#### C. Import Workflows
1. Import `adorn-silver-marketing-automation.json` into n8n
2. Configure credentials for each integration
3. Test each workflow individually

### 3. Environment Variables

Create a `.env` file with the following structure:

```bash
# Google Sheets
GOOGLE_SHEETS_CLIENT_ID=your_client_id_here
GOOGLE_SHEETS_CLIENT_SECRET=your_client_secret_here
GOOGLE_SHEETS_REFRESH_TOKEN=your_refresh_token_here

# WhatsApp (WATI)
WATI_API_KEY=your_wati_api_key_here
WATI_BUSINESS_NUMBER=your_business_phone_number_here

# Instagram
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
INSTAGRAM_PAGE_ID=your_facebook_page_id_here

# Claude AI
CLAUDE_API_KEY=your_claude_api_key_here

# Email (Gmail)
GMAIL_USER=noreply@adornsilver.com
GMAIL_APP_PASSWORD=your_app_password_here

# Buffer
BUFFER_API_KEY=your_buffer_api_key_here
INSTAGRAM_PROFILE_ID=your_buffer_profile_id_here

# Business Information
OWNER_PHONE=+91_your_phone_number_here
OWNER_EMAIL=your_email@adornsilver.com
```

## 🎨 Brand Voice Guidelines

### Tone & Style
- **Always address customers by first name**
- **Use 1-2 relevant emojis** - never overdo it
- **Keep WhatsApp messages under 120 words**
- **Lead with value, not discounts**
- **Always include a clear CTA**
- **Sign off as: Team Adorn Silver**

### Message Examples

#### Welcome Message
> "Hi [Name] ✨ Welcome to Adorn Silver! We handcraft premium 925 silver jewellery for women who love elegant, meaningful pieces. Here's 10% off your first order: ADORN10. Browse our collection: [link]"

#### Festival Message (Diwali)
> "Wishing you a sparkling Diwali, [Name] 🪔✨ This festive season, adorn yourself and your loved ones with our handcrafted silver collection. Gift something that lasts forever. Special Diwali offer — flat 15% off on orders above ₹1,500. Code: DIWALI15. Shop now: [link]"

#### Care Tips
> "Hi [Name], your Adorn Silver piece deserves the best care 🌿 Here's how to keep it shining: [care guide link]"

## 📈 Key Metrics Tracked

### Lead Management
- New leads per week
- Lead-to-customer conversion rate
- Message delivery and response rates

### Sales & Revenue
- Orders placed through automation
- Revenue generated from campaigns
- Average order value trends

### Engagement
- Instagram DM response rates
- Email open and click rates
- Social media engagement metrics

### Customer Retention
- Repeat purchase rate
- Customer lifetime value
- Win-back campaign success rate

## 🔍 Monitoring & Maintenance

### Daily Tasks
- Monitor message delivery rates
- Check for failed API calls
- Review customer feedback and complaints

### Weekly Tasks
- Analyze campaign performance
- Update content calendar
- Review and clean customer database

### Monthly Tasks
- Optimize message templates
- Update discount codes and offers
- Analyze seasonal trends

## 🛠️ Troubleshooting

### Common Issues

#### Google Sheets Permission Errors
- Ensure service account has edit access
- Verify OAuth scopes are correct
- Check sheet sharing settings

#### WhatsApp Template Rejections
- Follow WhatsApp template guidelines
- Avoid promotional language
- Use approved template formats

#### Instagram API Rate Limits
- Implement rate limiting in workflows
- Monitor API usage in Facebook Developer Console
- Use exponential backoff for failed requests

#### AI Response Quality
- Review and update prompt templates
- Monitor response accuracy
- Adjust temperature and max tokens settings

### Support Resources
- [n8n Documentation](https://docs.n8n.io)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [WATI Support](https://wati.io/support)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)

## 🤝 Contributing

To contribute to this marketing automation system:

1. **Test thoroughly**: Always test workflows in a staging environment
2. **Document changes**: Update relevant documentation files
3. **Follow brand guidelines**: Maintain consistent brand voice
4. **Monitor performance**: Track impact of changes on key metrics

## 📄 License

This marketing automation system is provided as a reference implementation for Adorn Silver. Customize according to your specific business needs and compliance requirements.

## 🙏 Acknowledgments

- **n8n**: For the powerful workflow automation platform
- **Anthropic**: For Claude AI's excellent message generation capabilities
- **Google**: For reliable Sheets API integration
- **Meta**: For Instagram and Facebook API access

---

**Built with ❤️ for Adorn Silver**  
*Premium handcrafted silver jewellery that adorns your special moments*