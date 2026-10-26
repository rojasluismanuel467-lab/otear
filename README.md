# Otear

Validación comercial de una plataforma para centralizar información aérea de proyectos agrícolas, viales, de construcción y vigilancia, y convertirla en observaciones, tareas e informes. El caso agrícola inicial es un escenario de ejemplo.

## Estado

Proyecto base de Next.js con App Router, TypeScript estricto, Tailwind CSS y HeroUI. La ruta raíz devuelve `null`: no hay pantallas, navegación ni contenido de producto todavía. El PDF de investigación es material de referencia; sus datos sintéticos y resultados simulados no son evidencia comercial validada.

## Desarrollo local

Usar Node.js 22 (`nvm use` si se utiliza nvm). npm es el gestor de paquetes del proyecto y `package-lock.json` fija la instalación.

```bash
npm ci
npm run dev
```

El servidor de desarrollo abre la aplicación en `http://localhost:3000`. La página estará vacía hasta implementar la primera pantalla indicada por el usuario.

```bash
npm run check        # Tipos, ESLint y formato del código/configuración
npm run build        # Compilación de producción
npm run build:webpack # Alternativa con Webpack
npm start            # Ejecutar la compilación de producción
npm run format       # Aplicar formato al código/configuración
```

`src/app` contiene el layout técnico, los estilos globales y la ruta vacía. El alias `@/` apunta a `src/`. Las carpetas de funcionalidades y componentes se crearán cuando tengan contenido. HeroUI v3 importa estilos globales y no requiere un proveedor global; la interactividad se agregará en límites de cliente locales cuando sea necesaria.

En la sesión de preparación, Turbopack encontró una restricción al abrir un puerto interno. Se verificó la compilación con `npm run build:webpack` fuera del sandbox; tipos, lint y formato pasaron con `npm run check`. `npm run dev:webpack` ofrece la misma alternativa para desarrollo. No se deshabilitan las comprobaciones de TypeScript para compilar.

ESLint 9 se conserva por compatibilidad con los rangos publicados de `eslint-plugin-react` y `eslint-plugin-jsx-a11y` que trae esta versión de la configuración de Next.js. npm informa que esa rama de ESLint está fuera de soporte; actualizar el conjunto compatible al revisar dependencias, sin forzar peers incompatibles.

No se necesitan variables de entorno para arrancar esta base. El código no conecta APIs ni envía información. Las comprobaciones de comportamiento se añadirán con las primeras funcionalidades; no hay una batería de pruebas vacías de ejemplo.

## Primera entrega prevista

- Landing pública que explique el beneficio y permita solicitar un piloto.
- Demo sin registro con una finca de ejemplo, marcada como demostración.
- Recorrido: lote → vuelo → comparación → observación → informe.
- Captación real de interesados solo cuando se configure un destino de almacenamiento y su aviso de privacidad.
- Medición del recorrido y de solicitudes; seleccionar proveedor antes de instrumentar.

No se incluyen en esta etapa análisis automático real, carga de vuelos reales, pagos ni autenticación.

## Base confirmada

El usuario confirmó Next.js para el frontend y HeroUI como librería visual. Base: Next.js 16.4.3, HeroUI 3.2.6, TypeScript estricto y Tailwind CSS 4. Un solo proyecto para landing y demo, con componentes compartidos y datos de ejemplo separados. Las versiones exactas están en `package.json` y `package-lock.json`. Ver [decisión técnica](docs/decisions/001-frontend-base.md).

Primero se construye y valida el frontend. Después se desarrollará el backend en Go; su arquitectura y API se definirán en esa etapa. La demo funcionará con datos sintéticos locales. El formulario no indicará que envió una solicitud hasta tener una integración real configurada.

## Referencias

- [Investigación de bases visuales](reports/Base%20visual%20para%20Otear.md) y [guía UX para las entregas](docs/UX_GUIDELINES.md).
- [Movimiento y acabado: investigación](reports/Movimiento%20y%20acabado%20para%20Otear.md), [guía práctica](docs/MOTION_GUIDELINES.md) y [convenciones de frontend](docs/FRONTEND_CONVENTIONS.md).
- [Instrucciones de entrada para agentes](AGENTS.md): alcance, fuentes y verificación acotada.
- [Skill de producto y experiencia](.agents/skills/otear-product-design/SKILL.md): decisiones compartidas de UI, UX, ergonomía y negocio; se puede invocar como `$otear-product-design` cuando esté descubierta por el cliente, o seguir su ruta desde `AGENTS.md`.
- [Matriz de Dorfman provisional](docs/context/matriz-dorfman-provisional.md): contexto sujeto a cambios; no amplía el alcance de esta etapa. Política de GPS pendiente y G6 sin confirmar.
- [Módulos descritos por el usuario](docs/context/modulos-propuestos.md): alcance provisional; creación de pantallas pendiente de indicación expresa.
- [Alcance multisector y feedback operativo](docs/context/alcance-multisector-y-feedback.md): sectores confirmados y necesidades nuevas por validar.
- [Plan de trabajo y responsabilidades](docs/planning/plan-de-trabajo.md): orden de construcción y límites entre agentes, sin pantallas autorizadas todavía.
- Investigación: `Otear_Entrega_Prototipo_Baja_Fidelidad_LUIS M ROJAS.pdf`.
- [Figma: ingreso web actual](https://www.figma.com/design/Q6mPLc5fmbp56a2Zm4zPii/?node-id=40-3).
- [Miro: arquitectura y flujos](https://miro.com/app/board/uXjVEVlnKmc=/).

## Forma de trabajo

Cerrar alcance y referencia visual antes de construir pantallas. Entregar incrementos pequeños, verificar comportamientos importantes y registrar decisiones que afecten a trabajos posteriores. Evitar incorporar módulos de una plantilla que no pertenezcan al alcance.
