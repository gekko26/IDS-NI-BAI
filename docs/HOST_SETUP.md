# ids-lab — HOST_SETUP.md (manual checklist for Gg)

The agent runs nothing here. Every command below is for Gg to run by hand on
the Arch gateway laptop. Arch-specific details are marked "unverified, check
against the package notes" until confirmed.

## 1. Dedicated unprivileged user

Goal: a user (for example `idslab`) that owns only the project directory and
runs opencode. No sudo except the single rule from docs/CAPTURE_SETUP.md
step 3.

- Create it (adjust to taste — manual step):
  `sudo useradd -m -s /bin/bash idslab`
- Give it NO group memberships beyond its own group. Explicitly NOT:
  `wireshark` (this project must not rely on the wireshark group for capture),
  `wheel` (sudo), `docker`, `uucp`.
- Decide whether opencode should run as `idslab` for this project, and whether
  the project directory should be chowned to it, e.g.:
  `sudo chown -R idslab: /home/whou/NEW_CAPSTONE`
  (RECOMMENDED-NOT-CONFIRMED in docs/DECISIONS.md — decide first.)
- Verify:
  - `id idslab` — expected: no extra groups.
  - `sudo -l -U idslab` — expected: no privileges until the one capture rule
    from docs/CAPTURE_SETUP.md step 3 exists.

## 2. Home isolation

- `ls -ld /home/whou` — expected: `drwx------` (not world- or group-readable).
- `ls -ld /home/whou/.ssh` — expected: readable only by you.
- As the lab user: `ls /home/whou` and `ls /home/whou/.ssh` — expected:
  permission denied. If either succeeds, fix permissions by hand and re-check.

## 3. Interfaces

- `ip -br link` — note the uplink interfaces and the lab bridge.
- The capture allowlist in tools/capture_policy.yaml must name ONLY the lab
  bridge. It currently says `br0` — UNVERIFIED; confirm the real name here and
  update the policy file BY HAND if different.

## 4. Arch-specific details

- unverified, check against the package notes: exact pacman package names,
  optional dependencies, and any file capabilities set on dumpcap by the
  package.
