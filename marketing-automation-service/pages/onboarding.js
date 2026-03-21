import { useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const STEPS = ['Business', 'WhatsApp', 'Email', 'Google Sheets', 'Done'];

const FIELDS = {
  0: [
    { key: 'businessName',    label: 'Business Name',       placeholder: 'Sparkle Gems',              required: true },
    { key: 'tagline',         label: 'Tagline',              placeholder: 'Premium handcrafted jewellery' },
    { key: 'website',         label: 'Website URL',          placeholder: 'https://yourbusiness.com' },
    { key: 'instagram',       label: 'Instagram Handle',     placeholder: '@yourbusiness' },
    { key: 'productType',     label: 'Product / Service Type', placeholder: 'jewellery, clothing, services…' },
    { key: 'discountCode',    label: 'Welcome Discount Code', placeholder: 'WELCOME10' },
    { key: 'discountPercent', label: 'Discount %',           placeholder: '10' },
    { key: 'currency',        label: 'Currency Symbol',      placeholder: '₹' },
    { key: 'country',         label: 'Country',              placeholder: 'India' },
    { key: 'ownerEmail',      label: 'Owner Email',          placeholder: 'owner@business.com' },
    { key: 'ownerPhone',      label: 'Owner Phone',          placeholder: '+919876543210' },
  ],
  1: [
    { key: 'aiSensyApiKey',       label: 'AiSensy API Key', placeholder: 'your_aisensy_api_key', required: true,
      help: 'Get from: app.aisensy.com → Settings → API & Webhook → Copy API Key' },
    { key: 'adminWhatsappNumber', label: 'Your WhatsApp Number (for lead alerts)', placeholder: '+919876543210',
      help: 'You will get a WhatsApp alert on this number whenever a new lead comes in' },
    { key: 'aiSensyWelcomeCampaign',  label: 'Welcome Campaign Name',     placeholder: 'welcome_message',
      help: 'Name of the campaign you created in AiSensy for welcome messages' },
    { key: 'aiSensyFollowupCampaign', label: 'Follow-up Campaign Name',   placeholder: 'follow_up',
      help: 'Campaign name for follow-up messages' },
    { key: 'aiSensyAdminCampaign',    label: 'Admin Alert Campaign Name', placeholder: 'new_lead_alert',
      help: 'Campaign name for new lead notifications to you' },
  ],
  2: [
    { key: 'gmailUser',        label: 'Gmail Address',    placeholder: 'business@gmail.com', required: true,
      help: 'The Gmail account emails will be sent from' },
    { key: 'gmailAppPassword', label: 'Gmail App Password', placeholder: 'xxxx xxxx xxxx xxxx', required: true, type: 'password',
      help: 'Google Account → Security → 2-Step Verification → App Passwords → Generate' },
  ],
  3: [
    { key: 'geminiApiKey',      label: 'Gemini AI API Key',      placeholder: 'AIzaSy...', required: true,
      help: 'Get free from: aistudio.google.com/app/apikey' },
    { key: 'googleSheetId',     label: 'Google Sheet ID',        placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',
      help: 'From your Google Sheet URL: /spreadsheets/d/[THIS_PART]/edit' },
    { key: 'googleClientEmail', label: 'Service Account Email',  placeholder: 'service@project.iam.gserviceaccount.com',
      help: 'Google Cloud Console → IAM → Service Accounts' },
    { key: 'googlePrivateKey',  label: 'Service Account Private Key', placeholder: '-----BEGIN PRIVATE KEY-----\n...', type: 'textarea',
      help: 'From the downloaded service account JSON file — copy the entire private_key value' },
    { key: 'instagramAccessToken', label: 'Instagram Access Token (optional)', placeholder: 'EAAxxxxx' },
    { key: 'instagramPageId',      label: 'Facebook Page ID (optional)',       placeholder: '123456789' },
    { key: 'instagramVerifyToken', label: 'Instagram Webhook Verify Token',    placeholder: 'any_random_string' },
  ],
};

export default function Onboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [webhooks, setWebhooks] = useState(null);

  if (status === 'loading') return null;
  if (status === 'unauthenticated') { router.push('/auth/login'); return null; }
  if (session?.user?.clientId && !webhooks) { router.push('/dashboard'); return null; }

  function set(key, value) { setForm(f => ({ ...f, [key]: value })); }

  function next() {
    const required = (FIELDS[step] || []).filter(f => f.required);
    const missing  = required.find(f => !form[f.key]);
    if (missing) { setError(`${missing.label} is required`); return; }
    setError('');
    setStep(s => s + 1);
  }

  async function submit() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setWebhooks(data);
    setStep(4);
  }

  const fields = FIELDS[step] || [];

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Progress bar */}
        <div style={s.progress}>
          {STEPS.map((label, i) => (
            <div key={i} style={s.stepWrap}>
              <div style={{ ...s.dot, background: i <= step ? '#6366f1' : '#e5e7eb', color: i <= step ? '#fff' : '#9ca3af' }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ ...s.stepLabel, color: i === step ? '#6366f1' : '#9ca3af' }}>{label}</span>
            </div>
          ))}
        </div>

        {step < 4 && (
          <>
            <h2 style={s.title}>
              {['Business Details', 'WhatsApp (AiSensy)', 'Email Setup', 'AI & Integrations'][step]}
            </h2>
            <p style={s.sub}>
              {['Tell us about your business', 'Connect AiSensy (free WhatsApp API)', 'Set up email sending', 'Connect Gemini AI and Google Sheets'][step]}
            </p>

            {error && <div style={s.error}>{error}</div>}

            <div style={s.fields}>
              {fields.map(f => (
                <div key={f.key} style={s.fieldWrap}>
                  <label style={s.label}>{f.label} {f.required && <span style={{ color: '#ef4444' }}>*</span>}</label>
                  {f.type === 'textarea'
                    ? <textarea style={{ ...s.input, height: '100px', resize: 'vertical' }}
                        placeholder={f.placeholder} value={form[f.key] || ''}
                        onChange={e => set(f.key, e.target.value)} />
                    : <input style={s.input} type={f.type || 'text'} placeholder={f.placeholder}
                        value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
                  }
                  {f.help && <p style={s.help}>{f.help}</p>}
                </div>
              ))}
            </div>

            <div style={s.btnRow}>
              {step > 0 && <button style={s.backBtn} onClick={() => setStep(s => s - 1)}>Back</button>}
              {step < 3
                ? <button style={s.btn} onClick={next}>Continue →</button>
                : <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading} onClick={submit}>
                    {loading ? 'Setting up...' : 'Finish Setup'}
                  </button>
              }
            </div>
          </>
        )}

        {step === 4 && webhooks && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
            <h2 style={s.title}>You're all set!</h2>
            <p style={s.sub}>Your automation is ready. Here are your webhook URLs:</p>

            <div style={s.webhookBox}>
              <p style={s.whLabel}>Your Client ID</p>
              <code style={s.code}>{webhooks.clientId}</code>

              <p style={{ ...s.whLabel, marginTop: '16px' }}>WhatsApp Webhook</p>
              <code style={s.code}>{`https://${typeof window !== 'undefined' ? window.location.host : ''}/api/whatsapp-leads?clientId=${webhooks.clientId}`}</code>

              <p style={{ ...s.whLabel, marginTop: '16px' }}>Instagram Webhook</p>
              <code style={s.code}>{`https://${typeof window !== 'undefined' ? window.location.host : ''}/api/instagram-dm?clientId=${webhooks.clientId}`}</code>
            </div>

            <button style={s.btn} onClick={() => router.push('/dashboard')}>Go to Dashboard →</button>
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  if (session.user.clientId) return { redirect: { destination: '/dashboard', permanent: false } };
  return { props: {} };
}

