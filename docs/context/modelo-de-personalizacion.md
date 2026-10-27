# Modelo de personalización y licencia

Fecha: 26 de octubre de 2026. Complementa `personalizacion-por-empresa.md` (qué se puede personalizar según plataformas y norma). Aquí: cómo se vende y se extiende el software sin perder el control.

## Qué enseña Moodle (documentación oficial)

- **Complementos por tipo** ([tipos de plugin](https://moodledev.io/docs/5.0/apis/plugintypes)): temas (apariencia en HTML y CSS), herramientas de administración, plugins locales («personalizaciones locales» de una instalación), bloques, formatos, etc. Cada tipo vive en una carpeta propia y el nombre técnico sigue reglas fijas (minúsculas, números y guion bajo).
- **Vocabulario sin tocar el código** ([personalización de idioma](https://docs.moodle.org/en/Language_customisation)): el administrador reemplaza palabras desde la configuración. Los cambios se guardan **aparte** del paquete oficial, en un paquete «local» que solo contiene lo cambiado; al mostrar un texto se mira primero el local, luego el oficial y al final el inglés. Editar los archivos oficiales se desaconseja porque «se sobrescriben» en la siguiente actualización. Para migrar basta copiar la carpeta local.
- **Licencia:** Moodle es GPL (versión 3 para Moodle 2.x en adelante), según MoodleDocs. **Otear no debe copiar ese modelo de licencia**: la GPL obliga a ofrecer el código a quien reciba el software. Este documento no es asesoría legal; el modelo comercial y los contratos deben revisarlos un abogado.

## Qué se tomó de Moodle

1. **Núcleo intacto y personalización aparte.** La configuración de la empresa (`CompanyConfig`) es un objeto pequeño que se superpone a los valores por defecto, igual que el paquete local de idioma. Si no hay cambio, se usa el nombre de Otear. Actualizar el producto no pisa la configuración.
2. **Capas.** Hoy hay tres: vocabulario, módulos del menú y marca. Más adelante: campos propios y complementos.
3. **Configuración portable.** Exportar e importar un `.json` (se valida al importar: versión, textos recortados, color y logo comprobados).

## Capas de personalización y licencia

| Capa              | Qué cambia                                                                         | Estado                                                                               | Plan de ejemplo |
| ----------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------- |
| Vocabulario       | Hallazgo, piloto, aeronave, informe… y plantillas por sector                       | Construida (menú, títulos y pestaña de hallazgos; el resto de textos se irá sumando) | Profesional     |
| Módulos           | Renombrar, ocultar y reordenar                                                     | Construida                                                                           | Profesional     |
| Marca             | Nombre, logo y color (se rechaza un color que no deje leer el texto blanco, 4,5:1) | Construida                                                                           | Profesional     |
| Sin marca Otear   | Ocultar «Con tecnología de Otear»                                                  | Construida                                                                           | Empresarial     |
| Exportar/importar | Llevar la configuración a otra instalación                                         | Construida                                                                           | Profesional     |
| Campos propios    | Campos extra por tipo (lista, número, texto, párrafo)                              | **No construida** (ver investigación)                                                | Empresarial     |
| Complementos      | Extensiones aprobadas                                                              | **No construida**; solo un diseño                                                    | Empresarial     |

Los planes y sus nombres son **ejemplos** para ilustrar el modelo; los define el propietario. En la demo el plan se cambia en Configuración > Licencia para ver el efecto.

## Qué es solo demostración

- La configuración vive en el navegador (`localStorage`); un cliente real la guardaría en el servidor, por empresa.
- El plan lo debería fijar una **licencia firmada** que el servidor valide (clave con fecha, empresa y funciones). Hoy cualquiera puede cambiar de plan en la pantalla; **esto no es protección**. Todo lo que el navegador decide, un usuario con conocimientos puede saltarlo: la comprobación real debe hacerse en el servidor.
- No hay carga de código ajeno: «Complementos» queda como idea.

## Diseño propuesto para complementos (no construido)

Para no copiar el riesgo de los plugins con código de Moodle, Otear debería empezar con **complementos declarativos**: un paquete firmado por el propietario que solo añade datos (plantilla de sector, campos, textos, listas de verificación, plantillas de documento) y no ejecuta código. Un tipo por carpeta y un manifiesto con nombre técnico, versión, compatibilidad y permisos. Los complementos con código solo tendrían sentido con revisión del propietario y aislamiento en el servidor.

## Lo que siempre queda en el núcleo

Cálculos (horas, ciclos, desgaste, avance) y su integridad; datos mínimos que exige el RAC 100 para la bitácora y el libro de la aeronave; nombres de piezas del fabricante; huella y firma de las evidencias.

## Preguntas abiertas para el propietario

- Planes y precios: ¿por empresa, por sitio, por usuario, por aeronave?
- ¿Se entrega como servicio en la nube o instalado en el cliente? Cambia dónde se valida la licencia.
- ¿Los complementos los hace solo el propietario o también terceros (y con qué contrato)?
- Revisión legal del contrato de licencia y de la propiedad de lo que el cliente personalice.
