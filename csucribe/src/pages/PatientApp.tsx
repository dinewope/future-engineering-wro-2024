import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, Camera, CheckCircle2, FileText, Frown, HandHeart, Meh, MessageSquare, Phone, Smartphone, Smile, Sparkles, Zap,
} from 'lucide-react';
import { Modal, Wordmark, useToast } from '../components/common';
import { isEmergency } from '../safety';
import type { Level, TimelineEvent } from '../types';
import { checkins } from '../data';

type Lang = 'en' | 'es';
type ChannelTab = 'app' | 'sms' | 'phone' | 'paper';

const T = {
  en: {
    title: 'How are your hives today?',
    badge: 'AI-assisted tool. Your care team makes all decisions.',
    wheals: 'Hives (raised itchy bumps) in the last 24 hours',
    whealLevels: [
      ['None', 'No hives today'],
      ['Mild', 'Fewer than 20'],
      ['Moderate', '20 to 50'],
      ['Intense', 'More than 50, or big patches joined together'],
    ],
    itch: 'Itch in the last 24 hours',
    itchLevels: [
      ['None', 'No itch'],
      ['Mild', 'There, but not bothering me'],
      ['Moderate', 'Bothering me, but I can still do my day and sleep'],
      ['Intense', 'Stops me from doing my day or from sleeping'],
    ],
    swelling: 'Any swelling?',
    sites: { lips: 'Lips', eyelids: 'Eyelids', hands: 'Hands', feet: 'Feet', throat: 'Throat / tongue' },
    breathing: 'Trouble breathing or swallowing?',
    sleep: 'Slept badly because of itch?',
    missed: 'Missed class or plans?',
    yes: 'Yes',
    no: 'No',
    photo: 'Add a photo',
    photoChange: 'Change photo',
    photoNote: 'Optional. Photos help, but you never need one. It stays on this device in the prototype.',
    words: 'In your own words',
    wordsPh: 'e.g. "itchy bumps again before my exam"',
    save: 'Save to my timeline',
    needLevels: 'Choose a level for hives and itch to save.',
    saved: 'Saved to your timeline. Your care team can see it and will contact you if they want to review your story.',
    another: 'Add another day',
    review: 'Please review my story',
    reviewHint: 'Feel like nobody is seeing the whole picture? Ask.',
    reviewed: 'Thank you. A person on your care team will review your story. You don’t need to do anything else.',
    emergency: 'This could be an emergency. Call 911 now.',
    emergencySub: 'Swelling of the throat or tongue, or trouble breathing or swallowing, needs help right away. This entry will not be saved.',
    what: 'What is this?',
  },
  es: {
    title: '¿Cómo están tus ronchas hoy?',
    badge: 'Herramienta asistida por IA. Tu equipo de atención toma todas las decisiones.',
    wheals: 'Ronchas (bultos que pican) en las últimas 24 horas',
    whealLevels: [
      ['Ninguna', 'Hoy no hay ronchas'],
      ['Leve', 'Menos de 20'],
      ['Moderada', 'De 20 a 50'],
      ['Intensa', 'Más de 50, o zonas grandes unidas'],
    ],
    itch: 'Picazón en las últimas 24 horas',
    itchLevels: [
      ['Ninguna', 'No pica'],
      ['Leve', 'Está, pero no me molesta'],
      ['Moderada', 'Me molesta, pero puedo seguir con mi día y dormir'],
      ['Intensa', 'No me deja hacer mi día o dormir'],
    ],
    swelling: '¿Alguna hinchazón?',
    sites: { lips: 'Labios', eyelids: 'Párpados', hands: 'Manos', feet: 'Pies', throat: 'Garganta / lengua' },
    breathing: '¿Dificultad para respirar o tragar?',
    sleep: '¿Dormiste mal por la picazón?',
    missed: '¿Faltaste a clase o a planes?',
    yes: 'Sí',
    no: 'No',
    photo: 'Añadir una foto',
    photoChange: 'Cambiar foto',
    photoNote: 'Opcional. Las fotos ayudan, pero nunca necesitas una. En el prototipo se queda en este dispositivo.',
    words: 'Con tus propias palabras',
    wordsPh: 'p. ej. "ronchas otra vez antes de mi examen"',
    save: 'Guardar en mi línea de tiempo',
    needLevels: 'Elige un nivel de ronchas y de picazón para guardar.',
    saved: 'Guardado en tu línea de tiempo. Tu equipo de atención puede verlo y te contactará si quiere revisar tu historia.',
    another: 'Añadir otro día',
    review: 'Por favor, revisen mi historia',
    reviewHint: '¿Sientes que nadie ve el panorama completo? Pídelo.',
    reviewed: 'Gracias. Una persona de tu equipo de atención revisará tu historia. No necesitas hacer nada más.',
    emergency: 'Esto podría ser una emergencia. Llama al 911 ahora.',
    emergencySub: 'La hinchazón de garganta o lengua, o la dificultad para respirar o tragar, necesita ayuda de inmediato. Esta entrada no se guardará.',
    what: '¿Qué es esto?',
  },
} as const;

