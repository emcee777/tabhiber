#!/usr/bin/env python3
"""
gen-icons.py — deterministic icon generator for TabHiber.

Motif: indigo rounded-square background (night), pale crescent moon
(hibernate), warm bookmark ribbon with V-cut (save / local-storage).

Build-time only. NOT shipped in the extension zip. Pillow is a build-time
dependency only — there is no runtime Python or PIL anywhere in the
extension. Running this script twice produces byte-identical PNGs.

Usage:
    uv run --with Pillow python3 tools/gen-icons.py
or:
    pip install Pillow && python3 tools/gen-icons.py

Outputs src/icons/icon{16,48,128}.png at 8-bit RGBA, non-interlaced.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw

# Render at 4x of the largest target, then LANCZOS-resample to each size.
# This keeps small-size icons sharp without per-size hand-tuning.
SUPER = 512
SIZES = (16, 48, 128)

# Palette — deliberately limited.
BG       = (35, 41, 70, 255)      # deep indigo (night)
BG_EDGE  = (24, 28, 50, 255)      # darker rim
MOON     = (248, 234, 196, 255)   # warm cream
RIBBON   = (224, 92, 86, 255)     # coral red
RIBBON_S = (170, 60, 56, 255)     # ribbon shadow side

OUT_DIR = Path(__file__).resolve().parent.parent / "src" / "icons"


def draw_master(size: int) -> Image.Image:
    """Draw the master icon at `size` px (square, RGBA)."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # --- Rounded-square background --------------------------------------
    radius = int(size * 0.22)
    # Slight rim for depth: draw a 2px-larger darker rect underneath.
    rim = max(2, size // 96)
    d.rounded_rectangle(
        (0, 0, size - 1, size - 1),
        radius=radius,
        fill=BG_EDGE,
    )
    d.rounded_rectangle(
        (rim, rim, size - 1 - rim, size - 1 - rim),
        radius=radius - rim,
        fill=BG,
    )

    # --- Crescent moon --------------------------------------------------
    # Full disc, then subtract an offset disc to carve the crescent.
    # Center the moon in the upper-left third.
    moon_cx = int(size * 0.42)
    moon_cy = int(size * 0.42)
    moon_r  = int(size * 0.26)
    bbox = (moon_cx - moon_r, moon_cy - moon_r,
            moon_cx + moon_r, moon_cy + moon_r)
    d.ellipse(bbox, fill=MOON)

    # Carve: same-size disc, offset to upper-right. Use transparent paste
    # via a mask so we punch a hole through MOON back to the BG colour.
    carve_cx = moon_cx + int(moon_r * 0.55)
    carve_cy = moon_cy - int(moon_r * 0.15)
    carve_bbox = (carve_cx - moon_r, carve_cy - moon_r,
                  carve_cx + moon_r, carve_cy + moon_r)
    # Build a mask just for the carve, then composite BG colour through it.
    carve = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cd = ImageDraw.Draw(carve)
    cd.ellipse(carve_bbox, fill=BG)
    # Limit the carve to where the moon currently is, so we don't paint
    # BG outside the moon disc (which would leak onto the bookmark/bg).
    moon_only = Image.new("L", (size, size), 0)
    ImageDraw.Draw(moon_only).ellipse(bbox, fill=255)
    img.paste(carve, (0, 0), moon_only)

    # --- Bookmark ribbon ------------------------------------------------
    # Vertical strip on the lower-right with a V-cut at the bottom.
    rb_w  = int(size * 0.28)
    rb_x0 = int(size * 0.58)
    rb_x1 = rb_x0 + rb_w
    rb_y0 = int(size * 0.34)
    rb_y1 = int(size * 0.92)
    rb_mid = rb_x0 + rb_w // 2
    notch = int(rb_w * 0.42)  # depth of the V-cut

    # Front face (full ribbon polygon with V-cut).
    ribbon_poly = [
        (rb_x0, rb_y0),
        (rb_x1, rb_y0),
        (rb_x1, rb_y1),
        (rb_mid, rb_y1 - notch),
        (rb_x0, rb_y1),
    ]
    d.polygon(ribbon_poly, fill=RIBBON)

    # Right-side shadow strip to give it depth.
    shadow_w = max(1, rb_w // 6)
    shadow_poly = [
        (rb_x1 - shadow_w, rb_y0),
        (rb_x1, rb_y0),
        (rb_x1, rb_y1),
        (rb_mid, rb_y1 - notch),
        (rb_mid, rb_y1 - notch - shadow_w // 2),
        (rb_x1 - shadow_w, rb_y0 + shadow_w),
    ]
    d.polygon(shadow_poly, fill=RIBBON_S)

    return img


def render_all() -> list[Path]:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    master = draw_master(SUPER)
    written: list[Path] = []
    for sz in SIZES:
        # LANCZOS for crisp downscale; for 128 this is also fine (no upscale).
        icon = master.resize((sz, sz), Image.LANCZOS)
        out = OUT_DIR / f"icon{sz}.png"
        # optimize=True + fixed pnginfo + sorted attrs => deterministic bytes.
        icon.save(
            out,
            format="PNG",
            optimize=True,
            compress_level=9,
        )
        written.append(out)
    return written


def main() -> int:
    paths = render_all()
    for p in paths:
        size = p.stat().st_size
        print(f"wrote {p.relative_to(OUT_DIR.parent.parent)} ({size} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
