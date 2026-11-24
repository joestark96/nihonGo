import pkg from '../../package.json';

export const CURRENT_APP_VERSION: string = pkg.version;
const REMOTE_PACKAGE_JSON_URL = 'https://raw.githubusercontent.com/joestark96/nihonGo/main/package.json';

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  downloadUrl: string;
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

export async function checkForAppUpdate(): Promise<UpdateCheckResult> {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${REMOTE_PACKAGE_JSON_URL}?t=${Date.now()}`, {
      cache: 'no-store',
      signal: controller.signal
    });
    window.clearTimeout(timer);

    if (!res.ok) {
      return {
        hasUpdate: false,
        currentVersion: CURRENT_APP_VERSION,
        latestVersion: CURRENT_APP_VERSION,
        downloadUrl: getApkDownloadUrl(CURRENT_APP_VERSION),
        error: `HTTP ${res.status}`
      };
    }

    const remotePkg = await res.json();
    const latestVersion = typeof remotePkg?.version === 'string' ? remotePkg.version : CURRENT_APP_VERSION;
    const hasUpdate = compareSemver(latestVersion, CURRENT_APP_VERSION) > 0;

    return {
      hasUpdate,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion,
      downloadUrl: getApkDownloadUrl(latestVersion)
    };
  } catch (err) {
    return {
      hasUpdate: false,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion: CURRENT_APP_VERSION,
      downloadUrl: getApkDownloadUrl(CURRENT_APP_VERSION),
      error: err instanceof Error ? err.message : 'Error de red'
    };
  }
}
