import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import projects from './data/projects.json';
import './styles.css';

const donationOptions = [25, 50, 100, 250, 500];
const logoUrl = 'https://static.wixstatic.com/media/c6135f_167002666812495e886794d0a09ae63d~mv2.png/v1/fill/w_78%2Ch_97%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/RDNO_FoSAP-LOGO_CMYK.png';
const heroUrl = 'https://static.wixstatic.com/media/c6135f_83cbf70593ba4d66bef9a3591986f8fa~mv2.png/v1/fill/w_837%2Ch_628%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/c6135f_83cbf70593ba4d66bef9a3591986f8fa~mv2.png';

function currency(value) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(value);
}

function percentage(project) {
  if (!project.goal) return 0;
  return Math.min(100, Math.round((project.raised / project.goal) * 100));
}

function remaining(project) {
  return Math.max(0, project.goal - project.raised);
}

function getProjectSlugFromHash() {
  const match = window.location.hash.match(/^#project\/([^?]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    back: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    leaf: <><path d="M11 20A7 7 0 0 1 9.8 6.1C14 3 20 4 20 4s1 6-2.1 10.2A7 7 0 0 1 11 20Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6.94C9.73 12.75 12 10 13 7" /></>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    sprout: <><path d="M7 20h10" /><path d="M12 20v-8" /><path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7Z" /><path d="M12 15c0-3-2-5-5-5 0 3 2 5 5 5Z" /></>,
    shield: <><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z" /><path d="m9 12 2 2 4-4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15" /><path d="M15 6v15" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function ProgressBar({ project, large = false }) {
  const percent = percentage(project);
  return (
    <div
      className={`progress${large ? ' progress-large' : ''}`}
      role="progressbar"
      aria-label={`${project.title} funding progress`}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={percent}
    >
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}

function FundingSnapshot({ project, compact = false }) {
  const percent = percentage(project);
  const funded = project.fundingStatus === 'confirmed-funded';

  return (
    <div className={compact ? 'funding-snapshot compact' : 'funding-snapshot'}>
      <div className="funding-primary">
        <strong>{currency(project.raised)}</strong>
        <span>{funded ? 'confirmed funding' : 'mock amount raised'}</span>
      </div>
      <ProgressBar project={project} large={!compact} />
      <div className="funding-secondary">
        <span>{percent}% funded</span>
        <span>{funded ? `${currency(project.goal)} committed` : `${currency(remaining(project))} to go`}</span>
      </div>
    </div>
  );
}

function SiteHeader() {
  return (
    <>
      <div className="prototype-banner">
        <span>Interactive prototype</span>
        Funding figures are illustrative unless marked as confirmed. No payments are processed.
      </div>
      <header className="site-nav-wrap">
        <nav className="site-nav" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Friends of SAP Giving home">
            <img src={logoUrl} alt="Friends of SAP logo" />
            <span>
              <strong>Friends of SAP</strong>
              <small>Project Giving</small>
            </span>
          </a>
          <div className="nav-links">
            <a href="#mission">Mission</a>
            <a href="#projects">Projects</a>
            <a href="#how-it-works">How it works</a>
          </div>
          <a className="button button-small button-outline" href="https://www.friendsofsap.ca/" target="_blank" rel="noreferrer">
            Main website
          </a>
        </nav>
      </header>
    </>
  );
}

function ProjectCard({ project, onOpen, onDonate }) {
  const funded = project.fundingStatus === 'confirmed-funded';
  return (
    <article className="project-card">
      <button className="project-image-button" type="button" onClick={() => onOpen(project.slug)} aria-label={`View ${project.title}`}>
        <img src={project.imageUrl} alt={project.imageAlt} loading="lazy" />
        <span className={`status-pill${funded ? ' funded' : ''}`}>
          {funded ? 'Funding confirmed' : project.featured ? 'Featured' : project.category}
        </span>
      </button>
      <div className="project-body">
        <div className="card-category">{project.category}</div>
        <button className="card-title" type="button" onClick={() => onOpen(project.slug)}>
          <h3>{project.title}</h3>
        </button>
        <p>{project.summary}</p>
        <FundingSnapshot project={project} compact />
        <div className="supporter-line">
          <Icon name="users" size={17} />
          <span>{funded ? '2 public funding commitments' : `${project.supporters} mock supporters`}</span>
        </div>
        <div className="card-actions">
          <button className="button button-secondary" type="button" onClick={() => onOpen(project.slug)}>
            View project <Icon name="arrow" size={17} />
          </button>
          {!funded && (
            <button className="button button-icon" type="button" onClick={() => onDonate(project, 100)} aria-label={`Donate to ${project.title}`}>
              <Icon name="heart" size={19} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function DonationDrawer({ pledge, onClose }) {
  const [amount, setAmount] = useState(100);
  const [frequency, setFrequency] = useState('one-time');
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (pledge) {
      setAmount(pledge.amount || 100);
      setFrequency('one-time');
      setComplete(false);
    }
  }, [pledge]);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose();
    }
    if (pledge) {
      document.addEventListener('keydown', closeOnEscape);
      document.body.classList.add('no-scroll');
    }
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('no-scroll');
    };
  }, [pledge, onClose]);

  if (!pledge) return null;

  function submitMockDonation(event) {
    event.preventDefault();
    setComplete(true);
  }

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="donation-drawer" role="dialog" aria-modal="true" aria-labelledby="donation-title">
        <button className="drawer-close" type="button" onClick={onClose} aria-label="Close donation panel">
          <Icon name="close" />
        </button>

        {complete ? (
          <div className="mock-complete">
            <div className="success-icon"><Icon name="check" size={32} /></div>
            <p className="eyebrow">Prototype complete</p>
            <h2>No payment was submitted.</h2>
            <p>
              This confirmation demonstrates the end of a donor flow. A live version would now return a processor receipt and, where applicable, charitable receipting information.
            </p>
            <button className="button button-primary button-full" type="button" onClick={onClose}>Return to projects</button>
          </div>
        ) : (
          <form onSubmit={submitMockDonation}>
            <p className="eyebrow">Mock checkout</p>
            <h2 id="donation-title">Support {pledge.project.title}</h2>
            <div className="checkout-project">
              <img src={pledge.project.imageUrl} alt="" />
              <span>{pledge.project.category}</span>
            </div>

            <div className="frequency-toggle" aria-label="Donation frequency">
              <button className={frequency === 'one-time' ? 'active' : ''} type="button" onClick={() => setFrequency('one-time')}>One-time</button>
              <button className={frequency === 'monthly' ? 'active' : ''} type="button" onClick={() => setFrequency('monthly')}>Monthly</button>
            </div>

            <fieldset className="amount-fieldset">
              <legend>Select an amount</legend>
              <div className="amount-grid">
                {donationOptions.map((option) => (
                  <button
                    className={amount === option ? 'selected' : ''}
                    key={option}
                    type="button"
                    onClick={() => setAmount(option)}
                  >
                    {currency(option)}
                  </button>
                ))}
              </div>
              <label className="custom-amount" htmlFor="custom-amount">
                <span>$</span>
                <input
                  id="custom-amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(event) => setAmount(Math.max(0, Number(event.target.value)))}
                  aria-label="Custom donation amount"
                />
                <small>CAD</small>
              </label>
            </fieldset>

            <div className="mock-form-grid">
              <label>
                Name
                <input required placeholder="Alex Donor" />
              </label>
              <label>
                Email
                <input required type="email" placeholder="alex@example.ca" />
              </label>
              <label className="full-field">
                Card information
                <input value="Payment fields disabled in prototype" disabled />
              </label>
            </div>

            <label className="checkbox-line">
              <input type="checkbox" />
              Make this donation anonymous on the project page
            </label>

            <div className="checkout-total">
              <span>{frequency === 'monthly' ? 'Monthly donation' : 'Donation total'}</span>
              <strong>{currency(amount || 0)}</strong>
            </div>
            <button className="button button-primary button-full" type="submit">
              Complete mock donation
            </button>
            <p className="fine-print">
              No card data is collected and no payment is processed. A live deployment should use a hosted payment processor rather than handling card details in this site.
            </p>
          </form>
        )}
      </aside>
    </div>
  );
}

