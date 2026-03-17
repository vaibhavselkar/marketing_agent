# Adorn Silver Marketing Automation - Simple Start Guide

Start with Instagram & WhatsApp automation using Google's free Gemini API. This simplified setup gets you running quickly with core functionality.

## 🎯 What We're Building

**Phase 1**: Instagram DM responses + WhatsApp welcome messages
**Phase 2**: Add more channels later (Email, Content Calendar, etc.)

## 📋 Prerequisites (Simplified)

### Required Accounts
- [ ] **n8n instance** (Cloud or Self-hosted)
- [ ] **Google account** with Sheets access
- [ ] **WhatsApp Business account** (via WATI)
- [ ] **Instagram Business account**
- [ ] **Google AI Studio** (for Gemini API)

### What You DON'T Need Yet
- ❌ Claude AI account
- ❌ Buffer account
- ❌ Complex email setup
- ❌ Multiple integrations

## 🛠️ Step 1: Set Up n8n (15 minutes)

### Option A: n8n Cloud (Recommended)
1. Go to [n8n.io](https://n8n.io) → "Get Started"
2. Sign up for free account
3. Verify email and log in

### Option B: Self-Hosted (Docker)
```bash
# Install Docker first, then run:
docker run -d --name n8n -p 5678:5678 n8nio/n8n
# Access at http://localhost:5678
```

## 📊 Step 2: Set Up Google Sheets (15 minutes)

### Create Your Simple CRM
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create new spreadsheet: "Adorn Silver Simple CRM"
3. Create these tabs:
   - `Leads` - New leads from Instagram/WhatsApp
   - `Customers` - Converted customers
   - `Conversations` - Instagram DM log

### Set Up Basic Structure

**Leads Tab**:
| Name | Phone | Email | Source | Interest | Date Added | Status |
|------|-------|-------|--------|----------|------------|---------|

**Customers Tab**:
| Name | Phone | Email | Last Purchase | Total Spent | Status |
|------|-------|-------|---------------|-------------|---------|

**Conversations Tab**:
| Username | Message | Response | Timestamp | Channel |
|----------|---------|----------|-----------|---------|

## 🤖 Step 3: Set Up Google Gemini API (20 minutes)

### Get Free Gemini API Access
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key (keep it safe!)

### Test Gemini API
```bash
# Test your API key
curl -X POST \
  "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Generate a warm welcome message for a silver jewellery customer named Priya"
      }]
    }]
  }'
```

## 📱 Step 4: Set Up WhatsApp Business (25 minutes)

### Sign Up with WATI (Free Plan)
1. Go to [wati.io](https://wati.io)
2. Sign up for free account
3. Connect your WhatsApp Business number
4. Create basic message templates:

**Template 1: Welcome Message**
```
Template Name: welcome_message
Content: Hi {{1}} ✨ Welcome to Adorn Silver! We handcraft premium 925 silver jewellery. Here's 10% off your first order: ADORN10. Browse: https://adornsilver.com
```

**Template 2: Follow-up**
```
Template Name: follow_up
Content: Hi {{1}}! Did you find something you loved? Here's what's trending: https://adornsilver.com/trending
```

### Get WATI Credentials
- Go to Settings → API Keys
- Copy your API key and business number

## 📸 Step 5: Set Up Instagram (20 minutes)

### Convert to Business Account
1. Open Instagram app → Profile → Menu → Settings
2. Account → Switch to Professional Account → Business
3. Connect to your Facebook Page

### Set Up Basic Webhook
1. Go to [Facebook Developer Console](https://developers.facebook.com)
2. Create new app → Business → Name: "Adorn Silver Simple"
3. Add "Instagram Graph API" product
4. Get Page Access Token with these permissions:
   - `pages_messaging`
   - `instagram_basic`
   - `instagram_manage_messages`

### Set Up Webhook URL
- Callback URL: `https://your-n8n-url/webhook/instagram-dm`
- Verify Token: `adornsilver123` (remember this)

## 🔧 Step 6: Create Simplified Workflows (45 minutes)

### Workflow 1: Instagram DM Auto-Reply

**Purpose**: Respond to Instagram messages instantly

**Steps to Create in n8n**:

1. **Trigger**: Instagram Webhook
   - URL: `/webhook/instagram-dm`
   - Method: POST

2. **Extract Data**: Set node
   ```javascript
   {
     "username": "={{$json[\"entry\"][0][\"messaging\"][0][\"sender\"][\"username\"]}}",
     "message": "={{$json[\"entry\"][0][\"messaging\"][0][\"message\"][\"text\"]}}",
     "timestamp": "={{$json[\"entry\"][0][\"time\"]}}"
   }
   ```

3. **Keyword Detection**: IF node
   - Price enquiry: Contains "price" or "how much"
   - Availability: Contains "available" or "in stock"
   - Custom order: Contains "custom" or "personalized"
   - Shipping: Contains "shipping" or "delivery"

4. **Generate Response**: HTTP Request (Gemini API)
   ```javascript
   URL: https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={{GEMINI_API_KEY}}
   
   Body:
   {
     "contents": [{
       "parts": [{
         "text": "Generate a warm, helpful response for Adorn Silver to this Instagram message: \"{{$json[\"message\"]}}\". Category: {{$node[\"keyword_detection\"].output}}. Brand voice: elegant, warm, never pushy. Include 1-2 emojis. Keep under 100 words."
       }]
     }]
   }
   ```

5. **Send Reply**: HTTP Request (Instagram API)
   ```javascript
   URL: https://graph.facebook.com/v19.0/{{INSTAGRAM_PAGE_ID}}/messages
   
   Body:
   {
     "recipient": {"id": "{{$json[\"sender_id\"]}}"},
     "message": {"text": "={{$node[\"gemini_response\"].json[\"candidates\"][0][\"content\"][\"parts\"][0][\"text\"]}}"}
   }
   ```

6. **Log Conversation**: Google Sheets Append
   - Add to Conversations tab

### Workflow 2: WhatsApp Lead Capture

**Purpose**: Capture leads and send welcome sequence

**Steps to Create in n8n**:

1. **Trigger**: Google Sheets - New Row
   - Sheet: Leads
   - Watch for new rows

2. **Send Welcome Message**: HTTP Request (WATI API)
   ```javascript
   URL: https://api.wati.io/v1/whatsapp/send
   
   Headers:
   Authorization: Bearer {{WATI_API_KEY}}
   
   Body:
   {
     "to": "={{$json[\"Phone\"]}}",
     "template_name": "welcome_message",
     "parameters": {
       "1": "={{$json[\"Name\"]}}"
     }
   }
   ```

3. **Update Lead Status**: Google Sheets Update
   - Set Status to "contacted"

4. **Schedule Follow-up**: Wait + HTTP Request
   - Wait 3 days
   - Send follow-up message via WATI

## 🧪 Step 7: Test Your System (20 minutes)

### Test Instagram DM Response
1. Send DM to your Instagram business account: "How much is the silver ring?"
2. Check if you get AI-generated response within 2 minutes
3. Verify conversation is logged in Google Sheets

### Test WhatsApp Welcome
1. Add test lead to Google Sheets Leads tab:
   ```
   Name: Test Customer
   Phone: +919876543210
   Email: test@example.com
   Source: Instagram
   Interest: Rings
   Date Added: Today
   Status: new
   ```
2. Check if WhatsApp message is sent
3. Verify lead status updates to "contacted"

## 🚀 Step 8: Go Live (10 minutes)

### Activate Workflows
1. In n8n, turn on both workflows
2. Monitor first few hours for any issues
3. Check Google Sheets for logged conversations

### Monitor Performance
- **Instagram**: Response time, message quality
- **WhatsApp**: Delivery rate, customer responses
- **Leads**: Conversion from lead to customer

## 💰 Cost Breakdown (Phase 1)

### Free Services
- ✅ **Google Gemini API**: Free tier available
- ✅ **Google Sheets**: Free with Google account
- ✅ **n8n Cloud**: Free plan available
- ✅ **Instagram**: Free business account

### Low Cost Services
- 💵 **WATI**: Free plan available, paid plans start at $49/month
- 💵 **n8n Self-hosted**: Free (just hosting costs)

**Total Phase 1 Cost**: $0-50/month depending on usage

## 📈 Expected Results (Phase 1)

### Instagram Automation
- **Response Time**: Instant (2-5 minutes)
- **Availability**: 24/7 customer service
- **Consistency**: Always on-brand responses

### WhatsApp Automation
- **Lead Capture**: Automatic from Google Sheets
- **Welcome Sequence**: Immediate response + follow-up
- **Lead Nurturing**: Automated touchpoints

### Time Savings
- **Customer Service**: 5-10 hours/week saved
- **Lead Follow-up**: 100% automated
- **Response Consistency**: Always professional and on-brand

## 🔄 Next Steps (Phase 2 - Optional)

Once Phase 1 is working well, you can add:
- Email automation
- Content calendar
- Festival campaigns
- Analytics and reporting
- Customer re-engagement

## 🆘 Troubleshooting Common Issues

### Gemini API Not Working
- Check API key is correct
- Verify you have credits in Google AI Studio
- Test with simple curl command

### Instagram Webhook Not Triggering
- Check webhook URL is correct
- Verify Facebook app permissions
- Check Instagram is connected to Facebook Page

### WhatsApp Messages Not Sending
- Verify WATI account is active
- Check message templates are approved
- Ensure phone number is correct format

## 📞 Support

### Documentation
- **Main Setup**: `deployment-guide.md` (full version)
- **Simple Start**: This guide (`simple-start-guide.md`)
- **Troubleshooting**: `test-validation.md`

### Quick Help
- **n8n Issues**: [docs.n8n.io](https://docs.n8n.io)
- **Gemini API**: [ai.google.dev](https://ai.google.dev)
- **WATI Support**: [wati.io/support](https://wati.io/support)

## 🎉 Congratulations!

You now have a working Instagram + WhatsApp automation system using Google's free Gemini API! 

**What you've accomplished:**
✅ Instant Instagram DM responses
✅ Automated WhatsApp welcome messages
✅ Lead capture and follow-up
✅ Customer conversation logging
✅ AI-powered customer service

**Ready to start automating your customer service and lead generation!** 🚀

**Next**: Monitor your system for a week, then consider adding more channels in Phase 2.