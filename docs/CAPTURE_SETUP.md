# ids-lab — CAPTURE_SETUP.md (manual checklist for Gg)

The agent runs nothing here. Work through the steps in order. Items marked
"unverified until Gg tests it" are design intent, not tested claims.

## 1. Install capture tools (manual)

- `sudo pacman -S wireshark-cli` — provides dumpcap, capinfos, tshark.
- Do NOT add any user to the wireshark group for this project: the wrapper
  design below deliberately does not rely on group capture privileges.

## 2. Wrapper design to implement (unverified until Gg tests it)

Location: `/usr/local/sbin/ids-capture-wrap`

- root-owned, in a root-owned directory not writable by the project user.
- absolute paths only inside; no free-form flags.
- accepts ONLY three inputs: a run_id, a duration, and an output filename.
- FIXES everything else:
  - interface: `br0` (until step 5 confirms the real bridge name)
  - snaplen: `96`
  - output directory: this project's `data/raw/` as an absolute path
- REFUSES: path separators and ".." inside the filename, symlinks under the
  output directory, overwrites of existing files, durations above
  `max_duration_s`, output above `max_file_size_mb`, and starts when free disk
  is below `min_free_disk_gb`.
- Runs dumpcap with those fixed values and writes dumpcap's dropped-packet
  statistics to a JSON sidecar next to the pcap.
- ids-runner prepares the SOURCE for this under `tools/root/` for you to
  review and install by hand. Nothing is installed by an agent.

## 3. One sudoers rule (manual)

- Allow the dedicated user to run exactly that wrapper with no wildcards in
  the arguments. The wrapper itself validates every argument, so the sudoers
  rule must pin only the binary (this is why the wrapper is the sole gate).
- Example line (TEXT ONLY — adjust and validate):
  `idslab ALL=(root) NOPASSWD: /usr/local/sbin/ids-capture-wrap`
- Validate the resulting configuration: `sudo visudo -c`.
- Tightness of this rule is not verified until docs/STATE.md says so.

## 4. Refusal tests (run by hand)

Each must exit non-zero with a clear reason and write nothing:
- another interface name
- an output path outside data/raw/
- a path containing ".."
- an existing output file (overwrite attempt)
- a duration over the limit
- a symlink inside the output directory

## 5. Confirm the real bridge name

- `ip -br link` — find the bridge carrying the AP.
- Update `interface_allowlist` in tools/capture_policy.yaml BY HAND.

## 6. First test capture (scratch, outside git)

- 5 second capture to a scratch file outside the repo, e.g. /var/tmp/.
- Verify: `capinfos <scratch>.pcap` and `tshark -r <scratch>.pcap -c 5`
  (reading a file; no live interface).

## 7. Visibility checks

- While pinging from the Kali VM to the ESP32 and to the gateway, confirm
  packets from BOTH appear in a short capture.
- Then check whether ESP32-to-camera traffic (both on Wi-Fi) appears on the
  bridge. If it does NOT, record it as a limitation in docs/STATE.md.

## 8. Drop-rate check

- A short LOW-RATE test from the Kali VM; confirm the drop statistic is zero
  before any flood. No flood is run in this checklist.

## 9. Disk headroom

- `df -h` — decide `min_free_disk_gb` from what you see and set it in
  tools/capture_policy.yaml.
