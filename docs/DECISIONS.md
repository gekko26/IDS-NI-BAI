# ids-lab — DECISIONS.md

Choices Gg makes, recorded with a date and marked DECIDED, OPEN or
RECOMMENDED-NOT-CONFIRMED. Read at the start of every session.

Last updated: 2026-11-08

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
- The Hydra target service.
- Whether to add a nuclei scan class and a crafted ICMPv6 packet class.
- The detection-rate definition.
- The hypervisor.
- The interface name.
- All numeric limits and caps.
- The maximum acceptable capture drop rate.
