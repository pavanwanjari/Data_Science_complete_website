#!/usr/bin/env python3
"""Sync `config.js` AD_IMAGES with files currently present in `ads/`.

Usage:
  python3 scripts/sync_ads_config.py
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config.js"
ADS_DIR = ROOT / "ads"
ALLOWED_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}


def discover_ads() -> list[str]:
    return sorted(
        p.relative_to(ADS_DIR).as_posix()
        for p in ADS_DIR.rglob("*")
        if p.is_file() and p.suffix.lower() in ALLOWED_SUFFIXES
    )


def update_config(ad_images: list[str]) -> bool:
    text = CONFIG_PATH.read_text(encoding="utf-8")
    pattern = re.compile(r"AD_IMAGES:\s*\[(?:.|\n)*?\]\s*", re.MULTILINE)
    replacement = "AD_IMAGES: [\n" + "\n".join(f'    "{name}",' for name in ad_images) + "\n  ]\n"
    updated = pattern.sub(replacement, text, count=1)
    if updated == text:
        return False
    CONFIG_PATH.write_text(updated, encoding="utf-8")
    return True


def main() -> None:
    ad_images = discover_ads()
    changed = update_config(ad_images)
    print(f"Found {len(ad_images)} ad image(s).")
    print("Updated config.js." if changed else "config.js already up to date.")


if __name__ == "__main__":
    main()
