/**
 * Vercel Serverless Function — ExerciseDB (RapidAPI) proxy
 *
 * Keeps EXERCISEDB_RAPIDAPI_KEY on the server only (safe for public sites).
 * Vercel: Dashboard → your project → Settings → Environment Variables → EXERCISEDB_RAPIDAPI_KEY
 *
 * Client calls: GET /api/exercisedb?path=%2Fexercises%2FtargetList
 * (path must start with /exercises/)
 */

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  var raw = req.query.path;
  var pathParam = Array.isArray(raw) ? raw[0] : raw;
  if (!pathParam || typeof pathParam !== "string") {
    res.status(400).json({ message: "Missing path" });
    return;
  }

  var apiPath;
  try {
    apiPath = decodeURIComponent(pathParam);
  } catch (e) {
    res.status(400).json({ message: "Invalid path encoding" });
    return;
  }

  if (
    !apiPath.startsWith("/exercises/") ||
    apiPath.length > 512 ||
    apiPath.indexOf("..") !== -1
  ) {
    res.status(400).json({ message: "Invalid path" });
    return;
  }

  var key = process.env.EXERCISEDB_RAPIDAPI_KEY;
  if (!key) {
    res.status(503).json({
      message:
        "ExerciseDB proxy is not configured. Add EXERCISEDB_RAPIDAPI_KEY in Vercel → Environment Variables and redeploy.",
    });
    return;
  }

  var upstream = "https://exercisedb.p.rapidapi.com" + apiPath;

  try {
    var r = await fetch(upstream, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
    });
    var text = await r.text();
    var ct = r.headers.get("content-type") || "application/json; charset=utf-8";
    res.status(r.status).setHeader("Content-Type", ct).send(text);
  } catch (e) {
    res.status(502).json({ message: "Upstream request failed" });
  }
};
