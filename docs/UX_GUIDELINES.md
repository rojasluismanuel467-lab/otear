# Guía UX para Otear

Estado: criterios iniciales propuestos para landing y demo. No fija una plantilla ni autoriza nuevas funcionalidades. Leer antes de tareas de interfaz; ampliar solo la sección necesaria de las fuentes.

## Alcance y requisitos provisionales

La landing y demo actuales validan comprensión e interés. Los requisitos Dorfman entregados posteriormente son contexto provisional y pueden cambiar: no justifican implementar por adelantado autenticación, procesamiento ni toda la arquitectura.

- **Pendiente de resolver:** el PDF inicial permite conservar fotos sin GPS o sin asignación; la matriz posterior propone rechazarlas sin GPS o fuera del lote. No codificar ni presentar una de las dos políticas como definitiva. La demo puede explicar el caso como pendiente de revisión.
- **Diferenciador por validar:** revisión de labores pagadas. La matriz la representa en G5/E3; separar un G6 es una propuesta todavía no confirmada. No presentar cobertura o fotos como prueba de cantidad/calidad aplicada.
- **Arquitectura futura:** C1 corresponde a una app con capacidad offline y C2 al portal. C3–C10 son componentes lógicos; no implican por sí mismos desplegar microservicios. Estos nombres no deben aparecer como navegación ni explicación al usuario del producto.

## Preferencias del usuario

Sombras suaves, formas redondeadas e inspiración visual Apple, con suficiente riqueza visual. El producto debe servir al trabajo de campo y evitar tableros llenos de indicadores decorativos. Estas preferencias vienen de la conversación, no de una prueba de usuarios.

## Reglas de implementación

1. Priorizar el recorrido lote → vuelo → comparación → hallazgo → informe. Cada bloque debe apoyar una tarea o una decisión identificable.
2. Mantener a la vista el contexto de finca, lote y fecha. Usar lenguaje del productor y acciones explícitas.
3. Revelar opciones secundarias en contexto. Las acciones frecuentes deben encontrarse sin recorrer menús ambiguos.
4. Mostrar «Datos de ejemplo» durante la demo y distinguir simulaciones de captación real. No prometer inferencias agronómicas aún no verificadas.
5. Comparar fechas rotuladas del mismo lote; ofrecer lado a lado o control alternativo al arrastre. No inferir cambios del cultivo a partir de encuadres incompatibles.
6. Aplicar radios, sombras, espacio y tipografía desde tokens compartidos. La elevación distingue capas; no cubrir cada bloque con efectos. Usar fotos de campo legibles para aportar identidad.
7. Reutilizar la base elegida y sus componentes. Crear una variante solo ante una necesidad concreta; no introducir otra biblioteca por una diferencia cosmética.
8. Mantener contraste, foco visible, nombres accesibles y controles de teclado. Color y sombra no son la única señal de estado; los textos sobre fotos necesitan fondo legible.
9. Confirmar el resultado de acciones, permitir volver/cancelar y conservar entradas tras errores. Mensajes breves indican cómo continuar.
10. Separar evidencia de utilidad y de negocio: completar tareas demuestra comprensión; solicitar un piloto o comprometer archivos/pago demuestra otro tipo de interés.

## Títulos y encabezados

Reglas para cualquier título, subtítulo o encabezado de pantalla. El tamaño y el peso salen de la escala de `DESIGN.md` («Escala de encabezados»); aquí está el criterio.

1. **El nivel sigue la estructura, no el aspecto.** Un `h1` por ruta (lo pone `PageHeading`), `h2` para los bloques principales, `h3` para sus partes, `h4` para grupos. No saltar niveles hacia abajo (de `h2` a `h4`); sí se puede volver a un nivel superior. Si algo debe verse más pequeño o más grande, se cambia la clase, no la etiqueta. Un texto que no organiza contenido (etiqueta de tarjeta, valor, aviso) no es un encabezado: usar `<p>` o `<strong>`. Los paneles fijos (menú, avisos, diálogos) tienen su propio rango y lo mantienen en todas las pantallas.
2. **Descriptivos y específicos.** Decir qué es o qué se hace («Facturas del operador», «Antes de pagar»), no «Detalle» ni «Información». Quien navega con lector de pantalla salta por encabezados; deben bastar para orientarse (WCAG 2.4.6, nivel AA). La palabra que distingue va primero: «Costos de la aeronave», no «Información sobre los costos».
3. **Mayúscula solo inicial.** Mayúscula en la primera palabra y en nombres propios; sin versalitas ni títulos en MAYÚSCULAS salvo las etiquetas pequeñas de sección (`sectionLabel`, ≤ 13 px, con espaciado positivo). Sin punto final en títulos de una línea; sí en frases completas de la landing.
4. **Cortos.** Un título de página o bloque cabe en una línea en escritorio y en dos como máximo en móvil. Lo que explica va en la línea de apoyo debajo (≤ 68 caracteres de ancho), no dentro del título.
5. **Jerarquía visible.** Cada nivel se distingue del siguiente por tamaño y peso a la vez; un encabezado del mismo tamaño que el cuerpo (14 px) solo se distingue por el peso y se pierde al escanear. El cuerpo no debe competir: no usar negrita para párrafos enteros. Mismo nivel, mismo estilo en toda la app.
6. **Peso y tracking.** Instrument Sans llega a 700: los encabezados van siempre en 700 (750 o 800 se ven igual que 700, así que no se escriben; 650 queda para botones y etiquetas). El interletrado se aprieta un poco al crecer el texto (−0,03 em desde 28 px, −0,02 em de 18 a 24 px, 0 por debajo) y nunca es positivo, salvo en etiquetas en mayúsculas.
7. **Interlineado y corte.** Encabezados 1,1–1,3 (más ajustado cuanto más grande), cuerpo 1,5 o más. `text-wrap: balance` en títulos para evitar una palabra suelta en la última línea; `text-wrap: pretty` en párrafos largos. Los títulos no se cortan con guiones ni con puntos suspensivos si pueden pasar a otra línea.
8. **Espacio por proximidad.** Más aire encima del encabezado que debajo (aprox. 2 : 1): el título pertenece al contenido que le sigue, no al anterior.
9. **Contraste.** Texto de encabezado ≥ 4,5:1; solo los títulos grandes (≥ 24 px, o ≥ 18,66 px en negrita) pueden bajar a 3:1. Sobre fotos o mapas, con fondo propio.
10. **Acento expresivo.** La cursiva de acento va en una palabra o frase corta de un titular de la landing (ver «Tipografía» en `DESIGN.md`); nunca en los encabezados funcionales de la app.

