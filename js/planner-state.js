/* Weekly planner helpers for fittrack-weekly-planner; load before planner.js / workouts.js */
(function (global) {
  function mondayKey() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.getFullYear(), d.getMonth(), diff);
    const y = mon.getFullYear();
    let m = String(mon.getMonth() + 1);
    let dn = String(mon.getDate());
    if (m.length < 2) m = "0" + m;
    if (dn.length < 2) dn = "0" + dn;
    return y + "-" + m + "-" + dn;
  }

  function defaultPlannerDays() {
    return [
      { shortLabel: "Mon", items: [{ uid: "def-mon", title: "Running", durationMins: 30, completed: false }] },
      { shortLabel: "Tue", items: [{ uid: "def-tue", title: "Rest", completed: false }] },
      { shortLabel: "Wed", items: [{ uid: "def-wed", title: "Yoga", durationMins: 45, completed: false }] },
      { shortLabel: "Thu", items: [{ uid: "def-thu", title: "Gym", durationMins: 60, completed: false }] },
      { shortLabel: "Fri", items: [{ uid: "def-fri", title: "HIIT", durationMins: 25, completed: false }] },
      { shortLabel: "Sat", items: [{ uid: "def-sat", title: "Cycling", durationMins: 40, completed: false }] },
      { shortLabel: "Sun", items: [{ uid: "def-sun", title: "Rest", completed: false }] },
    ];
  }

  function migratePlannerDays(days) {
    if (!days || !days.length || !days[0]) return defaultPlannerDays();
    if (days[0].items && Array.isArray(days[0].items)) return days;
    return days.map(function (d) {
      return {
        shortLabel: d.shortLabel,
        items: [
          {
            uid: "mig-" + d.shortLabel,
            title: d.title || "Rest",
            completed: !!d.completed,
          },
        ],
      };
    });
  }

  function normalizePlannerDays(days) {
    var seedByUid = {};
    defaultPlannerDays().forEach(function (day) {
      (day.items || []).forEach(function (seedIt) {
        seedByUid[seedIt.uid] = seedIt;
      });
    });

    return days.map(function (d) {
      return {
        shortLabel: d.shortLabel,
        items: (d.items || []).map(function (it, idx) {
          var row = {
            uid: it && it.uid != null ? String(it.uid) : "norm-" + d.shortLabel + "-" + idx,
            title: it && it.title != null ? String(it.title) : "Rest",
            completed: !!(it && it.completed),
          };
          if (it && it.reps != null && it.reps !== "") {
            var rn = Number(it.reps);
            if (!isNaN(rn) && isFinite(rn)) row.reps = rn;
          }
          if (it && it.durationMins != null && it.durationMins !== "") {
            var mn = Number(it.durationMins);
            if (!isNaN(mn) && isFinite(mn)) row.durationMins = mn;
          }
          /* Older saves omitted reps/min — fill from default seed when uid matches */
          var seed = seedByUid[row.uid];
          if (
            seed &&
            row.reps == null &&
            (row.durationMins == null || row.durationMins === "")
          ) {
            if (seed.reps != null && seed.reps !== "") {
              var sr = Number(seed.reps);
              if (!isNaN(sr) && isFinite(sr)) row.reps = sr;
            }
            if (
              (row.durationMins == null || row.durationMins === "") &&
              seed.durationMins != null &&
              seed.durationMins !== ""
            ) {
              var sm = Number(seed.durationMins);
              if (!isNaN(sm) && isFinite(sm)) row.durationMins = sm;
            }
          }
          return row;
        }),
      };
    });
  }

  global.FitTrackPlannerState = {
    mondayKey: mondayKey,
    defaultPlannerDays: defaultPlannerDays,
    migratePlannerDays: migratePlannerDays,
    normalizePlannerDays: normalizePlannerDays,
  };
})(typeof window !== "undefined" ? window : this);
