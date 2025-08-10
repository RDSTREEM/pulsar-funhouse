import "./globals.css";
// Removed unused imports
import ClientWrapper from "@/components/ClientWrapper";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";

export const metadata = {
  title: "Funhouse",
  description: "Mini game collection",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950">
        <LayoutClientWrapper>
          <ClientWrapper>{children}</ClientWrapper>
        </LayoutClientWrapper>
      </body>
    </html>
  );
}
