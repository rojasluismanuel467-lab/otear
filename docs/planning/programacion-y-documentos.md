# Programación, historial y documentos — plan provisional

Estado: planificación del 25 de octubre de 2026, basada en README y contexto del usuario. No autoriza pantallas, código ni integraciones. Next.js + HeroUI para la demo; backend en Go posteriormente. No se han verificado requisitos aeronáuticos concretos.

El núcleo **multisector** está confirmado: agro, carreteras, vigilancia y construcción. Se propone una referencia compartida a sitio/proyecto y zona configurable (lote, tramo, frente o sector), con nombres finales pendientes de integración central; no son módulos duplicados por industria. Los demás puntos del feedback externo son hipótesis de producto que deben validarse.

## Objetivo y tareas

Ayudar a organizar un vuelo, localizar su contexto después y encontrar documentos asociados sin repetir personas, equipos ni archivos.

- Programar sector, sitio/proyecto, zonas, objetivo, fecha y responsable; vincular operador, piloto, encargado y dron existentes. En carretera, seleccionar tramos y orden previsto sin convertir cada tramo en otro módulo.
- Registrar una ruta **planificada**; consultar por separado una trayectoria **registrada**, cuando la entrega exista.
- Preparar y consultar listas antes/durante/después; distinguir responsable, pendiente y completado.
- Encontrar vuelos previstos y pasados por sector, sitio/proyecto, zona, fecha, responsable u operador; abrir el mismo vuelo desde programación e historial.
- Consultar documentos por empresa, piloto, dron o vuelo, con vigencias declaradas y revisión identificable.

Hipótesis por validar: recurrencia diaria/interdiaria y paquetes o contratos de mediano plazo con compromisos del operador (frecuencia, periodo, zonas, entregables y responsable). Otear registraría esos acuerdos; no se asume que presta los vuelos. Cada ocurrencia tendrá identidad y resultado propios: un calendario repetido no demuestra vuelos realizados.

Las solicitudes urgentes por quemas/incendios registrarían ubicación, motivo, solicitante, prioridad y estado. Solicitud recibida, evaluación y despacho confirmado son situaciones distintas; no prometen atención, respuesta inmediata ni funciones de servicio de emergencia.

Fases propuestas para ordenar responsabilidades: ambientación/acuerdo → pre-vuelo → ejecución → post-vuelo → consolidado del informe. Son agrupaciones del recorrido, no nuevas pestañas ni una máquina de estados aprobada. Cada fase necesita responsable, entradas y resultado; el consolidado consume entregas existentes.

Los estados y transiciones de vuelo siguen pendientes de acordar: programar, cancelar o marcar realizado no debe confundirse con tener evidencia entregada, checklist completado o autorización verificada.

## Cobertura de Dorfman y límites

| ID | Cobertura propuesta | Pendiente o fuera de este módulo |
|---|---|---|
| G1 | Contexto único de vuelo: operador, piloto, dron, sensor, fecha y zonas; referencias documentales. | Requisitos específicos y responsable de tramitar permisos pendientes; un archivo cargado no acredita autorización. |
| G2 | Historial e identificación de entregas disponibles; enlace al detalle. | Galería, reproducción, ortomosaico, evidencia y recorrido ejecutado pertenecen al detalle y archivos/mapa comunes. |
| G3 | Objetivo, fecha, responsable, zonas e itinerario previsto, incluidos tramos de carretera. | Recurrencia, urgencias y compromisos contractuales son ampliaciones hipotéticas, no capacidades ya confirmadas por G3. |
| G4 | Listas de comprobación y asignaciones; recordatorios de ejemplo. | Envío real, horarios, destinatarios y contenido de listas por confirmar. |
| B1–B2 | Consumir sitios/proyectos, zonas y personas/roles compartidos. | La matriz original habla de fincas/lotes; generalizar el núcleo no valida reglas sectoriales ni duplica registros. |
| B3, N2–N3 | Referenciar archivos y geometrías. | Ingesta pesada, GPS, teselas y almacenamiento; no resuelve la política contradictoria de archivos sin GPS. |
| N4, N6 | Proponer separación por empresa y metadatos documentales trazables. | Permisos aplicados, auditoría y datos regulatorios exactos requieren backend y revisión de fuentes vigentes. |
| N5 | Tareas simples, contexto visible y lenguaje del usuario. | Validar comprensión con usuarios representativos. |

G5 y E1–E4 consumen contexto del vuelo desde sus propios módulos. N1 (offline) no se promete con esta demo web. G6 sigue sin confirmar. La gestión documental es una necesidad ampliada del usuario, no una nueva obligación legal deducida de la matriz.

## Demo local frente a operación real

**Cuando se autorice implementar:** usar datos sintéticos rotulados; permitir preparar un plan, seleccionar recursos existentes, marcar listas, filtrar historial y consultar fichas/documentos de muestra. Los cambios de sesión serán temporales y reiniciables, con su duración explicada; no prometer guardado permanente.

La ruta prevista y el recorrido de muestra deben conservar etiquetas distintas. Se podrían mostrar una serie recurrente y una solicitud urgente de ejemplo sin fingir vuelos ejecutados, despacho real ni un acuerdo firmado. El mapa muestra territorio/trayectoria; no acredita autorización ni ausencia de limitaciones.

Requiere backend o servicios posteriores: persistencia compartida, permisos por empresa, concurrencia, archivos privados/versionados, revisión y auditoría confiables, recordatorios enviados, ingesta, pronósticos y consultas oficiales. No decidir proveedores ni diseñar rutas API ahora.

