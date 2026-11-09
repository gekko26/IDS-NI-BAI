# IDS-NI-BAI — Raspberry Pi Intrusion Detection System (study in progress)

A machine-learning IDS for small IoT networks, centered on a Raspberry Pi 4
(8 GB) that acts as the network gateway, Wi-Fi access point, bridge, packet
capture point, feature extractor, ML inference server and dashboard host.

## System at a glance

- **Platform** — Raspberry Pi 4 Model B (8 GB), Raspberry Pi OS Lite 64-bit,
  headless (remote administration via SSH with Ed25519 keys).
- **Network** — `br0` bridges `eth0` (uplink or a wired IoT device) and
  `wlan0` (hostapd access point, so wired and wireless devices share one
  subnet and one capture point). `dnsmasq` provides DHCP and DNS.
- **Capture** — tcpdump/libpcap on `br0`; 96-byte packet headers grouped into
  2.0 s windows.
- **Detection** — 12 statistical/protocol features per window feed a Random
  Forest classifier (scikit-learn). Training happens on the development
  laptop; the Pi performs inference only.
- **Web stack** — FastAPI bound to `127.0.0.1` behind Nginx, which serves the
  production React dashboard and forwards `/api` requests. Only Nginx is
  exposed to the network.
- **Storage** — a single SQLite database in WAL mode holding ML detections,
  Snort alerts, telemetry, network statistics and historical logs.
- **Baseline** — Snort 2.9 runs as an independent comparison baseline and its
  alerts are imported into SQLite by a parser script; it is not part of the
  deployed IDS pipeline.
- **Roles** — laptop: development, training, experiment control; Kali Linux
  VM: controlled attack traffic; IoT devices (ESP32, IP camera): normal
  operational traffic.

## Repository layout

```
Frontend/  React dashboard (compiled to static files served by Nginx)
Backend/   FastAPI + capture, feature extraction and inference services
           (Python virtual environment lives in Backend/.venv, gitignored)
docs/      Project state, decisions, host/capture/Kali setup guides
tools/     Attack and capture policy definitions
data/      Captures, datasets, models — gitignored, never committed
```

## Development setup

### Backend (Python)

```bash
cd Backend
python -m venv .venv
source .venv/bin/activate
```

The venv ships with the system Python (3.14). Dependencies will be pinned in
`Backend/requirements.txt` as code lands.

### Frontend (React)

Scaffold pending — will be initialized with Vite/ESLint and built to static
files for Nginx.

## Status

Early scaffold. In-progress, verified, and unverified items are tracked in
`docs/STATE.md`; design choices in `docs/DECISIONS.md`.
