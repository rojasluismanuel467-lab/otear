# Revisión desde el rol: operador de dron profesional

Persona simulada. Todo lo de abajo son hipótesis de «yo, como esta persona»; no son resultados de usuarios reales. Los datos de la demo son sintéticos y los cito como tales. Evidencia «navegador» = Chromium sin interfaz propio (CDP, puerto 9304) sobre `http://localhost:3000`, con «Ver como» → Operador · AeroVisión del Valle; «lectura de código» = leí el archivo y no lo vi ejecutarse.

## 1. Persona y tareas

Piloto con su pequeña empresa, 2 aeronaves, certificado. Hoy entrega fotos y un PDF por correo y factura por hectárea o por vuelo. Teme que una plataforma lo vigile o le recorte el pago por una «cobertura» mal medida, y perder tiempo llenando formatos. Sabe de NDVI, ortomosaico, baterías y mantenimiento.

1. Ver el pedido que recibió y entender la zona exacta y la ventana de fechas (Servicios).
2. Programar el vuelo, completar la lista de preparación y los documentos (Programación, Documentos).
3. Entregar el vuelo y facturar por lo realmente cubierto (Servicios, Pagos): ¿entiende cómo se calcula lo que le aprueban y puede discutirlo?
4. Revisar el estado de su flota, baterías y mantenimiento (Equipos).
5. Decidir si la plataforma le conviene o lo perjudica.

## 2. Prueba de 5 segundos (escrita antes de leer el resto de la landing)

Solo la primera pantalla (`/`, 1280×900, captura `hero.png`).

- **¿Qué cree que hace Otear?** Un sitio donde un dueño de finca o de obra junta todos los vuelos de dron de su operación y mira cómo cambia cada zona. Y, en la última línea, «verifica cuánto de lo contratado se cubrió de verdad antes de pagar». Eso último me suena a que alguien revisa lo que yo cobro.
- **¿Para quién es?** Para quien contrata vuelos («su operación, sea una finca, una vía, una obra…»), no para mí. No sé si yo, que vuelo, tengo algo que hacer ahí ni si Otear me quita clientes o los vuelve más exigentes.
- **¿Qué haría ahora?** Pulsar «Abrir la demo» con desconfianza, buscando dos cosas: dónde dice quién mide la cobertura y de quién son las fotos. En el titular no hay ninguna de las dos.

## 3. Primer minuto en la demo

- «Abrir la demo» cae en `/programacion` con el usuario «Luis Rojas · Administrador · ejemplo» (el comprador). Veo un calendario, un mapa de una hacienda y una franja «Sugerido por IA · ejemplo: 1 de 3 lotes merece un vuelo pronto». Eso es lo que le dice a mi cliente qué volar; yo no aparezco como persona.
- Dudé: ¿dónde entro como operador? «Ver como» no está en la barra ni en Configuración: solo existe dentro de Servicios (`services-view.tsx:75`). Lo encontré por probar menús.
- Dudé: el selector del encabezado superior (Agricultura, vía, obra, escudo, pico) me pregunta mi sector; yo vuelo para todos esos. No hay un «soy operador».
- Después de elegir Operador, el nombre abajo a la izquierda sigue diciendo «Luis Rojas · Administrador · ejemplo». Pierdo la certeza de quién soy en la pantalla.

## 4. Tareas: ¿pudo terminarlas?

| # | Tarea | ¿Terminó? | Por qué |
|---|---|---|---|
| 1 | Entender el pedido | **Con ayuda (a medias)** | Ventana, tope y área sí. La «zona exacta» no: solo hay «Lote 3, Lote 5» y «20,8 ha». No hay mapa, ni polígono, ni archivo para descargar, ni punto de acceso (O-02). |
| 2 | Programar y preparar | **Con ayuda** | En Servicios programo con fecha, hora y piloto y se crea el vuelo. En Programación puedo llenar la lista, pero el equipo y el piloto son texto libre, y los documentos están atados al proyecto del cliente (O-04, O-07, O-13). |
| 3 | Entregar y facturar | **Sí en la mecánica, no en el fondo** | Pude entregar y facturar. No pude saber qué cifra me «aprueban» ni responder cuando el cliente disputó (O-01, O-03). |
| 4 | Revisar flota | **Sí** | Es lo más claro para mí. Pero lo que hago en Otear no mueve las horas de la aeronave (O-07), y la flota aparece como «las aeronaves de Hacienda Santa Rita» (O-04). |
| 5 | Decidir si me conviene | **No** | No encuentro quién ve mi flota, mis costos y mis papeles, ni de quién son mis fotos ni cuánto cuesta. |

