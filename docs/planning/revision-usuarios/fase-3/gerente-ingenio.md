# Tercera pasada desde el rol: jefe de operación de un ingenio (gerente)

Estado: hipótesis de una persona simulada, no resultados de usuarios reales. Pasada hecha el 31 de octubre de 2026 sobre `http://localhost:3443` (rama `revision-fase-3`; Chromium propio con CDP 9443, escritorio 1440 × 900 y móvil 390 × 844). Todas las cifras son de la demo (datos sintéticos). Comparo con `../gerente-ingenio.md` (G-01..G-14) y `../fase-2/gerente-ingenio.md` (G2-01..G2-07). Evidencia: «navegador» = lo ejecuté y lo vi; «lectura de código» = cito la causa en el código.

## 1. Persona y tareas

Jefe de operación (gerente de campo) de un ingenio que contrata operadores de dron para varios cañicultores. Numérico, impaciente con cifras que no cuadran, desconfía de lo muy redondo. Usé «Ver como» → Gestor · Ingenio Dulce Valle y, para cerrar los pasos del otro lado, Operador · Drones del Pacífico.

Tareas de esta pasada (las cinco de siempre más lo nuevo): (1) decidir a qué zona va el próximo vuelo; (2) pedir, comparar, asignar y verificar un servicio; (3) pagado frente a cubierto por operador; (4) informe para la junta; (5) leer lo firmado (Vuelos › Informe, «Informes y actas firmados», «Verificar un archivo descargado»); (6) Servicios, Pagos e Informes en móvil; (7) la mina completa.

## 2. Prueba de 5 segundos (escrita antes de leer el resto de la landing)

Vi solo la primera pantalla, en escritorio y en móvil: titular, párrafo, el recuadro «Otear no hace los vuelos», el panel «Así se ve antes de pagar» (27,9 pedidas, 26,4 declaradas, 27,9 facturadas, «Facturó 1,5 ha más de las cubiertas (+5,7 %)», «Cifras de ejemplo»), dos botones y las franjas.

- **¿Qué cree que hace Otear?** Junta los vuelos que contrato y, antes de pagarle al operador, me enseña si me cobran más hectáreas de las que él dijo haber volado. El panel lo dice mejor que el titular; con el panel ya no necesito leer «contraste lo pedido, lo declarado y lo facturado».
- **¿Para quién es?** Para quien contrata y paga vuelos, como yo. El titular sigue hablando de «su operación» en general, pero el panel me ubica de inmediato.
- **¿Qué haría ahora?** «Abrir la demo» y buscar esa pantalla de Pagos. En móvil el panel queda bajo el titular y el botón del encabezado «Abrir la demo» sigue a la vista: bien.

Sobre «Quién está detrás»: dice «Un proyecto en validación: todavía no tiene clientes ni una prueba con sus vuelos. Escriba a hola@otear.app». Es honesto y me gusta que no invente clientes; sigue sin darme un nombre al que yo pueda pedirle cuentas (hueco del dueño, no hallazgo).

## 3. Primer minuto en la demo

Elegí «Finca o cultivo» → «Abrir la demo de una finca» y caí en «Evolución del cultivo» con el aviso de bienvenida; ya se sabe que es la pantalla del diferencial. El pie «Datos de ejemplo · escenario del 25 oct. 2026» y «Hoy en la demostración es 25 de oct» ya cuadran con el resto. La tarjeta «¿Esto, con sus datos?» vuelve a aparecer mientras trabajo; la cerré con «Ahora no» y no estorbó más.

## 4. Estado de los hallazgos de la pasada anterior

