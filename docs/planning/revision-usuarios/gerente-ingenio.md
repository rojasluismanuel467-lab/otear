# Revisión desde el rol: jefe de operación de un ingenio (gerente)

Estado: hipótesis de una persona simulada, no resultados de usuarios reales. Revisión hecha el 30 de octubre de 2026 sobre `http://localhost:3000` (Chromium sin interfaz, puerto CDP 9303) con lectura de código para citar texto y líneas. Todas las cifras que aparecen son de la demo (datos sintéticos).

## 1. Persona y tareas

Jefe de operación (gerente de campo) de un ingenio azucarero que atiende a muchos cañicultores y contrata operadores de dron. Es numérico, impaciente con tablas que no responden una decisión y desconfía de las cifras de ejemplo muy redondas. Usé «Ver como» → Gestor · Ingenio Dulce Valle.

1. Decidir a qué zona mandar el próximo vuelo (Programación, asistente «Próximo vuelo»).
2. Crear una solicitud de servicio, comparar dos cotizaciones con el asistente y asignar (Servicios).
3. Ver cuánto se pagó frente a lo cubierto por cada operador (Pagos, Informes).
4. Armar un informe para la junta con lo decidido.
5. Entender qué hace Configuración y si le sirve a su empresa.

## 2. Prueba de 5 segundos (escrita antes de leer el resto de la landing)

Vi solo el primer pantallazo (titular, subtítulo, dos botones, «Sin registro · Datos sintéticos · Funciona offline»).

- **¿Qué cree que hace Otear?** Junta los vuelos de dron de mi operación en un solo lugar, los compara con el de la semana pasada, saca tareas e informes y revisa «cuánto de lo contratado se cubrió» antes de pagar. No me queda claro si ellos vuelan el dron o si es solo un programa.
- **¿Para quién es?** Para alguien que supervisa algo (finca, vía, obra, predio). Como yo contrato vuelos, el «antes de pagar» me suena a mí, pero el titular habla de «su operación» en general y no dice caña ni ingenio.
- **¿Qué haría ahora?** «Abrir la demo». «Hablemos sin compromiso» no lo tocaría todavía: no sé qué vendería. «Datos sintéticos» me avisa que es de ejemplo.

## 3. Primer minuto en la demo

Elegí «Finca o cultivo» en la landing y «Abrir la demo de ejemplo»: caí en Programación con vocabulario agrícola. Vi de entrada la franja «Sugerido por IA · ejemplo: 1 de 3 lotes merece un vuelo pronto», que es lo más cercano a mi decisión y lo agradezco. Dudé en tres puntos: (a) el usuario aparece como «Administrador · ejemplo» y en ningún lado dice que soy el ingenio; el selector «Ver como» solo existe dentro de Servicios, y lo encontré por el encargo, no por la pantalla; (b) el sector se cambia con las pestañas Agricultura/Carreteras/…, y no vi cómo pasar de una hacienda a otra (solo hay Hacienda Santa Rita); (c) el menú dice «Mapa y lotes» pero yo hablo de suertes. No vi el aviso de bienvenida (dura 9 s y se me fue leyendo la franja).

## 4. Tareas: ¿pudo terminarlas?

| Tarea | Resultado | Por qué |
|---|---|---|
| 1. Decidir zona del próximo vuelo | Sí, con dudas | El asistente propone Lote 4 y da motivos con cifras. No dice cuánto pesa cada motivo por zona, deja a Lote 3 y 5 (con 5 y 3 observaciones sin verificar) fuera del titular y no me lleva a pedir ese vuelo a un operador (G-04, G-09). |
| 2. Solicitud, comparar y asignar | Con ayuda | Crear la solicitud y leer las cotizaciones fue claro. Tuve que volver a escribir a mano el Lote 4 que había propuesto el asistente. Asignar fue de un clic sin confirmar, y la cotización no elegida quedó como «No puede» (G-04, G-07). |
| 2b. Cerrar el servicio entregado (verificar y facturar) | No | Acepté la entrega de «Mapeo de la última zona» y, al facturar como operador, el sistema responde «Falta la cotización o el vuelo.» y no hay salida (G-01). |
| 3. Pagado vs cubierto por operador | Con ayuda | La tarjeta «Verificación del área» en Pagos responde bien para una factura. Para «por operador» hay que ir a Informes → pestaña Costos, y la fila mezcla bases distintas y cifras que se contradicen (G-02, G-08). |
| 4. Informe para la junta con lo decidido | No | El informe consolidado no incluye solicitudes, cotizaciones, asignaciones ni lo que propuso el asistente, y es de un solo sitio (G-03). |
| 5. Configuración | Sí, con ayuda | Entendí que renombra términos, oculta módulos y trae «Caña de azúcar (ingenio o cañicultor)». No quedó claro qué parte me sirve hoy y qué se cobra (G-11, G-12). |

