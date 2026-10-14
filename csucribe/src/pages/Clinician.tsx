import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, ArrowLeftRight, BarChart3, Camera, CheckCircle2, ClipboardList, FileQuestion, FileText, Flag, History,
  Info, Languages, MousePointerClick, Pause, Play, Printer, Send, ShieldCheck, Sparkles, UserRound, X,
} from 'lucide-react';
import {
  AiBadge, Modal, SETTING_COLOR, SETTING_LABEL, SettingShape, Wordmark, fmtDay, placeholderPhoto, useToast,
} from '../components/common';
import { checkins, patient, visits, LAST_VISIT_DAY } from '../data';
import { firstFlagDay, hasHivesOrSwelling, missingInformation, runScenario, upTo, type FlagResult } from '../rules';
import { extractTerms } from '../terms';
import type { Setting, TimelineEvent } from '../types';

type Mode = 'before' | 'after';
type Zoom = 'full' | 'early';
const LANES: Setting[] = ['urgent', 'primary', 'derm', 'checkin'];
const EARLY_DAYS = 84; // first 12 weeks
const WHEAL_WORDS = ['None', 'Mild (<20 wheals)', 'Moderate (20–50)', 'Intense (>50 or merged)'];
const ITCH_WORDS = ['None', 'Mild', 'Moderate', 'Intense (affects day/sleep)'];
const CHANNEL_LABEL = { visit: 'Visit note', app: 'App', sms: 'Text message', phone: 'Phone call', paper: 'Paper card' } as const;
const NOT_NOW_REASONS = ['Already referred', 'Different explanation', 'Need more data', 'Other'];

interface Decision { action: string; reason?: string; at: string }

function photoFor(e: TimelineEvent): string | null {
  if (e.photoUrl) return e.photoUrl;
  if (!e.photo) return null;
  return placeholderPhoto(`Patient photo · day ${e.day}`, e.day);
}

