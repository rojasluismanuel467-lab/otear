# Tercera pasada como cañicultor: Hernando, 56 años

Son hipótesis de una persona simulada, no resultados de usuarios reales. Las únicas cifras son las que muestra la demo (datos sintéticos). Recorrido del 31 de octubre de 2026 sobre `http://localhost:3442` (rama `revision-fase-3`, commit `f1b2d0e`), escritorio 1440×900 y móvil 390×844 con Chromium propio (CDP, puerto 9442). No edité ningún archivo del proyecto. Evidencia marcada «navegador» solo cuando vi la pantalla ejecutarse; si no, «lectura de código». Declaro que esta es mi tercera pasada: ya conozco el producto y mis informes anteriores, así que la prueba de 5 segundos de abajo la escribo sobre el hero nuevo con esa salvedad.

## 1. Estado de los hallazgos de la pasada anterior (N2-01 a N2-08) y del que seguía abierto de la primera (N-13)

| ID | Estado | Evidencia y por qué |
|---|---|---|
| N2-01 Tres «hoy» distintos | **resuelto** | Navegador. «Hoy en la demostración es 25 de oct de 2026» en Vuelos > Hallazgos e Informes; el pie dice «escenario del 25 oct. 2026»; el vuelo del 29 sigue «Programado» y la propuesta del asistente sugiere el 27 de oct (posterior a hoy). Un solo día en todas partes. |
| N2-02 Conteos distintos entre pantallas | **mejorado** | Navegador. Evolución: «5 hallazgos de campo (3 del operador y 2 sugerencias sin revisar) y 1 alerta calculada»; Vuelos: «Revisar 4 novedades… (2 del operador y 2 sugerencias sin revisar)»; «vencida» ya va como «de ellas, 1 vencida» y «Todas (4)» cuadra con las tres abiertas/en corrección + la cerrada. Queda que el informe y Pagos dicen «3» sin el desglose, mientras la pestaña dice «5». |
| N2-03 Informes abre en pendientes del operador; «Informe» no dice «de todo el periodo» | **igual** | Navegador. Pestañas «Pendientes 13 \| Evolución \| Costos \| Informe»; la pestaña sigue llamándose «Informe» y trae el consolidado «Desde / Hasta». En móvil, además, ver N3-07. |
| N2-04 «mejoró» primero, «Lote 4 baja de vigor» debajo | **resuelto** | Navegador. El panel «Qué pasa en este vuelo» ahora abre con «Alerta calculada · Lote 4 baja de vigor · Viene bajando desde el 19 de sept de 2026 (0,75)»; la caja «mejoró» quedó debajo. |
| N2-05 Medida correctiva: orden y dueño | **mejorado** | Navegador. Ahora dice «Responsable (quien lo corrige)» y «Quién debe cerrar la medida en su empresa lo decide usted». Siguen: la medida se ve con el hallazgo todavía «Por verificar» junto a «Confirmar / Descartar», y «8 hallazgos de campo confirmados sin responsable» sin botón para asignarlos. |
| N2-06 «Es donde más hay» | **igual** | Navegador (`/mapa`). Lote 3 sigue con «Es donde más hay» (8 novedades) mientras Lote 4 es el que baja. Los números de la lista ya van en círculo neutro, no en colores de vigor. |
| N2-07 Erratas y cifras | **mejorado** | Navegador (informe consolidado). Corregidos «al hallazgo» y «1 vuelo». Siguen «…facturar solo lo cubierto..» (dos puntos) y «$ 836.632 COP para 27,9 ha» frente a la factura de $ 837.000 (y «$ 212.856» frente a 7,1 × 30.000). |
| N2-08 Avión sobre el selector de sector | **igual** | Navegador (captura 1440×900). El planeador se dibuja encima de «Vía o carretera», «Mina a cielo abierto» y del enlace «Abra la demo como operador». Los botones respondieron a la selección por teclado/JS, pero tapa justo lo que hay que leer. El nombre del menú salió igual («Evolución del cultivo») en esta entrada; no pude aislar la variación anterior. |
| N-13 Caña: suerte, corte, variedad | **mejorado** | Navegador. El preset «Caña de azúcar» existe y trae «Suertes» y los campos «Edad del cultivo (meses)» y «Estado de corte». Quedan problemas nuevos (N3-02, N3-03, N3-04). |

