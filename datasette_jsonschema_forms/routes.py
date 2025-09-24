from datasette import Response, Forbidden
from .internal_db import InternalDB, NewFormParams
import json
from functools import wraps

PERMISSION_ACCESS_NAME = "datasette-jsonschema-forms-access"

def check_permission(permission):
    """Decorator to check if the request actor has the given permission."""
    def decorator(func):
        @wraps(func)
        async def wrapper(scope, receive, datasette, request):
            result = await datasette.permission_allowed(
                request.actor, permission, default=False
            )
            if not result:
                raise Forbidden("Permission denied")
            return await func(scope, receive, datasette, request)
        return wrapper
    return decorator


@check_permission(PERMISSION_ACCESS_NAME)
async def ui_index(scope, receive, datasette, request):
    db = InternalDB(datasette.get_internal_database())
    forms = await db.list_forms()
    return Response.html(
        await datasette.render_template(
            "jsonschema-forms-index.html",
            request=request,
            context={"forms": forms},
        )
    )

@check_permission(PERMISSION_ACCESS_NAME)
async def ui_new(scope, receive, datasette, request):
    return Response.html(
        await datasette.render_template(
            "jsonschema-forms-new.html",
            request=request,
        )
    )

@check_permission(PERMISSION_ACCESS_NAME)
async def ui_edit(scope, receive, datasette, request):
    return Response.html(
        await datasette.render_template(
            "jsonschema-forms-edit.html",
            request=request,
        )
    )


@check_permission(PERMISSION_ACCESS_NAME)
async def ui_form(scope, receive, datasette, request):
    db = InternalDB(datasette.get_internal_database())
    form_name = request.url_vars["name"]
    form = await db.get_form(form_name)
    return Response.html(
        await datasette.render_template(
            "jsonschema-forms-form.html",
            request=request,
            context={
                "js_url": datasette.urls.static_plugins("datasette-jsonschema-forms", "form.min.js"),
                "params": {
                    "form_name": form_name,
                    "schema": json.loads(form["json_schema"]),
                    "database_name": form["database_name"],
                    "table_name": form["table_name"],
                }
            },
        )
    )

@check_permission(PERMISSION_ACCESS_NAME)
async def api_new(scope, receive, datasette, request):
    if request.method != "POST":
        return Response.text("", status=405)
    try:
        params: NewFormParams = NewFormParams.model_validate_json(
            await request.post_body()
        )
    except ValueError:
        return Response.json({"ok": False}, status=400)

    db = InternalDB(datasette.get_internal_database())
    await db.new_form(params, request.actor["id"])

    return Response.json({"ok": True})

@check_permission(PERMISSION_ACCESS_NAME)
async def api_edit(scope, receive, datasette, request):
    return Response.text("Not implemented yet")
