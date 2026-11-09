# ids-lab — STATE.md

Working memory. Read this file and docs/DECISIONS.md at the start of every
session. Append a dated Log entry at the end of every task. Keep this file
under ~150 lines: merge old entries into a summary rather than deleting facts.

## Current state

- Study: "Development of a Low-Cost Edge AI-Based Zero-Trust Security Gateway
  for Enterprise IoT Networks Using Lightweight Machine Learning on Raspberry
  Pi" (small-scale IoT: schools and smart homes). Thesis study, not a product.
- Reference paper: Garalov and Elhajj (ISNCC 2023), a Raspberry Pi Snort IDS.
  This study is ML-only and detection-only; its measurements should be
  comparable with that paper's.
- Lab: gateway laptop (Arch Linux), external USB Wi-Fi adapter in AP mode,
  subnet 192.168.50.0/24 — gateway .1, ESP32 .10, Pi IDS .99, attacker .50.
- Attacker: Kali Linux VM on the same laptop. The working LAN comes from a
  previous study; its interface names, the hypervisor, and the VM's network
  attachment are UNVERIFIED.
- Pipeline: capture 96-byte headers, 2.0 s windows, 12 features (TBD,
  owner: Gg), 5 classes (benign, Hping3 DoS, Nmap scan, Hydra brute force,
  Ettercap ARP spoof), Random Forest (50 trees, depth 12), FastAPI + React
  dashboards.
- Metrics: accuracy, precision, recall, F1, FPR, latency, RAM, CPU, telemetry
  delivery ratio with the IDS off, plus the metrics the reference paper
  reports (response time, CPU, memory, packet drop rate, false positives, an
  external-style detection rate).
- Training first runs on the laptop with no Raspberry Pi. Pi measurements
  come later.
- Project setup state (2026-11-09 update): rules, docs, policies, opencode
  config and five subagents; plus Frontend/ and Backend/ (venv at
  Backend/.venv, Python 3.14.7), README.md and Backend/README.md, extended
  .gitignore; git remote origin = git@github.com:gekko26/IDS-NI-BAI.git,
  master pushed and tracking. App state by 2026-11-09: real auth
  (PBKDF2 + session tokens), detections endpoint + seeded samples, unit
  tests, designed dashboard; dev ports FastAPI 8000 / Vite 5173.
- Target deployment spec (2026-11-09, from Gg, design only — nothing run):
  one Raspberry Pi 4B 8GB is gateway + AP (hostapd) + bridge br0 (eth0 +
  wlan0) + capture point (libpcap/tcpdump on br0) + feature extraction
  (2.0 s windows, 12 features) + Random Forest inference + FastAPI bound to
  127.0.0.1 behind Nginx, which serves the built React dashboard and
  forwards /api; SQLite with WAL stores detections, Snort alerts,
  telemetry, network stats and historical logs. Raspberry Pi OS Lite
  64-bit, headless over SSH (Ed25519), dnsmasq for DHCP/DNS, systemd for
  deployment. Dev and training stay on the Arch laptop (Vim, tmux during
  dev, rsync/Git over SSH). Snort 2.9 is comparison baseline only; alerts
  imported into SQLite by a parser script. Wi-Fi clients: ESP32, IP camera,
  laptop hosting the Kali VM. Open spec questions (Pi IP, Snort host,
  USB-adapter AP retirement) live in Unverified/OPEN.

## Verified

