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
- Project setup state (2026-11-08): rules, docs, policies, opencode project
  config and five subagents created; no application code yet.

## Verified

(none yet — an entry goes here only with the command that produced it)

## Unverified

- LAN interface names (no `ip` command run; forbidden in agent setup)
- the subnet actually in use
- the hypervisor
- how the Kali VM's NIC is attached
- whether the VM's egress firewall works
- the Arch capture setup
- whether the sudoers rule is tight
- whether Wi-Fi-to-Wi-Fi traffic (ESP32 to camera) reaches the bridge

## Log

(none yet)

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
