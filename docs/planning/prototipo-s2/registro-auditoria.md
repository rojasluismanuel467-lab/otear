# Registro de auditoría — prototipo S2 «Verificar el cobro»

> Versión de trabajo. La versión de la entrega, con D6 a D8 (hallados por la revisión externa del 1 nov) y las cifras corregidas, está en `entrega.md`, sección 5. Informe de la revisión: `revision-externa.md`.

Qué se auditó: la primera versión que generó la IA (Claude Code, siguiendo la skill `otear-prototipo-s2`) del flujo pantallas 10 → 11 → 12. Todas las capturas están en `capturas/` y se tomaron en un navegador real a 1280 × 800, no en el editor. Prefijo `antes-` es la versión generada; `despues-` es la corregida.

## a) Decisiones de la IA que se corrigieron

### D1. La acción que sigue quedó fuera de pantalla (acción primaria)
- **Qué decidió la IA:** apiló el paso 1 (mapa), el paso 2 (vuelo, con tres opciones de dos líneas cada una) y un aviso de simulación de dos líneas, y puso «Comparar» al final de esa columna.
- **Por qué es inadecuado:** la hipótesis H1 depende de que Hernando (56 años, computador de oficina) encuentre solo qué hacer. A 1280 × 800 el botón «Comparar» empezaba en y = 812: la única acción que avanza el flujo no se veía sin desplazarse, y el botón está deshabilitado hasta completar los dos pasos, así que nada le indicaba que había algo más abajo. Medido: `Comparar` top = 812 px (viewport 800).
- **Corrección:** opciones de vuelo en una línea (sin el año, que ya está en el subtítulo), columna de pasos más ancha (340 → 380 px) y aviso de simulación en una línea. `Comparar` queda entre 722 y 770 px.
- **Captura:** `antes-A1-comparar-fuera-de-pantalla.png` → `despues-A1-verificar-inicial.png`.

### D2. Una nota larga del operador empujaba el veredicto fuera de la primera pantalla (jerarquía de información)
- **Qué decidió la IA:** mostró la nota del operador en la factura completa y **encima** del veredicto, porque «la nota explica el cobro».
- **Por qué es inadecuado:** la pregunta de Hernando es «¿me cobraron lo que hicieron?» (PP3, OD1). Con una nota de 716 caracteres el título del veredicto bajó a y = 701 y las acciones quedaron fuera de pantalla: la respuesta quedó escondida detrás del texto del interesado en que se pague.
- **Corrección:** el veredicto y las acciones van primero; la nota queda debajo, plegada, con su longitud en el título («Nota del operador en la factura (716 caracteres)»). El veredicto queda en y = 416 con cualquier nota.
- **Captura:** `antes-B1-nota-larga-verificar.png` → `despues-B1-nota-larga-verificar.png`.

### D3. Un cobro de $0 llevaba a «Aceptar» y a un mensaje vacío (qué es irreversible, estados con salida)
- **Qué decidió la IA:** trató el $0 como cualquier cobro menor: veredicto «No se puede calcular la diferencia en pesos», «Facturó 17,1 ha menos… (−100 %)», «Aceptar el cobro» como acción primaria, y el botón «Enviar evidencia» abría una pantalla con el mensaje en blanco.
- **Por qué es inadecuado:** aceptar es irreversible (la labor queda como pagable) y se ofrecía como lo recomendado sobre una factura que no cobra nada; y se invitaba a reclamar una diferencia que no existe. El usuario no habría entendido qué estaba aprobando.
- **Corrección:** estado propio «El operador no cobró esta labor ($0)», sin acción primaria y con las dos acciones deshabilitadas diciendo por qué («No hay cobro que aceptar: la factura está en $0»). Prueba unitaria `a labor billed at $0`.
- **Captura:** `antes-B2-cobro-cero-verificar.png` y `antes-B2-cobro-cero-compartir.png` → `despues-B2-cobro-cero-verificar.png`.

### D4. Una instrucción de prueba quedó dentro del flujo del usuario (contenido)
- **Qué decidió la IA:** escribió bajo el campo del WhatsApp «Para probar el error "El mensaje no llegó", use +57 300 000 0000».
- **Por qué es inadecuado:** el flujo se valida con personas que deben completarlo sin instrucciones (rúbrica y OB1). Esa frase les dice cómo provocar un error y mezcla el material de prueba con el producto.
- **Corrección:** la instrucción vive solo en el panel plegado «Datos de prueba», con el resto de casos. En el campo queda una ayuda propia del producto.
- **Verificación:** `13-compartir-error.png` muestra el error alcanzado desde el panel.

