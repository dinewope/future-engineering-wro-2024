import { Database, Gauge, Languages, MousePointerClick, Target, Users } from 'lucide-react';
import { Fict, ResearchStat, SourceLink } from '../components/common';
import { RESEARCH } from '../content';

const MEASURES: { measure: string; type: 'Main outcome' | 'Outcome' | 'Balancing' | 'Equity'; baseline: string; goal: string; fict?: boolean }[] = [
  { measure: 'Median time, first symptom → specialist referral', type: 'Main outcome', baseline: '30 months', goal: '12 months (case target)', fict: true },
  { measure: 'Visits before referral', type: 'Outcome', baseline: '6', goal: 'Fewer', fict: true },
  { measure: 'Patients who felt heard', type: 'Outcome', baseline: '46%', goal: 'Higher', fict: true },
  { measure: 'Records with incomplete symptom histories', type: 'Outcome', baseline: '38%', goal: 'Lower', fict: true },
  { measure: 'Practices with timely specialist access', type: 'Outcome', baseline: '52%', goal: 'Higher', fict: true },
  { measure: 'Flags dismissed, missed patients, patient worry, specialist wait times', type: 'Balancing', baseline: 'Measured at pilot start', goal: 'No harm' },
  { measure: 'All results split by language, age, skin tone, insurance, channel', type: 'Equity', baseline: 'Measured at pilot start', goal: 'No group left behind' },
];

const TYPE_CLASS = { 'Main outcome': 'type-main', Outcome: 'type-outcome', Balancing: 'type-balancing', Equity: 'type-equity' } as const;

export default function Impact() {
  return (
    <div className="page">
      <div className="wrap">
        <div className="page-head">
          <div>
            <p className="eyebrow">Impact &amp; Plan</p>
            <h1>From 30 months toward 12, without leaving anyone behind.</h1>
            <p className="muted">We record the baseline at pilot sites first, then set targets with clinicians and patients.</p>
          </div>
        </div>

        <h2 className="panel-title" style={{ fontSize: '1.4rem' }}><Gauge size={24} aria-hidden="true" /> Measuring impact</h2>
        <div className="table-scroll">
          <table className="impact-table">
            <thead>
              <tr>
                <th scope="col">Measure</th>
                <th scope="col">Type</th>
                <th scope="col">Baseline (fictional case)</th>
                <th scope="col">Goal</th>
              </tr>
            </thead>
            <tbody>
              {MEASURES.map((m) => (
                <tr key={m.measure}>
                  <td><strong>{m.measure}</strong></td>
                  <td data-label="Type"><span className={`type-pill ${TYPE_CLASS[m.type]}`}>{m.type}</span></td>
                  <td data-label="Baseline (fictional case)">{m.baseline} {m.fict && <span className="sr-only">(fictional case data)</span>}</td>
                  <td data-label="Goal">{m.goal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small" style={{ marginTop: 10 }}>
          Baselines are from the Alliance Care Network case <Fict />. &ldquo;Felt heard&rdquo; is measured with national survey items:{' '}
          <SourceLink r={RESEARCH.cahps} />
        </p>

        <div className="impact-grid">
          <div className="card">
            <h3>Evidence that shortening the journey is possible</h3>
            <p className="muted">
              A German computer model of the CSU patient journey: adding patient education, doctor education and a disease-management
              programme shortened the time to disease control.
            </p>
            <div className="model-bars" role="img" aria-label="Time to disease control: 3.8 years today versus 2.5 years with education and a disease-management programme (computer simulation)">
              <div className="model-bar">
                <span>Today</span>
                <div className="bar"><div className="fill base" style={{ width: '100%' }}>3.8 years</div></div>
              </div>
              <div className="model-bar">
                <span>With education + programme</span>
                <div className="bar"><div className="fill" style={{ width: `${(2.5 / 3.8) * 100}%` }}>2.5 years</div></div>
              </div>
            </div>
            <p className="small muted" style={{ marginBottom: 6 }}>Patients with disease control: 44.2% → 58.1% (computer simulation).</p>
            <SourceLink r={RESEARCH.model} />
          </div>
          <div className="stat-grid" style={{ alignContent: 'start' }}>
            <ResearchStat r={RESEARCH.app} />
            <ResearchStat r={RESEARCH.summaries} />
          </div>
        </div>

        <h2 className="panel-title section-gap" style={{ fontSize: '1.4rem' }}><Target size={24} aria-hidden="true" /> Implementation</h2>
        <ol className="rollout" aria-label="Rollout">
          <li>Co-design<span>with clinicians, patients and allergists</span></li>
          <li>Pilot<span>in linked clinics</span></li>
          <li>All Alliance sites<span>once pilot gates are met</span></li>
          <li>Other health systems<span>same rules, local data</span></li>
        </ol>

        <div className="impl-grid">
          <div className="card">
            <Database size={26} aria-hidden="true" />
            <h3>Inside the record clinicians already use</h3>
            <p>Built into the existing health record. No extra login, no extra screen to remember.</p>
          </div>
          <div className="card">
            <MousePointerClick size={26} aria-hidden="true" />
            <h3>One-tap decisions</h3>
            <p>Refer · E-consult · Not now. &ldquo;Not now&rdquo; always asks for a reason, so dismissed flags can be audited.</p>
          </div>
          <div className="card">
            <Users size={26} aria-hidden="true" />
            <h3>Who supports it</h3>
            <p>Clinicians, allergists, care navigators, the IT team, privacy officers, and patients.</p>
          </div>
          <div className="card">
            <Languages size={26} aria-hidden="true" />
            <h3>Works for everyone</h3>
            <p>App, text message, phone call or paper card. Multiple languages. Photos always optional.</p>
          </div>
          <div className="card">
            <Gauge size={26} aria-hidden="true" />
            <h3>Measured from day one</h3>
            <p>Baseline recorded at pilot sites before launch; balancing and equity measures tracked alongside outcomes.</p>
          </div>
          <div className="card">
            <Target size={26} aria-hidden="true" />
            <h3>Evidence before scale</h3>
            <p>Each stage only proceeds when the previous one shows results without harm.</p>
          </div>
        </div>

        <div className="gate" role="note">
          <Target size={28} aria-hidden="true" />
          <span>
            Scale only when referral time drops toward 12 months <Fict /> and no patient group is left behind.
          </span>
        </div>
      </div>
    </div>
  );
}
