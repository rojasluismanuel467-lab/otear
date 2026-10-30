# Revisión por persona: Visitante frío

Hipótesis de dos lecturas del mismo rol, escritas por un agente que interpreta a la persona. No son resultados de usuarios reales. Capturas en `/tmp/claude-1000/-home-luisrojas-Documents-personal-otear/5a7b1a0b-b9e7-405a-9faa-3e7d2758764d/scratchpad/visitante/` (hero.png, d00-d08.png, m00-m12.png, p3.png, q2.png, s2.png, e1.png, f3.png, md0.png).

Fecha de la revisión: 30 de octubre de 2026. Demo local en `:3000` (servidor de desarrollo).

## 1. Persona y tareas

Le llegó el enlace de la landing por WhatsApp con «mira esto, a lo mejor nos sirve». Poca paciencia, abre primero en el computador y luego en el celular. Dos lecturas, separadas en cada sección:

- **(a) Marta**, 45 años, directora de operaciones de una empresa mediana. No es del sector de drones y no sabe si le interesa.
- **(b) Lector inteligente ajeno a todo sector**, que solo conoce lo que dice la página.

Tareas, en orden y sin ayuda:

1. Decir qué es Otear, para quién es y si presta el servicio de vuelo (5 segundos primero).
2. Encontrar cuánto cuesta y cómo se empieza.
3. Decidir si pulsa «Abrir la demo» o «Hablemos», y por qué.
4. Entrar a la demo y, en el primer minuto, decir qué entendió que podía hacer ahí.
5. Abrir el formulario de contacto y llegar al paso 2 sin enviar nada.

## 2. Prueba de 5 segundos (escrita antes de leer el resto de la landing)

Solo vi la primera pantalla (`hero.png`): logo OTEAR con un planeador, un avión blanco que vuela a la izquierda, el titular «Mire su operación desde arriba sin perder el vuelo de la semana pasada», un párrafo, dos botones y tres etiquetas («Sin registro · Datos sintéticos · Funciona offline»).

**(a) Marta**
- ¿Qué cree que hace Otear? «Algo de drones para ver mi operación desde arriba. No sé si es una empresa que vuela o un programa. Lo del "vuelo de la semana pasada" lo leí como perder un vuelo de avión; no lo entendí.»
- ¿Para quién es? «Para gente con fincas, vías, obras… tampoco sé si soy yo, mi operación no es ninguna de esas.»
- ¿Qué haría ahora? «Pulsaría "Abrir la demo" porque es el botón fuerte y no compromete nada. "Hablemos sin compromiso" no, no sé con quién hablaría ni de qué.»

**(b) Lector ajeno**
- ¿Qué hace? «Una empresa de drones, por el avión y el logo. Quizá vende o alquila drones, quizá hace vuelos. Hasta el segundo párrafo no veo que "reúne vuelos" (de otros).»
- ¿Para quién? «Para quien tenga "una operación". La palabra "operación" no me dice nada concreto.»
- ¿Qué haría? «Leer el párrafo largo; si no me aclara, cerrarlo.»

Veredicto de la prueba: **falló**. Para saber que es una plataforma para reunir y revisar vuelos hizo falta leer el párrafo de 4 líneas, y el aviso de que no es un operador de vuelos no está en la primera pantalla.

## 3. Primer minuto en la demo

Entré con el botón del hero («Abrir la demo»), sin elegir sector. Eso me dejó en `/programacion/` (`p3.png`, `q1`):

