import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import type { RouteMapLeafletProps } from "./RouteMap.types";

const makeIcon = (color: string, ring = "rgba(255,255,255,0.85)", size = 18) =>
  L.divIcon({
    className: "routelog-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};
      border:2px solid ${ring};
      box-shadow:0 0 12px ${color}, 0 0 2px rgba(0,0,0,0.6);
      display:flex;align-items:center;justify-content:center;">
      <div style="width:4px;height:4px;border-radius:50%;background:#fff;"></div>
    </div>`,
  });

const endpointIcon = makeIcon("oklch(0.6 0.22 25)", "rgba(255,220,220,0.9)", 20);
const stopIcon = makeIcon("oklch(0.75 0.02 250)", "rgba(255,255,255,0.7)", 14);
const fuelIcon = makeIcon("oklch(0.75 0.18 90)", "rgba(255,255,255,0.7)", 14);

export default function RouteMapLeaflet({
  start,
  end,
  path,
  stops = [],
  startLabel = "Origin",
  endLabel = "Destination",
}: RouteMapLeafletProps) {
  const bounds = L.latLngBounds(path as LatLngExpression[]).pad(0.15);

  return (
    <MapContainer
      bounds={bounds}
      scrollWheelZoom={true}
      zoomControl={true}
      attributionControl={false}
      style={{ height: "100%", width: "100%", background: "#0D0D0E" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
      />
      {/* soft shadow trail */}
      <Polyline
        positions={path as LatLngExpression[]}
        pathOptions={{
          color: "oklch(0.25 0.08 25)",
          weight: 8,
          opacity: 0.55,
          lineCap: "round",
        }}
      />
      {/* main route */}
      <Polyline
        positions={path as LatLngExpression[]}
        pathOptions={{
          color: "oklch(0.62 0.22 25)",
          weight: 3.5,
          opacity: 1,
          lineCap: "round",
        }}
      />
      <Marker position={start as LatLngExpression} icon={endpointIcon}>
        <Popup>{startLabel}</Popup>
      </Marker>
      <Marker position={end as LatLngExpression} icon={endpointIcon}>
        <Popup>{endLabel}</Popup>
      </Marker>
      {stops.map((s, i) => (
        <Marker key={i} position={s.position as LatLngExpression} icon={s.type === "fuel" ? fuelIcon : stopIcon}>
          {s.label && <Popup>{s.label}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
}
