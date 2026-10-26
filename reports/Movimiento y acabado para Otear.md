# Demos profundidad y movimiento a Otear

**Otear puede tener una presencia visual expresiva sin dificultar el trabajo con fotos y lotes.** La propuesta concentra el movimiento protagonista en la landing y utiliza transiciones, continuidad y feedback en la demo. Sombras, superficies redondeadas y textura estática aportarán profundidad incluso cuando no haya animación. La base confirmada es Next.js App Router, TypeScript, Tailwind y HeroUI; el backend en Go queda para después. La investigación del 25 de octubre de 2026 no instaló dependencias ni midió un prototipo. Las duraciones y el acabado siguientes son propuestas iniciales del proyecto, no estándares de Apple ni requisitos normativos.

## La landing explica con una secuencia protagonista

Proponemos una escena donde una fotografía aérea se organiza dentro de un lote y se conecta con una observación y un informe. El beneficio y el botón para explorar la demo estarán disponibles desde el inicio. La secuencia se reproducirá una vez y terminará en una composición estática comprensible. Así el producto aporta la identidad visual: fotografías de campo, límites de lote y capas de información.

El desplazamiento seguirá siendo nativo. No se interceptarán rueda, gestos táctiles ni navegación para obligar a terminar una escena. Una textura topográfica o grano tenue podrá aparecer en zonas de marca, separada de fotografías utilizadas como evidencia, mapas y texto pequeño. Las sombras tendrán niveles consistentes para superficies, paneles flotantes y diálogos; el desenfoque quedará limitado a áreas concretas y se revisará si introduce coste.

## La demo preserva contexto y responde enseguida

Cambiar de fecha mantendrá visibles lote y etiquetas; abrir una imagen conservará el contexto de la galería. Al registrar un hallazgo, una confirmación textual mostrará el resultado. La comparación responderá directamente al control del usuario, con alternativa de teclado y vista lado a lado. No usaremos desplazamientos automáticos sobre fotos que se estén inspeccionando ni transiciones que aparenten cambios detectados en el cultivo.

Como inicio proponemos **120–180 ms para feedback, 180–260 ms para cambios de estado, 300–450 ms para overlays y 500–700 ms para una escena especial de landing, una vez**. Son valores para probar; no se añaden como esperas antes de ejecutar acciones. No habrá porcentajes ni retrasos falsos para simular análisis. La secuencia puede interrumpirse y siempre gana la selección más reciente.

HeroUI v3 ya utiliza transiciones y keyframes CSS para sus controles, según su documentación. Conservaremos esos estados antes de crear otros equivalentes. CSS cubre la primera implementación; **Motion no se incorpora ahora**. Solo un caso concreto de continuidad entre elementos o secuencia coordinada justificaría evaluar el paquete `motion`, con imports actuales `motion/react`. ([HeroUI v3](https://heroui.com/en/docs/react/releases/v3-0-0), [animación HeroUI](https://heroui.com/en/docs/react/getting-started/animation), [instalación Motion](https://motion.dev/docs/react-installation))

## Reducir movimiento conserva información y control

La meta general es WCAG 2.2 AA. Respetar `prefers-reduced-motion` también será requisito del proyecto: WCAG 2.3.3 sobre movimiento por interacción es **AAA**, por lo que no debemos presentarlo como requisito AA. La variante reducida mostrará el estado final y retirará paralaje, zoom, paneos y loops decorativos. El soporte de HeroUI no cubre automáticamente animaciones propias. ([W3C 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [preferencia de movimiento](https://web.dev/articles/prefers-reduced-motion))

El contenido móvil automático de más de cinco segundos junto a otro contenido requiere controles en las condiciones de WCAG 2.2.2; la primera landing evitará esa necesidad con una escena finita. Para rendimiento, priorizaremos `transform` y `opacity`, reservaremos espacio para imágenes y evitaremos animar grandes sombras o filtros. Revisaremos el recorrido cambiado, teclado, móvil, reducción de movimiento e interrupción; mediremos la escena si aparecen tirones. ([W3C 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), [rendimiento CSS](https://web.dev/articles/animations-guide))

## Tres lecturas convierten efectos en decisiones

**Animation at Work**, de Rachel Nabors, aporta un [extracto autorizado](https://alistapart.com/article/patterns-and-purpose/) sobre transiciones, feedback, demostración y decoración. **Designing Interface Animation**, de Val Head, ofrece un [índice editorial público](https://rosenfeldmedia.com/books/designing-interface-animation/) centrado en orientación, atención, causa y efecto. **Refactoring UI**, de Adam Wathan y Steve Schoger, presenta [índice y capítulos gratuitos](https://refactoringui.com/) para profundidad, sombras y jerarquía. Se consultaron esas partes públicas; no los libros comerciales completos.

La [guía práctica](../docs/MOTION_GUIDELINES.md) concentra los criterios para los agentes. Cada pestaña se diseñará cuando el usuario describa su objetivo. Antes de implementarla bastará definir el cambio de estado, el propósito visual, la variante reducida y una comprobación concreta: ese acuerdo evita reinventar efectos en cada pantalla.
