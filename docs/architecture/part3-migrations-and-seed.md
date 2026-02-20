# Parte 3 - Migraciones Controladas y Seed Base

## Objetivo
Pasar de `db push` a flujo de migraciones versionadas compatible con PostgreSQL y Vercel.

## Cambios aplicados
1. Se archivaron migraciones legacy de SQLite en:
- `prisma/migrations_sqlite_legacy/`

2. Se normalizo el lock de migraciones a PostgreSQL:
- `prisma/migrations/migration_lock.toml`

3. Se genero baseline de migracion PostgreSQL:
- `prisma/migrations/20260218120000_postgres_baseline/migration.sql`

4. Se actualizo `package.json`:
- `build`: `prisma generate && prisma migrate deploy && next build`
- `db:migrate:dev`
- `db:migrate:deploy`
- `db:seed`
- `prisma.seed`: `node prisma/seed.mjs`

5. Se agrego estructura modular de seed (solo necesaria):
- `prisma/seed.mjs`
- `prisma/seeds/core/commercial-base.mjs`

## Alcance del seed inicial
- Crea/actualiza empresa base `FortLife Group`.
- Carga `ServiceCatalog` inicial.
- Carga planes: `BASIC`, `PRO`, `ENTERPRISE`.
- Carga beneficios por plan.

## Comandos operativos
1. Desarrollo
- `npm run db:migrate:dev`

2. Produccion/Vercel
- `npm run db:migrate:deploy`

3. Seed
- `npm run db:seed`

## Nota de compatibilidad
No se modifico la logica funcional actual de login/registro/perfil/reset.
