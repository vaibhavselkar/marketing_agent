# Adorn Silver Marketing Automation - Vercel Deployment Guide

This guide shows you how to deploy your Instagram + WhatsApp automation system on Vercel without using n8n.

## 🚀 Why Vercel Instead of n8n?

### Advantages of Vercel:
- **No monthly subscription** - Pay only for usage
- **Serverless architecture** - Scales automatically
- **Easy deployment** - Git-based deployment
- **Global CDN** - Fast response times worldwide
- **Free tier available** - Generous free limits
- **No maintenance** - Fully managed platform

### When to Choose Vercel:
- You want to avoid monthly n8n costs
- You prefer serverless architecture
- You're comfortable with JavaScript/Node.js
- You want direct control over the code
- You want to scale based on actual usage

## 📦 Vercel System Architecture

```
Instagram Webhook → Vercel API Routes → Gemini AI → Response
Google Sheets → Vercel Cron Jobs → WhatsApp API → Messages
```

## 🛠️ Required Files for Vercel

### 1. Project Structure
```
adorn-silver-vercel/
├── api/
│   ├── instagram-dm.js          # Instagram webhook handler
│   ├── whatsapp-leads.js        # WhatsApp lead processing
│   └── test-gemini.js           # Gemini API test
├── lib/
│   ├── gemini.js               # Gemini API client
│   ├── google-sheets.js        # Google Sheets client
│   ├── whatsapp.js             # WhatsApp API client
│   └── utils.js                # Utility functions
├── pages/
│   └── index.js                # Dashboard (optional)
├── package.json
├── vercel.json
└── README.md
```

