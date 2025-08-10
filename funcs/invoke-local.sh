#!/bin/bash

# Script para invocar funciones Lambda locales
# Uso: ./invoke-local.sh [nombre-funcion] [ruta-al-archivo-json] [puerto]
#
# Ejemplos:
#   ./invoke-local.sh integrations integrations/bringg/create event.json 9000
#   ./invoke-local.sh otra-funcion integrations/bringg/create custom-event.json 9002

FUNCTION_NAME="${1:-example}"
FUNCTION_PATH="${2:-example}"
EVENT_FILE="${3:-event.json}"
PORT="${3:-9000}"

if [ ! -f "$EVENT_FILE" ]; then
  echo "{\"test\":\"example-event\"}" >"$EVENT_FILE"
  echo "Creado archivo $EVENT_FILE con evento de ejemplo"
fi

echo "Invocando función $FUNCTION_NAME con evento de $EVENT_FILE en puerto $PORT..."
curl -s -XPOST "http://localhost:$PORT/2015-03-31/functions/function/invocations" -d @"$EVENT_FILE"
echo
