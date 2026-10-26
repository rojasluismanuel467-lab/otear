# Evolución en el tiempo: el diferenciador de Otear

Fecha: 26 de octubre de 2026. Sección de la demo: `/evolucion` (`features/evolution/`).

## La idea

Una empresa que vuela el mismo lugar muchas veces tiene una película de ese lugar, pero hoy cada vuelo es una carpeta suelta. Otear organiza todos los vuelos de un sitio como una línea de tiempo y responde una pregunta en cada sector:

| Sector | Pregunta | Vista |
| --- | --- | --- |
| Construcción (edificio) | ¿Cuánto se ha construido y cómo va frente a lo previsto? | Modelo 3D que crece nivel a nivel, con lo previsto en transparencia y lo nuevo resaltado |
| Carreteras | ¿Qué tramos avanzan, cuáles están detenidos y en qué fase está cada uno? | Franja por abscisas coloreada por fase, mapa y curva de avance acumulado |
| Agricultura | ¿Qué lotes mejoran, cuáles bajan y desde cuándo? | Mapa de lotes por vigor, y la curva de cada lote |
| Vigilancia y otros | ¿Dónde se acumulan las novedades? | Mapa por zonas según hallazgos por vuelo |

En todas: control de tiempo (arrastrar, reproducir), comparar dos fechas, y un panel de lectura que dice qué cambió, a qué ritmo, y cuándo se llegaría a la meta si el ritmo sigue.

## Qué es real y qué es de ejemplo en la demo

- **Real (calculado en el navegador):** el orden por fecha, las diferencias entre vuelos, el ritmo, la proyección lineal, los tramos estancados, los descensos sostenidos de vigor, la comparación contra lo previsto y la confiabilidad de cada comparación según los datos de calidad de la bitácora.
- **De ejemplo:** los valores por zona (niveles construidos, porcentaje de avance, vigor) están sembrados en `demo-data.ts`. El edificio 3D, la franja de la vía y los mapas de color son representaciones esquemáticas, no reconstrucciones de imágenes.

## Qué haría falta para que sea real

Otear no procesa fotos; recibe lo que el operador ya produce y lo organiza.

1. **Entregables por vuelo:** ortomosaico (GeoTIFF), modelo de superficie o terreno, nube de puntos (LAZ o COPC), malla 3D (GLB o 3D Tiles) e índices como NDVI (GeoTIFF). Hoy el operador los genera con DJI Terra, Pix4D o DroneDeploy.
2. **Alineación entre fechas:** las fuentes consultadas recomiendan procesar todas las fechas en un solo bloque (co-alineación) y anclar con puntos de control o RTK; así el error relativo baja a pocos centímetros y se pueden separar cambios reales de ruido. La app ya guarda por vuelo si hubo puntos de control, el GSD y el traslape para avisar cuándo una comparación no es confiable.
3. **Medir por zona:** a partir de la nube o el MDE (volumen y nivel construido), del ortomosaico (fase y avance por tramo) o del NDVI (vigor medio por lote). Las zonas son las del módulo Mapa y lotes, fijas entre fechas para que las series sean comparables.
4. **Visor:** CesiumJS con 3D Tiles o Potree para nubes grandes, con el control de tiempo y la comparación por deslizador que ya muestra la demo. Hay que verificar el soporte vigente de comparación en pantalla dividida.
5. **Plan de referencia:** el cronograma o el modelo BIM 4D si existe; sin él se puede comparar contra un avance lineal entre fechas de inicio y fin.

## Referencias consultadas

- Progreso de obra y BIM: [PMC, UAV para monitoreo físico de obra](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8235729/), [Tecnalia, escaneo 3D con drones y BIM](https://dsp.tecnalia.com/items/a492322f-9214-4aab-9dee-c808819e5a41/full), [DroneDeploy, Progress AI](https://dronedeploy.com/product/progress-ai) (porcentaje completo por piso y ubicación; la cifra de precisión es del proveedor), [Pix4Dcloud](https://www.pix4d.com/cloud/) (línea de tiempo y comparación de dos días).
- Vías: [Univ. de Bagdad, UAV en obras viales](https://joe.uobaghdad.edu.iq/index.php/main/article/view/4012), [Michigan Tech, avance en autopistas](https://digitalcommons.mtu.edu/michigantech-p/16044), [Cambridge, avance espacial en asfalto](https://www.repository.cam.ac.uk/handle/1810/278795?show=full) (detección por capas, F1 de 95 % medio). La curva S y el avance por abscisa son una propuesta de diseño: las fuentes no los describen.
- Agricultura: [ISPRS 2017, NDVI en varias fases](https://isprs-archives.copernicus.org/articles/XLII-2-W6/263/2017/isprs-archives-XLII-2-W6-263-2017.pdf), [Univ. Santo Tomás, arroz con NDVI y GNDVI](https://repository.usta.edu.co/items/2e1a8b55-dbba-4c6c-8175-60beaaa4e614). La regla de alerta (por debajo de lo esperado en dos o más observaciones seguidas, validada en campo) es una recomendación de diseño, no un estándar.
- Visores y comparación: [Potree](https://best-of-web.builder.io/library/potree/potree), [Foro DroneDeploy, línea de tiempo más allá del lado a lado](https://forum.dronedeploy.com/t/timelapse-beyond-side-by-side/17344).
- Alineación y precisión: [Frontiers in Remote Sensing, co-alineación y GCP o RTK](https://www.frontiersin.org/journals/remote-sensing/articles/10.3389/frsen.2021.626810/pdf), [Birdi, qué tan precisos son los mapas](https://help.birdi.io/en/articles/13837409-how-accurate-are-my-maps) (cifras de un proveedor, solo como referencia de planeación: 2–5 cm con GCP y RTK, 5–15 cm solo con RTK).

## Preguntas por validar con usuarios

- ¿Qué indicador prefiere cada perfil: porcentaje por nivel, volumen, o fotos antes y después?
- ¿Quién sube los entregables procesados y con qué frecuencia?
- En agro: ¿vigor medio por lote basta o se necesitan las zonas de manejo dentro del lote?
- En vías: ¿se alinea la fase con el catálogo de capas del contrato (explanación, subbase, base, carpeta)?
- ¿Qué margen de atraso se considera alerta?
