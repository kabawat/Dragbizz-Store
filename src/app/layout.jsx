import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "@/app/globals.css";

import { siteMetadata, ThemeScript } from "@/app/metadata";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import FcmForegroundBridge from "@/components/FcmForegroundBridge";
import GlobalHotkeys from "@/components/GlobalHotkeys";
import GlobalProfileLoader from "@/components/GlobalProfileLoader";
import { SettingsDrawer } from "@/components/ui";
import GlobalToastContainer from "@/components/ui/GlobalToastContainer";
import NetworkError from "@/components/ui/NetworkError";
import { FcmProvider } from "@/contexts/FcmContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { SocketNotificationProvider } from "@/contexts/SocketNotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ReduxProvider } from "@/store/provider";
import { LocationProvider } from "./LocationProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = siteMetadata;

export default async function RootLayout({ children }) {
  const cookieJar = await cookies();
  const sessionHint =
    cookieJar.get("logged_in")?.value === "true" ||
    Boolean(cookieJar.get("rt")?.value || cookieJar.get("at")?.value);
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <ThemeScript />
        <link rel="icon" type="image/svg+xml" href="/_store_assets/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/_store_assets/favicon.ico" />
        <link rel="shortcut icon" href="/_store_assets/favicon.ico" />
        <link rel="apple-touch-icon" href="/_store_assets/apple-touch-icon.png" />
      </head>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning={true}
      >
        <ReduxProvider>
          <ThemeProvider>
            <LanguageProvider>
              <ToastProvider>
                <SocketProvider>
                  <FcmProvider>
                    <SocketNotificationProvider>
                      <FcmForegroundBridge />
                      <ErrorBoundary>
                        <GlobalProfileLoader initialSessionHint={sessionHint} />
                        <LocationProvider>
                          <GlobalHotkeys />
                          {children}
                          <GlobalToastContainer />
                          <NetworkError />
                          <SettingsDrawer />
                        </LocationProvider>
                      </ErrorBoundary>
                    </SocketNotificationProvider>
                  </FcmProvider>
                </SocketProvider>
              </ToastProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
