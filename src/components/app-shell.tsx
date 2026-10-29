"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
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
  Handshake,
  CreditCard,
  FolderCheck,
  Layers3,
  Map as MapIcon,
  Menu,
  MoveUpRight,
  PanelLeftClose,
  PanelLeftOpen,
  Plane,
  Wrench,
  TrendingUp,
  RotateCcw,
  Search,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  moduleLabel,
  visibleModules,
  type ModuleId,
} from "@/features/config/config";
import { can } from "@/features/config/licence";
import { ThemeApplier } from "@/features/config/theme-applier";
import { useConfig } from "@/features/config/use-config";
import { useDemo } from "@/features/demo/demo-context";
import { formatDate } from "@/lib/format";
import { useSidebarCollapsed } from "./use-sidebar-collapsed";

const moduleIcons: Record<ModuleId, LucideIcon> = {
  programacion: CalendarDays,
  servicios: Handshake,
  vuelos: Plane,
  mapa: MapIcon,
  evolucion: TrendingUp,
  equipos: Wrench,
  informes: ChartColumn,
  pagos: CreditCard,
  documentos: FolderCheck,
};

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
  const { collapsed, toggle: toggleSidebar } = useSidebarCollapsed();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  // Con el cajón móvil abierto la página de atrás no debe moverse, y Escape lo cierra.
  useEffect(() => {
    if (!mobileOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      root.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);
  const pending = documents.filter(
    (document) => document.status !== "reviewed",
  ).length;
  const searchMatches = flights.filter((flight) =>
    `${flight.title} ${flight.pilot} ${flight.date}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase()),
  );
  const { config } = useConfig();
  const navigation = visibleModules(config).map((item) => ({
    href: item.href,
    label: moduleLabel(config, item.id, site.zoneLabel),
    icon: moduleIcons[item.id],
  }));
  const branded = can(config.planId, "branding");
  const companyName = branded ? config.company.name.trim() : "";
  const logo = branded ? config.company.logo : undefined;
  const showVendor =
    Boolean(companyName || logo) &&
    !(can(config.planId, "whiteLabel") && config.company.hideVendor);
  const activeNav =
    navigation.find((item) => pathname.startsWith(item.href)) ??
    (pathname.startsWith("/configuracion")
      ? { href: "/configuracion", label: "Configuración", icon: Settings }
      : undefined);

  return (
    <div className={`app-shell ${collapsed ? "app-shell--collapsed" : ""}`}>
      <ThemeApplier />
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
      <aside
        id="app-sidebar"
        className={`app-sidebar ${mobileOpen ? "app-sidebar--open" : ""}`}
      >
        <Link
          href="/programacion"
          className="brand"
          aria-label={`${companyName || "Otear"}, inicio`}
        >
          {!logo && !companyName ? (
            <Image
              src="/brand/otear-logo.webp"
              alt=""
              width={960}
              height={384}
              priority
              className="brand-otear"
            />
          ) : (
            <>
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" className="brand-logo" />
              ) : (
                <span className="brand-symbol">
                  <MoveUpRight size={24} strokeWidth={2.4} />
                </span>
              )}
              <span className="brand-name">{companyName}</span>
            </>
          )}
        </Link>
        {showVendor && <p className="vendor-note">Con tecnología de Otear</p>}
        <div className="workspace-label">
          <span>ESPACIO DE TRABAJO</span>
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
        <div className="sidebar-bottom">
          <Link
            href="/configuracion"
            className={`help-link ${pathname.startsWith("/configuracion") ? "help-link--active" : ""}`}
            aria-current={
              pathname.startsWith("/configuracion") ? "page" : undefined
            }
            onClick={() => setMobileOpen(false)}
          >
            <Settings size={17} />
            Configuración
          </Link>
          <button className="help-link" onClick={() => setHelpOpen(true)}>
            <CircleHelp size={17} />
            Guía de la demo
            <ArrowUpRight size={14} className="help-link-arrow" />
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
              aria-label="Abrir menú de navegación"
              aria-expanded={mobileOpen}
              aria-controls="app-sidebar"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
              <span>Menú</span>
            </button>
            <button
              className="sidebar-toggle icon-button"
              aria-label={
                collapsed ? "Mostrar menú lateral" : "Ocultar menú lateral"
              }
              aria-expanded={!collapsed}
              aria-controls="app-sidebar"
              title={
                collapsed ? "Mostrar menú lateral" : "Ocultar menú lateral"
              }
              onClick={toggleSidebar}
            >
              {collapsed ? (
                <PanelLeftOpen size={19} />
              ) : (
                <PanelLeftClose size={19} />
              )}
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
          </div>
        </header>
        {notificationsOpen && (
          <div className="notifications-panel surface">
            <div className="section-heading">
              <h2>Por revisar</h2>
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
          <span>
            Hecho para ver más allá ·{" "}
            <Link href="/#contacto">¿Lo quiere con sus datos? Hablemos</Link>
          </span>
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
                    Los cambios que hagas se conservan al navegar y se reinician
                    al recargar la página, o ahora mismo con «Reiniciar
                    demostración».
                  </p>
                  <p>
                    Clima, coordenadas, documentos y registros son muestras. Las
                    fotos son ilustrativas y no corresponden al lugar del mapa.
                    No se envía información ni se ejecutan operaciones reales.
                  </p>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onPress={() => {
                    resetDemo();
                    setHelpOpen(false);
                  }}
                >
                  <RotateCcw size={16} />
                  Reiniciar demostración
                </Button>
                <Button onPress={() => setHelpOpen(false)}>Entendido</Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
