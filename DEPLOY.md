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

### Pasos

1. **Subir a GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Crear repo en GitHub y subir
   ```

2. **Conectar con Vercel**:
   - Ve a https://vercel.com
   - Importa tu repo de GitHub
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Listo** — Vercel te da una URL permanente tipo `https://mr-toasted.vercel.app`

> 💡 Gratis para siempre con límite de 100GB/mes. Ideal para demo.

---

## 📋 Checklist antes de la demo

- [ ] `npm run build` ejecutado sin errores
- [ ] Servidor iniciado (`demo.bat` o `npm run demo`)
- [ ] Probar desde el celular con la IP local
- [ ] Verificar que `/admin` y `/kitchen` cargan
- [ ] Hacer un pedido de prueba completo (agregar al carrito → confirmar)
- [ ] Verificar que aparece en Cocina y Admin
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
- Se instala como PWA ( Progressive Web App ) con icono propio.
