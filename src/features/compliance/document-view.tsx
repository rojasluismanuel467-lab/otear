"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Button, Modal } from "@heroui/react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  ChevronRight,
  FileCheck2,
  FileText,
  Info,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useDemo } from "@/features/demo/demo-context";
import type { FlightDocument } from "@/features/demo/types";
import { downloadText, formatDate } from "@/lib/format";
import { DEMO_DATE } from "@/features/demo/demo-data";
import styles from "./compliance.module.css";

const categoryLabels = {
  operator: "Operador",
  pilot: "Piloto",
  drone: "Dron",
  flight: "Vuelo",
};
const statusLabels = {
  reviewed: "Revisado",
  pending: "Por revisar",
  expired: "Fecha vencida",
  missing: "Sin archivo",
};
const tones = {
  reviewed: "success",
  pending: "warning",
  expired: "danger",
  missing: "neutral",
} as const;
const reasons = {
  reviewed: "Revisión registrada en la demo",
  pending: "Necesita revisión del responsable",
  expired: "Revisar la fecha declarada y solicitar actualización",
  missing: "Falta asociar un archivo",
};

function documentSummary(document: FlightDocument, siteName: string) {
  return [
    "OTEAR · FICHA DE DEMOSTRACIÓN",
    "Este texto es una ficha de ejemplo, no el archivo original ni un certificado.",
    "",
    `Proyecto: ${siteName}`,
    `Documento: ${document.title}`,
    `Sujeto: ${document.subject}`,
    `Categoría: ${categoryLabels[document.category]}`,
    `Referencia: ${document.reference}`,
    `Archivo asociado: ${document.fileName ?? "No aportado"}`,
    `Fecha de vigencia declarada: ${document.validUntil ?? "No declarada"}`,
    `Estado de revisión: ${statusLabels[document.status]}`,
    "",
    "La presencia de un archivo o una revisión no acredita validez legal, autorización ni aptitud para operar.",
    "Cambios temporales de esta sesión. Sin envío ni almacenamiento en servidor.",
  ].join("\n");
}

