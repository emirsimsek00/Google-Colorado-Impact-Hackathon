import React, { useEffect, useId, useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  FileText,
  Flame,
  GitBranch,
  HeartPulse,
  Info,
  Layers,
  LayoutDashboard,
  LockKeyhole,
  Map,
  Menu,
  Minus,
  Network,
  Plus,
  Radio,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TriangleAlert,
  Truck,
  Users,
  X,
  Zap,
} from "lucide-react";
import NetworkMap from "./NetworkMap.jsx";
import {
  CREWS,
  INITIAL_LINES,
  STRATEGIES,
  cloneLines,
  demoUpdate,
  formatNumber as fmt,
  gate,
  rankTasks,
  simulate,
} from "./model.js";

const SOURCES = [
  {
    title: "Inspections before restoration",
    org: "Xcel Energy · Dec 23, 2025",
    url: "https://stories.xcelenergy.com/stories/thank-you-colorado-for-helping-us-keep-our-communities-safe",
    text: "After a PSPS, crews inspect each stretch of line and repair damage before service can be restored.",
  },
  {
    title: "Established restoration priorities",
    org: "Edison Electric Institute",
    url: "https://www.eei.org/issues-and-policy/reliability-emergency-response",
    text: "Critical services and large service areas already feature in utility restoration plans. This concept focuses on revising the plan as reports change.",
  },
  {
    title: "Critical customers and communication",
    org: "Colorado PUC · Oct 10, 2024",
    url: "https://puc.colorado.gov/press-release/the-colorado-public-utilities-commission-adopts-interim-recommendations-to-increase",
    text: "Historical recommendations include enhanced critical-customer notifications and testing messages to medical-equipment-dependent customers; this is not a complete statement of current law.",
  },
  {
    title: "Colorado restoration example",
    org: "Xcel Energy · Dec 2025",
    url: "https://newsroom.xcelenergy.com/news/restoration-work-underway-as-xcel-energy-prepares-for-public-safety-power-shutoff-friday",
    text: "Xcel reported restoration could take several days, with inspection and repair required. This does not establish a universal 48-hour inspection time.",
  },
];
const NAV = [
  ["overview", "Overview", LayoutDashboard],
  ["network", "Network map", Map],
  ["priorities", "Priority board", Layers],
  ["crews", "Crew coordination", Truck],
  ["activity", "Field updates", Radio],
];
const STATUS = {
  awaiting: { label: "Awaiting inspection", color: "#1a73e8" },
  inspected: { label: "Inspected", color: "#188038" },
  repair: { label: "Repair needed", color: "#e8a100" },
};
const FINDINGS = {
  backup: "Hospital backup power lost",
  access: "Unsafe access + damage found",
  crew: "Additional crew available",
};

