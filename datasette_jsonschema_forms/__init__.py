from datasette import hookimpl
from sqlite_utils import Database
from .internal_migrations import internal_migrations
from . import routes
from . import contract

__all__ = ["contract", "routes"]

@hookimpl
def menu_links(datasette):
    return [
        {
            "href": datasette.urls.path("/-/jsonschema-forms"),
            "label": "JSON Schema Forms",
        }
    ]


@hookimpl
async def startup(datasette):
    def migrate(connection):
        db = Database(connection)
        internal_migrations.apply(db)

    await datasette.get_internal_database().execute_write_fn(migrate)


@hookimpl
def register_routes():
    return [
        (r"^/-/jsonschema-forms$", routes.ui_index),
        (r"^/-/jsonschema-forms/new$", routes.ui_new),
        (r"^/-/jsonschema-forms/form/(?P<name>.*)$", routes.ui_form),
        (r"^/-/jsonschema-forms/api/new$", routes.api_new),
    ]
