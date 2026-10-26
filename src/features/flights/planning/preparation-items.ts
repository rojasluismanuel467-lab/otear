export interface PreparationGroup {
  id: string;
  title: string;
  items: string[];
}

/**
 * Orientative pre-flight list. Groups follow public UAS checklists (airspace,
 * site and weather, aircraft, payload, flight test). The labels of the first
 * item of each group are stored in the demo flights, so keep them stable.
 */
export const preparationGroups: PreparationGroup[] = [
  {
    id: "mission",
    title: "Misión y carga útil",
    items: [
      "Definir objetivo y recorrido",
      "Confirmar tarjeta de memoria con espacio y cámara fijada",
      "Confirmar altura máxima y distancia permitidas para este vuelo",
    ],
  },
  {
    id: "airspace",
    title: "Permisos y espacio aéreo",
    items: [
      "Confirmar permiso del predio y de la zona de despegue",
      "Revisar restricciones cercanas: aeródromos, helipuertos y zonas sensibles",
      "Revisar soportes del piloto, la póliza y el registro del equipo",
    ],
  },
  {
    id: "weather",
    title: "Sitio y clima",
    items: [
      "Revisar condiciones meteorológicas",
      "Reconocer obstáculos: cables, torres, árboles y personas",
      "Definir un punto de aterrizaje de emergencia",
    ],
  },
  {
    id: "aircraft",
    title: "Equipo",
    items: [
      "Revisar equipo y baterías",
      "Inspeccionar hélices, motores y brazos",
      "Actualizar firmware y calibrar brújula y GPS",
    ],
  },
  {
    id: "closing",
    title: "Prueba y cierre",
    items: [
      "Hacer el briefing de seguridad con la tripulación",
      "Confirmar responsable de documentación",
      "Probar estabilidad a baja altura antes de iniciar",
      "Registrar baterías y novedades en la bitácora al aterrizar",
    ],
  },
];

export const preparationTotal = preparationGroups.reduce(
  (total, group) => total + group.items.length,
  0,
);
