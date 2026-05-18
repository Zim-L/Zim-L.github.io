---
title: "Problem Landscape Visualiser"
layout: single
permalink: /problem-landscape/
classes: wide
author_profile: false
toc: true
toc_label: "On this page"
toc_sticky: true
---

An interactive companion to our work on visualising the landscape of
multi-objective optimisation problems. It samples a two-variable slice of a
bi-objective benchmark, stratifies the sampled points by Pareto dominance, and
draws the result as a draggable 3D landscape alongside the matching
objective-space view.

The visualiser supports the two dominance-based landscape methods discussed in
the paper. They differ **only** in the scalar mapped to the vertical axis &mdash;
which is why the control selects a *landscape type* rather than an arbitrary
height expression.
{: .notice--info}

<div id="landscape-visualiser"></div>

## Two ways to read height

| Landscape | What the height encodes | Where the optima sit |
|---|---|---|
| **Pareto landscape** | The **non-domination level** of a point after a non-dominated sort &mdash; level 1 is the nondominated (Pareto-optimal) front, level 2 is what remains after removing level 1, and so on. | A *lower* level is a *higher* altitude. Pareto-optimal points form the peaks. |
| **Cost landscape** | The **dominance count** of a point &mdash; how many sampled points dominate it (also called the *dominance ratio*). | A point dominated by nobody sits at the top; the count is inverted for display so optima remain on the peaks. |

A note on terminology, since it is easy to conflate: *Pareto landscape* uses the
**non-domination level** (the level index from non-dominated sorting), whereas
the older *cost landscape* uses the number of dominating points. The two are
related but distinct &mdash; two points can share a non-domination level yet have
very different dominance counts. Earlier drafts of this page labelled the height
"Pareto rank"; the correct term for the proposed method is *non-domination
level*, and "Pareto rank / dominance count" refers specifically to the cost
landscape.
{: .notice--warning}

For both landscapes, the level-1 / zero-dominator points &mdash; the optimal
front for the sampled set &mdash; are highlighted as dark markers on the surface
and emphasised in the objective-space scatter.

## Benchmark problems

The ZDT, DTLZ, UF, and WFG examples are browser translations of the
corresponding benchmark definitions used in the local `minijmetal` project. UF
is shown as a two-coordinate slice because the standard UF definitions need
parity groups beyond two variables. The **BBOB proxy** entries are lightweight
browser-side stand-ins, *not* official COCO / `bbob-biobj` instances &mdash; use
the CSV loader below if you generate official samples locally.

## Using official BBOB-biobj data

The official COCO platform lists `bbob-biobj` and `bbob-biobj-ext` as available
suites. To use those exact functions here, install the Python wrapper locally,
sample a two-dimensional grid, and upload the resulting CSV with the control
above (expected columns: `x1, x2, f1, f2` on a complete rectangular grid).

```python
import csv
import numpy as np
import cocoex

suite = cocoex.Suite("bbob-biobj", "instances: 1", "dimensions: 2")
problem = suite[0]  # choose another index for another BBOB-biobj problem
grid = np.linspace(-5.0, 5.0, 81)

with open("bbob_biobj_sample.csv", "w", newline="") as fh:
    writer = csv.writer(fh)
    writer.writerow(["x1", "x2", "f1", "f2"])
    for x1 in grid:
        for x2 in grid:
            f1, f2 = problem([x1, x2])
            writer.writerow([x1, x2, f1, f2])
```

COCO setup notes are on the
[COCO getting started page](https://coco-platform.org/getting-started/), and
suite background is in the
[COCO data archive](https://coco-platform.org/data-archive/).

## References

The methods visualised on this page are introduced and developed in the
following works:

1. Z. Liang, Z. Cui, and M. Li. **Pareto Landscape: Visualising the Landscape
   of Multi-objective Optimisation Problems.** In *Parallel Problem Solving from
   Nature &mdash; PPSN XVIII*, Lecture Notes in Computer Science,
   pp. 299&ndash;315. Springer, 2024.
   [[PDF]](/assets/files/PPSN_Pareto_landscape.pdf)
   &nbsp;[[Publisher]](https://dl.acm.org/doi/10.1007/978-3-031-70085-9_19)
   &nbsp;DOI: `10.1007/978-3-031-70085-9_19`

2. Z. Cui, Z. Liang, and M. Li. **A Problem Landscape Visualisation Method for
   Multi-Objective Optimisation.** *Mathematical and Computational Applications*,
   31(3):67, 2026.
   [[PDF]](/assets/files/MCA26_Problem_Landscape.pdf)
   &nbsp;[[Publisher]](https://www.mdpi.com/2297-8747/31/3/67)
   &nbsp;DOI: `10.3390/mca31030067`

3. C. M. Fonseca. **Multiobjective Genetic Algorithms with Application to
   Control Engineering Problems.** PhD thesis, University of Sheffield, 1995.
   *(Origin of the cost landscape / dominance-ratio visualisation.)*

Supporting visualisation methods referenced for comparison in the papers above
include the gradient field heatmap (Kerschke & Grimme, 2017) and PLOT
(Sch&auml;permeier, Grimme & Kerschke, 2020). For the benchmark suites: ZDT
(Zitzler, Deb & Thiele, 2000), DTLZ (Deb et al., 2005), WFG (Huband et al.,
2006), and BBOB-biobj (Brockhoff et al., COCO platform).

---

*This visualiser is a teaching and exploration aid. For the precise definitions,
the comparison with gradient field heatmaps and PLOT, and the discussion of
benchmark characteristics, please see references 1 and 2 above.*
{: .notice}

<script type="module" src="/assets/js/problem-landscape.js"></script>
