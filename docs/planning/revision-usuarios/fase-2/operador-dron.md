# Segunda pasada desde el rol: operador de dron profesional

Persona simulada, la misma de la primera fase (2 aeronaves, certificado; teme que la plataforma lo vigile o le recorte el pago). Todo lo de abajo son hipótesis de «yo, como esta persona», no resultados de usuarios. Datos sintéticos.

Evidencia: «navegador» = Chromium sin interfaz propio (CDP, puerto 9334) sobre `http://localhost:3210` (rama `revision-fase-2`, commit `f05d847`), entrando por el enlace «Abra la demo como operador» de la landing y cambiando entre «Ver como» operador (AeroVisión del Valle y Drones del Pacífico) y gestor. «Lectura de código» = leí el archivo y no lo vi ejecutarse. No edité nada del proyecto.

## 1. Recorrido de las siete tareas

| # | Tarea | Resultado esta vez |
|---|---|---|
| 1 | Ver mi pedido: ¿zonas y hectáreas por zona? | **Sí, en parte.** Ahora dice «Lote 3 · 14,1 ha / Lote 5 · 6,7 ha» y «Área pedida 20,8 ha»; en la vía, tramos con PK y km («PK 12+000 – 12+400 · 0,4 km», «Longitud pedida 6 tramos · 2,3 km»). Sigue sin polígono, sin KML, sin sensor/GSD/traslape ni quién abre el predio. «Ver en el mapa» me lleva al mapa completo del cliente, con el Lote 4 que no me pidieron y los hallazgos del cliente (navegador). |
| 2 | Programar y entregar un vuelo | **Sí.** Programé «Vigor del cultivo» (fecha, hora, piloto) y aparece en Programación con «Equipo asignado: DJI Mavic 3 Enterprise». Entregué 19 ha de 21,1 con archivos, 52 min, 410 fotos y nota. El panel se queda en mi pedido y dice «Entrega registrada el 25 de oct de 2026. Falta que Hacienda Santa Rita · Hernando Rojas (ejemplo) la verifique.» Si el vuelo está programado a futuro, avisa: «Si todavía no voló, vuelva y espere al día del vuelo.» |
| 3 | Facturar por lo cubierto | **Sí, y ahora veo la cifra.** En mi entrega: «Al precio cotizado ($ 51.500 por hectárea), 19 ha son $ 978.500. Esa es la cifra que se da por buena al aceptar la entrega.» En el formulario de factura: «6,4 ha × $ 30.000 por hectárea = $ 192.000». Si escribo más: «Usted declaró 6,4 ha al entregar. Si factura más, el cliente verá la diferencia marcada en Pagos (supera el 5 % que la demo tolera).» Facturé 7 ha y Pagos marcó «Facturó 0,6 ha más de las cubiertas (+9,4 %). Pida la justificación antes de pagar.» Pero no tuve dónde justificar (O2-02). |
| 4 | Disputa «Seguimiento del Lote 4» (Drones del Pacífico) | **Sí, las tres vías funcionan.** Detalle en la sección 3. |
| 5 | ¿Veo precios o «La más económica» de la competencia? | **No los veo.** Detalle en O-05. |
| 6 | Flota y baterías | **Sí, suma horas.** Mavic 3E · A pasó de 201 h a 202 h (52 min) y «Camilo Torres» de 2,1 h · 5 vuelos a 3 h · 6 vuelos; las horas de las piezas (motores, cámara) subieron de 41 a 42 h. Los ciclos de batería no cambiaron (93 de 200): la entrega de Servicios no pregunta baterías. |
| 7 | ¿Socio o auditado? | **Más socio en Servicios, igual auditado en Pagos e Informes.** Veredicto abajo. |

## 2. Estado de O-01 a O-14

