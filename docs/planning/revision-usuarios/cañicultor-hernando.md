# Revisión como cañicultor: Hernando, 56 años

Son hipótesis de una persona simulada, no resultados de usuarios reales. Ninguna cifra de este informe es de mercado; las únicas cifras son las que muestra la demo (datos sintéticos). Recorrido del 30 de octubre de 2026 en escritorio (1440×900) con Chromium propio; la landing también en móvil (390×844). Código sin editar.

## 1. Persona y tareas

- **Persona:** Hernando, 56 años, dueño de la hacienda Santa Rita (caña de azúcar, le entrega al ingenio). WhatsApp todos los días, Excel a duras penas, computador de escritorio. Un operador de dron le presta el servicio; hoy le llegan PDFs y fotos sueltas. Entiende «lote», «suerte», «hectáreas», «pago». No entiende NDVI, hash, SHA-256 ni «hallazgo» en sentido técnico.
- **T1.** Saber qué lote o suerte va peor y desde cuándo (Evolución / Mapa).
- **T2.** Comprobar si le cobraron las hectáreas que realmente se volaron (Pagos, «Antes de pagar»).
- **T3.** Encontrar el informe del último vuelo para mostrárselo a su administrador.
- **T4.** Entender, sin explicación, qué sugiere el asistente «Próximo vuelo» y el de imágenes («Sugerido por IA · ejemplo») y si se fía.
- **T5.** Entender qué parte de lo que ve es real y cuál es de ejemplo.

## 2. Prueba de 5 segundos (escrita antes de leer el resto de la landing)

Solo vi la primera pantalla (titular «Mire su operación desde arriba sin perder el vuelo de la semana pasada», un planeador blanco que dice OTEAR y VIPER, botones «Abrir la demo» y «Hablemos»).

- **¿Qué hace Otear?** Creo que es una empresa que vuela drones sobre una finca o una obra y le muestra las imágenes. «Reúne los vuelos de dron de su operación» lo leo como «ellos vuelan y lo reúnen». No sé si me prestan el vuelo o si es un programa para los vuelos que ya me hacen.
- **¿Para quién es?** Para alguien que «supervisa» algo. Me aparece «una finca» a mitad del párrafo, pero también «una vía, una obra, un predio». No sé si es para un cañicultor como yo o para una constructora.
- **¿Qué haría ahora?** Oprimiría «Abrir la demo»; «Hablemos» me da un poco de pereza (suena a que me van a llamar a vender). «Datos sintéticos» no sé qué es; «Funciona offline» no lo entiendo.

## 3. Primer minuto en la demo

Elegí «Finca o cultivo» en «¿Qué opera usted?» y abrí «la demo de una finca». Caí en **Programación**: un aviso azul «Entró como finca o cultivo: ya ve «lotes» y «hallazgo de campo» como en su sector» (bien, pero dura poco), un banner «Sugerido por IA · ejemplo: 1 de 3 lotes merece un vuelo pronto», un calendario de octubre, «Tu agenda: 1 vuelo» y un mapa satelital con tres lotes cruzados por líneas amarillas.

Dudé en tres sitios. (1) El botón grande es «Programar vuelo»: yo no programo los vuelos, los programa el operador. (2) Hacia abajo hay una lista de 16 puntos de «Prevuelo» (permisos, brújula, baterías) que no es asunto mío. (3) El menú de la izquierda tiene nueve nombres a 12 px y no sé cuál contesta mis dos preguntas; por el nombre probé «Evolución del cultivo» (acerté) y «Pagos y costos» (acerté). El único camino que adiviné fue por los nombres «del cultivo» y «Pagos»; «Mapa y lotes» y «Vuelos y evidencias» no los habría tocado de primera.

## 4. Tareas: ¿pude terminarlas?

| Tarea | Resultado | Por qué |
|---|---|---|
| T1. Qué lote va peor y desde cuándo | **Sí, con dudas** | En «Evolución del cultivo» la lista pone arriba «Lote 4 baja de vigor» y la gráfica «Vigor de cada lote en el tiempo» muestra la línea naranja cayendo. Pero «desde cuándo» no está escrito con fecha: dice «Hace dos vuelos 0,75» y «Desde el 18 de jul +0,12» (N-05). En «Mapa y lotes» no pude responder nada (N-14). |
| T2. ¿Me cobraron lo que se voló? | **Sí, con dudas** | «Pagos y facturas» → FV-2026-034 → «Verificación del área»: Pedido 27,9 ha, Cubierto 26,4 ha, Facturado 27,9, chip rojo «Facturó de más» y «Facturó 1,5 ha más de las cubiertas (+5,7 %). Pida la justificación antes de pagar». Entendí la respuesta. No me dice cuánto es en pesos y las otras pantallas no coinciden con «26,4 ha» (N-01, N-02). |
| T3. Informe del último vuelo para el administrador | **Con ayuda** | Lo busqué en «Informes y cifras» (abre en «Atención 11», una lista de pólizas y soportes) y tuve que adivinar la pestaña «Informe», que es un «informe consolidado» de todo el periodo. El informe del vuelo está en «Vuelos y evidencias» → pestaña «Informe», rotulado «BORRADOR DE DEMOSTRACIÓN» (N-03, N-04). |
| T4. Entender las sugerencias de IA y si me fío | **Sí en el de «Próximo vuelo»; a medias en el de imágenes** | La del próximo vuelo cita los números que yo mismo veo en la gráfica y dice «Nada se programa hasta que usted lo apruebe». El de imágenes se apoya en fotos que la propia demo llama «ilustrativas»; no tengo cómo comprobar nada (N-06). |
| T5. Qué es real y qué es de ejemplo | **No del todo** | Hay avisos por todas partes, pero en pedazos y pequeños, y el mapa satelital es una imagen real de un lugar real con lotes inventados (N-07). |

