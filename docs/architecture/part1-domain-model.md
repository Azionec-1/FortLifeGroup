# Parte 1 - Dominio y Estructura Escalable

## Objetivo
Definir la base funcional y técnica del sistema SST antes de implementar lógica y UI de cada módulo.

## Alcance de la Parte 1
- Definición de dominios del sistema.
- Entidades principales y relaciones.
- Convenciones de identificadores.
- Estructura de carpetas modular para escalabilidad.

## Dominios del sistema
1. Comercial
- Catálogo de servicios SST.
- Contacto.
- Planes y beneficios para usuarios registrados.

2. Operación SST
- Trabajadores.
- Entrega de EPP.
- Auditorías.
- Accidentes.
- Peligros.
- Capacitaciones.
- Enfermedades ocupacionales.

3. Plataforma
- Autenticación y autorización.
- Adjuntos/evidencias.
- Auditoría de cambios.

## Entidades base (propuesta)
1. Company
- Organización dueña de la data (si se habilita multiempresa).

2. Worker
- Datos del trabajador.
- Estado: `ACTIVE` / `INACTIVE`.
- Campo `workerCode` entero incremental y legible (1,2,3...).
- Referencia a empresa.

3. EppDelivery
- Entrega de EPP vinculada a `Worker`.
- Fecha, ítem entregado, responsable, observación.

4. AuditRecord
- Registro de auditoría SST.
- Fecha, actividad, responsable, resultado, observaciones.

5. IncidentRecord
- Registro de accidente.
- Trabajador, actividad, tipo de contrato, horas trabajadas previas, procedimiento aplicado, declaración del trabajador, observación de empresa.

6. IncidentAttachment
- Evidencias del accidente (foto accidente, área y tipo de trabajo).

7. HazardRecord
- Riesgo identificado.
- Severidad: `LOW` / `MEDIUM` / `HIGH` / `CRITICAL`.
- Estado: `PENDING` / `MITIGATED`.

8. TrainingRecord
- Evento de capacitación SST.
- Tema, responsable, fecha, observaciones.

9. TrainingAttendance
- Relación N:N entre capacitación y trabajadores asistentes.

10. OccupationalDiseaseRecord
- Enfermedad ocupacional registrada para trabajador.
- Tipo, fecha, detalle y seguimiento.

11. ServiceCatalog
- Servicios visibles en sección Contacto.

12. Plan
- Plan comercial ofrecido.

13. PlanBenefit
- Beneficios por plan.

## Relaciones clave
- `Company 1:N Worker`
- `Worker 1:N EppDelivery`
- `Worker 1:N IncidentRecord`
- `IncidentRecord 1:N IncidentAttachment`
- `Worker 1:N OccupationalDiseaseRecord`
- `TrainingRecord N:N Worker` (vía `TrainingAttendance`)
- `Plan 1:N PlanBenefit`

## Convenciones de IDs
- ID técnico: `cuid()` (interno y estable).
- ID visible de trabajador: `workerCode` numérico incremental.
- Regla recomendada: `@@unique([companyId, workerCode])`.

## Reglas funcionales iniciales
1. Al registrar trabajador:
- Asignar `workerCode` siguiente disponible en su empresa.

2. Al registrar entrega de EPP:
- Debe existir trabajador activo.
- Registrar historial (no sobrescribir).

3. Accidentes y auditorías:
- Permitir adjuntos y trazabilidad temporal.

4. Peligros:
- Mantener estado y fecha de mitigación cuando aplique.

## Estructura de carpetas adoptada
- `src/modules/public`
- `src/modules/auth`
- `src/modules/plans`
- `src/modules/workers`
- `src/modules/epp`
- `src/modules/audits`
- `src/modules/incidents`
- `src/modules/hazards`
- `src/modules/trainings`
- `src/modules/occupational-diseases`
- `src/modules/shared`
- `src/app/(public)`
- `src/app/(dashboard)`

## Entregable de la Parte 1
- Arquitectura modular definida.
- Modelo de dominio aprobado para pasar a Parte 2 (schema Prisma y migraciones).
