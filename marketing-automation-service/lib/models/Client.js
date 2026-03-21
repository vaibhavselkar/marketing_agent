import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  // Unique ID used in webhook URLs: /api/whatsapp-leads?clientId=abc123
  clientId: { type: String, required: true, unique: true },

  // Secret key for authenticating API calls from this client
  apiKey:   { type: String, required: true },

  // ── Business Branding ──────────────────────────────────────────────
  businessName:      { type: String, required: true },
  tagline:           { type: String, default: 'Quality products and services' },
  website:           { type: String, default: '#' },
  instagram:         { type: String, default: '' },
  productType:       { type: String, default: 'products' },
  discountCode:      { type: String, default: '' },
  discountPercent:   { type: String, default: '10' },
  currency:          { type: String, default: '₹' },
  country:           { type: String, default: 'India' },

  // ── WhatsApp (AiSensy) ────────────────────────────────────────────
  aiSensyApiKey:            { type: String, default: '' },
  adminWhatsappNumber:      { type: String, default: '' },
  // Campaign names (created in AiSensy dashboard)
  aiSensyWelcomeCampaign:   { type: String, default: 'welcome_message' },
  aiSensyFollowupCampaign:  { type: String, default: 'follow_up' },
  aiSensyOrderCampaign:     { type: String, default: 'order_confirmation' },
  aiSensyFestivalCampaign:  { type: String, default: 'festival_campaign' },
  aiSensyReengageCampaign:  { type: String, default: 're_engagement' },
  aiSensyReviewCampaign:    { type: String, default: 'review_request' },
  aiSensyAdminCampaign:     { type: String, default: 'new_lead_alert' },

  // ── Email (Gmail SMTP) ─────────────────────────────────────────────
  gmailUser:        { type: String, default: '' },
  gmailAppPassword: { type: String, default: '' },

  // ── Google Sheets CRM ─────────────────────────────────────────────
  googleSheetId:     { type: String, default: '' },
  googleClientEmail: { type: String, default: '' },
  googlePrivateKey:  { type: String, default: '' },

  // ── Instagram Graph API ────────────────────────────────────────────
  instagramAccessToken: { type: String, default: '' },
  instagramPageId:      { type: String, default: '' },
  instagramVerifyToken: { type: String, default: '' },

  // ── Gemini AI ─────────────────────────────────────────────────────
  geminiApiKey: { type: String, default: '' },

  // ── Contact ───────────────────────────────────────────────────────
  ownerEmail: { type: String, default: '' },
  ownerPhone: { type: String, default: '' },

  // ── Status ────────────────────────────────────────────────────────
  isActive:  { type: Boolean, default: true },
  plan:      { type: String, enum: ['basic', 'standard', 'premium'], default: 'basic' },
}, {
  timestamps: true,
});

// Prevent model recompilation in hot-reload (Next.js dev mode)
export default mongoose.models.Client || mongoose.model('Client', ClientSchema);
