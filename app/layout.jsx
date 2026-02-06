import "./globals.css";
import GlassLayout from "@/components/Layout/GlassLayout";
import Providers from "./providers";
import RouteGuard from "@/components/Auth/RouteGuard";

export const metadata = {
  title: "InvoiceFlow | Intelligent Processing",
  description: "Next-gen invoice processing with 3D glassmorphic interface",
};

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
      </body>
    </html>
  );
}