| ID | Estado | Una línea de por qué |
|---|---|---|
| G-01 Último paso del servicio no se podía completar | **Resuelto** | Verifiqué y facturé «Mapeo de la última zona» y también un servicio sin vuelo (navegador). |
| G-02 «Pagado vs cubierto por operador» ilegible | **Mejorado** | Tabla «Operadores» con una base por fila y la diferencia en rojo; siguen dos «por ha» distintos ($ 36.039 de Costos y $ 29.436 de Operadores), el primero rotulado «No es la tarifa de Servicios» (navegador). |
| G-03 Informe para la junta no recoge lo decidido | **Mejorado** | Recoge pedido, cotizaciones, elegida y motivo, entrega, verificación y factura; sigue sin recoger lo que se firmó (G3-04) y es de un solo sitio (navegador). |
| G-04 La decisión del asistente no pasa a Servicios | **Mejorado** | Sin cambio desde la pasada 2: propone sumar el Lote 4 al vuelo del 29 de oct y dice «esta demo no lleva la propuesta hasta allá». Sigo escribiendo la solicitud a mano (navegador). |
| G-05 Servicios no deja claro quién hace qué ni quién paga | **Mejorado** | «Paga: por definir» y «¿Qué hace cada papel?»; Configuración › Nombres sigue definiendo Gestor como quien «paga el servicio» (navegador). |
| G-06 «Se cubrió de verdad» promete de más | **Resuelto** | Hero y panel dicen «lo que el operador dice haber cubierto» y «Otear no las mide con las imágenes» (navegador). |
| G-07 Asignar sin confirmar; «No puede» sin precio | **Resuelto** | Sin cambio; confirmación con total y motivo (navegador, pasada 2; no lo repetí). |
| G-08 Cifras que no cuadran al dividir a mano | **Mejorado** | Siguen 21,1 ha × $ 51.500 ≠ $ 1.089.041 (el área real tiene decimales que la pantalla redondea) y 26,4 / 27,9 = 94,6 % frente a «94,7 %»; el resto cuadra (navegador). |
| G-09 El asistente no deja comparar zonas con números | **Resuelto** | Tabla «Puntos por zona» con «Lo que más pesó» y «Estado» (navegador). |
| G-10 No se ve un ingenio con muchos cañicultores | **Igual** | Una sola hacienda con tres lotes; el informe lo dice («saque uno por cada uno») pero la escala no se puede juzgar. |
| G-11 Vocabulario por empresa a medias; «Aplicador» | **Igual** | Con la plantilla de caña el menú dice «Mapa y suertes», pero Servicios sigue con «Aplicador», «Aplicadores invitados» y los textos dicen «los suertes dibujados», «Color del suerte» (navegador). |
| G-12 «Licencia» habla al vendedor; sin precio ni piloto | **Resuelto** | «Por definir» en la landing y en Licencia. |
| G-13 La landing no cuenta un caso con números | **Resuelto** | Además ahora está en el primer pantallazo (panel «Así se ve antes de pagar»). |
| G-14 Detalles de texto y avisos | **Mejorado** | Arreglados: «Solicitud enviada…», «Haz clic para añadir…», «Buscar en tus vuelos». Siguen «Arrastra para girar», fechas ISO dentro del informe a firmar y «1 esperan una acción suya» (ver G3-11). |
| G2-01 El informe deja fuera la decisión más reciente | **Resuelto** | «Periodo: 18 de jul de 2026 a 25 de oct de 2026»: ya incluye «Vigor del cultivo» (pedido el 23 de oct) y la factura recién creada (navegador). |
| G2-02 Totales y hectáreas no cuadran con un servicio sin vuelo | **Mejorado** | Hectáreas por operador ya cuadran (7,1 / 6,5 / 6,5 ha para Drones del Pacífico tras ajustar y facturar sin vuelo) y la factura entra en «Pendientes y alertas»; el conteo de facturas de Costos sigue fallando (G3-06) (navegador). |
| G2-03 «Cotizar» precarga el precio de otro operador | **Resuelto** | Como AeroVisión, «Cambiar mi cotización» trae mi precio ($ 51.500), no el del otro, y el formulario avisa de errores de digitación. Queda un detalle propio (G3-10) (navegador). |
| G2-04 Dos «hoy»: 25 y 30 de oct | **Mejorado** | Pantallas, informe y Servicios dicen 25 de oct. Queda la hora de las firmas, que sale del reloj del computador (31/10/2026) (G3-09) (navegador). |
| G2-05 El aviso no se cierra y tapa botones | **Resuelto** | El aviso se cierra solo a los 10 s (`app-shell.tsx:45,80`); «Solicitud enviada…» ya no existe (lectura de código y navegador). |
| G2-06 Nota vieja tras ajustar; «Coincide» en verde con 87,5 % | **Igual** | Pagos: «Verificación del área: Coincide» y, en tono normal, «Se cubrió el 87,5 % de lo pedido (5,9 de 6,7 ha)» (navegador). |
| G2-07 Fallos de redacción de plantillas | **Mejorado** | Arreglados: el verbo faltante y el punto decimal en la historia. Siguen el doble punto («lo cubierto..»), «los suertes», el número de factura al azar (`use-services.ts:205`) y el título sin «ha × precio» (navegador y lectura de código). |

Conteo: **resueltos 9** (G-01, G-06, G-07, G-09, G-12, G-13, G2-01, G2-03, G2-05), **mejorados 9** (G-02, G-03, G-04, G-05, G-08, G-14, G2-02, G2-04, G2-07), **iguales 3** (G-10, G-11, G2-06), **empeorados 0**.

