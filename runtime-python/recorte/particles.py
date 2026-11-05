# SPDX-License-Identifier: Apache-2.0
"""The `BONE_particles` extension — module P, first phase.

Written from `formato/extensions/BONE_particles.md` alone. The rule the whole
file obeys: **a particle is a pure function of time**. It is born at an instant
the rate computes, its chance comes from a fixed seed, and its position is
arithmetic on its age. Dragging the timeline backwards shows the same frame,
bit for bit — nothing is kept between frames, ever.

This module holds the hash (3.2), the channel table (3.3) and when a particle
is born (4). Where it is, what it looks like and the order it draws in live
beside it, in the same file, so that a reader looking for "the particle rules"
finds all of them in one place.
"""

from __future__ import annotations

import math

# ---------------------------------------------------------------------------
# 3.2 The hash: PCG, 32 bits
# ---------------------------------------------------------------------------

MASK32 = 0xFFFFFFFF

# Python integers do NOT wrap around on their own, so every 32-bit step below
# masks explicitly. A forgotten `& MASK32` gives numbers that match the first
# cases and drift apart in the last ones.


def pcg(value: int) -> int:
    """The 32-bit PCG of Jarzynski and Olano (JCGT 2020), as 3.2 writes it."""
    value &= MASK32
    state = (value * 747796405 + 2891336453) & MASK32
    word = (((state >> ((state >> 28) + 4)) ^ state) * 277803737) & MASK32
    return ((word >> 22) ^ word) & MASK32


def acaso(seed: int, flow: int, index: int, channel: int) -> float:
    """`u` in [0, 1) for one channel of one particle (3.2).

    A negative index enters as its two's complement in 32 bits — `& MASK32` is
    exactly that, and it is why `acaso(42, 0, -3, 0)` is not
    `acaso(42, 0, 3, 0)`. The prewarm of 6 depends on it.

    The last step keeps 24 bits: a 24-bit number is exact in float32, so a
    runtime that works in float32 (allowed by 3.6 of the main spec) draws the
    same `u`.
    """
    h = pcg(seed)
    h = pcg(h ^ (flow & MASK32))
    h = pcg(h ^ (index & MASK32))
    h = pcg(h ^ (channel & MASK32))
    return (h >> 8) / 16777216.0


# 3.3 The channel table is FROZEN: a channel number never changes meaning.
CANAL_LIFETIME = 0
CANAL_SPEED = 1
CANAL_SPREAD = 2
CANAL_SHAPE_1 = 3
CANAL_SHAPE_2 = 4
CANAL_ANGLE = 5
CANAL_ANGULAR = 6
CANAL_SCALE = 7
CANAL_START_COLOR = 8
CANAL_START_FRAME = 9
CANAL_RANDOMNESS = 10
CANAL_PROBABILITY = 11
CANAL_MESH = 12
# 13-15 are reserved (noise, 2nd phase). This reader does not touch them.


def faixa(minimum: float, maximum: float, u: float) -> float:
    """A `[min, max]` field: `min + (max - min) * u` (3.3)."""
    return minimum + (maximum - minimum) * u


# ---------------------------------------------------------------------------
# 4 When a particle is born
# ---------------------------------------------------------------------------


class Birth:
    """One particle's identity and birth instant: the whole of 3.1 and 4."""

    __slots__ = ("flow", "index", "birth")

    def __init__(self, flow: int, index: int, birth: float) -> None:
        self.flow = flow
        self.index = index
        self.birth = birth


def _emitting_at(emitter, timelines, t: float) -> bool:
    """`emitting` read in the SKELETON clock, with no discount (4.1).

    `startDelay` shifts BIRTHS, which the program generates; it does not shift
    KEYS, which a person puts on the timeline by hand. Reading the timeline at
    `t - startDelay` would make every key slide without moving on screen.
    """
    timeline = timelines.get("emitting") if timelines else None
    if timeline is None:
        return emitter.emitting
    from .animation import evaluate_keys

    return bool(evaluate_keys(timeline.keys, t))


