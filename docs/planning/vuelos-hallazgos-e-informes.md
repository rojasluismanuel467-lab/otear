# Plan provisional: vuelo, medios, hallazgos, tareas e informes

Documento de planificación, no autorización para construir pantallas, rutas, servicios ni contratos API. Se apoya en [módulos propuestos](../context/modulos-propuestos.md), [Dorfman](../context/matriz-dorfman-provisional.md) y [guía UX](../UX_GUIDELINES.md). La navegación y el alcance de cada entrega quedan pendientes de indicación expresa del usuario.

**Alcance confirmado:** agro, carreteras, vigilancia y construcción. Base conceptual propuesta: proyecto/sitio (finca, obra, vía o instalación) y zona, con etiquetas sectoriales lote, tramo, frente o sector; nombres finales pendientes de integración. Las capacidades adicionales surgidas del feedback son hipótesis por validar, no requisitos aprobados automáticamente.

## Tareas y propósito

| Capacidad | Trabajo que debe permitir | Resultado útil |
| --- | --- | --- |
| Detalle del vuelo | Reconstruir objetivo, participantes, equipo, fecha y entregas; distinguir planeación de ejecución documentada | Entender qué se contrató, qué se recibió y qué falta sin consultar plataformas separadas |
| Medios | Encontrar fotos, video, ortomosaico, recorrido e informe del operador por vuelo/zona | Abrir la evidencia pertinente con su contexto y procedencia |
| Comparación | Consultar dos fechas de la misma zona y sus condiciones de captura | Formular observaciones sin confundir diferencias de cámara o encuadre con cambios del objeto observado |
| Hallazgos | Ubicar una observación, consultar su evidencia y registrar revisión humana | Saber qué merece verificarse, quién lo señaló y con qué fundamento |
| Tareas | Vincular una acción de campo a un hallazgo o vuelo y consultar su respuesta | Cerrar el ciclo entre evidencia y comprobación, conservando el vínculo original |
| Informes | Seleccionar evidencia, observaciones y respuestas para una síntesis revisable | Explicar lo ocurrido y los pendientes a un destinatario concreto |

Estas capacidades pueden convivir dentro del vuelo u otros contextos ya acordados. Esta lista no crea nuevas pestañas. La entrega del operador y la síntesis preparada en Otear son documentos distintos por procedencia, no dos módulos de informes.

Evidencia, hallazgo, tarea e informe son conceptos compartidos: sus tipos, campos pertinentes y plantillas pueden variar por sector. No convertir cultivo, plaga o hectárea en campos obligatorios de todos los proyectos ni inventar catálogos sectoriales completos.

## Ciclo del trabajo: hipótesis del feedback

- **Ambientación:** registrar contexto del sitio, necesidad, destinatario y objetivos acordados; distinguir antecedentes del material obtenido en el vuelo actual.
- **Prevuelo:** vincular alcance, zonas, entregables y responsables previstos al vuelo programado. Una regla de recurrencia puede originar instancias futuras; no demuestra vuelos ejecutados ni repite resultados históricos.
- **Vuelo:** documentar ejecución y evidencia disponible, diferenciando ruta planificada de trayectoria realmente registrada. No presupone telemetría en vivo ni seguimiento automático.
- **Posvuelo:** relacionar entregas del operador, observaciones, sugerencias y revisiones con cada objetivo; registrar lo incompleto sin declararlo satisfecho por tener un archivo.
- **Informe consolidado:** reunir resultados, fuentes, revisiones, límites y tareas pendientes; recoger lecciones y propuestas para el siguiente vuelo, sujetas a aceptación antes de alterar una nueva planificación.

## Cobertura Dorfman y vacíos

