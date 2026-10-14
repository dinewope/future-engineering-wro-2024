import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, ExternalLink, Sparkles, X } from 'lucide-react';
import type { Research } from '../content';
import type { Setting } from '../types';

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`} aria-label="CSUcribe">
      <span className="csu">CSU</span>
      <span>cribe</span>
    </span>
  );
}

export const AI_LABEL = 'AI-assisted tool. Your care team makes all decisions.';

export function AiBadge({ text = AI_LABEL }: { text?: string }) {
  return (
    <span className="ai-badge">
      <Sparkles size={15} aria-hidden="true" />
      {text}
    </span>
  );
}

export function Fict() {
  return <span className="fict">(fictional case data)</span>;
}

export function SourceLink({ r }: { r: Research }) {
  return (
    <a className="source-link" href={r.url} target="_blank" rel="noreferrer">
      Source: {r.cite} <ExternalLink size={12} aria-hidden="true" />
    </a>
  );
}

export function ResearchStat({ r }: { r: Research }) {
  return (
    <div className="stat real">
      <span className="big">{r.value}</span>
      <p>{r.text}</p>
      <SourceLink r={r} />
    </div>
  );
}

/* ---------- Settings: colour + shape, so colour never carries meaning alone ---------- */
export const SETTING_LABEL: Record<Setting, string> = {
  urgent: 'Urgent care',
  primary: 'Primary care',
  derm: 'Dermatology',
  checkin: 'Patient check-in',
};
export const SETTING_COLOR: Record<Setting, string> = {
  urgent: 'var(--set-urgent)',
  primary: 'var(--set-primary)',
  derm: 'var(--set-derm)',
  checkin: 'var(--set-checkin)',
};

export function SettingShape({ setting, size = 14 }: { setting: Setting; size?: number }) {
  const fill = SETTING_COLOR[setting];
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden="true" style={{ flex: 'none' }}>
      {setting === 'urgent' && <polygon points="8,1 15,15 1,15" fill={fill} />}
      {setting === 'primary' && <rect x="2" y="2" width="12" height="12" rx="2" fill={fill} />}
      {setting === 'derm' && <polygon points="8,0.5 15.5,8 8,15.5 0.5,8" fill={fill} />}
      {setting === 'checkin' && <circle cx="8" cy="8" r="7" fill={fill} />}
    </svg>
  );
}

/* ---------- Neutral photo placeholders (no real skin images) ---------- */
export function placeholderPhoto(label: string, seed = 0): string {
  const hues = [168, 198, 150, 205];
  const h = hues[seed % hues.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 120'>
  <rect width='160' height='120' fill='hsl(${h} 30% 88%)'/>
  <g fill='hsl(${h} 25% 74%)'>
    <circle cx='${40 + (seed * 13) % 30}' cy='42' r='14'/><circle cx='92' cy='${56 + (seed * 7) % 20}' r='18'/>
    <circle cx='124' cy='34' r='9'/><circle cx='60' cy='82' r='11'/>
  </g>
  <rect x='0' y='96' width='160' height='24' fill='hsl(${h} 25% 30% / .75)'/>
  <text x='80' y='112' font-family='Inter,Arial,sans-serif' font-size='11' fill='white' text-anchor='middle'>${label}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/* ---------- Modal ---------- */
export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <button className="icon-btn modal-close no-print" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ---------- Toasts ---------- */
const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const push = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <CheckCircle2 size={18} aria-hidden="true" />
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/** Day number -> "Month 3 · day 91" or "Week 7 · day 42". */
export function fmtDay(day: number, unit: 'month' | 'week' = 'month'): string {
  return unit === 'week' ? `Week ${Math.floor(day / 7) + 1} · day ${day}` : `Month ${Math.round(day / 30.44)} · day ${day}`;
}
