# Plantillas y bloques de frontend para Otear

## ¿Qué productos dan código reutilizable para landing y aplicación?

### Takeaway
Las dos alternativas mejor documentadas en esta revisión son Shadcnblocks y Untitled UI React. HeroUI Pro merece una comparación visual con ambas, pero su precio y cobertura concreta para landing quedaron sin verificar. Investigación realizada el 25 de octubre de 2026; sin instalar dependencias, comprar ni auditar código.

### Cited Findings
- **Shadcnblocks:** bloques y componentes React reales, copiables o instalables mediante shadcn CLI; declara compatibilidad con Next.js, Vite, Astro y Remix. Ofrece categorías de marketing, application shell, tablas y galería, además de plantillas completas. Publica variantes para diferentes primitivas; no hace falta ni conviene instalar todas. — [Catálogo oficial](https://www.shadcnblocks.com/)
- El precio observado de Shadcnblocks es **US$149 Pro**, **US$299 Premium** y **US$399 Elite**, pago único por usuario en la modalidad estándar. Premium incluye plantillas y kits Figma/Admin. Hay bloques gratuitos; las plantillas individuales visibles suelen marcar US$79 y Admin Kit US$129. Precios sujetos a cambios. — [Planes y catálogo oficial](https://www.shadcnblocks.com/)
- **Untitled UI React:** colección de código React con TypeScript, Tailwind y React Aria; anuncia ejemplos tanto de landing como de aplicación, tablas, formularios y calendarios. Es un producto distinto de su kit de Figma. — [React oficial](https://www.untitledui.com/react)
- Su página de precios muestra **React FREE** y **React PRO SOLO US$349 promocional / US$499 de referencia**, pago único para un usuario; contiene componentes y ejemplos de páginas. La compra Figma aparece separada: no confundir un archivo de diseño con código React descargable. — [Precios oficiales](https://www.untitledui.com/pricing)
- **HeroUI Pro:** producto premium de componentes, plantillas y herramientas para agentes. La página muestra componentes de filtros, kanban y DataGrid; sus ejemplos completos destacados se orientan a correo, finanzas y chat. La modalidad Web Hero incluye componentes React y plantillas; se anuncia licencia perpetua y renovaciones opcionales para nuevas versiones. — [HeroUI Pro oficial](https://heroui.pro/)
- **Tailark:** registro de bloques, páginas e ilustraciones de marketing sobre shadcn y Next.js, compatible con Radix y Base UI. La portada enlaza previews Quartz, Libre y Dusk. — [Tailark](https://tailark.com/)
- El enlace público de **Tailwind Plus** redirigió al formulario de acceso. — [Página oficial observada](https://tailwindcss.com/plus)

### Inferences
- **Primera opción por ahorro de implementación: Shadcnblocks**, escogiendo pocos bloques de la misma familia visual, en lugar de arrancar con su Admin Kit completo. La combinación hero + formulario + shell + galería + tablas cubre mejor las tareas de Otear que una plantilla financiera.
- **Segunda opción por coherencia del producto: Untitled UI React**, especialmente si se valora que el sistema de componentes y ejemplos de web/aplicación partan del mismo proveedor. Su lenguaje puede adaptarse con radios y sombras consistentes, pero no debe confundirse con una copia de Apple.
- HeroUI Pro podría ahorrar composición en tareas y filtros frente a la librería gratuita, pero sus plantillas completas destacadas requieren transformar bastante el contenido para Otear. Una plantilla de correo/finanzas/chat no trae el modelo de lotes, vuelos ni imágenes.
- Tailark puede resolver la landing, pero por sí solo no establece una base completa para la aplicación. Añadirlo a otro ecosistema requiere revisar consistencia de tokens y componentes.

### Gaps
- No se auditó código, calidad de dependencias, semántica, navegación por teclado o desempeño de ninguno. “Responsive”, “accesible” y “production-ready” son afirmaciones del proveedor, no resultados de nuestras pruebas.
- HeroUI Pro: la extracción muestra los planes sin importe numérico y no permite cerrar precio. No se verificó su licencia completa ni una plantilla de marketing actual.
- Tailark: no se verificó precio ni licencia; no se afirma que todo su catálogo sea gratuito.
- Tailwind Plus: no se verificó disponibilidad de compra nueva ni precio; descartarlo provisionalmente de la shortlist adquirible.

## ¿Qué restricciones afectan al repositorio y a los agentes?

### Takeaway
Las colecciones premium permiten construir Otear, pero no publicar libremente su código como si fuera MIT. Mantener el repositorio privado es la elección conservadora si se adopta una colección comercial.

### Cited Findings
- Untitled UI permite proyectos personales y comerciales ilimitados, pero prohíbe exponer código fuente premium en repositorios públicos y redistribuirlo como biblioteca o plantilla. Algunos componentes están identificados expresamente como **MIT**, y esos se rigen por MIT. — [Licencia oficial](https://www.untitledui.com/license)
- Shadcnblocks permite productos finales comerciales ilimitados y modificarlos; prohíbe publicar componentes o derivados en repositorio público y redistribuirlos como kit/biblioteca/plantilla. Standard corresponde a una persona; Team permite hasta diez empleados/contratistas. Los bloques gratuitos se rigen por los términos del sitio, no por asumir la licencia de shadcn/ui. — [Licencia oficial](https://www.shadcnblocks.com/license)
- HeroUI Pro declara uso comercial para proyectos ilimitados. La FAQ distingue licencias v2 de la edición actual: la antigua compra no cubre automáticamente la nueva. — [FAQ oficial](https://heroui.pro/)

### Inferences
- Para agentes: fijar una sola colección aprobada y sus tokens, dejar enlaces a componentes concretos en una decisión del repo y evitar que cada agente incorpore un catálogo diferente.
- Que una colección se construya sobre una base MIT no convierte todos sus bloques premium en MIT. Antes de descargar, registrar producto, plan y licencia correspondiente.

### Gaps
- Ninguna verificación contractual específica del uso de código comercial a través de proveedores de IA. No asumir autorización para entrenar modelos o redistribuirlo; desarrollar Otear y publicar un catálogo de componentes son usos diferentes.

## ¿Qué diseño conviene elegir para ahorrar trabajo sin producir un dashboard genérico?

### Takeaway
Conviene adquirir o seleccionar piezas que resuelvan el recorrido de fotos, lotes y hallazgos, y reutilizar su sistema de estilos. Comprar cientos de pantallas no sustituye definir qué tareas debe completar la demo.

### Cited Findings
- Se pudieron abrir imágenes oficiales representativas de Shadcnblocks y Tailark; la imagen de documentación de botones de Untitled UI devolvió error de acceso. Estas imágenes son previews de marketing, no inspecciones de interacción. — [Previews de Shadcnblocks](https://www.shadcnblocks.com/), [previews de Tailark](https://tailark.com/)

### Inferences
- Dirección visual propuesta: fondos claros cálidos, radios moderados, sombras suaves visibles, navegación compacta y fotos grandes. Usar elevación para separar controles y paneles; evitar sombras en cada elemento y transparencias sobre fotografías que reduzcan legibilidad.
- Shortlist final: **Shadcnblocks** para mayor variedad de bloques y compatibilidad con una base shadcn; **Untitled UI React** si se prefiere una colección más unificada; **HeroUI Pro** como candidato estético a validar con su librería gratuita antes de considerar compra.
- No incorporar métricas inventadas, gráficos financieros ni tableros de ventas del ejemplo. La pantalla inicial debe mostrar lotes, último vuelo, fotos por revisar y la siguiente acción; incluso puede empezar directamente en la finca de muestra.
- Prueba previa a compra/descarga amplia: elegir de cada finalista un shell, una galería y un formulario; comprobar visualmente el mismo recorrido lote → fotos → hallazgo → informe. Elegir una dirección tras esa comparación corta, sin mezclar tres design systems.

### Gaps
- Falta una comparación visual controlada con los mismos contenidos reales de Otear. No hay evidencia todavía para prometer cuánto tiempo exacto ahorra cada opción.
