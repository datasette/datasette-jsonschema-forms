from datasette.app import Datasette
from datasette_jsonschema_forms.routes import PERMISSION_ACCESS_NAME
import pytest


def cookie_for_actor(datasette, actor_id):
    return {"ds_actor": datasette.sign({"a": {"id": actor_id}}, "actor")}


@pytest.mark.asyncio
async def test_plugin_is_installed():
    datasette = Datasette(memory=True)
    response = await datasette.client.get("/-/plugins.json")
    assert response.status_code == 200
    installed_plugins = {p["name"] for p in response.json()}
    assert "datasette-jsonschema-forms" in installed_plugins


@pytest.mark.asyncio
async def test_permissions():
    datasette = Datasette(
        memory=True,
        config={"permissions": {PERMISSION_ACCESS_NAME: {"id": ["alex"]}}},
    )

    response = await datasette.client.get("/-/jsonschema-forms")
    assert response.status_code == 403

    response = await datasette.client.get(
        "/-/jsonschema-forms", cookies=cookie_for_actor(datasette, "alex")
    )
    assert response.status_code == 200
