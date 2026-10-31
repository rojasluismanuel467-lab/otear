# Experimentos de costo de la corrida base (compilación 58c4228)

Producidos con `npm run audit:ui -- --label base --experiments` (una sola pasada, 2 repeticiones por variante). Los cuadros se miden de 16,7 en 16,7 ms (60 Hz): una diferencia de un escalón (±16,7 ms) está dentro del ruido. Léase como orden de magnitud, no como cifra.

## Experimentos de costo (qué efecto pesa)

Se recorre la página a 1.400 px/s durante 6 s, 2 repeticiones (mediana), quitando un efecto por vez con CSS inyectado. Bajar el cuadro p95 / subir los FPS al quitar un efecto indica cuánto cuesta ese efecto en *esta* máquina sin GPU; el orden relativo es útil, la cifra absoluta no.

**`/` · desktop**

| Variante | FPS | Cuadro p50 ms | Cuadro p95 ms | Cuadros > 33 ms | Δ p95 vs. base |
| --- | ---: | ---: | ---: | ---: | ---: |
| base (sin cambios) | 13 | 50.1 | 83.4 | 63 | — |
| sin backdrop-filter | 20 | 33.4 | 66.7 | 51 | -16.7 |
| sin filter (blur, sombras con filtro) | 15 | 50.1 | 99.9 | 73 | +16.5 |
| sin pseudo-elementos de fondo (carta, grano, brillo) | 16 | 50.0 | 83.4 | 73 | +0.0 |
| sin animaciones ni transiciones CSS | 17 | 50.0 | 83.2 | 85 | -0.2 |
| sin canvas (avión, mapas WebGL, 3D) | 14 | 50.0 | 133.3 | 51 | +49.9 |
| sin sombras (box-shadow) | 13 | 50.0 | 83.4 | 62 | +0.0 |

**`/vuelos/` · desktop**

| Variante | FPS | Cuadro p50 ms | Cuadro p95 ms | Cuadros > 33 ms | Δ p95 vs. base |
| --- | ---: | ---: | ---: | ---: | ---: |
| base (sin cambios) | 28 | 16.7 | 50.0 | 3 | — |
| sin backdrop-filter | 34 | 16.7 | 50.0 | 4 | +0.0 |
| sin filter (blur, sombras con filtro) | 39 | 16.7 | 50.0 | 6 | +0.0 |
| sin pseudo-elementos de fondo (carta, grano, brillo) | 47 | 16.7 | 33.4 | 2 | -16.6 |
| sin animaciones ni transiciones CSS | 30 | 16.7 | 33.3 | 1 | -16.7 |
| sin canvas (avión, mapas WebGL, 3D) | 36 | 16.7 | 50.0 | 4 | +0.0 |
| sin sombras (box-shadow) | 28 | 16.7 | 33.4 | 2 | -16.6 |

**`/evolucion/` · desktop**

| Variante | FPS | Cuadro p50 ms | Cuadro p95 ms | Cuadros > 33 ms | Δ p95 vs. base |
| --- | ---: | ---: | ---: | ---: | ---: |
| base (sin cambios) | 46 | 16.7 | 33.4 | 2 | — |
| sin backdrop-filter | 59 | 16.7 | 16.8 | 0 | -16.6 |
| sin filter (blur, sombras con filtro) | 55 | 16.7 | 33.3 | 0 | -0.1 |
| sin pseudo-elementos de fondo (carta, grano, brillo) | 55 | 16.7 | 16.8 | 0 | -16.6 |
| sin animaciones ni transiciones CSS | 50 | 16.7 | 33.3 | 0 | -0.1 |
| sin canvas (avión, mapas WebGL, 3D) | 51 | 16.7 | 33.3 | 0 | -0.1 |
| sin sombras (box-shadow) | 59 | 16.7 | 16.7 | 0 | -16.7 |

**`/` · mobile**

| Variante | FPS | Cuadro p50 ms | Cuadro p95 ms | Cuadros > 33 ms | Δ p95 vs. base |
| --- | ---: | ---: | ---: | ---: | ---: |
| base (sin cambios) | 25 | 33.3 | 66.7 | 36 | — |
| sin backdrop-filter | 29 | 16.7 | 50.1 | 29 | -16.6 |
| sin filter (blur, sombras con filtro) | 25 | 33.3 | 66.6 | 28 | -0.1 |
| sin pseudo-elementos de fondo (carta, grano, brillo) | 25 | 33.3 | 66.7 | 22 | +0.0 |
| sin animaciones ni transiciones CSS | 30 | 33.3 | 50.1 | 30 | -16.6 |
| sin canvas (avión, mapas WebGL, 3D) | 25 | 16.7 | 83.4 | 31 | +16.7 |
| sin sombras (box-shadow) | 27 | 33.3 | 66.6 | 33 | -0.1 |

**`/vuelos/` · mobile**

| Variante | FPS | Cuadro p50 ms | Cuadro p95 ms | Cuadros > 33 ms | Δ p95 vs. base |
| --- | ---: | ---: | ---: | ---: | ---: |
| base (sin cambios) | 59 | 16.7 | 16.7 | 0 | — |
| sin backdrop-filter | 59 | 16.7 | 16.7 | 0 | +0.0 |
| sin filter (blur, sombras con filtro) | 59 | 16.7 | 16.7 | 0 | +0.0 |
| sin pseudo-elementos de fondo (carta, grano, brillo) | 60 | 16.7 | 16.7 | 0 | +0.0 |
| sin animaciones ni transiciones CSS | 59 | 16.7 | 16.7 | 0 | +0.0 |
| sin canvas (avión, mapas WebGL, 3D) | 59 | 16.7 | 16.7 | 0 | +0.0 |
| sin sombras (box-shadow) | 59 | 16.7 | 16.8 | 0 | +0.1 |

**`/evolucion/` · mobile**

| Variante | FPS | Cuadro p50 ms | Cuadro p95 ms | Cuadros > 33 ms | Δ p95 vs. base |
| --- | ---: | ---: | ---: | ---: | ---: |
| base (sin cambios) | 60 | 16.7 | 16.8 | 0 | — |
| sin backdrop-filter | 60 | 16.7 | 16.7 | 0 | -0.1 |
| sin filter (blur, sombras con filtro) | 60 | 16.7 | 16.7 | 0 | -0.1 |
| sin pseudo-elementos de fondo (carta, grano, brillo) | 60 | 16.7 | 16.7 | 0 | -0.1 |
| sin animaciones ni transiciones CSS | 60 | 16.7 | 16.8 | 0 | +0.0 |
| sin canvas (avión, mapas WebGL, 3D) | 60 | 16.7 | 16.7 | 0 | -0.1 |
| sin sombras (box-shadow) | 60 | 16.7 | 16.7 | 0 | -0.1 |

