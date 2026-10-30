# Revisión por rol: ingeniera interventora de una concesión vial

Todo lo que sigue son hipótesis de una persona simulada («yo, como esta persona, entendería X»), no resultados de usuarios reales. Prefijo de IDs: `I-`. Fecha de la revisión: 30 de octubre de 2026. Demo en `localhost:3000`, Chromium sin interfaz propio (puerto CDP 9305), sector Carreteras elegido en el selector de la landing.

## 1. Persona y tareas

Ingeniera interventora de una concesión vial, 38 años. Revisa tramos por abscisa/PK, obras de drenaje, taludes y deterioros; debe dejar constancia de cada visita, exigir medidas correctivas al contratista y entregar informes firmados que resistan una auditoría o una disputa. Desconfía de la cartografía bonita sin trazabilidad: le importa quién firmó, cuándo, con qué evidencia y si algo cambió después.

1. Recorrer la vía por tramos y encontrar el que tiene más novedades (Mapa, Vuelos).
2. Abrir un hallazgo (drenaje, talud o deterioro), ver su evidencia y dejarlo asignado a un responsable con seguimiento hasta cerrarlo.
3. Comparar un vuelo con el anterior en el mismo tramo (Evolución).
4. Generar y firmar el informe y entender «firma inválida» si alguien cambia una cifra (Documentos, Informes): ¿me serviría en una auditoría? ¿entiendo «huella digital»?
5. Entender qué es real y qué es simulado.

## 2. Prueba de 5 segundos (escrita antes de leer el resto de la landing)

Solo vi la primera pantalla (titular, párrafo, avioncito blanco, dos botones, «Sin registro · Datos sintéticos · Funciona offline»).

- ¿Qué cree que hace Otear? Que junta los vuelos de dron de una operación (finca, vía, obra) en un solo lugar, los compara con el pasado y saca «informes firmados». No sé si es un programa que yo instalo, un servicio o una empresa que vuela. «Sin perder el vuelo de la semana pasada» me suena a archivo, no a control.
- ¿Para quién es? Para alguien que supervisa terreno. La palabra «vía» me incluye, pero el titular dice «su operación»: no dice interventoría, concesión ni obra pública. Tengo que adivinar si es para mí o para el dueño de la finca.
- ¿Qué haría ahora? Pulsaría «Abrir la demo», porque dice «Sin registro». Dudaría si «Datos sintéticos» significa que no sirve para evaluar.

## 3. Primer minuto en la demo

Bajé al selector «¿Qué opera usted?», elegí «Vía o carretera» y vi la vista previa: «Tramos», «No conformidad», «Informe», con un ejemplo «Tramo PK 12+400 · Drenaje obstruido». Eso me ganó: hablan mi idioma. Pulsé «Abrir la demo de una vía» y caí en **Programación** con un aviso («Entró como vía o carretera: ya ve “tramos” y “no conformidad”»).

Dudé aquí: la primera pantalla es la agenda de vuelos y una lista de 16 ítems de prevuelo (baterías, firmware, brújula, Aerocivil). Es trabajo del piloto, no mío. Tuve que ir a «Vuelos y evidencias» para ver lo que me importa. Además, el ejemplo del selector prometía «Tramo PK 12+400», pero en la demo ningún tramo tiene PK (I-06). Mi intuición: la primera pantalla debería enseñarme el último recorrido con sus no conformidades, no el prevuelo.

## 4. Tareas: ¿pude terminarlas?

