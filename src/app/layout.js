import Layout from "@/components/layout/Layout";
import "./globals.css";
import ToasterProvider from "@/components/providers/ToasterProvider";

export const metadata = {
  title: "Astro",
  description: "Astro",
};

// Sidebar Component

// Main Content Component

// Main Layout Component
export default function RootLayout({ children }) {

;

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Layout>{children}</Layout>
        <ToasterProvider />
      </body>
    </html>
  );
}
