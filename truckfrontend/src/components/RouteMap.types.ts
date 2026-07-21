export type LatLng = [number, number]; // [lat, lng]

export interface RouteStop {
  position: LatLng;
  label?: string;
  type?: "fuel" | "rest";
}

export interface RouteMapLeafletProps {
  start: LatLng;
  end: LatLng;
  path: LatLng[];
  stops?: RouteStop[];
  startLabel?: string;
  endLabel?: string;
}