class Trechos:
    """The stretches of effective rate from the origin `o = startDelay` (4.2).

    **The birth of index `i` is the instant where `E(t) = i` — the INVERSE of
    the integral, never a sum applied afterwards.** A stretch where `emitting`
    is false has rate 0, so it has zero area and **consumes no index**: the
    count resumes in the next stretch, with the numbering unbroken.

    That is the whole reason this class exists instead of `o + i / rate`. The
    shortcut is right while the tap only ever closes, and wrong the moment it
    opens again — and then it is not only the count that moves: the particle
    born at `0.80` is index `10` here and would be index `16` with the
    shortcut. A different index is a different hash, so a different life, speed,
    angle and colour. The same particle under two names draws two things.
    """

    __slots__ = ("origem", "inicios", "taxas", "inclinacoes", "acumulado", "r0",
                 "animada")

    def __init__(self, emitter, timelines, ate: float) -> None:
        self.origem = emitter.start_delay
        # 4.2: a negative rate is swapped for 0 AT THE KEY, before integrating.
        rate = max(0.0, emitter.rate)
        timeline = timelines.get("emitting") if timelines else None
        # 4.2, the `linear` branch (2nd phase): `rate` animated by integral.
        taxa_tl = _chaves_de_taxa(timelines.get("rate") if timelines else None)
        self.animada = taxa_tl is not None

        marcas = []
        if timeline is not None:
            marcas.extend(key.time for key in timeline.keys)
        if taxa_tl is not None:
            marcas.extend(tempo for tempo, _, _ in taxa_tl)
        cortes = [self.origem]
        for tempo in sorted(marcas):
            if tempo > self.origem and tempo > cortes[-1]:
                cortes.append(tempo)
            if tempo > ate:
                break

        self.inicios: list[float] = cortes
        self.taxas: list[float] = []
        self.inclinacoes: list[float] = []
        for inicio in cortes:
            if not _emitting_at(emitter, timelines, inicio):
                self.taxas.append(0.0)
                self.inclinacoes.append(0.0)
            elif taxa_tl is None:
                self.taxas.append(rate)
                self.inclinacoes.append(0.0)
            else:
                valor, inclinacao = _taxa_e_inclinacao(taxa_tl, inicio)
                self.taxas.append(max(0.0, valor))
                self.inclinacoes.append(inclinacao)
        # E_k: the areas of the stretches 0..k-1, summed in this order, in
        # float64. It is the ONLY accumulation the spec allows — per key, never
        # per frame (3.4). A stretch of a `linear` key is a trapezoid.
        self.acumulado: list[float] = [0.0]
        for k in range(1, len(cortes)):
            largura = cortes[k] - cortes[k - 1]
            self.acumulado.append(self.acumulado[k - 1]
                                  + self.taxas[k - 1] * largura
                                  + self.inclinacoes[k - 1] * largura * largura / 2)
        # 4.2 + 9.10 of the main spec: before the first key the first key holds,
        # so the prewarm of 6 has a known rate.
        if taxa_tl is None:
            self.r0 = self.taxas[0]
        else:
            ligado = _emitting_at(emitter, timelines, -math.inf)
            self.r0 = taxa_tl[0][1] if ligado else 0.0

    def E(self, t: float) -> float:
        """How many births happened up to `t`, counted from the origin."""
        if t <= self.origem:
            return 0.0
        k = len(self.inicios) - 1
        while k > 0 and self.inicios[k] > t:
            k -= 1
        dt = t - self.inicios[k]
        return (self.acumulado[k] + self.taxas[k] * dt
                + self.inclinacoes[k] * dt * dt / 2)

    def taxa_em(self, t: float) -> float:
        """The effective rate at `t` (4.4 needs it for the jitter)."""
        if t < self.origem:
            return self.r0
        k = len(self.inicios) - 1
        while k > 0 and self.inicios[k] > t:
            k -= 1
        return max(0.0, self.taxas[k] + self.inclinacoes[k] * (t - self.inicios[k]))

    def instante(self, index: int) -> float:
        """The skeleton instant where `E(t) = index` (4.2), or `inf`.

        Negative indices are the prewarm of 6: `t_cont = o + i / r0`, with `r0`
        the rate of the first key.
        """
        if index < 0:
            if self.r0 <= 0:
                return -math.inf
            return self.origem + index / self.r0
        for k in range(len(self.inicios)):
            taxa = self.taxas[k]
            s = self.inclinacoes[k]
            if taxa <= 0 and s <= 0:
                continue
            fim = (self.acumulado[k + 1] if k + 1 < len(self.acumulado)
                   else math.inf)
            if index < fim or k + 1 == len(self.inicios):
                d = index - self.acumulado[k]
                if s == 0:
                    return self.inicios[k] + d / taxa
                if d == 0:
                    return self.inicios[k]
                # 4.2: the STABLE root. It does not divide by `s`.
                return self.inicios[k] + 2 * d / (
                    taxa + math.sqrt(max(0.0, taxa * taxa + 2 * s * d)))
        return math.inf

    def total(self) -> float:
        """`E` at the far end: how many the last stretch will ever reach."""
        return math.inf if self.taxas[-1] > 0 else self.acumulado[-1]


def _chaves_de_taxa(timeline):
    """The keys of an animated `rate` as `(time, value, stepped)` (4.2).

    A negative value is 0 at the key, and a Bezier is `linear`: the integral is
    closed only for `linear` and `stepped`. The loader already warned of both.
    """
    if timeline is None or not timeline.keys:
        return None
    out = []
    for key in timeline.keys:
        valor = key.value if isinstance(key.value, (int, float)) else 0.0
        out.append((float(key.time), max(0.0, float(valor)), key.curve == "stepped"))
    return out


def _taxa_e_inclinacao(chaves, t: float):
    """The rate at `t` and its slope from `t` on (9.10 of the main spec)."""
    if t < chaves[0][0]:
        return chaves[0][1], 0.0
    k = len(chaves) - 1
    while k > 0 and chaves[k][0] > t:
        k -= 1
    tempo, valor, degrau = chaves[k]
    if k == len(chaves) - 1 or degrau:
        return valor, 0.0
    t1, v1, _ = chaves[k + 1]
    inclinacao = (v1 - valor) / (t1 - tempo)
    return valor + inclinacao * (t - tempo), inclinacao


def _birth_of_index(emitter, trechos: "Trechos", index: int) -> float:
    """4.2 + 4.4: when the continuous particle `index` is born."""
    t_cont = trechos.instante(index)
    if not math.isfinite(t_cont):
        return math.inf

    explosiveness = emitter.explosiveness
    if explosiveness != 0 and emitter.duration > 0:
        # The window of `explosiveness` is `duration`, never the animation's.
        inicio = math.floor(t_cont / emitter.duration) * emitter.duration
        t_cont = inicio + (1 - explosiveness) * (t_cont - inicio)

    if emitter.randomness != 0:
        # The jitter stays INSIDE the particle's own slot, so the birth order
        # never changes. With a local rate of 0 there is no slot to jitter in.
        if trechos.animada:
            taxa = trechos.taxa_em(t_cont)
        else:
            taxa = trechos.taxas[0] if len(trechos.taxas) == 1 else max(
                0.0, emitter.rate)
        if taxa > 0:
            t_cont += emitter.randomness * acaso(
                emitter.seed, 0, index, CANAL_RANDOMNESS) / taxa
    return t_cont


