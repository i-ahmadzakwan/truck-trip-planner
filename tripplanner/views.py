from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import TripRequestSerializer
from .hos_engine import HOSCalculator
from .routing import geocode, get_route


@api_view(["POST"])
def calculate_trip(request):
    serializer = TripRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    pickup_coords = geocode(data["pickup_location"])
    dropoff_coords = geocode(data["dropoff_location"])

    route_info = get_route(pickup_coords, dropoff_coords)
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