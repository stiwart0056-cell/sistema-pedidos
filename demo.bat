@echo off
chcp 65001 >nul
title Mr. Toasted - Demo Server
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║           🍞 MR. TOASTED - MODO DEMO                         ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Obtener IP local automáticamente
for /f "tokens=2 delims=: " %%a in ('netsh interface ip show config name^="Wi-Fi" ^| findstr "Dirección IP"') do set LOCAL_IP=%%a
set LOCAL_IP=%LOCAL_IP: =%

if "%LOCAL_IP%"=="" (
    for /f "tokens=2 delims=: " %%a in ('netsh interface ip show config name^="Ethernet" ^| findstr "Dirección IP"') do set LOCAL_IP=%%a
    set LOCAL_IP=%LOCAL_IP: =%
)

echo 📡 IP Local detectada: %LOCAL_IP%
echo.
echo ┌──────────────────────────────────────────────────────────────┐
echo │  URLs DE ACCESO:                                             │
echo │                                                              │
echo │  🌐 Desde este PC:  http://localhost:5173                    │
echo │  📱 Desde celular:  http://%LOCAL_IP%:5173                   │
echo │                                                              │
echo │  Rutas del sistema:                                          │
echo │  • Menú cliente:    /                                        │
echo │  • Panel Admin:     /admin                                   │
echo │  • Cocina:          /kitchen                                 │
echo └──────────────────────────────────────────────────────────────┘
echo.
echo ⚠️  Asegúrate de que el cliente esté en la MISMA red WiFi.
echo 🛑 Presiona Ctrl+C para detener el servidor.
echo.

REM Asegurar que el build existe
if not exist "dist\index.html" (
    echo ❌ No se encontró el build. Ejecutando npm run build primero...
    call npm run build
)

REM Iniciar servidor
npx vite preview --host 0.0.0.0 --port 5173

pause
