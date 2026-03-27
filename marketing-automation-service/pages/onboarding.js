import { useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const CHANNELS = [
  { id: 'whatsapp',  name: 'WhatsApp',          icon: '💬', color: '#25D366', desc: 'Automated welcome & follow-up messages to leads' },
  { id: 'instagram', name: 'Instagram DM',       icon: '📸', color: '#E1306C', desc: 'AI auto-replies to every DM using Gemini' },
  { id: 'email',     name: 'Email',              icon: '📧', color: '#4285F4', desc: 'Welcome, follow-up & festival email campaigns' },
  { id: 'google',    name: 'Google Sheets + AI', icon: '📊', color: '#0F9D58', desc: 'CRM to store & track all leads + Gemini AI' },
  { id: 'telegram',  name: 'Telegram',           icon: '✈️', color: '#0088cc', desc: 'Instant lead alerts on your phone (free, unlimited)' },
  { id: 'reddit',    name: 'Reddit',             icon: '🔴', color: '#FF4500', desc: 'Post to subreddits for free organic reach' },
];

const BUSINESS_FIELDS = [
  { key: 'businessName',    label: 'Business Name',          placeholder: 'Sparkle Gems',                required: true },
  { key: 'tagline',         label: 'Tagline',                placeholder: 'Premium handcrafted jewellery' },
  { key: 'website',         label: 'Website URL',            placeholder: 'https://yourbusiness.com' },
  { key: 'instagram',       label: 'Instagram Handle',       placeholder: '@yourbusiness' },
  { key: 'productType',     label: 'Product / Service Type', placeholder: 'jewellery, clothing, services…' },
  { key: 'discountCode',    label: 'Welcome Discount Code',  placeholder: 'WELCOME10' },
  { key: 'discountPercent', label: 'Discount %',             placeholder: '10' },
  { key: 'currency',        label: 'Currency Symbol',        placeholder: '₹' },
  { key: 'country',         label: 'Country',               placeholder: 'India' },
  { key: 'ownerEmail',      label: 'Owner Email',           placeholder: 'owner@business.com' },
  { key: 'ownerPhone',      label: 'Owner Phone',           placeholder: '+919876543210' },
];

const CHANNEL_FIELDS = {
  whatsapp: [
    { key: 'aiSensyApiKey',           label: 'AiSensy API Key',                    placeholder: 'your_aisensy_api_key',    required: true,
      help: 'Get from: app.aisensy.com → Settings → API & Webhook → Copy API Key' },
    { key: 'adminWhatsappNumber',     label: 'Your WhatsApp Number (for alerts)',  placeholder: '+919876543210',
      help: 'You will receive a WhatsApp alert on this number for every new lead' },
    { key: 'aiSensyWelcomeCampaign',  label: 'Welcome Campaign Name',             placeholder: 'welcome_message',
      help: 'Name of the campaign you created in AiSensy for welcome messages' },
    { key: 'aiSensyFollowupCampaign', label: 'Follow-up Campaign Name',           placeholder: 'follow_up' },
    { key: 'aiSensyAdminCampaign',    label: 'Admin Alert Campaign Name',         placeholder: 'new_lead_alert' },
  ],
  instagram: [
    { key: 'instagramAccessToken', label: 'Instagram Access Token', placeholder: 'EAAxxxxx', required: true,
      help: 'Facebook Developer Console → Your App → Instagram → Access Token' },
    { key: 'instagramPageId',      label: 'Facebook Page ID',       placeholder: '123456789', required: true,
      help: 'Your Facebook Page ID (linked to the Instagram account)' },
    { key: 'instagramVerifyToken', label: 'Webhook Verify Token',   placeholder: 'any_random_string',
      help: 'Make up any random string — enter this when setting up the webhook in Facebook' },
    { key: 'geminiApiKey',         label: 'Gemini AI Key (for smart DM replies)', placeholder: 'AIzaSy...',
      help: 'Free from: aistudio.google.com/app/apikey — generates context-aware DM replies' },
  ],
  email: [
    { key: 'gmailUser',        label: 'Gmail Address',      placeholder: 'business@gmail.com',    required: true },
    { key: 'gmailAppPassword', label: 'Gmail App Password', placeholder: 'xxxx xxxx xxxx xxxx',   required: true, type: 'password',
      help: 'Google Account → Security → 2-Step Verification → App Passwords → Generate' },
  ],
  google: [
    { key: 'geminiApiKey',      label: 'Gemini AI API Key',           placeholder: 'AIzaSy...', required: true,
      help: 'Free from: aistudio.google.com/app/apikey' },
    { key: 'googleSheetId',     label: 'Google Sheet ID',             placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms', required: true,
      help: 'From your Google Sheet URL: /spreadsheets/d/[THIS_PART]/edit' },
    { key: 'googleClientEmail', label: 'Service Account Email',       placeholder: 'service@project.iam.gserviceaccount.com', required: true,
      help: 'Google Cloud Console → IAM → Service Accounts' },
    { key: 'googlePrivateKey',  label: 'Service Account Private Key', placeholder: '-----BEGIN PRIVATE KEY-----\n...', type: 'textarea', required: true,
      help: 'From the downloaded service account JSON — copy the entire private_key value' },
  ],
  telegram: [
    { key: 'telegramBotToken', label: 'Telegram Bot Token',          placeholder: '123456789:AAFxxxxxxxxx', required: true,
      help: 'Open Telegram → search @BotFather → /newbot → copy the token' },
    { key: 'telegramChatId',   label: 'Telegram Chat / Channel ID',  placeholder: '-1001234567890', required: true,
      help: 'Send a message to your bot, then visit: api.telegram.org/bot{TOKEN}/getUpdates' },
  ],
  reddit: [
    { key: 'redditClientId',     label: 'Reddit Client ID',     placeholder: 'aBcDeFgHiJ',          required: true,
      help: 'reddit.com/prefs/apps → Create App → Script → copy client ID' },
    { key: 'redditClientSecret', label: 'Reddit Client Secret', placeholder: 'xxxxxxxxxxxxxxxxxxx', required: true },
    { key: 'redditUsername',     label: 'Reddit Username',      placeholder: 'u/yourbusiness',      required: true },
    { key: 'redditPassword',     label: 'Reddit Password',      placeholder: '••••••••',            required: true, type: 'password' },
    { key: 'redditSubreddits',   label: 'Target Subreddits',    placeholder: 'r/india, r/IndianBusiness, r/startups',
      help: 'Comma-separated list of subreddits to post content to' },
  ],
};

// phase: 'business' | 'picker' | 'setup' | 'done'
export default function Onboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [phase, setPhase]                   = useState('business');
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [setupIndex, setSetupIndex]         = useState(0);
  const [form, setForm]                     = useState({});
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [webhooks, setWebhooks]             = useState(null);

  if (status === 'loading') return null;
  if (status === 'unauthenticated') { router.push('/auth/login'); return null; }
  if (session?.user?.clientId && phase !== 'done') { router.push('/dashboard'); return null; }

  function set(key, value) { setForm(f => ({ ...f, [key]: value })); }

  function toggleChannel(id) {
    setSelectedChannels(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  function nextBusiness() {
    const missing = BUSINESS_FIELDS.filter(f => f.required).find(f => !form[f.key]);
    if (missing) { setError(`${missing.label} is required`); return; }
    setError('');
    setPhase('picker');
  }

  function startSetup() {
    if (selectedChannels.length === 0) {
      submitForm();
      return;
    }
    setSetupIndex(0);
    setPhase('setup');
  }

  function nextSetup() {
    const channelId = selectedChannels[setupIndex];
    const fields    = CHANNEL_FIELDS[channelId] || [];
    const missing   = fields.filter(f => f.required).find(f => !form[f.key]);
    if (missing) { setError(`${missing.label} is required`); return; }
    setError('');
    if (setupIndex < selectedChannels.length - 1) {
      setSetupIndex(i => i + 1);
    } else {
      submitForm();
    }
  }

  async function submitForm() {
    setLoading(true);
    setError('');
    const res  = await fetch('/api/onboarding', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setWebhooks(data);
    setPhase('done');
  }

  // Dynamic progress steps
  const progressSteps = [
    'Business',
    'Channels',
    ...selectedChannels.map(id => CHANNELS.find(c => c.id === id)?.name || id),
    'Done',
  ];

  function currentStepIdx() {
    if (phase === 'business') return 0;
    if (phase === 'picker')   return 1;
    if (phase === 'setup')    return 2 + setupIndex;
    return progressSteps.length - 1;
  }

  const stepIdx = currentStepIdx();

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Progress bar — hidden on done screen */}
        {phase !== 'done' && (
          <div style={{ ...s.progress, justifyContent: progressSteps.length > 4 ? 'flex-start' : 'space-between', gap: progressSteps.length > 4 ? '8px' : '0', overflowX: 'auto' }}>
            {progressSteps.map((label, i) => (
              <div key={i} style={{ ...s.stepWrap, minWidth: progressSteps.length > 4 ? '60px' : 'auto' }}>
                <div style={{ ...s.dot, background: i <= stepIdx ? '#6366f1' : '#e5e7eb', color: i <= stepIdx ? '#fff' : '#9ca3af' }}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                <span style={{ ...s.stepLabel, color: i === stepIdx ? '#6366f1' : '#9ca3af' }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── BUSINESS DETAILS ──────────────────────────────── */}
        {phase === 'business' && (
          <>
            <h2 style={s.title}>Business Details</h2>
            <p style={s.sub}>Tell us about your business to personalise your automation</p>
            {error && <div style={s.error}>{error}</div>}
            <div style={s.fields}>
              {BUSINESS_FIELDS.map(f => (
                <div key={f.key} style={s.fieldWrap}>
                  <label style={s.label}>
                    {f.label} {f.required && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  <input style={s.input} type={f.type || 'text'} placeholder={f.placeholder}
                    value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
                </div>
              ))}
            </div>
            <div style={s.btnRow}>
              <button style={s.btn} onClick={nextBusiness}>Continue →</button>
            </div>
          </>
        )}

        {/* ── CHANNEL PICKER ────────────────────────────────── */}
        {phase === 'picker' && (
          <>
            <h2 style={s.title}>Choose Your Channels</h2>
            <p style={s.sub}>Pick what you want to set up now. You can always connect more from Settings later.</p>

            <div style={s.channelGrid}>
              {CHANNELS.map(ch => {
                const selected = selectedChannels.includes(ch.id);
                return (
                  <div key={ch.id}
                    style={{ ...s.channelCard, border: `2px solid ${selected ? ch.color : '#e5e7eb'}`, background: selected ? `${ch.color}15` : '#fafafa' }}
                    onClick={() => toggleChannel(ch.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '26px' }}>{ch.icon}</span>
                      {selected && (
                        <span style={{ ...s.checkBadge, background: ch.color }}>✓</span>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '13px', margin: '8px 0 4px', color: '#1a1a1a' }}>{ch.name}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.5' }}>{ch.desc}</div>
                  </div>
                );
              })}
            </div>

            <div style={s.btnRow}>
              <button style={s.backBtn} onClick={() => setPhase('business')}>Back</button>
              <button style={s.btn} onClick={startSetup}>
                {selectedChannels.length === 0
                  ? 'Skip for now →'
                  : `Set up ${selectedChannels.length} channel${selectedChannels.length > 1 ? 's' : ''} →`}
              </button>
            </div>
            {selectedChannels.length === 0 && (
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '10px' }}>
                You can connect channels anytime from Settings on your dashboard
              </p>
            )}
          </>
        )}

        {/* ── CHANNEL SETUP ─────────────────────────────────── */}
        {phase === 'setup' && (() => {
          const channelId = selectedChannels[setupIndex];
          const channel   = CHANNELS.find(c => c.id === channelId);
          const fields    = CHANNEL_FIELDS[channelId] || [];
          const isLast    = setupIndex === selectedChannels.length - 1;
          const nextCh    = !isLast && CHANNELS.find(c => c.id === selectedChannels[setupIndex + 1]);

          return (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '28px' }}>{channel?.icon}</span>
                <h2 style={{ ...s.title, margin: 0 }}>{channel?.name} Setup</h2>
              </div>
              <p style={s.sub}>
                Channel {setupIndex + 1} of {selectedChannels.length}
                {nextCh && <> — <strong>{nextCh.name}</strong> is next</>}
              </p>

              {error && <div style={s.error}>{error}</div>}

              <div style={s.fields}>
                {fields.map(f => (
                  <div key={f.key} style={s.fieldWrap}>
                    <label style={s.label}>
                      {f.label} {f.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
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
                <button style={s.backBtn} onClick={() => {
                  setError('');
                  setupIndex === 0 ? setPhase('picker') : setSetupIndex(i => i - 1);
                }}>Back</button>
                <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading} onClick={nextSetup}>
                  {loading ? 'Setting up…' : isLast ? 'Finish Setup' : `Next: ${nextCh?.name} →`}
                </button>
              </div>
            </>
          );
        })()}

        {/* ── DONE ──────────────────────────────────────────── */}
        {phase === 'done' && webhooks && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎉</div>
            <h2 style={s.title}>You're all set!</h2>
            <p style={s.sub}>Your automation is live. Save these webhook URLs — paste them into the relevant platforms.</p>

            <div style={s.webhookBox}>
              <p style={s.whLabel}>Your Client ID</p>
              <code style={s.code}>{webhooks.clientId}</code>

              <p style={{ ...s.whLabel, marginTop: '16px' }}>WhatsApp Webhook</p>
              <code style={s.code}>{`https://${typeof window !== 'undefined' ? window.location.host : 'yourdomain.com'}/api/whatsapp-leads?clientId=${webhooks.clientId}`}</code>

              <p style={{ ...s.whLabel, marginTop: '16px' }}>Instagram Webhook</p>
              <code style={s.code}>{`https://${typeof window !== 'undefined' ? window.location.host : 'yourdomain.com'}/api/instagram-dm?clientId=${webhooks.clientId}`}</code>
            </div>

            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px' }}>
              Need to connect more channels? Go to <strong>Settings</strong> on your dashboard anytime.
            </p>
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
  page:        { minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', fontFamily: 'Arial, sans-serif' },
  card:        { background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '620px', padding: '40px' },
  progress:    { display: 'flex', marginBottom: '32px', paddingBottom: '4px' },
  stepWrap:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  dot:         { width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 },
  stepLabel:   { fontSize: '10px', fontWeight: 600, textAlign: 'center', maxWidth: '60px' },
  title:       { margin: '0 0 6px', fontSize: '22px', fontWeight: 700, color: '#1a1a1a' },
  sub:         { margin: '0 0 24px', color: '#6b7280', fontSize: '14px' },
  fields:      { maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' },
  fieldWrap:   { marginBottom: '16px' },
  label:       { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600, color: '#444' },
  input:       { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  help:        { margin: '4px 0 0', fontSize: '11px', color: '#6b7280' },
  btnRow:      { display: 'flex', gap: '12px', marginTop: '28px' },
  btn:         { flex: 1, padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' },
  backBtn:     { padding: '12px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' },
  error:       { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  channelGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '8px' },
  channelCard: { padding: '14px', borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s', userSelect: 'none' },
  checkBadge:  { width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 700, flexShrink: 0 },
  webhookBox:  { background: '#f8f9ff', border: '1px solid #e0e7ff', borderRadius: '10px', padding: '20px', margin: '20px 0', textAlign: 'left' },
  whLabel:     { margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px' },
  code:        { display: 'block', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#1a1a1a', wordBreak: 'break-all' },
};