Recorrido en la demo (todo en una sola sesión, sin recargar): entregué 18,5 ha de 20,8 pedidas con la nota «Viento 25 km/h; no se alcanzó una esquina del lote 5» → como gestor pedí «corregir» con «Descuente lo no cubierto» → volví como operador, re-entregué la misma cifra → como gestor acepté → como operador facturé 20,8 ha → en Pagos la factura salió marcada «Facturó de más · +12,4 %».

## 5. Hallazgos (ordenados de más a menos graves)

### O-01 Lo que «me aprueban» no existe como cifra; solo existe «aceptar» o «corregir»
- Eje: componente
- Dónde: `/servicios` (verificar la entrega) · `src/features/services/action-form.tsx:262-290`, `src/features/services/workflow.ts:476-520`; `/pagos` · `src/features/billing/coverage.ts:44-50`, `src/features/billing/area-check-card.tsx:94-97`
- Lo que ve la persona: la verificación pregunta «¿Qué decide?» con dos opciones: «Aceptar la entrega: el operador podrá facturar.» o «Pedir que la corrija». Al facturar, el formulario dice «Hectáreas que va a facturar … Se multiplica por el precio cotizado. Quien paga lo verifica contra lo cubierto.» En Pagos: «Se cubrió el 89 % de lo pedido (18,5 de 20,8 ha). Facturó 2,3 ha más de las cubiertas (+12,4 %)» y al pie «La tolerancia es de 5 %.»
- Qué entiende o hace mal: no hay un paso donde alguien diga «le aprobamos X ha = $Y». Yo escribo las hectáreas que facturo; el cliente solo ve una alarma después. Si cubrí 94 % (como en el vuelo anterior de los datos de ejemplo), no sé si me pagan el 94 %, el 100 % o si el 5 % de tolerancia me cubre. Esa tolerancia aparece sin que nadie la haya pactado (no está en el pedido, ni en la cotización, ni en un contrato).
- Por qué importa para su tarea: es mi miedo número uno, dicho en la pantalla. «Cubierto» es mi propia cifra declarada; eso me tranquiliza (nadie me la mide con imágenes) pero no me dice cómo se convierte en plata.
- Propuesta: (a) en «Verificar la entrega», además de aceptar o corregir, una tercera salida «Aceptar con ajuste» que muestre las hectáreas aprobadas (por defecto: las que declaró el operador) y el valor resultante «hectáreas aprobadas × precio cotizado = total», visible para ambos. (b) En el pedido y en la cotización, una línea «Tolerancia de área: 5 % (por definir con cada servicio)» en vez de un número fijo que aparece solo en Pagos. (c) Texto de ejemplo para el formulario de factura: «Facturar hasta las hectáreas aprobadas en la verificación. Si factura más, el cliente verá la diferencia marcada».
- Gravedad: bloquea la tarea
- Evidencia: navegador (pasos de la sección 4; captura `pagos1.png`) + lectura de código
- Huecos relacionados: H3, H7

### O-02 El pedido no me da la zona exacta ni lo que necesito para volarla
- Eje: componente
- Dónde: `/servicios` (detalle del pedido) · `src/features/services/request-detail.tsx:177-210`; `src/features/services/new-request-dialog.tsx:125-143`; landing `src/features/landing/landing-page.tsx:116-119`
- Lo que ve la persona: «Lotes: Lote 3, Lote 5 · Área pedida: 20,8 ha · Ventana: 27 de oct de 2026 – 31 de oct de 2026 · Tope de precio: $ 4.500 / ha · Operadores invitados». La tarjeta de la landing promete: «Recibe el pedido con la zona exacta, entrega el vuelo y le aprueban la factura por lo realmente cubierto.»
- Qué entiende o hace mal: sé los nombres de dos lotes, no su forma. Sin mapa en el pedido, sin KML/GeoJSON descargable, sin coordenada de despegue ni contacto de acceso al predio, sin lo que el cliente espera técnicamente (sensor, GSD, traslape, formato de entrega; yo mismo registro «GSD» y «Traslape» en la bitácora). El área de 20,8 ha la calcula Otear a partir de polígonos que yo no puedo ver ni cuestionar, y es la base de lo que me van a medir.
- Por qué importa para su tarea: sin el polígono no puedo planear la ruta ni saber si el área «pedida» coincide con la que yo mediría. Si el polígono del cliente es generoso, quedo con «89 % cubierto» sin culpa mía.
- Propuesta: dentro del pedido, un mapa pequeño con las zonas en sombra (la demo ya tiene `SiteMap`) y dos botones «Descargar zonas (KML)» y «Ver cómo se calculó el área». Campos del pedido que el operador espera: sensor/producto deseado, GSD y traslape (opcionales), entregables y formato, quién abre el predio. Cambiar la frase de la landing a algo que se cumpla hoy: «Recibe el pedido con las zonas, la ventana y el tope de precio.»
- Gravedad: bloquea la tarea
- Evidencia: navegador (`op1.png`, texto del detalle) + lectura de código
- Huecos relacionados: H2, H7

