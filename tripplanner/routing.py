import requests
from django.conf import settings

ORS_BASE = "https://api.openrouteservice.org"


def geocode(place_name):
    """Convert a place name into (longitude, latitude)."""
    url = f"{ORS_BASE}/geocode/search"
    params = {"api_key": settings.ORS_API_KEY, "text": place_name, "size": 1}
    resp = requests.get(url, params=params, timeout=25)
    resp.raise_for_status()
    data = resp.json()
    if not data.get("features"):
        raise ValueError(f"Could not find location: {place_name}")
    coords = data["features"][0]["geometry"]["coordinates"]  # [lon, lat]
    return coords


def get_route(start_coords, end_coords):
    """Get driving route between two [lon, lat] points."""
    url = f"{ORS_BASE}/v2/directions/driving-car"
    headers = {"Authorization": settings.ORS_API_KEY, "Content-Type": "application/json"}
    body = {"coordinates": [start_coords, end_coords]}
    resp = requests.post(url, json=body, headers=headers, timeout=25)
    resp.raise_for_status()
    data = resp.json()
    route = data["routes"][0]
    distance_meters = route["summary"]["distance"]
    duration_seconds = route["summary"]["duration"]
    geometry = route["geometry"]  # encoded polyline, for drawing the map later
    return {
        "distance_miles": distance_meters / 1609.34,
        "duration_hr": duration_seconds / 3600,
        "geometry": geometry
    }