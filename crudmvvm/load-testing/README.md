# Load Testing - ALB + Lambda Auto Scaling

Pruebas de carga para validar el Application Load Balancer y el auto-scaling de Lambda.

## Instalación de k6

### Windows

**Opción 1: Chocolatey**
```bash
choco install k6
```

**Opción 2: Winget**
```bash
winget install k6
```

**Opción 3: Descarga directa**
Descargar de: https://github.com/grafana/k6/releases

### Verificar instalación
```bash
k6 version
```

---

## Scripts Disponibles

### 1. `smoke-test.js` - Prueba Rápida
**Propósito**: Verificar que el sistema funciona básicamente
**Duración**: 30 segundos
**Usuarios**: 1

```bash
k6 run smoke-test.js
```

### 2. `alb-load-test.js` - Prueba de Carga
**Propósito**: Validar balanceo de carga y auto-scaling
**Duración**: ~3.5 minutos
**Usuarios**: 10 → 20 → 50

```bash
k6 run alb-load-test.js
```

**Fases:**
- 30s: Ramp-up a 10 usuarios
- 1m: Mantener 20 usuarios
- 30s: Spike a 50 usuarios
- 1m: Mantener 50 usuarios (auto-scaling)
- 30s: Ramp-down a 0

### 3. `stress-test.js` - Prueba de Estrés
**Propósito**: Encontrar límites del sistema
**Duración**: ~7 minutos
**Usuarios**: Hasta 200

```bash
k6 run stress-test.js
```

---

## Ejecutar con Resultados Exportados

### HTML Report (Recomendado para PDF)
```bash
k6 run alb-load-test.js --out json=results.json
```

Luego usar herramienta online para convertir: https://k6.io/docs/results-output/real-time/

### JSON Output
```bash
k6 run alb-load-test.js --summary-export=summary.json
```

### CSV Output
```bash
k6 run alb-load-test.js --out csv=results.csv
```

---

## Métricas Importantes

### Thresholds Configurados

**alb-load-test.js:**
- ✅ `http_req_duration p(95) < 2000ms` - 95% de requests en menos de 2s
- ✅ `http_req_failed < 10%` - Menos de 10% de fallos
- ✅ `successful_requests > 90%` - Más de 90% exitosos

**smoke-test.js:**
- ✅ `http_req_duration p(95) < 2000ms`
- ✅ `http_req_failed < 1%`

**stress-test.js:**
- ✅ `http_req_duration p(95) < 5000ms` - Más permisivo bajo estrés
- ✅ `http_req_failed < 30%` - Esperamos algunos fallos

---

## Monitorear Durante las Pruebas

### AWS Console - CloudWatch

**Mientras corre la prueba, ir a:**

1. **Lambda → apiclientes-api → Monitoring**
   - Ver "Invocations" (picos)
   - Ver "Concurrent executions" (auto-scaling)
   - Ver "Duration" (tiempo de respuesta)

2. **EC2 → Load Balancers → apiclientes-alb → Monitoring**
   - RequestCount
   - TargetResponseTime
   - HTTPCode_Target_2XX_Count
   - HTTPCode_Target_5XX_Count

3. **CloudWatch → Metrics → All metrics**
   - Namespace: AWS/ApplicationELB
   - Métricas: Todas las del ALB

### AWS CLI (en otra terminal)

```bash
# Ver invocaciones de Lambda en tiempo real
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name ConcurrentExecutions \
  --dimensions Name=FunctionName,Value=apiclientes-api \
  --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Maximum

# Ver requests del ALB
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name RequestCount \
  --dimensions Name=LoadBalancer,Value=app/apiclientes-alb/f5b6d3e6c1231e59 \
  --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Sum
```

---

## Interpretación de Resultados

### Métricas k6

```
http_reqs......................: 1500   (total requests)
http_req_duration..............: avg=850ms min=120ms med=800ms max=2s p(95)=1.5s p(99)=1.8s
http_req_failed................: 0.50%  (tasa de fallos)
iterations.....................: 1500   (requests completados)
vus............................: 50     (usuarios virtuales máximo)
vus_max........................: 50
```

**Bueno:**
- ✅ http_req_failed < 10%
- ✅ p(95) < 2000ms
- ✅ Sin errores 5XX

**Evidencia de Auto-Scaling:**
- Ver en CloudWatch que "Concurrent Executions" aumenta con la carga
- Múltiples instancias Lambda ejecutándose simultáneamente
- Tiempo de respuesta se mantiene estable incluso con 50 usuarios

---

## Para el PDF - Capturar Evidencias

### 1. Antes de ejecutar
```bash
# Terminal 1: Ejecutar prueba
k6 run alb-load-test.js
```

### 2. Durante la ejecución
- Screenshot de AWS Console mostrando métricas en tiempo real
- Screenshot de k6 mostrando progreso

### 3. Después
- Screenshot del resumen final de k6
- Screenshot de CloudWatch mostrando picos de invocaciones
- Exportar resultados: `summary.json`

---

## Troubleshooting

### Error: "k6: command not found"
Reinicia la terminal después de instalar k6.

### Error: Connection timeout
Verifica que el ALB esté corriendo:
```bash
curl http://apiclientes-alb-1873885481.us-east-1.elb.amazonaws.com/health
```

### Muchos errores 5XX
Lambda puede estar siendo throttled. Revisa CloudWatch Alarms.

---

## Recursos

- **k6 Documentation**: https://k6.io/docs/
- **AWS CloudWatch**: https://console.aws.amazon.com/cloudwatch/
- **Lambda Metrics**: https://docs.aws.amazon.com/lambda/latest/dg/monitoring-metrics.html
- **ALB Metrics**: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-cloudwatch-metrics.html