### 2. Package.json
```json
{
  "name": "adorn-silver-vercel",
  "version": "1.0.0",
  "description": "Adorn Silver Marketing Automation on Vercel",
  "main": "index.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "googleapis": "^118.0.0",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

## 📝 API Routes Implementation

### 1. Instagram DM Handler (`api/instagram-dm.js`)

```javascript
import { NextResponse } from 'next/server';
import { handleInstagramDM } from '../../lib/instagram';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Process Instagram DM
    const result = await handleInstagramDM(data);
    
    return NextResponse.json({
      success: true,
      message: 'Instagram DM processed',
      result
    });
  } catch (error) {
    console.error('Instagram DM Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

### 2. Gemini AI Client (`lib/gemini.js`)

```javascript
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function generateResponse(message, category) {
  try {
    const prompt = `Generate a warm, helpful response for Adorn Silver to this Instagram message: "${message}". Category: ${category}. Brand voice: elegant, warm, never pushy. Include 1-2 relevant emojis. Keep under 100 words. Always include a friendly greeting and sign off as Team Adorn Silver.`;
    
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error('Failed to generate AI response');
  }
}
```

### 3. Google Sheets Client (`lib/google-sheets.js`)

```javascript
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function logConversation(username, message, response, channel) {
  try {
    const values = [
      [username, message, response, new Date().toISOString(), channel]
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Conversations!A:E',
      valueInputOption: 'RAW',
      requestBody: {
        values
      }
    });
  } catch (error) {
    console.error('Google Sheets Error:', error);
    throw error;
  }
}

export async function getNewLeads() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Leads!A:H',
    });
    
    return response.data.values || [];
  } catch (error) {
    console.error('Google Sheets Error:', error);
    throw error;
  }
}
```

### 4. WhatsApp Client (`lib/whatsapp.js`)

```javascript
import axios from 'axios';

const WATI_API_URL = 'https://api.wati.io/v1/whatsapp/send';

export async function sendWhatsAppMessage(phone, templateName, parameters) {
  try {
    const response = await axios.post(WATI_API_URL, {
      to: phone,
      template_name: templateName,
      parameters
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.WATI_API_KEY}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('WhatsApp API Error:', error);
    throw error;
  }
}
```

## 🔧 Environment Variables

Create a `.env.local` file:

```env
# Gemini AI
GEMINI_API_KEY=AIzaSyAbx5XF7Zc65wZI1RS2VMYihy7ehUG_D-U

# Google Sheets
GOOGLE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1_2XWCbNhOJJlY6iRgkYouCBMgQzAk4S-MSAvE3Tcmo

# WhatsApp WATI
WATI_API_KEY=your_wati_api_key
WATI_BUSINESS_NUMBER=your_business_number

# Instagram
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
INSTAGRAM_PAGE_ID=your_page_id
```

## 🚀 Deployment Steps

### Step 1: Create Vercel Project
1. **Sign up** at [vercel.com](https://vercel.com)
2. **Import your GitHub repository**
3. **Connect your project** to Vercel

### Step 2: Set Environment Variables
1. **Go to Project Settings** → Environment Variables
2. **Add all environment variables** from `.env.local`
3. **Set variables for all environments** (Development, Preview, Production)

### Step 3: Configure Webhooks
1. **Get your Vercel URL**: `https://your-project.vercel.app`
2. **Set Instagram webhook URL**: `https://your-project.vercel.app/api/instagram-dm`
3. **Update Instagram app settings** with the new webhook URL

### Step 4: Deploy
1. **Push to GitHub**: `git push origin main`
2. **Vercel auto-deploys** your project
3. **Check deployment logs** for any errors

## 📊 Monitoring and Analytics

### Vercel Analytics
- **Visit Dashboard**: `https://vercel.com/dashboard`
- **Monitor API usage** and response times
- **Check error logs** and performance metrics
- **Set up alerts** for high error rates

### Custom Logging
```javascript
// Add to your API routes
console.log('API Call:', {
  endpoint: request.url,
  timestamp: new Date().toISOString(),
  userAgent: request.headers.get('user-agent')
});
```

## 💰 Cost Comparison

### Vercel Costs
- **Free tier**: 100GB bandwidth, 125k invocations/month
- **Pro plan**: $20/month for 1TB bandwidth, 1M invocations
- **Pay-per-use**: $0.000006 per GB-second, $0.0000002 per invocation

### n8n Costs
- **Cloud Basic**: $20/month (limited executions)
- **Cloud Pro**: $99/month (more executions)
- **Self-hosted**: Server costs + maintenance

### Cost Savings with Vercel
- **No monthly subscription** - pay only for actual usage
- **Automatic scaling** - handle traffic spikes without manual intervention
- **Global performance** - CDN reduces latency worldwide

## 🔄 Migration from n8n

### Step 1: Export Logic
1. **Extract workflow logic** from n8n workflows
2. **Convert to JavaScript functions**
3. **Test individual components**

### Step 2: Implement API Routes
1. **Create API endpoints** for each workflow
2. **Implement error handling** and logging
3. **Add input validation**

### Step 3: Update Integrations
1. **Replace n8n nodes** with direct API calls
2. **Update webhook URLs** to point to Vercel
3. **Test all integrations**

### Step 4: Deploy and Monitor
1. **Deploy to Vercel**
2. **Monitor for errors**
3. **Optimize performance**

## 🎯 Benefits of Vercel Deployment

### Technical Benefits
- **Serverless architecture** - no server management
- **Automatic scaling** - handles traffic spikes
- **Global CDN** - fast response times
- **Built-in monitoring** - easy debugging

### Business Benefits
- **Cost-effective** - pay only for usage
- **No vendor lock-in** - easy to migrate
- **Developer-friendly** - standard JavaScript/Node.js
- **CI/CD integration** - automatic deployments

### Operational Benefits
- **No maintenance** - fully managed platform
- **High availability** - 99.9% uptime SLA
- **Security** - built-in DDoS protection
- **Easy rollback** - instant deployment history

## 🚨 Considerations

### When NOT to use Vercel
- You prefer visual workflow builders
- You need complex workflow orchestration
- Your team isn't comfortable with code
- You want out-of-the-box integrations

### When Vercel is Perfect
- You want cost-effective scaling
- Your team knows JavaScript/Node.js
- You prefer direct code control
- You want to avoid monthly subscriptions

## 🎉 Ready to Deploy!

Your Adorn Silver automation system can be successfully deployed on Vercel with:

✅ **No n8n required** - pure JavaScript implementation
✅ **Cost-effective** - pay only for actual usage
✅ **Scalable** - automatic scaling with traffic
✅ **Easy deployment** - Git-based deployment
✅ **Global performance** - CDN worldwide

**Next Steps:**
1. **Create the Vercel project structure**
2. **Implement the API routes**
3. **Set up environment variables**
4. **Deploy to Vercel**
5. **Configure webhooks**
6. **Monitor and optimize**

**You'll save money while getting better performance and more control!** 🚀