const s = {
  page:      { minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', fontFamily: 'Arial, sans-serif' },
  card:      { background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '600px', padding: '40px' },
  progress:  { display: 'flex', justifyContent: 'space-between', marginBottom: '32px' },
  stepWrap:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  dot:       { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 },
  stepLabel: { fontSize: '11px', fontWeight: 600 },
  title:     { margin: '0 0 6px', fontSize: '22px', fontWeight: 700, color: '#1a1a1a' },
  sub:       { margin: '0 0 24px', color: '#666', fontSize: '14px' },
  fields:    { maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' },
  fieldWrap: { marginBottom: '16px' },
  label:     { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600, color: '#444' },
  input:     { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  help:      { margin: '4px 0 0', fontSize: '11px', color: '#6b7280' },
  btnRow:    { display: 'flex', gap: '12px', marginTop: '28px' },
  btn:       { flex: 1, padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' },
  backBtn:   { padding: '12px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' },
  error:     { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  webhookBox:{ background: '#f8f9ff', border: '1px solid #e0e7ff', borderRadius: '10px', padding: '20px', margin: '20px 0', textAlign: 'left' },
  whLabel:   { margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: '#6366f1', textTransform: 'uppercase' },
  code:      { display: 'block', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#1a1a1a', wordBreak: 'break-all' },
};