- Sin aviso ni bienvenida. El aviso de 9 s («Entró como…») solo se dispara si se eligió sector en «¿Qué opera usted?», porque el botón del hero no marca `launch` (`landing-page.tsx:173`; `demo-entry.tsx:11-45`). Con el selector sí aparece (`s2.png`: «Entró como obra: ya ve «frentes» y «observación» como en su sector.»).
- La primera pantalla es un calendario de agenda con un mapa satelital de la «Hacienda Santa Rita», «Lote 3/4/5», un botón «Programar vuelo», una tarjeta «Sugerido por IA · ejemplo». Es la pantalla de programar, no la que muestra el valor.
- Marta: «Parece un programa para agendar vuelos. ¿Yo agendo los vuelos? Pensé que ya venían hechos.» Dudé 20 s sin saber qué tocar. Abrí «Guía de la demo» (enlace pequeño abajo del menú): tres frases genéricas («Prepara un vuelo y revisa su ruta. Abre un registro… Registra pagos de ejemplo…») que no dicen por dónde empezar ni qué mirar.
- Lo que sí entendí: que es una demo («Demo interactiva», «Administrador · ejemplo»), que hay cinco casos arriba (iconos sin texto salvo el activo), que los datos son de ejemplo.
- Lo que no encontré en el primer minuto: la comparación en el tiempo (Evolución) y «Antes de pagar», que son lo que prometía el titular. Quedaron a un clic, pero nada me los señaló.
- Segunda ruta, recargando la página (`e1.png`): tras elegir «Obra» y luego recargar, la demo muestra «Avance de obra» como título sobre la hacienda agrícola con «6 problemas en este vuelo». Mezcla de vocabulario de obra con datos agrícolas (ver V-12).
- Móvil (`md0.png`): se usa, pero el botón «Menú» queda recortado por los iconos de sector («Mer»).

## 4. Tareas: ¿pudo terminar cada una?

| # | Tarea | Resultado | Por qué |
|---|---|---|---|
| 1 | Qué es, para quién, si presta vuelos | **Con ayuda** (a) / **No** (b) | Marta lo infiere al leer el párrafo; sobre «¿presta vuelos?», solo lo deduce (por el rol «Operador de dron» en la sección 5 y por «No le pedimos cambiar de operador de dron» en el formulario, al final). El lector ajeno no lo sabe. |
| 2 | Cuánto cuesta y cómo se empieza | **No** | Ninguna cifra ni condición de precio. «Primera reunión gratis» solo dice que la primera conversación no cuesta. Cómo se empieza: nadie lo explica; el único camino es «Hablemos». La pestaña «Licencia» de la demo muestra «Base / Profesional / Empresarial» sin precios y dirigida al dueño del software («la licencia que usted emite al cliente»). |
| 3 | «Abrir la demo» o «Hablemos» | **Sí**, con duda | Elijo la demo: es gratis, sin registro, no me compromete. «Hablemos» me pide dar nombre y correo a alguien que no sé quién es, para una conversación sin contenido anunciado. |
| 4 | Primer minuto en la demo | **Con ayuda** | Entendí que podía programar vuelos y mirar un mapa; no entendí qué decisión me resolvía. Lo mejor (comparar en el tiempo, verificar cobros) solo lo vi al explorar Evolución por mi cuenta. |
| 5 | Formulario hasta el paso 2 sin enviar | **Sí** | Lo hice con datos de prueba evidentes («Prueba Revision», `prueba@ejemplo.test`), sin pulsar ningún canal (`f3.png`). No se abrió WhatsApp ni correo, no se envió nada. |

## 5. Hallazgos

Ordenados de más a menos grave. Máximo 14.

### V-01 El titular no dice qué es Otear y «el vuelo de la semana pasada» se lee como un viaje en avión
- Eje: texto
- Dónde: `/`, `src/features/landing/landing-page.tsx:160-171` (titular y subtítulo); el rol del operador solo aparece en `:115-119` y la aclaración «No le pedimos cambiar de operador de dron» en `:450-452`.
- Lo que ve la persona: «Mire su operación desde arriba sin perder el vuelo de la semana pasada.» Después, un párrafo que empieza «Otear reúne los vuelos de dron de su operación…». Junto al texto, un avión blanco con «OTEAR» y «VIPER».
- Qué entiende o hace mal: Marta no encuentra nombrada la categoría (plataforma, software, servicio). «Perder el vuelo» en español común es perder un vuelo de avión; la palabra «dron» solo aparece en la segunda frase del párrafo. El avión animado y el logo con planeador dicen «empresa de drones»: parece que Otear vuela o vende drones. «Operación» no dice nada concreto a quien no es del sector.
- Por qué importa para su tarea: falla la prueba de 5 segundos y la pregunta «¿presta el servicio de vuelo?». Es la tarea 1 completa.
- Propuesta: primera línea que nombre la categoría y diga lo que no es. Texto de ejemplo: «Otear es la plataforma donde reúne y revisa los vuelos de dron de su operación.» y debajo, siempre visible: «Otear no hace los vuelos: usted sigue con el operador que ya tiene o el que elija.» Dejar la frase poética como segunda línea o quitarla. (El nombre de la categoría, «plataforma» o «software», lo decide el dueño del proyecto.)
- Gravedad: bloquea la tarea
- Evidencia: navegador (`hero.png`, `m00.png`)
- Huecos relacionados: H1