## 5. Hallazgos

### G-01 El último paso del servicio contratado no se puede completar
- Eje: caso-de-uso
- Dónde: `/servicios`; `src/features/services/use-services.ts:149-158` y la semilla «Mapeo de la última zona» en `src/features/demo/demo-data.ts` (alrededor de las líneas 1778-1830, sin `flightId`).
- Lo que ve la persona: en «Mapeo de la última zona» (estado Entregado) el ingenio puede «Verificar la entrega» y aceptar. Luego, viendo como Operador · Drones del Pacífico, «Facturar» → «Confirmar» devuelve en rojo «Falta la cotización o el vuelo.».
- Qué entiende o hace mal: concluyo que el flujo está roto o que yo hice algo mal. No hay botón de recuperación ni explicación. La solicitud queda en «Verificado» para siempre y no aparece factura nueva en Pagos.
- Por qué importa para su tarea: es justo el paso que cierra «contratar → verificar → pagar». Si en la demo no se puede facturar lo entregado, la promesa «verifique lo cubierto antes de pagar» queda sin ejemplo vivo desde Servicios.
- Propuesta: dato que falta: que la solicitud sembrada traiga su vuelo programado y entregado (la historia ya dice «programó el vuelo para el 24 de oct»). Si el vuelo no existe, el mensaje debe decir qué hacer, por ejemplo «Este servicio no tiene un vuelo asociado. Programe el vuelo antes de facturar.», en lugar del texto actual.
- Gravedad: bloquea la tarea
- Evidencia: navegador (Servicios → Mapeo de la última zona → Verificar → Ver como Operador B → Facturar) y lectura de código.
- Huecos relacionados: H7

### G-02 «Cuánto se pagó frente a lo cubierto por operador» no se puede leer: las cifras por hectárea se contradicen entre pantallas
- Eje: caso-de-uso (también componente)
- Dónde: `/informes` pestaña Costos, `src/features/reports/reports-view.tsx:441` y `:507-514`; `src/features/reports/operators.ts:87-108`; `/pagos`; `/servicios`.
- Lo que ve la persona: en Informes, el cuadro «Costo por ha sobrevolada: $ 42.142». En la tabla «Operadores», AeroVisión del Valle: «$ 4.710.000 · Saldo $ 450.000 · $ 30.466 por ha» y «27,9 / 26,4 ha». En Servicios, las tarifas por hectárea son de $ 3.500 a $ 7.200 (la referencia propia del asistente es $ 3.500 por ha).
- Qué entiende o hace mal: para el mismo operador veo dos precios por hectárea ($ 42.142 y $ 30.466) y ambos son de 4 a 12 veces las tarifas de Servicios. Además, en la misma fila el cobro ($ 4.710.000) es de las seis facturas, mientras que «por ha» y «27,9 / 26,4 ha» salen de una sola factura (850.000 / 27,9 = 30.466). Yo dividiría y no me cuadra; dejaría de creer en todo el cuadro.
- Por qué importa para su tarea: la tarea 3 es justo comparar lo pagado con lo cubierto por operador. Con bases distintas en la misma fila, no puedo decir quién cobra más caro ni cuánto se pagó de más.
- Propuesta: (a) que las hectáreas y el dinero de una fila salgan del mismo conjunto de facturas, y que la fila lo diga («1 de 6 facturas traen área»); (b) un solo «por ha» con su definición; (c) si el servicio de las facturas sembradas es por vuelo y no por hectárea, que la factura lo indique («$ 850.000 por vuelo») y que el «por ha» no se calcule; (d) que el orden de magnitud de las facturas de la semilla coincida con el de las cotizaciones de Servicios. Dato que falta: en la tarjeta «Verificación del área» de Pagos, cuánto dinero representa el exceso («Facturó 1,5 ha más…») y no solo hectáreas.
- Gravedad: bloquea la tarea
- Evidencia: navegador (Informes → Costos; Pagos → FV-2026-034) y lectura de código.
- Huecos relacionados: H7, H8

