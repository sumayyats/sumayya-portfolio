# Sumayya's portfolio

The UX/UI portfolio of Sumayya Tsabitah, a designer working where design meets
psychology. It's built as a small building you walk through: a lobby, a work
room with a bookshelf of case studies, and a room of my own.

**Live site:** https://sumayyalibrary.netlify.app

## What's inside

- **The Work Room.** A shelf of books, one per project, drawn as CSS 3D
  objects. Drag, scroll or use the arrow keys to browse; pick a book up to see
  what it's about.
- **The reader.** Each case study reads two ways: as a book you flip page by
  page, or as one scrolling page with a contents rail that follows you.
- **Motion stages.** In place of most screenshots, short scenes built from the
  real Figma screens show the product working. Each one plays while you hover.
- **Flip cards.** Key points sit on small book covers that tilt toward the
  cursor and open on the spine to show the detail.
- **Sound.** Page turns and the paper pickup are my own recordings, off until
  you switch sound on.
- **The library scene** (`/library`). An illustrated room with a guestbook you
  can leave a note in.

Three case studies are written up in full here: **ASTA** (a school's online
registration), **Kyros by Binapani** (a visual scheduling app for autistic
children) and **Gut-Skin** (a companion app for skin and gut health). The
quieter books on the shelf link out to Behance and Medium.

Everything respects `prefers-reduced-motion`, works with a keyboard, and has a
light and dark theme.

## Built with

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion · Web Animations API · Netlify (hosting, forms and functions)

No component library. The 3D shelf is plain CSS transforms, and the
page-turning engine is vendored in `src/vendor/`.

## Running it locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

The guestbook reads earlier notes through a Netlify function, which needs a
`GUESTBOOK_TOKEN` environment variable. Without it the site runs fine and the
guestbook simply starts empty. Keys are set in Netlify's environment
variables and are never committed; `.env*` files are git-ignored.

## Where things live

| Path | What it is |
| --- | --- |
| `src/app/` | Routes: the lobby (`/`), the Work Room (`/works`), Sumayya's Room (`/about`) and each case study (`/case/[slug]`). |
| `src/content/case-studies.ts` | Every case study: copy, palette, figures, motion stages, links. The only place content lives. |
| `src/content/types.ts` | The shape of a case study, documented field by field. |
| `src/components/Shelf.tsx` · `BookSpine.tsx` · `Book3D.tsx` | The shelf, one book as a CSS 3D cuboid, and its hover preview. |
| `src/components/BookCover.tsx` | The jacket, used on the shelf, the detail card and the book's first page. |
| `src/components/reader/` | The reader: `ReaderFlip` (page-turning), `ReaderScroll` (scrolling article), `Figure`, `paginate`. |
| `src/components/stages/` | Motion stages: `MotionStage` (hover-to-play card), `timeline.ts` (the animation engine) and `scenes/`. |
| `src/components/FlipCards.tsx` | Bullet lists as flip cards. |
| `src/lib/` | Theme, sound, fonts and the scroll reveal. |
| `netlify/functions/` | Server-side functions (the guestbook). |
| `public/library/` | The standalone library scene. |
| `public/images/<slug>/` | Each study's exports. |

## Notes for editing

**The copy is mine.** Text in `summary`, `sections[].body`, `role`, `team`,
`scope`, `alt` and `caption` comes from my own case study drafts. Don't
rephrase it, and don't invent metrics, dates or names.

**Pagination is deterministic.** `reader/paginate.ts` decides page breaks from
an abstract line-cost model, never by measuring the DOM, so the same content
always gives the same spreads. If you add a block type, give it a cost there
too, or pages will silently overflow. Figures are sized in `cqw` against a
budget (`BOOK_BUDGET` in `Figure.tsx`) for the same reason.

**Motion animates transform and opacity only**, so nothing triggers layout.
New scenes register in `stages/registry.ts`; a stage listed in the content
without a scene stays off the page until one exists.

**Large files.** The ASTA screen recordings in `public/images/asta/` are 26 MB
and 38 MB. If the repository gets heavy, move them to a CDN and point the
`video` fields at the URLs.

## Use

The code is here to read and learn from. The case studies, images,
recordings, illustrations and sounds are my own work (and, for ASTA and
Kyros, my clients' products), so please don't reuse them. The Dico display
font is licensed separately by its foundry.