| # | Tarea | Resultado | Por qué |
|---|---|---|---|
| 1 | Tramo con más novedades | **Con ayuda** | En Mapa no hay hallazgos; en Vuelos hay que contar a mano en una lista (4 de 5 son «Tramo sur»). La cifra clara («Tramo sur: 13 en 5 vuelos») está en Informes, que ni siquiera usa mi vocabulario. Ver I-07. |
| 2 | Hallazgo → evidencia → responsable → seguimiento → cierre | **No** | Pude abrirlo y «Confirmar». La evidencia es la foto de un campo de cultivo. «Tarea de verificación añadida a esta sesión. No se notificó a ninguna persona.» No hay responsable, plazo, ni estado «cerrado». Ver I-01 e I-02. |
| 3 | Comparar con el vuelo anterior en el mismo tramo | **Con ayuda** | Evolución tiene «Comparar con», pero cambiar la fecha casi no cambia lo que veo, no hay fotos lado a lado y la curva de un «Deterioro superficial» sube hasta 100 %. Ver I-09. |
| 4 | Informe firmado y «firma inválida» | **Con ayuda / parcial** | El informe del vuelo es un .txt con líneas «______» para firmar a mano. Lo que sí se firma son documentos de prevuelo. Cambié «Altura máxima» de 120 a 150 en uno firmado y la demo reaccionó muy bien (I-10, lo que funciona). Pero el registro no dice quién ni qué cambió y «Eliminar» borra todo sin preguntar. Ver I-03 e I-04. |
| 5 | Qué es real y qué es simulado | **Sí, en general** | Los avisos son abundantes y claros («Imagen ilustrativa», «No se notificó a ninguna persona», «ejemplos escritos a mano»). Lo que falta es que lo simulado no contradiga a lo real entre pantallas (I-08). |

## 5. Hallazgos

### I-01 No existe el seguimiento de una no conformidad hasta cerrarla
- Eje: componente
- Dónde: `/vuelos` pestaña «No conformidades»; `src/features/demo/types.ts:84-101` (`Finding`: solo `status: pending|confirmed|dismissed` y `taskAssigned: boolean`); `src/features/flights/review/flight-review-view.tsx:536-561`; promesa en `src/features/landing/landing-page.tsx:50-53`.
- Lo que ve la persona: «Próximo paso · Puedes añadir una tarea local para solicitar una comprobación en sitio.» y, tras pulsar, «Tarea de verificación añadida a esta sesión. No se notificó a ninguna persona.» En Evolución la ficha dice «Tarea: Asignada». La landing promete «dé seguimiento a drenajes, taludes y deterioros hasta cerrar cada medida correctiva».
- Qué entiende o hace mal: «Confirmado · demo» y «Tarea asignada» es todo el ciclo. No puedo decir a quién (el contratista, un residente), con qué plazo, ni registrar que quedó corregido ni cuándo lo verifiqué. «Confirmar» significa «sí es un hallazgo»; nada significa «cerrado».
- Por qué importa para su tarea: la interventoría es exigir y verificar la corrección. Sin responsable, plazo y cierre con evidencia, la demo no responde a la tarea central y la promesa de la landing queda sin respaldo.
- Propuesta: dato que falta en el hallazgo existente (no un módulo nuevo): «Responsable» (nombre de la persona o empresa contratista), «Plazo» y estados «Abierta → Corregida (el contratista dice) → Verificada en sitio (usted) → Cerrada», cada cambio con fecha y quien lo hizo. Mientras no esté construido, bajar la promesa a «Hallazgos con responsable y seguimiento (en validación)» o «Se construye con usted».
- Gravedad: bloquea la tarea
- Evidencia: navegador (Confirmar y «Añadir tarea de revisión» sobre «Deterioro superficial»; el estado quedó «Confirmado · demo») y lectura de código
- Huecos relacionados: H7, H8

