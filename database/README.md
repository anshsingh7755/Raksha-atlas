# Raksha Atlas database

PostgreSQL is the shared application database. Migrations are numbered and
should be applied in order.

The first migration creates `inventory_items`, matching the stable fields in
`server/inventory.json`. It is additive and is not connected to the live Node
API yet.

```text
database/migrations/
└── 001_inventory.sql
```

Next database step: add a small Spring Data repository and read-only endpoint
after Java 21, Maven, and a PostgreSQL instance are available.