def continuous_births(emitter, timelines, t: float, duration: float,
                      loop: bool) -> list[Birth]:
    """Every continuous birth (flow 0) that can still be alive at `t` (5, 6).

    The window comes from `lifetime.max`, which is why that field is NOT
    animable: with keys the window would need the whole curve swept, and a
    Bezier makes a belly.
    """
    if emitter.rate <= 0 and not (timelines and timelines.get("rate")):
        return []
    life_max = emitter.lifetime[1]
    if life_max <= 0:
        return []

    em_laco = emitter.looping and duration > 0
    ate = duration if em_laco else max(t, emitter.start_delay)
    trechos = Trechos(emitter, timelines, ate)

    births: list[Birth] = []
    if em_laco:
        # 6: a lap brings the indices `0 <= i < E(D)`, and the lap before is
        # the SAME list with `t_i` shifted by -D. The chance does NOT include
        # the lap number: if it did, `t` alone would not say which lap we are
        # in, and the function would stop being pure.
        por_volta = int(math.floor(trechos.E(duration) + 1e-9))
        if por_volta <= 0:
            return []
        voltas = int(math.floor(life_max / duration)) + 2
        for lap in range(voltas + 1):
            shift = lap * duration
            for index in range(0, por_volta):
                instante = _birth_of_index(emitter, trechos, index) - shift
                if instante > t or instante <= t - life_max:
                    continue
                births.append(Birth(0, index, instante))
    else:
        # 6: without a loop the births are those in `[-prewarm, t]`. The
        # prewarm indices are NEGATIVE, and the hash takes them (3.2).
        #
        # `prewarm` counts back from the emitter's OWN origin, which is
        # `startDelay` (9.1: "births only from here on"), and 4.2 says it in
        # letters: the origin moves, and the prewarm extends back FROM IT.
        ultimo = min(trechos.E(t), trechos.total())
        # 5: candidates from `ceil(E(t - lifetime.max)) - 1` to
        # `floor(E(t)) + 1`. `t_i` decides who is alive; `E` only picks who to
        # look at, and the extra one on each side covers the jitter of 4.4.
        primeiro = math.ceil(trechos.E(t - life_max)) - 1
        if trechos.r0 > 0:
            primeiro = min(primeiro, -math.ceil(emitter.prewarm * trechos.r0) - 1)
        else:
            primeiro = max(primeiro, 0)
        for index in range(int(primeiro), int(math.floor(ultimo)) + 2):
            instante = _birth_of_index(emitter, trechos, index)
            if instante > t or instante < emitter.start_delay - emitter.prewarm:
                continue
            if instante <= t - life_max:
                continue
            births.append(Birth(0, index, instante))
    return births


def burst_births(emitter, t: float, duration: float = 0.0,
                 loop: bool = False, avisar=None) -> list[Birth]:
    """4.3 + 6: every burst particle that can still be alive at `t`.

    A burst `b` is born outside the continuous rate, in flow `1 + b`, and
    `probability` is drawn PER PARTICLE on channel 11 — not per cycle. Half a
    probability does not mean exactly half the particles.

    **A burst comes back on the laps behind too.** 6 says "the births of the
    current lap AND those of the earlier ones": a burst IS a birth, and leaving
    it out makes the seam show up on the very effect you notice most — the
    explosion vanishing as the lap turns. Measured before it was written: with a
    burst at 0.1 and `D = 1`, the old reading gave four particles at `t = 0.5`
    and none at `t = 0.05`.

    **A lap carries only the cycles whose instant falls in `[0, D)`**, which is
    word for word the rule 6 already gives the continuous flow (`0 <= i < E(D)`).
    Without the cut, a burst whose `cycles * interval` runs past the animation
    would land a late cycle of the lap behind exactly on top of an early cycle
    of this one — two particles with the same `t_i` where the author asked for
    one. Cycles left out are reported through `avisar`: dropping in silence
    something the author wrote is what the warning is for. **Outside the loop
    nothing changes** — every cycle still counts; it is the lap that cuts.
    """
    life_max = emitter.lifetime[1]
    em_laco = loop and duration > 0
    if em_laco:
        # 6: how many laps back still reach into the window of 5.
        voltas = int(math.floor(life_max / duration)) + 2
    else:
        voltas = 0

    births: list[Birth] = []
    for b, burst in enumerate(emitter.bursts):
        flow = 1 + b
        fora = 0
        for cycle in range(burst.cycles):
            instant = emitter.start_delay + burst.time + cycle * burst.interval
            if em_laco and not (0 <= instant < duration):
                fora += 1
                continue
            nascidas = [cycle * burst.count + j for j in range(burst.count)
                        if acaso(emitter.seed, flow, cycle * burst.count + j,
                                 CANAL_PROBABILITY) < burst.probability]
            for lap in range(voltas + 1):
                quando = instant - lap * duration if em_laco else instant
                if quando > t or quando <= t - life_max:
                    continue
                # The chance does NOT include the lap number (6): the same
                # index has the same `u` on every lap, and only `t_i` moves.
                for index in nascidas:
                    births.append(Birth(flow, index, quando))
        if fora and avisar is not None:
            avisar(f"BURST_OUT_OF_LAP: a rajada {b} tem {fora} ciclo(s) fora da "
                   f"volta (duracao {duration}); no laco a volta leva so os de "
                   f"[0, D) (4.3, 6)")
    return births


# ---------------------------------------------------------------------------
# 8 Where it is: the closed form
# ---------------------------------------------------------------------------

# 3.6 of the main spec. A runtime **DEVE** use exactly this number.
LIMIAR_ARRASTO = 0.00001


def posicao(p0: tuple[float, float], v0: tuple[float, float],
            g: tuple[float, float], k: float, age: float
            ) -> tuple[tuple[float, float], tuple[float, float]]:
    """`p(a)` and `v(a)` of 8, for `v' = g - k*v`.

    Arithmetic on the age, never a sum of steps: `p += v*dt` would depend on the
    frame rate, and dragging the cursor back would not undo it (3.4).
    """
    if k < LIMIAR_ARRASTO:
        p = (p0[0] + v0[0] * age + 0.5 * g[0] * age * age,
             p0[1] + v0[1] * age + 0.5 * g[1] * age * age)
        v = (v0[0] + g[0] * age, v0[1] + g[1] * age)
        return (p, v)
    # `-expm1(-k*a) / k` is `(1 - e^(-k*a)) / k` without losing the small
    # digits: writing the subtraction out loses them when `k*a` is small.
    f = -math.expm1(-k * age) / k
    decay = math.exp(-k * age)
    gx, gy = g[0] / k, g[1] / k
    p = (p0[0] + gx * age + (v0[0] - gx) * f,
         p0[1] + gy * age + (v0[1] - gy) * f)
    v = (gx + (v0[0] - gx) * decay, gy + (v0[1] - gy) * decay)
    return (p, v)


def mistura_de_angulos(a: float, b: float, amount: float) -> float:
    """Blend two angles the SHORT way round (9.3, `spherizeDirection`)."""
    if amount == 0:
        return a
    delta = ((b - a + 180) % 360) - 180
    return a + delta * amount


