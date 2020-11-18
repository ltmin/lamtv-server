FROM ltmin/node-builder:12.18.4 as builder
ARG BUILD_ID
ARG IMAGE_NAME
ARG IMAGE_TAG

LABEL stage=builder
LABEL image=$IMAGE_NAME-$IMAGE_TAG
LABEL build_id=$BUILD_ID

COPY . /builder
WORKDIR /builder
RUN npm ci && npm run build && npm ci --prod
RUN mkdir /app && \
  mv dist node_modules package.json /app/

FROM node:12.18.4
ARG BUILD_ID
ARG IMAGE_NAME
ARG IMAGE_TAG

LABEL stage=prod
LABEL image="$IMAGE_NAME-$IMAGE_TAG"
LABEL build_id=$BUILD_ID

EXPOSE 9000
COPY --chown=node:node --from=builder /app/ /app/
USER node
WORKDIR /app
CMD ["node", "dist/main.js", "2>&1"]
