# Fundamentos UX para la base visual de Otear

## ¿Qué lecturas conviene usar?

### Takeaway

Priorizar recursos gratuitos de NN/g para decisiones de interacción y Refactoring UI para la dirección visual. Los libros completos son opcionales; sus páginas públicas permiten comprobar alcance, pero no equivalen a haber leído el libro.

### Cited Findings

| Recurso | Acceso verificado | Utilidad para el equipo |
| --- | --- | --- |
| [Usability 101](https://www.nngroup.com/articles/usability-101-introduction-to-usability/) y [10 heurísticas](https://www.nngroup.com/articles/ten-usability-heuristics/) — Jakob Nielsen | Artículos completos gratuitos, leídos | Usabilidad incluye aprender, eficiencia, recordar, errores y satisfacción; la utilidad exige resolver necesidades reales. Revisar interacciones y observar tareas. |
| [Refactoring UI](https://refactoringui.com/) — Adam Wathan y Steve Schoger | Libro/paquete de pago; página pública ofrece dos capítulos gratuitos. Se leyó presentación e índice, no el libro. | El índice trata jerarquía, escalas de espacio, color y profundidad. Su ejemplo público propone espacio, fondos o sombras como alternativas a acumular bordes. |
| [Don't Make Me Think, Revisited](https://sensible.com/dont-make-me-think/) — Steve Krug | Libro de pago; autor enlaza índice y capítulo de muestra. Página del autor leída, libro no leído. | Introducción breve a usabilidad web y móvil; primera compra recomendada para un marco compartido de comprensión. |
| [Designing Interfaces, 3.ª edición](https://www.oreilly.com/library/view/designing-interfaces-3rd/9781492051954/) — Jenifer Tidwell, Charles Brewer y Aynne Valencia | Libro de pago o acceso por suscripción; descripción e índice públicos leídos | Catálogo de patrones para navegación, formularios, organización y exposición progresiva de opciones. Consultar por problema concreto. |
| [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) | Recurso público gratuito; extracción del contenido no disponible en esta consulta | Referencia visual solicitada por el usuario. No se atribuyen aquí reglas detalladas que no se pudieron leer. No es una plantilla web. |

Referencia complementaria gratuita: [WCAG 2.2, referencia rápida de W3C](https://www.w3.org/WAI/WCAG22/quickref/) permite consultar contraste, teclado, foco, reflujo y alternativas a arrastrar.

### Inferences

- Orden recomendado: artículos de NN/g → muestra de Refactoring UI → capítulos específicos de libros según la tarea. No hace falta comprar ni cargar bibliotecas completas para iniciar.
- La profundidad visual solicitada puede convivir con una interfaz enfocada: NN/g aclara que priorizar información no obliga a usar un estilo plano. [Fundamento](https://www.nngroup.com/articles/ten-usability-heuristics/)
- Una guía de proyecto breve evita que cada agente reinterprete libros enteros y reinvente los mismos componentes.

### Gaps

- No se verificó el texto completo de los libros ni se descargaron copias comerciales. No se compararon precios, traducciones ni licencias de uso de sus activos.
- Apple devolvió una página que requiere JavaScript; el enlace Markdown no entregó contenido verificable en esta consulta. Por ello la influencia visual proviene de la preferencia del usuario, no de supuestas instrucciones de Apple.

## ¿Cómo traducimos las fuentes a reglas concretas de Otear?

### Takeaway

Las siguientes son decisiones de proyecto propuestas a partir de las necesidades conversadas. Sus criterios se apoyan en las fuentes; el recorrido y los componentes específicos requieren validación con productores.

### Cited Findings

- NN/g recomienda observar personas representativas completando tareas y corregir dificultades temprano. [Usability 101](https://www.nngroup.com/articles/usability-101-introduction-to-usability/)
- Las heurísticas piden estado visible, lenguaje familiar, control, consistencia y recuperación de errores. [10 heurísticas](https://www.nngroup.com/articles/ten-usability-heuristics/)
- W3C especifica acceso por teclado, foco visible y requisitos de contraste; también contempla alternativas a movimientos de arrastre. [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/)

### Inferences

1. **Tarea antes que tablero:** abrir la demo en finca/lotes/vuelos. Cada tarjeta o gráfico debe servir para decidir qué revisar o hacer; eliminar los que solo llenan espacio.
2. **Entrada reconocible:** mantener visible «Explorar demo» en landing; en el producto usar acciones concretas como «Comparar fechas» y «Preparar informe».
3. **Mostrar contexto:** finca, lote y fechas permanecen visibles al inspeccionar fotos. Opciones avanzadas se revelan donde hacen falta, sin ocultar la tarea principal.
4. **Demo honesta:** indicar «Datos de ejemplo» de forma persistente. Distinguir acciones simuladas de formularios reales y evitar comunicar análisis o subidas inexistentes como procesados.
5. **Comparación interpretable:** mismo lote, fechas rotuladas y encuadre coherente; incluir vista lado a lado. Un deslizador no puede ser la única interacción para comparar.
6. **Profundidad con función:** superficies redondeadas y sombras suaves para distinguir capas. Reservar elevación mayor a elementos superpuestos; las fotografías de campo aportan riqueza visual.
7. **Tokens compartidos:** una escala de espacio, tipografía, radios y elevación. Reutilizar componentes de la base escogida antes de crear variantes.
8. **Lectura accesible:** controlar contraste sobre imágenes; estado expresado con texto e icono además de color. Todos los controles tienen nombre, foco y operación por teclado.
9. **Acción con resultado:** confirmar observaciones y tareas; permitir cancelar o volver. Errores explican cómo continuar y conservan lo escrito.
10. **Validar trabajos reales:** probar localizar un vuelo, comparar dos fechas y preparar un informe; registrar éxito sin ayuda, errores y dudas. Interés comercial se mide aparte con solicitudes y compromisos.

### Gaps

- El prototipo aún debe comprobarse con usuarios representativos. Una revisión de agentes o accesibilidad automatizada no sustituye esa observación.
- No se ha fijado plantilla, paleta, familia tipográfica ni valores de tokens. La preferencia visual no es todavía un sistema de diseño aprobado.