### G-03 El informe para la junta no recoge lo que el gerente decidió
- Eje: componente (y caso-de-uso)
- Dónde: `/informes` pestaña Informe, `src/features/reports/consolidated-report.ts:36-125` (secciones: Resumen, Vuelos, Hallazgos por zona, Operación, Pendientes y alertas, Costos); promesa en `src/features/landing/landing-page.tsx:111-112`.
- Lo que ve la persona: «Informe consolidado: Reúne los vuelos de un periodo en un solo texto para socios, el ingenio o el responsable.» Con casillas «Incluir» para esas seis secciones. La landing dice del gerente: «qué decisiones salieron de ahí. Informes listos para junta o interventoría.»
- Qué entiende o hace mal: busco «qué pedí, a quién, a cuánto, qué verifiqué y qué pagué por operador» y no está: ninguna solicitud, cotización elegida, asignación, entrega verificada ni la propuesta del asistente que aprobé. Es un resumen de vuelos de una sola hacienda, con la etiqueta «BORRADOR DE DEMOSTRACIÓN». Para la junta de un ingenio necesito todas las haciendas y cada decisión con fecha y cifra.
- Por qué importa para su tarea: la tarea 4 no se puede hacer. Lo que sale es lo que ya vi en pantallas; la decisión que sí tomé no queda en ningún papel que pueda llevar.
- Propuesta: agregar a «Incluir» una sección «Servicios contratados y decisiones» con, por solicitud: qué se pidió (zonas, hectáreas, ventana), cotizaciones recibidas y la elegida con el motivo, hectáreas pedidas / declaradas cubiertas / facturadas y saldo; y, si se usó el asistente, «Propuesta de IA aprobada el [fecha]: sus razones». Mientras no exista, que la landing diga «Informes de vuelos para junta» y no «qué decisiones salieron de ahí».
- Gravedad: bloquea la tarea
- Evidencia: navegador (Informes → Informe) y lectura de código.
- Huecos relacionados: H8

### G-04 La decisión del asistente no pasa a Servicios; «Preparar este vuelo» salta la contratación
- Eje: componente
- Dónde: `/programacion`, `src/features/agents/next-flight-assistant.tsx:109` y `:290`; `src/features/flights/planning/scheduling-view.tsx:251-276`; `/servicios` «Nueva solicitud».
- Lo que ve la persona: «Preparar este vuelo» abre «Programar un vuelo» con la nota «Piloto, operador, encargado y dron son los de un vuelo anterior: confírmelos». No hay un camino para llevar «Lote 4, ventana, hectáreas» a «Nueva solicitud».
- Qué entiende o hace mal: en un ingenio no se programa un vuelo con el mismo operador de antes; se pide el servicio y se comparan cotizaciones (la tarea 2). Tuve que volver a escribir Lote 4 en la solicitud. Además, la propuesta es una fecha (27 de oct) dos días antes del «Seguimiento programado» del 29 de oct que ya está en agenda: no me dice si convenía sumar el Lote 4 a ese vuelo para ahorrar un viaje.
- Por qué importa para su tarea: la decisión «a qué zona» y la decisión «a quién se la pido y a cuánto» son una sola cadena. Si se cortan, el asistente propone y yo igual hago el trabajo a mano.
- Propuesta: en el diálogo, junto a «Preparar este vuelo», un segundo botón «Pedir cotizaciones para esta zona» que abra «Nueva solicitud» con lotes, ventana y área precargados. Y una línea en las razones: «También podría sumarla al vuelo del 29 de oct (Lote 3, Lote 5)».
- Gravedad: confunde
- Evidencia: navegador (Programación → Ver propuesta → Preparar este vuelo) y lectura de código.
- Huecos relacionados: H6