export function DocumentView() {
  const { site, documents, updateDocument, setNotice } = useDemo();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [preview, setPreview] = useState(false);
  const [fileError, setFileError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [dateDraft, setDateDraft] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<string | null>(null);
  const visible = documents.filter(
    (document) =>
      (category === "all" || category === document.category) &&
      (status === "all" || status === document.status) &&
      `${document.title} ${document.subject} ${document.reference}`
        .toLocaleLowerCase("es")
        .includes(query.trim().toLocaleLowerCase("es")),
  );
  const selected =
    visible.find((document) => document.id === selectedId) ?? visible[0];
  const attention = documents.filter(
    (document) => document.status !== "reviewed",
  );
  function selectDocument(document: FlightDocument) {
    setSelectedId(document.id);
    setDateDraft(null);
    setFeedback("");
    setFileError("");
  }
  function announce(message: string) {
    setFeedback(message);
    setNotice(message);
  }
  function chooseFile(id: string) {
    uploadTarget.current = id;
    setFileError("");
    fileInput.current?.click();
  }
  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const target = documents.find(
      (document) => document.id === uploadTarget.current,
    );
    if (!target) return;
    if (!/\.(pdf|jpe?g|png)$/i.test(file.name)) {
      setFileError("Elige un archivo PDF, JPG o PNG.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError(
        "El archivo supera 10 MB. Elige uno más pequeño para esta demo.",
      );
      return;
    }
    updateDocument(target.id, { fileName: file.name, status: "pending" });
    setSelectedId(target.id);
    setStatus("all");
    setDateDraft(null);
    announce(
      `Se asoció el nombre «${file.name}» a esta sesión. No se leyó su contenido ni se cargó al servidor. La fecha declarada se conserva; queda pendiente de revisión.`,
    );
  }
  function markReviewed(document: FlightDocument) {
    if (document.status !== "pending" || !document.fileName) return;
    setSelectedId(document.id);
    setStatus("all");
    if (document.validUntil && document.validUntil < DEMO_DATE) {
      updateDocument(document.id, { status: "expired" });
      announce(
        "La fecha declarada ya venció respecto al 25 de octubre de 2026, fecha de referencia de la demo. Revisa y actualiza los datos antes de registrar la revisión.",
      );
      return;
    }
    updateDocument(document.id, { status: "reviewed" });
    announce(
      "Revisión registrada en esta sesión. No representa autorización ni validación legal del documento.",
    );
  }
  function saveDate(document: FlightDocument) {
    if (dateDraft === null) return;
    setSelectedId(document.id);
    setStatus("all");
    const validUntil = dateDraft || null;
    const nextStatus =
      document.status === "missing"
        ? "missing"
        : validUntil && validUntil < DEMO_DATE
          ? "expired"
          : "pending";
    updateDocument(document.id, { validUntil, status: nextStatus });
    setDateDraft(null);
    announce(
      "Fecha declarada actualizada en esta sesión. No se extrajo del archivo ni se verificó su contenido.",
    );
  }
  return (
    <div className={styles.view}>
      <PageHeading
        title="Documentos"
        description="Los soportes de cada operación, vinculados a quien corresponden."
        actions={
          <span className={styles.context}>
            <ShieldCheck size={17} />
            {site.name}
          </span>
        }
      />
      <section
        className={styles.attention}
        aria-label="Documentos que necesitan atención"
      >
        <div className={styles.attentionHeading}>
          <Info size={20} aria-hidden="true" />
          <div>
            <h2>
              {attention.length
                ? "Antes del próximo vuelo"
                : "Revisiones registradas"}
            </h2>
            <p>
              {attention.length
                ? "Consulta estos soportes con el responsable de la operación."
                : "Puedes consultar los soportes y revisar sus fechas declaradas."}
            </p>
          </div>
        </div>
        {attention.length > 0 && (
          <div className={styles.attentionList}>
            {attention.map((document) => (
              <button
                key={document.id}
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setStatus("all");
                  selectDocument(document);
                }}
              >
                <span>{document.title}</span>
                <small>{statusLabels[document.status]}</small>
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
        <p className={styles.disclaimer}>
          Cargar un archivo o marcarlo como revisado no acredita autorización ni
          cumplimiento.
        </p>
      </section>
      <input
        ref={fileInput}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className={styles.fileInput}
        aria-label="Seleccionar archivo local de ejemplo"
        onChange={handleFile}
      />
      <section className={`surface ${styles.stage}`}>
        <aside
          className={`rail-panel ${styles.rail}`}
          aria-label="Inventario documental"
        >
          <header className={styles.railHeader}>
            <h2>Soportes y documentación</h2>
            <p>
              {visible.length} de {documents.length} documentos
            </p>
          </header>
          <label className={styles.search}>
            <Search size={17} aria-hidden="true" />
            <span className={styles.srOnly}>Buscar documentos</span>
            <input
              placeholder="Buscar documento, sujeto o referencia"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setDateDraft(null);
              }}
            />
          </label>
          <div className={styles.filterRow}>
            <label>
              <span>Tipo de sujeto</span>
              <select
                className="field-select"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setDateDraft(null);
                }}
              >
                <option value="all">Todos los sujetos</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Estado</span>
              <select
                className="field-select"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setDateDraft(null);
                }}
              >
                <option value="all">Todos los estados</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {visible.length ? (
            <ol className={styles.documentList} aria-label="Documentos">
              {visible.map((document, index) => (
                <li
                  key={document.id}
                  style={{ "--i": index } as React.CSSProperties}
                >
                  <button
                    type="button"
                    className={styles.documentRow}
                    data-status={document.status}
                    onClick={() => selectDocument(document)}
                    aria-pressed={selected?.id === document.id}
                  >
                    <span className={styles.fileIcon}>
                      <FileText size={20} aria-hidden="true" />
                    </span>
                    <span className={styles.rowBody}>
                      <strong>{document.title}</strong>
                      <span>{document.subject}</span>
                      <small
                        className={
                          document.status === "expired" ? styles.expired : ""
                        }
                      >
                        {categoryLabels[document.category]} ·{" "}
                        {document.validUntil
                          ? `hasta ${formatDate(document.validUntil)}`
                          : "sin fecha declarada"}
                      </small>
                      <StatusBadge tone={tones[document.status]}>
                        {statusLabels[document.status]}
                      </StatusBadge>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              title="No encontramos esos documentos"
              description="Prueba con otro sujeto, estado o texto de búsqueda."
            />
          )}
          <div className={styles.railFooter}>
            {(query || category !== "all" || status !== "all") && (
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setStatus("all");
                  setDateDraft(null);
                }}
              >
                Limpiar filtros
              </button>
            )}
            <span>Datos de ejemplo</span>
          </div>
        </aside>
        {selected ? (
          <div
            className={styles.detail}
            key={selected.id}
            role="region"
            aria-label={`Detalle: ${selected.title}`}
          >
            <header className={styles.detailTop}>
              <span className={styles.largeFile} data-status={selected.status}>
                <FileCheck2 size={28} aria-hidden="true" />
              </span>
              <div>
                <h2>{selected.title}</h2>
                <p className={styles.subject}>
                  {selected.subject} · {categoryLabels[selected.category]}
                </p>
              </div>
              <StatusBadge tone={tones[selected.status]}>
                {statusLabels[selected.status]}
              </StatusBadge>
            </header>
            <dl className={styles.metadata}>
              <div>
                <dt>Referencia</dt>
                <dd>{selected.reference}</dd>
              </div>
              <div>
                <dt>Proyecto</dt>
                <dd>{site.name}</dd>
              </div>
              <div>
                <dt>Archivo asociado</dt>
                <dd>{selected.fileName ?? "Todavía no aportado"}</dd>
              </div>
              <div>
                <dt>Vigencia declarada hasta</dt>
                <dd>
                  {selected.validUntil
                    ? formatDate(selected.validUntil)
                    : "Sin fecha declarada"}
                </dd>
              </div>
            </dl>
            <div
              className={`${styles.reviewNote} ${selected.status === "expired" ? styles.reviewWarning : ""}`}
            >
              <Info size={17} aria-hidden="true" />
              <p>
                {reasons[selected.status]}.{" "}
                {selected.status === "expired"
                  ? "Cambiar el archivo conserva la fecha declarada. Una revisión no renueva su vigencia ni autoriza el vuelo."
                  : "La ficha contiene información de ejemplo, pendiente de verificación con la fuente correspondiente."}
              </p>
            </div>
            <div className={styles.detailActions}>
              {selected.fileName && (
                <Button variant="secondary" onPress={() => setPreview(true)}>
                  <FileText size={16} />
                  Ver ficha de ejemplo
                </Button>
              )}
              <Button
                variant={selected.fileName ? "outline" : "primary"}
                onPress={() => chooseFile(selected.id)}
              >
                <ArrowUpFromLine size={16} />
                {selected.fileName
                  ? "Reemplazar archivo local"
                  : "Asociar archivo local"}
              </Button>
              {selected.status === "pending" && selected.fileName && (
                <Button
                  variant="primary"
                  onPress={() => markReviewed(selected)}
                >
                  <Check size={16} />
                  Registrar revisión de ejemplo
                </Button>
              )}
            </div>
            <p className={styles.smallNote}>
              PDF, JPG o PNG · máximo 10 MB. Solo se conserva el nombre en esta
              sesión; el contenido no se lee ni se envía.
            </p>
            <details className={styles.dateEditor} key={selected.id}>
              <summary>Corregir fecha declarada</summary>
              <label className="form-field">
                <span className="field-label">Fecha de vigencia hasta</span>
                <input
                  type="date"
                  className="field-input"
                  value={dateDraft ?? selected.validUntil ?? ""}
                  onChange={(event) => setDateDraft(event.target.value)}
                />
              </label>
              <p className={styles.smallNote}>
                Deja el campo vacío si la fecha no está declarada. El cambio
                requiere una nueva revisión.
              </p>
              <Button
                variant="secondary"
                isDisabled={dateDraft === null}
                onPress={() => saveDate(selected)}
              >
                Guardar fecha de ejemplo
              </Button>
            </details>
            {fileError && (
              <p role="alert" className={styles.error}>
                {fileError}
              </p>
            )}
            {feedback && (
              <p role="status" className={styles.feedback}>
                {feedback}
              </p>
            )}
          </div>
        ) : (
          <div className={styles.detailEmpty}>
            <EmptyState
              title="Selecciona un soporte"
              description="El detalle estará disponible al encontrar documentos con los filtros."
            />
          </div>
        )}
      </section>
      <p className="demo-note">
        Demostración · archivos, fechas y estados son de ejemplo. Los cambios se
        pierden al reiniciar. No sustituye la revisión del responsable ni
        determina si una operación puede realizarse.
      </p>
      <Modal isOpen={preview && Boolean(selected)} onOpenChange={setPreview}>
        <Modal.Backdrop>
          <Modal.Container size="lg">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Ficha de demostración</Modal.Heading>
                <Modal.CloseTrigger aria-label="Cerrar vista previa">
                  <X size={18} />
                </Modal.CloseTrigger>
              </Modal.Header>
              <Modal.Body>
                {selected && (
                  <>
                    <p className="demo-note">
                      Esta ficha no es una vista del archivo original
                      seleccionado.
                    </p>
                    <pre className={styles.preview}>
                      {documentSummary(selected, site.name)}
                    </pre>
                  </>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onPress={() => setPreview(false)}>
                  Cerrar
                </Button>
                <Button
                  variant="primary"
                  onPress={() => {
                    if (selected)
                      downloadText(
                        `${selected.reference}-ficha-demo.txt`,
                        documentSummary(selected, site.name),
                      );
                  }}
                >
                  <ArrowDownToLine size={16} />
                  Descargar ficha .txt
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
