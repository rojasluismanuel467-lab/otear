# Tercera pasada: Visitante frío

Hipótesis de dos lecturas del mismo rol, escritas por un agente que interpreta a la persona. No son resultados de usuarios reales. Compara con `../visitante-frio.md` (V-01..V-14) y `../fase-2/visitante-frio.md` (V2-01..V2-07).

Capturas en `/tmp/claude-1000/-home-luisrojas-Documents-personal-otear/b30fedca-8b8c-4bb3-b43b-6cdff0dcc0b8/scratchpad/v3/` (hero-d.png, hero-m.png, s-d00..10, s-m00..18, pick-*.png, first-*.png, mfirst-*.png, mm3.png, f-paso2-d.png, f-paso2-m.png, dm-1..3.png).

Fecha: 31 de octubre de 2026. Rama `revision-fase-3` (commit f1b2d0e), servidor de desarrollo en `:3441`. Chromium propio con CDP en el puerto 9441, manejado con playwright-core (clics reales). Escritorio 1440×900 y móvil 390×844 (emulación). No se pulsó WhatsApp, correo ni «Elegir una hora»; el formulario se llenó con datos de prueba evidentes y se detuvo en el paso 2.

## 1. Persona y tareas

Las mismas. Dos lecturas: **(a) Marta**, 45 años, directora de operaciones de una empresa mediana ajena al sector; **(b) lector inteligente** que solo conoce lo que dice la página. Tareas: (1) qué es Otear, para quién, si presta el vuelo; (2) cuánto cuesta y cómo se empieza; (3) «Abrir la demo» o «Hablemos»; (4) primer minuto en la demo; (5) formulario hasta el paso 2 sin enviar. Extra de esta pasada: entrada a la demo en móvil y los cinco sectores del selector.

## 2. Prueba de 5 segundos (escrita antes de leer el resto de la landing)

Solo vi la primera pantalla: `hero-d.png` (1440×900) y `hero-m.png` (390×844). Escritorio: a la izquierda un panel oscuro «Así se ve antes de pagar» con tres barras (27,9 ha / 26,4 ha / 27,9 ha, la última con una punta naranja) y una frase «Otear lo marca antes de registrar el pago: Facturó 1,5 ha más de las cubiertas (+5,7 %)»; a la derecha el titular «La plataforma para *comparar* los vuelos de dron de su operación.», un párrafo, el recuadro «Otear no hace los vuelos.», dos botones y cuatro etiquetas; el avión asoma por abajo a la izquierda. Móvil: titular y, justo debajo, el mismo panel.

**(a) Marta, escritorio**
- ¿Qué cree que hace Otear? «Compara vuelos de dron y me avisa si el operador me cobró más de lo que voló. Es un programa; el vuelo lo hace otro.»
- ¿Para quién? «Para quien paga vuelos de dron: finca, vía, obra, predio o mina, dice el párrafo. El panel habla de hectáreas, así que lo leo primero como cosa de campo; mi caso (una operación que no es agrícola) lo infiero del párrafo.»
- ¿Qué haría? «"Abrir la demo". El panel me dio la prueba que antes no había: veo el problema (me cobraron 1,5 ha de más) sin leer nada más.»

**(b) Lector ajeno, escritorio**
- ¿Qué hace? «Una plataforma que revisa lo que me facturan por vuelos de dron contra lo que el operador dice haber cubierto. Tampoco vuela.»
- ¿Para quién? «Para quien contrata esos vuelos. "Su operación" sigue siendo genérico, pero el panel lo ancla.»
- ¿Qué haría? «Pulsar la demo. Para precio no sé dónde mirar: hay un enlace pequeño «Qué hay hoy, qué falta y qué se acuerda con usted» bajo las etiquetas, que sí lo promete.»

**Móvil (a) y (b):** el panel queda a media pantalla, antes del párrafo, y cuenta la historia sola. Mejor que en escritorio, donde compite con el titular por el ojo.

**Quién está detrás:** no se ve en la primera pantalla de escritorio (empieza en y = 916 px con ventana de 900; queda a 16 px del borde). En móvil aparece en la segunda pantalla. No es lo primero que Marta busca; lo busca cuando duda.