### V-02 No hay precio, ni modelo de cobro, ni «cómo se empieza»
- Eje: texto
- Dónde: toda la landing; lo más cercano está en `landing-page.tsx:433-465` (sección «Hablemos sin compromiso») y en la pestaña «Licencia» de `/configuracion` (`features/config/config-view.tsx:625-660`).
- Lo que ve la persona: «Primera reunión gratis, por videollamada o en su sitio de trabajo.» «Aún no tenemos piloto en estos sectores; por eso queremos oír el suyo.» (`:253-254`). Nada más. «Se construye con usted» (`:98`) para los componentes.
- Qué entiende o hace mal: Marta busca «Precios» y no hay. «Primera reunión gratis» le hace pensar que las siguientes se cobran. «Se construye con usted» le suena a desarrollo a la medida y a costo alto. «No tenemos piloto» sin decir qué sería uno le deja el siguiente paso en blanco. La pestaña Licencia muestra Base/Profesional/Empresarial pero está dirigida al vendedor, no al comprador, y sin cifras.
- Por qué importa para su tarea: es la tarea 2, que no se pudo completar. Sin esto Marta no puede reenviar el enlace a su jefe con una frase útil.
- Propuesta: texto honesto sin inventar tarifas, en una franja visible (cerca de los botones o antes del formulario), de ejemplo: «Cuánto cuesta: por definir. Se acuerda según su operación después de la conversación de 30 minutos, que no tiene costo.» «Cómo se empieza: 1. Conversación de 30 minutos. 2. [por definir: un piloto con sus propios vuelos]. 3. Usted decide si sigue.» Los pasos 2 y 3 son una decisión del dueño; si aún no existen, decirlo: «El piloto todavía se está definiendo; usted ayudaría a definirlo.»
- Gravedad: bloquea la tarea
- Evidencia: navegador (búsqueda de «precio, costo, cuesta, tarifa, plan» en el texto de la landing sin coincidencias; `c1.png`)
- Huecos relacionados: H3, H5

### V-03 La primera pantalla no muestra el producto ni el flujo en pasos
- Eje: componente
- Dónde: `/`, hero `landing-page.tsx:156-201` (el hueco `droneWrap` está reservado para el avión, `:195-199`); secciones de pasos en `:286-303` y `:329-346`.
- Lo que ve la persona: en la primera pantalla, un avión animado y texto. En el móvil el hero no trae ni una imagen del producto (`m00.png`). Los tres «pasos» (`steps`) hablan de beneficios («Deje de recibir PDFs sueltos», «Verifique lo cubierto…») y aparecen después de cinco casos de sector y de «A su medida».
- Qué entiende o hace mal: no hay ni una captura de la pantalla de comparación o de «Antes de pagar». Una plataforma que se entiende (las de referencia) muestra el producto y explica «1. Registre el vuelo, 2. Compare, 3. Decida». Aquí la persona tiene que abrir la demo para saber cómo se ve.
- Por qué importa para su tarea: Marta decide en segundos si se queda. El avión es adorno: atrae la mirada pero responde otra pregunta («¿venden drones?»).
- Propuesta: junto o debajo del titular, una imagen real de la demo (la comparación de Evolución con «Lote 4 baja de vigor», marcada «Ejemplo con datos sintéticos»); debajo, una línea de 3 pasos: «1. Su operador vuela. 2. Usted reúne y compara los vuelos. 3. Antes de pagar, revisa lo cubierto.» El avión puede quedarse más abajo.
- Gravedad: confunde
- Evidencia: navegador (`hero.png`, `m00.png`); lectura de código
- Huecos relacionados: H1, H2

