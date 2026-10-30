# Despliegue en Cloudflare Pages

Guía para publicar `otear.app` como sitio estático gratuito, usando el export estático de Next.js. Supone que el dominio ya está en Cloudflare Registrar.

## 1. Antes de desplegar

- Repositorio en GitHub (o GitLab/Bitbucket) con permisos para conectar.
- Rama `main` compilando (`npm run build` genera `out/`).
- `next.config.ts` con `output: "export"`, `images.unoptimized: true` y `trailingSlash: true`. Ya está así.

## 2. Conectar el repo

1. Entra a Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Autoriza la cuenta de GitHub y selecciona el repo `otear`.
3. Elige la rama `main`.
4. En **Build settings**:
   - **Framework preset:** `None` (no uses el preset de Next.js, está pensado para SSR).
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Node version:** `22` (Variable de entorno `NODE_VERSION=22`).
5. **Deploy**. El primer build demora 2–4 min. Al terminar queda publicado en `otear.pages.dev`.

## 3. Conectar `otear.app`

1. En el proyecto de Pages → **Custom domains** → **Set up a custom domain** → escribe `otear.app` → **Continue** → **Activate**.
2. Repite para `www.otear.app` y marca el redirect a la raíz.
3. Cloudflare agrega los registros DNS solo (porque el dominio ya está en tu cuenta). No tienes que tocar nada manualmente. La nube **sí puede quedar naranja** (proxy activo) cuando apuntas a Pages — es lo contrario que con Vercel.
4. El certificado SSL se emite solo en pocos minutos.

## 4. Variables de entorno

En el proyecto de Pages → **Settings** → **Environment variables** → **Production**:

| Variable | Valor | Qué hace |
|---|---|---|
| `NODE_VERSION` | `22` | Fija la versión de Node para el build. |

Canales del formulario de contacto (paso 2). No hay servidor: el sitio no recibe lo que el visitante escribe, solo arma un mensaje que el visitante envía desde su WhatsApp o su correo. Si falta una variable, ese botón no aparece en producción; en desarrollo se muestra como «Pendiente».

| Variable | Valor | Qué hace |
|---|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | número con indicativo, solo dígitos (ej. `573001234567`) | Botón «Enviar por WhatsApp» con el mensaje ya escrito. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | correo donde quiere recibir los contactos | Botón «Enviar por correo» (`mailto:`) con asunto y mensaje ya escritos. |
| `NEXT_PUBLIC_BOOKING_URL` | enlace de su calendario (Cal.com, Calendly…) | Botón «Elegir una hora». |

Son públicas por necesidad: quedan visibles en la página para que el botón funcione. Para un despliegue con Wrangler, póngalas en `.env.local` (ignorado por git) antes de construir.

Después de cambiar una variable, **Retry deployment** desde el panel.

## 5. Correo profesional gratis

1. En Cloudflare → selecciona `otear.app` → **Email** → **Email Routing** → **Enable Email Routing**.
2. Cloudflare agrega los registros MX y SPF automáticamente.
3. **Routing rules** → **Create address** → ej. `hola@otear.app` → reenviar a tu Gmail. Verificas el correo destino una vez.
4. Repite para `luis@otear.app`, `ventas@otear.app`, etc.
5. **Para enviar desde** `hola@otear.app` (no solo recibir): abre https://resend.com, crea cuenta gratis (3.000 correos/mes), agrega `otear.app` como dominio verificado, y configura Gmail → **Settings** → **Accounts** → **Send mail as** usando el SMTP de Resend.

## 6. Analítica gratis

En Cloudflare → `otear.app` → **Analytics & Logs** → **Web Analytics** → **Enable**. Ya tienes tráfico, referrers, países y páginas populares sin tocar código ni cookies.

Si quieres eventos (ej. "click en Ver demo"), agrega el snippet opcional de Cloudflare Web Analytics en `src/app/layout.tsx` dentro de un `<Script>` de Next.

## 7. Formulario: sin servidor ni servicio externo

El formulario no usa ningún servicio de envío. El paso 1 pide nombre, correo y sector; el paso 2 abre el WhatsApp o el correo del visitante con el mensaje ya escrito, y es el visitante quien lo envía. Por eso no hay cuota, cuenta ni costo.

Qué implica:

- Hasta que el visitante pulse «enviar» en su WhatsApp o correo, usted no recibe nada. Quien abandona a la mitad no deja rastro.
- Para recibir los datos aunque el visitante abandone haría falta un servidor propio (por ejemplo un Worker de Cloudflare con D1); no está construido.
- Para recibir y responder desde `hola@otear.app`, use Email Routing (paso 5) y ponga ese correo en `NEXT_PUBLIC_CONTACT_EMAIL`.

## 8. Promover sin pagar nada

Dominio con certificado + landing + correo profesional + analítica = base lista para:

- Compartir el link `otear.app` en LinkedIn.
- Enviar correos de outreach desde `hola@otear.app`.
- Agregar `?utm_source=linkedin&utm_campaign=ingenios` al link para medir qué canal trae interés.
- Ver semanalmente en Cloudflare Analytics qué páginas visitan y cuánto se quedan.

## 9. Cuando algo falle

- **El build falla en Cloudflare pero localmente funciona:** suele ser la versión de Node. Asegúrate de que `NODE_VERSION=22` esté puesto.
- **404 en rutas internas (`/programacion/`, etc.):** `trailingSlash: true` ya está, pero verifica que los links en el código terminen en `/`. Pages sirve `/path/` como `/path/index.html`.
- **La landing muestra el AppShell:** el root (`/`) debe quedar fuera del route group `(workspace)`. Está en `src/app/page.tsx`, correcto.
- **El formulario no muestra los botones de WhatsApp o correo:** faltan `NEXT_PUBLIC_WHATSAPP_NUMBER` o `NEXT_PUBLIC_CONTACT_EMAIL`, o se definieron después del último build. Las variables `NEXT_PUBLIC_*` se fijan al construir, así que hay que volver a desplegar.
- **Email Routing no entrega:** espera unos minutos tras activar, Gmail puede marcar los primeros correos como spam.
