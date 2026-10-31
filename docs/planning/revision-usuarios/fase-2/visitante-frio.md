# Segunda pasada: Visitante frío

Hipótesis de dos lecturas del mismo rol, escritas por un agente que interpreta a la persona. No son resultados de usuarios reales. Compara con `../visitante-frio.md` (V-01..V-14).

Capturas en `/tmp/claude-1000/-home-luisrojas-Documents-personal-otear/5a7b1a0b-b9e7-405a-9faa-3e7d2758764d/scratchpad/p2-visitante/` (hero.png, d00-d08, e0, e1, p2, m00-m14, demo1, pagos1-2, inv2, sel1-sel3, guia, f1-f3, md0-md2).

Fecha: 30 de octubre de 2026. Demo local en `:3210` (rama `revision-fase-2`, commit f05d847, servidor de desarrollo). Chromium propio con CDP en el puerto 9331. No se pulsó WhatsApp, correo ni «Elegir una hora»; el formulario se llenó con datos de prueba evidentes y se detuvo en el paso 2.

## 1. Persona y tareas

Las mismas de la primera fase. Dos lecturas: **(a) Marta**, 45 años, directora de operaciones de una empresa mediana ajena al sector, y **(b) lector inteligente** que solo conoce lo que dice la página. Tareas: (1) qué es Otear, para quién, si presta el vuelo; (2) cuánto cuesta y cómo se empieza; (3) «Abrir la demo» o «Hablemos»; (4) primer minuto en la demo; (5) formulario hasta el paso 2 sin enviar.

## 2. Prueba de 5 segundos (escrita antes de leer el resto)

Solo vi la primera pantalla (`hero.png`, 1280×900): logo OTEAR, titular «La plataforma para *comparar* los vuelos de dron de su operación.», un párrafo de cuatro líneas, un recuadro con «**Otear no hace los vuelos.** Los hace su operador de dron…», dos botones y cuatro etiquetas («Sin registro · Datos de ejemplo: nada es real · Los mapas necesitan internet · En validación: aún sin piloto»). El avión estaba aún entrando por la esquina.

**(a) Marta**
- ¿Qué cree que hace Otear? «Es un programa donde se reúnen y se comparan los vuelos de dron de mi operación. No es quien vuela: eso lo hace un operador. Me falta saber para qué me serviría a mí: comparar, ¿y qué gano?»
- ¿Para quién? «Para quien tenga finca, vía, obra, predio o mina "o lo que supervise". Mi operación no está en la lista, pero la última frase me deja la puerta abierta.»
- ¿Qué haría? «Pulsaría "Abrir la demo": gratis, sin registro y los datos son de ejemplo. "Hablemos sin compromiso" lo dejaría para después de ver algo. La etiqueta "aún sin piloto" no la entiendo: ¿no tienen piloto de dron?»

**(b) Lector ajeno**
- ¿Qué hace? «Una plataforma para comparar vuelos de dron. El recuadro dice que no los hace. Entiendo la categoría sin leer el párrafo.»
- ¿Para quién? «Para quien contrata vuelos de dron. "Operación" sigue sin decirme nada concreto, pero la lista finca/vía/obra/mina me ancla.»
- ¿Qué haría? «Leer el recuadro y pulsar la demo. Para saber cuánto cuesta no sabría dónde mirar.»

**Veredicto de la prueba: pasa con reservas.** Lo que antes fallaba (¿qué es?, ¿presta vuelos?) se entiende en la primera pantalla. Quedan tres reservas: no hay ninguna imagen del producto, el beneficio («¿para qué comparar?») está en la frase más larga y no en el titular, y la etiqueta «aún sin piloto» se lee mal (V2-01).

## 3. Primer minuto en la demo

