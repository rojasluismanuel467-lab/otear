# Lenguaje visual de Otear

Dirección de esta propuesta: archivo visual de operaciones, inspirado en la claridad de una fototeca y la profundidad de objetos cuidadosamente construidos. Se conserva navegación de aplicación convencional. El usuario autorizó construir directamente y ajustar sobre la demo.

## Fundamentos

- Fondo cálido muy claro `#f3f5f6`, superficies blancas, texto `#222b32`, secundario `#646c71`.
- Azul de marca `#1c6f8d` para acciones, selección y marca (sombra más oscura del azul cielo de la Fuerza Aérea Colombiana, `#81bfdb`, convertido desde las coordenadas CIELAB de la especificación ET-FAC-002-03); azul claro `#e2f0f6`. El verde queda para estados correctos, ámbar para pendientes y rojo sobrio para atención.
- Tipografía: Instrument Sans (principal) y EB Garamond cursiva (acento), ambas autoalojadas con `@fontsource-variable`. Cuerpo 14–15 px, encabezados 28–34 px, números tabulares en importes y fechas. Reglas de uso en «Tipografía».
- Barra lateral clara de 238 px, encabezado contextual persistente y espacio de trabajo amplio. Sin panel inicial de métricas: cada ruta abre una tarea.
- Radios 12–22 px según nivel; bordes `#e1e5e8`; sombras con desplazamiento y difusión suave, nunca halos.
- Iconos Lucide, una sola familia, 18–20 px en controles, etiquetas visibles para acciones del dominio.

## Tipografía

Dos familias, sin más. Tokens `--font-sans` y `--font-accent` en `globals.css`; la clase global `.accent` aplica el acento.

- **Instrument Sans (principal):** todo lo funcional. Navegación, títulos de página, tablas, formularios, botones, etiquetas, estados, alertas, errores, informes y cifras (con `tabular-nums`; la fuente los admite). Pesos 400–700: no existe 800, así que 750/800 se ven como 700. No usar menos de 12 px.
- **EB Garamond cursiva (acento):** en negrita (700) y en el azul de marca (`--accent`; `--sky` sobre fondos oscuros), para distinguirse del titular. Voz expresiva, una palabra o frase corta a 18 px o más. Hoy: la frase destacada de titulares de la landing, el saludo de Oto y la firma escrita. Nunca en datos, etiquetas, estados, botones, tablas ni párrafos: la cursiva cuesta más de leer y su altura de x es menor (por eso `.accent` la amplía a 1.14em).
- Si una palabra debe destacar en un párrafo, usar peso o color de marca, no cursiva.
- Se descartaron Exo 2 (no gustó como principal), Manrope (sin cursiva propia) y las cursivas manuscritas o modernas (Gabriela, Borel, Fraunces…).

### Escala de encabezados

Tokens `--heading-*` en `globals.css`. El tamaño depende del papel, no de la etiqueta (un `h2` puede ser de objeto o de sección). Todo encabezado: peso 700, `text-wrap: balance`. Criterio y comprobación en `docs/UX_GUIDELINES.md` («Títulos y encabezados»).

| Papel      | Token               | Tamaño             | Interletrado | Interlineado | Dónde                                                            |
| ---------- | ------------------- | ------------------ | ------------ | ------------ | ---------------------------------------------------------------- |
| Página     | `--heading-page`    | 26–32 px (`clamp`) | −0,03 em     | 1,2          | `h1` de `PageHeading`                                            |
| Objeto     | `--heading-object`  | 22–28 px (`clamp`) | −0,025 em    | 1,2          | Título del sitio, vuelo, factura o aeronave que ocupa el detalle |
| Sección    | `--heading-section` | 18 px              | −0,02 em     | 1,3          | Bloques del detalle y cabeceras de lista                         |
| Subsección | `--heading-sub`     | 16 px              | −0,01 em     | 1,35         | Tarjetas, paneles, formularios, estados vacíos                   |
| Grupo      | `--heading-group`   | 14 px              | 0            | 1,4          | Grupos dentro de una tarjeta (`h4`)                              |