## 5. Hallazgos (ordenados de más a menos grave)

### N-01 Las cifras del mismo vuelo no coinciden entre pantallas
- Eje: caso-de-uso
- Dónde: `/vuelos` (mapa «Resumen» y «Simulación»), `/informes` (pestaña Atención), `/pagos`, `src/features/flights/review/flight-report.tsx:83-84`, `src/features/flights/replay/replay-bar.tsx:227`
- Lo que ve la persona: En Pagos: «Cubierto 26,4 ha» y, en el informe del vuelo, «Debriefing: Vuelo cerrado antes de terminar las últimas líneas de Lote 5 por batería. Quedaron 1,5 ha sin cubrir». Pero el mapa de «Resumen» dibuja líneas de vuelo sobre los tres lotes completos, y la «Simulación» dice «Recorrido 0,0 de 11,4 km» y «Área alcanzada 0,0 de 27,9 ha» (el informe y «Informes y cifras» dicen 11,6 km). En «Informes y cifras» el vuelo del 24 de octubre tiene «Clima: Despejado · 12 km/h» y «Autorización AUT-2026-0412»; el informe del mismo vuelo dice «Autorización y espacio aéreo: No registrada en la demo» y «Clima durante el vuelo: No registrado en la demo».
- Qué entiende o hace mal: No sé cuál cifra creer. Si el mapa me muestra todo cubierto y la factura cobra todo, el operador parece tener razón; si la bitácora dice 1,5 ha sin cubrir, no. Pensaría que el sistema se equivoca o que alguien «arregló» una cifra.
- Por qué importa para su tarea: T2 es comparar «lo volado» con «lo cobrado»; si las pantallas se contradicen, el cálculo pierde crédito. Y T3: si le muestro el informe a mi administrador y dice «No registrado» cuando otra pantalla sí lo tiene, queda mal.
- Propuesta: (a) que la ruta dibujada y la «Simulación» marquen en otro color las líneas que la bitácora declara sin volar (el caso de ejemplo de Lote 5), o que lo digan: «Ruta planificada; la bitácora del operador declara 1,5 ha sin cubrir»; (b) un solo valor de km y de clima/autorización en todas las pantallas (el informe debe leer los mismos datos de la bitácora); (c) en la «Simulación», cambiar «Área alcanzada» por «Área planificada» mientras no se alimente de la bitácora, para que no compita con el «Cubierto» de Pagos. No decidir en silencio cuál es la cifra «verdadera»: es un dato de ejemplo, pero debe ser el mismo en todas partes.
- Gravedad: confunde
- Evidencia: navegador (Vuelos → Informe; Vuelos → Simulación; Informes y cifras; Pagos) y lectura de código
- Huecos relacionados: H7

### N-02 «Verificación del área» responde la pregunta en hectáreas, pero no en pesos ni en el primer vistazo
- Eje: componente
- Dónde: `/pagos` → `src/features/billing/area-check-card.tsx:42-90`, `src/features/billing/billing-view.tsx:370`
- Lo que ve la persona: Arriba, la factura FV-2026-034: «Total de la factura $ 850.000 / Pagos registrados $ 400.000 / Saldo por pagar $ 450.000». Para ver «Verificación del área» hay que bajar; con 900 px de alto la tarjeta queda debajo de la barra fija «Registrar pago». «Facturado» es una casilla con «27,9» y «Lo que dice la factura». La lista de la izquierda marca las facturas ya pagadas con «$ 0».
- Qué entiende o hace mal: Entiendo «facturó 1,5 ha de más», pero yo pienso en plata: ¿cuánto es eso? No lo sé. La casilla «Facturado» parece que me toca escribirla a mí (aunque ya viene llena) y no sé si está sacada de la factura o es un dato que pusieron. La factura pagada con «$ 0» me hace pensar que no se cobró nada.
- Por qué importa para su tarea: La pregunta de T2 es «cuánto me cobraron de más». Hoy tengo que hacer la cuenta yo.
- Propuesta: Subir la tarjeta a debajo de «Saldo por pagar» y poner la frase que contesta la pregunta primero: «Facturó 1,5 ha más de las que el operador dice haber cubierto». Si la factura trae precio por hectárea, añadir «Eso equivale a unos $ X» (de ejemplo); si el dato no existe en la factura, decir «Falta el precio por hectárea para calcular cuánto es» (dato que falta, no inventarlo). Rotular la casilla «Hectáreas que dice la factura (puede corregir)». En la lista, mostrar el total de la factura pagada, no «$ 0».
- Gravedad: confunde
- Evidencia: navegador (`/pagos`, FV-2026-034) y lectura de código
- Huecos relacionados: H3 (precio), H7

