# Tercera pasada desde el rol: operador de dron profesional

Persona simulada, la misma de las fases 1 y 2 (2 aeronaves, certificado; teme que la plataforma lo vigile o le recorte el pago). Todo lo de abajo son hipótesis de «yo, como esta persona», no resultados de usuarios. Datos sintéticos; no cito cifras de mercado ni inventé citas.

Evidencia: «navegador» = Chromium propio (CDP, puerto 9444) sobre `http://localhost:3444`, rama `revision-fase-3` (commit `f1b2d0e`), en 1440 × 900 y en 390 × 844, entrando por «Abra la demo como operador» y por el selector «Predio o perímetro». «Lectura de código» = leí el archivo y no lo vi ejecutarse. No edité nada del proyecto.

## Estado de los hallazgos de la pasada anterior

| ID | Fase 2 | Ahora | Una línea de por qué |
|---|---|---|---|
| O-01 Lo que «me aprueban» | Mejorado | **Mejorado** | La cifra en pesos antes de aceptar sigue («18,5 ha son $ 555.000») y la tolerancia ya habla con una sola voz: «Referencia de la demo: 5 %; se pacta con el operador (por definir)» en Servicios, Pagos, el formulario de factura y la landing. El cliente sigue sin poder proponer una cifra: solo acepta o pide ajuste con texto libre. |
| O-02 Pedido sin zona exacta | Mejorado | **Mejorado** (sin cambio) | Hectáreas por lote y área total; sigue sin polígono, KML, sensor, GSD ni quién abre el predio. |
| O-03 No puedo contestar una disputa | Resuelto | **Resuelto** | Probé «Aceptar el ajuste» con 6,4 ha: valor en pesos en vivo, el gestor verificó, facturé. |
| O-04 De quién son mis datos | Mejorado | **Mejorado** | Equipos, Pagos e Informes traen la línea «por definir» (solo con «Ver como» operador). Falta en Documentos y la flota sigue mostrando al piloto de mi competidor (O3-04). |
| O-05 Veo la cotización de mi competidor | Resuelto | **Resuelto** | «Se han recibido 2 cotizaciones, incluida la suya», «No fue seleccionada», «Asignado a: Otro operador». |
| O-06 «Entregar» es escribir nombres | Mejorado | **Mejorado** (sin cambio) | «En esta demo solo se anotan los nombres… está por definir». Sigue sin campo de enlace. |
| O-07 Lo que programo no mueve mi flota | Mejorado | **Mejorado** | «¿Con qué aeronave voló?» en la entrega; las horas suben en Equipos. Las baterías siguen sin pedirse y las horas salen del plan si dejo la duración en blanco (O3-06). |
| O-08 Me siento auditado | Igual | **Igual** | Pagos: «Facturas del operador», «Registrar pago» a la vista; Informes: «2 descartados» junto a mi nombre; abajo a la izquierda sigue «Luis Rojas · Administrador · ejemplo» aunque yo esté como operador. La línea «por definir» habla de propiedad, no de tono. |
| O-09 Servicios y Pagos no cuadran | Resuelto | **Resuelto** | FV-2026-034 = $ 837.000 = 27,9 ha × $ 30.000 y Pagos lo dice. |
| O-10 Servicios me habla como comprador | Mejorado | **Resuelto** | «Su cotización está enviada. El cliente decide después de comparar las cotizaciones.»; ya no sale «Le toca a usted» cuando no me toca. |
| O-11 Facturo de más sin aviso | Mejorado | **Resuelto** | Aviso en vivo, campo «Nota para el cliente» y aviso si supero lo pedido. Queda un detalle de redondeo (O3-11). |
| O-12 La landing habla al comprador | Resuelto | **Resuelto** | Tarjeta «Usted sigue volando» y enlace «Abra la demo como operador» funcionan (el enlace se parte en dos renglones; hay que pulsar sobre las palabras, no en el hueco). |
| O-13 Lista y documentos: mucho formato | Mejorado | **Mejorado** (sin cambio) | Los ítems siguen en «Sin documento · Redactar o adjuntar»; el contador ya no los cuenta como falta. No lo abrí de nuevo a fondo. |
| O-14 Palabras sueltas | Igual | **Igual** | Queda «Arrastra para girar» (`src/components/drone/drone-preview.tsx:46`), «1 vuelos» en «Pilotos de la flota» y el aviso «vencida (faltan 159 h · pasó por 0,5 meses)» sin cambio. |
| O2-01 El informe me lleva a otro vuelo | — | **Resuelto** | «Ver el informe y el acta del vuelo «Inspección de labores»» abre ese vuelo. |
| O2-02 «Explíquela» sin dónde | — | **Resuelto** | «Nota para el cliente» en el formulario y «Nota del operador» en Pagos. |
| O2-03 Informes me pone 0 ha | — | **Resuelto** | «7,1 / 6,4 / 6,4 ha» tras el ajuste y «Nota original, antes del ajuste». |
| O2-04 La tolerancia de tres maneras | — | **Resuelto** | Una sola redacción en las cuatro pantallas. |
| O2-05 Aeronave, baterías, «0 km» | — | **Mejorado** | Pregunta la aeronave; Informes aclara que la bitácora es opcional; baterías no (O3-06). |
| O2-06 Formulario del otro rol abierto | — | **Resuelto** | Probé: al cambiar «Ver como» el formulario se cierra. |
| O2-07 Aviso que dice quién ganó | — | **Resuelto** | `services-view.tsx:88-92` limpia el aviso al cambiar de papel (lectura de código). |
| O2-08 La disputa no tiene salida | — | **Igual** | El campo «Hectáreas que acepta» sigue vacío aunque el cliente escribió «0,6 ha menos»; sigue sin cierre. Lo del tope de rondas es pregunta al dueño, ya anotada; no la repito como hallazgo. |

