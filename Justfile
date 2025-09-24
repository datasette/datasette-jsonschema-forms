dev *options:
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
        {{options}}

js *options:
  just frontend/dev {{options}}