**Veredicto: pasa, sin las reservas de la pasada anterior.** Entiendo qué hace, que no vuela y qué haría, y la primera pantalla por fin tiene el producto. Queda una reserva nueva: el panel solo habla de hectáreas (V3-03).

## 3. Primer minuto en la demo

- Botón del hero sin elegir sector: cae en `/evolucion/` con aviso «Bienvenido a la demo. Son datos de ejemplo de una hacienda; nada es real. Empiece por «Evolución»…» (`dm-1.png`). Al pasar a Pagos con el menú, el aviso ya no está (cumple «se cierra al cambiar de pantalla»). En Pagos se ve «Verificación del área: Facturó de más… Facturó 1,5 ha más de las que el operador dice haber cubierto» con $ 45.000 de ejemplo (`dm-3.png`): coincide con el panel del hero (27,9 / 26,4 / 27,9). Navegador.
- Con el selector y «Abrir la demo de una vía / una obra / un predio / una mina»: cae en `/vuelos/` (vía y predio) o `/evolucion/` (obra y mina), con el aviso según el sector y el menú con las palabras del sector («Mapa y tramos», «Avance de obra», «Rondas y evidencias», «Avance de la excavación»). Navegador.
- Tras recargar cada ruta, el sector se conserva en los cuatro. Con «Otro sector» no (V3-01).
- Móvil (390): `scrollWidth` 380 ≤ 390, sin desplazamiento horizontal en la entrada. El aviso de bienvenida ocupa 156 px (cuarto inferior) y tapa el pie del mapa; su botón de cerrar mide 28×28 px (`mfirst-road.png`, `mfirst-agri.png`, `mm-1.png`).
- No pude ver la tarjeta «¿Esto, con sus datos?»: con dos pantallas en ~45 s no apareció (la regla pide tres o una acción). Sin evidencia nueva sobre V2-04.

## 4. Tareas

| # | Tarea | Resultado | Por qué |
|---|---|---|---|
| 1 | Qué es, para quién, si presta vuelos | **Sí** (a) y (b) | Titular, panel y recuadro «Otear no hace los vuelos». |
| 2 | Cuánto cuesta y cómo se empieza | **Sí, con un clic** | El enlace del hero «Qué hay hoy, qué falta y qué se acuerda con usted» lleva a «Qué hay hoy y qué falta» (el desplazamiento suave tarda ~3 s en escritorio: la página mide 9.323 px). Ahí: «Precio y forma de cobro: por definir, según su operación». Sigue sin haber «cómo se empieza» en pasos; se deduce (demo, reunión de 30 minutos, piloto «por definir»). |
| 3 | «Abrir la demo» o «Hablemos» | **Sí** | Demo. «Hablemos» dice qué es gratis y que no hay que cambiar de operador. |
| 4 | Primer minuto en la demo | **Sí** (agricultura, vía, obra, mina, vigilancia); **con tropiezo** en «Otro sector» | Ver V3-01 y V3-06. |
| 5 | Formulario hasta el paso 2 sin enviar | **Sí** | Paso 2 «Falta enviarlo… hasta entonces no hemos recibido nada». Tropiezo: «Corregir mis datos» casi no se ve (V3-04). |

## 5. Estado de los hallazgos de la pasada anterior

### Primera pasada (V-01..V-14)

