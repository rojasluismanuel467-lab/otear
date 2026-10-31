# Segunda pasada desde el rol: jefe de operación de un ingenio (gerente)

Estado: hipótesis de una persona simulada, no resultados de usuarios reales. Segunda pasada hecha el 30 de octubre de 2026 sobre `http://localhost:3210` (rama `revision-fase-2`; Chromium sin interfaz, puerto CDP 9333, «Ver como» → Gestor · Ingenio Dulce Valle, también como operador para completar los pasos de la otra parte). Todas las cifras son de la demo (datos sintéticos). Comparo con el informe anterior (`../gerente-ingenio.md`, G-01..G-14). Evidencia: «navegador» = lo vi y lo probé en pantalla; «lectura de código» = cito la causa en el código.

## 1. Tareas repetidas

| Tarea | Resultado | Por qué |
|---|---|---|
| 1. Decidir a qué zona mandar el próximo vuelo | **Sí.** | El titular ahora dice «Lote 4 pide un vuelo pronto… Lote 3 y Lote 5 ya están en el vuelo del 29 de oct». El diálogo trae la tabla «Puntos por zona» (Lote 4 · 70, Lote 3 · 40, Lote 5 · 30, con «Lo que más pesó» y «Estado») y la línea «Podría sumar Lote 4 a ese vuelo y ahorrar un viaje». Sigue sin llevarme a pedir cotizaciones: «Preparar este vuelo» abre el formulario de vuelo con piloto y operador «de un vuelo anterior» y el propio diálogo dice que para pedirlo a un operador use Servicios (G-04). |
| 2. Crear solicitud, comparar dos cotizaciones, asignar con motivo | **Sí**, con un tropiezo (G2-03). | Creé «Seguimiento Lote 4 por baja de vigor» (Lote 4, 7,1 ha, tope $ 37.500 con el botón «Usar $ 37.500»). Cotizé como los dos operadores ($ 36.000 y $ 34.500). «Lectura de las cotizaciones» comparó bien. «Asignar» abre un panel de confirmación («Asignar a AeroVisión del Valle: $ 36.000 por hectárea, $ 255.427 en total sobre 7,1 ha (de ejemplo)… las demás quedan guardadas… como "No fue seleccionada"») con «Motivo de la elección (opcional)». Escribí el motivo, confirmé, y el detalle muestra «Motivo de la elección», la tabla con «Elegida / No fue seleccionada» y los dos precios, y la historia. |
| 3. «Mapeo de la última zona»: verificar y facturar | **Sí.** | Verificar muestra «El operador declaró 5,9 ha de las 6,7 ha pedidas (88 %). A $ 61.500 por hectárea, son $ 362.850» y ya no trae «Aceptar» marcado. Acepté; como operador, «Facturar» propone 5,9 ha × $ 61.500 = $ 362.850 y crea la factura (aparece en Pagos con «Verificación del área: Coincide»). El error «Falta la cotización o el vuelo» desapareció. |
| 4. Solicitud en disputa («Seguimiento del Lote 4», Drones del Pacífico) | **Sí.** | Probé los tres caminos. Como operador, «Responder al cliente» → «Sostener lo entregado» con nota y archivos de soporte: yo, como gestor, vi «Respuesta de Drones del Pacífico… Archivos de soporte anotados» y «Verificar de nuevo». Volví a pedir ajuste («facturar 6,5 ha»); el operador eligió «Aceptar el ajuste» (el formulario valida: con 7,5 ha respondió «El ajuste debe ser menor que lo declarado (7 ha)»), la entrega quedó en 6,5 ha, la verifiqué y se facturó 6,5 ha × $ 30.000 = $ 195.000. Todo queda en la historia. |
| 5. Pagado frente a cubierto por operador | **Con ayuda.** | Informes → Costos → «Operadores» ya usa una sola base por fila para AeroVisión («$ 29.436 por ha, de 5 de 6 facturas con área», «111,7 / 109,4 ha», «1 factura con más área de la cubierta»). Y las tarifas ya son del mismo orden que Servicios ($ 28.500–$ 30.000 por ha en las facturas, $ 30.000 de referencia). Pero en cuanto se factura un servicio sin vuelo, la fila de Drones del Pacífico dice «12,4 / 5,9 ha · De 2 de 2 facturas» y nada avisa (G2-02). |
| 6. Informe consolidado para la junta | **Con ayuda.** | Ahora sí trae «Servicios contratados y decisiones» (qué se pidió, cotizaciones, la elegida con su motivo, entrega, verificación, respuesta del operador a la disputa, factura), «Propuestas de IA aprobadas por una persona», «Hectáreas por operador» y «Seguimiento de medidas correctivas». Pero por defecto el periodo termina el 24 de oct (último vuelo) y **deja fuera la solicitud que acabo de decidir**; hay que mover «Hasta» a mano (G2-01). Los totales de «Costos» no cuadran con Pagos (G2-02). |

