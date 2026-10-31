# Prueba con personas reales: guion y hoja de registro

Las cinco personas simuladas de `revision-usuarios/` son hipótesis; no reemplazan esta prueba. Aquí se decide qué se pregunta, cómo se anota y qué cuenta como «señal». Todo en español de Colombia, con «usted».

## Qué se quiere saber

1. **¿Se entiende en 5 segundos qué es Otear y qué no es?** (compara, reúne y verifica vuelos de dron; **no los presta**).
2. **¿Alguien pone algo de su parte?** Un «me gusta» no cuenta. Cuenta un compromiso concreto: un vuelo suyo para probar, una reunión en su sitio de trabajo, presentarnos a quien decide, o dar el nombre de su operador.
3. **¿Qué parte de la historia de «antes de pagar» recuerdan y repiten con sus palabras?**

## A quién

| Grupo | Cuántos | Quién | Para qué |
|---|---|---|---|
| A. Compradores | ~5 | Quien contrata o paga vuelos de dron (gerente, jefe de operación, interventor, dueño de finca o de obra) | Saber si el valor les importa y si dan un compromiso |
| B. Ajenos al sector | ~5 | Personas que no conocen drones ni el sector | Saber si la landing se entiende sin contexto |

Alcance: no se promete precio, piloto gratis, propiedad de datos ni fecha; todo eso está «por definir» y así se dice si preguntan. No se muestra nada como real: los datos son de ejemplo y Otear está en validación, sin clientes todavía.

## Antes de empezar

- Abra la landing publicada (`https://otear.pages.dev/`) en **pantalla de escritorio** (1440 × 900) y, con otro grupo, en **teléfono**. Cierre el avión de la animación si distrae: la prueba es del texto y del panel «Así se ve antes de pagar».
- Diga: «Esto es una prueba de la página, no de usted. No hay respuestas correctas y puede parar cuando quiera. Voy a anotar lo que diga, sin su nombre en lo que se comparta.» Pida permiso para anotar.
- No explique el producto antes. Si pregunta «¿qué es?», responda «Eso es lo que quiero ver, dígamelo usted».

## Parte 1. Prueba de 5 segundos (hasta 5 minutos)

1. Muestre **solo la primera pantalla** durante 5 segundos y ciérrela (o tape la pantalla).
2. Pregunte, una por una, sin sugerir respuesta:
   - «¿Qué es esto, con sus palabras?»
   - «¿Para quién cree que es?»
   - «¿Qué cree que hace esta página por usted?»
   - «¿Hacen ellos los vuelos de dron?» (La respuesta correcta es no; anote si lo supo sin preguntar.)
3. Anote la respuesta textual. Marque: `entendió` / `a medias` / `no entendió` para «qué es» y «no presta vuelos».
4. Muestre la pantalla otra vez, sin límite de tiempo, y pregunte: «¿Qué le llama la atención? ¿Qué le falta para confiar?» Anote si menciona el panel de cifras o quién está detrás.

## Parte 2. Una tarea (hasta 10 minutos, solo grupo A)

Pídale que abra la demo («Abrir la demo») y haga una cosa, en voz alta:

- Comprador: «Encuentre si a este operador se le pagó por más hectáreas de las que dice haber cubierto». (Pagos › Antes de pagar.)
- Interventor o jefe de obra: «Encuentre una medida correctiva vencida y qué falta para cerrarla». (Vuelos › Hallazgos.)

Anote: tiempo hasta el primer clic útil, dónde se pierde, qué palabras no entiende, si pide ayuda. **No ayude** hasta que se rinda o pasen 3 minutos; entonces anote «ayuda necesaria».

## Parte 3. Preguntas sobre su pasado (10 minutos)

Preguntas por lo que **ya hizo**, no por lo que haría. Escoja las del rol:

