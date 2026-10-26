# Movimiento y acabado de Otear

Estado: criterios iniciales de proyecto. El usuario quiere animaciones atractivas, sombras, texturas y formas redondeadas; su intensidad se ajustará al ver cada pestaña. No es una aprobación de pantallas todavía no descritas.

## Base y propósito

- Base confirmada: Next.js App Router, TypeScript estricto, Tailwind y HeroUI. Frontend primero; backend Go después.
- HeroUI v3 documenta animaciones CSS incorporadas. Reutilizar sus estados y verificar la versión instalada; no copiar APIs de v2 ni duplicar efectos sobre el mismo control.
- Empezar con HeroUI y CSS. No añadir Motion por defecto. Evaluar `motion`/`motion/react` solo ante una secuencia o continuidad aprobada que CSS no resuelva adecuadamente; no instalar además `framer-motion` por copiar ejemplos antiguos.
- Antes de crear un patrón, describir propósito, estado inicial/final, variante reducida y comprobación. Ejemplo: «El detalle aparece junto a la foto elegida para conservar el contexto de lote».

## Landing expresiva y demo operable

- Proponer una única secuencia protagonista: fotografía aérea → lote → observación → informe. CTA y mensaje legibles desde el inicio; final estático comprensible; no repetir cada vez que la escena entra en pantalla.
- Mantener scroll nativo. No interceptar rueda/touch ni obligar a completar escenas para continuar. Mapas o comparadores no deben capturar el gesto vertical destinado a recorrer la página.
- En demo, movimiento para selección, orientación y confirmación. Lote y fechas permanecen reconocibles. No mover continuamente texto o fotos durante su revisión.
- Comparador: control directo, sin resorte ni autoplay. Fechas visibles y alternativa al arrastre; no inferir cambios agronómicos mediante efectos visuales.
- Acción inmediata y animación interrumpible: el estado solicitado más reciente gana. No encolar transiciones ni bloquear controles mientras termina un efecto.
- Carga solo durante trabajo real; reservar dimensiones de imágenes. Mostrar «Datos de ejemplo». No simular procesamiento con retrasos, porcentajes o éxito de envío inexistentes.

## Tokens iniciales de movimiento

Valores propuestos para comenzar, no estándares externos. Mantener pocos patrones compartidos y ajustar solo al observar un motivo concreto. No reemplazar automáticamente los buenos defaults de HeroUI.

| Patrón | Duración inicial | Uso |
| --- | --- | --- |
| Feedback de control | 120–180 ms | Presión, selección, respuesta localizada |
| Cambio de estado | 180–260 ms | Pestaña o contenido contextual |
| Overlay | 300–450 ms | Entrada/salida de un panel o diálogo |
| Escena protagonista | 500–700 ms | Composición especial de landing, una vez |

Los tiempos no son demoras previas. Si dificultan actuar o leer, acortar o retirar. En comparadores, seguir la posición del usuario directamente. Evitar stagger aplicado a todas las fotos o filas.

## Sombras, radios, texturas y rendimiento

- Definir niveles de elevación por función: superficie base, panel flotante y diálogo. Una sombra más fuerte comunica más altura; evitar efectos diferentes por capricho en cada tarjeta.
- Radios y sombras salen de tokens compartidos. Mantener borde/foco cuando hagan falta; elevación y color no son la única señal de estado.
- Fotografías como fuente principal de riqueza visual. Textura decorativa estática y ligera solo en marca; nunca alterar fotos de evidencia ni colocar ruido detrás de texto pequeño o datos del mapa.
- Limitar blur y transparencia a superficies acotadas con contraste comprobado. No superponer efectos costosos sobre toda la página.
- Priorizar `transform` y `opacity`. Evitar animar grandes sombras, blur, tamaño o posición que obliguen a repintar/layout sin necesidad. Usar `will-change` únicamente ante un problema observado y retirarlo cuando deje de ser necesario.
- Reservar espacio para medios y cargar recursos apropiados a la vista. Medir la escena problemática antes de agregar capas o herramientas nuevas.

## Movimiento reducido y accesibilidad

- Objetivo general: WCAG 2.2 AA. El proyecto exige además respetar `prefers-reduced-motion`; el criterio WCAG 2.3.3 relacionado es AAA, no AA.
- Variante reducida: estado final directo, sin paralaje, zoom, paneo automático, loops ni grandes recorridos espaciales. Un fundido breve opcional conserva toda la información y la respuesta inmediata.
- No forzar `data-reduce-motion="false"` en HeroUI. Omitirlo deja decidir al sistema; `true` puede expresar una opción propia de reducción. Cubrir CSS propio explícitamente.
- Si se incorpora Motion, configurar su reducción por separado y adaptar los patrones; el atributo de HeroUI no controla Motion. La configuración de Motion puede conservar opacidad/color: revisar el resultado completo.
- Conservar teclado y foco visible. No mover foco por hover ni decoración; en diálogos respetar manejo de foco y devolución al disparador.
- Si se añade contenido automático continuo, aplicar pausa/detención cuando corresponda; mantener la pausa tras cambiar de foco. La primera escena finita evita reproducción decorativa prolongada.

## Verificación por entrega

Recorrer la pestaña o tarea modificada con puntero/touch y teclado; revisar foco, móvil, movimiento reducido y una interrupción rápida durante la transición. Comprobar carga lenta si cambian imágenes o selección asíncrona. Revisar rendimiento con DevTools si hay tirones o un efecto costoso nuevo. Repetir tras corregir un fallo o cambiar el patrón; no ejecutar auditorías completas por cada ajuste cosmético. Estos controles no certifican conformidad ni sustituyen pruebas con productores.

## Fuentes de consulta

- [HeroUI: animación](https://heroui.com/en/docs/react/getting-started/animation), [release v3](https://heroui.com/en/docs/react/releases/v3-0-0).
- [Motion: instalación](https://motion.dev/docs/react-installation) y [accesibilidad](https://motion.dev/docs/react-accessibility), solo si se evalúa esa dependencia.
- [W3C: 2.3.3 AAA](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [2.2.2 A](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), [WCAG 2.2 referencia](https://www.w3.org/WAI/WCAG22/quickref/).
- [web.dev: rendimiento CSS](https://web.dev/articles/animations-guide) y [movimiento reducido](https://web.dev/articles/prefers-reduced-motion).
- [Informe y libros consultados](../reports/Movimiento%20y%20acabado%20para%20Otear.md). Se revisaron extractos/índices públicos, no libros completos.
