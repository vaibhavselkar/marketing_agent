# Workflow 2: Instagram DM Auto-Reply (AI-Powered)

## Overview

This workflow automatically responds to Instagram DMs and comments using AI-powered message generation, providing instant customer service while maintaining brand voice consistency.

## Trigger

**Type**: Instagram Graph API Webhook
**Description**: Activates on new Instagram DMs or comments containing specific keywords
**Configuration**:
- Event: Message
- Page ID: `INSTAGRAM_PAGE_ID`
- Webhook URL: `https://your-n8n-url/webhook/instagram-dm`

## Workflow Steps

### Step 1: Extract Message Data
**Node Type**: Set
**Purpose**: Extract and organize message information
**Data Extracted**:
- Username
- Message text
- Timestamp
- Sender ID

### Step 2: Keyword Category Detection
**Node Type**: IF Condition
**Purpose**: Categorize message based on keywords
**Categories Detected**:
- **Price Enquiry**: Keywords - "price", "how much", "cost"
- **Availability**: Keywords - "available", "in stock", "ready"
- **Custom Order**: Keywords - "custom", "personalized", "bespoke"
- **Shipping**: Keywords - "shipping", "delivery", "COD", "dispatch"

### Step 3: Generate AI Response
**Node Type**: HTTP Request (Claude AI)
**Purpose**: Generate personalized response using AI
**Model**: `claude-sonnet-4-20250513`
**Input Parameters**:
- Original message text
- Detected category
- Brand voice guidelines
- Customer name (if available)

**Response Guidelines**:
- Warm and helpful tone
- 1-2 relevant emojis
- Clear call-to-action
- Under 120 words
- Brand-consistent messaging

### Step 4: Send Instagram Reply
**Node Type**: HTTP Request (Instagram API)
**Purpose**: Post response to Instagram
**API Endpoint**: `https://graph.facebook.com/v19.0/{{INSTAGRAM_PAGE_ID}}/messages`
**Authentication**: Bearer token with Instagram access token

### Step 5: Log Conversation
**Node Type**: Google Sheets Append
**Purpose**: Record interaction for analytics and follow-up
**Data Logged**:
- Username
- Intent category
- Response sent
- Timestamp
- Conversation ID

## Integration Points

### Instagram Graph API
- **Webhook Setup**: Configure for message events
- **Authentication**: Page access token with pages_messaging permission
- **Rate Limits**: Monitor API usage to avoid throttling

### Claude AI
- **API Endpoint**: `https://api.anthropic.com/v1/messages`
- **Model**: `claude-sonnet-4-20250513`
- **Temperature**: 0.7 for balanced creativity
- **Max Tokens**: 300 for concise responses

### Google Sheets
- **Sheet**: Conversations log
- **Columns**: Username, Intent, Response, Timestamp
- **Purpose**: Analytics and manual follow-up tracking

## Message Templates by Category

### Price Enquiry Response
```
"Hi! 💫 Our silver pieces start from ₹599 for earrings and go up to ₹4,999 for statement necklaces. All pieces are 925 hallmarked silver. You can browse our full collection here: [link]. Want help picking something for a specific occasion? 🌸"
```

### Availability Response
```
"Hello! ✨ We have most of our collection in stock. For specific items, please share which piece you're interested in and I'll check availability for you. Our pieces are handcrafted, so some may require 2-3 days for preparation. What caught your eye? 💍"
```

### Custom Order Response
```
"Thank you for your interest in custom pieces! 🎨 We'd love to create something special for you. Please share your ideas - design preferences, metal type, gemstones, or any inspiration photos. Our custom orders typically take 7-10 days. Let's discuss your vision! ✨"
```

### Shipping Response
```
"Hi there! 📦 We ship across India with delivery in 3-5 business days. We offer both prepaid and COD options. Orders above ₹2,000 get free shipping! What would you like to order? I can help with shipping details and timelines. 🌟"
```

## Error Handling

### Failed AI Generation
- **Fallback**: Use pre-written response templates
- **Logging**: Record failed attempts for review
- **Retry Logic**: Attempt regeneration with simplified prompt

### Instagram API Errors
- **Rate Limiting**: Implement exponential backoff
- **Authentication**: Monitor token validity
- **Message Formatting**: Validate response format before sending

### Keyword Detection Failures
- **Default Response**: "Thanks for your message! Let me connect you with our team for personalized assistance. 🌸"
- **Escalation**: Flag for human review
- **Learning**: Improve keyword detection over time

## Success Metrics

### Response Quality
- **Response Time**: Target under 2 minutes
- **Relevance Score**: Measure keyword matching accuracy
- **Customer Satisfaction**: Track positive responses and engagement

### Engagement Metrics
- **Reply Rate**: Percentage of users who respond to automated replies
- **Conversion Rate**: DMs that lead to sales or website visits
- **Escalation Rate**: Messages requiring human intervention

### System Performance
- **Uptime**: Target 99%+ availability
- **API Success Rate**: Monitor successful API calls
- **Response Accuracy**: Measure correct category detection

## Integration with Other Workflows

### Handoff to Human Support
- **Escalation Triggers**: Complex queries, complaints, custom orders
- **Notification**: Send Slack/WhatsApp alert to owner
- **Context Transfer**: Include conversation history

### Data Sharing
- **Customer Insights**: Share intent data with analytics workflow
- **Trend Analysis**: Identify common questions for FAQ updates
- **Product Feedback**: Capture customer preferences and requests

## Configuration Requirements

### Instagram Business Account
- **Business Account**: Must be converted to business account
- **Facebook Page**: Connected Facebook page required
- **API Permissions**: pages_messaging, pages_read_engagement

### Webhook Setup
- **URL Configuration**: Set webhook endpoint in Facebook Developer Console
- **Verification**: Implement challenge response
- **Security**: Use HTTPS and verify signatures

### AI Model Configuration
- **API Key**: Valid Claude API key with sufficient credits
- **Model Selection**: Use recommended model for best results
- **Prompt Engineering**: Optimize prompts for consistent responses

## Monitoring and Maintenance

### Real-time Monitoring
- **Message Queue**: Monitor incoming message volume
- **Response Times**: Track average response time
- **Error Rates**: Monitor failed responses and API errors

### Content Updates
- **Response Templates**: Regularly update based on customer feedback
- **Keyword Database**: Expand keyword detection for new queries
- **Brand Guidelines**: Keep AI prompts aligned with brand voice

### Performance Optimization
- **Response Caching**: Cache common responses for faster delivery
- **Load Balancing**: Handle peak message volumes
- **API Optimization**: Minimize API calls and response times

## Advanced Features

### Multilingual Support
- **Language Detection**: Auto-detect message language
- **Response Translation**: Generate responses in customer's language
- **Cultural Sensitivity**: Adapt responses for different regions

### Sentiment Analysis
- **Emotion Detection**: Identify customer mood from message
- **Response Adaptation**: Adjust tone based on sentiment
- **Priority Handling**: Escalate negative sentiment messages

### Integration with CRM
- **Customer Lookup**: Identify returning customers
- **Purchase History**: Reference past purchases in responses
- **Preference Tracking**: Remember customer preferences