# 🚀 Guía de Deploy - Mr. Toasted

## Opción 1: Red Local (Misma WiFi) ✅ RECOMENDADA para demo rápida

### Requisitos
- PC y celular/tablet en la **misma red WiFi**
- Node.js instalado

### Pasos

1. **Hacer build del proyecto** (una sola vez):
   ```bash
   cd mr-toasted
   npm run build
   ```

2. **Iniciar servidor demo**:
   ```bash
   npm run demo
   ```
   O ejecuta directamente: `demo.bat` (doble click)

3. **Acceder desde dispositivos**:
   | Dispositivo | URL |
   |------------|-----|
   | Este PC | http://localhost:5173 |
   | Celular/Tablet | http://**TU-IP**:5173 |

   > Tu IP local aparece en la consola al iniciar el servidor.

### Rutas del sistema
- `http://TU-IP:5173/` → Menú del cliente (QR por mesa: `?table=3`)
- `http://TU-IP:5173/admin` → Panel de administración
- `http://TU-IP:5173/kitchen` → Pantalla de cocina

---

## Opción 2: Ngrok (Acceso desde cualquier lado) 🌍

Para que el cliente pruebe desde su casa sin estar en tu WiFi.

### Instalación

1. Descarga ngrok: https://ngrok.com/download
2. Crea cuenta gratis y copia tu **authtoken**
3. Configura:
   ```bash
   ngrok config add-authtoken TU_TOKEN
   ```

### Uso

```bash
# 1. Inicia el servidor local primero
npm run demo

# 2. En otra terminal, expón con ngrok
ngrok http 5173
```

Ngrok te dará una URL como `https://abc123.ngrok.io` — esa es la que compartes al cliente.

> ⚠️ La URL gratuita cambia cada vez que reiniciás ngrok. Para URL fija necesitás plan pago.

---

## Opción 3: Vercel (Deploy permanente gratuito) ☁️

Para una demo profesional que quede siempre online.

### Requisitos previos
- Cuenta en GitHub
- Repo del proyecto subido a GitHub
- Cuenta en Vercel (gratis con GitHub)

### Paso 1: Subir a GitHub

```bash
cd mr-toasted
git add .
git commit -m "feat: sistema completo v1.0 - kitchen dashboard, cupones, zonas, PWA"
git push origin main
```

> ⚠️ Asegúrate de que `dist/` esté en `.gitignore` (ya lo está por defecto). Vercel hace el build automáticamente.

### Paso 2: Conectar con Vercel

1. Ve a https://vercel.com y haz login con GitHub
2. Click en **"Add New Project"**
3. Importa tu repo de GitHub (`stiwart0056-cell/sistema-pedidos-kappa`)
4. Configuración:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** `./` (dejar como está)

### Paso 3: Variables de Entorno (IMPORTANTE)

1. En el dashboard de Vercel, ve a **Settings → Environment Variables**
2. Agrega estas variables:

   | Nombre | Valor | Environment |
   |--------|-------|-------------|
   | `VITE_SUPABASE_URL` | `https://xkohsrjgvfkkuuwelnll.supabase.co` | Production, Preview, Development |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Production, Preview, Development |

3. Click **Save**
4. Ve a **Deployments** y haz click en **Redeploy**

> 🔐 **NUNCA** subas el archivo `.env.local` a GitHub. Las variables deben ir solo en Vercel.

### Paso 4: Verificar el deploy

1. Espera a que termine el build (toma ~1-2 minutos)
2. Vercel te dará una URL tipo `https://sistema-pedidos-kappa.vercel.app`
3. Prueba estas rutas:
   - `/` → Menú cliente
   - `/login` → Login
   - `/admin` → Panel admin
   - `/kitchen` → Cocina

### Paso 5: Configurar dominio personalizado (opcional)

1. En Vercel, ve a **Settings → Domains**
2. Agrega tu dominio (ej: `mrtoasted.com`)
3. Sigue las instrucciones de DNS

---

## 📋 Checklist antes de la demo

- [ ] `npm run build` ejecutado sin errores localmente
- [ ] `git push` subido correctamente a GitHub
- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy en Vercel exitoso (build verde)
- [ ] Probar `/` (menú cliente) desde celular
- [ ] Probar `/login` con credenciales de admin
- [ ] Probar `/admin` (dashboard, pedidos, menú, cupones, zonas)
- [ ] Probar `/kitchen` (panel de cocina)
- [ ] Hacer un pedido de prueba completo
- [ ] Verificar que el pedido aparece en Cocina y Admin
- [ ] Probar cupón de descuento
- [ ] Probar zona de delivery
- [ ] Imprimir un ticket de prueba

---

## 🔧 Solución de problemas

### "No puedo acceder desde el celular"
- Verifica que PC y celular estén en la **misma red WiFi**
- Desactiva temporalmente el firewall de Windows
- Prueba con `http://` (no `https://`)

### "La IP cambió"
- Tu router asigna IPs dinámicas. Ejecuta `demo.bat` de nuevo para ver la IP actual.
- O configura IP estática en tu PC.

### "Quiero que se vea como app en el celular"
- En Chrome/Safari del celular, abre el menú → "Agregar a pantalla de inicio"
- Se instala como PWA (Progressive Web App) con icono propio.

### "Build falla en Vercel"
1. Verifica que `node_modules` no esté en el repo (debe estar en `.gitignore`)
2. Verifica que el `package.json` tenga el script `"build": "tsc -b && vite build"`
3. Verifica que las variables de entorno estén configuradas en Vercel
4. Revisa los logs del build en Vercel para ver el error exacto

### "404 al refrescar /admin o /kitchen"
- Asegúrate de que `vercel.json` esté en la raíz con las rewrites SPA:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

### "Supabase connection error"
- Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén correctas
- Verifica que el proyecto de Supabase esté activo
- Verifica que las tablas existan (ejecuta `supabase-schema.sql` si es necesario)