## 2. Prueba de 5 segundos y primer minuto (solo lo que cambió)

- Hero: «La plataforma para comparar los vuelos de dron de su operación» y, debajo, «Otear no hace los vuelos. Los hace su operador de dron… Otear es donde usted los reúne, los verifica y los compara». Como gerente entiendo ahora que es un programa y no un prestador, y que «antes de pagar, contraste lo pedido, lo que el operador dice haber cubierto y lo que facturó» es mi parte. Las franjas dicen «Sin registro · Datos de ejemplo: nada es real · Los mapas necesitan internet · En validación: aún sin piloto». Haría clic en «Abrir la demo».
- Elegí «Finca o cultivo» → «Abrir la demo de ejemplo» y caí en Evolución (la pantalla que, según la landing, responde la pregunta principal del sector), no en Programación. Sigo viendo «Luis Rojas · Administrador · ejemplo» en la barra lateral; «Ver como» sigue solo dentro de Servicios, pero ahora esa pantalla explica los tres papeles en «¿Qué hace cada papel?».

## 3. Estado de G-01..G-14

| ID | Estado | Una línea de por qué |
|---|---|---|
| G-01 Último paso del servicio contratado no se podía completar | **Resuelto** | Verifiqué y facturé «Mapeo de la última zona» (hay vuelo y factura en Pagos). Además, un servicio sin vuelo se factura con las hectáreas de la entrega y avisa «Este servicio no tiene un vuelo asociado» (navegador). Deja otro hueco: G2-02. |
| G-02 «Pagado vs cubierto por operador» no se podía leer | **Mejorado** | Una base por fila, «por ha» con su definición («de 5 de 6 facturas con área») y tarifas del mismo orden que Servicios; la tarjeta de Pagos ahora dice «Son unos $ 45.000 de más». Pero con un servicio sin vuelo vuelve a mezclar bases (G2-02) y siguen dos «por ha» ($ 36.039 y $ 29.436), aunque ahora el primero dice «No es la tarifa de Servicios». |
| G-03 Informe para la junta no recoge lo decidido | **Mejorado** | Recoge solicitud, cotizaciones, elegida, motivo, entrega, verificación, disputa y factura; también medidas correctivas y propuestas de IA aprobadas. Pero la decisión más nueva queda fuera por el periodo (G2-01), es de un solo sitio («saque uno por cada uno») y las hectáreas por operador mezclan bases (G2-02). |
| G-04 Decisión del asistente no pasa a Servicios | **Mejorado** | Ahora propone sumar el Lote 4 al vuelo del 29 de oct y dice con honestidad que para pedirlo a un operador se use Servicios. No existe «Pedir cotizaciones para esta zona»: vuelvo a escribir el Lote 4 a mano y «Preparar este vuelo» sigue precargando piloto y operador de un vuelo anterior. |
| G-05 Servicios no deja claro quién hace qué ni quién paga | **Mejorado** | Cada solicitud trae «Pide: … · Paga: por definir · Vuela: …» y «¿Qué hace cada papel?» (dice que el propietario puede hacer lo mismo que el gestor y que quién paga está por definir). Falta unificar: Configuración todavía define «Gestor» como quien «paga el servicio». |
| G-06 «Se cubrió de verdad» promete más de lo que hace | **Resuelto** | El hero ahora dice «lo que el operador dice haber cubierto»; la landing repite «Otear todavía no las mide con las imágenes» y la tarjeta de Pagos conserva su aviso. |
| G-07 Asignar sin confirmar; «No puede» sin precio | **Resuelto** | Hay panel de confirmación con total y «Motivo de la elección»; la no elegida queda «No fue seleccionada» con su precio y fecha; al verificar se ve «declaró 5,9 de 6,7 ha (88 %)» y «Aceptar» ya no viene marcado. |
| G-08 Cifras que no cuadran al dividir a mano | **Mejorado** | Los vuelos ya no repiten 433 fotos ni los mismos kilómetros; «por revisar» coincide entre asistente (3 + 2 sugerencias), Pagos (3) e informe («16 (13 revisados, 3 por revisar). Se excluyen 2 sugerencias»). Siguen 21,1 ha × $ 51.500 ≠ $ 1.089.041 y «94,7 %» para 26,4 de 27,9 ha (da 94,6 %). |
| G-09 El asistente no deja comparar zonas con números | **Resuelto** | Tabla «Zona · Puntos · Lo que más pesó · Estado», titular con las tres zonas, «vigor (medida de 0 a 1)» y las zonas ya agendadas marcadas «Ya en el vuelo del 29 de oct». |
| G-10 No se ve el trabajo de un ingenio con muchos cañicultores | **Igual** | Sigue una sola hacienda con tres lotes. Lo que cambió es que el informe lo dice («Es de Hacienda Santa Rita; si trabaja con varios sitios, saque uno por cada uno»); la escala no se puede juzgar. |
| G-11 Vocabulario por empresa a medias; «Aplicador» | **Igual** | Con la plantilla de caña, el menú dice «Mapa y suertes», pero las zonas siguen «Lote 3/4/5» y el operador sigue «Aplicador». Aparece una frase mal concordada: «los suertes dibujados» (G2-07). |
| G-12 «Licencia» habla al vendedor; sin precio ni piloto | **Resuelto** | Reescrita: «Cuántos planes habrá, qué incluye cada uno y cuánto cuestan está por definir y se acuerda con usted»; la landing dice «Precio y forma de cobro: por definir» y lo mismo de datos. |
| G-13 La landing no cuenta el caso con números | **Resuelto** | La landing ya trae la escena 27,9 pedidas / 26,4 declaradas / 27,9 facturadas (`landing-page.tsx:48-53`). |
| G-14 Detalles de texto y avisos | **Mejorado** | Arreglados: el tuteo del formulario de vuelo («¿Qué necesita revisar?», «Añada puntos…»). Siguen: «Solicitud enviada a los operadores invitados.» (`use-services.ts:73`), «Haz clic para añadir un punto», «Arrastra para girar», «Buscar en tus vuelos», fechas ISO («Seguimiento programado (2026-10-29)», «El acta de entrega del 2026-10-24»), y la tarjeta «¿Esto, con sus datos?» aparece mientras cotizo. |

