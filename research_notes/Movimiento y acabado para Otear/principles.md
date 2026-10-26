# Movimiento y acabado para Otear

## ¿Qué principios verificables deben guiar el movimiento?

### Takeaway

La expresividad puede concentrarse en explicar el producto y orientar acciones. El control del usuario, la lectura y la respuesta inmediata condicionan qué movimiento conviene aplicar. Stack confirmado por el usuario: Next.js, TypeScript, Tailwind y HeroUI; Go queda para el backend futuro. Esta nota no agrega dependencias ni prescribe construir ese backend ahora.

### Cited Findings

- **Movimiento provocado por interacción:** WCAG 2.3.3 es nivel AAA. Permite desactivar animación no esencial y menciona el paralaje como posible disparador de molestias vestibulares. Respetar reducción de movimiento es una técnica reconocida. Adoptarla en Otear es una decisión de producto aunque la meta general sea AA. [W3C: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- **Movimiento automático:** WCAG 2.2.2 es nivel A. Contenido móvil automático que dura más de cinco segundos y aparece junto a otro contenido necesita pausa, detención u ocultación, salvo que sea esencial. La actualización automática tiene condiciones propias y no comparte esa excepción de cinco segundos. Pausar solo mientras el elemento conserva el foco no basta. [W3C: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- **Preferencia del sistema:** `prefers-reduced-motion` permite ofrecer una variante que minimiza movimiento. Se puede consultar desde CSS y JavaScript; la preferencia afecta también efectos decorativos y reproducción automática. [web.dev: prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)
- **Costo de renderizado:** favorecer `transform` y `opacity`; revisar propiedades que provoquen layout o pintura. Usar `will-change` ante un problema observado, en vez de aplicarlo a todas las superficies. Las herramientas del navegador permiten inspeccionar animaciones lentas. [web.dev: High-performance CSS animations](https://web.dev/articles/animations-guide)
- **Interacción accesible:** WCAG incluye teclado, foco visible, foco no oculto y alternativas al arrastre; el efecto visual no reemplaza esos requisitos. [W3C: referencia rápida WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/), consultada en la investigación UX previa.

### Inferences

- Animación útil responde al menos a una pregunta: ¿qué cambió?, ¿de dónde salió este panel?, ¿dónde quedó mi hallazgo?, ¿se recibió mi acción? La ambientación puede aportar identidad sin cargar con esa función informativa.
- Una animación puede funcionar con fluidez y aun distraer o dificultar la lectura: rendimiento y comodidad necesitan verificaciones distintas.
- HeroUI es la base de controles acordada. Reutilizar sus estados y accesibilidad antes de agregar otra implementación de botones, modales o pestañas. Esta es una decisión de proyecto, no una garantía automática sobre cada integración.

### Gaps

- [Apple HIG Motion](https://developer.apple.com/design/human-interface-guidelines/motion) devolvió una página que requiere JavaScript. El enlace oficial [Markdown](https://developer.apple.com/design/human-interface-guidelines/motion.md) produjo tipo de contenido no soportado. No se atribuyen reglas ni duraciones a Apple sin lectura verificable.
- [Material Design 3 Motion](https://m3.material.io/styles/motion/overview/how-it-works) también devolvió una página que requiere JavaScript. Se conserva como referencia pendiente, sin trasladar presuntas reglas del sistema.
- No existe aquí una medición de dispositivos, coste de sombras/texturas ni comportamiento del prototipo construido. La implementación debe comprobarse después, con alcance acotado.

## ¿Qué proponer para la landing y qué para la demo operativa?

### Takeaway

La landing puede contar una historia visual con mayor amplitud. En la demo, la expresividad debe preservar el lugar del usuario, las fechas y la capacidad de actuar. Las propuestas siguientes son decisiones iniciales de Otear, no estándares publicados.

### Cited Findings

- La relación entre interacción intencional y movimiento importa: aparición al hacer scroll o hover puede considerarse inicio automático para 2.2.2, según el caso. No asumir que toda animación activada por scroll queda exenta. [W3C: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- El scroll esencial controlado por el usuario es diferente del movimiento adicional de elementos que lo acompaña. [W3C: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

### Inferences

| Zona | Propuesta expresiva | Condición de uso |
| --- | --- | --- |
| Hero de landing | Composición de foto aérea, lote trazado y panel de hallazgo; secuencia de entrada finita, con relieve y textura estática discreta | Beneficio y CTA disponibles de inmediato; la composición final se entiende sin reproducir la secuencia |
| Explicación del flujo | Un vuelo pasa de fotos dispersas a lote, observación e informe; activación por el usuario o entrada breve de una sola vez | Mantener scroll nativo. No interceptar rueda/touch ni exigir completar una escena para seguir bajando |
| Vista previa de demo | Cambiar entre dos fechas con transición que conserva el encuadre | Fechas rotuladas, sin insinuar crecimiento detectado automáticamente ni mover las fotos mientras se inspeccionan |
| Pestañas y paneles | Transición corta entre estados y apertura espacial del detalle | El estado seleccionado cambia enseguida, el teclado funciona durante la transición y no hay rebote que altere la lectura |
| Hallazgo → tarea | Respuesta visual localizada y confirmación textual | No obligar a seguir un objeto que vuela por la pantalla para saber si se guardó |
| Carga | Contenedor de tamaño reservado, placeholder del contenido esperado y estado textual | La demo identifica sus datos simulados. No inventar porcentajes de análisis ni retrasos para aparentar procesamiento real |
| Acabado | Sombras suaves por nivel de elevación, bordes redondeados, fotografía de campo y textura de baja intensidad | Evitar textura detrás de texto pequeño, opacidad que borre controles y sombras animadas en grandes superficies sin medición |

**Valores iniciales de proyecto, sujetos a prueba; no son recomendaciones normativas de Apple, Material ni WCAG:** feedback de control 120–180 ms; panel/pestaña 180–260 ms; entrada narrativa de landing 350–550 ms, sin mantener el CTA esperando. Desplazamientos de interfaz cortos, aproximadamente 4–12 px como inicio; no aplicar estos valores mecánicamente a mapas o cambios de página.

Antes de crear una animación nueva, describir en una frase su propósito y su variante reducida. Mantener pocos patrones reutilizables; combinar sombras, texturas y movimiento sobre los componentes acordados en vez de agregar bibliotecas por cada efecto.

### Gaps

- La cantidad de movimiento, los tiempos y la textura necesitan verse junto a imágenes reales o representativas de Otear. No están aprobados como tokens finales.
- El aspecto Apple solicitado es una preferencia visual del usuario. No significa replicar Liquid Glass ni adoptar controles nativos que pierdan legibilidad en web.

## ¿Cómo preservar control y verificar sin hacer una auditoría interminable?

### Takeaway

Cada patrón debe poder interrumpirse, tener una versión reducida y mantener los controles operables. Verificar la pestaña o recorrido que se acaba de modificar; ampliar solo si aparece una regresión relevante.

### Cited Findings

- Reducir movimiento puede incluir desactivar efectos decorativos y reproducción automática, conservando el contenido. [web.dev: prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)
- Inspeccionar layout y pintura ayuda a localizar el coste real de una animación antes de promover capas o cambiar de técnica. [web.dev: High-performance CSS animations](https://web.dev/articles/animations-guide)

### Inferences

1. **Movimiento reducido:** retirar paralaje, zoom, paneo automático, loops y recorridos espaciales. Mostrar directamente el estado final; si se conserva un fundido mínimo, comprobar que no oculta respuesta ni información.
2. **Control persistente:** si hay una escena continua o video, ofrecer pausa/reanudar con nombre accesible; debe seguir pausado cuando el usuario mueve el foco. La opción preferida para el primer hero es una secuencia finita seguida de imagen estática.
3. **Interrupción:** seleccionar otra pestaña, cerrar un panel o repetir una acción lleva al estado solicitado más reciente. No encolar transiciones que obliguen a esperar ni bloquear interacción hasta terminar la animación.
4. **Foco y teclado:** no mover el foco por hover, por una escena decorativa o al completar una entrada. En diálogos, preservar el manejo de foco de HeroUI, permitir cierre apropiado y devolver foco al disparador. No crear trampas de teclado fuera de un diálogo modal activo.
5. **Scroll:** mantener desplazamiento nativo y salida natural de la demo embebida. Un mapa o comparador no debe secuestrar la rueda o el gesto vertical cuando la intención es seguir recorriendo la página.
6. **Lectura:** evitar que textos, fechas o controles floten continuamente; no mostrar información indispensable solo durante un instante, en hover o dentro de una animación.
7. **Presupuesto práctico:** usar textura estática ligera, imágenes dimensionadas y espacios reservados. Animar transformaciones de un grupo pequeño; no presumir que un filtro, blur o sombra es gratuito por usar GPU.
8. **Comprobación por entrega:** revisar una vez el recorrido modificado con ratón/touch, teclado y reducción de movimiento; probar una interrupción a mitad de transición y una pantalla móvil. Medir en DevTools solo la escena con coste o tirones observados. Repetir si se corrige un problema o cambia el patrón.

### Gaps

- Estas comprobaciones parciales no certifican conformidad WCAG ni validan demanda comercial. Las pruebas de comprensión con productores siguen siendo necesarias.
- No se recomienda ahora una dependencia adicional de animación: decidir solo después de conocer qué ofrece la versión de HeroUI instalada y qué patrón concreto queda sin resolver.
