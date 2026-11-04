# SPDX-License-Identifier: Apache-2.0
"""Atlas reading and UV mapping (spec section 10).

Atlas coordinates are page pixels with the origin at the top-left corner and Y
growing downwards, while `offsetY` is measured from the bottom, like the rest
of the format. Section 10.4 is the only place that reconciles the two, and it
is implemented here verbatim.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class Page:
    name: str = ""
    image: str = ""
    width: int = 0
    height: int = 0
    format: str = "rgba8"
    min_filter: str = "linear"
    mag_filter: str = "linear"
    wrap_u: str = "clamp"
    wrap_v: str = "clamp"
    premultiplied: bool = False


@dataclass
class Region:
    name: str = ""
    aliases: list[str] = field(default_factory=list)
    page_index: int = 0
    x: int = 0
    y: int = 0
    width: int = 0
    height: int = 0
    rotation: int = 0
    offset_x: int = 0
    offset_y: int = 0
    original_width: int = 0
    original_height: int = 0
    page: Page | None = None
    scale: float = 1.0

    def uv(self, u0: float, v0: float) -> tuple[float, float]:
        """Section 10.4: original-image UV to page UV."""
        page = self.page
        assert page is not None
        px = u0 * self.original_width - self.offset_x
        py = v0 * self.original_height - (self.original_height - self.offset_y - self.height)
        if self.rotation == 90:
            u = (self.x + self.height - py) / page.width
            v = (self.y + px) / page.height
        else:
            u = (self.x + px) / page.width
            v = (self.y + py) / page.height
        return (u, v)


@dataclass
class Atlas:
    scale: float = 1.0
    pages: list[Page] = field(default_factory=list)
    regions: list[Region] = field(default_factory=list)
    by_name: dict[str, Region] = field(default_factory=dict)

    def find(self, name: str) -> Region | None:
        return self.by_name.get(name)


def _num(source: dict, key: str, default):
    value = source.get(key, default)
    return default if value is None else value


def load_atlas(doc: dict[str, Any]) -> Atlas:
    """Build an Atlas from the parsed `.atlas.json` document."""
    atlas = Atlas(scale=float(_num(doc, "scale", 1)) or 1.0)
    for raw in doc.get("pages", []) or []:
        atlas.pages.append(Page(
            name=str(raw.get("name", "")),
            image=str(raw.get("image", "")),
            width=int(_num(raw, "width", 0)),
            height=int(_num(raw, "height", 0)),
            format=str(_num(raw, "format", "rgba8")),
            min_filter=str(_num(raw, "minFilter", "linear")),
            mag_filter=str(_num(raw, "magFilter", "linear")),
            wrap_u=str(_num(raw, "wrapU", "clamp")),
            wrap_v=str(_num(raw, "wrapV", "clamp")),
            premultiplied=bool(_num(raw, "premultiplied", False)),
        ))
    for raw in doc.get("regions", []) or []:
        width = int(_num(raw, "width", 0))
        height = int(_num(raw, "height", 0))
        rotation = int(_num(raw, "rotation", 0))
        if rotation not in (0, 90):
            rotation = 0  # section 2.5 fallback
        page_index = int(_num(raw, "page", 0))
        region = Region(
            name=str(raw.get("name", "")),
            aliases=[str(a) for a in (raw.get("aliases") or [])],
            page_index=page_index,
            x=int(_num(raw, "x", 0)),
            y=int(_num(raw, "y", 0)),
            width=width,
            height=height,
            rotation=rotation,
            offset_x=int(_num(raw, "offsetX", 0)),
            offset_y=int(_num(raw, "offsetY", 0)),
            original_width=int(_num(raw, "originalWidth", width)),
            original_height=int(_num(raw, "originalHeight", height)),
            scale=atlas.scale,
        )
        if 0 <= page_index < len(atlas.pages):
            region.page = atlas.pages[page_index]
        atlas.regions.append(region)
        atlas.by_name.setdefault(region.name, region)
    # Aliases resolve only after every real name, so a real name always wins.
    for region in atlas.regions:
        for alias in region.aliases:
            atlas.by_name.setdefault(alias, region)
    return atlas


def find_region(atlases: list[Atlas], name: str) -> Region | None:
    """First match across the atlases, in the order of `assets.atlases` (10.5)."""
    for atlas in atlases:
        region = atlas.find(name)
        if region is not None:
            return region
    return None