function Hero({ activeProjects }) {
  const goal = activeProjects.reduce((sum, project) => sum + project.goal, 0);
  const raised = activeProjects.reduce((sum, project) => sum + project.raised, 0);
  const percent = Math.round((raised / goal) * 100);

  return (
    <section className="hero" id="top">
      <img className="hero-image" src={heroUrl} alt="A path overlooking the fields and hills at sncəcmałqtn Agricultural Park" />
      <div className="hero-overlay" />
      <div className="hero-content shell">
        <div className="hero-copy">
          <p className="eyebrow light">Community-powered agriculture</p>
          <h1>Help practical park projects take root.</h1>
          <p>
            Explore food, habitat, education, heritage, and infrastructure projects at sncəcmałqtn Agricultural Park—and see what each contribution could help deliver.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#projects">Explore projects <Icon name="arrow" size={18} /></a>
            <a className="text-link light-link" href="#how-it-works">How project giving works</a>
          </div>
        </div>
        <div className="campaign-card">
          <div className="campaign-heading">
            <span>Active mock campaign</span>
            <strong>{percent}%</strong>
          </div>
          <div className="campaign-value">{currency(raised)}</div>
          <p>illustrative funding toward {currency(goal)} in active project goals</p>
          <div className="progress progress-large campaign-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent}>
            <span style={{ width: `${percent}%` }} />
          </div>
          <div className="campaign-stats">
            <div><strong>{activeProjects.length}</strong><span>active projects</span></div>
            <div><strong>{activeProjects.reduce((sum, project) => sum + project.supporters, 0)}</strong><span>mock supporters</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="mission-section" id="mission">
      <div className="shell mission-grid">
        <div className="mission-copy">
          <p className="eyebrow">The park’s mission</p>
          <h2>Food security, ecological repair, and community learning in one landscape.</h2>
          <p className="large-copy">
            Friends of SAP supports access to an agricultural park where regenerative agriculture, ecological restoration, food initiatives, community participation, and Indigenous reconciliation can reinforce one another.
          </p>
          <a className="text-link" href="https://www.friendsofsap.ca/" target="_blank" rel="noreferrer">Learn about the organization <Icon name="arrow" size={17} /></a>
        </div>
        <div className="mission-pillars">
          <article><Icon name="sprout" /><h3>Food security</h3><p>Grow and share local food while building practical knowledge and access.</p></article>
          <article><Icon name="leaf" /><h3>Regenerative agriculture</h3><p>Demonstrate soil, plant, water, and habitat practices that work together.</p></article>
          <article><Icon name="map" /><h3>Ecological restoration</h3><p>Restore wetlands, riparian areas, biodiversity, and natural pest management.</p></article>
          <article><Icon name="users" /><h3>Learning & reconciliation</h3><p>Create spaces for education, participation, relationship building, and respect for Syilx territory.</p></article>
        </div>
      </div>
    </section>
  );
}

