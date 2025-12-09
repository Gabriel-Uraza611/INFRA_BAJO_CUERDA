def test_full_flow(client):
    # Registro
    client.post("/users/register", json={
        "name": "Flow",
        "username": "flow",
        "email": "flow@example.com",
        "password": "123456"
    })

    # Login (tu backend usa email)
    login = client.post("/users/login", json={
        "email": "flow@example.com",
        "password": "123456"
    })

    # Tu backend devuelve "token"
    token = login.json()["token"]

    assert token == "token-simulado-por-ahora"