Cómo comprobar una pantalla: recorrer la lista de encabezados (`document.querySelectorAll("h1,h2,h3,h4")`), verificar que hay un solo `h1`, que no se salta un nivel y que, leídos en orden, describen la pantalla. En el navegador, comparar tamaños: dos encabezados del mismo nivel no deben diferir.

Fuentes y límites de esta sección: [W3C WAI — encabezados](https://www.w3.org/WAI/tutorials/page-structure/headings/) (leída; anidación por rango, evitar saltos, rango coherente en regiones fijas); [W3C — Understanding 2.4.6](https://www.w3.org/WAI/WCAG20/Understanding/headings-and-labels) (encabezados descriptivos; solo vista en resultados de búsqueda); [MDN — text-wrap](https://developer.mozilla.org/docs/Web/CSS/text-wrap) (`balance` para pocas líneas, `pretty` para evitar líneas finales sueltas; vista en resultados de búsqueda); [USAGov — sentence case](https://blog.usa.gov/making-the-case-for-sentence-case) (menos líneas en móvil; vista en resultados de búsqueda). Los intervalos de interlineado, la escala y el tracking son criterio de diseño recogido de guías de tipografía de interfaz y de decisiones de Otear, no una norma. «Un solo `h1`» y «mayúscula inicial» son buenas prácticas, no requisitos de WCAG. No se pudo abrir el artículo de NN/g sobre escaneo de encabezados; no se citan cifras suyas.

## Texto de lectura

Párrafos, líneas de apoyo y textos de ayuda. Los valores están como tokens en `globals.css` y en la tabla «Texto de lectura» de `DESIGN.md`.

1. **Ancho de línea de 45 a 75 caracteres, objetivo cerca de 65.** Baymard lo recomienda desde sus pruebas de uso y WCAG 1.4.8 (AAA) fija 80 como techo. Es un criterio de lectura, no una ley: el efecto depende también de la fuente, el tamaño y el interlineado. Un párrafo de más de 80 caracteres por línea se pierde al volver al inicio de la siguiente.
2. **Limitar el ancho con `ch`, no con el contenedor.** En `globals.css`, `:where(p)` da a todo párrafo `max-width: var(--measure-body)` (especificidad cero: una clase puede cambiarlo, p. ej. `--measure-lead` en una línea de apoyo). Ningún párrafo ocupa el ancho de la columna por defecto. Ojo: `1ch` es el ancho del cero, y en Instrument Sans (angosta) equivale a unos 1,5 caracteres de texto. Por eso 46ch son unos 70 caracteres y 66ch, casi 100. Antes de fijar un valor, medirlo en el navegador: ancho de la caja ÷ ancho medio de un carácter.
3. **Tamaño por papel.** Línea de apoyo (bajo un titular de landing): 17–19 px (`--text-lead`). Cuerpo de lectura en la landing: 16 px (`--text-body`). Texto de ayuda y detalle: 14 px (`--text-small`). Notas, avisos de demostración y metadatos que son frases: 13 px como mínimo; 12 px solo para etiquetas y datos sueltos, nunca para frases. Quien usa el producto tiene más de 50 años y lee de escritorio: las guías para lectores mayores piden hasta 19 px y 130–150 % de interlineado. Dentro de la app, por ser densa, el cuerpo es de 14 px.
4. **Interlineado entre 1,5 y 1,65 en párrafos**; 1,45 en textos de ayuda cortos. WCAG 1.4.12 (AA) exige que el contenido siga funcionando si el usuario sube el interlineado a 1,5 y el espacio entre párrafos a 2: sin alturas fijas, sin `nowrap` en párrafos, sin recortes.
5. **Alineado a la izquierda, sin justificar.** Los párrafos de más de dos líneas no se centran. `text-wrap: pretty` evita la palabra suelta en la última línea.
6. **Ritmo.** Entre el titular y su línea de apoyo, 14–20 px: menos que el aire entre secciones, para que se lea como una unidad. Entre párrafos, al menos 0,75 em. Un párrafo expresa una idea; una línea de apoyo, una o dos frases (máx. 3–4 líneas). Tres o más elementos paralelos pasan a lista.
7. **Énfasis con peso o color, no con cursiva ni versalitas** en párrafos (la cursiva de acento es solo de titulares). Negrita en una palabra, nunca en el párrafo entero.
8. **Contraste y fondo.** Texto de lectura ≥ 4,5:1 contra la peor zona del fondo, no contra el promedio. Sobre una textura (el mapa de relieve de la landing), el texto no va directo: lleva debajo un velo difuminado en los bordes (`.sectionHead::before`) o una tarjeta. Gris `--muted` para lo secundario; el texto principal usa `--foreground`.
9. **Texto en columnas estrechas (tarjetas):** 40–60 caracteres por línea está bien; no bajar de 16 px para forzar que quepa.
10. **Zoom y reflujo.** Probar al 200 % y a 375 px de ancho: el texto reacoma, sin barra horizontal y sin recortes.

Fuentes y límites: [Baymard — longitud de línea](https://baymard.com/blog/line-length-readability) (50–75 caracteres; consultada solo en resultados de búsqueda); [W3C — WCAG 1.4.8](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation) (AAA: ancho de línea hasta 80 caracteres; no se pudo confirmar el texto final de los valores de espaciado de este criterio); [W3C/Deque — WCAG 1.4.12](https://dequeuniversity.com/resources/wcag2.1/1.4.12-text-spacing) (AA: debe tolerar interlineado 1,5, párrafos 2×, letra 0,12 y palabra 0,16); [Smashing — texto sobre imágenes](https://smashingmagazine.com/2023/08/designing-accessible-text-over-images-part1) (velo o gradiente, contraste medido en la peor zona); [HHS — alfabetización en salud, tipografía](https://origin.health.gov/healthliteracyonline/display/section-3-3) y [PowerMapper — tamaño de fuente](https://www.powermapper.com/resources/best-practices/usability-font-size/) (19 px e interlineado 130–150 % para público mayor; vistas en resultados de búsqueda). Las cifras de 45–75 caracteres son una convención más citada que demostrada (hay críticas informales a su base empírica), por eso se mide con el producto y no se aplica ciegamente. Los tamaños y tokens son decisiones de Otear. No se encontró fuente específica sobre el tamaño de una línea de apoyo en un hero: 17–19 px es inferencia a partir del cuerpo recomendado.

## Verificación acotada por entrega

- Recorrer la tarea modificada en escritorio y móvil; revisar teclado/foco y estados relevantes.
- Usar objetivo WCAG 2.2 AA: contraste de texto normal 4.5:1 y texto grande 3:1; no declarar conformidad completa por pasar una herramienta.
- En formularios, verificar etiquetas, errores y confirmación. En comparador, verificar fechas y alternativa al arrastre.
- Hacer una ronda inicial con aproximadamente cinco usuarios representativos, sin guiar sus clics: localizar vuelo, comparar fechas y preparar informe. Registrar éxito sin ayuda, errores y dudas; corregir bloqueos. Esta ronda es cualitativa y no demuestra demanda de mercado.
- Repetir checks solo si cambia el recorrido o aparece un fallo relevante. Evitar auditorías completas por cada ajuste reversible de estilo.

## Fuentes y límites

- [NN/g — Usability 101](https://www.nngroup.com/articles/usability-101-introduction-to-usability/): utilidad, usabilidad y observación de tareas.
- [NN/g — 10 heurísticas](https://www.nngroup.com/articles/ten-usability-heuristics/): estado, lenguaje, control, consistencia, reconocimiento y recuperación. Son principios generales; las reglas concretas anteriores son decisiones propuestas para Otear.
- [Refactoring UI](https://refactoringui.com/): página e índice públicos consultados; referencia para jerarquía, espacio y profundidad. Libro de pago no leído íntegramente.
- [Don't Make Me Think, Revisited](https://sensible.com/dont-make-me-think/): libro de pago, con muestra oficial; consultar para navegación y comprensión. No se revisó el texto completo.
- [Designing Interfaces, 3.ª edición](https://www.oreilly.com/library/view/designing-interfaces-3rd/9781492051954/): índice público revisado; libro de pago/suscripción para patrones concretos.
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/): referencia pública para revisión visual futura; contenido no extraíble en la investigación inicial, sin reglas atribuidas sin verificar.
- [W3C — WCAG 2.2, referencia rápida](https://www.w3.org/WAI/WCAG22/quickref/): requisitos de accesibilidad verificables.

Consultar las [notas de investigación](../research_notes/Base%20visual%20para%20Otear/ux.md) para distinguir hechos, propuestas y pendientes. No descargar ni incorporar libros comerciales completos sin acceso legítimo.