| ID | Estado | Evidencia |
|---|---|---|
| V-01 qué es / «perder el vuelo» | **resuelto** | Titular con la categoría y recuadro «Otear no hace los vuelos». (navegador, `hero-d.png`) |
| V-02 precio y cómo se empieza | **mejorado** | «Por definir» honesto, y ahora un enlace en la primera pantalla lleva a él (probado: `#estado` llega a 90 px del borde). Falta «cómo se empieza» como secuencia. (navegador) |
| V-03 sin imagen del producto | **resuelto** | La primera pantalla trae el panel «Así se ve antes de pagar»; en móvil queda bajo el titular (`hero-m.png`). (navegador) |
| V-04 primer minuto sin camino | **resuelto** | Aterriza en la pantalla del sector con aviso que da el orden. (navegador) |
| V-05 cómo entran los vuelos | **resuelto** | Sin cambios: «el operador los entrega»; «la carga real está por construir». (texto) |
| V-06 caso con números | **resuelto** | Ahora está en la primera pantalla y coincide con Pagos. (navegador) |
| V-07 estado y quién está detrás | **mejorado** | Hay línea «Quién está detrás», sin nombre (decisión pendiente del dueño). Ver V3-08 solo sobre si el texto funciona. (navegador) |
| V-08 jerga | **igual** | Siguen «hallazgo» («Dar seguimiento a cada hallazgo…»), «Trazabilidad» y «Marca de integridad» en el recuadro de la demo. Lo demás ya quedó. (navegador) |
| V-09 orden multisector | **mejorado** | Igual que en la segunda pasada; «Qué resuelve» sigue tras el selector. (navegador) |
| V-10 etiquetas del hero | **resuelto** | «Sin registro · Datos de ejemplo: nada es real · Los mapas necesitan internet · En validación: aún sin prueba con un cliente». (navegador) |
| V-11 formulario | **resuelto** | Además, si en producción no hay canal, el paso 2 dice «Escríbanos a hola@otear.app» (`lead-form.tsx:264-271`, lectura de código). |
| V-12 sector tras recargar | **resuelto** | Vía, obra, vigilancia, mina y agricultura se conservan tras recargar (nueve pantallas por sector). **Falla con «Otro sector»** (V3-01). (navegador) |
| V-13 el avión sobre el texto | **igual** | Sigue cubriendo la etiqueta «Historia completa», parte del texto de la tarjeta «Gerente o contratante» y un trazo sobre el paso 2 del formulario (`s-d02.png`, `s-d05.png`, `f-paso2-d.png`). Es decisión de animación, no la reabro. |
| V-14 móvil largo / menú | **igual** (neto) | El botón «Menú» se ve completo (`mm-1.png`). La página móvil pasó de 14.515 a 15.412 px (+6 %; escritorio 9.015 → 9.323, +3 %). (navegador) |

### Segunda pasada (V2-01..V2-07)

| ID | Estado | Evidencia |
|---|---|---|
| V2-01 «aún sin piloto» | **resuelto** | Ahora «aún sin prueba con un cliente»; la tarjeta «Su sector» conserva la glosa «una prueba con sus propios vuelos». Queda una viñeta «Un piloto con sus propios vuelos» sin glosa, pero la frase ya no se lee mal. (navegador) |
| V2-02 landing larga | **mejorado** | El enlace del hero llega al precio; pero la página creció (ver V-14) y el recuadro del operador y «A su medida» siguen entre medias. (navegador) |
| V2-03 caso principal | **mejorado** | «Fincas y plantaciones: la hacienda de ejemplo» (sin «ingenios»), y el hero ya muestra la cifra con color. Las tres tarjetas del caso principal siguen sin resaltar «Facturó», y los otros cuatro sectores siguen sin ninguna cifra. (navegador, `s-d03.png`) |
| V2-04 tarjetas flotantes | **mejorado** | El aviso de bienvenida se cierra al cambiar de pantalla y a los 15 s (probado). En móvil sigue tapando el cuarto inferior mientras está. La invitación no la vi. (navegador) |
| V2-05 pastillas y «Prefiero que me la muestren» | **igual** | Las pastillas «Historia completa», «Antes de pagar», «Trazabilidad», «Tareas», «Mapa»… no son enlaces y no coinciden con el menú; el botón del selector sigue diciendo «Prefiero que me la muestren». (navegador) |
| V2-06 «Qué hay hoy y qué falta» | **mejorado** | Ahora tiene enlace desde el hero; el texto sigue igual («Propuestas por validar», «lo estamos definiendo» junto a «por definir», «hallazgo»). (navegador) |
| V2-07 concordancia | **mejorado** | Evolución ya concuerda («Toque un marcador… o una fila», «En no conformidades, frente a entonces: 1 nueva… 2 siguen abiertas»). **Pero sigue en Vuelos** (V3-02). (navegador) |