### N-03 No es obvio dónde está «el informe del último vuelo»
- Eje: texto / componente
- Dónde: menú lateral (`src/features/config/config.ts:35-48`), `/informes` (`src/features/reports/reports-view.tsx:255, 544`), `/vuelos` pestaña «Informe» (`src/features/flights/review/flight-report.tsx:165`)
- Lo que ve la persona: En el menú: «Informes y cifras» y «Vuelos y evidencias» (cuyo título de página es «Archivo de vuelos»). «Informes y cifras» abre en una pestaña «Atención 11» con «Póliza del equipo… tiene la fecha declarada vencida», «Soporte del piloto espera revisión»; la pestaña «Informe» es un «Informe consolidado… para socios, el ingenio o el responsable» de todo el periodo (18 de jul a 24 de oct). El informe de un solo vuelo está en «Vuelos y evidencias» → «Informe», bajo el título «Preparar borrador».
- Qué entiende o hace mal: Busqué «informe» en «Informes y cifras» y encontré dos cosas distintas con el mismo nombre. Lo que había pedido (el del último vuelo) es «Preparar borrador», una palabra que me hace pensar que no está terminado.
- Por qué importa para su tarea: T3 es lo que le va a mostrar al administrador y al ingenio; es la razón por la que paga el servicio.
- Propuesta: En «Informes y cifras», abrir en la pestaña «Informe» y encabezarla con «Informe del último vuelo: 24 de oct de 2026» y un botón «Ver / imprimir», dejando «Informe de todo el periodo» como segunda opción. En «Vuelos y evidencias» llamar la pestaña «Informe del vuelo». Cambiar «Preparar borrador» por «Qué incluir en el informe». Que «Atención» no sea la primera pestaña para quien llega a «Informes»: su contenido (póliza, soporte del piloto) es del operador; en una pestaña propia o en Documentos.
- Gravedad: confunde
- Evidencia: navegador (Informes y cifras; Vuelos → Informe)
- Huecos relacionados: H6

### N-04 El informe no está escrito para un administrador ni para el ingenio
- Eje: texto / caso-de-uso
- Dónde: `/vuelos` → Informe (`src/features/flights/review/flight-report.tsx:51, 83-84`), `/informes` → Informe consolidado (`src/features/reports/reports-view.tsx:544-611`)
- Lo que ve la persona: Encabezado «OTEAR · BORRADOR DE DEMOSTRACIÓN»; «Calidad de los datos: Sensor: Cámara RGB · GSD: 2.1 cm/píxel · Traslape: 75 % · Puntos de control en tierra: No se usaron · Entregables: …Ortomosaico (GeoTIFF)»; las observaciones con coordenadas crudas («Prioridad alta · 3.77284, -76.32027»); «Frente a vuelos anteriores: persistente (ya reportado en 4 vuelos anteriores)»; las cinco observaciones en «Pendiente de revisión». El consolidado es texto plano con «BAT-A10 (1 vuelos)». No dice qué lote va peor ni resume en una frase qué hay que hacer.
- Qué entiende o hace mal: Entiendo la fecha, el piloto y los lotes; no entiendo GSD, traslape, ortomosaico. No sé qué decirle al administrador de «prioridad alta · 3.77284». Y el dato que sí le importa (hay 1,5 ha sin cubrir y Lote 4 viene bajando) está enterrado en «Debriefing».
- Por qué importa para su tarea: Un informe que no se entiende no se muestra. El valor del producto para Hernando es «poder mostrarle algo claro al administrador y al ingenio».
- Propuesta: Primera línea del informe con lo que importa, calculada de los datos de ejemplo (por ejemplo: «Lote 4: el vigor bajó en los dos últimos vuelos. Quedaron 1,5 ha sin cubrir en Lote 5. 5 puntos por revisar en campo»). Pasar «Calidad de los datos» a un bloque plegado «Detalle técnico» con palabras de uso («altura a la que se voló», «traslape de las fotos»). Cambiar coordenadas por «Lote 3, cerca de…» o, si no hay, ponerlas pequeñas. Mantener el rótulo de demostración, pero ponerlo como sello discreto y no como título.
- Gravedad: confunde
- Evidencia: navegador y lectura de código
- Huecos relacionados: H7, H8

