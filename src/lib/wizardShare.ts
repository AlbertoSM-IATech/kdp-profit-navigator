import { GlobalData, EbookData, PaperbackData, SimulatorData } from '@/types/kdp';

export interface SharedWizardState {
  g?: GlobalData;
  e?: EbookData;
  p?: PaperbackData;
  s?: SimulatorData;
}

const HASH_KEY = 'cfg';

// URL-safe base64 (works in browsers for Latin-1 JSON).
const toBase64Url = (str: string): string => {
  const b64 = typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(str))) : '';
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (b64url: string): string => {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '==='.slice((b64.length + 3) % 4);
  return decodeURIComponent(escape(window.atob(padded)));
};

export const encodeWizardState = (state: SharedWizardState): string => {
  try {
    return toBase64Url(JSON.stringify(state));
  } catch {
    return '';
  }
};

export const decodeWizardState = (encoded: string): SharedWizardState | null => {
  try {
    return JSON.parse(fromBase64Url(encoded)) as SharedWizardState;
  } catch {
    return null;
  }
};

export const buildShareUrl = (state: SharedWizardState): string => {
  if (typeof window === 'undefined') return '';
  const encoded = encodeWizardState(state);
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#${HASH_KEY}=${encoded}`;
};

export const readSharedStateFromHash = (): SharedWizardState | null => {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const encoded = params.get(HASH_KEY);
  if (!encoded) return null;
  return decodeWizardState(encoded);
};

export const clearSharedStateHash = () => {
  if (typeof window === 'undefined') return;
  if (!window.location.hash) return;
  const url = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, '', url);
};
