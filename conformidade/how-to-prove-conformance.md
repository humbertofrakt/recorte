# How to prove your `.bone` runtime is conformant

Também em português: [Português](como-provar-conformidade.md)

This is for the person writing a `.bone` runtime in another language — C++,
Rust, C#, Python, Go, whatever — who wants to be able to say in public:
**"bone 1.0, level C"**.

You do not need anyone's permission. You need a report that anyone can
reproduce.

The tools print in Portuguese. Every message you will see on screen is shown
here exactly as it comes out, with the English meaning next to it.

---

## Step 1 — pick the level you are aiming at

| Level | Write this first |
|:---:|:---|
| **A** | Read the JSON, header and version, bones with the five inheritance modes, slots, `region`, skins, atlas, the bone / slot / `drawOrder` / event timelines, and the three curves. |
| **B** | Everything in A, plus `mesh` with weights, `linkedmesh`, `boundingbox`, `clipping`, `point`, `sequence`, `deform`, variables, tags and the `.boneb` binary. |
| **C** | Everything in B, plus the five constraints, the `path` attachment, nested skeletons, parameters, drivers and morphs. |

Always, at every level:

- Open a file whose `minor` is higher than yours. **Never refuse over `minor`.**
- Ignore any property, type, timeline and extension you do not know.
- Do not normalise weights. Do not reorder bones, slots or constraints.

That is what the **X** cases measure, and they are required at every level.

Start with A. It is designed to fit into a weekend.

---

## Step 2 — write the adapter

The adapter is a small program, 100 to 300 lines. It is the bridge between the
suite and your runtime. The contract:

| | |
|:---|:---|
| **Receives** | The case folder, as the last argument on the command line. |
| **Receives** | The **probe**, as JSON on standard input. |
| **Returns** | The **pose dump**, as JSON on standard output. |
| **Error** | A non-zero exit code; the message goes to standard error. |

### The probe

```json
{
  "skins": ["armadura"],
  "animation": "andar",
  "times": [0, 0.25, 0.5, 1.0],
  "loop": true,
  "physicsDt": 0.01,
  "measure": ["bones", "slots", "drawOrder", "vertices", "events", "tags"]
}
```

| Field | What to do |
|:---|:---|
| `skins` | The **stack** of skins (spec 4.4), bottom to top: where two give an attachment to the same placeholder, the one on top wins. `"default"` is a skin like any other: it is active only if it is in the list. Absent = `["default"]`. |
| `animation` | Name of the animation to apply. Absent or `null` = the setup pose only. |
| `times` | The skeleton times to sample, in seconds, increasing. |
| `loop` | `true` = the animation time wraps around at `duration`, and the events repeat on every lap. |
| `physicsDt` | Fixed simulation step. See step 4. |
| `measure` | Which blocks to write in each sample. Absent = `bones`, `slots`, `drawOrder`, `events`, `tags`. |

### The pose dump

```json
{
  "version": "1.0",
  "samples": [
    { "time": 0.5,
      "bones": {
        "arm": { "a": 0.7071, "b": -0.7071, "c": 0.7071, "d": 0.7071,
                 "worldX": 0, "worldY": 40,
                 "ax": 0, "ay": 40, "arotation": 45,
                 "ascaleX": 1, "ascaleY": 1, "ashearX": 0, "ashearY": 0 }
      },
      "body": null,
      "slots": {
        "arm": { "attachment": "arm", "bone": "arm", "color": [1, 0.8, 0.8, 1],
                 "darkColor": null, "visible": true, "sequenceIndex": -1 }
      },
      "drawOrder": ["body", "arm"],
      "vertices": { "arm/arm": [3.536, 31.464, 47.376, 77.477, 33.234, 91.619, -3.536, 48.536] },
      "boundingBoxes": {},
      "points": { "mao/ponta": { "x": 10, "y": 20, "rotation": 45 } },
      "events": [ { "time": 0.5, "event": "passo", "int": 2, "float": 0,
                    "string": "", "volume": 0.5, "balance": 0 } ],
      "tags": ["idle"],
      "variables": { "vida": 3 },
      "parameters": { "olhar": 0.5 }
    }
  ]
}
```