### G-05 Servicios no deja claro quién hace qué: el Gestor y el Propietario pueden hacer lo mismo y nadie dice quién paga
- Eje: componente (y texto)
- Dónde: `/servicios`, `src/features/services/services-view.tsx:71`; `src/features/services/workflow.ts:60-61` (`isRequester`: gestor o propietario); `src/features/config/config-view.tsx` (descripciones de «Gestor» y «Propietario»).
- Lo que ve la persona: «Quien contrata pide, compara cotizaciones, verifica y paga; quien vuela cotiza, programa, entrega y factura.» «Ver como»: «Gestor · Ingenio Dulce Valle», «Propietario · Hacienda Santa Rita · Hernando Rojas», «Operador · …». En una solicitud, «pidió Hacienda Santa Rita · Hernando Rojas (ejemplo)» y, al lado, «Le toca a usted» para el ingenio. En Configuración, «Gestor: Quien administra el programa y paga el servicio».
- Qué entiende o hace mal: los tres actores existen, pero dos de ellos (ingenio y cañicultor) tienen exactamente las mismas acciones. Si el cañicultor pide, ¿quién compara las cotizaciones y quién paga? La pantalla dice «quien contrata» sin nombrar a nadie; Configuración dice que el gestor paga; el flujo deja que cualquiera de los dos asigne y verifique. No sé si las cotizaciones de una hacienda las ve el cañicultor ni si el ingenio ve las de otras. La landing usa otro nombre («Gerente o contratante»), y aquí «Gestor».
- Por qué importa para su tarea: un ingenio decide con quién está la plata y con quién la responsabilidad. Si no aparece, no sé qué botón me toca ni qué ve cada parte.
- Propuesta: en el encabezado de cada solicitud, una línea fija con los tres papeles: «Pide: Hacienda Santa Rita · Paga: por definir · Vuela: AeroVisión del Valle». Una línea en «Ver como»: «Mire el servicio desde el papel que elija; cada uno ve y puede hacer cosas distintas». Unificar el nombre: usar el mismo («Gestor» o «Ingenio») en landing, menú y Servicios. Quién paga y quién ve qué son decisiones del dueño del proyecto: indicar «por definir» hasta que se acuerden.
- Gravedad: confunde
- Evidencia: navegador (Servicios → Ver como: Gestor, Propietario, Operador) y lectura de código.
- Huecos relacionados: H4, H1

### G-06 El titular promete «se cubrió de verdad» y la propia demo dice que la cifra la declara el operador
- Eje: texto
- Dónde: `/`, `src/features/landing/landing-page.tsx:165-170` (subtítulo del hero) y `:27-30` («Verifique lo cubierto, no las promesas.»); contraste: `src/features/billing/area-check-card.tsx:95`, `src/features/services/request-detail.tsx:350`.
- Lo que ve la persona: «…verifica cuánto de lo contratado se cubrió de verdad antes de pagar.» Y en la demo: «El área cubierta es la que reporta el operador; Otear no la mide con las imágenes.»
- Qué entiende o hace mal: leí «de verdad» como medido con las fotos. En la demo es lo que el operador dice haber cubierto contra lo que facturó, que es útil pero no es verificar. Me siento engañado cuando lo descubro en la tarjeta.
- Por qué importa para su tarea: la verificación de hectáreas es lo que más me compra; si la promesa es mayor que el producto, pierdo la confianza en el resto.
- Propuesta: «…y contrasta lo pedido, lo que el operador declara haber cubierto y lo que facturó, antes de pagar.» Y en la tarjeta de Pagos, subir la frase «Otear no la mide con las imágenes» al primer renglón de la tarjeta, no al pie. No presentar la medición por imágenes como existente; si es propuesta, decirlo así.
- Gravedad: confunde
- Evidencia: navegador (hero, Pagos) y lectura de código.
- Huecos relacionados: H1, H7

### G-07 Asignar un servicio no pide confirmación, y la cotización no elegida queda como «No puede» sin precio
- Eje: componente (y texto)
- Dónde: `/servicios`, `src/features/services/request-detail.tsx:255-285` (columna Estado y botón «Asignar»); `src/features/services/workflow.ts:359-397` (`assign` marca como `declined` toda cotización abierta).
- Lo que ve la persona: un clic en «Asignar» y ya está («Servicio asignado a AeroVisión del Valle.»). En la tabla, la otra operadora pasa a «—  —  —  No puede». En «Mapeo de la última zona», la historia dice que AeroVisión «cotizó $ 7.900 por hectárea» y la tabla le pone «No puede».
- Qué entiende o hace mal: (1) comprometo $ 126.879 sin que me pregunte; en cambio «Verificar la entrega» sí tiene paso de confirmación, con «Aceptar la entrega» ya marcado aunque el operador declara 5,9 de 6,7 ha. (2) «No puede» es falso: esa operadora sí podía y cotizó $ 5.200. Y la tabla borra su precio, que es lo que necesito conservar para justificar ante la junta por qué no elegí la más barata.
- Por qué importa para su tarea: la decisión de la tarea 2 es la que después me preguntan. Lo no elegido tiene que quedar con su cifra.
- Propuesta: confirmación corta antes de asignar («Asignar a AeroVisión del Valle: $ 6.000 por ha, $ 126.879 en total. No se envía nada fuera de la demo.») con un campo «Motivo de la elección» opcional que alimente el informe de la junta. En la tabla, estado «No elegida» (y «No puede» solo si el operador la declinó), conservando precio y fecha. En «Verificar la entrega», mostrar encima de las opciones «Declaró 5,9 de 6,7 ha (88 %)» y no marcar «Aceptar» por defecto.
- Gravedad: confunde
- Evidencia: navegador (Servicios → Vigor del cultivo → Asignar; Mapeo de la última zona) y lectura de código.
- Huecos relacionados: H7

