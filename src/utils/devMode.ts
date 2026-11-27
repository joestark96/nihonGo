const DEV_MODE_KEY = 'nihongo_dev_mode';
const DEV_UNLOCK_ALL_KEY = 'nihongo_dev_unlock_all';

export function isDevModeEnabled(): boolean {
  try {
    return localStorage.getItem(DEV_MODE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setDevModeEnabled(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem(DEV_MODE_KEY, '1');
      localStorage.setItem(DEV_UNLOCK_ALL_KEY, '1');
    } else {
      localStorage.removeItem(DEV_MODE_KEY);
      localStorage.removeItem(DEV_UNLOCK_ALL_KEY);
    }
    window.dispatchEvent(new CustomEvent('nihongo-dev-mode-changed'));
  } catch {
    // ignore
  }
}

export function isDevUnlockAllEnabled(): boolean {
  try {
    return isDevModeEnabled() && localStorage.getItem(DEV_UNLOCK_ALL_KEY) === '1';
  } catch {
    return false;
  }
}

export function setDevUnlockAllEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(DEV_UNLOCK_ALL_KEY, enabled ? '1' : '0');
    window.dispatchEvent(new CustomEvent('nihongo-dev-mode-changed'));
  } catch {
    // ignore
  }
}