Rules of the dump, one per line:

- `body` is the `uri` of the **body of the instant** (spec 9.13), or `null`
  when it is the file's own body. Always present, also in a one-body project.
  The other channels of the sample belong to that body.
- `bones` is an object **keyed by name**: the world matrix
  (`a b c d worldX worldY`) and the applied pose
  (`ax ay arotation ascaleX ascaleY ashearX ashearY`). A bone of a nested
  child comes in under the key `"<slot>/<bone>"`.
- `slots` always carries `attachment`, `bone` (the **applied** bone: the
  file's, or the one of the active `slot/bone` key), `color`, `darkColor`,
  `visible` and `sequenceIndex`.
- The dump's angles (`arotation`, `ashearX`, `ashearY`, point rotation) come out
  **reduced to `(-180, 180]`**. The internal pose keeps the raw value; only the
  output reduces it.
- `vertices` and `boundingBoxes` use the key `"slot/attachment"`, with the world
  vertices in `x, y` pairs.
- `sequenceIndex` is the **resolved** frame of the sequence (already passed
  through `sequence.setup` when there is no key). `-1` when the attachment has no
  sequence.
- `events` carries the **effective** values: each field of the key overrides the
  one in the definition; whatever the key does not say comes from the definition.
- Numbers with **6 decimal places** at most.
- Always write the whole dump. Extra data does no harm: **`esperado.json`
  decides what is compared**, and what it does not mention is not looked at.

### Where each case's probe lives

The probe reaches your adapter through **standard input**, but it lives inside
the case, and you can open and read it before running anything: it is under the
`"probe"` key of `esperado.json`, or in a separate `probe.json` next to it, when
the case has one. `probe.json`, when it exists, **wins**.

### An adapter that really runs

The Python sketch below shows the shape. When your adapter diverges and you
cannot see why, the file to read line by line is this one, which passes the cases
today:

    conformidade/adaptador-referencia.mjs

Check it yourself, from the root of the project:

```
node ferramentas/conformidade.mjs --adaptador "node conformidade/adaptador-referencia.mjs"
```

It uses the TypeScript reference runtime, but that is not the point: the point is
the frame around it — how the case folder arrives, how the probe is read, how the
three packagings are found, and why a refusal has to come out through the exit
code and not through the dump.

### Example adapter (Python, skeleton)

```python
import json, sys, os

pasta = sys.argv[-1]
sonda = json.load(sys.stdin)

esqueleto = meu_runtime.carregar(os.path.join(pasta, "entrada.bone"))
esqueleto.pilha(sonda.get("skins", ["default"]))   # bottom to top; the top one wins

anim = sonda.get("animation")
amostras = []
anterior = float("-inf")
for t in sonda["times"]:
    esqueleto.pose(anim, t, agora=t, loop=sonda.get("loop", False))
    amostras.append(montar_amostra(esqueleto, t, anterior, sonda))
    anterior = t

json.dump({"version": "1.0", "samples": amostras}, sys.stdout)
```

---

## Step 3 — how each sample is built

This is the part where two correct runtimes end up arguing, so it is written out
in full.

**A sample is a complete pose, built from scratch:**

```
1. put everything back to the setup pose
2. apply the animation at time t          (Pose, section 9.10 of the spec)
3. run updatePose: applied = local, constraints in array order, world
4. read the values and write the sample
```

**Animation time.** Without `loop`, it is `t` itself (before the first key the
first key holds; after the last key the last key holds). With `loop` and
`duration > 0`, it is `t − floor(t / duration) × duration`.

**Events.** The interval of sample `i` is `(times[i−1], times[i]]`, with `−∞` on
the first one. With `loop`, a key at `k` fires at `k`, `k + duration`,
`k + 2·duration`, and so on. Inside a sample, deliver them in time order; on a
tie, keep the order of the keys.

---

## Step 4 — physics, when the case asks for it

When the probe carries a `physicsDt` greater than zero, posing at the requested
times is **not** enough. The simulation is chained: each step depends on the one
before.

```
the clock runs from 0 upwards, in steps of physicsDt
at each step, build a complete pose (setup, animation, updatePose) with now = the clock
when the clock lands on a requested time, record the sample
```

Every requested time is an exact multiple of the step. If it is not, the case is
wrong and the suite complains.

**A different `dt` gives a different trajectory, and that is expected** (6.5 of
the spec). That is why the suite fixes the step.

---

## Step 5 — run the suite

```
node ferramentas/conformidade.mjs --adaptador "python meu_adaptador.py"
```

Start with a single case, to get the adapter right:

```
node ferramentas/conformidade.mjs --adaptador "python meu_adaptador.py" --caso A-010-heranca-cinco-modos
```

Then by level:

```
node ferramentas/conformidade.mjs --adaptador "python meu_adaptador.py" --nivel A --nivel X
```

When it fails, the output shows where:

```
A-010-heranca-cinco-modos
  /samples/0/bones/noScale/a
    esperado 0.27735   obtido -0.27735   diferença 0.5547 (tolerância 0.0001)
```

`esperado` is expected, `obtido` is what your runtime gave, `diferença` is the
difference and `tolerância` is the tolerance.

The path is a JSON Pointer inside the dump. `/samples/0/bones/noScale/a` means:
first sample, bone `noScale`, component `a` of the matrix.

**Read the `leiame.md` of the case that failed.** It carries the calculation
written out step by step, straight from the spec. Most of the time the exact line
where your runtime diverged is in there.

---

## Step 6 — the tolerances

| What | Tolerance |
|:---|---:|
| Position, vertex, `worldX/Y`, `ax/ay` | `1e-3` px |
| Angle (`arotation`, `ashearX/Y`) | `1e-2` degree, by circular distance |
| Matrix component (`a b c d`) and scale | `1e-4` |
| Colour | `1e-3` |
| Physics with fixed `dt` | `1e-2` px |
| IK `softness` | `1e-1` px |
| Events, draw order, tags, names, booleans | **exact** |

Angles are compared by circular distance: `179.999` and `-180` are the same
angle.

You **may** calculate in 32-bit or 64-bit float, pre-tabulate curves, memory-map,
reorder internally — as long as the result fits inside those tolerances.

---

## Step 7 — publish

Generate the machine-readable report:

```
node ferramentas/conformidade.mjs --json --adaptador "python meu_adaptador.py" > conformance-report.json
```

Keep it at a public address — your runtime's repository will do — and send the
line to the **official registry**, in `conformidade/REGISTRY.md`, with the name
of the runtime, the version, the language, the level, how many cases passed and
the date. That file already carries the table header and the first row filled in.

How to send it: open an issue in the format's repository. The address is in
`README.md` and in `CONTRIBUTING.md`.

### The text you may publish when you pass

With **100% of the A and X cases**:

> `<runtime name> <version>` implements the bone format, **bone 1.0, level A**.
> It passes 100% of the A and X cases of the official conformance suite.
> Report: `conformance-report.json`, generated on `<date>`.

With **100% of the A, B and X cases**: change it to **level B**.

With **100% of the A, B, C and X cases**: change it to **level C**.

**Level R (rendering) — reserved, no cases yet.** The `R-` family is foreseen in
§12.4 and **does not exist** in the repository: there are zero cases. While they
do not exist, do **not** publish "level R": it is a claim nobody can check, and
in a document whose whole force comes from "it counts because it is public and
reproducible", one claim with nothing behind it contaminates the other three.

### What you may **not** say

- "Level C" with one C case failing. A case is a case.
- "Level B" without the X cases. Compatibility is not optional.
- "Conformant" without publishing the report. Self-certification counts because
  it is public and reproducible.

A runtime that implements part of level C **declares the highest level it reaches
in full**, and may say separately which features of the next level it already
has.

---

## If you find a case that is wrong

It happens. The spec is text, and text has mistakes.

Open an issue with: the case, the field, the number you calculated, and **the
working**. If your working follows the spec and `esperado.json` does not, the
case is what changes — and the spec too, if the text was ambiguous.

What does **not** happen is the opposite: the suite is not adjusted to
accommodate a runtime. A proposal that breaks an existing case is refused without
discussion (12.8 of the spec).
