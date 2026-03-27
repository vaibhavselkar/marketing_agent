import Head from 'next/head';
import Link from 'next/link';

const features = [
  { icon: '💬', title: 'WhatsApp Automation',    desc: 'Welcome messages, follow-ups, and admin alerts sent the moment a lead comes in. Powered by AiSensy.' },
  { icon: '📸', title: 'Instagram DM Bot',        desc: 'AI-powered auto-replies to every Instagram DM using Gemini. Handles pricing, availability, and enquiries 24/7.' },
  { icon: '📧', title: 'Email Campaigns',         desc: 'Welcome series, festival campaigns, re-engagement, review requests — all automated. Set it once, runs forever.' },
  { icon: '📊', title: 'Google Sheets CRM',       desc: 'Every lead captured and tracked automatically. Source, status, and conversion rate updated in real time.' },
  { icon: '✈️', title: 'Telegram Alerts',         desc: 'Instant notification on your phone for every new lead. Weekly analytics report delivered automatically. Free, unlimited.' },
  { icon: '🔴', title: 'Reddit Organic Reach',    desc: 'AI writes and posts content to targeted subreddits automatically. Drive thousands of visitors at zero ad spend.' },
  { icon: '✨', title: 'AI Content Studio',       desc: 'Gemini writes ready-to-post content for Reddit, Instagram, and Telegram daily. Review, edit, post in one click.' },
  { icon: '📣', title: 'Facebook Lead Ads',       desc: 'Connect your Facebook & Instagram ads. When someone fills your ad form, they get a WhatsApp message in seconds.' },
  { icon: '📋', title: 'Lead Capture Page',       desc: 'Your own branded lead form page. Put the link in your Instagram bio, Reddit posts, Google profile — leads flow in automatically.' },
  { icon: '📈', title: 'Analytics Dashboard',     desc: 'Total leads, conversion rate, WhatsApp usage, channel performance — all in one place.' },
];

const planFeatures = [
  'WhatsApp automation (welcome, follow-up, alerts)',
  'Instagram DM bot — AI replies 24/7',
  'Email campaigns (welcome, festival, re-engagement)',
  'Google Sheets CRM — every lead tracked',
  'Telegram alerts — instant lead notifications',
  'Reddit auto-posting — free organic reach',
  'AI Content Studio — daily posts for all channels',
  'Facebook Lead Ads webhook — capture paid ad leads',
  'Lead capture page — your shareable form link',
  'Analytics dashboard',
  '14-day free trial — no credit card needed',
  'Full onboarding support',
];

