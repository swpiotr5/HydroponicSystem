from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status, serializers
from .serializers import UserLoginSerializer
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse, inline_serializer


@extend_schema(
    tags=["Login"],
    summary="Login user",
    description="Endpoint for logging in a registered user. Returns a JWT token upon successful authentication.",
    request=UserLoginSerializer,
    responses={
        200: OpenApiResponse(
            description="Login successful. JWT token returned.",
            response=inline_serializer(
                name="LoginSuccessResponse",
                fields={"token": serializers.CharField()}
            ),
            examples=[
                OpenApiExample(
                    name="Success",
                    value={"token": "jwt-token"},
                    status_codes=["200"]
                )
            ]
        ),
        400: OpenApiResponse(
            description="Validation error: missing or improperly formatted fields.",
            response=inline_serializer(
                name="LoginValidationError",
                fields={
                    "email": serializers.ListField(child=serializers.CharField(), required=False),
                    "password": serializers.ListField(child=serializers.CharField(), required=False),
                }
            ),
            examples=[
                OpenApiExample(
                    name="Missing Fields",
                    value={"email": ["This field is required."], "password": ["This field is required."]},
                    status_codes=["400"]
                ),
                OpenApiExample(
                    name="Invalid Email Format",
                    value={"email": ["Enter a valid email address."]},
                    status_codes=["400"]
                )
            ]
        ),
        401: OpenApiResponse(
            description="Authentication failed: incorrect email or password.",
            response=inline_serializer(
                name="LoginUnauthorizedResponse",
                fields={"error": serializers.CharField()}
            ),
            examples=[
                OpenApiExample(
                    name="Invalid Credentials",
                    value={"error": "Invalid email or password."},
                    status_codes=["401"]
                )
            ]
        )
    }
)
class UserLoginAPIView(APIView):
    permission_classes = [AllowAny]
    serializer_class = UserLoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)