import type { RouteResult } from "./route-mock";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export interface TripRequest {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used_hr: number;
}

export async function fetchTrip(payload: TripRequest): Promise<RouteResult> {
  const res = await fetch(`${API_BASE}/api/calculate-trip/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // response wasn't JSON (e.g. Django debug HTML) — keep generic message
    }
    throw new Error(message);
  }

  return res.json();
}