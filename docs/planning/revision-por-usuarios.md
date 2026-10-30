# Revisión por roles de usuario

Estado: propuesta, sin ejecutar. Complementa a `.agents/skills/otear-reviewer` (revisión técnica de frontend): aquí se revisa **qué entiende cada persona**, no si el código está bien.

## Objetivo

Que cada rol que usará Otear recorra la landing y la demo como lo haría esa persona, y que de ahí salgan mejoras concretas en tres ejes:

1. **Texto**: lo que se dice y debe cambiarse (titulares, etiquetas, avisos, botones, estados vacíos).
2. **Componentes**: lo que se presenta (qué ayuda a una tarea, qué es adorno, qué confunde, qué falta).
3. **Casos de uso e información**: si el escenario de ejemplo de su sector es creíble y si muestra los datos que esa persona esperaría para decidir.

Referencia de partida: el análisis de otras plataformas (AirData, Agremo, Propeller, DroneDeploy, Pix4D, Sentera). Las que se entienden nombran la categoría en el titular, muestran el producto, explican el flujo en 3–5 pasos y dan una prueba cerca del titular.

## Límite que hay que decir en voz alta

Los agentes **simulan** personas. Lo que salga son hipótesis bien argumentadas, no resultados de usuarios (regla de `otear-reviewer`). No se inventan porcentajes, clientes ni citas. Sirven para ordenar qué probar con gente real, no para reemplazar esa prueba.

## Lo que dicen las buenas prácticas (investigado el 30 de octubre de 2026)

La mayoría de las fuentes sobre demos son de empresas que venden esas herramientas, así que las cifras de conversión no se usan. Se usan solo las ideas en las que coinciden.

**Demos que se venden solas**
- Un *sandbox* (explorar libre, como la demo de Otear) sirve para quien ya quiere evaluar; un recorrido guiado sirve al principio. Para quien llega frío conviene un camino con historia, no un volcado de funciones.
- La demo se personaliza al problema de la persona. Otear ya adapta el vocabulario por sector; falta la historia.
- Se mide dónde se abandona (paso a paso), no solo cuántos entran. Hoy no se mide nada.

**Validar un prototipo**
- Probar con la fidelidad más baja que responda la pregunta. Una sola pantalla enseña si se entiende la idea, pero no si se puede usar ni encontrar nada.
- *Fake door*: poner el botón de algo que no existe y contar quién lo pide. Sirve para las propuestas (recurrencia, urgencias, paquetes, componentes por sector). Solo vale si quien lo ve es la persona correcta.
- *Concierge*: entregar a mano el valor a un cliente, diciéndolo. *Wizard of Oz*: lo mismo sin decirlo. La reunión de 30 minutos de Otear es un concierge; lo que se ve en pantalla se parece más a lo segundo, y por eso es importante que la demo diga siempre qué es simulado.
- Probar en varias rondas pequeñas, con tareas reales y personas parecidas a quien lo usará.

**Prueba de 5 segundos**
- Se enseña la página cinco segundos y se pregunta: ¿qué hace esta empresa?, ¿para quién es?, ¿qué se espera que haga ahora? Si hace falta un párrafo para responder, falló.
- Los creadores no pueden juzgar su propia página: saben demasiado. Se prueba con extraños, y con dos grupos: gente que se parece al comprador y gente lista que no es del sector (para detectar lenguaje de iniciados).

**Agricultores y tecnología nueva**
- Quieren ver si funciona **en una operación como la suya**. Datos de muestra muy pulidos suenan a discurso de ventas.
- Desconfían de la calidad de los datos y de cómo se obtuvo cada cifra; ayuda mostrar el método y la incertidumbre.
- Las suscripciones sin valor demostrado erosionan la confianza. Funcionan mejor las pruebas por etapas, con criterios de éxito acordados antes y medidos contra sus propios registros.
- Dejar claro de quién son los datos y cómo se sale.

**Compromiso, no cumplidos**
- «Suena bien» y «avíseme cuando salga» no valen. Valen las acciones que cuestan algo: dar tiempo, compartir datos reales, presentar a un colega, acordar un siguiente paso concreto. Aun un «no» a una petición concreta es información.
- Esto sirve para entrevistar, no para probar la usabilidad; son dos pruebas distintas.

## Huecos que probablemente no se entienden hoy

Comprobados en el código, no supuestos. Son cosas que quien construyó Otear da por sabidas y un visitante no.