### O-03 Cuando el cliente disputa, yo no puedo contestar: solo «corregir y volver a entregar»
- Eje: componente
- Dónde: `/servicios` · `src/features/services/workflow.ts:105-133` (acciones de un pedido en disputa) y `:476-520`; `src/features/services/request-detail.tsx:335-346`
- Lo que ve la persona: tras mi entrega (18,5 de 20,8 ha, con el motivo del viento), el gestor escribió «Faltan 2,3 ha del lote 5. Descuente lo no cubierto.» y la pantalla me dice «Devuelta para corregir el 25 de oct de 2026…» con el único botón «Corregir y volver a entregar».
- Qué entiende o hace mal: lo que el cliente me pide («descuente lo no cubierto») es exactamente lo que yo ya había declarado; no hay nada que «corregir». No puedo responder «no estoy de acuerdo», ni adjuntar el registro de vuelo, ni proponer facturar 18,5 ha. Solo me queda re-entregar y esperar a que el otro acepte. La disputa tiene voz de un solo lado.
- Por qué importa para su tarea: es mi segunda pregunta de la tarea 3: «¿puede discutirlo?». Hoy, no.
- Propuesta: en una entrega devuelta, además de «Volver a entregar», un campo «Responder» (texto, y adjuntar un archivo o enlace) y la opción «Aceptar el descuento y facturar lo cubierto». Que el historial muestre mi respuesta al lado del reclamo. Rótulo sugerido: «El cliente pidió ajustar la entrega. Usted puede corregirla, aclararla o aceptar el ajuste.»
- Gravedad: bloquea la tarea
- Evidencia: navegador (`dispute1.png`)
- Huecos relacionados: H7

### O-04 De quién son mis datos: mi flota, mis papeles y mis costos aparecen dentro del proyecto de mi cliente
- Eje: caso-de-uso
- Dónde: `/equipos` · `src/features/fleet/fleet-view.tsx:92` y `:165`; `/documentos`; `src/features/demo/demo-context.tsx:345-352` (todo se filtra por `siteId`)
- Lo que ve la persona: «Las aeronaves de Hacienda Santa Rita: su estado, su plan de mantenimiento y todo lo que les ha pasado.», con «Compra 12 de mar de 2024 · $ 24.500.000», «Propiedad por hora $ 124.213», «Pilotos de la flota: Camilo Torres, 2,1 h · 5 vuelos». En Documentos, mi póliza, mi licencia y mi registro de operador salen como «soportes de la operación» de la hacienda («3 soportes por atender antes del próximo vuelo»).
- Qué entiende o hace mal: si mi cliente «es dueño» del proyecto, entonces mi precio de compra, mi costo por hora y las horas de mi piloto quedan a la vista del comprador. Si yo tengo cinco clientes, tendría que cargar dos aeronaves, sus baterías y sus papeles cinco veces. No hay una frase que diga si mi flota es mía y qué parte ve cada cliente.
- Por qué importa para su tarea: es la segunda cosa que temo. Una plataforma que muestra «Pilotos de la flota» y mis costos al cliente es vigilancia. Y es la pregunta de la tarea 5.
- Propuesta: decisión del dueño del proyecto, que se puede nombrar sin decidirla. Texto honesto, sin prometer lo que no está construido: bajo el título de Equipos, «En esta demo la flota se muestra dentro del proyecto. Quién ve qué (su flota, sus costos, sus papeles) está por definir y se acuerda antes de un piloto.» Y en la landing, bajo «Para quién», una frase corta para el operador: «Sus aeronaves, sus baterías y sus costos son suyos; al cliente solo se le muestra lo que usted decida entregarle (por definir).»
- Gravedad: bloquea la tarea
- Evidencia: navegador (`equipos1.png`, `docs1.png`) + lectura de código
- Huecos relacionados: H4, H3