- Escritorio, desde el botón del hero: ya no cae en Programación; la URL es `/evolucion/` (`DemoLink` calcula la ruta; `demo-link.tsx`). Aparece una tarjeta de bienvenida que dice: «Bienvenido a la demo. Son datos de ejemplo de una hacienda; nada es real. Empiece por «Evolución»: ahí ve qué lote va peor entre un vuelo y otro. Luego «Pagos y costos», para revisar lo pedido, lo cubierto y lo facturado antes de pagar. La «Guía de la demo»… explica el resto.» (`demo1.png`). Marta: «Ahora sí sé qué mirar: un mapa con "Lote 4 baja de vigor: 0,75 → 0,72 → 0,62" y luego los pagos.» Navegador.
- Pagos: «Verificación del área: Facturó de más. Facturó 1,5 ha más de las que el operador dice haber cubierto… unos $ 45.000 de más, a $ 30.000 por hectárea… Cifra de ejemplo.» (`pagos1.png`). Es exactamente lo que la landing prometió y las cifras (27,9 / 26,4 / +5,7 %) coinciden con la tarjeta de la landing. Navegador.
- «Guía de la demo» (abajo a la izquierda) abre ahora un cuadro con tres pasos: Evolución, Pagos «Antes de pagar», Informes, y dice «se borra al recargar la página» (`guia.png`). Navegador.
- Con el selector «Obra» y «Abrir la demo de una obra»: llega a «Avance de obra» con el aviso «Eligió obra: ya ve «frentes» y «observación» como en su sector…» (`sel2.png`). Tras recargar, sigue en «Obra Alameda» con vocabulario y datos de obra (`sel3.png`). Navegador.
- A los ~50 s y tras tres pantallas, aparece una tarjeta «¿Esto, con sus datos? … nos sentamos 30 minutos» (`inv2.png`). Es discreta, con «Ahora no». Navegador.
- Dudas que quedan: la tarjeta de bienvenida dura mientras se cambia de pantalla y sigue diciendo «Empiece por Evolución» cuando uno ya está en Pagos (V2-04). La barra superior sigue con cinco iconos de sector sin texto, salvo el activo.
- Móvil (390×844): el botón «Menú» se ve completo y abre la navegación (`md0.png`, `md1.png`). No hay desplazamiento horizontal en `/evolucion` ni en `/pagos` (`scrollWidth` = 390). Emulación, no teléfono real.

## 4. Tareas

| # | Tarea | Resultado | Por qué |
|---|---|---|---|
| 1 | Qué es, para quién, si presta vuelos | **Sí** (a) y (b) | El titular dice «plataforma para comparar los vuelos de dron» y el recuadro «Otear no hace los vuelos». «Para quién» se entiende por la lista de sectores y por «Para quién» más abajo. |
| 2 | Cuánto cuesta y cómo se empieza | **Con ayuda** | Antes: no. Ahora la respuesta honesta existe («Cuánto cuesta lo que sigue: por definir. Se acuerda según su operación, después de esa conversación»; «Precio y forma de cobro: por definir») pero está en las dos últimas pantallas (~8.000 px del escritorio, ~13.500 del móvil). Nadie ofrece «cómo se empieza» como pasos; se deduce: demo, conversación de 30 minutos, piloto «por definir». |
| 3 | «Abrir la demo» o «Hablemos» | **Sí** | Elijo la demo: gratis, sin registro, y ahora aterriza en algo que se entiende. «Hablemos» ahora dice qué cuesta la primera reunión (nada) y que no tengo que cambiar de operador; eso baja la barrera. Sigue sin decir quién contesta. |
| 4 | Primer minuto en la demo | **Sí** | La bienvenida y la guía en tres pasos dan camino. Pude decir: «veo qué lote va peor, y reviso si me cobran de más antes de pagar». |
| 5 | Formulario hasta el paso 2 sin enviar | **Sí** | Botón «Continuar: preparar mi mensaje», con la frase de arriba «Este paso no envía nada…». Paso 2 «Falta enviarlo… hasta entonces no hemos recibido nada» (`f3.png`). |

## 5. Estado de V-01..V-14

