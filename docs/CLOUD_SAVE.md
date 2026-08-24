# Yandex Cloud Save v0.1

## Model
The game remains local-first. `localStorage` is still the immediate gameplay persistence layer; Yandex Player data mirrors the normalized v1 save for cross-device recovery.

Cloud key: `auctionHunterSaveV1`.

Envelope:
- cloud schema version;
- normalized `PlayerSave`;
- local `updatedAt` timestamp used for startup conflict resolution.

## Startup sync
Before Phaser scenes are created:
1. initialize the Yandex SDK;
2. obtain the Player object once;
3. read the cloud save with `player.getData()`;
4. compare local and cloud `updatedAt` values;
5. restore the newer save locally, or upload the local save when it is newer/missing in cloud;
6. when legacy saves have the same zero timestamp, prefer the save with stronger progression rather than blindly overwriting it.

If Player initialization or cloud reading fails, startup continues with local progress.

## Write policy
Every gameplay mutation still writes local state immediately. Cloud writes are coalesced with a four-second interval, keeping normal play comfortably under the current Yandex `setData()` request limit. Pending progress is flushed when the document becomes hidden or receives `pagehide`.

Cloud uploads are serialized. If a flush is already in flight, a later flush waits for it before taking the newest pending save. This prevents an older `setData()` request from completing after a newer one and rolling cloud progress backward because of network timing.

A failed cloud upload does not roll back local progress. The newest failed save remains queued for the next flush opportunity in the same session; if newer progress was queued while the failed upload was in flight, the newer pending save wins.

## Compatibility
`updatedAt` is additive to save version 1. Existing v1 saves normalize with `updatedAt = 0` and retain cash, collection and progression.

## Conflict policy
v0.1 uses last-write-wins by `updatedAt`. Equal timestamps fall back to a progression score. This is intentionally simple for a single-player game; a future backend-authoritative economy would require server revisions rather than trusting client clocks.

## SDK constraints considered
- Player data uses `ysdk.getPlayer()` plus `player.getData()` / `player.setData()`.
- Player data limit is far above the current save size.
- Cloud requests are rate-limited, so writes are batched instead of sent on every mutation.
- In-session uploads are ordered so request completion order cannot reverse save chronology.
