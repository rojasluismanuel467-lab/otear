# Plan de trabajo por módulos

Estado: propuesta de ejecución. El usuario autoriza planificación paralela, pero mantiene la instrucción de no crear pantallas hasta que lo indique. No se han creado rutas, modelos de dominio ni componentes de módulo.

## Qué nos dice la matriz

Los componentes C1–C10 son responsabilidades lógicas, no diez pestañas ni diez servicios. C2 es el portal; C3–C10 aportan capacidades a varios módulos. C1/offline y el backend Go quedan para otra etapa. Usar la matriz para rastrear necesidades y dependencias, no para generar código para cada casilla.

La ampliación multisector está confirmada. El feedback de servicios aporta hipótesis de recurrencia, urgencias, meteorología y revisión profesional, sin convertir automáticamente Otear en prestador de vuelos.

## Secuencia recomendada

1. **Ahora: acordar límites y escenario.** Unificar nombres, responsabilidades y referencias entre módulos; registrar pendientes. Es el único trabajo paralelo autorizado actualmente.
2. **Con la primera pantalla indicada: un recorrido completo y pequeño.** Recomendar programación de un vuelo para un sitio existente, con objetivo, zonas, responsable y fecha. Usar un segundo vuelo histórico del mismo sitio para demostrar evidencia e informe, sin presentar como ejecutado el vuelo recién planificado.
3. **Extender el recorrido hacia el detalle.** Fotos/documentos → hallazgo → tarea → informe. Observar si la persona encuentra la evidencia y entiende qué acción tomar.
4. **Añadir documentos y pagos con las mismas referencias.** Documentos se consultan también desde el vuelo; pagos se vinculan a vuelo, labor o acuerdo según el caso, sin duplicar registros.
5. **Validar comprensión e interés.** Usar tareas concretas y solicitudes de piloto. Priorizar nuevas funcionalidades con evidencia; IA real, 3D, clima en vivo y automatizaciones requieren decisiones propias antes de integrarlas.

La landing sigue dentro del producto previsto. Su orden frente a la primera pestaña lo indicará el usuario; no implementarla en paralelo por iniciativa de otro agente.

## Propiedad de la información

| Concepto | Fuente de verdad conceptual | Quién lo consume |
| --- | --- | --- |
| Empresa, sitio y zona | Contexto compartido del escenario | Todos los módulos |
| Vuelo y sus referencias | Un registro de vuelo, con plan y ejecución diferenciados | Programación, detalle, documentos y pagos |
| Serie/acuerdo de seguimiento | Programación; compromisos comerciales enlazados, alcance por validar | Vuelos y pagos |
| Persona, operador y dron | Identidades reutilizadas | Programación, detalle y documentos |
| Archivo | Referencia única al recurso y su origen | Evidencias, facturas, documentos e informes |
| Hallazgo y tarea | Revisión del vuelo | Seguimiento e informes |
| Informe | Conservar el original del operador y distinguir la síntesis versionada de Otear | Detalle y exportación enlazan cada documento por procedencia; no una copia por pestaña |
| Obligación, factura y pago | Pagos/costos como conceptos separados | Seguimiento de costos e informes |
| Requisito documental y estado de revisión | Gestión documental | Preparación del vuelo y consulta |

Esta tabla no es un esquema de base de datos ni un contrato HTTP. En la demo se implementarán solo los datos que necesite el recorrido autorizado.

## Núcleo multisector

Usar empresa → sitio → zona como vocabulario inicial de código. Las etiquetas visibles dependen del sector: finca/lote, vía/tramo, obra/frente o instalación/sector. Cultivo, variedad y edad pertenecen al perfil agrícola. No forzar campos agrícolas a construcción o vigilancia, ni generar sistemas completos de configuración antes de necesitarlos.

Separar el lugar de trabajo, la ruta planificada y la trayectoria registrada. La documentación de permisos se referencia por operación/responsable; no deducir autorizaciones desde un polígono dibujado. La geometría necesaria para un tramo puede diferir de la de un lote.

## Reparto entre agentes

En esta ronda cada agente solo edita su documento:

| Responsable | Entrega actual exclusiva | Responsabilidad futura propuesta |
| --- | --- | --- |
| Agente de planificación/documentos | `docs/planning/programacion-y-documentos.md` | `src/features/flights/planning/**` y `src/features/compliance/**` |
| Agente de revisión | `docs/planning/vuelos-hallazgos-e-informes.md` | `src/features/flights/review/**` |
| Agente de pagos | `docs/planning/pagos-y-costos.md` | `src/features/billing/**` |
| Integrador | Este plan, contexto y referencias | Rutas/layout, estilos/tokens, tipos y datos compartidos, dependencias y lockfile |

Las carpetas futuras no se crean aún. Cada encargo de implementación debe fijar tarea, archivos permitidos, entradas/salidas y criterio de aceptación. Tener permisos sobre un módulo no autoriza construir todas sus funciones.

## Cómo evitar sobrescritura y duplicación

- Antes de una ronda de código, conservar un checkpoint Git del estado acordado y comprobar cambios ajenos. No restaurar o descartar trabajo de otro agente.
- El integrador define los datos compartidos mínimos antes de que módulos dependientes los consuman. Los agentes no crean sus propias versiones de vuelo, operador, archivo o lote.
- Reutilizar HeroUI. Componentes específicos permanecen en su funcionalidad; elevar a compartidos cuando haya consumidores reales.
- Un archivo compartido tiene un único editor por ronda. El agente que necesite cambiarlo envía una propuesta; el integrador la aplica y comunica el resultado.
- Dividir trabajo por funcionalidades independientes. No asignar dos agentes a la misma pantalla, ni usar ramas como garantía de aislamiento cuando comparten directorio físico.
- Sin instalaciones, cambios de estilos globales, nuevas rutas ni compras desde encargos de módulo sin coordinar con el integrador.
- Integrar un incremento, ejecutar las comprobaciones apropiadas y revisar una vez el recorrido. Ampliar pruebas solo ante cambios, fallos o riesgos nuevos.

## Pendientes y límites

- Resolver antes de ingesta real la política GPS contradictoria. No mostrar una regla definitiva en la demo.
- G6/verificación de cobros sigue por confirmar. La nueva descripción de pagos no lo elimina ni lo confirma.
- Acordar si Otear solo coordina proveedores o también comercializa vuelos. Hasta entonces rige el modelo de plataforma.
- Recurrencia, urgencias, meteorología, contratos y asesoría profesional son necesidades por validar, no servicios disponibles.
- No implementar backend, normativa automatizada, contabilidad completa, emergencia operativa ni entrenamiento de IA en esta etapa.

## Planes de los módulos

- [Programación y documentos](programacion-y-documentos.md).
- [Detalle, hallazgos e informes](vuelos-hallazgos-e-informes.md).
- [Pagos y costos](pagos-y-costos.md).