| ID | Estado | Una línea de por qué |
|---|---|---|
| O-01 Lo que «me aprueban» | **Mejorado** | Ya hay cifra en pesos antes de aceptar (19 ha = $ 978.500) y en la factura (ha × tarifa). Falta una sola voz sobre la tolerancia: Servicios dice «por definir», pero el formulario dice «el 5 % que la demo tolera» y Pagos dice «La tolerancia es de 5 %.» como hecho (O2-04). El cliente sigue sin poder aprobar una cifra distinta de la mía; solo acepta o pide ajuste con texto libre. |
| O-02 El pedido sin zona exacta | **Mejorado** | Hectáreas por zona y, en vías, km por tramo con PK. La landing ya no promete «la zona exacta»: dice «las zonas, la ventana de fechas y el tope de precio». No hay polígono ni KML en el pedido, ni sensor, GSD, traslape ni acceso al predio. El enlace «Ver en el mapa» abre el mapa entero del cliente, sin resaltar mis lotes. |
| O-03 No puedo contestar una disputa | **Resuelto** | «Responder al cliente»: aceptar el ajuste (con hectáreas nuevas y el valor en pesos en vivo) o sostener lo entregado (nota obligatoria, soportes opcionales). Lo ve quien contrata, queda en la historia, y se puede disputar de nuevo (segunda ronda probada). Quedan detalles (O2-08). |
| O-04 De quién son mis datos | **Mejorado** | La landing ahora lo nombra: «Por definir con usted: De quién son los datos de sus vuelos y qué pasa con ellos si deja de trabajar con un cliente.» En la app, Equipos sigue titulado «Las aeronaves de Hacienda Santa Rita», con compra $ 24.500.000, costo por hora y «Pilotos de la flota» (incluso «Piloto de Drones del Pacífico (ejemplo)»), sin ninguna frase sobre quién ve qué. |
| O-05 Veo la cotización de mi competidor | **Resuelto** | Como operador solo veo «Su cotización» y «Se han recibido 2 cotizaciones, incluida la suya. Usted verá el resultado cuando el cliente decida.» Sin «La más económica», sin lectura de IA, sin motivo de elección («El operador no lo ve.»). Al perder: «El cliente asignó el servicio a otro operador. Su cotización queda guardada.», estado «No fue seleccionada» (ya no «No puede»), «Asignado a: Otro operador». Solo se filtra por un aviso (O2-07). |
| O-06 «Entregar» es escribir nombres | **Mejorado** | El texto ahora es honesto: «En esta demo solo se anotan los nombres: no se sube ni se guarda ningún archivo. Cómo llegan los archivos (carga directa o un enlace a su almacenamiento) está por definir.» Y lo repite quien verifica: «no hay archivos que abrir ni descargar». Sigue sin campo de enlace de descarga. |
| O-07 Lo que programo no mueve mi flota | **Mejorado** | «Programar un vuelo» trae una lista «Aeronave de su flota» y dice «Al completarse el vuelo, sus horas suman a Mavic 3E · A en Equipos». Desde Servicios la aeronave se asigna sola (la que el operador más voló) y las horas sí suben; las baterías no. Detalle en O2-05. |
| O-08 Me siento auditado | **Igual** | Pagos sigue titulado «Facturas del operador», con «Registrar pago» a la vista siendo yo operador, «Póliza del equipo: vencido» y «Falta la firma…» en la lista del cliente. Informes sigue con «8 confirmados · 2 descartados · 3 por revisar» junto a mi nombre y «1 factura con más área de la cubierta». El nombre abajo a la izquierda sigue diciendo «Luis Rojas · Administrador · ejemplo». No hay vista propia (esperable: no se construye pantalla nueva), ni siquiera el texto cambia con «Ver como». |
| O-09 Servicios y Pagos no cuadran en dinero | **Resuelto** | FV-2026-034 ahora vale $ 837.000 = 27,9 ha × $ 30.000 y Pagos dice «El total de la factura ($ 837.000) coincide con las hectáreas facturadas por el precio cotizado.» Servicios y Pagos usan la misma tarifa. |
| O-10 Servicios me habla como comprador y salta de pedido | **Mejorado** | Textos por rol («Su cotización está enviada. El cliente decide después de comparar las cotizaciones.», «Le toca volar y registrar la entrega.»); el panel se queda en el pedido tras actuar y la entrega queda confirmada. Quedan dos restos: el título «Le toca a usted» sale también cuando no me toca (pedido con mi cotización enviada) y un formulario del otro rol queda abierto al cambiar «Ver como» (O2-06). |
| O-11 Puedo facturar de más sin aviso | **Mejorado** | Aviso en vivo bajo el campo y aviso de fecha en la entrega. Pero dice «Puede facturar así si hay una razón; explíquela al cliente» y el formulario no tiene dónde explicarla (O2-02); tampoco avisa si facturo más que el área pedida (9 ha sobre un pedido de 7,1). |
| O-12 La landing habla al comprador | **Resuelto** | El hero dice «Otear no hace los vuelos. Los hace su operador de dron… y es él quien los entrega». Bajo el selector: «¿Opera drones para otras empresas? Abra la demo como operador.» (me dejó en Servicios con «Ver como» ya en AeroVisión y un aviso de bienvenida). La tarjeta del operador cambió a «Usted sigue volando. Otear ordena el pedido y la cuenta.», con «Las hectáreas que usted declara… Otear no las mide con las imágenes» y «Por definir con usted: costo para operadores; de quién son los datos». Detalle menor: el enlace del selector se parte en dos renglones. |
| O-13 La lista y los documentos: mucho formato | **Mejorado** | El contador dice «3 de 16 ítems · 2 marcados sin documento» y una nota aclara: «Marcar un ítem sin documento es válido en esta demo; qué documentos pide cada cliente lo decide usted.» No volví a abrir el análisis de riesgos en blanco ni «Adjuntar un archivo». |
| O-14 Palabras sueltas | **Igual** (tuteo mejorado) | Casi todo el tuteo pasó a «usted» («¿Qué necesita revisar?»). Quedan «Buscar en tus vuelos» (`app-shell.tsx:318`) y «Haz clic para añadir un punto» (`site-map-canvas.tsx:377`). El aviso de Equipos que importa no cambió: «Inspección periódica completa: vencida (faltan 158 h · pasó por 0,5 meses).» |