## 5. Tareas: ¿pudo terminarlas?

| Tarea | Resultado | Por qué |
|---|---|---|
| 1. Decidir a qué zona va el próximo vuelo | **Sí** | «Lote 4 pide un vuelo pronto», «Puntos por zona» (70, 40, 30) y la línea de sumar el Lote 4 al vuelo del 29 de oct. Sigo sin poder pasar la propuesta a Servicios (G-04). |
| 2. Pedir, comparar, asignar y verificar | **Sí** | Verifiqué «Mapeo de la última zona» (muestra «5,9 ha de 6,7 ha (88 %) … $ 362.850»), el operador facturó y quedó FV-2026-232 en Pagos. En móvil la tabla de cotizaciones no deja ver «Asignar» (G3-02). |
| 3. Pagado frente a cubierto por operador | **Sí** | Informes › Costos › Operadores: «6,7 / 5,9 / 5,9 ha». Con un servicio sin vuelo el conteo de facturas es incoherente (G3-06). |
| 4. Informe para la junta | **Sí, con reparos** | Ya trae el periodo completo y las decisiones; no dice qué se firmó (G3-04). |
| 5. Leer lo firmado | **Con ayuda** | Firmé como Operador y como Revisor con personas distintas; probé que la misma cédula es rechazada; verifiqué un .txt; abrí el informe desde Documentos. Pegar lo que se ve en «Documento» no sirve y el mensaje no lo explica (G3-03). |
| 6. Servicios, Pagos e Informes en móvil | **Con ayuda** | Pagos funciona bien; Servicios e Informes cortan tablas y obligan a recorrer mucho (G3-02, G3-08). |
| 7. La mina completa | **Con ayuda** | El vocabulario llega, pero la evidencia es un cultivo y no hay ni un volumen (G3-01, G3-05, G3-07). |

## 6. Hallazgos nuevos

### G3-01 En minería, la evidencia es una foto aérea de cultivos
- Eje: caso-de-uso
- Dónde: `/vuelos?tab=evidencias` con sitio Minería; `src/features/demo/demo-data.ts:254` (`imageUrl: "/images/aerial-road.jpg"` en `mina-mulalo`; la misma imagen en `obra-alameda`, línea 180, y `parque-del-pacifico`, línea 214). El archivo `public/images/aerial-road.jpg` es un campo cultivado con un camino.
- Lo que ve la persona: «Archivo visual · 6 vistas ilustrativas». Seis tarjetas con la misma imagen de parcelas verdes y amarillas, tituladas «Banco norte · Grieta en la cresta del talud», «Banco central · Agua empozada en el banco», «Banco sur · Seguimiento de la rampa». Arriba, el aviso «Estas imágenes ilustran el recorrido. No son fotografías georreferenciadas del sitio». En la novedad, el alt dice «Imagen ilustrativa… no es evidencia del sitio».
- Qué entiende o hace mal: el aviso me protege de creerla real, pero la imagen me habla de un cultivo. Si fuera jefe de una mina, lo primero que pensaría es que el producto es de agricultura y el resto es maquillaje. La decisión del dueño fue cambiar a la ilustración vial solo en carreteras; minería (y construcción y vigilancia) quedó con el campo.
- Por qué importa para su tarea: la tarea de esta pasada es ver si la mina «habla de minería». La evidencia es lo que se mira primero en una novedad de talud.
- Propuesta: una ilustración propia de banco y talud (como la vial, con el mismo aviso «ilustración, no es del sitio»), o, mientras no exista, que la tarjeta muestre un recuadro neutro con el texto «Aquí iría la foto del operador. En esta demo no hay fotos de la mina» en lugar de un cultivo. Lo mismo para obra y parque.
- Gravedad: confunde
- Evidencia: navegador (Minería › Vuelos › Evidencias y Novedades de talud) y lectura de código.
- Huecos relacionados: H7