### D5. Textos fijos que solo servían para una labor (contenido real y coherente)
- **Qué decidió la IA:** escribió en el código «lotes 5 y 6», «16 de octubre» y «24 de octubre» dentro de los mensajes de error y de los soportes de la evidencia.
- **Por qué es inadecuado:** con cualquiera de las otras labores contratadas (la lista de 40 las genera), el error diría que el vuelo «no cubre los lotes 5 y 6» y la evidencia ofrecería fotos del lote 6 que no existen. Hallado al revisar el caso de 40 labores; no lo captura una imagen.
- **Corrección:** los textos se construyen con los lotes y las fechas de la labor abierta (`flightProblemText`, `supportsFor`, `linkExpiry`). Una prueba unitaria encontró además un fallo de redacción con un solo lote («no los 1»), también corregido.

### Correcciones menores (no cuentan como de fondo)
- La primera columna de la tabla salía en mayúsculas y sin el fondo de la fila marcada.
- El cursor de escritura de los campos heredaba el azul del demo y todos los bordes sin color propio tomaban el gris azulado del demo (`#e1e5e8`): la rúbrica pide solo grises. Medido por estilo calculado, hoy 0 elementos con matiz.
- La fila «Cobro aceptado» repetía la palabra en la columna de acción.

## b) Stress test con datos extremos

Se cargan desde el panel «Datos de prueba» del propio prototipo. Medición automática por caso (estilos calculados): desborde horizontal, texto bajo 12 px, botones bajo 44 px, color con matiz, transiciones, textos prohibidos.

| Caso | Qué se rompió | Ajuste | Captura |
|---|---|---|---|
| Nota del operador de 716 caracteres | El veredicto bajó a y = 701; acciones fuera de pantalla | Nota plegada bajo las acciones (D2) | `antes-B1…` / `despues-B1…` |
| Cobro de $0 (0 ha facturadas) | Veredicto sin pesos, «−100 %», «Aceptar» como primaria, mensaje en blanco | Estado propio «sin cobro», acciones deshabilitadas con motivo (D3) | `antes-B2…` / `despues-B2…` |
| 40 labores | No se desbordó la lista (se desplaza dentro de la página). Sí fallaban los textos fijos de errores y soportes con otras labores | Textos construidos por labor (D5) | `stress-forty-labors-1-lista.png` |
| Nombre de operador de 78 caracteres | **Nada se rompió**: el nombre se parte en varias líneas en la tabla, el subtítulo y la tarjeta «Cobrado», sin tapar nada. La regla `overflow-wrap: anywhere` ya estaba desde el primer borrador, así que el caso no la puso a prueba por sí solo | — | `despues-B3-operador-largo-verificar.png` |
| Cobro de $50.000.000 (2.717.391 $/ha) | **El diseño no se rompió** y la diferencia en pesos sale bien ($3.532.608). Queda una duda de producto sin resolver: nada avisa que el precio por hectárea es muy distinto al pactado en otras labores | Sin cambio; es una decisión pendiente (Otear no tiene tarifas de mercado y no debe inventarlas) | `stress-huge-charge-2-verificar.png` |
| 0 labores | **Nada se rompió**: estado vacío que dice qué aparece ahí y que registrar una labor no hace parte del prototipo | — | `stress-no-labors-1-lista.png` |
| Campos vacíos (WhatsApp, mensaje, ningún soporte) | «Enviar» deshabilitado diciendo qué falta, de a un motivo | — | `11-compartir-deshabilitado.png` |
| Archivo de mapa vacío, roto, `.shp`, `.txt` o de otra finca | Cada uno da su propio error con las tres partes (qué pasó, por qué, qué hacer) y «Pedir el mapa al operador» | — | `07-mapa-error.png` |

No aplica «ítem sin imagen»: en esta etapa las imágenes y los mapas son marcadores con proporción fija.

## Lo que esta auditoría no cubre
- Teclado completo y lector de pantalla: se comprobó el foco del diálogo (arranca en «Cancelar», Escape lo cierra) pero no un recorrido completo solo con teclado.
- No hubo prueba con personas. Las hipótesis H1 y H2 se miden en la semana 4.