function Button({
  children,
  icon: Icon,
  kind = "secondary",
  className = "",
  ...props
}) {
  return (
    <button className={`button ${kind} ${className}`} {...props}>
      {Icon && <Icon size={16} aria-hidden="true" />}
      {children}
    </button>
  );
}
function Badge({ children, tone = "neutral" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function Dialog({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    d.showModal();
    return () => d.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={`dialog ${wide ? "wide" : ""}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-heading">
        <h2 id={titleId}>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

function Comparison({ lines, crewCount, onClose }) {
  const [compareTo, setCompareTo] = useState("equity");
  const maxTime = Math.max(
    simulate(lines, "balanced", crewCount).horizon,
    simulate(lines, compareTo, crewCount).horizon,
  );
  const baseline = simulate(lines, "balanced", crewCount, maxTime);
  const alternative = simulate(lines, compareTo, crewCount, maxTime);
  const equal =
    baseline.exposure === alternative.exposure &&
    baseline.facilityExposure === alternative.facilityExposure &&
    baseline.makespan === alternative.makespan;
  return (
    <Dialog title="Compare planning approaches" onClose={onClose} wide>
      <p className="dialog-intro">
        Same network. Same hard safety gates. Different trade-offs for the
        operator to review.
      </p>
      <label className="field-label">
        Alternative approach
        <select
          value={compareTo}
          onChange={(e) => setCompareTo(e.target.value)}
        >
          {Object.entries(STRATEGIES)
            .filter(([k]) => k !== "balanced")
            .map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
        </select>
      </label>
      {equal && (
        <div className="notice">
          <Info size={18} />
          <p>
            <strong>Same modeled outcomes.</strong> Available crews and upstream
            constraints leave no measured advantage for either approach in this
            synthetic scenario.
          </p>
        </div>
      )}
      <div className="comparison-grid">
        {[
          ["Balanced", baseline],
          [STRATEGIES[compareTo].label, alternative],
        ].map(([label, sim]) => (
          <section className="comparison-column" key={label}>
            <h3>{label}</h3>
            <div className="comparison-stat">
              {sim.makespan.toFixed(1)}
              <span>h scheduled work complete</span>
            </div>
            <div className="schedule">
              {sim.jobs.map((job) => {
                const line = lines.find((l) => l.id === job.id);
                return (
                  <div className="schedule-row" key={job.id}>
                    <span>{line.short}</span>
                    <div className="schedule-track">
                      <div
                        style={{
                          marginLeft: `${(job.start / maxTime) * 100}%`,
                          width: `${((job.end - job.start) / maxTime) * 100}%`,
                        }}
                      />
                    </div>
                    <small>{job.end.toFixed(1)}h</small>
                  </div>
                );
              })}
            </div>
            <dl className="comparison-metrics">
              <div>
                <dt>Customer-hours to field clearance</dt>
                <dd>{fmt(sim.exposure)}</dd>
              </div>
              <div>
                <dt>Facility-hours to field clearance</dt>
                <dd>{sim.facilityExposure.toFixed(1)}</dd>
              </div>
              <div>
                <dt>Lines unresolved by model horizon</dt>
                <dd>{sim.unresolved}</dd>
              </div>
            </dl>
          </section>
        ))}
      </div>
      <div className="notice">
        <Info size={18} />
        <p>
          <strong>Illustrative planning proxy, not an outage forecast.</strong>{" "}
          {crewCount} interchangeable crews, fixed work durations, no travel, no
          new findings; unresolved lines accrue time through a common{" "}
          {maxTime.toFixed(1)}h horizon. Actual crew roles are not modeled here.
          Field clearance does not mean power is restored. Overlapping pathway
          counts are never summed.
        </p>
      </div>
    </Dialog>
  );
}

export default function App() {
  const [lines, setLines] = useState(cloneLines);
  const [strategy, setStrategy] = useState("balanced");
  const [crewCount, setCrewCount] = useState(2);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState("L03");
  const [activeNav, setActiveNav] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoType, setDemoType] = useState("backup");
  const [applied, setApplied] = useState([]);
  const [revision, setRevision] = useState(1);
  const [reviewed, setReviewed] = useState(false);
  const [toast, setToast] = useState("");
  const [events, setEvents] = useState([
    {
      title: "Initial inspection plan prepared",
      detail:
        "Aspen junction leads under the balanced approach. All incident data is synthetic.",
      time: "Scenario start",
      type: "start",
    },
  ]);
  const tasks = rankTasks(lines, strategy);
  const eligible = tasks.filter((l) => l.eligible);
  const blocked = tasks.filter((l) => !l.eligible);
  const unsafe = lines.filter((l) => !l.safe);
  const line =
    tasks.find((l) => l.id === selected) ||
    lines.find((l) => l.id === selected);
  const backupLost = !!lines.find((l) => l.id === "L02").backupLost;
  const pendingFacilities = lines
    .filter((l) => l.status !== "inspected")
    .flatMap((l) => l.facilities).length;
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function runDemo() {
    if (applied.includes(demoType)) return;
    const oldLead = eligible[0]?.name;
    let next = lines;
    let detail;
    if (demoType === "backup") {
      next = lines.map((l) =>
        l.id === "L02" ? { ...l, backupLost: true } : l,
      );
      detail =
        "Juniper hospital reports loss of backup power. Its pathway receives an explicit urgency boost; safety gates stay in force.";
    } else if (demoType === "access") {
      next = demoUpdate(lines);
      detail =
        "Juniper access is unsafe; it is excluded from eligible work. Aspen damage changes its work estimate to 1.8h. Downstream lines remain blocked.";
    } else {
      setCrewCount(3);
      detail =
        "Crew Charlie is available in the synthetic mutual-aid scenario. The model can schedule three tasks in parallel; the priority policy is unchanged. No request was sent.";
    }
    const newLead = rankTasks(next, strategy).find((l) => l.eligible)?.name;
    setLines(next);
    setApplied((a) => [...a, demoType]);
    setRevision((r) => r + 1);
    setReviewed(false);
    setEvents((e) => [
      {
        title: FINDINGS[demoType],
        detail: `${detail} ${demoType !== "crew" ? `${oldLead} → ${newLead}.` : ""}`,
        time: `Update ${revision}`,
        type: demoType,
      },
      ...e,
    ]);
    setToast(`${FINDINGS[demoType]}. Recommendations updated for review.`);
    if (newLead)
      setSelected(rankTasks(next, strategy).find((l) => l.eligible).id);
  }
  function reset() {
    setLines(cloneLines());
    setStrategy("balanced");
    setCrewCount(2);
    setApplied([]);
    setRevision(1);
    setReviewed(false);
    setSelected("L03");
    setDemoType("backup");
    setEvents([
      {
        title: "Initial inspection plan prepared",
        detail:
          "Aspen junction leads under the balanced approach. All incident data is synthetic.",
        time: "Scenario start",
        type: "start",
      },
    ]);
    setToast("Presentation scenario reset.");
    setModal(null);
  }
  function changeStrategy(value) {
    setStrategy(value);
    setReviewed(false);
    setRevision((r) => r + 1);
    setEvents((e) => [
      {
        title: `${STRATEGIES[value].label} approach selected`,
        detail:
          "Eligible tasks re-ranked. Safety and upstream dependencies remain hard constraints.",
        time: `Update ${revision}`,
        type: "policy",
      },
      ...e,
    ]);
  }
  function navigate(id) {
    setActiveNav(id);
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  }
  function exportSnapshot() {
    const data = {
      prototype: "Gridwell presentation demo — synthetic data only",
      revision,
      strategy,
      crewCount,
      lines,
      rankedTasks: tasks,
      events,
      operatorReviewed: reviewed,
      limitations:
        "No AI service, actual utility integration, switching, medical records, or external communication. Ranking is deterministic and illustrative.",
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "gridwell-synthetic-snapshot.json";
    a.click();
    URL.revokeObjectURL(url);
    setToast("Synthetic scenario snapshot downloaded.");
  }

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to dashboard
      </a>
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <a
          className="brand"
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            navigate("overview");
          }}
        >
          <span className="brand-mark">
            <Network size={23} strokeWidth={1.8} />
          </span>
          gridwell
        </a>
        <div className="workspace-label">
          <span className="workspace-icon">
            <Zap size={16} />
          </span>
          <div>Colorado resilience</div>
          <ChevronDown size={14} />
        </div>
        <nav aria-label="Dashboard navigation">
          {NAV.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`nav-item ${activeNav === id ? "active" : ""}`}
              aria-current={activeNav === id ? "location" : undefined}
            >
              <Icon size={19} />
              {label}
              {id === "activity" && applied.length > 0 && (
                <span className="nav-count">{applied.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => setModal("sources")}>
            <CircleHelp size={18} />
            About this demo
            <ArrowUpRight size={14} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Menu size={21} />
            </button>
            <strong>Boulder County, Colorado</strong>
          </div>
          <div className="topbar-right">
            <span className="synthetic-label">
              <span className="status-dot" />
              Synthetic scenario
            </span>

            <button
              className="icon-button"
              aria-label="About this prototype"
              onClick={() => setModal("sources")}
            >
              <Info size={19} />
            </button>
          </div>
        </header>
        <main id="main">
          <div id="overview" className="page-heading">
            <div>
              <h1>Restoration overview</h1>
              <p>Valley district · Wildfire safety shutoff</p>
            </div>
            <div className="heading-actions">
              <Button icon={RotateCcw} kind="ghost" onClick={reset}>
                Reset demo
              </Button>
              <Button
                icon={SlidersHorizontal}
                onClick={() => setModal("compare")}
              >
                Compare scenarios
              </Button>
            </div>
          </div>
          <section className="metrics" aria-label="Synthetic incident summary">
            <div className="metric">
              <span className="metric-label">
                Customers without power
                <Users size={17} />
              </span>
              <strong>3,420</strong>
            </div>
            <div className="metric">
              <span className="metric-label">
                Critical facilities affected
                <HeartPulse size={17} />
              </span>
              <strong>{pendingFacilities}</strong>
            </div>
            <div className="metric">
              <span className="metric-label">
                Crews available
                <Truck size={17} />
              </span>
              <strong>{crewCount}</strong>
            </div>
            <div className="metric hazard-metric">
              <span className="metric-label">
                Blocked by unsafe access
                <ShieldCheck size={17} />
              </span>
              <strong>{unsafe.length}</strong>
            </div>
          </section>
          <section
            className="demo-bar"
            aria-label="Interactive presentation controls"
          >
            <div className="demo-bar-icon">
              <Radio size={20} />
            </div>
            <div className="demo-copy">
              <strong>Scenario update</strong>
            </div>
            <div className="demo-actions">
              <label className="sr-only" htmlFor="demo-event">
                Demo event
              </label>
              <select
                id="demo-event"
                value={demoType}
                onChange={(e) => setDemoType(e.target.value)}
              >
                {Object.entries(FINDINGS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                    {applied.includes(key) ? " (applied)" : ""}
                  </option>
                ))}
              </select>
              <Button
                kind="primary"
                icon={applied.includes(demoType) ? Check : ArrowRight}
                onClick={runDemo}
                disabled={applied.includes(demoType)}
              >
                {applied.includes(demoType) ? "Applied" : "Run field update"}
              </Button>
            </div>
          </section>
          <div className="safety-strip">
            <ShieldCheck size={16} />
            <span>
              Unsafe and upstream-blocked work stays excluded. Operators
              authorize restoration.
            </span>
            <LockKeyhole size={14} />
          </div>
          <div className="main-grid">
            <NetworkMap
              lines={lines}
              selected={selected}
              backupLost={backupLost}
              onSelect={(id) => {
                setSelected(id);
                setModal("line");
              }}
            />
            <section
              className="panel priority-panel"
              id="priorities"
              aria-labelledby="priorities-title"
            >
              <div className="panel-heading">
                <div>
                  <h2 id="priorities-title">Recommended next steps</h2>
                  <p>{reviewed ? "Reviewed" : "Awaiting operator review"}</p>
                </div>
              </div>
              <div className="priority-policy">
                <span>
                  <SlidersHorizontal size={14} />
                  Planning approach
                </span>
                <label className="sr-only" htmlFor="strategy">
                  Planning approach
                </label>
                <select
                  id="strategy"
                  value={strategy}
                  onChange={(e) => changeStrategy(e.target.value)}
                >
                  {Object.entries(STRATEGIES).map(([key, v]) => (
                    <option key={key} value={key}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="priority-list">
                {eligible.map((task, i) => (
                  <button
                    className={`task ${i === 0 ? "top-task" : ""}`}
                    key={task.id}
                    onClick={() => {
                      setSelected(task.id);
                      setModal("line");
                    }}
                  >
                    <span className={`task-number ${i === 0 ? "first" : ""}`}>
                      {i + 1}
                    </span>
                    <div className="task-content">
                      <div className="task-title">
                        <strong>{task.name}</strong>
                        <ArrowUpRight size={15} />
                      </div>
                      <div className="task-stats">
                        <span>
                          {fmt(task.affectedCustomers)} customers on pathway
                        </span>
                        <span>
                          {task.status === "repair" ? "Repair" : "Inspect"} ·{" "}
                          {task.hours}h
                        </span>
                      </div>
                      <p
                        className={`task-reason ${task.backupLost ? "urgent-reason" : ""}`}
                      >
                        {task.backupLost
                          ? "Hospital backup power lost"
                          : task.rural
                            ? `${task.outage}h without power`
                            : task.affectedCustomers > task.customers
                              ? "Unlocks downstream work"
                              : task.affectedFacilities.join(" · ") ||
                                "Customer access pathway"}
                      </p>
                    </div>
                  </button>
                ))}
                {eligible.length === 0 && (
                  <div className="empty-state">
                    <ShieldCheck size={24} />
                    <h3>No work is currently eligible</h3>
                    <p>Safety and upstream constraints require reassessment.</p>
                  </div>
                )}
              </div>
              <button
                className="blocked-summary"
                onClick={() => setModal("blocked")}
              >
                <span>
                  <LockKeyhole size={14} />
                  {blocked.length} blocked lines
                </span>
                <ChevronRight size={16} />
              </button>
              <div className="priority-footer">
                <Button
                  kind={reviewed ? "reviewed" : "primary"}
                  icon={reviewed ? CheckCheck : Check}
                  onClick={() => setModal("review")}
                >
                  {reviewed
                    ? "Plan reviewed · view summary"
                    : "Review proposed plan"}
                </Button>
              </div>
            </section>
          </div>
          <div className="bottom-grid">
            <section className="panel activity-panel" id="activity">
              <div className="panel-heading">
                <div>
                  <h2>Latest update</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => setModal("activity")}
                >
                  View history
                </button>
              </div>
              <div className="event-list" aria-live="polite">
                {events.slice(0, 1).map((event, i) => (
                  <article
                    className="event"
                    key={`${event.title}-${event.time}`}
                  >
                    <span
                      className={`event-mark ${event.type === "access" ? "warning" : ""}`}
                    >
                      {event.type === "access" ? (
                        <TriangleAlert size={15} />
                      ) : event.type === "crew" ? (
                        <Truck size={15} />
                      ) : (
                        <Radio size={15} />
                      )}
                    </span>
                    <div>
                      <div className="event-heading">
                        <h3>{event.title}</h3>
                      </div>
                      <p>
                        {event.type === "backup"
                          ? "Juniper moves to first priority."
                          : event.type === "access"
                            ? "Juniper blocked. Aspen now needs repair."
                            : event.type === "crew"
                              ? "Crew Charlie joins the available crews."
                              : `${eligible[0]?.name || "No eligible line"} leads the current plan.`}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="panel crew-panel" id="crews">
              <div className="panel-heading">
                <div>
                  <h2>Crews</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => setModal("crews")}
                >
                  Details
                </button>
              </div>
              <div className="crew-list">
                {CREWS.map((crew, i) => (
                  <div className="crew" key={crew.id}>
                    <div>
                      <strong>{crew.name}</strong>
                    </div>
                    <Badge tone={i < crewCount ? "sage" : "neutral"}>
                      {i < crewCount ? "Available" : "Standby"}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <footer className="page-footer">
            <button onClick={() => setModal("sources")}>
              Sources & assumptions
              <ArrowUpRight size={14} />
            </button>
          </footer>
        </main>
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {toast}
      </div>
      {modal === "activity" && (
        <Dialog title="Field update history" onClose={() => setModal(null)}>
          {events.map((event) => (
            <article
              className="history-entry"
              key={`${event.title}-${event.time}`}
            >
              <h3>{event.title}</h3>
              <p>{event.detail}</p>
            </article>
          ))}
        </Dialog>
      )}
      {modal === "crews" && (
        <Dialog title="Crew details" onClose={() => setModal(null)}>
          {CREWS.map((crew, i) => (
            <article className="history-entry" key={crew.id}>
              <h3>
                {crew.name} · {i < crewCount ? "Available" : "Standby"}
              </h3>
              <p>
                {crew.role}
                {i === 2
                  ? " · Partner service area, simulated mutual aid"
                  : " · Valley district"}
              </p>
            </article>
          ))}
          <div className="notice">
            <Info size={18} />
            <p>
              Availability is simulated. No crew requests or messages are sent.
            </p>
          </div>
        </Dialog>
      )}
      {modal === "compare" && (
        <Comparison
          lines={lines}
          crewCount={crewCount}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "line" && line && (
        <Dialog title={line.name} onClose={() => setModal(null)}>
          <div className="detail-top">
            <Badge tone={!line.safe ? "coral" : "sage"}>
              {!line.safe ? "Unsafe access" : STATUS[line.status].label}
            </Badge>
            <span>{line.id} · Synthetic segment</span>
          </div>
          <p className="detail-reason">
            {line.reason || gate(line, lines).reason}
          </p>
          <dl className="detail-grid">
            <div>
              <dt>Direct customers</dt>
              <dd>{fmt(line.customers)}</dd>
            </div>
            <div>
              <dt>Pathway customers</dt>
              <dd>{fmt(line.affectedCustomers ?? line.customers)}</dd>
            </div>
            <div>
              <dt>Estimated work</dt>
              <dd>{line.hours}h</dd>
            </div>
            <div>
              <dt>Time without power</dt>
              <dd>{line.outage}h</dd>
            </div>
          </dl>
          <h3>Safety & dependency checks</h3>
          <div className="check-list">
            <p>
              {line.safe ? <Check size={17} /> : <LockKeyhole size={17} />}
              <span>
                {line.safe
                  ? "Access considered safe in this scenario"
                  : line.hazard}
              </span>
            </p>
            <p>
              {gate(line, lines).kind === "dependency" ? (
                <LockKeyhole size={17} />
              ) : (
                <GitBranch size={17} />
              )}
              <span>
                {gate(line, lines).kind === "dependency"
                  ? gate(line, lines).reason
                  : "Upstream inspection work complete"}
              </span>
            </p>
          </div>
          {line.affectedFacilities?.length > 0 && (
            <>
              <h3>Critical facilities on this pathway</h3>
              <p>{line.affectedFacilities.join(" · ")}</p>
            </>
          )}
          {line.points && (
            <>
              <h3>How the illustrative score is built</h3>
              <div className="score-breakdown">
                {Object.entries(line.points).map(([name, value]) => (
                  <div key={name}>
                    <span>
                      {
                        {
                          critical: "Critical facilities",
                          reach: "Customer reach / work hour",
                          waiting: "Hours waiting",
                          rural: "Small-community weight",
                          backup: "Backup-loss urgency",
                        }[name]
                      }
                    </span>
                    <strong>{value.toFixed(1)}</strong>
                  </div>
                ))}
                <div className="score-total">
                  <span>Total score</span>
                  <strong>{line.score.toFixed(1)}</strong>
                </div>
              </div>
              <p className="small muted">
                Weights are synthetic design choices, not validated utility
                policy. An unsafe or upstream-blocked task stays ineligible
                regardless of score.
              </p>
            </>
          )}
          <div className="notice">
            <ShieldCheck size={18} />
            <p>
              Inspection estimates are not restoration times. Human operators
              retain all operating authority.
            </p>
          </div>
        </Dialog>
      )}
      {modal === "blocked" && (
        <Dialog
          title="Held for safety or dependencies"
          onClose={() => setModal(null)}
        >
          <p className="dialog-intro">
            These lines are excluded before impact scores are considered.
          </p>
          {blocked.map((t) => (
            <button
              className="blocked-row"
              key={t.id}
              onClick={() => {
                setSelected(t.id);
                setModal("line");
              }}
            >
              <span
                className={`event-mark ${t.kind === "hazard" ? "warning" : ""}`}
              >
                <LockKeyhole size={16} />
              </span>
              <div>
                <strong>{t.name}</strong>
                <p>{t.reason}</p>
              </div>
              <ChevronRight size={17} />
            </button>
          ))}
        </Dialog>
      )}
      {modal === "review" && (
        <Dialog title="Operator review" onClose={() => setModal(null)}>
          <p className="dialog-intro">
            Review this proposed sequence. Pathway counts include downstream
            customers and must not be added. This demo records a local review
            only.
          </p>
          <ol className="review-list">
            {eligible.map((t) => (
              <li key={t.id}>
                <strong>{t.name}</strong>
                <span>{t.reason}</span>
              </li>
            ))}
          </ol>
          <div className="notice">
            <ShieldCheck size={18} />
            <p>
              {blocked.length} constrained tasks excluded. This action cannot
              dispatch crews, share information, or energize equipment.
            </p>
          </div>
          <Button
            kind="primary"
            icon={CheckCheck}
            onClick={() => {
              setReviewed(true);
              setModal(null);
              setToast(
                `Plan v${revision} marked reviewed in this tab. No operational action taken.`,
              );
            }}
          >
            Mark plan reviewed
          </Button>
        </Dialog>
      )}
      {modal === "sources" && (
        <Dialog
          title="About this presentation demo"
          onClose={() => setModal(null)}
          wide
        >
          <p className="dialog-intro">
            Gridwell explores a simple question: what should the operator
            inspect or repair next when conditions change?
          </p>
          <div className="sources-intro">
            <h3>The team's question</h3>
            <blockquote>
              “What if we can efficiently and intelligently prioritize powerline
              repair for high risk areas/customers? (Reactive)”
            </blockquote>
          </div>
          <div className="sources-grid">
            <section>
              <h3>What is actually running</h3>
              <p>
                A browser-local dashboard with a real Colorado basemap and
                fictional feeder network, using deterministic scoring. Safety
                and upstream checks precede ranking. Demo events update the
                network, reasons, queue, and crew availability. Refresh or reset
                returns to the initial scenario.
              </p>
              <h3>Privacy & authority</h3>
              <p>
                No customer records, medical data, credentials, or utility
                connections. The basemap shows real public geography; all feeder
                assets and facilities are simulated. Map requests go to
                OpenFreeMap; internet access is required. Community
                vulnerability is represented only by a synthetic
                small-community/time-waiting weight. Medical dependence would
                require separate, authorized coordination—not a promise to
                prioritize individual homes.
              </p>
              <h3>Possible Google technology fit</h3>
              <p>
                Future proposal:{" "}
                <a
                  href="https://docs.cloud.google.com/bigquery/docs/geospatial-data"
                  target="_blank"
                  rel="noreferrer"
                >
                  BigQuery geospatial
                </a>{" "}
                for authorized area-level joins, and{" "}
                <a
                  href="https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/ground-with-google-search"
                  target="_blank"
                  rel="noreferrer"
                >
                  Vertex AI
                </a>{" "}
                for source-grounded summaries subject to operator review.
                Neither service is integrated here.
              </p>
              <h3>Data a real pilot would need</h3>
              <p>
                Utility-authorized topology, feeder-level customer counts, crew
                skills and estimates, facility backup status, field reports,
                approved access and weather feeds. Cross-utility coordination
                requires participation and permissioned data sharing. Public
                outage maps do not provide all these inputs.
              </p>
            </section>
            <section>
              <h3>Verified background sources</h3>
              {SOURCES.map((s) => (
                <a
                  className="source"
                  href={s.url}
                  key={s.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div>
                    <strong>{s.title}</strong>
                    <ArrowUpRight size={15} />
                  </div>
                  <small>{s.org}</small>
                  <p>{s.text}</p>
                </a>
              ))}
              <p className="small muted">
                The uploaded 2026 challenge and 2025 worksheet informed the
                context and presentation flow. The worksheet is a reference, not
                verified 2026 rules. The prototype makes no certification or
                blanket legal-compliance claim.
              </p>
            </section>
          </div>
          <Button icon={Download} onClick={exportSnapshot}>
            Export synthetic scenario
          </Button>
        </Dialog>
      )}
    </div>
  );
}