### I-02 La «evidencia» de una vía es la foto de un campo de cultivo, repetida seis veces
- Eje: caso-de-uso
- Dónde: `/vuelos` pestañas «Evidencias» y «No conformidades»; `src/features/demo/demo-data.ts:677` (`imageUrl: site.imageUrl`), `public/images/aerial-road.jpg` (parcelas verdes y amarillas con un camino de tierra).
- Lo que ve la persona: en «Deterioro superficial», «Drenaje por revisar» y «Seguimiento de talud», la misma toma de cultivos. «Archivo visual · 6 vistas ilustrativas». Aviso: «Estas imágenes ilustran el recorrido. No son fotografías georreferenciadas del sitio».
- Qué entiende o hace mal: el aviso es honesto, pero la foto desmiente el caso: veo siembras donde debería ver calzada, cuneta o talud. Además cada foto trae solo un título; no veo número de foto, hora, PK ni coordenada.
- Por qué importa para su tarea: me importa «con qué evidencia». Una evidencia que ni en ejemplo se parece a una vía me hace dudar de todo lo demás y no me deja imaginar mi propia entrega.
- Propuesta: para el sector vías, imágenes de ejemplo de pavimento, alcantarilla y talud (con licencia libre y marcadas «Imagen de ejemplo»), y en cada evidencia mostrar «Foto 117 de 224 · 08:41 · PK 0+620 · coordenadas» aunque sean de ejemplo. No tocar la política de fotos sin GPS (G6): solo mostrar el campo.
- Gravedad: bloquea la tarea
- Evidencia: navegador (pestaña Evidencias y detalle de «Deterioro superficial») y lectura de código
- Huecos relacionados: H7, H8

### I-03 El «informe firmado» de la landing no existe para una interventoría: el informe del vuelo no se firma
- Eje: caso-de-uso
- Dónde: `/vuelos` → Informe (`src/features/flights/review/flight-report.tsx:152-154`: «Preparado por: ______ Revisado por: ______»); `src/features/flights/itinerary.ts:126-134` («Entrega firmada · Acta: falta Cliente o responsable»); `src/features/traceability/templates.ts` (firmantes: Piloto, Operador, Propietario, Cliente o responsable); `src/features/landing/landing-page.tsx:34-37`.
- Lo que ve la persona: la landing dice «Informes firmados con huella digital… Útil para una auditoría, una interventoría». En el informe del vuelo hay un borrador .txt «sin firma técnica, envío ni generación de PDF» con renglones en blanco. Los documentos que sí se firman son de prevuelo (autorización del predio, inspección de aeronave, briefing). La tarjeta «Entrega firmada» del itinerario dice que falta la firma de «Cliente o responsable», pero no hay forma de abrir esa acta desde la interfaz (solo los ítems del prevuelo abren documentos, `requirements.ts`).
- Qué entiende o hace mal: lo firmable es papelería del vuelo, no mi informe de visita ni la lista de no conformidades. Mi rol («Interventoría») no está entre los firmantes. La huella cubre el texto de cada plantilla, no mis hallazgos ni mis fotos.
- Por qué importa para su tarea: el entregable de mi trabajo es el informe de interventoría con sus no conformidades. Si eso no se puede firmar ni sellar, la frase «útil para una interventoría» no se sostiene.
- Propuesta: decirlo sin rodeos hoy: «Hoy se firman los soportes del vuelo; el informe de visita se descarga como borrador sin firma». Y como pendiente a validar: que el informe incluya la lista de no conformidades con su estado, su huella y firmantes por rol (operador, interventoría, contratista), con el rol «Interventoría» disponible. Hacer accesible el «Acta de entrega» que hoy solo se cuenta.
- Gravedad: bloquea la tarea
- Evidencia: navegador (pestaña Informe y itinerario) y lectura de código (`EvidenceDialog` solo se usa desde `preparation-checklist.tsx`)
- Huecos relacionados: H7, H8