Conteo: **resueltos 6** (G-01, G-06, G-07, G-09, G-12, G-13), **mejorados 6** (G-02, G-03, G-04, G-05, G-08, G-14), **iguales 2** (G-10, G-11), **empeorados 0**.

## 4. Hallazgos nuevos

### G2-01 El informe para la junta deja fuera la decisión que acabo de tomar
- Eje: componente
- Dónde: `/informes` pestaña «Informe»; `src/features/reports/reports-view.tsx:114-117` (`to: to || dates[dates.length - 1]`, donde `dates` son fechas de vuelos) y `src/features/reports/decisions.ts:64-72` (`requestInPeriod`).
- Lo que ve la persona: «Periodo: 18 de jul de 2026 a 24 de oct de 2026». Creé y asigné «Seguimiento Lote 4 por baja de vigor» (25 de oct) con su motivo; en «Servicios contratados y decisiones» aparecen cinco solicitudes y esa no. Al cambiar «Hasta» a 31 de oct aparece, con «Motivo de la elección: …».
- Qué entiende o hace mal: pienso que mi decisión no quedó registrada, o que el informe no sirve. No hay aviso de «hay 1 solicitud posterior al periodo».
- Por qué importa para su tarea: la tarea 6 es llevar a la junta lo decidido. Lo más reciente es lo primero que se pregunta, y es lo que se pierde. El informe de vuelos termina donde termina el último vuelo; las decisiones suelen ir después.
- Propuesta: que «Hasta» por defecto sea la fecha más reciente de cualquier cosa del sitio (vuelo, solicitud o evento), o que debajo del periodo diga «Hay 1 solicitud o evento posterior a esta fecha. Incluirlo». En el motivo, evitar el doble punto («… de las dos..», «… devolución..»): el texto del usuario ya trae punto.
- Gravedad: bloquea la tarea (hasta que lo descubra y cambie la fecha)
- Evidencia: navegador (Informes → Informe, antes y después de mover «Hasta») y lectura de código.
- Huecos relacionados: H8

