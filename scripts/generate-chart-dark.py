#!/usr/bin/env python3
"""Variante oscura de la carta (fondo azul de la landing): curvas y cotas reales + cuadrícula geográfica + rosa.

    python3 scripts/generate-chart-dark.py

Parte de public/textures/chart-contours.svg y chart-relief.webp (ya generados por
generate-chart-texture.py, con datos de elevación reales) y escribe:
  - chart-nav-dark.svg: curvas y cotas recoloreadas para fondo oscuro, más una cuadrícula de
    latitud y longitud cada 15' calculada con la proyección real del mosaico (Mercator, norte arriba).
  - chart-relief-dark.webp: el relieve sombreado como luz azul tenue.
  - compass-rose.svg: rosa de los vientos (norte geográfico arriba; no se dibuja declinación magnética).
Solo necesita Pillow para el relieve.
"""

import math
import os
import re

from PIL import Image

Z, X0, Y0 = 9, 147, 249
CROP_X, CROP_Y = 360, 200  # mismo recorte que generate-chart-texture.py (512x384 -> 1024x768)
HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(os.path.dirname(HERE), "public", "textures")
INK, INK_MAJOR, HALO = "#9fcfe3", "#c4e3f0", "#0b1a24"


def lonlat(u, v):
    """Coordenada geográfica del píxel (u, v) del SVG de 1024x768."""
    n = 2**Z
    tx = X0 + (CROP_X + u / 2) / 256
    ty = Y0 + (CROP_Y + v / 2) / 256
    lon = tx / n * 360 - 180
    lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * ty / n))))
    return lon, lat


def pixel(lon, lat):
    n = 2**Z
    tx = (lon + 180) / 360 * n
    ty = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return ((tx - X0) * 256 - CROP_X) * 2, ((ty - Y0) * 256 - CROP_Y) * 2


def dm(value, plus, minus):
    hemi = plus if value >= 0 else minus
    value = abs(value)
    deg = int(value)
    minutes = round((value - deg) * 60)
    if minutes == 60:
        deg, minutes = deg + 1, 0
    return f"{deg}°{minutes:02d}′{hemi}"


def graticule():
    lon0, lat0 = lonlat(0, 0)
    lon1, lat1 = lonlat(1024, 768)
    step = 0.25  # 15'
    lines, labels, ticks = [], [], []
    lon = math.ceil(lon0 / step) * step
    while lon <= lon1:
        x, _ = pixel(lon, lat0)
        if x > 1000:
            break
        major = abs(lon / 1.0 - round(lon / 1.0)) < 1e-6
        lines.append(f'<path d="M{x:.1f} 0V768" stroke-opacity="{0.42 if major else 0.24}"/>')
        for y in (46, 730):
            labels.append(f'<text x="{x + 5:.1f}" y="{y}">{dm(lon, "E", "O")}</text>')
        lon += step
    lat = math.floor(lat0 / step) * step
    while lat >= lat1:
        _, y = pixel(lon0, lat)
        major = abs(lat - round(lat)) < 1e-6
        lines.append(f'<path d="M0 {y:.1f}H1024" stroke-opacity="{0.42 if major else 0.24}"/>')
        for x in (18, 940):
            labels.append(f'<text x="{x}" y="{y - 5:.1f}">{dm(lat, "N", "S")}</text>')
        lat -= step
    # Marcas en cruz en las intersecciones.
    lon = math.ceil(lon0 / step) * step
    while lon <= lon1:
        lat = math.floor(lat0 / step) * step
        while lat >= lat1:
            x, y = pixel(lon, lat)
            ticks.append(f"M{x - 7:.1f} {y:.1f}H{x + 7:.1f}M{x:.1f} {y - 7:.1f}V{y + 7:.1f}")
            lat -= step
        lon += step
    return (
        f'<g stroke="{INK}" stroke-width="0.7">{"".join(lines)}</g>'
        f'<path d="{"".join(ticks)}" stroke="{INK_MAJOR}" stroke-width="1.3" stroke-opacity="0.75"/>'
        f'<g class="gl">{"".join(labels)}</g>'
    )


def contours_dark():
    svg = open(os.path.join(TEX, "chart-contours.svg"), encoding="utf-8").read()
    inner = re.search(r"</style>(.*)</svg>", svg, re.S).group(1)
    inner = (
        inner.replace('stroke="#5f6c74" stroke-width="0.6" stroke-opacity="0.5"', f'stroke="{INK}" stroke-width="0.6" stroke-opacity="0.32"')
        .replace('stroke="#3f4b52" stroke-width="1.25" stroke-opacity="0.66"', f'stroke="{INK_MAJOR}" stroke-width="1.2" stroke-opacity="0.62"')
        .replace('fill="#3f4b52"', f'fill="{INK_MAJOR}"')
    )
    return inner


