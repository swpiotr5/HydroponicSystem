from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from datetime import datetime
from .models import HydroponicSystem, Measurement
from .serializers import MeasurementSerializer
from drf_spectacular.utils import (
    extend_schema, OpenApiExample, OpenApiParameter, inline_serializer, OpenApiResponse
)

error_response_serializer = inline_serializer(
    name="ErrorResponse",
    fields={
        "detail": serializers.CharField()
    }
)

class MeasurementAPIView(APIView):
    pagination = PageNumberPagination

    @extend_schema(
        tags=["Measurements"],
        summary="Add a measurement to a hydroponic system",
        description="Add a new measurement (pH, temperature, TDS) to a hydroponic system you own.",
        parameters=[
            OpenApiParameter(name="system_id", location=OpenApiParameter.PATH, required=True, type=int, description="ID of the hydroponic system")
        ],
        request=MeasurementSerializer,
        responses={
            201: OpenApiResponse(
                description="Measurement successfully created.",
                response=MeasurementSerializer,
                examples=[
                    OpenApiExample(
                        name="Created",
                        value={
                            "id": 17,
                            "timestamp": "2025-02-17T12:22:43.652462Z",
                            "ph": 6.5,
                            "temperature": 22.5,
                            "tds": 900,
                            "system": 1
                        }
                    )
                ]
            ),
            400: OpenApiResponse(
                description="Validation error",
                response=error_response_serializer,
                examples=[
                    OpenApiExample(
                        name="Missing Field",
                        value={"ph": ["This field is required."]},
                        status_codes=["400"]
                    )
                ]
            ),
            403: OpenApiResponse(
                description="User does not own the system",
                response=error_response_serializer,
                examples=[
                    OpenApiExample(
                        name="Permission Denied",
                        value={"detail": "You do not have permission to add measurements in this system."},
                        status_codes=["403"]
                    )
                ]
            )
        }
    )
    def post(self, request, system_id):
        try:
            system = HydroponicSystem.objects.get(id=system_id, owner=request.user)
        except HydroponicSystem.DoesNotExist:
            raise PermissionDenied("You do not have permission to add measurements in this system.")

        serializer = MeasurementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(system=system)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        tags=["Measurements"],
        summary="List measurements for a hydroponic system",
        description="Returns a paginated, filterable list of measurements for a system you own.",
        parameters=[
            OpenApiParameter(name="system_id", location=OpenApiParameter.PATH, required=True, type=int),
            OpenApiParameter(name="ph_min", type=float, location=OpenApiParameter.QUERY),
            OpenApiParameter(name="ph_max", type=float, location=OpenApiParameter.QUERY),
            OpenApiParameter(name="temperature_min", type=float, location=OpenApiParameter.QUERY),
            OpenApiParameter(name="temperature_max", type=float, location=OpenApiParameter.QUERY),
            OpenApiParameter(name="tds_min", type=int, location=OpenApiParameter.QUERY),
            OpenApiParameter(name="tds_max", type=int, location=OpenApiParameter.QUERY),
            OpenApiParameter(name="timestamp_after", type=str, location=OpenApiParameter.QUERY, description="Format: YYYY-MM-DD"),
            OpenApiParameter(name="timestamp_before", type=str, location=OpenApiParameter.QUERY, description="Format: YYYY-MM-DD"),
            OpenApiParameter(name="sort_by", type=str, location=OpenApiParameter.QUERY, description="Field to sort by (default: timestamp)"),
            OpenApiParameter(name="sort_order", type=str, location=OpenApiParameter.QUERY, description="asc or desc (default: asc)")
        ],
        responses={
            200: OpenApiResponse(
                description="List of measurements",
                response=inline_serializer(
                    name="MeasurementListResponse",
                    fields={
                        "count": serializers.IntegerField(),
                        "next": serializers.CharField(allow_null=True),
                        "previous": serializers.CharField(allow_null=True),
                        "results": MeasurementSerializer(many=True)
                    }
                ),
                examples=[
                    OpenApiExample(
                        name="Success",
                        value={
                            "count": 2,
                            "next": None,
                            "previous": None,
                            "results": [
                                {
                                    "id": 12,
                                    "timestamp": "2025-02-17T12:00:00Z",
                                    "ph": 6.8,
                                    "temperature": 25.0,
                                    "tds": 480,
                                    "system": 5
                                },
                                {
                                    "id": 11,
                                    "timestamp": "2025-02-17T11:56:38.938336Z",
                                    "ph": 6.4,
                                    "temperature": 24.5,
                                    "tds": 500,
                                    "system": 5
                                }
                            ]
                        }
                    )
                ]
            ),
            400: OpenApiResponse(
                description="Bad request (e.g. invalid timestamp)",
                response=error_response_serializer,
                examples=[
                    OpenApiExample(
                        name="Invalid Timestamp",
                        value={"detail": "Invalid timestamp format. Expected format: YYYY-MM-DD."},
                        status_codes=["400"]
                    )
                ]
            ),
            403: OpenApiResponse(
                description="Permission denied",
                response=error_response_serializer,
                examples=[
                    OpenApiExample(
                        name="Forbidden",
                        value={"detail": "You do not have permission to this system"},
                        status_codes=["403"]
                    )
                ]
            )
        }
    )
    def get(self, request, system_id):
        try:
            system = HydroponicSystem.objects.get(id=system_id, owner=request.user)
        except HydroponicSystem.DoesNotExist:
            raise PermissionDenied("You do not have permission to this system")

        filters = Q(system=system)

        ph_min = request.query_params.get("ph_min")
        ph_max = request.query_params.get("ph_max")
        temp_min = request.query_params.get("temperature_min")
        temp_max = request.query_params.get("temperature_max")
        tds_min = request.query_params.get("tds_min")
        tds_max = request.query_params.get("tds_max")
        timestamp_after = request.query_params.get("timestamp_after")
        timestamp_before = request.query_params.get("timestamp_before")

        if ph_min:
            filters &= Q(ph__gte=ph_min)
        if ph_max:
            filters &= Q(ph__lte=ph_max)
        if temp_min:
            filters &= Q(temperature__gte=temp_min)
        if temp_max:
            filters &= Q(temperature__lte=temp_max)
        if tds_min:
            filters &= Q(tds__gte=tds_min)
        if tds_max:
            filters &= Q(tds__lte=tds_max)

        try:
            if timestamp_after:
                filters &= Q(timestamp__gte=datetime.strptime(timestamp_after, "%Y-%m-%d"))
            if timestamp_before:
                filters &= Q(timestamp__lte=datetime.strptime(timestamp_before, "%Y-%m-%d"))
        except ValueError:
            return Response(
                {"detail": "Invalid timestamp format. Expected format: YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sort_by = request.query_params.get("sort_by", "timestamp")
        sort_order = request.query_params.get("sort_order", "asc")

        if sort_order not in ["asc", "desc"]:
            return Response(
                {"detail": "Invalid value for 'sort_order'. Use 'asc' or 'desc'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if sort_order == "desc":
            sort_by = f"-{sort_by}"

        measurements = Measurement.objects.filter(filters).order_by(sort_by)

        paginator = self.pagination()
        paginated_measurements = paginator.paginate_queryset(measurements, request)

        serializer = MeasurementSerializer(paginated_measurements, many=True)
        return paginator.get_paginated_response(serializer.data)