Recuento (9 filas): **resueltos 2** (N2-01, N2-04); **mejorados 4** (N2-02, N2-05, N2-07, N-13); **iguales 3** (N2-03, N2-06, N2-08); **empeorados 0**.

## 2. Persona y tareas

- **Persona:** Hernando, 56 años, dueño de la hacienda Santa Rita (caña, le entrega al ingenio). WhatsApp todos los días, Excel a duras penas, computador de escritorio.
- **T1.** Saber qué suerte va peor y desde cuándo. **T2.** Comprobar si le cobraron lo que se voló. **T3.** Informe del último vuelo para el administrador. **T4.** Descartar con motivo un hallazgo con medida abierta y ver qué pasa con los conteos. **T5.** Activar «Caña de azúcar» y ver «Suertes» y los campos de edad y corte. **T6.** Leer en el celular Evolución, Mapa e Informes.

## 3. Prueba de 5 segundos (hero nuevo, antes de leer más)

Escritorio 1440×900: a la izquierda un cuadro «Así se ve antes de pagar» con tres barras (Se pidieron 27,9 ha, El operador declara haber cubierto 26,4 ha, Facturó 27,9 ha) y la frase «Otear lo marca antes de registrar el pago: «Facturó 1,5 ha más de las cubiertas (+5,7 %)»»; a la derecha «La plataforma para comparar los vuelos de dron de su operación» y, bajo el párrafo, «Otear no hace los vuelos. Los hace su operador de dron…».

- **¿Qué hace Otear?** Me ayuda a comparar lo que me piden, lo que dice el operador que voló y lo que me facturan. Eso lo entiendo con solo mirar las tres barras; el titular solo no me lo decía.
- **¿Para quién es?** Para quien le pagan un vuelo de dron por hectárea: yo. «Su operación» sigue sonando a oficina, pero las barras en hectáreas son mías.
- **¿Qué haría ahora?** «Abrir la demo». «Hablemos sin compromiso» me da menos pereza que antes porque dice «sin compromiso».
- **¿El panel ayuda o estorba?** Ayuda: es la historia de T2 en una pantalla y trae «Cifras de ejemplo» y «no de un cliente». En móvil, ver N3-08. **¿Se entiende quién está detrás?** No: dice «Un proyecto en validación: todavía no tiene clientes ni una prueba con sus vuelos. Escriba a hola@otear.app». Entiendo que es algo nuevo y honesto, pero no sé quién responde (N3-08).

## 4. Tareas

| Tarea | Resultado | Qué pasó |
|---|---|---|
| T1 | **Sí** | Landing > «Finca o cultivo» > «Abrir la demo de una finca» (por JS; mi clic con mouse no entró, ver límites) cae en Evolución con el aviso de bienvenida. La ficha «Lote 4 baja de vigor» va primero, con fecha (19 de sept, 0,75 → 0,72 → 0,62). |
| T2 | **Sí** | Pagos > FV-2026-034: «Facturó 1,5 ha más… unos $ 45.000 de más, a $ 30.000 por hectárea… Cifra de ejemplo»; total $ 837.000, pagado $ 380.000, saldo $ 457.000, cuadra con «Pagado $ 3.451.000 de $ 3.908.000». |
| T3 | **Sí** | Vuelos > «Informe del vuelo»: «En breve» con cinco frases (Lote 4 bajó, 1,5 ha sin cubrir, 3 por verificar, 2 sugerencias sin revisar, 1 medida vencida). «Detalle técnico» plegado. |
| T4 | **Sí, con dudas** | Funciona, pero lo que veo después no cuadra (N3-01). |
| T5 | **Con ayuda** | No lo habría encontrado: Configuración > pestaña «Nombres y menú» > «Plantilla de partida» (N3-04). Funcionó; salieron errores de concordancia (N3-02). |
| T6 | **Con dudas** | Sin desborde horizontal a 390 px en Evolución, Mapa e Informes (`scrollWidth` = 390). Se lee, pero T1 queda lejos (N3-05, N3-07). |

