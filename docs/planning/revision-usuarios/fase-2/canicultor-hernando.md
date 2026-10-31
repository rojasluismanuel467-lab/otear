# Segunda pasada como cañicultor: Hernando, 56 años

Son hipótesis de una persona simulada, no resultados de usuarios reales. Las únicas cifras son las que muestra la demo (datos sintéticos). Recorrido del 30 de octubre de 2026 sobre `http://localhost:3210` (rama `revision-fase-2`), escritorio 1440×900 con Chromium propio (puerto CDP 9332); la landing también medida a 390 px de ancho. No edité ningún archivo del proyecto. Evidencia marcada «navegador» o «lectura de código».

## 1. Las siete tareas, sin ayuda

| Tarea | Resultado | Qué pasó |
|---|---|---|
| T1. Qué lote va peor y desde cuándo | **Sí** | Elegí «Finca o cultivo» y «Abrir la demo de una finca»: ahora caigo directo en **Evolución**, con un aviso «Empiece por «Evolución»: ahí ve qué lote va peor… Luego «Pagos y costos»…». La ficha dice «Lote 4 baja de vigor. Viene bajando desde el 19 de sept de 2026 (0,75): 0,75 → 0,72 → 0,62», y el detalle trae «Vigor ahora 0,62, en una escala de 0 (poco verdor) a 1 (mucho)», «Empezó a bajar 19 de sept de 2026, con 0,75» y «Los demás hoy Lote 3 0,79 · Lote 5 0,80». Contesta las dos partes de la pregunta con fecha. Pero llego a ella tras cuatro cajas (N2-04). Navegador. |
| T2. ¿Me cobraron lo que se voló? | **Sí, y me fío** | «Pagos y costos» → FV-2026-034: «Facturó 1,5 ha más de las que el operador dice haber cubierto. Son unos $ 45.000 de más, a $ 30.000 por hectárea (el precio cotizado para este servicio). Cifra de ejemplo». La tarjeta ya está justo bajo «Saldo por pagar» y se ve sin bajar a 900 px. Hice la cuenta: 27,9 × 30.000 = 837.000 (total de la factura), 1,5 × 30.000 = 45.000, 837.000 − 380.000 = 457.000 (saldo); las seis facturas suman los $ 3.908.000 del encabezado. Cuadra. Navegador. |
| T3. Informe del último vuelo para mi administrador | **Sí** | «Vuelos y evidencias» dice en su subtítulo «El informe de cada vuelo está en su pestaña «Informe del vuelo»» y la pestaña existe (`/vuelos?tab=informe`). Además un botón «Ver el informe del vuelo» en el resumen. El informe abre con «En breve» (5 frases en palabras de campo). En «Informes y cifras» sigue habiendo dos cosas llamadas «Informe» (N-03). Navegador. |
| T4. Qué sugiere la IA y si me fío | **Sí** | Banner «Sugerencia automática · ejemplo: Lote 4 pide un vuelo pronto». El cuadro dice «se calcula con reglas sencillas sobre los 6 vuelos completados de ejemplo; una versión real usaría los vuelos de su empresa. Nada se programa hasta que usted lo apruebe» y, abajo, «No se avisa a nadie ni se pide el servicio a un operador hasta que usted lo guarde». Me fío del razonamiento porque repite los números de la gráfica (0,75 → 0,72 → 0,62). Navegador. |
| T5. Qué es real y qué es de ejemplo | **Casi** | Franja azul bajo el título en Programación y Vuelos: «Ejemplo, no real. Los nombres, las fotos, las cifras y los lotes dibujados son inventados. Solo el mapa de fondo es una imagen real del lugar.» En la landing: «Datos de ejemplo: nada es real» y «Los mapas necesitan internet». En Evolución y Pagos solo está en el subtítulo y en letra pequeña. Navegador. |
| T6. Abrir un hallazgo y entender la «medida correctiva» | **Sí, con dos dudas** | En «Hallazgos» el encabezado «Medidas correctivas del sitio: Hoy en la demostración es 30 de oct de 2026. Cada medida tiene un responsable y un plazo, y se cierra con una nota» me lo explica sin que nadie me lo cuente. En la ficha: estado («Vencida», «En corrección · Venció hace 14 días»), «Responsable», «Plazo», botones «Pasar a «en corrección»», «Cerrar con nota», «Cambiar responsable o plazo», «Historial de la medida (2)» y «Nada se notifica a nadie: la medida y su historial solo existen en esta sesión de la demostración». «Cerrar con nota» abre un campo «Qué se hizo y con qué evidencia se comprobó (una foto, un acta, una visita)»: se entiende. Las dos dudas están en N2-05. Navegador. |
| T7. ¿Coinciden los números y se leen? | **Sí en lo del vuelo; no del todo en fechas y conteos** | Coinciden entre Vuelos (resumen, simulación, informe) e Informes y cifras: 11,6 km, 505 fotos, 28 min, «Despejado · 12 km/h», AUT-2026-0412, «Cubierto 26,4 de 27,9 ha». Pagos usa las mismas 26,4/27,9. La simulación aclara «por eso muestra la ruta completa aunque el operador haya declarado menos… Solo las hectáreas «según el operador» salen de su bitácora». Quedan desacuerdos en fechas y conteos (N2-01, N2-02). Lectura: el menú lateral ahora está a 14 px; las notas de las cifras de «Verificación del área» y las etiquetas siguen a 12 px, y cuento 30 a 86 textos de 12 px por pantalla (86 en el informe del vuelo). Navegador, tamaños calculados. |

