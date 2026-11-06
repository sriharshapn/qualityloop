import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light' | 'slate' | 'cobalt';

export interface ThemeOption {
  id: ThemeMode;
  name: string;
  description: string;
  colorSwatch: string;
  accentColor: string;
  isDark: boolean;
  iconName: 'Moon' | 'Sun' | 'Layers' | 'Zap';
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'dark',
    name: 'Normal Black',
    description: 'Deep midnight OLED black for maximum contrast',
    colorSwatch: '#090D16',
    accentColor: '#6366F1',
    isDark: true,
    iconName: 'Moon'
  },
  {
    id: 'light',
    name: 'Daylight Crisp',
    description: 'Clean high-readability daylight manufacturing theme',
    colorSwatch: '#F8FAFC',
    accentColor: '#2563EB',
    isDark: false,
    iconName: 'Sun'
  },
  {
    id: 'slate',
    name: 'Titanium Slate',
    description: 'Industrial charcoal and steel for engineering monitors',
    colorSwatch: '#0F172A',
    accentColor: '#38BDF8',
    isDark: true,
    iconName: 'Layers'
  },
  {
    id: 'cobalt',
    name: 'Cyber Cobalt',
    description: 'High-tech deep obsidian and electric blue accents',
    colorSwatch: '#070C1E',
    accentColor: '#60A5FA',
    isDark: true,
    iconName: 'Zap'
  }
];

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  options: ThemeOption[];
  currentOption: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  options: THEME_OPTIONS,
  currentOption: THEME_OPTIONS[0]
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('ql-theme') as ThemeMode;
      if (saved && ['dark', 'light', 'slate', 'cobalt'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'dark'; // Normal Black default
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('ql-theme', newTheme);
    } catch {}
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    // Update meta color-scheme
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? 'light' : 'dark');
    }

    if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  const currentOption = THEME_OPTIONS.find((o) => o.id === theme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, options: THEME_OPTIONS, currentOption }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