## 5. Hallazgos nuevos (ordenados de más a menos grave)

### N3-01 Descartar con motivo: la medida «desaparece de las cuentas» pero la ficha la sigue mostrando viva
- Eje: componente / texto
- Dónde: `/vuelos?tab=hallazgos`, `src/features/flights/review/follow-up-panel.tsx:190-269`, `src/features/flights/review/flight-review-view.tsx:208-218`, `/informes`, `/evolucion`
- Lo que ve la persona: En «Cobertura irregular» (medida abierta, plazo 6 de nov) pulso «Descartar» y sale: «Hallazgo de campo tiene una medida sin cerrar. Para descartarla use «Descartar con motivo» en «Medida correctiva»: así el motivo queda escrito y la medida no desaparece de las cuentas.» Pulso «Descartar con motivo» y, sin escribir nada, «Descartar y anotar el motivo»: aparece «Escriba por qué se descarta: queda en el historial de la medida» y no descarta (bien). Escribo un motivo y sale «descartado con motivo. La medida queda anotada y se cuenta aparte, como «descartada sin cerrar». No se avisó a nadie.» Después: la ficha dice «Hallazgo de campo descartado: la medida queda anotada pero no se cuenta en los resúmenes mientras siga así» y, justo debajo, el chip «Abierta · Vence en 12 días» y los cuatro botones («Pasar a en corrección», «Cerrar con nota», «Cambiar responsable o plazo», «Descartar con motivo»). En la lista: «Lote 3 · Descartado · demo · Medida: abierta».
- Conteos, antes y después (navegador): Evolución pasa de «5 hallazgos… 4 medidas: 1 abierta, 2 en corrección, 1 cerrada» a «4 hallazgos… 3 medidas: 2 en corrección, 1 cerrada · 1 vencida · **1 descartada sin cerrar**». Vuelos pasa de «Todas (4)» a «Todas (3)» y de «1 abierta» a «0 abiertas», sin ninguna línea de «descartada». Informes pasa a «0 abiertas · 2 en corrección · 1 cerrada · 1 vencida», también sin la descartada. Pagos pasa de «3 por revisar» a «2 por revisar». La pestaña «Hallazgos de campo» sigue en 5.
- Qué entiende o hace mal: Me dicen dos cosas contrarias: que la medida «no desaparece de las cuentas» y que «se cuenta aparte». En la práctica solo Evolución dice dónde quedó; en Vuelos e Informes la medida se esfumó, y en la ficha todavía parece activa y se puede cerrar. Pensaría que el sistema se la tragó o que sigue pendiente. «Descartarla» no dice si se descarta el hallazgo o la medida. El mensaje arranca sin artículo («Hallazgo de campo tiene…»).
- Por qué importa para su tarea: Descartar es decirle al administrador «esto ya no hay que corregirlo». Si él ve una medida abierta en una pantalla y ninguna en otra, no sabe a quién creerle (es el mismo mal de N-01 y N2-02, ahora con medidas).
- Propuesta: (a) en la ficha de un hallazgo descartado, cambiar el chip por «Descartada sin cerrar · [fecha] · motivo: …» y ocultar «Pasar a en corrección», «Cerrar con nota» y «Descartar con motivo»; dejar «Reabrir»; (b) en el panel de Vuelos y en Informes sumar la línea «1 descartada sin cerrar» como ya hace Evolución, para que los tres lugares digan lo mismo; (c) texto: «El hallazgo tiene una medida sin cerrar. Para descartarlo, use «Descartar con motivo» en «Medida correctiva»: el motivo queda escrito y la medida se cuenta aparte como descartada».
- Gravedad: confunde
- Evidencia: navegador (Vuelos > Hallazgos, Evolución, Informes, Pagos; capturas antes y después) y lectura de código
- Huecos relacionados: H7

