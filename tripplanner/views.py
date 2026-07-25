import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import TripRequestSerializer
from .hos_engine import HOSCalculator
from .routing import geocode, get_route


@api_view(["POST"])
def calculate_trip(request):
    serializer = TripRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        pickup_coords = geocode(data["pickup_location"])
        dropoff_coords = geocode(data["dropoff_location"])
        route_info = get_route(pickup_coords, dropoff_coords)
    except requests.exceptions.Timeout:
        return Response(
            {"error": "Route service timed out. Check your internet connection and try again."},
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )
    except requests.exceptions.ConnectionError:
        return Response(
            {"error": "Could not reach the route service. Check your internet connection and try again."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    except requests.exceptions.HTTPError as e:
        return Response(
            {"error": f"Route service returned an error: {e}"},
            status=status.HTTP_502_BAD_GATEWAY
        )
    except ValueError as e:
        # raised by geocode() when a location can't be found
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

    total_distance_miles = route_info["distance_miles"]

    calculator = HOSCalculator(
        total_distance_miles=total_distance_miles,
        current_cycle_used_hr=data["current_cycle_used_hr"]
    )
    events = calculator.calculate()
    days = calculator.split_into_days()

    return Response({
        "input": data,
        "total_distance_miles": round(total_distance_miles, 1),
        "route_geometry": route_info["geometry"],
        "pickup_coords": pickup_coords,
        "dropoff_coords": dropoff_coords,
        "events": events,
        "daily_logs": days
    })


@api_view(["GET"])
def test_outbound(request):
    import requests, time
    start = time.time()
    try:
        resp = requests.get("https://httpbin.org/get", timeout=15)
        return Response({"status": "ok", "time": time.time() - start, "code": resp.status_code})
    except Exception as e:
        return Response({"status": "failed", "time": time.time() - start, "error": str(e)})