import pkg from '../../package.json';

export const CURRENT_APP_VERSION: string = pkg.version;
const GITHUB_TAGS_URL = 'https://api.github.com/repos/joestark96/nihonGo/tags?per_page=5';
const REMOTE_PACKAGE_JSON_URL = 'https://raw.githubusercontent.com/joestark96/nihonGo/main/package.json';

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  downloadUrl: string;
  checkedAt?: string;
  error?: string;
}

function compareSemver(a: string, b: string): number {
  const pa = a.replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);
  const pb = b.replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

export function getApkDownloadUrl(version: string = CURRENT_APP_VERSION): string {
  const clean = version.replace(/^v/i, '');
  return `https://github.com/joestark96/nihonGo/raw/main/releases/nihongo-v${clean}.apk`;
}

async function fetchWithTimeout(url: string, timeoutMs: number = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      cache: 'no-store',
      signal: controller.signal
    });
  } finally {
    window.clearTimeout(timer);
  }
}

export async function checkForAppUpdate(): Promise<UpdateCheckResult> {
  const checkedAt = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // 1. Primary source: GitHub Tags API (instant, no 5-min raw CDN cache)
  try {
    const res = await fetchWithTimeout(`${GITHUB_TAGS_URL}&t=${Date.now()}`, 8000);
    if (res.ok) {
      const tags: Array<{ name?: string }> = await res.json();
      const semverTags = (Array.isArray(tags) ? tags : [])
        .map(t => (t?.name || '').replace(/^v/i, '').trim())
        .filter(v => /^\d+\.\d+\.\d+$/.test(v));

      if (semverTags.length > 0) {
        semverTags.sort((a, b) => compareSemver(b, a));
        const latestVersion = semverTags[0];
        return {
          hasUpdate: compareSemver(latestVersion, CURRENT_APP_VERSION) > 0,
          currentVersion: CURRENT_APP_VERSION,
          latestVersion,
          downloadUrl: getApkDownloadUrl(latestVersion),
          checkedAt
        };
      }
    }
  } catch {
    // Fallback to raw package.json
  }

  // 2. Fallback: raw package.json
  try {
    const res = await fetchWithTimeout(`${REMOTE_PACKAGE_JSON_URL}?t=${Date.now()}`, 8000);
    if (!res.ok) {
      return {
        hasUpdate: false,
        currentVersion: CURRENT_APP_VERSION,
        latestVersion: CURRENT_APP_VERSION,
        downloadUrl: getApkDownloadUrl(CURRENT_APP_VERSION),
        checkedAt,
        error: `HTTP ${res.status}`
      };
    }

    const remotePkg = await res.json();
    const latestVersion = typeof remotePkg?.version === 'string' ? remotePkg.version : CURRENT_APP_VERSION;
    return {
      hasUpdate: compareSemver(latestVersion, CURRENT_APP_VERSION) > 0,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion,
      downloadUrl: getApkDownloadUrl(latestVersion),
      checkedAt
    };
  } catch (err) {
    return {
      hasUpdate: false,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion: CURRENT_APP_VERSION,
      downloadUrl: getApkDownloadUrl(CURRENT_APP_VERSION),
      checkedAt,
      error: err instanceof Error ? err.message : 'Error de red'
    };
  }
}
