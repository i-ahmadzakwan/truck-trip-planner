  import { lazy, Suspense, useMemo } from "react";
  import { ClientOnly } from "@tanstack/react-router";
  import { Fuel, MapPin } from "lucide-react";
  import type { LatLng, RouteMapLeafletProps, RouteStop } from "./RouteMap.types";
  import { decodePolyline } from "@/lib/polyline";

  const LeafletMap = lazy(() => import("./RouteMapLeaflet"));

  // Default mock route: Chicago → Denver with a few waypoints along the way.
  const DEFAULT_PATH: LatLng[] = [
    [41.8781, -87.6298], // Chicago, IL
    [41.5868, -90.5776], // Davenport, IA
    [41.2565, -95.9345], // Omaha, NE
    [40.8136, -96.7026], // Lincoln, NE
    [40.5931, -98.3897], // Grand Island, NE (rest)
    [40.925, -100.7654], // North Platte, NE (fuel)
    [41.1399, -104.8202], // Cheyenne, WY (fuel)
    [39.7392, -104.9903], // Denver, CO
  ];

  const DEFAULT_STOPS: RouteStop[] = [
    { position: [40.5931, -98.3897], label: "Rest — Grand Island, NE" },
    { position: [40.925, -100.7654], label: "Fuel — North Platte, NE" },
    { position: [41.1399, -104.8202], label: "Fuel — Cheyenne, WY" },
  ];

  export interface RouteMapProps {
    start?: LatLng;
    end?: LatLng;
    path?: LatLng[];
    routeGeometry?: string; // encoded polyline from ORS
    stops?: RouteStop[];
    startLabel?: string;
    endLabel?: string;
    originName?: string;
    destinationName?: string;
  }

  export function RouteMap({
    path,
    routeGeometry,
    start,
    end,
    stops = DEFAULT_STOPS,
    startLabel = "Origin",
    endLabel = "Destination",
    originName = "Chicago, IL",
    destinationName = "Denver, CO",
  }: RouteMapProps = {}) {
    const decodedPath = useMemo(() => {
      if (routeGeometry) return decodePolyline(routeGeometry);
      return path ?? DEFAULT_PATH;
    }, [routeGeometry, path]);

    const s = start ?? decodedPath[0];
    const e = end ?? decodedPath[decodedPath.length - 1];
    const mapProps: RouteMapLeafletProps = {
      start: s,
      end: e,
      path: decodedPath,
      stops,
      startLabel,
      endLabel,
    };

    return (
      <div className="chrome-card relative overflow-hidden p-0">
        <div className="absolute top-4 left-5 z-[500] pointer-events-none">
          <p className="eyebrow">Route</p>
          <p className="font-display font-semibold mt-1">
            {originName} → {destinationName}
          </p>
        </div>

        <div className="absolute top-4 right-5 z-[500] flex gap-2 pointer-events-none">
          <span className="text-[10px] font-mono text-chrome/70 px-2 py-1 rounded-sm border border-[color:var(--border)] bg-black/60 backdrop-blur">
            LIVE PREVIEW
          </span>
        </div>

        <div
          className="w-full h-[320px] sm:h-[400px] relative"
          style={{
            background:
              "radial-gradient(ellipse at 20% 10%, oklch(0.35 0.09 45 / 0.25), transparent 60%), #0D0D0E",
          }}
        >
          <ClientOnly fallback={<div className="w-full h-full" />}>
            <Suspense fallback={<div className="w-full h-full" />}>
              <LeafletMap {...mapProps} />
            </Suspense>
          </ClientOnly>
          {/* Vignette to blend map into card */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: "inset 0 0 120px 20px rgba(13,13,14,0.75)",
            }}
          />
        </div>

        <div className="absolute bottom-4 left-5 right-5 z-[500] flex flex-wrap items-center gap-4 text-xs text-chrome/80 pointer-events-none">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[color:var(--primary-glow)]" />
            Origin
          </span>
          <span className="flex items-center gap-1.5">
            <Fuel className="h-3.5 w-3.5" /> Fuel / Rest stops
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[color:var(--primary-glow)]" />
            Destination
          </span>
        </div>
      </div>
    );
  }