**Quien contrata o paga vuelos**
1. «La última vez que un cliente o un operador le discutió las hectáreas de un trabajo: ¿qué documento o cifra usó cada uno, cuánto tardaron en ponerse de acuerdo y qué quedó de más o de menos en la factura?»
2. «La última vez que tuvo que explicarle a su jefe qué hacía una herramienta nueva: ¿qué frase usó y qué dato buscó para respaldarla?»

**Interventoría u obra**
3. «Cuénteme la última no conformidad que dio por cerrada: ¿quién la verificó, qué evidencia vio y dónde quedó guardada?»
4. «Cuénteme la última auditoría en que le pidieron demostrar que un informe no cambió después de firmado: ¿qué mostró y qué le faltó?»

**Operador de dron (si aparece alguno)**
5. «La última vez que una factura suya se quedó sin pagar por una diferencia pequeña de área: ¿quién dio la explicación, por qué medio y cuánto demoró el pago?»
6. «Cuando entrega horas de vuelo a un cliente: ¿en qué registro anota qué aeronave y qué baterías usó, y quién más ve ese registro?»

**Ajenos al sector (grupo B)**
7. «La última vez que abrió un enlace de un producto que le mandó un colega: ¿qué hizo en los primeros diez segundos y qué le hizo bajar más (o cerrar)?»

## Parte 4. Pedir un compromiso (5 minutos, solo grupo A)

Al final, **una sola** petición, sin presionar, la que mejor encaje:

- «¿Me presta un vuelo reciente suyo, o de su operador, para que lo veamos juntos en Otear?» (es la prueba más fuerte)
- «¿Podemos reunirnos 30 minutos en su sitio de trabajo?»
- «¿Me presenta a quien decide la compra de vuelos?»
- «¿Me dice el nombre de su operador de dron?»

Anote exactamente qué respondió y **la fecha**. «Me gusta», «interesante» o «escríbame» sin fecha cuentan como **sin compromiso**.

## Hoja de registro

Una fila por persona. Hay una copia para hojas de cálculo en `prueba-con-personas-registro.csv`.

| Columna | Qué anotar |
|---|---|
| id | P01, P02… (sin nombre real en lo compartido) |
| grupo | A comprador / B ajeno |
| rol y sector | Cargo y sector en una frase |
| dispositivo | escritorio / teléfono |
| fecha | AAAA-MM-DD |
| 5s_que_es | Frase textual |
| 5s_entendio_que_es | entendió / a medias / no entendió |
| 5s_sabe_que_no_presta_vuelos | sí / no / sin preguntar |
| vio_panel_cifras | sí / no |
| vio_quien_esta_detras | sí / no |
| tarea | Cuál se pidió |
| tarea_resultado | completó / con ayuda / no completó |
| tarea_segundos | Tiempo hasta el primer clic útil |
| palabras_que_no_entendio | Lista |
| pasado_respuesta_clave | Lo más revelador de la parte 3 |
| compromiso_pedido | Cuál de la parte 4 |
| compromiso_resultado | concreto con fecha / sin compromiso / rechazo |
| cita_textual | Una frase suya, palabra por palabra |
| observaciones | Lo que usted vio, aparte de lo que dijo |

## Cómo leer los resultados

- **Pasa** la prueba de 5 segundos si al menos 4 de 5 ajenos y 4 de 5 compradores dicen «qué es» de modo cercano a «ver y comparar vuelos de dron» y al menos 4 de 5 saben que Otear no presta vuelos. (Umbral inicial; ajústelo antes de mirar resultados, no después.)
- **Señal de interés**: al menos 2 compromisos concretos con fecha del grupo A. Menos que eso, la descripción o el valor no están llegando, aunque la gente diga que le gustó.
- Compare siempre con los informes simulados: si una persona real tropieza donde la simulada no, cuenta más la real.
- Todo lo que se aprenda se escribe en un informe nuevo en `revision-usuarios/` y lo no decidido se pregunta al dueño; no se cambia la política de precio, datos o piloto por lo que diga una sola persona.
