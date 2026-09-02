# Invoice API

API REST desarrollada con NestJS para la gestión de ventas e inventario de una empresa de postres. El sistema centraliza el proceso de venta mediante la generación de facturas que agrupan múltiples transacciones, permitiendo administrar información comercial de forma organizada y segura.

El objetivo principal de este proyecto es demostrar la aplicación de buenas prácticas de desarrollo de software, incorporando pruebas automatizadas, análisis de calidad, controles de seguridad y automatización mediante CI/CD.

---

## Tecnologías Utilizadas

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Jest
- ESLint
- Prettier
- GitHub Actions
- CodeQL
- Trivy
- Gitleaks
- CycloneDX SBOM

---

## Requisitos

- Node.js 22 o superior
- npm
- PostgreSQL

---

## Instalación

Clonar el repositorio:

```bash
git clone <repository-url>
cd invoice-api
```

Instalar dependencias:

```bash
npm ci
```

---

## Ejecución Local

Modo desarrollo:

```bash
npm run start:dev
```

Modo producción:

```bash
npm run start:prod
```

---

## Compilación

Generar la versión compilada de la aplicación:

```bash
npm run build
```

---

## Calidad de Código

### Formatear código

Aplica automáticamente las reglas de formato definidas por Prettier.

```bash
npm run format
```

### Verificar formato

Valida que el código cumpla con los estándares definidos sin realizar cambios.

```bash
npm run format:check
```

### Análisis estático

Ejecuta las reglas de ESLint configuradas para el proyecto.

```bash
npm run lint
```

---

## Pruebas

El proyecto utiliza **Jest** como framework principal para la ejecución de pruebas automatizadas.

### Ejecutar pruebas unitarias

```bash
npm test
```

### Ejecutar pruebas en modo observación

```bash
npm run test:watch
```

### Generar reporte de cobertura

```bash
npm run test:cov
```

### Ejecutar pruebas en modo depuración

```bash
npm run test:debug
```

### Ejecutar pruebas End-to-End

```bash
npm run test:e2e
```

---

# Integración Continua y Seguridad

El repositorio incorpora un proceso de Integración Continua (CI) mediante GitHub Actions para validar automáticamente la calidad y seguridad del código antes de su integración en ramas principales.

Los pipelines se ejecutan automáticamente sobre:

- Pull Requests hacia `develop`
- Pull Requests hacia `main`
- Pushes realizados directamente en `main`

## Pipeline de Validación

### Pruebas Unitarias

Verifica que la aplicación compile correctamente y que todas las pruebas unitarias sean exitosas.

Además, valida el cumplimiento de las reglas de formato establecidas mediante Prettier.

### Análisis SAST con CodeQL

Se realiza análisis estático de seguridad sobre el código TypeScript para identificar vulnerabilidades, patrones inseguros y posibles defectos de implementación.

### Escaneo de Vulnerabilidades con Trivy

Se realiza un análisis de dependencias y componentes del proyecto para identificar vulnerabilidades conocidas clasificadas como:

- HIGH
- CRITICAL

### Detección de Secretos con Gitleaks

Se analiza el historial del repositorio y el código fuente en busca de credenciales, contraseñas, tokens o secretos filtrados accidentalmente.

### Generación de SBOM

Se genera automáticamente un **Software Bill of Materials (SBOM)** utilizando el estándar CycloneDX, proporcionando trazabilidad sobre los componentes de software utilizados por la aplicación.

### Security Gate

El pipeline incorpora una política de seguridad que impide aprobar cambios cuando se detectan vulnerabilidades críticas que incumplen los criterios establecidos para el proyecto.

---

# Flujo de Desarrollo

El flujo de trabajo recomendado es el siguiente:

1. Crear una rama de desarrollo.
2. Implementar cambios.
3. Ejecutar validaciones locales.
4. Crear un Pull Request.
5. Esperar la ejecución automática de los pipelines.
6. Realizar revisión de código.
7. Aprobar e integrar los cambios.

---

# Buenas Prácticas Implementadas

Este proyecto busca evidenciar la aplicación de prácticas modernas de ingeniería de software, incluyendo:

- Integración continua (CI).
- Pruebas automatizadas.
- Formateo consistente de código.
- Análisis estático de calidad.
- Análisis estático de seguridad (SAST).
- Escaneo de vulnerabilidades en dependencias.
- Detección temprana de filtración de secretos.
- Generación de SBOM para trazabilidad de componentes.
- Automatización de validaciones previas a la integración.

Aunque el dominio funcional corresponde a la gestión de ventas e inventario, el propósito principal del repositorio es demostrar un ciclo de desarrollo seguro, automatizado y alineado con buenas prácticas de calidad de software.
