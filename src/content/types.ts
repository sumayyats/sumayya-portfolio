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

/** One phone screen in a strip figure. */
export type CaseStudyFrame = {
  src: string;
  /** Small label under the screen (e.g. "Before" / "After"). */
  label?: string;
};

export type CaseStudyVisual = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  sectionId: string;
  /**
   * Intrinsic size of `src`. Set once the export lands; while undefined the
   * figure renders a clearly-marked placeholder.
   */
  width?: number;
  height?: number;
  /** A row of phone screens instead of a single image (`src` is the first). */
  frames?: CaseStudyFrame[];
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
  /** Where the work lives (store listing, live site, prototype). Shown on the shelf detail card. */
  link?: { label: string; href: string };
  palette: Palette;
  /** `hasExport` flips to true once the real cover PNG is dropped in /public/images/<slug>/. */
  cover: {
    image: string;
    kicker?: string;
    hasExport?: boolean;
    /** Transparent product mockup for the book's cover page. */
    mockup?: string;
  };
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
