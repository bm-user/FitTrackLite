(function () {
  const grid = document.getElementById("workout-grid");
  const categoryFilter = document.getElementById("category-filter");
  const searchInput = document.getElementById("workout-search");
  const assignBanner = document.getElementById("assign-banner");

  if (!grid) return;

  const PS = window.FitTrackPlannerState;
  if (!PS) return;

  const PLANNER_KEY = "fittrack-weekly-planner";
  const USER_WORKOUTS_KEY = "fittrack-user-workouts";

  const VALID_PLANNER_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const DAY_LONG = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday",
  };

  const params = new URLSearchParams(window.location.search);
  const assignDayRaw = params.get("assignDay");
  const assignDay =
    assignDayRaw && VALID_PLANNER_DAYS.includes(assignDayRaw) ? assignDayRaw : null;

  function assignSnapshotKey() {
    return assignDay ? "fittrack-assign-snapshot-" + assignDay : "";
  }

  /** Planner JSON before this assign session — restored if user clicks Cancel */
  function captureAssignSnapshot() {
    if (!assignDay) return;
    try {
      var k = assignSnapshotKey();
      if (k && !sessionStorage.getItem(k)) {
        sessionStorage.setItem(k, localStorage.getItem(PLANNER_KEY) || "");
      }
    } catch (e) {}
  }

  function commitAssignSnapshot() {
    try {
      var k = assignSnapshotKey();
      if (k) sessionStorage.removeItem(k);
    } catch (e) {}
  }

  function restoreAssignSnapshotAndNavigate(url) {
    try {
      var k = assignSnapshotKey();
      if (k) {
        var snap = sessionStorage.getItem(k);
        if (snap !== null) {
          localStorage.setItem(PLANNER_KEY, snap);
        }
        sessionStorage.removeItem(k);
      }
    } catch (e) {}
    window.location.href = url;
  }

  captureAssignSnapshot();

  const CATEGORY_LABEL = {
    cardio: "Cardio",
    flexibility: "Flexibility",
    strength: "Strength",
  };

  const CATEGORY_TAG_CLASS = {
    cardio: "workout-card_tag--cardio",
    flexibility: "workout-card_tag--flex",
    strength: "workout-card_tag--strength",
  };

  let allWorkouts = [];

  /** Identifies a card so selection survives filter/re-render in assign mode */
  function workoutKey(w) {
    if (w && w.id != null && String(w.id) !== "") return String(w.id);
    var dm = w && w.durationMins;
    var rp = w && w.reps;
    return (
      String((w && w.title) || "") +
      "|" +
      String((w && w.category) || "") +
      "|" +
      String(dm != null && dm !== "" ? dm : "") +
      "|" +
      String(rp != null && rp !== "" ? rp : "")
    );
  }

  var lastSelectedWorkoutKey = null;

  function loadPlannerStateObject() {
    const key = PS.mondayKey();
    let raw = localStorage.getItem(PLANNER_KEY);
    let state = null;
    if (raw) {
      try {
        state = JSON.parse(raw);
      } catch (e) {}
    }
    if (
      !state ||
      state.weekKey !== key ||
      !Array.isArray(state.days) ||
      state.days.length !== 7
    ) {
      state = { weekKey: key, days: PS.defaultPlannerDays() };
    } else {
      state.days = PS.migratePlannerDays(state.days);
    }
    state.days = PS.normalizePlannerDays(state.days);
    return state;
  }

  /** Planner row → catalog workout match (same rules as assignWorkoutToPlannerDay writes) */
  function plannerItemMatchesWorkout(item, w) {
    if (!item || !w || String(item.title) !== String(w.title)) return false;
    var hasRep = w.reps != null && w.reps !== "";
    var hasDur = w.durationMins != null && w.durationMins !== "";
    if (hasRep) {
      var wr = Number(w.reps);
      var ir = item.reps != null ? Number(item.reps) : NaN;
      if (wr !== ir) return false;
    }
    if (hasDur) {
      var wm = Number(w.durationMins);
      var im =
        item.durationMins != null ? Number(item.durationMins) : NaN;
      if (wm !== im) return false;
    }
    return true;
  }

  /** Every catalog workoutKey that appears on this planner day (for multi-highlight in assign mode) */
  function assignedWorkoutKeysForDay(shortLabel) {
    var keys = new Set();
    var state = loadPlannerStateObject();
    var day = state.days.find(function (d) {
      return d.shortLabel === shortLabel;
    });
    if (!day || !Array.isArray(day.items)) return keys;
    day.items.forEach(function (item) {
      var match = allWorkouts.find(function (w) {
        return plannerItemMatchesWorkout(item, w);
      });
      if (match) keys.add(workoutKey(match));
    });
    return keys;
  }

  function assignWorkoutToPlannerDay(shortLabel, workout) {
    let state = loadPlannerStateObject();
    const day = state.days.find(function (d) {
      return d.shortLabel === shortLabel;
    });
    if (!day) return false;
    if (!Array.isArray(day.items)) day.items = [];
    var plannerItem = {
      uid: "add-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9),
      title: workout.title,
      completed: false,
    };
    if (workout.reps != null && workout.reps !== "") {
      var r = Number(workout.reps);
      if (!isNaN(r) && isFinite(r)) plannerItem.reps = r;
    }
    if (workout.durationMins != null && workout.durationMins !== "") {
      var m = Number(workout.durationMins);
      if (!isNaN(m) && isFinite(m)) plannerItem.durationMins = m;
    }
    day.items.push(plannerItem);
    state.days = PS.normalizePlannerDays(state.days);
    localStorage.setItem(PLANNER_KEY, JSON.stringify(state));
    return true;
  }

  function showAssignBanner() {
    if (!assignDay || !assignBanner) return;
    assignBanner.classList.remove("is-hidden");
    assignBanner.innerHTML =
      '<div class="workouts-assign-banner_inner">' +
      '<p class="workouts-assign-banner_message">Add workouts for <strong>' +
      DAY_LONG[assignDay] +
      "</strong>. Click cards to add each one.</p>" +
      '<div class="workouts-assign-banner_actions">' +
      '<a class="workouts-assign-banner_btn workouts-assign-banner_btn--done" href="index.html#weekly-planner" id="assign-done-btn">Done</a>' +
      '<button type="button" class="workouts-assign-banner_btn workouts-assign-banner_btn--cancel" id="assign-cancel-btn">Cancel</button>' +
      "</div></div>";

    var doneBtn = document.getElementById("assign-done-btn");
    if (doneBtn) {
      doneBtn.addEventListener("click", function () {
        commitAssignSnapshot();
      });
    }
    var cancelBtn = document.getElementById("assign-cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        restoreAssignSnapshotAndNavigate("workouts.html");
      });
    }
  }

  function tagClassForCategory(category) {
    return CATEGORY_TAG_CLASS[category] || "workout-card_tag--cardio";
  }

  function labelForCategory(category) {
    return CATEGORY_LABEL[category] || category;
  }

  function createCard(workout, assignedKeySet) {
    const article = document.createElement("article");
    article.className = "workout-card";

    const h2 = document.createElement("h2");
    h2.className = "workout-card_title";
    h2.textContent = workout.title;

    const meta = document.createElement("p");
    meta.className = "workout-card_meta";
    function durationPart(w) {
      var r = w.reps;
      if (r != null && r !== "") {
        var rn = Number(r);
        if (!isNaN(rn) && isFinite(rn)) return rn + " reps";
      }
      if (w.durationMins != null && w.durationMins !== "") {
        return w.durationMins + " mins";
      }
      return "—";
    }
    const durStr = durationPart(workout);
    const kcal = workout.calories != null ? workout.calories + " kcal" : "—";
    meta.textContent = durStr + " · " + kcal;

    const tag = document.createElement("span");
    tag.className =
      "workout-card_tag " + tagClassForCategory(workout.category);
    tag.textContent = labelForCategory(workout.category);

    article.append(h2, meta, tag);

    article.classList.add("workout-card--interactive");

    var wk = workoutKey(workout);
    if (
      assignDay &&
      assignedKeySet &&
      assignedKeySet.has(wk)
    ) {
      article.classList.add("workout-card--selected");
    } else if (!assignDay && lastSelectedWorkoutKey === wk) {
      article.classList.add("workout-card--selected");
    }

    article.addEventListener("click", function () {
      if (assignDay) {
        if (!assignWorkoutToPlannerDay(assignDay, workout)) return;
        article.classList.add("workout-card--selected");
      } else {
        lastSelectedWorkoutKey = wk;
        grid.querySelectorAll(".workout-card--selected").forEach(function (el) {
          el.classList.remove("workout-card--selected");
        });
        article.classList.add("workout-card--selected");
      }

      if (assignDay && assignBanner) {
        let note = document.getElementById("assign-added-note");
        if (!note) {
          note = document.createElement("p");
          note.id = "assign-added-note";
          note.className = "workouts-assign-banner__note";
          note.setAttribute("role", "status");
          assignBanner.appendChild(note);
        }
        note.textContent =
          "Added “" + workout.title + "”. Pick another or open Dashboard when finished.";
      }
    });

    if (assignDay) {
      article.classList.add("workout-card--selectable");
      article.tabIndex = 0;
      article.setAttribute("role", "button");
      article.setAttribute(
        "aria-label",
        "Assign " + workout.title + " to " + DAY_LONG[assignDay]
      );
      article.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          article.click();
        }
      });
    }

    return article;
  }

  function renderList(list) {
    grid.replaceChildren();

    if (list.length === 0) {
      const empty = document.createElement("p");
      empty.className = "workout-grid_empty";
      empty.textContent = "No workouts match your filter or search.";
      empty.setAttribute("role", "status");
      grid.appendChild(empty);
      return;
    }

    const frag = document.createDocumentFragment();
    var assignedKeySet = assignDay ? assignedWorkoutKeysForDay(assignDay) : null;
    list.forEach(function (w) {
      frag.appendChild(createCard(w, assignedKeySet));
    });
    grid.appendChild(frag);
  }

  function applyFilters() {
    const cat = categoryFilter ? categoryFilter.value : "all";
    const q =
      searchInput && searchInput.value
        ? searchInput.value.trim().toLowerCase()
        : "";

    const filtered = allWorkouts.filter(function (w) {
      if (cat !== "all" && w.category !== cat) return false;
      if (!q) return true;
      const hay = (
        w.title +
        " " +
        labelForCategory(w.category) +
        " " +
        (w.durationMins || "") +
        " " +
        (w.reps || "") +
        " " +
        (w.calories || "")
      ).toLowerCase();
      return hay.includes(q);
    });

    renderList(filtered);
  }

  function showError(message) {
    grid.replaceChildren();
    const p = document.createElement("p");
    p.className = "workout-grid_empty";
    p.textContent = message;
    p.setAttribute("role", "alert");
    grid.appendChild(p);
  }

  showAssignBanner();

  fetch("data/workouts.json")
    .then(function (res) {
      if (!res.ok) throw new Error("Could not load workouts (" + res.status + ")");
      return res.json();
    })
    .then(function (data) {
      let user = [];
      try {
        user = JSON.parse(localStorage.getItem(USER_WORKOUTS_KEY) || "[]");
      } catch (e) {}
      allWorkouts = (data.workouts || []).concat(user);
      applyFilters();
    })
    .catch(function () {
      showError(
        "Could not load workout data. Use a local server (e.g. Live Server) so data/workouts.json can be fetched."
      );
    });

  if (categoryFilter) {
    categoryFilter.addEventListener("change", applyFilters);
  }
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }
})();
