(function () {
  var LIST_LIMIT = 12;

  var proxyMeta = document.querySelector('meta[name="fittrack-exercisedb-proxy"]');
  var PROXY_BASE = "";
  if (proxyMeta && typeof proxyMeta.content === "string") {
    PROXY_BASE = proxyMeta.content.replace(/^\s+|\s+$/g, "").replace(/\/$/, "");
  }

  var panel = document.querySelector(".exercise-db-panel");
  if (!panel) return;

  var searchInput = document.getElementById("exercisedb-search");
  var searchBtn = document.getElementById("exercisedb-search-btn");
  var resultsEl = document.getElementById("exercisedb-results");
  var statusEl = document.getElementById("exercisedb-status");

  var cache = {
    targets: null,
    bodyParts: null,
  };

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.classList.toggle("exercise-db-status--error", !!isError);
    statusEl.setAttribute("role", isError ? "alert" : "status");
  }

  if (!PROXY_BASE) {
    setStatus(
      "Exercise search is turned off (missing fittrack-exercisedb-proxy). On Vercel, keep content=\"/api/exercisedb\" in add-workout.html.",
      true
    );
  }

  function fetchJson(apiPath) {
    if (!PROXY_BASE) {
      return Promise.reject(new Error("Exercise search is not available on this build."));
    }
    var url = PROXY_BASE + "?path=" + encodeURIComponent(apiPath);
    return fetch(url, { method: "GET" }).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (e) {}
        }
        if (!res.ok) {
          var msg =
            (data && data.message) ||
            (data && data.error) ||
            "Request failed (" + res.status + ").";
          throw new Error(msg);
        }
        return data;
      });
    });
  }

  function ensureLists() {
    if (!PROXY_BASE) {
      return Promise.reject(new Error("Exercise search is not available on this build."));
    }
    var p1 =
      cache.targets != null
        ? Promise.resolve(cache.targets)
        : fetchJson("/exercises/targetList").then(function (list) {
            cache.targets = Array.isArray(list) ? list : [];
            return cache.targets;
          });
    var p2 =
      cache.bodyParts != null
        ? Promise.resolve(cache.bodyParts)
        : fetchJson("/exercises/bodyPartList").then(function (list) {
            cache.bodyParts = Array.isArray(list) ? list : [];
            return cache.bodyParts;
          });
    return Promise.all([p1, p2]);
  }

  function findListMatch(query, list) {
    var q = query.trim().toLowerCase();
    if (!q || !list || !list.length) return null;
    var exact = list.find(function (x) {
      return String(x).toLowerCase() === q;
    });
    if (exact) return { value: exact, kind: "exact" };
    var partial = list.find(function (x) {
      var xl = String(x).toLowerCase();
      return xl.includes(q) || (q.length >= 3 && q.includes(xl));
    });
    if (partial) return { value: partial, kind: "partial" };
    return null;
  }

  function buildListPath(kind, value) {
    var enc = encodeURIComponent(value);
    var q = "?limit=" + LIST_LIMIT + "&offset=0";
    if (kind === "target") return "/exercises/target/" + enc + q;
    if (kind === "bodypart") return "/exercises/bodyPart/" + enc + q;
    return "/exercises/name/" + enc + q;
  }

  function resolveSearch(query) {
    return ensureLists().then(function (lists) {
      var targets = lists[0];
      var bodyParts = lists[1];
      var tMatch = findListMatch(query, targets);
      if (tMatch) {
        return { path: buildListPath("target", tMatch.value), hint: "Target muscle: " + tMatch.value };
      }
      var bMatch = findListMatch(query, bodyParts);
      if (bMatch) {
        return { path: buildListPath("bodypart", bMatch.value), hint: "Body part: " + bMatch.value };
      }
      return { path: buildListPath("name", query.trim()), hint: "Search by name" };
    });
  }

  function isVideoUrl(url) {
    if (!url || typeof url !== "string") return false;
    return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
  }

  function renderResults(items) {
    if (!resultsEl) return;
    resultsEl.replaceChildren();
    if (!items || !items.length) {
      var empty = document.createElement("p");
      empty.className = "exercise-db-empty";
      empty.textContent = "No exercises found. Try another name or muscle.";
      resultsEl.appendChild(empty);
      return;
    }

    var frag = document.createDocumentFragment();
    items.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "exercise-db-card";

      var title = document.createElement("h3");
      title.className = "exercise-db-card_title";
      title.textContent = item.name || "Exercise";

      var meta = document.createElement("p");
      meta.className = "exercise-db-card_meta";
      var parts = [];
      if (item.target) parts.push(item.target);
      if (item.bodyPart) parts.push(item.bodyPart);
      if (item.equipment) parts.push(item.equipment);
      meta.textContent = parts.join(" · ") || "—";

      var mediaWrap = document.createElement("div");
      mediaWrap.className = "exercise-db-card_media";

      var mediaUrl = item.videoUrl || item.gifUrl;
      var caption = document.createElement("p");
      caption.className = "exercise-db-card_caption";

      if (mediaUrl) {
        if (isVideoUrl(mediaUrl)) {
          caption.textContent = "Video";
          var video = document.createElement("video");
          video.className = "exercise-db-card_video";
          video.src = mediaUrl;
          video.controls = true;
          video.playsInline = true;
          video.setAttribute("preload", "metadata");
          mediaWrap.appendChild(video);
        } else {
          caption.textContent = "Animated preview";
          var img = document.createElement("img");
          img.className = "exercise-db-card_gif";
          img.src = mediaUrl;
          img.alt = "Demonstration: " + (item.name || "exercise");
          img.loading = "lazy";
          mediaWrap.appendChild(img);
        }
        mediaWrap.appendChild(caption);
      } else {
        caption.textContent = "No demo available";
        mediaWrap.appendChild(caption);
      }

      card.append(title, meta, mediaWrap);

      if (item.instructions && item.instructions.length) {
        var details = document.createElement("details");
        details.className = "exercise-db-card_details";
        var summ = document.createElement("summary");
        summ.textContent = "Steps";
        var ol = document.createElement("ol");
        item.instructions.forEach(function (step) {
          var li = document.createElement("li");
          li.textContent = step;
          ol.appendChild(li);
        });
        details.append(summ, ol);
        card.appendChild(details);
      }

      frag.appendChild(card);
    });
    resultsEl.appendChild(frag);
  }

  function runSearch() {
    if (!PROXY_BASE) {
      setStatus(
        "Exercise search needs /api/exercisedb on your deployment. On Vercel, deploy with api/exercisedb.js and set EXERCISEDB_RAPIDAPI_KEY.",
        true
      );
      return;
    }

    var q = searchInput ? searchInput.value.trim() : "";
    if (q.length < 2) {
      setStatus("Type at least 2 characters (muscle, body area, or exercise name).", true);
      return;
    }

    setStatus("Searching…", false);
    if (resultsEl) resultsEl.replaceChildren();

    resolveSearch(q)
      .then(function (resolved) {
        setStatus(resolved.hint + " · showing up to " + LIST_LIMIT + ".", false);
        return fetchJson(resolved.path);
      })
      .then(function (data) {
        var list = Array.isArray(data) ? data : [];
        renderResults(list);
        if (list.length === 0) {
          setStatus("No matches. Try a different spelling or another muscle or exercise name.", false);
        }
      })
      .catch(function (err) {
        var msg = err && err.message ? err.message : "Search failed.";
        if (/Failed to fetch|NetworkError/i.test(msg)) {
          msg += " Check your connection and that the deployment includes /api/exercisedb.";
        }
        setStatus(msg, true);
        if (resultsEl) resultsEl.replaceChildren();
      });
  }

  if (searchBtn) searchBtn.addEventListener("click", runSearch);
  if (searchInput) {
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        runSearch();
      }
    });
  }
})();
