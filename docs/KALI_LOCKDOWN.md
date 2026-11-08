# ids-lab — KALI_LOCKDOWN.md (manual checklist for Gg)

The agent runs nothing here. Everything below is done by hand on and around
the Kali VM. The examples are UNVERIFIED and may need adjusting to your
distro, hypervisor and firewall tool versions.

## 1. Hypervisor and NIC attachment

- Identify the hypervisor and how the VM's NIC is attached. hypervisor:
  unverified — candidates: VirtualBox, VMware, QEMU/libvirt; the relevant
  setting differs for each (promiscuous mode, bridged adapter, tap device).
- The VM's NIC must be attached ONLY to the lab bridge (no NAT, no bridge to
  the home router).
- Verify from inside the VM: a ping to an OUTSIDE address (for example
  1.1.1.1) FAILS; traffic inside 192.168.50.0/24 works.

## 2. Kali-side egress firewall (nftables) — example, unverified until Gg tests it

Purpose: drop all outbound traffic except to the allowed target IPs and SSH
replies to the host.

Example fragment (adjust to your nftables layout before loading):

```
table ip filter {
    chain output {
        type filter hook output priority filter; policy drop;
        ct state established,related accept
        ip daddr { 192.168.50.10, 192.168.50.1 } accept
    }
}
```

- Load with `sudo nft -f <file>`, inspect with `sudo nft list ruleset`, and add
  persistence in the way your distro normally does (make it explicit).
- Verification: from the VM, ping an outside address → must still FAIL; ping
  192.168.50.10 → works; an SSH session TO the VM still replies.

## 3. Root-owned allowlist on Kali (THE AUTHORITY)

- Suggested file: `/usr/local/etc/ids-attack-allowlist.yaml`
- Owner root:root, mode 0644 — the lab user must have NO write permission.
- Content mirrors tools/attack_policy.yaml intent: the allowed tools, the
  exact target literals, parameter caps and max durations. Maintained by hand.

## 4. Kali-side wrapper (root-owned)

- Suggested file: `/usr/local/sbin/ids-attack-wrap`, root-owned, not writable
  by the lab user.
- Re-validates tool, target and parameters against the allowlist and wraps
  every command in `timeout`; refuses otherwise.
- ids-runner prepares the SOURCE under `tools/root/` for you to review and
  install by hand.

## 5. Dedicated SSH key with a forced command

- Generate a key for the lab only; never store it in the repo.
- `authorized_keys` entry (example text — adjust):

```
command="/usr/local/sbin/ids-attack-wrap",restrict ssh-ed25519 AAAA... idslab-attack
```

- Test: with this key, an SSH login runs ONLY the wrapper; an interactive
  shell or any other command is refused.

## 6. Supervised first test

- A 10 second ICMP test to the ESP32 (192.168.50.10) only.
- Expected result: packets to .10 only, stops at about 10 s, no traffic
  outside the allowed targets, capture metadata records the run, and the run
  stops cleanly when the duration ends or the STOP file (tools/STOP) exists.
- Run it as the first real attack run of any session, with Gg watching.
