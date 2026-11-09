# ids-lab — DECISIONS.md

Choices Gg makes, recorded with a date and marked DECIDED, OPEN or
RECOMMENDED-NOT-CONFIRMED. Read at the start of every session.

Last updated: 2026-11-09

## DECIDED

(2026-11-08) Five attack classes: benign, Hping3 DoS, Nmap scan, Hydra brute
force, Ettercap ARP spoof.
(2026-11-08) 2.0 s windows.
(2026-11-08) 96-byte packet headers captured.
(2026-11-08) Random Forest with 50 trees, depth 12.
(2026-11-08) Training first runs on the laptop, with no Raspberry Pi.
(2026-11-08) The attacker is a Kali Linux VM.
(2026-11-08) Attack runs go: runner.py -> SSH forced command -> root-owned
allowlist on the VM.
(2026-11-08) Captures go: capture.py -> exact sudo rule -> root-owned wrapper.
(2026-11-08) ids-attack and ids-sniff are executors with no edit permission.
(2026-11-08) Allowed attack targets are the ESP32 (192.168.50.10) and the
gateway (192.168.50.1).
(2026-11-08) Ettercap is manual, in separate clearly labeled sessions.
(2026-11-08) Project instruction file is AGENTS.md at the project root
(verified loaded); project config is opencode.json with an
external_directory=ask permission (verified loaded via `opencode debug
config`).
(2026-11-08) Subagent files use native V2 frontmatter (ordered `permissions`
action/resource/effect list; Markdown body as system prompt) in the singular
folder .opencode/agent/ — folder name confirmed empirically with
`opencode debug agents`. This differs from the older V1-style files in other
projects, which remain untouched.
(2026-11-08) The five agents also deny execute (Code Mode), webfetch,
websearch, skill, experimental_image_generate and the four opencode
session/worktree actions, after probes showed those tools were otherwise
reachable under the default allow-all. Gg may relax this by editing the five
agent files.
(2026-11-08) Version control initialized inside the project (git init, root
commit 31da9c4). data/ is .gitignored, so data/raw/.gitkeep and
data/processed/.gitkeep exist on disk but are not committed.
(2026-11-09, from Gg's system summary) Target architecture: a single
Raspberry Pi 4B 8GB is the gateway, AP (hostapd), bridge br0 (eth0+wlan0),
capture point (libpcap/tcpdump on br0), feature extractor (2.0 s windows,
12 features) and Random Forest inference host; FastAPI binds 127.0.0.1
behind Nginx — only Nginx is network-exposed — serving the built React
dashboard and forwarding /api; SQLite with WAL stores detections, Snort
alerts, telemetry, network stats and historical logs.
(2026-11-09) Raspberry Pi OS Lite 64-bit, headless via SSH Ed25519;
dnsmasq provides DHCP and DNS; deployment under systemd; development on
the Arch laptop (Vim, tmux during dev, rsync or Git over SSH).
(2026-11-09) Training happens only on the laptop; the Pi performs
inference only.
(2026-11-09) Snort 2.9 is a standalone comparison baseline, not part of
the IDS pipeline; a parser script imports its alerts into SQLite.
(2026-11-09, app task) Frontend is a manual Vite + React 18 scaffold with
a 5-token palette (bg #f6f8fa, surface #fff, border #e5e7eb, text
#111827, single blue accent #2563eb; green/red only as status colours) —
chosen by me per Gg's "minimalist, few colours" request. Dev proxy
/api → 127.0.0.1:8000 mirrors the production Nginx routing; no CORS layer.
(2026-11-09, app task) Login is a client-side placeholder for now: any
non-empty username/password signs in and shows the scaffold dashboard;
real authentication (user accounts + hashed passwords) is OPEN.
(2026-11-09, "go" task — supersedes the placeholder above) Authentication
is real: PBKDF2-HMAC-SHA256 (600k iterations, stdlib only, stored as
pbkdf2_sha256$iters$salt$hash), sessions are 64-hex tokens in a sessions
table (7-day TTL) sent as Authorization: Bearer; unknown usernames get a
timing-equaliser dummy verify. Dev bootstrap user admin/"changeme123"
exists only in the local gitignored DB — change it any time with
`cd Backend && .venv/bin/python -m scripts.create_user <user>`.
(2026-11-09, "go" task) Detections schema is feature-agnostic: the 12
feature values live in features_json until the feature list is decided;
classes stored as benign/dos/scan/brute_force/arp_spoof. Dashboard sample
rows are tagged source='sample' (seed only via
`Backend/.venv/bin/python -m scripts.seed_samples`). Unit tests run from
Backend/ (`-m unittest discover -s ../tests -t ..`) because the app
package lives under Backend/.
(2026-11-09, "design" task) Frontend design language, chosen by me per
Gg's "smooth, clean, many animations, icons, not template-looking":
split-screen login (dark ink panel #0b1322 + light form), ink side gets
ambient motion (grid drift, packet network via SMIL, self-drawing
shield), light side gets staggered choreographed entrances; one blue
accent, red only for attacks/errors, green only for live/online status.
All motion is CSS/SVG — no animation libraries; particles are semantic
(packet flow matches the IDS story). Reduced-motion respected via
@media (prefers-reduced-motion: reduce). Bundle stays single-Vite-build
without routing/icon/chart libs.
(2026-11-09, "post-signin" task) The dashboard renders only real backend
numbers — /api/detections and the new read-only /api/system. No mock
data anywhere: the sparkline buckets are per-minute counts of returned
windows, and the "threats / all clear" narrative is derived solely from
predicted_class. The old /api/db/status stays a smoke test (it writes a
row) and is never polled by the UI.
(2026-11-09, "dark" task) The whole app is dark-themed, per Gg ("too
white"): ink families with a brightened accent (#3f7dff), translucent
elevation layers (gradient + inset hairline + deep shadow), aurora
glows, glass topbar. Palette discipline unchanged: one blue accent,
red only for threats, mint only for live/healthy.
(2026-11-09, "typography" task) Type system: Inter Variable (UI) +
JetBrains Mono Variable (timestamps, numeric readouts), both self-hosted
from npm (@fontsource-variable/*) so the lab needs no CDN at runtime.
Rules: optical-sizing auto, tnum everywhere numbers tick, balanced
headings with negative tracking, pretty-wrapped prose, soft weight
ladder (580–680).
(2026-11-09, app task) Backend: FastAPI 0.162.2 + Uvicorn 0.54.0 inside
Backend/.venv (requirements.txt = pip freeze); SQLite via stdlib sqlite3
(no ORM) in Backend/app/db.py, dev DB file Backend/data/app.db
(gitignored); dev ports: FastAPI 8000, Vite 5173 (binds localhost, not
127.0.0.1).
(2026-11-09, setup task) Frontend/ and Backend/ dirs created as written by
Gg (capitalized); the backend venv lives at Backend/.venv (matches the
existing `.venv/` ignore rule; `venv/` now also ignored), made with system
Python 3.14.7 — no packages installed yet. GitHub remote origin =
git@github.com:gekko26/IDS-NI-BAI.git; branch master pushed as the first
sync (only the repo's own docs/code, data/ stays excluded by .gitignore).

## RECOMMENDED-NOT-CONFIRMED

(2026-11-08) Split train and test by run_id instead of an 80/20 random
stratified window split — consecutive windows from one run are near-duplicates
and would inflate accuracy.
(2026-11-08) A dedicated unprivileged user (idslab) runs opencode.
(2026-11-08) Capture on the bridge with no capture filter.
(2026-11-08) Benign captured in timed blocks with condition tags.
(2026-11-08) The first real attack run is a supervised 10 second ICMP test.
(2026-11-08) The Pi IDS (192.168.50.99) is excluded from attack targets.

## OPEN

- The 12 features (owner: Gg).
- The Pi's IP in 192.168.50.0/24 (spec makes the Pi the gateway; old notes
  say Pi .99 with the laptop as .1) — raised 2026-11-09.
- Which host runs Snort 2.9 in the deployment (Pi or laptop).
- Whether the allowed-to-attack "gateway (192.168.50.1)" target becomes the
  Pi itself in the new architecture — conflicts with the Pi-excluded note.
- Whether the laptop's USB Wi-Fi AP setup is retired by the Pi-as-AP spec.
- The Hydra target service.
- Whether to add a nuclei scan class and a crafted ICMPv6 packet class.
- The detection-rate definition.
- The hypervisor.
- The interface name.
- All numeric limits and caps.
- The maximum acceptable capture drop rate.
