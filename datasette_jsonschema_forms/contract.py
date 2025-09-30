from pydantic import BaseModel
from .internal_db import ListFormsResult, NewFormParams

class UiFormParams(BaseModel):
    form_name: str
    schema: str
    database_name: str
    table_name: str

class UiIndexParams(BaseModel):
    forms: list[ListFormsResult]


ApiNewParams = NewFormParams