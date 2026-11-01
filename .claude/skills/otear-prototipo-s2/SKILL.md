---
name: otear-prototipo-s2
description: "Reglas para construir el prototipo de mediana fidelidad de Otear (Semana 2, Prototipado MCUX): el flujo «Verificar el cobro de una labor contratada» (pantallas 10, 11 y 12 de S1) en escala de grises, sin animación, con datos verosímiles y los estados Normal, Cargando, Error y Deshabilitado. Úsese al crear o modificar cualquier archivo bajo src/features/prototype/ o src/app/prototipo/."
---

# Skill del proyecto: prototipo S2 de Otear («Verificar cobro»)

Fuente de verdad: el Brief y la Matriz de Supuestos de la Semana 1 («Otear_Entrega_Prototipo_Baja_Fidelidad_LUIS ROJAS.pdf»). Cada regla lleva entre corchetes el hallazgo que la respalda y, al final, cómo se comprueba. Una regla que no se puede comprobar no va aquí.

Abreviaturas de S1: **PP1–PP4** puntos de dolor; **OB1–OB3** objetivos de negocio; **OD1–OD2** objetivos de diseño; **T1–T3** tareas de la prueba; **Tabla 3** matriz de supuestos (fila 1 valor-suscripción, fila 2 valor-verificar cobro, fila 3 usabilidad 56 años, fila 4 factibilidad GPS/mapa del operador, fila 5 factibilidad IA, fila 6 viabilidad); **Tabla 10** elementos de cada flujo; **Tabla 12** validación con el productor.

Flujo que se prototipa: **T2**. «El operador le cobró 18,4 ha de fumigación. Revise si las hizo y, si no, mándele la evidencia.» Es el flujo secundario (caso límite) del Brief: pantallas 10 → 11 → 12, con sus salidas.

---

## 1. Producto y usuario

| # | Regla | Hallazgo S1 | Cómo se comprueba |
|---|---|---|---|
| 1.1 | Hay una sola persona: Hernando, 56 años, administra la Hacienda Santa Rita (Valle del Cauca), usa el computador de la oficina y WhatsApp. Ninguna pantalla se dirige a otra persona. | Persona del Brief; Tabla 3 fila 3 (56 años, computador y WhatsApp) | Buscar en los textos: no aparece «operador» como destinatario de ninguna instrucción de la interfaz, salvo en el mensaje que Hernando le envía. |
| 1.2 | Otear no vuela ni cobra: solo centraliza lo que otros volaron. Ningún texto sugiere que Otear presta el servicio. | Cambio de modelo del Brief («Otear ya no vuela»); Tabla 12, «Su propio uso del dron» | Buscar «contratar Otear», «nuestro piloto», «nuestro dron»: cero resultados. |
| 1.3 | La tarea es una sola: decidir si acepta el cobro o le envía la evidencia al operador. Cada pantalla responde a una pregunta: ¿qué cobraron?, ¿qué hicieron?, ¿qué hago? | PP3: paga labores que no puede comprobar (el de mayor carga emocional) | Cada pantalla tiene un `h1` que nombra esa pregunta y una sola acción primaria. |
| 1.4 | Español de Colombia, trato de «usted», lenguaje del productor (lote, hectárea, fumigación, operador); sin «dashboard», «upload», «feedback». | Tabla 12 («lote», «labores», «hectáreas cobradas») | Buscar anglicismos de la lista: cero. |
| 1.5 | Formato: computador, viewport de 1280 × 800 px (el área del documento, no la ventana del navegador). Solo escritorio de 1024 px en adelante: a 375 px el menú fijo deja el contenido sin espacio y no se corrige en esta entrega. | «Dispositivo y alcance» de S1 (sube y revisa en la oficina) | Viewport de 1280 × 800 y de 1024 × 768: sin scroll horizontal ni texto cortado. |

## 2. Hipótesis y riesgos