**Recuento: 9 resueltos (V-01, 03, 04, 05, 06, 10, 11, 12; V2-01), 8 mejorados (V-02, 07, 09; V2-02, 03, 04, 06, 07), 4 iguales (V-08, 13, 14; V2-05), 0 empeorados** (V-14 compensa un arreglo con el largo de la página; no lo cuento como empeorado).

## 6. Hallazgos nuevos

Ordenados de más a menos grave. IDs con prefijo V3-.

### V3-01 «Otro sector» promete nombres generales y abre una hacienda de cultivo, sin decirlo
- Eje: caso-de-uso
- Dónde: selector de la landing (`sector-picker.tsx:165-171`, `entry.ts:260-261`) y la demo que abre: `/evolucion/` con preset «general».
- Lo que ve la persona: en el selector, «Otro sector» muestra «Sus zonas se llaman Zonas / Lo que encuentra se llama Hallazgo» y la nota «Empieza con los nombres generales… si hace falta construimos componentes propios». Al pulsar «Abrir la demo de su operación» llega a Evolución con el aviso «Eligió otro sector: la demo usa los nombres generales; en Configuración los cambia.» Pero el menú dice «Mapa y lotes» y la pantalla «Hacienda Santa Rita», «Lote 4 baja de vigor», «cultivo», «siembra» (en las tres pantallas probadas: 17-21 «lote», 6 «vigor», 3 «siembra» en Evolución; `otro-*.png`).
- Qué entiende o hace mal: si escribió «puertos» o «forestal», cree que la demo no entendió su sector o que los «nombres generales» son los de un cultivo. El aviso del botón sin elegir sí dice «datos de ejemplo de una hacienda»; este no.
- Por qué importa para su tarea: tarea 4 y decisión entre demo y «Hablemos»: es el visitante que más necesita ver que «sirve a cualquier sector» (el titular de la sección de ejemplos) y es al que la demo menos se lo demuestra.
- Propuesta: que el aviso lo diga: «Eligió {su sector}: no tenemos un proyecto de ejemplo de ese sector. Verá una hacienda con nombres generales (zonas, hallazgos); en Configuración cambia las palabras». Y que el menú use «Mapa y zonas» y «Evolución» (ya lo hace) en el preset general; si hay que dejar «lotes» en los datos, que se vea que es de la hacienda.
- Gravedad: confunde
- Evidencia: navegador (`otro-evolucion-.txt`, `first-otro.png`)
- Huecos relacionados: H1, H7

### V3-02 La primera pantalla de vía, obra, vigilancia y mina trae «confirme los no conformidades», «los novedades», «los observaciones»
- Eje: texto
- Dónde: `/vuelos/`, `flight-review-view.tsx:101`, `:392`, `:436` (artículo «los» escrito a mano antes de `words.plural`).
- Lo que ve la persona: con «Vía o carretera» (que abre en Vuelos): «Revise la entrega, confirme los no conformidades y prepare el siguiente paso…», «Revise los no conformidades del operador…», «la ejecución y los no conformidades son inventados». Con vigilancia: «los novedades»; con mina: «los novedades de talud»; con obra: «los observaciones». Con agricultura no se nota («los hallazgos de campo»).
- Qué entiende o hace mal: se nota que el texto está escrito para «hallazgos». Es lo primero que lee quien escogió vía o vigilancia (aterrizan en Vuelos), justo donde el selector prometía «como en su sector». Se repite en el subtítulo, en la pestaña y en la nota de ejemplo.
- Por qué importa para su tarea: la credibilidad del vocabulario de sector es lo que la landing vende en el selector. Es el resto de V2-07, que quedó arreglado solo en Evolución.
- Propuesta: dejar que el término renombrado traiga su artículo y número («las no conformidades», «las novedades», «las observaciones», «los hallazgos») o reescribir sin artículo («Revise la entrega, confirme lo que marcó el operador y prepare…»). Mismo arreglo en `:392` y `:436`. De paso, los vuelos de ejemplo se llaman «Mapeo de la última zona» en todos los sectores (la palabra «zona» no cambia a tramo, frente, banco o sector).
- Gravedad: confunde
- Evidencia: navegador (`road-vuelos-.txt`, `segu-vuelos-.txt`, `mina-vuelos-.txt`, `obra-vuelos-.txt`, `first-segu.png`)
- Huecos relacionados: H7

