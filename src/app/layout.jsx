import "@/app/globals.scss";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import GlobalProfileLoader from "@/components/GlobalProfileLoader";
import NetworkErrorInitializer from "@/components/NetworkErrorInitializer";
import NetworkErrorWrapper from "@/components/NetworkErrorWrapper";
import ToastInitializer from "@/components/ToastInitializer";
import { SettingsPanel } from "@/components/ui";
import GlobalToastContainer from "@/components/ui/GlobalToastContainer";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NetworkErrorProvider } from "@/contexts/NetworkErrorContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ReduxProvider } from "@/store/provider";
import { LocationProvider } from "./LocationProvider";

export const metadata = {
  title: "DragBizz - Supercharge Your Business with AI",
  description: "The ultimate business management platform with Voice AI. Manage inventory, invoices, expenses, and staff with ease.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="antialiased" suppressHydrationWarning={true}>
        <ReduxProvider>
          <ThemeProvider>
            <LanguageProvider>
              <ToastProvider>
                <NetworkErrorProvider>
                  <ErrorBoundary>
                    <ToastInitializer />
                    <NetworkErrorInitializer />
                    <GlobalProfileLoader />
                    <LocationProvider>
                      {children}
                      <GlobalToastContainer />
                      <NetworkErrorWrapper />
                      <SettingsPanel />
                    </LocationProvider>
                  </ErrorBoundary>
                </NetworkErrorProvider>
              </ToastProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
