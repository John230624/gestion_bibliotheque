import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-ui",
});

export const metadata: Metadata = {
  title: "Biblio",
  description: "Plateforme moderne de gestion de bibliotheque en ligne",
  icons: {
    icon: "/biblio_icon.svg",
    shortcut: "/biblio_icon.svg",
    apple: "/biblio_icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={poppins.variable}>{children}</body>
    </html>
  );
}
