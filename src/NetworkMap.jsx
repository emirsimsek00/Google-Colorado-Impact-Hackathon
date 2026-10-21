import React, { useEffect, useRef, useState } from "react";
import {
  Map as LibreMap,
  Marker,
  ScaleControl,
  setWorkerUrl,
} from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { Crosshair, Minus, Plus, TriangleAlert } from "lucide-react";
import { formatNumber as fmt } from "./model.js";

setWorkerUrl(workerUrl);

const POINTS = {
  S00: [-105.205, 39.979],
  L01: [-105.329, 40.011],
  L02: [-105.367, 40.158],
  L03: [-105.478, 40.014],
  L04: [-105.518, 40.123],
  L05: [-105.391, 39.853],
  L06: [-105.465, 40.19],
  L07: [-105.517, 39.921],
};
const PATHS = {
  L01: [
    POINTS.S00,
    [-105.236, 39.987],
    [-105.262, 40.006],
    [-105.295, 40.008],
    POINTS.L01,
  ],
  L02: [
    POINTS.L01,
    [-105.333, 40.043],
    [-105.35, 40.067],
    [-105.344, 40.095],
    [-105.36, 40.123],
    POINTS.L02,
  ],
  L03: [
    POINTS.L01,
    [-105.36, 40.005],
    [-105.38, 40.017],
    [-105.415, 40.009],
    [-105.447, 40.024],
    POINTS.L03,
  ],
  L04: [
    POINTS.L03,
    [-105.489, 40.044],
    [-105.511, 40.065],
    [-105.505, 40.092],
    POINTS.L04,
  ],
  L05: [
    POINTS.L01,
    [-105.337, 39.984],
    [-105.358, 39.963],
    [-105.35, 39.932],
    [-105.379, 39.906],
    [-105.385, 39.875],
    POINTS.L05,
  ],
  L06: [
    POINTS.L01,
    [-105.364, 40.043],
    [-105.39, 40.068],
    [-105.402, 40.104],
    [-105.435, 40.131],
    [-105.441, 40.165],
    POINTS.L06,
  ],
  L07: [
    POINTS.L03,
    [-105.493, 39.991],
    [-105.48, 39.973],
    [-105.506, 39.955],
    POINTS.L07,
  ],
};
const STATES = {
  awaiting: { label: "Awaiting inspection", color: "#1a73e8" },
  inspected: { label: "Inspected", color: "#188038" },
  repair: { label: "Repair needed", color: "#e8a100" },
};
const colorFor = (line) => (line.safe ? STATES[line.status].color : "#d93025");
const routeData = (lines) => ({
  type: "FeatureCollection",
  features: lines
    .filter((l) => l.parent)
    .map((l) => ({
      type: "Feature",
      properties: {
        id: l.id,
        color: colorFor(l),
        status: l.status,
        safe: l.safe,
      },
      geometry: { type: "LineString", coordinates: PATHS[l.id] },
    })),
});

