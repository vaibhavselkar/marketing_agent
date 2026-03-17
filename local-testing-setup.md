# Local Testing Setup with Your Credentials

This guide helps you set up and test your Instagram + WhatsApp automation system locally using your provided credentials.

## 🎯 Your Provided Credentials

### Google Gemini API Key
```
AIzaSyAbx5XF7Zc65wZI1RS2VMYihy7ehUG_D-U
```

### Google Sheet Link
```
https://docs.google.com/spreadsheets/d/1_2XWCbNhOJJlY6iRgkYouCBMgQzAk4S-MSAvE3Tcmo/edit?usp=sharing
```

## 🚀 Step 1: Get Your Google Sheet ID

Your Google Sheet ID is: `1_2XWCbNhOJJlY6iRgkYouCBMgQzAk4S-MSAvE3Tcmo`

## 🚀 Step 2: Set Up Test Environment

### Create Environment Variables File
Create a file called `.env` in your n8n directory:

```env
# Google Gemini API
GEMINI_API_KEY=AIzaSyAbx5XF7Zc65wZI1RS2VMYihy7ehUG_D-U

# Google Sheets
GOOGLE_SHEETS_CLIENT_ID=your_client_id_here
GOOGLE_SHEETS_CLIENT_SECRET=your_client_secret_here
GOOGLE_SHEETS_REFRESH_TOKEN=your_refresh_token_here
LEADS_SHEET_ID=1_2XWCbNhOJJlY6iRgkYouCBMgQzAk4S-MSAvE3Tcmo
CUSTOMERS_SHEET_ID=1_2XWCbNhOJJlY6iRgkYouCBMgQzAk4S-MSAvE3Tcmo
CONVERSATIONS_SHEET_ID=1_2XWCbNhOJJlY6iRgkYouCBMgQzAk4S-MSAvE3Tcmo

# Instagram (for testing, use mock values)
INSTAGRAM_ACCESS_TOKEN=test_token_for_local_testing
INSTAGRAM_PAGE_ID=test_page_id_for_local_testing

# WhatsApp WATI (for testing, use mock values)
WATI_API_KEY=test_api_key_for_local_testing
WATI_BUSINESS_NUMBER=test_business_number_for_local_testing
```

## 🚀 Step 3: Set Up Your Google Sheet

### Create Required Tabs
In your Google Sheet, create these 3 tabs:

1. **Leads** (for WhatsApp leads)
2. **Customers** (for converted customers)
3. **Conversations** (for Instagram DM logs)

### Set Up Leads Tab Headers
| A: ID | B: Name | C: Phone | D: Email | E: Source | F: Interest | G: Date Added | H: Status |
|------|---------|----------|----------|-----------|-------------|---------------|-----------|
| Auto | Text    | Text     | Text     | Text      | Text        | Date          | Text      |

### Set Up Conversations Tab Headers
| A: Username | B: Message | C: Response | D: Timestamp | E: Channel |
|-------------|------------|-------------|--------------|------------|
| Text        | Text       | Text        | DateTime     | Text       |

## 🚀 Step 4: Test Gemini API

### Test Your API Key
Run this command to test if your Gemini API key works:

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=AIzaSyAbx5XF7Zc65wZI1RS2VMYihy7ehUG_D-U" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Generate a warm welcome message for Adorn Silver customer named Priya who is interested in silver rings. Keep it under 50 words and include 1-2 emojis."
      }]
    }]
  }'
```

### Expected Response
You should get a response like:
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Namaste Priya! 🌟 Welcome to Adorn Silver! We're delighted to help you find the perfect silver ring. Our handcrafted collection features elegant designs that will make you shine. Let us know what style you're looking for! ✨\n\nWarm regards,\nTeam Adorn Silver"
          }
        ]
      }
    }
  ]
}
```

## 🚀 Step 5: Test Google Sheets Connection

### Test Google Sheets API
Create a simple test script to verify your Google Sheets connection:

```javascript
// Test Google Sheets connection
const axios = require('axios');

const sheetId = '1_2XWCbNhOJJlY6iRgkYouCBMgQzAk4S-MSAvE3Tcmo';
const apiKey = 'YOUR_GOOGLE_SHEETS_API_KEY'; // You'll need to get this

const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Leads!A1:H1?key=${apiKey}`;

