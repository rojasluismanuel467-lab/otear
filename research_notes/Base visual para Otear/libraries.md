# Librerías de componentes para Otear

Consulta: 25 de octubre de 2026. Investigación documental acotada: ocho páginas oficiales leídas, búsquedas adicionales en documentación y repositorios oficiales. No se instalaron paquetes, ejecutaron demos ni auditaron bundles. El ajuste visual es una valoración de diseño, no una medición técnica.

## ¿Qué bases ahorran definición visual y código?

### Takeaway
HeroUI es mi primera candidata por su acabado listo para usar y encaje visual con la preferencia por formas redondeadas y superficies suaves. Mantine es la alternativa práctica cuando pesan más los controles de una aplicación; shadcn/ui conserva ventaja si elegimos una plantilla de calidad que ya resuelva el estilo.

### Cited Findings
- **HeroUI v3**: biblioteca React con estilos, animaciones y componentes compuestos; usa Tailwind CSS 4 y React Aria Components, con manejo de foco, teclado y soporte para lectores de pantalla según su documentación. Está diseñada para React 19. [Introducción](https://heroui.com/en/docs/react/getting-started). Su tema usa variables CSS y clases BEM sobre Tailwind 4. [Theming](https://heroui.com/en/docs/react/getting-started/theming). Tiene calendarios y pestañas, útiles para consultar vuelos por fecha. [Calendar](https://heroui.com/en/docs/react/components/calendar), [Tabs](https://heroui.com/docs/react/components/tabs).
- **Mantine**: ofrece plantillas con dependencias y configuración preparadas, y permite añadir paquetes según necesidad. La página consultada muestra v9.7.4 y enlaces a guías de migración de versiones anteriores. [Getting started](https://mantine.dev/getting-started/). El tema central permite cambiar el radio predeterminado; los tokens incluyen sombras. [Theme object](https://mantine.dev/theming/theme-object/).
- **shadcn/ui**: entrega el código de los componentes, con estilos predeterminados y APIs compuestas; la documentación aclara que es una plataforma para construir la biblioteca propia, en vez de un paquete cerrado. [Introducción](https://ui.shadcn.com/docs). Ofrece tokens de color, radios derivados de una variable y presets visuales. [Theming](https://ui.shadcn.com/docs/theming).
- **Radix Themes**: biblioteca ya estilizada —distinta de Radix Primitives sin estilos—, instalable como `@radix-ui/themes` e importación de CSS. Incluye Card, Dialog, Tabs, Table, Select, Slider y controles de formulario. [Getting started](https://www.radix-ui.com/themes/docs/overview/getting-started). El componente Theme controla acento, grises, fondo de panel, escala y radio. [Theme overview](https://www.radix-ui.com/themes/docs/theme/overview).

### Inferences
- **HeroUI: esfuerzo visual bajo a medio.** Mi mejor ajuste para apariencia cuidada y suave sin diseñar cada botón. Hay que construir las composiciones específicas de Otear: biblioteca de vuelos, mapa de lotes, comparación de imágenes e informe.
- **Mantine: esfuerzo visual medio.** Elegir una vez radios, sombras, tipografía y verde de marca produciría una base coherente y utilitaria. Su apariencia inicial es más herramienta de trabajo que página de marca.
- **shadcn/ui: esfuerzo visual medio si partimos de una buena plantilla; mayor sin ella.** Tener código editable ayuda a los agentes, pero también implica asumir su mantenimiento. El acabado particular de Otear no aparece automáticamente al instalarlo.
- **Radix Themes: esfuerzo visual bajo para controles, medio para páginas.** Buen sistema compacto y coherente, aunque su catálogo de composición inicial es menor que el que suele buscarse al comprar una plantilla completa.
- Ninguna obliga a llenar el inicio de métricas. Para Otear propondría fotos, lotes y próximos pasos como contenido principal, en vez de tarjetas estadísticas decorativas.

### Gaps
- No se compararon tamaños de bundle, rendimiento móvil ni comportamiento real del recorrido. Tampoco se validó un componente de mapa o comparador antes/después: probablemente serán integraciones específicas en cualquier opción.
- No asigno puntuación de madurez por estrellas ni doy una versión exacta de instalación: debe comprobarse la versión publicada y fijar el lockfile al elegir.

## ¿Se integran con Next.js y permiten uso comercial?

### Takeaway
Las cuatro candidatas tienen licencias permisivas en sus proyectos abiertos. Las plantillas Pro y los kits de diseño son productos diferentes y su licencia debe revisarse por separado.

### Cited Findings
- HeroUI publica un starter de Next.js App Router o Pages Router mediante su CLI. La v3 no requiere Provider tras instalar e importar estilos; su guía advierte que la configuración de locale debe coincidir entre servidor y cliente. [Frameworks](https://heroui.com/en/docs/react/getting-started/frameworks). Su repositorio v3 usa Apache-2.0. [LICENSE](https://github.com/heroui-inc/heroui/blob/v3/LICENSE).
- Mantine publica starters oficiales Next.js, incluyendo `next-app-min-template` y variantes con Jest/Storybook. Sus componentes dependen de contexto y se renderizan en servidor y cliente, pero no funcionan como React Server Components; la guía explica las restricciones de sintaxis compuesta. [Next.js](https://mantine.dev/guides/next/). Todos los paquetes `@mantine/*` se distribuyen bajo MIT, y la documentación permite proyectos comerciales. [Licencia](https://mantine.dev/getting-started/#license).
- shadcn/ui tiene instrucciones oficiales de instalación Next.js. [Next.js](https://ui.shadcn.com/docs/installation/next). El repositorio abierto tiene licencia MIT. [LICENSE](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).
- Radix Themes se configura importando CSS y envolviendo el contenido con Theme. [Instalación](https://www.radix-ui.com/themes/docs/overview/getting-started). Su repositorio indica licencia MIT y mantenimiento por WorkOS. [Repositorio](https://github.com/radix-ui/themes).

### Inferences
- Uso comercial es viable conservando los avisos y cumpliendo las condiciones de cada licencia. No equivale a que fotografías, iconos externos, tipografías o plantillas comerciales incluidas tengan la misma licencia.
- Para reducir sorpresas elegiría un solo sistema base de controles; mezclar HeroUI, Mantine y shadcn para botones y campos similares añadiría trabajo de coherencia.
- La v3 de HeroUI ya es la vía descrita por su sitio actual; no conviene mezclar ejemplos NextUI/HeroUI v2 con la API nueva. La abundancia de documentación antigua en búsqueda hace relevante registrar las URLs de referencia.

### Gaps
- No se auditó el árbol transitivo ni se comprobó que un starter descargado conserve versiones, archivos y licencia esperados. Esto se verifica al preparar la base técnica, antes de invertir en pantallas.

## ¿Cuál elegir y qué debe verificarse antes de adoptarla?

### Takeaway
Preselección: **HeroUI + Next.js** para mayor afinidad estética; **Mantine + su starter mínimo Next.js** para mayor prioridad operativa. Mantendría shadcn/ui como alternativa si la búsqueda de plantillas encuentra una base visual completa claramente superior.

### Cited Findings
- HeroUI declara accesibilidad basada en React Aria para foco, teclado y lectores de pantalla. Esa declaración pertenece a los componentes base; no demuestra que toda una aplicación resultante cumpla una norma. [Introducción](https://heroui.com/en/docs/react/getting-started).
- shadcn/ui entrega código modificable y llama accesibles a sus componentes. Modificarlo pasa a ser responsabilidad del proyecto. [Introducción](https://ui.shadcn.com/docs).
- Radix Themes ofrece un conjunto de defaults y un playground para explorar combinaciones de variantes y tema. [Theme overview](https://www.radix-ui.com/themes/docs/theme/overview).

### Inferences
- Una prueba técnica suficiente antes de adoptar una base sería una sola pantalla: selector de finca/lote, fotos de vuelo, filtro de fecha y un diálogo para registrar hallazgo. Verificar móvil, teclado, foco, contraste y estados vacío/carga/error; después fijar tokens y componentes.
- El efecto tipo Apple debe expresarse en jerarquía, bordes, radios, tipografía y sombras discretas; las superficies, etiquetas y botones deben seguir siendo distinguibles. No recomiendo convertir toda la interfaz en vidrio ni neumorfismo de bajo contraste.
- La utilidad depende del recorrido y contenido. Ninguna librería sustituye observar si el productor encuentra un vuelo y entiende cómo registrar una observación.

### Gaps
- Esta preselección no es una auditoría de accesibilidad ni una aprobación de plantilla. Falta inspección visual junto al usuario y la prueba de composición descrita.