# ---------------------------------------------------------------------------
# 9 The fields, read at the birth instant
# ---------------------------------------------------------------------------

# Every animable field of an emitter is marked **N** in 9: read at `t_i` and
# frozen on the particle. None of them is **T**, and `rate` (**I**) is second
# phase.
_CAMPOS_N = {
    "speed": "speed", "direction": "direction", "spread": "spread",
    "radius": "radius", "radiusThickness": "radius_thickness", "arc": "arc",
    "size": "size", "edge": "edge", "gravity": "gravity", "drag": "drag",
    "angle": "angle", "angularVelocity": "angular_velocity",
    "scale": "scale", "startColor": "start_color", "startFrame": "start_frame",
}


class Campos:
    """The emitter's fields as particle `i` saw them at its birth (9).

    A field with no timeline is the number in the attachment; a field with one
    is that timeline read at `t_i` — never at `t`, which is what **N** means.
    A key that changes the gravity therefore does NOT bend the particles
    already in the air: it is the price of the closed form, and 9.5 writes it.
    """

    __slots__ = ("_emitter", "_values")

    def __init__(self, emitter, timelines, birth: float) -> None:
        self._emitter = emitter
        self._values: dict = {}
        if not timelines:
            return
        from .animation import evaluate_keys

        for name, attribute in _CAMPOS_N.items():
            timeline = timelines.get(name)
            if timeline is None:
                continue
            value = evaluate_keys(timeline.keys, birth, timeline.components)
            if value is not None:
                self._values[attribute] = value

    def __getattr__(self, name: str):
        values = object.__getattribute__(self, "_values")
        if name in values:
            return values[name]
        return getattr(object.__getattribute__(self, "_emitter"), name)


def ponto_da_forma(emitter, campos, flow: int, index: int,
                   bone_length: float, malha, caminho=None) -> tuple[float, float]:
    """9.4: where inside the emitter's shape the particle is born.

    Channels 3 and 4 only (and 12 for a mesh), so that changing the shape never
    shifts the draws of speed, life or colour.

    `caminho` is the `p0` of `shape: "path"`, already found on the path at
    `t_i` and already in the emitter's frame (9.4.2): it needs the pose at the
    birth instant, which only `vivas` has.
    """
    if emitter.shape == "path":
        return caminho if caminho is not None else (0.0, 0.0)

    seed = emitter.seed
    u3 = acaso(seed, flow, index, CANAL_SHAPE_1)
    u4 = acaso(seed, flow, index, CANAL_SHAPE_2)
    shape = emitter.shape

    if shape == "point":
        return (0.0, 0.0)

    if shape == "circle":
        # Uniform over the AREA: the square root is what keeps the middle from
        # crowding. `radiusThickness 0` is the rim only, `1` the full disc.
        inner = 1.0 - campos.radius_thickness
        r = campos.radius * math.sqrt(inner * inner + u3 * (1 - inner * inner))
        phi = math.radians(u4 * campos.arc)
        return (r * math.cos(phi), r * math.sin(phi))

    if shape == "rectangle":
        width, height = campos.size[0], campos.size[1]
        return ((u3 - 0.5) * width, (u4 - 0.5) * height)

    if shape == "edge":
        x0, y0, x1, y1 = campos.edge
        return (x0 + (x1 - x0) * u3, y0 + (y1 - y0) * u3)

    if shape == "bone":
        # 9.4: no fields of its own — the `edge` from (0, 0) to (length, 0) of
        # the bone itself, with the length read at `t_i`. It is a new word:
        # none of the three reference programs has a bone.
        return (bone_length * u3, 0.0)

    if shape == "mesh":
        return ponto_da_malha(emitter, flow, index, u3, u4, malha)

    # An unknown shape never reaches here: the emitter is not drawn at all
    # (7.4), and the reader warned when it loaded the file.
    return (0.0, 0.0)


def ponto_da_malha(emitter, flow: int, index: int, u3: float, u4: float,
                   malha) -> tuple[float, float]:
    """9.4 `shape: "mesh"` — a point on a mesh of the same slot, deformed at
    `t_i`. Needs level B; `malha` is `(vertices, triangles)`, already posed.

    The spec names the accumulated area and channel 12 for `triangle`, and says
    nothing finer for `vertex` and `edge`: those two pick uniformly here. The
    reading is written in the Desvios of the assignment and went up to the
    Planejador — a case decides it, not this code.
    """
    if malha is None:
        return (0.0, 0.0)
    vertices, triangles = malha
    count = len(vertices) // 2
    if count == 0:
        return (0.0, 0.0)
    u12 = acaso(emitter.seed, flow, index, CANAL_MESH)
    mode = emitter.mesh_mode

    def vertex(i: int) -> tuple[float, float]:
        return (vertices[2 * i], vertices[2 * i + 1])

    if mode == "triangle" and len(triangles) >= 3:
        faces = len(triangles) // 3
        acumulada: list[float] = []
        total = 0.0
        for f in range(faces):
            a = vertex(triangles[3 * f])
            b = vertex(triangles[3 * f + 1])
            c = vertex(triangles[3 * f + 2])
            total += abs((b[0] - a[0]) * (c[1] - a[1])
                         - (c[0] - a[0]) * (b[1] - a[1])) / 2
            acumulada.append(total)
        if total <= 0:
            return vertex(triangles[0])
        alvo = u12 * total
        face = 0
        while face < faces - 1 and acumulada[face] <= alvo:
            face += 1
        a = vertex(triangles[3 * face])
        b = vertex(triangles[3 * face + 1])
        c = vertex(triangles[3 * face + 2])
        s, w = u3, u4
        if s + w > 1:            # folded back into the triangle
            s, w = 1 - s, 1 - w
        return (a[0] + s * (b[0] - a[0]) + w * (c[0] - a[0]),
                a[1] + s * (b[1] - a[1]) + w * (c[1] - a[1]))

    if mode == "edge" and len(triangles) >= 3:
        arestas = arestas_unicas(triangles)
        if arestas:
            a, b = arestas[min(int(u12 * len(arestas)), len(arestas) - 1)]
            pa, pb = vertex(a), vertex(b)
            return (pa[0] + (pb[0] - pa[0]) * u3, pa[1] + (pb[1] - pa[1]) * u3)

    # 9.4.1 `vertex`: `v = floor(u12 * N)`. The clamp never fires — `u12` is in
    # [0, 1) — and is here only so a future change to the hash cannot walk off
    # the end in silence.
    return vertex(min(int(u12 * count), count - 1))


