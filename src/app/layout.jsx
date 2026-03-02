import "@/app/globals.css";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import GlobalProfileLoader from "@/components/GlobalProfileLoader";
import ToastInitializer from "@/components/ToastInitializer";
import { SettingsPanel } from "@/components/ui";
import GlobalToastContainer from "@/components/ui/GlobalToastContainer";
import NetworkError from "@/components/ui/NetworkError";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { SocketNotificationProvider } from "@/contexts/SocketNotificationContext";
import { ReduxProvider } from "@/store/provider";
import { LocationProvider } from "./LocationProvider";

export const metadata = {
  title: "DragBizz - Supercharge Your Business with AI",
  description: "The ultimate business management platform with Voice AI. Manage inventory, invoices, expenses, and staff with ease.",
};

import GlobalHotkeys from "@/components/GlobalHotkeys";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="antialiased" suppressHydrationWarning={true}>
        <ReduxProvider>
          <ThemeProvider>
            <LanguageProvider>
              <ToastProvider>
                <SocketProvider>
                  <SocketNotificationProvider>
                    <ErrorBoundary>
                      <ToastInitializer />
                      <GlobalProfileLoader />
                      <LocationProvider>
                        <GlobalHotkeys />
                        {children}
                        <GlobalToastContainer />
                        <NetworkError />
                        <SettingsPanel />
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
