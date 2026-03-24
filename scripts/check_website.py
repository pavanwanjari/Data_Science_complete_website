#!/usr/bin/env python3
"""Basic static checks for the DataLearn10X website."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(REPO_ROOT.glob("*.html"))
CONFIG_FILE = REPO_ROOT / "config.js"

REF_PATTERN = re.compile(r"(?:src|href)=['\"]([^'\"#?]+)")
CONFIG_KEY_PATTERN = re.compile(r"\b([A-Z_]+)\s*:")
AD_IMAGE_PATTERN = re.compile(r"AD_IMAGES\s*:\s*\[(.*?)\]", re.S)
TEMPLATE_REF_PATTERN = re.compile(r"\$\{[^}]+\}")


def is_remote_ref(path: str) -> bool:
    return path.startswith(("http://", "https://", "mailto:", "tel:", "javascript:", "data:"))


def is_dynamic_ref(path: str) -> bool:
    return bool(TEMPLATE_REF_PATTERN.search(path))


def check_local_references() -> list[str]:
    errors: list[str] = []
    for html_file in HTML_FILES:
        content = html_file.read_text(encoding="utf-8", errors="ignore")
        for match in REF_PATTERN.finditer(content):
            ref = match.group(1).strip()
            if not ref or is_remote_ref(ref) or is_dynamic_ref(ref):
                continue
            target = (html_file.parent / ref).resolve()
            if not target.exists():
                errors.append(f"{html_file.name}: missing reference '{ref}'")
    return errors


def check_config() -> list[str]:
    errors: list[str] = []
    if not CONFIG_FILE.exists():
        return ["config.js is missing"]

    content = CONFIG_FILE.read_text(encoding="utf-8", errors="ignore")
    keys = set(CONFIG_KEY_PATTERN.findall(content))
    required_keys = {
        "SHEET_WEBAPP_URL",
        "WHATSAPP_NUMBER",
        "WHATSAPP_TEXT",
        "AD_IMAGES_BASE_URL",
        "AD_IMAGES",
    }
    missing_keys = sorted(required_keys - keys)
    for key in missing_keys:
        errors.append(f"config.js: missing key {key}")

    images_match = AD_IMAGE_PATTERN.search(content)
    if images_match:
        raw = images_match.group(1)
        images = [img.strip().strip("'\"") for img in raw.split(",") if img.strip()]
        for image in images:
            if image.startswith(("http://", "https://")):
                continue
            image_path = REPO_ROOT / "ads" / image
            if not image_path.exists():
                errors.append(f"config.js: ad image not found ads/{image}")
    else:
        errors.append("config.js: AD_IMAGES array not found")

    return errors


def run_checks(verbose: bool = False) -> int:
    errors = []
    errors.extend(check_local_references())
    errors.extend(check_config())

    if verbose:
        print(f"Checked {len(HTML_FILES)} HTML files")

    if errors:
        print("Website checks failed:")
        for err in errors:
            print(f" - {err}")
        return 1

    print("All website checks passed.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Run static checks for website pages and config")
    parser.add_argument("--verbose", action="store_true", help="Show additional details")
    args = parser.parse_args()
    return run_checks(verbose=args.verbose)


if __name__ == "__main__":
    raise SystemExit(main())