### G3-02 En móvil, las tablas de cotizaciones y de operadores se cortan y el botón «Asignar» queda fuera de pantalla
- Eje: componente
- Dónde: `/servicios` y `/informes` (pestaña Costos) a 390 px; `src/features/services/request-detail.tsx:422-423` y `services.module.css` (`.tableWrap { overflow-x: auto }`, `.quotes th { white-space: nowrap }`); tabla «Operadores» en `reports-view.tsx`.
- Lo que ve la persona: en «Vigor del cultivo» la tabla muestra «Operador · Precio / ha · Total estimado · Desde» y se corta en «Desde» (3 de nov de 2026 partido en cuatro líneas). «Estado» y «Acción» quedan a la derecha: el botón «Asignar» está entre 410 y 482 px, con la pantalla en 390 px. La única pista es una barra gris delgada debajo. En Costos › Operadores, la columna «Hectáreas pedidas / cubiertas / facturadas» sale cortada («111,8 / 109,4 / 111,7» a medias) con la línea roja «1 factura con más área de la cubierta» también a medias.
- Qué entiende o hace mal: leo las cotizaciones pero no veo cómo asignar; deslizar la tabla no es evidente, y en Informes pierdo justo la columna que contesta mi tarea 3.
- Por qué importa para su tarea: decidir y asignar desde el celular en el campo es plausible para un gerente; la acción que cierra la decisión está oculta y la cifra de pagado frente a cubierto también.
- Propuesta: en móvil, que cada cotización sea una tarjeta (operador, precio por ha, total, desde, estado, «Asignar» debajo), y que «Operadores» se apile por operador con las tres cifras en líneas rotuladas. Si se mantiene la tabla, una sombra o flecha en el borde derecho que diga que hay más.
- Gravedad: confunde (en móvil casi bloquea «Asignar»)
- Evidencia: navegador (390 × 844: `Asignar` con `left: 410 px`; Operadores cortado) y lectura de código.
- Huecos relacionados: H7

### G3-03 «Verificar un archivo descargado» no acepta lo que se ve en pantalla, y el mensaje de error no distingue por qué
- Eje: componente (y texto)
- Dónde: Vuelos › Informe del vuelo › «Firmar el informe del vuelo» (y Documentos › Informes y actas firmados); `src/features/traceability/evidence-dialog.tsx:723-773` y `document-export.ts:80-110` (`bodyFromDownload` exige título, línea «Estado:» y «Huella SHA-256 del contenido actual:»).
- Lo que ve la persona: el diálogo dice «La huella es un código calculado con el texto de este informe» y muestra el texto en «Documento». Más abajo: «Pegue el texto del .txt que descargó de este documento (o cárguelo, o escriba la huella de 64 caracteres)». Copié el texto de «Documento» (4094 caracteres) y pulsé «Comprobar»: «No se pudo leer. Pegue el texto completo del archivo .txt que descargó…». Con el .txt real (descargado con «Descargar .txt») sí dijo «Coincide. El texto del archivo es exactamente el de la huella guardada (90212cabf100d8ac…)»; cambiando «26,4 de 27,9» por «26,5 de 27,9» respondió «No coincide… alguien lo cambió después de descargarlo». Una huella corta («abc123») da el mismo «No se pudo leer».
- Qué entiende o hace mal: pensé que pegar lo que veo bastaba (la propia pantalla lo sugiere) y concluí que la herramienta no sirve. Tampoco puedo copiar los 64 caracteres: en pantalla solo se ven 16 («Huella 90212cabf100d8ac…»); el valor completo está en un tooltip (`title`) que no se ve con el dedo ni con el teclado.
- Por qué importa para su tarea: la función promete «un documento que no se cambia sin dejar rastro». Para comprobarlo yo, como gerente que recibe el .txt por correo, el paso tiene que ser obvio y el resultado creíble: «Coincide» y «No coincide» están bien redactados; el camino hasta ahí no.
- Propuesta: (a) aceptar también el texto del recuadro «Documento»; (b) que el mensaje diga qué falta («Parece el texto del informe pero no el archivo: use «Descargar .txt», que trae la huella al final» o «La huella debe tener 64 caracteres; tiene 6»); (c) mostrar la huella completa en una línea que se pueda copiar, con botón «Copiar huella».
- Gravedad: confunde
- Evidencia: navegador (tres pruebas: texto de pantalla → no se pudo leer; .txt → Coincide; .txt con una cifra cambiada → No coincide) y lectura de código.
- Huecos relacionados: H7