**Clima y 3D son mejoras condicionadas:** distinguir clima actual de pronóstico para la fecha prevista, identificando ubicación, origen, hora de actualización y horizonte disponible/incierto; fuera del horizonte mostrar ausencia de dato, sin pronóstico inventado ni conclusión de seguridad operacional. Un modelo 3D depende de utilidad comprobada, licencia, peso y alternativa accesible; una ficha o imagen del dron basta para continuar.

## Datos mínimos y propiedad

| Capacidad propietaria | Consume | Produce o conserva |
|---|---|---|
| Programación e historial | IDs de empresa, sector, sitio/proyecto, zonas configurables, personas, operador, dron/sensor; geometría común. | ID de vuelo/ocurrencia, objetivo, fecha/hora/zona horaria, roles, ruta prevista, fase propuesta y listas con autor/fecha; referencias opcionales a serie recurrente, compromiso del operador y solicitud urgente. |
| Personas y equipos comunes | Empresa, permisos y datos aportados. | Identidades únicas; características de dron/sensor y relaciones vigentes. Programación referencia esos IDs. |
| Archivos comunes | Archivo aportado y contexto de acceso. | ID de archivo/versión, nombre, tipo, procedencia y ubicación de almacenamiento futura. |
| Documentos | IDs de archivo/versión y del sujeto. | Tipo documental declarado, vínculos con empresa/piloto/dron/vuelo, emisor y vigencias declarados, responsable del trámite, revisión, revisor/fecha y observaciones; limitaciones declaradas cuando correspondan. |

Una persona puede ocupar varios roles sin duplicarse. Cada ocurrencia planificada y su ejecución vinculada conservan el mismo ID; una serie tiene ID distinto de cada vuelo y una cancelación no cuenta como ejecución. Cambiar recursos registra el cambio. El historial conserva contexto mediante referencias versionadas o registro de cambios, sin clonar entidades completas.

Un documento puede relacionarse con varios sujetos mediante vínculos; su archivo y versiones se guardan una sola vez. Cambiar una versión no debe borrar la referencia que explique qué se revisó para un vuelo pasado. “No aportado”, “sin fecha declarada” y “revisión pendiente” son distintos; vencimiento declarado y revisión no equivalen a validez legal.

## Límites entre módulos y dependencias

- **Programación** posee objetivo, recursos, fechas, ruta prevista, listas y, si se validan, recurrencias y solicitudes urgentes; **detalle** posee entregas, evidencia/hallazgos y trayectoria registrada. Ambos leen el mismo vuelo; el agrupamiento por fases no transfiere propiedad.
- **Informes** combina contexto y evidencia; no crea otro catálogo de vuelos ni modifica silenciosamente el plan.
- **Pagos** posee facturas, importes y registros de pago asociados al ID de vuelo y, si procede, al compromiso compartido del operador. Programación consulta alcance/fechas/entregables del acuerdo, sin duplicar términos económicos. Una factura usa el archivo común; no se clasifica automáticamente como documento aeronáutico.
- **Documentos** posee clasificación, vigencias declaradas y revisión; muestra acceso contextual desde vuelo/piloto/dron/empresa. Su inventario no determina por sí solo si una operación puede realizarse.
- **Mapa común** conserva ubicación y geometría; plan y ejecución son capas con procedencia distinta. Territorio dibujado y trayectoria no determinan autorización ni restricciones. Personas/equipos, archivos, acuerdos, permisos y trazabilidad requieren un responsable compartido antes de implementarlos; este plan no los modifica.

## Criterios de aceptación observables para la futura demo

1. Se puede preparar y reabrir un plan de ejemplo conservando sector, sitio/proyecto, zona, objetivo, fecha y recursos durante la sesión; carretera usa tramos dentro del mismo flujo y la demo se reinicia explícitamente.
2. Programación e historial abren el mismo vuelo y distinguen plan, ejecución declarada y entregas. Si se demuestra recurrencia/urgencia, una ocurrencia pendiente no cuenta como realizada y una solicitud no aparece como despacho confirmado.
3. Un piloto o dron reutilizado en dos vuelos aparece como una sola identidad; sus documentos se encuentran desde cualquiera de esos contextos sin duplicar archivo.
4. Una ficha permite distinguir documento faltante, fecha desconocida y revisión pendiente, mostrando sujeto y procedencia; no afirma autorización ni cumplimiento por la sola carga.
5. El recorrido funciona con teclado y en móvil, conserva contexto de sitio/zona/fecha y permite continuar sin clima, 3D ni integraciones; cualquier muestra meteorológica diferencia actual/pronóstico y no concluye aptitud del vuelo.

## Preguntas no bloqueantes para esta planificación

- ¿Qué dato permite declarar un vuelo realizado y quién puede cambiarlo, cancelarlo o revisar su documentación?
- ¿Qué listas y documentos usa hoy cada operador, quién los revisa y cuáles deben quedar vinculados a una operación concreta?
- ¿Quién tramita permisos en cada relación cliente/operador y quién confirma su revisión, con qué evidencia y limitaciones declaradas?
- ¿Cómo se acuerdan frecuencia, periodo y entregables de paquetes, y cómo se cancelan/reprograman ocurrencias sin perder el compromiso original?
- ¿Quién recibe, evalúa y confirma una solicitud urgente; qué expectativa de respuesta puede ofrecer realmente el operador?
- ¿Cuáles son los filtros del historial realmente frecuentes y cuántos vuelos suele consultar el administrador?
- ¿Se asignan varios pilotos/drones o fechas alternativas a un mismo plan? ¿Qué notificación resuelve un problema real?
- ¿Qué aporta el 3D a la selección del dron y con cuánta anticipación se decide un vuelo según el clima?

Estas preguntas no detienen el plan; las reglas de operación y documentos deberán aclararse antes de implementar validaciones reales.
