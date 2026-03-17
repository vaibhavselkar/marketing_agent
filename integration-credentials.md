# Adorn Silver Integration Credentials Configuration

This document provides the configuration details for all external integrations required for the n8n marketing automation system.

## Overview

The system integrates with 6 external services to provide complete marketing automation functionality.

## Required Integrations

### 1. Google Sheets (CRM Database)

**Purpose**: Primary database for customer information, leads, orders, and analytics.

**Setup Instructions**:
1. Create a new Google Cloud project
2. Enable Google Sheets API
3. Create OAuth 2.0 credentials
4. Set authorized redirect URI to your n8n instance
5. Share your Google Sheet with the service account email

**Required Credentials**:
```json
{
  "GOOGLE_SHEETS_CLIENT_ID": "your_client_id_here",
  "GOOGLE_SHEETS_CLIENT_SECRET": "your_client_secret_here", 
  "GOOGLE_SHEETS_REFRESH_TOKEN": "your_refresh_token_here"
}
```

**Sheets to Create**:
- `Customers` - Main CRM database
- `Leads` - Lead capture
- `Orders` - Order tracking
- `Conversations` - Communication logs
- `Content Calendar` - Social media scheduling
- `Analytics` - Performance metrics
- `Master Analytics` - Weekly reports

### 2. WhatsApp Business API (WATI)

**Purpose**: WhatsApp messaging for customer communication, order updates, and campaigns.

**Setup Instructions**:
1. Sign up at [WATI.io](https://wati.io)
2. Connect your WhatsApp Business account
3. Get API credentials from dashboard
4. Set up message templates for automated responses

**Required Credentials**:
```json
{
  "WATI_API_KEY": "your_wati_api_key_here",
  "WATI_BUSINESS_NUMBER": "your_business_phone_number_here"
}
```

**Required Message Templates**:
- `welcome_message` - New lead welcome
- `follow_up_message` - 3-day follow-up
- `social_proof_message` - Customer testimonials
- `order_confirmation` - Order confirmation
- `care_tips` - Product care instructions
- `review_request` - Review request
- `reengagement` - Customer re-engagement
- `winback_message` - Win-back campaign
- `final_winback` - Final win-back attempt
- `weekly_report` - Weekly analytics report

### 3. Instagram Graph API

**Purpose**: Instagram DM handling and content posting.

**Setup Instructions**:
1. Create Facebook Developer account
2. Create Facebook App
3. Add Instagram Graph API product
4. Get Page Access Token
5. Set up webhook for DM handling

**Required Credentials**:
```json
{
  "INSTAGRAM_ACCESS_TOKEN": "your_instagram_access_token_here",
  "INSTAGRAM_PAGE_ID": "your_facebook_page_id_here"
}
```

**Webhook Setup**:
- Webhook URL: `https://your-n8n-url/webhook/instagram-dm`
- Verify Token: Set in n8n webhook settings
- Subscriptions: messages, messaging_postbacks

### 4. Claude AI (Anthropic)

**Purpose**: AI-powered message generation, content creation, and customer responses.

**Setup Instructions**:
1. Sign up at [Anthropic Console](https://console.anthropic.com)
2. Create API key
3. Set up billing
4. Choose appropriate model (claude-sonnet-4-20250513 recommended)

**Required Credentials**:
```json
{
  "CLAUDE_API_KEY": "your_claude_api_key_here"
}
```

**Usage Notes**:
- Model: `claude-sonnet-4-20250513`
- Max tokens: 300-800 depending on use case
- Temperature: 0.7 for creative responses

### 5. Gmail/SMTP (Email)

**Purpose**: Email sequences for welcome series, campaigns, and reports.

**Setup Instructions**:
1. Enable 2FA on Gmail account
2. Generate App Password
3. Configure SMTP settings in n8n

**Required Credentials**:
```json
{
  "GMAIL_USER": "noreply@adornsilver.com",
  "GMAIL_APP_PASSWORD": "your_app_password_here"
}
```

**SMTP Settings**:
- Host: `smtp.gmail.com`
- Port: `587`
- Security: `TLS`

### 6. Buffer (Social Media Scheduling)

**Purpose**: Instagram content scheduling and posting.

**Setup Instructions**:
1. Sign up at [Buffer](https://buffer.com)
2. Connect Instagram account
3. Get API credentials
4. Set up posting schedule

**Required Credentials**:
```json
{
  "BUFFER_API_KEY": "your_buffer_api_key_here",
  "INSTAGRAM_PROFILE_ID": "your_buffer_profile_id_here"
}
```

## Environment Variables Setup

Create a `.env` file in your n8n directory with the following structure:

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

## Testing Integrations

### Google Sheets Test
1. Create a test sheet with sample data
2. Test read/write operations in n8n
3. Verify data consistency

### WhatsApp Test
1. Send test message to your business number
2. Verify message delivery
3. Test template message formatting

### Instagram Test
1. Send DM to your Instagram business account
2. Verify webhook triggers
3. Test content posting

### Claude AI Test
1. Test API connectivity
2. Verify response quality
3. Check token usage

### Email Test
1. Send test email
2. Verify delivery and formatting
3. Test HTML content rendering

### Buffer Test
1. Schedule test post
2. Verify posting to Instagram
3. Check engagement tracking

## Security Best Practices

1. **API Key Management**: Store credentials securely, never commit to version control
2. **Rate Limiting**: Monitor API usage to avoid exceeding limits
3. **Error Handling**: Implement proper error handling for API failures
4. **Data Privacy**: Comply with data protection regulations
5. **Access Control**: Limit access to sensitive credentials

## Troubleshooting

### Common Issues

**Google Sheets Permission Errors**:
- Ensure service account has edit access to sheets
- Verify OAuth scopes are correct

**WhatsApp Template Rejection**:
- Follow WhatsApp template guidelines
- Avoid promotional language in templates

**Instagram API Rate Limits**:
- Implement rate limiting in workflows
- Monitor API usage

**Claude API Errors**:
- Check API key validity
- Verify model availability
- Monitor token usage

**Email Delivery Issues**:
- Verify sender domain authentication
- Check spam folder
- Ensure proper HTML formatting

## Maintenance

1. **Regular Monitoring**: Check API usage and performance
2. **Credential Rotation**: Regularly update API keys
3. **Template Updates**: Keep message templates current
4. **Data Cleanup**: Regularly archive old data
5. **Performance Optimization**: Monitor workflow execution times

## Support Contacts

- **Google Sheets**: [Google Cloud Support](https://cloud.google.com/support)
- **WATI**: [WATI Support](https://wati.io/support)
- **Instagram**: [Facebook Developer Support](https://developers.facebook.com/support/)
- **Claude AI**: [Anthropic Support](https://docs.anthropic.com/en/docs/support)
- **Gmail**: [Google Workspace Support](https://support.google.com/a)
- **Buffer**: [Buffer Support](https://buffer.com/help)