### G3-04 Lo firmado no llega al informe de la junta, y la lista de firmados no dice quién firmó
- Eje: componente
- Dónde: Documentos › «Informes y actas firmados» (`src/features/compliance/signed-records.tsx:45`) e Informes › Informe (`reports/decisions.ts`, bloque de «Pendientes y alertas»).
- Lo que ve la persona: tras firmar el informe del vuelo como Operador (Camilo Torres) y Revisor (Laura Mejía), Documentos lista «Informe del vuelo · Inspección de labores · 24 de oct de 2026 · Huella 90212cabf100d8ac… · Firmado» y, debajo, «Acta de entrega… Faltan firmas». No dice quién firmó ni cuándo. En el informe consolidado la única mención es «El acta de entrega del 2026-10-24 espera la firma de: Cliente o responsable»; del informe firmado, nada. «Informes y actas firmados» incluye una fila «Faltan firmas».
- Qué entiende o hace mal: para la junta quiero llevar «el informe del 24 de oct quedó firmado por A y B» y no existe esa línea; tendría que abrir el diálogo y copiar el historial.
- Por qué importa para su tarea: la tarea 4 (informe para la junta) y la 5 (leer lo firmado) se tocan aquí.
- Propuesta: en cada fila: «Firmó Camilo Torres (Operador) y Laura Mejía (Revisor) · 31 de oct» o «Falta: Cliente o responsable»; en el consolidado, una línea por documento («Informe del vuelo del 24 de oct: firmado por 2 de 2 · Acta de entrega: falta Cliente o responsable»). Y llamar a la sección «Informes y actas» (no «firmados») mientras incluya los pendientes.
- Gravedad: confunde
- Evidencia: navegador (Documentos y Informes tras firmar)
- Huecos relacionados: H7, H8

### G3-05 En minería no hay un solo volumen, aunque el vuelo y la cotización lo prometen
- Eje: caso-de-uso
- Dónde: Minería › Vuelos (objetivo) y Servicios (cotización); `demo-data.ts:616` («Medir el avance de cada banco, el volumen removido y el estado de los taludes») y `:1938` («Modelo de superficie y volumen removido por banco»). Evolución: «Avance de la excavación».
- Lo que ve la persona: el objetivo del vuelo y la nota de AeroVisión prometen «volumen removido por banco». Evolución solo muestra porcentajes («44 % de la excavación planeada», «Banco norte +52 puntos») y la gráfica «Avance medio / Lo previsto» con previsto solo en el 1 de jun (0 %) y el 31 de mar de 2027 (100 %). Ningún m³, ninguna tonelada, ninguna frase del tipo «va X puntos por debajo del plan para hoy». Pagos y Servicios cobran la mina «por ha» como el cultivo (46 ha × $ 28.500).
- Qué entiende o hace mal: pensaría que Otear mide una mina como un lote: por área y por porcentaje. Quien dirige una mina pregunta cuántos metros cúbicos salieron frente a lo planeado y por qué banco.
- Por qué importa para su tarea: sin un volumen, el caso de minería no responde la pregunta de su sector y la comparación «pedido / cubierto / facturado» por hectárea no es la que a una mina le interesa.
- Propuesta: en Evolución y en el informe del vuelo, una línea de ejemplo por banco («Banco norte: 18.400 m³ removidos de 22.000 m³ previstos; de ejemplo»), marcada como inventada, y una frase de plan frente a hoy. Si el dueño no quiere números inventados de volumen, que los textos no prometan «volumen removido» (cambiar la nota de la cotización y el objetivo del vuelo).
- Gravedad: confunde
- Evidencia: navegador (Minería › Evolución, Vuelos, Servicios, Pagos; búsqueda de «m³», «volumen» y «toneladas» sin resultados fuera de esas dos frases) y lectura de código.
- Huecos relacionados: H8

### G3-06 «6 facturas de 5 vuelos» con siete facturas, cuando una es de un servicio sin vuelo
- Eje: caso-de-uso
- Dónde: Informes › Costos y el informe consolidado (COSTOS); `src/features/reports/reports-view.tsx:571-579` (`basis.invoices` y `basis.flights`).
- Lo que ve la persona: tras aceptar el ajuste de «Seguimiento del Lote 4» (6,5 ha) y facturar sin vuelo (FV-2026-303, $ 195.000), Costos dice «Facturado · pagado $ 4.103.000 · $ 3.451.000», «Costo por vuelo $ 683.833» y «6 facturas de 5 vuelos, divididas por el área de esos vuelos». Hay siete facturas ($ 3.908.000 + $ 195.000 = $ 4.103.000) y seis vuelos completados; $ 4.103.000 / 6 = $ 683.833. La propia tabla «Operadores» de esa pantalla suma «6 facturas» de AeroVisión y «1 factura» de Drones del Pacífico. El informe consolidado repite «6 facturas de 5 vuelos».
- Qué entiende o hace mal: el total incluye la factura sin vuelo y el texto la deja fuera; la división usa seis vuelos y el rótulo dice cinco. Con una factura sin vuelo (que el propio flujo de disputa produce) vuelve a ser un número que no puedo repetir en la junta. En la prueba con vuelo asociado («7 facturas de 6 vuelos») sí cuadraba.
- Por qué importa para su tarea: la tarea 3 (pagado frente a cubierto) y la 4.
- Propuesta: que el rótulo diga la verdad: «7 facturas (una sin vuelo) y 6 vuelos»; o que el costo por vuelo se calcule solo con las facturas que tienen vuelo y lo diga.
- Gravedad: confunde
- Evidencia: navegador (Informes › Costos y consolidado tras el flujo de disputa) y lectura de código.
- Huecos relacionados: H7, H8