### O-05 Veo la cotización de mi competidor, y «No puede» sale junto a mi propia cotización cuando no me eligen
- Eje: componente
- Dónde: `/servicios` · `src/features/services/request-detail.tsx:212-298` (tabla de cotizaciones) y `:357-367` (Historia); `src/features/services/workflow.ts:377-383`; `src/features/agents/quote-advisor.tsx`
- Lo que ve la persona: como AeroVisión, en «Vigor del cultivo, para decidir riego»: mi cotización ($ 6.000 / ha) junto a «Drones del Pacífico (ejemplo): $ 5.200 · La más económica · $ 109.961 · 6 de nov». En un pedido ya asignado, la Historia dice «Drones del Pacífico (ejemplo) cotizó $ 3.900 por hectárea» y la tabla le pone «No puede». El comprador, además, ve una «Lectura de las cotizaciones» (Sugerido por IA) que dice de mi precio «71 % por encima de lo que pagó antes por este tipo de servicio».
- Qué entiende o hace mal: (1) en una licitación entre operadores no debería ver el precio ajeno, y la historia lo repite en texto. (2) «No puede» es el mismo estado para quien dijo «no puedo atenderla» y para quien cotizó y no fue elegido (`assign` marca como `declined` a los demás); si no me eligen, mi propia fila diría «No puede». (3) Me entero de que mi precio se compara contra lo que el cliente «pagó antes» (seguramente a mí mismo) y no veo esa lectura.
- Por qué importa para su tarea: Otear me pone en una subasta con la insignia «La más económica». Si otros ven lo mío o me ponen la etiqueta equivocada, pierdo la confianza en el sistema entero. También cambia la respuesta a «¿es un socio o un auditado?».
- Propuesta: al operador mostrarle solo su cotización y el número de invitados («Hay 2 cotizaciones; usted verá el resultado cuando el cliente decida»). Separar los estados: «Declinó», «No fue elegida» y «Elegida». Texto de ejemplo al perder: «El cliente asignó el servicio a otro operador. Su cotización queda guardada.» En la Historia, no repetir precios ajenos al operador.
- Gravedad: confunde
- Evidencia: navegador (`op2.png`; `s16`: Cerradas → «Seguimiento del mes») + lectura de código
- Huecos relacionados: H4, H7

### O-06 «Entregar» es escribir nombres de archivos; la demo no dice cómo entran mis fotos
- Eje: texto
- Dónde: `/servicios` · `src/features/services/action-form.tsx:226-234`; `/vuelos` · `src/features/flights/review/evidence-gallery.tsx:28`; landing (no hay frase sobre la entrada)
- Lo que ve la persona: «Archivos que entrega: Ortomosaico (GeoTIFF), Registro de vuelo (CSV)… Sepárelos con comas.» En Vuelos, cuando falta evidencia: «Sus fotos y observaciones aparecerían aquí al recibirlas.» Las imágenes de Vuelos son ilustrativas.
- Qué entiende o hace mal: no sé si «entregar» sube los archivos (un ortomosaico pesa gigas), si pego un enlace de mi nube, o si el cliente solo lee mi lista. «Al recibirlas» no dice quién ni cómo. Tampoco veo dónde dejo el registro de vuelo del que sale mi «hectáreas cubiertas».
- Por qué importa para su tarea: entregar es mi trabajo. Si la plataforma es el único lugar donde queda mi entrega, necesito saber qué guarda de mis archivos, por cuánto tiempo y si yo conservo copia.
- Propuesta: texto honesto para el formulario, sin inventar la respuesta de fondo: «En esta demo solo se anotan los nombres. Cómo llegan los archivos (carga directa o enlace a su almacenamiento) está por definir.» Y un campo «Enlace de descarga (opcional)». En la landing, una línea bajo la tarjeta de operador: «Usted conserva sus originales.» solo si esa es la decisión del proyecto.
- Gravedad: confunde
- Evidencia: navegador (`deliver1.png`) + lectura de código
- Huecos relacionados: H2, H4

### O-07 Lo que programo y entrego no mueve mi flota: ni horas, ni equipo
- Eje: componente
- Dónde: `/programacion` · `src/features/flights/planning/scheduling-view.tsx:203-219`; `src/features/services/use-services.ts:101-118`; `src/features/fleet/fleet.ts:62-79`; `src/features/flights/planning/log-dialog.tsx:194-200`
- Lo que ve la persona: en «Programar un vuelo», «Dron» y «Piloto» son cajas de texto («DJI Mavic 3 Enterprise», «Camilo Torres»). En Servicios, al programar, el vuelo nace con «Dron: Por definir». En la bitácora, «Baterías usadas» es texto libre («BAT-A12, BAT-A13»).
- Qué entiende o hace mal: en el código las horas de una aeronave solo suben con vuelos que traen `aircraftId`, y ningún formulario lo asigna. Entonces mis 201 h del Mavic y mis ciclos de batería no avanzan con lo que hago en Otear; los ciclos de batería solo suben si escribo la etiqueta idéntica a la de Equipos (con un error de tecleo no cuenta). Es el mismo trabajo en dos lugares.
- Por qué importa para su tarea: el mantenimiento es lo que sé y valoro; si la flota no se alimenta sola, tengo que llenarla yo, y es el tipo de formato que no quiero.
- Propuesta: en los formularios, «Dron» y «Baterías» como listas que salen de Equipos (mis aeronaves y mis baterías con su ciclo actual); al entregar un servicio, preguntar «¿Con qué aeronave voló?» y sumar sus horas y ciclos. Texto de ejemplo: «Mavic 3E · A · 45 de 200 ciclos».
- Gravedad: confunde
- Evidencia: lectura de código (no la ejecuté con una aeronave elegida; lo que vi en el navegador es el formulario con texto libre y el vuelo de Servicios con «Por definir»)
- Huecos relacionados: H2