### N3-02 Con «Caña de azúcar» la concordancia sale rota y «Suertes» no llega a los nombres
- Eje: texto
- Dónde: `/vuelos`, `/mapa`, `/evolucion`, `/programacion` con el preset activo; `src/features/config/presets.ts:42-56`
- Lo que ve la persona: «Revise la entrega, confirme **los novedades** de campo…»; «…y **los suertes** dibujados son inventados»; «Aquí se dibujan y miden **los suertes**»; «Color **del suerte**: vigor, de rojizo…»; «Revise **los novedades** de campo del operador…»; «Revisar 4 novedades de campo (2 del operador…)» (esta sí concuerda). Las zonas siguen llamándose «Lote 3», «Lote 4», «Lote 5», pero la lista dice «3 suertes · 27,9 ha» y el informe «Suerte: Lote 3 · prioridad alta». En Configuración el preset cambia «Operador» por «Aplicador» (descripción: «La empresa que presta el servicio de vuelo»).
- Qué entiende o hace mal: «Suerte» y «novedad» son femeninas; los textos lo tratan como masculino en varias frases. «Suerte: Lote 3» me parece un error de quien lo escribió: yo llamaría «Suerte 3». «Aplicador» es quien aplica el producto, no quien vuela; podría creer que el servicio incluye fumigar.
- Por qué importa para su tarea: Todo el sentido del preset es que la pantalla hable como yo. Con la gramática rota parece un programa que no sabe de qué habla justo en el lugar donde dije «aquí uso suertes».
- Propuesta: Pasar por el mismo mecanismo de género que ya usa `agree()` los textos que quedaron fijos en masculino («los suertes», «los novedades», «del suerte»); que el preset renombre también las zonas del ejemplo («Suerte 3», «Suerte 4», «Suerte 5») o diga en la descripción que los nombres de cada zona se editan en Mapa; cambiar «Aplicador» por «Operador del dron» o «Empresa del dron» (decisión de redacción a probar con él).
- Gravedad: confunde
- Evidencia: navegador (Vuelos Resumen, Mapa, Evolución, Programación, Configuración) y lectura de código
- Huecos relacionados: H7, H8

### N3-03 Edad y corte son un solo dato por vuelo, pero mis tres suertes tienen edades distintas, y nada los usa
- Eje: caso-de-uso
- Dónde: `/vuelos` > Resumen > «Campos de la empresa»; `src/features/config/preset-fields.ts:23-48`
- Lo que ve la persona: «Edad del cultivo (meses) = 10» y «Estado de corte = Por cortar», con la nota «Edad promedio de la caña en los lotes del vuelo. Los valores de los vuelos de la hacienda son de ejemplo.» Más arriba, en Mapa: «Lote 3 · Caña · plantilla», «Lote 4 · primera soca», «Lote 5 · segunda soca».
- Qué entiende o hace mal: Si una es plantilla, otra primera soca y otra segunda soca, no tienen la misma edad ni el mismo corte; un promedio de 10 meses no sirve para decidir nada de Lote 4, que es la que baja. Es una casilla del vuelo (del operador), no de mi suerte. Y en la ficha «Lote 4 baja de vigor» no aparece nada de esto («lleva N meses desde el corte»), que era lo que yo pedía en N-13.
- Por qué importa para su tarea: Después de saber que Lote 4 baja, la pregunta es «¿cuánto lleva desde el corte?». Hoy el dato existe pero a nivel equivocado y sin conectarlo.
- Propuesta: No inventar nada: que el campo sea por suerte (aunque se llene a mano) o, si por ahora es por vuelo, decirlo en la nota: «Un valor por vuelo; si las suertes tienen edades distintas, anótelo en las notas». Y repetir el valor en la ficha de la suerte con la etiqueta «de ejemplo». Pregunta pendiente para validar con cañicultores reales: si lo anotan por suerte o por vuelo.
- Gravedad: confunde
- Evidencia: navegador (Resumen del vuelo del 24 de oct con el preset) y lectura de código
- Huecos relacionados: H8