Conteo: **resueltos 12**, **mejorados 7**, **iguales 3**, **empeorados 0**.

## 1. Persona y tareas

Piloto con su pequeña empresa, 2 aeronaves, certificado. Entrega fotos y un PDF y factura por hectárea o por vuelo. Teme que una plataforma lo vigile o le recorte el pago por una cobertura mal medida.

1. Entender el pedido y entregar el vuelo, ahora diciendo con qué aeronave voló (Servicios).
2. Facturar por lo cubierto y, si me ajustan, responder (Servicios, Pagos).
3. Mirar mi flota y mis costos y entender quién los ve (Equipos, Pagos, Informes).
4. Servicios, Pagos y Equipos en el teléfono (390 × 844).
5. Recorrer el sector vigilancia completo: ¿habla de perímetros o se filtra el cultivo?
6. Decidir si me conviene.

## 2. Prueba de 5 segundos (escrita antes de leer el resto de la landing)

Solo la primera pantalla, en 1440 × 900 y en 390 × 844 (capturas `hero-d.png`, `hero-m.png`).

- **¿Qué cree que hace Otear?** Una plataforma para que quien contrata vuelos de dron los junte y los compare. A la izquierda hay un cuadro «Así se ve antes de pagar» con tres barras (se pidieron 27,9 ha, el operador declara haber cubierto 26,4 ha, facturó 27,9 ha) y una línea ámbar: «Otear lo marca antes de registrar el pago: «Facturó 1,5 ha más de las cubiertas (+5,7 %)»». O sea, lo que más se ve de entrada es mi propia factura marcada.
- **¿Para quién es?** Para quien contrata. El párrafo «Otear no hace los vuelos. Los hace su operador de dron… y es él quien los entrega» me tranquiliza un poco: confirma que no me quitan el trabajo. Pero nada en la primera pantalla me habla a mí.
- **¿Qué haría ahora?** Abrir la demo buscando dos cosas: quién mide las hectáreas y quién está detrás. Lo primero está en letra pequeña bajo el cuadro: «Las hectáreas cubiertas las declara el operador; Otear no las mide con las imágenes» (eso me tranquiliza). Lo segundo está debajo del botón: «Quién está detrás. Un proyecto en validación: todavía no tiene clientes ni una prueba con sus vuelos. Escriba a hola@otear.app.» Es honesto, pero no da nombre; como yo temo que me vigilen, un correo sin nombre no me deja confiar, solo me deja claro que no hay nadie todavía. No lo cuento como hallazgo: el nombre es decisión del dueño.

¿El panel ayuda o estorba? Ayuda a quien compra y me da una pista de lo que mi cliente verá de mí. En móvil queda bajo el titular y se lee entero. Ver O3-09.

## 3. Primer minuto en la demo

- Entré por «¿Opera drones para otras empresas? Abra la demo como operador.» Cae en Servicios con «Ver como» en «Operador · AeroVisión del Valle» y un aviso: «Bienvenido. Ve la demo como la vería un operador de dron…». Entendí dónde estaba sin buscar. (Mejor que en la primera pasada.)
- El pedido ahora dice «Pide: Ingenio Dulce Valle (ejemplo) · Paga: por definir · Vuela: AeroVisión del Valle». Entiendo de una vez quién pide, que quién paga no está decidido y que vuelo yo.
- Dudé: abajo a la izquierda sigue «Luis Rojas · Administrador · ejemplo» aunque yo esté como operador (O-08).
- Dudé: en el escritorio la barra de arriba me ofrece Agricultura, Carreteras, Construcción, Vigilancia, Minería; como yo vuelo para todos, probé cambiarlas, y ahí aparecieron los problemas de O3-02 y O3-03.

