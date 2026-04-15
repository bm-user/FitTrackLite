(function () {
  const grid = document.getElementById("workout-grid");
  const categoryFilter = document.getElementById("category-filter");
  const searchInput = document.getElementById("workout-search");

  if (!grid) return;

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
    meta.textContent =
      workout.durationMins + " mins · " + workout.calories + " kcal";

    const tag = document.createElement("span");
    tag.className =
      "workout-card_tag " + tagClassForCategory(workout.category);
    tag.textContent = labelForCategory(workout.category);

    article.append(h2, meta, tag);
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
    const q = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase() : "";

    const filtered = allWorkouts.filter(function (w) {
      if (cat !== "all" && w.category !== cat) return false;
      if (!q) return true;
      const hay = (
        w.title +
        " " +
        labelForCategory(w.category) +
        " " +
        w.durationMins +
        " " +
        w.calories
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

  fetch("data/workouts.json")
    .then(function (res) {
      if (!res.ok) throw new Error("Could not load workouts (" + res.status + ")");
      return res.json();
    })
    .then(function (data) {
      allWorkouts = data.workouts || [];
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
