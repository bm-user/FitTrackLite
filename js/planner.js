/**
 * Dashboard totals from Add Workout saves (fittrack-user-workouts).
 * Runs first so Live Server / single bundle always updates stats even if planner init fails.
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
    window.addEventListener("load", function () {
      updateStats();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }

  window.FitTrackRefreshUserWorkoutStats = updateStats;
})();

(function () {
  const STORAGE_KEY = "fittrack-weekly-planner";

  const gridEl = document.getElementById("planner-grid");
  const progressBarEl = document.getElementById("planner-progress-bar");
  const progressPctEl = document.getElementById("planner-progress-pct");
  const progressCountEl = document.getElementById("planner-progress-count");
  const progressCheckboxEl = document.getElementById("planner-progress-checkbox");

  const statPctEl = document.getElementById("stat-weekly-pct");
  const statMetaEl = document.getElementById("stat-weekly-meta");
  const statBarEl = document.getElementById("stat-weekly-bar");

  if (!gridEl) return;

  const PS = window.FitTrackPlannerState;
  if (!PS) return;

  const state = { weekKey: "", days: [] };

  function loadState() {
    const key = PS.mondayKey();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.weekKey === key && Array.isArray(parsed.days) && parsed.days.length === 7) {
          const migrated = PS.migratePlannerDays(parsed.days);
          const slim = PS.normalizePlannerDays(migrated);
          state.weekKey = parsed.weekKey;
          state.days = slim;
          if (JSON.stringify(parsed.days) !== JSON.stringify(slim)) saveState();
          return;
        }
      } catch (e) {}
    }
    state.weekKey = key;
    state.days = PS.defaultPlannerDays();
    saveState();
  }

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ weekKey: state.weekKey, days: state.days })
    );
  }

  function totalItemCount() {
    let n = 0;
    state.days.forEach(function (d) {
      n += (d.items && d.items.length) || 0;
    });
    return n;
  }

  function completedItemCount() {
    let n = 0;
    state.days.forEach(function (d) {
      (d.items || []).forEach(function (it) {
        if (it.completed) n += 1;
      });
    });
    return n;
  }

  function updateProgressUI() {
    const total = totalItemCount();
    const done = completedItemCount();
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    if (progressBarEl) progressBarEl.style.width = pct + "%";
    if (progressPctEl) progressPctEl.textContent = pct + "%";
    if (progressCountEl) {
      progressCountEl.textContent =
        total > 0
          ? done + " / " + total + " workouts completed"
          : "Add workouts to track progress";
    }
    if (progressCheckboxEl) {
      progressCheckboxEl.checked = total > 0 && done === total;
    }

    if (statPctEl) statPctEl.textContent = pct + "%";
    if (statMetaEl) {
      statMetaEl.textContent =
        total > 0 ? done + " / " + total + " checked in planner" : "No items in planner";
    }
    if (statBarEl) statBarEl.style.width = pct + "%";
  }

  function dayCardAllDone(day) {
    const items = day.items || [];
    if (!items.length) return false;
    return items.every(function (it) {
      return it.completed;
    });
  }

  function render() {
    gridEl.innerHTML = "";
    const frag = document.createDocumentFragment();

    state.days.forEach(function (day, dayIndex) {
      const items = day.items || [];
      const art = document.createElement("article");
      art.className = "planner-card" + (dayCardAllDone(day) ? " planner-card--done" : "");

      const dayRow = document.createElement("div");
      dayRow.className = "planner-card__day-row";

      const dayName = document.createElement("span");
      dayName.className = "planner-card__day-name";
      dayName.textContent = day.shortLabel;

      const addBtn = document.createElement("a");
      addBtn.className = "planner-card__add-btn";
      addBtn.href = "workouts.html?assignDay=" + encodeURIComponent(day.shortLabel);
      addBtn.textContent = "Add";
      addBtn.setAttribute("aria-label", "Add workout for " + day.shortLabel);

      dayRow.appendChild(dayName);
      dayRow.appendChild(addBtn);

      const listEl = document.createElement("div");
      listEl.className = "planner-card__items";

      items.forEach(function (item, itemIndex) {
        const row = document.createElement("div");
        row.className =
          "planner-card__row" + (item.completed ? " planner-card__row--done" : "");

        const cb = document.createElement("input");
        cb.type = "checkbox";
        const safeUid = String(item.uid).replace(/[^a-zA-Z0-9_-]/g, "");
        cb.id = "planner-" + dayIndex + "-" + itemIndex + "-" + safeUid;
        cb.checked = !!item.completed;
        cb.addEventListener("change", function () {
          item.completed = cb.checked;
          saveState();
          row.classList.toggle("planner-card__row--done", item.completed);
          art.classList.toggle("planner-card--done", dayCardAllDone(day));
          updateProgressUI();
        });

        const lab = document.createElement("label");
        lab.htmlFor = cb.id;
        lab.textContent = item.title;

        row.appendChild(cb);
        row.appendChild(lab);
        listEl.appendChild(row);
      });

      art.appendChild(dayRow);
      art.appendChild(listEl);
      frag.appendChild(art);
    });

    gridEl.appendChild(frag);
    updateProgressUI();
  }

  loadState();
  render();
})();
