import "./globals.css";
import Navbar from "@/components/Navbar";
export const metadata = {
  title: "Funhouse",
  description: "Mini game collection",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Navbar />
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