### O-08 Me siento auditado: Pagos e Informes están escritos contra mí, y no tengo mi propia vista
- Eje: caso-de-uso
- Dónde: `/pagos` · `src/features/billing/billing-view.tsx:159`, `area-check-card.tsx:8-13`, `readiness.ts`; `/informes` · `src/features/reports/reports-view.tsx:453-520` (tabla «Operadores»); `/vuelos` (sugerencias de IA sobre mis fotos)
- Lo que ve la persona: Pagos titula «Facturas del operador» y dice «Consulta el soporte antes de registrar un pago.» Para mi factura: «Facturó de más», «Pida la justificación antes de pagar», «Póliza del equipo: vencido», «Falta la firma de Cliente o responsable». Informes tiene una tabla con mi nombre: «Vuelos y hallazgos» con «N confirmados · N descartados», «Hectáreas facturadas / cubiertas» y una marca «factura con más área…» (lectura de código; no abrí Informes en el navegador). En Pagos aparece incluso el botón «Registrar pago» mientras actúo como operador.
- Qué entiende o hace mal: leo la pantalla como el expediente de un sospechoso. No hay dónde ver, como operador, «cuándo me pagan», «si el cliente ya acusó recibo» ni «mi póliza vence en tres días» antes de que lo vea el cliente. «Hallazgos descartados» como columna junto a mi nombre me suena a nota de desempeño.
- Por qué importa para su tarea: la diferencia entre socio y auditado es quién ve primero la alerta. Hoy el cliente ve mi póliza vencida y mi sobrefacturación; yo me entero porque abrí Pagos con el rol equivocado.
- Propuesta: no hace falta una pantalla nueva. En Pagos, cuando «Ver como» sea operador (el selector hoy solo existe en Servicios; llevarlo a la barra), cambiar los textos a mi lado: «Su factura FV-2026-983 · pendiente de acuse del cliente · vence 24 de nov», y avisarme en Documentos y en Equipos «La póliza vence el 20 de oct; el cliente la verá en su lista de pago». En Informes, suavizar o quitar «descartados» de la tabla de operadores y decir en una línea de qué es la tabla y quién la ve.
- Gravedad: confunde
- Evidencia: navegador (`pagos1.png`, `pagos2.png`) + lectura de código
- Huecos relacionados: H4, H7

### O-09 En los datos de ejemplo, Servicios y Pagos no cuadran en dinero
- Eje: caso-de-uso
- Dónde: `/servicios` (cerradas · «Seguimiento del mes») y `/pagos` (FV-2026-034) · `src/features/demo/demo-data.ts:1001-1010` y `:1506-1560`
- Lo que ve la persona: en Servicios: «AeroVisión del Valle dice haber cubierto 26,2 ha de las 27,9 ha pedidas. Cobertura completa… Aceptada: Recibido y revisado.», cotización «$ 3.500 · Total estimado $ 97.607». En Pagos: la factura de ese servicio, FV-2026-034, vale «$ 850.000» con «Facturó de más · 26,4 cubiertas / 27,9 facturadas».
- Qué entiende o hace mal: si yo cotizo $ 3.500/ha, 27,9 ha son $ 97.607, no $ 850.000 (8,7 veces más). Además, el servicio dice «Cobertura completa» con 94 % y el cliente lo aceptó, y luego Pagos lo marca como exceso de 5,7 %. Pagos solo compara hectáreas; nunca compara el valor de la factura contra «ha × precio cotizado».
- Por qué importa para su tarea: es el caso que más se parece a mi vida: acepté, me aceptaron, y después me marcan. Si el ejemplo también tiene las cuentas mal, nadie en la demo me convence de que la herramienta resuelve el desacuerdo; solo lo muestra tarde.
- Propuesta: ajustar el dato de ejemplo para que la factura sea ≈ ha × precio (o explicar la diferencia como otros conceptos), y que el check de Pagos añada una línea «Valor esperado: ha facturadas × precio cotizado = $…; factura: $…». Texto de ejemplo: «El total coincide con las hectáreas facturadas por el precio cotizado.»
- Gravedad: confunde
- Evidencia: navegador (texto de Servicios y de Pagos) + lectura de código
- Huecos relacionados: H7, H8

