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
  config and five subagents; plus Frontend/ (empty, .gitkeep) and Backend/
  with a working Python venv at Backend/.venv (Python 3.14.7, pip 26.2.1);
  README.md and an extended .gitignore; git remote origin =
  git@github.com:gekko26/IDS-NI-BAI.git, master pushed and tracking.
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
  laptop hosting the Kali VM.
  The laptop USB
  adapter-vs-Pi-AP question, the Pi's IP (old notes: Pi .99, gateway
  .1 = laptop) and the Snort host are open — see Unverified.

## Verified

(2026-11-08) opencode v2.2.5 present: `opencode --version`.
(2026-11-08) Git repo scoped to the project: `git rev-parse --show-toplevel`
→ /home/whou/NEW_CAPSTONE (root commit 31da9c4).
(2026-11-08) The five subagents load from .opencode/agent/ (SINGULAR folder;
this version confirmed on it via `opencode debug agents`, which lists
ids-attack, ids-datacheck, ids-extract, ids-runner, ids-sniff, all
mode: subagent, with their permission lists).
(2026-11-08) Project opencode.json is a loaded config source:
`opencode debug config` shows /home/whou/NEW_CAPSTONE/opencode.json.
(2026-11-08) AGENTS.md is loaded as project instructions (harness surfaced it
right after the file was written).
(2026-11-08) Deny enforcement probed in real subagent sessions — verbatim
refusals in the Log entry below.
(2026-11-08) Nothing outside the project changed: sha256 of
/home/whou/CAPSTONE/.opencode/agent/*.md identical before/after (mechanical
diff result: "Files ... are identical"); the home-wide repo's untracked list
is unchanged except NEW_CAPSTONE/ itself appearing.

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

(2026-11-08) Setup session. Changed: created AGENTS.md, docs/{STATE,
DECISIONS,HOST_SETUP,CAPTURE_SETUP,KALI_LOCKDOWN}.md, tools/{attack_policy,
capture_policy}.yaml, .opencode/agent/{ids-extract,ids-runner,ids-datacheck,
ids-attack,ids-sniff}.md, opencode.json, .gitignore and seven .gitkeep files;
git init + root commit 31da9c4, later commits reflect agent hardening and this
log. Verified: everything in the Verified section above. Enforcement probe
verbatim refusals: `sudo -n true` and `ssh -V` in ids-runner, ids-attack,
ids-sniff sessions each returned
{"error":{"type":"permission.rejected","message":"Permission denied: shell"}};
ids-runner's edit attempt on docs/STATE.md returned the edit variant of the
same error; for ids-attack and ids-sniff the edit denial is enforced
structurally (their toolset contains no edit/write tool, agent-quoted in the
probe transcript). After the probes, all five agents additionally deny
execute (Code Mode), webfetch, websearch, skill, experimental_image_generate
and the four opencode session/worktree actions; `opencode debug agents`
re-checked live: 5 agents, all new denies present.
Still unverified: the eight lab-environment items listed above.
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

(2026-11-09) App task 1 (Gg): Vite+React login page in Frontend/ and a
FastAPI+SQLite smoke test in Backend/. New: Frontend package.json,
vite.config.js (/api → 127.0.0.1:8000 dev proxy mirroring the Nginx plan),
index.html, src/{main,App}.jsx, src/pages/{Login,Dashboard}.jsx and a
5-token palette styles.css; Backend/app/{__init__,db,main}.py with
/api/health and /api/db/status (stdlib sqlite3, WAL, telemetry table);
Backend/requirements.txt (pip freeze: fastapi 0.162.2, uvicorn 0.54.0);
npm install 62 pkgs; Frontend/.gitkeep removed. Verified (outputs pasted
in reply): `npm run build` = 33 modules ok; GET 127.0.0.1:8000/api/health
= ok; /api/db/status → journal_mode wal, roundtrip_ok true, rows_total
1→2 (persists); via Vite proxy localhost:5173/api/health = ok; localhost:
5173/ serves the app HTML. Vite binds localhost/::1, not 127.0.0.1 — use
localhost. Unverified: browser rendering (no browser here) — build and
dev-server responses only. OPEN: real authentication (placeholder accepts
any non-empty credentials). Next: real auth, then the detections schema
once the 12 features are decided.

(2026-11-09) App task 2 ("go"): real auth + dashboard detections. New:
app/security.py (PBKDF2-SHA256 600k stdlib; dummy-verify for unknown
users), app/routers/{auth,detections}.py, users+sessions tables +
detections list/summary endpoint in app/db.py; scripts/create_user.py
(bootstrapped admin once) and scripts.seed_samples.py (10 rows, source=
sample); tests/test_{security,db}.py: 9 unittest tests. Frontend login
POSTs /api/login, keeps a localStorage token, boots via /api/me, logs
out via /api/logout; dashboard shows summary tiles + a recent-table.
Bug found+fixed: missing get_connection import in detections.py (500 →
traceback). Verified (pasted): unittest 9/9 OK; curl: wrong password
401, login 200+token, me 200, detections-no-token 401, detections-
with-token = summary of 10 rows, logout→401; npm run build ok.
Unverified: browser rendering of auth (no browser). Open: rate limiting,
token transport, HTTPS-with-Nginx. Next: real detector after 12 features.

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