### G2-02 Las cifras del informe y de Informes no cuadran cuando se factura un servicio sin vuelo
- Eje: caso-de-uso
- Dónde: `/informes` (Costos y Informe); `src/features/reports/operators.ts:95-107` (`byFlight.get(invoice.flightId)` queda sin vuelo y no suma «cubiertas»); `src/features/reports/decisions.ts:207-216` (pedidas solo de solicitudes, cubiertas y facturadas de todas las facturas); consolidated-report (Costos).
- Lo que ve la persona: tras facturar «Seguimiento del Lote 4» (6,5 ha, $ 195.000; esa solicitud no trae vuelo):
  - Informes → Costos → Operadores, Drones del Pacífico: «$ 557.850 · $ 44.988 por ha, de 2 de 2 facturas con área · 12,4 / 5,9 ha · De 2 de 2 facturas». Facturadas 12,4, cubiertas 5,9 (falta la entrega de 6,5), y sin la advertencia roja que sí tiene AeroVisión.
  - Costos de la pestaña: «Facturado · pagado $ 4.465.850 · $ 3.451.000» y «Costo por vuelo $ 744.308» (8 facturas entre 6 vuelos). En el informe consolidado: «Facturado: $ 4.270.850 … Por vuelo: $ 711.808 (7 facturas de 6 vuelos)», sin la factura FV-2026-165, que sí está en la sección de servicios. Tampoco está en «Pendientes y alertas» (sí está FV-2026-308 con su saldo).
  - «Hectáreas por operador (pedidas / declaradas cubiertas / facturadas)»: «AeroVisión del Valle: 55,8 / 109,4 / 111,7 ha». Pedidas 55,8 contra cubiertas 109,4: las pedidas son solo de las solicitudes en pantalla y las otras dos columnas incluyen las facturas mensuales de antes. Drones del Pacífico: «13,8 / 5,9 / 12,4».
- Qué entiende o hace mal: leo que AeroVisión cubrió el doble de lo que le pedí, y que Drones del Pacífico facturó más del doble de lo cubierto. Es lo mismo que G-02 (bases distintas en una fila), ahora en el informe nuevo y para el caso de un servicio sin vuelo, que el propio flujo de disputa produce.
- Por qué importa para su tarea: la tarea 5 es comparar pagado y cubierto por operador y la 6 presentar esas cifras. Un total que cambia entre pantallas me quita credibilidad.
- Propuesta: (a) que una factura sin vuelo lea las hectáreas cubiertas de la entrega de su solicitud (como ya hace Pagos: «Cubierto 6,5 ha»), en `operatorSummaries` y en Costos; (b) que Costos del informe use el mismo conjunto de facturas que la pestaña («8 facturas», o diga cuántas deja fuera y por qué); (c) en las tres columnas poner solo hectáreas de los mismos servicios, o rotular «Pedidas en solicitudes de este periodo» frente a «Cubiertas y facturadas en todas las facturas»; (d) incluir el saldo de cada factura pendiente en «Pendientes y alertas».
- Gravedad: confunde
- Evidencia: navegador (Informes → Costos; Informes → Informe con «Hasta» 31 de oct; Pagos: «8 de 8 facturas», «$ 1.014.850 por pagar») y lectura de código.
- Huecos relacionados: H7, H8

