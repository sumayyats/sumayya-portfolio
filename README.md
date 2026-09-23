# Sumayya's case studies

A UX portfolio built as a bookshelf. Each case study is a book: pick one off
the shelf and read it either as a page-turning book or as a scrolling article.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Framer Motion.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Where things live

| Path | What it is |
| --- | --- |
| `src/content/case-studies.ts` | Every case study: copy, palette, figures, links. The only place content lives. |
| `src/content/types.ts` | The shape of a case study, documented field by field. |
| `src/components/Shelf.tsx` | The shelf: scrolling, keyboard, the pull-forward animation. |
| `src/components/BookSpine.tsx` · `Book3D.tsx` · `book-geometry.ts` | One book as a CSS 3D cuboid, and the per-index geometry that varies them. |
| `src/components/BookCover.tsx` | The jacket, used on the shelf, on the detail card and as the book's first page. |
| `src/components/reader/` | The reader: `ReaderFlip` (page-turning), `ReaderScroll` (article), `Figure`, `PageView`, `paginate`. |
| `public/images/<slug>/` | That study's exports. |

## Two things worth knowing before you edit

**Content is the author's own words.** Copy in `summary`, `sections[].body`,
`role`, `team`, `scope`, `alt` and `caption` comes from the source markdown.
Don't rephrase it, and don't invent metrics, dates or names.

**The book's pagination is deterministic.** `reader/paginate.ts` decides page
breaks from an abstract line-cost model, never from measuring the DOM, so the
same content always produces the same spreads. If you add a block type, give it
a cost there too — otherwise pages silently overflow. After changing anything
that affects page height, walk every page and check that no `.min-h-0` has
`scrollHeight > clientHeight`.

Figures are sized in `cqw` against a budget (`BOOK_BUDGET` in `Figure.tsx`) for
the same reason: a figure has to fit the page at any book size.

## Assets

Screen recordings live in `public/images/asta/`. They are large (26MB and
38MB); if the repository gets heavy, move them to a CDN and point the `video`
fields at the URLs.
