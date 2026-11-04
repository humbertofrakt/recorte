# SPDX-License-Identifier: Apache-2.0
"""Recorte — a second, independent runtime for the `.bone` format, in Python.

Written from the specification text (`formato/ESPECIFICACAO`) and the JSON
Schema, using only the standard library. It exists to prove that the format is
implementable by someone other than the author of the first runtime.
"""

from .animation import (
    active_tags,
    apply_animation,
    evaluate_keys,
    fire_events,
    parameter_value,
    sequence_frame,
)
from .atlas import Atlas, Region, load_atlas
from .binary import BinaryError, parse_boneb
from .draw_list import draw_list
from .loader import (
    BoneError,
    SkeletonData,
    load_skeleton_bytes,
    load_skeleton_document,
    load_skeleton_file,
)
from .pose_dump import build_pose_dump, compare_pose_dump
from .skeleton import Bone, Skeleton, Slot

__all__ = [
    "Atlas", "BinaryError", "Bone", "BoneError", "Region", "Skeleton",
    "SkeletonData", "Slot", "active_tags", "apply_animation", "build_pose_dump",
    "compare_pose_dump", "draw_list", "evaluate_keys", "fire_events", "load_atlas",
    "load_skeleton_bytes", "load_skeleton_document", "load_skeleton_file",
    "parameter_value", "parse_boneb", "sequence_frame",
]

__version__ = "0.1.0"
