import { sha256Hex } from "../traceability/sha256";

const MAX_SIDE = 960;

/** Shrinks a photo taken during an inspection and fingerprints what is kept. */
export async function readPhoto(
  file: File,
): Promise<{ name: string; dataUrl: string; hash: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
  const binary = atob(dataUrl.split(",")[1]);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return { name: file.name, dataUrl, hash: sha256Hex(bytes) };
}