Conteo: **resueltos 4** (O-03, O-05, O-09, O-12), **mejorados 8** (O-01, O-02, O-04, O-06, O-07, O-10, O-11, O-13), **iguales 2** (O-08, O-14), **empeorados 0**.

## 3. La disputa, de las tres maneras (tarea 4)

Entré como «Operador · Drones del Pacífico (ejemplo)» a «Seguimiento del Lote 4» (en disputa; el cliente escribió «cuento unas 0,6 ha menos de las declaradas. Pido facturar solo lo cubierto.»). Botones: «Responder al cliente» y «Corregir y volver a entregar». Evidencia: navegador.

- **Sin elegir nada y Confirmar:** error «Elija cómo responde: aceptar el ajuste o sostener lo entregado.»
- **Sostener lo entregado con la nota vacía:** el rótulo cambia a «Su nota para el cliente (obligatoria)» y al confirmar sale «Explique por qué sostiene lo entregado para que el cliente lo pueda revisar.» No avanza.
- **Sostener con nota y soportes** («La franja norte sí se voló: ver el registro de vuelo…», «Registro de vuelo (CSV), Captura de la ruta (PNG)»): paso a «Entregado», yo veo «Su respuesta quedó enviada… Falta que Ingenio Dulce Valle (ejemplo) verifique de nuevo la entrega.» El gestor ve «Drones del Pacífico (ejemplo) respondió a su reclamo. Léalo y verifique de nuevo», con mi respuesta y los soportes, y en la historia mi nota. Quien contrata no pierde nada; yo tampoco.
- **Segunda ronda:** el gestor volvió a pedir ajuste («pido ver el ortomosaico de nuevo antes de aceptar»); volví a ver «Responder al cliente» y la historia conserva las dos rondas.
- **Aceptar el ajuste:** el campo «Hectáreas que acepta dejar como cubiertas» empieza vacío («Declaró 7 ha; la cifra nueva debe ser menor.»). Con 7,5 dice «El ajuste debe ser menor que lo declarado (7 ha)…»; con 0, «Escriba las hectáreas que acepta dejar.»; con 6,4 muestra «6,4 ha son $ 192.000 en vez de $ 210.000». Al confirmar, mi declaración baja a 6,4 ha y el gestor lo ve: «Aceptó el ajuste… pasan de 7 ha a 6,4 ha, y esa es la cifra que puede facturar.»
- **Después:** el gestor aceptó, yo facturé (formulario precargado con 6,4 ha) y la factura apareció en Pagos como FV-2026-126.

