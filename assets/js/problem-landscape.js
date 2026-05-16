import * as THREE from "https://esm.sh/three@0.164.1";
import { OrbitControls } from "https://esm.sh/three@0.164.1/examples/jsm/controls/OrbitControls.js";

/*
 * Interactive companion to:
 *   Liang, Cui & Li, "Pareto Landscape: Visualising the Landscape of
 *   Multi-objective Optimisation Problems", PPSN 2024 (and the MCA 2026
 *   extension).
 *
 * Two landscape methods are supported, exactly as defined in the paper:
 *
 *   Pareto landscape  -- the proposed method. The height of a point is the
 *                        non-domination LEVEL it occupies after a
 *                        non-dominated sort (level 1 = the nondominated
 *                        front, level 2 = next, ...). Higher altitude means
 *                        a lower level, i.e. a better point. Optima sit on
 *                        the peaks.
 *
 *   Cost landscape    -- Fonseca's earlier method (aka dominance ratio).
 *                        The height of a point is the NUMBER of points that
 *                        dominate it. Optima (dominated by nobody) sit on
 *                        the peaks here too, so for display we invert the
 *                        count the same way.
 *
 * The two methods differ ONLY in the scalar mapped to the z axis -- that is
 * why the control below selects a *landscape type*, not an arbitrary
 * "height" expression.
 */

const TAU = Math.PI * 2;

/* ---- palette -------------------------------------------------------- */
/* Discrete bands for Pareto-landscape non-domination levels. Level 1 (the
 * optimal front) is the strong accent; deeper levels fade towards the base. */
const LEVEL_COLOURS = [
  "#b9472f", // level 1  -- Pareto-optimal front (accent)
  "#cf7a3c",
  "#d8a24e",
  "#bba663",
  "#8f9e74",
  "#6f8a7d",
  "#5d7480",
  "#5b6173",
];
/* Continuous ramp for cost landscape (base -> deep accent). */
const COST_STOPS = [
  { t: 0.0, c: [0x5b, 0x61, 0x73] },
  { t: 0.5, c: [0xb0, 0x97, 0x66] },
  { t: 1.0, c: [0xb9, 0x47, 0x2f] },
];

const FRONT_MARKER = "#1f2933";
const SURFACE_BG = "#fbf8f2";
const GRID_MAIN = "#cdbfa6";
const GRID_SUB = "#e3d9c5";
const AXIS_COLOUR = "#5a5142";
const INK = "#3a3327";

function boot(container) {
  const state = {
    problemId: "zdt1",
    landscapeType: "pareto", // "pareto" | "cost"
    resolution: 55,
    imported: null,
    scene: null,
    renderer: null,
    controls: null,
    mesh: null,
    frontPoints: null,
    axes: null,
    animationId: null,
    container,
    checkedPixels: false,
  };

  container.innerHTML = `
    <div class="pl-shell">
      <div class="pl-toolbar" aria-label="Landscape controls">
        <label class="pl-field">
          <span class="pl-field-label">Benchmark problem</span>
          <select class="pl-problem"></select>
        </label>
        <label class="pl-field">
          <span class="pl-field-label">Landscape</span>
          <select class="pl-landscape">
            <option value="pareto">Pareto landscape &mdash; non-domination level</option>
            <option value="cost">Cost landscape &mdash; dominance count</option>
          </select>
        </label>
        <label class="pl-field pl-field--grid">
          <span class="pl-field-label">Grid density <em class="pl-grid-readout">55 &times; 55</em></span>
          <input class="pl-resolution" type="range" min="24" max="90" step="1" value="${state.resolution}">
        </label>
        <button class="pl-sample" type="button">Resample</button>
        <label class="pl-field pl-field--file">
          <span class="pl-field-label">Load CSV grid</span>
          <input class="pl-csv" type="file" accept=".csv,text/csv">
        </label>
      </div>
      <div class="pl-workspace">
        <div class="pl-stage">
          <div class="pl-plot" aria-label="Draggable 3D landscape"></div>
          <div class="pl-stage-foot">
            <span class="pl-hint">Drag to rotate &middot; scroll to zoom &middot; right-drag to pan</span>
            <span class="pl-legend"></span>
          </div>
        </div>
        <aside class="pl-side">
          <div class="pl-panel">
            <h3 class="pl-panel-title">Objective space</h3>
            <canvas class="pl-objectives" width="600" height="440" aria-label="Objective-space scatter plot"></canvas>
          </div>
          <div class="pl-panel">
            <h3 class="pl-panel-title">Sampled problem</h3>
            <div class="pl-summary"></div>
          </div>
        </aside>
      </div>
    </div>
  `;

  const problemSelect = container.querySelector(".pl-problem");
  const landscapeSelect = container.querySelector(".pl-landscape");
  const resolutionInput = container.querySelector(".pl-resolution");
  const gridReadout = container.querySelector(".pl-grid-readout");
  const sampleButton = container.querySelector(".pl-sample");
  const csvInput = container.querySelector(".pl-csv");
  const summary = container.querySelector(".pl-summary");
  const legend = container.querySelector(".pl-legend");
  const objectiveCanvas = container.querySelector(".pl-objectives");
  const plot = container.querySelector(".pl-plot");

  populateProblemSelect(problemSelect, state);
  setupScene(plot, state);

  problemSelect.addEventListener("change", () => {
    state.problemId = problemSelect.value;
    renderLandscape(state, objectiveCanvas, summary, legend);
  });

  landscapeSelect.addEventListener("change", () => {
    state.landscapeType = landscapeSelect.value;
    renderLandscape(state, objectiveCanvas, summary, legend);
  });

  resolutionInput.addEventListener("input", () => {
    state.resolution = Number(resolutionInput.value);
    gridReadout.textContent = `${state.resolution} \u00d7 ${state.resolution}`;
  });

  sampleButton.addEventListener("click", () => {
    renderLandscape(state, objectiveCanvas, summary, legend);
  });

  csvInput.addEventListener("change", async () => {
    const file = csvInput.files && csvInput.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      state.imported = parseCsvSamples(text, file.name);
      state.problemId = "csv";
      populateProblemSelect(problemSelect, state);
      problemSelect.value = "csv";
      renderLandscape(state, objectiveCanvas, summary, legend);
    } catch (error) {
      summary.innerHTML = `<p class="pl-error"><strong>CSV load failed.</strong> ${escapeHtml(error.message)}</p>`;
    }
  });

  renderLandscape(state, objectiveCanvas, summary, legend);
  animate(state);
}