def arestas_unicas(triangles: list) -> list:
    """9.4.1: the unique edges OF THE TRIANGULATION, `(a, b)` with `a < b`, no
    repeats, **sorted by the ascending pair**.

    The order is normative because it is what `floor(u12 * M)` indexes: the
    discovery order (the order the triangles happen to be written in) picks a
    DIFFERENT edge for the same `u12`, and nothing downstream would show it.

    Never the mesh's `edges` field: 7 of the main format calls that one "editor
    only", optional, default `[]` — an emitter tied to it would emit nothing at
    all in a normal file, with no visible reason.
    """
    vistas: set = set()
    for f in range(len(triangles) // 3):
        tri = triangles[3 * f:3 * f + 3]
        for a, b in ((tri[0], tri[1]), (tri[1], tri[2]), (tri[2], tri[0])):
            vistas.add((a, b) if a < b else (b, a))
    return sorted(vistas)


# 9.4.2: each Bezier curve of the path becomes 10 straight segments — the same
# ruler 6.4 of the main spec uses for length. Not the exact length: two readers
# measuring "the real length" with different steps would disagree.
SEGMENTOS_POR_CURVA = 10


def ler_curve(curve) -> tuple[str, str] | None:
    """9.4.2: `"<slot>/<placeholder>"`. The slot is the text before the FIRST
    slash; the placeholder is all the rest, and may hold slashes of its own."""
    if not isinstance(curve, str) or "/" not in curve:
        return None
    slot_name, placeholder = curve.split("/", 1)
    if not slot_name or not placeholder:
        return None
    return (slot_name, placeholder)


def poligonal_do_caminho(W: list, closed: bool) -> list:
    """9.4.2 steps 2 and 3: the polyline, as the list of its points in order.

    `W` holds `3K` points flattened (`6K` numbers): point `3i` is the incoming
    handle of anchor `i`, `3i+1` the anchor, `3i+2` the outgoing handle (6.4 of
    the main spec). Open: `K - 1` curves. Closed: `K`, the last one tying anchor
    `K-1` back to 0 with the outgoing handle of `K-1` and the incoming of 0.
    """
    K = len(W) // 6

    def ponto(i: int) -> tuple[float, float]:
        return (W[2 * i], W[2 * i + 1])

    curvas = K if closed else K - 1
    pontos: list = []
    for k in range(curvas):
        seguinte = (k + 1) % K
        a = ponto(3 * k + 1)
        h1 = ponto(3 * k + 2)
        h2 = ponto(3 * seguinte)
        c = ponto(3 * seguinte + 1)
        # The first point of a curve is the last of the one before: written once.
        for j in range(0 if k == 0 else 1, SEGMENTOS_POR_CURVA + 1):
            t = j / SEGMENTOS_POR_CURVA
            m = 1 - t
            b0, b1, b2, b3 = m * m * m, 3 * m * m * t, 3 * m * t * t, t * t * t
            pontos.append((b0 * a[0] + b1 * h1[0] + b2 * h2[0] + b3 * c[0],
                           b0 * a[1] + b1 * h1[1] + b2 * h2[1] + b3 * c[1]))
    return pontos


def ponto_no_caminho(W: list, closed: bool, u3: float) -> tuple[float, float]:
    """9.4.2 steps 4 to 6: the point at `s = u3 * total` from the start, ON THE
    POLYLINE — the chord, never `B(t)` read back inside the segment.

    Always by length: `constantSpeed` and `lengths` of the path are ignored.
    """
    pontos = poligonal_do_caminho(W, closed)
    if not pontos:
        return (W[2], W[3]) if len(W) >= 4 else (0.0, 0.0)
    comprimentos = [math.hypot(pontos[k + 1][0] - pontos[k][0],
                               pontos[k + 1][1] - pontos[k][1])
                    for k in range(len(pontos) - 1)]
    total = 0.0
    for L in comprimentos:          # summed in path order (step 4)
        total += L
    if total <= 0:
        # Step 6: "total = 0: p0 = the first anchor".
        return pontos[0]
    s = u3 * total
    acc = 0.0
    for k, L in enumerate(comprimentos):
        if L > 0 and acc + L >= s:
            f = (s - acc) / L
            return (pontos[k][0] + (pontos[k + 1][0] - pontos[k][0]) * f,
                    pontos[k][1] + (pontos[k + 1][1] - pontos[k][1]) * f)
        acc += L
    # `u3 < 1`, so `s < total` and the loop always returns; the end of the path
    # is here only so a change to the hash cannot fall off it in silence.
    return pontos[-1]


def _caminho_de(skeleton, emitter):
    """9.4.2: the `path` attachment that `curve` points at, or `None` with a
    warning. Looked up in the skins like any placeholder (4.4 of the main
    spec), WHATEVER the slot is showing: a path is never drawn.
    """
    from .loader import PathAttachment

    alvo = ler_curve(emitter.curve)
    motivo = None
    if alvo is None:
        motivo = (f'curve "{emitter.curve}" ausente ou sem "<slot>/<placeholder>"'
                  if emitter.curve else "sem curve")
    else:
        slot_name, placeholder = alvo
        if slot_name not in skeleton.slot_by_name:
            motivo = f'o slot "{slot_name}" de curve nao existe'
        else:
            attachment, _ = skeleton.resolve_attachment(slot_name, placeholder)
            if not isinstance(attachment, PathAttachment):
                motivo = f'"{emitter.curve}" nao e um anexo path'
            elif attachment.vertex_count // 3 < 2:
                motivo = f'o caminho "{emitter.curve}" tem menos de 2 ancoras'
    if motivo is not None:
        # 9.4.2: not drawn, and said once — never a fall to `point`.
        skeleton.warn_once(
            f'REF_PARTICLE_CURVE: o emissor "{emitter.name}" tem shape "path" e '
            f'{motivo}; emissor nao desenhado (9.4.2)')
        return None
    return alvo


def _p0_no_caminho(no_nascimento, alvo, emitter, flow: int, index: int,
                   frame_ti) -> tuple[float, float] | None:
    """9.4.2 steps 1 and 7: the path at `t_i`, in skeleton space — the bone of
    the PATH's slot and that attachment's deform in that slot, both at `t_i` —
    and then, in `local`, back through the inverse of `M_emissor(t_i)`."""
    from .loader import PathAttachment

    slot_name, placeholder = alvo
    slot_c = no_nascimento.slot_by_name.get(slot_name)
    if slot_c is None:
        return None
    attachment, skin = no_nascimento.resolve_attachment(slot_name, placeholder)
    if not isinstance(attachment, PathAttachment):
        return None
    W = no_nascimento.world_vertices(slot_c, attachment, skin)
    if len(W) < 12:
        return None
    u3 = acaso(emitter.seed, flow, index, CANAL_SHAPE_1)
    p0 = ponto_no_caminho(W, attachment.closed, u3)
    if emitter.space != "world":
        x, y = _para_o_osso(frame_ti, [p0[0], p0[1]])
        p0 = (x, y)
    return p0


# ---------------------------------------------------------------------------
# One particle, at one instant
# ---------------------------------------------------------------------------


class Particle:
    """What 14.1 measures, plus the colour and the frame of 9.7 and 9.8.

    Built from `(file, animation, t)` and nothing else: no field of it survives
    into the next frame.
    """

    __slots__ = ("flow", "index", "birth", "life", "age", "x", "y",
                 "angle", "scale", "color", "frame")

    def __init__(self, flow: int, index: int, birth: float, life: float,
                 age: float) -> None:
        self.flow = flow
        self.index = index
        self.birth = birth
        self.life = life
        self.age = age
        self.x = 0.0
        self.y = 0.0
        self.angle = 0.0
        self.scale = 1.0
        self.color = [1.0, 1.0, 1.0, 1.0]
        self.frame = 0


def vida_de(emitter, flow: int, index: int) -> float:
    """`life_i`, channel 0 (9.2). Not animable: `lifetime.max` is the window."""
    return faixa(emitter.lifetime[0], emitter.lifetime[1],
                 acaso(emitter.seed, flow, index, CANAL_LIFETIME))


def _curva_da_vida(keys, fraction: float, default, components: int = 1):
    """`scaleOverLifetime`, `colorOverLifetime`, `alphaOverLifetime` (9.6, 9.7):
    the whole of 9.2-9.3 of the main spec reused, with `time` in 0..1 of the
    life instead of seconds."""
    if not keys:
        return default
    from .animation import evaluate_keys

    value = evaluate_keys(keys, fraction, components)
    return default if value is None else value


def avaliar(emitter, campos, flow: int, index: int, birth: float, life: float,
            age: float, frame, frame_ti, bone_length: float, malha,
            frames: int, caminho=None) -> Particle:
    """One particle at `t`, in SKELETON space — 8, 9 and 7.2 together.

    `frame` is the slot's matrix at `t` and `frame_ti` the one at `t_i`. In
    `local` the bone goes on commanding the particle after it is born; in
    `world` it lets go at the birth instant and never touches it again. The
    dump writes `x` and `y` in skeleton space either way, which is what makes
    the two comparable (14.1).
    """
    seed = emitter.seed
    p0 = ponto_da_forma(emitter, campos, flow, index, bone_length, malha,
                        caminho)

    # 9.3: a scalar speed, and the direction apart.
    speed = faixa(campos.speed[0], campos.speed[1],
                  acaso(seed, flow, index, CANAL_SPEED))
    base = campos.direction
    # 9.4.2: the centre of the shape is the emitter's origin, for `path` too.
    # A path point in `world` is already in skeleton space, so the direction
    # out of the centre is measured on it brought back to the emitter's frame.
    centro = p0
    if emitter.shape == "path" and emitter.space == "world":
        cx, cy = _para_o_osso(frame_ti, [p0[0], p0[1]])
        centro = (cx, cy)
    if campos.spherize_direction != 0 and (centro[0] != 0.0 or centro[1] != 0.0):
        # `1` leaves straight out of the middle of the shape; the blend is the
        # short way round (9.3).
        fora = math.degrees(math.atan2(centro[1], centro[0]))
        base = mistura_de_angulos(base, fora, campos.spherize_direction)
    theta = base + campos.spread * (2 * acaso(seed, flow, index, CANAL_SPREAD) - 1)
    v0 = (speed * math.cos(math.radians(theta)), speed * math.sin(math.radians(theta)))

    g = (campos.gravity[0], campos.gravity[1])
    k = campos.drag

    if emitter.space == "world":
        # 7.2: `p0` and `v0` go to the skeleton's space through the bone matrix
        # at `t_i`; `g` is already there. After that the particle is on its own.
        if emitter.shape != "path":
            # 9.4.2 step 7: on a path in `world`, `p0` is ALREADY in skeleton
            # space — carrying it again would move it by the bone twice.
            p0 = frame_ti.local_to_world(p0[0], p0[1])
        v0 = (frame_ti.a * v0[0] + frame_ti.b * v0[1],
              frame_ti.c * v0[0] + frame_ti.d * v0[1])
        usado = frame_ti
    else:
        usado = frame

    p, v = posicao(p0, v0, g, k, age)

    particle = Particle(flow, index, birth, life, age)
    if emitter.space == "world":
        particle.x, particle.y = p
    else:
        # `local`: the drawn position is `p(a)` through the bone matrix at `t`.
        particle.x, particle.y = frame.local_to_world(p[0], p[1])

    # 9.6: the angle comes out AS IT IS, never folded into -180..180 (14.1).
    angle_i = faixa(campos.angle[0], campos.angle[1],
                    acaso(seed, flow, index, CANAL_ANGLE))
    angular = faixa(campos.angular_velocity[0], campos.angular_velocity[1],
                    acaso(seed, flow, index, CANAL_ANGULAR))
    theta_a = angle_i + angular * age
    if emitter.align_to_velocity:
        # 9.3: `v(a)` decides where it points, and `angle` is added on top.
        theta_a += math.degrees(math.atan2(v[1], v[0]))
    particle.angle = theta_a + rotacao_de(usado)

    fraction = age / life if life > 0 else 0.0
    scale_i = faixa(campos.scale[0], campos.scale[1],
                    acaso(seed, flow, index, CANAL_SCALE))
    scale_i *= _curva_da_vida(emitter.scale_over_lifetime, fraction, 1.0)
    particle.scale = scale_i * escala_de(usado)

    # 9.7: ONE `u` for the four components, then the gradient over the life.
    u8 = acaso(seed, flow, index, CANAL_START_COLOR)
    c1, c2 = campos.start_color[0], campos.start_color[1]
    color = [faixa(c1[i], c2[i], u8) for i in range(4)]
    gradient = _curva_da_vida(emitter.color_over_lifetime, fraction, None, 4)
    if gradient is not None:
        color = [color[i] * float(gradient[i]) for i in range(4)]
    alpha = _curva_da_vida(emitter.alpha_over_lifetime, fraction, None)
    if alpha is not None:
        color[3] *= float(alpha)
    particle.color = color

    particle.frame = quadro(emitter, campos, flow, index, age, fraction, frames)
    return particle


def quadro(emitter, campos, flow: int, index: int, age: float,
           fraction: float, frames: int) -> int:
    """9.8: which frame of the sheet this particle shows.

    The `+ 0.00001` guard is the one of 9.6 of the main spec.
    """
    if frames <= 0:
        return 0
    if emitter.frame_mode == "fps":
        k = int(math.floor(age * emitter.fps + 0.00001)) % frames
    else:
        k = int(math.floor(fraction * emitter.cycles * frames + 0.00001)) % frames
    inicio = int(math.floor(faixa(campos.start_frame[0], campos.start_frame[1],
                                  acaso(emitter.seed, flow, index,
                                        CANAL_START_FRAME)))) % frames
    return (k + inicio) % frames


def rotacao_de(frame) -> float:
    """The world rotation of a bone matrix, in degrees (7.2, "the bone's
    rotation"). It is the angle its own `+X` points at."""
    return math.degrees(math.atan2(frame.c, frame.a))


def escala_de(frame) -> float:
    """The world scale of a bone matrix (7.2, "times the bone's scale")."""
    return math.hypot(frame.a, frame.c)


# ---------------------------------------------------------------------------
# Putting it together: who is alive at `t`
# ---------------------------------------------------------------------------


def timelines_do_emissor(animation, slot_name: str, attachment_name: str,
                         skin_name: str) -> dict:
    """The `BONE_particle` timelines aimed at this emitter, by property (9)."""
    out: dict = {}
    if animation is None:
        return out
    for timeline in animation.timelines:
        if timeline.type != "BONE_particle" or timeline.target != slot_name:
            continue
        if timeline.attachment not in (None, attachment_name):
            continue
        if timeline.skin not in ("default", skin_name):
            continue
        out[timeline.property or ""] = timeline
    return out


def _malha_de(skeleton, slot, emitter, skin_name):
    """The mesh of the SAME slot that `shape: "mesh"` points at (9.4), posed.

    `REF_PARTICLE_MESH` is the validator's job; a reader that does not find it
    says so instead of drawing the emitter at the origin.
    """
    from .loader import MeshAttachment

    if emitter.mesh is None:
        return None
    attachment, resolved_skin = skeleton.resolve_attachment(slot.name, emitter.mesh)
    if not isinstance(attachment, MeshAttachment):
        skeleton.warn_once(
            f'REF_PARTICLE_MESH: o emissor "{emitter.name}" no slot "{slot.name}" '
            f'aponta para "{emitter.mesh}", que nao e uma malha do mesmo slot')
        return None
    return (skeleton.world_vertices(slot, attachment, resolved_skin),
            attachment.triangles)


def vivas(skeleton, slot, emitter, skin_name: str, t: float,
          animation=None, duration: float = 0.0, loop: bool = False,
          pose_em=None) -> list:
    """Every particle of one emitter alive at `t`, still unordered (5, 7.1).

    `pose_em(t_i)` gives the skeleton posed at the birth instant; it is only
    asked for when the answer depends on it — `space: "world"`, `shape: "bone"`
    or `shape: "mesh"` — because it costs one pose per birth (7.2).
    """
    if not emitter.shape_ok:
        # 7.4: an unknown shape draws NOTHING. Falling to `point` would be a
        # guess the user has no way of noticing.
        return []

    alvo = None
    if emitter.shape == "path":
        # 9.4.2: a `curve` that is missing or is not a path draws nothing.
        alvo = _caminho_de(skeleton, emitter)
        if alvo is None:
            return []

    timelines = timelines_do_emissor(animation, slot.name, emitter.name, skin_name)
    nascimentos = continuous_births(emitter, timelines, t, duration, loop)
    nascimentos.extend(burst_births(
        emitter, t, duration, loop,
        lambda aviso: skeleton.warn_once(
            f'{aviso} — emissor "{emitter.name}" no slot "{slot.name}"')))

    # 9.10: "the bone's matrix" is the emitter's, at `t` and at `t_i` alike.
    frame = quadro_do_emissor(slot.frame(), emitter)
    # Only these two really need a pose at the birth instant (7.2): `world`
    # carries `p0` and `v0` through the matrix at `t_i`, and `mesh` needs the
    # vertices deformed at `t_i`. `shape: "bone"` reads a LENGTH, which is not
    # animable, so it costs nothing.
    # `path` joins them (9.4.2): the path is read at `t_i`, bone and deform.
    precisa_pose = (emitter.space == "world"
                    or emitter.shape in ("mesh", "path"))
    if precisa_pose and pose_em is None:
        # One pose per birth is the price 7.2 writes down, and without it the
        # answer would be the matrix at the wrong instant. Saying so beats
        # drawing 90 degrees off — the exact error P-006 catches.
        skeleton.warn_once(
            f'PARTICLE_NO_POSE: o emissor "{emitter.name}" no slot "{slot.name}" '
            f'pede a pose do osso no instante do nascimento (space "world" ou '
            f'shape "mesh") e ela nao foi oferecida; emissor nao desenhado')
        return []
    # 9.8: how many frames the sheet has. Without a `sequence` (7.10) there is
    # one image and the frame is always 0.
    frames = emitter.sequence.count if emitter.sequence is not None else 1

    out: list = []
    for birth in nascimentos:
        life = vida_de(emitter, birth.flow, birth.index)
        if life <= 0:
            continue
        age = t - birth.birth
        # 5: `t_i <= t < t_i + life_i`. The `E` only chose who to look at; the
        # birth instant is what decides.
        if age < 0 or age >= life:
            continue

        frame_ti = frame
        bone_length = slot.bone.length
        malha = None
        caminho = None
        if precisa_pose:
            no_nascimento = pose_em(birth.birth)
            if no_nascimento is None:
                skeleton.warn_once(
                    f'PARTICLE_NO_POSE: o emissor "{emitter.name}" no slot '
                    f'"{slot.name}" nao existia no instante do nascimento; '
                    f'sem a matriz de t_i nao ha o que desenhar')
                return []
            slot_ti = no_nascimento.slot_by_name.get(slot.name, slot)
            frame_ti = quadro_do_emissor(slot_ti.frame(), emitter)
            if emitter.shape == "mesh":
                malha = _malha_de(no_nascimento, slot_ti, emitter, skin_name)
                if (malha is not None and emitter.mesh_mode in ("edge", "triangle")
                        and len(malha[1]) < 3):
                    # 9.4.1 builds both from the TRIANGULATION. Quietly falling
                    # back to `vertex` would draw a different shape than the
                    # author asked for, and nobody would see why.
                    skeleton.warn_once(
                        f'PARTICLE_MESH_NO_TRIANGLES: o emissor "{emitter.name}" '
                        f'no slot "{slot.name}" pede meshMode "{emitter.mesh_mode}", '
                        f'e a malha "{emitter.mesh}" nao tem triangulacao')
                    return []
                if malha is not None:
                    # The mesh is measured in skeleton space at `t_i`, and comes
                    # back ONCE through the inverse of `M_emissor(t_i)` — in BOTH
                    # spaces (9.10, the `shape: "mesh"` line; 9.4.2 step 7). In
                    # `local` the drawing multiplies by the matrix at `t`; in
                    # `world` 7.2 carries `p0` out again by the matrix at `t_i`,
                    # so it lands on the mesh. And `spherizeDirection` measures
                    # `atan2(p0)` from the emitter's origin, in the emitter's
                    # frame. Leaving it in skeleton space in `world` carried it
                    # twice — P-027.
                    malha = (_para_o_osso(frame_ti, malha[0]), malha[1])
            if alvo is not None:
                caminho = _p0_no_caminho(no_nascimento, alvo, emitter,
                                         birth.flow, birth.index, frame_ti)
                if caminho is None:
                    skeleton.warn_once(
                        f'REF_PARTICLE_CURVE: o emissor "{emitter.name}" no slot '
                        f'"{slot.name}" nao acha o caminho "{emitter.curve}" no '
                        f'instante do nascimento; emissor nao desenhado (9.4.2)')
                    return []

        campos = Campos(emitter, timelines, birth.birth)
        out.append(avaliar(emitter, campos, birth.flow, birth.index,
                           birth.birth, life, age, frame, frame_ti,
                           bone_length, malha, frames, caminho))
    return out


def quadro_do_emissor(frame, emitter):
    """9.10: the EMITTER's matrix, `M_osso x T(x, y) . R(rotation)`.

    "Wherever this extension reads the bone's matrix, it reads `M_emissor`."
    With the three fields at 0 it is the bone's own matrix, untouched, so a
    file without them reads exactly as before.
    """
    if emitter.x == 0 and emitter.y == 0 and emitter.rotation == 0:
        return frame
    from .skeleton import frame_of, Frame

    base = frame if isinstance(frame, Frame) else frame_of(frame)
    return base.times_trs(emitter.x, emitter.y, emitter.rotation, 1.0, 1.0)


def _para_o_osso(frame, vertices: list) -> list:
    """Skeleton space back into the bone's frame — the inverse of `frame`."""
    det = frame.a * frame.d - frame.b * frame.c
    if det == 0:
        return list(vertices)
    out: list = []
    for i in range(0, len(vertices), 2):
        x = vertices[i] - frame.world_x
        y = vertices[i + 1] - frame.world_y
        out.append((frame.d * x - frame.b * y) / det)
        out.append((frame.a * y - frame.c * x) / det)
    return out


# ---------------------------------------------------------------------------
# 7.1 The ceiling of living particles, and the drawing order
# ---------------------------------------------------------------------------


def _ordem(particle) -> tuple:
    """7.1: `(t_i decreasing, flow increasing, index decreasing)`."""
    return (-particle.birth, particle.flow, -particle.index)


def desenhar(emitter, particles: list) -> list:
    """The ones actually drawn, in drawing order (7.1, 9.9).

    Unity and Godot BLOCK the birth when the emitter is full. That is state:
    who is born starts depending on who was alive before, and the function
    stops being pure. Here the particle is always born, and the drawing takes
    the `maxParticles` NEWEST ones.

    The price, written down: with a low ceiling an old particle vanishes all at
    once instead of fading out with its life. It is the rule working, not a
    defect, and the reader that cuts SHOULD say so once.
    """
    ordenadas = sorted(particles, key=_ordem)
    cortadas = ordenadas[:emitter.max_particles]
    if emitter.sort_mode == "oldestInFront":
        # 9.9: the same order, from the other end.
        cortadas = list(reversed(cortadas))
    return cortadas


def particulas_do_slot(skeleton, slot, emitter, skin_name: str, t: float,
                       animation=None, duration: float = 0.0,
                       loop: bool = False, pose_em=None) -> list:
    """Everything of one emitter at `t`: who is alive, cut and in order."""
    vivos = vivas(skeleton, slot, emitter, skin_name, t,
                  animation, duration, loop, pose_em)
    if len(vivos) > emitter.max_particles:
        skeleton.warn_once(
            f'PARTICLE_CUT: o emissor "{emitter.name}" no slot "{slot.name}" '
            f'passou de maxParticles ({emitter.max_particles}); '
            f'{len(vivos) - emitter.max_particles} cortadas neste quadro (7.1)')
    return desenhar(emitter, vivos)