| IDs | Relación propuesta | Límite o vacío |
| --- | --- | --- |
| B1, G1–G2 | Contexto de proyecto/sitio y zonas, registro y consulta de vuelo/entregas | B1 conserva redacción agrícola original: la generalización multisector está confirmada, pero su trazabilidad debe actualizarse explícitamente |
| B3, N2–N3 | Tipos de archivo y exploración de medios/mapas | Demo con muestras ligeras; ingesta, archivos de GB y teselas quedan para implementación futura |
| G3–G4 | Objetivo y participantes desde programación; tareas y listas relacionadas | Programación define la planificación; el detalle documenta resultados sobre el mismo vuelo |
| G5 | Acciones de campo enlazadas a zona y evidencia | Una tarea de comprobación no acredita por sí sola una labor contratada ni su ejecución; G5 original no define todavía tipos para todos los sectores |
| E1–E2 | Conteos y evolución derivados de registros revisados | No inventar índices de vigor, áreas afectadas o superficies cubiertas a partir de muestras |
| E3 | Contexto de entrega y proveedor disponible para pagos/seguimiento | Comparación comercial y verificación de cobros requieren acuerdo transversal; G6 pendiente |
| E4, IA1 | Vista previa de informe y futura exportación/resumen asistido | PDF/Excel reales y redacción automática no están implementados; el usuario debe aprobar alcance y destinatario |
| IA2 | Comparación visual manual de dos fechas | No equivale a cálculo de índices ni alineación automática de ortomosaicos |
| IA3–IA4, IA6 | Consultar observaciones documentadas por operador/persona y sus verificaciones | IDs originales agrícolas: no cubren automáticamente inspección vial, estructural o vigilancia; detección propia y revisión especializada pendientes |
| IA5, IA7 | Contexto futuro de maquinaria, producción y nutrición | Fuera de esta propuesta inicial; no prometer inferencias ni implementar modelos |
| B2, N4 | Autoría y permisos conceptuales para evidencia e informes | Sin autenticación ni aislamiento real en demo; controles y datos personales se resolverán con backend |
| N1, N5–N6 | Comprensión, futura verificación de campo y consulta de documentos de vuelo | Offline/sincronización fuera de demo; requisitos legales necesitan revisión vigente antes de implementarlos |

## Propiedad de información y dependencias compartidas

- **Un vuelo único:** programación y detalle comparten identidad. Regla de recurrencia, instancia programada y ejecución documentada son conceptos distintos; también ruta planificada y trayectoria registrada. Un estado de ejemplo no declara ejecución real.
- **Un archivo compartido:** medios, facturas, documentos regulatorios e informes se referencian desde sus contextos. No duplicar el mismo archivo al asociarlo a vuelo, pago o documento; distinguir original, metadatos y derivados de presentación.
- **Un informe de Otear por identidad/revisión:** diferentes módulos pueden enlazarlo o aportar evidencia. Evitar generar copias independientes con resultados contradictorios. Preservar por separado el informe original del operador.
- **Hallazgo y tarea separados:** el primero registra observación y fundamento; la segunda registra acción, responsable y seguimiento. Varias acciones pueden referir un hallazgo sin copiarlo. Su taxonomía y cardinalidades finales requieren acuerdo antes de contratos técnicos.
- **Contexto común:** proyecto/sitio, zonas y etiquetas por sector, personas/operadores, equipo, fechas, unidades, archivos y trazabilidad se acuerdan con los responsables de programación, pagos y documentos antes de implementación.
- **Frontend común:** Next.js App Router, TypeScript estricto, Tailwind, HeroUI, tokens y patrones existentes. No incorporar otra biblioteca ni diseñar microservicios para planificar estas capacidades.

## Datos conceptuales consumidos y producidos

| Capacidad | Consume | Produce o relaciona |
| --- | --- | --- |
| Detalle/medios | Vuelo compartido; proyecto/zona; objetivo acordado; participantes; equipo; archivos; procedencia y fecha de entrega | Consulta contextual; marcas de revisión; observaciones sobre entregas faltantes, sin duplicar datos de programación |
| Comparación | Dos capturas; zona; fecha; sensor, altura y resolución disponibles | Selección de fechas y observación manual enlazada a ambas evidencias; advertencia si faltan condiciones comparables |
| Hallazgo/tarea | Evidencia; ubicación disponible; autor y rol; vínculo vuelo/zona; responsable y tipo sectorial | Observación con procedencia; propuesta de tarea; respuesta humana confirmado/descartado/no sé, fecha y evidencia; revisión profesional diferenciada cuando corresponda |
| Informe | Objetivos, datos del vuelo, archivos, observaciones, sugerencias, revisiones profesionales, decisiones y limitaciones | Borrador identificable y revisable con fuentes, pendientes y lecciones para otro vuelo; versiones/exportaciones conservan origen y momento |