| # | Hueco | Qué se ve hoy |
|---|---|---|
| H1 | **Qué es Otear**: software o servicio, y si presta vuelos | El titular no nombra la categoría; la aclaración «no le pedimos cambiar de operador» está en el formulario, al final. |
| H2 | **Cómo entran mis vuelos**: quién sube las fotos y el registro, y qué hace Otear con ellos | La demo ya trae 32 vuelos cargados; en la landing no hay ninguna frase sobre la entrada. |
| H3 | **Cuánto costaría y cómo se cobra** | No hay ni una mención. Solo «30 minutos, sin costo» para la reunión. |
| H4 | **De quién son los datos y cómo se sale** | Solo «Todo queda en su navegador», que habla de la demo, no de un uso real. |
| H5 | **Qué sería un piloto**: cuánto dura, qué se mide, qué se espera de mí | «Aún no tenemos piloto en estos sectores» y nada más. |
| H6 | **Primer minuto en la demo** | Cae en Programación con un aviso de 9 s sobre el vocabulario. No hay camino ni historia; el diferencial (Evolución, Antes de pagar) queda a unos clics. |
| H7 | **Qué es real y qué es simulado**, dentro de cada pantalla | Existe «Datos sintéticos» y varios avisos; no se ha revisado si cada módulo lo deja claro por sí mismo. |
| H8 | **Una historia con números** (qué decisión cambió) | La landing describe funciones; no cuenta un caso con cifras de ejemplo, claramente marcado como de ejemplo. |
| H9 | **Qué aprendemos de quien entra** | No hay medición. Decidir cuál sería la mínima y honesta es una decisión suya (ver abajo). |

Cada agente de la fase 1 debe decir, desde su rol, cuáles de H1–H9 le estorban y cuáles le son indiferentes.

## Personas

Salen de `PRODUCT.md`, de los roles de la landing y de `Party` en la demo. La tarea de cada una es lo que intentaría sin que nadie le guíe los clics.

| # | Persona | Sector / ruta | Tareas sin guía |
|---|---|---|---|
| 1 | Visitante frío (prueba de 5 segundos) | Solo landing | Decir qué es Otear, quién lo usaría, si vende vuelos, qué haría después. |
| 2 | Cañicultor, 56 años, escritorio (Hernando) | Agricultura | Ver qué lote está peor; saber si le cobraron las hectáreas que se volaron. |
| 3 | Gerente o jefe de operación de ingenio | Agricultura, Servicios | Pedir un vuelo, comparar cotizaciones, saber qué zona atender esta semana. |
| 4 | Operador de dron | Servicios, Pagos | Recibir un pedido, entregar el vuelo, facturar por lo cubierto, mantener la flota. |
| 5 | Interventor o ingeniero vial | Carreteras | Recorrer por tramos, dejar constancia de un deterioro y cerrarlo, sacar el informe firmado. |
| 6 | Residente o director de obra | Construcción | Comparar avance contra plan, revisar una fecha con el mismo encuadre, guardar un levantamiento. |
| 7 | Jefe de seguridad o vigilancia | Vigilancia | Revisar el perímetro, registrar un hallazgo con evidencia y responsable. |
| 8 | Ingeniero de minas | Minería a cielo abierto | Medir el avance de un banco, vigilar crestas y taludes. |

Primera ola mínima si se quiere gastar menos: 1, 2, 3, 4 y 5. Las 6, 7 y 8 repiten el patrón en otros sectores y pueden esperar.

## Fases

### 0. Preparación (integrador, sin agentes)
- Confirmar que la demo responde en `:3000` y tomar un commit de referencia.
- Fijar una tarjeta de persona por rol (quién es, qué le importa, qué palabras usa, qué no sabe) y una **plantilla de hallazgo** única, para que luego se puedan juntar.
- Instrucción de navegador: cada agente abre su propio Chromium sin interfaz con un puerto CDP distinto; el panel del navegador integrado es uno solo y se pisarían.

### 1. Revisión desde cada rol (solo lectura, en paralelo)
Un agente por persona. Recorre la landing y, si aplica, la demo de su sector con sus tareas, en escritorio y en móvil. No edita archivos. Escribe `docs/planning/revision-usuarios/<persona>.md`.

Cada hallazgo usa la misma plantilla:

```
Eje: texto | componente | caso-de-uso
Dónde: ruta y archivo:línea
Lo que ve la persona: (cita literal o descripción)
Qué entiende o hace mal:
Por qué importa para su tarea:
Propuesta: (texto nuevo en es-CO, o cambio de componente, o dato que falta)
Gravedad: bloquea la tarea | confunde | menor
Evidencia: navegador (captura/paso) | lectura de código
```

Cada agente añade al principio de su informe una **prueba de 5 segundos** (qué cree que hace Otear, para quién es, qué haría después) escrita *antes* de leer el resto de la landing, y una nota sobre su **primer minuto** en la demo (qué hizo, dónde dudó).