### I-04 El historial de un documento firmado no dice quién ni qué cambió, y «Eliminar» lo borra sin preguntar
- Eje: componente
- Dónde: documento «Autorización…» desde `/programacion` → Prevuelo; `src/features/traceability/integrity.ts` (`withFields`); `src/features/traceability/evidence-dialog.tsx:673-682`.
- Lo que ve la persona: cambié «Altura máxima» de 120 a 150. La demo mostró de inmediato «Modificado tras firmar» y «Las firmas de Propietario o administrador, Operador ya no valen». Tras «Guardar cambios», el historial dice solo: «Se modificó el contenido del documento.» y «Las firmas anteriores (…) quedaron sin validez porque el contenido cambió.» Al final hay un botón «Eliminar» sin confirmación. El resumen del itinerario pasó de «firmado» a «en trámite».
- Qué entiende o hace mal: sé que algo cambió, pero no quién lo cambió, qué campo, ni cuál era el valor anterior; tampoco se conserva la versión firmada. Con un clic desaparece el documento y todo su historial. «En trámite» esconde que fue una alteración.
- Por qué importa para su tarea: ante una disputa, «alguien cambió una cifra» no basta: pregunto quién, cuándo y de qué a qué. Un documento firmado que se borra de un clic no es evidencia.
- Propuesta: en el historial, «30/10/2026 2:41 p. m. · Luis Rojas cambió “Altura máxima (m)”: de 120 a 150». Conservar la versión firmada (se puede abrir). «Eliminar» solo para borradores; en uno firmado, «Anular» con motivo, que deja registro. En el itinerario, «Modificado tras firmar» en lugar de «en trámite».
- Gravedad: bloquea la tarea (para el uso de auditoría; para una demo basta con decirlo)
- Evidencia: navegador (edición real y guardado) y lectura de código
- Huecos relacionados: H4, H7

### I-05 El vocabulario agrícola y de predio se filtra en el caso vial (varias pantallas)
- Eje: texto
- Dónde y qué se lee:
  - Plantilla de autorización (`src/features/traceability/templates.ts:45-48,115`): «Autorización del propietario o administrador del predio», «autorizo a AeroVisión del Valle a operar… dentro del predio», «Yo, Martha Lucía Ocampo… en calidad de Propietario del predio Troncal de Occidente»; también «Pedir a otra persona: por ejemplo, el propietario del predio».
  - Itinerario y prevuelo: «permiso del predio: firmado» (`itinerary.ts`, `preparation-items.ts`).
  - Mapa (`src/features/sites/mapping/mapping-steps.tsx:96`): «de un mapa que ya tengan o de la escritura».
  - Servicios (`demo-data.ts:1734`): cotización «Cámara multiespectral y mapa de vigor por suerte»; `request-detail.tsx:183`: «Área pedida 10 ha» para una vía (una vía tiene longitud, no hectáreas).
  - Informes (`reports-view.tsx:547`): «para socios, el ingenio o el responsable»; casilla «Hallazgos por zona».
  - «Ver como»: «Propietario · Interventoría Vial (ejemplo)» (`config.ts:121`): me ponen el rol de «Propietario».
- Qué entiende o hace mal: cada uno es pequeño, pero juntos me dicen «esto está hecho para ingenios y fincas, y a mí me traducen palabras». La interventoría no pide permiso a un propietario de predio: opera bajo el contrato de concesión.
- Por qué importa para su tarea: me cuesta confiar en un informe cuyas plantillas hablan de otro sector; un auditor leería «predio» y preguntaría de qué contrato es.
- Propuesta: pasar estas cadenas por el vocabulario del sector (`useTerm`): «Autorización del titular del contrato o de la entidad que administra la vía», «permiso de la vía y la zona de despegue», «de la escritura» → «de la geometría del eje o de un archivo de la concesión», «Área pedida» → «Longitud pedida (km)» en vías, «para socios, el ingenio» → «para la entidad contratante, el concesionario o el responsable», «Propietario» → «Interventoría» en el selector. Texto de ejemplo de cotización vial: «Cámara RGB; ortofoto y fotos con PK por tramo» (de ejemplo).
- Gravedad: confunde
- Evidencia: navegador (plantilla abierta, itinerario, Informes, Servicios, Mapa) y lectura de código
- Huecos relacionados: H7