### G-08 Cifras que no cuadran al dividir a mano o al comparar pantallas
- Eje: caso-de-uso
- Dónde: `/servicios`, `/pagos`, `/informes`, `/programacion`.
- Lo que ve la persona:
  - «Área pedida 21,1 ha» y «Precio / ha $ 6.000» con «Total estimado $ 126.879» (21,1 × 6.000 = 126.600). En Mapeo: 6,7 ha × $ 7.200 = 48.240 y la tabla dice $ 48.537.
  - «Se cubrió el 94,7 % de lo pedido (26,4 de 27,9 ha)»: 26,4 / 27,9 da 94,6 %.
  - «Por revisar»: 3 en «Antes de pagar» y en la tabla de operadores; 5 en el asistente («Hay 5 observaciones… sin revisar») y en el informe consolidado («Hallazgos: 18 (13 revisados, 5 por revisar)»).
  - Cuatro vuelos mensuales distintos con «433 fotos» cada uno y duraciones de 24 o 25 minutos; los de julio y septiembre con 9,8 km, los de agosto y octubre con 10,1 km.
  - Tarifas y facturas muy redondas ($ 3.500, $ 6.000, $ 7.200, $ 850.000; facturas FV-2026-100 a 103 el día 28 de cada mes).
- Qué entiende o hace mal: las diferencias se explican (se calculan con el área exacta sin redondear; el asistente cuenta las sugerencias de imagen aún por revisar y otras pantallas no), pero nadie me lo dice. Yo, que desconfío de lo redondo, lo tomo como inventado.
- Por qué importa para su tarea: si tengo que presentar números a la junta, una cifra que no cuadra con otra pantalla me cuesta credibilidad.
- Propuesta: calcular el total con el área mostrada o mostrar el área con dos decimales; una nota al pie donde los conteos difieren («Se excluyen 2 sugerencias de IA aún no revisadas»); y variar la semilla (fotos, kilómetros y valores no repetidos ni tan redondos). Seguir marcando todo como de ejemplo.
- Gravedad: confunde
- Evidencia: navegador (capturas de Servicios, Pagos, Informes; texto de la pantalla) y lectura de código.
- Huecos relacionados: H7, H8

### G-09 El asistente «Próximo vuelo» explica por qué, pero no deja comparar zonas con números
- Eje: componente (y texto)
- Dónde: `/programacion`, `src/features/agents/next-flight-assistant.tsx:105-115`, `:200-265`; `src/features/agents/flight-proposal.ts:197`, `:212`, `:272`.
- Lo que ve la persona: titular «1 de 3 lotes merece un vuelo pronto» con «Lote 4: El vigor bajó en cada uno de los últimos 2 vuelos (0,75 → 0,72 → 0,62).». En el diálogo, motivos con cifras, «Prioridad alta» sin puntaje y, escondido en «Cómo se calculó», los pesos (40, 35, 30, 25, 15, 15 a 30; «Desde 25 puntos se propone; desde 50, con prioridad alta»).
- Qué entiende o hace mal: bien que explique y que diga «Nada se programa hasta que usted lo apruebe». Pero (a) no veo el puntaje por zona, así que no puedo comprobar la regla ni comparar el Lote 4 con los otros; (b) «1 de 3» da a entender que las otras dos están bien, cuando el Lote 3 tiene 5 observaciones sin verificar (3 de prioridad alta) y el Lote 5 tiene 3; solo están «ya en la agenda» (a eso lo dice el resumen escondido); (c) «vigor» aparece sin escala ni nombre del índice; (d) «observaciones confirmadas siguen sin verificar» se contradice a sí misma; (e) ««Zona por revisar» ya se había reportado en 2 vuelos anteriores» trata un título genérico como si fuera un problema repetido; (f) en la plantilla de caña el texto sigue diciendo «Lote 4» y «observaciones», mientras el vocabulario ofrece «suertes» y «novedades de campo».
- Por qué importa para su tarea: decido en segundos si me sirve; una tabla corta por zona con el puntaje contestaría la pregunta y haría confiable la regla.
- Propuesta: en el diálogo, una tabla de tres columnas, «Zona · Puntos · Lo que más pesó» (ej.: «Lote 4 · 70 · baja de vigor + 2 sin verificar»), con las zonas ya agendadas marcadas «Ya en el vuelo del 29 de oct». Titular: «Lote 4 pide un vuelo nuevo; Lote 3 y Lote 5 ya están en el del 29 de oct». Escribir «vigor (índice de 0 a 1)» la primera vez. Cambiar «confirmadas siguen sin verificar» por «confirmadas por el operador y todavía sin verificar en el sitio».
- Gravedad: confunde
- Evidencia: navegador (Programación → Ver propuesta) y lectura de código.
- Huecos relacionados: H8

