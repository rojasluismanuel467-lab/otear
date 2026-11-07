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

## Sistema de diseño del prototipo «Verificar el cobro» (Semana 3)

Aplica a `src/features/prototype/verify-charge/` y `src/app/prototipo/`. La landing y la demo tienen su propio lenguaje (`DESIGN.md`); no mezclar. Estas reglas se leen antes de generar cualquier código del prototipo, y vienen del UI Kit de Figma (archivo «Otear · Prototipo de baja fidelidad», página `_UI Kit`).

**Fuente única de valores: `theme.json`.** `npm run theme` genera `verify-charge/theme.css` (variables `--ds-*`, alcance `[data-ds="otear"]`). `npm test` falla si el CSS tiene un color, `font-size` o duración escritos a mano, o si `theme.css` no coincide con `theme.json`. Para cambiar un valor: editar `theme.json`, `npm run theme`, y actualizar el estilo en Figma.

| Qué | Reglas |
| --- | --- |
| Color | Solo `var(--ds-color-*)`: primary (default, hover, soft), secondary, surface (default, background, disabled), text (ink, muted), border (control, subtle), error, success, warning (cada uno default, wash, ink). Texto ≥ 4,5:1; bordes de controles ≥ 3:1 (probado en `theme.test.ts`). |
| Tipografía | Instrument Sans. Tres roles, cinco estilos: Heading/Page 28/36 700, Heading/Section 20/28 700, Body/Default 16/24 400, Body/Strong 16/24 600, Caption/Default 14/20 400. Nada por debajo de 14 px. En el CSS se usan los atajos `--t-*` del `.root`, que solo se arman con variables del tema. |
| Espaciado | Escala de 8 pt: `--ds-space-4, 8, 12, 16, 24, 32`. Ningún otro valor. |
| Radio | `--ds-radius-small` 4 (etiquetas), `medium` 8 (botones, campos, avisos), `large` 16 (tarjetas, diálogo). |
| Objetivo táctil | `--ds-size-target` 44 px de alto mínimo para todo lo que se pulsa. |
| Foco | `box-shadow: var(--ds-focus-ring)` más `outline: 2px solid transparent` (visible en colores forzados). Nunca quitar el foco. |
| Movimiento | Pasar el cursor: `--ds-motion-fast` (150 ms). Cambio de estado: `--ds-motion-base` (250 ms) con `--ds-motion-easing-out`. Con `prefers-reduced-motion` todo es instantáneo. No agregar librerías de animación. |
| Estado | Nunca solo color: cada estado lleva una palabra (Aviso, Cargando, Listo, Atención, Error) y una forma de borde (continuo, discontinuo para cargando y deshabilitado). |

**Componentes: mismo nombre en Figma y en el código.** Cada componente del repositorio lleva su nombre del UI Kit en `data-ds`, y sus estados son los del UI Kit.

| Figma (página `_UI Kit`) | Código | Estados |
| --- | --- | --- |
| `Button/Primary/*`, `Button/Secondary/*` | `Button` en `parts.tsx` (`variant`) | Default, Hover, Focus, Disabled (`disabled`), Loading (`loading`) |
| `ButtonWithReason/*` | `ButtonWithReason` | Enabled, Disabled con la razón escrita debajo |
| `Field/Text/*` | `.input` / `.textarea` en `share-screen.tsx` (`data-ds="Field/Text"`) | Default, Focus, Disabled, Error (`aria-invalid`), Success |
| `Alert/*` | `Alert` (`kind`) | Info, Loading, Success, Warning, Error |
| `Badge/Status/*` | `Badge` (`kind`) | Default, Success, Warning, Error |

**Micro-interacciones críticas (no cambiar su comportamiento):** (1) «Comparar» → «Comparando…» → resultado o error; (2) «Aceptar el cobro» → «Registrando…» → aceptado o error con «Reintentar». El estado de carga aparece en el mismo clic (medido: ≤ 20 ms; el criterio es ≤ 100 ms) dentro del mismo botón y el resultado entra en 250 ms. Todo error dice qué pasó, por qué y qué hacer (`ErrorText`).

**Al aplicar el sistema:** una pantalla por vez (lista de labores, verificar, compartir evidencia); no se agregan pantallas ni se cambia el flujo de S2; la lógica pura (`verification.ts`) no se toca; correr `npm run check` y `npm test`; recapturar con `npm run capture:prototype -- --label despues` (guarda en `docs/planning/prototipo-s3/capturas/`). La skill `otear-prototipo-s2` fija el flujo y el contenido; sus reglas de «solo grises», Arial y «sin animación» quedaron reemplazadas por esta sección (ver `otear-prototipo-s3`).

**Mensajes de commit:** `tipo(ámbito): resumen en español`, tipos `feat`, `fix`, `refactor`, `docs`, `test`, `chore`; ámbitos del prototipo `prototipo`, `ds` (tokens, theme.json), `entrega`. Ejemplos: `feat(ds): theme.json y variables CSS del UI Kit`, `refactor(prototipo): StateBox pasa a Alert con los cinco estados`, `docs(entrega): auditoría de la Semana 3`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
