"use client";

import { useState } from "react";
import { Button, Modal } from "@heroui/react";
import { Columns2, Expand, ImageIcon } from "lucide-react";
import type { Finding, Flight, Site } from "@/features/demo/types";
import { EmptyState } from "@/components/ui/empty-state";
import { SiteImage } from "@/components/ui/site-image";
import { illustrationLabel } from "@/lib/illustration";
import { formatDate } from "@/lib/format";
import { agree } from "../finding-words";
import { useFindingWords } from "../use-finding-words";
import styles from "./flight-review.module.css";

export function EvidenceGallery({
  site,
  flight,
  findings,
  onFindingSelect,
}: {
  site: Site;
  flight: Flight;
  findings: Finding[];
  onFindingSelect: (id: string) => void;
}) {
  const words = useFindingWords();
  const [isComparing, setIsComparing] = useState(false);
  if (flight.status !== "completed") {
    return (
      <EmptyState
        title="Todavía no hay una entrega"
        description={`Este vuelo no tiene una ejecución documentada. Sus fotos y ${words.plural} aparecerían aquí al recibirlas.`}
      />
    );
  }

  const samples = [
    {
      id: "overview",
      title: "Vista general de muestra",
      imageUrl: site.imageUrl,
      zone: site.name,
    },
    ...findings.map((finding) => ({
      id: finding.id,
      title: finding.title,
      imageUrl: finding.imageUrl,
      zone:
        site.zones.find((zone) => zone.id === finding.zoneId)?.name ??
        "Zona sin asignar",
    })),
  ];

  return (
    <div className={styles.stack}>
      <div className="toolbar">
        <div>
          <h2 className="section-heading">Archivo visual</h2>
          <p className="text-muted">
            {samples.length} vistas ilustrativas · {formatDate(flight.date)}
          </p>
        </div>
        <Button
          variant="secondary"
          onPress={() => setIsComparing(!isComparing)}
        >
          <Columns2 size={17} aria-hidden="true" />
          {isComparing ? "Cerrar comparación" : "Explorar comparación"}
        </Button>
      </div>
      <p className="demo-note">
        Estas imágenes ilustran el recorrido. No son fotografías
        georreferenciadas del sitio ni una entrega real del operador.
      </p>
      {isComparing && (
        <section
          className={`surface ${styles.compare}`}
          aria-label="Comparación visual de muestra"
        >
          <div>
            <h3>Dos vistas, el mismo contexto</h3>
            <p className="text-muted">
              Solo hay una imagen ilustrativa disponible. Se repite para mostrar
              la disposición; no representa dos vuelos ni permite concluir
              cambios.
            </p>
          </div>
          <div className={styles.compareGrid}>
            {["A", "B"].map((label) => (
              <figure key={label}>
                <SiteImage
                  src={site.imageUrl}
                  alt={`Vista ilustrativa ${label}, la misma imagen de muestra`}
                  width={900}
                  height={600}
                />
                <figcaption>
                  Vista {label} · misma imagen de muestra ·{" "}
                  {formatDate(flight.date)}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
      <div className={styles.gallery}>
        {samples.map((sample) => (
          <article className={styles.photoCard} key={sample.id}>
            <Modal>
              <Button
                variant="ghost"
                className={styles.photoTrigger}
                aria-label={`Ampliar ${sample.title}`}
              >
                <SiteImage
                  src={sample.imageUrl}
                  alt={`Imagen ilustrativa para ${sample.title.toLowerCase()}`}
                  width={900}
                  height={600}
                />
                <span className={styles.expand}>
                  <Expand size={17} aria-hidden="true" /> Ampliar
                </span>
              </Button>
              <Modal.Backdrop>
                <Modal.Container size="lg">
                  <Modal.Dialog>
                    <Modal.CloseTrigger aria-label="Cerrar visor" />
                    <Modal.Header>
                      <Modal.Heading>{sample.title}</Modal.Heading>
                      <p className="text-muted">
                        {sample.zone} · {formatDate(flight.date)}
                      </p>
                    </Modal.Header>
                    <Modal.Body>
                      <div className={styles.viewerFrame}>
                        <SiteImage
                          className={styles.viewerImage}
                          src={sample.imageUrl}
                          alt={`Imagen ilustrativa ampliada para ${sample.title.toLowerCase()}`}
                          width={1400}
                          height={930}
                        />
                      </div>
                      <p className="demo-note">
                        {illustrationLabel(sample.imageUrl)
                          ? "Ilustración de ambientación."
                          : "Fotografía de ambientación."}{" "}
                        No corresponde a evidencia técnica ni confirma{" "}
                        {words.the} {words.singular}{" "}
                        {agree(words, "descrito", "descrita")}.
                      </p>
                    </Modal.Body>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
            <div className={styles.photoCaption}>
              <span>
                <ImageIcon size={15} aria-hidden="true" />
                {sample.zone}
              </span>
              <h3>{sample.title}</h3>
              {sample.id !== "overview" && (
                <Button
                  variant="tertiary"
                  size="sm"
                  onPress={() => onFindingSelect(sample.id)}
                >
                  Abrir {words.singular}
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
