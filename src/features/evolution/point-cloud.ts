/**
 * Reading point clouds that a drone survey delivers: LAS (uncompressed) and plain XYZ text.
 * Pure functions on bytes and text, so they can be tested without a browser.
 * Coordinates come back in the file's own survey axes (x east, y north, z up).
 */

export interface PointCloud {
  /** x, y, z per point, re-centred on the cloud so float32 keeps its precision. */
  positions: Float32Array;
  /** r, g, b per point in 0..1, when the file has colour. */
  colors?: Float32Array;
  /** Points in the file before thinning. */
  total: number;
  /** Extent in the file's units: [x, y, z]. */
  extent: [number, number, number];
  /** Where the cloud was centred, in the file's coordinates. */
  origin: [number, number, number];
}

export type ReadResult<T> =
  { ok: true; value: T } | { ok: false; error: string };

export const MAX_POINTS = 500_000;

/** Colour fields by LAS point data format (record offset of red), or -1 when there is none. */
const COLOR_OFFSET: Record<number, number> = {
  2: 20,
  3: 28,
  5: 28,
  7: 30,
  8: 30,
  10: 30,
};

function thin(total: number, limit: number) {
  return total > limit ? Math.ceil(total / limit) : 1;
}

/** Keeps the cloud near the origin and reports its size, ignoring the 0,5 % most distant points per axis. */
function recentre(
  raw: Float64Array,
  count: number,
): {
  positions: Float32Array;
  extent: [number, number, number];
  origin: [number, number, number];
} {
  const lo: number[] = [];
  const hi: number[] = [];
  const stride = Math.max(1, Math.floor(count / 20_000));
  for (let axis = 0; axis < 3; axis += 1) {
    const sample: number[] = [];
    for (let i = 0; i < count; i += stride) sample.push(raw[i * 3 + axis]);
    sample.sort((a, b) => a - b);
    lo.push(sample[Math.floor(sample.length * 0.005)]);
    hi.push(
      sample[Math.min(sample.length - 1, Math.floor(sample.length * 0.995))],
    );
  }
  const origin: [number, number, number] = [
    (lo[0] + hi[0]) / 2,
    (lo[1] + hi[1]) / 2,
    lo[2],
  ];
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = raw[i * 3] - origin[0];
    positions[i * 3 + 1] = raw[i * 3 + 1] - origin[1];
    positions[i * 3 + 2] = raw[i * 3 + 2] - origin[2];
  }
  return {
    positions,
    extent: [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]],
    origin,
  };
}

