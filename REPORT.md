# Informe de Análisis del Monorepo `@daaxar/monorepo`

Fecha: 2025-08-10

## 1. Resumen Ejecutivo
El monorepo establece una base funcional para gestionar funciones (Lambdas), librerías compartidas y herramientas internas (CLI + CDK). Se utilizan npm workspaces, un CLI propio (`Dx`) y CDK para despliegues. La base es ligera y flexible, pero aún carece de estandarización en compilación, tipado, pruebas, documentación operacional y automatización de releases. Este informe detalla hallazgos, riesgos y un roadmap sugerido.

## 2. Estructura y Dominios
```
funcs/      Funciones (ej: example) – runtime AWS Lambda
libs/       Librerías compartidas (ej: logger)
tools/      Herramientas internas (cli, cdk)
servs/      (Reservado) microservicios backend (vacío actualmente)
app/        (Reservado) frontends (vacío actualmente)
```
Patrones observados:
- Salida de build esperada en `dist/` (esbuild o tsc manual).
- `logger` implementa wrapper simple sobre Pino con factoría y polimorfismo mínimo.
- CLI (`tools/cli`) abstrae build / deploy y detecta workspace actual.
- CDK (`tools/cdk`) transforma configuración en stacks usando patrón Builder para Lambdas.

## 3. Tooling Actual
- Gestor: npm workspaces (sin constraints de versions internas aún).
- Build: esbuild (CLI propia) + llamados manuales a `tsc` para tipos (cada paquete). No hay `tsconfig.base.json` ni project references.
- Calidad: prettier (via lint-staged), commitlint, husky. No hay ESLint ni Type-Checking en pre-commit.
- Tests: Jest global configurado, pero paquetes carecen de tests reales (solo placeholder `echo`). Cobertura global habilitada; sin estrategia por paquete.
- Deploy: CDK con wrapper; no hay validación/guard rails (p.ej. aprobaciones diff, tags de coste, tracing). No se versiona infraestructura.
- Observabilidad: logger base, sin integración con métricas / traces / structured error boundaries.
- Seguridad: no hay auditoría (npm audit / dependabot), ni scanning de secrets.

## 4. Hallazgos Clave y Riesgos
| Área | Hallazgo | Riesgo | Impacto |
|------|----------|--------|---------|
| Build | Scripts `build:types` duplican lógica y no usan project references | Divergencia de tipos / deuda | Medio |
| Logging | Falta tipado enriquecido y correlación (trace/request id) | Dificultad debugging | Medio |
| Testing | Ausencia de tests reales y estrategia de capas | Defectos no detectados | Alto |
| Deploy | No hay validaciones previas (policy diff, tagging obligatorio) | Cambios inseguros / coste | Alto |
| Config | Config runtime via env disperso, sin esquema validado | Errores silenciosos | Medio |
| DX | CLI no cachea builds ni soporta watch / incremental | Ciclo lento | Medio |
| Versionado | Sin pipeline de releases ni tagging semántico automatizado | Inconsistencia artefactos | Medio |
| Seguridad | Sin lint de dependencias / scanning / pinned engines enforcement | Vulnerabilidades | Alto |
| Monitoreo | Sin métricas ni alertas estandarizadas | MTTR alto | Alto |
| Infra as Code | Builders ocultos, falta tests de snapshot para stacks | Regressions infra | Medio |
| Documentación | README general, falta guías operativas / runbooks | Onboarding lento | Medio |

## 5. Oportunidades de Mejora
### Corto Plazo (0-4 semanas)
1. Añadir `tsconfig.base.json` + references; unificar `build` (usar `tsup` o `unbuild` para bundles + d.ts).
2. Introducir ESLint + reglas de import cycles + sonar-like quick wins.
3. Tests mínimos: logger + CLI utils + builder lambda (snapshot).
4. Validación de config con Zod / TypeBox al boot.
5. Añadir `.editorconfig`, `.nvmrc` (si no existe), `SECURITY.md` mínimo.
6. Integrar `npm audit --production` en CI.

