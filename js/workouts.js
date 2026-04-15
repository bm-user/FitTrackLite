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

  function assignWorkoutToPlannerDay(shortLabel, workout) {
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
    const day = state.days.find(function (d) {
      return d.shortLabel === shortLabel;
    });
    if (!day) return false;
    if (!Array.isArray(day.items)) day.items = [];
    day.items.push({
      uid: "add-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9),
      title: workout.title,
      completed: false,
    });
    state.days = PS.normalizePlannerDays(state.days);
    localStorage.setItem(PLANNER_KEY, JSON.stringify(state));
    return true;
  }

  function showAssignBanner() {
    if (!assignDay || !assignBanner) return;
    assignBanner.classList.remove("is-hidden");
    assignBanner.innerHTML =
      "Add workouts for <strong>" +
      DAY_LONG[assignDay] +
      '</strong>. Click cards to add each one. ' +
      '<a href="index.html#weekly-planner">Done</a> · ' +
      '<a href="workouts.html">Cancel</a>';
  }

  function tagClassForCategory(category) {
    return CATEGORY_TAG_CLASS[category] || "workout-card_tag--cardio";
  }

  function labelForCategory(category) {
    return CATEGORY_LABEL[category] || category;
  }

  function createCard(workout) {
    const article = document.createElement("article");
    article.className = "workout-card";

    const h2 = document.createElement("h2");
    h2.className = "workout-card_title";
    h2.textContent = workout.title;

    const meta = document.createElement("p");
    meta.className = "workout-card_meta";
    const mins = workout.durationMins != null ? workout.durationMins + " mins" : "—";
    const kcal = workout.calories != null ? workout.calories + " kcal" : "—";
    meta.textContent = mins + " · " + kcal;

    const tag = document.createElement("span");
    tag.className =
      "workout-card_tag " + tagClassForCategory(workout.category);
    tag.textContent = labelForCategory(workout.category);

    article.append(h2, meta, tag);

    if (assignDay) {
      article.classList.add("workout-card--selectable");
      article.tabIndex = 0;
      article.setAttribute("role", "button");
      article.setAttribute(
        "aria-label",
        "Assign " + workout.title + " to " + DAY_LONG[assignDay]
      );
      article.addEventListener("click", function () {
        if (!assignWorkoutToPlannerDay(assignDay, workout)) return;
        let note = document.getElementById("assign-added-note");
        if (!note) {
          note = document.createElement("p");
          note.id = "assign-added-note";
          note.className = "workouts-assign-banner__note";
          note.setAttribute("role", "status");
          assignBanner.appendChild(note);
        }
        note.textContent = "Added “" + workout.title + "”. Pick another or open Dashboard when finished.";
      });
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
    list.forEach(function (w) {
      frag.appendChild(createCard(w));
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