### V3-03 El panel de la primera pantalla solo habla de hectáreas y no dice que es una finca
- Eje: caso-de-uso
- Dónde: `/`, `hero-proof.tsx:25-62`.
- Lo que ve la persona: «Así se ve antes de pagar», insignia «Cifras de ejemplo», tres barras en «ha» y «Facturó 1,5 ha más de las cubiertas (+5,7 %)». Nada dice «finca» ni «hacienda»; eso aparece 2.500 px más abajo («Fincas y plantaciones: la hacienda de ejemplo»).
- Qué entiende o hace mal: Marta (operación de vía u obra) lee «ha» y piensa «esto es para fincas». La frase de debajo del titular dice «finca, vía, obra, predio o mina», pero lo único que ve funcionar es el campo. El lector con una vía o una cantera tiene que adivinar que su caso es «por vuelo» o «por m²», que la página menciona de pasada en «Revise lo facturado» («en hectáreas o por vuelo según el servicio»).
- Por qué importa para su tarea: tarea 1 y 3. El panel es la prueba que faltaba, pero la prueba es de un solo sector.
- Propuesta: cambiar la insignia a «Ejemplo de una finca · cifras de ejemplo» (o el título «Así se ve antes de pagar, en una finca»), sin tocar las cifras. No hay cifras de ejemplo de los otros sectores que pueda citar sin inventar; si la semilla de la mina (71 ha y 46 ha por mes en Pagos) o la vía las tiene, el dueño decide si un segundo panel rotativo vale la pena.
- Gravedad: confunde
- Evidencia: navegador (`hero-d.png`, `hero-m.png`); `hero-proof.tsx`
- Huecos relacionados: H1, H8

### V3-04 «Corregir mis datos» casi no se ve en el paso 2 del formulario
- Eje: componente
- Dónde: `/`, `lead-form.tsx:341-350`, estilo `.ghost` de `landing.module.css:189`.
- Lo que ve la persona: tras «Continuar: preparar mi mensaje», debajo de «Agregar detalles al mensaje (opcional)» hay un texto claro sobre la tarjeta clara: color `rgb(227, 238, 243)` sobre `rgb(243, 245, 246)` (medido en el navegador; ≈ 1,1:1) (`f-paso2-d.png`, `f-paso2-m.png`).
- Qué entiende o hace mal: parece que no hay forma de volver; la única salida visible es seguir. Si el correo tenía un error, no ve cómo corregirlo (la clase `.ghost` está pensada para fondo oscuro).
- Por qué importa para su tarea: tarea 5, y es la única acción que evita enviar un mensaje con el correo mal escrito.
- Propuesta: usar el mismo estilo de enlace que «Agregar detalles al mensaje» (azul, subrayado) para esta acción, o un botón con borde oscuro sobre la tarjeta.
- Gravedad: confunde
- Evidencia: navegador (estilo calculado y capturas)
- Huecos relacionados: H6

### V3-05 En móvil, al elegir un sector la vista previa queda fuera de la pantalla
- Eje: componente
- Dónde: `/` en 390 px, `sector-picker.tsx:125-181` (la tarjeta «Así se vería en…» va después de los botones).
- Lo que ve la persona: toca «Mina a cielo abierto»: cambia el color del botón y el texto del botón verde («Abrir la demo de una mina»). La tarjeta con «Bancos / Novedad de talud / Informe de avance» empieza 300 px más abajo (medido: borde superior en y = 2547 con ventana de 1757 a 2601; solo asoma la franja de arriba) y se ve solo si baja.
- Qué entiende o hace mal: no sabe que había una vista previa; el selector le parece un menú que no hace nada.
- Por qué importa para su tarea: en móvil el selector es la «prueba» de que el vocabulario se adapta, y el visitante que viene de WhatsApp (el caso de Marta) abre en móvil.
- Propuesta: en móvil, mostrar la tarjeta justo debajo de la fila de opciones y antes del botón; o mover la vista previa dentro de la pantalla con un desplazamiento corto al elegir. No cambia el escritorio.
- Gravedad: confunde
- Evidencia: navegador (`mm3.png`, medidas con `getBoundingClientRect`)
- Huecos relacionados: H6