### G3-07 Minería: el vocabulario no concuerda en género y se cuelan «predio» y «hallazgos»
- Eje: texto
- Dónde: `src/features/flights/review/flight-review-view.tsx:101,392`, `src/features/flights/example-notice.tsx:19` (artículo «los» pegado al término de la empresa); checklist `preparation-items.ts` («permiso del predio»); «Antes de pagar» en `/pagos`.
- Lo que ve la persona: en la primera pantalla de Vuelos de la mina: «Revise la entrega, confirme los novedades de talud y prepare el siguiente paso». En la pestaña, «Revise los novedades de talud del operador…». En el aviso «los bancos dibujados son inventados» está bien («bancos» es masculino), pero en el resumen de Vuelos «Datos de ejemplo. La ruta, la ejecución y los novedades de talud son inventados». En Pagos › Antes de pagar: «Los hallazgos del vuelo están revisados». En Programación y Documentos: «Confirmar permiso del predio» y «permiso del predio: sin documento». Configuración advierte: «Los términos van sin artículo («Nuevo» y «Nueva» no cambian según el género)» y en la plantilla de caña pasa lo mismo («los suertes», «Color del suerte»).
- Qué entiende o hace mal: entiendo todo, pero un superintendente de mina lee «los novedades» y piensa que el texto es de plantilla. «Predio» en una mina, y «hallazgos» en la lista de pago, son restos del sector principal.
- Por qué importa para su tarea: la landing promete «lenguaje de su sector, no de software».
- Propuesta: guardar el género y el artículo junto con cada término («las novedades de talud», «los suertes») o reescribir las frases sin artículo («Confirme cuáles de las novedades de talud…», «…confirmar lo que marcó el operador»); en minería, «permiso del predio» → «autorización de la operación o del titular»; en «Antes de pagar», usar la palabra de la empresa.
- Gravedad: menor
- Evidencia: navegador (Minería: Vuelos, Pagos, Programación, Documentos; caña de azúcar en Servicios y Mapa) y lectura de código.
- Huecos relacionados: H7

### G3-08 En móvil, Informes obliga a recorrer casi dos pantallas de historial antes de llegar a Costos e Informe
- Eje: componente
- Dónde: `/informes` a 390 px; las pestañas «Pendientes · Evolución · Costos · Informe» empiezan a 1485 px de una página de 3091 px.
- Lo que ve la persona: tras el título, el «Historial» de seis vuelos (24 oct, 24 oct, 10 oct, 19 sept, 22 ago, 18 jul) ocupa dos pantallas; solo después aparecen el vuelo seleccionado, «Qué requiere atención» y las pestañas. El informe consolidado, con sus casillas «Incluir» y un recuadro propio con su barra de desplazamiento, queda más abajo.
- Qué entiende o hace mal: no sé que hay «Costos» ni «Informe» hasta que me desplazo mucho. Pagos, en cambio, hace bien: al tocar una factura, la pantalla baja sola al detalle (probado con FV-2026-021, `scrollY` 0 → 1350).
- Por qué importa para su tarea: mi tarea 4 en móvil empieza con un dedo cansado.
- Propuesta: en móvil, poner las pestañas arriba (o un enlace «Ir a Costos e Informe»), y que el historial se muestre colapsado a los dos vuelos más recientes con «Ver todos».
- Gravedad: menor
- Evidencia: navegador (390 × 844)
- Huecos relacionados: H6

