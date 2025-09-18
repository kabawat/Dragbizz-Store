"use client"  
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [currentVariant, setCurrentVariant] = useState('light');

  // Available themes with their configurations (10 total)
  const themes = {
    default: {
      name: 'Default',
      description: 'Clean and professional',
      colors: {
        light: {
          primary: '#3b82f6',
          secondary: '#6b7280',
          background: '#ffffff',
          surface: '#f9fafb',
          text: '#111827',
          textSecondary: '#4b5563',
          border: '#e5e7eb'
        },
        dark: {
          primary: '#3b82f6',
          secondary: '#6b7280',
          background: '#111827',
          surface: '#1f2937',
          text: '#f9fafb',
          textSecondary: '#d1d5db',
          border: '#374151'
        }
      }
    },
    ocean: {
      name: 'Ocean',
      description: 'Calm and refreshing',
      colors: {
        light: {
          primary: '#0ea5e9',
          secondary: '#06b6d4',
          background: '#f0f9ff',
          surface: '#e0f2fe',
          text: '#075985',
          textSecondary: '#0c4a6e',
          border: '#bae6fd'
        },
        dark: {
          primary: '#0ea5e9',
          secondary: '#06b6d4',
          background: '#111827',
          surface: '#1f2937',
          text: '#f9fafb',
          textSecondary: '#d1d5db',
          border: '#374151'
        }
      }
    },
    forest: {
      name: 'Forest',
      description: 'Natural and organic',
      colors: {
        light: {
          primary: '#22c55e',
          secondary: '#10b981',
          background: '#f0fdf4',
          surface: '#dcfce7',
          text: '#14532d',
          textSecondary: '#166534',
          border: '#bbf7d0'
        },
        dark: {
          primary: '#22c55e',
          secondary: '#10b981',
          background: '#111827',
          surface: '#1f2937',
          text: '#f9fafb',
          textSecondary: '#d1d5db',
          border: '#374151'
        }
      }
    },
    sunset: {
      name: 'Sunset',
      description: 'Warm and vibrant',
      colors: {
        light: {
          primary: '#fb923c',
          secondary: '#f97316',
          background: '#fff7ed',
          surface: '#fed7aa',
          text: '#9a3412',
          textSecondary: '#c2410c',
          border: '#fdba74'
        },
        dark: {
          primary: '#fb923c',
          secondary: '#f97316',
          background: '#111827',
          surface: '#1f2937',
          text: '#f9fafb',
          textSecondary: '#d1d5db',
          border: '#374151'
        }
      }
    },
    rose: {
      name: 'Rose',
      description: 'Soft and elegant',
      colors: {
        light: {
          primary: '#f43f5e',
          secondary: '#fb7185',
          background: '#fff1f2',
          surface: '#ffe4e6',
          text: '#881337',
          textSecondary: '#be123c',
          border: '#fecdd3'
        },
        dark: {
          primary: '#f43f5e',
          secondary: '#fb7185',
          background: '#111827',
          surface: '#1f2937',
          text: '#f9fafb',
          textSecondary: '#d1d5db',
          border: '#374151'
        }
      }
    },
    violet: {
      name: 'Violet',
      description: 'Bold and modern',
      colors: {
        light: {
          primary: '#8b5cf6',
          secondary: '#7c3aed',
          background: '#f5f3ff',
          surface: '#ede9fe',
          text: '#4c1d95',
          textSecondary: '#6d28d9',
          border: '#ddd6fe'
        },
        dark: {
          primary: '#8b5cf6',
          secondary: '#7c3aed',
          background: '#111827',
          surface: '#1f2937',
          text: '#f9fafb',
          textSecondary: '#d1d5db',
          border: '#374151'
        }
      }
    },
    amber: {
      name: 'Amber',
      description: 'Warm and friendly',
      colors: {
        light: {
          primary: '#f59e0b',
          secondary: '#fbbf24',
          background: '#fffbeb',
          surface: '#fef3c7',
          text: '#78350f',
          textSecondary: '#92400e',
          border: '#fde68a'
        },
        dark: {
          primary: '#f59e0b',
          secondary: '#fbbf24',
          background: '#111827',
          surface: '#1f2937',
          text: '#f9fafb',
          textSecondary: '#d1d5db',
          border: '#374151'
        }
      }
    },
    teal: {
      name: 'Teal',
      description: 'Fresh and crisp',
      colors: {
        light: {
          primary: '#14b8a6',
          secondary: '#0f766e',
          background: '#f0fdfa',
          surface: '#ccfbf1',
          text: '#134e4a',
          textSecondary: '#115e59',
          border: '#99f6e4'
        },
        dark: {
          primary: '#14b8a6',
          secondary: '#0f766e',
          background: '#111827',
          surface: '#1f2937',
          text: '#f9fafb',
          textSecondary: '#d1d5db',
          border: '#374151'
        }
      }
    },
    indigo: {
      name: 'Indigo',
      description: 'Trustworthy and calm',
      colors: {
        light: {
          primary: '#6366f1',
          secondary: '#4f46e5',
          background: '#eef2ff',
          surface: '#e0e7ff',
          text: '#312e81',
          textSecondary: '#4338ca',
          border: '#c7d2fe'
        },
        dark: {
          primary: '#6366f1',
          secondary: '#4f46e5',
          background: '#111827',
          surface: '#1f2937',
          text: '#f9fafb',
          textSecondary: '#d1d5db',
          border: '#374151'
        }
      }
    },
    slate: {
      name: 'Slate',
      description: 'Neutral and balanced',
      colors: {
        light: {
          primary: '#64748b',
          secondary: '#475569',
          background: '#f8fafc',
          surface: '#f1f5f9',
          text: '#0f172a',
          textSecondary: '#334155',
          border: '#e2e8f0'
        },
        dark: {
          primary: '#64748b',
          secondary: '#475569',
          background: '#111827',
          surface: '#1f2937',
          text: '#f9fafb',
          textSecondary: '#d1d5db',
          border: '#374151'
        }
      }
    }
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('dragbizz-theme');
    const savedVariant = localStorage.getItem('dragbizz-variant');
    
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
    
    if (savedVariant && ['light', 'dark'].includes(savedVariant)) {
      setCurrentVariant(savedVariant);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', currentTheme);
    root.setAttribute('data-variant', currentVariant);
    
    // Save to localStorage
    localStorage.setItem('dragbizz-theme', currentTheme);
    localStorage.setItem('dragbizz-variant', currentVariant);
  }, [currentTheme, currentVariant]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const changeVariant = (variant) => {
    if (['light', 'dark'].includes(variant)) {
      setCurrentVariant(variant);
    }
  };

  const toggleVariant = () => {
    setCurrentVariant(currentVariant === 'light' ? 'dark' : 'light');
  };

  const getCurrentThemeConfig = () => {
    return themes[currentTheme]?.colors[currentVariant] || themes.default.colors.light;
  };

  const value = {
    currentTheme,
    currentVariant,
    themes,
    changeTheme,
    changeVariant,
    toggleVariant,
    getCurrentThemeConfig,
    themeConfig: getCurrentThemeConfig()
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
