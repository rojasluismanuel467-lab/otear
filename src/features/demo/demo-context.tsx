"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { can } from "@/features/config/licence";
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
} from "@/features/config/config-store";
import {
  initialAircraft,
  initialBatteries,
  initialDocuments,
  initialMaintenance,
  initialPartMarks,
  initialEvidences,
  initialFindings,
  initialFlights,
  initialInvoices,
  initialPayments,
  sites,
} from "./demo-data";
import { distanceToLineM, pointInPolygon } from "@/lib/geo";
import type {
  Aircraft,
  Battery,
  Evidence,
  MaintenanceRecord,
  PartMark,
  Finding,
  Flight,
  FlightDocument,
  Invoice,
  Payment,
  Position,
  Zone,
} from "./types";

function useDemoState() {
  const [siteId, setSiteIdState] = useState(sites[0].id);
  const [siteRecords, setSiteRecords] = useState(sites);
  const [flightRecords, setFlightRecords] = useState(initialFlights);
  const [findingRecords, setFindingRecords] = useState(initialFindings);
  const [invoiceRecords, setInvoiceRecords] = useState(initialInvoices);
  const [payments, setPayments] = useState(initialPayments);
  const [documentRecords, setDocumentRecords] = useState(initialDocuments);
  const [evidenceRecords, setEvidenceRecords] = useState(initialEvidences);
  const [aircraftRecords, setAircraftRecords] = useState(initialAircraft);
  const [batteryRecords, setBatteryRecords] = useState(initialBatteries);
  const [maintenanceRecords, setMaintenanceRecords] =
    useState(initialMaintenance);
  const [partMarkRecords, setPartMarkRecords] = useState(initialPartMarks);
  const [selectedFlightId, setSelectedFlightId] = useState(
    initialFlights[0].id,
  );
  const [notice, setNotice] = useState("");
  const config = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const baseSite =
    siteRecords.find((item) => item.id === siteId) ?? siteRecords[0];
  // The company's word for its zones (for example «suertes» in sugar cane) replaces the site's.
  const zoneWord = can(config.planId, "vocabulary")
    ? (config.zoneWords?.[baseSite.sector]?.trim() ?? "")
    : "";
  const site = useMemo(
    () => (zoneWord ? { ...baseSite, zoneLabel: zoneWord } : baseSite),
    [baseSite, zoneWord],
  );

  function setSiteId(id: string) {
    if (!sites.some((item) => item.id === id)) return;
    setSiteIdState(id);
    setSelectedFlightId(`flight-${id}-01`);
    setNotice("");
  }

  function addFlight(input: Omit<Flight, "id">) {
    const flight = { ...input, id: `flight-${crypto.randomUUID()}` };
    setFlightRecords((current) => [...current, flight]);
    setNotice("Vuelo añadido a esta sesión de demostración.");
    return flight.id;
  }

  function updateFlight(id: string, update: Partial<Flight>) {
    setFlightRecords((current) =>
      current.map((flight) =>
        flight.id === id
          ? { ...flight, ...update, id: flight.id, siteId: flight.siteId }
          : flight,
      ),
    );
  }

  function updateFinding(id: string, update: Partial<Finding>) {
    setFindingRecords((current) =>
      current.map((finding) =>
        finding.id === id
          ? {
              ...finding,
              ...update,
              id: finding.id,
              siteId: finding.siteId,
              flightId: finding.flightId,
            }
          : finding,
      ),
    );
  }

  function recordPayment(
    invoiceId: string,
    amount: number,
    method: string,
    date = "2026-10-25",
  ) {
    const invoice = invoiceRecords.find((item) => item.id === invoiceId);
    if (
      !invoice ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > invoice.total - invoice.paid
    )
      return false;
    setInvoiceRecords((current) =>
      current.map((item) =>
        item.id === invoiceId ? { ...item, paid: item.paid + amount } : item,
      ),
    );
    setPayments((current) => [
      ...current,
      {
        id: `payment-${crypto.randomUUID()}`,
        invoiceId,
        amount,
        date,
        method,
      } satisfies Payment,
    ]);
    setNotice("Pago registrado solo en esta demo. No se movió dinero.");
    return true;
  }

  /**
   * Replaces a site's zone layout and re-links flights and findings to the new
   * zones by geometry. Returns how many of each were linked.
   */
  function replaceZones(targetSiteId: string, zones: Zone[]) {
    const target = siteRecords.find((item) => item.id === targetSiteId);
    if (!target) return { flights: 0, findings: 0 };
    const isLine = target.sector === "roads";
    const touches = (zone: Zone, position: Position) =>
      isLine
        ? distanceToLineM(position, zone.outline) <= 250
        : pointInPolygon(position, zone.outline);
    let linkedFlights = 0;
    let linkedFindings = 0;
    const nextFlights = flightRecords.map((flight) => {
      if (flight.siteId !== targetSiteId) return flight;
      const zoneIds = zones
        .filter((zone) => flight.route.some((point) => touches(zone, point)))
        .map((zone) => zone.id);
      if (zoneIds.length) linkedFlights += 1;
      return { ...flight, zoneIds };
    });
    const nextFindings = findingRecords.map((finding) => {
      if (finding.siteId !== targetSiteId) return finding;
      const zone = zones.find((item) => touches(item, finding.position));
      if (zone) linkedFindings += 1;
      return { ...finding, zoneId: zone?.id ?? "" };
    });
    setSiteRecords((current) =>
      current.map((item) =>
        item.id === targetSiteId ? { ...item, zones } : item,
      ),
    );
    setFlightRecords(nextFlights);
    setFindingRecords(nextFindings);
    return { flights: linkedFlights, findings: linkedFindings };
  }

  function addInvoice(input: Omit<Invoice, "id">) {
    const invoice = { ...input, id: `invoice-${crypto.randomUUID()}` };
    setInvoiceRecords((current) => [...current, invoice]);
    return invoice.id;
  }

  function updateInvoice(id: string, update: Partial<Invoice>) {
    setInvoiceRecords((current) =>
      current.map((invoice) =>
        invoice.id === id
          ? {
              ...invoice,
              ...update,
              id: invoice.id,
              siteId: invoice.siteId,
              flightId: invoice.flightId,
            }
          : invoice,
      ),
    );
  }

  function addAircraft(input: Omit<Aircraft, "id">) {
    const aircraft = { ...input, id: `aircraft-${crypto.randomUUID()}` };
    setAircraftRecords((current) => [...current, aircraft]);
    setNotice("Aeronave añadida a esta sesión de demostración.");
    return aircraft.id;
  }

  function updateAircraft(id: string, update: Partial<Aircraft>) {
    setAircraftRecords((current) =>
      current.map((aircraft) =>
        aircraft.id === id
          ? { ...aircraft, ...update, id: aircraft.id, siteId: aircraft.siteId }
          : aircraft,
      ),
    );
  }

  function addBattery(input: Omit<Battery, "id">) {
    setBatteryRecords((current) => [
      ...current,
      { ...input, id: `battery-${crypto.randomUUID()}` },
    ]);
  }

  function updateBattery(id: string, update: Partial<Battery>) {
    setBatteryRecords((current) =>
      current.map((battery) =>
        battery.id === id
          ? {
              ...battery,
              ...update,
              id: battery.id,
              aircraftId: battery.aircraftId,
            }
          : battery,
      ),
    );
  }

  function addMaintenance(input: Omit<MaintenanceRecord, "id">) {
    setMaintenanceRecords((current) => [
      ...current,
      { ...input, id: `maintenance-${crypto.randomUUID()}` },
    ]);
    setNotice("Mantenimiento registrado solo en esta sesión de demostración.");
  }

  function savePartMark(mark: PartMark) {
    setPartMarkRecords((current) =>
      current.some((item) => item.id === mark.id)
        ? current.map((item) =>
            item.id === mark.id
              ? { ...mark, id: item.id, aircraftId: item.aircraftId }
              : item,
          )
        : [...current, mark],
    );
  }

  function removePartMark(id: string) {
    setPartMarkRecords((current) => current.filter((item) => item.id !== id));
  }

  function saveEvidence(evidence: Evidence) {
    setEvidenceRecords((current) =>
      current.some((item) => item.id === evidence.id)
        ? current.map((item) => (item.id === evidence.id ? evidence : item))
        : [...current, evidence],
    );
  }

  function removeEvidence(id: string) {
    setEvidenceRecords((current) => current.filter((item) => item.id !== id));
    setNotice("Documento eliminado de esta sesión de demostración.");
  }

  function updateDocument(id: string, update: Partial<FlightDocument>) {
    setDocumentRecords((current) =>
      current.map((document) =>
        document.id === id
          ? { ...document, ...update, id: document.id, siteId: document.siteId }
          : document,
      ),
    );
  }

  function resetDemo() {
    setSiteRecords(sites);
    setFlightRecords(initialFlights);
    setFindingRecords(initialFindings);
    setInvoiceRecords(initialInvoices);
    setPayments(initialPayments);
    setDocumentRecords(initialDocuments);
    setEvidenceRecords(initialEvidences);
    setAircraftRecords(initialAircraft);
    setBatteryRecords(initialBatteries);
    setMaintenanceRecords(initialMaintenance);
    setPartMarkRecords(initialPartMarks);
    setSelectedFlightId(`flight-${siteId}-01`);
    setNotice("Datos de ejemplo restablecidos.");
  }

  return {
    sites: siteRecords,
    site,
    siteId,
    setSiteId,
    flights: flightRecords.filter((flight) => flight.siteId === siteId),
    findings: findingRecords.filter((finding) => finding.siteId === siteId),
    invoices: invoiceRecords.filter((invoice) => invoice.siteId === siteId),
    documents: documentRecords.filter((document) => document.siteId === siteId),
    evidences: evidenceRecords.filter((evidence) => evidence.siteId === siteId),
    aircraft: aircraftRecords.filter((item) => item.siteId === siteId),
    batteries: batteryRecords.filter((battery) =>
      aircraftRecords.some(
        (item) => item.id === battery.aircraftId && item.siteId === siteId,
      ),
    ),
    maintenance: maintenanceRecords.filter((record) =>
      aircraftRecords.some(
        (item) => item.id === record.aircraftId && item.siteId === siteId,
      ),
    ),
    partMarks: partMarkRecords.filter((mark) =>
      aircraftRecords.some(
        (item) => item.id === mark.aircraftId && item.siteId === siteId,
      ),
    ),
    savePartMark,
    removePartMark,
    /** Every record of every site, for counting how much a company field is used. */
    allRecords: {
      flight: flightRecords,
      finding: findingRecords,
      aircraft: aircraftRecords,
      invoice: invoiceRecords,
    },
    payments,
    selectedFlightId,
    selectFlight: setSelectedFlightId,
    addFlight,
    updateFlight,
    updateFinding,
    recordPayment,
    updateDocument,
    replaceZones,
    addAircraft,
    updateAircraft,
    addBattery,
    updateBattery,
    addMaintenance,
    addInvoice,
    updateInvoice,
    saveEvidence,
    removeEvidence,
    resetDemo,
    notice,
    setNotice,
  };
}

type DemoContextValue = ReturnType<typeof useDemoState>;
const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const value = useDemoState();
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider");
  return context;
}