function populateProblemSelect(select, state) {
  const groups = groupBy(PROBLEMS, (problem) => problem.family);
  select.innerHTML = "";
  for (const [family, problems] of groups) {
    const group = document.createElement("optgroup");
    group.label = family;
    for (const problem of problems) {
      const option = document.createElement("option");
      option.value = problem.id;
      option.textContent = problem.name;
      group.appendChild(option);
    }
    select.appendChild(group);
  }
  if (state.imported) {
    const group = document.createElement("optgroup");
    group.label = "Imported";
    const option = document.createElement("option");
    option.value = "csv";
    option.textContent = state.imported.name;
    group.appendChild(option);
    select.appendChild(group);
  }
  select.value = state.problemId;
}

function setupScene(plot, state) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SURFACE_BG);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(8.5, 7, 10.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(plot.clientWidth || 640, plot.clientHeight || 520);
  plot.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 1.6, 0);
  controls.minDistance = 5;
  controls.maxDistance = 30;

  const grid = new THREE.GridHelper(10, 10, GRID_MAIN, GRID_SUB);
  grid.position.y = -0.001;
  scene.add(grid);

  const key = new THREE.DirectionalLight("#ffffff", 1.05);
  key.position.set(6, 12, 8);
  scene.add(key);
  const ambient = new THREE.HemisphereLight("#ffffff", "#cdbfa6", 1.5);
  scene.add(ambient);

  const resizeObserver = new ResizeObserver(() => {
    const width = Math.max(320, plot.clientWidth);
    const height = Math.max(360, plot.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
  resizeObserver.observe(plot);

  state.scene = scene;
  state.camera = camera;
  state.renderer = renderer;
  state.controls = controls;
}

function animate(state) {
  state.animationId = requestAnimationFrame(() => animate(state));
  state.controls.update();
  state.renderer.render(state.scene, state.camera);
  if (state.mesh && !state.checkedPixels) {
    state.checkedPixels = true;
    requestAnimationFrame(() => {
      const check = canvasPixelCheck(state.renderer.domElement);
      state.container.dataset.renderedPixels = String(check.nonBackground);
      state.container.dataset.renderedRatio = check.ratio.toFixed(4);
    });
  }
}

function renderLandscape(state, objectiveCanvas, summary, legend) {
  const scene = state.scene;
  if (state.mesh) scene.remove(state.mesh);
  if (state.frontPoints) scene.remove(state.frontPoints);
  if (state.axes) scene.remove(state.axes);

  const sample = state.problemId === "csv"
    ? state.imported
    : sampleProblem(getProblem(state.problemId), state.resolution);

  if (!sample || sample.points.length === 0) {
    summary.innerHTML = '<p class="pl-error">No samples available.</p>';
    return;
  }

  assignNonDominationLevels(sample.points);
  assignDominanceCount(sample.points);

  const stats = getStats(sample.points, state.landscapeType);
  state.mesh = createSurface(sample, stats);
  state.frontPoints = createOptimalFrontPoints(sample, stats);
  state.axes = createAxes(sample, stats);
  scene.add(state.mesh);
  scene.add(state.frontPoints);
  scene.add(state.axes);
  state.checkedPixels = false;

  drawObjectiveSpace(objectiveCanvas, sample.points, state.landscapeType, stats);
  writeSummary(summary, sample, stats, state.landscapeType);
  writeLegend(legend, stats, state.landscapeType);
}

function canvasPixelCheck(canvas) {
  const sampler = document.createElement("canvas");
  sampler.width = Math.max(1, Math.floor(canvas.width / 4));
  sampler.height = Math.max(1, Math.floor(canvas.height / 4));
  const ctx = sampler.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(canvas, 0, 0, sampler.width, sampler.height);
  const pixels = ctx.getImageData(0, 0, sampler.width, sampler.height).data;
  let nonBackground = 0;
  let sampled = 0;
  for (let i = 0; i < pixels.length; i += 4 * 12) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    sampled++;
    if (a > 0 && (Math.abs(r - 251) > 8 || Math.abs(g - 248) > 8 || Math.abs(b - 242) > 8)) {
      nonBackground++;
    }
  }
  return { nonBackground, sampled, ratio: sampled ? nonBackground / sampled : 0 };
}

function sampleProblem(problem, resolution) {
  const nx = resolution;
  const ny = resolution;
  const points = [];
  for (let iy = 0; iy < ny; iy++) {
    const ty = ny === 1 ? 0 : iy / (ny - 1);
    const x2 = lerp(problem.bounds.x2[0], problem.bounds.x2[1], ty);
    for (let ix = 0; ix < nx; ix++) {
      const tx = nx === 1 ? 0 : ix / (nx - 1);
      const x1 = lerp(problem.bounds.x1[0], problem.bounds.x1[1], tx);
      const f = safeObjectives(problem.evaluate(x1, x2));
      points.push({ x1, x2, f, ix, iy });
    }
  }
  return {
    name: problem.name,
    family: problem.family,
    bounds: problem.bounds,
    note: problem.note,
    points,
    grid: { nx, ny },
  };
}

/* ---- non-dominated sorting (Pareto landscape) ----------------------- *
 * For a bi-objective set, sorting by f1 (then f2) and tracking the best
 * f2 seen per level via binary search yields the non-domination level of
 * every point in O(n log n). Level is stored 0-indexed internally;
 * level 0 == the nondominated (Pareto-optimal) front.                   */
function assignNonDominationLevels(points) {
  const sorted = [...points].sort((a, b) => {
    const d1 = a.f[0] - b.f[0];
    if (d1 !== 0) return d1;
    return a.f[1] - b.f[1];
  });
  const bestF2PerLevel = [];
  let prevF1 = Number.POSITIVE_INFINITY;
  let prevF2 = Number.POSITIVE_INFINITY;
  let prevLevel = 0;

  for (const point of sorted) {
    const f1 = point.f[0];
    const f2 = point.f[1];
    if (f1 === prevF1 && f2 === prevF2) {
      point.level = prevLevel;
      continue;
    }
    const level = lowerBound(bestF2PerLevel, f2);
    if (level === bestF2PerLevel.length) {
      bestF2PerLevel.push(f2);
    } else {
      bestF2PerLevel[level] = f2;
    }
    point.level = level;
    prevF1 = f1;
    prevF2 = f2;
    prevLevel = level;
  }
}

function lowerBound(values, target) {
  let low = 0;
  let high = values.length - 1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (values[mid] > target) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return low;
}

/* ---- dominance count (cost landscape) ------------------------------- *
 * cost(p) = number of points that dominate p. A point q dominates p iff
 * q is no worse on both objectives and strictly better on at least one.
 *
 * Computed in O(n log n): sort by f1 ascending and process the points in
 * blocks of equal f1. A Fenwick tree over the (compressed) rank of f2
 * holds every point seen in STRICTLY earlier f1 blocks, so a prefix query
 * at p's f2 counts how many earlier points have f2 <= p.f2 -- each of
 * which has a strictly smaller f1 and therefore dominates p. Inside the
 * current block (equal f1), a peer dominates p only if its f2 is strictly
 * smaller. Points with an identical objective vector never dominate each
 * other, and the strict comparisons above already exclude them.          */
function assignDominanceCount(points) {
  const n = points.length;
  const f2Sorted = [...new Set(points.map((p) => p.f[1]))].sort((a, b) => a - b);
  const f2Rank = new Map(f2Sorted.map((v, i) => [v, i + 1]));
  const tree = new Int32Array(f2Sorted.length + 1);
  const add = (i) => { for (; i < tree.length; i += i & -i) tree[i] += 1; };
  const query = (i) => { let s = 0; for (; i > 0; i -= i & -i) s += tree[i]; return s; };

  const order = [...points].sort((a, b) => {
    const d1 = a.f[0] - b.f[0];
    if (d1 !== 0) return d1;
    return a.f[1] - b.f[1];
  });

  let i = 0;
  while (i < n) {
    let j = i;
    while (j < n && order[j].f[0] === order[i].f[0]) j++;
    // Dominators from strictly-smaller f1 blocks (already in the tree),
    // plus equal-f1 peers with a strictly smaller f2.
    for (let k = i; k < j; k++) {
      const p = order[k];
      let cost = query(f2Rank.get(p.f[1]));
      for (let m = i; m < j; m++) {
        if (m !== k && order[m].f[1] < p.f[1]) cost++;
      }
      p.cost = cost;
    }
    // Only now add this block, so it counts for larger-f1 blocks only.
    for (let k = i; k < j; k++) {
      add(f2Rank.get(order[k].f[1]));
    }
    i = j;
  }
}

function createSurface(sample, stats) {
  const { nx, ny } = sample.grid;
  const positions = new Float32Array(sample.points.length * 3);
  const colours = new Float32Array(sample.points.length * 3);
  const indices = [];

  for (const point of sample.points) {
    const vertex = point.iy * nx + point.ix;
    const mapped = mapDecision(point, sample.bounds);
    const altitude = altitudeValue(point, stats);
    const height = normalise(altitude, stats.altMin, stats.altMax) * 4.2;
    positions[vertex * 3] = mapped.x;
    positions[vertex * 3 + 1] = height;
    positions[vertex * 3 + 2] = mapped.z;

    const colour = new THREE.Color(pointColour(point, stats));
    colours[vertex * 3] = colour.r;
    colours[vertex * 3 + 1] = colour.g;
    colours[vertex * 3 + 2] = colour.b;
  }

  for (let iy = 0; iy < ny - 1; iy++) {
    for (let ix = 0; ix < nx - 1; ix++) {
      const a = iy * nx + ix;
      const b = a + 1;
      const c = a + nx;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.82,
    metalness: 0.0,
    side: THREE.DoubleSide,
    flatShading: false,
  });

  return new THREE.Mesh(geometry, material);
}

function createOptimalFrontPoints(sample, stats) {
  // The optimal front is the level-0 set for either landscape: under
  // Pareto landscape it is the nondominated level; under cost landscape
  // it is exactly the points with zero dominators.
  const front = sample.points.filter((point) => point.level === 0);
  const positions = new Float32Array(front.length * 3);
  front.forEach((point, index) => {
    const mapped = mapDecision(point, sample.bounds);
    const altitude = altitudeValue(point, stats);
    const height = normalise(altitude, stats.altMin, stats.altMax) * 4.2 + 0.07;
    positions[index * 3] = mapped.x;
    positions[index * 3 + 1] = height;
    positions[index * 3 + 2] = mapped.z;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ size: 0.07, color: FRONT_MARKER, sizeAttenuation: true })
  );
}