Qué mira cada agente en cada eje:
- **Texto**: palabras que esa persona no usaría (núcleo, huella digital, SHA-256, hallazgo, sintético), promesas que no se cumplen en la demo, lo que ya se dice bien, y la versión nueva. Respetar `useTerm()` y el vocabulario por sector.
- **Componentes**: para cada bloque grande de su camino, si apoya una tarea o es adorno (3D, replay, galería de modelos, mapa de condición); qué hace falta para terminar la tarea; qué estorba. Se aplica `DESIGN.md` y el piso de 12 px.
- **Casos de uso e información**: si los datos de ejemplo de su sector cuentan una historia creíble para esa persona, qué cifra o campo esperaría ver y no está, y si el flujo entre módulos cierra su tarea (por ejemplo vuelo → hallazgo → tarea → informe).

### 2. Síntesis (un agente o el integrador)
- Juntar hallazgos repetidos entre personas; cuantos más roles lo sufren, más pesa.
- Ordenar por gravedad × número de roles × esfuerzo.
- Pasar el filtro del proyecto antes de aceptar nada (ver Reglas).
- Separar lo que es un arreglo de lo que es una **decisión suya** (ver abajo).
- Entregar un backlog por lote, ya agrupado por archivos, en `docs/planning/revision-usuarios/_backlog.md`.

### 3. Mejoras (agentes que escriben, por archivos y no por persona)
Cada agente edita solo sus archivos, en una rama o worktree propio. Reparto propuesto:

| Lote | Archivos | Contenido típico |
|---|---|---|
| A. Landing | `features/landing/**`, `features/entry/**` | Titular, subtítulo, orden de secciones, cómo funciona, prueba, “no vendemos vuelos”. |
| B. Programación y Vuelos | `features/flights/**` | Etiquetas, avisos, estados vacíos, qué se ve primero. |
| C. Servicios, Pagos, Documentos | `features/services/**`, `features/billing/**`, `features/compliance/**` | Lenguaje de contratación y cobro. |
| D. Evolución, Mapa, Informes, Equipos | `features/evolution/**`, `features/sites/**`, `features/reports/**`, `features/fleet/**` | Lo que se muestra y lo que sobra. |
| E. Datos de ejemplo | `demo-data.ts`, `types.ts`, `globals.css` | **Solo el integrador**, por ser archivos compartidos. |

Cada lote termina con `npm run check` y `npm test`, y con una nota de qué se cambió y por qué.

### 4. Segunda pasada
Los mismos agentes de la fase 1 repiten **solo** lo que cambió, con las mismas tareas, y comparan antes y después. Cierra con lo que sigue sin entenderse, que pasa a ser la lista de cosas para probar con personas reales.

## Reglas que los agentes no pueden saltarse

- Frontend con datos sintéticos; nunca presentar una simulación como real.
- Otear no es operador de vuelos. Esa aclaración tiene que verse arriba, no al final.
- No inventar clientes, cifras, testimonios ni logos. Prueba solo con lo que existe.
- No resolver en silencio la política de fotos sin GPS ni “G6”; la matriz de Dorfman es provisional.
- Recurrencia, urgencias, paquetes y asesoría son propuestas a validar, no funciones construidas.
- Los complementos por sector (`customSteps`) se describen como «Se construye con usted».
- Español de Colombia, trato de usted, lenguaje del productor; identificadores en inglés.
- No añadir pantallas ni módulos nuevos sin su decisión.

## Decisiones que son suyas y no de los agentes

1. **Multisector con cinco casos iguales o un caso principal.** Es la tensión que más pesa en la landing: DroneDeploy y Propeller se anclan en un sector y listan el resto. Los agentes la documentan con lo que vean; no la deciden.
2. **Precio, datos y piloto (H3, H4, H5).** La landing hoy calla sobre las tres. Qué decir es un asunto de negocio; los agentes pueden proponer una redacción honesta («por definir, se acuerda en el piloto»), pero no inventar tarifas ni condiciones.
3. **Cómo entran los vuelos (H2).** Otear no procesa imágenes en esta demo. Un agente puede redactar qué hace y qué no hace, pero la respuesta de fondo (¿sube el operador, sube el cliente?) es suya.
4. **Medición mínima (H9).** Hoy no hay analítica y la landing dice que no guarda datos. Si se mide, tiene que ser lo mínimo y decirse.
5. **Si la fase 3 aplica los cambios o solo los propone.** Recomendado: en una rama, para verlos antes de mezclar.
6. **Qué prueba con personas reales** sale de la fase 4: cinco que se parezcan al comprador y cinco listas ajenas al sector para la prueba de 5 segundos; y, para medir interés, pedir un compromiso concreto (un vuelo suyo, una reunión en su sitio), no un «me gusta».

## Estado

- Primera ola lanzada con cinco personas (1 a 5), solo lectura, en paralelo. Informes en `docs/planning/revision-usuarios/`.
- Pendiente: síntesis, backlog y fase 3, que no empiezan sin que usted revise los informes.