## 4. Tareas: ¿pudo terminarlas?

| # | Tarea | ¿Terminó? | Por qué |
|---|---|---|---|
| 1 | Entregar con aeronave | **Sí** | Elegí «Matrice 350 RTK» en «¿Con qué aeronave voló?», anoté 18,5 ha, dos archivos y una nota. Quedó «Entrega registrada el 25 de oct de 2026. Falta que Ingenio Dulce Valle (ejemplo) la verifique.» Sin escribir los archivos no deja confirmar («Anote al menos un archivo entregado»), con razón. Ojo con O3-06. |
| 2 | Facturar y discutir | **Sí** | El gestor aceptó; facturé 20,8 ha con una nota para el cliente. En Pagos salió «Facturó 2,3 ha más…» con «Nota del operador: …» debajo. Como Drones del Pacífico probé «Aceptar el ajuste» (6,4 ha, $ 192.000), facturé y Informes dice «7,1 / 6,4 / 6,4 ha». |
| 3 | Flota y costos | **Con ayuda** | Las horas sumaron (Camilo Torres 2,1 → 2,5 h; 5 → 6 vuelos). La línea «por definir» está en Equipos, Pagos e Informes. No quedó claro en Documentos ni en la pestaña de costos (O3-04). |
| 4 | Móvil | **Con ayuda** | Servicios, Pagos y Equipos caben a 390 px sin scroll horizontal de página, pero se me esconden columnas y pestañas clave (O3-08). |
| 5 | Vigilancia completo | **Sí, con fugas** | Pude recorrer Programación, Rondas y evidencias, Mapa, Novedades en el tiempo, Servicios, Equipos, Informes, Pagos y Documentos. Se filtran la foto de cultivo, «Monitoreo del cultivo» y «hallazgos» (O3-01, O3-02, O3-07). |
| 6 | Conviene o no | **Sigue sin poderlo decir** | Ver el dictamen. |

## 5. Hallazgos (más a menos graves)

### O3-01 En vigilancia, la «evidencia» de un cerramiento roto es una foto de cultivos, y las seis vistas son la misma foto
- Eje: caso-de-uso
- Dónde: `/vuelos?tab=evidencias` con el sector Vigilancia · `src/features/demo/demo-data.ts:214` (`Parque del Pacífico`, `imageUrl: "/images/aerial-road.jpg"`); lo mismo en `:180` (Obra Alameda) y `:254` (mina de caliza)
- Lo que ve la persona: en «Inspección de perímetro», pestaña Evidencias, «6 vistas ilustrativas»: «Vista general de muestra», «Cerramiento por revisar», «Acceso por verificar», «Seguimiento de perímetro»… Todas muestran el mismo campo de cultivos (franjas amarillas y verdes con un camino) y todas apuntan a `/images/aerial-road.jpg`. Arriba: «Estas imágenes ilustran el recorrido. No son fotografías georreferenciadas del sitio».
- Qué entiende o hace mal: el aviso es honesto, pero la imagen no tiene nada de un parque, de una reja ni de una puerta. Para mí, que fotografío lo que pide el cliente, una «evidencia» de «Posible abertura en el cerramiento» con un trigal se lee como que la demo no conoce mi trabajo. La carretera ya recibió su ilustración propia; construcción, vigilancia y minería siguen con la foto de cultivo.
- Por qué importa para su tarea: soy quien entrega las fotos; ver seis veces la misma imagen como «evidencia» hace dudar de que la plataforma sirva para mi sector.
- Propuesta: la misma salida que se dio a la vía: una ilustración propia por sector, rotulada («Ilustración, no es una foto del parque»), y que no se repita idéntica en cada tarjeta (una vista general más un recorte distinto por novedad).
- Gravedad: confunde
- Evidencia: navegador (vigilancia: `vig-evid.png`, `vig-evid2.png`; las seis tarjetas apuntan a la misma ruta) + lectura de código (construcción y minería)
- Huecos relacionados: H7

