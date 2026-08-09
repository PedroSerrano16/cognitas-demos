#!/usr/bin/env bash
# Runs on the server, piped in over SSH by .github/workflows/deploy.yml.
#
# These demos are static files served by nginx straight from the checkout, so
# the deploy IS the git pull — there is nothing to build, restart, or migrate.
# Deliberately does NOT touch /etc/nginx: certbot rewrites those files in place
# when it issues and renews certificates, and copying the repo's copy over the
# top would strip the TLS directives it added. nginx config is one-time setup.
set -euo pipefail

APP_DIR=/opt/demos

cd "$APP_DIR"

# --ff-only rather than reset --hard: if the server has diverged, fail loudly
# instead of silently destroying whatever is there.
git pull --ff-only

# Serve as the web user; the checkout is owned by the deploy user.
chmod -R a+rX "$APP_DIR"

# Verify every host actually answers, so a bad commit doesn't sit there looking
# green. --resolve tests the real nginx server_name path without depending on
# public DNS or on this box being able to reach itself over the internet.
FAILED=0
for host in demos agenda crm faturacao; do
    fqdn="${host}.cognitas.pt"
    if curl -fsS --resolve "${fqdn}:443:127.0.0.1" "https://${fqdn}/" > /dev/null; then
        echo "OK   ${fqdn}"
    else
        echo "FAIL ${fqdn}" >&2
        FAILED=1
    fi
done

if [ "$FAILED" -ne 0 ]; then
    echo "health check FAILED" >&2
    nginx -t >&2 || true
    tail -n 20 /var/log/nginx/error.log >&2 || true
    exit 1
fi

echo "all hosts healthy"
