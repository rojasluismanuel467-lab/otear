# Mina a cielo abierto: el quinto caso de ejemplo

Fecha: 30 de octubre de 2026. Sección de la demo: cualquier módulo, con el caso «Minería» de la barra superior (`mina-mulalo` en `demo-data.ts`).

## Qué es y qué no es

- **Es** un proyecto de muestra con datos sintéticos, como los otros cuatro: un tajo de caliza dividido en tres bancos (**Banco norte**, **Banco central** y **Banco sur**), con vuelos, observaciones, facturas, equipos y avance de la excavación.
- **El lugar es real, el proyecto no.** Los contornos se trazaron sobre la imagen satelital de una cantera a cielo abierto en el piedemonte de Mulaló, Yumbo (Valle del Cauca), para que los bancos caigan sobre un tajo de verdad. Los nombres de la empresa, el titular y las novedades son de ejemplo y no describen esa operación. **No se identificó ni se verificó a quién pertenece**; si se muestra a alguien de la minería, conviene decirlo.
- **Lo que no se hizo:** no se investigó con fuentes cómo vuelan y miden hoy las minas (volúmenes, taludes, acopios, voladuras), ni qué entregables piden los títulos mineros o la autoridad. Lo de abajo es el diseño mínimo para que el caso se vea coherente, y queda por validar con alguien del sector.

## Cómo se modela

| Parte          | Decisión                                                                                                                                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sector         | Nuevo valor `mining` en `Sector`; etiqueta «Minería», zonas «Bancos».                                                                                                                                                                  |
| Indicador      | Avance de la excavación: **% del volumen previsto para cada banco que ya se removió** (sintético), con el plan del sitio (`schedule`) como en carreteras. El tercer banco se estanca para que la lectura tenga algo que decir.         |
| Evolución      | Reutiliza el avance en porcentaje de las carreteras, pero con mapa de bancos coloreados (más oscuro, más excavado) y frases de bancos, no de tramos. No hay vista 3D del tajo.                                                         |
| Ruta del vuelo | Líneas paralelas con traslape sobre cada banco y una pasada cerrada alrededor de la cresta, a distancia, para ver los taludes (el mismo patrón de la obra con fachadas). El área alcanzada se mide como en agricultura y construcción. |
| Vocabulario    | Punto de partida «Minería a cielo abierto» en Configuración: «Bancos», «Novedad de talud», «Informe de avance», «Avance de la excavación».                                                                                             |
| Mapeo          | Usos de zona de ejemplo: banco en explotación, vía de acarreo, botadero, acopio y zona restaurada.                                                                                                                                     |
| Landing        | Nueva tarjeta «Minas a cielo abierto» y chip «Mina a cielo abierto» en «¿Qué opera usted?». «Minería» sale de la lista de sectores sin construir.                                                                                      |

## Qué haría falta para que fuera de verdad (propuestas, no construido)

- Medir **volúmenes** removidos y apilados a partir de modelos de superficie de cada fecha (no hay lector de nubes de puntos de minas en la demo más allá del de construcción).
- Evaluar **taludes**: ángulo, bermas y grietas en la cresta, que requieren vuelos oblicuos o con LiDAR.
- Cruzar el avance con el **plan minero** y la **voladura**, y con los límites del título.
- Cumplir con lo que exija la autoridad minera y la aeronáutica para operar un dron sobre un tajo; nada de eso está verificado aquí.