### G2-03 «Cotizar» precarga el precio de otro operador, y los formularios abiertos pasan de un papel a otro
- Eje: componente
- Dónde: `/servicios`; `src/features/services/action-form.tsx:172-174` (`defaultValue={request.quotes.find((item) => item.state === "open")?.price}`).
- Lo que ve la persona: como Drones del Pacífico abro «Cotizar» en una solicitud donde AeroVisión ya cotizó $ 36.000: el campo «Precio por hectárea (COP)» ya trae 36000. Si escribo mi cifra encima sin borrar, queda «3600034000» y la solicitud muestra «$ 3.600.034.000 por ha · $ 25.542.963.669 en total» con «12.000.013 % por encima de lo que pagó antes». Lo mismo con «Cambiar mi cotización»: muestra el precio de la primera cotización vigente, no la mía. Y si dejo abierto un formulario (por ejemplo «Responder al cliente») y cambio «Ver como», el gestor ve el formulario del operador dentro de «Estado actual».
- Qué entiende o hace mal: como gerente, me vería el precio del competidor en el formulario del otro operador: la propia pantalla dice que cada operador «Solo ve su propia cotización». Como operador, enviaría una cifra equivocada sin darme cuenta. Nada valida un precio absurdo.
- Por qué importa para su tarea: la tarea 2 depende de que las cotizaciones sean de cada operador; con un aviso de «tope» no basta si el número ya viene contaminado.
- Propuesta: precargar solo la cotización abierta del operador que actúa (`quote.operatorId === actor.id`); vaciar el formulario abierto al cambiar «Ver como»; y avisar cuando el precio supere en más de, por ejemplo, 3 veces la referencia («¿Seguro? Es 100 veces lo que pagó antes»).
- Gravedad: confunde (en el producto real sería una fuga de precios entre operadores)
- Evidencia: navegador (Servicios → Ver como: operador → Cotizar, dos veces) y lectura de código.
- Huecos relacionados: H4, H7

### G2-04 La demo tiene dos «hoy»: 25 y 30 de octubre
- Eje: caso-de-uso
- Dónde: `src/features/flights/follow-up.ts:11` (`FOLLOW_UP_TODAY = "2026-10-30"`), `src/components/app-shell.tsx:297` («escenario del 25 oct. 2026»), fechas de eventos de Servicios (25 de oct).
- Lo que ve la persona: Informes y el informe consolidado dicen «A 30 de oct de 2026, día de la demostración… venció hace 14 días» (plazo 16 de oct). El pie de página dice «escenario del 25 oct. 2026», Servicios sella mis acciones «25 de oct de 2026» y el asistente propone volar el «27 de oct» (para el 30 sería una fecha pasada); el vuelo «Seguimiento programado» del 29 de oct figura como «Programado».
- Qué entiende o hace mal: no sé cuál es la fecha de hoy; si es el 25, la medida lleva 9 días vencida, no 14; si es el 30, el vuelo del 29 ya debería estar hecho.
- Por qué importa para su tarea: «vencida hace 14 días» es una cifra que yo repetiría en la junta.
- Propuesta: un solo «hoy» de la demo, dicho una vez en la pantalla («En esta demo hoy es el 25 de octubre»), y que los plazos y la fecha sugerida salgan de él.
- Gravedad: confunde
- Evidencia: navegador (Informes, Informe, Programación, Servicios) y lectura de código.
- Huecos relacionados: H7, H8