### O3-02 Palabras del cultivo y del «hallazgo» dentro de vigilancia
- Eje: texto
- Dónde: `/servicios` · `src/features/services/workflow.ts:28` (`monitoring: "Monitoreo del cultivo"`); `/pagos` · `src/features/billing/readiness.ts:64`; `/vuelos` · `src/features/flights/review/flight-review-view.tsx:101` y `:392`; `/programacion` · `src/features/flights/planning/drone-hangar.tsx:46`
- Lo que ve la persona: en el parque, el pedido dice «Monitoreo del cultivo · Comparar el estado de los sectores con el registro anterior.»; en Pagos, la lista «Antes de pagar» dice «Los hallazgos del vuelo están revisados · 3 por revisar» mientras todo lo demás habla de «novedades»; la descripción de Vuelos dice «confirme los novedades» y «Revise los novedades del operador» (género mal: se arma como «los» + «novedades»); en Programación, el dron dice «Uso típico: Agricultura · Construcción · Carreteras · Minería» sin Vigilancia. En el pedido por vuelo (tarifa fija) sigue «Área pedida 29,8 ha» y «el operador vuela, y declara, lo que cubrió», aunque el formulario de entrega no pide hectáreas.
- Qué entiende o hace mal: que el producto fue hecho para el cultivo y le cambiaron algunas palabras. «Monitoreo del cultivo» en un parque es lo primero que lee quien contrata y lo primero que leo yo en mi lista.
- Por qué importa para su tarea: el pedido es mi punto de partida; si el tipo de servicio no dice lo que voy a hacer, desconfío del resto.
- Propuesta: tipo de servicio según el sector (en vigilancia: «Ronda de perímetro»; en construcción: «Avance de obra»; en minería: «Seguimiento de bancos»; en vía: «Inspección vial»), la lista «Antes de pagar» con la misma palabra del sector (novedades, hallazgos, no ambas), concordancia de género («las novedades»), y en «Uso típico» incluir Vigilancia. En servicios por vuelo, ocultar «Área pedida» o rotularla «Área del recorrido, de referencia».
- Gravedad: confunde
- Evidencia: navegador (vigilancia: Servicios, Pagos, Vuelos, Programación) + lectura de código
- Huecos relacionados: H7

### O3-03 Al cambiar de sector con la barra de arriba, el vocabulario del anterior se queda
- Eje: caso-de-uso
- Dónde: barra superior (Agricultura · Carreteras · Construcción · Vigilancia · Minería); `localStorage` `otear.config.v1` / `otear.entry`
- Lo que ve la persona: entré por «Predio o perímetro» y luego pulsé «Agricultura» arriba. La hacienda abrió, pero el menú dice «Rondas y evidencias» y «Novedades en el tiempo» (junto a «Mapa y lotes»), el informe del vuelo dice «NOVEDADES INCLUIDAS» y la tabla de Informes dice «Vuelos y novedades · 13 novedades» para una hacienda.
- Qué entiende o hace mal: que el menú está a medias: palabras de dos sectores en la misma pantalla. Yo trabajo para varios sectores y es justo lo que haría en una reunión: abrir uno y mostrar los otros.
- Por qué importa para su tarea: me deja con la duda de qué son esas «rondas» en una finca y si el informe que firmo usa la palabra correcta para mi cliente.
- Propuesta: que cada pestaña de sector aplique el vocabulario de ese sector (el que ya trae «Su sector aparece aquí»), o que el aviso diga «Usted eligió el vocabulario de Predio o perímetro; para volver al de este sector, ver Configuración». Decisión del dueño cuál de las dos.
- Gravedad: confunde
- Evidencia: navegador (lista de enlaces del menú tras el cambio; Informes › Costos)
- Huecos relacionados: H6, H7