### N3-04 El vocabulario de caña está a tres pasos y nadie me lo ofrece
- Eje: componente / texto
- Dónde: landing (`src/features/landing/sector-picker.tsx`), aviso de bienvenida de `/evolucion`, `/configuracion`
- Lo que ve la persona: En el selector «Finca o cultivo» dice «Sus zonas se llaman **Lotes**». La bienvenida dice «Eligió finca o cultivo: ya ve «lotes» y «hallazgo de campo»…». Para ver «Suertes» hay que ir a Configuración > «Nombres y menú» > «Plantilla de partida» > «Caña de azúcar (ingenio o cañicultor)».
- Qué entiende o hace mal: Yo digo suertes. Si el selector me dice «lotes» y la bienvenida también, concluyo que no saben de caña. La plantilla existe pero «Nombres y menú» no me dice que ahí cambio mis palabras de caña.
- Por qué importa para su tarea: Es la misma propuesta de N-13: el cañicultor debe sentir que es para él en el primer minuto.
- Propuesta: Una frase con enlace en el aviso de bienvenida cuando el sector es agricultura: «¿Cultiva caña? Hable en suertes: cambiar vocabulario». Sin módulo nuevo.
- Gravedad: confunde
- Evidencia: navegador (selector, bienvenida, Configuración) y lectura de código
- Huecos relacionados: H6, H8

### N3-05 En el celular, la gráfica que contesta «cuál va peor» queda al final de ~2.900 px
- Eje: componente
- Dónde: `/evolucion` a 390×844
- Lo que ve la persona: Primero un bloque con el mapa, luego la línea de tiempo con los vuelos, el panel «Qué pasa en este vuelo» con seis tarjetas, el selector «Comparar con», tres cajas de avisos, «Medidas del sitio» y recién al final «Vigor de cada lote en el tiempo». La página mide 2.934 px. En el mapa las etiquetas «Lote 3», «Lote 4», «Lote 5» quedan tapadas por los marcadores (también en `/mapa`). En la línea de tiempo la primera fecha aparece cortada («2 ago» en vez de «22 ago»).
- Qué entiende o hace mal: La ficha «Lote 4 baja de vigor» sí se ve, pero la línea que cae, que en el escritorio era lo más claro, no llega sin desplazarse dos mil píxeles. Con el pulgar no la alcanzo sin buscarla. En el mapa no sé qué marcador es de qué lote.
- Por qué importa para su tarea: Hernando revisa suertes desde el celular en el campo; T1 debería caber en la primera pantalla.
- Propuesta: En móvil, subir la gráfica justo después de la ficha de Lote 4 (o plegar las cajas de «fiabilidad» y «medidas del sitio»); mover las etiquetas de lote fuera del alcance de los marcadores o mostrarlas solo al tocar; no cortar la fecha de la línea de tiempo.
- Gravedad: confunde
- Evidencia: navegador (capturas 390×844 de `/evolucion` y `/mapa`)
- Huecos relacionados: H6