### V-04 El primer minuto en la demo no tiene camino: cae en Programación y el valor queda escondido
- Eje: componente
- Dónde: `/programacion`; `src/features/entry/demo-entry.tsx:11-45` (el aviso solo con el selector); `landing-page.tsx:173` (el hero no marca `launch`); `src/components/app-shell.tsx:193` y `:369-411` («Guía de la demo»).
- Lo que ve la persona: calendario, mapa, «Programar vuelo» y «Sugerido por IA · ejemplo». Un enlace pequeño «Guía de la demo» abajo a la izquierda con tres frases generales.
- Qué entiende o hace mal: que la herramienta sirve para agendar vuelos. Lo que el titular prometía (comparar, verificar lo cubierto antes de pagar) no está en esa pantalla y no se señala. Quien entra por el botón del hero no recibe ni el aviso que sí recibe quien elige sector: dos entradas, dos experiencias, y la peor para quien llega más frío. Los cinco iconos de sector de la barra superior no tienen texto (salvo el activo).
- Por qué importa para su tarea: tarea 4. Marta dice «es una agenda de vuelos» y se va sin haber visto Evolución ni Pagos.
- Propuesta: que la entrada desde el hero muestre la misma tarjeta de bienvenida que la del selector, con tres cosas por abrir, en orden y en palabras de ella: «Mire cómo cambió un lote entre dos vuelos (Evolución). Mire qué se cobró frente a lo cubierto (Pagos > Antes de pagar). Mire el informe que sale de ahí (Informes).» Reescribir la guía con esos tres pasos y ponerla como primer elemento visible, no como enlace de pie.
- Gravedad: confunde
- Evidencia: navegador (`p3.png`, `q2.png`, `s2.png`)
- Huecos relacionados: H6, H7

### V-05 No se dice quién sube los vuelos ni qué hace Otear con ellos
- Eje: texto
- Dónde: `/`, `landing-page.tsx:165-171` (subtítulo), `:388-393` (demo), `:114-118` (rol operador).
- Lo que ve la persona: «Otear reúne los vuelos de dron de su operación… en un solo lugar.» La demo ya trae «32 vuelos · 2 operadores» (`:412-415`).
- Qué entiende o hace mal: Marta no sabe si tiene que subir ella las fotos, si lo hace el operador, ni de dónde salen los números («0,75 → 0,72 → 0,62»). Piensa que Otear analiza las imágenes, lo cual la demo no hace.
- Por qué importa para su tarea: sin esto no puede imaginarse usándolo el lunes. Y puede inferir una capacidad que no existe.
- Propuesta: una frase honesta cerca del flujo, de ejemplo: «Los vuelos los hace su operador. Las fotos y el registro del vuelo se cargan en Otear [por definir: quién y cómo]. En esta demo todo viene cargado de ejemplo; Otear todavía no analiza imágenes.» La respuesta de fondo (quién sube) es del dueño.
- Gravedad: confunde
- Evidencia: lectura de código; navegador (texto completo de la landing)
- Huecos relacionados: H2

### V-06 No hay una historia con números; el mejor gancho para un director («le cobraron de más») queda en la segunda sección
- Eje: caso-de-uso
- Dónde: `landing-page.tsx:28-32` («Antes de pagar»), `:316-347` (sección «Qué resuelve»), `:402-429` (cifras de la demo).
- Lo que ve la persona: tres tarjetas de funciones, cinco tarjetas de sector, y una tabla de «cifras» de la demo («5 proyectos · 5 sectores», «32 vuelos», «10 vistas interactivas»). Ninguna cuenta un caso.
- Qué entiende o hace mal: las cifras describen la demo, no un resultado. Marta, que paga servicios y firma facturas, reconocería de inmediato la idea de «lo pedido, lo cubierto y lo facturado», pero está en la tarjeta 2 de la sección 5 y sin un ejemplo concreto.
- Por qué importa para su tarea: ayuda a decidir entre «Abrir la demo» y «Hablemos» (tarea 3): sin un caso, la decisión es por curiosidad, no por problema.
- Propuesta: un solo caso corto, marcado «Ejemplo con datos sintéticos», con las cifras del propio proyecto de ejemplo (tomarlas de la comparación pedido/cubierto/facturado de Pagos en `demo-data.ts`, no inventarlas): «En la hacienda de ejemplo se pidieron X ha, el operador declaró Y y se facturaron Z. Otear lo muestra antes de aprobar el pago.» Subirlo a la segunda pantalla.
- Gravedad: confunde
- Evidencia: lectura de código; navegador (`d02.png`, `d04.png`, `d07.png`)
- Huecos relacionados: H8

