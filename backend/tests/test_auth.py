def test_notes_no_auth_required(client):
    res = client.get("/notes/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