## 2. Estado de N-01 a N-14

| ID | Estado | Por qué (una línea) |
|---|---|---|
| N-01 Cifras que no coinciden | **resuelto** | Mismos km, clima, autorización y hectáreas en Resumen, Simulación, Informe e Informes; las líneas que el operador declara sin volar salen en rojo discontinuo («Sin volar, según el operador») y la simulación explica que dibuja la ruta planificada. Han aparecido otros desacuerdos distintos (N2-01, N2-02). |
| N-02 Verificación del área, pesos | **resuelto** | Dice la diferencia en pesos con su precio («Son unos $ 45.000 de más, a $ 30.000 por hectárea»), la tarjeta está arriba, «Facturado (la factura dice) · Puede corregirla si la factura dice otra cosa» y las pagadas muestran «$ 620.000 pagados», no «$ 0». |
| N-03 Dónde está el informe del vuelo | **mejorado** | Pestaña «Informe del vuelo» con URL, botón en el resumen y «Qué incluir en el informe» en vez de «Preparar borrador». Pero «Informes y cifras» sigue abriendo en «Pendientes 13» y su pestaña «Informe» es el consolidado, sin decir «de todo el periodo» en la pestaña (N2-03). |
| N-04 Informe para el administrador | **mejorado** | Abre con «En breve: Lote 4… bajó en cada uno de los dos últimos vuelos / quedaron 1,5 ha sin cubrir / 3 hallazgos por verificar»; la calidad técnica va en «Detalle técnico» plegado y el rótulo es discreto. Siguen coordenadas crudas («Coordenadas de ejemplo: 3.77284, -76.32027») y la línea «Hallazgo del operador · ejemplo · Pendiente de revisión · Abierta · responsable… · plazo…», larga. |
| N-05 Evolución: desde cuándo y qué es 0,62 | **resuelto** | Fecha de inicio de la caída, escala 0–1 escrita, «+0,12 (sigue por encima de entonces, pero viene bajando)» y «Los demás hoy». «Problemas detectados» ya no existe. |
| N-06 IA: de quién son los datos, a quién llega | **mejorado** | Etiqueta «Sugerencia automática · ejemplo», frase única de «reglas sencillas», y «No se avisa a nadie… hasta que usted lo guarde». Siguen «2 sugerencias de IA que nadie ha revisado» en Informes (palabra «IA»), «Cómo se calculó» con puntajes y la foto de ejemplo sin recorte con la marca. |
| N-07 Real vs ejemplo | **mejorado** | Franja visible «Ejemplo, no real» en Programación y Vuelos, «Datos de ejemplo: nada es real» y «Los mapas necesitan internet» en la landing. En Evolución, Pagos, Informes sigue solo en subtítulo y pie. El mapa real con lotes inventados persiste, ahora avisado. |
| N-08 Cinco nombres | **mejorado** | «Hallazgo» se usa en Evolución, Vuelos, informe y Mapa; desapareció «problema»/«atención» («Pendientes»). Quedan «Acuse de recibo de la factura registrado», «Aceptación de la factura registrada» (Pagos), «huella» en Documentos e informe del vuelo («con su huella y las firmas por rol») y «Ortomosaico» en una factura. |
| N-09 Tamaño del texto | **mejorado** | Menú lateral a 14 px (antes 12). Pagos: notas bajo Pedido/Cubierto siguen en 12 px y hay 61 textos de 12 px en la pantalla (86 en el informe del vuelo): el piso se respeta, pero lo secundario sigue siendo mucho. |
| N-10 Primer minuto cae en Programación | **resuelto** | Entro por la landing y caigo en Evolución con un aviso que nombra los dos pasos («Evolución», luego «Pagos y costos») y señala la «Guía de la demo». |
| N-11 Landing: ¿Otear vuela? | **mejorado** | Titular «La plataforma para comparar los vuelos de dron de su operación» y recuadro «Otear no hace los vuelos. Los hace su operador de dron… Otear es donde usted los reúne, los verifica y los compara». Sigue «su operación» en el titular y el botón para finca solo aparece tras elegir sector, no en el primer pantallazo. |
| N-12 Elementos vistosos | **mejorado** | La simulación ya no compite con Pagos: dice que es ruta planificada y marca lo no volado. Siguen «Aeronave: Otear · ilustrativa · Multirrotor compacto» mientras la ficha dice «DJI Mavic 3 Enterprise» y el dibujo es un planeador. El dron 3D de Programación y la galería no los volví a abrir (sin verificar). |
| N-13 Caña: suerte, corte, variedad | **igual** | Sigue «Lote» (el selector muestra «Sus zonas se llaman Lotes»), «Caña · plantilla · 14,1 ha», sin fecha de corte, variedad ni producto aplicado; no se me ofrece el vocabulario «Suertes». |
| N-14 Mapa y lotes no contesta | **resuelto** | Bajo la lista: «Aquí se dibujan y miden los lotes. Para ver cuál va peor y desde cuándo, vaya a Evolución del cultivo» con enlace. No revisé de nuevo los colores de los puntos en el mapa (cargaba lento); ver N2-06. |