| # | Regla | Hallazgo S1 | Cómo se comprueba |
|---|---|---|---|
| 2.1 | **H1 (comprensión).** Hernando debe entender en la pantalla 11 si lo cobrado coincide con lo aplicado, sin ayuda y en menos de 2 minutos, y confirmar que sabe lo que paga (confianza ≥ 4,5 sobre 5). La pantalla 11 pone Cobrado, Aplicado y Pedido lado a lado y dice la diferencia en hectáreas y en pesos antes de pedir nada. | OD1 (que sepa lo que paga); PP3; mismo criterio «cuatro de cinco sin ayuda» de Tabla 3 fila 3 | Cifras y veredicto visibles sin hacer scroll a 1280 × 800; veredicto en la primera mitad de la pantalla. |
| 2.2 | **H2 (valor).** Si la diferencia supera la tolerancia, Hernando debe elegir «Enviar evidencia al operador» y no «Aceptar el cobro». Por eso cuando hay diferencia la acción primaria es enviar evidencia y aceptar es secundaria. | Tabla 3 fila 2 (quien contrata por hectárea quiere verificar y compartiría evidencia) | Con diferencia sobre el umbral, el botón primario es «Enviar evidencia al operador»; «Aceptar el cobro» no es primario. |
| 2.3 | La tolerancia de 5 % es una referencia, no un acuerdo. Siempre se escribe como «Referencia del prototipo: 5 %; se pacta con el operador (por definir)». | Tabla 10, decisión «¿la diferencia supera la tolerancia?» (S1 no fija el porcentaje); decisión del dueño del 30 oct: pendiente | Texto exacto presente junto al veredicto; ningún texto la llama «regla» o «contrato». |
| 2.4 | El mapa del operador puede no llegar en un formato legible. El prototipo lee KML y GeoJSON; un SHP o un archivo roto es un error con salida («Pedir el mapa en KML»), no un callejón. | Tabla 3 fila 4 (al menos 2 operadores entregan el mapa en KML o SHP) | Cargar un `.shp` (o `.txt`), un KML vacío y un mapa de otra finca: tres mensajes distintos, cada uno con botón de salida. |
| 2.5 | Se verifica con el propio vuelo de Hernando solo si es posterior a la labor. Un vuelo anterior es un error («aún no hay vuelo posterior»), no un dato. | Tabla 10: validación «vuelo propio posterior a la labor»; error «sin vuelo posterior» | Elegir el vuelo del 12 oct (anterior a la labor del 16 oct) muestra el error con salida. |
| 2.6 | No se resuelve la política de fotos sin GPS ni «G6». El flujo no sube fotos ni las asigna a lotes. | Tabla 3 fila 4 (fotos con GPS: evidencia baja, sin validar; se prueba en S4, no aquí) | Buscar «sin GPS» en `src/features/prototype/`: cero resultados. |

## 3. Flujos y arquitectura

| # | Regla | Hallazgo S1 | Cómo se comprueba |
|---|---|---|---|
| 3.1 | Tres pantallas y nada más: **10 Labores y tareas** (entrada) → **11 Verificar cobro** → **12 Compartir evidencia**, más el estado final «En reclamo» que se ve en la 10. | Figura 5 y Tabla 11 de S1 | Un solo `h1` visible a la vez; los títulos son esos tres. |
| 3.2 | Salidas del flujo: (a) evidencia enviada → vuelve a la 10 con la labor «En reclamo»; (b) cobro aceptado → vuelve a la 10 con «Cobro aceptado»; (c) pedir el mapa al operador → vuelve a la 11 con el mapa pendiente; (d) volver sin hacer nada. Ninguna termina sin un botón visible. | Tabla 10: salida exitosa y salida alternativa | Recorrer cada salida; en cada pantalla existe «Volver» o una acción que lleva a otra pantalla. |
| 3.3 | El menú lateral muestra las 7 secciones de S1 (Inicio, Vuelos y fotos, Lotes, Hallazgos, Labores y tareas, Programar, Informes y cifras). Solo «Labores y tareas» está habilitada; las otras seis están **deshabilitadas** y lo dicen en su texto accesible. | Informe de IA de 7 secciones (S1) | Las seis tienen `aria-disabled="true"` y no navegan. Cero enlaces que lleven a una página vacía. |
| 3.4 | Los cambios de estado se resuelven en la misma pantalla. Un error, una carga o una confirmación nunca crean una ruta ni una pantalla nueva. | Tabla 11 (cargas y errores marcados dentro de cada pantalla, sin pantallas aparte) | La URL no cambia al cargar, fallar o confirmar. |
| 3.5 | Una ruta, `/prototipo/verificar-cobro/`; sin proveedor de demo, sin `AppShell` y sin módulos de la demo. | Figura 5 y Tabla 11: el flujo son tres pantallas; el resto del producto queda fuera de alcance | La ruta no importa `demo-context` ni `app-shell`. |
| 3.6 | La lógica (aritmética de hectáreas, tolerancia, lectura del mapa, reglas de envío) vive en módulos puros con pruebas; los componentes solo muestran. Se reutilizan `checkArea`, `areaValue`, `parseGeometry` y `polygonAreaHa` de la demo y no se reescriben. | Tabla 3 fila 4 y Tabla 10 (lectura del mapa y comparación son las validaciones del sistema que se prueban) | `npm test` cubre el módulo del prototipo; ningún componente calcula hectáreas. |

