"use client";

import { useRef, useState } from "react";
import { Button, Modal } from "@heroui/react";
import {
  Copy,
  Download,
  FileUp,
  Fingerprint,
  Printer,
  RefreshCw,
  Send,
  SearchCheck,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDemo } from "@/features/demo/demo-context";
import type { Evidence, Flight, Site } from "@/features/demo/types";
import { downloadText } from "@/lib/format";
import {
  checkDownload,
  documentHtml,
  documentText,
  printHtml,
  type DownloadCheck,
} from "./document-export";
import { DEMO_CLOCK_NOTE, demoNow } from "./demo-clock";
import { DEMO_PROFILE_LABEL } from "./demo-profile";
import { flightReportChanges } from "./flight-report-document";
import {
  eventAuthor,
  eventOf,
  evidenceState,
  isComplete,
  newEvidence,
  NO_IDENTITY_CHECK,
  signingConflict,
  statusLabels,
  withFields,
  withSignature,
  type EvidenceStatus,
} from "./integrity";
import { sha256Hex } from "./sha256";
import { SignaturePad } from "./signature-pad";
import { signerProblem } from "./signers";
import {
  autofill,
  missingFields,
  roleLabel,
  suggestedSigner,
  templateFor,
  type TemplateId,
} from "./templates";
import styles from "./traceability.module.css";

const tones: Record<
  EvidenceStatus,
  "success" | "warning" | "danger" | "info" | "neutral"
