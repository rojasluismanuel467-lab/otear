# Segunda pasada por rol: ingeniera interventora de una concesión vial

Son hipótesis de una persona simulada («yo, como esta persona, entendería X»), no resultados de usuarios reales. Prefijo de IDs nuevos: `I2-`. Fecha: 30 de octubre de 2026. Demo en `localhost:3210` (rama `revision-fase-2`, commit `f05d847`), Chromium sin interfaz propio (puerto CDP 9335), sector «Vía o carretera» elegido en el selector de la landing. Evidencia marcada «navegador» (lo vi y lo hice en pantalla) o «lectura de código».

## 1. Persona y tareas

Ingeniera interventora de una concesión vial, 38 años. Necesita saber quién firmó, cuándo, con qué evidencia y si algo cambió después. Las cinco tareas son las de la primera pasada: (1) recorrer la vía por tramos y hallar el de más novedades; (2) abrir una no conformidad, asignar responsable y plazo y llevarla hasta cerrarla; (3) comparar con el vuelo anterior; (4) generar y firmar el informe del vuelo y entender «firma inválida» y «huella»; (5) saber qué es real y qué es simulado. Nueva: (6) buscar vocabulario agrícola filtrado y ver si las fotos parecen una vía.

## 2. Prueba de 5 segundos (primera pantalla de la landing, antes de leer más)

- ¿Qué hace Otear? «La plataforma para comparar los vuelos de dron de su operación»; reúne los vuelos de mi vía y los compara con el anterior. Ahora además dice «Otear no hace los vuelos. Los hace su operador»: ya sé que no me venden vuelos. Es un cambio claro frente a la primera pasada.
- ¿Para quién? Para quien supervisa terreno; «vía» aparece en la lista (finca, vía, obra, predio o mina). Sigue sin decir «interventoría», pero ya no tengo que adivinar si es software o servicio.
- ¿Qué haría? Bajar al selector «¿Qué supervisa usted?» o pulsar «Abrir la demo». Las pastillas «Sin registro · Datos de ejemplo: nada es real · Los mapas necesitan internet · En validación: aún sin piloto» me dicen en seco los límites.

## 3. Primer minuto en la demo

Elegí «Vía o carretera» (el panel de la derecha mostró «Tramos / No conformidad / Informe» y «Tramo PK 12+400 · Drenaje obstruido») y pulsé «Abrir la demo de una vía». Ahora caigo en **Vuelos y evidencias**, con la última visita de la Troncal de Occidente ya abierta y el botón «Revisar 5 no conformidades (2 son sugerencias sin revisar)», no en el prevuelo del piloto. El aviso dice: «Empiece por “Vuelos y evidencias”: ahí están la última visita y lo que marcó cada vuelo». Es lo que pedí en I-11. Dudé en una sola cosa: el menú ya dice «Mapa y tramos», «Avance por tramos» y «Documentos del contrato», pero el texto de apoyo dice «los no conformidades» (ver I2-07).

Nota de método: el servidor de desarrollo compartido recarga la página sola cada minuto o dos (cada recarga borra lo hecho en la sesión, que es lo esperado en producción). Para poder probar el ciclo completo sin que se reinicie, bloqueé en mi navegador el canal de recarga en caliente del servidor de desarrollo; no toqué el proyecto.

## 4. Tareas: ¿pude terminarlas?