### G-10 La demo no deja ver el trabajo de un ingenio con muchos cañicultores
- Eje: caso-de-uso
- Dónde: `/programacion`, `/informes`, `/servicios`; `src/features/demo/demo-data.ts` (un solo sitio de agricultura, «Hacienda Santa Rita»).
- Lo que ve la persona: la landing dice «Fincas e ingenios» y «Compare cada lote o suerte en el tiempo». En la demo hay una hacienda con tres lotes; cada sector tiene un solo sitio. Programación, Pagos e Informes son «de Hacienda Santa Rita».
- Qué entiende o hace mal: «a qué suerte mando el vuelo» para mí es entre decenas de haciendas y cientos de suertes. Aquí la decisión es entre tres lotes de una finca, y el informe de la junta es de una finca.
- Por qué importa para su tarea: no puedo saber si el asistente y el informe sirven a mi escala.
- Propuesta: no es una pantalla nueva: que el sitio de agricultura traiga más zonas (por ejemplo seis a ocho, con nombres de suerte) y que el asistente y el informe lo muestren. Mientras tanto, decirlo con honestidad: «Esta demo muestra una hacienda; varias haciendas a la vez se proponen y están por validar».
- Gravedad: confunde
- Evidencia: navegador y lectura de código.
- Huecos relacionados: H8, H2

### G-11 El vocabulario por empresa llega al menú pero no a los datos ni a muchos textos, y «Aplicador» no calza con lo que Servicios contrata
- Eje: texto
- Dónde: `/configuracion` pestaña «Nombres y menú»; `src/features/config/presets.ts:36-50`; `/programacion`, `/evolucion`.
- Lo que ve la persona: la plantilla «Caña de azúcar (ingenio o cañicultor)» cambia menú y Servicios: «Mapa y suertes», «Evolución del cultivo», «Ingenio · …», «Cañicultor · …», «Aplicador · AeroVisión del Valle». Pero las zonas siguen llamándose «Lote 3/4/5», el asistente dice «observaciones» y el vocabulario dice «Novedad de campo». La nota de la pantalla advierte: «Hoy el vocabulario se aplica al menú, a los títulos y a las pestañas de vuelos; el resto de textos se irá sumando.»
- Qué entiende o hace mal: me sirve, y lo entendí rápido: renombrar para que suene a mi ingenio. Pero queda una mezcla: «suertes» en el menú y «Lote 4» en el mapa. «Aplicador» es quien aplica producto; los servicios de ejemplo son monitoreo y mapeo, no aplicación.
- Por qué importa para su tarea: la junta y los cañicultores no deben ver mezcla de palabras. Si Configuración promete adaptar a mi empresa y lo hace a medias, lo descuento.
- Propuesta: que la plantilla de caña también renombre los nombres de zona de la semilla («Suerte 3, 4, 5») o que la nota diga qué sí se renombra hoy con una lista corta; y que «Operador» siga como «Operador» en la plantilla de caña (o «Prestador del vuelo»), reservando «Aplicador» para el servicio «Aplicación aérea».
- Gravedad: confunde
- Evidencia: navegador (aplicar la plantilla y recorrer Programación y Servicios) y lectura de código.
- Huecos relacionados: H1

