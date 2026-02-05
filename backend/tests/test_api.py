import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["name"] == "TruthLens API"

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_models():
    response = client.get("/api/models")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert "ensemble" in response.json()