function createAxes(sample, stats) {
  const group = new THREE.Group();
  const lineMaterial = new THREE.LineBasicMaterial({ color: AXIS_COLOUR });
  const axisPairs = [
    [new THREE.Vector3(-5.3, 0, -5.3), new THREE.Vector3(5.3, 0, -5.3)],
    [new THREE.Vector3(-5.3, 0, -5.3), new THREE.Vector3(-5.3, 0, 5.3)],
    [new THREE.Vector3(-5.3, 0, -5.3), new THREE.Vector3(-5.3, 4.5, -5.3)],
  ];
  axisPairs.forEach((pair) => {
    const geometry = new THREE.BufferGeometry().setFromPoints(pair);
    group.add(new THREE.Line(geometry, lineMaterial));
  });
  group.add(labelSprite("x\u2081", 5.75, 0, -5.3));
  group.add(labelSprite("x\u2082", -5.3, 0, 5.8));
  group.add(labelSprite(stats.altLabel, -5.4, 5.0, -5.4));
  return group;
}

function drawObjectiveSpace(canvas, points, landscapeType, stats) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const f1Values = points.map((point) => point.f[0]);
  const f2Values = points.map((point) => point.f[1]);
  const f1 = padRange(Math.min(...f1Values), Math.max(...f1Values));
  const f2 = padRange(Math.min(...f2Values), Math.max(...f2Values));
  const margin = { left: 58, right: 22, top: 22, bottom: 50 };

  // gridlines
  ctx.strokeStyle = "#e9e2d4";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const x = lerp(margin.left, width - margin.right, i / 5);
    const y = lerp(height - margin.bottom, margin.top, i / 5);
    ctx.beginPath();
    ctx.moveTo(x, margin.top);
    ctx.lineTo(x, height - margin.bottom);
    ctx.moveTo(margin.left, y);
    ctx.lineTo(width - margin.right, y);
    ctx.stroke();
  }

  // scatter -- worst points first so the optimal front sits on top
  const ordered = [...points].sort((a, b) => keyValue(b, landscapeType) - keyValue(a, landscapeType));
  for (const point of ordered) {
    const x = scale(point.f[0], f1[0], f1[1], margin.left, width - margin.right);
    const y = scale(point.f[1], f2[0], f2[1], height - margin.bottom, margin.top);
    const isFront = point.level === 0;
    ctx.fillStyle = pointColour(point, stats);
    ctx.globalAlpha = isFront ? 0.95 : 0.42;
    ctx.beginPath();
    ctx.arc(x, y, isFront ? 3.0 : 1.8, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // frame + labels
  ctx.strokeStyle = AXIS_COLOUR;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(margin.left, margin.top, width - margin.left - margin.right, height - margin.top - margin.bottom);

  ctx.fillStyle = INK;
  ctx.font = "600 14px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("f\u2081", (margin.left + width - margin.right) / 2, height - 16);
  ctx.save();
  ctx.translate(18, (margin.top + height - margin.bottom) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("f\u2082", 0, 0);
  ctx.restore();
  ctx.textAlign = "left";
}

function writeSummary(summary, sample, stats, landscapeType) {
  const frontCount = sample.points.filter((point) => point.level === 0).length;
  const maxLevel = Math.max(...sample.points.map((point) => point.level));
  const maxCost = Math.max(...sample.points.map((point) => point.cost));
  const f1 = stats.f1;
  const f2 = stats.f2;

  const method = landscapeType === "pareto"
    ? `Height encodes the <strong>non-domination level</strong> (level 1 is the Pareto-optimal front). Higher altitude means a lower level &mdash; better points sit on the peaks.`
    : `Height encodes the <strong>dominance count</strong> (how many sampled points dominate a point). The count is inverted for display so undominated points still sit on the peaks.`;

  const depth = landscapeType === "pareto"
    ? `${maxLevel + 1} non-domination levels`
    : `dominance count up to ${maxCost.toLocaleString()}`;

  summary.innerHTML = `
    <p class="pl-summary-name">${escapeHtml(sample.name)}</p>
    <dl class="pl-stats">
      <div><dt>Family</dt><dd>${escapeHtml(sample.family || "Imported")}</dd></div>
      <div><dt>Samples</dt><dd>${sample.points.length.toLocaleString()}</dd></div>
      <div><dt>Optimal front</dt><dd>${frontCount.toLocaleString()} points</dd></div>
      <div><dt>Structure</dt><dd>${depth}</dd></div>
      <div><dt>f\u2081 range</dt><dd>${format(f1[0])} &ndash; ${format(f1[1])}</dd></div>
      <div><dt>f\u2082 range</dt><dd>${format(f2[0])} &ndash; ${format(f2[1])}</dd></div>
    </dl>
    <p class="pl-summary-method">${method}</p>
    <p class="pl-summary-note">${escapeHtml(sample.note || "")}</p>
  `;
}

function writeLegend(legend, stats, landscapeType) {
  if (landscapeType === "pareto") {
    const shown = Math.min(stats.maxLevel + 1, 6);
    let swatches = "";
    for (let i = 0; i < shown; i++) {
      const label = i === 0 ? "1 (optimal)" : String(i + 1);
      swatches += `<span class="pl-swatch"><i style="background:${LEVEL_COLOURS[i]}"></i>${label}</span>`;
    }
    if (stats.maxLevel + 1 > shown) {
      swatches += `<span class="pl-swatch"><i style="background:${LEVEL_COLOURS[shown - 1]}"></i>&hellip;${stats.maxLevel + 1}</span>`;
    }
    legend.innerHTML = `<span class="pl-legend-title">Level</span>${swatches}`;
  } else {
    legend.innerHTML = `
      <span class="pl-legend-title">Dominators</span>
      <span class="pl-ramp" aria-hidden="true"></span>
      <span class="pl-ramp-end">0</span>
      <span class="pl-ramp-end">${stats.maxCost.toLocaleString()}</span>`;
  }
}

function getStats(points, landscapeType) {
  const f1Values = points.map((point) => point.f[0]);
  const f2Values = points.map((point) => point.f[1]);
  const maxLevel = Math.max(...points.map((point) => point.level));
  const maxCost = Math.max(...points.map((point) => point.cost));

  // altitude: higher == better for BOTH landscapes (optima on peaks)
  const altitudes = points.map((point) =>
    landscapeType === "pareto" ? -point.level : -point.cost
  );
  return {
    landscapeType,
    f1: [Math.min(...f1Values), Math.max(...f1Values)],
    f2: [Math.min(...f2Values), Math.max(...f2Values)],
    maxLevel,
    maxCost,
    altMin: Math.min(...altitudes),
    altMax: Math.max(...altitudes),
    altLabel: landscapeType === "pareto" ? "non-domination level" : "dominance count",
  };
}

function altitudeValue(point, stats) {
  return stats.landscapeType === "pareto" ? -point.level : -point.cost;
}

function keyValue(point, landscapeType) {
  return landscapeType === "pareto" ? point.level : point.cost;
}

function pointColour(point, stats) {
  if (stats.landscapeType === "pareto") {
    return LEVEL_COLOURS[point.level % LEVEL_COLOURS.length];
  }
  const t = stats.maxCost > 0 ? point.cost / stats.maxCost : 0;
  // invert so 0 dominators (optimal) gets the strong accent
  return rampColour(1 - t);
}

function rampColour(t) {
  const clamped = Math.min(1, Math.max(0, t));
  for (let i = 1; i < COST_STOPS.length; i++) {
    if (clamped <= COST_STOPS[i].t) {
      const a = COST_STOPS[i - 1];
      const b = COST_STOPS[i];
      const local = (clamped - a.t) / (b.t - a.t || 1);
      const r = Math.round(lerp(a.c[0], b.c[0], local));
      const g = Math.round(lerp(a.c[1], b.c[1], local));
      const bl = Math.round(lerp(a.c[2], b.c[2], local));
      return `rgb(${r}, ${g}, ${bl})`;
    }
  }
  const last = COST_STOPS[COST_STOPS.length - 1].c;
  return `rgb(${last[0]}, ${last[1]}, ${last[2]})`;
}

function safeObjectives(values) {
  return values.map((value) => (Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER));
}

function mapDecision(point, bounds) {
  return {
    x: scale(point.x1, bounds.x1[0], bounds.x1[1], -5, 5),
    z: scale(point.x2, bounds.x2[0], bounds.x2[1], -5, 5),
  };
}

function parseCsvSamples(text, name) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error("Use headers x1,x2,f1,f2 and at least one data row.");
  const headers = lines[0].split(",").map((value) => value.trim().toLowerCase());
  const required = ["x1", "x2", "f1", "f2"];
  const indexes = Object.fromEntries(required.map((key) => [key, headers.indexOf(key)]));
  if (Object.values(indexes).some((index) => index < 0)) {
    throw new Error("Missing one of the required headers: x1, x2, f1, f2.");
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map(Number);
    const x1 = cells[indexes.x1];
    const x2 = cells[indexes.x2];
    const f1 = cells[indexes.f1];
    const f2 = cells[indexes.f2];
    if ([x1, x2, f1, f2].every(Number.isFinite)) {
      rows.push({ x1, x2, f: [f1, f2] });
    }
  }
  if (rows.length === 0) throw new Error("No numeric rows were found.");

  const xs = uniqueSorted(rows.map((row) => row.x1));
  const ys = uniqueSorted(rows.map((row) => row.x2));
  if (xs.length * ys.length !== rows.length) {
    throw new Error("The 3D surface expects a complete x1 by x2 grid.");
  }

  const xIndex = new Map(xs.map((value, index) => [String(value), index]));
  const yIndex = new Map(ys.map((value, index) => [String(value), index]));
  rows.forEach((row) => {
    row.ix = xIndex.get(String(row.x1));
    row.iy = yIndex.get(String(row.x2));
  });
  rows.sort((a, b) => (a.iy - b.iy) || (a.ix - b.ix));

  return {
    name: `Imported CSV: ${name}`,
    family: "Official / local data",
    bounds: { x1: [xs[0], xs[xs.length - 1]], x2: [ys[0], ys[ys.length - 1]] },
    note: "Loaded from CSV. Expected columns are x1,x2,f1,f2 on a complete rectangular grid.",
    points: rows,
    grid: { nx: xs.length, ny: ys.length },
  };
}

function labelSprite(text, x, y, z, worldHeight = 0.42) {
  const canvas = document.createElement("canvas");
  const fontPx = 34;
  const pad = 10;
  const measure = canvas.getContext("2d");
  measure.font = `600 ${fontPx}px system-ui, -apple-system, Segoe UI, sans-serif`;
  const textWidth = Math.ceil(measure.measureText(text).width);
  canvas.width = textWidth + pad * 2;
  canvas.height = fontPx + pad * 2;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = INK;
  ctx.font = `600 ${fontPx}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillText(text, pad, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, y, z);
  // keep text legible: world width follows the canvas aspect ratio
  sprite.scale.set(worldHeight * (canvas.width / canvas.height), worldHeight, 1);
  return sprite;
}

/* ---- benchmark definitions (browser translations of minijmetal) ----- */

function zdtBase(x1, x2, h) {
  const g = 1 + 9 * x2;
  return [x1, g * h(x1, g)];
}

function zdt4(x1, x2) {
  const g = 1 + 10 + x2 * x2 - 10 * Math.cos(4 * Math.PI * x2);
  return [x1, g * (1 - Math.sqrt(x1 / g))];
}

function zdt6(x1, x2) {
  const f1 = 1 - Math.exp(-4 * x1) * Math.pow(Math.sin(6 * Math.PI * x1), 6);
  const g = 1 + 9 * Math.pow(x2, 0.25);
  return [f1, g * (1 - Math.pow(f1 / g, 2))];
}

function dtlz1(x1, x2) {
  const g = 100 * (1 + Math.pow(x2 - 0.5, 2) - Math.cos(20 * Math.PI * (x2 - 0.5)));
  return [0.5 * (1 + g) * x1, 0.5 * (1 + g) * (1 - x1)];
}

function dtlz2Like(x1, x2, rugged) {
  const base = Math.pow(x2 - 0.5, 2);
  const g = rugged ? 100 * (1 + base - Math.cos(20 * Math.PI * (x2 - 0.5))) : base;
  return [(1 + g) * Math.cos((x1 * Math.PI) / 2), (1 + g) * Math.sin((x1 * Math.PI) / 2)];
}

function dtlz7(x1, x2) {
  const f1 = x1;
  const g = 1 + 9 * x2;
  const h = 2 - (f1 / (1 + g)) * (1 + Math.sin(3 * Math.PI * f1));
  return [f1, (1 + g) * h];
}

function uf1Slice(x1, x2) {
  const n = 3;
  const y2 = x2 - Math.sin(6 * Math.PI * x1 + (2 * Math.PI) / n);
  const x3Ideal = Math.sin(6 * Math.PI * x1 + Math.PI);
  const y3 = x3Ideal - Math.sin(6 * Math.PI * x1 + (3 * Math.PI) / n);
  return [x1 + 2 * y3 * y3, 1 - Math.sqrt(x1) + 2 * y2 * y2];
}

function uf2Slice(x1, x2) {
  const n = 3;
  const amplitude2 = 0.3 * x1 * x1 * Math.cos(24 * Math.PI * x1 + (8 * Math.PI) / n) + 0.6 * x1;
  const amplitude3 = 0.3 * x1 * x1 * Math.cos(24 * Math.PI * x1 + (12 * Math.PI) / n) + 0.6 * x1;
  const y2 = x2 - amplitude2 * Math.sin(6 * Math.PI * x1 + (2 * Math.PI) / n);
  const x3Ideal = amplitude3 * Math.cos(6 * Math.PI * x1 + (3 * Math.PI) / n);
  const y3 = x3Ideal - amplitude3 * Math.cos(6 * Math.PI * x1 + (3 * Math.PI) / n);
  return [x1 + 2 * y3 * y3, 1 - Math.sqrt(x1) + 2 * y2 * y2];
}

function wfg1(x1, x2) {
  const y = wfgNormalise([x1, x2]).map((value, index) => (index === 0 ? value : sLinear(value, 0.35)));
  const t2 = [y[0], bFlat(y[1], 0.8, 0.75, 0.85)];
  const t3 = t2.map((value) => Math.pow(value, 0.02));
  const t4 = [t3[0], t3[1]];
  const x = wfgCalculateX(t4, [1]);
  return [x[1] + 2 * convex(x, 1), x[1] + 4 * mixed(x, 5, 1)];
}

function wfg4(x1, x2) {
  const t1 = wfgNormalise([x1, x2]).map((value) => sMulti(value, 30, 10, 0.35));
  const t2 = [t1[0], t1[1]];
  const x = wfgCalculateX(t2, [1]);
  return [x[1] + 2 * concave(x, 1), x[1] + 4 * concave(x, 2)];
}

function wfgNormalise(values) {
  return values.map((value, index) => correct01(value / (2 * (index + 1))));
}

function wfgCalculateX(t, a) {
  return [Math.max(t[1], a[0]) * (t[0] - 0.5) + 0.5, t[1]];
}

function correct01(value) {
  if (value < 0 && value > -1e-10) return 0;
  if (value > 1 && value < 1 + 1e-10) return 1;
  return value;
}

function sLinear(y, a) {
  return correct01(Math.abs(y - a) / Math.abs(Math.floor(a - y) + a));
}

function bFlat(y, a, b, c) {
  const tmp1 = (Math.min(0, Math.floor(y - b)) * a * (b - y)) / b;
  const tmp2 = (Math.min(0, Math.floor(c - y)) * (1 - a) * (y - c)) / (1 - c);
  return correct01(a + tmp1 - tmp2);
}

function sMulti(y, a, b, c) {
  const denominator = 2 * (Math.floor(c - y) + c);
  const tmp1 = (4 * a + 2) * Math.PI * (0.5 - Math.abs(y - c) / denominator);
  const tmp2 = 4 * b * Math.pow(Math.abs(y - c) / denominator, 2);
  return correct01((1 + Math.cos(tmp1) + tmp2) / (b + 2));
}

function convex(x, m) {
  if (m === 1) return 1 - Math.cos((x[0] * Math.PI) / 2);
  return 1 - Math.sin((x[0] * Math.PI) / 2);
}

function concave(x, m) {
  if (m === 1) return Math.sin((x[0] * Math.PI) / 2);
  return Math.cos((x[0] * Math.PI) / 2);
}

function mixed(x, a, alpha) {
  const tmp = Math.cos(2 * a * Math.PI * x[0] + Math.PI / 2) / (2 * a * Math.PI);
  return Math.pow(1 - x[0] - tmp, alpha);
}

function sphere(x1, x2) {
  return x1 * x1 + x2 * x2;
}

function rastrigin(x1, x2) {
  return 20 + x1 * x1 - 10 * Math.cos(TAU * x1) + x2 * x2 - 10 * Math.cos(TAU * x2);
}

function ellipsoid(x1, x2) {
  return x1 * x1 + 1000 * x2 * x2;
}

function rosenbrock(x1, x2) {
  return 100 * Math.pow(x2 - x1 * x1, 2) + Math.pow(1 - x1, 2);
}

function ackley(x1, x2) {
  const a = -20 * Math.exp(-0.2 * Math.sqrt(0.5 * (x1 * x1 + x2 * x2)));
  const b = -Math.exp(0.5 * (Math.cos(TAU * x1) + Math.cos(TAU * x2)));
  return a + b + Math.E + 20;
}

const unitBounds = { x1: [0, 1], x2: [0, 1] };

const PROBLEMS = [
  {
    id: "zdt1",
    family: "ZDT",
    name: "ZDT1 \u00b7 2 variables",
    bounds: unitBounds,
    evaluate: (x1, x2) => zdtBase(x1, x2, (f, g) => 1 - Math.sqrt(f / g)),
    note: "Convex Pareto front; x2 controls distance from the front.",
  },
  {
    id: "zdt2",
    family: "ZDT",
    name: "ZDT2 \u00b7 2 variables",
    bounds: unitBounds,
    evaluate: (x1, x2) => zdtBase(x1, x2, (f, g) => 1 - Math.pow(f / g, 2)),
    note: "Concave front; the objective-space view makes the curvature clear.",
  },
  {
    id: "zdt3",
    family: "ZDT",
    name: "ZDT3 \u00b7 2 variables",
    bounds: unitBounds,
    evaluate: (x1, x2) => zdtBase(x1, x2, (f, g) => 1 - Math.sqrt(f / g) - (f / g) * Math.sin(10 * Math.PI * f)),
    note: "Disconnected front; useful for checking whether a visualisation preserves gaps.",
  },
  {
    id: "zdt4",
    family: "ZDT",
    name: "ZDT4 \u00b7 2 variables",
    bounds: { x1: [0, 1], x2: [-5, 5] },
    evaluate: zdt4,
    note: "Rugged distance landscape from the cosine term in x2.",
  },
  {
    id: "zdt6",
    family: "ZDT",
    name: "ZDT6 \u00b7 2 variables",
    bounds: unitBounds,
    evaluate: zdt6,
    note: "Non-uniform f1 mapping; front sampling is visibly biased.",
  },
  {
    id: "dtlz1",
    family: "DTLZ",
    name: "DTLZ1 \u00b7 2 objectives, 2 variables",
    bounds: unitBounds,
    evaluate: dtlz1,
    note: "Linear Pareto front with a rugged distance variable.",
  },
  {
    id: "dtlz2",
    family: "DTLZ",
    name: "DTLZ2 \u00b7 2 objectives, 2 variables",
    bounds: unitBounds,
    evaluate: (x1, x2) => dtlz2Like(x1, x2, false),
    note: "Quarter-circle front; a clean reference shape.",
  },
  {
    id: "dtlz3",
    family: "DTLZ",
    name: "DTLZ3 \u00b7 2 objectives, 2 variables",
    bounds: unitBounds,
    evaluate: (x1, x2) => dtlz2Like(x1, x2, true),
    note: "DTLZ2 geometry with DTLZ1-style multimodal distance.",
  },
  {
    id: "dtlz7",
    family: "DTLZ",
    name: "DTLZ7 \u00b7 2 objectives, 2 variables",
    bounds: unitBounds,
    evaluate: dtlz7,
    note: "Disconnected Pareto structure driven by the sinusoidal h term.",
  },
  {
    id: "uf1",
    family: "UF",
    name: "UF1 \u00b7 two-coordinate slice",
    bounds: { x1: [0, 1], x2: [-1, 1] },
    evaluate: uf1Slice,
    note: "UF needs odd/even parity groups, so this varies x1 and x2 while fixing the odd partner on its ideal manifold.",
  },
  {
    id: "uf2",
    family: "UF",
    name: "UF2 \u00b7 two-coordinate slice",
    bounds: { x1: [0, 1], x2: [-1, 1] },
    evaluate: uf2Slice,
    note: "A two-coordinate UF2 slice with the companion coordinate fixed to its ideal cosine relation.",
  },
  {
    id: "wfg1",
    family: "WFG",
    name: "WFG1 \u00b7 k=1, l=1, M=2",
    bounds: { x1: [0, 2], x2: [0, 4] },
    evaluate: wfg1,
    note: "Browser translation of the WFG1 transformations with one position and one distance variable.",
  },
  {
    id: "wfg4",
    family: "WFG",
    name: "WFG4 \u00b7 k=1, l=1, M=2",
    bounds: { x1: [0, 2], x2: [0, 4] },
    evaluate: wfg4,
    note: "Multimodal WFG4 transformation in a compact two-variable form.",
  },
  {
    id: "bbob-sphere-rastrigin",
    family: "BBOB proxy",
    name: "Sphere vs Rastrigin",
    bounds: { x1: [-5, 5], x2: [-5, 5] },
    evaluate: (x1, x2) => [sphere(x1 + 1, x2 - 1), rastrigin(x1 - 1.5, x2 + 0.5)],
    note: "A lightweight BBOB-style proxy, not an official COCO instance. Use the CSV loader for official bbob-biobj data.",
  },
  {
    id: "bbob-rosen-ackley",
    family: "BBOB proxy",
    name: "Rosenbrock vs Ackley",
    bounds: { x1: [-3, 3], x2: [-3, 3] },
    evaluate: (x1, x2) => [rosenbrock(x1, x2), ackley(x1 - 0.8, x2 + 0.8)],
    note: "Contrasts a curved valley with a broad multimodal basin; not an official COCO instance.",
  },
  {
    id: "bbob-ellipsoid-rastrigin",
    family: "BBOB proxy",
    name: "Ellipsoid vs Rastrigin",
    bounds: { x1: [-5, 5], x2: [-5, 5] },
    evaluate: (x1, x2) => [ellipsoid(x1 + 0.4, x2 - 0.2), rastrigin(x1 - 1.2, x2 + 1.4)],
    note: "Shows conditioning versus multimodality. For official data, upload a COCO-generated CSV.",
  },
];

function getProblem(id) {
  return PROBLEMS.find((problem) => problem.id === id) || PROBLEMS[0];
}

function groupBy(values, keyFunction) {
  const groups = new Map();
  values.forEach((value) => {
    const key = keyFunction(value);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(value);
  });
  return groups;
}

function uniqueSorted(values) {
  return [...new Set(values.map((value) => String(value)))].map(Number).sort((a, b) => a - b);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function scale(value, inMin, inMax, outMin, outMax) {
  if (Math.abs(inMax - inMin) < 1e-12) return (outMin + outMax) / 2;
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

function normalise(value, min, max) {
  if (Math.abs(max - min) < 1e-12) return 0.5;
  return (value - min) / (max - min);
}

function padRange(min, max) {
  if (Math.abs(max - min) < 1e-12) return [min - 1, max + 1];
  const pad = (max - min) * 0.06;
  return [min - pad, max + pad];
}

function format(value) {
  if ((Math.abs(value) >= 1000 || (Math.abs(value) < 0.001 && value !== 0))) {
    return value.toExponential(2);
  }
  return value.toFixed(3);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function injectStyles() {
  if (document.getElementById("problem-landscape-styles")) return;
  const style = document.createElement("style");
  style.id = "problem-landscape-styles";
  style.textContent = `
    .pl-shell {
      --pl-ink: #3a3327;
      --pl-muted: #6f6552;
      --pl-line: #ddd2bc;
      --pl-line-soft: #ece3d2;
      --pl-bg: #fbf8f2;
      --pl-panel: #ffffff;
      --pl-accent: #b9472f;
      --pl-accent-dark: #99371f;
      margin: 1.6rem 0 0.5rem;
      border: 1px solid var(--pl-line);
      border-radius: 12px;
      overflow: hidden;
      background: var(--pl-bg);
      box-shadow: 0 1px 2px rgba(58, 51, 39, 0.04), 0 8px 24px rgba(58, 51, 39, 0.06);
      font-size: 15px;
    }

    .pl-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.85rem 1.1rem;
      align-items: flex-end;
      padding: 1rem 1.15rem;
      border-bottom: 1px solid var(--pl-line);
      background: linear-gradient(180deg, #f6efe1, #f1e8d6);
    }

    .pl-field {
      display: flex;
      flex-direction: column;
      gap: 0.32rem;
      margin: 0;
      min-width: 11rem;
    }

    .pl-field--grid { min-width: 13rem; flex: 1 1 13rem; }
    .pl-field--file { min-width: 12rem; }

    .pl-field-label {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--pl-muted);
    }

    .pl-field-label em {
      font-style: normal;
      font-weight: 600;
      color: var(--pl-accent-dark);
      text-transform: none;
      letter-spacing: 0;
    }

    .pl-shell select,
    .pl-shell input[type="file"],
    .pl-shell button {
      font: inherit;
      font-size: 0.9rem;
    }

    .pl-shell select {
      appearance: none;
      -webkit-appearance: none;
      border: 1px solid var(--pl-line);
      background-color: var(--pl-panel);
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' fill='none' stroke='%236f6552' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/></svg>");
      background-repeat: no-repeat;
      background-position: right 0.7rem center;
      color: var(--pl-ink);
      border-radius: 7px;
      padding: 0.46rem 2rem 0.46rem 0.65rem;
      cursor: pointer;
      min-height: 2.3rem;
    }

    .pl-shell select:focus-visible,
    .pl-shell button:focus-visible {
      outline: 2px solid var(--pl-accent);
      outline-offset: 1px;
    }

    .pl-shell input[type="range"] {
      width: 100%;
      accent-color: var(--pl-accent);
      cursor: pointer;
      margin: 0.55rem 0 0;
    }

    .pl-shell input[type="file"] {
      font-size: 0.8rem;
      color: var(--pl-muted);
      max-width: 100%;
    }
    .pl-shell input[type="file"]::file-selector-button {
      font: inherit;
      font-size: 0.8rem;
      margin-right: 0.55rem;
      padding: 0.4rem 0.7rem;
      border: 1px solid var(--pl-line);
      border-radius: 6px;
      background: var(--pl-panel);
      color: var(--pl-ink);
      cursor: pointer;
    }

    .pl-sample {
      border: 1px solid var(--pl-accent-dark);
      background: var(--pl-accent);
      color: #fff;
      border-radius: 7px;
      padding: 0.52rem 1.1rem;
      min-height: 2.3rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .pl-sample:hover { background: var(--pl-accent-dark); }

    .pl-workspace {
      display: grid;
      grid-template-columns: minmax(0, 1.55fr) minmax(19rem, 0.78fr);
    }

    .pl-stage {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .pl-plot {
      min-height: 33rem;
      flex: 1;
      background: var(--pl-bg);
    }
    .pl-plot canvas { display: block; width: 100%; height: 100%; }

    .pl-stage-foot {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem 1rem;
      padding: 0.6rem 1.05rem;
      border-top: 1px solid var(--pl-line-soft);
      background: var(--pl-panel);
    }

    .pl-hint {
      font-size: 0.78rem;
      color: var(--pl-muted);
    }

    .pl-legend {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      font-size: 0.78rem;
      color: var(--pl-ink);
    }
    .pl-legend-title {
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-size: 0.68rem;
      color: var(--pl-muted);
    }
    .pl-swatch {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    .pl-swatch i {
      width: 0.78rem;
      height: 0.78rem;
      border-radius: 3px;
      display: inline-block;
    }
    .pl-ramp {
      width: 7rem;
      height: 0.7rem;
      border-radius: 4px;
      display: inline-block;
      background: linear-gradient(90deg, #b9472f, #b09766, #5b6173);
    }
    .pl-ramp-end { font-variant-numeric: tabular-nums; }

    .pl-side {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      padding: 1.05rem;
      border-left: 1px solid var(--pl-line);
      background: linear-gradient(180deg, #f8f2e6, #fbf8f2);
    }

    .pl-panel {
      background: var(--pl-panel);
      border: 1px solid var(--pl-line-soft);
      border-radius: 9px;
      padding: 0.85rem 0.9rem;
    }

    .pl-panel-title {
      margin: 0 0 0.6rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--pl-muted);
    }

    .pl-objectives {
      width: 100%;
      height: auto;
      display: block;
      border: 1px solid var(--pl-line-soft);
      border-radius: 6px;
      background: #fff;
    }

    .pl-summary-name {
      margin: 0 0 0.6rem;
      font-size: 1.02rem;
      font-weight: 700;
      color: var(--pl-ink);
    }

    .pl-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem 0.9rem;
      margin: 0 0 0.75rem;
    }
    .pl-stats div { display: flex; flex-direction: column; gap: 0.05rem; }
    .pl-stats dt {
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--pl-muted);
    }
    .pl-stats dd {
      margin: 0;
      font-size: 0.9rem;
      color: var(--pl-ink);
      font-variant-numeric: tabular-nums;
    }

    .pl-summary-method,
    .pl-summary-note {
      margin: 0.45rem 0 0;
      font-size: 0.85rem;
      line-height: 1.5;
      color: #564d3d;
    }
    .pl-summary-method strong { color: var(--pl-accent-dark); }
    .pl-summary-note {
      padding-top: 0.55rem;
      border-top: 1px dashed var(--pl-line);
      color: var(--pl-muted);
    }
    .pl-error { color: var(--pl-accent-dark); font-size: 0.88rem; margin: 0; }

    @media (max-width: 900px) {
      .pl-workspace { grid-template-columns: 1fr; }
      .pl-side {
        border-left: 0;
        border-top: 1px solid var(--pl-line);
      }
      .pl-plot { min-height: 26rem; }
    }
  `;
  document.head.appendChild(style);
}

const root = document.getElementById("landscape-visualiser");

if (root) {
  injectStyles();
  boot(root);
}
