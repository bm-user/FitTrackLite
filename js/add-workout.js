(function () {
  var form = document.querySelector(".form-stack");
  if (!form) return;

  var KEY = "fittrack-user-workouts";

  var categoryToSlug = {
    Cardio: "cardio",
    Strength: "strength",
    Flexibility: "flexibility",
  };

  var NAME_MAX = 120;
  var DURATION_MIN = 1;
  var DURATION_MAX = 1440;
  var CALORIES_MIN = 0;
  var CALORIES_MAX = 20000;

  function getErrorSummaryEl() {
    var el = document.getElementById("add-workout-errors");
    if (el) return el;
    el = document.createElement("div");
    el.id = "add-workout-errors";
    el.className = "form-error-summary is-hidden";
    el.setAttribute("role", "alert");
    form.insertBefore(el, form.firstChild);
    return el;
  }

  function clearValidation() {
    var summary = document.getElementById("add-workout-errors");
    if (summary) {
      summary.classList.add("is-hidden");
      summary.textContent = "";
    }
    ["workout-name", "duration", "calories"].forEach(function (id) {
      var input = document.getElementById(id);
      if (input) {
        input.classList.remove("is-invalid");
        input.removeAttribute("aria-invalid");
      }
    });
  }

  function showErrors(fieldErrors) {
    var summary = getErrorSummaryEl();
    summary.classList.remove("is-hidden");
    var title = document.createElement("p");
    title.className = "form-error-summary_title";
    title.textContent = "Please fix the following:";
    var ul = document.createElement("ul");
    fieldErrors.forEach(function (fe) {
      var li = document.createElement("li");
      li.textContent = fe.message;
      ul.appendChild(li);
    });
    summary.appendChild(title);
    summary.appendChild(ul);

    fieldErrors.forEach(function (fe) {
      markInvalid(fe.id);
    });
    if (fieldErrors[0]) {
      var first = document.getElementById(fieldErrors[0].id);
      if (first) first.focus();
    }
  }

  function markInvalid(id) {
    var input = document.getElementById(id);
    if (input) {
      input.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
    }
  }

  function parseWholeNumber(raw, min, max, label) {
    var t = (raw || "").trim();
    if (t === "") {
      return { ok: false, message: label + " is required." };
    }
    if (!/^\d+$/.test(t)) {
      return { ok: false, message: label + " must be a whole number (no decimals or letters)." };
    }
    var n = parseInt(t, 10);
    if (n < min || n > max) {
      return {
        ok: false,
        message: label + " must be between " + min + " and " + max + ".",
      };
    }
    return { ok: true, value: n };
  }

  function validate() {
    var fieldErrors = [];

    var nameEl = document.getElementById("workout-name");
    var catEl = document.getElementById("category");
    var durEl = document.getElementById("duration");
    var calEl = document.getElementById("calories");

    if (!nameEl || !catEl || !durEl || !calEl) {
      return { ok: false, fieldErrors: [] };
    }

    var name = nameEl.value.trim();
    if (!name) {
      fieldErrors.push({ id: "workout-name", message: "Enter a workout name." });
    } else if (name.length > NAME_MAX) {
      fieldErrors.push({
        id: "workout-name",
        message: "Workout name must be " + NAME_MAX + " characters or fewer.",
      });
    }

    var dur = parseWholeNumber(durEl.value, DURATION_MIN, DURATION_MAX, "Duration");
    if (!dur.ok) {
      fieldErrors.push({ id: "duration", message: dur.message });
    }

    var cal = parseWholeNumber(calEl.value, CALORIES_MIN, CALORIES_MAX, "Calories burned");
    if (!cal.ok) {
      fieldErrors.push({ id: "calories", message: cal.message });
    }

    if (fieldErrors.length > 0) {
      return { ok: false, fieldErrors: fieldErrors };
    }

    return {
      ok: true,
      name: name,
      catLabel: catEl.value,
      durationMins: dur.value,
      calories: cal.value,
    };
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearValidation();

    var result = validate();
    if (!result.ok) {
      if (result.fieldErrors && result.fieldErrors.length > 0) {
        showErrors(result.fieldErrors);
      }
      return;
    }

    var category = categoryToSlug[result.catLabel] || "cardio";

    var list = [];
    try {
      list = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (err) {}

    list.push({
      id: "user-" + Date.now(),
      title: result.name,
      category: category,
      durationMins: result.durationMins,
      calories: result.calories,
    });

    localStorage.setItem(KEY, JSON.stringify(list));

    var msg = document.getElementById("add-workout-feedback");
    if (!msg) {
      msg = document.createElement("p");
      msg.id = "add-workout-feedback";
      msg.className = "form-success";
      msg.setAttribute("role", "status");
      form.appendChild(msg);
    }
    msg.textContent =
      "Saved “" +
      result.name +
      "” (" +
      result.durationMins +
      " min, " +
      result.calories +
      " kcal). View it on Workouts.";

    form.reset();
  });
})();