(2026-11-08) opencode v2.2.5 (`opencode --version`); git repo rooted at
/home/whou/NEW_CAPSTONE (commits 31da9c4, c28c774); all five subagents
load — `opencode debug agents` lists ids-attack, ids-datacheck,
ids-extract, ids-runner, ids-sniff from the SINGULAR .opencode/agent/
folder; opencode.json is a loaded config source (`opencode debug
config`); AGENTS.md is loaded as project instructions. Deny enforcement
was probed live in subagent sessions (verbatim refusals in the 2026-11-08
log entry). Nothing outside the project changed: sha256 of the old
CAPSTONE/.opencode/agent/*.md identical before/after; home-wide untracked
list unchanged except NEW_CAPSTONE/ appearing.

## Unverified

- LAN interface names (no `ip` command run; forbidden in agent setup)
- the subnet actually in use
- the hypervisor
- how the Kali VM's NIC is attached
- whether the VM's egress firewall works
- the Arch capture setup
- whether the sudoers rule is tight
- whether Wi-Fi-to-Wi-Fi traffic (ESP32 to camera) reaches the bridge
- the Pi's IP in 192.168.50.0/24 (spec: Pi is gateway/AP; old notes: Pi .99,
  gateway .1 = laptop) — raised 2026-11-09
- which host runs Snort 2.9 in the deployment (Pi or laptop)
- whether the allowed-to-attack "gateway (192.168.50.1)" target becomes the
  Pi itself once it is the gateway (collides with the Pi-excluded note)
- everything in the 2026-11-09 deployment spec (design only, nothing run
  yet)

## Log

(2026-11-08) Setup session. Created AGENTS.md, docs/*, tools/*.yaml,
.opencode/agent/{ids-extract,ids-runner,ids-datacheck,ids-attack,
ids-sniff}.md, opencode.json, .gitignore; git init + commits 31da9c4,
c28c774. Verified: opencode v2.2.5; repo root; 5 agents load (SINGULAR
.opencode/agent/ folder); AGENTS.md + opencode.json loaded; deny
enforcement probed live — shell/edit denials as
{"error":{"type":"permission.rejected",…}}; after probes the five agents
also deny execute, webfetch, websearch, skill, image-generate and the
four opencode session/worktree actions. Nothing outside the project
changed (sha256 diff + home-repo untracked list). Still unverified: the
eight lab-environment items listed in Unverified.
Next step (user, by hand): docs/HOST_SETUP.md, then docs/CAPTURE_SETUP.md,
then docs/KALI_LOCKDOWN.md. Next step (agents): none yet — do not start
application code until the 12 features are decided (owner Gg).

(2026-11-09) Context + setup sessions. Recorded Gg's deployment spec (Pi
4B 8GB = gateway/AP/bridge/capture/inference; FastAPI on 127.0.0.1 behind
Nginx; React; SQLite WAL; Snort 2.9 baseline-only; training laptop-only).
Created Frontend/ + Backend/, backend venv Backend/.venv (Python 3.14.7),
README.md, Backend/README.md, extended .gitignore, remote origin
git@github.com:gekko26/IDS-NI-BAI.git (master pushed, tracking). Verified:
push → new branch + tracking; venv python --version. Unresolved: Pi's IP,
Snort host, gateway-target collision. Next: Gg decides the 12 features.

(2026-11-09) App task 1 (Gg): Vite+React scaffold, first login page, and
the backend/db smoke test (Backend/app/{__init__,db,main}.py,
requirements.txt = fastapi 0.162.2 + uvicorn 0.54.0, npm 62 pkgs).
Verified then (outputs pasted in replies): build ok, /api/health ok,
WAL + roundtrip + persistence, /api proxy ok. Vite binds localhost/::1 —
use localhost, not 127.0.0.1. Superseded detail lives in earlier commits.

(2026-11-09) App task 2 ("go"): real auth + detections. New:
app/security.py (PBKDF2-SHA256 600k, stdlib; dummy-verify for unknown
users), app/routers/{auth,detections}.py, users+sessions tables,
detections list/summary endpoint; scripts/create_user.py (bootstrapped
admin once) + seed_samples.py (10 rows source='sample');
tests/test_{security,db}.py (9 tests). Frontend: real login flow
(localStorage token, boot via /api/me, logout API call) and a summary +
recent-table dashboard. Bug found+fixed: missing get_connection import
(500). Verified (pasted in replies): unittest 9/9 OK; curl suite —
wrong-password 401, login 200, me 200, no-token 401, token summary of 10
rows, logout then 401; npm build ok.
Unverified: browser rendering of auth (no browser). Open: rate limiting,
token transport, HTTPS-with-Nginx. Next: real detector after 12 features.

(2026-11-09) App task 3 (Gg): visual redesign — "smooth, animated, not
template-looking". Changed (frontend only, zero new npm deps): split
login with dark animated brand panel (drifting dotted grid, self-drawing
shield, SVG network graph with SMIL animateMotion packets, floating
mark), floating-label fields with leading icons + password eye toggle,
sheen/lift/nudge buttons, shake error, ping API pill; dashboard gets
sticky topbar with live pill + avatar, count-up stat tiles with hover
lift and accent top-line, class-distribution grow-bars, staggered row
entrances, spin-refresh + "updated Ns ago" 10 s auto-poll. Files: new
src/components/{Icons,BrandPanel}.jsx, src/hooks/useCountUp.js; rewrote
Login.jsx, Dashboard.jsx, styles.css; index.html favicon/theme-color.
Verified: `npm run build` → 36 modules, 158 kB JS / 13.7 kB CSS ok; dev
server still serves /api/health through the proxy (pasted curl). DB/
backend untouched. Unverified: actual browser rendering (no browser
here) — including SMIL motion and reduced-motion behaviour. Next: Gg
looks at localhost:5173 and says what to tweak; detector still gated on
the 12 features.

## Next tasks (do not do now)

For ids-runner: implement runner.py and capture.py with a --dry-run mode, the
IPv4-literal-only target check, parameter range checks, `timeout`, the
STOP-file check, free-disk check, a manifest row with a success flag,
drop-statistics metadata, and the source of both wrappers under tools/root/,
with tests that PROVE refusal of: an outside IP such as 8.8.8.8,
192.168.50.99, 192.168.50.50, a CIDR, a hostname, an out-of-range rate, a
disabled attack type, another interface, a path outside data/raw/, a path
containing "..", an existing output file, a snaplen other than 96, a duration
over the limit, and a start when free disk is below the minimum.
