import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const CONTENT_TYPES = [
  { id: 'product_showcase', label: 'Product Showcase',  icon: '🛍️', desc: 'Highlight a specific product' },
  { id: 'educational',      label: 'Tips & Education',  icon: '💡', desc: 'Share value, build trust' },
  { id: 'offer',            label: 'Discount / Offer',  icon: '🏷️', desc: 'Promote a deal or sale' },
  { id: 'festival',         label: 'Festival / Season', icon: '🎉', desc: 'Festive or seasonal content' },
  { id: 'new_arrival',      label: 'New Arrival',       icon: '✨', desc: 'Announce a new product' },
];

const CHANNEL_INFO = {
  reddit:    { name: 'Reddit',    icon: '🔴', color: '#FF4500' },
  instagram: { name: 'Instagram', icon: '📸', color: '#E1306C' },
  telegram:  { name: 'Telegram',  icon: '✈️', color: '#0088cc' },
};

export default function ContentStudio() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [contentType, setContentType] = useState('product_showcase');
  const [topic, setTopic]             = useState('');
  const [imageUrl, setImageUrl]       = useState('');
  const [content, setContent]         = useState(null);   // generated content
  const [edited, setEdited]           = useState({});     // user edits
  const [generating, setGenerating]   = useState(false);
  const [posting, setPosting]         = useState({});     // { reddit: true, ... }
  const [posted, setPosted]           = useState({});     // { reddit: { success, error }, ... }
  const [genError, setGenError]       = useState('');
  const [leadFormUrl, setLeadFormUrl] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return; }
    if (status === 'authenticated') {
      if (!session.user.clientId) { router.push('/onboarding'); return; }
      if (typeof window !== 'undefined') {
        setLeadFormUrl(`${window.location.origin}/lead-form/${session.user.clientId}`);
      }
    }
  }, [status]);

  async function generate() {
    setGenerating(true);
    setGenError('');
    setContent(null);
    setEdited({});
    setPosted({});
    try {
      const res  = await fetch(`/api/content-generator?contentType=${contentType}&topic=${encodeURIComponent(topic)}`);
      const data = await res.json();
      if (!res.ok) { setGenError(data.error); return; }
      setContent(data.content);
      // Pre-fill editable fields
      setEdited({
        redditTitle:      data.content.reddit?.title || '',
        redditBody:       data.content.reddit?.body  || '',
        instagramCaption: data.content.instagram?.caption   || '',
        instagramHashtags:data.content.instagram?.hashtags  || '',
        telegram:         data.content.telegram || '',
      });
    } catch (err) {
      setGenError('Failed to generate content. Check your Gemini API key in Settings.');
    } finally {
      setGenerating(false);
    }
  }

  async function postToChannel(channel) {
    setPosting(p => ({ ...p, [channel]: true }));
    setPosted(p => ({ ...p, [channel]: null }));

    const body = {
      contentType,
      topic,
      channels: [channel],
      imageUrl: channel === 'instagram' ? imageUrl : '',
    };

    // Override with edited content
    if (channel === 'reddit') {
      body.overrideContent = { reddit: { title: edited.redditTitle, body: edited.redditBody } };
    }
    if (channel === 'instagram') {
      body.overrideContent = { instagram: { caption: edited.instagramCaption, hashtags: edited.instagramHashtags } };
    }
    if (channel === 'telegram') {
      body.overrideContent = { telegram: edited.telegram };
    }

    try {
      const res  = await fetch('/api/content-generator', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      const result = data.results?.[channel];
      setPosted(p => ({ ...p, [channel]: result || { success: false, error: data.error } }));
    } catch (err) {
      setPosted(p => ({ ...p, [channel]: { success: false, error: err.message } }));
    } finally {
      setPosting(p => ({ ...p, [channel]: false }));
    }
  }

  async function postAll() {
    await Promise.all(['reddit', 'telegram', 'instagram'].map(postToChannel));
  }

  if (status === 'loading') return null;

  return (
    <div style={s.page}>
      <div style={s.wrap}>

        {/* Header */}
        <div style={s.header}>
          <button style={s.backLink} onClick={() => router.push('/dashboard')}>← Dashboard</button>
          <h1 style={s.pageTitle}>Content Studio</h1>
          <p style={s.pageSub}>AI writes platform-ready content for all your channels. Review, edit, then post in one click.</p>
        </div>

        {/* Lead Form URL banner */}
        {leadFormUrl && (
          <div style={s.banner}>
            <span style={{ fontWeight: 700 }}>📋 Your Lead Capture Link:</span>{' '}
            <span style={s.bannerUrl}>{leadFormUrl}</span>
            <button style={s.copyBtn} onClick={() => navigator.clipboard.writeText(leadFormUrl)}>Copy</button>
            <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
              Put this in your Instagram bio, Reddit posts, and WhatsApp status
            </span>
          </div>
        )}

        <div style={s.layout}>
          {/* LEFT — Controls */}
          <div style={s.controls}>
            <div style={s.section}>
              <h3 style={s.sectionTitle}>Content Type</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {CONTENT_TYPES.map(ct => (
                  <div key={ct.id}
                    style={{ ...s.typeCard, border: `2px solid ${contentType === ct.id ? '#6366f1' : '#e5e7eb'}`, background: contentType === ct.id ? '#f5f3ff' : '#fff' }}
                    onClick={() => setContentType(ct.id)}
                  >
                    <span style={{ fontSize: '18px' }}>{ct.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#1a1a1a' }}>{ct.label}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>{ct.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={s.section}>
              <h3 style={s.sectionTitle}>Topic / Product Name <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></h3>
              <input style={s.input} placeholder="e.g. Silver anklet set, Diwali offer, skincare tips…"
                value={topic} onChange={e => setTopic(e.target.value)} />
            </div>

            <div style={s.section}>
              <h3 style={s.sectionTitle}>Image URL for Instagram <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></h3>
              <input style={s.input} placeholder="https://... (must be a public image URL)"
                value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>
                Without an image, Instagram caption will be shown for manual posting
              </p>
            </div>

            {genError && <div style={s.error}>{genError}</div>}

            <button style={{ ...s.genBtn, opacity: generating ? 0.7 : 1 }} disabled={generating} onClick={generate}>
              {generating ? '✨ Generating…' : '✨ Generate Content'}
            </button>

            {content && (
              <button style={s.postAllBtn} onClick={postAll}>
                🚀 Post to All Channels
              </button>
            )}
          </div>

          {/* RIGHT — Content previews */}
          <div style={s.previews}>
            {!content && !generating && (
              <div style={s.emptyState}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✨</div>
                <p style={{ color: '#9ca3af', fontSize: '15px' }}>
                  Choose a content type and click <strong>Generate Content</strong>
                </p>
                <p style={{ color: '#9ca3af', fontSize: '13px' }}>
                  Gemini AI will write Reddit, Instagram, and Telegram content specifically for your business
                </p>
              </div>
            )}

            {generating && (
              <div style={s.emptyState}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                <p style={{ color: '#6366f1', fontWeight: 600 }}>Gemini is writing your content…</p>
              </div>
            )}

            {content && (
              <>
                {/* Reddit */}
                <ContentCard
                  channel="reddit"
                  posted={posted.reddit}
                  posting={posting.reddit}
                  onPost={() => postToChannel('reddit')}
                >
                  <div style={s.fieldWrap}>
                    <label style={s.fieldLabel}>Post Title</label>
                    <input style={s.input} value={edited.redditTitle || ''}
                      onChange={e => setEdited(d => ({ ...d, redditTitle: e.target.value }))} />
                  </div>
                  <div style={s.fieldWrap}>
                    <label style={s.fieldLabel}>Post Body</label>
                    <textarea style={{ ...s.input, height: '140px', resize: 'vertical' }}
                      value={edited.redditBody || ''}
                      onChange={e => setEdited(d => ({ ...d, redditBody: e.target.value }))} />
                  </div>
                  <p style={s.hint}>Tip: Reddit bans obvious ads. This content is written as organic community value.</p>
                </ContentCard>

                {/* Instagram */}
                <ContentCard
                  channel="instagram"
                  posted={posted.instagram}
                  posting={posting.instagram}
                  onPost={() => postToChannel('instagram')}
                >
                  <div style={s.fieldWrap}>
                    <label style={s.fieldLabel}>Caption</label>
                    <textarea style={{ ...s.input, height: '120px', resize: 'vertical' }}
                      value={edited.instagramCaption || ''}
                      onChange={e => setEdited(d => ({ ...d, instagramCaption: e.target.value }))} />
                  </div>
                  <div style={s.fieldWrap}>
                    <label style={s.fieldLabel}>Hashtags</label>
                    <textarea style={{ ...s.input, height: '70px', resize: 'vertical' }}
                      value={edited.instagramHashtags || ''}
                      onChange={e => setEdited(d => ({ ...d, instagramHashtags: e.target.value }))} />
                  </div>
                  {!imageUrl && (
                    <p style={{ ...s.hint, color: '#f59e0b' }}>Add an image URL in the left panel to auto-post. Otherwise copy caption and post manually.</p>
                  )}
                </ContentCard>

                {/* Telegram */}
                <ContentCard
                  channel="telegram"
                  posted={posted.telegram}
                  posting={posting.telegram}
                  onPost={() => postToChannel('telegram')}
                >
                  <div style={s.fieldWrap}>
                    <label style={s.fieldLabel}>Broadcast Message</label>
                    <textarea style={{ ...s.input, height: '90px', resize: 'vertical' }}
                      value={edited.telegram || ''}
                      onChange={e => setEdited(d => ({ ...d, telegram: e.target.value }))} />
                  </div>
                </ContentCard>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentCard({ channel, children, posted, posting, onPost }) {
  const ch = CHANNEL_INFO[channel];
  return (
    <div style={s.previewCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>{ch.icon}</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a' }}>{ch.name}</span>
        </div>
        <button
          style={{ ...s.postBtn, background: ch.color, opacity: posting ? 0.7 : 1 }}
          disabled={posting}
          onClick={onPost}
        >
          {posting ? 'Posting…' : `Post to ${ch.name}`}
        </button>
      </div>

      {children}

      {posted && (
        <div style={{
          marginTop: '10px', padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
          background: posted.success ? '#d1fae5' : posted.manualPost ? '#fef3c7' : '#fee2e2',
          color:      posted.success ? '#065f46' : posted.manualPost ? '#92400e' : '#dc2626',
        }}>
          {posted.success
            ? `✓ Posted successfully!${posted.postUrl ? ` View post` : ''}`
            : posted.manualPost
            ? '📋 Copy the caption above and post manually with a product photo'
            : `✗ ${posted.error}`}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}

const s = {
  page:        { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Arial, sans-serif', paddingBottom: '40px' },
  wrap:        { maxWidth: '1100px', margin: '0 auto', padding: '32px 16px' },
  header:      { marginBottom: '20px' },
  backLink:    { background: 'none', border: 'none', color: '#6366f1', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: '8px', display: 'block' },
  pageTitle:   { margin: '0 0 4px', fontSize: '26px', fontWeight: 700, color: '#1a1a1a' },
  pageSub:     { margin: 0, fontSize: '14px', color: '#6b7280' },
  banner:      { background: '#f5f3ff', border: '1px solid #e0e7ff', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '13px' },
  bannerUrl:   { color: '#6366f1', fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all' },
  copyBtn:     { padding: '4px 10px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' },
  layout:      { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'flex-start' },
  controls:    { background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'sticky', top: '20px' },
  section:     { marginBottom: '22px' },
  sectionTitle:{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#374151' },
  typeCard:    { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s' },
  input:       { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  genBtn:      { width: '100%', padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginBottom: '10px' },
  postAllBtn:  { width: '100%', padding: '11px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' },
  error:       { background: '#fee2e2', color: '#dc2626', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' },
  previews:    { display: 'flex', flexDirection: 'column', gap: '16px' },
  emptyState:  { background: '#fff', borderRadius: '14px', padding: '60px 32px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  previewCard: { background: '#fff', borderRadius: '14px', padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  fieldWrap:   { marginBottom: '12px' },
  fieldLabel:  { display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px' },
  postBtn:     { padding: '8px 16px', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' },
  hint:        { margin: '6px 0 0', fontSize: '11px', color: '#6b7280' },
};
