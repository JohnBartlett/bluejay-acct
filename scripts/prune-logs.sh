#!/bin/bash
set -euo pipefail

LOG_DIR="${HOME}/Library/Logs/BlueBird"
LOG_FILES=("dev.log" "tunnel.log")

mkdir -p "${LOG_DIR}"

for file in "${LOG_FILES[@]}"; do
  LOG_PATH="${LOG_DIR}/${file}"
  if [ -f "${LOG_PATH}" ]; then
    : > "${LOG_PATH}"
    echo "Truncated ${LOG_PATH}"
  else
    echo "Skipping ${LOG_PATH} (not found)"
  fi
done