Estos conceptos no son esquemas de base de datos, endpoints ni estados definitivos. Una coordenada de captura no demuestra la huella completa de una imagen ni asigna con certeza todo su contenido a una zona.

## Demo local frente a capacidades futuras

- **Cuando se autorice la demo:** usar datos sintéticos coherentes, muestras de medios y navegación local para recorrer vuelo → evidencia → observación → informe. Una tarea puede cambiar en memoria con indicación explícita de simulación y del alcance de conservación; no anunciar envíos, almacenamiento ni trabajo asignado a personas reales.
- **Informe inicial propuesto:** vista previa alimentada por las mismas muestras y observaciones seleccionadas. No simular que se envió o exportó un archivo si solo se muestra una vista; una exportación real será una decisión de entrega posterior.
- **Backend posterior en Go:** ingesta, almacenamiento durable, permisos, historial de cambios, procesamiento pesado, notificaciones y sincronización se especificarán al validar necesidades. C3–C10 siguen siendo responsabilidades lógicas, no despliegues obligatorios.
- **IA asistiva por evaluar:** localizar evidencia, resumir entregas con referencias y sugerir tareas como borradores. Separar observación del operador, sugerencia de IA, revisión profesional (ingeniero, agrónomo u otro perfil pertinente) y decisión humana; preservar autoría y desacuerdos, absteniéndose cuando falte evidencia. Que un profesional revise una conclusión es una hipótesis de flujo por validar, no una prestación garantizada.
- **Sin promesas de diagnóstico:** resumir no valida al operador; fotos o inferencias aisladas no acreditan diagnósticos agronómicos, estructurales o de seguridad. Evaluación profesional, detección y estimación propias requieren evidencia apropiada, alcance y validación antes de ofertarse.
- **Urgencias:** un pedido por incendio u otra situación urgente puede expresar prioridad solicitada; no demuestra detección automática, disponibilidad de respuesta ni despacho de emergencias. Su recepción, coordinación y tiempos de atención siguen por definir.

## Criterios de aceptación para futuras entregas autorizadas

1. Desde un vuelo se identifican proyecto/zona, objetivo, fecha, participantes, procedencia y entregas; programación conserva identidad, recurrencia separada de ejecución y ruta prevista distinta de trayectoria registrada.
2. Un hallazgo abre la evidencia correcta y una respuesta de campo conserva ese vínculo. Evidencia ausente o ubicación desconocida se expresa sin inventar precisión.
3. Comparar fechas mantiene etiquetas y contexto; ofrece alternativa al arrastre y no produce diagnósticos ni índices ficticios. Teclado, móvil y movimiento reducido permiten completar el recorrido cambiado.
4. El informe relaciona objetivos con evidencia, observación del operador, sugerencia IA, revisión profesional y decisión humana sin confundirlas; incluye pendientes y lecciones. Referencias al mismo archivo/informe desde otros módulos no crean copias divergentes.
5. «Datos de ejemplo» permanece reconocible; tareas, análisis y envíos simulados no parecen operaciones reales. No hay nuevas pantallas ni integraciones hasta indicación expresa.

## Decisiones pendientes

- Resolver explícitamente conservar sin asignación versus rechazar archivos sin GPS/fuera de lote; no convertir la política de la matriz en validación definitiva.
- Confirmar si G6 será propio y qué evidencia permite contrastar un cobro; ni cobertura ni fotografía prueban cantidad o calidad de producto aplicado.
- Acordar etiquetas y tipos/plantillas por sector, destinatarios, límites de edición/revisión, acceso a profesionales y primera comparación útil; no deducirlos de los campos agrícolas originales.
- Validar fases, consolidación por objetivos, recurrencia, tratamiento de urgencias y lecciones del feedback antes de convertirlos en requisitos o pantallas.
- Precisar formatos efectivamente disponibles y derechos de muestras. No elegir modelos IA, APIs, almacenamiento ni navegación final por anticipación.