### V3-06 Primer minuto en móvil: el aviso tapa la cuarta parte, nombra pantallas que el menú oculta y la barra de sectores no tiene texto
- Eje: componente
- Dónde: entrada a la demo en 390 px (`demo-entry.tsx`, `entry.ts` `demoStart`, barra superior de `app-shell`).
- Lo que ve la persona: el aviso de bienvenida mide 156 px de alto en una pantalla de 844 (tapa el pie del mapa) y su botón de cerrar es de 28×28 px. Dice «Empiece por «Vuelos y evidencias»», pero el título de esa pantalla es «Archivo de vuelos» y el menú está plegado tras «Menú». Arriba, cinco iconos de sector sin nombre; solo se sabe cuál es cuál al tocarlos.
- Qué entiende o hace mal: busca «Vuelos y evidencias» en pantalla y no lo encuentra; el aviso se queda hasta 15 s o hasta cambiar de pantalla.
- Por qué importa para su tarea: tarea 4 en móvil; el aviso es lo único que guía.
- Propuesta: en móvil, que el aviso quede arriba o más corto (una sola frase y «Más» para el resto), con botón de cerrar de 44 px, y que el título de la pantalla coincida con el nombre que cita el aviso. Los iconos de sector ya tienen nombre para lectores de pantalla y un cuadro al pasar el puntero (`site-switcher.tsx:54-55`, lectura de código), pero en un teléfono no hay puntero: el nombre solo llega al activo.
- Gravedad: menor
- Evidencia: navegador (`mfirst-road.png`, `mfirst-agri.png`, `mm-1.png`)
- Huecos relacionados: H6

### V3-07 El selector de la landing y la barra de la demo llaman distinto a los sectores
- Eje: texto
- Dónde: `sector-picker.tsx`/`entry.ts` (`label`: «Finca o cultivo», «Vía o carretera», «Predio o perímetro», «Mina a cielo abierto») frente a la barra de la demo («Agricultura», «Carreteras», «Construcción», «Vigilancia», «Minería»).
- Lo que ve la persona: elige «Predio o perímetro» y, al entrar, el aviso dice «Eligió predio o perímetro» pero la barra marca «Vigilancia»; elige «Mina a cielo abierto» y ve «Minería» (`first-segu.png`, `first-mina.png`).
- Qué entiende o hace mal: no sabe si «Vigilancia» es lo mismo que lo que escogió; el nombre «Vigilancia» solo lo usa la landing en «Perímetros y predios».
- Por qué importa para su tarea: tarea 3-4: duda de si está en su caso.
- Propuesta: usar el mismo par de palabras en los dos sitios (p. ej. «Vigilancia · predios y perímetros» en la barra, o «Vigilancia de un predio» en el selector).
- Gravedad: menor
- Evidencia: navegador
- Huecos relacionados: H7

