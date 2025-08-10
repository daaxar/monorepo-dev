#!/usr/bin/env bash
set -euo pipefail

# Script para construir imagen Docker de una función Lambda dentro de ./funcs
# Uso:
#   ./artifact.sh --path example/func-a --tag recurring-csv:local --handler index.handler
# Flags:
#   --path|-p       Ruta relativa dentro de funcs/ (obligatoria)
#   --tag|-t        Tag de la imagen (default: nombre normalizado de la carpeta)
#   --handler|-h    Handler (default: index.handler)
#   --dev           Instalar dependencias de desarrollo del paquete
#   --no-cache      Fuerza rebuild completo
# Ejemplos:
#   ./artifact.sh -p example/func-a
#   ./artifact.sh -p example/func-a -t func-a:dev -h src/index.handler --dev

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FUNCS_DIR="${ROOT_DIR}/funcs"
DOCKERFILE="${FUNCS_DIR}/Dockerfile"

if ! command -v docker &>/dev/null; then
  echo "ERROR: docker no está instalado o en PATH" >&2
  exit 1
fi

FUNCTION_PATH=""
IMAGE_TAG=""
HANDLER="index.handler"
INSTALL_DEV="false"
NO_CACHE="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--path)
      FUNCTION_PATH="$2"; shift 2;;
    -t|--tag)
      IMAGE_TAG="$2"; shift 2;;
    -h|--handler)
      HANDLER="$2"; shift 2;;
    --dev)
      INSTALL_DEV="true"; shift 1;;
    --no-cache)
      NO_CACHE="true"; shift 1;;
    *)
      echo "Flag desconocida: $1" >&2; exit 1;;
  esac
done

if [[ -z "${FUNCTION_PATH}" ]]; then
  echo "ERROR: Debes indicar --path relativo dentro de funcs/" >&2
  exit 1
fi

if [[ ! -d "${FUNCS_DIR}/${FUNCTION_PATH}" ]]; then
  echo "ERROR: No existe carpeta ./funcs/${FUNCTION_PATH}" >&2
  exit 1
fi

if [[ -z "${IMAGE_TAG}" ]]; then
  # Normaliza path para tag docker (reemplaza / por -)
  IMAGE_TAG="$(echo "${FUNCTION_PATH}" | tr '/' '-')"
fi

BUILD_ARGS=(
  "--build-arg" "FUNCTION_PATH=${FUNCTION_PATH}"
  "--build-arg" "HANDLER=${HANDLER}"
  "--build-arg" "INSTALL_DEV=${INSTALL_DEV}"
  "-f" "${DOCKERFILE}"
  "${ROOT_DIR}"
  "-t" "${IMAGE_TAG}"
)

if [[ "${NO_CACHE}" == "true" ]]; then
  BUILD_ARGS+=("--no-cache")
fi

echo "📦 Construyendo imagen para función: ${FUNCTION_PATH}" >&2
echo "   Handler:  ${HANDLER}" >&2
echo "   Tag:      ${IMAGE_TAG}" >&2
echo "   Dev deps: ${INSTALL_DEV}" >&2

docker build "${BUILD_ARGS[@]}"

echo "✅ Imagen construida: ${IMAGE_TAG}" >&2

echo "Ejemplo de invocación local (lambda runtime emulado):" >&2
echo "  docker run -p 9000:8080 ${IMAGE_TAG}" >&2
echo "  curl -XPOST 'http://localhost:9000/2015-03-31/functions/function/invocations' -d '{\"ping\":true}'" >&2