### I-06 Los tramos no tienen PK ni abscisa, y los hallazgos se ubican por latitud y longitud
- Eje: caso-de-uso
- Dónde: `/mapa`; `src/features/demo/demo-data.ts:101-137` (dos tramos con 5 y 7 puntos, sin PK); `flight-report.tsx:145`; selector de landing `src/features/entry/entry.ts:34` («Tramo PK 12+400»).
- Lo que ve la persona: «2 tramos · 2,3 km en total. Tramo sur: Seguimiento de pavimento · 1,0 km; Tramo norte: … 1,3 km». En el informe: «Ubicación: 3.80549, -76.30840». En ninguna parte «PK 0+000 – 1+000».
- Qué entiende o hace mal: el asistente de mapeo sí sabe dividir por abscisa (`mapping-model.ts`, `auto-proposal.tsx`), pero el ejemplo sembrado no la muestra. Además es una vía de 2,3 km con dos tramos, «Sur» y «Norte»: nada parecido a una concesión.
- Por qué importa para su tarea: en una auditoría cito «PK 12+400, margen derecha, alcantarilla de 36″», no una coordenada. Sin PK ni abscisa no puedo ni ubicar el hallazgo ni cruzarlo con el contrato. La landing lo promete («Tramo PK 12+400»).
- Propuesta: en el caso vial de ejemplo, tramos con rango de abscisa («PK 12+000 – 13+000 · 1,0 km»), al menos 6 a 8 tramos, y cada hallazgo con «PK 12+400 · margen derecha» y su tipo (alcantarilla, cuneta, talud, pavimento) mostrados antes que la latitud y longitud. Todo marcado «de ejemplo».
- Gravedad: confunde
- Evidencia: navegador (Mapa, Vuelos, Informe) y lectura de código
- Huecos relacionados: H8

### I-07 El tramo con más novedades no se ve donde lo busco, y la cifra está donde la palabra es otra
- Eje: componente
- Dónde: `/mapa`, `/vuelos` (lista y mapa), `/informes` (`reports-view.tsx:33,300`).
- Lo que ve la persona: en Mapa los tramos son líneas de color sin hallazgos. En Vuelos, cinco marcadores en la lista («Tramo sur» cuatro veces, «Tramo norte» una); en el mapa los marcadores se montan y el rótulo «Tramo norte» queda tapado por un pin «2». Solo en Informes aparece «Tramo sur · 13 en 5 vuelos», «Tramo norte · 5 en 5 vuelos», bajo el título «Hallazgos por tramos», y en el informe consolidado: «Tramo sur reportó observaciones en 5 vuelos distintos: conviene buscar la causa». 
- Qué entiende o hace mal: lo encontré, pero por casualidad y con una palabra distinta («hallazgos», no «no conformidades»).
- Por qué importa para su tarea: la primera pregunta de una visita es «¿dónde me duele más?».
- Propuesta: en la lista de «No conformidades» de Vuelos, agrupar o resumir por tramo («Tramo sur: 4 · 1 alta») con un clic que centra el mapa; reutilizar la frase de Informes («13 en 5 vuelos») como una chapa en la tarjeta del tramo en Mapa. Mantener el consejo «conviene buscar la causa».
- Gravedad: confunde
- Evidencia: navegador
- Huecos relacionados: H6

### I-08 Un mismo vuelo se cuenta de maneras distintas según la pantalla
- Eje: componente
- Dónde: `/vuelos` Informe (`flight-report.tsx:83-84`) frente a `/informes`; `/evolucion` (`evolution-view.tsx:245`) frente a `/vuelos`.
- Lo que ve la persona:
  - Informe del vuelo del 24 oct: «Autorización y espacio aéreo: No registrada en la demo», «Clima durante el vuelo: No registrado en la demo». En Informes, el mismo vuelo: «Clima: Despejado · 12 km/h», «Autorización: AUT-2026-0412».
  - Vuelos dice «Ninguna es un hallazgo hasta que usted la confirme» (dos de las cinco son sugerencias de IA sin revisar), pero Evolución cuenta «6 problemas en este vuelo» incluyendo «Posible grieta en la calzada» y «Posible agua estancada», y el informe consolidado dice «Hallazgos: 18».
  - El mismo objeto se llama «No conformidad» (Vuelos), «hallazgo» (Informes), «problema» (Evolución) y «observación» (informe del vuelo).
