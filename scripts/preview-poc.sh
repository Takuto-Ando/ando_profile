#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
if command -v bundle >/dev/null 2>&1; then
  bundler=bundle
elif command -v bundle3.2 >/dev/null 2>&1; then
  bundler=bundle3.2
else
  printf '%s\n' 'Bundlerが必要です。既存Gemfileの依存をインストールしてください。' >&2
  exit 1
fi
exec "$bundler" exec jekyll serve --config _config.yml,_config.local.yml --destination _site-local --host 127.0.0.1 --port 4000
