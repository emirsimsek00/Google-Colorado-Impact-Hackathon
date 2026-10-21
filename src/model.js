export const INITIAL_LINES = [
  {
    id: "S00",
    name: "Valley substation",
    short: "Valley substation",
    parent: null,
    customers: 0,
    facilities: [],
    hours: 0,
    outage: 0,
    status: "inspected",
    safe: true,
    x: 82,
    y: 245,
  },
  {
    id: "L01",
    name: "Foothill trunk",
    short: "Foothill trunk",
    parent: "S00",
    customers: 0,
    facilities: [],
    hours: 0.5,
    outage: 6,
    status: "inspected",
    safe: true,
    x: 225,
    y: 245,
  },
  {
    id: "L02",
    name: "Juniper health corridor",
    short: "Juniper health",
    parent: "L01",
    customers: 740,
    facilities: ["Juniper hospital", "Juniper shelter"],
    hours: 1.2,
    outage: 6,
    status: "awaiting",
    safe: true,
    x: 368,
    y: 112,
  },
  {
    id: "L03",
    name: "Aspen junction",
    short: "Aspen junction",
    parent: "L01",
    customers: 360,
    facilities: ["Aspen water works"],
    hours: 0.8,
    outage: 6,
    status: "awaiting",
    safe: true,
    x: 400,
    y: 245,
  },
  {
    id: "L04",
    name: "Mesa neighborhood",
    short: "Mesa neighborhood",
    parent: "L03",
    customers: 1280,
    facilities: [],
    hours: 1.5,
    outage: 6,
    status: "awaiting",
    safe: true,
    x: 588,
    y: 198,
  },
  {
    id: "L05",
    name: "Pine hollow",
    short: "Pine hollow",
    parent: "L01",
    customers: 140,
    facilities: [],
    hours: 1,
    outage: 11,
    rural: true,
    status: "awaiting",
    safe: true,
    x: 298,
    y: 385,
  },
  {
    id: "L06",
    name: "Canyon spur",
    short: "Canyon spur",
    parent: "L01",
    customers: 260,
    facilities: [],
    hours: 2,
    outage: 7,
    status: "repair",
    safe: false,
    hazard: "Fire perimeter restricts access",
    x: 164,
    y: 100,
  },
  {
    id: "L07",
    name: "Cedar village",
    short: "Cedar village",
    parent: "L03",
    customers: 640,
    facilities: [],
    hours: 1,
    outage: 8,
    status: "awaiting",
    safe: true,
    x: 574,
    y: 354,
  },
];
export const CREWS = [
  {
    id: "A",
    name: "Crew Alpha",
    initials: "A",
    role: "Inspection + repair",
    repair: true,
  },
  {
    id: "B",
    name: "Crew Bravo",
    initials: "B",
    role: "Inspection",
    repair: false,
  },
  {
    id: "C",
    name: "Crew Charlie",
    initials: "C",
    role: "Inspection + repair",
    repair: true,
  },
];
export const STRATEGIES = {
  balanced: {
    label: "Balanced",
    detail: "Critical services, reach, and time waiting",
    critical: 40,
    reach: 2,
    waiting: 3,
    rural: 12,
  },
  critical: {
    label: "Critical services",
    detail: "Give critical-facility pathways more weight",
    critical: 80,
    reach: 1,
    waiting: 1,
    rural: 0,
  },
  equity: {
    label: "Longest waiting",
    detail: "Elevate long outages and small communities",
    critical: 12,
    reach: 0.5,
    waiting: 9,
    rural: 50,
  },
  reach: {
    label: "Customer reach",
    detail: "Favor more customers per modeled work hour",
    critical: 8,
    reach: 8,
    waiting: 0.5,
    rural: 0,
  },
};
export const cloneLines = () => structuredClone(INITIAL_LINES);
export const formatNumber = (n) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
export function descendants(line, lines, seen = new Set()) {
  if (seen.has(line.id)) return [];
  seen.add(line.id);
  return [
    line,
    ...lines
      .filter((l) => l.parent === line.id)
      .flatMap((l) => descendants(l, lines, seen)),
  ];
}
export function gate(line, lines) {
  const ancestors = [];
  const seen = new Set([line.id]);
  let parentId = line.parent;
  while (parentId) {
    if (seen.has(parentId))
      return {
        eligible: false,
        kind: "dependency",
        reason: "Invalid circular dependency",
      };
    seen.add(parentId);
    const parent = lines.find((l) => l.id === parentId);
    if (!parent)
      return {
        eligible: false,
        kind: "dependency",
        reason: "Missing upstream information",
      };
    ancestors.push(parent);
    parentId = parent.parent;
  }
  const unsafe = [line, ...ancestors].find((l) => !l.safe);
  if (unsafe)
    return {
      eligible: false,
      kind: "hazard",
      reason: `${unsafe.name}: ${unsafe.hazard || "Access is unsafe"}`,
    };
  const upstream = ancestors.find((l) => l.status !== "inspected");
  if (upstream)
    return {
      eligible: false,
      kind: "dependency",
      reason: `Waiting for ${upstream.name}`,
    };
  if (line.status === "inspected")
    return {
      eligible: false,
      kind: "complete",
      reason:
        "Inspection / repair work complete; operating clearance still required",
    };
  return {
    eligible: true,
    kind: "eligible",
    reason: "Access safe in scenario · upstream work complete",
  };
}
export function rankTasks(lines, strategy = "balanced") {
  const weights = STRATEGIES[strategy] || STRATEGIES.balanced;
  return lines
    .filter((l) => l.parent && l.status !== "inspected")
    .map((line) => {
      const affected = descendants(line, lines);
      const customers = affected.reduce((n, l) => n + l.customers, 0);
      const facilities = affected.flatMap((l) => l.facilities);
      const points = {
        critical: facilities.length * weights.critical,
        reach: (customers / 100 / line.hours) * weights.reach,
        waiting: line.outage * weights.waiting,
        rural: line.rural ? weights.rural : 0,
        backup: line.backupLost ? 180 : 0,
      };
      const score = Object.values(points).reduce((a, b) => a + b, 0);
      const eligibility = gate(line, lines);
      const reason = !eligibility.eligible
        ? eligibility.reason
        : line.backupLost
          ? "Hospital backup power lost · urgent critical-service pathway"
          : line.rural && (strategy === "equity" || line.outage >= 10)
            ? `${line.outage}h waiting · small-community review priority`
            : facilities.length
              ? `Pathway to ${facilities.length} critical ${facilities.length === 1 ? "facility" : "facilities"} · ${formatNumber(customers)} customers`
              : `${formatNumber(customers)} customers along this pathway · ${line.hours}h modeled work`;
      return {
        ...line,
        ...eligibility,
        affectedCustomers: customers,
        affectedFacilities: facilities,
        points,
        score,
        reason,
      };
    })
    .sort(
      (a, b) =>
        Number(b.eligible) - Number(a.eligible) ||
        b.score - a.score ||
        a.id.localeCompare(b.id),
    );
}
export function applyReport(lines, { lineId, finding }) {
  const target = lines.find((l) => l.id === lineId);
  if (!target || !target.parent)
    throw new Error("Choose a valid line segment.");
  if (!["unsafe", "damage", "clear", "inspected"].includes(finding))
    throw new Error("Choose a valid finding.");
  if (finding === "inspected" && !gate(target, lines).eligible)
    throw new Error(
      "Work cannot be marked complete while safety or upstream work blocks it.",
    );
  return lines.map((l) =>
    l.id !== lineId
      ? l
      : finding === "unsafe"
        ? {
            ...l,
            safe: false,
            hazard: "Field report: unsafe access; reassessment required",
          }
        : finding === "damage"
          ? { ...l, status: "repair", hours: Math.max(1.8, l.hours) }
          : finding === "clear"
            ? { ...l, safe: true, hazard: undefined }
            : { ...l, status: "inspected" },
  );
}
export function demoUpdate(lines) {
  return applyReport(applyReport(lines, { lineId: "L02", finding: "unsafe" }), {
    lineId: "L03",
    finding: "damage",
  });
}
export function validateAssignment(lines, assignments, lineId, crewId) {
  const line = lines.find((l) => l.id === lineId);
  const crew = CREWS.find((c) => c.id === crewId);
  if (!line || !crew) return "Choose a valid line and crew.";
  if (!gate(line, lines).eligible) return gate(line, lines).reason;
  if (line.status === "repair" && !crew.repair)
    return `${crew.name} is inspection-only. Choose a repair-capable crew.`;
  if (
    Object.entries(assignments).some(([id, c]) => id !== lineId && c === crewId)
  )
    return `${crew.name} already has a proposed assignment.`;
  return null;
}
export function reconcileAssignments(lines, assignments) {
  return Object.fromEntries(
    Object.entries(assignments).filter(
      ([id, crewId]) => !validateAssignment(lines, assignments, id, crewId),
    ),
  );
}
// Illustrative list scheduler. It predicts work-clearance only, never electricity restoration.
// Two identical repair-capable crews, zero travel time, known work durations, no new damage.
export function simulate(lines, strategy, crewCount = 2, horizonFloor = 4) {
  let working = structuredClone(lines);
  const jobs = [];
  const running = [];
  let time = 0;
  for (let iteration = 0; iteration < 100; iteration++) {
    const eligible = rankTasks(working, strategy).filter(
      (l) => l.eligible && !running.some((j) => j.id === l.id),
    );
    while (running.length < crewCount && eligible.length) {
      const job = eligible.shift();
      running.push({
        id: job.id,
        start: time,
        end: time + job.hours,
        crew: Array.from({ length: crewCount }, (_, i) => i).find(
          (c) => !running.some((j) => j.crew === c),
        ),
      });
    }
    if (!running.length) break;
    time = Math.min(...running.map((j) => j.end));
    for (let j = running.length - 1; j >= 0; j--)
      if (running[j].end <= time) {
        const [done] = running.splice(j, 1);
        working = working.map((l) =>
          l.id === done.id ? { ...l, status: "inspected" } : l,
        );
        jobs.push(done);
      }
  }
  const horizon = Math.max(horizonFloor, time);
  const completion = new Map(jobs.map((j) => [j.id, j.end]));
  const pending = lines.filter((l) => l.parent && l.status !== "inspected");
  const exposure = pending.reduce(
    (n, l) => n + l.customers * (completion.get(l.id) ?? horizon),
    0,
  );
  const facilityExposure = pending.reduce(
    (n, l) => n + l.facilities.length * (completion.get(l.id) ?? horizon),
    0,
  );
  return {
    jobs,
    horizon,
    makespan: time,
    exposure,
    facilityExposure,
    unresolved: pending.filter((l) => !completion.has(l.id)).length,
  };
}