### N-05 Evolución dice cuál lote baja, pero no «desde cuándo» ni qué significa 0,62
- Eje: texto
- Dónde: `/evolucion`, `src/features/evolution/issues.ts:196-212`, `src/features/evolution/evolution-view.tsx:245, 336, 563`
- Lo que ve la persona: Ficha de «Lote 4 baja de vigor»: «Cae en dos vuelos seguidos: 0,75 → 0,72 → 0,62.» y tres datos: «Vigor ahora 0,62 · Hace dos vuelos 0,75 · Desde el 18 de jul +0,12». La leyenda: «Color del lote: vigor, de rojizo (bajo) a azul (alto)». El rótulo de la lista: «Problemas detectados»; el rótulo del vuelo: «6 problemas en este vuelo».
- Qué entiende o hace mal: (1) «Desde el 18 de jul +0,12» suena a que el lote mejoró desde julio, justo cuando la ficha lo marca «Urgente». (2) «Hace dos vuelos» no me dice qué fecha fue; la gráfica sí lo muestra (el pico está el 19 de sept) pero el texto no. (3) No sé si 0,62 es mucho o poco; la única pista (0 a 1) no está escrita. (4) «Azul = alto» en un cultivo me desconcierta: esperaría verde. (5) «Detectados» me hace creer que el programa los encontró; en realidad varios los marcó el operador.
- Por qué importa para su tarea: T1 es «cuál va peor y desde cuándo». Hoy tengo que leer la gráfica para contestar la segunda parte.
- Propuesta: En la ficha: «Lote 4 viene bajando desde el 19 de sept (0,75). Hoy está en 0,62; los otros dos lotes están en 0,79 y 0,80.» Cambiar «Desde el 18 de jul +0,12» por «Comparado con la primera vez que se voló (18 de jul): +0,12» o quitarlo cuando el lote va cayendo. Añadir bajo «Vigor medio 0,74» una frase en palabras: «El vigor va de 0 (poco) a 1 (mucho); es una medida de ejemplo de qué tan sano se ve el cultivo desde arriba». Cambiar «Problemas detectados» por «Puntos que conviene revisar».
- Gravedad: confunde
- Evidencia: navegador (`/evolucion`, ficha de Lote 4) y lectura de código
- Huecos relacionados: H7

### N-06 Los asistentes de IA son comprensibles, pero no me dicen de quién son los datos ni a quién llega lo que «preparo»
- Eje: texto / componente
- Dónde: `/programacion` → `src/features/agents/next-flight-assistant.tsx:132-135, 232, 263-275`; `/vuelos` → «Hallazgos de campo» → `src/features/agents/suggestion-summary.tsx`, `src/features/flights/review/flight-review-view.tsx:500`
- Lo que ve la persona: Banner «Sugerido por IA · ejemplo — 1 de 3 lotes merece un vuelo pronto — Lote 4: El vigor bajó en cada uno de los últimos 2 vuelos (0,75 → 0,72 → 0,62)». En el cuadro: «Se calcula con reglas sobre los 5 vuelos completados de esta demo; en producción la generaría un modelo con sus vuelos reales. Nada se programa hasta que usted lo apruebe.», «Oportunidades de mejora», «Cómo se calculó: …baja sostenida del vigor (40) o avance detenido (35)… Desde N puntos se propone». Botón «Preparar este vuelo». En Vuelos: «2 candidatos tras revisar las 505 fotos de este vuelo · Sugerencias anteriores: 2 de 3 revisadas se confirmaron. Son pocas para medir su acierto. Ninguna es un hallazgo hasta que usted la confirme.» Y bajo cada una: «Imagen ilustrativa y sugerencia de ejemplo: en producción la propondría un modelo».
- Qué entiende o hace mal: Lo del próximo vuelo lo entiendo y me fío: dice lo que yo ya vi en la gráfica, con los mismos números, y no hace nada sin mi permiso. Dudo en cuatro cosas. (1) «IA» y «modelo» no me dicen nada; «ejemplo» sí. (2) El cuadro dice a la vez «se calcula con reglas» y «la generaría un modelo»: no sé cuál es. (3) «Preparar este vuelo»: ¿se lo envío al operador, a mi administrador, o solo me llena un formulario? (4) El de imágenes me da «candidatos tras revisar 505 fotos», pero esas fotos son ilustrativas y no puedo ver la mía: no tengo cómo comprobar nada; solo lo creería si me enseñan la foto de mi lote con la marca. La frase «2 de 3 se confirmaron» sí me da confianza porque admite que son pocas.
- Por qué importa para su tarea: T4 es decidir si me fío. La confianza viene de poder comprobar con lo que ya veo y de saber quién recibe qué.
- Propuesta: Cambiar «Sugerido por IA» por «Sugerencia automática · ejemplo» en el texto largo o añadir en el tooltip: «Un cálculo con reglas sobre sus vuelos; no decide por usted». Unificar la frase del cuadro: «En esta demo se calcula con reglas sencillas sobre los vuelos de ejemplo. Una versión real usaría sus propios vuelos.» (el código y el CLAUDE.md dicen reglas; la frase «un modelo» promete algo que no está construido). Bajo «Preparar este vuelo»: «Se abre el formulario con estos datos; no se avisa a nadie hasta que usted lo guarde». Pasar «Cómo se calculó» a palabras («pesa más si el vigor cae dos vuelos seguidos, si el lote lleva mucho sin volarse o si lo señalado se repite») y dejar los puntajes numéricos en un segundo nivel. En las sugerencias de imágenes, mostrar un recorte de la foto con la marca, aun siendo ilustrativa, y decir «Foto de ejemplo».
- Gravedad: confunde
- Evidencia: navegador (banner, cuadro y pestaña de hallazgos) y lectura de código
- Huecos relacionados: H7