Recuento: **resueltos 5** (N-01, N-02, N-05, N-10, N-14); **mejorados 8** (N-03, N-04, N-06, N-07, N-08, N-09, N-11, N-12); **iguales 1** (N-13); **empeorados 0**.

## 3. Hallazgos NUEVOS

### N2-01 Hay tres «hoy» distintos en la demo
- Eje: caso-de-uso
- Dónde: `/programacion` (banner IA y agenda), `/vuelos?tab=hallazgos`, `/informes`, pie de página; origen probable en `src/features/demo/demo-data.ts` y los textos de seguimiento
- Lo que ve la persona: Pie de cada página: «Datos de ejemplo · escenario del 25 oct. 2026». En Hallazgos y Informes: «Hoy en la demostración es 30 de oct de 2026», «venció hace 14 días». La propuesta del asistente: «Fecha sugerida 27 de oct de 2026 · 07:00». En Programación la agenda aún muestra el vuelo del 29 de oct como «Programado» y el banner dice «Lote 3 y Lote 5 ya están en el vuelo del 29 de oct». La factura FV-2026-034 «vence 30 OCT».
- Qué entiende o hace mal: Si hoy es 30, el vuelo del 29 ya pasó y no debería estar «Programado»; y el asistente me propone volar el 27, tres días atrás. No sé si la fecha del pie es la de hoy o la del escenario.
- Por qué importa para su tarea: «Venció hace 14 días» y «vencida» son afirmaciones sobre fechas; si la fecha de hoy se contradice, pierden crédito justo en la parte nueva (T6, T7).
- Propuesta: Un solo día de referencia en todas las pantallas, dicho una vez junto al rótulo de ejemplo («Hoy en la demostración: 30 de oct de 2026»); que el asistente no sugiera fechas anteriores a ese día y que el vuelo del 29 quede como vencido o pase a una fecha posterior (dato de ejemplo).
- Gravedad: confunde
- Evidencia: navegador (Programación, ventana «Propuesta para el próximo vuelo», Hallazgos, Informes, pie)
- Huecos relacionados: H7, H8

