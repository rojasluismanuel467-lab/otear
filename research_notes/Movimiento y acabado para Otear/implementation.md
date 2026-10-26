# Implementación de movimiento y acabado para Otear

Consulta: 25 de octubre de 2026. Base acordada por el equipo: Next.js + HeroUI. Se consultaron seis páginas primarias. Investigación previa al código: no se instalaron dependencias, no se verificaron versiones efectivas del proyecto ni se midió rendimiento.

## ¿Qué movimiento proporciona HeroUI v3 y qué API debemos seguir?

### Takeaway
HeroUI v3 ya anima sus controles mediante CSS. No hace falta añadir una biblioteca de animación para obtener botones, popovers y acordeones con respuesta visual cuidada. Debemos trabajar con documentación v3 y evitar copiar supuestos de v2.

### Cited Findings
- La publicación de v3 describe el cambio de Framer Motion en v2 a transiciones y keyframes CSS en v3. Separa `@heroui/styles` de la implementación de comportamiento `@heroui/react`, y utiliza Tailwind 4 y React Aria Components. [Publicación v3](https://heroui.com/en/docs/react/releases/v3-0-0).
- Los controles exponen estados mediante atributos como `data-pressed`, `data-hovered`, `data-focus-visible`, `data-entering`, `data-exiting` y `aria-expanded`. La guía muestra entrada/salida de popover, respuesta de botón y expansión de acordeón. Admite CSS propio y librerías JavaScript opcionales. [Animation](https://heroui.com/en/docs/react/getting-started/animation).
- La guía de HeroUI declara respeto automático de `prefers-reduced-motion` para sus animaciones incorporadas. Extiende `motion-reduce:` a `data-reduce-motion`; `data-reduce-motion="true"` permite desactivarlas en la aplicación. También recomienda preferir `transform` y `opacity` frente a propiedades como `left`, y retirar `will-change` cuando deja de necesitarse. [Animation](https://heroui.com/en/docs/react/getting-started/animation).
- La publicación aclara que `data-reduce-motion="false"` fuerza animaciones y que omitir el atributo deja decidir al sistema. [Publicación v3](https://heroui.com/en/docs/react/releases/v3-0-0).

### Inferences
- Conservar las microinteracciones predeterminadas de HeroUI, afinando unos pocos tokens compartidos en vez de redefinir cada control.
- No forzar `data-reduce-motion="false"`: respetar la preferencia del sistema y, si ofrecemos un ajuste propio, permitir reducir el movimiento.
- Las animaciones CSS propias deben cubrir explícitamente `prefers-reduced-motion` y nuestro eventual ajuste manual. El soporte automático del componente no implica que una animación CSS nueva ni un componente Motion nuevo queden cubiertos.
- Evitar aplicar simultáneamente dos escalados al mismo botón, uno de HeroUI y otro de Motion. Una capa exterior para composición permite aislar responsabilidades, pero también debe comprobarse que no altere foco ni semántica.

### Gaps
- No se auditó cada componente v3 ni se validó una versión concreta publicada. No asumir que ejemplos antiguos con HeroUIProvider, props de v2 o animación React Native aplican al frontend web v3.

## ¿Cuándo añadir Motion for React y cómo integrarlo con Next.js?

### Takeaway
Empezar con HeroUI + CSS. Añadir **un solo paquete Motion** cuando exista un caso aprobado que requiera continuidad entre elementos, secuencias coordinadas, entrada/salida de contenido o gesto complejo. Es una opción de composición, no una dependencia de HeroUI v3.

### Cited Findings
- La instalación actual de Motion utiliza el paquete `motion` e imports desde `motion/react`. Requiere React 18.2 o superior. Soporta App Router y Pages Router; para App Router explica `"use client"` o `motion/react-client` para componentes declarativos importables desde contexto de servidor. [Instalación oficial](https://motion.dev/docs/react-installation).
- Su API de layout ofrece `layout` para cambios de tamaño/posición y `layoutId` para conectar el mismo elemento entre estados. Los cambios de layout se declaran mediante `style` o `className`. Sus transformaciones pueden distorsionar hijos, radios y sombras; la documentación propone corrección de escala, propiedades mediante `style` o `layout="position"` según el caso. [Layout](https://motion.dev/docs/react-layout-animations).
- `MotionConfig reducedMotion="user"` desactiva transformaciones y animaciones de layout según la preferencia del usuario, pero conserva valores como opacidad y color. `useReducedMotion` permite reemplazos personalizados. [Accesibilidad](https://motion.dev/docs/react-accessibility).
- MDN define `prefers-reduced-motion` como señal para reducir, quitar o reemplazar movimiento no esencial; escalar o desplazar elementos grandes puede generar molestias. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

### Inferences
- Los fragmentos de HeroUI y de la página de accesibilidad de Motion todavía muestran imports `framer-motion`, mientras la guía de instalación de Motion usa `motion/react`. Para código nuevo seguir una sola convención actual y su versión fijada, sin instalar ambos paquetes por copiar ejemplos.
- Mantener los hooks y la interacción dentro de componentes cliente pequeños. `motion/react-client` no convierte hooks como `useReducedMotion` en lógica de servidor.
- Si hay preferencia manual de movimiento, sincronizar su resolución con HeroUI y Motion; el atributo de HeroUI por sí solo no configura Motion.
- No instalar Motion+, herramientas Studio ni componentes premium para resolver estas interacciones básicas. Tampoco añadir otra biblioteca de animación equivalente.

### Gaps
- Compatibilidad documental no equivale a integración probada con las versiones finalmente elegidas de Next.js, React, Tailwind, HeroUI y Motion. Antes de extender componentes: instalar una combinación concreta, guardar lockfile y verificar compilación/hidratación con y sin movimiento reducido.
- No se han medido tamaño del paquete ni coste de renderizado. No prometo un tamaño fijo de JavaScript.

## ¿Cómo se traduce esto en la demo de Otear?

### Takeaway
El movimiento debe hacer visible qué seleccionó el productor, dónde se abrió la información y cuándo terminó una acción. El acabado puede venir de sombras, capas y texturas estáticas; no necesita mantener toda la pantalla en movimiento.

### Cited Findings
- Las transiciones de HeroUI pueden responder a estados de interacción y entrada/salida, con CSS propio; Motion permite continuidad de un elemento entre estados mediante `layoutId`. [HeroUI](https://heroui.com/en/docs/react/getting-started/animation), [Motion layout](https://motion.dev/docs/react-layout-animations).
- El movimiento reducido puede sustituir desplazamientos grandes por transiciones de opacidad y desactivar parallax; la guía de Motion recomienda adaptar esas experiencias. [Accesibilidad](https://motion.dev/docs/react-accessibility).

### Inferences
Propuesta de patrones; las duraciones son puntos de partida de diseño, no límites normativos:

| Situación | Comportamiento propuesto | Implementación mínima |
|---|---|---|
| Tarjeta de lote | Estado seleccionado claro; elevación leve al apuntar, foco visible equivalente al navegar con teclado. | HeroUI y CSS, sin movimiento continuo. |
| Galería de vuelo | Foto elegida conserva una posición reconocible al abrir el detalle; cierre vuelve al contexto anterior. | CSS para abrir panel; Motion `layoutId` solo si aporta continuidad y supera la prueba de imágenes y radios. |
| Cambio de lote o fecha | Mantener estructura y etiquetas; reemplazar contenido cuando está disponible. | Cambio de estado inmediato y fundido breve opcional, sin espera artificial. |
| Comparación antes/después | Separador sigue directamente la posición elegida, con fechas visibles y control por teclado. Las dos fotos permanecen espacialmente alineadas. | Slider accesible y recorte CSS. Evitar resortes, autoplay o fundidos entre fechas que puedan aparentar cambios en el cultivo. |
| Hallazgo → tarea | Al confirmar, aparece la tarea en su contexto y un mensaje persistente de éxito; sin confeti. | Estados de formulario y feedback HeroUI; CSS para una confirmación breve. |
| Carga de imágenes | Estado de carga solo durante trabajo real y dimensiones reservadas. En la demo, etiquetar información de ejemplo. | Skeleton/estado de carga real; nada de barras falsas para simular procesamiento. |
| Landing | Una entrada editorial corta del producto puede dirigir atención hacia la demo; contenido principal legible aun sin animación. | CSS primero; secuencia Motion solo para una escena aprobada que lo justifique. |

- Como punto de partida: respuesta de control ~120–180 ms, paneles ~180–260 ms y transición protagonista ~300–400 ms; acortar o retirar lo que retrase la tarea. No aplicar retrasos escalonados a todas las fotos o filas.
- Sombras: definir niveles para superficie, panel flotante y modal; una sombra más fuerte debe comunicar mayor elevación. Evitar sombras masivas detrás de cada bloque.
- Textura: mapa topográfico o grano estático sutil en zonas de marca, lejos de fotografías que constituyan evidencia y de texto pequeño. La textura no debe confundirse con un dato agronómico.
- Verificación mínima: navegación por teclado y restauración de foco, movimiento reducido del sistema y ajuste manual si existe, móvil táctil, reversión rápida de selección, imagen lenta y nueva selección antes de completar la anterior.

### Gaps
- Las duraciones, intensidad de sombras, textura y continuidad galería/detalle deben verse en una pantalla real antes de fijarlas como reglas. No hay aquí código de interfaz ni aprobación visual definitiva.
