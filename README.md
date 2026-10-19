# Cognitas — Demonstrações

Four static demo pages for prospects, plus an index that links them together. No build step, no
backend, no data: every page is a single self-contained HTML file with its CSS and JS inlined.

| Host | Serves | Source |
|---|---|---|
| `demos.cognitas.pt` | index — links to all four | `index.html` |
| `agenda.cognitas.pt` | **not a demo** — the Toma Nota website (built from `../tomanota-site`) | `agenda/` |
| `crm.cognitas.pt` | self-filling CRM demo | `crm/index.html` |
| `faturacao.cognitas.pt` | invoicing & cash flow demo | `faturacao/index.html` |

Card 01 on the index points at **`orders.cognitas.pt`**, which is a different repo
([`cognitas-demo-orders`](https://github.com/PedroSerrano16/cognitas-demo-orders)) and a real
Next.js + FastAPI application. Nothing here deploys it.

## All navigation links are absolute

Because each demo is its own subdomain, the cross-links had to become absolute
(`https://crm.cognitas.pt`, not `crm/index.html`). The trade-off: opening a page straight from disk
still renders it perfectly, but the nav links jump to the live site rather than the neighbouring
file. Individual pages remain self-contained; only navigation is affected.

## All content is invented

Fictional companies, made-up figures, scripted interactions. No real client, price, or contact
appears anywhere, and no page calls an API or holds a key. They are illustrations, not software.

## Deploying

Every push to `main` redeploys via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which pipes [`deploy/remote.sh`](deploy/remote.sh) over SSH to the Hetzner box. Because the pages are
static and nginx serves them straight from the checkout, **the `git pull` is the deploy** — nothing
is built, restarted, or migrated. The script then curls all four hosts and fails the run if any of
them stops answering.

### One-time server setup

```bash
# 1. DNS — in Cloudflare (OVH's zone is not authoritative):
#    A records  demos, agenda, crm, faturacao -> 178.105.132.119
#    DNS only (GREY cloud). The orange proxy intercepts Let's Encrypt's HTTP
#    challenge and certbot will fail. Switch to Proxied after the certs issue.

# 2. Clone. /opt/demos is the web root as well as the checkout.
git clone https://github.com/PedroSerrano16/cognitas-demos /opt/demos
chmod -R a+rX /opt/demos

# 3. nginx
cp /opt/demos/deploy/nginx/cognitas-demos.conf /etc/nginx/sites-available/cognitas-demos
ln -s /etc/nginx/sites-available/cognitas-demos /etc/nginx/sites-enabled/cognitas-demos
nginx -t && systemctl reload nginx

# 4. Certificates — one run, all four hosts
certbot --nginx -d demos.cognitas.pt -d agenda.cognitas.pt \
                -d crm.cognitas.pt   -d faturacao.cognitas.pt
```

### The web root is a git checkout

nginx serves `demos.cognitas.pt` from `/opt/demos`, which also contains `.git`, `deploy/`, and this
README. The config denies all three; without those rules the entire repository, history included, is
downloadable. If you ever add a file to the repo root that shouldn't be public, add a matching `deny`.

### Never let the deploy script rewrite nginx config

`certbot --nginx` edits `/etc/nginx/sites-available/cognitas-demos` **in place**, adding the
`ssl_certificate` directives and the `:80 → :443` redirects. The copy in this repo is the pre-TLS
version. Copying it over the live file — which a "keep config in sync" step would do on every deploy
— strips TLS from four hosts at once. `deploy/remote.sh` deliberately never touches `/etc/nginx`.
Change the config by editing the server's copy, then reflect it back here by hand.

### GitHub secrets

Same four secrets as the orders repo, and the same `~/.ssh/cognitas_deploy` key can be reused —
it already authorises against this host.

| Secret | Value |
|---|---|
| `DEPLOY_KEY` | contents of `~/.ssh/cognitas_deploy` (the **private** key) |
| `DEPLOY_HOST` | `178.105.132.119` |
| `DEPLOY_USER` | `root` |
| `DEPLOY_HOST_KEY` | `ssh-keyscan 178.105.132.119` output — pins the host key |

This key reaches a box that also runs client production. Scope it to a non-root deploy user if that
ever stops being acceptable.

### Health check depends on TLS

`deploy/remote.sh` curls `https://` with `--resolve` pointing at `127.0.0.1`. It therefore only
passes **after** step 4 has issued the certificates. Run the workflow for the first time once
certbot has succeeded, or the very first deploy will report failure on a checkout that is fine.

## Editing

Open the file, edit, push. Text carries both languages inline via `data-pt` / `data-en` attributes
and a toggle in the page — if you add copy, add both or the language switch will leave gaps.

## agenda.cognitas.pt is the Toma Nota website

The booking demo was retired. `agenda/` holds the **build output** of the editable Toma Nota
site, whose source lives in `../tomanota-site` (its own repo). Don't edit `agenda/` by hand:
change the source there, then `npm run publish-agenda`, commit here and deploy.

The agenda server block forwards `/api/inscricao` **to the original Vercel backend**, so the
enrolment form stops working the day that hosting is switched off. Its `/_next/image` location
is left over from the earlier mirror and is now unused.
