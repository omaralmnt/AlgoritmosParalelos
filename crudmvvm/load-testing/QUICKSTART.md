# Quick Start - Load Testing

## Instalación Rápida (Windows)

```powershell
choco install k6
```

O descargar de: https://k6.io/docs/get-started/installation/

## Ejecutar Prueba de Carga Rápida (30 segundos)

### PowerShell (Recomendado)
```powershell
cd load-testing
.\run-test.ps1
```

### Bash / Git Bash
```bash
cd load-testing
chmod +x run-test.sh
./run-test.sh
```

### Directamente con k6

**Prueba rápida (30s):**
```bash
cd load-testing
k6 run alb-load-test.js
```

**Prueba ultra rápida (30s, simple):**
```bash
k6 run quick-test.js
```

## Modificar Duración de la Prueba

Edita la línea 5 de `alb-load-test.js`:

```javascript
const TEST_DURATION_SECONDS = 30;  // Cambiar aquí: 30, 60, 120, 180, etc.
```

Ejemplos:
- `30` = 30 segundos
- `60` = 1 minuto
- `120` = 2 minutos
- `180` = 3 minutos

## Tipos de Prueba

```powershell
k6 run quick-test.js      # Ultra rápida (30s, simple)
k6 run alb-load-test.js   # Rápida con métricas (30s) - RECOMENDADO
k6 run smoke-test.js      # Verificación básica (30s)
k6 run stress-test.js     # Estrés (7min)
```

**O con el helper script:**
```powershell
.\run-test.ps1 smoke   # 30s
.\run-test.ps1 load    # 30s (configurable)
.\run-test.ps1 stress  # 7min
```

## Durante la Prueba

**Abre en otra ventana:**
1. AWS Console → Lambda → apiclientes-api → Monitoring
2. AWS Console → EC2 → Load Balancers → Monitoring
3. AWS Console → CloudWatch → Metrics

**Captura screenshots de:**
- ✅ Gráficas de Invocations (Lambda)
- ✅ Gráficas de Concurrent Executions (auto-scaling)
- ✅ Métricas del ALB (RequestCount, TargetResponseTime)
- ✅ Resultados finales de k6 en la terminal

## Resultados

Los resultados se guardan en `results/`:
- `*.json` - Datos completos
- `*-summary.json` - Resumen ejecutivo

## Para el PDF

Usar: `.\run-test.ps1 load`

**Evidencias necesarias:**
1. Screenshot del comando ejecutándose
2. Screenshot del resultado final de k6
3. Screenshot de CloudWatch mostrando auto-scaling
4. Screenshot de métricas del ALB

## Troubleshooting

**Error: k6 not found**
- Reinicia la terminal después de instalar
- Verifica con: `k6 version`

**Connection timeout**
- Verifica el ALB: `curl http://apiclientes-alb-1873885481.us-east-1.elb.amazonaws.com/health`

**Muchos errores 5XX**
- Normal bajo carga extrema
- Revisa CloudWatch Alarms
- Reduce usuarios en el script