| ID | Estado | Por qué |
|---|---|---|
| V-01 | **resuelto** | El titular nombra la categoría («La plataforma para comparar los vuelos de dron de su operación») y el recuadro dice «Otear no hace los vuelos». Desapareció «perder el vuelo». «Operación» sigue siendo vago, pero ya no bloquea. (navegador, `hero.png`) |
| V-02 | **mejorado** | Hay «por definir» honesto en dos lugares («Hablemos» y «Se acuerda con usted») y la reunión dice qué es gratis. Falta que se encuentre sin recorrer toda la página y que «cómo se empieza» sea una secuencia (ver V2-02). (navegador) |
| V-03 | **igual** | Primera pantalla sigue siendo texto y avión; no hay captura del producto ni línea de tres pasos. La primera cifra del producto aparece hacia los 3.000 px (tarjeta de agricultura). Móvil: solo texto (`m00.png`). (navegador) |
| V-04 | **resuelto** | Cae en Evolución (o en la pantalla de su sector), con aviso de bienvenida que da el orden, y la guía abre como cuadro con tres pasos. Quedan detalles de la tarjeta flotante (V2-04). (navegador) |
| V-05 | **resuelto** | «Otear no hace los vuelos… es él quien los entrega», «Cómo entran sus vuelos: el operador los entrega en Servicios… la carga real de archivos está por construir. Otear todavía no analiza imágenes», y las hectáreas «las declara el operador». (navegador, texto) |
| V-06 | **resuelto** | Hay caso con números dentro de la landing: «Se pidieron 27,9 ha / El operador declara 26,4 ha / Facturó 27,9 ha… Facturó 1,5 ha más de las cubiertas (+5,7 %)», rotulado «Cifras de ejemplo» y «no de un cliente ni un ahorro real», y coincide con Pagos (`pagos1.png`). Sigue apareciendo hacia la cuarta pantalla, no la segunda. (navegador) |
| V-07 | **mejorado** | «En validación: aún sin piloto» y «Otear está en validación: todavía no hay un piloto en operación» suben el estado real a la primera pantalla y a la sección final. No se dice quién está detrás (ni nombre, ni ciudad); solo `hola@otear.app`. (navegador) |
| V-08 | **mejorado** | «Firma electrónica simple de ejemplo, sin valor legal» y «una marca que cambia si alguien edita una cifra» reemplazan a «huella digital», «SHA-256 real»; «núcleo» pasó a «la base». Quedan «hallazgo» («Dar seguimiento a cada hallazgo», «Renombre zona, hallazgo o informe»), la etiqueta «Trazabilidad» y «Marca de integridad». (navegador) |
| V-09 | **mejorado** | Orden nuevo: hero, selector, «Qué resuelve», casos (agricultura primero), «Para quién», «A su medida». Agricultura como caso principal sí ancla («Empezamos por el campo. Sirve a cualquier sector.»). El selector sigue ocupando la segunda pantalla antes de «Qué resuelve», y la página creció (V2-02). (navegador) |
| V-10 | **resuelto** | Etiquetas ahora: «Sin registro · Datos de ejemplo: nada es real · Los mapas necesitan internet · En validación: aún sin piloto». Se quitó «offline» y «sintéticos». (Se introdujo la ambigüedad de «piloto», V2-01.) (navegador) |
| V-11 | **resuelto** | Botón «Continuar: preparar mi mensaje», frase visible antes del botón («Este paso no envía nada… Esta página no guarda ni recibe sus datos»), placeholders neutros («Nombre y apellido», «nombre@empresa.co»). Riesgo que sigue: si en producción no hay canal, el paso 2 solo dirá «Todavía no hay un canal de contacto disponible en esta página» (`lead-form.tsx:269`; lectura de código). (navegador) |
| V-12 | **resuelto** | Tras elegir «Obra» y recargar, la demo vuelve a «Obra Alameda» (`sel3.png`); el texto de la landing y el de la guía coinciden: «Lo que haga se borra al recargar… solo los nombres que elija en Configuración se quedan en este navegador». Probado solo con obra, no con las otras. (navegador) |
| V-13 | **igual** | El avión sigue pasando sobre texto: cubre el encabezado «Propuestas por validar» y las viñetas (`d06.png`, `e0.png`), la franja de la sección «Qué resuelve» (`d02.png`) y un trazo fantasma sobre «Corregir mis datos» en el paso 2 (`f3.png`). La capa deja pasar el puntero. (navegador) |
| V-14 | **igual** (neto) | El botón «Menú» ya se ve completo y abre la navegación en móvil (`md0.png`, `md1.png`): resuelto. Pero la landing móvil pasó de ~10.700 a 14.515 px de alto (unas 17 pantallas): empeorado. (navegador) |