### N2-02 El número de hallazgos y de medidas cambia de pantalla en pantalla sin decir por qué
- Eje: caso-de-uso
- Dónde: `/evolucion` («6 hallazgos en este vuelo»), `/vuelos` (pestaña «Hallazgos 5», «3 hallazgos por verificar · 2 sugerencias automáticas sin revisar»), `/informes` y el informe del vuelo («3 hallazgos»), `/pagos` («3 por revisar»), informe consolidado («Hallazgos: 16»)
- Lo que ve la persona: Para el mismo vuelo del 24 de octubre: 6, 5, 3 y 3. En «Medidas»: «1 abierta · 1 en corrección · 1 cerrada · 1 vencida» (cuatro cifras para tres medidas) y, en la pestaña, «Pendientes (2) · Vencidas (1) · En corrección (1) · Cerradas (1) · Todas (3)». La aclaración «Las vencidas son parte de las abiertas o en corrección» solo está en Informes.
- Qué entiende o hace mal: Entiendo que el 6 incluye el «Lote 4 baja de vigor» que sale de comparar valores y que 5 = 3 + 2 sugerencias, pero la pantalla no me lo dice; leo que alguien perdió hallazgos. Sumar 1+1+1+1 y ver «Todas (3)» me hace dudar del conteo de medidas.
- Por qué importa para su tarea: Es el mismo problema de N-01, pero en hallazgos: si le muestro al administrador «6» y el informe dice «3», quedo mal.
- Propuesta: En Evolución: «6 puntos: 5 hallazgos del vuelo y 1 baja de vigor calculada». En Vuelos y Pagos, la misma frase de desglose («3 por verificar + 2 sugerencias sin revisar»). En «Medidas»: mostrar «vencida» como una marca dentro de abiertas/en corrección y no como otro número que se suma, y que «Pendientes» diga qué incluye.
- Gravedad: confunde
- Evidencia: navegador (Evolución, Vuelos, Informes, Pagos) y lectura de la pantalla de texto
- Huecos relacionados: H7

### N2-03 «Informes y cifras» sigue abriendo en una lista de pendientes del operador, y «Informe» no dice «de todo el periodo»
- Eje: componente / texto
- Dónde: `/informes` (primera vista), pestaña `?tab=informe`
- Lo que ve la persona: Título del último vuelo («Inspección de labores · 24 de oct de 2026», con «Abrir en Vuelos») y debajo la pestaña «Pendientes 13»: «Soporte del piloto espera revisión», «Póliza del equipo… vencida», «Soporte de la operación no tiene archivo asociado». La pestaña «Informe» es el «Informe consolidado» de un periodo, en texto plano, con «Desde / Hasta».
- Qué entiende o hace mal: Si llego aquí buscando el informe, veo papeles del operador. Y al abrir «Informe» recibo un texto largo de todo el periodo, no el informe del vuelo que muestra la cabecera.
- Por qué importa para su tarea: T3 sigue teniendo dos caminos; el correcto está en Vuelos, pero si empiezo por Informes me llevo el equivocado.
- Propuesta: Renombrar la pestaña «Informe de todo el periodo» y añadir en la cabecera del vuelo un botón «Informe de este vuelo» que lleve a `/vuelos?tab=informe`; dejar «Pendientes» como está pero no como primera vista para quien contrata.
- Gravedad: menor
- Evidencia: navegador
- Huecos relacionados: H6

### N2-04 En Evolución el primer mensaje que leo es «mejoró», y «Lote 4 baja de vigor» queda debajo
- Eje: componente
- Dónde: `/evolucion`, panel «Qué pasa en este vuelo» (`src/features/evolution/evolution-view.tsx`)
- Lo que ve la persona: A 900 px de alto el panel muestra primero «Comparar con 18 de jul», una caja azul «Frente al 18 de jul de 2026, mejoró: Lote 3 (+0,27), Lote 4 (+0,12, pero viene bajando), Lote 5 (+0,35)», una caja amarilla de hallazgos, otra de «Qué tan fiable es la comparación…», otra de «Medidas del sitio» y solo después, dentro de un panel que se desplaza, «Lote 4 baja de vigor». El aviso de bienvenida tapa parte del panel.
- Qué entiende o hace mal: Leo «mejoró» y luego cuatro avisos sobre cosas del operador (fiabilidad, puntos de control); lo que contesta mi pregunta queda fuera de la primera pantalla. La gráfica, que sí se ve, no marca cuál línea es la mala.
- Por qué importa para su tarea: T1 se cumple, pero solo si sigo desplazándome; un productor que no lo haga se queda con «mejoró».
- Propuesta: Poner la ficha «Lote 4 baja de vigor» primero en el panel y las cajas de comparación y fiabilidad después (o plegadas); y rotular la línea de Lote 4 en la gráfica con «Lote 4: bajando desde el 19 de sept».
- Gravedad: confunde
- Evidencia: navegador (captura a 1440×900)
- Huecos relacionados: H6, H8

