/**
 * Vercel Serverless Function — API Ninjas Quotes proxy
 *
 * Docs: https://api-ninjas.com/api/quotes (host: api.api-ninjas.com)
 * Keeps API_NINJAS_KEY on the server only.
 * Vercel: Settings → Environment Variables → API_NINJAS_KEY
 *
 * Client: GET /api/ninjas-quote
 * Upstream: GET /v2/quoteoftheday (same quote all day; changes daily)
 */

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  var key = process.env.API_NINJAS_KEY;
  if (!key) {
    res.status(503).json({
      message:
        "Quotes proxy is not configured. Add API_NINJAS_KEY in Vercel → Environment Variables and redeploy.",
    });
    return;
  }

  var upstream = "https://api.api-ninjas.com/v2/quotes?categories=success%2Cwisdom%2Cinspirational";

  try {
    var r = await fetch(upstream, {
      method: "GET",
      headers: { "X-Api-Key": key },
    });
    var text = await r.text();
    var ct = r.headers.get("content-type") || "application/json; charset=utf-8";
    res.status(r.status).setHeader("Content-Type", ct).send(text);
  } catch (e) {
    res.status(502).json({ message: "Upstream request failed" });
  }
};
