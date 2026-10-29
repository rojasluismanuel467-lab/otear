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
| `NEXT_PUBLIC_WEB3FORMS_KEY` | tu Access Key de web3forms.com | Si está, el formulario envía al correo configurado en Web3Forms. Si no está, los leads quedan en `localStorage` del navegador del visitante (útil para pruebas, no para producción). |

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

## 7. Formulario: configurar Web3Forms

1. Entra a https://web3forms.com → **Create your Access Key** → ingresa `hola@otear.app` (ya debe recibir correos vía Email Routing).
2. Confirma el correo que te envían.
3. Copia el Access Key.
4. Pégalo como `NEXT_PUBLIC_WEB3FORMS_KEY` en Cloudflare Pages (paso 4) y re-despliega.
5. Prueba el formulario de la landing: debería llegarte el correo a `hola@otear.app` → reenvía a tu Gmail.

Alternativa si prefieres hoja de cálculo: Formspree (50 envíos/mes gratis) con destino a Google Sheets vía Zapier gratuito, o un Google Apps Script que escriba al sheet directo. Si quieres, cámbialo cuando te acomode y yo adapto el componente.

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
- **Formulario no envía:** revisa en DevTools → Network si llama a `api.web3forms.com`. Si no, falta `NEXT_PUBLIC_WEB3FORMS_KEY` o el redeploy no se aplicó.
- **Email Routing no entrega:** espera unos minutos tras activar, Gmail puede marcar los primeros correos como spam.
