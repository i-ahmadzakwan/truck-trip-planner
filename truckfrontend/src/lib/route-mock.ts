export type EventType = "driving" | "on_duty" | "off_duty" | "sleeper_berth";

export interface HosEvent {
  type: EventType;
  start_hr: number;
  end_hr: number;
  label: string;
  mile_marker: number | null;
}

export interface DailySegment {
  type: EventType;
  start_hr: number;
  end_hr: number;
  label: string;
}

export interface DailyLog {
  day_number: number;
  segments: DailySegment[];
}

export interface RouteResult {
  total_distance_miles: number;
  route_geometry: string;
  pickup_coords: [number, number];
  dropoff_coords: [number, number];
  events: HosEvent[];
  daily_logs: DailyLog[];
}

export const mockResult: RouteResult = {
  total_distance_miles: 1187,
  route_geometry: "mock_encoded_polyline",
  pickup_coords: [-87.6298, 41.8781],
  dropoff_coords: [-104.9903, 39.7392],
  events: [
    { type: "on_duty", start_hr: 0, end_hr: 1, label: "Pre-trip inspection", mile_marker: null },
    { type: "driving", start_hr: 1, end_hr: 6, label: "Drive to fuel stop", mile_marker: null },
    { type: "off_duty", start_hr: 6, end_hr: 6.5, label: "Break", mile_marker: null },
    { type: "driving", start_hr: 6.5, end_hr: 11, label: "Continue west", mile_marker: null },
  ],
  daily_logs: [
    {
      day_number: 1,
      segments: [
        { type: "off_duty", start_hr: 0, end_hr: 6, label: "Off duty" },
        { type: "on_duty", start_hr: 6, end_hr: 7, label: "Pre-trip" },
        { type: "driving", start_hr: 7, end_hr: 12, label: "Driving" },
        { type: "off_duty", start_hr: 12, end_hr: 12.5, label: "Break" },
        { type: "driving", start_hr: 12.5, end_hr: 17, label: "Driving" },
        { type: "on_duty", start_hr: 17, end_hr: 18, label: "Post-trip" },
        { type: "sleeper_berth", start_hr: 18, end_hr: 24, label: "Sleeper" },
      ],
    },
    {
      day_number: 2,
      segments: [
        { type: "sleeper_berth", start_hr: 0, end_hr: 4, label: "Sleeper" },
        { type: "off_duty", start_hr: 4, end_hr: 6, label: "Off duty" },
        { type: "on_duty", start_hr: 6, end_hr: 6.5, label: "Pre-trip" },
        { type: "driving", start_hr: 6.5, end_hr: 11.5, label: "Driving" },
        { type: "off_duty", start_hr: 11.5, end_hr: 12, label: "Break" },
        { type: "driving", start_hr: 12, end_hr: 17, label: "Driving" },
        { type: "on_duty", start_hr: 17, end_hr: 18, label: "Fueling" },
        { type: "sleeper_berth", start_hr: 18, end_hr: 24, label: "Sleeper" },
      ],
    },
    {
      day_number: 3,
      segments: [
        { type: "sleeper_berth", start_hr: 0, end_hr: 5, label: "Sleeper" },
        { type: "off_duty", start_hr: 5, end_hr: 6, label: "Off duty" },
        { type: "on_duty", start_hr: 6, end_hr: 6.5, label: "Pre-trip" },
        { type: "driving", start_hr: 6.5, end_hr: 10, label: "Final leg" },
        { type: "on_duty", start_hr: 10, end_hr: 11.5, label: "Dropoff" },
        { type: "off_duty", start_hr: 11.5, end_hr: 24, label: "Off duty" },
      ],
    },
  ],
};

export function computeSummary(result: RouteResult) {
  let drive = 0;
  for (const log of result.daily_logs) {
    for (const s of log.segments) {
      if (s.type === "driving") drive += s.end_hr - s.start_hr;
    }
  }
  const stops = result.events.filter(
    (e) =>
      e.label === "Fuel stop" ||
      e.label === "30-min break" ||
      e.label.startsWith("Required rest")
  ).length;
  return {
    distance: result.total_distance_miles,
    driveHours: drive,
    stops,
    days: result.daily_logs.length,
  };
}
