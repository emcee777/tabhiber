# tools/ — build-time helpers

These scripts are **NOT shipped** in the extension zip. They produce
artifacts that live under `src/`, and they exist so the entire icon
pipeline is grep-verifiable and reproducible from this repo with no
network egress, no CDN icons, no closed-source assets.

## gen-icons.py

Deterministic icon generator. Produces `src/icons/icon{16,48,128}.png`
from a single Pillow drawing routine.

Motif: deep-indigo rounded-square (night), pale crescent moon (hibernate),
warm coral bookmark ribbon with V-cut (save / local-storage). Chosen to
visually communicate "tabs + sleep + local-storage" while remaining
distinct from OneTab and Session-Buddy.

### Run

Preferred (no global install, uses uv for an ephemeral Pillow):

```bash
uv run --with Pillow python3 tools/gen-icons.py
```

Or with a project-local virtualenv:

```bash
python3 -m venv .venv
.venv/bin/pip install Pillow
.venv/bin/python tools/gen-icons.py
```

### Determinism

Running twice produces byte-identical PNGs. The script writes with
`optimize=True, compress_level=9` and no timestamp/metadata fields, so
the SHA-256 of each output file is a function of the source code alone.

### Why Pillow and not ImageMagick

- One language, one file, no shell quoting.
- No system package needed — `uv run --with Pillow` is self-contained.
- The drawing primitives (rounded rect, ellipse, polygon) are enough for
  this motif; no SVG path math required.

If a future flame wants SVG-source instead, replace this script with
`src/icons/icon.svg` plus a `magick convert` invocation documented here.
The runtime extension does not care — `manifest.json` only references
the PNGs.