### N-07 Qué es real y qué es de ejemplo está repartido y es chiquito
- Eje: componente / texto
- Dónde: toda la demo; `src/components/app-shell.tsx:297`, `src/features/landing/landing-page.tsx:186-190`, `src/features/evolution/evolution-view.tsx:393-399`, mapas con «Contorno de ejemplo» / «Geometrías de ejemplo»
- Lo que ve la persona: Una píldora «Demo interactiva» arriba; en cada mapa una etiqueta «Contorno de ejemplo» (cuando la veo); al pie de cada página, a 12 px y gris, «Datos de ejemplo · escenario del 25 oct. 2026»; en «Evolución», un «Sobre estos datos» plegado que dice «Los valores por zona son de ejemplo». La landing dice «Datos sintéticos» y «Funciona offline». El mapa es una imagen satelital real de Guacarí con los lotes dibujados encima.
- Qué entiende o hace mal: «Sintéticos» no es una palabra mía; «de ejemplo» sí. Al ver una foto real de unos cultivos reales con «Lote 3, Lote 4, Lote 5» pintados, concluyo que los lotes son reales y que el 0,62 salió de esa imagen. «Funciona offline» me hace pensar que no necesita internet, y el mapa necesita internet. Los nombres «AeroVisión del Valle», «Camilo Torres», la factura FV-2026-034 y el «$ 450.000» parecen de verdad.
- Por qué importa para su tarea: T5 era saber qué es real. Hoy lo averiguo leyendo letra pequeña al final de la página, o no lo averiguo.
- Propuesta: Un solo rótulo visible junto al título de cada pantalla, a 14 px o más: «Ejemplo: los nombres, las facturas y los valores del cultivo son inventados. Solo el mapa de fondo es una imagen real de la zona.» (o la frase que corresponda). Sustituir «Datos sintéticos» por «Datos de ejemplo» en la landing y quitar «Funciona offline» mientras el mapa necesite internet. Sacar el «Sobre estos datos» de Evolución del plegable y dejar una línea fija debajo de la leyenda. Pagos ya lo hace bien («Datos de ejemplo. Registrar un pago solo cambia esta sesión; no se mueve dinero»): copiar ese tono.
- Gravedad: confunde
- Evidencia: navegador (todas las pantallas) y lectura de código
- Huecos relacionados: H7

### N-08 Cinco nombres distintos para lo mismo y varias palabras de oficina o laboratorio
- Eje: texto
- Dónde: `/evolucion` («problemas»), `/vuelos` («Hallazgos de campo», «observaciones»), IA («candidatos», «sugerencias»), `/informes` («Atención»), `/pagos` («Acuse de recibo de la factura registrado», «Aceptación de la factura registrada», `src/features/billing/readiness.ts:95,102`), landing (`landing-page.tsx:36` «huella digital», `:426` «SHA-256 real»), `/evolucion` («índice NDVI», `evolution-view.tsx:397`)
- Lo que ve la persona: El mismo punto en un lote aparece como «problema» en Evolución, «hallazgo de campo» en Vuelos, «observación» en el informe, «candidato» o «sugerencia» si lo propuso el programa, y «atención» en Informes. En la landing «Informes firmados con huella digital» y «Firma digital: SHA-256 real».
- Qué entiende o hace mal: Pensé que «problemas», «hallazgos» y «observaciones» eran tres listas distintas. «Acuse de recibo» y «aceptación de la factura» son términos de facturación electrónica que quizá conozca el contador, no yo. «Huella digital» la asocio con el dedo; SHA-256 y NDVI, ni idea.
- Por qué importa para su tarea: Si cada pantalla nombra distinto lo mismo, no puedo seguir un punto desde el mapa hasta el informe ni explicárselo a mi administrador.
- Propuesta: Una palabra por cosa y que la use todo el recorrido; con el vocabulario por sector ya existe el mecanismo (`useTerm`). Para el agro, propuesta a probar con él: «punto por revisar» (lo que marca el operador o el programa) y «novedad confirmada» (cuando yo lo confirmo). «Acuse de recibo» → «Marcar que recibí la factura»; «Aceptación» → «Marcar que acepto la factura». «Huella digital» → «sello que muestra si el informe fue cambiado» (en español de campo: «sello de que no lo han alterado»); en la demo, quitar «SHA-256 real» de las cifras visibles de la landing o moverlo a la letra pequeña. En «Sobre estos datos», cambiar «índice NDVI» por «medida del verdor del cultivo (NDVI)».
- Gravedad: confunde
- Evidencia: navegador y lectura de código
- Huecos relacionados: H7