### O-10 La pantalla de Servicios me habla como si yo fuera el comprador, y salta de pedido al actuar
- Eje: texto
- Dónde: `/servicios` · `src/features/services/request-detail.tsx:42-63` y `:145`; `src/features/services/services-view.tsx:63-65`
- Lo que ve la persona: en «Vigor del cultivo…», como operador: «Le toca a usted: Compare las cotizaciones y asigne el servicio a uno de los operadores.» con el botón «Cambiar mi cotización». Y, en la lista, la etiqueta «Su turno» sobre un pedido que está esperando a otro. Al confirmar «Registrar la entrega», el panel salta a otro pedido y la confirmación de mi entrega queda solo en un aviso pasajero de la pantalla.
- Qué entiende o hace mal: la instrucción «asigne el servicio» no es para mí y no tengo cómo hacerlo; me desorienta. Y después de entregar no veo mi entrega confirmada, tengo que ir a «En curso» a buscarla.
- Por qué importa para su tarea: son los pasos de «entregar» y «facturar», los que más repito.
- Propuesta: textos por rol. Para el operador en un pedido con cotizaciones: «Su cotización está enviada. El cliente decide después de comparar.» o «Falta su cotización.» Mantener seleccionado el pedido sobre el que se actuó (`selectedId`) hasta que la persona elija otro, y mostrar «Entrega registrada el 25 de oct. Falta que el cliente la verifique.»
- Gravedad: confunde
- Evidencia: navegador (`op2.png`, `deliver2.png`)
- Huecos relacionados: H7

### O-11 Puedo facturar más de lo que declaré sin aviso, y el sistema deja entregar un vuelo que aún no ocurrió
- Eje: componente
- Dónde: `/servicios` · `src/features/services/action-form.tsx:291-320`; `src/features/services/use-services.ts:126-141`
- Lo que ve la persona: «Hectáreas que va a facturar» arranca con las 18,5 ha que declaré; escribí 20,8 ha y se aceptó sin advertencia. Recién en Pagos el cliente ve «Facturó 2,3 ha más de las cubiertas (+12,4 %)». Además, el vuelo estaba programado para el 29 de oct y quedó «entregado el 25 de oct de 2026» (la fecha del escenario) sin que se avisara.
- Qué entiende o hace mal: como operador honesto quiero que el sistema me frene antes de dejarme mal ante el cliente. Un error de digitación de mi parte («20,8» en vez de «18,5») se vuelve una marca roja pública.
- Por qué importa para su tarea: es lo que protege mi pago y mi nombre. También evita que entregue «a futuro» por equivocación.
- Propuesta: texto de ejemplo bajo el campo, en vivo: «Usted declaró 18,5 ha. Si factura más, el cliente verá la diferencia marcada. Puede explicarla en una nota.» y un campo «Nota para el cliente (opcional)». Y avisar si la fecha de entrega es anterior a la del vuelo programado.
- Gravedad: confunde
- Evidencia: navegador (`invoice1.png`) + lectura de código
- Huecos relacionados: H7

### O-12 La landing y el selector hablan con el comprador; el operador es una tarjeta de tres líneas
- Eje: texto
- Dónde: `/` · `src/features/landing/landing-page.tsx:116-119`, `:165-171`, `:450-452`; `src/features/landing/sector-picker.tsx:58`
- Lo que ve la persona: el titular y el selector «¿Qué opera usted?» (finca, vía, obra, predio, mina). En «Para quién»: «Operador de dron: Recibe el pedido con la zona exacta, entrega el vuelo y le aprueban la factura por lo realmente cubierto.» En el contacto: «No le pedimos cambiar de operador de dron.»
- Qué entiende o hace mal: «¿Qué opera usted?» me hace dudar si me pregunta por mi dron. No hay una opción «Opero drones para terceros». «Le aprueban la factura» promete un paso de aprobación que la demo no tiene (O-01). La frase «no le pedimos cambiar de operador» es para el comprador y está al final. Nada dice si a mí me cobran, si yo pongo los datos, ni qué gano.
- Por qué importa para su tarea: como operador, no sé si Otear es un aliado o es el sistema que mi cliente usará para compararme con otros.
- Propuesta: en «Para quién», reescribir la tarjeta con lo que existe: «Recibe el pedido con las zonas, la ventana y el tope de precio; cotiza, entrega y factura. Las hectáreas que usted declara son las que se comparan; Otear no las mide con las imágenes.» Añadir al selector «Soy operador de dron» que abra la demo en Servicios con «Ver como» operador. Sobre costos, honesto: «Costo para operadores: por definir.»
- Gravedad: confunde
- Evidencia: navegador (`hero.png`, `land2.png`, `mob1.png`) + lectura de código
- Huecos relacionados: H1, H3, H4, H5

