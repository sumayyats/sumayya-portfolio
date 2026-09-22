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

/** One image in a multi-part figure. */
export type CaseStudyFrame = {
  src: string;
  /** Small label under the image (e.g. "Before" / "After"). */
  label?: string;
  /** Intrinsic size; needed for `shape: "wide"` (natural-ratio) figures. */
  width?: number;
  height?: number;
};

export type CaseStudyVisual = {
  id: string;
  src: string;
  alt: string;
  /** Short label for the figure card (names the artefact). */
  title?: string;
  caption: string;
  sectionId: string;
  /**
   * Intrinsic size of `src`. Set once the export lands; while undefined the
   * figure renders a clearly-marked placeholder.
   */
  width?: number;
  height?: number;
  /** Several images instead of one (`src` is the first). */
  frames?: CaseStudyFrame[];
  /** A screen recording for this figure. */
  video?: {
    src: string;
    poster: string;
    width: number;
    height: number;
    /** Trim the recording's own backdrop, as a % of each side. */
    crop?: { top: number; right: number; bottom: number; left: number };
  };
  /**
   * How the frames are laid out.
   * `phone` (default) crops each to a phone screen; `tablet` to a tablet one;
   * `pairs` stacks before over after with an arrow between; `wide` keeps each
   * image's natural ratio.
   */
  shape?: "phone" | "tablet" | "pairs" | "wide";
};

export type CaseStudyPrototype = {
  type: "figma" | "video" | "images";
  url?: string;
  poster?: string;
  /** Backdrop texture behind the embedded prototype. */
  background?: string;
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
