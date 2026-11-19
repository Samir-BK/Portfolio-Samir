'use client';

import { useSyncExternalStore } from 'react';
import { Icon } from '@/components/ui/icon';
import {
  getThemePreference,
  setTheme,
  subscribeToTheme,
  type ThemePreference,
} from '@/lib/theme';

export function ThemeSwitcher() {
  const preference = useSyncExternalStore(
    subscribeToTheme,
    getThemePreference,
    () => 'system' as const,
  );

  return (
    <label className="theme-control">
      <Icon name="sun" className="theme-sun" />
      <Icon name="moon" className="theme-moon" />
      <select
        aria-label="Color theme"
        value={preference}
        onChange={(event) =>
          setTheme(event.currentTarget.value as ThemePreference)
        }
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
