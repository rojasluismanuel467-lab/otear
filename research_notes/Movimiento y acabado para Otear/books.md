# Libros para movimiento, profundidad y acabado de Otear

## ¿Qué aporta Animation at Work, de Rachel Nabors?

### Takeaway
Es la referencia más breve y directamente aplicable para clasificar la intención de una animación antes de implementarla. Puede informar una guía de movimiento de Otear sin convertir la demo en una secuencia de efectos.

### Cited Findings
- Libro de Rachel Nabors publicado en 2017. La ficha oficial aclara que A Book Apart **ya no vende ni distribuye libros** y enlaza la disponibilidad directamente desde la autora. Es un libro comercial; no se verificó precio actual. — [Ficha editorial oficial](https://abookapart.com/products/animation-at-work.html)
- Existe un extracto autorizado y gratuito del capítulo 2 escrito por Nabors. Clasifica las animaciones en transiciones, suplementos, feedback, demostraciones y decoración. Las transiciones ayudan a orientarse entre tareas o lugares; los suplementos añaden información sin cambiar de tarea; el feedback vincula una acción con su respuesta. — [Patterns and Purpose, extracto autorizado](https://alistapart.com/article/patterns-and-purpose/)
- El extracto recomienda concentrar el esfuerzo donde el movimiento tenga mayor impacto y distingue la decoración, que no comunica información nueva, de otras funciones del movimiento. — [Mismo extracto](https://alistapart.com/article/patterns-and-purpose/)

### Inferences
- Guía que informaría: `motion-principles.md`. Cada patrón de Otear tendría un propósito: abrir un hallazgo sin perder el contexto del lote = suplemento; indicar que se guardó una observación = feedback; mostrar cómo funciona la comparación = demostración.
- Criterio para agentes: describir el cambio de estado y su beneficio antes de agregar animación. Usar los estados y comportamientos existentes de HeroUI como punto de partida; no introducir otra librería por cada efecto.

### Gaps
- Se leyó la ficha y el extracto público; **no el libro completo**. El extracto no justifica atribuirle valores concretos de duración, curvas CSS ni preferencias de librerías actuales.

## ¿Qué aporta Designing Interface Animation, de Val Head?

### Takeaway
Sirve para convertir el movimiento en parte del flujo de diseño: orientación, atención, causa y efecto, feedback, prototipado y uso responsable. Es útil antes de construir cada pestaña, no únicamente durante el acabado final.

### Cited Findings
- La editorial ofrece el libro comercial de Val Head en papel y ebook. La ficha publica un índice con capítulos sobre contexto/orientación, atención, causa y efecto, feedback, demostración, personalidad de marca, proceso, prototipos y animación responsable. La publicación original indicada es julio de 2016. — [Ficha e índice editorial](https://rosenfeldmedia.com/books/designing-interface-animation/)
- La descripción editorial plantea equilibrar propósito y estilo para mejorar la comunicación de la interfaz. No presenta el movimiento como un añadido puramente decorativo. — [Descripción oficial](https://rosenfeldmedia.com/books/designing-interface-animation/)

### Inferences
- Guía que informaría: un registro pequeño por interacción: origen, destino, elemento que mantiene continuidad, propósito, tratamiento con movimiento reducido y criterio de prueba.
- En Otear: conservar la selección de lote al abrir una foto y volver; hacer visible el cambio de fecha de un vuelo; relacionar un marcador seleccionado con el panel de detalle. Es más valioso que animar todos los elementos al entrar a cada pestaña.
- Los agentes podrían acordar estos comportamientos antes de extender pantallas y verificar luego que el movimiento no retrase tareas ni esconda información.

### Gaps
- Se leyó la descripción y el índice públicos; **no se afirma haber leído todos los capítulos**. La extracción no mostró precio numérico. Para implementación actual deben usarse las APIs oficiales vigentes de HeroUI/React/CSS, no inferirlas de un libro de 2016.

## ¿Qué aporta Refactoring UI, de Adam Wathan y Steve Schoger?

### Takeaway
Es la referencia que mejor coincide con el interés por sombras y formas cuidadas: profundidad con una función visual, jerarquía y separación. Complementa los dos libros de movimiento con decisiones estáticas que deberían fijarse una sola vez.

### Cited Findings
- Libro comercial y paquete de recursos de Adam Wathan y Steve Schoger. Su sitio ofrece dos capítulos gratuitos. El índice incluye escalas de tipografía/espaciado y un capítulo de profundidad: luz, sombras para elevación, sombras de dos partes y superposición. También contempla fotografía y contraste del texto. — [Sitio oficial e índice](https://refactoringui.com/)
- Una táctica explicada públicamente es reducir el exceso de bordes y separar elementos con sombras, fondos contrastantes o espacio. La página distingue el libro y recursos visuales; no es una biblioteca React funcional que reemplace HeroUI. — [Explicación pública oficial](https://refactoringui.com/)

### Inferences
- Guía que informaría: `visual-foundations.md`, con una escala limitada de radios, superficies, espaciados y elevaciones. Elegir niveles por función: contenido base, controles flotantes y diálogo; no añadir una sombra distinta a cada componente.
- Para Otear, usar las fotografías como principal textura real. Cualquier grano o gradiente decorativo en la landing debe ser discreto y mantenerse fuera de mapas, etiquetas y texto; esta es una propuesta de diseño, no una regla citada del libro.
- Definir primero estos tokens sobre HeroUI y después avanzar pestaña por pestaña reduce variaciones entre agentes. Las sombras no sustituyen estados de selección, foco visible ni bordes cuando estos sean necesarios para comprender la interfaz.

### Gaps
- Se revisaron página pública, índice y táctica gratuita, **no el libro completo**. No se ha adquirido ni descargado contenido de pago. No se considera este libro una certificación de accesibilidad ni evidencia de usabilidad con productores de Otear.
- Ninguna de estas fuentes determina el radio, sombra o duración exactos para Otear. Esos valores serán decisiones de producto verificadas con contenidos reales y documentación técnica actual.
