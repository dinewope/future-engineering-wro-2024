import {
  Accessibility, ArrowRight, BookOpenCheck, Check, ClipboardList, Eye, FileSearch, GitMerge, Languages, Link2,
  ListChecks, MessageSquare, MessagesSquare, Mic, Phone, PhoneCall, ScanSearch, Scale, ShieldAlert, ShieldCheck,
  Smartphone, Sparkles, Stethoscope, FileText, UserCheck, Users, Lock,
} from 'lucide-react';
import { AiBadge, Fict, ResearchStat, SETTING_COLOR, SETTING_LABEL, SettingShape, Wordmark } from '../components/common';
import { CASE_STATS, RESEARCH } from '../content';
import { visits } from '../data';

type Go = (id: 'pitch' | 'app' | 'clinician' | 'impact') => void;

const VISIT_SUMMARY: Record<string, string> = {
  v1: '"Possible allergic reaction." Sent home.',
  v2: 'Skin clear today. "Advised to monitor."',
  v3: 'Lip swelling, gone within hours.',
  v4: 'No hives at exam. "Keep a diary."',
  v5: 'Poor sleep, can’t focus in class.',
  v6: 'Referral to allergy/immunology.',
};

function ElenaArt() {
  return (
    <svg className="elena-art" viewBox="0 0 420 420" role="img" aria-label="Illustration of Elena, a college student, looking at her phone with small notes floating around her">
      <circle cx="210" cy="210" r="190" fill="var(--primary-soft)" />
      {/* scattered notes: her story in pieces */}
      <g opacity="0.95">
        <rect x="40" y="70" width="88" height="54" rx="10" fill="var(--surface)" stroke="var(--line)" transform="rotate(-8 84 97)" />
        <rect x="50" y="84" width="56" height="6" rx="3" fill="var(--set-urgent)" transform="rotate(-8 84 97)" />
        <rect x="50" y="98" width="66" height="5" rx="2.5" fill="var(--line)" transform="rotate(-8 84 97)" />
        <rect x="300" y="60" width="88" height="54" rx="10" fill="var(--surface)" stroke="var(--line)" transform="rotate(7 344 87)" />
        <rect x="310" y="74" width="50" height="6" rx="3" fill="var(--set-primary)" transform="rotate(7 344 87)" />
        <rect x="310" y="88" width="66" height="5" rx="2.5" fill="var(--line)" transform="rotate(7 344 87)" />
        <rect x="318" y="250" width="80" height="50" rx="10" fill="var(--surface)" stroke="var(--line)" transform="rotate(-6 358 275)" />
        <rect x="328" y="263" width="44" height="6" rx="3" fill="var(--set-derm)" transform="rotate(-6 358 275)" />
        <rect x="328" y="277" width="58" height="5" rx="2.5" fill="var(--line)" transform="rotate(-6 358 275)" />
      </g>
      {/* body */}
      <path d="M120 420c4-80 40-126 90-126s86 46 90 126z" fill="var(--accent)" />
      <path d="M160 300c10 22 28 32 50 32s40-10 50-32" fill="none" stroke="var(--accent-ink)" strokeWidth="5" strokeLinecap="round" opacity=".35" />
      {/* backpack strap */}
      <path d="M150 318c-10 30-14 60-12 102" stroke="var(--primary)" strokeWidth="14" strokeLinecap="round" fill="none" />
      {/* neck + head */}
      <rect x="194" y="248" width="32" height="40" rx="14" fill="#bfe0f2" />
      <ellipse cx="210" cy="200" rx="62" ry="70" fill="#d7ecf7" />
      {/* hair */}
      <path d="M146 206c-8-66 30-104 70-104 46 0 78 34 72 100-6-26-22-50-56-60-28 18-60 30-86 64z" fill="#0a5252" />
      <path d="M146 200c-10 40-6 92 14 112 6-34 2-70-2-104z" fill="#0a5252" />
      <path d="M276 196c10 40 8 88-10 110-4-30-2-68 2-102z" fill="#0a5252" />
      {/* face */}
      <ellipse cx="186" cy="214" rx="6" ry="7" fill="#0a5252" />
      <ellipse cx="234" cy="214" rx="6" ry="7" fill="#0a5252" />
      <path d="M194 248c10 6 22 6 32 0" stroke="#0a5252" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M176 196c6-4 14-5 20-2M226 194c6-3 14-2 20 2" stroke="#0a5252" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* small wheals on her arm area, abstract */}
      <g fill="var(--accent-soft)" stroke="var(--accent-ink)" strokeWidth="2" opacity=".9">
        <circle cx="262" cy="350" r="8" /><circle cx="282" cy="370" r="6" /><circle cx="252" cy="378" r="5" />
      </g>
      {/* phone */}
      <rect x="282" y="300" width="56" height="92" rx="12" fill="#0a5252" />
      <rect x="288" y="310" width="44" height="70" rx="6" fill="var(--primary-soft)" />
      <circle cx="310" cy="345" r="10" fill="var(--primary)" />
      <path d="M305 345l4 4 7-8" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Pitch({ go }: { go: Go }) {
  return (
    <>
      {/* 1. Hero */}
      <section className="slide hero" aria-labelledby="hero-h">
        <div className="wrap">
          <div className="hero-wordmark">
            <Wordmark />
            <span className="tag">Your whole story, written down once.</span>
          </div>
          <h1 id="hero-h">Six visits. Thirty months. One story nobody read.</h1>
          <p className="sub">
            <Wordmark />: Connecting the CSU Patient Journey.
          </p>
          <div className="hero-dots" aria-hidden="true">
            {visits.map((v) => (
              <span key={v.id} className="hero-dot" style={{ background: SETTING_COLOR[v.setting] }} />
            ))}
          </div>
          <div className="row">
            <a className="btn btn-primary btn-lg" href="#elena" onClick={(e) => { e.preventDefault(); document.getElementById('elena')?.scrollIntoView({ behavior: 'smooth' }); }}>
              See Elena&rsquo;s journey <ArrowRight size={20} aria-hidden="true" />
            </a>
            <button className="btn btn-ghost btn-lg" onClick={() => go('app')}>
              Open the prototype
            </button>
          </div>
          <p className="muted small" style={{ marginTop: 20 }}>
            Headline numbers are network averages <Fict />.
          </p>
        </div>
      </section>

      {/* 2. Meet Elena */}
      <section className="slide" id="elena" aria-labelledby="elena-h">
        <div className="wrap two-col">
          <div>
            <p className="eyebrow">Meet Elena</p>
            <h2 id="elena-h">19, starting college, and two years into a story nobody has read end to end.</h2>
            <p className="lead">
              Recurring hives. Episodes of swelling. Itching that wakes her at night, then fatigue and trouble concentrating in
              class. She has been to urgent care, primary care and specialists. Each visit treated the moment in front of it.
              Nobody reviewed her whole journey as one story.
            </p>
            <div className="feelings" aria-label="How Elena feels">
              {['Frustrated', 'Unheard', 'Uncertain', 'Worried about college', 'Anxious about the next flare', 'Losing confidence'].map((f) => (
                <span className="chip" key={f}>{f}</span>
              ))}
            </div>
            <div className="card" style={{ marginTop: 26 }}>
              <h3>What she probably has a name for, but nobody has said yet</h3>
              <p style={{ margin: 0 }} className="muted">
                <strong style={{ color: 'var(--text)' }}>Chronic spontaneous urticaria (CSU):</strong> hives, deep swelling,
                or both, that keep coming back for <strong style={{ color: 'var(--text)' }}>6 weeks or longer</strong> with no clear
                outside trigger. Skin &ldquo;alarm cells&rdquo; (mast cells) release histamine on their own, often because the
                immune system switches them on by mistake. A single hive usually fades within <strong style={{ color: 'var(--text)' }}>1&ndash;24 hours</strong>,
                so by appointment time the skin often looks normal.
              </p>
            </div>
          </div>
          <ElenaArt />
        </div>
      </section>

      {/* 3. Diagnostic odyssey */}
      <section className="slide" aria-labelledby="odyssey-h">
        <div className="wrap">
          <p className="eyebrow">The diagnostic odyssey</p>
          <h2 id="odyssey-h">Every visit sees one moment. Nobody sees the six-week pattern that defines the condition.</h2>
          <div className="journey" aria-label="Elena's six visits as disconnected islands">
            <div className="journey-track">
              <div className="journey-axis" aria-hidden="true" />
              {visits.map((v, i) => {
                const frac = v.day / 730;
                const last = i === visits.length - 1;
                return (
                  <div key={v.id} className={`island ${last ? 'referral' : ''}`} style={{ left: `calc(65px + (100% - 130px) * ${frac})`, color: SETTING_COLOR[v.setting] }}>
                    <div className="island-bubble" style={{ color: 'var(--text)' }}>
                      <SettingShape setting={v.setting} />
                      <strong>{SETTING_LABEL[v.setting]}</strong>
                      <span className="muted">{VISIT_SUMMARY[v.id]}</span>
                    </div>
                    <div className="island-dot" aria-hidden="true" />
                    <div className="island-month" style={{ color: 'var(--text)' }}>
                      {last ? 'Month 24: referral' : `Month ${Math.round(v.day / 30.44)}`}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="journey-caption" aria-hidden="true">
              <span>First hives</span>
              <span>No visit links to the one before it</span>
              <span>Network median to referral: 30 months</span>
            </div>
          </div>

          <div className="stat-head">
            <h3>Alliance Care Network</h3>
            <Fict />
          </div>
          <div className="stat-grid">
            {CASE_STATS.map((s) => (
              <div className="stat" key={s.label}>
                <span className="big">{s.value}</span>
                <p>{s.label} <span className="sr-only">(fictional case data)</span></p>
              </div>
            ))}
          </div>

          <div className="stat-head">
            <h3>Published research: it isn&rsquo;t just Elena</h3>
            <span className="muted small">Real studies, linked</span>
          </div>
          <div className="stat-grid">
            <ResearchStat r={RESEARCH.delay} />
            <ResearchStat r={RESEARCH.doctors} />
            <ResearchStat r={RESEARCH.swelling} />
            <ResearchStat r={RESEARCH.prevalence} />
            <ResearchStat r={RESEARCH.women} />
          </div>
        </div>
      </section>

      {/* 4. How it works */}
      <section className="slide" aria-labelledby="how-h">
        <div className="wrap">
          <p className="eyebrow">How <Wordmark /> works</p>
          <h2 id="how-h">Elena records. AI connects. Humans decide.</h2>
          <div className="flow">
            <div className="step record">
              <div className="step-icon"><Mic size={28} aria-hidden="true" /></div>
              <div className="step-num">STEP 1</div>
              <h3>Record</h3>
              <p className="muted">Elena logs a flare in under a minute, any way she likes.</p>
              <div className="row" style={{ gap: 8 }}>
                <span className="chip"><Smartphone size={14} aria-hidden="true" /> App</span>
                <span className="chip"><MessageSquare size={14} aria-hidden="true" /> Text</span>
                <span className="chip"><PhoneCall size={14} aria-hidden="true" /> Phone call</span>
                <span className="chip"><FileText size={14} aria-hidden="true" /> Paper card</span>
              </div>
            </div>
            <div className="flow-arrow" aria-hidden="true"><ArrowRight size={32} /></div>
            <div className="step">
              <div className="step-icon"><GitMerge size={28} aria-hidden="true" /></div>
              <div className="step-num">STEP 2</div>
              <h3>Connect</h3>
              <p className="muted">AI stitches check-ins and visit notes into one timeline.</p>
              <ul>
                <li>Every point linked to its source</li>
                <li>Spots the 6-week pattern</li>
                <li>Lists what&rsquo;s missing</li>
              </ul>
            </div>
            <div className="flow-arrow" aria-hidden="true"><ArrowRight size={32} /></div>
            <div className="step">
              <div className="step-icon"><Stethoscope size={28} aria-hidden="true" /></div>
              <div className="step-num">STEP 3</div>
              <h3>Decide</h3>
              <p className="muted">A clinician reviews the &ldquo;Review suggested&rdquo; flag and its reasons.</p>
              <div className="decide-btns">
                <span className="chip">Refer</span>
                <span className="chip">E-consult</span>
                <span className="chip">Not now</span>
              </div>
            </div>
          </div>
          <div className="safety-path" role="note">
            <ShieldAlert size={30} aria-hidden="true" />
            <div className="grow">
              <strong>Safety stop, hard-coded, no AI:</strong> if Elena ticks &ldquo;swelling of throat/tongue&rdquo; or
              &ldquo;trouble breathing or swallowing&rdquo;, the app skips everything else and shows{' '}
              <strong>&ldquo;This could be an emergency. Call 911 now.&rdquo;</strong>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <AiBadge />
          </div>
        </div>
      </section>

      {/* 5. AI does / Humans do */}
      <section className="slide" aria-labelledby="split-h">
        <div className="wrap">
          <p className="eyebrow">A story-stitcher, not a diagnoser</p>
          <h2 id="split-h">AI does the paperwork. People do the medicine.</h2>
          <div className="versus">
            <div className="card ai">
              <h3 className="row"><Sparkles size={22} aria-hidden="true" style={{ color: 'var(--primary)' }} /> AI does</h3>
              <ul>
                {[
                  'Organises scattered notes',
                  'Matches different words for the same symptom ("welts", "itchy bumps", "ronchas")',
                  'Builds the timeline, with a source for every point',
                  'Spots the 6-week pattern',
                  'Lists missing information',
                  'Prepares the visit summary',
                ].map((t) => (
                  <li key={t}><Check size={20} aria-hidden="true" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="card human">
              <h3 className="row"><Users size={22} aria-hidden="true" style={{ color: 'var(--accent-ink)' }} /> Humans do</h3>
              <ul>
                {[
                  'Diagnose: AI never does',
                  'Decide on referral',
                  'Choose treatment: AI never recommends any',
                  'Talk with Elena',
                  'Dismiss or override any flag',
                  'Stay accountable',
                ].map((t) => (
                  <li key={t}><UserCheck size={20} aria-hidden="true" />{t}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="stat-grid" style={{ marginTop: 22 }}>
            <ResearchStat r={RESEARCH.summaries} />
            <ResearchStat r={RESEARCH.app} />
          </div>
        </div>
      </section>

      {/* 6. Responsible AI */}
      <section className="slide" aria-labelledby="rai-h">
        <div className="wrap">
          <p className="eyebrow">Responsible AI</p>
          <h2 id="rai-h">Built so it can&rsquo;t quietly make the call.</h2>
          <div className="rai-grid">
            <div className="card">
              <Eye size={28} aria-hidden="true" />
              <h3>Human oversight</h3>
              <p>A clinician makes every decision. AI stops at &ldquo;review suggested&rdquo;. The clinician of record is accountable for care decisions.</p>
            </div>
            <div className="card">
              <Lock size={28} aria-hidden="true" />
              <h3>Privacy &amp; consent</h3>
              <p>Opt-in. Minimum data. Elena can see who viewed her timeline. Saying no never changes her care.</p>
            </div>
            <div className="card">
              <Scale size={28} aria-hidden="true" />
              <h3>Fairness</h3>
              <p>
                Results checked by skin tone, language, age and access. Photos are optional, because skin-image AI has performed worse
                on darker skin. <a href={RESEARCH.skin.url} target="_blank" rel="noreferrer" className="source-link">Source: {RESEARCH.skin.cite}</a>
              </p>
            </div>
            <div className="card">
              <ShieldCheck size={28} aria-hidden="true" />
              <h3>Safety &amp; accuracy</h3>
              <p>Every timeline point links to its source note. Summaries are audited against original records. The education library is reviewed regularly.</p>
            </div>
            <div className="card">
              <Accessibility size={28} aria-hidden="true" />
              <h3>Accessibility</h3>
              <p>App, text, phone or paper. Multiple languages. Plain-language reading level. Screen-reader friendly.</p>
            </div>
            <div className="card">
              <ScanSearch size={28} aria-hidden="true" />
              <h3>Transparency</h3>
              <p>AI is always labelled. Every flag shows its reasons. Limits are stated on screen: &ldquo;This tool organises information. It cannot diagnose.&rdquo;</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Vision 2035 */}
      <section className="slide vision" aria-labelledby="vision-h">
        <div className="wrap">
          <p className="eyebrow">Vision 2035</p>
          <h2 id="vision-h">No patient has to be their own medical detective.</h2>
          <div className="vision-points">
            <span><Link2 size={16} aria-hidden="true" /> Every symptom linked to its source</span>
            <span><Languages size={16} aria-hidden="true" /> Every language, every channel</span>
            <span><ClipboardList size={16} aria-hidden="true" /> Every visit starts with the whole story</span>
            <span><ListChecks size={16} aria-hidden="true" /> Beyond CSU: any condition that hides between visits</span>
          </div>
        </div>
      </section>

      {/* 8. Closing */}
      <section className="slide closing" aria-labelledby="close-h">
        <div className="wrap">
          <p className="eyebrow"><Wordmark /></p>
          <h2 id="close-h">Elena&rsquo;s story was always there. <Wordmark /> makes sure someone reads it.</h2>
          <div className="closing-motto" aria-label="Elena records. AI connects. Humans decide.">
            <span>Elena records.</span>
            <span>AI connects.</span>
            <span>Humans decide.</span>
          </div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn btn-accent btn-lg" onClick={() => go('app')}><Smartphone size={20} aria-hidden="true" /> Elena&rsquo;s App</button>
            <button className="btn btn-primary btn-lg" onClick={() => go('clinician')}><FileSearch size={20} aria-hidden="true" /> Clinician View</button>
            <button className="btn btn-ghost btn-lg" onClick={() => go('impact')}><BookOpenCheck size={20} aria-hidden="true" /> Impact &amp; Plan</button>
          </div>
          <p className="muted small" style={{ marginTop: 24 }}>
            <Phone size={14} aria-hidden="true" /> <MessagesSquare size={14} aria-hidden="true" /> Works by app, text, phone call or paper card.
          </p>
        </div>
      </section>
    </>
  );
}
