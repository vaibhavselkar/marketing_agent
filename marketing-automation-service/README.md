# Marketing Automation Service

A complete marketing automation system built on Vercel, designed for agencies and service providers to offer white-label marketing automation to their clients.

## 🚀 Features

### Core Automation Workflows
- **Instagram DM Auto-Reply** - AI-powered instant responses using Google Gemini
- **WhatsApp Lead Capture** - Automated lead processing and follow-up
- **Email Campaigns** - Automated email sequences and campaigns
- **Content Scheduling** - Social media content calendar management
- **Customer Re-engagement** - Win-back campaigns for inactive customers
- **Analytics & Reporting** - Weekly performance reports and insights

### Key Technologies
- **Vercel Serverless Functions** - Fast, scalable API endpoints
- **Google Gemini AI** - AI-powered message generation
- **Google Sheets** - CRM database and data storage
- **Twilio WhatsApp API** - WhatsApp messaging
- **Gmail SMTP** - Email delivery
- **Instagram Graph API** - Instagram integration
- **React + Next.js** - Modern admin dashboard

## 📋 Prerequisites

### Required Accounts
- **Google Account** - For Sheets API and Gemini AI
- **Vercel Account** - For deployment
- **Twilio Account** - For WhatsApp messaging
- **Instagram Business Account** - For DM automation

### Environment Setup
```bash
# Clone the repository
git clone <repository-url>
cd marketing-automation-service

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Google Services
GOOGLE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_google_sheet_id
GEMINI_API_KEY=your_gemini_api_key

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Instagram
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
INSTAGRAM_PAGE_ID=your_facebook_page_id
INSTAGRAM_VERIFY_TOKEN=your_webhook_verify_token

# Email
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password

# Business Information
OWNER_PHONE=+91_your_phone_number
OWNER_EMAIL=your_email@business.com
```

### Google Sheets Setup

1. Create a new Google Sheet
2. Set up the following tabs:
   - `Leads` - Lead capture and management
   - `Customers` - Customer database
   - `Conversations` - Instagram DM log
   - `Content Calendar` - Social media scheduling
   - `Analytics` - Performance metrics
   - `Master Analytics` - Aggregated data

3. Share the sheet with your service account email
4. Enable Google Sheets API in Google Cloud Console

### Instagram Setup

1. Convert to Instagram Business Account
2. Connect to Facebook Page
3. Set up Facebook Developer account
4. Configure Instagram Graph API permissions
5. Set up webhook for DM handling

### WhatsApp Setup

1. Sign up for Twilio account
2. Get WhatsApp number
3. Configure webhook URLs
4. Set up message templates

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy to Vercel
   vercel
   ```

2. **Set Environment Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add all required environment variables
   - Deploy again to apply changes

3. **Configure Webhooks**
   - Instagram webhook: `https://your-domain.vercel.app/api/instagram-dm`
   - Set up verification token

### Local Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📊 API Endpoints

### Instagram DM Automation
- **POST** `/api/instagram-dm` - Process Instagram DM webhook
- **GET** `/api/instagram-dm` - Verify webhook

### WhatsApp Lead Management
- **POST** `/api/whatsapp-leads` - Process new leads
- **PUT** `/api/whatsapp-leads` - Add manual lead
- **GET** `/api/whatsapp-leads` - Get lead statistics
- **PATCH** `/api/whatsapp-leads` - Update lead status

### Email Campaigns
- **POST** `/api/email-campaigns` - Process email campaigns
- **GET** `/api/email-campaigns` - Get campaign statistics
- **PUT** `/api/email-campaigns` - Schedule campaigns

## 🎨 Admin Dashboard

Access the admin dashboard at `/dashboard` to:
- View real-time analytics
- Manage email campaigns
- Monitor lead conversion
- Track Instagram DM performance
- Generate reports

## 💼 Service Packages

### Basic Package ($200/month)
- Instagram DM automation
- WhatsApp lead capture
- Basic email sequences
- Weekly performance reports

### Standard Package ($350/month)
- Everything in Basic
- Content calendar management
- Festival campaign automation
- Customer re-engagement
- Bi-weekly strategy calls

### Premium Package ($500/month)
- Everything in Standard
- Advanced analytics
- Custom content creation
- Monthly strategy sessions
- Priority support

## 📈 Expected Results

### For Clients
- **2-3x increase** in lead response rate
- **20-30% improvement** in conversion rates
- **50-80% reduction** in manual workload
- **Consistent brand messaging** across channels

### For Service Providers
- **Recurring revenue** stream
- **80%+ profit margins** after setup
- **Scalable business model**
- **High-value service offering**

## 🔍 Monitoring & Maintenance

### Daily Tasks
- Monitor API usage and limits
- Check for failed webhook deliveries
- Review customer feedback

### Weekly Tasks
- Analyze campaign performance
- Update content calendar
- Generate client reports

### Monthly Tasks
- Review and optimize automation flows
- Update message templates
- Analyze ROI and adjust strategies

## 🛠️ Troubleshooting

### Common Issues

**Google Sheets Permission Errors**
```bash
# Ensure service account has edit access
# Check OAuth scopes are correct
# Verify sheet sharing settings
```

**Instagram Webhook Verification Failed**
```bash
# Check verify token matches
# Ensure webhook URL is correct
# Verify Instagram app permissions
```

**Twilio WhatsApp Messages Not Sending**
```bash
# Check account balance
# Verify phone number is enabled
# Check message template approval status
```

### Logs and Debugging
- Use Vercel Analytics for monitoring
- Check function logs in Vercel Dashboard
- Implement custom logging for debugging

## 📞 Support

### Documentation
- [Deployment Guide](deployment-guide.md)
- [API Documentation](api-docs.md)
- [Troubleshooting Guide](troubleshooting.md)

### Getting Help
- Check the [FAQ](faq.md) section
- Review [test validation](test-validation.md) procedures
- Contact support via email

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

---

**Built with ❤️ for Marketing Automation Service Providers**

Turn your marketing expertise into a scalable, recurring revenue business!