### N2-05 La medida correctiva se entiende, pero el orden y los conteos de la ficha confunden
- Eje: componente / texto
- Dónde: `/vuelos?tab=hallazgos` (panel «Medidas correctivas del sitio» y ficha del hallazgo), `/evolucion` (ficha de una sugerencia)
- Lo que ve la persona: En un hallazgo todavía «Por verificar» aparecen a la vez «Confirmar / Descartar» y, debajo, «Medida correctiva: Abierta · Vence en 7 días · Responsable Jefe de campo (ejemplo)». En Evolución, una sugerencia sin revisar muestra «Medida correctiva: Sin responsable ni plazo». Y en el panel: «8 hallazgos confirmados sin responsable».
- Qué entiende o hace mal: No sé si la medida existe antes de que yo confirme el hallazgo. Y con «Responsable» no sé si es alguien de mi hacienda o del operador, ni quién debe pulsar «Cerrar con nota»: ¿yo, el jefe de campo, el operador?
- Por qué importa para su tarea: Una medida sin dueño claro no se cierra, y el valor de la función es que alguien responda.
- Propuesta: Mostrar la medida solo cuando el hallazgo esté confirmado (con la frase «Confirme el hallazgo para asignarle un responsable y un plazo»), y rotular «Responsable (quién lo corrige)» y «Cierra: quien registra la nota, con su nombre en el historial». Ofrecer «Asignar responsable» desde la lista de «8 sin responsable». No inventar quién cierra: dejarlo como pregunta pendiente para validar.
- Gravedad: menor
- Evidencia: navegador
- Huecos relacionados: H7

### N2-06 «Es donde más hay» en Mapa y lotes compite con «Lote 4 baja de vigor»
- Eje: texto / caso-de-uso
- Dónde: `/mapa`, lista de lotes (`src/features/sites/mapping/site-mapping-view.tsx`)
- Lo que ve la persona: Bajo Lote 3 la etiqueta «Es donde más hay» (8 hallazgos en 5 vuelos), mientras Lote 4 (3 hallazgos) es el que baja.
- Qué entiende o hace mal: «Donde más hay» me sugiere «donde peor» y Lote 3, que tiene vigor de 0,79, no es el problema.
- Por qué importa para su tarea: Dos mensajes distintos de «cuál va peor» en dos pantallas con el mismo vocabulario.
- Propuesta: «Es el lote con más hallazgos anotados» y, junto, el vigor actual de cada lote («vigor 0,79 / 0,62 / 0,80») para que el número que decide esté al lado. Los colores de los puntos de la lista (N-14) no pude comprobarlos porque el mapa tardaba en cargar: queda sin verificar.
- Gravedad: menor
- Evidencia: navegador (lista de lotes; mapa sin cargar)
- Huecos relacionados: H7

### N2-07 Erratas y cifras que difieren en las últimas cifras
- Eje: texto
- Dónde: `/vuelos?tab=hallazgos` (pie «La fuente acompaña a el hallazgo»), informe consolidado en `/informes?tab=informe`
- Lo que ve la persona: «La fuente acompaña a el hallazgo»; «Motivo de la elección: La cotización más baja de las dos..» y «Pido facturar solo lo cubierto..» (dos puntos); «BAT-A10 (1 vuelos)»; «Cotización elegida: AeroVisión del Valle a $ 30.000 COP por ha ($ 836.632 COP para 27,9 ha)» frente a la factura de $ 837.000; «($ 212.856 COP para 7,1 ha)» frente a 7,1 × 30.000 = 213.000.
- Qué entiende o hace mal: Entiendo que son redondeos, pero al contador le saltan: 836.632 no es 837.000.
- Por qué importa para su tarea: T2 es de plata; una diferencia de $ 368 entre el texto de Servicios y la factura invita a pensar que alguien la cambió.
- Propuesta: Redondear la cotización igual que la factura (27,9 × 30.000 = 837.000) y corregir «al hallazgo», «1 vuelo / 2 vuelos» y los puntos dobles.
- Gravedad: menor
- Evidencia: navegador (texto del informe consolidado y de Hallazgos)
- Huecos relacionados: H7

