def test_register_user(client):
    response = client.post("/users/register", json={
        "name": "Tester",
        "username": "tester",
        "email": "tester@example.com",
        "password": "123456"
    })

    assert response.status_code in (200, 201)
    data = response.json()
    
    # Tu API devuelve {"message": "...", "user": {...}}
    assert "user" in data
    assert data["user"]["username"] == "tester"
    assert data["user"]["email"] == "tester@example.com"


def test_register_existing_user(client):
    response = client.post("/users/register", json={
        "name": "Tester",
        "username": "tester",
        "email": "tester@example.com",
        "password": "123456"
    })

    assert response.status_code == 400  # tu API lanza 400
    assert "detail" in response.json()


def test_login_success(client):
    res = client.post("/users/login", json={
        "email": "tester@example.com",
        "password": "123456"
    })

    assert res.status_code == 200
    data = res.json()
    
    assert "token" in data
    assert data["token"] == "token-simulado-por-ahora"


def test_login_wrong_password(client):
    res = client.post("/users/login", json={
        "email": "tester@example.com",
        "password": "wrong"
    })

    assert res.status_code == 401
