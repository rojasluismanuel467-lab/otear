# Tercera pasada desde el rol: operador de dron profesional (BORRADOR)

Persona simulada, la misma de las fases 1 y 2 (2 aeronaves, certificado; teme que la plataforma lo vigile o le recorte el pago). Todo lo de abajo son hipótesis de «yo, como esta persona», no resultados de usuarios. Datos sintéticos.

Evidencia: «navegador» = Chromium propio (CDP, puerto 9444) sobre `http://localhost:3444`, rama `revision-fase-3` (commit `f1b2d0e`), en 1440 × 900 y en 390 × 844. «Lectura de código» = leí el archivo y no lo vi ejecutarse.

## Estado de los hallazgos de la pasada anterior

| ID | Fase 2 | Ahora | Una línea de por qué |
|---|---|---|---|
| O-01 Lo que «me aprueban» | Mejorado | **Mejorado** | La cifra en pesos antes de aceptar sigue («18,5 ha son $ 555.000») y la tolerancia ya habla con una sola voz: «Referencia de la demo: 5 %; se pacta con el operador (por definir)» en Servicios, Pagos, el formulario de factura y la landing. El cliente sigue sin poder proponer una cifra: solo acepta o pide ajuste con texto libre. |
| O-02 Pedido sin zona exacta | Mejorado | **Mejorado** (sin cambio) | Hectáreas por lote y área total; sigue sin polígono, KML, sensor, GSD ni quién abre el predio. |
| O-03 No puedo contestar una disputa | Resuelto | **Resuelto** | Probé «Aceptar el ajuste» con 6,4 ha: valor en pesos en vivo, el gestor verificó, facturé. |
| O-04 De quién son mis datos | Mejorado | **Mejorado** | Equipos, Pagos e Informes traen la línea «por definir» (solo con «Ver como» operador). Falta en Documentos y la flota sigue mostrando al piloto de mi competidor (O3-04). |
| O-05 Veo la cotización de mi competidor | Resuelto | **Resuelto** | «Se han recibido 2 cotizaciones, incluida la suya», «No fue seleccionada», «Asignado a: Otro operador». |
| O-06 «Entregar» es escribir nombres | Mejorado | **Mejorado** (sin cambio) | «En esta demo solo se anotan los nombres… está por definir». Sigue sin campo de enlace. |
| O-07 Lo que programo no mueve mi flota | Mejorado | **Mejorado** | «¿Con qué aeronave voló?» en la entrega; las horas suben en Equipos. Las baterías siguen sin pedirse y las horas salen del plan si dejo la duración en blanco (O3-06). |
| O-08 Me siento auditado | Igual | **Igual** | Pagos: «Facturas del operador», «Registrar pago»; Informes: «2 descartados» junto a mi nombre; abajo a la izquierda sigue «Luis Rojas · Administrador». La línea «por definir» habla de propiedad, no de tono. |
| O-09 Servicios y Pagos no cuadran | Resuelto | **Resuelto** | FV-2026-034 = $ 837.000 = 27,9 ha × $ 30.000 y Pagos lo dice. |
| O-10 Servicios me habla como comprador | Mejorado | **Resuelto** | «Su cotización está enviada. El cliente decide después de comparar las cotizaciones.»; ya no sale «Le toca a usted» cuando no me toca. |
| O-11 Facturo de más sin aviso | Mejorado | **Resuelto** | Aviso en vivo, campo «Nota para el cliente» y aviso si supero lo pedido. Queda un detalle de redondeo (O3-11). |
| O-12 La landing habla al comprador | Resuelto | **Resuelto** | Tarjeta «Usted sigue volando» y enlace «Abra la demo como operador» funcionan. |
| O-13 Lista y documentos: mucho formato | Mejorado | **Mejorado** (sin cambio) | Los ítems siguen en «Sin documento · Redactar o adjuntar»; el contador ya no los cuenta como falta. No lo abrí de nuevo a fondo. |
| O-14 Palabras sueltas | Igual | **Igual** | Queda «Arrastra para girar» (`drone-preview.tsx:46`), «1 vuelos» y el aviso «vencida (faltan 159 h · pasó por 0,5 meses)» sin cambio. |
| O2-01 El informe me lleva a otro vuelo | — | **Resuelto** | «Ver el informe y el acta del vuelo «Inspección de labores»» abre ese vuelo. |
| O2-02 «Explíquela» sin dónde | — | **Resuelto** | «Nota para el cliente» en el formulario y «Nota del operador» en Pagos. |
| O2-03 Informes me pone 0 ha | — | **Resuelto** | «7,1 / 6,4 / 6,4 ha» tras el ajuste y «Nota original, antes del ajuste». |
| O2-04 La tolerancia de tres maneras | — | **Resuelto** | Una sola redacción en las cuatro pantallas. |
| O2-05 Aeronave, baterías, «0 km» | — | **Mejorado** | Pregunta la aeronave; Informes aclara que la bitácora es opcional; baterías no. |
| O2-06 Formulario del otro rol abierto | — | **Resuelto** | Al cambiar «Ver como» el formulario se cierra. |
| O2-07 Aviso que dice quién ganó | — | **Resuelto** | `services-view.tsx:88-92` limpia el aviso al cambiar de papel (lectura de código). |
| O2-08 La disputa no tiene salida | — | **Igual** | El campo «Hectáreas que acepta» sigue vacío aunque el cliente escribió «0,6 ha menos»; sigue sin cierre (pregunta al dueño, ya anotada). |

Conteo: **resueltos 12**, **mejorados 7**, **iguales 3**, **empeorados 0**.

(Borrador: faltan prueba de 5 segundos, hallazgos y cierre.)