**Recuento: 7 resueltos (V-01, 04, 05, 06, 10, 11, 12), 4 mejorados (V-02, 07, 08, 09), 3 iguales (V-03, 13, 14), 0 empeorados** (V-14 mezcla un arreglo con el aumento de largo; lo documento como V2-02).

## 6. Hallazgos nuevos

Ordenados de más a menos grave. IDs con prefijo V2-.

### V2-01 «Aún sin piloto» se lee como «sin piloto de dron»
- Eje: texto
- Dónde: `/`, hero `landing-page.tsx` (etiqueta «En validación: aún sin piloto»), y «Qué hay hoy y qué falta» («todavía no hay un piloto en operación», «Un piloto con sus propios vuelos»).
- Lo que ve la persona: en la primera pantalla, entre cuatro etiquetas pequeñas, «En validación: aún sin piloto». En una página sobre vuelos de dron, donde la demo usa «Soporte del piloto» para la persona que vuela.
- Qué entiende o hace mal: Marta lo lee como «no tienen piloto» (de dron) y duda de que existan quienes vuelen. Solo la tarjeta «Su sector» aclara «un piloto (una prueba con sus propios vuelos)»; el resto de las menciones no tienen la aclaración.
- Por qué importa para su tarea: es la frase de honestidad que antes faltaba (V-07) y está mal escrita justo donde más se lee; puede reabrir «¿Otear presta vuelos?».
- Propuesta: «En validación: aún sin prueba con clientes» o «sin prueba piloto» y, la primera vez en la página, aclararlo con la misma glosa que ya usa la tarjeta «Su sector» («una prueba con sus propios vuelos»). Revisar las otras menciones.
- Gravedad: confunde
- Evidencia: navegador (`hero.png`, `d08.png`)
- Huecos relacionados: H5, H1

### V2-02 La landing creció un tercio y el precio quedó en las dos últimas pantallas
- Eje: componente
- Dónde: `/` completa: 9.015 px en escritorio (antes ~7.000) y 14.515 px en móvil 390 (antes ~10.700). «Qué hay hoy y qué falta» empieza hacia los 7.900 px; la barra superior solo tiene «Hablemos» y «Abrir la demo», sin enlaces de página.
- Lo que ve la persona: tras el hero, selector, «Qué resuelve» (3 filas), «Ejemplos de uso» (caso principal + cuatro sectores + «Su sector»), «Para quién» (dos tarjetas más el recuadro del operador con tres columnas), «A su medida» (3 filas), «Entre a la demo» y por último «Qué hay hoy y qué falta» y el formulario.
- Qué entiende o hace mal: cada bloque es honesto, pero Marta, que ya decidió con la demo, tiene que bajar unas diez pantallas para saber si hay precio o piloto. En el móvil son unas 17. El recuadro del operador y «A su medida» responden a visitantes que no son ella.
- Por qué importa para su tarea: tarea 2 (precio y cómo se empieza) pasa de «no» a «con ayuda» solo si la persona llega hasta el final. Quien reenvía el enlace a su jefe no tiene una sola frase corta para citar.
- Propuesta: sin quitar contenido, hacer que la etiqueta del hero «En validación: aún sin prueba con clientes» sea un enlace a «Qué hay hoy y qué falta»; plegar en `<details>` el recuadro del operador y «A su medida» (que sigan en la página y se pueda ir a ellos); o subir «Qué hay hoy y qué falta» antes de «Para quién». La decisión de qué recortar es del dueño.
- Gravedad: confunde
- Evidencia: navegador (alturas medidas con `scrollHeight`, `d00-d08.png`, `m*.png`)
- Huecos relacionados: H3, H5, H6