### V-07 No dice quién está detrás ni en qué estado está, y la única prueba honesta está escondida
- Eje: texto
- Dónde: `landing-page.tsx:253-254` («Aún no tenemos piloto en estos sectores»), `:476-478` (pie: «Validación comercial — datos sintéticos. No conectamos aún con sistemas reales…»), `:433-465` (contacto).
- Lo que ve la persona: ni nombres, ni empresa, ni ciudad, ni clientes. Solo `hola@otear.app`. El estado real («estamos validando, sin clientes aún») está en la letra pequeña del pie y dentro de la tarjeta «Su sector».
- Qué entiende o hace mal: Marta no sabe a quién le daría su correo ni si hay empresa detrás; interpreta la falta de clientes o logos como señal de poca seriedad, cuando en realidad es una etapa honesta.
- Por qué importa para su tarea: es lo que decide «Hablemos» frente a «Abrir la demo» (tarea 3).
- Propuesta: sin inventar nada, subir lo que sí es cierto y dejarlo cerca del titular, de ejemplo: «Otear está en validación: todavía no tiene clientes en operación. Pruebe la demo con datos de ejemplo y cuéntenos si le sirve.» Añadir quién responde el correo (un nombre, cargo y ciudad reales, a definir por el dueño).
- Gravedad: confunde
- Evidencia: lectura de código; navegador (`d07.png`)
- Huecos relacionados: H5, H4

### V-08 Jerga que Marta no usa, y una promesa que puede entenderse como firma legal
- Eje: texto
- Dónde: `landing-page.tsx:36` («Informes firmados con huella digital… la firma se marca inválida»), `:211` («Un mismo núcleo, cualquier sector»), `:281` («El núcleo es el mismo: sitios, zonas, vuelos, comparación, hallazgos e informes firmados»), `:425-427` («Firma digital · SHA-256 real»), `:34` («Trazabilidad real»), `:116-117` («le aprueban la factura»).
- Lo que ve la persona: «núcleo», «hallazgos», «huella digital», «SHA-256 real», «trazabilidad real», «componente».
- Qué entiende o hace mal: (a) Marta no sabe qué es un hash; «SHA-256 real» más «informes firmados» le sugiere una firma con validez legal. En la demo la huella se calcula en el navegador y no identifica a una persona. (b) El lector ajeno no entiende «núcleo» ni «hallazgo».
- Por qué importa para su tarea: sobrepromete lo que un informe «firmado» vale ante una auditoría, y excluye al visitante que no es técnico.
- Propuesta: «Cada informe guarda una marca que cambia si alguien edita una cifra, así se nota. En la demo esto es un ejemplo; no es una firma con validez legal.» Reemplazar «núcleo» por «la misma base» y «hallazgos» por «lo que se encuentra en el vuelo» (o el término del sector). La tabla de cifras: cambiar «SHA-256 real» por «Marca de integridad, calculada de verdad».
- Gravedad: confunde
- Evidencia: lectura de código; navegador (`d07.png`)
- Huecos relacionados: H7

### V-09 El orden de la landing hace que el valor llegue tarde; los cinco sectores pesan igual
- Eje: componente
- Dónde: `landing-page.tsx:205` (selector), `:207-269` (cinco casos + «Su sector»), `:271-314` («A su medida»), `:316-347` («Qué resuelve»), `:349-379` («Para quién»).
- Lo que ve la persona: tras el hero, un selector, cinco tarjetas de sector, una sección sobre construir componentes propios, y solo después «Qué resuelve» y «Para quién». En escritorio la página mide unos 7.000 px; en móvil unos 10.700 (`m*.png`).
- Qué entiende o hace mal: a Marta le toca recorrer unas tres pantallas de casos de uso y de personalización antes de leer qué problema resuelve. Con cinco casos iguales y una tarjeta «Su sector» sin decir nada más, parece «sirve para todo»; ninguno la ancla. La parte buena: el selector «¿Qué opera usted?» y «Su sector» le permiten reconocerse.
- Por qué importa para su tarea: ayuda en las tareas 1 y 3, pero el orden esconde lo que las responde.
- Propuesta: mover «Qué resuelve» y «Para quién» antes de los casos de sector, y «A su medida» después de la demo. La decisión de fondo (un caso principal o cinco iguales) es del dueño; aquí solo se documenta que el efecto sobre un visitante frío es «no sé si es para mí».
- Gravedad: confunde
- Evidencia: navegador (`d01`-`d07`); lectura de código
- Huecos relacionados: H1, H8

