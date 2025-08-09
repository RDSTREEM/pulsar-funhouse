import "./globals.css";
import Navbar from "../components/Navbar";
import ClientWrapper from "@/components/ClientWrapper";

export const metadata = {
  title: "Funhouse",
  description: "Mini game collection",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950">
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