## 4. Hallazgos nuevos (O2-)

### O2-01 «Ver el informe y el acta del vuelo» me lleva a otro vuelo
- Eje: componente
- Dónde: `/servicios` (detalle del pedido, bloque «Registros relacionados») · `src/features/services/request-detail.tsx:652-660`
- Lo que ve la persona: en «Vigor del cultivo» (entregado) y en «Seguimiento del mes» (facturado) pulso «Ver el informe y el acta del vuelo» y llego a `/vuelos/?tab=informe` con el vuelo «Seguimiento programado · 29 de oct de 2026» («Un vuelo sin entrega no tiene informe que firmar»), no con el vuelo del pedido. En Pagos, «Ver vuelo: Inspección de labores» sí abre el vuelo correcto, y elegir «Vigor del cultivo» a mano en la lista de Vuelos también funciona.
- Qué entiende o hace mal: creo que la plataforma perdió mi entrega, o que el informe firmable de mi vuelo no existe. Para firmar el informe del vuelo (lo nuevo) tendría que adivinar que debo buscar el vuelo a mano.
- Por qué importa para su tarea: es el único camino que me da Servicios hacia el informe y el acta que firmo como operador.
- Propuesta: que el enlace abra el vuelo de ese pedido (el código llama `selectFlight(request.flightId)`; algo en el camino hacia `/vuelos?tab=informe` lo está devolviendo al primer vuelo). Comprobar contra el enlace de Pagos, que funciona. Si no se resuelve ya, que el enlace diga el nombre del vuelo.
- Gravedad: confunde
- Evidencia: navegador (dos pedidos distintos, mismo resultado; contraste con Pagos). La causa es mía por hipótesis, no la encontré.
- Huecos relacionados: H7

### O2-02 Me dicen «explíquela al cliente» y no hay dónde explicar
- Eje: componente
- Dónde: `/servicios` (formulario «Facturar») · `src/features/services/action-form.tsx:480-510`; `/pagos` (verificación del área)
- Lo que ve la persona: al escribir más hectáreas que las declaradas: «Si factura más, el cliente verá la diferencia marcada en Pagos… Puede facturar así si hay una razón; explíquela al cliente.» El formulario solo tiene el campo «Hectáreas que va a facturar». En Pagos, mi factura queda con «Facturó de más… Pida la justificación antes de pagar.» y yo no tengo canal para dársela.
- Qué entiende o hace mal: la plataforma me invita a justificarme y me deja sin voz, justo en el punto que más temo: la marca roja pública sin mi explicación. Además puedo escribir 9 ha sobre un pedido de 7,1 y el aviso solo habla de lo que declaré, no de lo pedido.
- Por qué importa para su tarea: es la tarea 3 («facturar y poder discutirlo»); la disputa ya me da voz antes de aceptar, pero no después de facturar.
- Propuesta: un campo «Nota para el cliente (opcional)» en el formulario, que quede en la historia y se vea en la verificación del área de Pagos como «Nota del operador: …». Y una línea cuando lo facturado supera el área pedida: «Usted pidió 7,1 ha; esta factura es por 9 ha.» (cifras de ejemplo).
- Gravedad: confunde
- Evidencia: navegador (billing 6,6 / 7,0 / 9 ha en el formulario; Pagos FV-2026-126) + lectura de código
- Huecos relacionados: H7