### O-13 La lista de preparación y los documentos: mucho formato, poco que ya tenga hecho
- Eje: componente
- Dónde: `/programacion` · `src/features/flights/planning/preparation-checklist.tsx:75`, `src/features/traceability/evidence-control.tsx:99-113`; `/documentos`
- Lo que ve la persona: 16 ítems en 5 grupos, casi todos con «Sin documento · Redactar o adjuntar», y un contador «3 de 16 ítems · 2 sin soporte»; «Marcado sin soporte» sale como falta. «Redactar o adjuntar» abre el «Análisis de riesgos del vuelo» en blanco («Espacio aéreo y restricciones: —», «Clima previsto: —», Peligro 1/Control 1…). También está «Adjuntar un archivo: se calcula la huella del archivo en su navegador; el contenido no se envía a ningún servidor».
- Qué entiende o hace mal: «sin soporte» suena a que mi cheque mental de hoy (revisar hélices, calibrar brújula) no vale si no hay un papel. Redactar peligros y controles a mano para cada vuelo es lo que hoy no hago y no quiero hacer; mi análisis de riesgos ya existe en un PDF.
- Por qué importa para su tarea: de aquí sale el miedo a «perder tiempo en formatos». Lo que sí rescato: «Adjuntar un archivo» me deja subir lo que ya tengo.
- Propuesta: que el contador diga «16 ítems · 3 marcados · 2 con documento» (en vez de «sin soporte» como falta), que el análisis de riesgos traiga prellenados los datos del vuelo y del clima y que «Adjuntar un archivo» sea la acción primaria para quien ya tiene su PDF. Una línea en la lista: «La lista es orientativa. Marcar un ítem sin documento es válido; el documento solo hace falta si el cliente lo pide.» (sujeto a que el dueño del proyecto lo confirme).
- Gravedad: confunde
- Evidencia: navegador (`prep1.png`, `prep2.png`, `attach.png`)
- Huecos relacionados: H7

### O-14 Palabras sueltas: tuteo y avisos que se contradicen
- Eje: texto
- Dónde: `src/features/flights/planning/scheduling-view.tsx:272` y `:181`, `src/features/billing/billing-view.tsx:159` y `:559`, `src/features/compliance/document-view.tsx:219`; `src/features/fleet/fleet.ts:148-155`
- Lo que ve la persona: «¿Qué necesitas revisar?», «Añade al menos dos puntos al recorrido previsto en el mapa.», «Consulta el soporte antes de registrar un pago.», «Puedes consultar los soportes…» (el resto de la plataforma trata de «usted»). En Equipos: «Inspección periódica completa: vencida (faltan 159 h · pasó por 0,5 meses).»
- Qué entiende o hace mal: el aviso de inspección dice «vencida» y «faltan 159 h» en la misma frase. Entiendo (después de pensarlo) que por horas me sobran 159 h pero por tiempo ya me pasé 0,5 meses; el texto no lo dice. Eso, en un aviso «Revisar antes de volar» en rojo, me hace dudar si estoy en regla.
- Por qué importa para su tarea: el mantenimiento es mi tarea 4; un aviso ambiguo me hace perder confianza en las demás cifras.
- Propuesta: «Inspección periódica completa: vencida por tiempo (pasaron 6,5 meses de 6; por horas le quedan 159 h).» (cifras de ejemplo). Cambiar el tuteo a «usted» donde aparezca.
- Gravedad: menor
- Evidencia: navegador (texto de Equipos y del formulario) + lectura de código
- Huecos relacionados: —

## 6. Lo que funciona y hay que conservar

1. **«Ver como» sobre el mismo servicio.** Seguir el mismo pedido como gestor, propietario y operador me hizo entender el flujo en dos minutos. La línea de pasos (Solicitud → Cotizaciones → Asignación → Vuelo programado → Entrega → Verificación → Factura) y el recuadro «Le toca a usted / Estado actual» son claros. Conservar, solo corregir el texto por rol (O-10).
2. **La honestidad sobre la cobertura.** «Es lo que usted declara; quien contrata lo contrasta con lo pedido» y «Otear no la mide con las imágenes» (`action-form.tsx:221`, `area-check-card.tsx:94`). Es lo que más me tranquiliza: la cifra es mía. No lo cambien por «verificado» ni «medido» mientras sea así.
3. **La tarjeta «Verificación del área» con Pedido, Cubierto y Facturado lado a lado.** Se entiende sin explicación y tiene también el caso «Facturó de menos». Conservar el diseño, completarlo con el valor en pesos (O-01, O-09).
4. **Cotizar con opciones reales.** «Cotizar», «Cambiar mi cotización», «No puedo atenderla» y «Puedo volar desde» con límites de la ventana. Y el total estimado = precio × hectáreas pedidas, para saber qué voy a ganar.
5. **Equipos.** Plan de mantenimiento con «Los intervalos son de ejemplo. Use los del manual de su modelo», baterías con ciclos y capacidad, alertas «Revisar antes de volar» y el costo por hora. Es el único lugar donde la plataforma habla mi idioma.
6. **«Adjuntar un archivo»** con huella calculada en el navegador y «el contenido no se envía a ningún servidor». Permite usar mis papeles existentes.
7. **La bitácora posterior al vuelo** (clima, viento, baterías, GSD, traslape, puntos de control, hectáreas cubiertas): son los campos que conozco.