### N-09 El texto de navegación y de las cifras clave es muy pequeño para quien lo lee desde un escritorio a 56 años
- Eje: componente
- Dónde: `src/app/globals.css` (tokens), menú lateral (`src/components/app-shell.tsx`), `src/features/billing/area-check.module.css`
- Lo que ve la persona: Medido en la pantalla: los nueve nombres del menú lateral, 12 px en gris (peso 550); los rótulos «Pedido», «Cubierto», «Facturado» y sus notas («Suma de las zonas del vuelo (lotes)», «Según el registro de vuelo del operador»), 12 px en gris (`rgb(100,108,113)`); la fecha, el operador y el estado de las facturas, 12 px; las leyendas de los mapas, 12 px; en la landing, «Sin registro · Datos sintéticos · Funciona offline» y las etiquetas de cada sector, 12 px. El mensaje clave «Se cubrió el 94,7 %… Facturó 1,5 ha más…» va a 14 px y en rojo. En una página típica hay unos 40 a 60 textos de 12 px y unos 20 de 13 px.
- Qué entiende o hace mal: Lo importante lo puedo leer, pero tengo que acercarme a la pantalla para el menú y para las notas que explican de dónde sale cada número, que son justo las que me dan confianza.
- Por qué importa para su tarea: Esas notas son la prueba de T2 y T5. Si no las leo, el programa solo me parece una cifra.
- Propuesta: Es una hipótesis para probar con personas de esa edad, no una norma: subir el menú lateral y las notas de las tres cifras de «Verificación del área» a 14 px y con más contraste; dejar 12 px solo para cosas realmente secundarias (créditos de mapa). Respetar el piso de 12 px del proyecto, que aquí se cumple; el asunto es qué cosas se ponen en el piso.
- Gravedad: menor
- Evidencia: navegador (tamaños computados en `/pagos`, `/evolucion`, `/vuelos`, `/informes`)
- Huecos relacionados: —

### N-10 El primer minuto cae en Programación, que es del operador, y no en sus dos preguntas
- Eje: componente
- Dónde: `/programacion` (primera pantalla de la demo), `src/features/entry/`, `src/features/flights/planning/scheduling-view.tsx`
- Lo que ve la persona: Título «Programación», botón «Programar vuelo», calendario, «Tu agenda: 1 vuelo», lista de 7 etapas con «Prevuelo 3 de 16 ítems · 2 sin soporte» y «Permisos… sin documento». La barra superior me deja saltar entre «Agricultura, Carreteras, Construcción, Vigilancia, Minería». El aviso de bienvenida desaparece solo.
- Qué entiende o hace mal: Siento que entré a la oficina del operador. El único contenido que me interesa en esa pantalla es el banner de IA, y está al lado de un botón que no es mío.
- Por qué importa para su tarea: Si no adivino «Evolución del cultivo», no llego a lo que sí vale para mí.
- Propuesta: Que el aviso de bienvenida diga a dónde ir: «Para ver qué lote va peor: Evolución del cultivo. Para revisar un cobro: Pagos y costos», con dos enlaces. No es un módulo nuevo: es una frase y dos enlaces en un aviso que ya existe. Que el aviso no se cierre solo (o que quede en la «Guía de la demo»).
- Gravedad: confunde
- Evidencia: navegador (primer minuto)
- Huecos relacionados: H6, H8

### N-11 La primera pantalla de la landing no dice si Otear vuela o si ordena vuelos que otro hace, ni que sirve a una finca como la mía
- Eje: texto / componente
- Dónde: `/` → `src/features/landing/landing-page.tsx:161-190`
- Lo que ve la persona: Titular «Mire su operación desde arriba sin perder el vuelo de la semana pasada»; subtítulo «Otear reúne los vuelos de dron de su operación, sea una finca, una vía, una obra, un predio o lo que usted supervise, en un solo lugar»; un planeador grande con «OTEAR» y «VIPER» pintados. La aclaración «No le pedimos cambiar de operador de dron» está casi al final (`:450`). En la demo, el equipo ilustrado es un «DJI Mavic 3 Enterprise»; el planeador de la portada no aparece.
- Qué entiende o hace mal: El avión con el nombre de la empresa me dice «ellos vuelan». «Su operación» es lenguaje de oficina; yo digo «mi finca» o «mis suertes». «Convierte lo que vio en tareas e informes firmados» me suena a un programa pesado.
- Por qué importa para su tarea: Si pienso que Otear presta el vuelo, la demo no me cuadra con el operador que ya tengo. Es el hueco H1.
- Propuesta: No decido el titular; propongo una línea de apoyo bajo el título, visible arriba: «Otear no vuela: reúne los vuelos que ya le hace su operador para que usted los compare y revise lo que le cobran.» Para el cañicultor, el botón «Abrir la demo de una finca» (que hoy está en el selector de más abajo) debería ser visible desde el primer pantallazo. Un chip del hero de «Datos sintéticos» → «Datos de ejemplo». En la landing, la tarjeta «Fincas e ingenios» ya habla bien («lote o suerte», «hectáreas cubiertas antes de pagar al operador»): subirla, o dejar esa frase como segunda línea del hero para quien elige agricultura.
- Gravedad: confunde
- Evidencia: navegador (hero, escritorio y móvil) y lectura de código
- Huecos relacionados: H1, H2