### V3-08 «Quién está detrás» promete un nombre que no da, y la misma salvedad aparece cuatro veces
- Eje: texto
- Dónde: `/`, hero (`landing-page.tsx:224-254`), subtítulo de «Qué hay hoy y qué falta», pie de página (`behindText()`).
- Lo que ve la persona: tras las etiquetas del hero, «Quién está detrás. Un proyecto en validación: todavía no tiene clientes ni una prueba con sus vuelos. Escriba a hola@otear.app.» Justo encima, la etiqueta «En validación: aún sin prueba con un cliente». El mismo mensaje vuelve en el subtítulo de «Qué hay hoy y qué falta» y en el pie.
- Qué entiende o hace mal: **El texto es honesto y no inventa nada**, y Marta lo lee como «es un proyecto pequeño». Pero la etiqueta «Quién está detrás» promete una persona o una empresa y responde con una salvedad de estado; Marta, que va a reenviar la página, sigue sin saber a quién escribe. Y dos líneas seguidas dicen lo mismo en la primera pantalla.
- Por qué importa para su tarea: confianza antes de pedir la reunión. No es un hallazgo sobre el nombre (lo decide el dueño).
- Propuesta: mientras no haya nombre, dejar solo una de las dos frases en el hero (la etiqueta) y cambiar la etiqueta de la línea a «Quién responde» con «Le contesta una persona del proyecto en hola@otear.app» solo si eso es cierto; si no, «Escríbanos a hola@otear.app». Cuando el dueño dé el nombre, «Quién está detrás» ya funcionará sin tocar nada más.
- Gravedad: menor
- Evidencia: navegador (`hero-m.png`, `s-m01.png`, `s-d10.png`)
- Huecos relacionados: H5

### V3-09 Las cifras del hero y del caso principal se repiten a 2.500 px sin añadir nada
- Eje: componente
- Dónde: `/`, `hero-proof.tsx` y `mainCase` en `landing-page.tsx`.
- Lo que ve la persona: tres cifras (27,9 / 26,4 / 27,9) en el hero con barras y color; otra vez en «Pedido, cubierto y facturado» con tres tarjetas iguales y sin resaltar lo que difiere (`s-d03.png`).
- Qué entiende o hace mal: ya lo vio arriba y no hay nada nuevo; la versión de abajo tiene menos señal que la de arriba.
- Por qué importa para su tarea: la sección «Ejemplos de uso» pierde la oportunidad de mostrar algo de los otros cuatro sectores.
- Propuesta: en el caso principal, dejar la frase y el enlace a Pagos y quitar las tarjetas (o mantenerlas con la tarjeta «Facturó» marcada con el mismo borde de alerta del hero). Es decisión de qué recortar del dueño.
- Gravedad: menor
- Evidencia: navegador
- Huecos relacionados: H8

### V3-10 Detalles de maquetación: pie de página y enlace del hero en móvil
- Eje: componente
- Dónde: pie de `/` (`landing-page.tsx:692-701`) y hero móvil.
- Lo que ve la persona: en el pie, «No conectamos aún con sistemas reales de empresas ni de operadores.Ver demo hola@otear.app» pegados en la misma línea, sin espacio (`s-d10.png`). En móvil, el enlace «Qué hay hoy, qué falta y qué se acuerda con usted» queda pegado a la última etiqueta del hero («En validación…») sin aire (`s-m01.png`).
- Qué entiende o hace mal: se lee como una frase mal puntuada («operadores.Ver demo»).
- Por qué importa para su tarea: menor; el enlace del hero es el que lleva al precio y se confunde con las etiquetas.
- Propuesta: separar con un salto de línea o un margen la fila de enlaces del pie, y dar al enlace del hero móvil un margen superior de una línea.
- Gravedad: menor
- Evidencia: navegador (`s-d10.png`, `s-m01.png`)
- Huecos relacionados: —

## 7. Lo que funciona y hay que conservar

- **El panel «Así se ve antes de pagar» en el hero**, con las cifras que coinciden con Pagos (27,9 / 26,4 / 27,9 y «1,5 ha más», $ 45.000 de ejemplo). Es lo que hace pasar la prueba de 5 segundos sin leer y, en móvil, queda bajo el titular. Conservar la insignia «Cifras de ejemplo» y la nota de que las hectáreas las declara el operador.
- **El recuadro «Otear no hace los vuelos.»** y su eco en «Hablemos».
- **El enlace «Qué hay hoy, qué falta y qué se acuerda con usted»** del hero: llevó al precio «por definir» en un clic.
- **El aviso de bienvenida que se cierra solo** (al cambiar de pantalla y a los 15 s) y que cambia según el sector; la «Guía de la demo».
- **El sector se conserva tras recargar** en vía, obra, vigilancia, mina y agricultura. Esas cuatro demos no mostraron ninguna palabra de cultivo, lote, hacienda, vigor ni NDVI en Programación, Servicios, Mapa, Evolución, Vuelos, Informes, Pagos, Documentos ni Equipos (revisé el texto de cada pantalla con una lista de palabras; las coincidencias de «cana», «ha» eran «cercanas» y «ha cambiado»). La evidencia de la vía y la mina habla de PK, bancos y taludes.
- **La honestidad escrita de cerca** («Cifras sintéticas… no de un cliente», «Otear todavía no analiza imágenes», «firma electrónica simple de ejemplo, sin valor legal», «Se acuerda según su operación»).
- **El formulario en dos pasos**, con la frase «Este paso no envía nada…» y el respaldo «Escríbanos a hola@otear.app» si no hay canal.