## 4. Reglas de la etapa (mediana fidelidad, S2)

| # | Regla | Hallazgo S1 | Cómo se comprueba |
|---|---|---|---|
| 4.1 | **Solo grises.** Todo color tiene R = G = B. No hay marca, logo, ni color de acento. El estado se distingue por forma, texto y trazo (borde sólido, doble, discontinuo), no por color. | S1 fue de baja fidelidad en grises; la Matriz de Fidelidad declara refinamiento visual bajo | Recorrer los estilos calculados de todos los elementos: ninguno con matiz. |
| 4.2 | Tipografía estándar: `Arial, Helvetica, sans-serif`. No se usa Instrument Sans ni EB Garamond en ningún texto del prototipo. | Tabla 3 fila 3 (persona de 56 años, computador: tipografía conocida y legible) | `font-family` calculado de todos los elementos dentro de `main`: solo Arial. |
| 4.3 | **Transiciones instantáneas:** `transition: none` y `animation: none` en todo el prototipo, y `scroll-behavior: auto` en el contenedor del prototipo. La excepción es la espera simulada de «Cargando», que es un estado, no una animación. | Tabla 3 fila 3 (lo que se mide es si una persona de 56 años se orienta, no el movimiento) | Estilos calculados: duración de transición y animación en 0 s. |
| 4.4 | Imágenes y mapas son marcadores con una X y una etiqueta que dice qué va ahí, con la proporción real esperada (mapa del operador 16:9; foto del vuelo 4:3). | S1: los mapas e imágenes de baja fidelidad eran marcadores con una X | Cada marcador tiene `aspect-ratio` y `aria-label` que nombra el contenido. |
| 4.5 | Cada elemento interactivo clave tiene los 4 estados **en la misma pantalla**: Normal, Cargando, Error y Deshabilitado. Los elementos clave son cuatro: «Cargar el mapa del operador», «Comparar», «Enviar evidencia» y «Aceptar el cobro». | Tabla 11 (cargas L y errores E por elemento); Tabla 10 | Provocar cada estado en el navegador (no solo en el código). |
| 4.6 | Un botón deshabilitado dice por qué, con texto visible junto a él («Falta el mapa del operador»). | Tabla 3 fila 3 (persona de 56 años) | Cada botón con `disabled` tiene un texto asociado por `aria-describedby`. |
| 4.7 | Texto del cuerpo ≥ 16 px; ninguna etiqueta bajo 12 px; botones y controles de al menos 44 px de alto. | Tabla 3 fila 3 (56 años) | Medición del tamaño de fuente y del alto de los botones y del control «Datos de prueba». |
| 4.8 | Teclado completo: orden lógico, foco visible (trazo negro de 3 px), diálogos que atrapan el foco y se cierran con Escape. | Tabla 3 fila 3 (56 años; WhatsApp y computador de escritorio con teclado) | Recorrer el flujo solo con Tab, Espacio, Enter y Escape: llega hasta «Evidencia enviada» y el diálogo devuelve el foco a «Aceptar el cobro». Se recorrió el 1 nov 2026. |

## 5. Reglas de contenido