| # | Tarea | Resultado | Por qué |
|---|---|---|---|
| 1 | Tramo con más novedades | **Sí** | `/mapa`: cada tramo dice «PK 12+000 – 12+400 · Seguimiento de pavimento · 0,4 km · 6 no conformidades en 5 vuelos · Es donde más hay». Hay abscisa en tramos y en hallazgos («PK 12+140 · margen izquierda»). (navegador) |
| 2 | No conformidad → responsable → corrección → cierre | **Sí, con reparos** | Asigné responsable y plazo, cambié ambos (el historial dijo «el responsable pasó de … a … y el plazo pasó del 6 de nov … al 10 de nov …»), la pasé a «En corrección», intenté cerrar vacía y con «ok» (rechazó: «Para cerrar escriba qué se hizo y con qué evidencia se comprobó») y la cerré con nota. Vi medidas vencidas («Venció hace 14 días») y la lista con filtros Pendientes/Vencidas/En corrección/Cerradas/Todas. El historial quedó. Reparos: I2-01, I2-02, I2-03. (navegador) |
| 3 | Comparar con el vuelo anterior | **Con ayuda** | Evolución responde «avanzó … (+80 puntos)» y «1 nuevo, 0 ya no aparecen, 2 siguen abiertos». Es el avance de obra y un conteo de marcadores, no «mejoró/empeoró» de un deterioro. Ver I-09 e I2-05. (navegador) |
| 4 | Informe firmable | **Sí** | Abrí «Firmar el informe del vuelo», firmé como «Operador» y como «Revisor o interventor», cambié una nota, vi «Modificado tras firmar» y el historial con campo y antes → después; abrí el «Acta de entrega»; probé «Eliminar» (pide «Sí, eliminar / Cancelar»). Reparos: I2-01, I2-04, I2-06. (navegador) |
| 5 | Qué garantiza la huella y si me sirve ante una auditoría | **Sí lo entiendo; no me serviría todavía** | Entiendo qué es y qué no es. Ver sección 5. |
| 6 | Vocabulario agrícola y fotos | **Casi limpio; las fotos siguen igual** | Ver I-05 e I-02. |

## 5. ¿Entiendo la huella? ¿Me serviría ante una auditoría?

Entiendo qué garantiza y qué no, porque ahora lo dice en tres lugares:
- En el documento firmable: «La huella es un código calculado con el texto de este informe: si cambia una letra, el código cambia y las firmas anteriores quedan sin validez. No prueba quién escribió el nombre, la hora exacta ni que las cifras o las fotos del vuelo sean ciertas.» (navegador)
- Al final del documento: «Cubre este texto, no las fotografías ni los archivos entregados.» (navegador)
- En Documentos, «¿Qué garantiza una firma o una huella digital aquí?»: «no con el archivo que se descarga … no es un sello de tiempo certificado … ante un tercero (un auditor, una interventoría o un juez) no prueba por sí sola quién firmó ni cuándo. Su valor legal está pendiente de validar con asesoría jurídica.» (navegador)

Eso es honesto y lo conservaría tal cual. Pero ante una auditoría real me faltan tres cosas, que son los hallazgos I2-01, I2-02 y I2-06: el historial no dice **quién** hizo cada cambio (solo la fecha o la hora), descartar una no conformidad borra su medida de los conteos sin rastro, y lo firmado no tiene un lugar propio donde yo lo encuentre ni una forma de comprobar un archivo descargado contra su huella.

## 6. Estado de I-01 a I-13

