(function () {
  var form = document.querySelector(".form-stack");
  if (!form) return;

  var KEY = "fittrack-user-workouts";

  var categoryToSlug = {
    Cardio: "cardio",
    Strength: "strength",
    Flexibility: "flexibility",
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var nameEl = document.getElementById("workout-name");
    var catEl = document.getElementById("category");
    if (!nameEl || !catEl) return;

    var name = nameEl.value.trim();
    if (!name) return;

    var catLabel = catEl.value;
    var category = categoryToSlug[catLabel] || "cardio";

    var list = [];
    try {
      list = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (err) {}

    list.push({
      id: "user-" + Date.now(),
      title: name,
      category: category,
      durationMins: null,
      calories: null,
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
    form.reset();
  });
})();
