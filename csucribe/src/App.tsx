import { useCallback, useEffect, useState } from 'react';
import { Maximize2, Minimize2, Moon, Sun } from 'lucide-react';
import { ToastProvider, Wordmark } from './components/common';
import Pitch from './pages/Pitch';
import PatientApp from './pages/PatientApp';
import Clinician from './pages/Clinician';
import Impact from './pages/Impact';
import type { TimelineEvent } from './types';

const PAGES = [
  { id: 'pitch', label: 'Pitch' },
  { id: 'app', label: "Elena's App" },
  { id: 'clinician', label: 'Clinician View' },
  { id: 'impact', label: 'Impact & Plan' },
] as const;
type PageId = (typeof PAGES)[number]['id'];

const readHash = (): PageId => {
  const id = window.location.hash.replace(/^#\/?/, '').split('/')[0];
  return (PAGES.find((p) => p.id === id)?.id ?? 'pitch') as PageId;
};

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable: fine */ }
}

export default function App() {
  const [page, setPage] = useState<PageId>(readHash);
  const [presenter, setPresenter] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | null>(() => safeGet('csucribe-theme') as 'light' | 'dark' | null);
  // Entries Elena adds during the live demo flow straight into the clinician timeline.
  const [liveEvents, setLiveEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const onHash = () => {
      setPage(readHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('presenter', presenter);
  }, [presenter]);

  useEffect(() => {
    if (theme) {
      document.documentElement.dataset.theme = theme;
      safeSet('csucribe-theme', theme);
    }
  }, [theme]);

  const go = useCallback((id: PageId) => {
    window.location.hash = `/${id}`;
  }, []);

  // Presenter shortcuts: 1–4 jump between sections, P toggles presenter mode, Esc exits it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= PAGES.length) go(PAGES[n - 1].id);
      else if (e.key === 'p' || e.key === 'P') setPresenter((v) => !v);
      else if (e.key === 'Escape' && !document.querySelector('[role="dialog"]')) setPresenter(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const isDark = theme ? theme === 'dark' : window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const pageTitle = PAGES.find((p) => p.id === page)!.label;

  useEffect(() => {
    document.title = page === 'pitch' ? 'CSUcribe' : `${pageTitle} · CSUcribe`;
  }, [page, pageTitle]);

  return (
    <ToastProvider>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        Skip to content
      </a>
      <header className="topnav">
        <div className="wrap">
          <a className="brand" href="#/pitch" aria-label="CSUcribe home">
            <span className="brand-mark" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 32 32"><path d="M5 18h5l3.5-9 4 14 3.5-7H27" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <Wordmark />
          </a>
          <nav className="tabs" aria-label="Sections">
            {PAGES.map((p, i) => (
              <a key={p.id} className="tab" href={`#/${p.id}`} aria-current={page === p.id ? 'page' : undefined}>
                <span className="num">{i + 1}</span>
                {p.label}
              </a>
            ))}
          </nav>
          <div className="nav-tools">
            <button className="icon-btn" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} title="Theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="icon-btn" onClick={() => setPresenter(true)} aria-label="Presenter mode: hide navigation and enlarge text (P)" title="Presenter mode (P)">
              <Maximize2 size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="presenter-exit">
        {PAGES.map((p, i) => (
          <button key={p.id} className="icon-btn" onClick={() => go(p.id)} aria-label={`Go to ${p.label} (${i + 1})`} title={p.label}>
            {i + 1}
          </button>
        ))}
        <button className="icon-btn" onClick={() => setPresenter(false)} aria-label="Exit presenter mode (Esc)" title="Exit presenter mode (Esc)">
          <Minimize2 size={18} />
        </button>
      </div>

      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        {page === 'pitch' && <Pitch go={go} />}
        {page === 'app' && (
          <PatientApp onSubmit={(e) => setLiveEvents((l) => [...l, e])} liveCount={liveEvents.length} go={go} />
        )}
        {page === 'clinician' && <Clinician liveEvents={liveEvents} />}
        {page === 'impact' && <Impact />}
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <span className="footer-legal">Prototype with fictional data. Not a medical device.</span>
          <span>
            <Wordmark /> · Your whole story, written down once. · Elena records. AI connects. Humans decide.
          </span>
          <span className="small">Keys: 1–4 sections · P presenter mode</span>
        </div>
      </footer>
    </ToastProvider>
  );
}
