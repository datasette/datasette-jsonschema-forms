from sqlite_utils import Database
from sqlite_migrate import Migrations

internal_migrations = Migrations("datasette-jsonschema-forms.internal")


@internal_migrations()
def m001_initial(db: Database):
    db.executescript(
        """
          create table datasette_jsonschema_forms(
            id integer primary key autoincrement, 
            created_at datetime not null default CURRENT_TIMESTAMP,
            creator_actor_id text not null,
            last_edited_at datetime,
            name text not null,
            json_schema text not null,
            database_name text not null,
            table_name text not null,
            unique(database_name, name)
          );
        """
    )
