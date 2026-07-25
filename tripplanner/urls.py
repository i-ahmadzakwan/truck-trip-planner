from django.urls import path
from .views import calculate_trip, test_outbound

urlpatterns = [
    path("calculate-trip/", calculate_trip, name="calculate-trip"),
    path("test-outbound/", test_outbound, name="test-outbound"),
]