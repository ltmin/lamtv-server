#!/usr/bin/env bash
set -e

REGISTRY="lamtv"

BUILD_ID=$(date "+%Y%m%d_%H%M%S")
IMAGE_TAG=${IMAGE_TAG:-latest}
FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$IMAGE_TAG"

docker build . -t $FULL_IMAGE_NAME \
  --build-arg IMAGE_NAME=$IMAGE_NAME \
  --build-arg IMAGE_TAG=$IMAGE_TAG \
  --build-arg BUILD_ID=$BUILD_ID

if [ -z DRYRUN ]; then
  docker push $FULL_IMAGE_NAME
  docker image rm $FULL_IMAGE_NAME --force
  docker image prune --filter="label=build_id=$BUILD_ID" --force
fi
