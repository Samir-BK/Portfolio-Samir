const themeKey = 'portfolio-theme';
const themeChangeEvent = 'portfolio-theme-change';

type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

export const initializeTheme = `try{var theme=localStorage.getItem(${JSON.stringify(themeKey)});if(theme==="light"||theme==="dark"){document.documentElement.dataset.theme=theme}}catch{}`;

export function getThemePreference(): ThemePreference {
  const theme = document.documentElement.dataset.theme;
  return theme === 'light' || theme === 'dark' ? theme : 'system';
}

export function setTheme(preference: ThemePreference) {
  if (preference === 'system') {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = preference;
  }
  try {
    if (preference === 'system') localStorage.removeItem(themeKey);
    else localStorage.setItem(themeKey, preference);
  } catch {
    // Theme changes still apply when storage is unavailable.
  }
  window.dispatchEvent(new Event(themeChangeEvent));
}

export function subscribeToTheme(callback: () => void) {
  function syncPreference(event: StorageEvent) {
    if (event.key !== themeKey && event.key !== null) return;
    if (event.newValue === 'light' || event.newValue === 'dark') {
      document.documentElement.dataset.theme = event.newValue;
    } else {
      delete document.documentElement.dataset.theme;
    }
    callback();
  }

  window.addEventListener(themeChangeEvent, callback);
  window.addEventListener('storage', syncPreference);
  return () => {
    window.removeEventListener(themeChangeEvent, callback);
    window.removeEventListener('storage', syncPreference);
  };
}