### G-12 «Licencia» habla al vendedor y no al comprador; no hay precio ni qué incluye un piloto
- Eje: texto
- Dónde: `/configuracion` pestaña «Licencia», `src/features/config/config-view.tsx:644`; landing sin mención de precio.
- Lo que ve la persona: «En el producto real el plan lo fija la licencia que usted emite al cliente.» «Los nombres, límites y precios los define el propietario del software.» Tres planes (Base, Profesional, Empresarial) y una fila «Complementos… Aún no está construido.» La demo arranca en Empresarial.
- Qué entiende o hace mal: «usted emite al cliente» le habla al dueño de Otear, no a mí; me hace dudar de si yo soy el cliente. No sé si lo que vi (campos propios, marca) viene en un plan que pagaría. Al ver «Base / Profesional / Empresarial» sin cifra, esperaba un precio o al menos «por definir».
- Por qué importa para su tarea: para llevar algo a la junta necesito cuánto cuesta, de quién son los datos y cuánto dura una prueba; la demo no contesta ninguna de las tres.
- Propuesta: reescribir: «En el producto, su plan lo define la licencia que acuerde con Otear. Los planes, límites y precios están por definir y se acuerdan en el piloto.» Marcar la demo arrancando en Empresarial con «Esta demo muestra todo; su plan puede incluir menos». Y en la landing, una frase honesta sobre H3, H4 y H5: «Precio, propiedad de los datos y alcance del piloto: por definir con usted en la primera reunión», sin inventar tarifas.
- Gravedad: confunde
- Evidencia: navegador y lectura de código.
- Huecos relacionados: H3, H4, H5

### G-13 La landing no cuenta un caso con números, y la demo ya tiene uno
- Eje: caso-de-uso (y texto)
- Dónde: `/`, `src/features/landing/landing-page.tsx:20-42` (tres tarjetas «Qué resuelve») y `:104-134` (roles).
- Lo que ve la persona: «Si le cobraron de más, lo ve antes de aprobar el pago.» sin ejemplo; «Sabe cuánto pagó por vuelos, cuánto cubrieron y qué decisiones salieron de ahí.»
- Qué entiende o hace mal: creo la idea, pero no veo una cifra. En la demo sí hay una escena buena: pedido 27,9 ha, declarado 26,4, facturado 27,9, y «Facturó de más».
- Por qué importa para su tarea: yo defiendo ante la junta con una cifra, no con un adjetivo.
- Propuesta: debajo de «Verifique lo cubierto, no las promesas.», una línea marcada: «Ejemplo de la demo: se pidieron 27,9 ha, el operador declaró 26,4 y facturó 27,9. Otear lo marca antes de pagar. (Cifras de ejemplo.)» Sin agregar clientes ni ahorros inventados.
- Gravedad: confunde
- Evidencia: navegador y lectura de código.
- Huecos relacionados: H8

### G-14 Detalles de texto y avisos (varios menores)
- Eje: texto
- Dónde: `src/features/services/use-services.ts:69`; `src/features/flights/planning/scheduling-view.tsx:272` y `:389`; `src/components/maps/site-map-canvas.tsx:331`; `src/features/reports/insights.ts:202`; invitación flotante (`features/entry/`).
- Lo que ve la persona:
  - Aviso «Solicitud enviada a los operadores invitados.», cuando el formulario ya dijo «no se envía nada fuera de esta demostración».
  - El formulario de vuelo tutea: «¿Qué necesitas revisar?», «Añade puntos en el mapa», «Haz clic para añadir un punto», mientras el resto usa usted.
  - Informes: «Seguimiento programado (2026-10-29): preparación 3 de 16.», fecha en formato técnico.
  - La tarjeta «¿Esto, con sus datos?» aparece sobre la lectura de cotizaciones justo cuando comparo.
- Qué entiende o hace mal: nada grave, pero cada uno resta credibilidad o estorba en el momento de decidir.
- Por qué importa para su tarea: el aviso falso de envío contradice la regla de que nada es real.
- Propuesta: «Solicitud creada en esta demo. No se envió a ningún operador.»; «¿Qué necesita revisar?», «Añada puntos en el mapa», «Haga clic para añadir un punto»; usar `formatDate`; no mostrar la invitación mientras haya un diálogo o una tabla de cotizaciones abierta.
- Gravedad: menor
- Evidencia: navegador (captura de Servicios con la invitación) y lectura de código.
- Huecos relacionados: H7

## 6. Lo que funciona y hay que conservar