| # | Regla | Hallazgo S1 | Cómo se comprueba |
|---|---|---|---|
| 5.1 | **Todo el texto es real.** Prohibido «Lorem ipsum», «Producto 1», «Nombre Apellido», «$XX.XXX», «Texto aquí». | Tabla 12 (el productor reaccionó a palabras reales: «lote», «labores», «hectáreas cobradas») | Buscar esas cadenas: cero. |
| 5.2 | Los datos son los de S1 y cuadran entre pantallas: Agrodron del Valle (operador) fumigó los lotes 5 y 6 el viernes 16 de octubre de 2026 a $90.000 por hectárea. Cobró 18,4 ha ($1.656.000). Su mapa (`aplicacion_lotes5-6.kml`) muestra 17,1 ha ($1.539.000). Los lotes 5 y 6 miden 20,8 ha medidas en el vuelo propio del 24 de octubre. Diferencia: 1,3 ha = $117.000. Los lotes 3 a 6 suman 44,0 ha. | «Dispositivo y alcance» y Figura 12 de S1 | El script de pruebas recalcula las cifras desde los polígonos y deben coincidir. |
| 5.3 | Formato colombiano: coma decimal («18,4 ha»), punto de miles («$1.656.000»), fechas «vie 16 oct 2026». Reutilizar `formatMoney` y `formatDate`. Hay un solo «hoy» en la demo: 25 de octubre de 2026. | Tabla 12 (cifras en pesos y hectáreas cobradas) | Buscar `$` seguido de dígitos sin punto de miles: cero. |
| 5.4 | Cada mensaje de error dice **qué pasó, por qué y qué puede hacer**, sin culpar a Hernando, y trae al menos un botón de salida. No existe «Error. Reintentar». | Tabla 10 («errores con mensaje empático»; Neusesser y Sunwall, 2023) | Todos los errores (mapa en formato no admitido, sin zonas, de otra finca o demasiado grande; vuelo sin cubrir los lotes; mensaje no entregado; falla al registrar el cobro) tienen las tres partes y su salida. |
| 5.5 | Toda cifra clave dice de dónde sale («según el mapa del operador», «medida en su vuelo del 24 oct»). | OD1 (poder demostrarlo); PP3 | Cada cifra de la pantalla 11 tiene una línea de origen. |
| 5.6 | Se dice siempre que es una simulación: «Simulación: no se envía nada a nadie.» y «Los datos de ejemplo no son de un cliente real». | OD1 (que sepa lo que paga: nunca presentar como real algo que no lo es) | Texto presente en las pantallas 11 y 12. |
| 5.7 | Contenido extremo se lee sin desbordar ni solapar, y ninguna cifra queda absurda: nombre de operador de 78 caracteres, nota de 716, cobro de $0 (no hay cobro que aceptar ni diferencia que reclamar, y lo dice), cobro de casi $50.000.000 (a $2.717.391 por hectárea), 40 labores y 0 labores. La nota larga no empuja el veredicto fuera de la primera pantalla: va debajo de las acciones, plegada. | H1 y OD1 (el veredicto debe verse con cualquier dato); PP3 (una cifra absurda hace perder la confianza en lo que se paga) | Para cada caso del panel «Datos de prueba»: sin desborde horizontal y con el veredicto a menos de 800 px del borde superior. |

## 6. Reglas de comportamiento

| # | Evento → cambio de estado → salida si falla | Hallazgo S1 | Cómo se comprueba |
|---|---|---|---|
| 6.1 | **Elegir un mapa** (archivo o «Usar el mapa de ejemplo») → «Cargando el mapa…» (espera visible de 0,9 s) → «17,1 ha leídas del mapa» **o** error de lectura con salida «Pedir el mapa al operador» y «Elegir otro archivo». | Tabla 10: validación «lectura del mapa del operador»; Tabla 3 fila 4 | El error es reproducible subiendo un `.txt`. |
| 6.2 | «Comparar» está deshabilitado hasta que haya un mapa leído **y** un vuelo propio elegido. | Tabla 10 (decisión «¿verifica solo con su vuelo?») | Sin ambos, el botón está deshabilitado con su motivo visible. |
| 6.3 | «Comparar» → Cargando → el veredicto reemplaza el panel, en la misma pantalla. El veredicto sale de `checkArea` (referencia 5 %): «Coincide», «Facturó de más» o «Facturó de menos». | Tabla 10 (decisión «¿la diferencia supera la tolerancia?») | Con 18,4 cobradas y 17,1 aplicadas: «Facturó de más», 1,3 ha, $117.000. |
| 6.4 | Con «Facturó de más», **«Enviar evidencia al operador»** es la acción primaria; «Aceptar el cobro» es secundaria y está separada de ella. Con «Coincide», la primaria es «Aceptar el cobro». Con una factura de $0 no hay acción primaria y las dos acciones están deshabilitadas con el motivo escrito. | H2 (Tabla 3 fila 2) | Con los datos de S1 (18,4 cobradas, 17,1 aplicadas) el botón primario es enviar. La rama «Coincide» (aceptar es primario) se comprueba en la prueba unitaria `primary accept when match`, no en el navegador: el prototipo no permite cambiar lo cobrado. |
| 6.5 | «Aceptar el cobro» es **irreversible**: pide confirmación en un diálogo que dice qué cambia («La labor queda como pagable y no se puede reabrir desde aquí»), con «Cancelar» como foco inicial. | PP3 (paga sin poder comprobar: aceptar compromete el pago) | Escape y «Cancelar» cierran sin cambiar nada; solo «Sí, aceptar el cobro» cambia la fila. |
| 6.6 | **Compartir evidencia**: el mensaje se escribe solo con las cifras reales; hay tres soportes marcados por defecto (mapa del operador, medición del vuelo, fotos); el enlace vence en 15 días; se comparte solo lo necesario. «Enviar» se deshabilita si no hay destino válido, mensaje o ningún soporte, y dice cuál falta. | Figura 12 de S1; Tabla 10 (decisión «¿envía la evidencia?») | Quitar los tres soportes: «Enviar» pasa a deshabilitado con motivo. |
| 6.7 | «Enviar» → «Enviando…» (espera visible) → «Evidencia enviada»; la 10 muestra la labor «En reclamo». O **error «El mensaje no llegó»** con salidas: «Reintentar», «Corregir el número» y «Copiar el mensaje y el enlace» para mandarlo uno mismo. | Tabla 10: error «mensaje no entregado» | El error se provoca con el número +57 300 000 0000, anotado solo en el panel «Datos de prueba», no en la pantalla del flujo. |
| 6.8 | Cada pantalla tiene «Volver» a la anterior. «Volver» no pierde lo ya cargado (mapa y vuelo elegidos). | Tabla 10, salida alternativa (volver sin decidir) | Ir y volver conserva el estado. |
| 6.9 | Al terminar, la fila de la labor en la 10 refleja el resultado y no se puede verificar dos veces el mismo cobro. | Tabla 10: salida «labor en reclamo» | Tras enviar, el botón «Verificar cobro» de esa fila pasa a «Ver reclamo». |