> = {
  draft: "neutral",
  partial: "warning",
  signed: "success",
  altered: "danger",
  attached: "success",
  requested: "info",
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function time(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function EvidenceDialog({
  isOpen,
  onOpenChange,
  site,
  flight,
  templateId,
  prefill,
  onComplete,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  site: Site;
  flight: Flight;
  templateId: TemplateId;
  /** Content the opening screen already has (the flight report's text), applied over the autofill. */
  prefill?: Record<string, string>;
  /** Called when the document becomes complete (all signatures, or a file attached). */
  onComplete: (templateId: TemplateId) => void;
}) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size="lg" scroll="inside">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>
                {templateFor(templateId, site.sector).title}
              </Modal.Heading>
              <Modal.CloseTrigger aria-label="Cerrar documento" />
            </Modal.Header>
            <Modal.Body>
              <EvidenceBody
                site={site}
                flight={flight}
                templateId={templateId}
                prefill={prefill}
                onComplete={onComplete}
                onClose={() => onOpenChange(false)}
              />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function EvidenceBody({
  site,
  flight,
  templateId,
  prefill,
  onComplete,
  onClose,
}: {
  site: Site;
  flight: Flight;
  templateId: TemplateId;
  prefill?: Record<string, string>;
  onComplete: (templateId: TemplateId) => void;
  onClose: () => void;
}) {
  const { evidences, saveEvidence, removeEvidence, setNotice } = useDemo();
  const template = templateFor(templateId, site.sector);
  const stored = evidences.find(
    (item) => item.flightId === flight.id && item.templateId === templateId,
  );
  const auto = { ...autofill(templateId, { site, flight }), ...prefill };
  const [fields, setFields] = useState<Record<string, string>>(() => ({
    ...auto,
    ...(stored?.fields ?? {}),
  }));
  const [mode, setMode] = useState<"draft" | "attach">(
    stored?.kind === "attachment" ? "attach" : "draft",
  );
  const [signing, setSigning] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [signer, setSigner] = useState({
    name: "",
    documentId: "",
    method: "drawn" as "drawn" | "typed",
    image: "",
    consent: false,
  });
  const [requestTo, setRequestTo] = useState("");
  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState("");
  const [downloadCheck, setDownloadCheck] = useState<DownloadCheck | null>(
    null,
  );
  const fileInput = useRef<HTMLInputElement>(null);
  const downloadInput = useRef<HTMLInputElement>(null);

  const base: Evidence =
    stored ??
    newEvidence(
      {
        siteId: site.id,
        flightId: flight.id,
        kind: "drafted",
        templateId,
        title: template.title,
        fields,
      },
      demoNow(),
      DEMO_PROFILE_LABEL,
    );
  const working: Evidence =
    base.kind === "drafted" ? { ...base, fields } : base;
  const state = evidenceState(working);
  const dirty =
    Boolean(stored) &&
    stored?.kind === "drafted" &&
    Object.keys({ ...stored.fields, ...fields }).some(
      (key) => (stored.fields[key] ?? "") !== (fields[key] ?? ""),
    );
  const missing = missingFields(templateId, fields);
  // A report taken from the flight's record can fall behind it: say which parts changed.
  const outdated =
    template.fromRecord && prefill && stored
      ? flightReportChanges(stored, prefill)
      : [];
  const outdatedAfterEdit =
    stored && prefill
      ? flightReportChanges({ ...stored, fields }, prefill)
      : [];
  const editable = template.fields.filter((field) => !field.hidden);
  const labelOf = (role: string) => roleLabel(template, role);

  function persistFields(): Evidence {
    const now = demoNow();
    const saved =
      stored && stored.kind === "drafted"
        ? withFields(stored, fields, now, DEMO_PROFILE_LABEL)
        : newEvidence(
            {
              ...(stored ? { id: stored.id } : {}),
              siteId: site.id,
              flightId: flight.id,
              kind: "drafted",
              templateId,
              title: template.title,
              fields,
            },
            now,
            DEMO_PROFILE_LABEL,
          );
    saveEvidence(saved);
    return saved;
  }

  function startSigning(role: string) {
    if (missing.length) {
      setError(`Antes de firmar complete: ${missing.join(", ")}.`);
      return;
    }
    setError("");
    setSigning(role);
    setSigner({
      ...suggestedSigner(role, fields, flight),
      method: "drawn",
      image: "",
      consent: false,
    });
  }

  function confirmSigning() {
    if (!signing) return;
    const problem = signerProblem(signer);
    if (problem) {
      setError(problem);
      return;
    }
    if (signer.method === "drawn" && !signer.image) {
      setError("Dibuje la firma o cambie a firma escrita.");
      return;
    }
    if (!signer.consent) {
      setError("Confirme que acepta firmar electrónicamente.");
      return;
    }
    const conflict = signingConflict(working, signing, signer);
    if (conflict) {
      setError(conflict);
      return;
    }
    const now = demoNow();
    const saved = persistFields();
    const signed = withSignature(
      saved,
      {
        role: signing,
        name: signer.name.trim(),
        documentId: signer.documentId.trim(),
        method: signer.method,
        image: signer.method === "drawn" ? signer.image : undefined,
      },
      now,
      DEMO_PROFILE_LABEL,
    );
    saveEvidence(signed);
    setSigning(null);
    setError("");
    setNotice(
      `Firma de ${signer.name.trim()} registrada. El documento queda con su huella.`,
    );
    if (isComplete(signed)) onComplete(templateId);
  }

  async function attach(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setError("El archivo supera 10 MB.");
      return;
    }
    const hash = sha256Hex(new Uint8Array(await file.arrayBuffer()));
    const now = demoNow();
    const attachment = newEvidence(
      {
        ...(stored ? { id: stored.id } : {}),
        siteId: site.id,
        flightId: flight.id,
        kind: "attachment",
        templateId,
        title: template.title,
        attachment: { name: file.name, size: file.size, hash },
      },
      now,
      DEMO_PROFILE_LABEL,
    );
    saveEvidence({
      ...attachment,
      events: [
        ...(stored?.events ?? []),
        eventOf(
          now,
          `Se adjuntó «${file.name}». Huella SHA-256 del archivo: ${hash.slice(0, 12)}.`,
          DEMO_PROFILE_LABEL,
        ),
      ],
    });
    setError("");
    setNotice(
      "Archivo adjunto con su huella. El contenido no salió de su navegador.",
    );
    onComplete(templateId);
  }

  function request() {
    if (requestTo.trim().length < 3) {
      setError("Escriba a quién se le pide el documento.");
      return;
    }
    const now = demoNow();
    const text = `Se pidió a ${requestTo.trim()} que revise y firme. En la demo no se envía nada.`;
    const current = stored ?? persistFields();
    saveEvidence({
      ...current,
      requestedFrom: requestTo.trim(),
      events: [...current.events, eventOf(now, text, DEMO_PROFILE_LABEL)],
    });
    setRequestTo("");
    setError("");
    setNotice("Solicitud registrada. En la demo no se envía ningún mensaje.");
  }

  async function loadDownload(file: File | undefined) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setDownloadCheck({
        result: "unreadable",
        message:
          "El archivo supera 2 MB; un documento de texto es mucho menor.",
      });
      return;
    }
    const text = await file.text();
    setDownloaded(text);
    setDownloadCheck(stored ? checkDownload(stored, text) : null);
  }

  async function copyHash(hash: string) {
    try {
      await navigator.clipboard.writeText(hash);
      setNotice("Huella copiada: son los 64 caracteres completos.");
    } catch {
      setNotice(
        "No se pudo copiar solo. Seleccione la huella con el ratón o el teclado y cópiela.",
      );
    }
  }

  const roleSignature = (role: string) =>
    working.signatures.find((signature) => signature.role === role);

  return (
    <div className={styles.dialog}>
      <div className={styles.statusBar}>
        <StatusBadge tone={tones[state.status]}>
          {statusLabels[state.status]}
        </StatusBadge>
        <span className={styles.hash}>
          <Fingerprint size={15} aria-hidden="true" />
          <span>
            Huella <code className={styles.hashFull}>{state.hash}</code>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => void copyHash(state.hash)}
          >
            <Copy size={14} aria-hidden="true" />
            Copiar huella
          </Button>
        </span>
      </div>
      <p className={styles.note}>{template.note}</p>

      {!template.fromRecord && (
        <div
          className="segmented-control"
          role="group"
          aria-label="Cómo respaldar este ítem"
        >
          <button
            type="button"
            aria-pressed={mode === "draft"}
            onClick={() => setMode("draft")}
          >
            Redactar y firmar aquí
          </button>
          <button
            type="button"
            aria-pressed={mode === "attach"}
            onClick={() => setMode("attach")}
          >
            Adjuntar un archivo
          </button>
        </div>
      )}

      {mode === "attach" ? (
        <section className={styles.section}>
          <h3>Archivo existente</h3>
          <p className={styles.hint}>
            Se calcula la huella del archivo en su navegador; el contenido no se
            envía a ningún servidor.
          </p>
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className={styles.hidden}
            aria-label="Elegir archivo PDF, JPG o PNG"
            onChange={(event) => {
              void attach(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <Button variant="primary" onPress={() => fileInput.current?.click()}>
            <FileUp size={16} aria-hidden="true" />
            {stored?.kind === "attachment"
              ? "Reemplazar archivo"
              : "Elegir archivo"}
          </Button>
          {stored?.kind === "attachment" && stored.attachment && (
            <p className={styles.fileLine}>
              <ShieldCheck size={16} aria-hidden="true" />
              {stored.attachment.name} ·{" "}
              {Math.round(stored.attachment.size / 1024)} KB · huella{" "}
              {stored.attachment.hash.slice(0, 12)}…
            </p>
          )}
        </section>
      ) : (
        <div className={styles.columns}>
          <section className={styles.section} aria-label="Datos del documento">
            <h3>Datos</h3>
            {template.fromRecord && (
              <>
                <p className={styles.hint}>
                  Este informe se arma con el registro del vuelo: usted lo lee
                  en «Documento» y lo firma. Para cambiar su contenido, cambie
                  el vuelo, los puntos incluidos o las notas en la pantalla del
                  informe y vuelva a abrir este documento.
                </p>
                {outdated.length > 0 && (
                  <div className={styles.alert} role="status">
                    <TriangleAlert size={16} aria-hidden="true" />
                    <span>
                      El informe en pantalla ya no coincide con el guardado
                      (cambió: {outdated.join(", ")}).{" "}
                      {outdatedAfterEdit.length === 0
                        ? "Ya cargó los datos actuales: pulse «Guardar cambios» para dejar el cambio en el historial; las firmas anteriores quedarán sin validez."
                        : "Si lo actualiza, las firmas hechas sobre la versión anterior quedan sin validez."}
                    </span>
                  </div>
                )}
                {outdatedAfterEdit.length > 0 && (
                  <Button
                    variant="secondary"
                    onPress={() =>
                      setFields((current) => ({ ...current, ...prefill }))
                    }
                  >
                    <RefreshCw size={16} aria-hidden="true" />
                    Usar los datos actuales del vuelo
                  </Button>
                )}
              </>
            )}
            {editable.map((field) => {
              const isAuto =
                Boolean(auto[field.key]) &&
                fields[field.key] === auto[field.key];
              const id = `field-${field.key}`;
              return (
                <label className="form-field" key={field.key} htmlFor={id}>
                  <span className="field-label">
                    {field.label}
                    {field.required && " *"}
                    {isAuto && <em className={styles.auto}>se llenó solo</em>}
                  </span>
                  {field.type === "textarea" ? (
                    <textarea
                      id={id}
                      className="field-input"
                      rows={3}
                      value={fields[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(event) =>
                        setFields((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={id}
                      className="field-select"
                      value={fields[field.key] ?? ""}
                      onChange={(event) =>
                        setFields((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                    >
                      <option value="">Elegir…</option>
                      {field.options?.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={id}
                      className="field-input"
                      type={field.type}
                      value={fields[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(event) =>
                        setFields((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                    />
                  )}
                </label>
              );
            })}
          </section>
          <section
            className={styles.section}
            aria-label="Vista previa del documento"
          >
            <h3>Documento</h3>
            <pre className={styles.preview}>{template.render(fields)}</pre>
            {state.staleSignatures.length > 0 && (
              <p className={styles.alert} role="alert">
                <TriangleAlert size={16} aria-hidden="true" />
                El contenido cambió después de firmar. Las firmas de{" "}
                {state.staleSignatures
                  .map((signature) => labelOf(signature.role))
                  .join(", ")}{" "}
                ya no valen: deben firmar de nuevo.
              </p>
            )}
          </section>
        </div>
      )}

      {mode === "draft" && (
        <section className={styles.section} aria-label="Firmas">
          <h3>Firmas</h3>
          <ul className={styles.signers}>
            {template.signers.map((item) => {
              const signature = roleSignature(item.role);
              const valid = signature?.contentHash === state.hash;
              return (
                <li
                  key={item.role}
                  data-state={
                    signature ? (valid ? "valid" : "stale") : "pending"
                  }
                >
                  <span className={styles.signerName}>
                    <strong>{labelOf(item.role)}</strong>
                    <small>
                      {signature
                        ? `${signature.name} · ${time(signature.signedAt)}${valid ? "" : " · sin validez"}`
                        : "Pendiente"}
                    </small>
                    {template.roleHints?.[item.role] && (
                      <small>{template.roleHints[item.role]}</small>
                    )}
                  </span>
                  <Button
                    variant={signature && valid ? "ghost" : "secondary"}
                    onPress={() => startSigning(item.role)}
                  >
                    {signature
                      ? valid
                        ? "Volver a firmar"
                        : "Firmar de nuevo"
                      : "Firmar"}
                  </Button>
                </li>
              );
            })}
          </ul>
          {signing && (
            <div
              className={styles.signPanel}
              role="group"
              aria-label={`Firmar como ${labelOf(signing)}`}
            >
              <h4>Firmar como {labelOf(signing)}</h4>
              <div className={styles.signFields}>
                <label className="form-field">
                  <span className="field-label">Nombre completo</span>
                  <input
                    className="field-input"
                    value={signer.name}
                    onChange={(event) =>
                      setSigner({ ...signer, name: event.target.value })
                    }
                  />
                </label>
                <label className="form-field">
                  <span className="field-label">Cédula o NIT</span>
                  <input
                    className="field-input"
                    value={signer.documentId}
                    onChange={(event) =>
                      setSigner({ ...signer, documentId: event.target.value })
                    }
                  />
                </label>
              </div>
              <div
                className="segmented-control"
                role="group"
                aria-label="Tipo de firma"
              >
                <button
                  type="button"
                  aria-pressed={signer.method === "drawn"}
                  onClick={() => setSigner({ ...signer, method: "drawn" })}
                >
                  Dibujar
                </button>
                <button
                  type="button"
                  aria-pressed={signer.method === "typed"}
                  onClick={() => setSigner({ ...signer, method: "typed" })}
                >
                  Escribir el nombre
                </button>
              </div>
              {signer.method === "drawn" ? (
                <SignaturePad
                  label="Espacio para dibujar la firma"
                  onChange={(image) =>
                    setSigner((current) => ({ ...current, image }))
                  }
                />
              ) : (
                <p className={styles.typedSignature}>
                  {signer.name || "Su nombre aparecerá aquí"}
                </p>
              )}
              <label className={styles.consent}>
                <input
                  type="checkbox"
                  checked={signer.consent}
                  onChange={(event) =>
                    setSigner({ ...signer, consent: event.target.checked })
                  }
                />
                Acepto firmar este documento electrónicamente y entiendo que se
                guarda con la fecha de la demostración, la hora de este
                dispositivo y la huella de su contenido.
              </label>
              {template.separateRoles && (
                <p className={styles.hint}>
                  En este documento cada rol lo firma una persona distinta.{" "}
                  {NO_IDENTITY_CHECK}
                </p>
              )}
              <p className={styles.hint}>
                Es una firma electrónica simple: sirve como prueba de
                consentimiento (Ley 527 de 1999, Decreto 2364 de 2012) pero
                puede ser controvertida. Para mayor respaldo se usaría una firma
                digital con certificado de una entidad acreditada; no está
                incluida en la demo.
              </p>
              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}
              <div className={styles.inline}>
                <Button variant="primary" onPress={confirmSigning}>
                  Firmar documento
                </Button>
                <Button variant="ghost" onPress={() => setSigning(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      <section className={styles.section} aria-label="Pedir a un tercero">
        <h3>Pedir a otra persona</h3>
        {stored?.requestedFrom ? (
          <p className={styles.fileLine}>
            <Send size={16} aria-hidden="true" />
            Solicitado a {stored.requestedFrom}. Si firma en este dispositivo,
            use «Firmar».
          </p>
        ) : (
          <p className={styles.hint}>
            Por ejemplo,{" "}
            {template.requestExample ?? "quien debe revisar o firmar"}. En la
            versión conectada se enviaría un enlace por correo o WhatsApp; en la
            demo solo queda el registro.
          </p>
        )}
        <div className={styles.inline}>
          <input
            className="field-input"
            value={requestTo}
            placeholder="Nombre de quien debe revisar o firmar"
            aria-label="Nombre de quien debe revisar o firmar"
            onChange={(event) => setRequestTo(event.target.value)}
          />
          <Button variant="secondary" onPress={request}>
            <Send size={16} aria-hidden="true" />
            Registrar solicitud
          </Button>
        </div>
      </section>

      {mode === "draft" && stored?.kind === "drafted" && (
        <section
          className={styles.section}
          aria-label="Verificar un archivo descargado"
        >
          <h3>Verificar un archivo descargado</h3>
          <p className={styles.hint}>
            Pegue el texto del .txt que descargó, o el del recuadro «Documento»
            de arriba (cárguelo con el botón, o escriba la huella de 64
            caracteres: se copia completa con «Copiar huella») y se compara con
            la huella guardada. Todo ocurre en su navegador; no se envía nada.
            Solo comprueba que el texto es el mismo, no quién lo firmó ni
            cuándo.
          </p>
          <label className="form-field">
            <span className="field-label">Texto del archivo o huella</span>
            <textarea
              className="field-input"
              rows={3}
              value={downloaded}
              onChange={(event) => {
                setDownloaded(event.target.value);
                setDownloadCheck(null);
              }}
            />
          </label>
          <input
            ref={downloadInput}
            type="file"
            accept=".txt,text/plain"
            className={styles.hidden}
            aria-label="Elegir el archivo .txt descargado"
            onChange={(event) => {
              void loadDownload(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <div className={styles.inline}>
            <Button
              variant="secondary"
              onPress={() => downloadInput.current?.click()}
            >
              <FileUp size={16} aria-hidden="true" />
              Cargar el archivo .txt
            </Button>
            <Button
              variant="primary"
              isDisabled={!downloaded.trim()}
              onPress={() =>
                setDownloadCheck(checkDownload(stored, downloaded))
              }
            >
              <SearchCheck size={16} aria-hidden="true" />
              Comprobar
            </Button>
          </div>
          {downloadCheck && (
            <p
              className={
                downloadCheck.result === "match"
                  ? styles.fileLine
                  : styles.alert
              }
              role="status"
              data-result={downloadCheck.result}
            >
              {downloadCheck.result === "match" ? (
                <ShieldCheck size={16} aria-hidden="true" />
              ) : (
                <TriangleAlert size={16} aria-hidden="true" />
              )}
              {downloadCheck.message}
            </p>
          )}
        </section>
      )}

      {working.events.length > 0 && (
        <section
          className={styles.section}
          aria-label="Historial del documento"
        >
          <h3>Historial</h3>
          <ol className={styles.events}>
            {[...working.events].reverse().map((event, index) => (
              <li key={`${event.at}-${index}`}>
                <time dateTime={event.at}>{time(event.at)}</time>
                <span>
                  {event.text}
                  <small className={styles.eventAuthor}>
                    {eventAuthor(event)
                      ? `Perfil de la demostración: ${eventAuthor(event)}`
                      : "Autor no registrado"}
                  </small>
                </span>
              </li>
            ))}
          </ol>
          <p className={styles.hint}>
            La demostración no tiene inicio de sesión: cada cambio queda a
            nombre del perfil de la demostración ({DEMO_PROFILE_LABEL}), que no
            es una identidad comprobada. {DEMO_CLOCK_NOTE}
          </p>
        </section>
      )}

      {error && !signing && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.footer}>
        {mode === "draft" && (
          <Button
            variant="secondary"
            isDisabled={!dirty && Boolean(stored)}
            onPress={() => {
              persistFields();
              setNotice("Cambios guardados en el historial del documento.");
            }}
          >
            Guardar cambios
          </Button>
        )}
        <Button
          variant="ghost"
          onPress={() =>
            downloadText(
              `${templateId}-${flight.id}.txt`,
              documentText(working),
            )
          }
        >
          <Download size={16} aria-hidden="true" />
          Descargar .txt
        </Button>
        <Button
          variant="ghost"
          onPress={() => printHtml(documentHtml(working))}
        >
          <Printer size={16} aria-hidden="true" />
          Imprimir o guardar PDF
        </Button>
        {stored && !confirmRemove && (
          <Button variant="ghost" onPress={() => setConfirmRemove(true)}>
            <Trash2 size={16} aria-hidden="true" />
            Eliminar
          </Button>
        )}
        {stored && confirmRemove && (
          <div role="group" aria-label="Confirmar eliminación">
            <p>
              {evidenceState(stored).validRoles.length
                ? `Este documento tiene firmas de ${evidenceState(stored).validRoleLabels.join(", ")}. Al eliminarlo se pierden el documento, las firmas y su historial de esta demostración.`
                : "Se elimina el documento y su historial de esta demostración."}
            </p>
            <Button
              variant="danger"
              onPress={() => {
                removeEvidence(stored.id);
                setNotice(
                  `«${template.title}» eliminado por el perfil de la demostración (${DEMO_PROFILE_LABEL}). Se perdieron el documento, sus firmas y su historial.`,
                );
                onClose();
              }}
            >
              <Trash2 size={16} aria-hidden="true" />
              Sí, eliminar
            </Button>
            <Button variant="ghost" onPress={() => setConfirmRemove(false)}>
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