### O2-03 Mis hectáreas cubiertas salen en 0 en Informes y mi nota original queda desmentida
- Eje: caso-de-uso
- Dónde: `/informes` (tabla «Operadores») · `src/features/reports/reports-view.tsx` (tabla de operadores) y `/servicios` (bloque «Entrega del…») tras aceptar un ajuste
- Lo que ve la persona: en la fila de Drones del Pacífico, tras entregar 6,4 ha y facturar 7: «Hectáreas facturadas / cubiertas: 7 / 0 ha · De 1 de 1 factura». En la misma factura, Pagos sí dice «Cubierto 6,4 ha». Y en el pedido, después de aceptar el ajuste, la entrega dice «dice haber cubierto 6,4 ha de las 7,1 ha pedidas. Recorrido completo según el registro de vuelo.»: la nota original («recorrido completo») ya no coincide con la cifra nueva.
- Qué entiende o hace mal: Informes me muestra como alguien que cobró 7 ha y cubrió 0, cuando hay una entrega aceptada de 6,4. Eso es lo peor que puede ver un cliente de mí, y es un error de la herramienta, no mío. La nota vieja dentro de la entrega ajustada hace que mi propio texto me contradiga.
- Por qué importa para su tarea: es la cifra con que me medirán; si cada pantalla toma la hectárea de un sitio distinto, no puedo defenderla.
- Propuesta: que la tabla de operadores use la misma regla que Pagos (el registro del vuelo o, si no hay vuelo, la entrega: `coveredHaFor`). Y al aceptar un ajuste, que la nota de la entrega original quede marcada como «Nota de la entrega original» o se reemplace por la nota de la respuesta.
- Gravedad: confunde
- Evidencia: navegador (Informes › Informe/Costos tabla Operadores; Pagos FV-2026-126; Servicios tras el ajuste). El pedido sembrado en disputa no tiene vuelo asociado (el formulario de factura lo avisa), lo que probablemente dispara el 0.
- Huecos relacionados: H7, H8

### O2-04 La tolerancia aparece de tres maneras
- Eje: texto
- Dónde: `src/features/services/request-detail.tsx` (bloque «Entrega»); `src/features/services/action-form.tsx` (aviso al facturar); `src/features/billing/area-check-card.tsx`; landing (tarjeta de agricultura)
- Lo que ve la persona: Servicios: «Si se factura más, Pagos lo marca cuando la diferencia pasa de 5 %; esa tolerancia aún no se acuerda en el pedido (por definir).» Factura: «supera el 5 % que la demo tolera». Pagos: «La tolerancia es de 5 %.» Landing: «La tolerancia de la demo es de 5 %.»
- Qué entiende o hace mal: la primera frase es honesta y las otras dos dan el 5 % como regla. Mi miedo a un recorte por una tolerancia que nadie pactó sigue vivo en Pagos, que es lo que lee el cliente cuando decide si me paga.
- Por qué importa para su tarea: confirma O-01: la cifra que me aprueban tiene un margen que cambia según la pantalla.
- Propuesta: usar en Pagos la misma redacción: «Margen de la demo: 5 % (por definir con cada servicio).»
- Gravedad: menor
- Evidencia: navegador (tres pantallas) + lectura de código
- Huecos relacionados: H3, H7

### O2-05 Servicios elige mi aeronave por mí, no pregunta baterías, y mi entrega deja «0 km» y «sin bitácora»
- Eje: componente
- Dónde: `src/features/services/use-services.ts:101-122` y `src/features/services/links.ts:20-41`; `/informes` (Historial)
- Lo que ve la persona: programé desde Servicios sin elegir equipo y el vuelo quedó con «DJI Mavic 3 Enterprise» (la que más he volado). Al entregar, las horas del Mavic subieron, los ciclos de batería no. En Informes, mi vuelo aparece «52 min · 0 km · 410 fotos · 0 hallazgos» y «Este vuelo no tiene bitácora. Regístrela desde Programación.»
- Qué entiende o hace mal: si ese día volé la Matrice, la plataforma le suma horas a la aeronave equivocada y no sé cómo corregirlo desde Servicios. Y me dice que llene una bitácora que ya cubrí al entregar.
- Por qué importa para su tarea: el mantenimiento es lo que sé y valoro (tarea 6); una hora sumada a la aeronave equivocada adelanta o atrasa inspecciones que sí importan.
- Propuesta: en el formulario de entrega, una lista «¿Con qué aeronave voló?» (precargada con la sugerida) y «Baterías usadas» desde Equipos. Y que el aviso de Informes diga «Entregado desde Servicios; la bitácora detallada (clima, baterías) es opcional».
- Gravedad: menor
- Evidencia: navegador (Programación › Equipo asignado; Equipos antes/después; Informes) + lectura de código
- Huecos relacionados: H2

