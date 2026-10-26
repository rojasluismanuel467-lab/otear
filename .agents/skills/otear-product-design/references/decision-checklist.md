# Criterios específicos para Otear

Consultar solo el apartado que afecte a la tarea. Las recomendaciones de composición son decisiones del proyecto, no reglas universales ni resultados ya validados con usuarios.

## Ergonomía del movimiento

La distancia y el tamaño del objetivo afectan su adquisición con el puntero. Agrupar acciones relacionadas cerca de la evidencia o selección; evitar viajes repetidos entre extremos de la pantalla. Mantener acciones frecuentes en posiciones previsibles. Reservar las acciones destructivas para un lugar distinto de las frecuentes, con recuperación proporcional a su consecuencia. [NN/g: ley de Fitts](https://www.nngroup.com/articles/fitts-law/).

Como punto de partida de Otear, buscar áreas de pulsación de aproximadamente 44 × 44 píxeles CSS en controles táctiles importantes; el icono visible puede ser menor. Es un objetivo de comodidad del proyecto, no el mínimo universal de WCAG. El criterio 2.5.8 AA establece 24 × 24 píxeles CSS con excepciones específicas, incluido espaciado. Una interfaz densa no se evalúa solo midiendo cada icono. [W3C: Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

En mapas con puntos próximos, usar selección/listado equivalentes, agrupación cuando corresponda y acceso a detalle sin arrastre obligatorio; conservar la ubicación real. En móvil, mantener accesibles las acciones frecuentes sin ocultar evidencia bajo barras fijas. No mover un control al acercarse el puntero ni reorganizar una lista mientras se está seleccionando. La animación no mueve el foco por decoración.

## Iconografía

- Elegir una familia existente o acordar una cuando aparezca el primer uso; mantener trazo, escala y significado. No instalar una colección por cada módulo ni dibujar equivalentes de controles ya disponibles.
- Etiquetar acciones como «Programar vuelo», «Ver evidencia» o «Revisar documento». Un símbolo de dron, escudo o destello no explica por sí solo programar, autorizar o analizar.
- En botones de solo icono, usar nombre accesible de la acción; ocultar del árbol accesible el SVG decorativo si el botón ya tiene nombre. Proporcionar explicación visible cuando el contexto no sea suficiente. Tooltip accesible cuando aporte, sin depender de hover.
- No comunicar revisión, riesgo o validez solo con color o un check. El icono de IA distingue procedencia, no certifica exactitud.

Los iconos dependen de convenciones aprendidas y contexto; comprobar comprensión de los ambiguos en una tarea concreta. [NN/g: Icon Usability](https://www.nngroup.com/articles/icon-usability/).

## Imágenes, mapas y 3D

- **Evidencia:** conservar original/procedencia; mostrar fecha, zona y captura conocida. Recortes y versiones optimizadas deben poder distinguirse del original. No añadir textura, embellecimiento generativo ni filtros que alteren una observación técnica. No inventar precisión geográfica.
- **Explicación/marketing:** imágenes relevantes para el sector, con licencia o autorización de uso. Señalar visualizaciones sintéticas cuando puedan confundirse con evidencia o resultados de cliente. Evitar fotografías agrícolas como representación automática de todos los sectores.
- **Decoración:** grano o textura discretos fuera de medios de evidencia y texto pequeño. Imagen decorativa con `alt` vacío; imagen informativa con alternativa útil; una imagen funcional describe la acción o destino, no solo su aspecto. [W3C: árbol de decisión de texto alternativo](https://www.w3.org/WAI/tutorials/images/decision-tree/).
- Reservar espacio y proporción para evitar saltos de controles; servir tamaño apropiado y carga diferida de contenido secundario. No cargar varias versiones pesadas o modelos 3D invisibles por defecto.
- El 3D del dron sigue siendo una capacidad propuesta. Si se autoriza, definir qué permite comprender/seleccionar, disponer de imagen/ficha equivalente y evitar rotación permanente. No bloquear la tarea al fallar el recurso.

## Valor de negocio y alcance

Relacionar cada entrega con una pregunta: ¿la persona encuentra la evidencia?, ¿comprende el valor?, ¿solicita un piloto?, ¿acepta probar con sus archivos o pagar bajo condiciones claras? No exigir todas las señales en cada tarea ni confundir tiempo en página con demanda.

Elegir una señal principal por experimento, población destinataria y denominador; separar tráfico cualificado, recorrido completado y solicitud enviada. Un clic no demuestra contratación. Los umbrales se acuerdan con el experimento; no inventar significancia con muestras pequeñas. La instrumentación de terceros requiere una decisión propia, no se añade por aplicar esta skill.

Separar suscripción a Otear, acuerdo de vuelos con operador y registro de costos. No presentar una solicitud como vuelo confirmado, un pronóstico como garantía de operación, un archivo como autorización, ni una sugerencia de IA como diagnóstico profesional. Preservar los pendientes GPS/G6 del contexto sin convertirlos en validaciones definitivas.

Preferir una entrega que complete un trabajo útil sobre una colección extensa de pantallas. Ante dos opciones comparables, elegir la que reutilice la base, simplifique el recorrido y permita comprobar una hipótesis con menor dependencia operativa. El backend Go, la ingesta pesada y las integraciones se decidirán después de validar sus necesidades.

## Lecturas ya investigadas

[Refactoring UI](https://refactoringui.com/) para jerarquía y profundidad; [Don't Make Me Think](https://sensible.com/dont-make-me-think/) para comprensión; [Designing Interface Animation](https://rosenfeldmedia.com/books/designing-interface-animation/) y el [extracto de Animation at Work](https://alistapart.com/article/patterns-and-purpose/) para movimiento. Los informes del proyecto documentan qué índices y extractos se consultaron; no se presume lectura íntegra ni se copian libros al contexto de los agentes.