### O3-04 La línea «por definir» llega a tres pantallas, no a Documentos, y mi flota sigue mostrando al piloto de mi competidor
- Eje: componente
- Dónde: `src/components/ui/operator-scope-note.tsx` usado solo en `billing-view.tsx:186`, `fleet-view.tsx:100`, `reports-view.tsx:214`; `src/features/compliance/document-view.tsx` (sin la línea); `src/features/fleet/fleet-view.tsx:171`
- Lo que ve la persona: en Equipos, Pagos e Informes: «De quién son la flota, los costos y los pilotos del operador dentro del proyecto de un cliente, y quién los ve, está por definir. En esta demo, todo el proyecto lo ve quien lo abre.» Me gusta que lo diga. En Documentos, donde están mi registro de operador, mi póliza vencida y el soporte de mi piloto, no dice nada. En Equipos, la línea está arriba de todo y la ficha de costos («Compra 12 de mar de 2024 · $ 24.500.000», «Propiedad por hora $ 124.193») sale en otra pestaña, sin línea. Y bajo «Pilotos de la flota» aparece «Piloto de Drones del Pacífico (ejemplo) · 0,2 h · 1 vuelos» dentro de la flota de AeroVisión.
- Qué entiende o hace mal: que la línea es un aviso general y no una garantía; y que mi flota es de dos empresas mezcladas: veo las horas de un competidor y él vería las mías.
- Por qué importa para su tarea: es la segunda cosa que temo. La línea honesta me sirve, pero el dato más delicado (mi costo por hora y mis papeles) queda fuera.
- Propuesta: repetir la misma línea (con «los papeles») en Documentos y bajo «Papeles y costos» en Equipos. Y, en los datos de ejemplo, que «Pilotos de la flota» muestre solo los pilotos del operador con el que se mira, o que la línea lo nombre: «En esta demo la flota mezcla pilotos de dos operadores». Qué ve cada quien en serio es decisión del dueño.
- Gravedad: confunde
- Evidencia: navegador (Equipos, Pagos, Informes, Documentos; `equipos-costos.png`) + lectura de código
- Huecos relacionados: H4

### O3-05 En el informe del vuelo que firmo como «Operador» van cosas que no son mías
- Eje: caso-de-uso
- Dónde: `/vuelos?tab=informe` › «Firmar el informe del vuelo» · plantilla `flight-report` en `src/features/traceability/templates.ts`
- Lo que ve la persona: el documento que debo firmar trae, además de mi vuelo y lo que declaré («Cubierto, según el operador: 26,4 de 27,9 ha pedidas»), cosas del cliente: «Hay 1 medida correctiva vencida en el sitio: su plazo ya pasó y no está cerrada», «Medida correctiva: Abierta · responsable Jefe de campo (ejemplo) · plazo 6 de nov de 2026» y «Frente a vuelos anteriores: se repite (ya se reportó en 4 vuelos anteriores)». Abajo, «Firmas: Operador · Pendiente · Firmar» y «Revisor o interventor».
- Qué entiende o hace mal: que al firmar certifico todo el texto. La demo explica bien qué no prueba la huella («eso lo declara el operador»), pero no separa lo que yo declaro de lo que decide el cliente. Firmar un informe que dice que una medida del cliente está vencida no es mi papel.
- Por qué importa para su tarea: firmar es un acto con consecuencias aunque sea de ejemplo; quiero firmar mi parte.
- Propuesta: dentro del documento, dos bloques con rótulo: «Lo que declara el operador» (duración, recorrido, fotos, clima, hectáreas, notas) y «Lo que decide quien contrata» (medidas, responsables, plazos), y que la línea de firma diga «Firma como Operador: confirma el primer bloque». No lo pido como pantalla nueva: es reordenar el texto de la plantilla. La firma sin verificación de identidad la dice el diálogo y no la discuto.
- Gravedad: confunde
- Evidencia: navegador (diálogo y texto completo del documento)
- Huecos relacionados: H7

### O3-06 Entregar me suma horas que no declaré y no mueve mis baterías
- Eje: componente
- Dónde: `/servicios` (Registrar la entrega) · `src/features/services/use-services.ts:144-155`; `/informes` (Historial)
- Lo que ve la persona: dejé «Duración del vuelo» y «Fotos» en blanco (los dos dicen «opcional»). En Equipos, Camilo Torres pasó de «2,1 h · 5 vuelos» a «2,5 h · 6 vuelos», y en Informes el vuelo dice «25 min · 10,1 km · 0 fotos». Esos 25 min y 10,1 km son los de la ruta planeada, no los míos. Debajo de la aeronave: «Las horas del vuelo se suman a esa aeronave en Equipos. Los ciclos de las baterías no se piden aquí.»
- Qué entiende o hace mal: si no escribo la duración, la plataforma usa la del plan y la guarda como si hubiera volado. Y como la aeronave sugerida ya viene marcada (la que más volé), puedo confirmar sin mirar y sumarle horas a la equivocada. Las baterías, que es lo que más me importa para mantenimiento, no se piden (aviso honesto, pero me deja el trabajo doble).
- Por qué importa para su tarea: el mantenimiento es lo que sé y valoro; una cifra que no declaré no me sirve.
- Propuesta: si la duración está en blanco, decirlo antes de confirmar: «Sin duración: se suman 25 min, los del plan. Escriba la real si la sabe.» Dejar la aeronave sin marcar hasta que yo elija. Pedir «Baterías usadas» con las de Equipos como lista (el diálogo de bitácora de Programación ya las muestra como opciones).
- Gravedad: confunde
- Evidencia: navegador (Equipos antes y después; Informes) + lectura de código
- Huecos relacionados: H2, H7