| ID | Estado | Por qué (una línea) |
|---|---|---|
| I-01 Seguimiento hasta cerrar | **Resuelto** | Hay responsable, plazo, «Abierta → En corrección → Cerrada», cierre solo con nota, lista de medidas, «Vencida» y historial; la landing ya lo promete con razón. Quedan los reparos nuevos I2-01 a I2-03. |
| I-02 Evidencia = foto de cultivo | **Igual** | Sigue siendo `aerial-road.jpg` (parcelas verdes y amarillas con un camino) bajo «Drenaje», «Talud» y «Deterioro»; mejora menor: cada vista dice su tramo («PK 12+400 – 12+800») y «Explorar comparación» avisa «Solo hay una imagen ilustrativa disponible … no representa dos vuelos». Siguen sin número de foto, hora ni coordenada. |
| I-03 El informe no se firma | **Resuelto** | Plantilla «Informe del vuelo» con firmantes «Operador» y «Revisor o interventor», botón en la pestaña Informe, y el «Acta de entrega» ya abre. La landing lo dice como borrador y «firma de ejemplo, sin valor legal». |
| I-04 Historial sin quién ni qué; «Eliminar» sin preguntar | **Mejorado** | Ahora el historial dice «Notas de revisión: vacío → «Se corrige el plazo …»» y «Eliminar» pide «Sí, eliminar». Falta quién cambió, no se conserva la versión firmada y la confirmación no avisa que el documento tiene firmas. Ver I2-01. |
| I-05 Vocabulario agrícola | **Mejorado** | La autorización ahora es «del titular o administrador de la vía», «representante del titular del contrato de concesión», «Longitud pedida 2 tramos · 0,8 km», Informes dice «para los socios, quien contrata o el responsable». Quedan «permiso del predio» (itinerario y lista de prevuelo), «predios vecinos» en la carta y «Propietario · Interventoría Vial (ejemplo)» en «Ver como». |
| I-06 Sin PK ni abscisa | **Mejorado** | Hay seis tramos con rango («PK 12+000 – 12+400 … PK 14+000 – 14+315»), PK y margen en cada hallazgo, y el PK antes de la coordenada en el informe. Pero la misma pantalla de Mapa dice «Los PK cuentan los tramos desde 0+000» mientras muestra 12+000 (`mapping-steps.tsx:124`), y son solo 2,3 km. |
| I-07 No se ve el tramo con más novedades | **Resuelto** | Mapa muestra «6 no conformidades en 5 vuelos · Es donde más hay» por tramo; Informes también lo muestra con la misma palabra. |
| I-08 Un vuelo contado de varias maneras | **Mejorado** | El informe del vuelo ahora lee la bitácora («Clima, según la bitácora: Despejado · viento 12 km/h», «AUT-2026-0412»); la palabra es «no conformidad» en todas partes. Pero el mismo vuelo sigue saliendo con 5 (Vuelos), 3 (Informes) y 6 (Evolución). Ver I2-05. |
| I-09 Comparar no responde «mejoró/empeoró» | **Mejorado** | La gráfica ahora se llama «Avance de la vía (ponderado por longitud)» y la ficha dice «Cómo va la zona: Es el valor de la zona; no mide este hallazgo»; la ficha trae «Visto en 18 de jul … 24 de oct · sigue abierto»; la nota de fiabilidad salió del desplegable. Sigue sin responder si el deterioro empeoró o mejoró; y las fotos lado a lado son la misma imagen. |
| I-10 «Firma inválida» y «huella» | **Resuelto** | Explicación en tres sitios (ver sección 5), el «no encontré una norma» ya no está en la plantilla («El equipo de Otear no verificó que una norma la exija … confírmelo con su asesoría jurídica»). Falta poder verificar un archivo descargado (I2-06). |
| I-11 Primera pantalla es el prevuelo | **Resuelto** | La demo abre en Vuelos con la última visita y lo que marcó cada vuelo. |
| I-12 Tuteo | **Mejorado** | Solo queda «Buscar en tus vuelos» (`app-shell.tsx:318`); desaparecieron «Puedes añadir una tarea local» y «Selecciona qué observaciones quieres». Apareció otro problema de redacción, la concordancia (I2-07). |
| I-13 Recargar vuelve a Agricultura | **Resuelto** | Cargué directo `/programacion`, `/servicios`, `/vuelos`, `/mapa`, `/evolucion`, `/equipos`, `/informes`, `/pagos`, `/documentos`: todas abrieron con la Troncal de Occidente y el vocabulario de vía. |

Conteo: **6 resueltos, 6 mejorados, 1 igual, 0 empeorados.**

## 7. Hallazgos nuevos

