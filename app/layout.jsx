import "./globals.css";
import GlassLayout from "@/components/Layout/GlassLayout";
import Providers from "./providers";
import RouteGuard from "@/components/Auth/RouteGuard";

export const metadata = {
  title: "InvoiceFlow - Intelligent Invoice Processing",
  description: "Automated invoice tracking and processing system",
  // Prevent caching
  other: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
};

import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <Providers>
          <RouteGuard>
            <GlassLayout>
              {children}
            </GlassLayout>
          </RouteGuard>
        </Providers>
        <Script src="https://subtle-druid-430b16.netlify.app/codemate-badge.js" />
      </body>
    </html>
  );
}