from rest_framework import viewsets, permissions
from django_filters import rest_framework as filters
from .models import Lecture
from .serializers import LectureSerializer
import math
from django.db.models import Case, When, FloatField, Value, Q
import django_filters

class LectureFilter(filters.FilterSet):
    topic = filters.CharFilter(lookup_expr='icontains')
    school = filters.CharFilter(lookup_expr='icontains')
    branch = filters.CharFilter(lookup_expr='icontains')
    semester = filters.NumberFilter()
    is_live = filters.BooleanFilter()
    start_time_after = filters.DateTimeFilter(field_name='start_time', lookup_expr='gte')
    start_time_before = filters.DateTimeFilter(field_name='start_time', lookup_expr='lte')
    latitude = django_filters.CharFilter(field_name='latitude')
    longitude = django_filters.CharFilter(field_name='longitude')
    distance = django_filters.CharFilter(method='filter_within_distance')

    class Meta:
        model = Lecture
        fields = ['topic', 'school', 'branch', 'semester', 'is_live', 'latitude', 'longitude', 'distance']

    def filter_within_distance(self, queryset, name, value):
        latitude = self.data.get('latitude')
        longitude = self.data.get('longitude')
        if latitude and longitude and value:
            lat = float(latitude)
            lon = float(longitude)
            radius = float(value)

            def haversine(lat1, lon1, lat2, lon2):
                R = 6371  # Radius of the Earth in km
                lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])  # Convert all to radians
                
                dlat = lat2 - lat1
                dlon = lon2 - lon1
                
                a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                
                return R * c  # Distance in km

            queryset = Lecture.objects.all()
            locations_with_distance = [
            {
                "id": location.id,
                "instance": location,
                "dist": haversine(lat, lon, location.latitude, location.longitude)
            }
            for location in queryset]
            # Get IDs of locations within the radius
            filtered_sorted_locations = sorted(
                [loc for loc in locations_with_distance if loc["dist"] <= radius], 
                key=lambda x: x["dist"]
            )

            # Extract sorted IDs
            sorted_ids = [loc["id"] for loc in filtered_sorted_locations]

            # Filter queryset by sorted IDs
            sorted_queryset = queryset.filter(pk__in=sorted_ids)
            # Create Case/When expressions for annotation
            dist_cases = [
                When(pk=loc["id"], then=Value(loc["dist"])) for loc in filtered_sorted_locations
            ]

            # Annotate queryset with dynamic dist values
            annotated_queryset = sorted_queryset.annotate(
                dist=Case(*dist_cases, default=Value(None), output_field=FloatField())
            ).order_by("dist")  # Order by dist dynamically

            return annotated_queryset
        return queryset


class IsTeacherOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'teacher'

class LectureViewSet(viewsets.ModelViewSet):
    queryset = Lecture.objects.all()
    serializer_class = LectureSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]
    filterset_class = LectureFilter

    def perform_create(self, serializer):
        user = self.request.user  # Get the currently authenticated user
        # Set latitude and longitude from the user
        serializer.save(latitude=user.latitude, longitude=user.longitude)
    
    def list(self, request, *args, **kwargs):
        # Get the user's latitude and longitude
        user = request.user
        if (not request.query_params.get('latitude') or not request.query_params.get('longitude')) and request.query_params.get('check_dist'):
            # Use user's latitude and longitude if not provided
            latitude = user.latitude
            longitude = user.longitude
            request.query_params._mutable = True  # Make query_params mutable
            request.query_params['latitude'] = latitude
            request.query_params['longitude'] = longitude
            request.query_params._mutable = False  # Make it immutable again
        if not request.query_params.get('distance') and request.query_params.get('check_dist'):
            request.query_params._mutable = True
            request.query_params['distance'] = 10
            request.query_params._mutable = False

        return super().list(request, *args, **kwargs)
