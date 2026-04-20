(function () {
  var meta = document.querySelector('meta[name="fittrack-quotes-proxy"]');
  var PROXY = meta && meta.content ? meta.content.trim().replace(/\/$/, "") : "";
  var quoteEl = document.getElementById("daily-quote-text");
  var authorEl = document.getElementById("daily-quote-author");
  if (!quoteEl) return;

  function showFallback(message) {
    quoteEl.textContent =
      message ||
      "Small steps each day build lasting habits.";
    if (authorEl) {
      authorEl.textContent = "";
      authorEl.hidden = true;
    }
  }

  function render(payload) {
    var item = Array.isArray(payload) ? payload[0] : payload;
    if (!item || !item.quote) {
      showFallback();
      return;
    }
    quoteEl.textContent = item.quote;
    if (authorEl && item.author) {
      authorEl.textContent = "\u2014 " + item.author;
      authorEl.hidden = false;
    } else if (authorEl) {
      authorEl.textContent = "";
      authorEl.hidden = true;
    }
  }

  if (!PROXY) {
    showFallback(
      "Deploy with the quotes API proxy enabled to load a daily quote."
    );
    return;
  }

  fetch(PROXY)
    .then(function (r) {
      return r.json().then(function (data) {
        return { ok: r.ok, status: r.status, data: data };
      });
    })
    .then(function (result) {
      if (!result || !result.data) {
        showFallback();
        return;
      }
      var data = result.data;
      if (
        typeof data.message === "string" &&
        data.message.indexOf("not configured") !== -1
      ) {
        showFallback("Quote service is not configured.");
        return;
      }
      if (!result.ok) {
        showFallback();
        return;
      }
      render(data);
    })
    .catch(function () {
      showFallback();
    });
})();
