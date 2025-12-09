def test_missing_fields(client):
    res = client.post("/users/register", json={
        "username": "user2"
    })
    assert res.status_code == 422  # Campos requeridos faltantes


def test_invalid_note_update(client):
    res = client.put("/notes/99999", json={"title": "X"})
    assert res.status_code in (401, 404)
