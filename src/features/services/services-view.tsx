"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDemo } from "@/features/demo/demo-context";
import { useModuleTitle, useTerm } from "@/features/config/use-config";
import type { PartyRole, ServiceRequest } from "@/features/demo/types";
import { formatDate } from "@/lib/format";
import { NewRequestDialog } from "./new-request-dialog";
import { RequestDetail } from "./request-detail";
import { useServices } from "./use-services";
import {
  availableActions,
  isRequester,
  kindLabels,
  statusLabels,
} from "./workflow";
import { revealDetail } from "@/lib/reveal-detail";
import styles from "./services.module.css";

type Filter = "turn" | "open" | "closed";
const filters: { value: Filter; label: string }[] = [
  { value: "turn", label: "Su turno" },
  { value: "open", label: "En curso" },
  { value: "closed", label: "Cerradas" },
];
const closedStatuses = ["invoiced", "cancelled"];

export function ServicesView() {
  const moduleTitle = useModuleTitle("servicios");
  const t = useTerm();
  const { actor, parties, requests, nameOf } = useServices();
  const { setActingAs } = useDemo();
  const [filter, setFilter] = useState<Filter>("turn");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const roleWord: Record<PartyRole, string> = {
    manager: t("manager"),
    owner: t("owner"),
    operator: t("operator"),
  };

  const mine = requests.filter(
    (request) =>
      actor.role !== "operator" || request.invited.includes(actor.id),
  );
  const myTurn = (request: ServiceRequest) =>
    availableActions(
      request,
      actor.role,
      actor.role === "operator" ? actor.id : undefined,
    ).some((action) => action.id !== "cancel");
  const visible = mine.filter((request) =>
    filter === "turn"
      ? myTurn(request)
      : filter === "open"
        ? !closedStatuses.includes(request.status)
        : closedStatuses.includes(request.status),
  );
  // The open request stays on screen after an action even if it leaves the filter, and when the
  // person switches who they act as, so the same service can be followed from each side.
  const selected =
    mine.find((request) => request.id === selectedId) ?? visible[0];
  const turnCount = mine.filter(myTurn).length;

  return (
    <div className={styles.view}>
      <PageHeading
        title={moduleTitle}
        description="Quien contrata pide, compara cotizaciones, verifica y paga; quien vuela cotiza, programa, entrega y factura. Cada paso queda registrado."
        actions={
          <>
            <div className={styles.viewAs}>
              <label htmlFor="view-as">Ver como</label>
              <select
                id="view-as"
                className="field-select"
                value={actor.id}
                onChange={(event) => {
                  setActingAs(event.target.value);
                }}
              >
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {roleWord[party.role]} · {party.name}
                  </option>
                ))}
              </select>
            </div>
            {isRequester(actor.role) && (
              <NewRequestDialog
                onCreated={(id) => {
                  setFilter("open");
                  setSelectedId(id);
                }}
              />
            )}
          </>
        }
      />
      <div className="surface rail-panel master-detail">
        <aside className="rail-panel master-rail" aria-label="Solicitudes">
          <div className="rail-sticky">
            <div className="master-rail-header">
              <h2>Solicitudes</h2>
              <p>
                {turnCount > 0
                  ? `${turnCount} esperan una acción suya.`
                  : "Nada espera una acción suya."}
              </p>
            </div>
            <div className={styles.filters}>
              <div
                className="segmented-control"
                role="group"
                aria-label="Filtrar solicitudes"
              >
                {filters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={filter === item.value}
                    onClick={() => setFilter(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            {visible.length ? (
              <ul className={styles.list}>
                {visible.map((request, index) => (
                  <li
                    key={request.id}
                    style={{ "--i": index } as React.CSSProperties}
                  >
                    <button
                      type="button"
                      className={styles.row}
                      aria-pressed={selected?.id === request.id}
                      onClick={() => {
                        setSelectedId(request.id);
                        revealDetail("request-detail");
                      }}
                    >
                      <span className={styles.rowTop}>
                        <strong>{request.title}</strong>
                        {myTurn(request) && (
                          <span className={styles.turn}>Su turno</span>
                        )}
                      </span>
                      <small>
                        {kindLabels[request.kind]} ·{" "}
                        {request.operatorId
                          ? nameOf(request.operatorId)
                          : `${request.invited.length} invitados`}{" "}
                        · hasta {formatDate(request.windowEnd)}
                      </small>
                      <span>
                        <StatusBadge
                          tone={
                            request.status === "disputed"
                              ? "danger"
                              : request.status === "delivered"
                                ? "warning"
                                : request.status === "invoiced" ||
                                    request.status === "verified"
                                  ? "success"
                                  : request.status === "cancelled"
                                    ? "neutral"
                                    : "info"
                          }
                        >
                          {statusLabels[request.status]}
                        </StatusBadge>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title={
                  filter === "turn"
                    ? "Nada por hacer ahora"
                    : "Sin solicitudes aquí"
                }
                description={
                  filter === "turn"
                    ? "Cuando alguien avance un servicio y le toque a usted, aparecerá aquí."
                    : "Cambie el filtro para ver otras solicitudes."
                }
              />
            )}
          </div>
        </aside>
        {selected ? (
          <RequestDetail key={selected.id} request={selected} />
        ) : (
          <div className={styles.detailEmpty}>
            <EmptyState
              title="Elija una solicitud"
              description="Aquí verá el avance, las cotizaciones, la entrega y lo que sigue."
            />
          </div>
        )}
      </div>
    </div>
  );
}