export default function NetworkMap({ lines, onSelect, selected }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const callback = useRef(onSelect);
  const markers = useRef([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [facilities, setFacilities] = useState(true);
  const [showNames, setShowNames] = useState(true);
  callback.current = onSelect;
  const fit = () =>
    mapRef.current?.fitBounds(
      [
        [-105.57, 39.82],
        [-105.14, 40.22],
      ],
      { padding: 42, duration: 0 },
    );

  useEffect(() => {
    const controller = new AbortController();
    let map;
    let resize;
    async function initialize() {
      try {
        await document.fonts.load('400 12px "Google Sans Variable"');
        const response = await fetch(
          "https://tiles.openfreemap.org/styles/positron",
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Map style unavailable");
        const style = await response.json();
        if (controller.signal.aborted) return;
        // With no glyph URL, MapLibre rasterizes the locally bundled Google Sans.
        delete style.glyphs;
        style.layers.forEach((layer) => {
          if (layer.type === "symbol" && layer.layout?.["text-field"]) {
            layer.layout["text-font"] = ["Google Sans Variable"];
          }
        });
        map = new LibreMap({
          container: container.current,
          style,
          center: [-105.36, 40.02],
          zoom: 10,
          attributionControl: { compact: false },
          dragRotate: false,
          pitchWithRotate: false,
          canvasContextAttributes: { preserveDrawingBuffer: true },
        });
        mapRef.current = map;
        map.scrollZoom.disable();
        map.touchZoomRotate.disableRotation();
        map.addControl(
          new ScaleControl({ maxWidth: 95, unit: "imperial" }),
          "bottom-left",
        );
        map.on("load", () => {
          map.addSource("demo-feeders", {
            type: "geojson",
            data: routeData(lines),
          });
          map.addLayer({
            id: "feeder-casing",
            type: "line",
            source: "demo-feeders",
            paint: {
              "line-color": "#ffffff",
              "line-width": 8,
              "line-opacity": 0.95,
            },
          });
          map.addLayer({
            id: "feeder-lines",
            type: "line",
            source: "demo-feeders",
            paint: { "line-color": ["get", "color"], "line-width": 4 },
          });
          map.addLayer({
            id: "feeder-hit",
            type: "line",
            source: "demo-feeders",
            paint: {
              "line-color": "#000000",
              "line-width": 22,
              "line-opacity": 0,
            },
          });
          map.addLayer({
            id: "feeder-selected",
            type: "line",
            source: "demo-feeders",
            filter: ["==", ["get", "id"], selected],
            paint: { "line-color": ["get", "color"], "line-width": 6 },
          });
          map.on("click", "feeder-hit", (e) => {
            if (e.features?.[0]) callback.current(e.features[0].properties.id);
          });
          map.on("mouseenter", "feeder-hit", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "feeder-hit", () => {
            map.getCanvas().style.cursor = "";
          });
          fit();
          setReady(true);
        });
        map.on("error", (e) => {
          if (e.error?.message?.includes("Failed to fetch")) setError(true);
        });
        resize = new ResizeObserver(() => {
          map.resize();
          fit();
        });
        resize.observe(container.current);
      } catch (e) {
        if (e.name !== "AbortError") setError(true);
      }
    }
    initialize();
    return () => {
      controller.abort();
      resize?.disconnect();
      map?.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.getSource("demo-feeders")?.setData(routeData(lines));
    map.setFilter("feeder-selected", ["==", ["get", "id"], selected]);
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
    for (const line of lines) {
      const button = document.createElement("button");
      button.className = `geo-node ${selected === line.id ? "selected" : ""} ${!line.parent ? "substation-node" : ""}`;
      button.setAttribute(
        "aria-label",
        `${line.id} ${line.name}, ${!line.safe ? "unsafe access" : STATES[line.status].label}`,
      );
      button.style.setProperty("--route-color", colorFor(line));
      const dot = document.createElement("span");
      dot.className = "geo-node-dot";
      button.append(dot);
      if (showNames) {
        const label = document.createElement("span");
        label.className = "geo-node-label";
        label.textContent = line.parent
          ? `${line.id} ${line.short}`
          : "Demo substation";
        button.append(label);
      }
      button.addEventListener("click", () => callback.current(line.id));
      markers.current.push(
        new Marker({ element: button, anchor: "center" })
          .setLngLat(POINTS[line.id])
          .addTo(map),
      );
      if (facilities && line.facilities.length) {
        const facility = document.createElement("button");
        facility.className = `geo-facility ${line.backupLost ? "urgent" : ""}`;
        facility.setAttribute(
          "aria-label",
          `${line.facilities.join(", ")}${line.backupLost ? " — backup power lost" : ""}`,
        );
        const cross = document.createElement("span");
        cross.textContent = "+";
        cross.setAttribute("aria-hidden", "true");
        const label = document.createElement("span");
        label.textContent =
          line.id === "L02" ? "Hospital + shelter" : "Water works";
        facility.append(cross, label);
        facility.addEventListener("click", () => callback.current(line.id));
        markers.current.push(
          new Marker({ element: facility, anchor: "bottom", offset: [0, -17] })
            .setLngLat(POINTS[line.id])
            .addTo(map),
        );
      }
    }
    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
    };
  }, [lines, selected, ready, facilities, showNames]);

  return (
    <section
      className="panel map-panel"
      id="network"
      aria-labelledby="network-title"
    >
      <div className="panel-heading">
        <div>
          <h2 id="network-title">Network map</h2>
          <p>Boulder County, Colorado · Simulated feeder network</p>
        </div>
        <span className="map-data-tag">Real basemap</span>
      </div>
      <div className="map-toolbar">
        <div className="map-layer-label">
          <span className="map-line-sample" />7 feeder segments
        </div>
        <div className="map-toggles">
          <label>
            <input
              type="checkbox"
              checked={facilities}
              onChange={(e) => setFacilities(e.target.checked)}
            />
            Facilities
          </label>
          <label>
            <input
              type="checkbox"
              checked={showNames}
              onChange={(e) => setShowNames(e.target.checked)}
            />
            Line labels
          </label>
        </div>
      </div>
      <div className="geographic-map-wrap">
        <div
          ref={container}
          className="geographic-map"
          aria-label="Interactive map of Boulder County with fictional feeder lines"
        />
        {!ready && !error && (
          <div className="map-loading" role="status">
            Loading Colorado map…
          </div>
        )}
        {error && (
          <div className="map-error" role="alert">
            <TriangleAlert size={17} />
            <span>Basemap unavailable. Check your internet connection.</span>
            <button onClick={() => location.reload()}>Retry</button>
          </div>
        )}
        <div className="map-overlay-notice">
          DEMO OVERLAY · NOT UTILITY ASSETS
        </div>
        {lines.some((l) => l.backupLost) && (
          <div className="map-incident">
            <span />
            Hospital backup lost
            {!lines.find((l) => l.id === "L02").safe ? " · Access blocked" : ""}
          </div>
        )}
        <div className="map-controls">
          <button
            aria-label="Zoom in"
            onClick={() => mapRef.current?.zoomIn({ duration: 0 })}
            disabled={!ready}
          >
            <Plus size={18} />
          </button>
          <button
            aria-label="Zoom out"
            onClick={() => mapRef.current?.zoomOut({ duration: 0 })}
            disabled={!ready}
          >
            <Minus size={18} />
          </button>
          <button
            aria-label="Fit network to map"
            onClick={fit}
            disabled={!ready}
          >
            <Crosshair size={17} />
          </button>
        </div>
      </div>
      <div
        className="mobile-line-list"
        aria-label="Readable network segment list"
      >
        {lines
          .filter((l) => l.parent)
          .map((l) => (
            <button key={l.id} onClick={() => onSelect(l.id)}>
              <span
                className="mobile-line-dot"
                style={{ background: colorFor(l) }}
              />
              <span>
                <strong>
                  {l.id} · {l.name}
                </strong>
                <small>
                  {!l.safe ? "Unsafe access" : STATES[l.status].label} ·{" "}
                  {fmt(l.customers)} customers
                </small>
              </span>
            </button>
          ))}
      </div>
      <div className="legend">
        <span>
          <i style={{ background: "#1a73e8" }} />
          Awaiting inspection
        </span>
        <span>
          <i style={{ background: "#188038" }} />
          Inspected
        </span>
        <span>
          <i style={{ background: "#e8a100" }} />
          Repair needed
        </span>
        <span>
          <i style={{ background: "#d93025" }} />
          Access blocked
        </span>
      </div>
    </section>
  );
}
