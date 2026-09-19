import localFont from "next/font/local";

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
