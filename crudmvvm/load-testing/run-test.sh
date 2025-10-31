#!/bin/bash

TEST_TYPE=${1:-load}
SCRIPT=""

case $TEST_TYPE in
  smoke)
    SCRIPT="smoke-test.js"
    ;;
  load)
    SCRIPT="alb-load-test.js"
    ;;
  stress)
    SCRIPT="stress-test.js"
    ;;
  *)
    echo "Uso: ./run-test.sh [smoke|load|stress]"
    exit 1
    ;;
esac

echo "========================================"
echo "  ALB Load Testing - k6"
echo "========================================"
echo ""
echo "Test Type: $TEST_TYPE"
echo "Script: $SCRIPT"
echo ""

if ! command -v k6 &> /dev/null; then
    echo "ERROR: k6 no está instalado"
    echo ""
    echo "Instalar desde: https://k6.io/docs/get-started/installation/"
    exit 1
fi

echo "Verificando endpoint ALB..."
if curl -s -o /dev/null -w "%{http_code}" http://apiclientes-alb-1873885481.us-east-1.elb.amazonaws.com/health | grep -q "200"; then
    echo "ALB está respondiendo correctamente"
else
    echo "ADVERTENCIA: No se pudo conectar al ALB"
fi

echo ""
echo "Iniciando prueba de carga..."
echo ""

mkdir -p results
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
JSON_OUTPUT="results/${TEST_TYPE}-test_${TIMESTAMP}.json"
SUMMARY_OUTPUT="results/${TEST_TYPE}-test_${TIMESTAMP}-summary.json"

k6 run $SCRIPT --out json=$JSON_OUTPUT --summary-export=$SUMMARY_OUTPUT

echo ""
echo "========================================"
echo "  PRUEBA COMPLETADA"
echo "========================================"
echo "Resultados guardados en:"
echo "  - $JSON_OUTPUT"
echo "  - $SUMMARY_OUTPUT"
echo ""
