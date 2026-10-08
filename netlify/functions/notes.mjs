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

export default async (req, context) => {
  // ?debug=1 reports why the wall is empty without ever revealing the token.
  // Temporary: remove once the endpoint is confirmed working.
  const debug = new URL(req.url).searchParams.get("debug") === "1";
  const diag = {};
  const empty = Response.json([], {
    headers: { "cache-control": "public, max-age=60" }
  });
  const report = (stage) => Response.json({ stage, ...diag }, { status: 200 });

  // Either name works. GUESTBOOK_TOKEN is preferred because it cannot collide
  // with anything Netlify reserves for itself under the NETLIFY_ prefix.
  const token = process.env.GUESTBOOK_TOKEN || process.env.NETLIFY_ACCESS_TOKEN;
  const siteId = context?.site?.id || process.env.SITE_ID;
  diag.hasToken = Boolean(token);
  diag.tokenLength = token ? token.length : 0;
  diag.sawGuestbookToken = Boolean(process.env.GUESTBOOK_TOKEN);
  diag.sawNetlifyAccessToken = Boolean(process.env.NETLIFY_ACCESS_TOKEN);
  diag.siteIdFrom = context?.site?.id ? "context" : (process.env.SITE_ID ? "env" : "none");
  diag.siteId = siteId || null;
  // No token yet? Hand back an empty book rather than an error — a visitor
  // should still be able to write, even if the wall isn't wired up.
  if (!token || !siteId) return debug ? report("missing-token-or-site") : empty;

  let submissions;
  try {
    const res = await fetch(
      `https://api.netlify.com/api/v1/sites/${siteId}/submissions?per_page=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    diag.apiStatus = res.status;
    if (!res.ok) {
      diag.apiBody = (await res.text()).slice(0, 200);
      return debug ? report("api-error") : empty;
    }
    submissions = await res.json();
  } catch (e) {
    diag.threw = String(e).slice(0, 200);
    return debug ? report("fetch-threw") : empty;
  }
  if (!Array.isArray(submissions)) {
    diag.shape = typeof submissions;
    return debug ? report("not-an-array") : empty;
  }
  diag.totalSubmissions = submissions.length;
  diag.formNames = [...new Set(submissions.map((s) => s.form_name))];
  diag.states = [...new Set(submissions.map((s) => s.state))];

  const notes = submissions
    .filter((s) => s.form_name === "guestbook" && s.state !== "spam")
    .map((s) => ({
      message: String(s.data?.message || "").slice(0, MAX_MESSAGE),
      country: String(s.data?.country || "").slice(0, 40),
      at: s.created_at
    }))
    .filter((n) => n.message)
    .reverse()              // the API returns newest first; the book reads oldest first
    .slice(-PAST_LIMIT);    // keep the most recent few

  diag.returned = notes.length;
  if (debug) return report("ok");

  return Response.json(notes, {
    headers: { "cache-control": "public, max-age=60" }
  });
};