1. **«Lectura de las cotizaciones».** Nombra el trade-off real («13 % más económica… pero empieza 3 días antes y cubrió 94 % frente a 88 %»), deja claro «La decisión es suya: asigne desde la tabla», compara con «Referencia propia… No es una tarifa de mercado» y ofrece «Antes de asignar, pregunte» con preguntas que se pueden copiar. Es lo único que no parece caja negra.
2. **La tarjeta «Verificación del área» y «Antes de pagar».** Pedido / Cubierto / Facturado, tolerancia del 5 %, semáforo y la frase «Pida la justificación antes de pagar». Es el momento más claro de la demo para un ingenio. No quitarlo al corregir G-02 y G-06.
3. **El asistente «Próximo vuelo» muestra sus razones.** Cifras con la historia, «Cómo se calculó» con pesos, «Los pesos son un punto de partida para validar», y «Nada se programa hasta que usted lo apruebe», con la insignia «Sugerido por IA · ejemplo». Conservar el tono y el orden; solo agregar lo de G-09.
4. **El progreso del servicio en Servicios** (Solicitud → Cotizaciones → Asignación → Vuelo programado → Entrega → Verificación → Factura), el bloque «Le toca a usted» y la «Historia» con fecha: se entiende en dónde está cada cosa y a quién le toca.
5. **La plantilla «Caña de azúcar (ingenio o cañicultor)»** y el vocabulario en Servicios («Ingenio», «Cañicultor»): se siente hecho para esta industria.

## 7. Huecos H1–H9 desde este rol

- **H1 (qué es Otear, si presta vuelos):** me estorba. Ni el hero ni la prueba de 5 segundos me lo dicen; «No le pedimos cambiar de operador» está al final, en el formulario.
- **H2 (cómo entran los vuelos):** me estorba. Como ingenio con varios operadores, necesito saber si cada operador sube su registro o lo subo yo; hoy sale «declarado por el operador» sin decir cómo llegó.
- **H3 (precio):** me estorba mucho: para una junta es lo primero. «Licencia» muestra planes sin precio y con voz de vendedor (G-12).
- **H4 (datos y salida):** me estorba: la demo mezcla datos de ingenio y cañicultores en Servicios y no dice quién ve qué (G-05).
- **H5 (qué sería un piloto):** me estorba: para un ingenio, un piloto con criterios medidos contra sus propios registros es la forma de entrar.
- **H6 (primer minuto):** me estorba poco: Programación con la franja del asistente me sirvió; me faltó saber que estaba mirando como ingenio.
- **H7 (real vs simulado):** me estorba en tres puntos: el aviso «Solicitud enviada…» (G-14), el texto «se cubrió de verdad» (G-06) y la semilla de Servicios que no cierra (G-01).
- **H8 (historia con números):** me estorba: la demo la tiene (27,9 / 26,4 / 27,9 ha) y la landing no (G-13), y las cifras no cuadran entre pantallas (G-02, G-08).
- **H9 (qué se mide de quien entra):** me es indiferente.

## 8. Qué le preguntaría a una persona real como ella

1. Cuénteme de la última vez que pagó una factura de un operador de dron o de aplicación aérea: ¿con qué documento comprobó las hectáreas cubiertas y cuánto le tomó?
2. Cuando fue a decidir a qué suertes mandar el siguiente vuelo (o la siguiente visita), ¿qué miró, de dónde lo sacó y quién más participó en la decisión?
3. La última vez que presentó cifras de este tema a la junta o a los proveedores, ¿qué le preguntaron que no pudo contestar en el momento y qué archivos tuvo que armar a mano?

## 9. Límites

- Es una persona simulada: son hipótesis, sin porcentajes, citas ni clientes inventados.
- No vi WebGL (la demo cae a la alternativa sin 3D), así que no revisé el aspecto del dron, la galería de modelos ni la simulación del vuelo; no son de mi camino de decisión.
- No revisé Vuelos, Mapa, Equipos ni Documentos más allá de leerlos de pasada; el asistente de «Imágenes» no lo probé.
- Probé solo el sector agricultura en escritorio (1366 px de ancho); en móvil solo vi el hero de la landing. No recorrí la landing completa en móvil.
- Las pruebas cambiaron el estado en memoria de la demo (una solicitud nueva, una asignación y una verificación); y la plantilla de «Caña de azúcar» quedó guardada en el `localStorage` de mi perfil de Chromium temporal, no en el proyecto.
- No comprobé qué hace «Guía de la demo» (enlace con flecha de salida).
- «Evidencia: lectura de código» en G-03, G-05 y G-08 se refiere a la causa; lo visible lo vi en el navegador.
- Mis cuentas de G-02 y G-08 usan solo cifras que muestra la pantalla; la explicación de las diferencias (áreas sin redondear, sugerencias de IA excluidas) sale de leer el código y los avisos, no de los datos de campo.
