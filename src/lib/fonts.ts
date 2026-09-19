import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";

/** IBM Plex Mono — used for buttons. */
export const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});

/**
 * Dico — display / titles. Files live in /public/fonts.
 * Fallback stack (applied via CSS var / Tailwind theme): Libre Baskerville, Georgia, serif.
 * The site is designed to look correct before the font files exist.
 */
export const dico = localFont({
  src: [
    { path: "../../public/fonts/dico.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/dico.ttf", weight: "400", style: "normal" },
  ],
  variable: "--font-dico",
  display: "swap",
  fallback: ["Libre Baskerville", "Georgia", "serif"],
});
