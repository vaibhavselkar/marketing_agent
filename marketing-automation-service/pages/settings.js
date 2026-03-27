import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const CHANNELS = [
  { id: 'whatsapp',  name: 'WhatsApp',          icon: '💬', color: '#25D366', desc: 'Automated messages to leads via AiSensy' },
  { id: 'instagram', name: 'Instagram DM',       icon: '📸', color: '#E1306C', desc: 'AI auto-replies to DMs using Gemini' },
  { id: 'email',     name: 'Email',              icon: '📧', color: '#4285F4', desc: 'Welcome, follow-up & festival emails via Gmail' },
  { id: 'google',    name: 'Google Sheets + AI', icon: '📊', color: '#0F9D58', desc: 'Lead CRM + Gemini AI key' },
  { id: 'telegram',  name: 'Telegram',           icon: '✈️', color: '#0088cc', desc: 'Instant lead alerts (free, unlimited)' },
  { id: 'reddit',    name: 'Reddit',             icon: '🔴', color: '#FF4500', desc: 'Post to subreddits for organic reach' },
];

const CHANNEL_FIELDS = {
  whatsapp: [
    { key: 'aiSensyApiKey',           label: 'AiSensy API Key',               placeholder: 'your_aisensy_api_key',
      help: 'app.aisensy.com → Settings → API & Webhook → Copy API Key' },
    { key: 'adminWhatsappNumber',     label: 'Your WhatsApp Number',          placeholder: '+919876543210',
      help: 'Receive lead alerts on this number' },
    { key: 'aiSensyWelcomeCampaign',  label: 'Welcome Campaign Name',         placeholder: 'welcome_message' },
    { key: 'aiSensyFollowupCampaign', label: 'Follow-up Campaign Name',       placeholder: 'follow_up' },
    { key: 'aiSensyAdminCampaign',    label: 'Admin Alert Campaign Name',     placeholder: 'new_lead_alert' },
  ],
  instagram: [
    { key: 'instagramAccessToken', label: 'Instagram Access Token', placeholder: 'EAAxxxxx',
      help: 'Facebook Developer Console → Your App → Instagram → Access Token' },
    { key: 'instagramPageId',      label: 'Facebook Page ID',       placeholder: '123456789' },
    { key: 'instagramVerifyToken', label: 'Webhook Verify Token',   placeholder: 'any_random_string',
      help: 'Any random string you choose — enter this in Facebook webhook settings' },
    { key: 'geminiApiKey',         label: 'Gemini AI Key',          placeholder: 'AIzaSy...',
      help: 'Free from: aistudio.google.com/app/apikey' },
  ],
  email: [
    { key: 'gmailUser',        label: 'Gmail Address',      placeholder: 'business@gmail.com' },
    { key: 'gmailAppPassword', label: 'Gmail App Password', placeholder: 'xxxx xxxx xxxx xxxx', type: 'password',
      help: 'Google Account → Security → 2-Step Verification → App Passwords → Generate' },
  ],
  google: [
    { key: 'geminiApiKey',      label: 'Gemini AI API Key',           placeholder: 'AIzaSy...',
      help: 'Free from: aistudio.google.com/app/apikey' },
    { key: 'googleSheetId',     label: 'Google Sheet ID',             placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',
      help: 'From your Google Sheet URL: /spreadsheets/d/[THIS_PART]/edit' },
    { key: 'googleClientEmail', label: 'Service Account Email',       placeholder: 'service@project.iam.gserviceaccount.com',
      help: 'Google Cloud Console → IAM → Service Accounts' },
    { key: 'googlePrivateKey',  label: 'Service Account Private Key', placeholder: '-----BEGIN PRIVATE KEY-----\n...', type: 'textarea',
      help: 'From the downloaded service account JSON — copy the entire private_key value' },
  ],
  telegram: [
    { key: 'telegramBotToken', label: 'Telegram Bot Token',         placeholder: '123456789:AAFxxxxxxxxx',
      help: 'Open Telegram → @BotFather → /newbot → copy token' },
    { key: 'telegramChatId',   label: 'Telegram Chat / Channel ID', placeholder: '-1001234567890',
      help: 'Message your bot, then visit: api.telegram.org/bot{TOKEN}/getUpdates' },
  ],
  reddit: [
    { key: 'redditClientId',     label: 'Reddit Client ID',     placeholder: 'aBcDeFgHiJ',
      help: 'reddit.com/prefs/apps → Create App → Script → copy client ID' },
    { key: 'redditClientSecret', label: 'Reddit Client Secret', placeholder: 'xxxxxxxxxxxxxxxxxxx' },
    { key: 'redditUsername',     label: 'Reddit Username',      placeholder: 'u/yourbusiness' },
    { key: 'redditPassword',     label: 'Reddit Password',      placeholder: '••••••••', type: 'password' },
    { key: 'redditSubreddits',   label: 'Target Subreddits',    placeholder: 'r/india, r/IndianBusiness, r/startups',
      help: 'Comma-separated list of subreddits to post content to' },
  ],
};

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [connected, setConnected]   = useState({});
  const [activeChannel, setActive]  = useState(null); // which channel form is open
  const [form, setForm]             = useState({});
  const [loading, setLoading]       = useState(false);
  const [pageLoading, setPageLoad]  = useState(true);
  const [toast, setToast]           = useState(null); // { msg, type }
  const [error, setError]           = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return; }
    if (status === 'authenticated') {
      if (!session.user.clientId) { router.push('/onboarding'); return; }
      fetchStatus();

      // Auto-open channel from query param e.g. /settings?channel=whatsapp
      if (router.query.channel) {
        setActive(router.query.channel);
      }
    }
  }, [status, router.query.channel]);

  async function fetchStatus() {
    setPageLoad(true);
    const res  = await fetch('/api/channel-config');
    const data = await res.json();
    if (data.success) setConnected(data.connected);
    setPageLoad(false);
  }

  function openChannel(id) {
    setActive(id);
    setForm({});
    setError('');
  }

  function closeChannel() {
    setActive(null);
    setForm({});
    setError('');
  }

  function set(key, value) { setForm(f => ({ ...f, [key]: value })); }

  async function saveChannel() {
    if (!activeChannel) return;
    setLoading(true);
    setError('');
    const res  = await fetch('/api/channel-config', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setToast({ msg: `${CHANNELS.find(c => c.id === activeChannel)?.name} connected successfully!`, type: 'success' });
    setConnected(prev => ({ ...prev, [activeChannel]: true }));
    setTimeout(() => setToast(null), 3500);
    closeChannel();
  }

  if (status === 'loading' || pageLoading) {
    return (
      <div style={s.page}>
        <div style={{ color: '#6b7280', fontSize: '14px' }}>Loading…</div>
      </div>
    );
  }

  const channel = activeChannel ? CHANNELS.find(c => c.id === activeChannel) : null;
  const fields  = activeChannel ? (CHANNEL_FIELDS[activeChannel] || []) : [];

  return (
    <div style={s.page}>
      <div style={s.wrap}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <button style={s.backLink} onClick={() => router.push('/dashboard')}>← Dashboard</button>
            <h1 style={s.title}>Channel Settings</h1>
            <p style={s.sub}>Connect or update the channels you want to use for automation</p>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ ...s.toast, background: toast.type === 'success' ? '#d1fae5' : '#fee2e2', color: toast.type === 'success' ? '#065f46' : '#dc2626' }}>
            {toast.type === 'success' ? '✓ ' : '✗ '}{toast.msg}
          </div>
        )}

        {/* Channel cards grid */}
        {!activeChannel && (
          <div style={s.grid}>
            {CHANNELS.map(ch => {
              const isConnected = connected[ch.id];
              return (
                <div key={ch.id} style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span style={{ fontSize: '30px' }}>{ch.icon}</span>
                    <span style={{ ...s.badge, background: isConnected ? '#d1fae5', color: isConnected ? '#065f46' : '#6b7280', border: `1px solid ${isConnected ? '#6ee7b7' : '#e5e7eb'}` }}>
                      {isConnected ? '✓ Connected' : 'Not connected'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a', marginBottom: '4px' }}>{ch.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.5' }}>{ch.desc}</div>
                  <button
                    style={{ ...s.actionBtn, background: isConnected ? '#f3f4f6', color: '#374151', borderColor: '#e5e7eb' }}
                    onClick={() => openChannel(ch.id)}
                  >
                    {isConnected ? 'Update credentials' : `Connect ${ch.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Channel setup form */}
        {activeChannel && channel && (
          <div style={s.formCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '28px' }}>{channel.icon}</span>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>
                {connected[activeChannel] ? 'Update' : 'Connect'} {channel.name}
              </h2>
            </div>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#6b7280' }}>
              {connected[activeChannel]
                ? 'Update your credentials below. Leave fields blank to keep existing values.'
                : 'Enter your credentials to connect this channel.'}
            </p>

            {error && <div style={s.error}>{error}</div>}

            <div style={s.fields}>
              {fields.map(f => (
                <div key={f.key} style={{ marginBottom: '16px' }}>
                  <label style={s.label}>{f.label}</label>
                  {f.type === 'textarea'
                    ? <textarea style={{ ...s.input, height: '100px', resize: 'vertical' }}
                        placeholder={f.placeholder} value={form[f.key] || ''}
                        onChange={e => set(f.key, e.target.value)} />
                    : <input style={s.input} type={f.type || 'text'} placeholder={f.placeholder}
                        value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
                  }
                  {f.help && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6b7280' }}>{f.help}</p>}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button style={s.cancelBtn} onClick={closeChannel}>Cancel</button>
              <button style={{ ...s.saveBtn, opacity: loading ? 0.7 : 1 }} disabled={loading} onClick={saveChannel}>
                {loading ? 'Saving…' : 'Save & Connect'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}

const s = {
  page:      { minHeight: '100vh', background: '#f0f2f5', padding: '40px 16px', fontFamily: 'Arial, sans-serif' },
  wrap:      { maxWidth: '800px', margin: '0 auto' },
  header:    { marginBottom: '28px' },
  backLink:  { background: 'none', border: 'none', color: '#6366f1', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: '8px', display: 'block' },
  title:     { margin: '0 0 4px', fontSize: '26px', fontWeight: 700, color: '#1a1a1a' },
  sub:       { margin: 0, fontSize: '14px', color: '#6b7280' },
  toast:     { padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 600 },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
  card:      { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  badge:     { fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' },
  actionBtn: { width: '100%', padding: '9px', border: '1px solid', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  formCard:  { background: '#fff', borderRadius: '14px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  fields:    { maxHeight: '460px', overflowY: 'auto', paddingRight: '4px' },
  label:     { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600, color: '#444' },
  input:     { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  error:     { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  cancelBtn: { padding: '11px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  saveBtn:   { flex: 1, padding: '11px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
};
