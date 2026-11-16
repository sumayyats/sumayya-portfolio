import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { dico, plexMono } from "@/lib/fonts";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import { SoundProvider } from "@/lib/sound";
import { RoomNav } from "@/components/RoomNav";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sumayyacrafts.co.uk"),
  title: "sumayya's portfolio",
  description:
    "A shelf of UX case studies. Browse the books, open one, and read.",
  // TODO: Open Graph image. Add src/app/opengraph-image.png (1200x630) and Next picks it up.
  openGraph: { title: "sumayya's portfolio", type: "website", url: "/" },
  twitter: { card: "summary_large_image" },
  appleWebApp: { capable: true, title: "sumayya's portfolio", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#12140f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dico.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-paper focus:px-3 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <SoundProvider>{children}</SoundProvider>
        </ThemeProvider>
        <RoomNav />
      </body>
    </html>
  );
}
