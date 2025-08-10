# Backlog Estratégico (EPICs) – Monorepo DAAx

Formato: `[Prioridad] (Tipo) Tarea`  
Prioridades sugeridas: P0 crítico, P1 alto, P2 medio, P3 bajo.

## EPIC 1: Build & Tooling Modernización
- [P0][build] Crear `tsconfig.base.json` con opciones estrictas.
- [P0][build] Añadir `tsconfig.json` por paquete con `references`.
- [P0][build] Reemplazar `tsc src/index.ts` por `tsc -b` o `tsup` (evaluar).
- [P1][build] Unificar script `build:types` -> remover duplicaciones.
- [P1][build] Añadir soporte `Dx build --watch`.
- [P2][build] Evaluar adopción Turborepo / Nx para cache incremental.
- [P2][build] Generar bundles dual (cjs + esm) para libs públicas futuras.

## EPIC 2: Testing & Quality
- [P0][test] Añadir tests unitarios para `logger` (info/error path + child).
- [P0][test] Test de `utils.detectProject` (rutas relativas / root).
- [P1][test] Snapshot CDK stack (synth) mínimo.
- [P1][quality] Integrar ESLint (typescript-eslint + import + jest plugin).
- [P1][quality] Configurar thresholds cobertura inicial (70%).
- [P2][test] Tests integración Lambda (handler stub + env).
- [P2][quality] Añadir pre-push hook: `npm test && tsc --noEmit`.
- [P3][test] Reporte cobertura a badge (Codecov/GitHub).

## EPIC 3: Infraestructura & Despliegue (CDK)
- [P0][infra] Generar artefacto build para `tools/cdk` antes de deploy (pipeline).
- [P0][infra] Validar naming stack (`<dominio>-<servicio>-<env>`).
- [P1][infra] Incorporar `cdk-nag` (best practices) y suprimir justificados.
- [P1][infra] Esquema de config (Zod) para `StackConfig` y validación temprana.
- [P1][infra] Tagging obligatorio (CostCenter, Owner, Environment).
- [P2][infra] Añadir alarmas estándar (Errors ≥ N, Duration p95, Throttles) condicionales.
- [P2][infra] Integrar métricas EMF (wrapper) en runtime.
- [P3][infra] Policy-as-code (cfn-nag) en CI.

## EPIC 4: Developer Experience
- [P0][dx] Plantilla de Pull Request con checklist (tests, docs, security).
- [P1][dx] Añadir `.editorconfig`.
- [P1][dx] Añadir script `npm run lint` centralizado.
- [P1][dx] Comando `Dx projects` para listar.
- [P2][dx] Autocomplete shell para `Dx` (bash/zsh).
- [P2][dx] Documentar flujos comunes en `OPERATIONS.md`.
- [P3][dx] Añadir modo interactivo extendido (build+deploy pipeline).

## EPIC 5: Observabilidad & Logging
- [P0][obs] Añadir `correlationId` en logger (propagación child logger).
- [P1][obs] Normalizar formato de errores (error.type, error.stack, cause?).
- [P1][obs] Añadir nivel `trace` opcional y redacción JSON consistente.
- [P1][obs] Middleware Lambda para inyectar requestId y flush métricas.
- [P2][obs] Integrar tracing (AWS X-Ray / OpenTelemetry). 
- [P3][obs] Exportar métricas a dashboard Terraform o CDK construct.

## EPIC 6: Documentación & Gobernanza
- [P0][docs] `ARCHITECTURE.md` (alto nivel + diagrama).
- [P0][docs] `SECURITY.md` (responsabilidades básicas, disclosure).
- [P1][docs] `OPERATIONS.md` (deploy, rollback, diff, debug).
- [P1][docs] `RELEASE.md` (flujo semántico y etiquetado).
- [P2][docs] Generar TypeDoc para libs.
- [P3][docs] Portal interno (mkdocs / docusaurus) consolidado.

## EPIC 7: Seguridad & Compliance
- [P0][sec] Activar Dependabot (npm + GH Actions).
- [P0][sec] Añadir script `npm run audit:ci` (fail high severity).
- [P1][sec] Pre-commit scanning simple de secretos (regex tokens básicos).
- [P1][sec] Bloquear pushes a `main` sin PR (branch protection).
- [P2][sec] CodeQL workflow (análisis estático).
- [P2][sec] Snyk/Trivy scanning contenedores (si aplica futuro).
- [P3][sec] Inventario licencias y política de aprobación.

## EPIC 8: Performance & Cost Optimization
- [P1][perf] Ajustar memory/time de Lambdas basados en métricas reales.
- [P1][perf] Activar compresión (si HTTP) y revisar cold starts.
- [P2][perf] Añadir layers comunes (logger, metrics) para reducir tamaño.
- [P2][cost] Auto-tagging + reporte mensual (script). 
- [P3][perf] Pruebas de carga sintéticas básicas (artillery/k6) para endpoints expuestos vía URL.

## EPIC 9: Release & Versioning Automation
- [P0][rel] Integrar `changesets` o `semantic-release` multi-package.
- [P1][rel] Generar CHANGELOG por paquete + root agregador.
- [P1][rel] GitHub Action: build+test+publish (libs) en tags.
- [P2][rel] Publicar artefactos (si open-source futuro) con provenance (SLSA nivel básico).
- [P3][rel] Dashboard de releases (gh api script).

## EPIC 10: Escalabilidad Arquitectónica (Opcional Futuro)
- [P2][arch] Evaluar adopción Nx/Turbo (si >15 paquetes o builds lentos).
- [P2][arch] Extraer constructs comunes (LambdaBuilder, Observability) en `libs/infra`.
- [P3][arch] Monorepo polyglot (añadir Go/Python) – definir estrategia.

## EPIC 11: Calidad del Código & Estándares
- [P0][code] Activar `strict` y `noUncheckedIndexedAccess` en TS.
- [P1][code] Regla ESLint: prohibir imports relativos largos (usar path aliases).
- [P2][code] ADR (Architecture Decision Records) plantilla y directorio `/adr`.
- [P3][code] Métrica de complejidad ciclomática en CI (límite orientativo).

## EPIC 12: Operaciones & Runbooks
- [P1][ops] Runbook: caída de Lambda / throttling.
- [P2][ops] Procedimiento de rollback (CDK diff + tag previo).
- [P2][ops] Escalamiento de límites AWS guía.
- [P3][ops] Simulaciones incidentes trimestrales (game days) – registrar lecciones.

---
### Dependencias entre EPICs (simplificado)
Fundacionales: EPIC 1, 2 → Desbloquean 3,4,5.  
Seguridad base: EPIC 7 depende parcialmente de 1 (scripts) y 2 (CI).  
Release (9) depende de tests (2) y build estable (1).  
Escalamiento (10) se pospone hasta que 1 + 2 + 3 estén maduros.

---
### Primer Sprint (Sugerencia)
1. EPIC 1: tsconfig base + build unificado.  
2. EPIC 2: tests logger + utils + ESLint.  
3. EPIC 5: correlationId básico.  
4. EPIC 7: Dependabot + audit script.  
5. EPIC 6: ARCHITECTURE.md borrador.

---
Actualizar este backlog tras cada iteración (añadir métricas de avance: % tasks completadas por EPIC y tiempo medio de ciclo). 
