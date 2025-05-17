from django.urls import path

from register_view import RegisterUserAPIView
from login_view import UserLoginAPIView

urlpatterns = [
    path('login/', UserLoginAPIView.as_view(), name='login'),
    path('register/', RegisterUserAPIView.as_view(), name='register'),          
]