### N3-06 Para firmar el informe, los roles y las palabras no son de una finca
- Eje: texto / caso-de-uso
- Dónde: `/vuelos?tab=informe` > «Firmar el informe del vuelo»; `src/features/traceability/templates.ts`
- Lo que ve la persona: «Informe del vuelo · Sin documento · Firman: **Operador y Revisor o interventor**» y «Acta de entrega y recibo a satisfacción · Firman: Operador y **Cliente o responsable**». En el cuadro: «Huella 6da7ba9bd51393f5…» y «La huella es un código calculado con el texto de este informe: si cambia una letra, el código cambia y las firmas anteriores quedan sin validez». Los botones de firma quedan más abajo del texto del informe, dentro del cuadro.
- Qué entiende o hace mal: «Interventor» es palabra de obra y de carreteras; mi administrador no es interventor. No sé si el que firma por mí es «Revisor» o «Cliente o responsable» (son dos casillas distintas en dos documentos). «Huella» sigue siendo la del dedo; la explicación está bien escrita, pero la palabra es la que me detiene (N-08).
- Por qué importa para su tarea: T3 termina en que mi administrador pueda firmar «recibido». Si no sabe en qué casilla va, no firma. Dice con claridad que no tiene valor legal y que no verifica quién firma; eso lo dejo como está.
- Propuesta: Que el rol de revisión use el vocabulario del sector (agro: «Revisor (quien recibe el informe)»; obras y vías conservan «interventor»); usar «sello» o «código de control» en lugar de «huella» en el título y dejar «huella» entre paréntesis; subir los botones de firma antes del texto largo del documento. Pendiente de validar con él quién firma por el cañicultor.
- Gravedad: confunde
- Evidencia: navegador (diálogo de firma abierto, sin firmar) y lectura de código
- Huecos relacionados: H7

### N3-07 En el celular, Informes abre con la lista de seis vuelos y los pendientes del operador
- Eje: componente
- Dónde: `/informes` a 390×844; tabs `Pendientes 13 | Evolución | Costos | Informe`
- Lo que ve la persona: Casi toda la primera pantalla es el «Historial» de 6 vuelos; después el título del vuelo, cuatro datos (clima, altura máxima, baterías, autorización) y, recién entonces, las pestañas, abiertas en «Pendientes 13»: «Soporte del piloto espera revisión», «Póliza del equipo… vencida», «Soporte de la operación no tiene archivo asociado». La pestaña «Informe» (el consolidado) no dice «de todo el periodo» (N2-03, igual).
- Qué entiende o hace mal: Pensé que «Informes» era una lista de vuelos. Los pendientes que veo son del operador (póliza, soporte del piloto). Sin desborde horizontal.
- Por qué importa para su tarea: T3 por el camino de Informes sigue llevando a lo que no es.
- Propuesta: En móvil plegar el historial en un selector de vuelo; abrir en la pestaña que muestra el resumen del vuelo y renombrar «Informe» como «Informe de todo el periodo»; llevar «Póliza» y «Soporte del piloto» a Documentos o a una pestaña propia.
- Gravedad: menor
- Evidencia: navegador (captura 390×844) y lectura de código
- Huecos relacionados: H6

### N3-08 Hero: el panel sirve, pero en el celular empuja «Otear no hace los vuelos» fuera de la primera pantalla, y «Quién está detrás» no dice quién
- Eje: componente / texto
- Dónde: `/` (`src/features/landing/landing-page.tsx`, hero)
- Lo que ve la persona: En 390×844 el titular y el panel «Así se ve antes de pagar» llenan la primera pantalla; el párrafo, la aclaración «Otear no hace los vuelos…» y el botón «Abrir la demo» del hero empiezan hacia 1.000 px (el botón «Abrir la demo» de la barra de arriba sí se ve siempre). Debajo: «Quién está detrás. Un proyecto en validación: todavía no tiene clientes ni una prueba con sus vuelos. Escriba a hola@otear.app.»
- Qué entiende o hace mal: En el celular veo que facturan de más, pero no si Otear vuela o no (H1) hasta bajar. Sobre «quién está detrás»: la frase es honesta, pero no hay nombre ni cara; yo no le escribo a un «hola@» sin saber con quién hablo. No lo trato como error del dueño (no ha dado el nombre), solo noto que hoy no me sirve para confiar.
- Por qué importa para su tarea: La confianza para entrar a la demo y luego a hablar.
- Propuesta: En móvil, antes del panel o inmediatamente después, la frase «Otear no hace los vuelos: reúne y compara los que le hace su operador». Para «Quién está detrás», mientras no haya nombre, algo como «Quien responde este correo es el equipo que arma el proyecto; el nombre se lo damos al hablar» (solo si es verdad; redacción a validar con el dueño).
- Gravedad: menor
- Evidencia: navegador (hero 1440×900 y 390×844, medidas por posición) y lectura de código
- Huecos relacionados: H1, H5

