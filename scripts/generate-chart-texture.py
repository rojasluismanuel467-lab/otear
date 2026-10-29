#!/usr/bin/env python3
"""Genera la textura de carta del fondo: relieve gris (WebP) y curvas de nivel (SVG).

Fuente: AWS Open Data Terrain Tiles (formato Terrarium, zoom 9), zona entre las
cordilleras Occidental y Central (Valle del Cauca y Tolima). Solo necesita Pillow.

    python3 scripts/generate-chart-texture.py [carpeta_de_teselas]

Escribe public/textures/chart-relief.webp y public/textures/chart-contours.svg.
Las teselas se descargan una vez a la carpeta indicada (por defecto .tiles-cache, ignorada por git).
"""

import math
import os
import sys
import urllib.request

from PIL import Image

Z, X0, Y0, NX, NY = 9, 147, 249, 4, 3
TILE = 256
W, H = NX * TILE, NY * TILE  # 1024 x 768, igual al viewBox de las texturas
OUT_W, OUT_H = 1024, 768

# Ventana del mosaico que se muestra, en píxeles del mosaico, y su ampliación.
CROP = (int(os.environ.get("CROP_X", 360)), int(os.environ.get("CROP_Y", 200)), 512, 384)
INTERVAL = float(os.environ.get("INTERVAL", 75))  # metros entre curvas intermedias
MASTER_EVERY = 5  # una curva maestra cada 5 (375 m)
# Intensidad: es un fondo, no un mapa. Texto de 14 px debe seguir leyéndose encima.
RELIEF_ALPHA = float(os.environ.get("RELIEF_ALPHA", 0.42))
MINOR_OPACITY = float(os.environ.get("MINOR_OPACITY", 0.5))
MAJOR_OPACITY = float(os.environ.get("MAJOR_OPACITY", 0.66))
CELL_M = 156543.03392 * math.cos(math.radians(4.0)) / 2**Z * CROP[2] / OUT_W  # m por píxel de salida

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
TEXTURES = os.environ.get("OUT_DIR") or os.path.join(ROOT, "public", "textures")
CACHE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, ".tiles-cache")


def load_tile(x, y):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, f"{Z}-{x}-{y}.png")
    if not os.path.exists(path):
        url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png"
        urllib.request.urlretrieve(url, path)
    return Image.open(path).convert("RGB")


def build_dem():
    """Mosaico de elevación (m) como imagen de coma flotante, ya recortada y ampliada."""
    dem = Image.new("F", (W, H))
    for tx in range(NX):
        for ty in range(NY):
            tile = load_tile(X0 + tx, Y0 + ty)
            values = [r * 256 + g + b / 256 - 32768 for r, g, b in tile.getdata()]
            part = Image.new("F", (TILE, TILE))
            part.putdata(values)
            dem.paste(part, (tx * TILE, ty * TILE))
    x, y, w, h = CROP
    dem = dem.crop((x, y, x + w, y + h)).resize((OUT_W, OUT_H), Image.BICUBIC)
    flat = list(dem.get_flattened_data() if hasattr(dem, "get_flattened_data") else dem.getdata())
    return [flat[i * OUT_W : (i + 1) * OUT_W] for i in range(OUT_H)]


def box_blur(grid, radius):
    def horizontal(rows):
        out = []
        for row in rows:
            padded = [row[0]] * radius + row + [row[-1]] * radius
            prefix = [0.0]
            for v in padded:
                prefix.append(prefix[-1] + v)
            size = 2 * radius + 1
            out.append([(prefix[i + size] - prefix[i]) / size for i in range(len(row))])
        return out

    grid = horizontal(grid)
    columns = horizontal([list(c) for c in zip(*grid)])
    return [list(r) for r in zip(*columns)]


def smooth(grid, radius, passes):
    for _ in range(passes):
        grid = box_blur(grid, radius)
    return grid


# --- relieve gris -----------------------------------------------------------------------


def hillshade_image(grid):
    az, alt, zfactor = math.radians(315), math.radians(42), 2.4
    lx, ly, lz = math.cos(alt) * math.sin(az), -math.cos(alt) * math.cos(az), math.sin(alt)
    flat = lz
    pixels = []
    for y in range(OUT_H):
        up = grid[max(y - 1, 0)]
        row = grid[y]
        down = grid[min(y + 1, OUT_H - 1)]
        for x in range(OUT_W):
            left = row[max(x - 1, 0)]
            right = row[min(x + 1, OUT_W - 1)]
            fx = zfactor * (right - left) / (2 * CELL_M)
            fy = zfactor * (down[x] - up[x]) / (2 * CELL_M)
            shade = (-fx * lx - fy * ly + lz) / math.sqrt(fx * fx + fy * fy + 1)
            depth = max(0.0, min(1.0, (flat - shade) * 1.7))
            pixels.append((86, 97, 105, int(depth * RELIEF_ALPHA * 255)))
    image = Image.new("RGBA", (OUT_W, OUT_H))
    image.putdata(pixels)
    return image