export function readLas(
  buffer: ArrayBuffer,
  limit = MAX_POINTS,
): ReadResult<PointCloud> {
  if (buffer.byteLength < 227)
    return { ok: false, error: "El archivo es muy corto para ser LAS." };
  const view = new DataView(buffer);
  const sign = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3),
  );
  if (sign !== "LASF")
    return { ok: false, error: "No es un archivo LAS (falta la firma LASF)." };
  const major = view.getUint8(24);
  const minor = view.getUint8(25);
  const offset = view.getUint32(96, true);
  const formatByte = view.getUint8(104);
  if (formatByte & 0x80) {
    return {
      ok: false,
      error:
        "Es un LAZ (LAS comprimido). Conviértalo a LAS con CloudCompare o LAStools y vuelva a cargarlo.",
    };
  }
  const format = formatByte & 0x3f;
  const length = view.getUint16(105, true);
  let total = view.getUint32(107, true);
  if (!total && major === 1 && minor >= 4 && buffer.byteLength >= 255)
    total = Number(view.getBigUint64(247, true));
  if (format > 10 || length < 20)
    return {
      ok: false,
      error: `Formato de punto LAS ${format} no compatible.`,
    };
  const available = Math.floor((buffer.byteLength - offset) / length);
  total = Math.min(total || available, available);
  if (total < 1) return { ok: false, error: "El LAS no trae puntos." };
  const scale = [
    view.getFloat64(131, true),
    view.getFloat64(139, true),
    view.getFloat64(147, true),
  ];
  const shift = [
    view.getFloat64(155, true),
    view.getFloat64(163, true),
    view.getFloat64(171, true),
  ];
  const step = thin(total, limit);
  const count = Math.ceil(total / step);
  const raw = new Float64Array(count * 3);
  const colorAt = COLOR_OFFSET[format] ?? -1;
  const colors = colorAt >= 0 ? new Float32Array(count * 3) : undefined;
  let max16 = 0;
  for (let n = 0, i = 0; n < total && i < count; n += step, i += 1) {
    const at = offset + n * length;
    raw[i * 3] = view.getInt32(at, true) * scale[0] + shift[0];
    raw[i * 3 + 1] = view.getInt32(at + 4, true) * scale[1] + shift[1];
    raw[i * 3 + 2] = view.getInt32(at + 8, true) * scale[2] + shift[2];
    if (colors) {
      for (let c = 0; c < 3; c += 1) {
        const value = view.getUint16(at + colorAt + c * 2, true);
        colors[i * 3 + c] = value;
        if (value > max16) max16 = value;
      }
    }
  }
  if (colors) {
    // Colour is 16 bit in the spec, but many tools write 8 bit values.
    const divisor = max16 > 255 ? 65535 : 255;
    for (let i = 0; i < colors.length; i += 1) colors[i] /= divisor;
  }
  const { positions, extent, origin } = recentre(raw, count);
  return { ok: true, value: { positions, colors, total, extent, origin } };
}

/** Text files with "x y z" or "x y z r g b" per line, separated by spaces, commas, semicolons or tabs. */
export function readXyz(
  text: string,
  limit = MAX_POINTS,
): ReadResult<PointCloud> {
  const lines = text.split(/\r?\n/);
  const rows: number[][] = [];
  for (const line of lines) {
    const parts = line.trim().split(/[\s,;]+/);
    if (parts.length < 3) continue;
    const nums = parts.slice(0, 6).map(Number);
    if (nums.slice(0, 3).some((value) => !Number.isFinite(value))) continue;
    rows.push(nums);
  }
  if (rows.length < 3)
    return { ok: false, error: "No encontré puntos «x y z» en el archivo." };
  const step = thin(rows.length, limit);
  const count = Math.ceil(rows.length / step);
  const raw = new Float64Array(count * 3);
  const withColor =
    rows[0].length >= 6 && rows[0].slice(3, 6).every(Number.isFinite);
  const colors = withColor ? new Float32Array(count * 3) : undefined;
  let max = 0;
  for (let n = 0, i = 0; n < rows.length && i < count; n += step, i += 1) {
    raw[i * 3] = rows[n][0];
    raw[i * 3 + 1] = rows[n][1];
    raw[i * 3 + 2] = rows[n][2];
    if (colors) {
      for (let c = 0; c < 3; c += 1) {
        const value = Number.isFinite(rows[n][3 + c]) ? rows[n][3 + c] : 0;
        colors[i * 3 + c] = value;
        if (value > max) max = value;
      }
    }
  }
  if (colors) {
    const divisor = max > 255 ? 65535 : max > 1 ? 255 : 1;
    for (let i = 0; i < colors.length; i += 1) colors[i] /= divisor;
  }
  const { positions, extent, origin } = recentre(raw, count);
  return {
    ok: true,
    value: { positions, colors, total: rows.length, extent, origin },
  };
}

/** Colours a cloud by height when the file has none: dark blue-gray at the base to light blue at the top. */
export function heightColors(
  positions: Float32Array,
  up: 0 | 1 | 2,
): Float32Array {
  let min = Infinity;
  let max = -Infinity;
  for (let i = up; i < positions.length; i += 3) {
    if (positions[i] < min) min = positions[i];
    if (positions[i] > max) max = positions[i];
  }
  const span = Math.max(max - min, 1e-6);
  const out = new Float32Array(positions.length);
  const low = [0.2, 0.3, 0.38];
  const high = [0.62, 0.82, 0.93];
  for (let i = 0; i < positions.length / 3; i += 1) {
    const t = Math.min(1, Math.max(0, (positions[i * 3 + up] - min) / span));
    for (let c = 0; c < 3; c += 1)
      out[i * 3 + c] = low[c] + (high[c] - low[c]) * t;
  }
  return out;
}

