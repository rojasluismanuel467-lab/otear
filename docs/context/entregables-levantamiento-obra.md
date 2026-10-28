# Qué archivos entrega un levantamiento con dron a una obra

Fecha: 28 de octubre de 2026. Objetivo: saber qué formatos llegan a una obra de construcción para decidir qué debe poder leer el visor del edificio (Evolución).

## Fuentes consultadas

- [Pix4D, «Outputs»](https://support.pix4d.com/hc/en-us/articles/202558659) (leída completa): lista oficial de salidas y formatos.
- DroneDeploy: [formatos de exportación](https://help.dronedeploy.com/hc/en-us/articles/1500004964622) (la página devolvió 403; solo se vio el resumen del buscador) y [nubes de puntos](https://help.dronedeploy.com/hc/en-us/articles/1500004860641-3D-Point-Clouds).
- DJI Terra: no pude leer el manual oficial; la lista sale de anuncios de DJI y de distribuidores, que no coinciden del todo (OSGB, B3DM, OBJ, PLY, FBX, LAS/LAZ, GeoTIFF; en 2026 anunció splats gaussianos y 3D Tiles).
- [The Future 3D, guía de entregables](https://www.thefuture3d.com/learn/drone-mapping-deliverables-guide) (guía de un proveedor, no norma): resumen de qué se entrega a clientes de construcción.
- Autodesk Construction Cloud: **no encontré una lista oficial** de formatos de captura de realidad; las fuentes hablan de RCP, RCS y E57 (de ReCap). No confirmé que acepte LAS.

## Lo que se entrega

| Entregable                                    | Formatos                                                      | Para qué sirve en obra                                           |
| --------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- |
| Ortomosaico                                   | GeoTIFF                                                       | Documentar el sitio, seguir avance, base para superponer diseños |
| Modelo de superficie (DSM) y de terreno (DTM) | GeoTIFF; también LAS, LAZ, XYZ como malla de puntos           | Movimiento de tierras, volúmenes, drenaje                        |
| Nube de puntos                                | LAS, LAZ, XYZ, PLY (RCP y E57 si pasa por ReCap o escáner)    | El modelo 3D maestro: medir y modelar                            |
| Malla 3D con textura                          | OBJ (+ MTL y JPG), FBX, PLY, GLB; LOD en OSGB, 3D Tiles, SLPK | Visualización y comparación con el diseño                        |
| Curvas de nivel y secciones                   | SHP, DXF, DWG, PDF                                            | Diseño vial y de explanación                                     |
| Informes de volumen (corte y relleno)         | PDF u hoja de cálculo                                         | Excavaciones y acopios                                           |
| Modelo BIM (lo diseñado, no lo construido)    | IFC, Revit                                                    | Referencia para comparar                                         |

## Qué lee hoy el visor del edificio

Implementado en `components/evolution/model-loader.ts` y `features/evolution/point-cloud.ts` (con pruebas):

| Formato                   | Soporte                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------ |
| LAS                       | Sí (formatos de punto 0 a 10, con color si lo trae). Se aligera a 500.000 puntos.    |
| XYZ, TXT, CSV             | Sí (x y z, y opcionalmente r g b).                                                   |
| GLB                       | Sí.                                                                                  |
| OBJ                       | Sí, solo la forma: no carga el `.mtl` ni las texturas.                               |
| PLY                       | Sí, malla o nube.                                                                    |
| LAZ                       | **No.** Hace falta descomprimirlo (CloudCompare o LAStools). La interfaz lo explica. |
| FBX, OSGB, 3D Tiles, SLPK | No. Se indica convertir a GLB o usar un visor de teselas.                            |
| GeoTIFF, DXF, DWG, SHP    | No: son 2D o CAD.                                                                    |
| RCP, RCS, E57             | No. Se indica exportar a LAS.                                                        |
| IFC, Revit                | No. Comparar lo construido contra el diseño es trabajo futuro.                       |

Cualquier otro archivo se rechaza con un mensaje que explica qué es y cómo convertirlo.

## Decisiones y límites

- Todo se lee **en el navegador**; nada se sube a un servidor. Límite de 200 MB por archivo. Una nube mayor se aligera tomando un punto cada cierto número.
- El eje vertical se elige a mano: la topografía usa Z arriba y los modelos GLB, Y arriba. Un OBJ de fotogrametría suele venir con Z arriba.
- El archivo se **recentra y se escala** al ancho del visor. Por eso no se pueden medir distancias reales en pantalla; la información del archivo muestra su extensión original en las unidades del archivo, sin asumir metros.
- No hay georreferencia: el sistema de coordenadas no se interpreta, solo se centra.
- Un archivo por fecha de vuelo, en memoria; al recargar se pierde (igual que el resto de la demo).
- Los avisos de problemas se colocan sobre el modelo por proporciones (frente a lo ancho y avance a lo alto); no son posiciones medidas.
- Pruebas con archivos **sintéticos** que generé yo (una nube LAS de 184.000 puntos y un OBJ de cajas); no se probó con un levantamiento real ni con archivos de varios cientos de MB.

## Siguiente paso razonable

Visor de teselas (3D Tiles u OSGB convertido) para modelos grandes con CesiumJS, y comparar lo construido contra un IFC cuando exista un modelo de diseño. Ambos son proyectos aparte.
