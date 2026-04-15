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
      { shortLabel: "Mon", items: [{ uid: "def-mon", title: "Running", completed: false }] },
      { shortLabel: "Tue", items: [{ uid: "def-tue", title: "Rest", completed: false }] },
      { shortLabel: "Wed", items: [{ uid: "def-wed", title: "Yoga", completed: false }] },
      { shortLabel: "Thu", items: [{ uid: "def-thu", title: "Gym", completed: false }] },
      { shortLabel: "Fri", items: [{ uid: "def-fri", title: "HIIT", completed: false }] },
      { shortLabel: "Sat", items: [{ uid: "def-sat", title: "Cycling", completed: false }] },
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
    return days.map(function (d) {
      return {
        shortLabel: d.shortLabel,
        items: (d.items || []).map(function (it, idx) {
          return {
            uid: it && it.uid != null ? String(it.uid) : "norm-" + d.shortLabel + "-" + idx,
            title: it && it.title != null ? String(it.title) : "Rest",
            completed: !!(it && it.completed),
          };
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
