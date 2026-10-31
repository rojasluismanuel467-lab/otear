import type { Evidence } from "../demo/types";
import { sha256Hex } from "./sha256.ts";
import { DEMO_DAY_TEXT } from "./demo-clock.ts";
import { DEMO_PROFILE_LABEL } from "./demo-profile.ts";
import {
  displayTitle,
  eventAuthor,
  evidenceState,
  roleLabelOf,
  statusLabels,
  templateOf,
} from "./integrity.ts";

const DISCLAIMER = `Firma electrónica simple. Las leyes colombianas (Ley 527 de 1999, Decreto 2364 de 2012) la reconocen como medio de prueba, pero puede ser controvertida. La fecha es la del escenario de la demostración (${DEMO_DAY_TEXT}), la hora es la del dispositivo y no es un sello de tiempo certificado. La firma de esta demostración no tiene valor legal.`;

const HASH_NOTE =
  "La huella (SHA-256) se calcula con el título y el texto del documento tal como se muestra en pantalla, no con el archivo descargado: si alguien cambia una letra, la huella cambia y las firmas anteriores quedan sin validez. Este archivo trae ese texto, así que en la misma demostración se puede pegar en «Verificar un archivo descargado» para comprobarlo. No prueba quién escribió el nombre de quien firma ni la hora exacta.";

const AUTHOR_NOTE = `Quién hizo cada cambio: la demostración no tiene inicio de sesión, así que registra siempre el perfil de la demostración (${DEMO_PROFILE_LABEL}); no es una identidad comprobada.`;