### O3-07 En vigilancia, Evolución abre en un vuelo sin novedades y dice «mejoró»
- Eje: caso-de-uso
- Dónde: `/evolucion` con el sector Vigilancia · `src/features/evolution/evolution-view.tsx`
- Lo que ve la persona: «Novedades en el tiempo» abre en «24 de oct de 2026 · 0 novedades en total», con «Sin novedades en este vuelo» y «Frente al 18 de jul de 2026, mejoró: Sector occidental (−1), Sector oriental (−1).» En la línea de tiempo hay dos entradas del 24 de oct: «5 novedades (3 del operador y 2 sugerencias sin revisar)» y «sin novedades». Lo segundo es, por la hora, el «Mapeo de la última zona» de Drones del Pacífico.
- Qué entiende o hace mal: que el parque mejoró, cuando mi ronda del mismo día marcó cinco novedades y una medida vencida. Un vuelo de mapeo de otra empresa (que no inspecciona el cerramiento) deja la pantalla en «todo bien».
- Por qué importa para su tarea: es mi trabajo contra el de otro operador: si el cliente lee «mejoró» cuando entregué cinco novedades, parece que no aporté.
- Propuesta: que la comparación solo use vuelos del mismo tipo (rondas de inspección con rondas) o que el vuelo de mapeo diga «Este vuelo no inspecciona el cerramiento: no cuenta como ronda»; y que abra en el vuelo con novedades.
- Gravedad: confunde
- Evidencia: navegador (`vig-evo.png`)
- Huecos relacionados: H7, H8

### O3-08 En el teléfono se me esconden la columna «Estado», el segundo equipo y «Papeles y costos»
- Eje: componente
- Dónde: `/servicios` (tabla «Su cotización») y `/equipos` en 390 × 844
- Lo que ve la persona: en Servicios, la tabla se corta a «Operador · Precio / ha · Total estimado · Desde · Est…»: la columna con «Elegida» o «No fue seleccionada» queda fuera, solo hay una barra gris para deslizar. En Equipos, la tarjeta «Flota» muestra apenas «Mavic 3E · A» cortado («201 h · 5 ale…») y la Matrice no se ve; las pestañas dicen «Piezas · Mantenimiento 5 · Papeles y cost›». Lo que sí funciona: el menú, el formulario de entrega (un solo campo por renglón, botones de 42 px), la lista de facturas y la verificación del área en Pagos.
- Qué entiende o hace mal: que tengo una sola aeronave y que mi cotización no tiene resultado. Entiendo que hay que deslizar, pero no hay una señal que lo diga y lo importante es justo lo que queda fuera.
- Por qué importa para su tarea: en campo hago esto con el pulgar: ver si me eligieron y cuántas horas tiene la segunda aeronave.
- Propuesta: en pantalla angosta, mostrar la cotización como tarjeta («AeroVisión del Valle · $ 30.000 · desde 27 de oct · Elegida») en vez de tabla; en Equipos, apilar las aeronaves (o poner «2 aeronaves» y un indicador ›) y acortar a «Papeles», «Costos» en lugar de «Papeles y costos».
- Gravedad: confunde
- Evidencia: navegador (`m-serv3.png`, `m-eq1.png`, `m-eq2.png`, `m-pagos1.png` a `m-pagos3.png`, `m-deliver1.png`)
- Huecos relacionados: —

### O3-09 La primera pantalla me muestra señalado y no me dice que puedo explicarme
- Eje: componente
- Dónde: `/` (hero) · `src/features/landing/landing-page.tsx` (panel «Así se ve antes de pagar»)
- Lo que ve la persona: tres barras con la tercera marcada en ámbar y «Otear lo marca antes de registrar el pago: «Facturó 1,5 ha más de las cubiertas (+5,7 %)»». Más abajo, en la tarjeta del operador, sí dice «si quien contrata pide un ajuste, usted responde», pero en el hero no.
- Qué entiende o hace mal: que lo primero que se muestra de mi trabajo es la marca roja. La demo ya tiene «Nota para el cliente», que no aparece en el cuadro. En móvil, además, el avión pasa por encima de «Quién está detrás» y del correo (`hero-m2.png`, `m-hero3.png`), justo la línea nueva.
- Por qué importa para su tarea: decide si pulso «Abrir la demo» o me voy.
- Propuesta: una línea al final del cuadro: «El operador puede dejar una nota que el cliente lee junto a esta marca» (cifras de ejemplo). Y que el avión no se pose sobre «Quién está detrás» en pantalla angosta.
- Gravedad: menor
- Evidencia: navegador (escritorio y móvil)
- Huecos relacionados: H1, H4, H7

