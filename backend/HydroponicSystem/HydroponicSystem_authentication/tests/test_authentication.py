import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'HydroponicSystem.settings'
import django
django.setup()

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient 
from ..models import User

@pytest.fixture
def user():
    user = User.objects.create(email="newuser@example.com")
    user.set_password("securepassword")
    user.save()
    return user

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_register_user(api_client):
    url = reverse("register")
    data = {"email": "newuser@example.com", "password": "securepassword"}
    response = api_client.post(url, data, format='json')

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["message"] == "User created successfully"
    assert User.objects.filter(email="newuser@example.com").exists()

@pytest.mark.django_db
def test_register_user_invalid_password(api_client):
    url = reverse("register")
    data = {"email": "invalid@example.com", "password": "123"}
    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "password" in response.data

@pytest.mark.django_db
def test_register_user_invalid_email(api_client):
    url = reverse("register")
    data = {"email": "invalidexample.com", "password": "securepassword"}
    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "email" in response.data

@pytest.mark.django_db
def test_register_existing_user(api_client, user):
    url = reverse("register")
    data = {"email": "newuser@example.com", "password": "newpassword"}
    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "email" in response.data