### N2-08 En la landing el avión pasa sobre el selector de sector y, tras entrar, el menú no se llama igual
- Eje: componente
- Dónde: `/` (sección «¿Qué supervisa usted?»), menú lateral
- Lo que ve la persona: En mi primer intento el planeador se dibuja encima de los botones «Finca o cultivo» / «Vía o carretera» y del texto; los botones siguen respondiendo al clic. En la demo, la primera entrada mostró el menú «Evolución»; después de volver a abrir desde la landing mostró «Evolución del cultivo» (mismo perfil del navegador) en Mapa, Pagos y demás. No pude aislar qué lo cambia.
- Qué entiende o hace mal: El avión tapa justo el sitio donde debo escoger; un menú que se llama distinto según cuántas veces entré hace pensar que algo se rompió.
- Por qué importa para su tarea: Es el primer paso de mi recorrido.
- Propuesta: Que el avión no cruce la tarjeta del selector (parada fuera de ella) y que el nombre del menú sea el mismo desde la primera entrada. Declaro que esto lo vi dos veces pero no repetí el recorrido con un perfil limpio.
- Gravedad: menor
- Evidencia: navegador (capturas del selector; texto del menú en dos entradas)
- Huecos relacionados: H6

## 4. Lo que ya funciona y hay que conservar

1. **Entrar a Evolución con el aviso de dos pasos** y la ficha «Lote 4 baja de vigor… desde el 19 de sept de 2026». Es lo que contesta T1.
2. **Verificación del área en pesos** («Son unos $ 45.000 de más… Cifra de ejemplo») junto a «El área cubierta es la que reporta el operador; Otear no la mide con las imágenes». Cuadra con el total y el saldo.
3. **«En breve» al comienzo del informe del vuelo** y «Detalle técnico» plegado: es un informe que puedo mostrar.
4. **La franja «Ejemplo, no real… Solo el mapa de fondo es una imagen real del lugar»** y «Nada se notifica a nadie» en las medidas correctivas: dicen lo que no hacen.
5. **El asistente de «Próximo vuelo»** con reglas, cifras de la gráfica y «Nada se programa hasta que usted lo apruebe».

## 5. Veredicto

**Sí puedo contestar T1 y T2 sin ayuda y confío en la respuesta, con una salvedad.**

- T1: entro, caigo en Evolución y leo «Lote 4 … desde el 19 de sept de 2026 (0,75)». Me costaría menos si esa ficha fuera lo primero del panel (N2-04).
- T2: «$ 45.000 de más, a $ 30.000 por hectárea» y las cuentas de la factura cuadran; confío porque la pantalla dice de quién es la cifra (el operador) y que es de ejemplo.
- La confianza se resiente en un sitio: las fechas de «hoy» (25, 27, 29, 30 de octubre) y los conteos de hallazgos (6, 5, 3) no coinciden entre pantallas (N2-01, N2-02). No cambian la respuesta a T1 y T2, pero son lo primero que un administrador atento me señalaría.

## 6. Límites

- Soy una simulación; nada de lo anterior sustituye una prueba con cañicultores reales.
- Recorrí en escritorio: landing (hero y selector; móvil solo midió que no hay desborde horizontal a 390 px), Evolución, Vuelos (Resumen, Simulación, Hallazgos, Informe), Pagos, Informes (Pendientes e Informe), Programación (banner y ventana «Propuesta»), Mapa y lotes. Solo miré textos de Servicios y Documentos, no el flujo de disputa.
- No abrí el dron 3D de Programación, la galería de modelos ni la «Guía de la demo»; no verifiqué teclado, lector de pantalla ni movimiento reducido.
- No ejecuté acciones que cambian la demo (confirmar, registrar pago, firmar, cerrar medida); abrí el formulario «Cerrar con nota» y no lo guardé. No vi la simulación en movimiento.
- El mapa de «Mapa y lotes» no terminó de cargar en mi captura; los colores de los puntos de N-14 quedan sin verificar.
- Tamaños de texto medidos en Chromium a 1440×900 y 100 % de zoom.