- Qué entiende o hace mal: no sé cuál cifra es la oficial. En una auditoría me contradiría yo misma con el propio informe.
- Por qué importa para su tarea: la consistencia entre documentos es lo que se audita.
- Propuesta: que el informe del vuelo lea la bitácora que ya existe; que Evolución e Informes separen «confirmadas» de «por revisar (sugeridas)»; usar un único término por sector (`useTerm`), «No conformidad» en vías, en todas las pantallas.
- Gravedad: confunde
- Evidencia: navegador (Vuelos, Informe, Informes, Evolución) y lectura de código
- Huecos relacionados: H7

### I-09 En Evolución, comparar el tramo con el vuelo anterior no responde a «¿mejoró o empeoró?»
- Eje: componente
- Dónde: `/evolucion`; `src/features/evolution/evolution.ts:73` (media simple), `evolution-view.tsx:320-340`, «Lectura completa de los datos».
- Lo que ve la persona: la ficha de «Deterioro superficial» muestra «Cómo ha cambiado» con una línea que sube del 0 al 100 % entre el 18 jul y el 24 oct (es el avance de la obra del tramo, no el deterioro). «Avance medio: 65 %» es el promedio simple de 100 % (Tramo sur, 1,0 km) y 30 % (Tramo norte, 1,3 km); ponderado por longitud daría cerca de 60 %. La nota de confiabilidad dice «tome como fiables solo cambios grandes (más de 15 cm)» pero está dentro de un desplegable y habla de centímetros mientras todo lo demás son porcentajes. Cambiar «Comparar con» apenas mueve la pantalla; no hay dos fotos ni dos mapas lado a lado.
- Qué entiende o hace mal: una curva ascendente al 100 % junto a un deterioro se lee como «el deterioro llegó al 100 %». El promedio de avance me haría objetar en una reunión de comité.
- Por qué importa para su tarea: la comparación entre visitas es el argumento para exigir al contratista.
- Propuesta: en cada no conformidad, mostrar «Visto en: 18 jul, 22 ago, 19 sept, 10 oct, 24 oct · sigue abierta», y para la comparación, la misma vista de ese PK en dos fechas (aunque sean de ejemplo). Ponderar el avance por longitud («Avance de la vía, ponderado por longitud: 60 %») o decir «promedio simple de tramos». Subir la nota de confiabilidad fuera del desplegable y dejarla en la unidad que se muestra.
- Gravedad: confunde
- Evidencia: navegador (Evolución, ficha de «Deterioro superficial», «Lectura completa») y lectura de código
- Huecos relacionados: H8

### I-10 «Firma inválida» y «huella digital»: lo entiendo en la pantalla, pero no sé qué garantiza ante un tercero
- Eje: texto
- Dónde: landing `landing-page.tsx:34-37` y «SHA-256 real»; `evidence-dialog.tsx` (aviso de «firma electrónica simple»); `integrity.ts:8-12` (la huella es del título más el texto de la plantilla); `templates.ts:48` («En Colombia no encontré una norma que exija esta carta…»).
- Lo que ve la persona: «Si alguien edita una cifra, la firma se marca inválida y queda registro». En el documento: «Modificado tras firmar», «Huella 9c4470d589acc3d7…». «Firma electrónica simple: sirve como prueba de consentimiento (Ley 527 de 1999, Decreto 2364 de 2012) pero puede ser controvertida. Para mayor respaldo se usaría una firma digital con certificado… no está incluida en la demo.» Y, en la nota de la plantilla, «no encontré una norma…».
- Qué entiende o hace mal: «Firma inválida» sí se entiende: «cambió el contenido, hay que volver a firmar». «Huella digital» como palabra no; lo entendería como «código de control del texto». Lo que no entiendo es qué compra: si yo calculo el SHA-256 del .txt exportado, no coincidirá (la huella es del título y el texto de la plantilla, no del archivo); la hora es la del equipo; mi nombre lo escribe cualquiera. La nota «no encontré una norma» está en primera persona y sin fuente: parece una opinión de quien programó.
- Por qué importa para su tarea: dependo de poder decir a un auditor qué prueba el documento y qué no.
- Propuesta: texto en la landing y en el encabezado del documento: «Huella digital: un código calculado con el contenido del documento. Si alguien cambia una letra, el código cambia y las firmas anteriores quedan sin validez. No es un sello de tiempo certificado ni una firma con certificado digital.» Reemplazar «no encontré» por una redacción impersonal con fuente a confirmar por el equipo legal («pendiente de validar con asesoría jurídica»). Aclarar cuál es el texto exacto que se huella y ofrecer verificar un archivo descargado contra su huella.
- Gravedad: confunde
- Evidencia: navegador (documento firmado y alterado) y lectura de código
- Huecos relacionados: H4, H7

