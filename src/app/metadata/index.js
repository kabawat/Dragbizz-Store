import ThemeScript from "./ThemeScript";

export const siteMetadata = {
  icons: {
    icon: [
      { url: "/_store_assets/favicon.svg", type: "image/svg+xml" },
      { url: "/_store_assets/favicon.ico", type: "image/x-icon", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
    ],
    shortcut: [
      { url: "/_store_assets/favicon.ico", type: "image/x-icon" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: [
      { url: "/_store_assets/apple-touch-icon.png" },
      { url: "/apple-touch-icon.png" },
    ],
  },
  title: "DragBizz - Supercharge Your Business with AI",
  description:
    "The ultimate business management platform with Voice AI. Manage inventory, invoices, expenses, and staff with ease.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
};

export { ThemeScript };
