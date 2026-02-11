// ================= HELPERS =================
function normalizePercent(value) {
  if (value === null || value === undefined) return null;

  // "80%" → 80
  if (typeof value === "string" && value.includes("%")) {
    const num = Number(value.replace("%", "").trim());
    return isNaN(num) ? null : num;
  }

  const num = Number(value);
  return isNaN(num) ? null : num;
}

function toNumber(value) {
  const num = Number(value);
  return isNaN(num) ? null : num;
}

// ================= KPI OVERVIEW =================
function calculateOverview(members) {
  const totalMembers = members.length;

  let mealFollowers = 0;
  let activeUsers = 0;
  let hba1cImproved = 0;
  let weightImproved = 0;

  members.forEach((m) => {
    // 🍽️ Meal adherence ≥ 80%
    const mealPct = normalizePercent(m["7D MEAL LOG %"]);
    if (mealPct !== null && mealPct >= 80) {
      mealFollowers++;
    }

    // 📱 App engagement ≥ 30 min (7d)
    const appMinutes = toNumber(m["app usege min 7d"]);
    if (appMinutes !== null && appMinutes >= 30) {
      activeUsers++;
    }

    // 🧪 HbA1c improvement
    const startHb = toNumber(m["START HbA1c"]);
    const lastHb = toNumber(m["LAST HbA1c"]);
    if (startHb !== null && lastHb !== null && lastHb < startHb) {
      hba1cImproved++;
    }

    // ⚖️ Weight improvement
    const startWt = toNumber(m["START WEIGHT"]);
    const lastWt = toNumber(m["LAST WEIGHT"]);
    if (startWt !== null && lastWt !== null && lastWt < startWt) {
      weightImproved++;
    }
  });

  const pct = (count) =>
    totalMembers === 0 ? 0 : Math.round((count / totalMembers) * 100);

  return {
    totalMembers,

    mealFollowers,
    mealFollowersPct: pct(mealFollowers),

    activeUsers,
    activePct: pct(activeUsers),

    hba1cImproved,
    hba1cImprovedPct: pct(hba1cImproved),

    weightImproved,
    weightImprovedPct: pct(weightImproved),
  };
}

// ================= CORRELATION DATA =================
function buildCorrelationData(members) {
  return members.map((m) => {
    const startWeight = toNumber(m["START WEIGHT"]);
    const lastWeight = toNumber(m["LAST WEIGHT"]);

    const startHbA1c = toNumber(m["START HbA1c"]);
    const lastHbA1c = toNumber(m["LAST HbA1c"]);

    return {
      memberId: m["MEMBER_ID"],

      // % values (0–100)
      mealLog7dPct: normalizePercent(m["7D MEAL LOG %"]),
      gfy7dPct: normalizePercent(m["7D GFY %"]),

      // engagement
      appUsage7dMin: toNumber(m["app usege min 7d"]),

      // raw deltas (lbs & HbA1c units)
      weightChangeLbs:
        startWeight !== null && lastWeight !== null
          ? lastWeight - startWeight
          : null,

      hba1cChange:
        startHbA1c !== null && lastHbA1c !== null
          ? lastHbA1c - startHbA1c
          : null,
    };
  });
}

module.exports = {
  calculateOverview,
  buildCorrelationData,
};
