# Simulación de vuelo sobre el mapa: estado del arte y propuesta

Fecha: 30 de octubre de 2026. Sección de la demo: `/vuelos`, pestaña Resumen (mapa del vuelo). Estado: **investigación; nada implementado**.

## Qué se pide

En el historial de un vuelo, el mapa tendría una opción «Simulación»: un dron aparece sobre la imagen satélite y recorre la ruta del vuelo, como una repetición animada. El dibujo del dron debe verse realista.

## Cómo lo hacen otras plataformas

Fuentes consultadas por búsqueda web (resúmenes de terceros, no documentación oficial salvo donde se indica). Lo que no se pudo confirmar está marcado.

| Plataforma                                                                                                                                                           | Qué ofrece                                                                                                                                                                                                | Qué aprendemos                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [PhantomHelp Log Viewer](https://phantompilots.com/threads/free-online-dji-flight-log-viewer.68588/post-683689)                                                      | Mapa con la ruta, tabla de datos y un deslizador que reproduce el vuelo; indicador de palancas en una esquina; exporta KML.                                                                               | El patrón mínimo: mapa + línea de tiempo arrastrable + datos del instante.                                            |
| [Airdata, 3D Flight Player](https://dronelife.com/2026/03/25/airdata-3d-flight-player-drone-log-analysis/) (marzo 2026)                                              | Reproductor 3D: mapa terreno/satélite/oscuro, clic en el dron para seguirlo, botón «Camera POV» que proyecta el campo de visión de la cámara sobre el mapa, tabla de telemetría.                          | El campo de visión sobre el terreno es lo que más se valora en auditoría. Seguir al dron es un modo de cámara aparte. |
| [DroneBundle](https://dronebundle.com/blog/flight-replay)                                                                                                            | Repetición en mapa con línea de tiempo, marcadores de fases y eventos (clic salta a ese segundo), panel con altura, velocidad, rumbo, batería, distancia al despegue. Vista 3D con cámara que sigue sola. | Los marcadores de eventos sobre la línea de tiempo convierten la repetición en algo navegable, no solo un video.      |
| [Open DroneLog](https://github.com/arpanghosh8453/open-dronelog) / [DJI Logbook](https://awesome.ecosyste.ms/projects/github.com%2Farpanghosh8453%2Fdji-logbook)     | Código abierto. Reproducir/pausar, deslizador, velocidad de 0,5× a 16×, telemetría en vivo, marcador 3D que sigue la altura. Usa MapLibre + deck.gl.                                                      | Rango de velocidades y marcador con altura son estándar. Es la referencia técnica más cercana, pero sobre MapLibre.   |
| [ArduPilot UAV LogViewer](https://ardupilot.org/copter/docs/common-uavlogviewer.html) / PX4 Flight Review (Cesium)                                                   | Play, pausa, reversa, velocidad; vista 3D con terreno.                                                                                                                                                    | Reversa y terreno 3D existen, pero exigen un motor 3D de globo (Cesium).                                              |
| [DJI FlightHub 2](https://enterprise-insights.dji.com/blog/new-update-flighthub2-april) (nota de versión, mayo 2025)                                                 | Reproducción en tiempo real de la trayectoria con posición del dron y orientación de la cámara según el tiempo de vuelo. No pude ver la interfaz.                                                         | Los clientes empresariales esperan repetición dentro de la plataforma de gestión, no solo en una herramienta aparte.  |
| [Litchi Hub](https://forum.flylitchi.com/t/is-there-a-litchi-virtual-mission-feature-for-hub-2-0/24116)                                                              | Simulación de la misión sobre imágenes de Google Earth, antes de volar. Crítica de usuarios: no respeta el campo de visión de la cámara elegida.                                                          | Una simulación de planificación sin cámara real engaña; hay que decir qué sí y qué no representa.                     |
| [Sairone Atlas](https://saiwa.ai/events/sairone-atlas-flight-path/) y [FlytBase Coverage Intelligence](https://docs.flytbase.com/flex-factory/coverage-intelligence) | Animan el dron por la trayectoria real y dibujan la cobertura de la cámara para ver huecos.                                                                                                               | Mostrar qué parte del terreno quedó cubierta es útil de verdad; se conecta con nuestro «Antes de pagar» (hectáreas).  |
| Aplicación de agroquímicos ([AgSpray View](https://www.scribd.com/document/804083515/AgSprayViewGuide))                                                              | Separa el trazo de vuelo del trazo donde se aplicó producto.                                                                                                                                              | En agro la pregunta es «qué se cubrió», no «por dónde pasó el dron».                                                  |
| DroneDeploy y Pix4D                                                                                                                                                  | **No encontré** repetición ni simulación de vuelo documentada; solo planificación y procesamiento.                                                                                                        | Hueco de mercado: nadie muestra la repetición unida a lotes, hallazgos y facturación.                                 |

### Patrones comunes

1. **Controles:** reproducir/pausar, deslizador de tiempo, velocidad (de 0,5× a 16×), reiniciar.
2. **Línea de tiempo con eventos:** fases del vuelo y momentos notables, clicables.
3. **Panel de datos del instante:** altura, velocidad, rumbo, batería, distancia al despegue.
4. **Estela:** la parte ya recorrida se dibuja distinta de la pendiente.
5. **Modo seguir:** el mapa se centra en el dron; se puede soltar.
6. **Campo de visión / cobertura** proyectado al suelo (Airdata, FlytBase).
7. **El ícono del dron es simbólico:** ninguna plataforma lo dibuja a escala real (un Mavic mide ~0,35 m y a zoom de predio sería invisible). Se dibuja a tamaño fijo en pantalla.

### Lo que no hace nadie y nosotros sí podemos

- Unir la repetición con **zonas, hallazgos e informe**: al pasar sobre una observación, esta se enciende y se puede abrir.
- Pintar la **cobertura** a medida que avanza y compararla con lo contratado (`billing/coverage.ts`).
- Mostrar el **dron real que voló** (por `aircraftId`) y no un ícono genérico.

## Cómo hacerlo nosotros

### Datos: qué existe y qué falta

`Flight.route` son entre 8 y 12 puntos (cuatro pasadas de barrido, `coverageRoute` en `geo.ts`; en carreteras sigue el eje). `duration` (min), `distance` (km), `photoCount` y `log.maxAltitudeM` están sembrados. **No hay una traza registrada** con tiempo, altura y velocidad.

Propuesta: un módulo puro `features/flights/simulation/track.ts` (con pruebas, como `geo.ts`) que:

- Toma `route` y construye una trayectoria con **esquinas redondeadas** (un multirrotor frena y gira; un ala fija traza arcos amplios).
- Reparte el tiempo para que `distance` y `duration` cuadren con la ficha del vuelo.
- Define **fases**: despegue y ascenso, recorrido, regreso, descenso y aterrizaje.
- Genera altura, velocidad y batería **derivadas** de `log` (máxima altitud, baterías); `positionAt(t)` devuelve posición, rumbo y ritmo.
- Calcula los **instantes de captura** (por `photoCount` repartido sobre la distancia) y cuándo pasa por cada hallazgo.

Todo esto se rotula como **«Simulación ilustrativa a partir de la ruta planificada; no es el registro real del vuelo»**, igual que el resto de la demo. Con datos reales, la misma interfaz leería la traza del archivo de registro (formatos DJI `.txt`, `.SRT`, KML/GPX) sin cambiar la pantalla.

### El mapa

El mapa es Leaflet (`site-map-canvas.tsx`). Opciones consideradas:

| Opción                                                                                            | A favor                                                    | En contra                                                                                         |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Quedarnos en Leaflet** y mover un elemento propio con `requestAnimationFrame`                   | Sin dependencias nuevas; el mapa ya tiene satélite y zonas | Hay que proyectar lat/lng a píxeles en cada cuadro (`latLngToContainerPoint`), es poco y sencillo |
| Plugins ([Leaflet.MovingMarker](https://github.com/syonfox/Leaflet.MovingMarker), AnimatedMarker) | Mueven y giran un marcador                                 | Marcador plano de imagen; no dan velocidad variable, fases ni línea de tiempo; poco mantenidos    |
| Pasar a MapLibre + deck.gl, o Cesium/Threebox                                                     | Terreno 3D, altura real, cámara inclinada                  | Migrar el mapa de todo el producto; peso grande; fuera del alcance de una demo                    |

**Recomendación:** quedarnos en Leaflet. El dron es un lienzo pequeño (~120–160 px) posicionado con `transform` sobre el mapa y actualizado en cada cuadro; la estela y la cobertura son polilíneas de Leaflet que crecen con el tiempo. La vista 3D con terreno queda como propuesta a validar, no se construye.

### El dibujo realista del dron

Ya existe la técnica: la landing dibuja la aeronave «Viper» con three.js desde arriba (`features/landing/flight-scene.ts`): cámara ortográfica, rumbo y alabeo derivados de la velocidad real en pantalla, sombra dibujada como el mismo modelo aplanado con máscara de estarcido para que no se oscurezca dos veces. Eso se reutiliza:

- **Modelo (decidido):** la aeronave de la marca, «Viper» (`buildViper` en `drone-model.ts`, con el logo en el ala izquierda), y no un dron genérico ni los CAD de DJI. No tiene el problema de licencia y ya está dibujada con detalle. Como no es la aeronave que voló, se rotula «Aeronave ilustrativa Otear», y un interruptor «Mostrar el equipo del vuelo» la cambia por la familia genérica de ese vuelo (`aircraftId` → `DroneKind`). Ver «Viper en la simulación» más abajo.
- **Vista:** cenital (desde arriba). Sin inclinación, girar el rumbo es una rotación 2D exacta y no hay que renderizar un modelo por ángulo.
- **Realismo:** hélices con desenfoque de giro (translúcidas, ya existen en `drone-model.ts`), sombra desplazada según la altura simulada (más alto, más separada), alabeo leve en los giros, luces de posición, entorno `RoomEnvironment` ya usado.
- **Sin WebGL** (el navegador integrado lo tiene desactivado): respaldo con una silueta SVG cenital, estática, que gira igual. Nunca queda un hueco vacío.
- **Tamaño fijo en pantalla** (~56–72 px), con la nota «no está a escala».

**Punto abierto de licencia:** los cuatro modelos CAD de DJI (`public/models/dji/`) son los más realistas, pero su licencia está sin resolver (`investigacion-listas-informes-modelos-3d.md`). Si la simulación los usa, hereda esa restricción. Los modelos procedurales genéricos no la tienen, pero hoy son más simples: habría que pulirlos (carcasa, cardán, tren de aterrizaje, luces) para que se lean realistas.

### La interfaz

Dentro de la pestaña Resumen, sobre el mapa existente (sin pantalla nueva ni pestaña quinta):

- Botón **«Simulación»** junto al selector de capas del mapa. Al activarlo aparece una **barra de reproducción** bajo el mapa.
- **Barra:** reproducir/pausar, reiniciar, velocidad (1×, 2×, 4×, 8×), línea de tiempo con marcadores (despegue, cada hallazgo, regreso, aterrizaje), tiempo transcurrido, interruptor «Seguir al dron».
- **Panel del instante:** altura, velocidad, batería, fase, distancia al despegue (todo marcado como simulado).
- **Mapa:** estela recorrida, ruta pendiente en línea punteada, fotografías como destellos en el punto de captura, hallazgos que se encienden al pasar y se pueden abrir, y **cobertura pintada** detrás del dron (ancho según la altura y el sensor).
- Solo en vuelos **completados** como repetición; en los **programados**, como «vista previa de la ruta» con otro rótulo.

### Accesibilidad y movimiento

- La simulación **no arranca sola**: se inicia con un botón, y tiene pausa visible (criterio 2.2.2 de WCAG, ver [Hidde de Vries](https://hidde.blog/meeting-2-22-pause-stop-hide-with-prefers-reduced-motion/)).
- Con «reducir movimiento»: sin animación continua; se avanza con el deslizador o con pasos (teclas ← →), y el dron salta de posición.
- Teclado: espacio reproduce/pausa, ← → avanzan, el deslizador es un `input range` con valor leído («Minuto 12 de 38, fase recorrido»).
- La información no depende solo del movimiento: la tabla de fases y eventos se ofrece como texto debajo.
- Tamaños de texto de 12 px o más; botones táctiles de 44 px.

### Pruebas

Lógica pura en `track.ts`: la trayectoria respeta distancia y duración, el rumbo es continuo, las capturas y hallazgos se disparan en orden, `positionAt` es monótono. El componente del mapa no se prueba con instantáneas.

## Tecnologías y librerías compatibles con Next.js

Hoy el proyecto solo tiene `leaflet` 1.9.4 y `three` 0.186 (más HeroUI, React 19 y Next 16.4). No hay `react-leaflet`, Turf ni librería de animación; el mapa se arma de forma imperativa en `useEffect` y se carga con `next/dynamic` y `ssr: false`. Nada de lo de abajo se probó en este repositorio; donde la fuente no habla de Next 16 lo digo.

| Necesidad           | Opción                                                                                                                                            | Compatibilidad / nota                                                                                                                                                                                                                                                                                                                 | Veredicto                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Mapa                | Leaflet imperativo (lo actual)                                                                                                                    | Ya funciona con `ssr: false`. Leaflet toca `window` al importarse, por eso el mapa vive en un componente cliente cargado con `next/dynamic`.                                                                                                                                                                                          | **Mantener**                                     |
| Mapa                | [react-leaflet 5](https://raw.githubusercontent.com/PaulLeCam/react-leaflet/master/CHANGELOG.md)                                                  | La v5 exige React 19. No encontré una fuente que lo pruebe con Next 16. Un autor de Next 16 prefirió Leaflet puro. Aporta poco aquí: cambiaría lo que ya funciona.                                                                                                                                                                    | No                                               |
| Mapa 3D             | [MapLibre GL JS + react-map-gl](https://deck.gl/docs/developer-guide/base-maps/using-with-maplibre)                                               | Es la base que recomienda deck.gl. Terreno 3D, cámara inclinada, rotación del mapa. Implica reescribir `site-map-canvas`, `parcel-map-canvas`, basemaps, zonas y la edición de rutas. Las teselas satelitales de Esri se usan igual.                                                                                                  | Propuesta futura, no ahora                       |
| Capas animadas      | [deck.gl](https://deck.gl/docs/api-reference/geo-layers/trips-layer) `TripsLayer` (estela con marcas de tiempo) + `ScenegraphLayer` (modelo glTF) | `TripsLayer` se anima con un `currentTime` que uno avanza; `ScenegraphLayer` pone modelos glTF con iluminación PBR. Son las piezas exactas del problema, pero van sobre MapLibre/Google Maps, no sobre Leaflet. No hay guía específica para Next en las fuentes.                                                                      | Solo si se migra a MapLibre                      |
| Globo 3D            | [CesiumJS](https://cesium.com/learn/ion/stories-time-dynamic/) (+ Resium para React)                                                              | Reloj, línea de tiempo, modelo glTF con orientación por velocidad, formato CZML para trayectorias con tiempo. Es lo más completo, y lo más pesado (trabajadores y recursos estáticos). Las fuentes no cubren Resium ni Next.                                                                                                          | Demasiado para una demo                          |
| Dron 3D en mapa     | [Threebox](https://github.com/peterqliu/threebox/blob/master/docs/Threebox.md)                                                                    | Inserta three.js como capa de Mapbox GL (modelos GLB/OBJ/FBX). Es para Mapbox GL, no Leaflet; no hallé un equivalente mantenido para Leaflet, hay que armar el puente a mano.                                                                                                                                                         | No                                               |
| Dron 3D en pantalla | **three** ya instalado                                                                                                                            | Mismo método de la landing: lienzo pequeño que se mueve con `transform`.                                                                                                                                                                                                                                                              | **Usar**                                         |
| React + three       | [@react-three/fiber 9 + drei 10](https://github.com/pmndrs/react-three-fiber/releases/tag/v9.5.0)                                                 | R3F 9 funciona con React 19.0–19.2; no hallé fuente que lo pruebe con Next 16. El repositorio ya usa three imperativo con `next/dynamic` y tiene tres escenas escritas así; sumar R3F añade dependencias sin resolver un problema.                                                                                                    | No                                               |
| Marcador que gira   | [Leaflet.MovingMarker](https://github.com/syonfox/Leaflet.MovingMarker), AnimatedMarker, Leaflet.motion                                           | Mueven un marcador de imagen y giran según el rumbo, pero no manejan velocidad variable, fases ni línea de tiempo, y no sirven para un lienzo WebGL. Se resuelve con ~40 líneas propias (rumbo con `atan2`, `transform: rotate`).                                                                                                     | No                                               |
| Geometría           | [Turf.js](https://github.com/Turfjs/turf) (`@turf/along`, `bearing`, `length`, `bezier-spline`, `line-chunk`)                                     | Paquetes sueltos que se pueden instalar uno a uno, y se reparte el peso. Hay que verificar el tamaño real con un build. `src/lib/geo.ts` ya tiene proyección local, interpolación sobre línea y barrido; solo faltaría suavizar esquinas y calcular rumbo.                                                                            | **Opcional**: mejor escribirlo puro, con pruebas |
| Animación           | Motion, GSAP, Lottie                                                                                                                              | El proyecto decidió «sin librería de animación» (CLAUDE.md). Un bucle de `requestAnimationFrame` con reloj propio basta, y es lo que ya usan la landing y el visor 3D.                                                                                                                                                                | No                                               |
| Reloj / escrubbing  | `requestAnimationFrame` + estado en `useRef` + `useSyncExternalStore`                                                                             | El tiempo de simulación cambia 60 veces por segundo; no debe pasar por `useState` en cada cuadro. Solo se actualiza el React del panel (~10 Hz). Línea de tiempo y panel como HTML; si hubiera cientos de marcadores se dibujaría en canvas ([como recomienda Cesium](https://stevenpg.com/posts/stop-reinventing-cesium-timeline/)). | **Usar**                                         |
| Sprites cenitales   | Imágenes WebP pre-renderizadas de cada modelo, o SVG                                                                                              | Respaldo para cuando WebGL no está disponible. Se pueden generar una vez con three desde `drone-model.ts` y guardar en `public/images/`.                                                                                                                                                                                              | **Respaldo**                                     |

### Conclusión de la comparación

Con lo que ya hay (Leaflet, three, CSS, `requestAnimationFrame`) **no hace falta instalar ninguna dependencia nueva** para la primera versión. Las librerías que sí harían un salto de calidad (deck.gl `TripsLayer` + `ScenegraphLayer` para estela y modelo 3D, terreno 3D) dependen de migrar a MapLibre: es una decisión de producto aparte, que conviene tomar cuando haya trazas reales con altura que justifiquen el 3D.

Dos riesgos técnicos a vigilar al implementar:

- **WebGL desactivado** en el navegador integrado: el dron cae en el respaldo SVG; hay que probarlo con Chromium vía CDP y SwiftShader, como indica CLAUDE.md.
- **Sincronía lienzo ↔ mapa**: al hacer zoom o arrastrar, Leaflet cambia la proyección; hay que reposicionar el lienzo en `move`/`zoom` además de en cada cuadro, y compensar el desfase de la animación de zoom.

## Decisiones tomadas (30 de octubre de 2026)

1. **Dron:** modelo 3D de la marca Otear (Viper).
2. **Cobertura pintada:** entra en la primera versión.
3. **Vuelos programados:** usan el mismo reproductor, rotulado «Vista previa».
4. **Alcance:** la simulación va en Resumen **y** en Observaciones.

## Mejora práctica: técnica y de negocio

### Lo que dicen las fuentes

- **La repetición, sola, es lo común.** Airdata, PhantomHelp, DroneBundle y las herramientas abiertas la ofrecen, y están pensadas para quien **vuela** (pilotos y operadores). Un competidor que solo repita el vuelo no se diferencia.
- **El valor está en la evidencia, no en la animación.** Las fuentes (casi todas blogs de proveedores, sin estudios independientes) coinciden en que el registro de vuelo se usa para auditoría («qué se planeó, qué se revisó, qué se aprobó y qué pasó», [DroneDesk](https://blog.dronedesk.io/how-to-build-a-drone-pilot-flight-log-that-is-audit-ready/)), para reclamos de seguro ([SkyWatch](https://www.skywatch.ai/blog/commercial-drone-record-keeping-compliance-documentation)) y para disputas, y que un registro unido a la lista de preparación y a las aprobaciones pesa más que uno suelto.
- **Disputas por área:** no encontré fuentes sobre disputas de facturación por hectárea en aspersión con dron. Lo más cercano: la verificación de aplicaciones aéreas es una necesidad documentada en los ingenios colombianos (el equipo guarda altura y velocidad pero no calcula el área; ver `mercado-cana-ingenios-y-sistemas-existentes.md`), y un pliego público de aspersión fija **500 USD por acre rociado fuera de los límites** ([RFP citado en la búsqueda](https://vmqshpndzyrgheklpqkq.supabase.co/storage/v1/object/public/opportunity-attachments/mi_sigma_vss/RFP-751-260000002336-1/RFP%2026-2336%20Drone%20Spray%20FY26.docx)): el límite del lote y la traza son la prueba. Una guía de precios recomienda definir en la orden de trabajo qué se considera acre facturable para evitar discusiones.
- **Enlaces compartibles:** SkeyDrone ofrece un enlace público a un vuelo con repetición, y DroneBundle un portal de clientes con niveles de acceso ([DroneBundle](https://dronebundle.com/blog/drone-client-portal)). Es evidencia de que **compartir con quien contrata** es una función que los proveedores venden. No pude verificar que Skydio o DroneDeploy tengan un enlace de repetición para clientes.
- **Conservación:** una presentación forestal de EE. UU. exige conservar los registros de aplicación **2 años** ([Western Forestry](https://www.westernforestry.org/wp-content/uploads/2024/10/2_UAV_Ferrigan.pdf)). No pude confirmar el plazo en Colombia (ver `personalizacion-por-empresa.md` sobre el RAC 100, cuyo enlace oficial dio 404): hay que consultarlo con la Aerocivil o un abogado aeronáutico antes de prometer nada.

### Lo que esto implica: el riesgo principal

La trayectoria de la demo sale **de la ruta planificada**, y esa ruta ya cubre la zona por construcción. Si se calculara la cobertura a partir de ella y se mostrara junto a «Antes de pagar», el sistema **se aprobaría a sí mismo**: sería una simulación presentada como medición. Por eso:

- La cobertura pintada se rotula **«Cobertura simulada a partir de la ruta»** y es solo visual. **No alimenta** `billing/coverage.ts`, que sigue usando lo que declara el operador (`coveredHa`).
- Cada traza lleva su **origen** (`planned` | `operator`). Con `operator` (traza real cargada) el rótulo cambia a «Cobertura medida con la traza del operador» y entonces sí puede compararse con lo pedido y lo facturado. El tipo `Track.source` lo hace imposible de confundir.
- El número de hectáreas de la simulación no se escribe en ninguna factura ni informe.

### Mejoras prácticas, en orden

| #   | Mejora                                                                                                                                                                                                                                                                                                                                                                                                     | Técnica                                                                                                                                                                                                     | Negocio                                                                                                                                                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Un solo reproductor para las dos pestañas.** El estado de reproducción (tiempo, velocidad, seguir) sube a `FlightContent`; los dos mapas lo leen. En Observaciones, elegir un hallazgo salta al instante en que el dron pasó por él.                                                                                                                                                                     | Controlador puro (`playback.ts`) + `useSyncExternalStore`; los mapas solo se suscriben. Evita que dos mapas tengan relojes distintos.                                                                       | Une «qué pasó» con «dónde y cuándo se detectó»: es lo que ningún visor de registros de vuelo muestra.                                                                                                                     |
| 2   | **Traza con origen y rótulo honesto** (`planned` ahora, `operator` después).                                                                                                                                                                                                                                                                                                                               | El módulo `track.ts` produce la misma estructura venga de donde venga; la pantalla no cambia al llegar datos reales.                                                                                        | Evita el riesgo de arriba y deja el camino abierto a la medición real, que es donde está el valor.                                                                                                                        |
| 3   | **Cobertura con los límites del lote:** pintar distinto lo cubierto dentro de la zona, lo no cubierto (huecos) y lo que cae fuera.                                                                                                                                                                                                                                                                         | Se calcula por **rejilla** (celdas de pocos metros sobre el recuadro de la zona) usando la proyección local de `geo.ts`: más simple y robusto que unir polígonos, y sin Turf. Pruebas con zonas de ejemplo. | Responde las dos disputas típicas: «¿se aplicó todo lo pedido?» y «¿se salió del lote?». Se conecta con el pliego de 500 USD/acre fuera de límites y con «Antes de pagar».                                                |
| 4   | **Cuando haya traza real:** cargar GPX, KML o CSV primero (formatos abiertos; el proyecto ya lee KML/GeoJSON en el mapeo), el `.SRT` del video de DJI después. Los registros `.txt` de DJI aparte: un foro indica que las versiones recientes cambiaron el cifrado ([PhantomHelp](https://phantompilots.com/threads/free-online-dji-flight-log-viewer.68588/post-683689)), sin verificar el estado actual. | Un lector por formato que devuelve `Track`, con pruebas; nada de enviar archivos a servidores (se lee en el navegador, como los modelos 3D).                                                                | Es la **función de pago**: la repetición simulada sirve para validar interés; la medida con la traza del operador es lo que un ingenio o un cañicultor pagaría por tener antes de aprobar una factura.                    |
| 5   | **Sellar la traza y compartirla.** Huella SHA-256 de la traza cargada (ya existe en `traceability/`) y un resumen de solo lectura para el otro actor de «Ver como» (cañicultor/ingenio).                                                                                                                                                                                                                   | Reutiliza el sellado de documentos; el enlace real requiere servidor, así que en la demo es una vista, no un enlace.                                                                                        | Convierte la traza en prueba que no puede cambiarse sin que se note, y da al que contrata lo que hoy solo tiene el operador.                                                                                              |
| 6   | **Vender «verificación», no «animación».** La simulación es el gancho visual; el paquete es traza + cobertura + huella + enlace.                                                                                                                                                                                                                                                                           | La licencia por plan (`config/licence.ts`) puede marcarlo: simulación en el plan base, traza real y verificación en el profesional o empresarial. Es solo un interruptor de demo.                           | Propuesta a validar con entrevistas; **nada de esto está construido** ni medido (no hay analítica). Preguntas para el sector: ¿cómo verifican hoy el área?, ¿cuántas disputas hay por temporada?, ¿pagarían por la traza? |

### Viper en la simulación: ventajas y cuidados

- **A favor:** sin riesgo de licencia, ya detallada, y refuerza la marca cada vez que se reproduce un vuelo (y en cualquier vista compartida).
- **Cuidado 1, honestidad:** la Viper es un ala planeadora y los vuelos de ejemplo son de multirrotores (Mavic 3 Enterprise). Por eso se rotula «Aeronave ilustrativa Otear» y se ofrece el interruptor para ver el equipo del vuelo. No debe leerse como «este fue el dron que voló».
- **Cuidado 2, movimiento:** un ala fija no se detiene ni gira en el sitio. La trayectoria usa **un radio de giro mínimo** en cada extremo del barrido (esquinas redondeadas), lo que además se ve natural para cualquier aeronave; el alabeo de la Viper sale del giro. Para la familia multirrotor se permite frenar más en las esquinas.
- **Cuidado 3, escala:** la Viper mide ~5,5 unidades de envergadura en el modelo; en pantalla va a tamaño fijo (~64–80 px) con la nota «no está a escala».
- **Cuidado 4, reglas del proyecto:** `CLAUDE.md` dice que la Viper es solo de marca y que «no hay catálogo, partes ni marcas que se refieran a ella». Usarla en la simulación **amplía** ese uso; sigue sin ser una familia de flota (no entra al catálogo ni a Equipos). Conviene actualizar `CLAUDE.md` cuando se construya.

## Casos de ejemplo realistas

Una simulación hace visible cualquier defecto de los datos de ejemplo: si la ruta es absurda, el dron la recorrerá de forma absurda. Por eso los proyectos de ejemplo se corrigen **antes** de construir el reproductor. Lo que se ve hoy (captura de la pestaña Resumen, vuelo «Seguimiento programado» de Santa Rita, y la vista satelital del vuelo del 24 de octubre):

### Qué está mal

1. **La ruta no pertenece a los lotes.** `routeFor` (`demo-data.ts`) traza cuatro pasadas sobre la envolvente convexa de **todas** las zonas del sitio. Las líneas no son paralelas a los lotes, cruzan sus límites y dejan puntos en los bordes y fuera de ellos, con conectores en diagonal.
2. **Todos los vuelos de un sitio vuelan la misma ruta**, aunque cada uno tenga sus propias zonas (`route: routeFor(site)` en `common`). Un vuelo del Lote 3 aparece cruzando también los Lotes 4 y 5.
3. **Los números no cuadran con la geometría.** El vuelo sembrado dice 6,1 km, 38 min y 118 fotos, y la ruta dibujada mide aproximadamente la mitad (estimación a ojo de la captura, por verificar con `lineLengthKm`). El reproductor expondría la diferencia en la velocidad.
4. **El patrón no corresponde al sector.** Vigilancia usa el mismo barrido de la envolvente en vez de un patrullaje del perímetro; construcción no tiene pasada de fachada ni órbita; carreteras sigue el eje con una sola línea.
5. **Cantidad de proyectos:** el código tiene **4** proyectos de ejemplo (Hacienda Santa Rita, Troncal de Occidente, Obra Alameda, Parque del Pacífico), no 5. **Falta definir cuál es el quinto** (ver decisiones).
6. **Geometría de los lotes:** sobre el mapa de calles, los Lotes 4 y 5 rozan manzanas urbanas de Guacarí; en satélite parecen campos. Hay que revisar los cuatro sitios sobre imagen satelital y ajustar los contornos a parcelas plausibles (en la caña del Valle una suerte suele ser de varias hectáreas; confirmar con el sector).

### Qué hacer

Un módulo puro `features/flights/mission-plan.ts` (con pruebas, como `geo.ts` y `coverage.ts`) que **genera la ruta y los números de cada vuelo** a partir de sus zonas, el sector y la cámara. Las fórmulas son las de planificación fotogramétrica ([Penn State](https://courses.ems.psu.edu/geog892/book/export/html/658)): GSD = altura × tamaño del sensor / distancia focal; ancho de huella = GSD × píxeles; separación entre líneas = huella × (1 − traslape lateral); distancia entre fotos = largo de huella × (1 − traslape frontal). Los traslapes de partida (70–75 % lateral y frontal, 80–85 % frontal en terreno difícil) salen de la [ayuda de DroneDeploy](https://help.dronedeploy.com/hc/en-us/articles/22589691164183-What-is-the-recommended-front-and-side-overlap). Los datos de cámara de cada aeronave (sensor, focal) hay que **verificarlos en la ficha del fabricante** antes de sembrarlos.

| Sector       | Patrón realista                                                                                                                                                                                                                            | Fuente                                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agricultura  | Un barrido por lote, líneas **paralelas al lado más largo** (menos giros), separación según traslape, giros fuera del lote (margen de cabecera), orden de lotes contiguos, punto de despegue junto al camino. Solo los lotes de ese vuelo. | Barrido (boustrophedon) y dirección con menos giros: [análisis de cobertura](https://arxiv.org/pdf/1811.04825); «lado más largo» es una inferencia, no una regla enunciada.                           |
| Carreteras   | **Al menos dos líneas paralelas** al eje (ida y vuelta, o tres en corredor angosto), líneas transversales al inicio y al final, y un giro si el tramo recto supera ~300 s. Puntos de control cada ~500 m como dato del vuelo.              | [GeoCue](https://support.geocue.com/?p=20731), [Wingtra](https://knowledge.wingtra.com/corridor-mapping).                                                                                             |
| Construcción | Cuadrícula nadir sobre el frente + **órbita o pasadas de fachada** a 40–60 ft del edificio (~12–18 m) con cámara inclinada; una segunda órbita a otra altura.                                                                              | [DroneDeploy, fachada](https://help.dronedeploy.com/hc/en-us/articles/1500004861241) y [mejores prácticas](https://help.dronedeploy.com/hc/en-us/articles/21722056984215-Fa%C3%A7ade-Best-Practices). |
| Vigilancia   | **Patrullaje del perímetro** (contorno reducido unos metros hacia adentro) con paradas en accesos y bodegas. La búsqueda no devolvió fuentes sobre rutas de patrullaje: es un diseño propio, a validar con alguien del sector.             | Sin fuente.                                                                                                                                                                                           |

De la ruta salen los números **coherentes**: distancia = longitud de la ruta; duración = distancia / velocidad de crucero + tiempo de giros y de despegue y aterrizaje; fotos = una cada «distancia entre fotos»; hectáreas cubiertas = área barrida dentro de los lotes. Las pruebas comprueban esa coherencia, que las líneas queden dentro (o en la cabecera) del lote, y que cada vuelo solo vuele sus zonas.

**Oportunidad:** los datos ya incluyen un vuelo donde el operador declara el 94 % de lo pedido. Con la ruta generada, ese vuelo puede **omitir una línea o dejar un hueco concreto**: la simulación y la cobertura pintada mostrarían por qué falta el 6 %, y «Antes de pagar» tendría una causa visible, en vez de un porcentaje suelto. Sigue siendo un ejemplo rotulado como tal.

**Cuidado con los cambios:** estas rutas están sembradas en `demo-data.ts` y otros módulos leen de ellas (`coverageRoute` también se usa en Mapa, `Flight.route` se edita en Programación). El generador no debe cambiar la forma de `Flight.route`; solo reemplaza lo que `routeFor` produce y mantiene los ids `flight-${siteId}-01`. La edición manual del mapa sigue igual.

### Estado: paso 1 construido (30 de octubre de 2026)

`features/flights/mission-plan.ts` (con `mission-plan.test.ts`, 11 pruebas) y los datos sembrados en `demo-data.ts`. Qué hace y en qué se apartó de lo propuesto:

- **Una ruta por vuelo, solo con sus lotes.** Se acabó la envolvente de todo el sitio. El código y las pruebas verifican que las líneas son paralelas, alternan sentido, están separadas a lo sumo un espaciado, y que un vuelo de un lote no sale de ese lote.
- **Dirección de las líneas: la de menor ancho del polígono**, que es lo que justifica la fuente (menos líneas y giros). No «la del lado más largo», que era una inferencia; suelen coincidir.
- **Números que salen de la ruta.** Distancia, fotos, duración y hectáreas cubiertas se calculan; los valores sembrados a mano (6,4 km, 128 fotos…) ya no existen. Con 2,1 cm de GSD y 75 % de traslape: altura ~79 m, líneas cada 27,7 m, una foto cada 20,8 m. Los datos de cámara son representativos, no de un modelo concreto.
- **Cobertura por rejilla de 5 m** dentro de las zonas (no hay unión de polígonos ni Turf). Solo para agricultura y construcción: en carreteras y vigilancia el área no es la medida, y el plan devuelve 0 ha.
- **Primer vuelo de Santa Rita termina antes** (`EARLY_END_AT = 0.84`): quedan ~1,5 ha sin cubrir en el Lote 5, el operador declara ~95 % y la bitácora lo explica (batería). Como el traslape lateral es del 75 %, cada punto lo ven unas cuatro líneas: omitir **una** línea no deja hueco; hay que omitir varias seguidas.
- **Carreteras:** ida y vuelta por ambos lados del eje (±½ espaciado). **Las líneas transversales de control y los puntos de control cada 500 m no se hicieron.** **Construcción:** barrido de los frentes y una vuelta cerrada a 15 m para las fachadas. **Vigilancia:** vuelta al perímetro 10 m hacia adentro; **sin paradas en accesos** (no hay datos de dónde están).
- **Despegue y regreso en el mismo punto**, fuera de las zonas, cerca de la esquina suroeste. El regreso es una línea recta, como un regreso automático real; en el vuelo recortado cruza los lotes. Si molesta, se puede elegir el punto de despegue según dónde termina el recorrido.
- **Mapa:** una ruta con más de 14 puntos solo marca el despegue («D») y usa trazos más finos; la edición manual sigue numerando todos los puntos.
- **Dato corregido:** la factura de Santa Rita facturaba 243 ha, un número que quedó de cuando los lotes eran más grandes; los lotes suman 27,9 ha. Ahora factura lo pedido (27,9 ha) y supera lo cubierto en ~5,7 %.

**Pendiente de este paso:**

- **Los cinco proyectos:** el código sigue teniendo cuatro; falta que digas cuál es el quinto.
- **Altura máxima de la bitácora** (95–110 m) frente a los 79 m de vuelo de mapeo: se dejó, porque incluye ascenso y relieve, pero conviene afinarla.
- **Contornos de los lotes:** no se ajustaron. En satélite caen sobre campos; en el mapa de calles rozan manzanas de Guacarí. Falta decidir si se redibujan.
- **Vigilancia** no tiene fuente; es un diseño propio.
- La visualización de las rutas se revisó solo en la ventana integrada, pequeña; falta revisarla en pantalla grande y en móvil.

### Estado: pasos 2 a 6 construidos (30 de octubre de 2026)

La simulación funciona en **Resumen** y en **Observaciones**, con el mismo reloj. Archivos: `features/flights/track.ts` (trayectoria; 10 pruebas), `replay/playback.ts` (reloj; 6 pruebas), `replay/use-replay.ts`, `replay/replay-bar.tsx`, `components/maps/replay-layer.ts` y `replay-drone.ts`.

- **Trayectoria:** esquinas redondeadas con radio de giro de 12 m (limitado por el espacio entre líneas), velocidad que baja en los giros, tiempo ajustado a la duración registrada del vuelo (despegue y aterrizaje de hasta 45 s cada uno). Altura = la del GSD del vuelo (~79 m).
- **Dron:** la Viper por defecto, dibujada con three.js sobre un lienzo pequeño que el mapa mueve a la posición del avión, con sombra que se separa según la altura, alabeo en los giros y hélice que gira. «Aeronave» permite cambiarla por la familia genérica del equipo del vuelo; los modelos DJI no se usan aquí. Sin WebGL cae en una silueta SVG.
- **Cobertura pintada:** un solo trazo del ancho de la huella de las fotos (no se oscurece donde se traslapan), en el color del mapa, con la estela por encima. «Área alcanzada» y su porcentaje salen de una rejilla sobre las zonas (máx. 6.000 celdas), con el mismo resultado que el planificador (el último vuelo de Santa Rita termina en ~95 %). Solo agricultura y construcción miden área.
- **Observaciones:** elegir un hallazgo (en el mapa o en la lista) lleva la simulación al instante en que el avión pasa más cerca; los hallazgos que ya pasó se encienden y los demás quedan atenuados.
- **Vuelos programados:** «Vista previa del vuelo», sin fotos y con «Área prevista».
- **Accesibilidad:** no arranca sola, pausa visible, velocidades de 1× a 16×, momentos anterior y siguiente, línea de tiempo con teclado y valor leído («Minuto 4:20 de 28:00, recorrido»), lista de momentos como texto. Con «reducir movimiento» no hay reproducir ni velocidades: solo avanzar por momentos.
- **Verificado** en Chromium con WebGL por software (SwiftShader), sobre los cuatro sitios, en escritorio, en móvil de 390 px y con movimiento reducido. No se midió el rendimiento en un equipo real.

**Pendiente o limitado:**

- El dibujo de las familias genéricas (compacto, industrial, aspersión, ala fija) es más simple que el de la Viper.
- En construcción la huella de las fotos (111 m) es más grande que el lote y la cobertura pintada tapa más que la obra; con un GSD menor se vería más ajustada.
- El regreso al punto de despegue cruza los lotes en línea recta.
- No hay lectura de trazas reales ni huella SHA-256 de la traza (mejoras 4 y 5 de la lista); siguen como propuesta.
- No hay pruebas automáticas del componente del mapa (solo de la lógica pura).

### Orden de trabajo propuesto

1. ✅ **Casos de ejemplo realistas** (`mission-plan.ts` + sembrado; la revisión de contornos sobre satélite sigue pendiente). Mejora toda la demo aunque no hubiera simulación.
2. ✅ **Traza y reproductor** (`track.ts`, controlador de reproducción, pruebas).
3. ✅ **Dron Viper y capa en el mapa** (lienzo three.js con respaldo SVG), en Resumen.
4. ✅ **Cobertura pintada** con rejilla, rotulada como simulada.
5. ✅ **Observaciones**: el mismo estado de reproducción, salto al instante del hallazgo.
6. ✅ **Vistas previas** de vuelos programados y actualización de `CLAUDE.md` (Viper en la simulación, módulo nuevo).

## Qué queda como propuesta

Vista 3D con terreno y altura real, lectura de archivos de registro reales (DJI `.txt`, `.SRT`, GPX), campo de visión de la cámara proyectado al suelo (como Airdata) y reproducción de la palanca del piloto. No se construyen en la demo.