### O2-06 Un formulario del otro rol queda abierto al cambiar «Ver como»
- Eje: componente
- Dónde: `/servicios` · `src/features/services/request-detail.tsx` (estado `openAction`)
- Lo que ve la persona: con el formulario «¿Qué decide? Aceptar la entrega / Pedir un ajuste» abierto como gestor, cambié «Ver como» a operador y la pantalla me muestra ese mismo formulario bajo «Estado actual: Entrega registrada… Falta que… la verifique», incluido «Aceptar la entrega da por buena esa cifra». Pulsar «Confirmar» no hace nada visible.
- Qué entiende o hace mal: veo un botón de decisión que no es mío y que no responde.
- Por qué importa para su tarea: es un artefacto de la demo, pero es lo que usa quien presenta Otear para explicar «quien vuela / quien verifica».
- Propuesta: cerrar el formulario abierto cuando cambia el papel.
- Gravedad: menor
- Evidencia: navegador
- Huecos relacionados: H7

### O2-07 Al perder, un aviso me dice quién ganó
- Eje: texto
- Dónde: `/servicios` (aviso inferior) · `src/features/demo/demo-context.tsx` (`notice`)
- Lo que ve la persona: después de que el gestor asignó a AeroVisión, al ver como Drones del Pacífico (quien perdió), el aviso al pie sigue diciendo «Servicio asignado a AeroVisión del Valle.», mientras el pedido dice «Asignado a: Otro operador».
- Qué entiende o hace mal: se filtra justo lo que el resto de la pantalla oculta.
- Por qué importa para su tarea: conserva la sensación de subasta que corregimos en O-05.
- Propuesta: limpiar el aviso al cambiar «Ver como», o redactarlo sin nombre propio.
- Gravedad: menor
- Evidencia: navegador
- Huecos relacionados: H4

### O2-08 La disputa no tiene salida y el ajuste no parte de lo que pidió el cliente
- Eje: caso-de-uso
- Dónde: `src/features/services/workflow.ts:105-133`, `:514-610`; `src/features/services/action-form.tsx` (respuesta)
- Lo que ve la persona: el cliente puede pedir ajuste una y otra vez (probé dos rondas) y yo solo respondo; no hay un cierre ni un «dar por cerrada la disputa». En la segunda ronda su reclamo no traía cifra («pido ver el ortomosaico de nuevo») y aun así la única forma de aceptar es bajar mis hectáreas. El campo de hectáreas empieza vacío: debo calcular yo que «0,6 ha menos» de 7 son 6,4.
- Qué entiende o hace mal: puedo estar aceptando un descuento por un reclamo que no lo pedía, o quedar en un vaivén sin fin.
- Por qué importa para su tarea: la tarea 4 pedía poder discutir; ahora puedo, pero no cerrar.
- Propuesta: precargar el campo con «declaradas menos lo que pide el cliente» solo si el cliente escribió una cifra; si no, dejarlo vacío con «El cliente no indicó hectáreas». Un tope de rondas o un «Pedir revisión» solo se menciona como pregunta al dueño del proyecto.
- Gravedad: menor
- Evidencia: navegador (dos rondas) + lectura de código
- Huecos relacionados: H7

Menores sueltos (no cuento como hallazgos): en la vía, el pedido sigue rotulado «Monitoreo del cultivo» (también «Seguimiento programado del 29 de octubre» con «tramos»); «Su turno» y «Le toca a usted» se usan también cuando solo espero al cliente; la lista de la izquierda del pedido se llama «Solicitudes» y mi propia cotización dice «Elegida»/«Vigente», correcto.

## 5. Lo que funciona y hay que conservar

