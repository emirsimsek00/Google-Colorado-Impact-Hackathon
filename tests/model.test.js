import test from "node:test";
import assert from "node:assert/strict";
import {
  applyReport,
  cloneLines,
  demoUpdate,
  gate,
  rankTasks,
  simulate,
  STRATEGIES,
} from "../src/model.js";

test("initial queue favors the upstream Aspen pathway; direct counts are disjoint", () => {
  const lines = cloneLines();
  assert.equal(
    lines.reduce((sum, l) => sum + l.customers, 0),
    3420,
  );
  assert.deepEqual(
    rankTasks(lines)
      .filter((t) => t.eligible)
      .map((t) => t.id),
    ["L03", "L02", "L05"],
  );
  assert.equal(
    rankTasks(lines).find((t) => t.id === "L03").affectedCustomers,
    2280,
  );
});
test("backup loss changes priority without bypassing safety", () => {
  let lines = cloneLines().map((l) =>
    l.id === "L02" ? { ...l, backupLost: true } : l,
  );
  assert.equal(rankTasks(lines).find((t) => t.eligible).id, "L02");
  lines = applyReport(lines, { lineId: "L02", finding: "unsafe" });
  for (const strategy of Object.keys(STRATEGIES)) {
    assert.equal(
      rankTasks(lines, strategy).find((t) => t.id === "L02").eligible,
      false,
    );
  }
});
test("small communities can move ahead when the operator changes the weighting", () => {
  assert.equal(
    rankTasks(cloneLines(), "equity").find((t) => t.eligible).id,
    "L05",
  );
});
test("field findings exclude unsafe work and keep downstream tasks blocked", () => {
  const lines = demoUpdate(cloneLines());
  assert.equal(
    gate(
      lines.find((l) => l.id === "L02"),
      lines,
    ).kind,
    "hazard",
  );
  assert.equal(lines.find((l) => l.id === "L03").status, "repair");
  assert.equal(lines.find((l) => l.id === "L03").hours, 1.8);
  assert.equal(
    gate(
      lines.find((l) => l.id === "L04"),
      lines,
    ).kind,
    "dependency",
  );
});
test("unsafe upstream blocks descendants even when immediate parent was inspected", () => {
  const lines = cloneLines().map((l) =>
    l.id === "L01"
      ? { ...l, safe: false }
      : l.id === "L03"
        ? { ...l, status: "inspected" }
        : l,
  );
  assert.equal(
    gate(
      lines.find((l) => l.id === "L04"),
      lines,
    ).kind,
    "hazard",
  );
});
test("a safe inspection report unlocks downstream work and never clears a hazard implicitly", () => {
  const lines = applyReport(cloneLines(), {
    lineId: "L03",
    finding: "inspected",
  });
  assert.equal(
    gate(
      lines.find((l) => l.id === "L04"),
      lines,
    ).eligible,
    true,
  );
  assert.throws(
    () => applyReport(lines, { lineId: "L06", finding: "inspected" }),
    /cannot be marked complete/,
  );
});
test("missing and circular upstream information fails closed", () => {
  let lines = cloneLines().filter((l) => l.id !== "L01");
  assert.equal(
    gate(
      lines.find((l) => l.id === "L03"),
      lines,
    ).eligible,
    false,
  );
  lines = cloneLines().map((l) =>
    l.id === "L01" ? { ...l, parent: "L03" } : l,
  );
  assert.equal(
    gate(
      lines.find((l) => l.id === "L03"),
      lines,
    ).eligible,
    false,
  );
});
test("modeled schedule never overlaps a crew, schedules unsafe work, or starts before upstream clearance", () => {
  for (const strategy of Object.keys(STRATEGIES)) {
    const lines = demoUpdate(cloneLines());
    const sim = simulate(lines, strategy, 3);
    assert.ok(!sim.jobs.some((j) => ["L02", "L06"].includes(j.id)));
    for (const job of sim.jobs) {
      const line = lines.find((l) => l.id === job.id);
      const parent = sim.jobs.find((j) => j.id === line.parent);
      if (parent) assert.ok(job.start >= parent.end);
      for (const other of sim.jobs.filter(
        (j) => j.id !== job.id && j.crew === job.crew,
      )) {
        assert.ok(job.end <= other.start || job.start >= other.end);
      }
    }
  }
});
test("an extra crew changes parallel scheduling without claiming actual power restoration", () => {
  const two = simulate(cloneLines(), "balanced", 2);
  const three = simulate(cloneLines(), "balanced", 3);
  assert.ok(three.makespan < two.makespan);
  assert.ok(three.exposure < two.exposure);
  assert.equal(three.unresolved, 1);
});
test("comparison uses the same horizon and counts each customer once", () => {
  const lines = cloneLines();
  const horizon = 12;
  const sim = simulate(lines, "balanced", 2, horizon);
  const completion = new Map(sim.jobs.map((j) => [j.id, j.end]));
  const expected = lines
    .filter((l) => l.status !== "inspected")
    .reduce(
      (sum, l) => sum + l.customers * (completion.get(l.id) ?? horizon),
      0,
    );
  assert.equal(sim.exposure, expected);
  assert.equal(sim.horizon, 12);
  assert.equal(lines.find((l) => l.id === "L03").status, "awaiting");
});