El cuerpo es 14 px: por eso el grupo es el mínimo para un encabezado y nada por debajo se marca como `h*`. La landing tiene su propia escala (titulares grandes con `clamp`), con las mismas reglas de peso, interlineado y `text-wrap`.

## Texto de lectura

Tokens `--text-*` y `--measure-*` en `globals.css`. El ancho se limita en `ch`; Instrument Sans es angosta (1 ch ≈ 1,5 caracteres), así que se calibró midiendo en el navegador. Criterio y fuentes en `docs/UX_GUIDELINES.md` («Texto de lectura»).

| Papel                                             | Token                            | Valor          | Interlineado | Ancho (caracteres por línea) |
| ------------------------------------------------- | -------------------------------- | -------------- | ------------ | ---------------------------- |
| Línea de apoyo (bajo un titular de landing, hero) | `--text-lead` + `--measure-lead` | 17–19 px, 42ch | 1,6          | ~62–66                       |
| Cuerpo de lectura (tarjetas, pasos, contacto)     | `--text-body` + `--measure-body` | 16 px, 46ch    | 1,6          | ~68–72                       |
| Ayuda y detalle                                   | `--text-small`                   | 14 px          | 1,5          | ≤ `--measure-body`           |
| Notas y avisos que son frases                     | —                                | 13 px mínimo   | 1,5–1,6      | ≤ `--measure-body`           |
| Etiquetas y datos sueltos                         | —                                | 12 px          | 1,4          | —                            |

En la app todo `p` recibe `max-width: var(--measure-body)` por defecto (`:where(p)`, especificidad cero).

Sobre la textura de relieve de la landing, el encabezado de cada sección (`.sectionHead`) lleva un velo radial del color de fondo, más opaco en el centro y transparente en los bordes, para que el texto no compita con las curvas. Sobre tarjetas y paneles no hace falta.

## Cursor de la landing

En pantallas con mouse, la landing sustituye el cursor por un ala delta vista desde arriba, con forma de puntero: la punta es el punto de clic y solo se ladea un poco con la velocidad horizontal (`features/landing/drone-cursor.tsx`). Es oscura sobre fondos claros y clara sobre los oscuros (`data-cursor-theme="dark"`). Sobre enlaces, botones y campos de texto se oculta para dejar ver el cursor nativo. No existe en pantallas táctiles y no se mueve con `prefers-reduced-motion`.

## Interacción distintiva

Una ruta y sus puntos vinculan mapa, lista de zonas y evidencia. Selecciones y paneles tienen continuidad breve; el contenido permanece visible por defecto. Movimiento CSS y HeroUI, sin nueva biblioteca de animación. Reducir recorridos espaciales con `prefers-reduced-motion`.

## Composición por módulo

Programación: calendario/lista y mapa protagonista; preparación de un vuelo en panel con etiquetas claras. Detalle: evidencia y mapa con hallazgos vinculados, tareas e informe revisable. Pagos: tabla legible y detalle de un cobro; solo cifras derivadas útiles. Documentos: inventario por sujeto y revisión contextual, sin dictámenes legales.

## Entrega

Datos de demostración permanentes y cambios de sesión explícitos. Selección compartida de proyecto/sector. Responsive: sidebar pasa a navegación compacta; columnas se apilan y los controles permanecen disponibles. Los medios de muestra son ilustrativos y no representan capturas técnicas del lugar mostrado en el mapa.

## Avisos

Un aviso de página (banner) es persistente, opaco y no se descarta mientras el problema siga abierto. Usar la clase `.alert-banner` con `data-tone="warning|danger|calm"` y los tokens `--alert-*` de `globals.css`; el módulo solo pone la disposición.

