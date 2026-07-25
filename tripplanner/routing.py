import time
import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OSRM_URL = "https://router.project-osrm.org/route/v1/driving"

# Nominatim requires a descriptive User-Agent identifying the app (their usage policy)
HEADERS = {"User-Agent": "RouteLog-TripPlanner/1.0 (student project)"}


def geocode(place_name):
    """Convert a place name into (longitude, latitude)."""
    params = {"q": place_name, "format": "json", "limit": 1}
    resp = requests.get(NOMINATIM_URL, params=params, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    if not data:
        raise ValueError(f"Could not find location: {place_name}")
    lon = float(data[0]["lon"])
    lat = float(data[0]["lat"])
    return [lon, lat]


def get_route(start_coords, end_coords):
    """Get driving route between two [lon, lat] points."""
    lon1, lat1 = start_coords
    lon2, lat2 = end_coords
    url = f"{OSRM_URL}/{lon1},{lat1};{lon2},{lat2}"
    params = {"overview": "full", "geometries": "polyline"}
    resp = requests.get(url, params=params, timeout=20)
    resp.raise_for_status()
    data = resp.json()
    if data.get("code") != "Ok" or not data.get("routes"):
        raise ValueError("No route found between these locations")
    route = data["routes"][0]
    distance_meters = route["distance"]
    duration_seconds = route["duration"]
    geometry = route["geometry"]  # already an encoded polyline, precision 5, same as before
    return {
        "distance_miles": distance_meters / 1609.34,
        "duration_hr": duration_seconds / 3600,
        "geometry": geometry
    }