const stats = [
  { value: '< 60s',  label: 'Lead response time' },
  { value: '10+',    label: 'Channels automated' },
  { value: '80%',    label: 'Reduction in manual work' },
  { value: '24/7',   label: 'Always-on automation' },
];

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>AutoMarket — WhatsApp & Email Marketing Automation for Indian Businesses</title>
        <meta name="description" content="Automate your WhatsApp messages, email campaigns, and Instagram DMs. Built for Indian businesses. Start free." />
      </Head>

      <div style={s.page}>
        {/* NAV */}
        <nav style={s.nav}>
          <div style={s.navInner}>
            <span style={s.logo}>⚡ AutoMarket</span>
            <div style={s.navLinks}>
              <a href="#features" style={s.navLink}>Features</a>
              <a href="#pricing" style={s.navLink}>Pricing</a>
              <Link href="/auth/login" style={s.navLink}>Login</Link>
              <Link href="/auth/signup" style={s.navBtn}>Get Started Free →</Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section style={s.hero}>
          <div style={s.heroInner}>
            <div style={s.badge}>🇮🇳 Built for Indian Businesses</div>
            <h1 style={s.heroTitle}>
              Automate Your Marketing.<br />
              <span style={s.heroGradient}>Generate Leads While You Sleep.</span>
            </h1>
            <p style={s.heroSub}>
              WhatsApp automation, email campaigns, and Instagram DM bot — all in one platform.
              Set it up once, run forever. No tech skills needed.
            </p>
            <div style={s.heroBtns}>
              <Link href="/auth/signup" style={s.btnPrimary}>Start Free Today →</Link>
              <a href="#features" style={s.btnSecondary}>See How It Works</a>
            </div>
            <p style={s.heroNote}>✅ 14-day free trial &nbsp;·&nbsp; ✅ No credit card &nbsp;·&nbsp; ✅ Setup in under 30 minutes</p>
          </div>
        </section>

        {/* STATS */}
        <section style={s.statsBar}>
          {stats.map((stat, i) => (
            <div key={i} style={s.statItem}>
              <div style={s.statValue}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </section>

        {/* FEATURES */}
        <section id="features" style={s.section}>
          <div style={s.sectionInner}>
            <div style={s.sectionBadge}>Features</div>
            <h2 style={s.sectionTitle}>Everything you need to automate your marketing</h2>
            <p style={s.sectionSub}>One platform. WhatsApp, Email, Instagram. All automated.</p>

            <div style={s.featGrid}>
              {features.map((f, i) => (
                <div key={i} style={s.featCard}>
                  <div style={s.featIcon}>{f.icon}</div>
                  <h3 style={s.featTitle}>{f.title}</h3>
                  <p style={s.featDesc}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ ...s.section, background: '#f8f9ff' }}>
          <div style={s.sectionInner}>
            <div style={s.sectionBadge}>How It Works</div>
            <h2 style={s.sectionTitle}>Up and running in 4 steps</h2>

            <div style={s.stepsGrid}>
              {[
                { n: '1', title: 'Sign Up Free', desc: 'Create your account in 30 seconds. No credit card required.' },
                { n: '2', title: 'Connect Your Tools', desc: 'Add your WhatsApp (AiSensy), Gmail, and Google Sheets. Takes 10 minutes.' },
                { n: '3', title: 'Set Your Brand', desc: 'Enter your business name, offers, and website. The AI does the rest.' },
                { n: '4', title: 'Go Live', desc: 'Share your webhook URL and watch leads get automated messages instantly.' },
              ].map((step, i) => (
                <div key={i} style={s.stepCard}>
                  <div style={s.stepNum}>{step.n}</div>
                  <h3 style={s.stepTitle}>{step.title}</h3>
                  <p style={s.stepDesc}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" style={s.section}>
          <div style={s.sectionInner}>
            <div style={s.sectionBadge}>Pricing</div>
            <h2 style={s.sectionTitle}>Simple pricing. Every feature included.</h2>
            <p style={s.sectionSub}>Start free. No credit card. Cancel anytime.</p>

            <div style={s.pricingGrid}>

              {/* FREE TRIAL */}
              <div style={s.pricingCard}>
                <div style={s.planIcon}>🎯</div>
                <h3 style={s.planName}>Free Trial</h3>
                <div style={s.planPriceBlock}>
                  <span style={{ ...s.planAmount, color: '#1a1a1a' }}>₹0</span>
                </div>
                <p style={s.planPeriod}>14 days, full access</p>
                <ul style={s.planFeatures}>
                  {planFeatures.map((f, i) => (
                    <li key={i} style={s.planFeature}><span style={s.tick}>✓</span>{f}</li>
                  ))}
                </ul>
                <Link href="/auth/signup" style={{ ...s.planBtn, background: '#1a1a1a' }}>
                  Start Free Trial →
                </Link>
                <p style={s.planNote}>No credit card required</p>
              </div>

              {/* MONTHLY */}
              <div style={s.pricingCard}>
                <div style={s.planIcon}>📅</div>
                <h3 style={s.planName}>Monthly</h3>
                <div style={s.planPriceBlock}>
                  <span style={{ ...s.planAmount, color: '#6366f1' }}>₹4,999</span>
                </div>
                <p style={s.planPeriod}>per month · cancel anytime</p>
                <ul style={s.planFeatures}>
                  {planFeatures.map((f, i) => (
                    <li key={i} style={s.planFeature}><span style={s.tick}>✓</span>{f}</li>
                  ))}
                </ul>
                <Link href="/auth/signup" style={{ ...s.planBtn, background: '#6366f1' }}>
                  Get Started →
                </Link>
                <p style={s.planNote}>After your free trial ends</p>
              </div>

              {/* YEARLY */}
              <div style={{ ...s.pricingCard, border: '2px solid #6366f1', boxShadow: '0 16px 48px rgba(99,102,241,0.15)' }}>
                <div style={s.popularBadge}>Best Value — Save ₹19,989</div>
                <div style={s.planIcon}>🚀</div>
                <h3 style={s.planName}>Yearly</h3>
                <div style={s.planPriceBlock}>
                  <span style={{ ...s.planAmount, color: '#6366f1' }}>₹39,999</span>
                </div>
                <p style={s.planPeriod}>per year · <s style={{ color: '#ef4444' }}>₹59,988</s> → save 33%</p>
                <div style={s.savingsBadge}>= ₹3,333/month</div>
                <ul style={s.planFeatures}>
                  {planFeatures.map((f, i) => (
                    <li key={i} style={s.planFeature}><span style={s.tick}>✓</span>{f}</li>
                  ))}
                </ul>
                <Link href="/auth/signup" style={{ ...s.planBtn, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  Get Yearly Plan →
                </Link>
                <p style={s.planNote}>After your free trial ends</p>
              </div>

            </div>

            {/* Value comparison */}
            <div style={s.vsTable}>
              <h3 style={{ textAlign: 'center', margin: '0 0 20px', fontSize: '18px', fontWeight: 700 }}>How does it compare?</h3>
              <div style={s.vsRow}>
                <span style={s.vsLabel}>Part-time social media hire</span>
                <span style={{ ...s.vsPrice, color: '#ef4444' }}>₹96,000/year</span>
              </div>
              <div style={s.vsRow}>
                <span style={s.vsLabel}>Marketing agency</span>
                <span style={{ ...s.vsPrice, color: '#ef4444' }}>₹2,40,000/year</span>
              </div>
              <div style={s.vsRow}>
                <span style={s.vsLabel}>Doing it manually (3 hrs/day)</span>
                <span style={{ ...s.vsPrice, color: '#ef4444' }}>₹5,40,000/year</span>
              </div>
              <div style={{ ...s.vsRow, background: '#f0fdf4', borderRadius: '10px', padding: '14px 20px', marginTop: '8px' }}>
                <span style={{ ...s.vsLabel, fontWeight: 700, color: '#059669' }}>⚡ AutoMarket (Yearly)</span>
                <span style={{ ...s.vsPrice, color: '#059669', fontWeight: 800 }}>₹39,999/year</span>
              </div>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section style={s.ctaSection}>
          <div style={s.ctaInner}>
            <h2 style={s.ctaTitle}>Start your 14-day free trial today</h2>
            <p style={s.ctaSub}>No credit card. Full access. See leads come in automatically before you pay a rupee.</p>
            <Link href="/auth/signup" style={s.btnPrimary}>Start Free Trial →</Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={s.footer}>
          <div style={s.footerInner}>
            <span style={s.logo}>⚡ AutoMarket</span>
            <p style={s.footerText}>WhatsApp · Email · Instagram automation for Indian businesses.</p>
            <div style={s.footerLinks}>
              <Link href="/auth/login" style={s.footerLink}>Login</Link>
              <Link href="/auth/signup" style={s.footerLink}>Sign Up</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}

const s = {
  page:       { fontFamily: "'Inter', Arial, sans-serif", color: '#1a1a1a', background: '#fff' },

  // NAV
  nav:        { position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #f0f0f0', zIndex: 100 },
  navInner:   { maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo:       { fontSize: '20px', fontWeight: 800, color: '#6366f1' },
  navLinks:   { display: 'flex', alignItems: 'center', gap: '28px' },
  navLink:    { fontSize: '14px', color: '#555', textDecoration: 'none', fontWeight: 500 },
  navBtn:     { fontSize: '14px', background: '#6366f1', color: '#fff', padding: '8px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 },

  // HERO
  hero:       { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '100px 24px 80px', textAlign: 'center' },
  heroInner:  { maxWidth: '800px', margin: '0 auto' },
  badge:      { display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, marginBottom: '24px' },
  heroTitle:  { fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, margin: '0 0 20px' },
  heroGradient: { color: '#fcd34d' },
  heroSub:    { fontSize: '18px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: '0 0 36px' },
  heroBtns:   { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' },
  heroNote:   { fontSize: '13px', color: 'rgba(255,255,255,0.7)' },

  // BUTTONS
  btnPrimary:   { background: '#fcd34d', color: '#1a1a1a', padding: '14px 32px', borderRadius: '10px', fontWeight: 700, fontSize: '16px', textDecoration: 'none', display: 'inline-block' },
  btnSecondary: { background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '14px 32px', borderRadius: '10px', fontWeight: 600, fontSize: '16px', textDecoration: 'none', display: 'inline-block', border: '1px solid rgba(255,255,255,0.3)' },

  // STATS
  statsBar:   { background: '#1a1a1a', padding: '40px 24px', display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' },
  statItem:   { textAlign: 'center' },
  statValue:  { fontSize: '36px', fontWeight: 800, color: '#fcd34d' },
  statLabel:  { fontSize: '13px', color: '#aaa', marginTop: '4px' },

  // SECTIONS
  section:    { padding: '80px 24px' },
  sectionInner: { maxWidth: '1100px', margin: '0 auto' },
  sectionBadge: { display: 'inline-block', background: '#eef2ff', color: '#6366f1', padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' },
  sectionTitle: { fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 },
  sectionSub:   { fontSize: '17px', color: '#666', margin: '0 0 48px' },

  // FEATURES
  featGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
  featCard:   { background: '#f8f9ff', borderRadius: '16px', padding: '28px', border: '1px solid #e8eaff' },
  featIcon:   { fontSize: '36px', marginBottom: '16px' },
  featTitle:  { fontSize: '18px', fontWeight: 700, margin: '0 0 8px' },
  featDesc:   { fontSize: '14px', color: '#666', lineHeight: 1.6, margin: 0 },

  // STEPS
  stepsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' },
  stepCard:   { textAlign: 'center', padding: '32px 20px' },
  stepNum:    { width: '48px', height: '48px', background: '#6366f1', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, margin: '0 auto 16px' },
  stepTitle:  { fontSize: '18px', fontWeight: 700, margin: '0 0 8px' },
  stepDesc:   { fontSize: '14px', color: '#666', lineHeight: 1.6, margin: 0 },

  // PRICING
  pricingGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start', marginBottom: '48px' },
  pricingCard:    { border: '1px solid #e5e7eb', borderRadius: '20px', padding: '32px', position: 'relative', background: '#fff' },
  popularBadge:   { position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: '#fff', padding: '5px 18px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' },
  planIcon:       { fontSize: '32px', marginBottom: '12px' },
  planName:       { fontSize: '20px', fontWeight: 800, margin: '0 0 10px', color: '#1a1a1a' },
  planPriceBlock: { display: 'flex', alignItems: 'baseline', gap: '2px', margin: '0 0 4px' },
  planAmount:     { fontSize: '48px', fontWeight: 800, lineHeight: 1 },
  planPeriod:     { fontSize: '13px', color: '#9ca3af', margin: '0 0 16px' },
  savingsBadge:   { display: 'inline-block', background: '#d1fae5', color: '#065f46', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', margin: '0 0 16px' },
  planFeatures:   { listStyle: 'none', padding: 0, margin: '0 0 24px' },
  planFeature:    { fontSize: '13px', color: '#374151', padding: '5px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' },
  tick:           { color: '#6366f1', fontWeight: 700, flexShrink: 0 },
  planBtn:        { display: 'block', textAlign: 'center', color: '#fff', padding: '13px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' },
  planNote:       { textAlign: 'center', fontSize: '12px', color: '#9ca3af', margin: '10px 0 0' },
  vsTable:        { background: '#f8f9ff', border: '1px solid #e0e7ff', borderRadius: '16px', padding: '28px 32px', maxWidth: '600px', margin: '0 auto' },
  vsRow:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e5e7eb' },
  vsLabel:        { fontSize: '14px', color: '#374151' },
  vsPrice:        { fontSize: '15px', fontWeight: 700 },

  // CTA
  ctaSection: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '80px 24px', textAlign: 'center' },
  ctaInner:   { maxWidth: '600px', margin: '0 auto' },
  ctaTitle:   { fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, color: '#fff', margin: '0 0 12px' },
  ctaSub:     { fontSize: '17px', color: 'rgba(255,255,255,0.8)', margin: '0 0 32px' },

  // FOOTER
  footer:      { background: '#1a1a1a', padding: '40px 24px' },
  footerInner: { maxWidth: '1100px', margin: '0 auto', textAlign: 'center' },
  footerText:  { fontSize: '13px', color: '#888', margin: '8px 0 16px' },
  footerLinks: { display: 'flex', justifyContent: 'center', gap: '24px' },
  footerLink:  { fontSize: '13px', color: '#aaa', textDecoration: 'none' },
};
