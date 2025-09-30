dev_db:
  sqlite3 tmp.db < tests/schema.sql

dev *options: dev_db
  DATASETTE_SECRET=abc123 \
  watchexec \
    --stop-signal SIGKILL \
    --ignore '*.db' \
    --ignore '*.db-journal' \
    --ignore '*.db-wal' \
    --restart \
    --clear -- \
      uv run \
      --with-editable '.' \
      --with datasette-visible-internal-db \
      datasette \
        --root \
        -s permissions.datasette-jsonschema-forms-access.id root \
        tmp.db \
        --internal tmp.internal.db \
        {{options}}

js *options:
  just frontend/dev {{options}}