### G3-09 La hora de las firmas es la del computador (31 de octubre) y el historial anota otra persona
- Eje: caso-de-uso
- Dónde: `src/features/traceability/evidence-dialog.tsx:181,207,263` (`new Date().toISOString()`); `integrity.ts:242`.
- Lo que ve la persona: la demo dice en todas partes «Hoy en la demostración es 25 de oct de 2026», pero el historial del informe firmado dice «31/10/2026, 8:51 a. m. Firmó Camilo Torres… (Operador)» y «31/10/2026, 8:52 a. m. Firmó Laura Mejía… (Revisor o interventor)», ambas «Perfil de la demostración: Luis Rojas · Administrador · ejemplo». El rechazo por la misma cédula dice «El documento 1.113.000.111 ya firmó como Operador», y en un diálogo que habla todo el tiempo de «documento» (el informe) «documento» es la cédula.
- Qué entiende o hace mal: el diálogo explica que la hora es la del dispositivo y que la demo no verifica identidad (decisión ya tomada), así que no lo cuento como error de fondo. Lo que choca es tener dos fechas de hoy otra vez (G2-04): 25 en los plazos, 31 en las firmas; y leer «documento» para la cédula.
- Por qué importa para su tarea: si imprimo el informe firmado para la junta, la fecha de las firmas queda posterior al «escenario del 25 de oct».
- Propuesta: que la demo ponga a las firmas la fecha de «hoy en la demo» más la hora real, o que diga en el historial «hora del computador». Y cambiar el rechazo a «La cédula o NIT 1.113.000.111 ya firmó como Operador (Camilo Torres)».
- Gravedad: menor
- Evidencia: navegador y lectura de código
- Huecos relacionados: H7

### G3-10 «Cambiar mi cotización» vuelve a poner la fecha de inicio y borra las condiciones
- Eje: componente
- Dónde: `src/features/services/action-form.tsx:227-231` (`defaultValue={request.windowStart}`) y `:236-241` (la nota queda vacía); `workflow.ts:103`.
- Lo que ve la persona: como AeroVisión, en «Vigor del cultivo» ya cotizé $ 51.500 «desde el 3 de nov» con la nota «Cámara multiespectral y mapa de vigor por lote». «Cambiar mi cotización» abre el formulario con el precio correcto (51500), pero «Puedo volar desde» en 2026-11-02 (el inicio de la ventana) y «Condiciones» vacío.
- Qué entiende o hace mal: si cambio solo el precio sin mirar, mi cotización queda con otra fecha y sin condiciones.
- Por qué importa para su tarea: la «Lectura de las cotizaciones» compara por fecha de inicio y por lo que la nota no dice («empieza 3 días antes»); un cambio de precio podría mover esa ventaja sin que el operador lo note, y yo compararía otra cosa.
- Propuesta: precargar fecha y nota de la cotización propia (`quote.operatorId === actor.id`), como ya se hace con el precio.
- Gravedad: menor
- Evidencia: navegador (formulario: `price=51500, startDate=2026-11-02, note=''`) y lectura de código.
- Huecos relacionados: H4

### G3-11 Restos de texto dentro de lo que se firma y se copia a la junta
- Eje: texto
- Dónde: informe del vuelo firmable (`traceability/templates.ts`), informe consolidado (`reports/decisions.ts`), `drone-preview.tsx:46`, Servicios.
- Lo que ve la persona: el documento a firmar abre con «Fecha: 2026-10-24 · 08:30» y el consolidado dice «El acta de entrega del 2026-10-24 espera la firma de…». «Pido facturar solo lo cubierto..» (doble punto) sigue en «Verificación». «1 esperan una acción suya» (como operador). «1 de 1 facturas traen área». «Arrastra para girar» (tuteo) en Programación. En Evolución: «Medidas del sitio: 4 medidas: 1 abierta, 2 en corrección, 1 cerrada · 1 vencida · 8 sin responsable» sin decir sin responsable «de qué» (en Informes sí: «entre los que usted confirmó»). Las facturas creadas desde Servicios llevan un número al azar (FV-2026-232, FV-2026-303).
- Qué entiende o hace mal: lo entiendo todo, pero son frases que iría a copiar a la junta o a firmar.
- Por qué importa para su tarea: están dentro de documentos «con huella»; corregirlos después cambia la huella y anula la firma.
- Propuesta: fechas en palabras («24 de oct de 2026») en documento e informe; quitar el punto final duplicado cuando el texto del usuario ya lo trae; concordar «1 espera / 2 esperan» y «1 de 1 factura trae»; «Arrastre para girar»; «8 hallazgos confirmados sin responsable» en Evolución; numerar las facturas de ejemplo en secuencia.
- Gravedad: menor
- Evidencia: navegador y lectura de código (número de factura).
- Huecos relacionados: H7

## 7. Lo que funciona y hay que conservar

