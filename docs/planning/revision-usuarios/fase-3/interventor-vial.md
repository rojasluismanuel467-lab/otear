# Tercera pasada por rol: ingeniera interventora de una concesión vial

Son hipótesis de una persona simulada («yo, como esta persona, entendería X»), no resultados de usuarios reales. Prefijo de IDs: `I3-`. Fecha: 31 de octubre de 2026. Rama `revision-fase-3` (commit `f1b2d0e`), demo en `localhost:3445`, Chromium propio con CDP (puerto 9445), sector «Vía o carretera»; después recorrí construcción. Evidencia «navegador» = lo vi ejecutarse; «lectura de código» = solo lo leí.

Nota de método: en mi Chromium sin interfaz el primer clic tras un desplazamiento suave a veces no se registra (me pasó con una pastilla del selector, con «Firmar el informe del vuelo» y con «Cerrar con nota»); repetido o con el desplazamiento instantáneo funcionó siempre. Lo tomo como un efecto de mi herramienta y no lo cuento como hallazgo. El diálogo de firma lo recorrí de punta a punta; la descarga real del `.txt` no la pude hacer en ese navegador, así que la verificación la probé con un texto armado a mano según el formato que describe el código.

## Estado de los hallazgos de la pasada anterior

| ID | Estado | Por qué (evidencia) |
|---|---|---|
| I-01 Seguimiento hasta cerrar | **Resuelto** | Responsable, plazo, «Abierta / En corrección / Cerrada», cierre con nota, vencidas, historial (navegador). |
| I-02 Evidencia = foto de cultivo | **Resuelto en carreteras** | Seis vistas con la ilustración vial y el rótulo «Ilustración, no es una foto de la vía» sobre cada imagen y en «Ampliar» (navegador). Es la misma ilustración bajo drenaje, talud y deterioro, y en construcción sigue el cultivo (I3-01). |
| I-03 El informe del vuelo no se firma | **Resuelto** | Diálogo «Informe del vuelo» con «Operador» y «Revisor o interventor»; firmé los dos (navegador). |
| I-04 Historial sin quién; «Eliminar» sin preguntar | **Resuelto** | Cada línea trae «Perfil de la demostración: Luis Rojas · Administrador · ejemplo» y la confirmación nombra las firmas que se pierden (navegador el historial; lectura de código `evidence-dialog.tsx:870` la confirmación). Queda que un firmado se puede eliminar (I3-07). |
| I-05 Vocabulario agrícola | **Igual** | Siguen «permiso del predio» (itinerario y prevuelo) y «Propietario · Interventoría Vial (ejemplo)»; ahora aparece «hectáreas cubiertas» en el informe de una vía (I3-09). |
| I-06 Sin PK ni abscisa | **Igual** | Hay rangos y PK en cada hallazgo, pero Mapa sigue diciendo «Los PK cuentan los tramos desde 0+000» junto a «PK 12+000 – 12+400» (navegador). |
| I-07 No se ve el tramo con más novedades | **Resuelto** | Mapa: «6 no conformidades en 5 vuelos · Es donde más hay»; Informes igual (navegador). |
| I-08 Un vuelo contado de varias maneras | **Resuelto** | Vuelos: «5 (3 del operador y 2 sugerencias sin revisar)»; Informes: «Se excluyen 2 sugerencias»; Evolución: «5 no conformidades (…) y 1 alerta calculada». Cada pantalla dice de qué cuenta (navegador). |
| I-09 Comparar no dice «mejoró/empeoró» | **Igual** | Evolución sigue midiendo avance de obra («Avance de la zona 100 %») y no el deterioro (I3-12). |
| I-10 «Firma inválida» y huella | **Resuelto** | Explicado en el documento, al firmar y en Documentos; además hay «Verificar un archivo descargado» (navegador). |
| I-11 Primera pantalla = prevuelo | **Resuelto** | Entra en «Vuelos y evidencias» (navegador). |
| I-12 Tuteo | **Mejorado** | Desapareció «Buscar en tus vuelos» (ahora «Buscar un vuelo»); queda «Arrastra para girar» (`drone-preview.tsx:46`). |
| I-13 Recargar vuelve a Agricultura | **Resuelto** | Cargué `/vuelos`, `/mapa`, `/evolucion`, `/documentos`, `/informes`, `/programacion`, `/servicios`, `/pagos` y `/equipos` y todas abren con la vía (navegador). |
| I2-01 No dice quién cambió | **Resuelto** | Cada evento de medida y de documento trae el perfil de la demo y la frase «no es una identidad comprobada»; la demo lo declara, así que no lo cuento como falta (navegador). |
| I2-02 Descartar sin motivo ni rastro | **Mejorado** | Hay «Descartar con motivo», el motivo queda en el historial y Evolución e informe consolidado cuentan «1 descartada sin cerrar». Pero acepta «No aplica» y el tablero de Vuelos no la cuenta (I3-03). |
| I2-03 «Cerrada» no distingue contratista de interventoría | **Igual** | No hay «Verificado por» ni evidencia adjunta; cerré una medida con «El contratista dice que limpió la cuneta. Sin verificar.» sobre una no conformidad sin confirmar (I3-02). |
| I2-04 Mismo nombre con otra cédula | **Resuelto** | La cédula exige 6 a 10 dígitos («el que escribió tiene 4») y «CAMILO TORRES» con otra cédula se rechaza por el nombre (navegador). |
| I2-05 Tres cifras para un vuelo | **Mejorado** | Rótulo con desglose en Evolución; la insignia del eje de tiempo dice «6» junto a «5 no conformidades… y 1 alerta» (navegador). |
| I2-06 Lo firmado sin lugar ni verificación | **Resuelto** | «Informes y actas firmados» en Documentos y «Verificar un archivo descargado» en el diálogo (navegador). Reparos en I3-07 y I3-08. |
| I2-07 Concordancia | **Mejorado** | El texto firmable ya sale «NO CONFORMIDADES INCLUIDAS» y «Puntos incluidos»; en pantalla siguen «confirme los no conformidades» y «Todos los no conformidades» (I3-10). |
| I2-08 Claves duplicadas en la ficha | **Resuelto** | Claves `custom-` y `follow-up-` (`flight-review-view.tsx:619,665`); la insignia de desarrollo no mostró contador al abrir fichas (navegador). |

