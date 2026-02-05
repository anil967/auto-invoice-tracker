import "./globals.css";
import GlassLayout from "@/components/Layout/GlassLayout";

export const metadata = {
  title: "InvoiceFlow | Intelligent Processing",
  description: "Next-gen invoice processing with 3D glassmorphic interface",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <GlassLayout>
          {children}
        </GlassLayout>
      </body>
    </html>
  );
}