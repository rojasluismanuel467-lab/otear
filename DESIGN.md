# Lenguaje visual de Otear

Dirección de esta propuesta: archivo visual de operaciones, inspirado en la claridad de una fototeca y la profundidad de objetos cuidadosamente construidos. Se conserva navegación de aplicación convencional. El usuario autorizó construir directamente y ajustar sobre la demo.

## Fundamentos

- Fondo cálido muy claro `#f5f6f3`, superficies blancas, texto `#22322e`, secundario `#64716b`.
- Azul de marca `#1c6f8d` para acciones, selección y marca (sombra más oscura del azul cielo de la Fuerza Aérea Colombiana, `#81bfdb`, convertido desde las coordenadas CIELAB de la especificación ET-FAC-002-03); azul claro `#e2f0f6`. El verde queda para estados correctos, ámbar para pendientes y rojo sobrio para atención.
- Manrope autoalojada, cuerpo 14–15 px, encabezados 28–34 px, números tabulares en importes y fechas.
- Barra lateral clara de 238 px, encabezado contextual persistente y espacio de trabajo amplio. Sin panel inicial de métricas: cada ruta abre una tarea.
- Radios 12–22 px según nivel; bordes `#e3e8e1`; sombras con desplazamiento y difusión suave, nunca halos.
- Iconos Lucide, una sola familia, 18–20 px en controles, etiquetas visibles para acciones del dominio.

## Interacción distintiva

Una ruta y sus puntos vinculan mapa, lista de zonas y evidencia. Selecciones y paneles tienen continuidad breve; el contenido permanece visible por defecto. Movimiento CSS y HeroUI, sin nueva biblioteca de animación. Reducir recorridos espaciales con `prefers-reduced-motion`.

## Composición por módulo

Programación: calendario/lista y mapa protagonista; preparación de un vuelo en panel con etiquetas claras. Detalle: evidencia y mapa con hallazgos vinculados, tareas e informe revisable. Pagos: tabla legible y detalle de un cobro; solo cifras derivadas útiles. Documentos: inventario por sujeto y revisión contextual, sin dictámenes legales.

## Entrega

Datos de demostración permanentes y cambios de sesión explícitos. Selección compartida de proyecto/sector. Responsive: sidebar pasa a navegación compacta; columnas se apilan y los controles permanecen disponibles. Los medios de muestra son ilustrativos y no representan capturas técnicas del lugar mostrado en el mapa.

## Textura de carta

El fondo de la aplicación imita una carta aeronáutica: curvas de nivel reales de la cordillera (zona entre las cordilleras Occidental y Central, Valle del Cauca y Tolima) y una cuadrícula con marcas en cruz, ambas teñidas con el color de marca mediante una máscara CSS (`body::before` y `body::after` en `globals.css`; sobre `public/textures/chart-contours.svg` y `chart-graticule.svg`). Las curvas se calcularon con elevaciones de las [Terrain Tiles de AWS Open Data](https://registry.opendata.aws/terrain-tiles/) (datos de varias fuentes públicas, entre ellas SRTM), zoom 9, curvas cada 75 m y línea maestra cada 375 m. Las superficies blancas la cubren; solo se ve entre ellas, con muy poca opacidad.