### V2-03 El caso principal es creíble pero su desvío vive en una frase, y el título habla de caña
- Eje: caso-de-uso
- Dónde: `/`, tarjeta «AGRICULTURA · CASO PRINCIPAL» (`landing-page.tsx`, `mainCase`, ~líneas 52-70 y 315-345).
- Lo que ve la persona: «Fincas e ingenios: la hacienda de ejemplo», «Compare cada lote o suerte…»; tres tarjetas iguales «27,9 ha / 26,4 ha (94,7 % de lo pedido) / 27,9 ha»; debajo: «Antes de registrar el pago, Otear marca la diferencia: «Facturó 1,5 ha más de las cubiertas (+5,7 %)». La tolerancia de la demo es de 5 %.»
- Qué entiende o hace mal: Marta ve tres números casi iguales y tiene que leer la frase para ver el problema; la tarjeta «Facturó» no se distingue de la de «Se pidieron». «Ingenios» y «suerte» le son ajenos (son del azúcar). La franja de los otros cuatro sectores sí se entiende: le dice «hay más ejemplos, este es el más completo», y «Su sector» le da dónde caer. Pero esos cuatro son texto en tres líneas, sin una cifra.
- Por qué importa para su tarea: ayuda a decidir (tarea 3) y es el gancho del titular, pero la cifra clave debe verse, no leerse.
- Propuesta: marcar la tarjeta «Facturó» (borde o etiqueta «+1,5 ha frente a lo cubierto») con el mismo color de alerta que usa Pagos; título «Fincas y cultivos: la hacienda de ejemplo» con «ingenios» en la línea de abajo; «lote o suerte» solo en el subtítulo del selector. Para los otros cuatro sectores, una cifra de ejemplo por cada uno si existe en la demo (sin inventar).
- Gravedad: menor
- Evidencia: navegador (`d03.png`, `p2.png`, `pagos1.png`)
- Huecos relacionados: H8, H1

### V2-04 Dos tarjetas flotantes tapan contenido y la de bienvenida no sabe en qué pantalla está
- Eje: componente
- Dónde: `/evolucion`, `/pagos` (aviso de bienvenida de `DemoEntry`, `entry.ts` `WELCOME_NOTICE`), y la invitación `demo-invite.tsx`.
- Lo que ve la persona: el aviso «Bienvenido a la demo… Empiece por «Evolución»…» queda abajo al centro y tapa parte de «Qué tan fiable es la comparación» y los controles del mapa (`demo1.png`); sigue visible al pasar a Pagos y sigue diciendo «Empiece por Evolución» (`pagos2.png`). A los ~50 s aparece «¿Esto, con sus datos?» en la esquina inferior derecha y cubre las cifras «Pagos registrados / Saldo por pagar» de la factura (`inv2.png`).
- Qué entiende o hace mal: leer una frase cubierta por un aviso que no se va. El aviso no avanza con la persona: ya está en Evolución y el aviso la manda a Evolución.
- Por qué importa para su tarea: es el camino que se construyó para el primer minuto (V-04), y tapa justo lo que dice el primer vistazo.
- Propuesta: que el aviso de bienvenida se cierre solo al cambiar de pantalla (o al entrar a la que recomienda) y no cubra el contenido (arriba, o dentro de la página como franja). Que la invitación se corra mientras haya un aviso (ya lo hace con `aboveNotice`) y no cubra cifras de la pantalla en que está.
- Gravedad: menor
- Evidencia: navegador (`demo1.png`, `pagos2.png`, `inv2.png`)
- Huecos relacionados: H6, H9

### V2-05 Las pastillas de la landing parecen botones y no lo son; «Prefiero que me la muestren» promete otra cosa
- Eje: componente / texto
- Dónde: `/`, etiquetas `tag` de «Qué resuelve» («Historia completa», «Antes de pagar», «Trazabilidad»), `tags` de «Para quién» («Tareas», «Mapa», «Evolución», «Pagos», «Informes»), y `sector-picker.tsx` («Prefiero que me la muestren»).
- Lo que ve la persona: pastillas azules con forma de botón al lado de cada fila (`d02.png`); sus nombres no coinciden con el menú de la demo («Pagos y costos», «Informes y cifras», «Documentos»; no existe «Trazabilidad» ni «Historia completa»). Debajo del selector, «Abrir la demo de ejemplo» y «Prefiero que me la muestren».
- Qué entiende o hace mal: Marta intenta pulsarlas y no pasa nada. «Prefiero que me la muestren» sugiere que alguien le enseña la demo en vivo; en realidad solo baja al formulario.
- Por qué importa para su tarea: son los lugares donde se decide entre demo y «Hablemos» (tarea 3). Un botón que no responde resta confianza.
- Propuesta: que las pastillas sean enlaces a la pantalla de la demo (o que no se vean como botones) y con el nombre del menú. Cambiar a «Prefiero que me la muestren en una conversación» o «Prefiero hablar primero».
- Gravedad: menor
- Evidencia: navegador (`d02.png`, `sel1.png`); lectura de código
- Huecos relacionados: H6

