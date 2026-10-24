#!/bin/sh
# Checks that required environment variables are defined before starting the API.
set -e

REQUIRED_VARS="PORT MONGODB_URI SECRET_KEY CLOUD_NAME API_KEY API_SECRET STRIPE_SECRET_KEY"
OPTIONAL_VARS="ANTHROPIC_API_KEY"

missing=""
for var in $REQUIRED_VARS; do
    eval "value=\${$var:-}"
    if [ -z "$value" ]; then
        missing="$missing $var"
    fi
done

if [ -n "$missing" ]; then
    echo "❌ Required environment variables missing:$missing" >&2
    echo "   → Set them in backend/.env (Docker Compose) or in the Render dashboard." >&2
    exit 1
fi

for var in $OPTIONAL_VARS; do
    eval "value=\${$var:-}"
    if [ -z "$value" ]; then
        echo "⚠️  $var not set: the associated feature will be unavailable." >&2
    fi
done

exec "$@"
