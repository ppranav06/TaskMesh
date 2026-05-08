# tests/test_auth.py
import pytest

@pytest.mark.asyncio
async def test_register_user(client):
    response = await client.post("/auth/register", json={
        "email": "alice@example.com",
        "name": "Alice",
        "password": "secret123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "alice@example.com"
    assert "password" not in data  # never leak the hash

@pytest.mark.asyncio
async def test_login_returns_jwt(client):
    # seed a user first via the register endpoint
    await client.post("/auth/register", json={"email": "bob@example.com", "name": "Bob", "password": "pass"})
    
    response = await client.post("/auth/login", json={"email": "bob@example.com", "password": "pass"})
    assert response.status_code == 200
    assert "access_token" in response.json()

@pytest.mark.asyncio
async def test_login_wrong_password(client):
    response = await client.post("/auth/login", json={"email": "bob@example.com", "password": "wrong"})
    assert response.status_code == 401
