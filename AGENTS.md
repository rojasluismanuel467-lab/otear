# Trabajo en Otear

## Alcance y base confirmados

Construimos primero el frontend para validar comprensión e interés: landing y demo con datos sintéticos. Alcance multisector confirmado: agricultura, carreteras, construcción y vigilancia. El recorrido agrícola lote → vuelo → comparación → observación → informe es un escenario inicial; no fijar el núcleo del producto exclusivamente a fincas. El usuario describirá las pestañas secuencialmente; no anticipar pantallas ni módulos todavía no definidos.

Base: Next.js App Router, TypeScript estricto, Tailwind y HeroUI. El backend será en Go en una etapa posterior; no implementarlo ni diseñar toda su arquitectura para resolver la demo. No presentar simulaciones como ingesta, análisis, almacenamiento o envíos reales.

## Antes de modificar

Para diseñar, implementar o revisar una experiencia de Otear, aplicar la skill del proyecto `.agents/skills/otear-product-design/SKILL.md`. Es la entrada común para decisiones de UI, UX, ergonomía, iconos, imágenes y valor de negocio. Leer sus referencias solo cuando correspondan; no releerla ni ejecutar revisiones completas por cada edición mecánica.

Leer `README.md` y solo las secciones relevantes de:

- `docs/UX_GUIDELINES.md`: tareas, contexto, accesibilidad y honestidad de demo.
- `docs/MOTION_GUIDELINES.md`: animación, sombras, textura y movimiento reducido.
- `docs/FRONTEND_CONVENTIONS.md`: estructura, componentes y convenciones técnicas.

Reutilizar HeroUI y tokens compartidos antes de crear variantes o introducir dependencias. La documentación de decisiones registra elecciones; los informes aportan fundamento sin necesidad de releer investigación completa en cada tarea.

## Base y comandos

Usar Node.js 22 y npm con `package-lock.json`. `npm ci` instala la base; `npm run dev` inicia desarrollo; `npm run check` verifica tipos, lint y formato; `npm run build` compila producción. `npm run format` aplica formato al código y configuración. Crear tests de comportamiento cuando existan funcionalidades que los justifiquen.

Next.js: consultar las secciones necesarias de `node_modules/next/dist/docs/` correspondientes a la versión instalada. HeroUI v3 usa CSS global y no necesita el provider de v2. No introducir APIs antiguas ni otra librería de animación por defecto. El usuario autorizó ahora las pantallas de los módulos como propuesta frontend navegable; respetar los límites de archivos asignados, PRODUCT.md y DESIGN.md. Backend e integraciones operativas siguen fuera de alcance.

## Contexto provisional

`docs/context/matriz-dorfman-provisional.md` contiene capacidades futuras sujetas a cambios; no amplía el alcance actual. La política de fotos sin GPS contradice el PDF inicial y sigue pendiente. G6 no está confirmado. No resolver silenciosamente contradicciones ni convertir componentes lógicos en microservicios obligatorios. Mantener contenido del producto en lenguaje del productor.

Leer la actualización `docs/context/alcance-multisector-y-feedback.md` al planificar módulos. El alcance multisector está confirmado; recurrencia, urgencias, paquetes y asesoría son necesidades por validar. Mantener lenguaje propio del sector seleccionado. No asumir que Otear presta vuelos por recibir feedback sobre servicios de operadores. `docs/planning/plan-de-trabajo.md` propone responsabilidades: los agentes trabajan en archivos distintos y el integrador controla los cambios compartidos.

## Entregas y coordinación

Trabajar en cambios pequeños que completen una tarea. Si intervienen varios agentes, asignar componentes/archivos concretos, acordar límites y evitar ediciones simultáneas del mismo componente; integrar con una sola fuente de tokens y patrones.

Verificar el recorrido cambiado, estados relevantes, teclado, móvil y movimiento reducido cuando corresponda. Ejecutar tipos, lint y compilación una vez configurados. Añadir pruebas para comportamiento significativo y ampliar comprobaciones ante fallos o regresiones; no repetir auditorías completas ni escribir pruebas que solo copien markup por ajustes cosméticos. Informar cambios, verificación y límites concretos.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
