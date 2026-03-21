import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }

    // Auto sign in after signup
    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/onboarding');
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Get started free</h1>
        <p style={styles.sub}>Create your marketing automation account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full Name</label>
          <input style={styles.input} type="text" placeholder="John Smith"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />

          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" placeholder="you@business.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />

          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" placeholder="Min. 8 characters"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />

          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link href="/auth/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', fontFamily: 'Arial, sans-serif' },
  card:  { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px' },
  title: { margin: '0 0 6px', fontSize: '24px', fontWeight: 700, color: '#1a1a1a' },
  sub:   { margin: '0 0 28px', color: '#666', fontSize: '14px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#444' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '18px', boxSizing: 'border-box', outline: 'none' },
  btn:   { width: '100%', padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  footer:{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#666' },
  link:  { color: '#6366f1', textDecoration: 'none', fontWeight: 600 },
};
