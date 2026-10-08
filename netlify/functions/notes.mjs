// Serves previous guestbook notes back to the scene.
//
// This has to run server-side: reading submissions needs a Netlify access
// token, and anything the browser can see, a visitor can take. The token stays
// in an environment variable here and never leaves the function.
//
// Only the message and the country go out. Names, timezones and everything
// else stay in the Netlify dashboard where only Sumayya sees them.

const PAST_LIMIT = 12;      // how many earlier notes the book can hold
const MAX_MESSAGE = 320;    // same cap the textarea enforces

// What the scene sends when someone stamps without writing anything. Fine as a
// private record, but it is not a note, so it does not belong on the wall.
const PLACEHOLDER = "(no message — just passing through)";

export default async (req, context) => {
  const empty = Response.json([], {
    headers: { "cache-control": "public, max-age=60" }
  });

  // GUESTBOOK_TOKEN is preferred; the older name is still read so an existing
  // setup keeps working.
  const token = process.env.GUESTBOOK_TOKEN || process.env.NETLIFY_ACCESS_TOKEN;
  const siteId = context?.site?.id || process.env.SITE_ID;
  // No token yet? Hand back an empty book rather than an error — a visitor
  // should still be able to write, even if the wall isn't wired up.
  if (!token || !siteId) return empty;

  let submissions;
  try {
    const res = await fetch(
      `https://api.netlify.com/api/v1/sites/${siteId}/submissions?per_page=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return empty;
    submissions = await res.json();
  } catch {
    return empty;
  }
  if (!Array.isArray(submissions)) return empty;

  const notes = submissions
    .filter((s) => s.form_name === "guestbook" && s.state !== "spam")
    .map((s) => ({
      message: String(s.data?.message || "").trim().slice(0, MAX_MESSAGE),
      country: String(s.data?.country || "").slice(0, 40),
      at: s.created_at
    }))
    .filter((n) => n.message && n.message !== PLACEHOLDER)
    .reverse()              // the API returns newest first; the book reads oldest first
    .slice(-PAST_LIMIT);    // keep the most recent few

  return Response.json(notes, {
    headers: { "cache-control": "public, max-age=60" }
  });
};