### V-10 Las etiquetas del hero («Datos sintéticos», «Funciona offline») son jerga, y la segunda no es cierta del todo
- Eje: texto
- Dónde: `landing-page.tsx:186-190`; tamaño 12 px y gris azulado en `landing.module.css:336-343`.
- Lo que ve la persona: «Sin registro · Datos sintéticos · Funciona offline», en letra pequeña bajo los botones.
- Qué entiende o hace mal: «sintéticos» no es palabra de Marta; «offline» sugiere que no usa internet, pero el mapa de la demo carga imagen satelital de Esri (se ve la atribución en `p3.png`) y por eso necesita conexión. La aclaración más importante, que los datos no son reales, es la que está en menos letra.
- Por qué importa para su tarea: confunde qué es real. Y la frase falsa baja la confianza apenas se prueba sin red.
- Propuesta: «Sin registro · Con datos de ejemplo, no son reales · No envía nada a nadie». Quitar «Funciona offline» o decir «Los mapas necesitan conexión».
- Gravedad: menor
- Evidencia: navegador (`hero.png`, `p3.png`); lectura de código
- Huecos relacionados: H7

### V-11 El formulario promete «una llamada» pero el paso 2 pide enviar el mensaje uno mismo
- Eje: texto
- Dónde: `src/features/landing/lead-form.tsx:147` («Quiero una llamada»), `:159-162` (nota al pie del paso 1), `:184-191` (paso 2: «Falta enviarlo»), `:106` (placeholder «Hernando Álvarez»), `:263-268` (sin canal).
- Lo que ve la persona: paso 1 de 2 con nombre, correo y sector, botón «Quiero una llamada». En el paso 2: «Listo, Prueba. Elija cómo enviarnos su mensaje», con WhatsApp, correo y «Elegir una hora» (en el entorno de desarrollo, «Pendiente: defina NEXT_PUBLIC_BOOKING_URL»).
- Qué entiende o hace mal: al pulsar «Quiero una llamada» Marta cree que la llamada quedó pedida; la explicación de que todavía falta enviar un mensaje desde su WhatsApp o correo está en texto gris pequeño debajo del botón. Hace dos pasos para terminar en otra aplicación. El ejemplo «Hernando Álvarez» es un productor, no una directora de operaciones. En producción, si no se configura ningún canal, el paso 2 solo dice «Todavía no hay un canal de contacto disponible en esta página», y el formulario queda sin salida.
- Por qué importa para su tarea: tarea 5. La completé, pero una persona con poca paciencia abandona en el paso 2 creyendo que ya pidió la llamada.
- Propuesta: botón «Continuar» o «Preparar mi mensaje» y, encima de él, la frase «En el siguiente paso usted envía el mensaje por WhatsApp o correo; esta página no lo recibe». Mantener «Paso 1 de 2 · Unos segundos». Poner un ejemplo neutro en el nombre («Nombre y apellido»). Comprobar antes de publicar que al menos un canal esté configurado.
- Gravedad: confunde
- Evidencia: navegador (`f3.png`); lectura de código
- Huecos relacionados: H5