const SITES = ['lips', 'eyelids', 'hands', 'feet', 'throat'] as const;
const FACES = [Smile, Meh, Frown, Zap];

function YesNo({ label, value, onChange, t }: { label: string; value: boolean | null; onChange: (v: boolean) => void; t: (typeof T)['en'] | (typeof T)['es'] }) {
  return (
    <div className="yn" role="group" aria-label={label}>
      <span className="yn-label">{label}</span>
      <div className="seg">
        <button type="button" className="yes" aria-pressed={value === true} onClick={() => onChange(true)}>{t.yes}</button>
        <button type="button" aria-pressed={value === false} onClick={() => onChange(false)}>{t.no}</button>
      </div>
    </div>
  );
}

function LevelPicker({ name, legend, levels, value, onChange }: { name: string; legend: string; levels: readonly (readonly [string, string])[]; value: Level | null; onChange: (l: Level) => void }) {
  return (
    <fieldset className="app-section">
      <legend>{legend}</legend>
      <div className="level-list">
        {levels.map(([title, desc], i) => {
          const Face = FACES[i];
          return (
            <label className="level" key={i}>
              <input type="radio" name={name} checked={value === i} onChange={() => onChange(i as Level)} />
              <span className="face" aria-hidden="true"><Face size={18} /></span>
              <span>
                <strong>{title}</strong>
                <span className="muted">{desc}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

const emptyForm = {
  wheals: null as Level | null,
  itch: null as Level | null,
  swelling: null as boolean | null,
  sites: [] as string[],
  breathing: null as boolean | null,
  sleep: null as boolean | null,
  missed: null as boolean | null,
  text: '',
  photoUrl: null as string | null,
};

interface Props {
  onSubmit: (e: TimelineEvent) => void;
  liveCount: number;
  go: (id: 'pitch' | 'app' | 'clinician' | 'impact') => void;
}

export default function PatientApp({ onSubmit, liveCount, go }: Props) {
  const [lang, setLang] = useState<Lang>('en');
  const [channel, setChannel] = useState<ChannelTab>('app');
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);
  const [reviewAsked, setReviewAsked] = useState(false);
  const [showWhat, setShowWhat] = useState(false);
  const toast = useToast();
  const t = T[lang];

  // Hard-coded safety stop. Evaluated on every change; no AI, no rule engine.
  const emergency = isEmergency({ swellingSites: form.sites, troubleBreathing: form.breathing });

  // Live entries land right after the last demo check-in (day 70), so they show in the clinician's 12-week view.
  const nextDay = useMemo(() => Math.max(...checkins.map((c) => c.day)) + 1 + liveCount, [liveCount]);

  useEffect(() => () => { if (form.photoUrl) URL.revokeObjectURL(form.photoUrl); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof typeof emptyForm>(k: K, v: (typeof emptyForm)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const toggleSite = (s: string) =>
    setForm((f) => ({ ...f, sites: f.sites.includes(s) ? f.sites.filter((x) => x !== s) : [...f.sites, s] }));

  const canSave = form.wheals !== null && form.itch !== null && !emergency;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emergency) return; // never reaches the timeline or the rule engine
    if (!canSave) return;
    onSubmit({
      id: `live-${Date.now()}`,
      day: nextDay,
      setting: 'checkin',
      channel: 'app',
      source: 'Patient check-in (app) · live demo entry',
      text: form.text.trim() || '(no words added)',
      wheals: form.wheals!,
      itch: form.itch!,
      swelling: form.swelling ? form.sites : undefined,
      sleepDisrupted: form.sleep ?? undefined,
      missedPlans: form.missed ?? undefined,
      photo: !!form.photoUrl,
      photoUrl: form.photoUrl ?? undefined,
      live: true,
    });
    setSaved(true);
    setForm(emptyForm);
  };

  const askReview = () => {
    onSubmit({
      id: `review-${Date.now()}`,
      day: nextDay,
      setting: 'checkin',
      channel: 'app',
      source: 'Patient request (app) · live demo entry',
      text: 'Elena pressed "Please review my story".',
      reviewRequested: true,
      live: true,
    });
    setReviewAsked(true);
    toast('Sent to the care team. A person will review Elena’s story.');
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (form.photoUrl) URL.revokeObjectURL(form.photoUrl);
    set('photoUrl', URL.createObjectURL(file)); // local preview only, never uploaded
  };

  const EmergencyBanner = ({ wide = false }: { wide?: boolean }) => (
    <div className={`emergency ${wide ? 'emergency-wide' : ''}`} role="alert" aria-live="assertive">
      <AlertTriangle size={wide ? 40 : 28} aria-hidden="true" style={{ flex: 'none' }} />
      <div>
        {t.emergency}
        <small>{t.emergencySub}</small>
      </div>
    </div>
  );

  return (
    <div className="page">
      {emergency && channel === 'app' && <EmergencyBanner wide />}
      <div className="wrap">
        <div className="page-head">
          <div>
            <p className="eyebrow">Patient view</p>
            <h1>Elena&rsquo;s App</h1>
            <p className="muted">What Elena sees when she records a flare. Calm words only: no scores, no predictions.</p>
          </div>
          <button className="btn btn-primary" onClick={() => go('clinician')}>
            See what the clinician sees{liveCount ? ` (${liveCount} new)` : ''}
          </button>
        </div>

        <div className="patient-layout">
          <aside className="patient-side" aria-label="Demo notes">
            <h3>Try it live</h3>
            <ul>
              <li>Pick hives and itch levels, then save: the entry appears on the clinician timeline.</li>
              <li>Tick <strong>Throat / tongue</strong> or <strong>trouble breathing</strong>: the hard-coded safety stop takes over.</li>
              <li>Press <strong>Please review my story</strong>: the voice rule fires for the clinician.</li>
            </ul>
            <h3 style={{ marginTop: 24 }}>Built on validated tools</h3>
            <p className="muted small">
              Hives and itch levels follow the 7-day Urticaria Activity Score (UAS7) wording. Elena never sees the total; her care team
              does.
            </p>
          </aside>

          <div className="phone" aria-label="Phone mock-up">
            <div className="phone-screen">
              <div className="phone-notch" aria-hidden="true"><span /></div>
              <div className="phone-body">
                <div className="app-top">
                  <Wordmark />
                  <div className="lang-toggle" role="group" aria-label="Language">
                    <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
                    <button aria-pressed={lang === 'es'} onClick={() => setLang('es')}>ES</button>
                  </div>
                </div>

                <div className="channel-tabs" role="tablist" aria-label="How Elena checks in">
                  {([
                    ['app', 'App', Smartphone],
                    ['sms', 'Text', MessageSquare],
                    ['phone', 'Call', Phone],
                    ['paper', 'Paper', FileText],
                  ] as const).map(([id, label, Icon]) => (
                    <button key={id} role="tab" aria-selected={channel === id} onClick={() => setChannel(id)}>
                      <Icon size={16} aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>

                {channel === 'app' && (
                  <form onSubmit={submit} noValidate>
                    <h2 className="app-title">{t.title}</h2>
                    <span className="ai-badge" style={{ fontSize: '0.74rem' }}>
                      <Sparkles size={13} aria-hidden="true" /> {t.badge}
                    </span>
                    <div style={{ marginTop: 6 }}>
                      <button type="button" className="text-link" onClick={() => setShowWhat(true)}>{t.what}</button>
                    </div>

                    {emergency && <div style={{ marginTop: 12 }}><EmergencyBanner /></div>}

                    {saved && !emergency && (
                      <div className="app-confirm" role="status">
                        <CheckCircle2 size={22} aria-hidden="true" />
                        <div>
                          {t.saved}
                          <div><button type="button" className="text-link" onClick={() => setSaved(false)}>{t.another}</button></div>
                        </div>
                      </div>
                    )}

                    {!saved && (
                      <>
                        <LevelPicker name="wheals" legend={t.wheals} levels={t.whealLevels} value={form.wheals} onChange={(v) => set('wheals', v)} />
                        <LevelPicker name="itch" legend={t.itch} levels={t.itchLevels} value={form.itch} onChange={(v) => set('itch', v)} />

                        <div className="app-section">
                          <YesNo t={t} label={t.swelling} value={form.swelling} onChange={(v) => setForm((f) => ({ ...f, swelling: v, sites: v ? f.sites : [] }))} />
                          {form.swelling && (
                            <div className="site-chips" role="group" aria-label={t.swelling}>
                              {SITES.map((s) => (
                                <button
                                  type="button"
                                  key={s}
                                  className={`site-chip ${s === 'throat' ? 'throat' : ''}`}
                                  aria-pressed={form.sites.includes(s)}
                                  onClick={() => toggleSite(s)}
                                >
                                  {s === 'throat' && <AlertTriangle size={14} aria-hidden="true" />}
                                  {t.sites[s]}
                                </button>
                              ))}
                            </div>
                          )}
                          <YesNo t={t} label={t.breathing} value={form.breathing} onChange={(v) => set('breathing', v)} />
                        </div>

                        <div className="app-section">
                          <YesNo t={t} label={t.sleep} value={form.sleep} onChange={(v) => set('sleep', v)} />
                          <YesNo t={t} label={t.missed} value={form.missed} onChange={(v) => set('missed', v)} />
                        </div>

                        <div className="app-section">
                          <span className="app-q">{t.photo}</span>
                          <div className="photo-drop">
                            {form.photoUrl && <img src={form.photoUrl} alt="Preview of the photo Elena added" />}
                            <span className="btn btn-ghost btn-sm photo-btn">
                              <Camera size={16} aria-hidden="true" /> {form.photoUrl ? t.photoChange : t.photo}
                              <input type="file" accept="image/*" onChange={onPhoto} aria-label={t.photo} />
                            </span>
                          </div>
                          <p className="muted small" style={{ margin: '8px 0 0' }}>{t.photoNote}</p>
                        </div>

                        <div className="app-section">
                          <label className="app-q" htmlFor="own-words">{t.words}</label>
                          <textarea id="own-words" className="app-text" placeholder={t.wordsPh} value={form.text} onChange={(e) => set('text', e.target.value)} />
                        </div>

                        {!emergency && (
                          <>
                            <button type="submit" className="btn btn-primary btn-lg app-submit" disabled={!canSave}>{t.save}</button>
                            {!canSave && <p className="muted small" style={{ textAlign: 'center', marginTop: 8 }}>{t.needLevels}</p>}
                          </>
                        )}
                      </>
                    )}

                    <div className="app-review">
                      {reviewAsked ? (
                        <div className="app-confirm" role="status" style={{ textAlign: 'left' }}>
                          <HandHeart size={22} aria-hidden="true" />
                          <div>{t.reviewed}</div>
                        </div>
                      ) : (
                        <>
                          <p className="muted small" style={{ marginBottom: 8 }}>{t.reviewHint}</p>
                          <button type="button" className="btn btn-accent" onClick={askReview}>
                            <HandHeart size={18} aria-hidden="true" /> {t.review}
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                )}

                {channel === 'sms' && <SmsMock lang={lang} />}
                {channel === 'phone' && <PhoneMock lang={lang} />}
                {channel === 'paper' && <PaperMock lang={lang} />}
              </div>
            </div>
          </div>

          <aside className="patient-side" aria-label="What Elena never sees">
            <h3>What Elena never sees</h3>
            <ul>
              <li>Scores, totals or percentages</li>
              <li>Predictions or the name of a condition</li>
              <li>Any medicine or treatment advice</li>
            </ul>
            <h3 style={{ marginTop: 24 }}>What she always sees</h3>
            <ul>
              <li>That her entry was saved</li>
              <li>That a person decides what happens next</li>
              <li>A way to ask for her story to be reviewed</li>
            </ul>
          </aside>
        </div>
      </div>

      {showWhat && (
        <Modal title="What is this?" onClose={() => setShowWhat(false)}>
          <WhatIsThis />
        </Modal>
      )}
    </div>
  );
}

function WhatIsThis() {
  return (
    <div>
      <p className="eyebrow">Plain-language guide · reviewed by your care team</p>
      <h2 style={{ fontSize: '1.6rem' }}>What is <Wordmark />?</h2>
      <p>
        <Wordmark /> is a diary for your skin. Each time you check in, your entry goes onto one timeline that your care team can see, so
        every visit starts with your whole story, not just how your skin looks that day.
      </p>
      <h3>Why write it down?</h3>
      <p>
        Hives often fade within a day, so your skin may look clear at an appointment. Your entries and photos show what happens in
        between.
      </p>
      <h3>What are hives and swelling?</h3>
      <p>
        <strong>Hives</strong> are raised, itchy bumps that can come and go. <strong>Swelling</strong> is deeper puffiness, often around
        the lips, eyes, hands or feet. When they keep coming back for weeks, your care team may want to look at the pattern.
      </p>
      <h3>Who decides what happens next?</h3>
      <p>
        People on your care team. The tool only organises your entries for them to read. It cannot diagnose and it does not suggest
        treatments.
      </p>
      <div className="emergency" style={{ animation: 'none', fontSize: '1rem' }} role="note">
        <AlertTriangle size={22} aria-hidden="true" style={{ flex: 'none' }} />
        <div>Swelling of your throat or tongue, or trouble breathing or swallowing? Call 911 now.</div>
      </div>
    </div>
  );
}

function SmsMock({ lang }: { lang: Lang }) {
  const es = lang === 'es';
  return (
    <div className="sms" aria-label="Text message check-in example">
      <p className="sms-meta">{es ? 'Mensajes · hoy 8:02 p. m.' : 'Messages · today 8:02 PM'}</p>
      <div className="bubble them">{es ? 'Hola Elena, revisión rápida. ¿Cuánta picazón hoy? Responde 0 (nada) a 3 (intensa).' : 'Hi Elena, quick check-in. Reply 0–3 for itch today (0 none, 3 intense).'}</div>
      <div className="bubble me">2</div>
      <div className="bubble them">{es ? '¿Ronchas hoy? Responde 0 a 3.' : 'Any hives today? Reply 0–3.'}</div>
      <div className="bubble me">2</div>
      <div className="bubble them alert">
        {es ? '¿Hinchazón de garganta o lengua, o dificultad para respirar? Responde SÍ o NO. Si es SÍ, llama al 911 ahora.' : 'Swelling of throat or tongue, or trouble breathing? Reply YES or NO. If YES, call 911 now.'}
      </div>
      <div className="bubble me">NO</div>
      <div className="bubble them">
        {es ? 'Gracias, guardado en tu línea de tiempo. Escribe REVISAR cuando quieras que tu equipo revise tu historia.' : 'Thanks, saved to your timeline. Text REVIEW any time to ask your care team to look at your story.'}
      </div>
      <div className="sms-replies" aria-hidden="true">
        <span className="chip">0</span><span className="chip">1</span><span className="chip">2</span><span className="chip">3</span><span className="chip">REVIEW</span>
      </div>
      <p className="muted small" style={{ marginTop: 8 }}>
        {es ? 'Funciona en cualquier teléfono, sin datos ni app.' : 'Works on any phone. No data plan or app needed.'}
      </p>
    </div>
  );
}

function PhoneMock({ lang }: { lang: Lang }) {
  const es = lang === 'es';
  const [pressed, setPressed] = useState<string[]>([]);
  return (
    <div aria-label="Phone call check-in example">
      <div className="ivr">
        <strong>{es ? 'Llamada automática' : 'Automated call'}</strong>
        <p className="muted small" style={{ margin: '6px 0 0' }}>
          {es
            ? '"Si tienes hinchazón de garganta o lengua, o dificultad para respirar, cuelga y llama al 911. Para ronchas hoy, marca 0 a 3."'
            : '"If your throat or tongue is swelling, or you have trouble breathing, hang up and call 911. For hives today, press 0 to 3."'}
        </p>
      </div>
      <div className="keypad" role="group" aria-label="Keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
          <button key={k} onClick={() => setPressed((p) => [...p.slice(-5), k])} aria-label={`Key ${k}`}>{k}</button>
        ))}
      </div>
      <p className="muted small" style={{ textAlign: 'center' }} aria-live="polite">
        {pressed.length ? `${es ? 'Marcado' : 'Pressed'}: ${pressed.join(' ')}` : es ? 'Prueba el teclado' : 'Try the keypad'}
      </p>
      <p className="muted small">
        {es ? 'Para quien prefiere hablar: disponible en varios idiomas, con opción de hablar con una persona.' : 'For people who would rather talk: multiple languages, with an option to reach a person.'}
      </p>
    </div>
  );
}

function PaperMock({ lang }: { lang: Lang }) {
  const es = lang === 'es';
  const days = es ? ['L', 'M', 'X', 'J', 'V', 'S', 'D'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div>
      <div className="paper" aria-label="Paper check-in card example">
        <strong>{es ? 'Tarjeta semanal de piel' : 'Weekly skin card'}</strong> · CSUcribe
        <table>
          <thead>
            <tr><th>{es ? 'Día' : 'Day'}</th>{days.map((d) => <th key={d}>{d}</th>)}</tr>
          </thead>
          <tbody>
            <tr><td>{es ? 'Ronchas 0–3' : 'Hives 0–3'}</td><td>2</td><td>1</td><td>2</td><td></td><td></td><td></td><td></td></tr>
            <tr><td>{es ? 'Picazón 0–3' : 'Itch 0–3'}</td><td>2</td><td>1</td><td>3</td><td></td><td></td><td></td><td></td></tr>
            <tr><td>{es ? 'Hinchazón ✓' : 'Swelling ✓'}</td><td></td><td></td><td>✓</td><td></td><td></td><td></td><td></td></tr>
            <tr><td>{es ? 'Dormí mal ✓' : 'Slept badly ✓'}</td><td></td><td></td><td>✓</td><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
        <div className="paper-alert">{es ? '¿Garganta o lengua hinchada, o dificultad para respirar? Llama al 911 ahora.' : 'Throat or tongue swelling, or trouble breathing? Call 911 now.'}</div>
      </div>
      <p className="muted small" style={{ marginTop: 14 }}>
        {es ? 'Entrégala en tu visita o envíala por correo; el personal la escanea a tu línea de tiempo.' : 'Hand it in at a visit or mail it back; staff scan it into the timeline.'}
      </p>
    </div>
  );
}