# --- curvas de nivel (marching squares) ----------------------------------------------------

# Para cada combinación de esquinas (tl=8, tr=4, br=2, bl=1): pares de aristas T, R, B, L.
CASES = {
    1: [("L", "B")], 2: [("B", "R")], 3: [("L", "R")], 4: [("T", "R")],
    6: [("T", "B")], 7: [("L", "T")], 8: [("L", "T")], 9: [("T", "B")],
    11: [("T", "R")], 12: [("L", "R")], 13: [("B", "R")], 14: [("L", "B")],
}


def contours(grid):
    lo = min(min(r) for r in grid)
    hi = max(max(r) for r in grid)
    levels = {}  # nivel -> {"pts": {id: (x, y)}, "adj": {id: [ids]}}

    def edge_point(code, x, y, level, tl, tr, br, bl):
        if code == "T":
            return ("h", x, y), (x + (level - tl) / (tr - tl), y)
        if code == "B":
            return ("h", x, y + 1), (x + (level - bl) / (br - bl), y + 1)
        if code == "L":
            return ("v", x, y), (x, y + (level - tl) / (bl - tl))
        return ("v", x + 1, y), (x + 1, y + (level - tr) / (br - tr))

    for y in range(OUT_H - 1):
        row, below = grid[y], grid[y + 1]
        for x in range(OUT_W - 1):
            tl, tr, br, bl = row[x], row[x + 1], below[x + 1], below[x]
            vmin, vmax = min(tl, tr, br, bl), max(tl, tr, br, bl)
            first = math.floor(vmin / INTERVAL) + 1
            last = math.floor(vmax / INTERVAL)
            for k in range(first, last + 1):
                level = k * INTERVAL
                index = (tl >= level) * 8 + (tr >= level) * 4 + (br >= level) * 2 + (bl >= level)
                if index in (0, 15):
                    continue
                if index in (5, 10):
                    center_above = (tl + tr + br + bl) / 4 >= level
                    if index == 5:
                        pairs = [("L", "T"), ("B", "R")] if center_above else [("T", "R"), ("L", "B")]
                    else:
                        pairs = [("T", "R"), ("L", "B")] if center_above else [("L", "T"), ("B", "R")]
                else:
                    pairs = CASES[index]
                data = levels.setdefault(k, {"pts": {}, "adj": {}})
                for a, b in pairs:
                    ia, pa = edge_point(a, x, y, level, tl, tr, br, bl)
                    ib, pb = edge_point(b, x, y, level, tl, tr, br, bl)
                    data["pts"][ia] = pa
                    data["pts"][ib] = pb
                    data["adj"].setdefault(ia, []).append(ib)
                    data["adj"].setdefault(ib, []).append(ia)
    return levels, lo, hi


def chain(data):
    """Une los segmentos en polilíneas (abiertas o cerradas)."""
    adj, pts = data["adj"], data["pts"]
    seen = set()
    lines = []

    def walk(start):
        line = [start]
        seen.add(start)
        prev, cur = None, start
        while True:
            nxt = [n for n in adj[cur] if n != prev and (n not in seen or n == start and len(line) > 2)]
            if not nxt:
                break
            n = nxt[0]
            if n == start:
                line.append(start)
                break
            line.append(n)
            seen.add(n)
            prev, cur = cur, n
        return line

    for node, neighbours in adj.items():
        if len(neighbours) == 1 and node not in seen:
            lines.append(walk(node))
    for node in adj:
        if node not in seen:
            lines.append(walk(node))
    return [[pts[i] for i in line] for line in lines]


def simplify(points, tolerance):
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        a, b = stack.pop()
        (ax, ay), (bx, by) = points[a], points[b]
        dx, dy = bx - ax, by - ay
        norm = math.hypot(dx, dy) or 1e-9
        far, far_i = 0.0, -1
        for i in range(a + 1, b):
            px, py = points[i]
            d = abs(dy * (px - ax) - dx * (py - ay)) / norm
            if d > far:
                far, far_i = d, i
        if far > tolerance:
            keep[far_i] = True
            stack.append((a, far_i))
            stack.append((far_i, b))
    return [p for p, k in zip(points, keep) if k]


def length(points):
    return sum(math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]) for i in range(len(points) - 1))


