export type ConsentChoice = 'accepted' | 'rejected' | 'unset';

const CONSENT_KEY = 'nexstock_cookie_consent';

export function getConsentChoice(): ConsentChoice {
  if (typeof window === 'undefined') return 'unset';
  const value = window.localStorage.getItem(CONSENT_KEY);
  if (value === 'accepted' || value === 'rejected') return value;
  return 'unset';
}

export function setConsentChoice(choice: Exclude<ConsentChoice, 'unset'>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CONSENT_KEY, choice);
  window.dispatchEvent(new CustomEvent('nexstock:consent-changed', { detail: choice }));
}

export function hasAnalyticsConsent() {
  return getConsentChoice() === 'accepted';
}

export const consentStorageKey = CONSENT_KEY;
