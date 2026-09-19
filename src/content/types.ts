export type Palette = {
  spine: string;
  paper: string;
  ink: string;
  accent: string;
  darkPaper: string;
  darkInk: string;
  darkAccent: string;
};

export type CaseStudySection = {
  id: string;
  title: string;
  /** Markdown. Rendered by the reading views. */
  body: string;
};

export type CaseStudyVisual = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  sectionId: string;
};

export type CaseStudyPrototype = {
  type: "figma" | "video" | "images";
  url?: string;
  poster?: string;
};

export type CaseStudy = {
  slug: string;
  title: string;
  subtitle: string;
  year: string;
  role: string;
  team: string;
  scope: string;
  /** Short metadata line (bia/farisazhar style), verbatim from the markdown. */
  meta: string;
  /** 2–3 sentences, shown when the book is opened on the shelf. */
  summary: string;
  /** One-line teaser shown on the shelf detail card. */
  teaser: string;
  featured: boolean;
  /** Behance (non-featured) link for spine-only books. */
  externalUrl?: string;
  palette: Palette;
  /** `hasExport` flips to true once the real cover PNG is dropped in /public/images/<slug>/. */
  cover: { image: string; kicker?: string; hasExport?: boolean };
  sections: CaseStudySection[];
  visuals: CaseStudyVisual[];
  prototype?: CaseStudyPrototype;
};

/** Quieter spine-only books that link out to Behance; no case study page. */
export type ExternalBook = {
  slug: string;
  title: string;
  externalUrl: string;
  /** Optional publication year, shown in the hover label. TODO: supply. */
  year?: string;
};