1. **El panel «Así se ve antes de pagar»** en la primera pantalla (escritorio y móvil): tres cifras, una frase («Facturó 1,5 ha más de las cubiertas (+5,7 %)»), «Cifras de ejemplo» y «Otear no las mide con las imágenes». Me dice qué hace el producto sin leer más.
2. **Verificar un archivo descargado**, ya con el .txt correcto: «Coincide… no prueba quién lo firmó ni cuándo» y «No coincide… alguien lo cambió después de descargarlo». Y que la misma cédula no pueda firmar dos papeles, con el motivo a la vista.
3. **Lo que ya está pensado para la mina**: «Banco norte / central / sur», «Arranque y cargue», «Perforación y voladura», «Rampa de acceso y acopio», responsables como «Superintendente de mina» y «Jefe de geotecnia», «Titular del contrato de concesión» como propietario y «Avance de la excavación» como pantalla de evolución. Se nota que alguien pensó la mina.
4. **El flujo de disputa de punta a punta** (aceptar el ajuste, verificar de nuevo, facturar sin vuelo con la advertencia «Este servicio no tiene un vuelo asociado») y que las hectáreas por operador ya coincidan.
5. **Pagos en móvil**: al tocar una factura la pantalla baja sola al detalle (FV-2026-021: de 0 a 1350 px) y la lista de facturas no se sale de los 390 px.
6. **«Lectura de las cotizaciones»** y que el informe consolidado ahora sí llegue hasta el 25 de oct e incluya lo que decidí con mi motivo.

## 8. Huecos H1–H9 desde este rol

- **H1 (qué es Otear):** ya no me estorba: el recuadro «Otear no hace los vuelos» y el panel lo aclaran en el primer pantallazo.
- **H2 (cómo entran los vuelos):** me estorba poco: la landing dice «el operador los entrega en Servicios y quien contrata los verifica; la carga real de archivos está por construir».
- **H3 (precio):** sigue «por definir»; para una junta es lo primero que preguntan, pero la redacción es honesta.
- **H4 (datos y salida):** me estorba menos: las pantallas dicen «De quién son las facturas y los pagos… está por definir».
- **H5 (piloto):** me estorba: sigue siendo «lo estamos definiendo»; para un ingenio, el piloto es la forma de entrar.
- **H6 (primer minuto):** me sirvió: caí en la pantalla del diferencial con vocabulario propio.
- **H7 (real vs simulado):** me estorba en cuatro puntos concretos: la foto de cultivo como evidencia de una mina (G3-01), la hora del computador en las firmas (G3-09), las cifras de Costos con una factura sin vuelo (G3-06) y «Coincide» en verde con 87,5 % (G2-06).
- **H8 (historia con números):** el panel de la landing es justo eso; la parte que falla es el volumen de minería (G3-05) y el conteo de facturas (G3-06).
- **H9 (qué se mide de quien entra):** me es indiferente (solo hay medición con token y lo dice).

## 9. Qué le preguntaría a una persona real como ella

1. La última vez que le llegó una factura de un operador de dron, ¿qué hizo, paso por paso, antes de pagarla, y con qué papel o archivo comparó las hectáreas?
2. ¿Cuándo fue la última vez que un operador y usted discreparon por hectáreas o por lo entregado, y cómo lo resolvieron (por escrito, por llamada, quién tuvo la última palabra)?
3. Cuando una junta o su jefe le pidió «lo firmado» de un vuelo o de una entrega, ¿qué documento le mostró y quién había firmado?

## 10. Límites

- Persona simulada: son hipótesis, sin porcentajes ni citas de usuarios. Estas son cosas que yo, como esta persona, entendería o no entendería.
- Probé agricultura (con y sin la plantilla de caña) y minería en escritorio, y Servicios, Pagos e Informes en móvil (390 × 844). No revisé Equipos, Mapa ni Evolución en móvil; no probé construcción ni vigilancia (aunque vi en el código que comparten la foto de cultivo con minería).
- No verifiqué la invalidación de una firma al editar el informe (cambiar las notas y reabrir el documento) ni la plantilla «Acta de entrega» firmada por el cliente.
- Para firmar usé nombres y cédulas inventados («Camilo Torres», «Laura Mejía», cédulas ficticias); el dibujo de la firma lo hice con el ratón. El estado de la demo es en memoria y las pruebas lo cambiaron (firmas, una factura, un ajuste); no se editó ningún archivo del proyecto salvo este informe.
- Los clics se hicieron con eventos reales de ratón por CDP. En móvil, además de las capturas, medí con `getBoundingClientRect` dónde quedaba «Asignar» (410–482 px en una pantalla de 390).
- Lo que marqué «lectura de código» (número de factura al azar, `new Date()` en las firmas, ruta de las imágenes) lo cité por su causa; lo visible lo vi en pantalla (el número de factura salió distinto, FV-2026-232 y FV-2026-303, en dos ejecuciones).