axios.get(url)
  .then(response => {
    console.log('Google Sheets connection successful!');
    console.log('Headers:', response.data.values[0]);
  })
  .catch(error => {
    console.error('Google Sheets connection failed:', error.message);
  });
```

## 🚀 Step 6: Import and Test Workflows

### Import Your Workflow
1. **Go to n8n.cloud** or your local n8n instance
2. **Import** the `simple-instagram-whatsapp-workflows.json` file
3. **Replace credentials** with your test values

### Test Instagram DM Workflow
1. **Set up webhook testing** using [webhook.site](https://webhook.site)
2. **Send test data** to your webhook URL:

```json
{
  "entry": [
    {
      "messaging": [
        {
          "sender": {
            "username": "testuser",
            "id": "123456789"
          },
          "message": {
            "text": "How much is the silver ring?"
          }
        }
      ],
      "time": "2024-01-01T12:00:00Z"
    }
  ]
}
```

3. **Check if:**
   - Gemini API generates response
   - Google Sheets logs the conversation
   - No errors in workflow execution

### Test WhatsApp Lead Capture
1. **Add test data** to your Google Sheet Leads tab:

| ID | Name | Phone | Email | Source | Interest | Date Added | Status |
|----|------|-------|-------|--------|----------|------------|---------|
| 1 | Test Customer | +919876543210 | test@example.com | Instagram | Rings | 2024-01-01 | new |

2. **Trigger the workflow manually** in n8n
3. **Check if:**
   - Data is extracted correctly
   - Logic processes the lead
   - Status updates in Google Sheets

## 🚀 Step 7: Local Testing Commands

### Test n8n Installation
```bash
# Check if n8n is running
curl http://localhost:5678/rest/workflows

# Test webhook endpoint (replace with your actual webhook URL)
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  http://localhost:5678/webhook/instagram-dm
```

### Test All Components
```bash
# 1. Test Gemini API
echo "Testing Gemini API..."
curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=AIzaSyAbx5XF7Zc65wZI1RS2VMYihy7ehUG_D-U" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' | grep -o '"text":"[^"]*"' | head -1

# 2. Test Google Sheets (if you have API key)
echo "Testing Google Sheets..."
# Add your Google Sheets test command here

# 3. Test n8n workflows
echo "Testing n8n workflows..."
# Add your n8n test commands here
```

## 🚀 Step 8: Troubleshooting

### Common Issues

**Gemini API Error:**
- Check if API key is correct
- Verify quota hasn't been exceeded
- Ensure proper internet connection

**Google Sheets Error:**
- Check if sheet ID is correct
- Verify sheet permissions
- Ensure proper OAuth credentials

**n8n Workflow Error:**
- Check node connections
- Verify credentials are set
- Look at error messages in execution logs

### Debug Commands
```bash
# Check n8n logs
docker logs n8n

# Test individual API endpoints
curl -I https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent

# Verify Google Sheet accessibility
curl -I "https://docs.google.com/spreadsheets/d/1_2XWCbNhOJJlY6iRgkYouCBMgQzAk4S-MSAvE3Tcmo/edit"
```

## 🎉 Success Criteria

Your local testing is successful if:

✅ **Gemini API responds** with generated text
✅ **Google Sheets accepts** data writes
✅ **n8n workflows execute** without errors
✅ **Data flows correctly** between all components
✅ **No authentication errors** occur

## 📝 Next Steps After Local Testing

1. **Fix any issues** found during testing
2. **Set up real credentials** for Instagram and WhatsApp
3. **Go live** with real customer interactions
4. **Monitor performance** and optimize as needed

## 💡 Pro Tips

- **Start with small test data** to avoid overwhelming the system
- **Test one component at a time** before testing the full workflow
- **Keep your API keys secure** and don't share them publicly
- **Use n8n's built-in debugging** features to troubleshoot issues
- **Document any issues** you encounter for future reference

You're all set to test your system locally! Start with the Gemini API test, then move through each component systematically. 🚀