### I2-01 El historial de una medida y el de un documento no dicen quién hizo cada cambio ni a qué hora
- Eje: componente
- Dónde: `/vuelos?tab=hallazgos` («Historial de la medida»), diálogo de documentos (`Historial`); `src/features/demo/types.ts:128` (`history: { at: string; text: string }[]`), `types.ts:198-201` (`EvidenceEvent { at; text }`), `src/features/flights/follow-up.ts` (`at: today`).
- Lo que ve la persona: «30 de oct de 2026 · El responsable pasó de Contratista de mantenimiento vial (ejemplo) a Ing. Marta Pérez, residente del contratista y el plazo pasó del 6 de nov de 2026 al 10 de nov de 2026.» y «30 de oct de 2026 · Cerrada. Cuneta limpiada y sello de fisuras aplicado; verificado en sitio por la interventoría, acta 14 y fotos del PK 12+140.» En el documento: «Se modificó el contenido del documento. Notas de revisión: vacío → «Se corrige el plazo …»» y «Las firmas anteriores (Operador, Revisor o interventor) quedaron sin validez porque el contenido cambió.»
- Qué entiende o hace mal: sé qué cambió y cuándo (en la medida solo el día, en el documento la hora), pero no quién lo hizo. Quien abrió, movió y cerró la medida y quien editó el documento no queda registrado; solo los firmantes (el nombre que ellos escribieron) aparecen.
- Por qué importa para su tarea: mi pregunta de auditoría es «quién». Una medida cerrada sin firmante vale lo que vale el texto de la nota. Es la mitad de «quién firmó, cuándo, con qué evidencia y si algo cambió después» que todavía falta.
- Propuesta: guardar en cada línea del historial a la persona que hizo el cambio (en la demo, la persona de «Ver como»: «Luis Rojas · Interventoría») y, en las medidas, la hora además del día. En el texto de ayuda de la medida, mientras no exista: «El historial dice qué cambió y cuándo; en esta demo todavía no dice quién lo cambió».
- Gravedad: bloquea la tarea (para uso de auditoría; para la demo basta con decirlo)
- Evidencia: navegador (medida abierta, cambiada, pasada a «en corrección» y cerrada; documento firmado y alterado) y lectura de código
- Huecos relacionados: H4, H7

### I2-02 Descartar una no conformidad saca su medida de los conteos sin motivo ni rastro; y se puede cerrar una medida sobre algo que nadie confirmó
- Eje: componente
- Dónde: `/vuelos?tab=hallazgos`, botón «Descartar»; `src/features/flights/review/flight-review-view.tsx:205-216` (`reviewFinding` solo hace `updateFinding(finding.id, { status })`); `src/features/flights/follow-up.ts` (`canHaveFollowUp`).
- Lo que ve la persona: con la medida «Drenaje por revisar · PK 13+400» vencida y «En corrección», pulsé «Descartar» sin que me pidiera nada. El resumen pasó de «2 vencidas» a «1 vencida» y «Pendientes (3)» a «(2)»; el panel dice «No conformidad descartada: la medida queda anotada pero no se cuenta en los resúmenes mientras siga así». «Historial de la medida (2)» no cambió: no dice que se descartó. Por otro lado, la ficha de Evolución de «Deterioro superficial · PK 12+140» muestra «Estado: Pendiente de revisar» junto a «Medida correctiva: Cerrada … cerrada el 30 de oct de 2026».
- Qué entiende o hace mal: un clic hace desaparecer una medida vencida del conteo, sin motivo, sin dejar nota en su historial y sin confirmar. Y puedo cerrar una medida sin haber confirmado la no conformidad.
- Por qué importa para su tarea: una medida vencida que se «resuelve» descartándola es la forma más fácil de maquillar un informe; un auditor lo preguntaría primero.
- Propuesta: pedir un motivo corto al descartar una no conformidad que tenga medida en curso, y escribir en el historial de la medida «Se descartó la no conformidad: [motivo]»; contar en el resumen «N descartadas con medida». Pedir confirmar la no conformidad antes de poder cerrar su medida, o decir en el cierre «sobre una no conformidad sin confirmar».
- Gravedad: bloquea la tarea (para uso de auditoría)
- Evidencia: navegador (descarte con medida vencida; ficha en Evolución) y lectura de código
- Huecos relacionados: H7