def main():
    style = (
        "<style>"
        f"text{{font-family:Georgia,serif;font-style:italic;font-size:9.5px;fill:{INK_MAJOR};fill-opacity:.85;"
        f"stroke:{HALO};stroke-width:3.2px;paint-order:stroke;stroke-linejoin:round}}"
        ".cota{font-size:11px}"
        f".gl text{{font-size:8.5px;font-style:normal;font-family:ui-monospace,Menlo,Consolas,monospace;fill:{INK};fill-opacity:.8;stroke-width:3px}}"
        "</style>"
    )
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 768" preserveAspectRatio="xMidYMid slice" '
        'fill="none" stroke-linejoin="round" stroke-linecap="round">'
        + style + graticule() + contours_dark() + "</svg>"
    )
    with open(os.path.join(TEX, "chart-nav-dark.svg"), "w", encoding="utf-8") as f:
        f.write(svg)

    # Relieve: el mismo sombreado (laderas y valles) en azul claro tenue sobre el fondo oscuro.
    relief = Image.open(os.path.join(TEX, "chart-relief.webp")).convert("RGBA")
    out = Image.new("RGBA", relief.size)
    px_in, px_out = relief.load(), out.load()
    for y in range(relief.size[1]):
        for x in range(relief.size[0]):
            r, g, b, a = px_in[x, y]
            # La carta clara guarda el sombreado como transparencia de un gris: más alfa = más sombra.
            px_out[x, y] = (150, 205, 230, min(255, int(a * 1.3)))
    # El relieve es un fondo tenue: media resolución y menos calidad bastan y pesan un tercio.
    out = out.resize((768, 576), Image.LANCZOS)
    out.save(os.path.join(TEX, "chart-relief-dark.webp"), quality=40, alpha_quality=25, method=6)

    rose = ["<svg xmlns='http://www.w3.org/2000/svg' viewBox='-110 -110 220 220' fill='none' stroke='#c4e3f0' stroke-linejoin='round'>"
            "<circle r='84' stroke-width='1' stroke-opacity='.6'/><circle r='64' stroke-width='.8' stroke-opacity='.45'/>"
            "<circle r='96' stroke-width='.8' stroke-opacity='.4' stroke-dasharray='1 5.2' stroke-width='6'/>"]
    for i in range(16):
        a = math.radians(i * 22.5)
        r2 = 84 if i % 4 else 96
        rose.append(f"<path d='M{70 * math.sin(a):.1f} {-70 * math.cos(a):.1f}L{r2 * math.sin(a):.1f} {-r2 * math.cos(a):.1f}' stroke-width='{1.2 if i % 4 == 0 else .8}' stroke-opacity='.7'/>")
    # Estrella de cuatro puntas, mitad rellena como en las cartas.
    for i, (dx, dy) in enumerate([(0, -1), (1, 0), (0, 1), (-1, 0)]):
        px, py = -dy, dx
        tip = (dx * 78, dy * 78)
        a_pt = (px * 9, py * 9)
        b_pt = (-px * 9, -py * 9)
        rose.append(f"<path d='M{tip[0]} {tip[1]}L{a_pt[0]} {a_pt[1]}L0 0Z' fill='#c4e3f0' fill-opacity='.55' stroke-width='.8'/>")
        rose.append(f"<path d='M{tip[0]} {tip[1]}L{b_pt[0]} {b_pt[1]}L0 0Z' stroke-width='.8' stroke-opacity='.8'/>")
    for t, x, y in (("N", 0, -100), ("E", 102, 4), ("S", 0, 108), ("O", -102, 4)):
        rose.append(f"<text x='{x}' y='{y}' text-anchor='middle' fill='#c4e3f0' stroke='none' font-family='Georgia,serif' font-style='italic' font-size='16'>{t}</text>")
    rose.append("</svg>")
    with open(os.path.join(TEX, "compass-rose.svg"), "w", encoding="utf-8") as f:
        f.write("".join(rose))
    for name in ("chart-nav-dark.svg", "chart-relief-dark.webp", "compass-rose.svg"):
        print(f"  {name} {os.path.getsize(os.path.join(TEX, name)) // 1024} KB")


if __name__ == "__main__":
    main()