- **Gravedad en tres niveles.** Ámbar (conviene atender), rojo (hay algo vencido o bloqueante) y azul tranquilo (sin pendientes). El tono del aviso es el del peor elemento que contiene.
- **Contraste medido.** Texto sobre fondo ≥ 8:1; barra lateral e ícono ≥ 3:1 sobre el fondo (WCAG 1.4.11); etiqueta pequeña sobre blanco ≥ 4,5:1. Si se cambia un token, recalcular.
- **El color nunca va solo (WCAG 1.4.1).** Cada aviso lleva ícono de forma distinta por gravedad, un título con el conteo y, en los elementos de la lista, una forma además del color (rombo, punto, círculo vacío) y su etiqueta escrita.
- **Orden por gravedad**, de mayor a menor. Título de una línea que dice cuántos y qué; una frase de siguiente paso; la nota legal aparte, bajo un filete.
- **Semántica.** Un aviso presente al cargar es una región con nombre (`aria-labelledby`), no `role="alert"`. Reservar `role="alert"` para lo urgente que aparece sin que la persona haya actuado y `role="status"` para confirmaciones; no mover el foco.
- **Cuándo no.** Una confirmación breve va en el aviso temporal (`notice`); un error de un campo va junto al campo; no usar un banner para decorar.

## Textura de carta

El fondo de la aplicación y de las secciones claras de la landing imita una carta topográfica: relieve sombreado en gris (`public/textures/chart-relief.webp`) bajo curvas de nivel de tinta gris (`chart-contours.svg`: intermedias finas, maestras más marcadas, cotas rotuladas en las maestras y puntos geodésicos con su altura), más una cuadrícula con marcas en cruz teñida con el color de marca (`chart-graticule.svg`). Se aplican con `body::before`/`body::after` en `globals.css` y con `.page` en `landing.module.css`. Las superficies blancas la cubren; solo se ve entre ellas.

Los datos son reales: elevaciones de las [Terrain Tiles de AWS Open Data](https://registry.opendata.aws/terrain-tiles/) (datos de varias fuentes públicas, entre ellas SRTM), formato Terrarium, zoom 9, zona entre las cordilleras Occidental y Central (Valle del Cauca y Tolima). Curvas cada 75 m y maestra cada 375 m; las cotas son alturas reales del modelo. `scripts/generate-chart-texture.py` los regenera (solo necesita Pillow; descarga las teselas a `.tiles-cache/`, ignorada por git). La intensidad ya viene horneada en los archivos (`RELIEF_ALPHA`, `MINOR_OPACITY`, `MAJOR_OPACITY`): es un fondo, no un mapa.

Cristal: la carta se ve como una foto con poca profundidad de campo. En la landing (`.page::before` en `landing.module.css`) el mapa completo, relieve y curvas de nivel, va desenfocado (`--landing-blur`, 6 px, con brillo reducido a ~0.66 para un gris medio, no oscuro) y lo de delante queda nítido. Encima van un grano fino (`glass-grain.svg`) y un brillo diagonal suave (`--glass-sheen`), nítidos. En la app (`html::before`/`body::before` en `globals.css`) las curvas siguen nítidas bajo un relieve a 4 px; no desenfocarlas allí. Las tarjetas y pasos de la landing son cristal (`backdrop-filter: blur(18px) saturate(1.5)` casi blancas (`--glass-tint` #f7f7f8 al 74 %) sobre el fondo gris medio, con borde oscuro fino y sombra; el texto secundario dentro de ellas y el que va directo sobre el fondo (`.sectionHead`) usan tonos más oscuros para mantener 4.5:1), y sin `backdrop-filter` o con `prefers-reduced-transparency` suben a ~95 % de opacidad. El fondo deriva muy despacio (`bokehDrift`, 48 s, solo `transform`) y se detiene con `prefers-reduced-motion`. No colocar texto pequeño ni datos sobre la textura sin una superficie debajo. Transiciones de la landing: entre superficies de distinto tono (hero oscuro → mapa claro → contacto blanco → pie oscuro) no hay cortes rectos; el degradado usa opacidad con curva seno (11 o 9 paradas, pendiente nula en los extremos, sin color liso intermedio) y el grano lo rompe donde hay tonos oscuros. Las tarjetas redondeadas (demo) sí conservan su borde.