Conteo: **13 resueltos, 4 mejorados, 4 iguales, 0 empeorados.** (13 de la fase 1 y 8 de la fase 2 = 21; I-02 lo cuento como resuelto por la decisión del dueño.)

## 1. Persona y tareas

Ingeniera interventora de una concesión vial, 38 años. Necesita saber quién firmó, cuándo, con qué evidencia y si algo cambió después. Tareas de esta pasada: (1) prueba de 5 segundos del hero nuevo; (2) abrir el informe firmable, firmarlo con dos roles, ver la huella y «Verificar un archivo descargado»; (3) encontrarlo después en Documentos; (4) descartar con motivo una no conformidad con medida abierta y ver qué pasa con los conteos; (5) ver la ilustración vial en evidencias y hallazgos; (6) Vuelos y Documentos en móvil 390 × 844; (7) recorrer construcción y ver si habla de obra.

## 2. Prueba de 5 segundos (escrita antes de leer más, hero de escritorio y de móvil)

- ¿Qué cree que hace Otear? Reúne los vuelos de dron de mi operación («finca, vía, obra, predio o mina») y los compara con el anterior. La línea «Otear no hace los vuelos. Los hace su operador de dron» me deja claro que no me venden vuelos. El panel «Así se ve antes de pagar» me dice que además cruza lo pedido, lo declarado y lo facturado.
- ¿Para quién? «Vía» está en la lista, pero el panel habla de «ha» y de «Facturó»: eso lo leo como cobro de servicio por hectárea. Yo superviso una concesión y no pago por hectárea, así que el panel me enseña un producto que es para quien contrata vuelos, no para quien interviene. No me estorba, pero tampoco me ayuda: la propuesta para mí (medidas con plazo, informe firmado) no está en la primera pantalla.
- ¿Qué haría? Pulsaría «Abrir la demo». Las pastillas «Sin registro · Datos de ejemplo: nada es real · Los mapas necesitan internet · En validación: aún sin prueba con un cliente» me bajan la expectativa a tiempo.
- ¿Se entiende quién está detrás? «Un proyecto en validación: todavía no tiene clientes ni una prueba con sus vuelos. Escriba a hola@otear.app.» Es honesto y me sirve para no esperar referencias; no dice quién firma el proyecto, y eso (decisión del dueño, hoy sin nombre) es lo primero que me preguntaría un contratante público. No lo cuento como hallazgo.
- En móvil el panel queda bajo el titular y el párrafo se lee bien. Al bajar, el avión del fondo se dibuja encima de «Quién está detrás» y tapa medio renglón (captura móvil, navegador); es decorativo y se mueve, pero en el único lugar donde hay un correo de contacto estorba.