### I2-03 Cerrar una medida no distingue lo que dice el contratista de lo que verifica la interventoría; y el mismo deterioro queda con dos medidas, una cerrada y otra vencida
- Eje: caso-de-uso
- Dónde: «Cerrar con nota» en `/vuelos?tab=hallazgos`; `follow-up.ts` (`closeFollowUp`: solo exige 8 letras de nota); `/evolucion`, ficha de «Deterioro superficial»; `/informes` pestaña «Informe» («Seguimiento de medidas correctivas»).
- Lo que ve la persona: la nota de cierre es un texto libre («Qué se hizo y con qué evidencia se comprobó (una foto, un acta, una visita)») sin adjuntar foto, sin decir quién la verificó. En el seguimiento de medidas hay dos filas para el mismo punto: «Deterioro superficial (PK 12+140 · margen izquierda): Vencida (abierta) · responsable Residente de obra del concesionario (ejemplo) · plazo 27 de oct» y «Deterioro superficial (PK 12+140 · margen izquierda): Abierta · responsable Contratista de mantenimiento vial (ejemplo) · plazo 6 de nov». Cerré la segunda y la primera siguió «Vencida». En Evolución la ficha dice a la vez «Visto en 18 de jul … 24 de oct · sigue abierto» y «Medida correctiva: Cerrada», y la comparación dice «2 siguen abiertos» aunque una tiene la medida cerrada.
- Qué entiende o hace mal: no sé si «Cerrada» significa «el contratista dice que lo hizo» o «yo lo verifiqué en sitio». Y el mismo defecto del PK 12+140, visto en cuatro vuelos, aparece con dos responsables distintos y dos plazos: el cierre de una medida no cierra ni vincula a la otra.
- Por qué importa para su tarea: la interventoría es exigir y verificar. Si «cerrada» no dice por quién, el contratista puede cerrar su propia observación; y si el mismo punto trae dos medidas, la cifra de «vencidas» no corresponde a defectos distintos.
- Propuesta: en el cierre, un campo «Verificado por» (nombre y rol) y una línea «Evidencia adjunta» (nombre de archivo de ejemplo, como ya se hace en las entregas); mostrar en la ficha «Cerrada, verificada por …» frente a «Corregida, sin verificar». Cuando una no conformidad se repite en el mismo PK, una sola medida con la historia de las visitas, o avisar «Ya hay una medida abierta en este PK (vencida)» al abrir la segunda. Cambiar «sigue abierto» por «sigue apareciendo» cuando la medida está cerrada.
- Gravedad: confunde
- Evidencia: navegador (Vuelos, Evolución, Informes) y lectura de código
- Huecos relacionados: H8

### I2-04 «Personas distintas» solo comprueba la cédula si hay cédula: el mismo nombre en mayúsculas con otra cédula firmó los dos roles
- Eje: componente
- Dónde: diálogo de «Informe del vuelo», firmantes «Operador» y «Revisor o interventor»; `src/features/traceability/integrity.ts` (`samePerson`: si las dos cédulas tienen al menos 3 caracteres compara solo la cédula; si no, el nombre) y `signingConflict`.
- Lo que ve la persona: firmé como Operador «Camilo Torres», cédula 1111222333. Como revisor, «Camilo Torres» con la misma cédula se rechazó: «Camilo Torres ya firmó como Operador. En este documento cada rol lo firma una persona distinta; pida a otra persona que firme como Revisor o interventor.» También se rechazó «Camilo   Torres» con espacios extra. Pero «CAMILO TORRES» con la cédula «9999» firmó como «Revisor o interventor» y quedó el documento con las dos firmas. La cédula no se valida (4 dígitos aceptados).
- Qué entiende o hace mal: la regla existe y el aviso es claro, pero basta cambiar la cédula para que una misma persona firme los dos roles. La pantalla solo dice «deben ser personas distintas»; no dice que compara la cédula y no el nombre ni que no valida el formato.
- Por qué importa para su tarea: el valor de «Operador» y «Revisor o interventor» es la separación de funciones.
- Propuesta: decirlo en la pantalla en vez de prometerlo: «Otear no puede comprobar quién es cada firmante: solo evita repetir la misma cédula». Validar que la cédula tenga entre 6 y 10 dígitos (o NIT con dígito de verificación) en un documento con roles separados, y avisar si el nombre es el mismo aunque la cédula cambie.
- Gravedad: confunde
- Evidencia: navegador y lectura de código
- Huecos relacionados: H4, H7