### N-12 Los elementos vistosos no me ayudan en ninguna de las cinco tareas, y uno compite con una cifra de Pagos
- Eje: componente
- Dónde: `/programacion` («Equipo asignado», `src/features/flights/planning/drone-hangar.tsx:24-39`), `/vuelos` («Simulación», `src/features/flights/replay/replay-bar.tsx`), galería de modelos (`src/features/drones/drone-gallery.tsx`)
- Lo que ve la persona: Al final de Programación, un dron en 3D con «Arrastra para girar», «Modelo ilustrativo · no representa el equipo exacto» y «Ver otros modelos». En Vuelos, un botón «Simulación» sobre el mapa: una repetición del recorrido con «Reproducir, 1×…16×, Seguir al dron» y datos de altura y velocidad «estimados a partir de la ruta».
- Qué entiende o hace mal: El dron 3D y la galería son bonitos pero no sé qué decisión me ayudan a tomar; yo no elijo el equipo. La simulación sí me gusta mirarla una vez, pero si no está atada a la bitácora, muestra el vuelo completo, y al lado estoy tratando de comprobar que faltó 1,5 ha. En la simulación el panel dice «Aeronave: Otear · ilustrativa · Multirrotor compacto», mientras la ficha del vuelo dice «DJI Mavic 3 Enterprise» y la portada muestra un planeador: tres aviones distintos para un mismo servicio.
- Por qué importa para su tarea: Cada elemento vistoso a mitad del camino de T2 y T3 es un lugar donde puedo perder el hilo.
- Propuesta: Dejar el dron 3D y la galería como material de la reunión (no mostrarlos al propietario en la ruta de Programación). Dejar la «Simulación» solo si se ata a los datos de la bitácora (lo que no se cubrió se ve sin pintar) y si su texto «Ilustrativa» queda fijo; así sirve para T2 («ahí está la parte que no se voló»). Que la aeronave de la simulación sea la del vuelo o diga «aeronave genérica» sin la marca «Otear».
- Gravedad: menor
- Evidencia: navegador (Programación, Vuelos → Simulación) y lectura de código; la galería de modelos no la abrí
- Huecos relacionados: H7

### N-13 En caña, hablo de «suertes», edad y corte; el ejemplo me da vigor y nada más para decidir
- Eje: caso-de-uso
- Dónde: `/evolucion`, `/mapa`, `src/features/demo/demo-data.ts` (sitio agrícola), `src/features/config/presets.ts` (preset «Caña de azúcar», «Suertes»)
- Lo que ve la persona: «Lote 3 · Caña · plantilla · 14,1 ha», «Lote 4 · primera soca · 7,1 ha», «Lote 5 · segunda soca · 6,7 ha». La gráfica de vigor. «Conviene ir a campo: riego, plaga o nutrientes». La landing dice «lote o suerte»; la demo, que arrancó de «Finca o cultivo», dice «Lote».
- Qué entiende o hace mal: «Plantilla» y «soca» sí son mías: eso me da confianza. Pero para decidir qué hacer con Lote 4 espero ver cuántos meses lleva desde el corte, cuándo toca el próximo, la variedad y qué se le echó; y no sé qué efecto tendría un 0,62 en toneladas. En el Valle decimos «suerte», no «lote».
- Por qué importa para su tarea: Después de T1 la pregunta es «¿y qué hago con la suerte 4?». Hoy la demo solo me dice «vaya a campo».
- Propuesta: No inventar datos: marcar como dato que falta (y como campo propio, ya que la configuración los permite) la fecha de último corte, la variedad y el producto aplicado, para que la ficha de Lote 4 pueda decir «Lleva N meses desde el corte» con valores de ejemplo. Si el visitante llega por «Finca o cultivo» y pregunta «¿cañicultor?», ofrecer el preset «Caña de azúcar» (que ya existe y dice «Suertes») en el aviso de bienvenida. No prometer que el vigor se traduce en toneladas.
- Gravedad: menor
- Evidencia: navegador (`/mapa`, `/evolucion`) y lectura de código
- Huecos relacionados: H8

### N-14 «Mapa y lotes» no contesta «cuál va peor» y sus colores se parecen a los de la gráfica
- Eje: componente
- Dónde: `/mapa`, `src/features/sites/mapping/site-mapping-view.tsx:258`
- Lo que ve la persona: Título «Mapa y lotes» con la frase «Parta de lo que ya existe y repártalo en lotes. Así los vuelos, hallazgos y costos hablan de lo mismo.» La lista: «Lote 3 (punto azul), Lote 4 (naranja), Lote 5 (gris)», «27,9 ha en total», un botón «Mapear de nuevo». En el mapa los lotes van en azul, naranja y gris.
- Qué entiende o hace mal: Pensé que ese mapa me diría qué lote está peor. No lo hace; es para dibujar los lotes. Los colores azul, naranja y gris se parecen a la escala de vigor de «Evolución» y a las líneas de la gráfica, pero allí significan otra cosa, y en este mapa el naranja del Lote 4 solo es un color de etiqueta.
- Por qué importa para su tarea: T1 menciona «Evolución / Mapa»; un mapa que parece contestar y no contesta cuesta tiempo.
- Propuesta: Bajo el título, una línea: «Aquí se dibujan y miden los lotes. Para ver cuál va peor: Evolución del cultivo» con enlace. No usar naranja/azul de la escala de vigor en los puntos de la lista; usar un color neutro o números.
- Gravedad: menor
- Evidencia: navegador (`/mapa`) y lectura de código
- Huecos relacionados: H6