## 3. Primer minuto en la demo

Elegí «Vía o carretera» en el selector (vista previa «Tramos / No conformidad / Informe · Tramo PK 12+400 · Drenaje obstruido») y entré: aterrizo en «Vuelos y evidencias» con la última visita de la Troncal de Occidente abierta y el aviso de bienvenida. Dudé en una cosa: el aviso queda sobre el contenido (se cierra con la X) y la primera frase del encabezado ya dice «confirme los no conformidades».

## 4. Tareas: ¿pude terminarlas?

| # | Tarea | Resultado | Por qué |
|---|---|---|---|
| 1 | Hero en escritorio y móvil | Sí | Ver sección 2. |
| 2 | Firmar el informe del vuelo con dos roles y verificar | **Sí** | Firmé «Operador» (Camilo Torres, 1111222333) y «Revisor o interventor» (Ana Beltrán, 52111222); quedó «Firmado», historial con la versión `182d527d9e46` y huella. Probé un nombre repetido en mayúsculas con otra cédula: lo rechazó. Junto al formulario de firma dice «En la demostración no hay verificación de identidad real: solo se compara lo que se escribe (nombre y número de documento)». Se entiende con claridad. (navegador) |
| 3 | Encontrarlo en Documentos | **Sí, con reparos** | «Informes y actas firmados» está debajo de los cuatro soportes; abre el mismo diálogo. Ver I3-07. (navegador) |
| 4 | Descartar con motivo | **Sí, con reparos** | Pide motivo, lo anota, la medida sale de los conteos y Evolución dice «1 descartada sin cerrar». Ver I3-03. (navegador) |
| 5 | Ilustración vial | **Sí** | Rotulada sobre la imagen en las seis tarjetas de evidencias, en el ampliado y en «Explorar comparación» («Solo hay una imagen ilustrativa disponible… no representa dos vuelos»). (navegador) |
| 6 | Vuelos y Documentos en móvil | **Parcial** | Documentos se lee bien. En Vuelos el tablero de medidas se sale de la pantalla y la pestaña «Informe del vuelo» queda cortada. Ver I3-04 e I3-05. (navegador) |
| 7 | Construcción completo | **Con ayuda** | El vocabulario es de obra («Frentes», «observación», «niveles construidos»), pero la evidencia es un cultivo y hay errores de género. Ver I3-01, I3-10, I3-11. (navegador) |

## 5. Hallazgos

### I3-01 En construcción la «evidencia» sigue siendo la foto de un cultivo, sin rótulo
- Eje: caso-de-uso
- Dónde: `/vuelos?tab=evidencias` y Hallazgos con el sector Construcción; `src/features/demo/demo-data.ts:180,214,254` (`/images/aerial-road.jpg`, que en realidad muestra parcelas de cultivo; además usada por otras dos obras de muestra), frente a `ROAD_ILLUSTRATION_URL` en `:169` y `src/lib/illustration.ts`.
- Lo que ve la persona: seis tarjetas con parcelas verdes y amarillas bajo «Material por retirar», «Frente por verificar», «Posible acopio fuera del área», «Posible elemento sobresaliente en la losa». La imagen no lleva rótulo; solo la frase de arriba dice «Estas imágenes ilustran el recorrido. No son fotografías georreferenciadas».
- Qué entiende o hace mal: que el producto no sabe mostrar una obra; un «elemento sobresaliente en la losa» sobre un sembrado es lo mismo que me molestó en vías en la primera pasada.
- Por qué importa para su tarea: la evidencia es lo que se mira antes de exigir una corrección; si la imagen no tiene nada que ver con el texto, el resto pierde credibilidad. La vía ya recibió una ilustración propia y rotulada; las obras no.
- Propuesta: la misma decisión que en vías, ilustración propia de obra (losa, acopio, frente) con el rótulo «Ilustración, no es una foto de la obra» sobre la imagen, o, mientras no exista, ocultar el cultivo y mostrar solo «Imagen ilustrativa» con un recuadro neutro. Cambiar el nombre del archivo `aerial-road.jpg`, que engaña a quien lo revise.
- Gravedad: confunde
- Evidencia: navegador (seis tarjetas con la URL de la imagen verificada por script) y lectura de código
- Huecos relacionados: H7