### I2-05 En Evolución las sugerencias sin revisar cuentan como no conformidades y el mismo vuelo sale con tres cifras
- Eje: componente
- Dónde: `/evolucion`, insignia «6 no conformidades en este vuelo» y lista «Todos los no conformidades»; `/vuelos` pestaña «No conformidades» («5»); `/informes` («3 no conformidades»); `src/features/evolution/issues.ts`.
- Lo que ve la persona: el vuelo del 24 de oct sale con «5» en la pestaña de Vuelos (3 del operador y 2 «sugerencias sin revisar»), «3 no conformidades» en Informes («Se excluyen 2 sugerencias de IA que nadie ha revisado todavía») y «6 no conformidades en este vuelo» en Evolución. En la lista de Evolución «Posible grieta en la calzada» y «Posible agua estancada junto a la vía» aparecen como cualquier otra, sin la etiqueta «Sugerencia automática», y «PK 13+600 – 14+000 casi no avanza» (un aviso de ritmo, no una no conformidad) se cuenta dentro.
- Qué entiende o hace mal: la cifra de la insignia no es ninguna de las otras dos; y no sé que dos de esas seis las propuso un programa y nadie las revisó.
- Por qué importa para su tarea: es lo que dije en I-08: en una auditoría me contradigo con mi propio informe. Aquí el desfase es de un tablero a otro.
- Propuesta: en Evolución, separar «3 no conformidades · 2 sugerencias por revisar · 1 aviso de ritmo» y mostrar la etiqueta «Sugerencia automática · ejemplo» en cada tarjeta que lo sea.
- Gravedad: confunde
- Evidencia: navegador (tres pantallas) y lectura de código
- Huecos relacionados: H7

### I2-06 Lo firmado no tiene un lugar donde encontrarlo ni cómo comprobarlo
- Eje: caso-de-uso
- Dónde: `/documentos` («Documentos del contrato», «4 de 4 documentos»); `/programacion` itinerario, etapa «Entrega firmada» («Acta: falta Cliente o responsable»); diálogo del informe.
- Lo que ve la persona: después de firmar el informe con los dos roles («Firmado», «Huella 26fc67dcb445…»), abrí Documentos del contrato: sigue en «4 de 4 documentos» (póliza, soporte del piloto, documentación del operador, soporte de la operación) sin el informe firmado ni el acta. En el itinerario, «Entrega firmada» solo habla del acta; no menciona el informe firmado. La huella se muestra cortada («26fc67dcb4454d2d…») y no hay forma de pegar un archivo y comprobar que coincide; el texto lo reconoce («no con el archivo que se descarga»).
- Qué entiende o hace mal: el expediente de una visita está repartido: el informe firmado vive dentro de Vuelos → Informe y no aparece donde espero archivarlo.
- Por qué importa para su tarea: ante un auditor entrego una carpeta: informe firmado, acta, medidas cerradas con su evidencia. Si hay que abrir cada vuelo para encontrar cada documento, no es un expediente.
- Propuesta: no pido pantalla nueva: en Documentos del contrato, una fila por documento firmado del vuelo («Informe del vuelo · 24 de oct · Firmado · huella 26fc67dc…») y en el itinerario, que «Entrega firmada» cuente el informe y el acta («Informe: firmado · Acta: falta Cliente o responsable»). La verificación de un archivo puede quedar como «pendiente de construir» en el texto de la huella.
- Gravedad: confunde
- Evidencia: navegador (firma con ambos roles y recorrido por Documentos y Programación)
- Huecos relacionados: H4, H7