### G2-05 El aviso no se cierra solo, tapa los botones y a veces dice algo que no pasó
- Eje: componente (y texto)
- Dónde: `src/components/app-shell.tsx:305-312` (el aviso solo desaparece con la «X»; `setNotice("")` no se llama por tiempo), `src/features/services/use-services.ts:73`.
- Lo que ve la persona: avisos como «Servicio asignado a AeroVisión del Valle.» o «Factura creada; está en Pagos y costos.» siguen en pantalla minutos después y cambios de pantalla más tarde (los vi en Informes y en el formulario de verificación). En «Verificar la entrega» el aviso quedó encima de «Confirmar» y «Volver». Al crear la solicitud sigue diciendo «Solicitud enviada a los operadores invitados.», aunque el formulario dice «no se envía nada fuera de esta demostración». El panel «Asignar a…» aparece debajo de la tabla, fuera de pantalla en un portátil, sin que la página se desplace hasta él.
- Qué entiende o hace mal: leo un aviso viejo como si fuera del paso actual; busco el botón y no lo veo; y «enviada» me hace pensar que se envió.
- Por qué importa para su tarea: en la tarea 2, 3 y 4 el último clic importa y el aviso lo estorba.
- Propuesta: que se cierre solo a los pocos segundos (con pausa si el puntero está encima), que no se superponga a los botones del formulario abierto, y «Solicitud creada en esta demo. No se envió a ningún operador.»; que al pulsar «Asignar» la página lleve al panel de confirmación.
- Gravedad: confunde
- Evidencia: navegador (capturas del formulario de verificación y de Informes con el aviso viejo) y lectura de código.
- Huecos relacionados: H7

### G2-06 Una entrega ajustada conserva la nota vieja, y «Coincide» en verde acepta un 87,5 %
- Eje: caso-de-uso
- Dónde: `/servicios` («Seguimiento del Lote 4»), `src/features/demo/demo-data.ts:2333` (nota «Recorrido completo según el registro de vuelo.»); `/pagos` (FV-2026-308, FV-2026-165).
- Lo que ve la persona: tras aceptar el ajuste, la entrega dice «dice haber cubierto 6,5 ha de las 7,1 ha pedidas. Recorrido completo según el registro de vuelo.» En Pagos, «Mapeo de la última zona» (se cubrió «el 87,5 % de lo pedido (5,9 de 6,7 ha)») sale con «Verificación del área: Coincide» en verde y «Según el registro de vuelo del operador» donde no hay registro de vuelo, solo la entrega. Y en «Antes de pagar» de la factura sin vuelo, «No hay vuelo asociado» como alerta, con «Ver vuelo: no disponible».
- Qué entiende o hace mal: la nota me contradice la cifra; «Coincide» me hace pensar que está completo cuando falta 12,5 % del mapeo (acepté yo, pero el semáforo no me lo recuerda).
- Por qué importa para su tarea: antes de pagar quiero ver dos cosas distintas: si lo facturado coincide con lo cubierto, y si lo cubierto coincide con lo pedido.
- Propuesta: al aceptar un ajuste, reemplazar la nota con «Ajustado a 6,5 ha por acuerdo del 25 de oct»; en la tarjeta de área, una segunda línea «Quedó sin cubrir el 12,5 % de lo pedido (0,8 ha)» en tono de atención; y «Según la entrega del operador» cuando no hay vuelo.
- Gravedad: menor
- Evidencia: navegador y lectura de código (nota).
- Huecos relacionados: H7

### G2-07 Fallos de redacción de las plantillas de texto
- Eje: texto
- Dónde: `src/features/agents/quote-reading.ts:473` (frase de ventaja), `src/features/demo/demo-context.tsx` / vocabulario de zonas, `src/features/services/workflow.ts:681`, `src/features/services/use-services.ts:196`.
- Lo que ve la persona (cada uno una línea):
  - «…es 4 % más económica ($ 10.643 menos en total), pero AeroVisión del Valle su última entrega cubrió 95 %…» (falta el verbo cuando no hay ventaja de fecha).
  - Con la plantilla de caña: «los suertes dibujados son inventados» (género), «1 esperan una acción suya» (concordancia).
  - Historia: «Drones del Pacífico (ejemplo) facturó 5.9 ha» (punto decimal; el resto usa coma).
  - Doble punto: «Motivo de la elección: La cotización más baja de las dos..» y «Razones: … (0,75 → 0,72 → 0,62)..».
  - Factura creada desde Servicios: título «Mapeo de la última zona» sin «5,9 ha × $ 61.500 por ha» como las demás, y número `FV-2026-308/356/165` al azar (`Math.random()`), no consecutivo.