### I3-02 Cerrar una medida sigue sin distinguir lo que dice el contratista de lo que verifica la interventoría, y se puede cerrar sobre algo que nadie confirmó
- Eje: caso-de-uso
- Dónde: `/vuelos?tab=hallazgos`, «Cerrar con nota»; `src/features/flights/follow-up.ts:22,173,236` (solo exige 8 caracteres); `follow-up-panel.tsx:206-232`.
- Lo que ve la persona: con «Deterioro superficial · PK 12+140» en «Por verificar» (con «Confirmar» y «Descartar» todavía visibles) pude pulsar «Cerrar con nota», escribir «El contratista dice que limpió la cuneta. Sin verificar.» y quedó «Medida correctiva: Cerrada». El historial dice «25 de oct de 2026 · Cerrada. El contratista dice que limpió la cuneta. Sin verificar. · Luis Rojas · Administrador · ejemplo», es decir, el cierre queda a nombre del perfil que revisa.
- Qué entiende o hace mal: «Cerrada» vale lo que valga la nota, y el registro no separa a quien corrige de quien verifica. Es el mismo reparo de la pasada anterior (I2-03), sin cambios.
- Por qué importa para su tarea: exigir y verificar son dos actos distintos; con este cierre el contratista (o yo, por un descuido) puede cerrar su propia observación.
- Propuesta: en el cierre, dos campos: «Verificado por (nombre y rol)» y «Evidencia (acta, foto o visita)»; mostrar «Cerrada, verificada por …» o «Corregida, sin verificar». No permitir cerrar la medida mientras la no conformidad esté «por verificar», o decirlo en la ficha («Cerrada sobre una no conformidad sin confirmar»).
- Gravedad: confunde (para uso de auditoría real, bloquea)
- Evidencia: navegador
- Huecos relacionados: H7, H8

### I3-03 Descartar con motivo mejora mucho, pero acepta «No aplica» y el tablero de Vuelos no cuenta lo descartado
- Eje: componente
- Dónde: `/vuelos?tab=hallazgos`, «Descartar con motivo»; `follow-up.ts:261-291` (`discardFollowUp`, mínimo 8 caracteres); tablero «Medidas correctivas del sitio» (`measure-board.tsx`) y `/informes?tab=pendientes`; el conteo «descartada sin cerrar» está solo en Evolución («Medidas del sitio: 5 medidas: … · 1 descartada sin cerrar») y en el informe consolidado.
- Lo que ve la persona: tras descartar «Drenaje por revisar · PK 13+400» (medida vencida, en corrección) con el motivo «No aplica», el historial dice «Se descartó con la medida sin cerrar. Motivo: No aplica · Luis Rojas · Administrador · ejemplo» y el aviso «La medida queda anotada y se cuenta aparte, como “descartada sin cerrar”». El tablero de Vuelos pasó de «2 vencidas / Todas (6)» a «1 vencida / Todas (5)» sin decir que se descartó una; Informes pestaña Pendientes dice «2 abiertas · 1 en corrección · 2 cerradas · 1 vencida», tampoco.
- Qué entiende o hace mal: el rastro existe (eso lo resuelve lo que yo pedí), pero «No aplica» es un motivo que no dice nada, y quien mira solo Vuelos o Informes ve que una vencida desapareció sin explicación; la nota «se cuenta aparte» no dice dónde.
- Por qué importa para su tarea: es la manera más fácil de maquillar una cifra; con el motivo vacío de contenido el rastro no protege.
- Propuesta: pedir un motivo de verdad (por ejemplo, 20 caracteres y que no sea una de «no aplica», «ok», «error») y mostrar junto al tablero la misma línea que ya tiene Evolución: «1 descartada sin cerrar». Que el aviso diga dónde se cuenta.
- Gravedad: confunde
- Evidencia: navegador
- Huecos relacionados: H7

