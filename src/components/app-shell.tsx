"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Modal } from "@heroui/react";
import {
  ArrowUpRight,
  Bell,
  ChartColumn,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  CreditCard,
  FolderCheck,
  Layers3,
  Map as MapIcon,
  Menu,
  MoveUpRight,
  Plane,
  Wrench,
  TrendingUp,
  RotateCcw,
  Search,
  Sprout,
  X,
} from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import { formatDate } from "@/lib/format";

function navigationFor(zoneLabel: string) {
  return [
    { href: "/programacion", label: "Programación", icon: CalendarDays },
    { href: "/vuelos", label: "Vuelos y evidencias", icon: Plane },
    {
      href: "/mapa",
      label: `Mapa y ${zoneLabel.toLowerCase()}`,
      icon: MapIcon,
    },
    { href: "/evolucion", label: "Evolución", icon: TrendingUp },
    { href: "/equipos", label: "Equipos y mantenimiento", icon: Wrench },
    { href: "/informes", label: "Informes y cifras", icon: ChartColumn },
    { href: "/pagos", label: "Pagos y costos", icon: CreditCard },
    { href: "/documentos", label: "Documentos", icon: FolderCheck },
  ];
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    site,
    sites,
    setSiteId,
    flights,
    findings,
    documents,
    selectFlight,
    resetDemo,
    notice,
    setNotice,
  } = useDemo();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pending = documents.filter(
    (document) => document.status !== "reviewed",
  ).length;
  const searchMatches = flights.filter((flight) =>
    `${flight.title} ${flight.pilot} ${flight.date}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase()),
  );
  const navigation = navigationFor(site.zoneLabel);
  const activeNav = navigation.find((item) => pathname.startsWith(item.href));

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      {mobileOpen && (
        <button
          className="sidebar-scrim"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar navegación"
        />
      )}
      <aside className={`app-sidebar ${mobileOpen ? "app-sidebar--open" : ""}`}>
        <Link
          href="/programacion"
          className="brand"
          aria-label="Otear, programación"
        >
          <span className="brand-symbol">
            <MoveUpRight size={24} strokeWidth={2.4} />
          </span>
          <span>
            otear<span className="brand-dot">.</span>
          </span>
        </Link>
        <div className="workspace-label">
          <span>ESPACIO DE TRABAJO</span>
          <span className="tiny-avatar">LR</span>
        </div>
        <div className="site-picker">
          <span className="site-picker-icon">
            <Layers3 size={19} />
          </span>
          <div>
            <label htmlFor="workspace-site">Proyecto activo</label>
            <select
              id="workspace-site"
              value={site.id}
              onChange={(event) => setSiteId(event.target.value)}
            >
              {sites.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <ChevronDown size={14} aria-hidden="true" />
        </div>
        <nav className="primary-navigation" aria-label="Navegación principal">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              href={href}
              key={href}
              onClick={() => setMobileOpen(false)}
              className={`nav-item ${pathname.startsWith(href) ? "nav-item--active" : ""}`}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              <Icon size={19} />
              <span>{label}</span>
              {href === "/documentos" && pending > 0 && (
                <span className="nav-count">{pending}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-project-context">
          <Sprout size={18} />
          <div>
            <strong>{site.sectorLabel}</strong>
            <span>Tu operación, conectada.</span>
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="demo-card">
            <span className="demo-orbit" />
            <strong>Explora a tu ritmo</strong>
            <p>
              Esta es tu demo. Los cambios se conservan al navegar y se
              reinician al recargar.
            </p>
            <button onClick={resetDemo}>
              <RotateCcw size={14} />
              Reiniciar demostración
            </button>
          </div>
          <button className="help-link" onClick={() => setHelpOpen(true)}>
            <CircleHelp size={17} />
            Guía de la demo
            <ArrowUpRight size={14} />
          </button>
          <div className="profile-row">
            <span className="profile-avatar">LR</span>
            <div>
              <strong>Luis Rojas</strong>
              <span>Administrador · ejemplo</span>
            </div>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-location">
            <button
              className="mobile-menu-button icon-button"
              aria-label="Abrir navegación"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span>{site.sectorLabel}</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activeNav?.label ?? "Otear"}</strong>
          </div>
          <div className="topbar-actions">
            <span className="demo-pill">
              <i />
              Demo interactiva
            </span>
            <button
              className="topbar-search"
              aria-label="Buscar vuelos"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} />
              <span>Buscar un vuelo</span>
              <kbd>/</kbd>
            </button>
            <button
              className="notification-button icon-button"
              aria-label={`Ver pendientes: ${pending} documentos`}
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell size={19} />
              <i />
            </button>
            <span className="topbar-avatar" aria-hidden="true">
              LR
            </span>
          </div>
        </header>
        {notificationsOpen && (
          <div className="notifications-panel surface">
            <div className="section-heading">
              <h3>Por revisar</h3>
              <button
                className="icon-button"
                aria-label="Cerrar pendientes"
                onClick={() => setNotificationsOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <p>
              {pending} documentos requieren atención y{" "}
              {
                findings.filter((finding) => finding.status === "pending")
                  .length
              }{" "}
              hallazgos están por verificar.
            </p>
            <Link
              href="/documentos"
              onClick={() => setNotificationsOpen(false)}
            >
              Revisar documentos <ArrowUpRight size={14} />
            </Link>
          </div>
        )}
        <main id="main-content" className="main-content" key={site.id}>
          {children}
        </main>
        <footer className="app-footer">
          <span>
            <i />
            Datos de ejemplo · escenario del 25 oct. 2026
          </span>
          <span>Hecho para ver más allá.</span>
        </footer>
      </div>
      {notice && (
        <div className="app-toast" role="status">
          <span>{notice}</span>
          <button aria-label="Cerrar aviso" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
      <Modal isOpen={searchOpen} onOpenChange={setSearchOpen}>
        <Modal.Backdrop>
          <Modal.Container size="lg">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Buscar en tus vuelos</Modal.Heading>
                <Modal.CloseTrigger>
                  <X size={20} />
                </Modal.CloseTrigger>
              </Modal.Header>
              <Modal.Body>
                <label className="field-label" htmlFor="global-search">
                  Nombre, piloto o fecha
                </label>
                <input
                  id="global-search"
                  className="field-input"
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Por ejemplo: inspección"
                />
                <div className="search-results">
                  {searchMatches.length ? (
                    searchMatches.map((flight) => (
                      <button
                        key={flight.id}
                        onClick={() => {
                          selectFlight(flight.id);
                          router.push("/vuelos");
                          setSearchOpen(false);
                        }}
                      >
                        <span>
                          <strong>{flight.title}</strong>
                          <small>
                            {formatDate(flight.date)} · {flight.pilot}
                          </small>
                        </span>
                        <ArrowUpRight size={16} />
                      </button>
                    ))
                  ) : (
                    <p>No encontramos vuelos con esa búsqueda.</p>
                  )}
                </div>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
      <Modal isOpen={helpOpen} onOpenChange={setHelpOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Una operación, en un solo lugar</Modal.Heading>
                <Modal.CloseTrigger>
                  <X size={20} />
                </Modal.CloseTrigger>
              </Modal.Header>
              <Modal.Body>
                <div className="help-content">
                  <p>
                    Cambia de proyecto para explorar agricultura, carreteras,
                    construcción y vigilancia con la misma base.
                  </p>
                  <ol>
                    <li>Prepara un vuelo y revisa su ruta.</li>
                    <li>
                      Abre un registro para consultar evidencia y hallazgos.
                    </li>
                    <li>Registra pagos de ejemplo y revisa documentos.</li>
                  </ol>
                  <p>
                    Clima, coordenadas, documentos y registros son muestras. Las
                    fotos son ilustrativas y no corresponden al lugar del mapa.
                    No se envía información ni se ejecutan operaciones reales.
                  </p>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button onPress={() => setHelpOpen(false)}>Entendido</Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