### I-11 La primera pantalla es la agenda de prevuelo del piloto, no mi recorrido
- Eje: componente
- Dónde: `/programacion` (primer destino de «Abrir la demo»); `src/features/flights/planning/preparation-items.ts`.
- Lo que ve la persona: una franja «Sugerido por IA · ejemplo: Ninguna zona pide un vuelo adicional hoy», una agenda con un solo vuelo («29 OCT · Seguimiento programado»), un itinerario de 7 etapas y 16 ítems de prevuelo (tarjeta de memoria, firmware, brújula, briefing de seguridad). La lista dice «basada en prácticas públicas… confirma con la Aerocivil».
- Qué entiende o hace mal: me siento en la silla del operador. Lo que yo quiero (última visita, no conformidades abiertas, qué falta cerrar) está a dos clics.
- Por qué importa para su tarea: el diferencial para un interventor es «qué sigue abierto»; hoy aparece al final del recorrido.
- Propuesta: si entro como «Vía o carretera», que el aviso del primer minuto ofrezca un camino: «Vea la última visita y sus 3 no conformidades abiertas» con un enlace directo a Vuelos → No conformidades. No se pide pantalla nueva: es el destino del enlace.
- Gravedad: confunde
- Evidencia: navegador
- Huecos relacionados: H6

### I-12 Aparece el tuteo en pantallas clave del informe
- Eje: texto
- Dónde: `flight-report.tsx:167` («Selecciona qué observaciones quieres incluir»), `flight-review-view.tsx:541` («Puedes añadir una tarea local»), `document-view.tsx:219`, `billing-view.tsx:559`, `scheduling-view.tsx:176`.
- Lo que ve la persona: la landing me trata de usted; el informe y la tarea, de tú. «Tarea local» no se entiende («¿local respecto a qué?»).
- Qué entiende o hace mal: ruido; en un documento que entrego a una entidad desentona.
- Por qué importa para su tarea: el tono del informe es parte de su credibilidad.
- Propuesta: «Seleccione las no conformidades que quiere incluir en el borrador.» y «Puede registrar una tarea para pedir la verificación en sitio. En esta demo no se envía a nadie.».
- Gravedad: menor
- Evidencia: lectura de código y navegador
- Huecos relacionados: —

### I-13 Al recargar, la demo vuelve a Agricultura pero conserva medio vocabulario de vías
- Eje: componente
- Dónde: carga directa de `/mapa` tras haber elegido «Vía» (la selección del sitio vive en memoria; el vocabulario, en `localStorage`).
- Lo que ve la persona: título «Mapa y lotes», «Hacienda Santa Rita… Lote 3» con el menú lateral aún diciendo «Avance por tramos».
- Qué entiende o hace mal: me pareció un error, no un reinicio de la demo.
- Por qué importa para su tarea: si guardo una dirección o recargo, pierdo mi sector.
- Propuesta: guardar también el sitio elegido junto con el sector, o avisar «Reinició la demo; vuelva a elegir su sector».
- Gravedad: menor
- Evidencia: navegador
- Huecos relacionados: H4, H6

## 6. Lo que funciona y hay que conservar