### I3-04 En móvil, el tablero de medidas de Vuelos se sale de la pantalla
- Eje: componente
- Dónde: `/vuelos?tab=hallazgos` a 390 px; `src/features/flights/review/measure-board.tsx:90` (`segmented-control` con cinco opciones) y `follow-up.module.css` (`.boardHead`, `.measures`).
- Lo que ve la persona: el tablero mide 406 px en una pantalla de 390 y la página gana scroll horizontal (`scrollWidth` 449). El texto queda cortado a la derecha («Hoy en la demostración es 25 de oct de 2026. Cada me…», «Residente de obra del concesionario (ejemplo)» sin final) y las etiquetas «Vencida», «Abierta», «En corrección» quedan a medio mostrar. Los rótulos de las cinco pestañas del filtro se parten en dos y tres renglones.
- Qué entiende o hace mal: no puedo leer del todo la lista de medidas ni el estado de cada una, que es lo que haría desde el teléfono en una visita.
- Por qué importa para su tarea: la tarea 2 (hallazgo → medida → cierre) es de campo; en el teléfono hoy no se completa sin arrastrar la página de lado.
- Propuesta: que el filtro pase a una lista desplegable o a dos renglones en pantallas angostas, y que `.boardHead` y las filas tengan `min-width: 0` para que el texto se parta en vez de empujar el ancho.
- Gravedad: confunde
- Evidencia: navegador (390 × 844, medidas del documento por script y captura)
- Huecos relacionados: —

### I3-05 En móvil, la pantalla del vuelo pone siete vuelos antes que el vuelo, corta la pestaña «Informe del vuelo» y recorta el botón del mapa
- Eje: componente
- Dónde: `/vuelos` a 390 px; `flight-review.module.css:83` (`.tabList`, 465 px de ancho); botón «Revisar 5 no conformidades (…)» sobre el mapa de `SiteMap`.
- Lo que ve la persona: antes del título del vuelo hay que bajar por «Troncal de Occidente · 7 vuelos» (casi dos pantallas). Las pestañas son más anchas que la pantalla: «Informe del vuelo» queda cortada con una flecha. En el mapa, el botón azul se lee «…lades (3 del operador y 2 sugerencias sin revisar)», empieza fuera del borde y se monta sobre el selector Satélite/Mapa. En escritorio el mismo botón tapa la mitad del rótulo «Guacarí – Buga, Valle del Cauca».
- Qué entiende o hace mal: que la pestaña del informe, que es la que me importa para firmar, no está a la vista; el botón del mapa pierde el principio de su frase.
- Por qué importa para su tarea: firmar y revisar desde el teléfono. Hoy lo alcanzo, pero con varios deslizamientos.
- Propuesta: lista de vuelos en una sola fila deslizable o plegada («Ver los 7 vuelos») en móvil; pestañas que quepan (iconos con texto corto, «Informe») o se desplacen con indicio claro; que el botón del mapa pase a dos líneas o debajo del mapa.
- Gravedad: confunde
- Evidencia: navegador (capturas de 390 px y medidas por script)
- Huecos relacionados: —

### I3-06 El informe firmado mezcla dos «hoy»: la hora de la firma es la del dispositivo y el informe cuenta las medidas «a 25 de oct»
- Eje: componente
- Dónde: diálogo «Informe del vuelo» (historial: «31/10/2026, 8:56 a. m. · Firmó Ana Beltrán…») frente a las medidas («Hoy en la demostración es 25 de oct de 2026», «Cerrada el 25 de oct de 2026») y al texto firmable («Hay 2 medidas correctivas vencidas en el sitio»); `FOLLOW_UP_TODAY` frente a `new Date()` en la firma.
- Lo que ve la persona: firmé el 31 de octubre un informe que dice, en el resumen del consolidado, «a 25 de oct de 2026, día de la demostración». En un mismo historial aparecen «25 de oct» (medida) y «31/10/2026» (firma).
- Qué entiende o hace mal: que el informe se firmó seis días después de que se contaron las vencidas, sin que el documento diga cuál fue la fecha de corte.
- Por qué importa para su tarea: en una auditoría, la fecha de corte de «vencidas» es parte de lo que se firma.
- Propuesta: que el texto firmable diga «Medidas vencidas a [fecha de corte]» (la misma de la demo) y, mientras la demo use una fecha propia, un renglón en «Qué es esta firma y qué no»: «La hora de la firma es la de este dispositivo; la fecha de corte de las medidas es la de la demostración».
- Gravedad: menor
- Evidencia: navegador
- Huecos relacionados: H7

