import { useState } from 'react';
import connectDB from '../../lib/db.js';
import Client from '../../lib/models/Client.js';

export default function LeadForm({ business }) {
  const [form, setForm]       = useState({ name: '', phone: '', email: '', interest: '' });
  const [status, setStatus]   = useState('idle'); // idle | loading | success | error
  const [error, setError]     = useState('');

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.name || (!form.phone && !form.email)) {
      setError('Please enter your name and at least a phone number or email.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const res  = await fetch(`/api/lead-capture?clientId=${business.clientId}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, source: 'Lead Form' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong.'); setStatus('idle'); return; }
      setStatus('success');
    } catch {
      setError('Network error. Please try again.');
      setStatus('idle');
    }
  }

  if (status === 'success') {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ ...s.title, textAlign: 'center' }}>Thank you, {form.name}!</h2>
            <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6' }}>
              We've received your details. Our team from <strong>{business.businessName}</strong> will reach out to you shortly.
            </p>
            {business.discountCode && (
              <div style={s.discountBox}>
                <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6366f1', fontWeight: 700 }}>YOUR WELCOME GIFT</p>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#374151' }}>Use code below for {business.discountPercent}% off your first order:</p>
                <div style={s.discountCode}>{business.discountCode}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <h1 style={s.bizName}>{business.businessName}</h1>
          <p style={s.tagline}>{business.tagline}</p>
        </div>

        <h2 style={s.title}>Get in touch with us</h2>
        <p style={s.sub}>Fill in your details and we'll reach out to you right away.</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={submit}>
          <div style={s.fieldWrap}>
            <label style={s.label}>Your Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={s.input} placeholder="Rahul Sharma" value={form.name}
              onChange={e => set('name', e.target.value)} />
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label}>Phone Number</label>
            <input style={s.input} type="tel" placeholder="+91 98765 43210" value={form.phone}
              onChange={e => set('phone', e.target.value)} />
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label}>Email Address</label>
            <input style={s.input} type="email" placeholder="rahul@email.com" value={form.email}
              onChange={e => set('email', e.target.value)} />
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label}>What are you looking for?</label>
            <input style={s.input} placeholder={`e.g. ${business.productType}`} value={form.interest}
              onChange={e => set('interest', e.target.value)} />
          </div>

          <button type="submit" style={{ ...s.btn, opacity: status === 'loading' ? 0.7 : 1 }} disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending…' : 'Send My Details →'}
          </button>
        </form>

        {business.website && (
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#9ca3af' }}>
            Visit us at{' '}
            <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>
              {business.website.replace(/^https?:\/\//, '')}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    await connectDB();
    const client = await Client.findOne({ clientId: params.clientId, isActive: true })
      .select('clientId businessName tagline productType discountCode discountPercent website')
      .lean();

    if (!client) return { notFound: true };

    return {
      props: {
        business: {
          clientId:        client.clientId,
          businessName:    client.businessName,
          tagline:         client.tagline || '',
          productType:     client.productType || 'products',
          discountCode:    client.discountCode || '',
          discountPercent: client.discountPercent || '10',
          website:         client.website || '',
        },
      },
    };
  } catch {
    return { notFound: true };
  }
}

const s = {
  page:        { minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'Arial, sans-serif' },
  card:        { background: '#fff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: '440px', padding: '36px' },
  header:      { textAlign: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' },
  bizName:     { margin: '0 0 4px', fontSize: '22px', fontWeight: 800, color: '#1a1a1a' },
  tagline:     { margin: 0, fontSize: '13px', color: '#6b7280' },
  title:       { margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#1a1a1a' },
  sub:         { margin: '0 0 22px', fontSize: '13px', color: '#6b7280' },
  fieldWrap:   { marginBottom: '14px' },
  label:       { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600, color: '#374151' },
  input:       { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  btn:         { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginTop: '6px' },
  error:       { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  discountBox: { background: '#f5f3ff', border: '1px solid #e0e7ff', borderRadius: '12px', padding: '16px', marginTop: '20px', textAlign: 'center' },
  discountCode:{ fontSize: '22px', fontWeight: 800, color: '#6366f1', letterSpacing: '3px', marginTop: '6px' },
};