export function bodyOf(evidence: Evidence): string {
  if (evidence.kind === "attachment") {
    const file = evidence.attachment;
    return file
      ? `Archivo adjunto: ${file.name} (${file.size} bytes)\nHuella SHA-256 del archivo: ${file.hash}`
      : "Archivo solicitado; todavía no se ha adjuntado.";
  }
  const template = templateOf(evidence);
  return template ? template.render(evidence.fields) : "";
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function documentText(evidence: Evidence): string {
  const state = evidenceState(evidence);
  const lines = [
    "OTEAR · DOCUMENTO DE DEMOSTRACIÓN",
    "",
    displayTitle(evidence).toUpperCase(),
    "",
    bodyOf(evidence),
    "",
    `Estado: ${statusLabels[state.status]}`,
    `Huella SHA-256 del contenido actual: ${state.hash}`,
    "",
    "FIRMAS",
  ];
  if (!evidence.signatures.length) lines.push("Sin firmas.");
  for (const signature of evidence.signatures) {
    const valid = signature.contentHash === state.hash;
    lines.push(
      `- ${roleLabelOf(evidence, signature.role)}: ${signature.name} (${signature.documentId}) · ${formatTime(signature.signedAt)} · versión ${signature.contentHash.slice(0, 12)} · ${valid ? "válida" : "SIN VALIDEZ: el contenido cambió"}`,
    );
  }
  lines.push("", "HISTORIAL");
  for (const event of evidence.events) {
    const by = eventAuthor(event);
    lines.push(
      `- ${formatTime(event.at)} · ${event.text} (${by ? `perfil de la demostración: ${by}` : "autor no registrado"})`,
    );
  }
  lines.push("", AUTHOR_NOTE, HASH_NOTE, DISCLAIMER);
  return lines.join("\n");
}

export type DownloadCheck = {
  result: "match" | "older" | "mismatch" | "unreadable";
  /** In plain words, ready to show. */
  message: string;
};

const HEX64 = /^[0-9a-f]{64}$/i;

/** The text between the title and the «Estado:» line of a file made by `documentText`. */
function bodyFromDownload(evidence: Evidence, text: string): string | null {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const titleAt = lines.findIndex(
    (line, index) =>
      index > 0 && line.trim() === displayTitle(evidence).toUpperCase(),
  );
  if (titleAt < 0) return null;
  let stateAt = -1;
  for (let index = lines.length - 1; index > titleAt; index -= 1) {
    if (
      lines[index].startsWith("Estado: ") &&
      lines[index + 1]?.startsWith("Huella SHA-256 del contenido actual:")
    ) {
      stateAt = index;
      break;
    }
  }
  if (stateAt < 0) return null;
  return lines.slice(titleAt + 2, stateAt - 1).join("\n");
}

/** A text shorter than this cannot be a document: the check says so instead of calling it «different». */
const MIN_DOCUMENT_TEXT = 40;

/**
 * The text of the «Documento» box on screen, which is the body without the title: the same text the
 * fingerprint is calculated with once the title is put in front. A copy may carry the title on its
 * first line and a trailing line break; neither is part of the document.
 */
function bodyFromScreen(evidence: Evidence, text: string): string {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  while (lines.length && !lines[0].trim()) lines.shift();
  if (lines[0]?.trim().toUpperCase() === displayTitle(evidence).toUpperCase()) {
    lines.shift();
  }
  return lines.join("\n").replace(/\s+$/, "");
}

/**
 * Compares what a person has with the fingerprint this session holds for the document: the
 * downloaded .txt, the text of the «Documento» box on screen, or the 64-character fingerprint. All
 * local; it says whether the text is the one that was fingerprinted, never who wrote it or when.
 * When it cannot read what was pasted it says why and what is missing.
 */
export function checkDownload(evidence: Evidence, text: string): DownloadCheck {
  const unreadable = (message: string): DownloadCheck => ({
    result: "unreadable",
    message,
  });
  if (evidence.kind !== "drafted") {
    return unreadable(
      "Este documento es un archivo adjunto: su huella es la del archivo original, que esta comprobación no recalcula.",
    );
  }
  const trimmed = text.trim();
  if (!trimmed) {
    return unreadable(
      "No hay nada que comprobar. Pegue el texto del recuadro «Documento» o del archivo .txt, cargue el archivo, o escriba la huella de 64 caracteres.",
    );
  }
  let fileHash: string;
  let tampered = false;
  let source: "file" | "screen" | "hash" = "file";
  const compact = trimmed.replace(/\s/g, "");
  if (HEX64.test(compact)) {
    fileHash = compact.toLowerCase();
    source = "hash";
  } else if (/^[0-9a-f]+$/i.test(compact)) {
    const typed = compact.length;
    return unreadable(
      `Eso parece una huella, pero la huella tiene 64 caracteres (números del 0 al 9 y letras de la a a la f) y usted escribió ${typed}. Cópiela completa con «Copiar huella».`,
    );
  } else {
    const body = bodyFromDownload(evidence, text);
    if (body !== null) {
      fileHash = sha256Hex(`${displayTitle(evidence)}\n${body}`);
      const claimed = text.match(
        /Huella SHA-256 del contenido actual:\s*([0-9a-f]{64})/i,
      )?.[1];
      tampered = Boolean(claimed) && claimed?.toLowerCase() !== fileHash;
    } else if (/Huella SHA-256 del contenido actual:/i.test(text)) {
      return unreadable(
        `No se pudo leer: parece el archivo descargado, pero no tiene el título «${displayTitle(evidence).toUpperCase()}» de este documento antes de la línea «Estado:». Es de otro documento o se pegó recortado: descargue el .txt de este documento con «Descargar .txt» y péguelo completo.`,
      );
    } else if (trimmed.length < MIN_DOCUMENT_TEXT) {
      return unreadable(
        "No se pudo leer: es demasiado corto para ser un documento y no es una huella de 64 caracteres. Pegue el texto completo del recuadro «Documento» o del archivo .txt.",
      );
    } else {
      source = "screen";
      fileHash = sha256Hex(
        `${displayTitle(evidence)}\n${bodyFromScreen(evidence, text)}`,
      );
    }
  }
  const state = evidenceState(evidence);
  const short = (hash: string) => `${hash.slice(0, 16)}…`;
  const what =
    source === "screen"
      ? "El texto pegado (el del recuadro «Documento»)"
      : "El texto del archivo";
  if (fileHash === state.hash) {
    return {
      result: "match",
      message:
        source === "hash"
          ? `Coincide. La huella escrita es exactamente la guardada para este documento (${short(state.hash)}). Eso no prueba quién lo firmó ni cuándo.`
          : `Coincide. ${what} es exactamente el de la huella guardada (${short(state.hash)}).${source === "screen" ? " No es el archivo .txt, pero el texto es el mismo." : ""} Eso no prueba quién lo firmó ni cuándo.`,
    };
  }
  if (evidence.signatures.some((s) => s.contentHash === fileHash)) {
    return {
      result: "older",
      message: `No coincide con la versión actual, pero sí con una versión anterior que se firmó (${short(fileHash)}). El documento se modificó después de esa descarga.`,
    };
  }
  if (source === "hash") {
    return {
      result: "mismatch",
      message: `No coincide. Esa huella no es la guardada para este documento (${short(state.hash)}): es de otro documento o el contenido cambió.`,
    };
  }
  return {
    result: "mismatch",
    message: tampered
      ? `No coincide. El archivo trae una huella que no corresponde a su propio texto: alguien lo cambió después de descargarlo. La huella guardada es ${short(state.hash)}.`
      : `No coincide. ${what} no es el de la huella guardada (${short(state.hash)}): se cambió algo, se pegó incompleto o es de otro documento.`,
  };
}

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Self-contained HTML, used to print or save the document as PDF. */
export function documentHtml(evidence: Evidence): string {
  const state = evidenceState(evidence);
  const signatures = evidence.signatures
    .map((signature) => {
      const valid = signature.contentHash === state.hash;
      const image = signature.image
        ? `<img src="${escapeHtml(signature.image)}" alt="Firma de ${escapeHtml(signature.name)}" />`
        : `<em class="typed">${escapeHtml(signature.name)}</em>`;
      return `<tr><td>${image}</td><td><strong>${escapeHtml(signature.name)}</strong><br>${escapeHtml(roleLabelOf(evidence, signature.role))} · ${escapeHtml(signature.documentId)}</td><td>${escapeHtml(formatTime(signature.signedAt))}<br><small>versión ${escapeHtml(signature.contentHash.slice(0, 12))}${valid ? "" : " · sin validez"}</small></td></tr>`;
    })
    .join("");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(displayTitle(evidence))}</title><style>
    body{font:14px/1.6 system-ui,sans-serif;color:#222b32;margin:40px;max-width:720px}
    h1{font-size:20px;margin:0 0 4px}.brand{color:#1c6f8d;font-weight:700;letter-spacing:.06em;font-size:12px}
    pre{white-space:pre-wrap;font:inherit;border:1px solid #e1e5e8;border-radius:12px;padding:16px;background:#f8f9fa}
    table{width:100%;border-collapse:collapse;margin-top:8px}td{border-top:1px solid #e1e5e8;padding:10px 8px;vertical-align:middle}
    img{max-height:56px}.typed{font:italic 22px Georgia,serif}small,.note{color:#646c71;font-size:12px}
    code{font-size:11px;word-break:break-all}
  </style></head><body>
    <div class="brand">OTEAR · DOCUMENTO DE DEMOSTRACIÓN</div>
    <h1>${escapeHtml(displayTitle(evidence))}</h1>
    <pre>${escapeHtml(bodyOf(evidence))}</pre>
    <h2 style="font-size:15px">Firmas</h2>
    ${signatures ? `<table>${signatures}</table>` : "<p>Sin firmas.</p>"}
    <p class="note">Estado: ${escapeHtml(statusLabels[state.status])}<br>Huella SHA-256 del contenido: <code>${escapeHtml(state.hash)}</code></p>
    <p class="note">${escapeHtml(AUTHOR_NOTE)}</p>
    <p class="note">${escapeHtml(HASH_NOTE)}</p>
    <p class="note">${escapeHtml(DISCLAIMER)}</p>
  </body></html>`;
}

/** Opens the browser print dialog for an HTML document (choose "Guardar como PDF"). */
export function printHtml(html: string) {
  const frame = document.createElement("iframe");
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(frame);
  const target = frame.contentWindow;
  if (!target) return;
  target.document.open();
  target.document.write(html);
  target.document.close();
  target.focus();
  setTimeout(() => {
    target.print();
    setTimeout(() => frame.remove(), 1000);
  }, 250);
}

/** Wraps plain text in a printable page, with room for the signatures it mentions. */
export function textToHtml(title: string, text: string): string {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    body{font:14px/1.7 system-ui,sans-serif;color:#222b32;margin:40px;max-width:760px}
    h1{font-size:18px;margin:0 0 12px}pre{white-space:pre-wrap;font:inherit}
  </style></head><body><h1>${escapeHtml(title)}</h1><pre>${escapeHtml(text)}</pre></body></html>`;
}