### I3-07 «Informes y actas firmados» queda enterrado en la lista, mezcla un acta sin firmas y no impide eliminar lo firmado
- Eje: componente
- Dónde: `/documentos`; `src/features/compliance/signed-records.tsx:45`; `evidence-dialog.tsx:862-890`.
- Lo que ve la persona: la sección vive al fondo de la lista de «Soportes y documentación», debajo de los cuatro soportes; el contador «4 de 4 documentos», el buscador y los filtros de sujeto y estado no la incluyen. Bajo el título «Informes y actas firmados» aparece «Acta de entrega y recibo a satisfacción · Huella ccb029cab6196da5… · falta Cliente o responsable · Faltan firmas» junto al «Informe del vuelo · Firmado». Dentro del diálogo, un documento con las dos firmas conserva el botón «Eliminar».
- Qué entiende o hace mal: que el expediente de una visita está en dos listas con reglas distintas, y que un acta sin firmar se presenta como «firmada». La confirmación dice qué firmas se pierden, pero la eliminación de lo firmado es posible y solo deja un aviso en pantalla.
- Por qué importa para su tarea: lo firmado es lo que entrego; no debería poder borrarse con el mismo botón que un borrador.
- Propuesta: título «Informes y actas (con firmas)» o dos grupos «Firmados» y «Faltan firmas»; incluir estos registros en el contador y el buscador; en lo firmado, cambiar «Eliminar» por «Anular (queda el registro)» o decir en la confirmación que la eliminación no deja rastro.
- Gravedad: menor
- Evidencia: navegador (lista, diálogo, botón) y lectura de código
- Huecos relacionados: H4, H7

### I3-08 «Verificar un archivo descargado» funciona, pero pegar lo que se ve en pantalla da «No se pudo leer» sin decir por qué
- Eje: texto
- Dónde: diálogo del informe, «Verificar un archivo descargado»; `src/features/traceability/document-export.ts:106-112` (`checkDownload`, `bodyFromDownload`).
- Lo que ve la persona: copié el recuadro «Documento» del mismo diálogo (el texto que firmé) y lo pegué: «No se pudo leer. Pegue el texto completo del archivo .txt que descargó de este documento, o cárguelo con el botón, o escriba la huella de 64 caracteres.» Con un texto armado a mano según el formato del `.txt` (título, cuerpo, «Estado:», «Huella SHA-256…») dio «Coincide. El texto del archivo es exactamente el de la huella guardada (182d527d9e46fb13…). Eso no prueba quién lo firmó ni cuándo.» La huella a la vista está cortada («182d527d9e46fb13…»), así que la opción de escribirla de 64 caracteres obliga a descargar el archivo.
- Qué entiende o hace mal: que el verificador falla con el texto que tengo en pantalla; el mensaje no dice que hace falta el encabezado del archivo. Lo que sí entiendo y valoro: dice qué prueba y qué no.
- Por qué importa para su tarea: quien verifica ante un tercero pega lo que tiene; un fallo sin causa se lee como «el documento cambió».
- Propuesta: «No se pudo leer: falta el encabezado del archivo (título y línea “Estado:”). Descargue el .txt y péguelo completo.» y un botón «Copiar la huella completa» junto a la huella cortada.
- Gravedad: menor
- Evidencia: navegador (con texto armado a mano; la descarga real no la hice) y lectura de código
- Huecos relacionados: H4

### I3-09 Vocabulario de predio y de hectáreas en la vía y la obra
- Eje: texto
- Dónde: `src/features/flights/itinerary.ts:126` («permiso del predio»), `preparation-items.ts:26` y `requirements.ts:22` («Confirmar permiso del predio y de la zona de despegue»), `flight-report.tsx:414` («las hectáreas cubiertas los declara el operador»), `src/features/sites/mapping/mapping-steps.tsx:124` («Los PK cuentan los tramos desde 0+000»), `drone-preview.tsx:46` («Arrastra para girar»).
- Lo que ve la persona: en la vía, en Programación: «Soportes 1 de 4 · permiso del predio: sin documento»; en el informe de la visita, «Límites de los datos: … las hectáreas cubiertas los declara el operador» (una vía se mide en kilómetros); en Servicios, «Propietario · Interventoría Vial (ejemplo)» en «Ver como»; en Mapa, el rótulo de PK desde 0+000 al lado de «PK 12+000 – 12+400»; en Programación, bajo «Equipo asignado», «Arrastra para girar» (tuteo).
- Qué entiende o hace mal: se entiende, pero cada resto de otro sector le recuerda a la interventora que es un producto de finca con la ropa cambiada.
- Por qué importa para su tarea: el informe de la visita es el documento que firmo; «hectáreas» ahí no corresponde a mi contrato.
- Propuesta: «permiso del sitio» (o `placeWordsFor` también en el itinerario y la lista); en el pie del informe, «la cobertura y la longitud recorrida las declara el operador» para vías; «Los PK de este ejemplo arrancan en 12+000 y no vienen de un contrato»; «Arrastre para girar».
- Gravedad: menor
- Evidencia: navegador (Programación, informe, Mapa, Servicios) y lectura de código
- Huecos relacionados: H7