### V2-06 «Qué hay hoy y qué falta»: se entiende, pero llega al final y mezcla voces
- Eje: texto
- Dónde: `/`, última sección antes del formulario (`d08.png`, `e0.png`).
- Lo que ve la persona: tres columnas, «YA PUEDE PROBARLO», «SE ACUERDA CON USTED», «PROPUESTAS POR VALIDAR». Entre ellas: «Precio y forma de cobro: por definir, según su operación.» «Un piloto con sus propios vuelos: lo estamos definiendo y usted ayudaría a definirlo.» «Una firma con valor legal: depende de la asesoría jurídica de cada operación.» «Otear todavía no analiza imágenes.»
- Qué entiende o hace mal: **Sí se entiende**, y es lo más claro de la página para el lector ajeno: separa lo que existe, lo que se acuerda y lo que es propuesta. Tres cosas estorban: la primera columna usa términos de producto sin explicar («Dar seguimiento a cada hallazgo con responsable, plazo y cierre», «pedido de servicio»); «Propuestas por validar» no dice a quién le toca validar; y las viñetas de la columna central mezclan «lo estamos definiendo» con «por definir», dos voces.
- Por qué importa para su tarea: tarea 2. Marta cita esta sección a su jefe.
- Propuesta: título de la tercera columna «Ideas que aún no existen», y una sola fórmula para lo que falta («Por definir con usted» en las cuatro viñetas). «Hallazgo» ya tiene término propio en la demo (observación, novedad, problema), usar el del sector elegido o «lo que se encuentra en el vuelo».
- Gravedad: menor
- Evidencia: navegador (`d08.png`, `e0.png`); texto de la landing
- Huecos relacionados: H3, H4, H5

### V2-07 Texto de la demo con errores de concordancia tras el cambio de vocabulario
- Eje: texto
- Dónde: `/evolucion` con «Obra» elegida.
- Lo que ve la persona: «Toque un marcador del escenario o un observación de la lista.» y «En observaciones, frente a entonces: 1 nuevo, 0 ya no aparecen, 2 siguen abiertos.» (en agricultura sí concuerda: «un hallazgo»).
- Qué entiende o hace mal: se nota que la frase fue escrita en masculino y el vocabulario cambia el género; resta credibilidad justo cuando el selector prometía «como en su sector».
- Por qué importa para su tarea: es lo primero que se lee del cambio de vocabulario que la landing vende.
- Propuesta: dejar que el término renombrado traiga su artículo («una observación», «un hallazgo») o reescribir sin artículo («Toque un marcador o una de las filas de la lista»).
- Gravedad: menor
- Evidencia: navegador (`sel2.png`, texto de la página)
- Huecos relacionados: H7

## 7. Lo que sigue funcionando y hay que conservar

- **El recuadro «Otear no hace los vuelos…» en el hero** y su eco en «Hablemos» («No le pedimos cambiar de operador de dron») y en el recuadro del operador. Es lo que hace pasar la prueba de 5 segundos.
- **El aviso de bienvenida de la demo** y la guía en tres pasos con la URL de aterrizaje según el sector. Es el único momento en que la demo habla con la persona.
- **La honestidad escrita de cerca**: «Cifras sintéticas de la demo, no de un cliente ni un ahorro real», «Otear todavía no analiza imágenes», «Es una firma electrónica simple de ejemplo, sin valor legal», «Se acuerda según su operación». Es lo que más confianza da.
- **El caso con números** (27,9 / 26,4 / +5,7 %) que coincide con lo que se ve en Pagos: la landing no promete nada que la demo no muestre.
- **El formulario en dos pasos**, ahora con «Continuar: preparar mi mensaje» y la frase previa.
- **El recarga que conserva el sector** (V-12 resuelto).

