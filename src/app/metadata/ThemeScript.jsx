import { themes } from "@/constants/themes";

const themesJson = JSON.stringify(themes);

const ThemeScript = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const themes = ${themesJson};
              const themeName = localStorage.getItem('dragbizz-theme') || 'default';
              const variant = localStorage.getItem('dragbizz-variant') || 'light';
              const theme = themes[themeName];
              if (theme) {
                const colors = theme.colors[variant] || theme.colors.light;
                const root = document.documentElement;
                root.setAttribute('data-theme', themeName);
                root.setAttribute('data-variant', variant);
                if (variant === 'dark') root.classList.add('dark');
                else root.classList.remove('dark');
                
                const hexToRgb = (hex) => {
                  hex = hex.replace('#', '');
                  if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
                  return parseInt(hex.substring(0, 2), 16) + ' ' + parseInt(hex.substring(2, 4), 16) + ' ' + parseInt(hex.substring(4, 6), 16);
                };

                const mapping = {
                  primary: "--color-primary",
                  secondary: "--color-secondary",
                  background: "--color-bg-primary",
                  surface: "--color-bg-secondary",
                  text: "--color-text-primary",
                  textSecondary: "--color-text-secondary",
                  border: "--color-border-primary",
                };

                Object.entries(mapping).forEach(([jsKey, cssVar]) => {
                  const value = colors[jsKey];
                  if (value) {
                    if (value.startsWith('#')) {
                      root.style.setProperty(cssVar, hexToRgb(value));
                    } else {
                      root.style.setProperty(cssVar, value);
                    }
                  }
                });

                if (colors.surface) {
                  root.style.setProperty("--color-bg-tertiary", hexToRgb(colors.surface));
                }
                if (colors.border) {
                  root.style.setProperty("--color-border-secondary", hexToRgb(colors.border));
                }
              }
            } catch (e) {
              console.error('Theme initialization failed', e);
            }
          })()
        `,
      }}
    />
  );
};

export default ThemeScript;