## 8. Huecos H1–H9 para esta persona

- **H1 Qué es / si presta vuelos:** cubierto; el panel lo prueba. El panel solo habla de campo (V3-03).
- **H2 Cómo entran mis vuelos:** cubierto («el operador los entrega»).
- **H3 Cuánto cuesta:** honesto («por definir») y ahora a un clic desde el hero.
- **H4 Datos y salida:** «por definir» en «Se acuerda con usted»; honesto.
- **H5 Qué es un piloto / quién está detrás:** «piloto» ya no estorba; «Quién está detrás» funciona como estado, no como nombre (V3-08).
- **H6 Primer minuto:** cubierto en escritorio; tropiezos en móvil y con «Otro sector» (V3-01, V3-05, V3-06).
- **H7 Real o simulado / vocabulario:** cubierto; restos de concordancia en Vuelos (V3-02) y «Otro sector» (V3-01).
- **H8 Historia con números:** cubierto; está en la primera pantalla (V3-09 sobre la repetición).
- **H9 Qué aprendemos de quien entra:** indiferente para Marta; no vi la invitación y no hay aviso de medición porque no hay token (como se decidió).

## 9. Qué le preguntaría a una persona real como ella

1. La última vez que le pasaron un enlace de una herramienta «a ver si nos sirve», ¿qué miró primero en la pantalla y qué dato buscó antes de decidir si seguía o cerraba?
2. La última vez que un proveedor de servicios le mostró una factura que no cuadraba con lo hecho, ¿cómo se dio cuenta y qué cifras puso lado a lado para reclamar?
3. La última vez que abrió un enlace desde el celular y tuvo que elegir una opción entre varias, ¿qué hizo para saber si había elegido bien, y qué esperaba ver cambiar en la pantalla?

## 10. Límites

- Son hipótesis de un agente que interpreta dos lecturas; no hay Marta real ni lector real.
- La prueba de 5 segundos se hizo sobre captura estática (hero a 6 s de carga; el avión ya estaba en su sitio), no con cronómetro.
- Móvil: emulación de 390×844 en Chromium sin interfaz, y solo la landing y la entrada a la demo (agricultura y vía, y el aviso en mina). No recorrí las pantallas internas en móvil: el brief de esta pasada me limita a landing y entrada. El menú plegado no pude abrirlo con el selector que probé (no encontré el nombre accesible del botón); el botón «Menú» se ve completo.
- En obra, la pantalla de Avance de obra (3D con WebGL por software) tarda unos 20 s en responder en mi Chromium; el aviso de bienvenida de la prueba con obra llegó a mostrarse y a cerrarse sin que yo lo capturara. No sé cómo se comporta en un computador real.
- La invitación «¿Esto, con sus datos?» no apareció en mis recorridos cortos; no la verifiqué.
- Servidor de desarrollo: el recuadro «Pendiente: defina NEXT_PUBLIC_…» y el indicador «N» de Next no estarían en producción. No sé qué canales se configurarán. Sin token no se mide nada y no vi aviso de medición (consistente con lo decidido).
- No se pulsó enviar, WhatsApp, correo ni «Elegir una hora».
- No evalué la verificación de identidad de la firma ni la decisión del operador sin vista propia (decisiones del dueño).