def path_data(lines):
    parts = []
    for line in lines:
        parts.append("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in line))
    return " ".join(parts)


# --- cotas y puntos geodésicos ------------------------------------------------------------


def peaks(grid, raw_count=7, spacing=170):
    found = []
    step = 6
    for y in range(step, OUT_H - step, 2):
        for x in range(step, OUT_W - step, 2):
            v = grid[y][x]
            if v < 1500:
                continue
            if all(grid[y + j][x + i] <= v for j in range(-step, step + 1, 3) for i in range(-step, step + 1, 3)):
                found.append((v, x, y))
    found.sort(reverse=True)
    chosen = []
    for v, x, y in found:
        if 40 < x < OUT_W - 60 and 30 < y < OUT_H - 30 and all(math.hypot(x - cx, y - cy) > spacing for _, cx, cy in chosen):
            chosen.append((v, x, y))
        if len(chosen) == raw_count:
            break
    return chosen


def labels(master_lines, count=16, spacing=150):
    candidates = []
    for level, lines in master_lines:
        for line in lines:
            total = length(line)
            if total < 220:
                continue
            walked, target = 0.0, total * 0.5
            for i in range(len(line) - 1):
                seg = math.hypot(line[i + 1][0] - line[i][0], line[i + 1][1] - line[i][1])
                if walked + seg >= target:
                    x, y = line[i]
                    nx, ny = line[min(i + 3, len(line) - 1)]
                    px, py = line[max(i - 3, 0)]
                    angle = math.degrees(math.atan2(ny - py, nx - px))
                    if angle > 90:
                        angle -= 180
                    if angle < -90:
                        angle += 180
                    if 40 < x < OUT_W - 40 and 30 < y < OUT_H - 30:
                        candidates.append((total, level, x, y, angle))
                    break
                walked += seg
    candidates.sort(reverse=True)
    chosen = []
    for total, level, x, y, angle in candidates:
        if all(math.hypot(x - cx, y - cy) > spacing for _, _, cx, cy, _ in chosen):
            chosen.append((total, level, x, y, angle))
        if len(chosen) == count:
            break
    return chosen


def main():
    print("Elevación…")
    dem = build_dem()
    flat_values = [v for r in dem for v in r]
    print(f"  {min(flat_values):.0f} a {max(flat_values):.0f} m, {CELL_M:.0f} m por píxel")

    print("Relieve gris…")
    relief = hillshade_image(smooth(dem, 1, 1))
    relief.save(os.path.join(TEXTURES, "chart-relief.webp"), format="WEBP", quality=80, alpha_quality=80, method=6)

    print("Curvas de nivel…")
    grid = smooth(dem, 2, 3)
    levels, lo, hi = contours(grid)
    minor, major, major_lines = [], [], []
    for k in sorted(levels):
        lines = []
        for line in chain(levels[k]):
            line = simplify(line, 0.45)
            if len(line) >= 4 and length(line) >= 18:
                lines.append(line)
        if k % MASTER_EVERY == 0:
            major.extend(lines)
            major_lines.append((k * INTERVAL, lines))
        else:
            minor.extend(lines)
    print(f"  intermedias {len(minor)}, maestras {len(major)}")

    marks = []
    for total, level, x, y, angle in labels(major_lines):
        text = f"{int(level):d}"
        marks.append(
            f'<text transform="translate({x:.1f} {y:.1f}) rotate({angle:.1f})" text-anchor="middle" dy="3">{text}</text>'
        )
    summits = []
    for value, x, y in peaks(grid):
        summits.append(
            f'<path d="M{x} {y - 5}L{x + 5} {y + 4}L{x - 5} {y + 4}Z"/>'
            f'<text class="cota" x="{x}" y="{y - 9}" text-anchor="middle">{int(round(value / 1) )}</text>'
        )

    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 768" preserveAspectRatio="xMidYMid slice" '
        'fill="none" stroke-linejoin="round" stroke-linecap="round">'
        "<style>text{font-family:Georgia,serif;font-style:italic;font-size:9.5px;fill:#4a565d;stroke:#f3f5f6;"
        "stroke-width:3.2px;paint-order:stroke;stroke-linejoin:round}.cota{font-size:11px}</style>"
        f'<path stroke="#5f6c74" stroke-width="0.6" stroke-opacity="{MINOR_OPACITY}" d="{path_data(minor)}"/>'
        f'<path stroke="#3f4b52" stroke-width="1.25" stroke-opacity="{MAJOR_OPACITY}" d="{path_data(major)}"/>'
        f'<g fill="#3f4b52" fill-opacity="0.85" stroke="none">{"".join(summits)}</g>'
        f'<g stroke-opacity="0.9">{"".join(marks)}</g>'
        "</svg>"
    )
    with open(os.path.join(TEXTURES, "chart-contours.svg"), "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"  chart-contours.svg {len(svg) // 1024} KB; chart-relief.webp {os.path.getsize(os.path.join(TEXTURES, 'chart-relief.webp')) // 1024} KB")


if __name__ == "__main__":
    main()
