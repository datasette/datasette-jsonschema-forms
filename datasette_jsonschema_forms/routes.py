from typing import Optional
from datasette import Response, Forbidden
from .internal_db import InternalDB
from .contract import ApiNewParams, UiFormParams, UiIndexParams
from functools import wraps

PERMISSION_ACCESS_NAME = "datasette-jsonschema-forms-access"


def _check_permission(permission):
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

async def _render_base(datasette, request, js_file: str, params: Optional[dict] = None, css_file=None):
    return await datasette.render_template(
        "jsonschema-forms-base.html",
        request=request,
        context={
            "js_url": datasette.urls.static_plugins(
                "datasette-jsonschema-forms", js_file
            ),
            "params": params,
            "css_url": datasette.urls.static_plugins(
                "datasette-jsonschema-forms", css_file
            )
            if css_file
            else None,
        },
    )

@_check_permission(PERMISSION_ACCESS_NAME)
async def ui_index(scope, receive, datasette, request):
    db = InternalDB(datasette.get_internal_database())
    forms = await db.list_forms()
    params = UiIndexParams(forms=forms)
    return Response.html(
        await _render_base(
            datasette=datasette,
            request=request,
            js_file="index.min.js",
            params=params.model_dump(),
        ),
    )


@_check_permission(PERMISSION_ACCESS_NAME)
async def ui_new(scope, receive, datasette, request):
    return Response.html(
        await _render_base(
            datasette=datasette,
            request=request,
            js_file="new.min.js",
            css_file="new.min.css",
        ),
    )


@_check_permission(PERMISSION_ACCESS_NAME)
async def ui_form(scope, receive, datasette, request):
    db = InternalDB(datasette.get_internal_database())
    form_name = request.url_vars["name"]
    form = await db.get_form(form_name)
    if not form:
        return Response.text("Form not found", status=404)
    
    params = UiFormParams(
        form_name=form_name,
        schema=form["json_schema"],
        database_name=form["database_name"],
        table_name=form["table_name"],
    )
    return Response.html(
        await _render_base(
            datasette=datasette,
            request=request,
            js_file="form.min.js",
            params=params.model_dump(),
        )
    )


@_check_permission(PERMISSION_ACCESS_NAME)
async def api_new(scope, receive, datasette, request):
    if request.method != "POST":
        return Response.text("", status=405)
    try:
        params: ApiNewParams = ApiNewParams.model_validate_json(
            await request.post_body()
        )
    except ValueError:
        return Response.json({"ok": False}, status=400)

    db = InternalDB(datasette.get_internal_database())
    await db.new_form(params, request.actor["id"])
    return Response.json({"ok": True})