### I3-10 Errores de género y número que siguen en pantallas clave (vía y obra)
- Eje: texto
- Dónde: `flight-review-view.tsx:101` («confirme los ${words.plural}»), `:374` («Todos los …») y `:392`; Evolución (`evolution-view.tsx`, «Todos los no conformidades», «1 descartados» en el informe consolidado); Informes («1 en 1 vuelos»).
- Lo que ve la persona: en vía, «confirme los no conformidades» y «Revise los no conformidades del operador» (el encabezado de Vuelos) y «Todos los no conformidades» (Evolución); en obra, «confirme los observaciones»; en el consolidado, «1 descartados» y «en 1 vuelos» (algunas sí concuerdan: «1 no conformidad en 1 vuelo» en Mapa).
- Qué entiende o hace mal: se entiende, y el texto firmable ya sale bien («No conformidades incluidas»), así que lo que queda se nota más.
- Por qué importa para su tarea: son frases que se leen en voz alta en una reunión de seguimiento.
- Propuesta: usar el mismo `agree()` que ya usa el resto en las cadenas de `flight-review-view.tsx:101,392`, `evolution-view.tsx` y el informe consolidado («las observaciones», «las no conformidades», «1 descartada», «1 vuelo»).
- Gravedad: menor
- Evidencia: navegador (vía y obra) y lectura de código
- Huecos relacionados: —

### I3-11 Al cambiar de sector desde la barra superior, el vocabulario se queda con el del sector anterior; y lo que promete el selector de obra no está en la demo
- Eje: caso-de-uso
- Dónde: barra superior (Agricultura · Carreteras · Construcción · Vigilancia · Minería); `src/features/entry/entry.ts:38-48` (ejemplo de obra «Torre A, nivel 4 · Acero sin cubrir») y `demo-data.ts` (Obra Alameda: «Frente norte», «Material por retirar»).
- Lo que ve la persona: entré como vía y pulsé «Construcción»: el título y el mapa cambian a «Obra Alameda» y «Frentes», pero el texto sigue diciendo «los no conformidades»; volviendo a entrar desde el selector con «una obra» sí aparece «observación». Aparte, el selector prometió «Torre A, nivel 4 · Acero sin cubrir» y la demo trae «Frente norte», «Frente sur» y «Material por retirar» (hay «niveles construidos» en Avance de obra, pero no una torre ni un nivel por observación).
- Qué entiende o hace mal: que el sector cambia solo el sitio y no las palabras, y que el ejemplo del selector es otro caso que el de la demo.
- Por qué importa para su tarea: quien me pida «¿y en obra cómo se vería?» y use la barra superior verá mi vocabulario en la obra.
- Propuesta: que la barra superior aplique el preset del sector al cambiar (o avise «El vocabulario sigue siendo el de vías; cámbielo en Configuración»); y alinear el ejemplo del selector con la demo («Frente norte · Material por retirar»).
- Gravedad: confunde
- Evidencia: navegador (cambio por barra superior frente a entrada por selector) y lectura de código
- Huecos relacionados: H7

