from datasette.database import Database
from pydantic import BaseModel
from typing import Optional

class NewFormParams(BaseModel):
    name: str
    schema: str
    database_name: str
    table_name: str

class ListFormsResult(BaseModel):
    id: int
    created_at: str
    creator_actor_id: Optional[str]
    last_edited_at: Optional[str]
    name: str
    json_schema: str
    database_name: str
    table_name: str

class InternalDB:
    def __init__(self, internal_db: Database):
        self.db = internal_db

    async def new_form(self, params: NewFormParams, creator_actor_id: str):
        def write(conn):
            with conn:
                conn.execute(
                    """
                  insert into datasette_jsonschema_forms
                  (name, creator_actor_id, json_schema, database_name, table_name)
                  values (?, ?, ?, ?, ?)
                  """,
                    (
                        params.name,
                        creator_actor_id,
                        params.schema,
                        params.database_name,
                        params.table_name,
                    ),
                )

        return await self.db.execute_write_fn(write)

    async def list_forms(self)-> list[ListFormsResult]:
        results = await self.db.execute(
            """
            select 
              id,
              created_at,
              creator_actor_id,
              last_edited_at,
              name,
              json_schema,
              database_name,
              table_name
            from datasette_jsonschema_forms
            order by last_edited_at desc, created_at desc
            """
        )
        return [ListFormsResult(
            id=row["id"],
            created_at=row["created_at"],
            creator_actor_id=row["creator_actor_id"],
            last_edited_at=row["last_edited_at"],
            name=row["name"],
            json_schema=row["json_schema"],
            database_name=row["database_name"],
            table_name=row["table_name"],
        ) for row in results]

    async def get_form(self, name: str):
        results = await self.db.execute(
            """
            select 
              id,
              created_at,
              creator_actor_id,
              last_edited_at,
              name,
              json_schema,
              database_name,
              table_name
            from datasette_jsonschema_forms
            where name = ?
            """,
            (name,),
        )
        row = results.first()
        if row:
            return dict(row)
        return None
