#!/usr/bin/env python3
"""Publish a self-contained HTML file to an Artifact Viewer service.

Configuration is read from ARTIFACT_VIEWER_URL and ARTIFACT_VIEWER_TOKEN.
Keep the token in a secret manager or protected environment; never commit it.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

MAX_LOCAL_BYTES = 2_000_000


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", type=Path)
    parser.add_argument("--title", default=None)
    parser.add_argument("--description", default="")
    parser.add_argument("--source", default="agent")
    parser.add_argument("--tag", action="append", default=[])
    parser.add_argument("--name", default=None)
    args = parser.parse_args()

    path = args.path.expanduser().resolve()
    if not path.is_file():
        parser.error(f"artifact file not found: {path}")
    if path.suffix.lower() not in {".html", ".htm"}:
        parser.error("path must end in .html or .htm")
    if path.stat().st_size > MAX_LOCAL_BYTES:
        parser.error(f"artifact exceeds {MAX_LOCAL_BYTES} bytes")

    base_url = os.environ.get("ARTIFACT_VIEWER_URL", "").rstrip("/")
    token = os.environ.get("ARTIFACT_VIEWER_TOKEN", "")
    if not base_url or not token:
        parser.error("ARTIFACT_VIEWER_URL and ARTIFACT_VIEWER_TOKEN are required")

    payload = {
        "title": args.title or path.stem.replace("-", " ").replace("_", " ").title(),
        "description": args.description,
        "html": path.read_text(encoding="utf-8"),
        "tags": args.tag,
        "source": args.source,
    }
    if args.name:
        payload["name"] = args.name

    request = urllib.request.Request(
        f"{base_url}/api/artifacts",
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.load(response)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:1000]
        print(f"publish failed: HTTP {exc.code}: {detail}", file=sys.stderr)
        return 1
    except urllib.error.URLError as exc:
        print(f"publish failed: {exc.reason}", file=sys.stderr)
        return 1

    print(json.dumps({
        "artifact_id": result.get("id"),
        "version_url": result.get("url"),
        "named_urls": result.get("named_urls", []),
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