1. **La cifra en pesos antes de aceptar.** «19 ha son $ 978.500. Esa es la cifra que se da por buena al aceptar la entrega.» y «6,4 ha × $ 30.000 = $ 192.000». Mantenerlo en las dos pantallas y en los dos roles.
2. **Mi cotización no se mezcla con la ajena.** «Se han recibido 2 cotizaciones, incluida la suya», «No fue seleccionada», «El operador no lo ve» junto al motivo de la elección. No devolver ni la insignia ni la lectura de IA al operador.
3. **Responder al cliente con las tres salidas.** Nota obligatoria solo cuando hace falta, error claro, valor en pesos en vivo al ajustar. Es lo que me convierte en parte, no en acusado.
4. **«Abra la demo como operador».** Entra con «Ver como» ya puesto y dice en el aviso qué voy a ver.
5. **La honestidad sobre la cobertura y sobre los archivos.** «Esta es una cifra declarada por el operador; Otear no la mide con las imágenes.» y «solo se anotan los nombres». No cambiarla por «verificado».
6. **Equipos y su plan de mantenimiento** (conservar tal cual; ahora además suma mis horas).

## 6. Huecos H1–H9 desde este rol, ahora

- **H1 (qué es Otear): resuelto para mí.** El hero y la tarjeta del operador dicen que Otear no vuela ni me reemplaza.
- **H2 (cómo entran mis vuelos): mejorado.** Lo dice el formulario («por definir»); falta saber si habrá enlace o carga.
- **H3 (precio y cobro): mejorado.** «Costo para operadores: por definir» está a la vista; sigue sin responderse.
- **H4 (de quién son los datos): mejorado en la landing, igual en la app** (O-04, O-08).
- **H5 (qué sería un piloto): indiferente hoy.**
- **H6 (primer minuto): resuelto para este rol**, por el enlace «como operador».
- **H7 (real vs simulado): mejorado.** «Cifras de ejemplo», «no se envía nada fuera de la demo»; quedan los fallos de coherencia de O2-01, O2-03 y O2-04.
- **H8 (historia con números): resuelto** (O-09), salvo O2-03.
- **H9: indiferente.**

## 7. Veredicto: ¿me conviene o me perjudica?

**Me conviene más que antes, pero todavía no me puedo confiar.** Ahora hay una cifra que me aprueban, puedo contestar una disputa de tres maneras, no veo el precio ni la etiqueta de mi competidor, mi aeronave suma horas y la landing me habla a mí. Lo que me frena: (1) Pagos e Informes siguen escritos desde el cliente contra mí y, por un cálculo distinto, Informes puede mostrarme «7 / 0 ha» cuando yo entregué 6,4 (O2-03); (2) la marca de «facturó de más» queda sin que yo pueda explicarme (O2-02); (3) mi flota y mis costos siguen dentro del proyecto del cliente sin una frase de quién ve qué (O-04). Lo recomendaría a un colega si esas tres cosas se arreglan o se dicen «por definir» donde las lee el cliente.

## 8. Qué le preguntaría a una persona real como yo (sobre su pasado)

1. La última vez que un cliente le discutió las hectáreas de un trabajo: ¿qué documento o cifra usó cada uno, cuánto tardaron en ponerse de acuerdo y qué le quedó de más o de menos en la factura?
2. La última vez que una factura suya se quedó sin pagar por una diferencia pequeña de área: ¿quién dio la explicación, por qué medio y cuánto demoró el pago?
3. Cuando entrega horas de vuelo a un cliente: ¿en qué registro anota qué aeronave y qué baterías usó, y quién más ve ese registro?

## 9. Límites

- No probé carga de archivos reales; en la demo solo se anotan nombres.
- Solo recorrí a fondo el escenario de agricultura; en la vía miré el pedido del operador (PK y km) sin entregar ni facturar.
- No vi móvil en esta pasada.
- No abrí el análisis de riesgos ni «Adjuntar un archivo» de nuevo; el estado de O-13 lo infiero del contador y de la nota de la lista.
- La demo se recargó sola dos veces durante las pruebas (perdí el estado en memoria y repetí el recorrido); no lo atribuyo a la aplicación.
- No encontré la causa de O2-01; solo comprobé que Pagos funciona y Servicios no.
- WebGL no disponible: no vi el dron 3D ni la simulación.
- La fecha del escenario es el 25 de oct de 2026.
- No se resolvió ni propongo la política de fotos sin GPS ni «G6»; la matriz de Dorfman sigue provisional.
