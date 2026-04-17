/**
 * Dashboard totals from workouts saved on Add Workout (localStorage: fittrack-user-workouts).
 * Loaded only on index.html; runs after DOM is ready and refreshes on navigation/focus/storage.
 */
(function () {
  var USER_WORKOUTS_KEY = "fittrack-user-workouts";
  var SESSION_BUMP = "fittrack-user-workouts-changed";

  function readUserWorkouts() {
    var list = [];
    try {
      list = JSON.parse(localStorage.getItem(USER_WORKOUTS_KEY) || "[]");
    } catch (e) {
      list = [];
    }
    return Array.isArray(list) ? list : [];
  }

  function updateStats() {
    var totalEl = document.getElementById("stat-total-workouts");
    var calEl = document.getElementById("stat-total-calories");
    if (!totalEl || !calEl) return;

    var list = readUserWorkouts();
    var totalKcal = 0;
    for (var i = 0; i < list.length; i++) {
      var w = list[i];
      if (!w || w.calories == null || w.calories === "") continue;
      var n = Number(w.calories);
      if (!isNaN(n) && isFinite(n)) totalKcal += n;
    }

    totalEl.textContent = String(list.length);
    calEl.textContent = Math.round(totalKcal) + " kcal";
  }

  function bind() {
    try {
      if (sessionStorage.getItem(SESSION_BUMP)) {
        sessionStorage.removeItem(SESSION_BUMP);
      }
    } catch (e) {}

    updateStats();

    window.addEventListener("pageshow", function () {
      updateStats();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") updateStats();
    });
    window.addEventListener("focus", updateStats);
    window.addEventListener("storage", function (e) {
      if (e.key === USER_WORKOUTS_KEY || e.key === null) updateStats();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }

  window.FitTrackRefreshUserWorkoutStats = updateStats;
})();