### I3-12 Evolución no responde a «¿mejoró o empeoró este deterioro?» y repite el nombre de la zona
- Eje: caso-de-uso
- Dónde: `/evolucion`, ficha de «Deterioro superficial · PK 12+140»; `src/features/evolution/evolution-view.tsx`.
- Lo que ve la persona: «Zona: PK 12+000 – 12+400 · PK 12+000 – 12+400», «Visto en 18 de jul … 24 de oct · sigue abierto», «Estado: Pendiente de revisar», «Medida correctiva: Abierta…», y la gráfica «Cómo va la zona: Es el valor de la zona; no mide este hallazgo» con «Avance de la zona 100 %» al final. La misma frase «sigue abierto» se usa aunque la medida esté cerrada.
- Qué entiende o hace mal: el avance de obra del tramo (100 %) no me dice si el deterioro de ese PK creció, y la palabra «abierto» no distingue «sigue apareciendo» de «sigue sin corregirse».
- Por qué importa para su tarea: comparar con la visita anterior (tarea 3) es lo que justifica Otear para mí; hoy solo me da el avance de la obra y las fechas en las que apareció.
- Propuesta: no pido pantalla nueva: en la ficha, una línea «Visto en 5 visitas seguidas; en la última, sin medida cerrada» y cambiar «sigue abierto» por «sigue apareciendo»; quitar el nombre repetido de la zona.
- Gravedad: menor
- Evidencia: navegador y lectura de código
- Huecos relacionados: H7

## 6. Lo que funciona y hay que conservar

1. El diálogo de firma. Junto al formulario dice, en una frase, «En la demostración no hay verificación de identidad real: solo se compara lo que se escribe (nombre y número de documento)», y el pie dice qué prueba la huella y qué no. La validación de cédula de 6 a 10 dígitos y el rechazo del mismo nombre con otra cédula son justo lo que haría una interventoría. Conservar tal cual.
2. La ilustración vial rotulada («Ilustración, no es una foto de la vía») sobre la imagen, en el ampliado y en la comparación, y el aviso «Solo hay una imagen ilustrativa disponible… no representa dos vuelos».
3. «Descartar con motivo» con su historial y la línea «descartada sin cerrar» en Evolución y en el consolidado: es el rastro que pedí.
4. El historial de cada medida y de cada documento con el perfil de la demo y la frase «no es una identidad comprobada».
5. «Informes y actas firmados» en Documentos con el mismo diálogo al abrirlo; y «Verificar un archivo descargado», con su advertencia «no prueba quién lo firmó ni cuándo».
6. La landing de carreteras dice con claridad «Cada medida correctiva tiene responsable, plazo y se cierra con una nota; en la demo nada se avisa a nadie», y la sección «Sin letra pequeña» separa lo que se puede probar de lo que se acuerda.

## 7. Huecos H1–H9 desde mi rol

- H1 (propiedad de los datos): me estorba; decisión del dueño, la landing lo dice «por definir».
- H2 (precio): indiferente.
- H3 (cómo entran los vuelos): me interesa poco; el informe dice que los entrega el operador.
- H4 (valor de la firma): me importa y la demo lo dice bien; falta que un firmado no se pueda borrar sin rastro (I3-07).
- H5 y H6: indiferentes.
- H7 (trazabilidad de cambios y cierres): es mi hueco principal; queda I3-02, I3-03 y I3-06.
- H8 (verificación independiente de una medida): igual que antes (I3-02).
- H9: indiferente.

## 8. Qué le preguntaría a una persona real como yo

1. La última vez que tuvo que demostrar que una medida correctiva estaba cumplida, ¿qué papel o registro le pidieron y quién lo firmó?
2. Cuando cerró una observación porque «el contratista dijo que ya estaba», ¿cómo quedó escrito quién lo comprobó en sitio?
3. ¿Desde qué aparato revisó la última visita (teléfono en campo, portátil en oficina) y qué tuvo que dejar para después porque no cabía en la pantalla?

## 9. Límites

- No pude descargar el `.txt` en el Chromium sin interfaz; la verificación la probé con texto armado según el formato del código. El resultado «Coincide» es de esa prueba, no de un archivo descargado de verdad.
- No firmé el documento con trazo dibujado ni subí archivos; probé la firma con nombre escrito.
- No vi el itinerario de Programación con el informe firmado (el itinerario que revisé era el del vuelo del 29 de octubre) y por eso no puedo decir si «Entrega firmada» ya cuenta el informe.
- Mobile: solo Vuelos (resumen, evidencias, no conformidades, diálogo) y Documentos; no recorrí en móvil Programación, Mapa, Evolución, Servicios, Pagos e Informes (le tocan a otras personas).
- Construcción: recorrí Programación, Vuelos (evidencias, informe), Avance de obra, Mapa, Documentos, Informes y Servicios con una búsqueda de vocabulario; no abrí la carga de archivos de levantamiento ni el 3D.
- Seguí sin ver la demo en un teléfono real: es un Chromium con ancho emulado de 390 px.
