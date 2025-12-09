def create_test_user(client):
    client.post("/users/register", json={
        "name": "Note User",
        "username": "noteuser",
        "email": "note@example.com",
        "password": "123456"
    })

    login = client.post("/users/login", json={
        "email": "note@example.com",
        "password": "123456"
    })

    user = login.json()["user"]
    return user["id"]



def test_create_note(client):
    user_id = create_test_user(client)

    res = client.post("/notes/", json={
        "title": "Mi nota",
        "content": "Contenido",
        "color": "yellow",
        "status": "pending",
        "posx": 10,
        "posy": 20,
        "user_id": user_id
    })

    assert res.status_code in (200, 201)
    json = res.json()
    assert "id" in json
    assert json["title"] == "Mi nota"



def test_read_notes(client):
    res = client.get("/notes/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_update_note(client):
    user_id = create_test_user(client)

    new_note = client.post("/notes/", json={
        "title": "Nota update",
        "content": "c",
        "color": "red",
        "status": "completed",
        "posx": 50,
        "posy": 80,
        "user_id": user_id
    }).json()

    note_id = new_note["id"]

    res = client.put(f"/notes/{note_id}", json={"title": "Actualizada"})

    assert res.status_code == 200
    assert res.json()["title"] == "Actualizada"



def test_delete_note(client):
    user_id = create_test_user(client)

    new_note = client.post("/notes/", json={
        "title": "Temporal",
        "content": "x",
        "color": "blue",
        "status": "pending",
        "posx": 0,
        "posy": 0,
        "user_id": user_id
    }).json()

    note_id = new_note["id"]

    res = client.delete(f"/notes/{note_id}")
    assert res.status_code == 200