## 6. Lo que funciona y hay que conservar

1. **La gráfica «Vigor de cada lote en el tiempo» y la lista con «Lote 4 baja de vigor» arriba.** La línea que cae se ve sin explicar; hay tabla de apoyo y la frase «Un solo dato del dron no distingue la causa» no sobrepromete. No tocar al corregir N-05.
2. **«Verificación del área» con Pedido / Cubierto / Facturado y el chip «Facturó de más».** Es la respuesta más clara que vi a T2, y la nota «El área cubierta es la que reporta el operador; Otear no la mide con las imágenes» es honesta. Mejorar (N-02), no reemplazar.
3. **El banner «Sugerido por IA · ejemplo» con la razón en una frase y los mismos números de la gráfica, más «Nada se programa hasta que usted lo apruebe».** También «2 de 3 revisadas se confirmaron. Son pocas para medir su acierto.»: me da confianza precisamente porque no presume.
4. **El aviso de entrada «Entró como finca o cultivo: ya ve «lotes»…» y los nombres «plantilla / soca» en los lotes.** Me hace sentir que está pensado para mí. Conservar y ampliar (N-10, N-13).
5. **El informe del vuelo ya trae la nota de que quedaron 1,5 ha sin cubrir por batería, y la tarjeta de «Hallazgos de campo» pide confirmar o descartar con «No diagnostican»** (el contenido existe; N-01 y N-04 piden ponerlo a la vista y coherente).
6. **La landing en móvil se lee bien:** titular y párrafo a buen tamaño, dos botones grandes, sin desbordes.

## 7. Huecos H1–H9 desde mi lugar

- **H1 (qué es Otear, si presta vuelos):** me estorba mucho; el planeador con el nombre pintado me hizo creer que ellos vuelan (N-11).
- **H2 (cómo entran mis vuelos):** me estorba: yo recibo PDFs y fotos por WhatsApp; no sé quién sube qué ni si el operador tiene que usar Otear también. No lo decido: señalo el hueco.
- **H3 (precio):** me estorba menos al principio, pero a la primera conversación lo pregunto; mejor decir «por definir; se acuerda en el piloto» que callar.
- **H4 (de quién son los datos):** me estorba: son mis facturas y las fotos de mi tierra, y me importa si el operador o el ingenio los ven. Hoy solo dice «todo queda en su navegador», que habla de la demo.
- **H5 (qué sería un piloto):** me es indiferente hasta que decida; después me importa la duración y que no me exijan cambiar de operador.
- **H6 (primer minuto):** me estorba (N-10, N-14).
- **H7 (real vs simulado):** me estorba mucho (N-01, N-06, N-07, N-12).
- **H8 (una historia con números):** me estorba: la demo ya tiene la historia (Lote 4 baja, 1,5 ha facturadas de más), pero hay que encontrarla; la landing no la cuenta (N-04, N-10).
- **H9 (qué se aprende de quien entra):** me es indiferente; solo no quiero sentir que me están midiendo sin que me lo digan.

## 8. Qué le preguntaría a un cañicultor real

1. «Cuénteme la última vez que el operador le entregó un vuelo: ¿qué le llegó, por dónde, y qué hizo usted con eso esa semana?»
2. «Dígame de la última vez que dudó de una factura del dron: ¿qué miró para dudar, a quién llamó y cómo terminó?»
3. «¿Cómo le explicó la última vez a su administrador o al ingenio cómo iba una suerte? ¿Qué le llevó o le mandó?»

## 9. Límites

- Soy una simulación de una persona: no tengo su paciencia ni su error reales. Nada de lo anterior sustituye una prueba con cañicultores.
- Recorrí en escritorio la landing, Programación, Vuelos (Resumen, Hallazgos, Informe, Simulación), Evolución, Mapa, Pagos, Informes, Documentos. En móvil solo el hero de la landing.
- No recorrí Servicios, Equipos, Configuración, la «Guía de la demo» ni la galería de modelos 3D; no verifiqué teclado, lector de pantalla ni movimiento reducido.
- No vi la «Simulación» en movimiento (solo su estado inicial y su texto) ni los dibujos del dron renderizados con aceleración real.
- No probé el formulario de contacto ni la escritura de datos (registrar pago, confirmar una sugerencia), para no tocar el estado de la demo.
- Los tamaños de texto están medidos con Chromium a 1440×900; no sé cómo se verían a 125 % de zoom del navegador.
- «Contradicción» entre pantallas (N-01) la confirmé en la pantalla y en el código de `flight-report.tsx`; no revisé si hay otras fuentes de verdad en `demo-data.ts`.
