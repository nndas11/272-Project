import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_signup():
    response = client.post(
        "/api/auth/signup",
        json={"email": "test@example.com", "password": "testpass123"}
    )
    assert response.status_code == 201
    assert "email" in response.json()


def test_login():
    # First signup
    client.post(
        "/api/auth/signup",
        json={"email": "test2@example.com", "password": "testpass123"}
    )
    
    # Then login
    response = client.post(
        "/api/auth/login",
        json={"email": "test2@example.com", "password": "testpass123"}
    )
    assert response.status_code == 200
    assert "email" in response.json()


