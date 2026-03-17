# Adorn Silver Marketing Automation - Deployment Guide

This guide provides step-by-step instructions to deploy and run your marketing automation system.

## 🚀 Quick Start Overview

**Estimated Setup Time**: 2-3 hours
**Technical Level**: Beginner to Intermediate
**Prerequisites**: Basic computer skills, access to required services

## 📋 Prerequisites Checklist

### Required Accounts & Services
- [ ] **n8n instance** (Cloud or Self-hosted)
- [ ] **Google account** with Sheets access
- [ ] **WhatsApp Business account** (via WATI)
- [ ] **Instagram Business account**
- [ ] **Facebook Developer account**
- [ ] **Claude AI account** (Anthropic)
- [ ] **Gmail account** for sending emails
- [ ] **Buffer account** (optional, for Instagram scheduling)

### Technical Requirements
- [ ] Stable internet connection
- [ ] Computer with web browser
- [ ] Basic understanding of APIs and webhooks
- [ ] Access to business accounts and admin permissions

## 🛠️ Step 1: Set Up n8n (15 minutes)

### Option A: n8n Cloud (Recommended for Beginners)
1. **Sign up**: Go to [n8n.io](https://n8n.io) and click "Get Started"
2. **Choose plan**: Select free plan or paid plan based on your needs
3. **Create account**: Enter your email and create password
4. **Verify email**: Check your inbox and verify your account
5. **Log in**: Access your n8n dashboard

### Option B: Self-Hosted n8n
1. **Install Docker**: Download from [docker.com](https://www.docker.com/get-started)
2. **Run n8n**: Open terminal and run:
   ```bash
   docker run -d --name n8n -p 5678:5678 n8nio/n8n
   ```
3. **Access n8n**: Open browser to `http://localhost:5678`
4. **Set up account**: Create your admin account

## 📊 Step 2: Configure Google Sheets (20 minutes)

### Create Your CRM Database
1. **Open Google Sheets**: Go to [sheets.google.com](https://sheets.google.com)
2. **Create new spreadsheet**: Click "+ New" and name it "Adorn Silver CRM"
3. **Create sheets**: Add these tabs (right-click → "Insert sheet"):
   - `Customers`
   - `Leads`
   - `Orders`
   - `Conversations`
   - `Content Calendar`
   - `Analytics`
   - `Master Analytics`

### Set Up Sheet Structure
1. **Copy headers**: Use the schema from `google-sheets-crm-schema.md`
2. **Add data validation**: Set dropdown lists for Status, Source, Interest columns
3. **Share with n8n**: Click "Share" → Add your n8n service account email

### Configure Google Sheets API
1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Create project**: Click "New Project" → Name it "Adorn Silver Automation"
3. **Enable Sheets API**: APIs & Services → Library → Search "Google Sheets API" → Enable
4. **Create credentials**: APIs & Services → Credentials → Create Credentials → OAuth client ID
5. **Configure consent screen**: External User Type → Fill in application details
6. **Get credentials**: Download JSON file with client ID and secret

## 📱 Step 3: Set Up WhatsApp Business (30 minutes)

### Sign Up with WATI
1. **Go to WATI**: Visit [wati.io](https://wati.io)
2. **Sign up**: Create account with your business email
3. **Verify**: Confirm your email address
4. **Add business**: Enter your business details
5. **Connect WhatsApp**: Follow WATI's setup wizard

### Create Message Templates
1. **Go to Templates**: In WATI dashboard, navigate to "Message Templates"
2. **Create templates**: Add these templates (follow WhatsApp guidelines):
   - `welcome_message`
   - `follow_up_message`
   - `social_proof_message`
   - `order_confirmation`
   - `care_tips`
   - `review_request`
   - `reengagement`
   - `winback_message`
   - `final_winback`
   - `weekly_report`

### Get API Credentials
1. **Go to Settings**: In WATI dashboard
2. **API Keys**: Generate new API key
3. **Copy credentials**: Save API key and business number

## 📸 Step 4: Set Up Instagram (25 minutes)

### Convert to Business Account
1. **Open Instagram app**: Go to your profile
2. **Settings**: Tap menu → Settings → Account
3. **Switch to Business**: Tap "Switch to Professional Account" → "Business"
4. **Connect Facebook**: Link to your Facebook Page

### Set Up Facebook Developer Account
1. **Go to Facebook Developers**: [developers.facebook.com](https://developers.facebook.com)
2. **Create app**: Click "My Apps" → "Create App"
3. **App type**: Select "Business" → "Next"
4. **App details**: Enter app name (e.g., "Adorn Silver Automation")

### Configure Instagram Graph API
1. **Add product**: In Facebook App Dashboard → "Add Product" → "Instagram Graph API"
2. **Get access token**: Tools → Access Token Generator
3. **Permissions needed**:
   - `pages_read_engagement`
   - `pages_messaging`
   - `instagram_basic`
   - `instagram_manage_messages`

### Set Up Webhook
1. **Go to Webhooks**: Facebook App Dashboard → Webhooks
2. **Create webhook**: Set callback URL to `https://your-n8n-url/webhook/instagram-dm`
3. **Verify token**: Set any token (remember it for n8n)
4. **Subscribe**: Subscribe to "messages" and "messaging_postbacks"

## 🤖 Step 5: Set Up Claude AI (15 minutes)

### Create Anthropic Account
1. **Go to Anthropic**: Visit [console.anthropic.com](https://console.anthropic.com)
2. **Sign up**: Create account with your email
3. **Verify**: Confirm your email address
4. **Set up billing**: Add payment method (pay-as-you-go)

### Get API Key
1. **Go to API Keys**: In Anthropic console
2. **Create key**: Click "Create API Key"
3. **Copy key**: Save the API key securely

### Test API
1. **Test connection**: Use the test command from `integration-credentials.md`
2. **Check credits**: Ensure you have sufficient credits for testing

## 📧 Step 6: Set Up Email (10 minutes)

### Configure Gmail for SMTP
1. **Enable 2FA**: In Gmail settings, enable 2-step verification
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Save credentials**: Note your Gmail address and app password

## 🔧 Step 7: Configure n8n Workflows (45 minutes)

### Import Main Configuration
1. **Open n8n**: Go to your n8n dashboard
2. **Import workflow**: Click "Workflows" → "Import"
3. **Upload file**: Select `adorn-silver-marketing-automation.json`
4. **Review workflows**: Check that all 7 workflows imported successfully

### Configure Credentials in n8n
1. **Go to Credentials**: Click "Credentials" in left menu
2. **Add credentials** for each service:
   - **Google Sheets**: Upload your Google Cloud JSON file
   - **WATI**: Enter API key and business number
   - **Instagram**: Enter access token and page ID
   - **Claude AI**: Enter API key
   - **Gmail**: Enter email and app password
   - **Buffer**: Enter API key and profile ID (if using)

### Update Environment Variables
1. **Go to Settings**: n8n → Settings → Environment Variables
2. **Add variables** from `integration-credentials.md`:
   ```bash
   GOOGLE_SHEETS_CLIENT_ID=your_client_id
   GOOGLE_SHEETS_CLIENT_SECRET=your_client_secret
   WATI_API_KEY=your_wati_api_key
   INSTAGRAM_ACCESS_TOKEN=your_instagram_token
   CLAUDE_API_KEY=your_claude_key
   GMAIL_USER=your_email@adornsilver.com
   GMAIL_APP_PASSWORD=your_app_password
   ```

### Configure Webhooks
1. **Find webhook URLs**: In each workflow, note the webhook URLs
2. **Set up webhooks**: Configure external services to send data to these URLs
3. **Test webhooks**: Use test tools to verify webhook connections

## 🧪 Step 8: Test the System (30 minutes)

### Test Each Workflow Individually

#### Test Workflow 1: Lead Capture
1. **Add test lead**: Enter test data in Google Sheets Leads tab
2. **Wait for trigger**: n8n should detect the new row
3. **Check results**:
   - WhatsApp message sent?
   - Email delivered?
   - Lead status updated?

#### Test Workflow 2: Instagram DM
1. **Send test DM**: Message your Instagram business account
2. **Check response**: Should get AI-generated reply within 2 minutes
3. **Verify logging**: Check Google Sheets Conversations tab

#### Test Workflow 3: Post-Purchase
1. **Trigger manually**: Use test order data
2. **Verify sequence**: Check that all follow-up messages are scheduled
3. **Test timing**: Verify Day 2, Day 7, Day 30 messages

### Run Integration Tests
1. **Test API connections**: Use the curl commands from `test-validation.md`
2. **Check error handling**: Test with invalid data
3. **Verify rate limits**: Test multiple requests

## 🚀 Step 9: Go Live (15 minutes)

### Final Preparations
1. **Review all workflows**: Ensure all are active and configured
2. **Check credentials**: Verify all API keys are working
3. **Test end-to-end**: Run complete customer journey test

### Activate Workflows
1. **Enable workflows**: Turn on all 7 workflows in n8n
2. **Monitor first 24 hours**: Watch for any errors or issues
3. **Adjust as needed**: Fine-tune based on initial performance

## 📊 Step 10: Monitor and Maintain (Ongoing)

### Daily Monitoring
- Check workflow execution status in n8n
- Monitor message delivery rates
- Review customer responses and feedback

### Weekly Tasks
- Analyze campaign performance
- Update content calendar
- Review and clean customer database

### Monthly Optimization
- Update message templates based on performance
- Adjust timing and frequency
- Review and optimize based on analytics

## 🆘 Troubleshooting Common Issues

### n8n Not Starting
- **Check Docker**: `docker ps` to see if container is running
- **Check ports**: Ensure port 5678 is not in use
- **Check logs**: `docker logs n8n` for error messages

### Google Sheets Not Connecting
- **Check permissions**: Ensure n8n service account has edit access
- **Check API**: Verify Google Sheets API is enabled
- **Check credentials**: Ensure OAuth credentials are correct

### WhatsApp Messages Not Sending
- **Check templates**: Ensure message templates are approved
- **Check API key**: Verify WATI API key is correct
- **Check number**: Ensure business number is correct

### Instagram Webhook Not Working
- **Check URL**: Verify webhook URL is correct
- **Check token**: Ensure verification token matches
- **Check permissions**: Verify all required permissions are granted

## 📞 Getting Help

### Documentation
- **Main guide**: `README.md` - Complete system overview
- **Setup guide**: `integration-credentials.md` - Detailed configuration
- **Testing**: `test-validation.md` - Comprehensive testing procedures

### Support Resources
- **n8n docs**: [docs.n8n.io](https://docs.n8n.io)
- **Google Cloud**: [cloud.google.com/support](https://cloud.google.com/support)
- **WATI support**: [wati.io/support](https://wati.io/support)
- **Instagram API**: [developers.facebook.com/docs/instagram-api](https://developers.facebook.com/docs/instagram-api)

## 🎉 Congratulations!

You now have a complete, automated marketing system for Adorn Silver! The system will:

✅ **Capture and nurture leads** automatically
✅ **Respond to Instagram messages** 24/7
✅ **Follow up with customers** after purchases
✅ **Run festival campaigns** automatically
✅ **Post content daily** to social media
✅ **Re-engage inactive customers**
✅ **Generate weekly reports** with insights

**Next Steps:**
1. Follow this guide step-by-step
2. Test thoroughly before going live
3. Monitor performance and optimize
4. Scale and expand as your business grows

**Estimated ROI:**
- **Time saved**: 15-20 hours per week on manual tasks
- **Customer engagement**: 2-3x increase in response rates
- **Sales conversion**: 20-30% improvement in lead-to-customer conversion
- **Customer retention**: 15-25% increase in repeat purchases

Your marketing automation journey starts now! 🚀