### V-12 Tras recargar, el vocabulario del sector elegido se queda pero los datos vuelven a agricultura
- Eje: componente
- Dónde: `/evolucion` después de elegir «Obra» en el selector y recargar; `src/features/entry/demo-entry.tsx:36-45`; configuración guardada en `localStorage` (`features/config/config-store.ts`); `src/components/app-shell.tsx:389` («se reinician al recargar») frente a `landing-page.tsx:392` («Todo queda en su navegador»).
- Lo que ve la persona: título «Avance de obra» y menú «Mapa y frentes», pero con la «Hacienda Santa Rita», «Lote 4 baja de vigor» y «6 problemas en este vuelo» (`e1.png`).
- Qué entiende o hace mal: piensa que la demo está rota o mezcla cosas. Además, la landing dice que «todo queda en su navegador» y la guía dice que los cambios se reinician al recargar: se contradicen.
- Por qué importa para su tarea: Marta abre el enlace de nuevo desde WhatsApp o prueba en el celular después del computador; es un camino probable. Rompe la confianza en el primer minuto.
- Propuesta: que al entrar con el selector se restablezca también el sitio, o que al recargar se restablezca el vocabulario; y unificar el texto: «Lo que haga en la demo se borra al recargar. Los nombres que elija en Configuración se quedan en este navegador.»
- Gravedad: confunde
- Evidencia: navegador (`e1.png`, `s2.png`)
- Huecos relacionados: H6, H7

### V-13 El avión animado se pasa por encima del texto
- Eje: componente
- Dónde: `/`, capa fija `features/landing/drone-flight.tsx` y `flight-scene.ts`.
- Lo que ve la persona: el avión cubre parte de una frase en el selector («La demo se abre con ese vocabulario», `d01.png`, `m01.png`), de una tarjeta de caso (`d02.png`), de la lista de beneficios del formulario (`m11.png`) y de los botones de canal del paso 2 (`f3.png`).
- Qué entiende o hace mal: debe esperar a que se mueva o adivinar la frase. No bloquea los clics (la capa deja pasar el puntero), pero tapa lectura.
- Por qué importa para su tarea: para quien llega frío y con poca paciencia es un tropiezo en justo los pasajes que explican cómo seguir (selector y formulario).
- Propuesta: que el avión se estacione o desaparezca mientras la persona lee el selector y el formulario; o limitarlo a los márgenes. No cambia la idea de marca.
- Gravedad: menor
- Evidencia: navegador (capturas citadas)
- Huecos relacionados: —

### V-14 En el celular la página es muy larga y la demo recorta el botón de menú
- Eje: componente
- Dónde: `/` (móvil, altura ≈ 10.700 px); `/programacion` y `/evolucion` en móvil (`md0.png`, `md1.png`); `src/components/app-shell.tsx:215-216`.
- Lo que ve la persona: en el hero móvil no hay producto a la vista (`m00.png`). Más abajo, tarjetas largas una por una (unas doce pantallas de alto). En la demo móvil, el botón de menú queda tapado a la mitad («Mer») por el grupo de iconos de sector.
- Qué entiende o hace mal: no sabe cómo ver el resto de módulos; el menú es la única vía a Evolución y Pagos y está recortado.
- Por qué importa para su tarea: la persona abre el enlace de WhatsApp en el celular; es su segunda pasada.
- Propuesta: en móvil, mostrar el menú con su ícono sin recortar y acortar la landing (pasos en una lista compacta). No hay horizontal scroll (`scrollWidth` = 390).
- Gravedad: menor
- Evidencia: navegador (emulación de 390×844, no un teléfono real)
- Huecos relacionados: H6

## 6. Lo que funciona y hay que conservar

- **El selector «¿Qué opera usted?» y el aviso de bienvenida.** Elegir «Obra» y pulsar «Abrir la demo de obra» deja una frase clara en la demo: «Entró como obra: ya ve «frentes» y «observación» como en su sector» (`s2.png`). Es el único momento en que la demo habla con la persona; hay que conservarlo y ampliarlo, no quitarlo.
- **La honestidad sobre lo que es y no es.** «Aún no tenemos piloto en estos sectores; por eso queremos oír el suyo», «hasta entonces no hemos recibido nada», «Demo interactiva», «Administrador · ejemplo» y «Sugerido por IA · ejemplo» le dicen a Marta que no la están engañando. Esa franqueza es lo que más confianza da; solo hay que subirla.
- **El formulario en dos pasos con envío desde su propia aplicación.** «Paso 1 de 2 · Unos segundos», y la promesa de que la página no guarda ni recibe nada, bajan el riesgo de dar el correo. Conservar el diseño, ajustando solo el rótulo del botón (V-11).
- **«No le pedimos cambiar de operador de dron» y «Si no le cuadra, le pasamos igual el resumen».** Son las dos frases que más reducen la barrera de «Hablemos». Hay que conservarlas, pero deben aparecer arriba (V-01).
- **La frase en lenguaje llano de Evolución:** «Lote 4 baja de vigor — Cae en dos vuelos seguidos: 0,75 → 0,72 → 0,62» (`e1.png`). Es lo primero que Marta entiende como valor. Mantenerlo.
- **Los textos de los casos de sector** (`landing-page.tsx:40-76`): cada tarjeta trae un verbo y un resultado reconocibles («verifique las hectáreas cubiertas antes de pagar al operador»).