### Medio Plazo (1-2 meses)
1. Pipeline CI (build -> test -> lint -> deploy preview) + matrices (Node LTS + current).
2. Automatizar versionado (changesets / semantic-release) y CHANGELOG.
3. Observabilidad: logging con correlation id + redacción de middleware reutilizable.
4. Métricas básicas (CloudWatch EMF / AWS Embedded Metrics) desde Lambda builder.
5. Tagging estándar (CostCenter, Owner, Service, Environment) en todas las stacks/CDK constructs.
6. Cache builds: usar `turbo` o `nx` (si se necesita escalamiento) o `--metafile` de esbuild + hashing simple.

### Largo Plazo (3+ meses)
1. Migración a arquitectura con project graph (NX / Turborepo) si escala >15 paquetes.
2. Adición de tracing distribuido (X-Ray / OpenTelemetry).
3. Generación automática de documentación técnica (TypeDoc + mdbook).
4. Librería interna de infraestructura (constructs comunes) versionada.
5. Policy-as-code (cfn-nag / cdk-nag) + guardrails (GitHub Action).
6. Security scanning continuo (Snyk / Trivy / CodeQL).

## 6. Detalles Técnicos y Recomendaciones
### 6.1 Build & Tipos
- Crear `tsconfig.base.json` con `compilerOptions` comunes (`strict`, `moduleResolution=node`, `resolveJsonModule`, `esModuleInterop`, `declaration`, `composite`=true).
- Cada paquete: `tsconfig.json` que referencia al base y expone `references` a dependencias internas.
- Reemplazar comando manual de `tsc src/index.ts` por `tsc -b` (incremental) o usar `tsup` (genera CJS + d.ts).
- Centralizar script: root `build` -> `tsc -b packages` + bundling (si requerido sólo para runtime lambdas).

### 6.2 Testing
- Capas: unit (funcional), infra (CDK snapshot), integración (lambda handler stub).
- Añadir mocks para AWS (aws-sdk v3 modular) y fixture para logger.
- Coverage thresholds (p.ej. 70% inicial, subir gradual).

### 6.3 CLI / DX
- Añadir modo `Dx build --watch`.
- Añadir `detectProject` memo/cache + fallback a selección interactiva.
- Extender `deploy` con `--tags` y validación de branch (`main`/`release/*` -> despliegue productivo).

### 6.4 CDK / Infra
- Introducir `cdk-nag` para compliance.
- Validar naming y uniqueness (stackName derivado de convención: `<domain>-<service>-<env>`).
- Externalizar config en archivo `stack.config.json` por función, con esquema validado.
- Añadir tests: `expect(Synth(stack)).toMatchSnapshot()`.

### 6.5 Logging & Observabilidad
- Extender logger: `traceId`, `spanId`, `requestId`, `contextVersion`.
- Añadir `logger.child({ correlationId })` en entry points.
- Integrar métricas: wrapper que expone `metrics.putMetric(name, value, unit)` y auto-flush.

### 6.6 Seguridad
- Activar dependabot (ecosistema npm + GitHub Actions).
- Secret scanning (GitHub Advanced Security si disponible); fallback a pre-commit regex minimal.
- Pin de versiones críticas (pino, aws-sdk) y revisión de licencias.

### 6.7 Release & Versioning
- Añadir `changeset` workflow.
- Tag automático + changelog por paquete y aggregated release.
- Política de versionado: libs semver, funcs despliegues inmutables (nombres con hash opcional).

### 6.8 Documentación
- `ARCHITECTURE.md`, `OPERATIONS.md` (despliegue / rollback / monitorización).
- Plantilla de PR con checklist (tests, docs, security).
- Diagrama alto nivel (C4 nivel 1) para contexto.

## 7. Métricas Recomendadas Iniciales
- Lead time build (min).
- Ratio de tests cubiertos.
- Tiempo synth/diff CDK.
- Coste estimado Lambdas (tagging + cost explorer).
- Error rate por función (CloudWatch).

## 8. Roadmap Sugerido (Resumen)
1. Fundamentos (build, lint, tests mínimos).
2. Observabilidad + seguridad básica.
3. Automatización de releases + compliance infra.
4. Escalamiento (graph tooling / tracing / docs avanzadas).

## 9. Lista de EPICs
Ver `TODO.md` para desglose accionable.

---
Este documento sirve como punto de partida. Actualizar trimestralmente o tras cambios significativos de arquitectura.
