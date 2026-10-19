"""Static mirror of www.cetomanota.com (a prerendered Next.js site).

Usage: python3 -I mirror.py OUT_DIR
"""
import os
import re
import sys
import urllib.parse
import urllib.request

ORIGIN = "https://www.cetomanota.com"
PAGES = {"/": "index.html", "/metodo": "metodo.html", "/precario": "precario.html",
         "/inscricao": "inscricao.html", "/privacy": "privacy.html"}
OUT = os.path.abspath(sys.argv[1])

ASSET_RE = re.compile(
    r"""(?:(?<=["'(\s,])|^)(/(?:_next/static|logos|icons|images|img|fonts|media|assets)/[^"'()\s,\\]+|/[A-Za-z0-9_\-]+\.(?:ico|png|svg|webp|jpg|jpeg|xml|txt|webmanifest|json))""")
CHUNK_RE = re.compile(r"""static/(?:immutable/)?(?:chunks|media|css)/[A-Za-z0-9_\-./~]+\.(?:js|css|otf|woff2?|ttf|png|svg|jpg|webp)""")
NEXT_IMG_RE = re.compile(r"/_next/image\?url=([^&\"'\s]+)")

seen, queue = set(), []


def get(path):
    req = urllib.request.Request(ORIGIN + path, headers={"User-Agent": "Mozilla/5.0 (mirror)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def save(rel, data):
    dest = os.path.normpath(os.path.join(OUT, rel.lstrip("/")))
    assert dest.startswith(OUT + os.sep), dest
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "wb") as f:
        f.write(data)


def enqueue(url):
    path = urllib.parse.unquote(url.split("?")[0].split("#")[0])
    if path not in seen:
        seen.add(path)
        queue.append(path)


def scan(text):
    text = text.replace("&amp;", "&")
    for m in ASSET_RE.finditer(text):
        enqueue(m.group(1))
    for m in CHUNK_RE.finditer(text):
        enqueue("/_next/" + m.group(0))
    for m in NEXT_IMG_RE.finditer(text):
        enqueue(urllib.parse.unquote(m.group(1)))
        IMAGES.add(m.group(1))


IMAGES = set()
for route, fname in PAGES.items():
    html = get(route)
    save(fname, html)
    scan(html.decode("utf-8", "replace"))

# Next renders its own not-found page for unknown routes.
try:
    get("/__mirror-404__")
except urllib.error.HTTPError as e:
    save("404.html", e.read())

for p in ["/favicon.ico", "/robots.txt", "/sitemap.xml"]:
    enqueue(p)

failed = []
while queue:
    path = queue.pop()
    try:
        data = get(urllib.parse.quote(path))
    except Exception as e:  # noqa: BLE001
        failed.append((path, str(e)))
        continue
    save(path, data)
    if path.endswith((".js", ".css")):
        scan(data.decode("utf-8", "replace"))

# /_next/image?url=<encoded> is served by nginx from _img/<encoded>, a symlink
# to the original file (see the agenda server block).
for enc in sorted(IMAGES):
    target = urllib.parse.unquote(enc).lstrip("/")
    link = os.path.join(OUT, "_img", enc)
    os.makedirs(os.path.dirname(link), exist_ok=True)
    if not os.path.lexists(link):
        os.symlink(os.path.join("..", target), link)

print(f"fetched {len(seen) - len(failed)} assets, {len(IMAGES)} image aliases")
for p, e in failed:
    print("FAILED", p, e)