### I2-07 Errores de concordancia y de vocabulario dentro del documento que se firma y en pantallas clave
- Eje: texto
- Dónde: `src/features/flights/review/flight-report.tsx:190,226,363,391` (`${words.Plural} incluidos`); `src/features/traceability/templates.ts:636` («Hallazgos incluidos»); `flight-review-view.tsx:100`; `evolution-view.tsx:351,362`; `src/features/sites/mapping/mapping-steps.tsx:124`; `reports-view` (conteos).
- Lo que ve la persona: en el texto firmable: «NO CONFORMIDADES INCLUIDOS» y en el campo «Hallazgos incluidos» del diálogo («cambió: Hallazgos incluidos»), en lugar de «incluidas» y «No conformidades incluidas» (la prueba `flight-report.test.ts:59` espera «incluidas», la pantalla no). En pantalla: «confirme los no conformidades», «Todos los no conformidades», «Toque un marcador … o un no conformidad», «1 abiertas», «1 sigue abiertos», «1 vuelos», «1 descartados». Y en Mapa: «Los PK cuentan los tramos desde 0+000, en el orden de la lista» junto a los rangos «PK 12+000 – 12+400»; en Evolución, «Zona: PK 12+000 – 12+400 · PK 12+000 – 12+400» (el nombre dos veces).
- Qué entiende o hace mal: se entiende, pero en el documento que firmo y entrego a una entidad desentona y resta confianza; la nota del PK contradice lo que muestra la pantalla.
- Por qué importa para su tarea: el texto firmado es el que se huella; corregirlo después cambia la huella.
- Propuesta: `findingsTitle: ${words.Plural} ${agree(words, "incluidos", "incluidas")}` y la misma regla en las demás cadenas; «Hallazgos incluidos» → «Puntos incluidos»; en Mapa, «Los PK vienen de ejemplo y arrancan en 12+000» (o calcular el texto del dato); «1 abierta», «1 sigue abierta», «1 vuelo».
- Gravedad: menor
- Evidencia: navegador (informe firmable, Vuelos, Evolución, Mapa) y lectura de código
- Huecos relacionados: —

### I2-08 Aviso de React en la consola: dos hijos con la misma clave en la ficha de una no conformidad
- Eje: componente
- Dónde: `src/features/flights/review/flight-review-view.tsx:610` (`CustomFieldsPanel key={selectedFinding.id}`) y `:656` (`FollowUpPanel key={selectedFinding.id}`), hermanos en el mismo contenedor.
- Lo que ve la persona: tras abrir una no conformidad el servidor de desarrollo muestra la insignia roja «N Issues»: «Encountered two children with the same key, `finding-via-la-habana-1`. Keys should be unique…» (con `finding-via-la-habana-h5-2` después). Crece con cada no conformidad que abro.
- Qué entiende o hace mal: no veo ningún daño en pantalla (los dos paneles se ven), pero la insignia roja cubre el menú lateral en desarrollo y React avisa que podría duplicar u omitir hijos. Es un fallo de lo nuevo (el panel de seguimiento).
- Por qué importa para su tarea: no la afecta hoy; sí a quien revise la demo en modo de desarrollo y la juzgue «rota».
- Propuesta: distinguir las claves (por ejemplo `custom-${id}` y `follow-up-${id}`).
- Gravedad: menor
- Evidencia: navegador (insignia de desarrollo con el texto del error) y lectura de código
- Huecos relacionados: —

## 8. Lo que funciona y hay que conservar

- **La demo abre en la última visita y dice dónde empezar** (el aviso de entrada y el botón «Revisar 5 no conformidades (2 son sugerencias sin revisar)»).
- **La medida correctiva con reglas claras**: no deja asignar sin responsable, no acepta un plazo anterior a hoy, no cierra sin nota («Para cerrar escriba qué se hizo y con qué evidencia se comprobó»), «Vencida» gana sobre el estado, y deja todo en el historial. El aviso «Nada se notifica a nadie» es honesto.
- **La reacción al cambio de contenido firmado**: «Modificado tras firmar», «sin validez» y, antes de guardar, «El informe en pantalla ya no coincide con el guardado (cambió: Notas de revisión)» con el botón «Usar los datos actuales del vuelo». Cerrar una medida después de firmar también marca «El informe cambió desde que se guardó» sin invalidar la firma por sorpresa.
- **El texto «¿Qué garantiza una firma o una huella digital aquí?»** y el apartado «Qué es esta firma y qué no» dentro del informe; incluida la separación «Cubre este texto, no las fotografías ni los archivos entregados».
- **El acta de entrega ya es alcanzable** («Abrir el acta de entrega») y el consentimiento explícito antes de firmar («Confirme que acepta firmar electrónicamente»).
- **La separación de roles por rol** en la plantilla («Operador» / «Revisor o interventor») y el rechazo con motivo cuando la cédula coincide.
- **El seguimiento por tramo en Mapa** («6 no conformidades en 5 vuelos · Es donde más hay») y la frase «PK 12+000 – 12+400 reportó no conformidades en 5 vuelos distintos: conviene buscar la causa».

