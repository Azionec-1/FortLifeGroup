# Parte 2 - Diseno de Schema Prisma (No disruptivo)

## Objetivo
Extender el modelo de datos para SST sin romper el flujo existente de autenticacion, registro, login, perfil y recuperacion de contrasena.

## Cambios aplicados
- Se mantuvieron los modelos actuales de Auth.js:
  - `User`, `Account`, `Session`, `VerificationToken`, `PasswordResetToken`.
- Se agrego `companyId` opcional en `User` para futura asignacion organizacional.
- Se agregaron enums y modelos nuevos para los modulos SST y comercial.

## Enums nuevos
- `WorkerStatus`
- `HazardSeverity`
- `HazardStatus`
- `ContractType`
- `AttachmentType`

## Modelos nuevos
- `Company`
- `Worker`
- `EppDelivery`
- `AuditRecord`
- `AuditAttachment`
- `IncidentRecord`
- `IncidentAttachment`
- `HazardRecord`
- `TrainingRecord`
- `TrainingAttendance`
- `TrainingAttachment`
- `OccupationalDiseaseRecord`
- `ServiceCatalog`
- `Plan`
- `PlanBenefit`

## Decisiones de compatibilidad
1. No se hicieron cambios destructivos sobre modelos existentes.
2. Las nuevas relaciones en `User` son opcionales.
3. Los nuevos modulos estan desacoplados de las rutas actuales, por lo que la funcionalidad existente no se altera.

## Nota para la siguiente parte
En Parte 3 se recomienda:
1. Crear migracion controlada (`prisma migrate`) en lugar de depender de `db push` en build.
2. Agregar seed basico para `ServiceCatalog`, `Plan` y `PlanBenefit`.
3. Construir APIs por modulo empezando por `workers` y `epp`.