### N3-09 Un código interno se cuela en el documento que se va a firmar
- Eje: texto
- Dónde: diálogo de firma del informe del vuelo (texto del documento)
- Lo que ve la persona: Debajo de cada novedad: «Referencia de muestra: finding-santa-rita-1», «…-2». También «Suerte: Lote 3 · prioridad alta» y «Coordenadas de ejemplo: 3.77284, -76.32027».
- Qué entiende o hace mal: «finding-santa-rita-1» no es de ninguna persona; un administrador lo ve como un error en un papel que le piden firmar. Las coordenadas crudas siguen sin traducción (viene de N-04).
- Por qué importa para su tarea: Un documento firmable debe leerse limpio.
- Propuesta: Quitar el identificador del texto visible (dejarlo en el historial interno) o rotularlo «Número de control: 1»; las coordenadas, en letra pequeña con «de ejemplo».
- Gravedad: menor
- Evidencia: navegador (texto del diálogo) y lectura de código
- Huecos relacionados: H7

### N3-10 Sigue «IA» en Informes y dos nombres para la misma pantalla de pagos
- Eje: texto
- Dónde: `/informes` («Se excluyen 2 sugerencias de IA que nadie ha revisado todavía»), `/pagos` (menú «Pagos y costos», título «Pagos y facturas»)
- Lo que ve la persona: En Programación y Vuelos ya se llama «Sugerencia automática · ejemplo»; en Informes dice «sugerencias de IA». El menú dice «Pagos y costos», la página «Pagos y facturas».
- Qué entiende o hace mal: Pienso que son dos asistentes distintos. Con «Pagos y costos» y «Pagos y facturas» dudo si hay una pantalla de costos aparte.
- Por qué importa para su tarea: Es el mismo mal de N-08: una palabra por cosa.
- Propuesta: «sugerencias automáticas» en Informes; un solo nombre para Pagos (menú y título).
- Gravedad: menor
- Evidencia: navegador y lectura de código
- Huecos relacionados: H7

### N3-11 La tarjeta «¿Esto, con sus datos?» aparece encima de los botones de la medida
- Eje: componente
- Dónde: `/vuelos?tab=hallazgos`, esquina inferior derecha (escritorio 1440×900, tras unos 45 s)
- Lo que ve la persona: Un cuadro «¿Esto, con sus datos? Lo que probó usa datos de ejemplo… Quiero verlo con mis datos / Ahora no», que tapa «Pasar a en corrección» y parte de «Plazo» de la ficha de la medida.
- Qué entiende o hace mal: Estaba leyendo la medida y se me atravesó; tuve que cerrarla para llegar al botón. Es descartable («Ahora no») y no me quitó el foco, pero cae justo donde está la acción.
- Por qué importa para su tarea: Estorba en el momento más delicado (cerrar o descartar una medida).
- Propuesta: Que la tarjeta no aparezca mientras haya un formulario o una ficha de acción abierta, o que quede arriba a la derecha.
- Gravedad: menor
- Evidencia: navegador (captura al descartar un hallazgo)
- Huecos relacionados: H9

## 6. Lo que funciona y hay que conservar

