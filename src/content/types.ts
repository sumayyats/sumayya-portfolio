export type Palette = {
  spine: string;
  paper: string;
  ink: string;
  accent: string;
  /**
   * The tick at the head of the spine. Defaults to `accent`; set it when the
   * accent sits too close to the cloth colour to be seen against it.
   */
  spineTick?: string;
  darkPaper: string;
  darkInk: string;
  darkAccent: string;
};

export type CaseStudySection = {
  id: string;
  title: string;
  /** Markdown. Rendered by the reading views. */
  body: string;
  /**
   * What sits beside the prose. `screenshots` only in the overview; `motion`
   * where a motion stage carries the section; `none` is text only. Every
   * other figure lives on the Artifacts page.
   */
  media: "screenshots" | "motion" | "none";
  /** The section's first motion stage (more can follow; see `MotionStageSpec.after`). */
  motionStageId?: string;
};

/**
 * One animated scene. The scene itself is code (components/stages/); this is
 * what the page needs to place it and to describe it to screen readers.
 */
export type MotionStageSpec = {
  /** e.g. `asta-process`; also the scene's registry key. */
  id: string;
  sectionId: string;
  /**
   * Where the stage breaks into the prose: after the paragraph that starts
   * with this text. Defaults to the section's opening paragraph.
   */
  after?: string;
  /** Straight under the heading instead (for sections that open on a table). */
  atTop?: boolean;
  /** Short caption under the stage. */
  title: string;
  /** Describes the still frame. */
  stillAlt: string;
  /** One sentence on what the animation shows. */
  summary: string;
  durationMs: number;
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
    /** Off for heavy desktop captures: they wait for a click before loading. */
    autoplay?: boolean;
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
  /** What the role covered, revealed under the role line on hover or tap. */
  roleDetail?: string[];
  team: string;
  scope: string;
  /** What the scope covered, revealed the same way as `roleDetail`. */
  scopeDetail?: string[];
  /** Short metadata line (bia/farisazhar style), verbatim from the markdown. */
  meta: string;
  /** 2–3 sentences, shown when the book is opened on the shelf. */
  summary: string;
  /** One-line teaser shown on the shelf detail card. */
  teaser: string;
  featured: boolean;
  /** Behance (non-featured) link for spine-only books. */
  externalUrl?: string;
  /** The product's own logo, and a white knock-out of it for the book spine. */
  logo?: string;
  mark?: string;
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
  /**
   * Figures. Those with `sectionId: "overview"` are the only screenshots
   * shown in the reading flow; the rest are listed on the Artifacts page,
   * grouped by the section they document.
   */
  visuals: CaseStudyVisual[];
  motionStages: MotionStageSpec[];
  prototype?: CaseStudyPrototype;
};

/** Quieter spine-only books that link out to Behance; no case study page. */
export type ExternalBook = {
  slug: string;
  title: string;
  externalUrl: string;
  /** Publication year, shown in the hover label. */
  year?: string;
  /** Where it lives, when it isn't Behance — shown on hover. */
  note?: string;
  /** Cover image from the publication, previewed on hover. */
  preview?: string;
};
