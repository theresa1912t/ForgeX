#!/usr/bin/env bash
# Rebuilds the Docker image, pushes it, and redeploys the Cloud Run service.
#
# Usage:
#   ./deploy.sh              # rebuild + redeploy app only
#   ./deploy.sh --migrate    # also run `prisma migrate deploy` against Cloud SQL first
#
# --migrate requires FORGEX_DB_APP_PASSWORD to be set to the `forgexapp` Cloud SQL
# user's password (the one generated when the instance was created). It downloads
# the Cloud SQL Auth Proxy into ./.gcp/ on first use (gitignored, not committed).
set -euo pipefail
cd "$(dirname "$0")"

PROJECT_ID="forge-x-511915"
REGION="us-central1"
SERVICE="forgex-app"
IMAGE="us-central1-docker.pkg.dev/${PROJECT_ID}/forgex-repo/forgex-app:latest"
CLOUD_SQL_CONNECTION="forge-x-511915:us-central1:forgex-db"
PROXY_DIR=".gcp"
PROXY_BIN="${PROXY_DIR}/cloud-sql-proxy"

ensure_proxy() {
  if [[ -x "$PROXY_BIN" ]]; then
    return
  fi
  mkdir -p "$PROXY_DIR"
  local os arch url
  os="$(uname -s)"
  arch="$(uname -m)"
  case "${os}-${arch}" in
    Darwin-arm64) url="https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.2/cloud-sql-proxy.darwin.arm64" ;;
    Darwin-x86_64) url="https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.2/cloud-sql-proxy.darwin.amd64" ;;
    Linux-x86_64) url="https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.2/cloud-sql-proxy.linux.amd64" ;;
    Linux-aarch64) url="https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.2/cloud-sql-proxy.linux.arm64" ;;
    *) echo "ERROR: no known cloud-sql-proxy build for ${os}-${arch}. Download one manually into ${PROXY_BIN}." >&2; exit 1 ;;
  esac
  echo "==> Downloading cloud-sql-proxy for ${os}-${arch}..."
  curl -sL -o "$PROXY_BIN" "$url"
  chmod +x "$PROXY_BIN"
}

if [[ "${1:-}" == "--migrate" ]]; then
  if [[ -z "${FORGEX_DB_APP_PASSWORD:-}" ]]; then
    echo "ERROR: set FORGEX_DB_APP_PASSWORD to the forgexapp Cloud SQL user's password." >&2
    exit 1
  fi

  ensure_proxy
  echo "==> Starting Cloud SQL Auth Proxy..."
  "$PROXY_BIN" --port 5433 "$CLOUD_SQL_CONNECTION" &
  PROXY_PID=$!
  trap 'kill $PROXY_PID 2>/dev/null || true' EXIT
  sleep 3

  echo "==> Running prisma migrate deploy..."
  DATABASE_URL="postgresql://forgexapp:${FORGEX_DB_APP_PASSWORD}@127.0.0.1:5433/forgex" npx prisma migrate deploy

  kill "$PROXY_PID" 2>/dev/null || true
  trap - EXIT
  echo "==> Migrations applied."
fi

echo "==> Building and pushing image via Cloud Build..."
gcloud builds submit --tag "$IMAGE" --project="$PROJECT_ID"

echo "==> Deploying to Cloud Run..."
gcloud run deploy "$SERVICE" \
  --image="$IMAGE" \
  --region="$REGION" \
  --project="$PROJECT_ID"

echo "==> Done. Service URL:"
gcloud run services describe "$SERVICE" --region="$REGION" --project="$PROJECT_ID" --format="value(status.url)"
