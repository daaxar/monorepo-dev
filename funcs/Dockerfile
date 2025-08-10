###############################
# Etapa 1: Construcción       #
###############################
# Usamos una imagen ligera de Node para construir (más rápida que la runtime de Lambda)
FROM node:22-alpine AS builder

ARG FUNCTION_PATH="example/func-a"   # Ruta relativa dentro de funcs/ (sin prefijo funcs/)
ARG HANDLER="index.handler"          # Nombre del handler exportado
ARG INSTALL_DEV="false"              # Si se requieren dependencias dev específicas del package

ENV FUNCTION_PATH=${FUNCTION_PATH}
ENV HANDLER=${HANDLER}

WORKDIR /workspace

# Copiamos manifiestos mínimos primero para aprovechar capa de cache
COPY package.json package-lock.json* ./

# Instala solo dependencias raíz (dev necesarias para build CLI)
RUN npm ci || npm install

###############################
# Build CLI (para usar Dx build) 
###############################
COPY tools/cli/package*.json tools/cli/
# Copiamos el resto del código fuente de la CLI antes de construir
COPY tools/cli/src tools/cli/src
COPY tools/cli/tsconfig.json tools/cli/tsconfig.json
COPY tools/cli/bin tools/cli/bin
RUN cd tools/cli && npm install && npm run cli:build && npm pack && mv *.tgz /tmp/cli.tgz
RUN npm install -g /tmp/cli.tgz

###############################
# Copiamos código de la función y librerías compartidas
###############################
COPY libs libs
COPY funcs/${FUNCTION_PATH}/package*.json funcs/${FUNCTION_PATH}/

# Instala dependencias de la función de manera aislada
RUN cd funcs/${FUNCTION_PATH} && npm install && if [ "${INSTALL_DEV}" != "true" ]; then npm prune --omit=dev; fi

# Copiamos el resto del código fuente (después de instalar para más cache)
COPY funcs/${FUNCTION_PATH} funcs/${FUNCTION_PATH}

# Build de la función (usa Dx que ya debería resolver dependencias internas)
RUN npm install -g esbuild && cd funcs/${FUNCTION_PATH} && npm run build

###############################
# Etapa 2: Runtime (Lambda)   #
###############################
FROM public.ecr.aws/lambda/nodejs:22 AS runtime

ARG FUNCTION_PATH="example/func-a"
ARG HANDLER="index.handler"
ENV FUNCTION_PATH=${FUNCTION_PATH}
ENV HANDLER=${HANDLER}

# Copiamos sólo artefactos necesarios
COPY --from=builder /workspace/funcs/${FUNCTION_PATH}/dist ${LAMBDA_TASK_ROOT}/
COPY --from=builder /workspace/funcs/${FUNCTION_PATH}/package*.json ${LAMBDA_TASK_ROOT}/

WORKDIR ${LAMBDA_TASK_ROOT}

# Instalamos dependencias runtime (omit dev por defecto)
RUN npm install --omit=dev || true

# Variables útiles para debug
ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps

# Handler por defecto (index.js exporta handler)
CMD ["index.handler"]
