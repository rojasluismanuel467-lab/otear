"use client";

import { orderedHa } from "@/features/billing/coverage";
import { useDemo } from "@/features/demo/demo-context";
import { DEMO_DATE } from "@/features/demo/demo-data";
import type { Party, ServiceRequest } from "@/features/demo/types";
import { aircraftForOperator } from "./links";
import * as workflow from "./workflow";

type Outcome =
  { ok: true; request: ServiceRequest } | { ok: false; error: string };

export type ActionInput =
  | { id: "quote"; price: number; startDate: string; note: string }
  | { id: "decline"; note: string }
  | { id: "assign"; operatorId: string; reason?: string }
  | { id: "schedule"; date: string; time: string; pilot: string }
  | {
      id: "deliver";
      /** Only for a service priced per hectare. */
      coveredHa?: number;
      deliverables: string[];
      note: string;
      durationMin?: number;
      photoCount?: number;
      /** The aircraft that really flew it, when the operator picks one. */
      aircraftId?: string;
    }
  | ({ id: "reply" } & workflow.ReplyInput)
  | { id: "verify"; result: "accepted" | "disputed"; note: string }
  | { id: "invoice"; billedHa?: number; note?: string }
  | { id: "cancel"; note: string };

const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
};

/**
 * Runs the steps of a service request and the effects each one has on the rest of the demo: a
 * programmed service creates its flight, a delivery completes it, an invoice lands in Pagos.
 */
export function useServices() {
  const {
    site,
    parties,
    actor,
    flights,
    aircraft,
    serviceRequests,
    saveServiceRequest,
    addFlight,
    updateFlight,
    addInvoice,
    setNotice,
  } = useDemo();
  const ctx: workflow.Context = { today: DEMO_DATE, parties, actor };

  const operators = parties.filter((party) => party.role === "operator");
  const nameOf = (id: string | undefined) =>
    parties.find((party: Party) => party.id === id)?.name ?? "Sin asignar";

  function finish(result: Outcome, message: string): Outcome {
    if (result.ok) {
      saveServiceRequest(result.request);
      setNotice(message);
    }
    return result;
  }

  function create(input: Parameters<typeof workflow.createRequest>[0]) {
    return finish(
      workflow.createRequest(input, ctx),
      "Solicitud creada en esta demo. No se envió a ningún operador.",
    );
  }

  function act(request: ServiceRequest, input: ActionInput): Outcome {
    const area = orderedHa(site.zones, request.zoneIds, site.sector);
    switch (input.id) {
      case "quote":
        return finish(
          workflow.quote(request, input, ctx),
          "Cotización enviada.",
        );
      case "decline":
        return finish(
          workflow.decline(request, input.note, ctx),
          "Respondió que no puede atenderla.",
        );
      case "assign":
        return finish(
          workflow.assign(request, input.operatorId, ctx, input.reason),
          "Servicio asignado. Las demás cotizaciones quedan guardadas.",
        );
      case "schedule": {
        const checked = workflow.schedule(
          request,
          { date: input.date, flightId: "pending" },
          ctx,
        );
        if (!checked.ok) return checked;
        const zones = site.zones.filter((zone) =>
          request.zoneIds.includes(zone.id),
        );
        // The aircraft its operator has flown in the example fleet; without one it stays «Por definir».
        const craft = aircraftForOperator(
          nameOf(request.operatorId),
          flights,
          aircraft,
        );
        const flightId = addFlight({
          siteId: site.id,
          title: request.title,
          objective: request.description || workflow.kindLabels[request.kind],
          date: input.date,
          time: input.time || "07:00",
          status: "scheduled",
          pilot: input.pilot.trim() || "Por definir",
          operator: nameOf(request.operatorId),
          manager: nameOf(request.requestedBy),
          drone: craft?.label ?? "Por definir",
          ...(craft ? { aircraftId: craft.id } : {}),
          zoneIds: request.zoneIds,
          route: zones.flatMap((zone) => zone.outline),
          duration: 0,
          distance: 0,
          photoCount: 0,
          checklist: [],
        });
        const result = workflow.schedule(
          request,
          { date: input.date, flightId },
          ctx,
        );
        return finish(result, "Vuelo programado; ya aparece en Programación.");
      }
      case "deliver": {
        const result = workflow.deliver(request, input, ctx);
        if (result.ok && request.flightId) {
          const flight = flights.find((item) => item.id === request.flightId);
          // The operator says which aircraft flew; its hours land there, not on the suggested one.
          const flown = input.aircraftId
            ? aircraft.find((item) => item.id === input.aircraftId)
            : undefined;
          updateFlight(request.flightId, {
            status: "completed",
            ...(flown
              ? { aircraftId: flown.id, drone: `${flown.make} ${flown.model}` }
              : {}),
            // What the operator did not declare is not filled in with the plan's numbers: without a
            // duration nothing is added to the aircraft's hours.
            ...(input.durationMin
              ? { duration: input.durationMin }
              : { duration: 0, distance: 0 }),
            photoCount: input.photoCount ?? 0,
            date: flight && flight.date > DEMO_DATE ? DEMO_DATE : flight?.date,
            log:
              flight?.log && result.request.delivery?.coveredHa !== undefined
                ? {
                    ...flight.log,
                    coveredHa: result.request.delivery.coveredHa,
                  }
                : undefined,
          });
        }
        return finish(result, "Entrega registrada; queda por verificar.");
      }
      case "reply": {
        const result = workflow.reply(request, input, ctx);
        // An accepted adjustment changes the hectares the flight record says were covered.
        if (result.ok && input.kind === "adjusted" && request.flightId) {
          const flight = flights.find((item) => item.id === request.flightId);
          if (flight?.log)
            updateFlight(request.flightId, {
              log: { ...flight.log, coveredHa: input.adjustedHa },
            });
        }
        return finish(
          result,
          input.kind === "adjusted"
            ? "Ajuste aceptado; el cliente verifica de nuevo."
            : "Respuesta enviada; el cliente verifica de nuevo.",
        );
      }
      case "verify":
        return finish(
          workflow.verify(request, input, ctx),
          input.result === "accepted"
            ? "Entrega aceptada; el operador ya puede facturar."
            : "Se pidió ajustar la entrega; el operador puede responder.",
        );
      case "invoice": {
        const checked = workflow.invoice(
          request,
          { invoiceId: "pending", billedHa: input.billedHa },
          ctx,
        );
        if (!checked.ok) return checked;
        const plan = workflow.invoicePlan(request, {
          orderedHa: area,
          billedHa: input.billedHa,
        });
        if (!plan.ok) return plan;
        const invoiceId = addInvoice({
          siteId: site.id,
          flightId: plan.flightId,
          reference: `FV-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
          description: request.title,
          operator: nameOf(request.operatorId),
          total: plan.total,
          paid: 0,
          dueDate: addDays(DEMO_DATE, 30),
          source: "manual",
          ...(plan.billedHa !== undefined ? { billedHa: plan.billedHa } : {}),
        });
        return finish(
          workflow.invoice(
            request,
            { invoiceId, billedHa: plan.billedHa, note: input.note },
            ctx,
          ),
          "Factura creada; está en Pagos y costos.",
        );
      }
      case "cancel":
        return finish(
          workflow.cancel(request, input.note, ctx),
          "Solicitud cancelada.",
        );
    }
  }

  return {
    actor,
    parties,
    operators,
    nameOf,
    requests: serviceRequests,
    create,
    act,
  };
}
