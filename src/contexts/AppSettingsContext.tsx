import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { secureStorage, resetSessionTimeout } from '@/lib/crypto';

export interface NavButtonConfig {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
}

export interface AppSettings {
  appName: string;
  appSubtitle: string;
  logoUrl: string | null;
  faviconUrl: string | null;

  // Theme tokens (HSL strings: "H S% L%")
  backgroundColor: string;
  foregroundColor: string;
  cardColor: string;
  borderColor: string;
  primaryColor: string;
  secondaryColor: string;
  mutedColor: string;
  accentColor: string;
  destructiveColor: string;

  isDarkMode: boolean;
  navButtons: NavButtonConfig[];
}

// Light mode default settings
const lightModeColors = {
  backgroundColor: '0 0% 97%',
  foregroundColor: '220 20% 15%',
  cardColor: '0 0% 100%',
  borderColor: '220 10% 82%',
  primaryColor: '160 70% 36%',
  secondaryColor: '220 10% 92%',
  mutedColor: '220 10% 92%',
  accentColor: '199 80% 45%',
  destructiveColor: '0 72% 51%',
};

// Dark mode default settings
const darkModeColors = {
  backgroundColor: '240 10% 4%',
  foregroundColor: '0 0% 100%',
  cardColor: '240 6% 7%',
  borderColor: '240 4% 16%',
  primaryColor: '160 84% 39%',
  secondaryColor: '240 5% 12%',
  mutedColor: '240 5% 12%',
  accentColor: '199 89% 48%',
  destructiveColor: '0 62% 31%',
};

const defaultSettings: AppSettings = {
  appName: 'MCH Billing',
  appSubtitle: 'System',
  logoUrl: null,
  faviconUrl: null,
  ...darkModeColors,
  isDarkMode: true,
  navButtons: [
    { id: 'home', label: 'HOME', icon: 'Home', visible: true },
    { id: 'outpatient', label: 'OUTPATIENT', icon: 'UserCheck', visible: true },
    { id: 'inpatient', label: 'INPATIENT', icon: 'BedDouble', visible: true },
    { id: 'pricing', label: 'PRICING', icon: 'Tags', visible: true },
    { id: 'patients', label: 'PATIENTS', icon: 'Users', visible: true },
  ],
};

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateNavButton: (id: string, updates: Partial<NavButtonConfig>) => void;
  resetSettings: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | null>(null);

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
};

export const AppSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load encrypted settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await secureStorage.getItem('appSettings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch {
        // Use defaults if loading fails
      } finally {
        setIsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  // Listen for settings updates from parent window (for iframe preview sync)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify the message is for settings sync
      if (event.data?.type === 'SETTINGS_SYNC' && event.data?.settings) {
        setSettings(prev => ({ ...prev, ...event.data.settings }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Save encrypted settings when changed
  useEffect(() => {
    if (!isLoaded) return;
    
    const saveSettings = async () => {
      try {
        await secureStorage.setItem('appSettings', JSON.stringify(settings));
        // Reset session timeout on activity
        resetSessionTimeout();
      } catch {
        // Silent fail - settings will be lost on refresh
      }
    };
    saveSettings();
    
    // Apply dark/light mode FIRST - this switches between :root and .dark CSS variables
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Only apply custom CSS variables if user has customized them
    // Otherwise, let the CSS :root and .dark classes handle theming
    const root = document.documentElement;
    const currentModeColors = settings.isDarkMode ? darkModeColors : lightModeColors;

    const applyVar = (cssVar: string, value: string, defaultValue: string) => {
      if (value !== defaultValue) root.style.setProperty(cssVar, value);
      else root.style.removeProperty(cssVar);
    };

    // Core shadcn/tailwind tokens
    applyVar('--background', settings.backgroundColor, currentModeColors.backgroundColor);
    applyVar('--foreground', settings.foregroundColor, currentModeColors.foregroundColor);
    applyVar('--card', settings.cardColor, currentModeColors.cardColor);
    applyVar('--border', settings.borderColor, currentModeColors.borderColor);

    applyVar('--primary', settings.primaryColor, currentModeColors.primaryColor);
    applyVar('--ring', settings.primaryColor, currentModeColors.primaryColor);

    applyVar('--secondary', settings.secondaryColor, currentModeColors.secondaryColor);
    applyVar('--muted', settings.mutedColor, currentModeColors.mutedColor);

    // Make "Accent" actually drive Tailwind's `accent` token (and keep legacy `accent-blue` usage working)
    applyVar('--accent', settings.accentColor, currentModeColors.accentColor);
    applyVar('--accent-blue', settings.accentColor, currentModeColors.accentColor);

    applyVar('--destructive', settings.destructiveColor, currentModeColors.destructiveColor);

    // App-specific tokens used throughout the UI
    applyVar('--surface', settings.cardColor, currentModeColors.cardColor);
    applyVar('--surface-light', settings.secondaryColor, currentModeColors.secondaryColor);
    applyVar('--nav-bg', settings.backgroundColor, currentModeColors.backgroundColor);
    
    // Update favicon if set
    if (settings.faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = settings.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [settings, isLoaded]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateNavButton = (id: string, updates: Partial<NavButtonConfig>) => {
    setSettings(prev => ({
      ...prev,
      navButtons: prev.navButtons.map(btn => 
        btn.id === id ? { ...btn, ...updates } : btn
      ),
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('appSettings');
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, updateNavButton, resetSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