### O3-10 La marca roja de Pagos no cambia aunque ya dejé mi nota
- Eje: texto
- Dónde: `/pagos` (Verificación del área, «Antes de pagar») · `src/features/billing/coverage.ts:114`, `area-check-card.tsx:142`
- Lo que ve la persona: «Facturó 2,3 ha más de las cubiertas (+12,4 %). Pida la justificación antes de pagar.» Más abajo, en la misma tarjeta, «Nota del operador: Incluye 2,3 ha de la esquina del lote 5 que se repitieron al día siguiente por el viento». En la lista «Antes de pagar» repite «Pida la justificación antes de pagar».
- Qué entiende o hace mal: que la nota no cuenta: el aviso se escribe como si yo no hubiera explicado nada.
- Por qué importa para su tarea: la nota era mi voz (O2-02). Si no cambia el aviso, el cliente puede leer solo lo rojo.
- Propuesta: si hay nota: «El operador dejó una nota (abajo). Léala antes de pagar.»
- Gravedad: menor
- Evidencia: navegador
- Huecos relacionados: H7

### O3-11 Si facturo exactamente lo pedido, el formulario dice que me pasé
- Eje: texto
- Dónde: `/servicios` (Facturar) · `src/features/services/action-form.tsx:587-593`
- Lo que ve la persona: con 20,8 ha escritas en un pedido de «Área pedida 20,8 ha»: «Además, el cliente pidió 20,8 ha y esta factura es por 20,8 ha.» El pedido calcula 20,79 ha y lo muestra como 20,8; la comparación usa el número sin redondear.
- Qué entiende o hace mal: que escribí lo que la pantalla me mostró y aun así me avisa de que me pasé.
- Por qué importa para su tarea: es un falso aviso justo en el formulario que me protege.
- Propuesta: comparar con el área redondeada que se muestra, o con la tolerancia de la demo; y no mostrar la frase si coinciden.
- Gravedad: menor
- Evidencia: navegador + lectura de código
- Huecos relacionados: H7

### O3-12 Equipos abre con «No se pudo leer el modelo… si es un escaneo» sin que nadie haya cargado nada
- Eje: componente
- Dónde: `/equipos` · `src/components/drone/condition-scene.tsx:914`
- Lo que ve la persona: en la ficha de la aeronave, un panel vacío con «No se pudo leer el modelo. Si es un escaneo, expórtelo como .glb e inténtelo de nuevo.» y, encima, las etiquetas de piezas («Estabilizador y cámara · 21 %») solapadas con el texto. Mi Chromium tiene WebGL (`WebGL 2.0`); en esta copia no están los modelos DJI (`public/models/dji/` no existe: no se publican por la licencia).
- Qué entiende o hace mal: que fallé yo al cargar un escaneo, cuando solo abrí la página.
- Por qué importa para su tarea: Equipos es la pantalla que más me gusta; si el panel central sale con un error, se pierde.
- Propuesta: si el modelo propio no está, un texto distinto: «Esta vista usa un modelo de ejemplo que no está disponible aquí. Puede cargar su escaneo (.glb)». No sé si en el sitio publicado pasará lo mismo.
- Gravedad: menor
- Evidencia: navegador (`equipos-1.png`, `m-eq2.png`) + lectura de código
- Huecos relacionados: H7

## 6. Lo que funciona y hay que conservar

1. **La línea «Pide · Paga: por definir · Vuela» en el pedido.** Me dice quién es cada quien y que el pago no está resuelto, sin esconderlo.
2. **La entrega con aeronave, nota y archivos honestos.** «En esta demo solo se anotan los nombres…» y «Los ciclos de las baterías no se piden aquí» dicen lo que hay. No lo cambien por frases de venta.
3. **Facturar con nota.** «18,5 ha × $ 30.000 = $ 555.000», el aviso en vivo y «Nota para el cliente» me protegen y se ven en Pagos como «Nota del operador».
4. **Una sola tolerancia dicha como referencia.** «Referencia de la demo: 5 %; se pacta con el operador (por definir)» en cuatro pantallas.
5. **«Responder al cliente» con valor en pesos y «Nota original, antes del ajuste».** Me hace parte, no acusado.
6. **La línea «por definir» de la flota y los costos**, con la frase «todo el proyecto lo ve quien lo abre»: dice la verdad de la demo.
7. **El sector vigilancia con su vocabulario en el menú** («Rondas y evidencias», «Mapa y sectores», «Novedades en el tiempo»), los responsables («Supervisor de seguridad (ejemplo)»), la tarifa fija por vuelo en Pagos sin comparar hectáreas y el mapa satelital con los sectores trazados.