export interface Deliverable {
  /** Extensions, lower case, with the dot. */
  ext: string[];
  name: string;
  /** What it is in a construction survey. */
  what: string;
  /** Can Otear draw it today. */
  supported: boolean;
  /** Why not, or how to turn it into something that works. */
  note?: string;
}

/** The files a drone survey usually hands to a construction site, and what Otear does with each. */
export const deliverables: Deliverable[] = [
  {
    ext: [".las"],
    name: "Nube de puntos LAS",
    what: "El modelo 3D maestro, punto a punto.",
    supported: true,
    note: "Se aligera a 500.000 puntos para mostrarla.",
  },
  {
    ext: [".xyz", ".txt", ".csv"],
    name: "Nube de puntos XYZ",
    what: "Puntos en texto: x y z, y opcionalmente color.",
    supported: true,
    note: "Se aligera a 500.000 puntos.",
  },
  {
    ext: [".glb"],
    name: "Malla 3D GLB",
    what: "Modelo con textura listo para el visor.",
    supported: true,
  },
  {
    ext: [".obj"],
    name: "Malla 3D OBJ",
    what: "Malla texturizada que entregan Pix4D, DroneDeploy y DJI Terra.",
    supported: true,
    note: "Se lee la forma; las texturas (.mtl y .jpg) no se cargan.",
  },
  {
    ext: [".ply"],
    name: "PLY",
    what: "Malla o nube de puntos.",
    supported: true,
  },
  {
    ext: [".laz"],
    name: "Nube de puntos LAZ",
    what: "LAS comprimido; es el formato más común por su tamaño.",
    supported: false,
    note: "Descomprima a LAS con CloudCompare o LAStools.",
  },
  {
    ext: [".fbx"],
    name: "Malla 3D FBX",
    what: "Malla para herramientas de modelado.",
    supported: false,
    note: "Expórtela a GLB desde Blender o el propio programa de fotogrametría.",
  },
  {
    ext: [".osgb", ".b3dm", ".slpk", ".json"],
    name: "Mallas por niveles de detalle (OSGB, 3D Tiles, SLPK)",
    what: "Modelos grandes para visores web.",
    supported: false,
    note: "Hace falta un visor de teselas 3D (CesiumJS); no está incluido.",
  },
  {
    ext: [".tif", ".tiff"],
    name: "Ortomosaico o modelo de elevación (GeoTIFF)",
    what: "Imagen o altura georreferenciada.",
    supported: false,
    note: "Es una imagen 2D; no se muestra en el visor 3D.",
  },
  {
    ext: [".dxf", ".dwg", ".shp"],
    name: "Curvas de nivel y líneas (DXF, DWG, SHP)",
    what: "Líneas para CAD o GIS.",
    supported: false,
    note: "No hay visor CAD en esta versión.",
  },
  {
    ext: [".rcp", ".rcs", ".e57"],
    name: "Nubes para Autodesk (RCP, RCS) o E57",
    what: "Nubes de escáner y de ReCap.",
    supported: false,
    note: "Expórtelas a LAS desde ReCap o CloudCompare.",
  },
  {
    ext: [".ifc", ".rvt"],
    name: "Modelo BIM (IFC, Revit)",
    what: "El diseño de la obra, no lo construido.",
    supported: false,
    note: "No se lee todavía; compararlo contra lo construido es un trabajo futuro.",
  },
];

export function deliverableFor(filename: string): Deliverable | undefined {
  const lower = filename.toLowerCase();
  return deliverables.find((item) =>
    item.ext.some((ext) => lower.endsWith(ext)),
  );
}