function ImpactStrip({ activeProjects }) {
  const totalGoal = activeProjects.reduce((sum, project) => sum + project.goal, 0);
  return (
    <section className="impact-strip" aria-label="Park and campaign overview">
      <div className="shell impact-grid">
        <div><strong>132</strong><span>acres in the agricultural park</span></div>
        <div><strong>{projects.length}</strong><span>projects represented</span></div>
        <div><strong>{currency(totalGoal)}</strong><span>active illustrative funding goals</span></div>
        <div><strong>1</strong><span>project marked fully funded</span></div>
      </div>
    </section>
  );
}

function ProjectExplorer({ onOpen, onDonate }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All projects');
  const [sort, setSort] = useState('featured');

  const categories = useMemo(
    () => ['All projects', ...Array.from(new Set(projects.map((project) => project.category))).sort()],
    []
  );

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matching = projects.filter((project) => {
      const categoryMatch = category === 'All projects' || project.category === category;
      const haystack = [project.title, project.category, project.summary, project.lead, ...project.tags].join(' ').toLowerCase();
      return categoryMatch && (!normalizedQuery || haystack.includes(normalizedQuery));
    });

    return [...matching].sort((a, b) => {
      if (sort === 'closest') return percentage(b) - percentage(a);
      if (sort === 'needed') return remaining(b) - remaining(a);
      if (sort === 'least-funded') return percentage(a) - percentage(b);
      if (sort === 'alphabetical') return a.title.localeCompare(b.title);
      return Number(b.featured) - Number(a.featured) || a.priority - b.priority;
    });
  }, [query, category, sort]);

  return (
    <section className="project-section" id="projects">
      <div className="shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Choose where to help</p>
            <h2>Projects you can explore</h2>
          </div>
          <p>
            Each card combines a project story, a funding target, visible progress, and suggested donation amounts. The figures below are mock values for board review unless specifically marked confirmed.
          </p>
        </div>

        <div className="explorer-tools">
          <label className="search-box">
            <Icon name="search" size={19} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, themes, or leads" />
          </label>
          <label className="select-label">
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="select-label">
            <span>Sort by</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="closest">Closest to goal</option>
              <option value="needed">Most funding needed</option>
              <option value="least-funded">Least funded</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </label>
        </div>

        <div className="result-summary">
          <span>{visibleProjects.length} project{visibleProjects.length === 1 ? '' : 's'}</span>
          {(query || category !== 'All projects') && (
            <button type="button" onClick={() => { setQuery(''); setCategory('All projects'); }}>Clear filters</button>
          )}
        </div>

        {visibleProjects.length ? (
          <div className="project-grid">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} onOpen={onOpen} onDonate={onDonate} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Icon name="search" size={34} />
            <h3>No projects match those filters.</h3>
            <button className="button button-secondary" type="button" onClick={() => { setQuery(''); setCategory('All projects'); }}>Show all projects</button>
          </div>
        )}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="how-section" id="how-it-works">
      <div className="shell">
        <div className="section-heading narrow-heading">
          <div>
            <p className="eyebrow">Simple and transparent</p>
            <h2>How the donor experience could work</h2>
          </div>
          <p>A live version can preserve this front-end while sending the donor to a secure, hosted checkout managed by the organization’s chosen payment processor.</p>
        </div>
        <div className="steps-grid">
          <article><span>01</span><h3>Choose a project</h3><p>Browse needs by theme, project lead, funding gap, or progress toward the goal.</p></article>
          <article><span>02</span><h3>Select an amount</h3><p>Give once, give monthly, or enter a custom amount for the selected project.</p></article>
          <article><span>03</span><h3>See the impact</h3><p>Receive updates showing how funds were used and what the project achieved.</p></article>
        </div>
        <div className="trust-panel">
          <div className="trust-icon"><Icon name="shield" size={27} /></div>
          <div><strong>For a production launch</strong><p>Use processor-hosted payment forms, approved project budgets, clear restricted-gift language, privacy terms, refund policies, and an established tax-receipt process.</p></div>
        </div>
      </div>
    </section>
  );
}