export default function Clinician({ liveEvents }: { liveEvents: TimelineEvent[] }) {
  const [mode, setMode] = useState<Mode>('before');
  const [zoom, setZoom] = useState<Zoom>('full');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [notNowOpen, setNotNowOpen] = useState(false);
  const [notNowReason, setNotNowReason] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [showPrep, setShowPrep] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const toast = useToast();

  const events = useMemo(
    () => (mode === 'before' ? [...visits] : [...visits, ...checkins, ...liveEvents]).sort((a, b) => a.day - b.day),
    [mode, liveEvents],
  );
  const maxDay = Math.max(LAST_VISIT_DAY, ...events.map((e) => e.day));
  const [asOf, setAsOf] = useState(maxDay);

  const flag: FlagResult | null = runScenario(mode, events, asOf);
  const firstFlag = mode === 'after' ? firstFlagDay(events) : null;
  const domain = zoom === 'early' ? Math.max(EARLY_DAYS, ...events.filter((e) => e.live).map((e) => e.day + 4)) : maxDay;
  const unit = zoom === 'early' ? 'week' : 'month';
  const selected = events.find((e) => e.id === selectedId) ?? null;

  // Replay: walk "today" forward through the first 12 weeks and pause when the first flag is raised.
  const pausedAtFlag = useRef(false);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setAsOf((d) => d + 1), 70);
    return () => window.clearInterval(id);
  }, [playing]);
  useEffect(() => {
    if (!playing) return;
    if (firstFlag !== null && !pausedAtFlag.current && asOf >= firstFlag) {
      pausedAtFlag.current = true;
      setPlaying(false);
      setAsOf(firstFlag);
    } else if (asOf >= domain) {
      setPlaying(false);
      setAsOf(domain);
    }
  }, [asOf, playing, firstFlag, domain]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setPlaying(false);
    setSelectedId(null);
    setNotNowOpen(false);
    setAnimKey((k) => k + 1);
    setAsOf(Math.max(LAST_VISIT_DAY, ...(m === 'after' ? liveEvents.map((e) => e.day) : [])));
    if (m === 'before') setZoom('full');
  };

  const startReplay = () => {
    setZoom('early');
    pausedAtFlag.current = false;
    setAsOf(0);
    setSelectedId(null);
    setPlaying(true);
  };

  const decide = (action: string, msg: string, reason?: string) => {
    setDecisions((d) => [{ action, reason, at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...d]);
    toast(msg);
  };

  const canContinue = pausedAtFlag.current && asOf === firstFlag && zoom === 'early';
  const visible = upTo(events, asOf);
  const terms = extractTerms(visible);
  const missing = missingInformation(events, asOf);
  const counts = {
    days: new Set(visible.filter(hasHivesOrSwelling).map((e) => e.day)).size,
    swelling: visible.filter((e) => e.swelling?.length).length,
    sleep: visible.filter((e) => e.sleepDisrupted).length,
    photos: visible.filter((e) => e.photo).length,
    uct: visible.filter((e) => e.uct !== undefined).map((e) => e.uct!),
  };

  return (
    <div className="page">
      <div className="wrap">
        <div className="page-head">
          <div>
            <p className="eyebrow">Clinician view</p>
            <h1>One connected timeline</h1>
            <p className="muted">What a primary care clinician sees in the record they already use.</p>
          </div>
          <AiBadge />
        </div>

        <div className="clin-head">
          <div className="pt">
            <div className="pt-avatar" aria-hidden="true">ER</div>
            <div>
              <div className="pt-name">{patient.name}, {patient.age} · {patient.network}</div>
              <div className="muted small">
                Consent: <span className="consent"><CheckCircle2 size={14} aria-hidden="true" /> shared ✔</span> · Elena can see who viewed her timeline
              </div>
            </div>
          </div>
          <div className="mode-toggle" role="group" aria-label="Scenario">
            <button aria-pressed={mode === 'before'} onClick={() => switchMode('before')}>
              <History size={18} aria-hidden="true" /> Before: today&rsquo;s care
            </button>
            <button className="after" aria-pressed={mode === 'after'} onClick={() => switchMode('after')}>
              <Sparkles size={18} aria-hidden="true" /> After: <Wordmark />
            </button>
          </div>
        </div>

        {/* Review banner: only when rules fire */}
        {flag?.reviewSuggested ? (
          <section className="review-banner" aria-labelledby="flag-h" aria-live="polite">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h2 id="flag-h"><Flag size={24} aria-hidden="true" /> Review suggested</h2>
              <span className={`strength ${flag.strength}`} title="Strong: 3+ rules fired, or 14+ dated entries with 4+ photos. Otherwise limited.">
                Evidence strength: {flag.strength}
              </span>
            </div>
            <p className="muted small" style={{ margin: '6px 0 0' }}>
              For clinician review. {flag.fired.length} of 5 rules fired as of {fmtDay(asOf, unit)}. This tool organises information. It cannot diagnose.
            </p>
            <ul className="rule-list">
              {flag.fired.map((r) => (
                <li className="rule-item" key={r.id}>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <div><span className="rule-name">{r.name}:</span> {r.reason}</div>
                  <div className="evidence" aria-label={`Evidence for ${r.name}`}>
                    {r.evidence.slice(0, 8).map((e) => (
                      <button key={e.id} onClick={() => setSelectedId(e.id)} aria-label={`Open source: ${e.source}, day ${e.day}`}>
                        <SettingShape setting={e.setting} size={10} /> day {e.day}
                      </button>
                    ))}
                    {r.evidence.length > 8 && <span className="muted small">+{r.evidence.length - 8} more</span>}
                  </div>
                </li>
              ))}
            </ul>
            <div className="decision-row">
              <button className="btn btn-primary" onClick={() => decide('Referred to allergy/immunology', 'Referral to allergy/immunology sent. The care team will tell Elena.')}>
                <Send size={18} aria-hidden="true" /> Refer to allergy/immunology
              </button>
              <button className="btn btn-ghost" onClick={() => decide('E-consult sent', 'E-consult sent to allergy/immunology with the timeline attached.')}>
                <ArrowLeftRight size={18} aria-hidden="true" /> Send e-consult
              </button>
              <button className="btn btn-ghost" aria-expanded={notNowOpen} onClick={() => setNotNowOpen((v) => !v)}>
                <X size={18} aria-hidden="true" /> Not now
              </button>
              <button className="btn btn-accent" onClick={() => setShowPrep(true)} style={{ marginLeft: 'auto' }}>
                <ClipboardList size={18} aria-hidden="true" /> Visit Prep sheet
              </button>
            </div>
            {notNowOpen && (
              <div className="notnow">
                <fieldset>
                  <legend>Not now: a reason is required</legend>
                  {NOT_NOW_REASONS.map((r) => (
                    <label className="radio-chip" key={r}>
                      <input type="radio" name="notnow" checked={notNowReason === r} onChange={() => setNotNowReason(r)} /> {r}
                    </label>
                  ))}
                </fieldset>
                <div className="row" style={{ marginTop: 12 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={!notNowReason}
                    onClick={() => {
                      decide('Not now', `Recorded "Not now" (${notNowReason}). The flag stays visible to the care team.`, notNowReason!);
                      setNotNowOpen(false);
                      setNotNowReason(null);
                    }}
                  >
                    Confirm &ldquo;Not now&rdquo;
                  </button>
                  {!notNowReason && <span className="muted small">Choose a reason to continue.</span>}
                </div>
              </div>
            )}
          </section>
        ) : (
          <div className="no-flag" role="status">
            {mode === 'before' ? (
              <>
                <FileText size={26} aria-hidden="true" />
                <div>
                  <strong style={{ color: 'var(--text)' }}>Today&rsquo;s care: six separate notes.</strong> No shared timeline, no
                  check-ins between visits, no flag. Each visit stands alone; switch to <strong>After</strong> to stitch them together.
                </div>
              </>
            ) : (
              <>
                <Info size={26} aria-hidden="true" />
                <div>No rules have fired yet as of {fmtDay(asOf, unit)}. Keep recording; nothing for the clinician to review.</div>
              </>
            )}
          </div>
        )}

        <div className="clin-grid">
          {/* Timeline */}
          <section className="card" aria-labelledby="tl-h">
            <div className="timeline-tools">
              <h2 className="panel-title" id="tl-h"><BarChart3 size={20} aria-hidden="true" /> Timeline · every point links to its source</h2>
              <div className="row">
                {mode === 'after' && (
                  <div className="seg" role="group" aria-label="Zoom">
                    <button aria-pressed={zoom === 'full'} onClick={() => setZoom('full')}>24 months</button>
                    <button aria-pressed={zoom === 'early'} onClick={() => setZoom('early')}>First 12 weeks</button>
                  </div>
                )}
              </div>
            </div>
            <div className="legend" aria-label="Legend">
              {LANES.map((l) => (
                <span key={l}><SettingShape setting={l} /> {SETTING_LABEL[l]}</span>
              ))}
              <span><Camera size={14} aria-hidden="true" /> Photo attached</span>
            </div>

            <div className="tl" style={{ marginTop: 14 }}>
              <div className="tl-inner">
                {LANES.map((lane) => {
                  const laneEvents = events.filter((e) => e.setting === lane && e.day <= domain);
                  return (
                    <div className="tl-lane" key={lane}>
                      <div className="tl-lane-label"><SettingShape setting={lane} /> {SETTING_LABEL[lane]}</div>
                      <div className="tl-track">
                        {lane === 'checkin' && laneEvents.length === 0 && (
                          <span className="muted small" style={{ position: 'absolute', top: 16, left: 8 }}>No record between visits</span>
                        )}
                        {laneEvents.map((e, i) => {
                          const sameDay = laneEvents.filter((x) => x.day === e.day);
                          const k = sameDay.indexOf(e);
                          const top = sameDay.length > 1 ? `${30 + (k * 40) / (sameDay.length - 1)}%` : '50%';
                          return (
                            <button
                              key={`${e.id}-${animKey}`}
                              className={`tl-dot ${e.day > asOf ? 'future' : ''} ${mode === 'after' && lane === 'checkin' ? 'animate' : ''}`}
                              style={{ left: `${(e.day / domain) * 100}%`, top, ['--c' as string]: SETTING_COLOR[lane], animationDelay: `${i * 45}ms` }}
                              aria-pressed={selectedId === e.id}
                              aria-label={`${SETTING_LABEL[lane]}, ${fmtDay(e.day, unit)}${e.photo ? ', photo attached' : ''}${e.reviewRequested ? ', review requested' : ''}. Open source.`}
                              onClick={() => setSelectedId(e.id)}
                              tabIndex={e.day > asOf ? -1 : 0}
                            >
                              <SettingShape setting={lane} size={16} />
                              {e.photo && <span className="photo-mark" aria-hidden="true"><Camera size={9} /></span>}
                              {e.reviewRequested && <span className="photo-mark" aria-hidden="true"><UserRound size={9} /></span>}
                            </button>
                          );
                        })}
                        {firstFlag !== null && firstFlag <= domain && (
                          <div className="tl-flagline" style={{ left: `${(firstFlag / domain) * 100}%` }} aria-hidden="true" />
                        )}
                        {asOf < domain && <div className="tl-now" style={{ left: `${(asOf / domain) * 100}%` }} aria-hidden="true" />}
                      </div>
                    </div>
                  );
                })}
                <div className="tl-axis" aria-hidden="true">
                  <div />
                  <div className="tl-ticks">
                    {(zoom === 'early'
                      ? Array.from({ length: Math.floor(domain / 7) + 1 }, (_, w) => ({ d: w * 7, label: `Wk ${w + 1}` }))
                      : Array.from({ length: 9 }, (_, i) => ({ d: Math.round(i * 3 * 30.44), label: `Mo ${i * 3}` })).filter((t) => t.d <= domain)
                    ).filter((t) => t.d <= domain - 3 || t.d === 0).map((t) => (
                      <span className="tl-tick" key={t.label} style={{ left: `${(t.d / domain) * 100}%` }}>{t.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {mode === 'after' && (
              <>
                <div className="scrubber">
                  <button className="btn btn-primary btn-sm" onClick={() => (playing ? setPlaying(false) : canContinue ? setPlaying(true) : startReplay())}>
                    {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                    {playing ? 'Pause' : canContinue ? 'Continue' : 'Replay weeks 1–12'}
                  </button>
                  <label className="sr-only" htmlFor="asof">Show the record as of day</label>
                  <input
                    id="asof"
                    type="range"
                    min={0}
                    max={domain}
                    value={Math.min(asOf, domain)}
                    onChange={(e) => { setPlaying(false); setAsOf(Number(e.target.value)); }}
                  />
                  <span className="scrub-label">As of {fmtDay(Math.min(asOf, domain), unit)}</span>
                </div>
                {firstFlag !== null && (
                  <div className="flag-callout">
                    <Flag size={18} aria-hidden="true" />
                    <span>
                      With <Wordmark />, the first &ldquo;Review suggested&rdquo; appears at <strong>week {Math.floor(firstFlag / 7) + 1} (day {firstFlag})</strong>.
                      In today&rsquo;s care, Elena&rsquo;s referral came at <strong>month 24</strong>. (fictional case data)
                    </span>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Source panel */}
          <aside className="card detail" aria-labelledby="src-h" aria-live="polite">
            <h2 className="panel-title" id="src-h"><FileText size={20} aria-hidden="true" /> Source</h2>
            {selected ? (
              <SourceDetail e={selected} onClose={() => setSelectedId(null)} />
            ) : (
              <div className="detail-empty">
                <MousePointerClick size={30} aria-hidden="true" />
                <p style={{ margin: 0 }}>Click any point on the timeline to open the original note or check-in it came from.</p>
              </div>
            )}
          </aside>
        </div>

        <div className="clin-grid-2">
          <section className="card" aria-labelledby="miss-h">
            <h2 className="panel-title" id="miss-h"><FileQuestion size={20} aria-hidden="true" /> Missing information</h2>
            <ul className="list-clean">
              {missing.map((m) => (
                <li key={m}><AlertCircle size={16} aria-hidden="true" />{m}</li>
              ))}
            </ul>
          </section>

          <section className="card" aria-labelledby="terms-h">
            <h2 className="panel-title" id="terms-h"><Languages size={20} aria-hidden="true" /> Patient&rsquo;s words → structured terms</h2>
            <table className="terms-table">
              <thead>
                <tr><th scope="col">Words used</th><th scope="col">Structured term · sources</th></tr>
              </thead>
              <tbody>
                {terms.slice(0, 9).map((t) => (
                  <tr key={t.phrase + t.term}>
                    <td className="phrase">&ldquo;{t.phrase}&rdquo;{t.lang && <span className="chip" style={{ marginLeft: 6, fontStyle: 'normal' }}>{t.lang}</span>}</td>
                    <td>
                      <span className="arrow" aria-hidden="true">→ </span><span className="term-pill">{t.term}</span>
                      <div className="evidence" style={{ gridColumn: 'auto' }}>
                        {t.events.slice(0, 4).map((e) => (
                          <button key={e.id} onClick={() => setSelectedId(e.id)} aria-label={`Open source, day ${e.day}`}>day {e.day}</button>
                        ))}
                        {t.events.length > 4 && <span className="muted small">+{t.events.length - 4}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="card" aria-labelledby="sum-h">
            <h2 className="panel-title" id="sum-h"><ClipboardList size={20} aria-hidden="true" /> Symptom counts &amp; decisions</h2>
            <dl className="facts">
              <dt>Dates with hives/swelling</dt><dd>{counts.days}</dd>
              <dt>Swelling episodes</dt><dd>{counts.swelling}</dd>
              <dt>Sleep disrupted</dt><dd>{counts.sleep}</dd>
              <dt>Photos</dt><dd>{counts.photos}</dd>
              <dt>Urticaria Control Test</dt><dd>{counts.uct.length ? `${counts.uct.join(', ')} (12+ = well controlled)` : 'Not on record'}</dd>
            </dl>
            <h3 style={{ fontSize: '0.95rem', marginTop: 18 }}>Decision log</h3>
            {decisions.length ? (
              <ul className="list-clean log">
                {decisions.map((d, i) => (
                  <li key={i}><ShieldCheck size={16} aria-hidden="true" style={{ color: 'var(--primary)' }} />
                    <span><strong>{d.action}</strong>{d.reason ? ` · reason: ${d.reason}` : ''} · {d.at} · clinician of record</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small">No decisions yet. Every action is made and signed by a clinician.</p>
            )}
          </section>
        </div>

        <div className="ai-footer" role="note">
          <Sparkles size={20} aria-hidden="true" />
          AI organises information for clinician review. It does not diagnose or recommend treatment.
        </div>
      </div>

      {showPrep && flag && (
        <Modal title="Visit Prep sheet" onClose={() => setShowPrep(false)} wide>
          <div className="row no-print" style={{ marginBottom: 14 }}>
            <button className="btn btn-primary" onClick={() => window.print()}><Printer size={18} aria-hidden="true" /> Print one page</button>
            <span className="muted small">Fits one Letter/A4 page.</span>
          </div>
          <PrepSheet events={visible} flag={flag} asOf={asOf} />
        </Modal>
      )}
      {showPrep && flag && createPortal(
        <div className="print-root"><PrepSheet events={visible} flag={flag} asOf={asOf} /></div>,
        document.body,
      )}
    </div>
  );
}

function SourceDetail({ e, onClose }: { e: TimelineEvent; onClose: () => void }) {
  const photo = photoFor(e);
  return (
    <div>
      <div className="detail-meta">
        <span className="chip" style={{ borderColor: SETTING_COLOR[e.setting] }}><SettingShape setting={e.setting} size={12} /> {SETTING_LABEL[e.setting]}</span>
        <span className="chip">{CHANNEL_LABEL[e.channel]}</span>
        <span className="chip">{fmtDay(e.day)}</span>
        {e.live && <span className="chip">Live demo entry</span>}
        <button className="icon-btn" style={{ width: 30, height: 30, marginLeft: 'auto' }} onClick={onClose} aria-label="Close source"><X size={14} /></button>
      </div>
      <p className="muted small" style={{ margin: '0 0 4px' }}>{e.source}</p>
      <blockquote className="quote">&ldquo;{e.text}&rdquo;</blockquote>
      <dl className="facts">
        {e.wheals !== undefined && (<><dt>Hives</dt><dd>{e.wheals} · {WHEAL_WORDS[e.wheals]}</dd></>)}
        {e.itch !== undefined && (<><dt>Itch</dt><dd>{e.itch} · {ITCH_WORDS[e.itch]}</dd></>)}
        {e.hives !== undefined && (<><dt>Hives in note</dt><dd>{e.hives ? 'Reported' : 'Not reported'}</dd></>)}
        {e.swelling?.length ? (<><dt>Swelling</dt><dd>{e.swelling.join(', ')}</dd></>) : null}
        {e.sleepDisrupted !== undefined && (<><dt>Sleep</dt><dd>{e.sleepDisrupted ? 'Disrupted' : 'OK'}</dd></>)}
        {e.missedPlans && (<><dt>Missed</dt><dd>Class or plans</dd></>)}
        {e.uct !== undefined && (<><dt>Control test</dt><dd>{e.uct} / 16 {e.uct < 12 ? '(below 12)' : '(well controlled)'}</dd></>)}
        {e.reviewRequested && (<><dt>Request</dt><dd>Please review my story</dd></>)}
      </dl>
      {photo && (
        <div className="photo-ph" style={{ marginTop: 12 }}>
          <img src={photo} alt={e.photoUrl ? 'Photo Elena added in the live demo' : `Placeholder for patient photo, day ${e.day}`} />
        </div>
      )}
    </div>
  );
}

function PrepSheet({ events, flag, asOf }: { events: TimelineEvent[]; flag: FlagResult; asOf: number }) {
  const photos = events.filter((e) => e.photo).slice(-4);
  const visitsSeen = events.filter((e) => e.setting !== 'checkin');
  const checks = events.filter((e) => e.setting === 'checkin');
  const maxD = Math.max(asOf, 1);
  return (
    <div className="prep-sheet">
      <div className="prep-head">
        <div>
          <h2>Visit Prep · {patient.name}, {patient.age}</h2>
          <div>{patient.network} · Consent: shared · Record as of {fmtDay(asOf)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong>CSUcribe</strong>
          <div>For clinician review</div>
        </div>
      </div>

      <div className="prep-grid">
        <div className="prep-box prep-full">
          <h4>Timeline ({visitsSeen.length} visits · {checks.length} check-ins)</h4>
          <svg viewBox="0 0 700 70" width="100%" height="70" role="img" aria-label="Mini timeline">
            {LANES.map((l, i) => (
              <g key={l}>
                <text x="0" y={14 + i * 16} fontSize="9" fill="#444">{SETTING_LABEL[l]}</text>
                <line x1="90" x2="695" y1={11 + i * 16} y2={11 + i * 16} stroke="#ddd" />
                {events.filter((e) => e.setting === l).map((e) => (
                  <circle key={e.id} cx={90 + (e.day / maxD) * 600} cy={11 + i * 16} r="4" fill={['#c2410c', '#2b5f9e', '#7a3fb8', '#d9603f'][i]} />
                ))}
              </g>
            ))}
          </svg>
        </div>

        <div className="prep-box prep-full">
          <h4>Review suggested: why ({flag.strength.toLowerCase()} evidence)</h4>
          <ul>{flag.fired.map((r) => <li key={r.id}><strong>{r.name}:</strong> {r.reason}</li>)}</ul>
        </div>

        <div className="prep-box prep-full">
          <h4>Symptom counts</h4>
          <div className="prep-counts">
            <div><strong>{new Set(events.filter(hasHivesOrSwelling).map((e) => e.day)).size}</strong>dates with hives/swelling</div>
            <div><strong>{events.filter((e) => e.swelling?.length).length}</strong>swelling episodes</div>
            <div><strong>{events.filter((e) => e.sleepDisrupted).length}</strong>nights of bad sleep</div>
            <div><strong>{events.filter((e) => e.uct !== undefined).map((e) => e.uct).join(' → ') || '—'}</strong>control test (12+ = controlled)</div>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="prep-box prep-full">
            <h4>Best photos (patient check-ins)</h4>
            <div className="prep-photos">
              {photos.map((e) => (
                <figure key={e.id}>
                  <img src={photoFor(e)!} alt={`Photo, day ${e.day}`} />
                  <figcaption>Day {e.day}{e.swelling?.length ? ` · ${e.swelling.join(', ')}` : ''}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        <div className="prep-box">
          <h4>What matters to me</h4>
          <ul>
            <li><strong>Sleep:</strong> itching wakes me up, then I can&rsquo;t focus in class.</li>
            <li><strong>Exams:</strong> flares before exams; I missed my study group.</li>
            <li><strong>Confidence:</strong> I worry about my face swelling in front of friends.</li>
          </ul>
        </div>
        <div className="prep-box">
          <h4>Elena&rsquo;s top questions</h4>
          <ol>
            <li>Why do the hives keep coming back with no clear trigger?</li>
            <li>Should I see a specialist, and how soon?</li>
            <li>What should I track before the next visit?</li>
            <li>What do I do if the swelling is near my throat?</li>
          </ol>
        </div>
      </div>
      <div className="prep-foot">
        AI-assisted summary for clinician review. It does not diagnose or recommend treatment; every point links to its source note in the
        record. The clinician of record makes all decisions. Prototype with fictional data. Not a medical device.
      </div>
    </div>
  );
}
