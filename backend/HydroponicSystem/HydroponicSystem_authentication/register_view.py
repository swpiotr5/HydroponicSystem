from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status, serializers
from .serializers import UserRegisterSerializer
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse, inline_serializer


@extend_schema(
    tags=["Register"],
    summary="Register a new user",
    description="Endpoint for registering a new user account.",
    request=UserRegisterSerializer,
    responses={
        201: OpenApiResponse(
            description="User created successfully.",
            response=inline_serializer(
                name="RegisterSuccessResponse",
                fields={"message": serializers.CharField()}
            ),
            examples=[
                OpenApiExample(
                    name="Success",
                    value={"message": "User created successfully"},
                    status_codes=["201"]
                )
            ]
        ),
        400: OpenApiResponse(
            description="Validation failed due to invalid email, short password, or other input errors.",
            response=inline_serializer(
                name="RegisterErrorResponse",
                fields={"error": serializers.CharField(required=False)}
            ),
            examples=[
                OpenApiExample(
                    name="Missing Email",
                    value={"email": ["This field is required."]},
                    status_codes=["400"]
                ),
                OpenApiExample(
                    name="Missing Password",
                    value={"password": ["This field is required."]},
                    status_codes=["400"]
                ),
                OpenApiExample(
                    name="Invalid Email",
                    value={"email": ["Enter a valid email address."]},
                    status_codes=["400"]
                ),
                OpenApiExample(
                    name="Short Password",
                    value={"password": ["Ensure this field has at least 8 characters."]},
                    status_codes=["400"]
                ),
                OpenApiExample(
                    name="Duplicate Email",
                    value={"error": "User with this email already exists."},
                    status_codes=["400"]
                )
            ]
        )
    }
)
class RegisterUserAPIView(APIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
