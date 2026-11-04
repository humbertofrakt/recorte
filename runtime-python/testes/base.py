# SPDX-License-Identifier: Apache-2.0
"""Helpers shared by the tests: path bootstrap and tiny skeleton builders."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from recorte.loader import load_skeleton_document  # noqa: E402
from recorte.skeleton import Skeleton  # noqa: E402

HEADER = {"version": "1.0", "minVersion": "1.0", "generator": "testes"}


def document(**parts) -> dict:
    doc = {"bone": dict(HEADER)}
    doc.update(parts)
    return doc


def build(**parts) -> Skeleton:
    """Load a document and return a posed skeleton in the setup pose."""
    data = load_skeleton_document(document(**parts))
    skeleton = Skeleton(data)
    skeleton.update_pose(0.0)
    return skeleton