## 7. Huecos H1–H9 desde este rol

- **H1 (qué es Otear, si presta vuelos): me estorba.** Para mí es decisivo saber que Otear no presta vuelos ni es un directorio que quita clientes. La aclaración está al final, dirigida al comprador. Hoy, con el flujo de cotizaciones y la insignia «La más económica», puedo leerlo como un mercado de vuelos.
- **H2 (cómo entran mis vuelos): me estorba mucho.** Es O-06: no sé si subo archivos, enlazo o solo anoto nombres.
- **H3 (precio y cobro): me estorba.** No sé quién paga Otear. Si es el cliente, necesito saber si lo traslada a mi tarifa; si me cobran a mí, decide si lo uso.
- **H4 (de quién son los datos): me estorba mucho.** O-04, O-05 y O-08. Mis costos, mis papeles y mis fotos son mi negocio.
- **H5 (qué sería un piloto): me estorba un poco.** Si el cliente decide un piloto, necesito saber cuánto trabajo extra es para mí y quién lo paga.
- **H6 (primer minuto): me estorba.** Caigo en la agenda del comprador; encontrar «Ver como» fue casualidad (sección 3).
- **H7 (real vs simulado): me estorba en dos puntos.** Los avisos «Datos de ejemplo» están bien, pero no dicen qué parte de Servicios y Pagos sería automática y qué sería manual (la cobertura es manual; la factura de Otear no es una factura electrónica ante la DIAN; hoy no lo dice).
- **H8 (historia con números): me es indiferente como operador,** salvo O-09: el ejemplo con números que no cuadran me quita credibilidad.
- **H9 (qué se mide de quien entra): me es indiferente.** «Sin registro» y «Funciona offline» me tranquilizan.

## 8. Qué le preguntaría a una persona real como yo (sobre su pasado)

1. Cuénteme del último trabajo por hectárea en que el cliente le pagó menos de lo que usted facturó: ¿cómo se enteró, qué cifra usó cada uno, de dónde salió y cómo se resolvió?
2. La última vez que entregó un ortomosaico y fotos: ¿por qué medio salió, cuánto pesaba, quién lo guardó después y cuándo volvió alguien a pedirle algo de eso?
3. La última vez que un cliente le pidió papeles (póliza, licencia, bitácora, análisis de riesgos) antes de dejarlo volar: ¿cuáles le pidió, en qué formato, cuánto tiempo le tomó prepararlos y cuántos clientes distintos le han pedido lo mismo este año?

## 9. Límites: lo que no pude verificar

- No vi la demo con un operador real ni con sus archivos. No probé carga de archivos reales (solo vi el formulario y el texto).
- Solo recorrí el escenario de agricultura. Los otros cuatro sectores, y las solicitudes por vuelo (carreteras) en las que el precio no depende de las hectáreas, no los revisé.
- La landing la vi en escritorio y en móvil solo el hero. No revisé Servicios, Pagos ni Equipos en móvil.
- Chromium sin GPU: el dron 3D, la simulación del vuelo y el modelo de condición de Equipos no los vi funcionando; los juzgué por el texto que muestran.
- El estado de la demo vive en memoria y se reinicia al recargar; las pruebas de la sección 4 las hice dentro de una sola sesión. El «Ver como» solo cambia el contenido de Servicios; el resto de pantallas siguen mostrando al «Administrador», por lo que algunas críticas (O-08) describen lo que el operador vería si entrara por la ruta normal, no un modo operador.
- La fecha del escenario de la demo es el 25 de oct de 2026; las marcas de tiempo de los documentos que se crean usan la hora real del equipo (30 de oct).
- No se resolvió, ni lo propongo, la política de fotos sin GPS ni «G6»; la matriz de Dorfman sigue provisional.

## Dictamen

Hoy Otear sirve más a quien me contrata que a mí: la cifra de cobertura es mía y la plataforma lo dice con honestidad, pero me falta voz para discutirla, no sé cuánto me pagan al final ni de quién son mis datos, y me deja con la sensación de auditado antes que de socio. Lo recomendaría a un colega solo si antes el proyecto pone por escrito esos tres puntos.