## 7. Huecos H1–H9 para esta persona

- **H1 Qué es Otear / si presta vuelos:** estorba por completo. Es la causa de la prueba de 5 segundos fallida (V-01, V-03).
- **H2 Cómo entran mis vuelos:** estorba; sin esa frase no se imagina usándolo (V-05).
- **H3 Cuánto cuesta y cómo se cobra:** estorba; es la tarea 2 y no se pudo (V-02).
- **H4 De quién son los datos y cómo se sale:** le importa, pero después de entender qué es; hoy «Todo queda en su navegador» habla de la demo, no de un uso real (V-07, V-12).
- **H5 Qué sería un piloto:** estorba a quien decide si pide la reunión; no sabe qué se espera de ella (V-02, V-07, V-11).
- **H6 Primer minuto en la demo:** estorba; cae en una agenda y el valor queda escondido (V-04, V-12, V-14).
- **H7 Real o simulado, dentro de cada pantalla:** lo entiende bien en la demo («Demo interactiva», «Sugerido por IA · ejemplo»); le estorban «Datos sintéticos», «Funciona offline» y «SHA-256 real» (V-08, V-10).
- **H8 Una historia con números:** estorba; no hay caso (V-06).
- **H9 Qué aprendemos de quien entra:** le es indiferente; no se lo pregunta. No vi la tarjeta de invitación (`DemoInvite`), porque no esperé los 45 s ni recorrí las tres pantallas (ver límites).

## 8. Qué le preguntaría a una persona real como ella

Preguntas sobre su pasado, no sobre si usaría Otear:

1. La última vez que un colega le mandó por WhatsApp el enlace de una herramienta «a ver si nos sirve», ¿qué hizo en los primeros segundos, qué le hizo seguir y qué le hizo cerrarlo?
2. La última vez que su empresa pagó un servicio externo de campo (inspección, topografía, fumigación, vigilancia), ¿cómo comprobó que lo cobrado coincidía con lo entregado, con qué documento y quién lo hizo?
3. La última herramienta que su empresa evaluó, ¿en qué momento pidió ver el precio, qué le hizo aceptar una primera reunión y qué le habría hecho no responder el correo?

## 9. Límites: qué no pude verificar

- Soy un agente que interpreta dos lecturas; no hay Marta real ni lector real. Todo son hipótesis.
- La prueba de 5 segundos la hice sobre una captura estática del hero (`hero.png`, tras 9 s de carga virtual), no con un cronómetro ni con una persona; el avión estaba en movimiento en otro punto del recorrido.
- Móvil: emulé 390×844 con Chromium sin interfaz, no un teléfono real ni la apertura desde WhatsApp.
- El servidor es el de desarrollo: textos como «Pendiente: defina NEXT_PUBLIC_BOOKING_URL» no aparecerían en producción (`lead-form.tsx:18`). No sé qué canales estarán configurados en producción.
- En el formulario solo usé datos de prueba obvios y no pulsé WhatsApp, correo ni «Elegir una hora».
- Solo abrí en el navegador Programación, Evolución, Configuración y la guía; el resto de los módulos (Servicios, Pagos, Informes, Documentos) los conozco por el texto de la landing y el código. No recorrí «Antes de pagar» ni la firma de informes, así que no puedo confirmar con la vista cuán rápido se llega a ellos desde la demo.
- No esperé la tarjeta `DemoInvite` (45 s y tres pantallas) ni probé «Prefiero que me la muestren».
- Cómo se ve el avión sobre el texto depende de dónde esté en su recorrido; los cinco casos de solape son momentos puntuales.
