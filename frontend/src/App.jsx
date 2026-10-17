import { useCallback, useEffect, useMemo, useState } from 'react';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const categories = ['Roads', 'Garbage', 'Streetlights', 'Water', 'Other'];

function timeAgo(date) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
  if (days === 0) return 'Reported today';
  if (days === 1) return 'Reported yesterday';
  return `Reported ${days} days ago`;
}

export default function App() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState({
  title: '',
  category: 'Roads',
  description: '',
  location: '',
  area: ''
});
  const [submitting, setSubmitting] = useState(false);

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API}/issues`);
      if (!response.ok) throw new Error('Could not load reports. Please refresh the page.');
      const data = await response.json();
      setIssues(data.issues || []);
    } catch {
      setError('Unable to connect to the API. Check your deployment URL and backend status.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadIssues(); }, [loadIssues]);

  const counts = useMemo(() => ({
    total: issues.length,
    pending: issues.filter(issue => issue.status === 'Pending').length,
    progress: issues.filter(issue => issue.status === 'In Progress').length,
    resolved: issues.filter(issue => issue.status === 'Resolved').length
  }), [issues]);

  const filtered = useMemo(() => issues.filter(issue =>
    (categoryFilter === 'All' || issue.category === categoryFilter) &&
    (statusFilter === 'All' || issue.status === statusFilter)
  ), [issues, categoryFilter, statusFilter]);

  function updateField(event) { setForm(previous => ({ ...previous, [event.target.name]: event.target.value })); }

  async function submitIssue(event) {
    event.preventDefault(); setSubmitting(true); setNotice(''); setError('');
    try {
      const response = await fetch(`${API}/issues`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not submit this report.');
      setForm({
  title: '',
  category: 'Roads',
  description: '',
  location: '',
  area: ''
});
      setNotice('Your report has been submitted successfully. Thank you for helping your community.');
      await loadIssues();
    } catch (err) { setError(err.message || 'Could not submit your report.'); }
    finally { setSubmitting(false); }
  }

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#home" aria-label="CivicFix home"><span className="brand-mark">C</span><span>Civic<span className="brand-accent">Fix</span><small>COMMUNITY ACTION, MADE SIMPLE</small></span></a><nav><a href="#reports">Explore reports</a><details className="nav-menu"><summary>More</summary><div><a href="#about">About CivicFix</a><a href="#how-it-works">How it works</a><a href="#faq">FAQs</a><a href="#help">Help & contact</a></div></details><a className="nav-cta" href="#report">Report an issue <span>↗</span></a></nav></header>
    <main>
      <section className="hero" id="home"><div className="hero-copy"><div className="eyebrow"><span className="pulse-dot"/> YOUR NEIGHBOURHOOD, YOUR VOICE</div><h1>Small reports.<br/><span>Big change.</span></h1><p>See something that needs fixing? Report local issues, keep track of progress, and help make your neighbourhood a better place for everyone.</p><div className="hero-actions"><a className="button button-primary" href="#report">Report a problem <span>↗</span></a><a className="text-link" href="#reports">See community reports <span>↓</span></a></div><div className="hero-note"><span className="avatar-stack"><i>✳</i><i>⌂</i><i>♡</i></span><span>Every better neighbourhood starts with someone who cares.</span></div></div><div className="hero-art" aria-label="Illustration of a greener neighbourhood"><div className="sun"></div><div className="art-label label-top"><span className="label-icon">✓</span><span><b>Community powered</b><small>Change starts here</small></span></div><div className="cityscape"><div className="building building-one"><i/><i/><i/><i/></div><div className="building building-two"><i/><i/><i/><i/><i/><i/></div><div className="building building-three"><i/><i/><i/><i/></div><div className="tree tree-one"><b/><i/></div><div className="tree tree-two"><b/><i/></div><div className="road"><span className="road-line"/></div><div className="person person-one"><i/><b/></div><div className="person person-two"><i/><b/></div></div><div className="art-label label-bottom"><span className="label-icon">↗</span><span><b>One step at a time</b><small>Cleaner · Safer · Better</small></span></div><div className="floating-star">✳</div></div><div className="hero-bottom"><span>BUILT FOR EVERYDAY CITIZENS</span><span className="bottom-rule"/><span>LOCAL ISSUES. VISIBLE PROGRESS.</span></div></section>

      <section className="stats-section" aria-label="Issue statistics"><div className="section-kicker">THE COMMUNITY PULSE</div><div className="stats-grid"><Stat number={counts.total} label="Total reports" icon="▤"/><Stat number={counts.pending} label="Awaiting action" icon="◷"/><Stat number={counts.progress} label="Being addressed" icon="↗"/><Stat number={counts.resolved} label="Resolved issues" icon="✓"/></div></section>

      <section className="work-section" id="report"><div className="section-heading"><div><div className="section-kicker">MAKE IT BETTER</div><h2>What needs <span>fixing?</span></h2></div><p>It takes less than a minute to speak up. Share the details and let the community see what matters.</p></div><div className="report-layout"><div className="report-aside"><div className="aside-number">01 <span>— YOUR REPORT</span></div><h3>Every detail<br/>makes a difference.</h3><p>Clear information helps your community understand the issue and where it needs attention.</p><div className="aside-check"><span>✓</span><div><b>Be specific</b><small>Tell us what happened.</small></div></div><div className="aside-check"><span>✓</span><div><b>Pinpoint the place</b><small>Add a street or landmark.</small></div></div><div className="aside-check"><span>✓</span><div><b>Follow the progress</b><small>Check the public status below.</small></div></div><div className="aside-decoration">C.</div></div><form className="report-form" onSubmit={submitIssue}><div className="form-heading"><div><span className="form-step">NEW COMMUNITY REPORT</span><h3>Tell us about it</h3></div><span className="required-note">* Required fields</span></div><label>Issue title <span>*</span><input name="title" value={form.title} onChange={updateField} placeholder="e.g. Pothole near the main bus stop" maxLength="100" required/></label><label>Issue category <span>*</span><select name="category" value={form.category} onChange={updateField}>{categories.map(category => <option key={category}>{category}</option>)}</select></label><label>Location <span>*</span><input name="location" value={form.location} onChange={updateField} placeholder="Street, area or nearby landmark" maxLength="180" required/></label> <label>Area <span>*</span>
  <input
    name="area"
    value={form.area}
    onChange={updateField}
    placeholder="Enter your neighbourhood or locality"
    maxLength="120"
    required
  />
</label><label>Description <span>*</span><textarea name="description" value={form.description} onChange={updateField} placeholder="Describe what you noticed and why it needs attention..." rows="4" maxLength="1000" required/><small className="field-hint">{form.description.length}/1000 characters</small></label> {notice && <p className="feedback success" role="status">{notice}</p>}{error && <p className="feedback error" role="alert">{error}</p>}<button className="button button-primary submit-button" disabled={submitting}>{submitting ? 'Submitting report…' : 'Submit your report'} <span>↗</span></button><p className="privacy-note">Your report is visible to the community. Please do not include private or sensitive personal information.</p></form></div></section>

      <section className="reports-section" id="reports"><div className="section-heading reports-heading"><div><div className="section-kicker">TRANSPARENCY IN ACTION</div><h2>Community <span>reports.</span></h2></div><p>One shared view of the issues that matter. Filter reports and see their latest recorded status.</p></div><div className="filter-bar"><div className="filter-title"><span className="filter-dot"/> LIVE ISSUE BOARD <span className="report-count">{filtered.length} REPORTS</span></div><div className="filters"><label className="sr-only" htmlFor="category-filter">Filter by category</label><select id="category-filter" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}><option>All</option>{categories.map(category => <option key={category}>{category}</option>)}</select><label className="sr-only" htmlFor="status-filter">Filter by status</label><select id="status-filter" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option>All</option><option>Pending</option><option>In Progress</option><option>Resolved</option></select><button className="refresh-button" onClick={loadIssues} aria-label="Refresh reports" title="Refresh reports">↻</button></div></div>{loading ? <div className="empty-state"><div className="loading-spinner"/><p>Loading community reports…</p></div> : filtered.length === 0 ? <div className="empty-state"><span className="empty-icon">⌁</span><h3>No reports here yet.</h3><p>Try another filter or be the first to report an issue.</p><a href="#report" className="text-link">Create a report ↗</a></div> : <div className="issues-grid">{filtered.map(issue => <article className="issue-card" key={issue._id}><div className="issue-card-top"><span className={`category-pill category-${issue.category.toLowerCase()}`}>{issue.category}</span><Status status={issue.status}/></div><h3>{issue.title}</h3><p className="issue-description">{issue.description}</p><div className="issue-location"><span>⌖</span>{issue.location}</div><div className="issue-card-bottom"><span>{timeAgo(issue.createdAt)}</span><span className="issue-id">ID / {String(issue._id).slice(-6).toUpperCase()}</span></div></article>)}</div>}<p className="board-note">Statuses reflect the latest information recorded in CivicFix. This student project is not an official government reporting channel.</p></section>
      <section className="info-section" id="about"><div className="info-intro"><div className="section-kicker">ABOUT CIVICFIX</div><h2>A clearer way to<br/><span>care for your community.</span></h2></div><div className="info-copy"><p>CivicFix gives neighbours a shared place to report everyday civic issues and see the latest status recorded for each report.</p><p>Reports are public so residents can understand what has been raised. CivicFix is a community project, not a municipal authority, and submitting a report here does not guarantee that a city department has received it.</p><a className="text-link" href="#reports">Explore community reports <span>↗</span></a></div></section>
      <section className="info-section process-section" id="how-it-works"><div className="section-heading"><div><div className="section-kicker">HOW IT WORKS</div><h2>From noticing to <span>follow-up.</span></h2></div><p>Share enough detail for others to understand the issue, then check the public board for updates.</p></div><ol className="process-list"><li><span>01</span><div><h3>Describe the issue</h3><p>Choose a category and add a short, specific title and description.</p></div></li><li><span>02</span><div><h3>Pinpoint the place</h3><p>Include a street, nearby landmark, or area. Do not include private personal information.</p></div></li><li><span>03</span><div><h3>Check the report board</h3><p>Browse or filter reports by category and status. Status changes are reflected when recorded.</p></div></li></ol><a className="button button-primary" href="#report">Start a report <span>↗</span></a></section>
      <section className="info-section faq-section" id="faq"><div className="section-heading"><div><div className="section-kicker">COMMON QUESTIONS</div><h2>Good to <span>know.</span></h2></div><p>What to expect when you use the community report board.</p></div><div className="faq-list"><details><summary>Is my report sent directly to the city?</summary><p>No. CivicFix stores and displays community reports, but this version is not connected to a city department. Contact your local authority directly when an official service request is needed.</p></details><details><summary>Can I update or remove a report?</summary><p>Not in this public version. Reports can be submitted and viewed, but editing and removal require an authenticated support process that is not currently available.</p></details><details><summary>What do the status labels mean?</summary><p>Pending means no progress has been recorded, In Progress means work is reported as underway, and Resolved means the issue has been marked resolved.</p></details><details><summary>Should I report an emergency here?</summary><p>No. CivicFix is not monitored for emergencies. For immediate danger, contact your local emergency services or the responsible authority.</p></details></div></section>
      <section className="info-section help-section" id="help"><div><div className="section-kicker">NEED HELP?</div><h2>Use the right channel<br/><span>for the right issue.</span></h2></div><div className="info-copy"><p>For a standard community report, use the CivicFix form. For urgent hazards, emergencies, or an official service request, contact the relevant local authority directly.</p><a href="#report" className="button button-primary">Go to the report form <span>↗</span></a></div></section>
      <section className="closing-banner"><div className="closing-symbol">✳</div><div><div className="section-kicker">GOOD CHANGE IS A TEAM EFFORT</div><h2>A better place to live<br/>starts <span>with all of us.</span></h2></div><a href="#report" className="button button-light">Make a difference <span>↗</span></a><div className="banner-orbit orbit-one"/><div className="banner-orbit orbit-two"/></section>
    </main><footer className="footer"><a className="brand footer-brand" href="#home"><span className="brand-mark">C</span><span>Civic<span className="brand-accent">Fix</span><small>COMMUNITY ACTION, MADE SIMPLE</small></span></a><p>Designed for communities. Built for a better tomorrow.</p><span>© {new Date().getFullYear()} CIVICFIX · STUDENT PROJECT</span></footer>
  </div>;
}

function Stat({ number, label, icon }) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon">{icon}</span></div><div className="stat-number">{number.toLocaleString('en-IN')}<span className="stat-plus">+</span></div><div className="stat-track"><span style={{ width: `${Math.min(100, number * 8)}%` }}/></div></div>; }
function Status({ status }) { return <span className={`status-pill status-${status.toLowerCase().replace(' ', '-')}`}><i/>{status}</span>; }
