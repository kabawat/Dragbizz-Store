import "@/app/globals.css";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import GlobalProfileLoader from "@/components/GlobalProfileLoader";
import { SettingsDrawer } from "@/components/ui";
import GlobalToastContainer from "@/components/ui/GlobalToastContainer";
import NetworkError from "@/components/ui/NetworkError";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { SocketNotificationProvider } from "@/contexts/SocketNotificationContext";
import { ReduxProvider } from "@/store/provider";
import { LocationProvider } from "./LocationProvider";

import { siteMetadata, ThemeScript } from "@/app/metadata";
import GlobalHotkeys from "@/components/GlobalHotkeys";

export const metadata = siteMetadata;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <ThemeScript />

      </head>
      <body className="antialiased" suppressHydrationWarning={true}>
        <ReduxProvider>
          <ThemeProvider>
            <LanguageProvider>
              <ToastProvider>
                <SocketProvider>
                  <SocketNotificationProvider>
                    <ErrorBoundary>
                      <GlobalProfileLoader />
                      <LocationProvider>
                        <GlobalHotkeys />
                        {children}
                        <GlobalToastContainer />
                        <NetworkError />
                        <SettingsDrawer />
                      </LocationProvider>
                    </ErrorBoundary>
                  </SocketNotificationProvider>
                </SocketProvider>
              </ToastProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
