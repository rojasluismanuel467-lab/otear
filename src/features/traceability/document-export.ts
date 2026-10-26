import type { Evidence } from "../demo/types";
import { evidenceState, statusLabels } from "./integrity.ts";
import { templates, type TemplateId } from "./templates.ts";

const DISCLAIMER =
  "Firma electrónica simple. Las leyes colombianas (Ley 527 de 1999, Decreto 2364 de 2012) la reconocen como medio de prueba, pero puede ser controvertida. La hora es la del dispositivo y no es un sello de tiempo certificado.";

export function bodyOf(evidence: Evidence): string {
  if (evidence.kind === "attachment") {
    const file = evidence.attachment;
    return file
      ? `Archivo adjunto: ${file.name} (${file.size} bytes)\nHuella SHA-256 del archivo: ${file.hash}`
      : "Archivo solicitado; todavía no se ha adjuntado.";
  }
  const template = evidence.templateId
    ? templates[evidence.templateId as TemplateId]
    : undefined;
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
    evidence.title.toUpperCase(),
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
      `- ${signature.role}: ${signature.name} (${signature.documentId}) · ${formatTime(signature.signedAt)} · versión ${signature.contentHash.slice(0, 12)} · ${valid ? "válida" : "SIN VALIDEZ: el contenido cambió"}`,
    );
  }
  lines.push("", "HISTORIAL");
  for (const event of evidence.events) {
    lines.push(`- ${formatTime(event.at)} · ${event.text}`);
  }
  lines.push("", DISCLAIMER);
  return lines.join("\n");
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
      return `<tr><td>${image}</td><td><strong>${escapeHtml(signature.name)}</strong><br>${escapeHtml(signature.role)} · ${escapeHtml(signature.documentId)}</td><td>${escapeHtml(formatTime(signature.signedAt))}<br><small>versión ${escapeHtml(signature.contentHash.slice(0, 12))}${valid ? "" : " · sin validez"}</small></td></tr>`;
    })
    .join("");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(evidence.title)}</title><style>
    body{font:14px/1.6 system-ui,sans-serif;color:#22322e;margin:40px;max-width:720px}
    h1{font-size:20px;margin:0 0 4px}.brand{color:#246b50;font-weight:700;letter-spacing:.06em;font-size:12px}
    pre{white-space:pre-wrap;font:inherit;border:1px solid #e3e8e1;border-radius:12px;padding:16px;background:#f9faf8}
    table{width:100%;border-collapse:collapse;margin-top:8px}td{border-top:1px solid #e3e8e1;padding:10px 8px;vertical-align:middle}
    img{max-height:56px}.typed{font:italic 22px Georgia,serif}small,.note{color:#64716b;font-size:12px}
    code{font-size:11px;word-break:break-all}
  </style></head><body>
    <div class="brand">OTEAR · DOCUMENTO DE DEMOSTRACIÓN</div>
    <h1>${escapeHtml(evidence.title)}</h1>
    <pre>${escapeHtml(bodyOf(evidence))}</pre>
    <h2 style="font-size:15px">Firmas</h2>
    ${signatures ? `<table>${signatures}</table>` : "<p>Sin firmas.</p>"}
    <p class="note">Estado: ${escapeHtml(statusLabels[state.status])}<br>Huella SHA-256 del contenido: <code>${escapeHtml(state.hash)}</code></p>
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
    body{font:14px/1.7 system-ui,sans-serif;color:#22322e;margin:40px;max-width:760px}
    h1{font-size:18px;margin:0 0 12px}pre{white-space:pre-wrap;font:inherit}
  </style></head><body><h1>${escapeHtml(title)}</h1><pre>${escapeHtml(text)}</pre></body></html>`;
}
