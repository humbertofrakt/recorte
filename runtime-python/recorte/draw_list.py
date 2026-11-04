# SPDX-License-Identifier: Apache-2.0
"""What is drawn in a frame, in order (7.13), opened child by child.

The list of a skeleton `S` has three groups, drawn in this order (7.11):

    lista(S) = atras(S) ++ meio(S) ++ frente(S)

One walk over the current draw order of `S`, with the clipping of 7.7:

- a common piece goes to the end of `meio`;
- a `skeleton` without `around` puts the whole list of the child at the end
  of `meio` — a block, cut by the mask of `S` like any piece;
- a `skeleton` with `around = m` cuts the list of the child at the slot `m`
  (by the position of `m` in the child's order of the instant): what comes
  before goes to the START of `atras(S)`, what comes after to the END of
  `frente(S)`. The slot `m` is not drawn, and the mask of `S` does not cut
  any of it: it is no longer in that stretch of the order.

Putting the "before" at the start is the onion of 7.11: the slot higher in the
order of `S` hugs the lower one, on both sides.

Each piece carries its masks, outside in (12.4, channel `drawList`). The mask
of the child is resolved in the child's own walk, before the cut, so each piece
takes its mask to the group it falls in (case C-318).
"""

from __future__ import annotations

from .loader import (
    ClippingAttachment,
    MeshAttachment,
    ParticleAttachment,
    RegionAttachment,
    SkeletonAttachment,
)
from .skeleton import Skeleton

# A piece: (name with every prefix, masks outside in).
Piece = tuple[str, tuple[str, ...]]


def draw_list(skeleton: Skeleton, prefix: str = "") -> list[Piece]:
    """The pieces of `skeleton` as they go to the screen (7.13, 12.4)."""
    behind, middle, front = _groups(skeleton, prefix)
    return behind + [piece for _slot, piece in middle] + front


def _instance(skeleton: Skeleton, slot, attachment: SkeletonAttachment):
    """The live child shown by `slot`, or None (child not loaded: no entry)."""
    instance = skeleton.nested_pool.get(slot.name)
    if instance is None or instance.resolved != attachment.resolved:
        return None
    return instance.skeleton


def _groups(skeleton: Skeleton, prefix: str):
    """(atras, meio, frente). `meio` keeps, for each piece, the slot of `S` it
    came from: that is what a cut one level up measures "before" and "after"
    against."""
    behind: list[Piece] = []
    middle: list[tuple[str, Piece]] = []
    front: list[Piece] = []

    clip: ClippingAttachment | None = None
    clip_name = ""
    for slot in skeleton.ordered_slots():
        attachment, _skin = skeleton.attachment_for(slot)
        if attachment is None or not slot.visible:
            continue
        if isinstance(attachment, ClippingAttachment):
            # A new mask replaces the old one (7.7).
            clip = attachment
            clip_name = f"{prefix}{slot.name}/{attachment.name}"
            continue
        cut = clip is not None and (clip.slots is None or slot.name in clip.slots)
        outer = (clip_name,) if cut else ()

        if isinstance(attachment, (RegionAttachment, MeshAttachment)):
            middle.append((slot.name, (f"{prefix}{slot.name}/{attachment.name}", outer)))
        elif isinstance(attachment, ParticleAttachment):
            # One entry per emitter (12.4). An emitter of unknown shape is not
            # drawn (2.5, the `BONE_particle.shape` line), so it is not listed.
            if attachment.shape_ok:
                middle.append((slot.name, (f"{prefix}{slot.name}/{attachment.name}", outer)))
        elif isinstance(attachment, SkeletonAttachment):
            child = _instance(skeleton, slot, attachment)
            if child is not None:
                child_prefix = f"{prefix}{slot.name}/"
                c_behind, c_middle, c_front = _groups(child, child_prefix)
                mark = attachment.around
                if mark is not None and mark not in child.slot_by_name:
                    # 2.5: a slot the child does not have — in a block, as
                    # without the field, and a notice once. Never a guess.
                    skeleton.warn_once(
                        f'AROUND_SLOT_MISSING: o slot "{mark}" não existe no filho do slot '
                        f'"{slot.name}"; o filho é desenhado em bloco (7.11, 2.5)')
                    mark = None
                if mark is None:
                    whole = c_behind + [piece for _s, piece in c_middle] + c_front
                    for name, masks in whole:
                        middle.append((slot.name, (name, outer + masks)))
                else:
                    # By the position of `m` in the child's order of the instant.
                    # Empty, hidden or swapped, the slot keeps its place (C-317).
                    position = {s.name: i for i, s in enumerate(child.ordered_slots())}
                    at = position[mark]
                    before = c_behind + [p for s, p in c_middle if position[s] < at]
                    after = [p for s, p in c_middle if position[s] > at] + c_front
                    behind = before + behind
                    front = front + after
        # Everything else (point, boundingbox, path, unknown) draws nothing.

        if clip is not None and clip.slots is None and slot.name == clip.end:
            clip = None
    return behind, middle, front
