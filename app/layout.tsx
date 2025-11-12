import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EmploiRapide - Trouvez votre emploi en Côte d'Ivoire",
  description:
    "La plateforme de recherche d'emploi la plus rapide en Côte d'Ivoire. Trouvez votre emploi idéal ou recrutez les meilleurs talents.",
  keywords:
    "emploi, job, recrutement, côte d'ivoire, abidjan, travail, carrière",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
