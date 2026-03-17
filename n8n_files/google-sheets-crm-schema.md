# Adorn Silver Google Sheets CRM Schema

This document outlines the complete Google Sheets database structure for the Adorn Silver marketing automation system.

## Overview

The CRM system uses multiple Google Sheets tabs to organize customer data, leads, orders, conversations, content calendar, and analytics.

## Sheet Structure

### 1. Customers Sheet (Main CRM Database)

**Purpose**: Primary customer database containing all customer information and interaction history.

**Columns**:
- **ID** (Auto-generated): Unique customer identifier
- **Name** (Text): Customer full name
- **Phone** (Text): Phone number with country code (e.g., +919876543210)
- **Email** (Text): Customer email address
- **Source** (Dropdown): How they heard about us
  - Options: Instagram, WhatsApp, Website, Referral
- **Interest** (Dropdown): Preferred product category
  - Options: Rings, Necklaces, Earrings, Bangles, Gifting
- **Status** (Dropdown): Customer lifecycle stage
  - Options: Lead, Warm, Buyer, Inactive
- **Tags** (Text): Comma-separated tags for segmentation
  - Examples: lead_new, buyer, vip, festival_buyer, diwali_interest
- **Last Contact** (Date): Date of last message sent to customer
- **Last Purchase** (Date): Date of last order
- **Total Spent** (Number): Cumulative order value in INR
- **Order Count** (Number): Total number of purchases
- **Notes** (Text): Manual notes field for customer details

**Sample Data**:
| ID | Name | Phone | Email | Source | Interest | Status | Tags | Last Contact | Last Purchase | Total Spent | Order Count | Notes |
|----|------|-------|-------|--------|----------|--------|------|--------------|---------------|-------------|-------------|-------|
| C001 | Priya Sharma | +919876543210 | priya@example.com | Instagram | Rings | Buyer | buyer, vip, festival_buyer | 2024-10-15 | 2024-10-10 | 8500 | 3 | Loves statement rings |
| C002 | Ankit Verma | +919988776655 | ankit@example.com | Website | Necklaces | Lead | lead_new, interest_necklaces | 2024-10-16 |  | 0 | 0 | Interested in gifting |

### 2. Leads Sheet

**Purpose**: Captures new leads from various sources before they become customers.

**Columns**:
- **ID** (Auto-generated): Unique lead identifier
- **Name** (Text): Lead full name
- **Phone** (Text): Phone number with country code
- **Email** (Text): Lead email address
- **Source** (Dropdown): Lead source
  - Options: Instagram, WhatsApp, Website, Referral
- **Interest** (Dropdown): Product interest
  - Options: Rings, Necklaces, Earrings, Bangles, Gifting
- **Date Added** (Date): When lead was captured
- **Status** (Dropdown): Lead status
  - Options: New, Contacted, Qualified, Converted
- **Notes** (Text): Additional information

### 3. Orders Sheet

**Purpose**: Records all orders and transactions.

**Columns**:
- **Order ID** (Text): Unique order identifier
- **Customer ID** (Text): Reference to customer
- **Customer Name** (Text): Customer full name
- **Customer Phone** (Text): Customer phone
- **Customer Email** (Text): Customer email
- **Products** (Text): List of products purchased
- **Order Value** (Number): Total order value in INR
- **Order Date** (Date): Date of order
- **Payment Status** (Dropdown): 
  - Options: Pending, Paid, Failed, Refunded
- **Shipping Status** (Dropdown):
  - Options: Processing, Shipped, Delivered, Cancelled
- **Shipping Address** (Text): Delivery address
- **Notes** (Text): Order-specific notes

### 4. Conversations Sheet

**Purpose**: Logs all customer interactions and communications.

**Columns**:
- **ID** (Auto-generated): Unique conversation identifier
- **Customer ID** (Text): Reference to customer
- **Channel** (Dropdown): Communication channel
  - Options: WhatsApp, Instagram DM, Email, Phone
- **Intent** (Text): Purpose of conversation
  - Examples: Price enquiry, Order status, Custom order, Shipping info
- **Message** (Text): Conversation content
- **Response** (Text): Response sent
- **Timestamp** (DateTime): When conversation occurred
- **Status** (Dropdown): 
  - Options: Resolved, Pending, Escalated

### 5. Content Calendar Sheet

**Purpose**: Manages social media content scheduling and posting.

**Columns**:
- **ID** (Auto-generated): Unique post identifier
- **Date** (Date): Scheduled posting date
- **Platform** (Dropdown): Where to post
  - Options: Instagram, WhatsApp, Both
- **Post Type** (Dropdown): Content format
  - Options: Reel, Carousel, Static
- **Topic** (Text): Post theme/topic
- **Status** (Dropdown): Posting status
  - Options: Scheduled, Posted, Cancelled
- **Caption** (Text): Generated caption
- **Image URL** (Text): Media file link
- **Post URL** (Text): Link to published post
- **Posted At** (DateTime): When post was actually published
- **Engagement** (Number): Post engagement metrics

### 6. Analytics Sheet

**Purpose**: Tracks campaign performance and metrics.

**Columns**:
- **Date** (Date): Date of metric
- **Type** (Dropdown): Metric category
  - Options: Lead, Message, Order, Instagram DM, Campaign
- **Value** (Number): Metric value
- **Details** (Text): Additional context
- **Campaign Name** (Text): Associated campaign (if applicable)

### 7. Master Analytics Sheet

**Purpose**: Consolidated weekly performance reports.

**Columns**:
- **Week Ending** (Date): Week end date
- **New Leads** (Number): Number of new leads
- **Messages Sent** (Number): Total messages sent
- **Orders Placed** (Number): Number of orders
- **Revenue Generated** (Number): Total revenue in INR
- **Instagram DMs** (Number): Instagram messages handled
- **Weekly Summary** (Text): AI-generated performance summary

## Data Flow

1. **Lead Capture**: New leads enter through the Leads sheet
2. **Lead Nurturing**: Workflow 1 processes leads and updates status
3. **Customer Conversion**: Leads become customers in the Customers sheet
4. **Order Processing**: Orders are recorded in the Orders sheet
5. **Communication**: All interactions logged in Conversations sheet
6. **Content Management**: Social media content managed in Content Calendar
7. **Analytics**: Performance tracked in Analytics and Master Analytics sheets

## Integration Points

- **n8n Workflows**: All workflows read from and write to these sheets
- **Google Sheets API**: Used for data operations
- **Real-time Updates**: Workflows trigger on sheet changes
- **Data Validation**: Dropdown lists ensure data consistency

## Best Practices

1. **Consistent Naming**: Use standardized formats for all fields
2. **Regular Cleanup**: Archive old data periodically
3. **Data Validation**: Use dropdown lists to prevent typos
4. **Backup**: Regularly backup the entire spreadsheet
5. **Permissions**: Control access based on team roles

## Security Considerations

- **PII Protection**: Customer phone numbers and emails are sensitive data
- **Access Control**: Limit sheet access to authorized personnel
- **Data Retention**: Follow data protection regulations for customer data
- **Audit Trail**: Track all changes to customer records