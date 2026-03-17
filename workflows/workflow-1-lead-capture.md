# Workflow 1: Lead Capture & Welcome Sequence

## Overview

This workflow captures new leads from Google Sheets and automatically sends a personalized welcome sequence to nurture them into customers.

## Trigger

**Type**: Google Sheets - New Row
**Description**: Activates when a new lead is added to the Leads sheet
**Configuration**:
- Sheet ID: `LEADS_SHEET_ID`
- Watch for: New rows
- Polling interval: 5 minutes

## Workflow Steps

### Step 1: Extract Lead Data
**Node Type**: Set
**Purpose**: Extract and organize lead information from the Google Sheets row
**Data Extracted**:
- Name
- Phone number
- Email address
- Source (Instagram/WhatsApp/Website/Referral)
- Interest category (Rings/Necklaces/Earrings/Bangles/Gifting)

### Step 2: Send WhatsApp Welcome Message
**Node Type**: HTTP Request (WATI API)
**Purpose**: Send immediate welcome message via WhatsApp
**Message Template**: `welcome_message`
**Personalization**:
- Customer name
- 10% discount code (ADORN10)
- Collection link
**API Endpoint**: `https://api.wati.io/v1/whatsapp/send`

### Step 3: Send Welcome Email
**Node Type**: Send Email (Gmail/SMTP)
**Purpose**: Send detailed welcome email with brand story
**Subject**: "Your Adorn Silver journey starts here 💎"
**Content Includes**:
- Brand introduction
- Top 3 bestsellers
- First-order discount code
- Collection link

### Step 4: Tag Lead in CRM
**Node Type**: Google Sheets Update
**Purpose**: Update lead status and add segmentation tags
**Updates Made**:
- Status: `lead_new`
- Tags: `lead_new, source_[source], interest_[category]`

### Step 5: 3-Day Follow-Up
**Node Type**: Wait + HTTP Request
**Purpose**: Send follow-up message after 3 days
**Wait Time**: 3 days
**Message Content**: Trending products link and gentle reminder

### Step 6: 7-Day Social Proof
**Node Type**: Wait + HTTP Request
**Purpose**: Send social proof message with customer testimonials
**Wait Time**: 7 days
**Content**: Customer photos and testimonials link

## Integration Points

### Google Sheets
- **Read**: New lead data from Leads sheet
- **Update**: Lead status and tags in Leads sheet

### WhatsApp (WATI)
- **API Endpoint**: `https://api.wati.io/v1/whatsapp/send`
- **Authentication**: Bearer token
- **Templates Used**: `welcome_message`, `follow_up_message`, `social_proof_message`

### Email (Gmail)
- **SMTP Settings**: Gmail SMTP with app password
- **Sender**: noreply@adornsilver.com
- **HTML Template**: Branded welcome email

## Data Flow

1. **Lead Entry**: New row added to Google Sheets Leads tab
2. **Data Extraction**: Workflow extracts lead information
3. **Immediate Response**: WhatsApp welcome message sent
4. **Email Follow-up**: Welcome email sent with brand details
5. **CRM Update**: Lead tagged and status updated
6. **Nurture Sequence**: Automated follow-ups at 3 and 7 days
7. **Lead Status**: Progress tracked through nurturing stages

## Error Handling

### Failed WhatsApp Messages
- Log error to Google Sheets
- Retry mechanism for failed deliveries
- Fallback to email communication

### Email Delivery Issues
- Check SMTP authentication
- Verify recipient email format
- Log delivery failures for manual follow-up

### Google Sheets Errors
- Verify sheet permissions
- Check row structure consistency
- Implement data validation

## Success Metrics

### Immediate Metrics
- **Message Delivery Rate**: Target 95%+ successful deliveries
- **Email Open Rate**: Target 40%+ open rate
- **Response Rate**: Track replies to welcome messages

### Long-term Metrics
- **Lead to Customer Conversion**: Track percentage of leads that become buyers
- **Discount Code Usage**: Monitor ADORN10 code redemptions
- **Engagement Rate**: Measure interaction with follow-up messages

## Optimization Opportunities

### A/B Testing
- Test different welcome message variations
- Experiment with discount code timing
- Compare email vs WhatsApp effectiveness

### Personalization Enhancement
- Use lead source for tailored messaging
- Customize based on interest category
- Implement dynamic content blocks

### Timing Optimization
- Test different follow-up intervals
- Analyze best times for message delivery
- Adjust based on response patterns

## Integration with Other Workflows

### Handoff to Workflow 3
- When lead makes first purchase, trigger post-purchase flow
- Update customer status from lead to buyer
- Transfer interaction history

### Data Sharing
- Update customer database with lead interactions
- Share engagement metrics with analytics workflow
- Sync preferences for future campaigns

## Configuration Requirements

### Google Sheets Setup
- Create Leads sheet with required columns
- Set up proper permissions for n8n access
- Implement data validation rules

### WATI Configuration
- Create and approve message templates
- Set up business number and API access
- Configure webhook for delivery receipts

### Email Setup
- Configure Gmail SMTP with app password
- Create branded email templates
- Set up tracking for opens and clicks

## Monitoring and Maintenance

### Daily Checks
- Monitor message delivery rates
- Check for failed API calls
- Review lead conversion metrics

### Weekly Reviews
- Analyze engagement patterns
- Update message templates if needed
- Review and clean lead database

### Monthly Optimization
- Review conversion funnel performance
- Update discount codes and offers
- Analyze seasonal trends and adjust messaging