## 7. Huecos H1–H9 desde este rol, ahora

- **H1 (qué es Otear): resuelto para mí.** «Otear no hace los vuelos» está en la primera pantalla.
- **H2 (cómo entran mis vuelos): mejorado.** «por definir» en el formulario y en la landing; falta saber si habrá enlace o carga.
- **H3 (precio y cobro): me estorba un poco.** «Costo para operadores: por definir»; sigue sin respuesta.
- **H4 (de quién son los datos): mejorado.** La línea está en tres pantallas; falta en Documentos y la mezcla de pilotos (O3-04).
- **H5 (qué sería un piloto): indiferente.**
- **H6 (primer minuto): resuelto para este rol.** Solo se rompe si cambio de sector con la barra (O3-03).
- **H7 (real vs simulado): mejorado.** Las cifras de ejemplo están claras; quedan las fugas de vocabulario (O3-02) y el «mejoró» de O3-07.
- **H8 (historia con números): mejorado**, salvo O3-07.
- **H9 (qué se mide de quien entra): indiferente.** No vi aviso de conteo (solo con token).

## 8. Qué le preguntaría a una persona real como yo (sobre su pasado)

1. La última vez que registró horas de vuelo de una aeronave: ¿quién las anotó, en qué momento (el mismo día o después), con qué dato (reloj de la batería, bitácora del control, memoria) y cuánto se desvió de lo real?
2. La última vez que firmó un acta o un informe de un vuelo para un cliente: ¿qué parte revisó antes de firmar, qué parte era del cliente y qué hizo con lo que no era suyo?
3. La última vez que cotizó un trabajo en otro sector distinto del habitual (vía, obra, mina, vigilancia): ¿qué le cambió en el pedido, en lo que entrega y en cómo lo llamó el cliente?

## 9. Límites: lo que no pude verificar

- No vi la demo con un operador real ni con archivos reales: en la demo solo se anotan nombres.
- La construcción y la minería las revisé por código (imagen en `demo-data.ts:180` y `:254`, y el tipo de servicio), no en pantalla. La vigilancia sí la recorrí completa, en escritorio; en móvil solo vi Servicios, Pagos y Equipos.
- «Descartar con motivo», «Verificar un archivo descargado» y la sección «Informes y actas firmados» de Documentos solo los leí de pasada (Documentos muestra «Informes y actas firmados» con el acta «Faltan firmas»); no los probé a fondo porque tocan a la interventora y al gerente.
- La lista de preparación (O-13) no la reabrí; las baterías con opciones en la bitácora (`log-dialog.tsx:123-140`) las vi solo en el código.
- En esta copia no existen los modelos DJI, así que no vi el dron 3D ni la condición de piezas funcionando (O3-12); la simulación del vuelo tampoco.
- El estado de la demo vive en memoria y se pierde al recargar; el vocabulario elegido se guarda en el navegador. Mi servidor de desarrollo mostró un aviso «3 Issues» del propio Next en una pantalla: no lo atribuyo al producto.
- No se resolvió ni propongo la política de fotos sin GPS ni «G6»; la matriz de Dorfman sigue provisional. Las decisiones del dueño (sin vista propia del operador, firma sin verificación de identidad, tolerancia «de referencia por definir», sin tope de rondas) no las cuento como hallazgos.

## Dictamen

**Me conviene más que hace una pasada y ya puedo defender mi cifra.** Entregué con aeronave, facturé con nota, respondí un ajuste y vi mi tolerancia dicha como «por definir» en cuatro pantallas. La línea nueva sobre mi flota es honesta. Lo que todavía me frena: (1) en sectores distintos a la finca el producto conserva palabras y fotos de cultivo y mezcla vocabulario al cambiar de pestaña (O3-01 a O3-03); (2) el informe que firmo como operador incluye cosas del cliente (O3-05) y la entrega me suma horas que no declaré (O3-06); (3) mi flota sigue mezclada con el piloto de mi competidor y los papeles no tienen la línea «por definir» (O3-04). Lo recomendaría a un colega que vuele fincas; a uno que vuele vías, obras, minas o parques le diría que espere a que arreglen las palabras y las fotos.
