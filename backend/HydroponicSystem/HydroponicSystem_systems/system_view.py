from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import HydroponicSystem, Measurement
from .serializers import HydroponicSystemSerializer, MeasurementSerializer
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse, OpenApiParameter
from datetime import datetime
from .models import HydroponicSystem, Measurement
from django.db.models import Q

class HydroponicSystemViewSet(viewsets.ModelViewSet):
    serializer_class = HydroponicSystemSerializer
    http_method_names = ['get', 'post', 'put', 'delete']

    def get_queryset(self):
        return HydroponicSystem.objects.filter(owner=self.request.user)

    @extend_schema(
        summary="Create a new hydroponic system",
        request=HydroponicSystemSerializer,
        responses={
            201: HydroponicSystemSerializer,
            400: OpenApiResponse(description="Bad Request")
        },
        examples=[
            OpenApiExample(
                "Example request",
                value={"name": "Greenhouse A", "location": "Farm #1"},
                request_only=True,
            ),
            OpenApiExample(
                "Example response",
                value={
                    "id": 15,
                    "name": "Greenhouse A",
                    "location": "Farm #1",
                    "created_at": "2025-02-17T11:56:38.938336Z",
                    "owner": 4
                },
                response_only=True,
            )
        ]
    )
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Retrieve a hydroponic system with latest measurements",
        responses={
            200: OpenApiResponse(
                response=None,
                description="Hydroponic system details and latest measurements"
            ),
            403: OpenApiResponse(description="Forbidden"),
            404: OpenApiResponse(description="Not Found"),
        },
        examples=[
            OpenApiExample(
                "Example response",
                value={
                    "hydroponic_system": {
                        "id": 1,
                        "name": "Green",
                        "location": "Farm #1",
                        "created_at": "2025-02-15T17:10:58.803766Z",
                        "owner": 4
                    },
                    "latest_measurements": [
                        {
                            "id": 16,
                            "timestamp": "2025-02-15T19:08:31.972081Z",
                            "ph": 6.5,
                            "temperature": 22.5,
                            "tds": 900,
                            "system": 1
                        }
                    ]
                },
                response_only=True,
            )
        ]
    )
    def retrieve(self, request, pk=None):
        hydroponic_system = self.get_object()
        if hydroponic_system.owner != request.user:
            raise PermissionDenied("You do not have access to this resource.")

        latest_measurements = Measurement.objects.filter(system=hydroponic_system).order_by('-timestamp')[:10]

        hydroponic_serializer = self.get_serializer(hydroponic_system)
        measurement_serializer = MeasurementSerializer(latest_measurements, many=True)

        response_data = {
            "hydroponic_system": hydroponic_serializer.data,
            "latest_measurements": measurement_serializer.data,
        }

        return Response(response_data, status=status.HTTP_200_OK)


    @extend_schema(
        summary="Update a hydroponic system",
        request=HydroponicSystemSerializer,
        responses={
            200: HydroponicSystemSerializer,
            400: OpenApiResponse(description="Bad Request"),
            403: OpenApiResponse(description="Forbidden"),
            404: OpenApiResponse(description="Not Found"),
        },
        examples=[
            OpenApiExample(
                "Example request",
                value={
                    "name": "Updated Hydroponic System",
                    "location": "Greenhouse B"
                },
                request_only=True
            ),
            OpenApiExample(
                "Example response",
                value={
                    "id": 5,
                    "name": "Updated Hydroponic System",
                    "location": "Greenhouse B",
                    "owner": 2,
                    "created_at": "2024-01-15T12:30:00Z"
                },
                response_only=True
            )
        ]
    )
    def update(self, request, pk=None):
        hydroponic_system = self.get_object()
        if hydroponic_system.owner != request.user:
            raise PermissionDenied("You cannot edit this resource.")
        serializer = self.get_serializer(hydroponic_system, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


    @extend_schema(
        summary="Delete a hydroponic system",
        responses={
            204: OpenApiResponse(description="Successfully deleted the hydroponic system."),
            403: OpenApiResponse(description="Forbidden - user is not the owner."),
            404: OpenApiResponse(description="Hydroponic system not found."),
        },
        examples=[
            OpenApiExample(
                "Example Response",
                value={"message": "Hydroponic system has been removed."},
                response_only=True,
            )
        ]
    )
    def destroy(self, request, pk=None):
        hydroponic_system = self.get_object()
        if hydroponic_system.owner != request.user:
            raise PermissionDenied("You cannot delete this resource.")
        hydroponic_system.delete()
        return Response({"message": "Hydroponic system has been removed."}, status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="List of hydroponic systems owned by the authenticated user",
        parameters=[
            OpenApiParameter(name="name", type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description="Filter by system name (case-insensitive)"),
            OpenApiParameter(name="location", type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description="Filter by location (case-insensitive)"),
            OpenApiParameter(name="created_after", type=OpenApiTypes.DATE, location=OpenApiParameter.QUERY, description="Filter systems created after the given date"),
            OpenApiParameter(name="created_before", type=OpenApiTypes.DATE, location=OpenApiParameter.QUERY, description="Filter systems created before the given date"),
            OpenApiParameter(name="sort_by", type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description="Field to sort results by (default: created_at)"),
            OpenApiParameter(name="sort_order", type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description="Sorting order: 'asc' or 'desc' (default: asc)"),
        ],
        responses={
            200: OpenApiResponse(description="List of hydroponic systems."),
            400: OpenApiResponse(description="Bad Request - invalid query parameter."),
        },
        examples=[
            OpenApiExample(
                "Example Response",
                value={
                    "count": 12,
                    "next": "http://localhost:8000/systems/?page=2",
                    "previous": None,
                    "results": [
                        {
                            "id": 1,
                            "name": "Greenhouse A",
                            "location": "Farm #1",
                            "created_at": "2025-02-15T17:10:58.803766Z",
                            "owner": 4
                        },
                        {
                            "id": 4,
                            "name": "= A",
                            "location": "Farm #1",
                            "created_at": "2025-02-15T17:11:57.798625Z",
                            "owner": 4
                        }
                    ]
                },
                response_only=True,
            )
        ]
    )
    def list(self, request):
        try:
            filters = Q(owner=request.user)

            name = request.query_params.get("name")
            if name:
                filters &= Q(name__icontains=name)

            location = request.query_params.get("location")
            if location:
                filters &= Q(location__icontains=location)

            created_after = request.query_params.get("created_after")
            created_before = request.query_params.get("created_before")

            try:
                if created_after:
                    filters &= Q(timestamp__gte=datetime.strptime(created_after, "%Y-%m-%d"))

                if created_before:
                    filters &= Q(timestamp__lte=datetime.strptime(created_before, "%Y-%m-%d"))
            except ValueError:
                return Response(
                    {"detail": "Invalid date format. Expected format: YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            sort_by = request.query_params.get("sort_by", "created_at")
            sort_order = request.query_params.get("sort_order", "asc")

            if sort_order not in ["asc", "desc"]:
                return Response(
                    {"detail": "Invalid value for 'sort_order'. Use 'asc' or 'desc'."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            sort_field = f"-{sort_by}" if sort_order == "desc" else sort_by

            queryset = HydroponicSystem.objects.filter(filters).order_by(sort_field)
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
