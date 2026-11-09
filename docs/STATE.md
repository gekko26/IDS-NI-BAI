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
- Conflicts with the older 2026-11-08 lab notes (unresolved): AP role moves
  from the laptop's USB adapter to the Pi's wlan0; the Pi's IP is unstated
  (old notes: Pi .99, gateway .1 = laptop); the host that runs Snort is
  unstated.

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

(2026-11-09) Context session. Changed: recorded Gg's full system summary
into STATE (Current state + Unverified) and DECISIONS; nothing else — no
code, data, policies or network settings touched. Verified: nothing new
this session. Unresolved: Pi's IP, Snort host, gateway-target collision
(see Unverified list) — Gg to confirm. Next step (agents): unchanged; the
12 features remain the gating item.

(2026-11-09) Setup task on Gg's request. Changed: created Frontend/ and
Backend/, backend venv at Backend/.venv (`python -m venv`, Python 3.14.7,
pip 26.2.1, nothing installed), top-level README.md, Frontend/.gitkeep,
Backend/README.md, .gitignore extended (app-code block: venv/, *.py[cod],
.env, *.db, *.sqlite3, *.db-wal, *.db-shm, *.joblib, node_modules/, dist/,
build/, .vite/). Git already initialized from 2026-11-08, so no re-init;
added remote origin git@github.com:gekko26/IDS-NI-BAI.git and pushed.
Verified: `git push -u origin master` → "[new branch] master -> master,
upstream set"; `Backend/.venv/bin/python --version` → Python 3.14.7;
staged list showed only the new files plus the docs edits, data/ excluded.
Unverified: nothing new. Next step: Gg to decide the 12 features, then
backend/frontend scaffolding in the dirs.

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