1. **El panel «Así se ve antes de pagar» en el hero** (tres barras, la frase «Facturó 1,5 ha más de las cubiertas (+5,7 %)», «Cifras de ejemplo», «Otear no las mide con las imágenes»). Resume T2 en una mirada y es honesto.
2. **Evolución abre con «Lote 4 baja de vigor… desde el 19 de sept de 2026 (0,75)» y el desglose «3 del operador y 2 sugerencias sin revisar»**, más Pagos con «$ 45.000 de más, a $ 30.000 por hectárea» cuadrando con el saldo.
3. **«Descartar con motivo» como idea** (el motivo obligatorio, «No se avisó a nadie», el historial de la medida): es lo que un administrador pide. Conservar; corregir cómo se ve después (N3-01).
4. **«En breve» al comienzo del informe del vuelo, con «Detalle técnico» plegado**, y la nota «No tiene valor legal; no prueba quién escribió el nombre».
5. **El aviso «Hoy en la demostración es 25 de oct de 2026» y el pie «escenario del 25 oct.»**: por fin un solo día.

## 7. Huecos H1–H9 desde mi lugar

- **H1 (si Otear presta vuelos):** mejoró mucho en escritorio («Otear no hace los vuelos»); en móvil queda bajo la primera pantalla (N3-08).
- **H2 (cómo entran mis vuelos):** me sigue estorbando; la landing dice que lo hace el operador, pero no quién sube qué.
- **H3 (precio):** indiferente por ahora; es «por definir».
- **H4 (de quién son los datos):** me sigue estorbando; son mis facturas y mi tierra.
- **H5 (qué sería un piloto):** indiferente hasta decidir.
- **H6 (primer minuto):** resuelto en lo esencial (cae en Evolución); falta ofrecer «suertes» (N3-04) y en móvil la gráfica (N3-05).
- **H7 (real vs ejemplo):** razonablemente cubierto con «Ejemplo, no real» y «Datos de ejemplo»; los conteos de medidas descartadas son el hueco que queda (N3-01).
- **H8 (una historia con números):** ya la cuenta el hero y Pagos.
- **H9 (qué se aprende de quien entra):** indiferente; la tarjeta de invitación se puede cerrar (N3-11).

## 8. Qué le preguntaría a un cañicultor real

1. «Cuénteme de la última vez que una suerte le salió peor de lo esperado: ¿cómo se dio cuenta, cuánto tiempo pasó desde el corte y quién fue a mirar?»
2. «Cuando le entregan un informe del vuelo, ¿a quién se lo reenvía y esa persona firma o aprueba algo? ¿Con qué nombre le dice a esa persona?»
3. «Dígame de un hallazgo que alguien le dijo que corrigiera y usted decidió que no hacía falta: ¿qué le dijo al administrador y dónde quedó anotado?»

## 9. Límites

- Soy una simulación; nada de esto sustituye una prueba con cañicultores.
- No vi: «Verificar un archivo descargado» ni «Informes y actas firmados» de Documentos; no firmé el informe (solo abrí el diálogo); Servicios, Equipos, Mapa en móvil con interacción, los otros sectores, teclado, lector de pantalla ni movimiento reducido.
- El clic de mouse real sobre el selector de sector de la landing no entró en mi primer intento (el avión cruzaba el selector y la página estaba haciendo scroll suave); entré con un `click()` de JS sobre la opción y el enlace. No lo marco como error del producto porque no pude aislar la causa.
- En la demo de móvil navegué por URL (el estado en memoria se reinicia) y con el preset de caña ya activo desde el escritorio; el preset persiste en el navegador.
- «Descartar con motivo» lo hice sobre un solo hallazgo (Cobertura irregular, Lote 3) y lo probé una sola vez; los conteos antes y después son de ese caso.
- Tamaños, colores y la «gráfica sin rotular» (N2-04, parte de la línea de Lote 4) no los volví a medir.