function FinalCallout() {
  return (
    <section className="final-callout">
      <div className="shell callout-inner">
        <div>
          <p className="eyebrow light">More than a donation page</p>
          <h2>Connect funding with volunteering, learning, and visible results.</h2>
          <p>This prototype can become a campaign hub that links project funding to volunteer days, updates, photos, and completion reports.</p>
        </div>
        <div className="callout-actions">
          <a className="button button-light" href="#projects">Browse projects</a>
          <a className="button button-ghost-light" href="https://www.friendsofsap.ca/get-involved" target="_blank" rel="noreferrer">Volunteer with Friends of SAP</a>
        </div>
      </div>
    </section>
  );
}

function HomePage({ onOpen, onDonate }) {
  const activeProjects = projects.filter((project) => project.fundingStatus !== 'confirmed-funded');
  return (
    <>
      <Hero activeProjects={activeProjects} />
      <ImpactStrip activeProjects={activeProjects} />
      <MissionSection />
      <ProjectExplorer onOpen={onOpen} onDonate={onDonate} />
      <HowItWorks />
      <FinalCallout />
    </>
  );
}

function ProjectDetail({ project, onBack, onDonate }) {
  const funded = project.fundingStatus === 'confirmed-funded';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [project.slug]);

  return (
    <main className="detail-page">
      <div className="shell detail-shell">
        <button className="back-link" type="button" onClick={onBack}><Icon name="back" size={18} /> Back to all projects</button>
        <div className="detail-hero">
          <div className="detail-image-wrap">
            <img src={project.imageUrl} alt={project.imageAlt} />
            <span className={`status-pill${funded ? ' funded' : ''}`}>{funded ? 'Funding confirmed' : 'Prototype campaign'}</span>
          </div>
          <div className="detail-summary">
            <p className="eyebrow">{project.category}</p>
            <h1>{project.title}</h1>
            <p className="detail-lead">{project.summary}</p>
            <div className="lead-line"><span>Project lead</span><strong>{project.lead || 'To be confirmed'}</strong></div>
            <FundingSnapshot project={project} />
            {project.fundingNote && <p className="funding-note"><Icon name="check" size={18} /> {project.fundingNote}</p>}
            {!funded ? (
              <div className="detail-donation-box">
                <span>Choose an amount</span>
                <div className="detail-amounts">
                  {donationOptions.slice(0, 4).map((amount) => (
                    <button key={amount} type="button" onClick={() => onDonate(project, amount)}>{currency(amount)}</button>
                  ))}
                </div>
                <button className="button button-primary button-full" type="button" onClick={() => onDonate(project, 100)}>
                  Support this project <Icon name="heart" size={18} />
                </button>
              </div>
            ) : (
              <div className="funded-message"><Icon name="check" size={22} /><div><strong>This project is shown as fully funded.</strong><span>Donors can be directed to another active priority.</span></div></div>
            )}
          </div>
        </div>

        <div className="detail-content-grid">
          <article className="detail-story">
            <p className="eyebrow">Project story</p>
            <h2>What this project is building</h2>
            <p>{project.description}</p>
            <div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </article>
          <aside className="detail-sidebar">
            <div className="sidebar-card">
              <h3>Expected impact</h3>
              <ul>{project.impact.map((item) => <li key={item}><Icon name="check" size={17} /> <span>{item}</span></li>)}</ul>
            </div>
            <div className="sidebar-card">
              <h3>Example use of funds</h3>
              <ul>{project.uses.map((item) => <li key={item}><Icon name="arrow" size={16} /> <span>{item}</span></li>)}</ul>
              <p className="fine-print">These budget uses are illustrative and require project-lead and board approval.</p>
            </div>
          </aside>
        </div>

        <section className="detail-next">
          <div><p className="eyebrow">Keep exploring</p><h2>Every project supports the wider park.</h2></div>
          <button className="button button-secondary" type="button" onClick={onBack}>View all projects <Icon name="arrow" size={17} /></button>
        </section>
      </div>
    </main>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <img src={logoUrl} alt="" />
          <div><strong>Friends of SAP Project Giving</strong><p>Prototype fundraising interface for discussion and design review.</p></div>
        </div>
        <div><strong>Park</strong><a href="https://www.friendsofsap.ca/projects" target="_blank" rel="noreferrer">Current projects</a><a href="https://www.friendsofsap.ca/get-involved" target="_blank" rel="noreferrer">Get involved</a></div>
        <div><strong>Prototype</strong><a href="#projects">Project cards</a><a href="#how-it-works">Donation flow</a></div>
      </div>
      <div className="shell footer-bottom">
        <span>Prototype only. No payments are processed.</span>
        <span>Project text and images should be reviewed and approved before public use.</span>
      </div>
    </footer>
  );
}

function App() {
  const [pledge, setPledge] = useState(null);
  const [projectSlug, setProjectSlug] = useState(getProjectSlugFromHash);

  useEffect(() => {
    function handleHashChange() {
      setProjectSlug(getProjectSlugFromHash());
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (projectSlug) return;
    const anchor = window.location.hash.replace(/^#/, '');
    if (!anchor || anchor.startsWith('project/')) return;
    window.setTimeout(() => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }, [projectSlug]);

  const selectedProject = projectSlug ? projects.find((project) => project.slug === projectSlug) : null;

  function openProject(slug) {
    window.location.hash = `project/${encodeURIComponent(slug)}`;
  }

  function backToProjects() {
    window.location.hash = 'projects';
    setProjectSlug(null);
    window.setTimeout(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }), 0);
  }

  function openDonation(project, amount) {
    setPledge({ project, amount });
  }

  return (
    <>
      <SiteHeader />
      {selectedProject ? (
        <ProjectDetail project={selectedProject} onBack={backToProjects} onDonate={openDonation} />
      ) : (
        <HomePage onOpen={openProject} onDonate={openDonation} />
      )}
      <Footer />
      <DonationDrawer pledge={pledge} onClose={() => setPledge(null)} />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