## 8. Lectura de «dos lecturas» sobre los cambios nuevos

- **Franja de los otros cuatro sectores:** se entiende como «estos también tienen proyecto de muestra, pero el más completo es el del campo». Marta se reconoce o no; «Su sector» la deja en el aire pero con una salida («Cuéntenos cuál es el suyo»). El lector ajeno la entiende igual.
- **Agricultura como principal:** ayuda; da un ancla concreta que antes faltaba (V-09). Costo: el vocabulario de caña (V2-03).
- **«Qué hay hoy y qué falta»:** se entiende y es lo más útil del final (V2-06); lo malo es el lugar (V2-02).
- **¿Demasiado larga?** Sí para quien llega frío: 9.015 px en escritorio y 14.515 en móvil (≈ +29 % y +36 %). No hay una sola sección inútil; el problema es que todo tiene el mismo peso y no hay forma de saltar.

## 9. Huecos H1–H9 para esta persona (estado)

- **H1 Qué es / si presta vuelos:** cubierto. Solo falta una imagen del producto (V-03).
- **H2 Cómo entran mis vuelos:** cubierto («el operador los entrega»; la carga real «por construir»).
- **H3 Cuánto cuesta:** honesto («por definir») pero escondido al final (V2-02).
- **H4 Datos y salida:** «por definir» en «Se acuerda con usted»; honesto.
- **H5 Qué es un piloto:** estorba por la palabra (V2-01).
- **H6 Primer minuto:** cubierto (V-04 resuelto).
- **H7 Real o simulado:** cubierto; solo errores de detalle (V2-07).
- **H8 Historia con números:** cubierto (V-06).
- **H9 Qué aprendemos de quien entra:** la tarjeta aparece a los ~50 s y no estorba mucho (V2-04).

## 10. Veredicto

**¿Pasa la prueba de 5 segundos? Pasa con reservas.** Qué es, que no presta vuelos y qué haría se responden en la primera pantalla (antes fallaba). Para que pase sin reservas faltan tres cosas, todas de texto o de pantalla, no de producto:

1. Que «aún sin piloto» no suene a «sin piloto de dron» (V2-01).
2. Una sola imagen del producto o del caso («Facturó 1,5 ha más de las cubiertas») dentro de la primera pantalla o la siguiente, para que el titular tenga una prueba a la vista (V-03).
3. Que lo que Marta querría citarle a su jefe (cuánto cuesta, cómo se empieza, quién está detrás) se encuentre sin bajar diez pantallas (V2-02, V-07).

## 11. Qué le preguntaría a una persona real como ella

1. La última vez que abrió un enlace de un producto que le mandó un colega, ¿qué hizo en los primeros diez segundos y qué le hizo bajar más (o cerrar)?
2. La última vez que tuvo que explicarle a su jefe qué hacía una herramienta nueva que usted consideraba, ¿qué frase usó y qué dato buscó en la página para respaldarla?
3. La última vez que una empresa le dijo «el precio lo definimos juntos», ¿qué le dio confianza o desconfianza en ese momento, y qué habría necesitado ver antes de pedir la reunión?

## 12. Límites

- Son hipótesis de un agente que interpreta dos lecturas; no hay Marta real ni lector real.
- La prueba de 5 segundos se hizo sobre una captura estática del hero, no con cronómetro; el avión estaba entrando por una esquina.
- Móvil: emulación de 390×844 en Chromium sin interfaz; solo revisé la landing y dos pantallas de la demo (`/evolucion`, `/pagos`) y el menú. No probé Programación, Servicios, Mapa, Equipos, Informes ni Documentos en móvil.
- Vocabulario tras recarga: probado solo con «Obra»; no recorrí vía, mina ni vigilancia.
- El servidor es el de desarrollo: «Pendiente: defina NEXT_PUBLIC_…» no aparecería en producción; no sé qué canales se configurarán. El indicador «Compiling…» de Next se ve en varias capturas y no es de la página.
- La tarjeta de invitación apareció en la segunda prueba (no en la primera, en que la navegación posiblemente reinició el temporizador); no investigué la causa.
- No se pulsó enviar, WhatsApp, correo ni «Elegir una hora»; no se abrió ningún `mailto:`.