## 9. Huecos H1–H9 desde mi rol

- **H1 (qué es Otear):** mucho mejor; «Otear no hace los vuelos» resuelve mi duda de la primera pasada.
- **H2 (cómo entran los vuelos):** me sigue estorbando algo: la landing dice «los entrega el operador» y «la carga real de archivos todavía no existe»; está dicho, pero falta la cadena de custodia (quién y cuándo sube cada foto).
- **H3 (precio):** me es indiferente.
- **H4 (datos y salida):** me estorba mucho: las firmas y los historiales viven solo en la sesión y no hay «exportar el expediente completo» ni la verificación de un archivo (I2-06).
- **H5 (piloto):** «En validación: aún sin piloto» es honesto; no me estorba.
- **H6 (primer minuto):** resuelto para mi rol.
- **H7 (real o simulado):** mejoró; pesan las contradicciones entre tableros (I2-05) y los textos que parecen de un producto real (I2-04).
- **H8 (historia con números):** mejoró mucho: hay una medida vencida hace 14 días, dos cerradas con nota («Se limpió la alcantarilla y se retiró el sedimento; la interventoría lo verificó en sitio con foto del 11 de agosto (ejemplo)») y otras abiertas. Es la historia que había pedido.
- **H9 (qué se mide):** me es indiferente.

## 10. Veredicto: ¿puede ahora cerrar el ciclo de auditoría?

**En la demo, sí: puedo recorrer el ciclo entero** (ubicar el tramo por PK, abrir una no conformidad, asignar responsable y plazo, pasarla a «en corrección», cerrarla con nota, firmar el informe con dos roles distintos, ver cómo una edición posterior lo vuelve «Modificado tras firmar» y leer qué cambió antes → después). Eso en la primera pasada era imposible.

**Para una auditoría real, todavía no**, por tres razones: el historial no registra **quién** (I2-01); se puede quitar una medida vencida de los conteos descartando su no conformidad, y «cerrada» no dice quién la verificó (I2-02, I2-03); y lo firmado no tiene un lugar propio ni una forma de comprobarse (I2-06). Si el equipo lo presenta como ensayo del ciclo («firma de ejemplo, sin valor legal»), como hoy, es creíble; yo no lo presentaría ante un tercero como expediente.

## 11. Qué le preguntaría a una persona real como yo

1. Cuénteme la última no conformidad que dio por cerrada: ¿quién la verificó, qué evidencia vio y dónde quedó guardada esa constancia?
2. Cuénteme una vez que una medida correctiva venció sin cerrarse: ¿qué hizo, a quién se lo comunicó y qué quedó escrito?
3. Cuénteme la última auditoría o requerimiento en que le pidieron demostrar que un informe no cambió después de firmado: ¿qué mostró y qué le faltó?

## 12. Límites

- Persona simulada: no hay usuarios reales ni cifras de uso.
- Probé escritorio (1360×1000) con Chromium sin interfaz. No probé móvil, ni la simulación del vuelo, ni WebGL, ni Pagos/Equipos/Configuración más allá de leer su texto en busca de vocabulario agrícola (Pagos y Documentos sin coincidencias). Servicios solo lo leí en la solicitud «Verificar los puntos críticos»; no ejecuté la respuesta a una disputa ni «Motivo de la elección».
- No reabrí una medida cerrada ni probé el cambio de responsable en una cerrada (lo leí en `follow-up.ts`, no en pantalla).
- No descargué el .txt ni el PDF del informe firmado; no verifiqué que el archivo traiga la huella y el historial (en la primera pasada sí).
- El servidor de desarrollo compartido recargó mi página varias veces (borra lo hecho en sesión). No lo conté como fallo del producto; las pruebas largas las repetí con la recarga en caliente bloqueada en mi navegador.
- No verifiqué el alcance legal de la «firma electrónica simple»; lo dejo a la asesoría jurídica del proyecto, como la propia demo dice.
- La demo toma el 30 de octubre como «hoy» en las medidas y, en el pie, «escenario del 25 oct. 2026»; no lo conté como hallazgo.