- **El selector de sector y el aviso de entrada.** «Vía o carretera» → «Tramos», «No conformidad», «Informe», más el ejemplo «Drenaje obstruido». Es lo que más rápido me dice «esto es para mí».
- **La reacción inmediata a una cifra cambiada.** Al editar un documento firmado aparece de una vez «Modificado tras firmar», el recuadro rojo con el porqué y los firmantes marcados «sin validez». Explica mejor «firma inválida» que cualquier párrafo.
- **El aviso honesto de límites de la firma.** «Firma electrónica simple… puede ser controvertida… la hora es la del dispositivo y no es un sello de tiempo certificado» también viaja en el .txt y el PDF exportados, junto con la huella completa, las firmas y el historial. Un auditor lo agradece.
- **La separación de lo que dice el operador y lo que sugiere la IA**, con «Imagen ilustrativa», «ejemplos escritos a mano: no se ejecutó ningún modelo» y las «limitaciones» de cada sugerencia («No mide ancho ni profundidad…»). Es el tono que le pido a una herramienta.
- **«Tramo sur reportó observaciones en 5 vuelos distintos: conviene buscar la causa y no solo confirmarlas».** Es una frase accionable y creíble para mi trabajo.
- **La alerta de documentos vencidos** («Póliza del equipo: fecha vencida», con «Cargar un archivo… no acredita autorización ni cumplimiento») me da confianza en que no se infla lo que se sabe.

## 7. Huecos H1–H9 desde mi rol

- **H1 (qué es Otear):** me estorba. No sé si es software o un servicio, y tampoco si me venden vuelos.
- **H2 (cómo entran los vuelos):** me estorba mucho. En interventoría, quién sube las fotos y con qué cadena de custodia es lo primero que se pregunta.
- **H3 (precio):** me es indiferente en esta visita; no soy quien paga.
- **H4 (de quién son los datos, cómo se sale):** me estorba mucho. Un expediente de interventoría vive años; necesito saber dónde queda, quién lo ve y cómo lo exporto completo.
- **H5 (piloto):** me estorba algo: querría saber si podría probarlo con un tramo de mi contrato sin comprometer a la entidad.
- **H6 (primer minuto):** me estorba (I-11): empiezo en prevuelo.
- **H7 (real o simulado):** pesa mucho. Los avisos son buenos, pero hay contradicciones entre pantallas (I-08) y una evidencia que contradice el sector (I-02).
- **H8 (historia con números):** me estorba mucho. Falta un caso de interventoría con cifras de ejemplo: «3 no conformidades de drenaje abiertas hace 40 días en el PK 12+400; el contratista responde el día 15; se verifica el día 22; se cierra con foto». Hoy el hilo se corta en «Confirmado».
- **H9 (qué se mide):** me es indiferente.

## 8. Qué le preguntaría a una persona real como yo

1. Cuénteme de la última visita de inspección que documentó: ¿qué anotó, con qué evidencia, y dónde quedó guardado?
2. Cuénteme la última vez que un contratista discutió una no conformidad suya: ¿qué le pidió la otra parte para aceptarla y qué le faltó a usted para sostenerla?
3. Cuénteme la última vez que le tocó entregar un informe a la entidad o a un auditor: ¿quién lo firmó, cómo y con qué formato, y qué le devolvieron?

## 9. Límites

- Todo es una persona simulada; no hay datos de usuarios reales ni porcentajes.
- Recorrí la landing (escritorio y móvil), Programación, Vuelos (resumen, evidencias, no conformidades, informe), Mapa, Evolución, Informes, Documentos y Servicios con navegador sin interfaz. No recorrí Pagos, Equipos ni Configuración; el asistente de mapeo por PK lo leí en código, no lo ejecuté.
- WebGL y la simulación del vuelo no se probaron; no los evalué.
- «Firma electrónica» y las leyes que cita la demo: no verifiqué su alcance legal; lo pondría a revisión del asesor jurídico del proyecto.
- No verifiqué que «Entrega firmada» (acta) sea inalcanzable con interacción; lo concluí por el código (el diálogo solo se abre desde los ítems del prevuelo) y porque la tarjeta del itinerario no mostró acción.
- La demo toma el 25 de octubre de 2026 como fecha del escenario; hoy es 30, y el vuelo del 29 sigue «Programado». No lo conté como hallazgo.
- Después de editar un documento firmado en el navegador de prueba, el estado quedó modificado; no afecta al repositorio (solo memoria de la sesión).
