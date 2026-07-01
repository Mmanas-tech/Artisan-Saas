#!/bin/bash
set -euo pipefail

IMAGE_NAME="artisan-server"
IMAGE_TAG="${1:-latest}"
REGISTRY="${DOCKER_HUB_USERNAME:-artisan-saas}"

echo "=== Building Docker image ==="
docker build -t "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}" ./server

echo "=== Pushing to Docker Hub ==="
docker push "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "=== Deploying to Railway ==="
if command -v railway &> /dev/null; then
  railway up --service artisan-server
  echo "Deployed successfully."
else
  echo "Railway CLI not found. Install: npm i -g @railway/cli"
  echo "Then run: railway login && railway up"
fi

echo "=== Done ==="