- Qué entiende o hace mal: entiendo todo, pero pierdo confianza en el texto que voy a copiar al informe.
- Por qué importa para su tarea: parte de este texto sale tal cual en el informe de la junta.
- Propuesta: corregir cada plantilla; una factura creada desde Servicios debería describirse «5,9 ha × $ 61.500 por ha (ejemplo)» y numerarse en secuencia.
- Gravedad: menor
- Evidencia: navegador (cada línea vista en pantalla o en el informe) y lectura de código (las dos últimas).
- Huecos relacionados: H7

## 5. Lo que funciona y hay que conservar

1. **El flujo de disputa de punta a punta.** El operador responde (aceptar el ajuste con una cifra menor, o sostener con nota y archivos anotados), yo veo la respuesta junto al reclamo, verifico de nuevo y facturo la cifra acordada; nada se pierde en la historia. Es la parte más creíble de la demo para quien paga.
2. **Asignar con confirmación y motivo, y dejar lo no elegido con su cifra.** «No fue seleccionada» con precio y fecha, y el motivo en el informe, contestan «¿por qué no la más barata?».
3. **El informe consolidado de decisiones**, cuando se ajusta el periodo: pedido → cotizaciones → elegida y por qué → entrega → verificación → disputa → factura, y las hectáreas «declaradas por el operador, no medidas por Otear».
4. **La tabla «Puntos por zona»** del asistente de vuelo y la línea que propone sumar la zona a un vuelo ya agendado.
5. **«Lectura de las cotizaciones»** (referencia propia, antes de asignar pregunte, nombrar al operador solo cuando no es peor en nada medible). Y la validación del ajuste («debe ser menor que lo declarado»).

## 6. Veredicto: ¿puede cerrar hoy el ciclo pedir → pagar → presentar a la junta?

**Casi, y con tres reparos.** En la demo pude, sin ayuda de código, pedir un servicio, comparar dos cotizaciones, asignar con mi motivo, verificar la entrega, facturar y llegar a «Registrar pago» en Pagos (no registré el pago en esta pasada). El ciclo ya no se atasca como antes (G-01). Lo que me impide llevarlo hoy a la junta sin revisarlo a mano:

1. El informe consolidado omite por defecto lo último que decidí (G2-01).
2. Sus totales y las «hectáreas por operador» no cuadran con Pagos ni entre sí cuando hay un servicio sin vuelo (G2-02); yo repetiría esas cifras y no coinciden.
3. Dos fechas de «hoy» (G2-04), y el formulario de cotizar contamina el precio con el de otro operador (G2-03).

Siguen abiertos sin cambio la escala (una sola hacienda, G-10), el vocabulario a medias (G-11) y que el asistente no lleve su propuesta a Servicios (G-04).

## 7. Límites

- Persona simulada: hipótesis, sin porcentajes ni citas de usuarios. Probé solo agricultura, en escritorio (1366 px); no revisé móvil.
- No registré un pago ni probé las otras tres personas. Tampoco abrí Vuelos, Mapa, Equipos ni Documentos más que de pasada.
- El estado de la demo se perdió varias veces a mitad de la prueba (la página se recargó sola mientras el servidor mostraba «Compiling…», probablemente porque otras sesiones usaban el mismo servidor). Repetí los flujos completos en un solo guion; no lo atribuyo al producto. Algunos clics fallaron por el desplazamiento suave de la página; lo corregí en mi guion y no cuenta como hallazgo.
- Las pruebas cambiaron el estado en memoria de la demo (una solicitud nueva, un vuelo planeado, dos facturas) y la plantilla «Caña de azúcar» quedó en el `localStorage` de mi perfil temporal de Chromium; nada se editó en el proyecto.
- «Evidencia: lectura de código» en G2-01, G2-02 y G2-03 se refiere a la causa; lo visible lo vi en el navegador.