## 7. Prohibiciones

| # | Prohibido | Por qué |
|---|---|---|
| 7.1 | Color, degradados, sombras de color, logo, marca. | La Matriz declara refinamiento visual bajo: el veredicto debe entenderse por el texto (OD1), no por un semáforo. |
| 7.2 | Animación, transición, parallax, esqueletos que pulsan. | Se valida orientación y comprensión, no movimiento (Tabla 3 fila 3). |
| 7.3 | Crear una pantalla o ruta nueva para un estado, un error o una confirmación. | Tabla 11: las cargas y los errores viven dentro de cada pantalla. |
| 7.4 | Pantallas fuera del flujo (informes, hallazgos, vuelos, programar). Su acceso va deshabilitado. | Tabla 3: el flujo de verificar el cobro es el de mayor riesgo y se prueba solo. |
| 7.5 | `alert()`, `confirm()`, `prompt()` del navegador. | Tabla 3 fila 3: el diálogo del navegador interrumpe a una persona de 56 años y no prueba el diálogo propio. |
| 7.6 | Mezclar niveles de fidelidad (un componente con color o sombra y otro en grises). | Contradice lo declarado en la Matriz de Fidelidad y confunde qué se está probando. |
| 7.7 | Enviar nada de verdad, guardar datos, pedir cuenta, pagar o llamar a un servicio externo. El mapa se lee en el navegador y no se sube. | Tabla 3 fila 4: lo que se valida es si el mapa se puede leer, no el envío real. |
| 7.8 | Presentar una simulación como real, o la tolerancia, el precio o el piloto como acordados. | OD1: la confianza del productor depende de no prometer lo que no existe. |
| 7.9 | Resolver la política de fotos sin GPS o «G6». | Tabla 3 fila 4: sin validar con fotos reales. |
| 7.10 | Dejar un botón sin efecto o un enlace que no lleve a ningún sitio. | Tabla 10: toda pantalla tiene salida exitosa y alternativa. |
| 7.11 | Reescribir la aritmética de hectáreas en un componente. | PP3 y regla 3.6: una sola cuenta, que se pueda comprobar. |
| 7.12 | Aceptar lo generado sin comprobarlo en el navegador. Toda corrección de fondo se documenta con captura antes y después. | PP3: lo que se muestra debe poder comprobarse. |

---

## Cómo se usa esta skill

1. Antes de escribir una pantalla del prototipo, léanse los bloques 4 a 7.
2. Al terminar, recórranse las reglas 2.x, 3.x y 6.x en el navegador, no en el editor.
3. Toda decisión que se corrija se anota en `docs/planning/prototipo-s2/registro-auditoria.md` con su captura de antes y de después.
4. Todo prompt que se envíe para construir el prototipo se anota en `docs/planning/prototipo-s2/prompt-log.md`.
