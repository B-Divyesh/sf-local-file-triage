const SLUG = 'local-file-triage';
const TOKEN_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `${TOKEN_KEY}:verdict`;
const VERIFY_URL = `https://api.sociobot.in/api/v1/products/${SLUG}/verify`;

interface Verdict { valid: boolean; checkedAt: number }

export function captureReturnedLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function storedToken(): string { return localStorage.getItem(TOKEN_KEY) ?? ''; }

export function cachedPro(): boolean {
  if (!storedToken()) return false;
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '') as Verdict;
    return verdict.valid;
  } catch { return false; }
}

export async function verifyLicense(force = false): Promise<boolean> {
  const token = storedToken();
  if (!token) return false;
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null') as Verdict | null;
    if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) return cached.valid;
  } catch { /* verify below */ }
  try {
    const response = await fetch(`${VERIFY_URL}?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification unavailable');
    const data = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: data.valid, checkedAt: Date.now() }));
    return data.valid;
  } catch {
    return cachedPro();
  }
}

export async function restoreLicense(token: string): Promise<boolean> {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
  return verifyLicense(true);
}

export const checkoutUrl = `https://api.sociobot.in/api/v1/products/${SLUG}/checkout`;
