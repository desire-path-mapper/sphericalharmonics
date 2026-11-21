const ye = {
  theta: 0.1,
  phaseVotes: "upto",
  ghosts: "after",
  phases: "stack",
  budget: 5e3,
  split: !0
};
function He(t, e) {
  return Math.sqrt(t * t + e * e);
}
function cn(t, e) {
  if (t.length <= 2) return t.slice();
  const n = new Uint8Array(t.length);
  n[0] = 1, n[t.length - 1] = 1;
  const r = [[0, t.length - 1]];
  for (; r.length; ) {
    const [s, i] = r.pop();
    let o = -1, a = e;
    for (let c = s + 1; c < i; c++) {
      const l = un(t[c][0], t[c][1], t[s][0], t[s][1], t[i][0], t[i][1]);
      l > a && (a = l, o = c);
    }
    o >= 0 && (n[o] = 1, r.push([s, o], [o, i]));
  }
  return t.filter((s, i) => n[i]);
}
function dn(t, e, n, r, s, i) {
  const o = s - n, a = i - r, c = o * o + a * a;
  return c > 0 ? ((t - n) * o + (e - r) * a) / c : 0;
}
function un(t, e, n, r, s, i) {
  const o = Math.max(0, Math.min(1, dn(t, e, n, r, s, i)));
  return He(t - (n + (s - n) * o), e - (r + (i - r) * o));
}
function hn(t, e) {
  const n = t.length, r = (c) => {
    const l = t[c], d = t[c + 1], h = He(d[0] - l[0], d[1] - l[1]) || 1;
    return [(d[0] - l[0]) / h, (d[1] - l[1]) / h];
  }, s = [], i = [], o = [];
  for (let c = 0; c < n; c++) {
    const l = r(Math.max(0, c - 1)), d = r(Math.min(n - 2, c));
    let h = -(l[1] + d[1]), m = l[0] + d[0];
    const y = He(h, m);
    let v = l[0] + d[0], g = l[1] + d[1];
    const M = He(v, g);
    y < 1e-9 || M < 1e-9 ? (h = -l[1], m = l[0], v = l[0], g = l[1]) : (h /= y, m /= y, v /= M, g /= M);
    const T = e / Math.max(0.5, h * -d[1] + m * d[0]), Z = c === 0 ? -e : c === n - 1 ? e : 0, $ = t[c][0] + d[0] * (c === 0 ? Z : 0) + l[0] * (c === n - 1 ? Z : 0), B = t[c][1] + d[1] * (c === 0 ? Z : 0) + l[1] * (c === n - 1 ? Z : 0);
    s.push([$ + h * T, B + m * T]), i.push([$ - h * T, B - m * T]), o.push([v, g]);
  }
  const a = (c) => {
    const l = [c[0]];
    for (let d = 1; d < c.length; d++) {
      const h = l[l.length - 1];
      ((c[d][0] - h[0]) * o[d][0] + (c[d][1] - h[1]) * o[d][1] > 0 || d === c.length - 1) && l.push(c[d]);
    }
    return l;
  };
  return a(s).concat(a(i).reverse());
}
const Ke = 64, pn = Math.sqrt(2 * Math.PI / (Ke * Math.sin(2 * Math.PI / Ke))), fn = 8, mn = 128, gn = 16384, Xe = 10, xt = (t) => Math.min(100, Math.max(0.05, t));
function qt(t) {
  if (!Number.isFinite(t.widthM)) return null;
  const e = xt(t.widthM);
  if (t.kind === "line") {
    const y = t.coords.filter((T) => Number.isFinite(T[0]) && Number.isFinite(T[1])).map((T) => [T[0], T[1], 0]), v = y.filter((T, Z) => Z === 0 || T[0] !== y[Z - 1][0] || T[1] !== y[Z - 1][1]);
    if (v.length < 2) return null;
    const g = hn(cn(v, Math.min(0.02, e / 50)), e / 2), M = { kind: "path", ...Mt(g), area: 0, thick: e, poly: g, cx: 0, cy: 0, r: 0, hu: 0, hv: 0, cos: 1, sin: 0 };
    return M.area = Bt(M, M, M.minY, M.maxY, e), M;
  }
  const n = t.coords[0];
  if (!n || !Number.isFinite(n[0]) || !Number.isFinite(n[1])) return null;
  const [r, s] = n;
  if (t.shape !== "square") {
    const y = e / 2, v = y * pn, g = [];
    for (let M = 0; M < Ke; M++) {
      const T = 2 * Math.PI * M / Ke;
      g.push([r + v * Math.cos(T), s + v * Math.sin(T)]);
    }
    return { kind: "circle", minX: r - y, minY: s - y, maxX: r + y, maxY: s + y, area: Math.PI * y * y, thick: e, poly: g, cx: r, cy: s, r: y, hu: 0, hv: 0, cos: 1, sin: 0 };
  }
  const i = t.lengthM !== void 0 && Number.isFinite(t.lengthM) && t.lengthM > 0 ? xt(t.lengthM) : e, o = (t.rotationDeg ?? 0) * Math.PI / 180 || 0, a = Math.cos(o), c = Math.sin(o), l = e / 2, d = i / 2, h = (y, v) => [r + y * a + v * c, s - y * c + v * a], m = [h(-l, -d), h(l, -d), h(l, d), h(-l, d)];
  return { kind: "rect", ...Mt(m), area: e * i, thick: Math.min(e, i), poly: m, cx: r, cy: s, r: 0, hu: l, hv: d, cos: a, sin: c };
}
function Mt(t) {
  let e = 1 / 0, n = 1 / 0, r = -1 / 0, s = -1 / 0;
  for (const [i, o] of t)
    i < e && (e = i), i > r && (r = i), o < n && (n = o), o > s && (s = o);
  return { minX: e, minY: n, maxX: r, maxY: s };
}
function yn(t) {
  let e = 0;
  for (let n = 0, r = t.length - 1; n < t.length; r = n++) e += t[r][0] * t[n][1] - t[n][0] * t[r][1];
  return e / 2;
}
function vn(t, e) {
  let n = t;
  for (let r = 0, s = e.length - 1; r < e.length && n.length; s = r++) {
    const [i, o] = e[s], [a, c] = e[r], l = a - i, d = c - o, h = (g) => l * (g[1] - o) - d * (g[0] - i), m = n;
    n = [];
    let y = m[m.length - 1], v = h(y);
    for (const g of m) {
      const M = h(g);
      M >= 0 ? (v < 0 && n.push(At(y, g, v, M)), n.push(g)) : v >= 0 && n.push(At(y, g, v, M)), y = g, v = M;
    }
  }
  return n;
}
function At(t, e, n, r) {
  const s = n / (n - r);
  return [t[0] + (e[0] - t[0]) * s, t[1] + (e[1] - t[1]) * s];
}
function Tt(t, e, n, r, s) {
  if (n.length = 0, e < t.minY || e >= t.maxY) return;
  if (t.kind === "circle") {
    const l = t.r * t.r - (e - t.cy) ** 2;
    l > 0 && n.push(t.cx - Math.sqrt(l), t.cx + Math.sqrt(l));
    return;
  }
  r.length = 0, s.length = 0;
  const i = t.poly;
  for (let l = 0, d = i.length - 1; l < i.length; d = l++) {
    const [h, m] = i[d], [y, v] = i[l];
    (m <= e ? v > e : v <= e) && (r.push(h + (e - m) * (y - h) / (v - m)), s.push(v > m ? 1 : -1));
  }
  if (r.length === 2) {
    const l = r[0], d = r[1];
    l !== d && n.push(Math.min(l, d), Math.max(l, d));
    return;
  }
  const o = r.map((l, d) => d).sort((l, d) => r[l] - r[d]);
  let a = 0, c = 0;
  for (const l of o) {
    const d = a;
    a += s[l], d === 0 && a !== 0 ? c = r[l] : d !== 0 && a === 0 && r[l] > c && (n.length && n[n.length - 1] >= c ? n[n.length - 1] = r[l] : n.push(c, r[l]));
  }
}
function bn(t, e) {
  let n = 0, r = 0, s = 0;
  for (; r < t.length && s < e.length; ) {
    const i = Math.max(t[r], e[s]), o = Math.min(t[r + 1], e[s + 1]);
    o > i && (n += o - i), t[r + 1] < e[s + 1] ? r += 2 : s += 2;
  }
  return n;
}
const ve = [], ct = [], Lt = [], It = [];
function Bt(t, e, n, r, s) {
  const i = Math.min(gn, Math.max(mn, Math.ceil((r - n) * fn / s))), o = (r - n) / i;
  let a = 0;
  for (let c = 0; c < i; c++) {
    const l = n + (c + 0.5) * o;
    if (Tt(t, l, ve, Lt, It), !!ve.length) {
      if (e === t) {
        for (let d = 0; d < ve.length; d += 2) a += ve[d + 1] - ve[d];
        continue;
      }
      Tt(e, l, ct, Lt, It), ct.length && (a += bn(ve, ct));
    }
  }
  return a * o;
}
function kn(t, e) {
  const n = Math.max(t.minX, e.minX), r = Math.min(t.maxX, e.maxX), s = Math.max(t.minY, e.minY), i = Math.min(t.maxY, e.maxY);
  return n >= r || s >= i ? 0 : t.kind !== "path" && e.kind !== "path" ? Math.abs(yn(vn(t.poly, e.poly))) : Bt(t, e, s, i, Math.min(t.thick, e.thick));
}
function zt(t, e, n, r) {
  return t > r * Math.min(e, n) * (1 + 1e-9);
}
const wn = /* @__PURE__ */ new Map(), _n = (t, e) => (t + 32768) * 65536 + (e + 32768);
class bt {
  entries = /* @__PURE__ */ new Map();
  grid = /* @__PURE__ */ new Map();
  /** How many pairs have been measured exactly (for tests and the timing check). */
  measured = 0;
  /** Bring every given proposal up to date; ids not given are kept until forgotten. */
  sync(e) {
    for (const n of e) this.ensure(n);
  }
  /** The shared area of two proposals in m², measured once and kept. */
  overlapM2(e, n) {
    return this.ensure(e), this.ensure(n), this.entries.get(e.id).nb.get(n.id) ?? 0;
  }
  /** Whether two proposals conflict: neither is a removal and they share over theta of the smaller one's area. */
  conflicts(e, n, r = 0.1) {
    if (e.removal || n.removal || e.id === n.id) return !1;
    const s = this.overlapM2(e, n);
    return s > 0 && zt(s, this.area(e.id), this.area(n.id), r);
  }
  /** Everything the table knows overlaps this id, with the shared area. */
  neighbours(e) {
    return this.entries.get(e)?.nb ?? wn;
  }
  /** The id's footprint area in m² (0 when it has none or is unknown). */
  area(e) {
    return this.entries.get(e)?.fp?.area ?? 0;
  }
  forget(e) {
    const n = this.entries.get(e);
    if (n) {
      for (const r of n.cells) {
        const s = this.grid.get(r), i = s.indexOf(e);
        s.splice(i, 1), s.length || this.grid.delete(r);
      }
      for (const r of n.nb.keys()) this.entries.get(r)?.nb.delete(e);
      this.entries.delete(e);
    }
  }
  ensure(e) {
    const n = this.entries.get(e.id);
    if (n && n.key === e.geometryKey) return;
    n && this.forget(e.id);
    const r = qt(e), s = { key: e.geometryKey, fp: r, cells: [], nb: /* @__PURE__ */ new Map() };
    if (this.entries.set(e.id, s), !r) return;
    const i = /* @__PURE__ */ new Set(), o = Math.floor(r.minX / Xe), a = Math.floor(r.maxX / Xe), c = Math.floor(r.minY / Xe), l = Math.floor(r.maxY / Xe);
    for (let d = c; d <= l; d++)
      for (let h = o; h <= a; h++) {
        const m = _n(h, d);
        s.cells.push(m);
        let y = this.grid.get(m);
        y || this.grid.set(m, y = []);
        for (const v of y) {
          if (i.has(v)) continue;
          i.add(v);
          const g = this.entries.get(v), M = g.fp;
          if (M.minX >= r.maxX || M.maxX <= r.minX || M.minY >= r.maxY || M.maxY <= r.minY) continue;
          this.measured++;
          const T = kn(r, M);
          T > 0 && (s.nb.set(v, T), g.nb.set(e.id, T));
        }
        y.push(e.id);
      }
  }
}
const xn = [], de = (t, e, n) => n === "upto" ? t <= e : t === e, St = (t) => typeof t == "number" && t >= 1 ? Math.floor(t) : 1;
class Mn {
  n;
  /** Joint index → its members' proposal indices (known ones only), ascending. */
  jointMembers = [];
  direct;
  ghost;
  hasPlus;
  /** Every phase a counted vote was cast in, plain or joint, ascending: the phases at which a count can change. */
  phases;
  /** The last phase any vote on p, plain or joint, was cast in (0: none): past it p's own votes change no more. */
  lastPhase;
  /** ids: the proposals, in the order their indices follow. Votes on other ids are ignored. */
  constructor(e, n, r, s) {
    if (this.n = e.length, !s) {
      const w = /* @__PURE__ */ new Map();
      e.forEach((L, P) => w.set(L, P)), s = w;
    }
    this.hasPlus = new Uint8Array(this.n);
    const i = n.length, o = new Int32Array(i), a = new Array(i), c = new Int32Array(i), l = new Int32Array(i);
    let d = 0, h = null, m;
    for (let w = 0; w < i; w++) {
      const L = n[w], P = L.proposalId === h ? m : m = s.get(h = L.proposalId);
      P === void 0 || L.dir !== 1 && L.dir !== -1 || (o[d] = P, a[d] = L.userId, c[d] = L.dir, l[d++] = St(L.phase), L.dir === 1 && (this.hasPlus[P] = 1));
    }
    this.direct = Et(this.n, d, o, a, c, l);
    const y = /* @__PURE__ */ new Map();
    for (const w of r) y.set(w.jointId, 0);
    const v = [...y.keys()].sort();
    v.forEach((w, L) => y.set(w, L));
    const g = v.map(() => []), M = v.map(() => null), T = (w, L) => {
      g[w].includes(L) || g[w].push(L);
    }, Z = r.length, $ = new Int32Array(Z), B = new Array(Z), b = new Int32Array(Z), O = new Int32Array(Z);
    let u = 0;
    for (let w = 0; w < Z; w++) {
      const L = r[w], P = y.get(L.jointId);
      if (M[P] !== L.members) {
        M[P] = L.members;
        for (const Ae of L.members) {
          const Te = s.get(Ae);
          Te !== void 0 && T(P, Te);
        }
      }
      const Y = s.get(L.proposalId);
      Y !== void 0 && (T(P, Y), $[u] = Y, B[u] = L.userId, b[u] = P, O[u++] = St(L.phase), this.hasPlus[Y] = 1);
    }
    for (const w of g) this.jointMembers.push(w.sort((L, P) => L - P));
    this.ghost = Et(this.n, u, $, B, b, O);
    const x = this.lastPhase = new Int32Array(this.n);
    let I = 0;
    for (let w = 0; w < d; w++) {
      const L = l[w];
      L > x[o[w]] && (x[o[w]] = L), L > I && (I = L);
    }
    for (let w = 0; w < u; w++) {
      const L = O[w];
      L > x[$[w]] && (x[$[w]] = L), L > I && (I = L);
    }
    const C = new Uint8Array(I + 1);
    for (let w = 0; w < d; w++) C[l[w]] = 1;
    for (let w = 0; w < u; w++) C[O[w]] = 1;
    this.phases = [];
    for (let w = 1; w <= I; w++) C[w] && this.phases.push(w);
  }
  /** Whether p has a joint vote at all: its count can then rise when another member of the joint is placed. */
  hasGhost(e) {
    return this.ghost.from[e + 1] > this.ghost.from[e];
  }
  /** Whether anyone is for p: its votes in every phase, joint votes counted, come to more than zero. */
  someoneIsFor(e) {
    return this.hasPlus[e] === 1 && this.score(e, xn, 1 / 0, "upto", "always").score > 0;
  }
  /** p's direct total and its pending ghost entries at phase j. */
  tally(e, n, r) {
    const s = this.direct, i = this.ghost;
    let o = 0;
    const a = [];
    let c = s.from[e], l = i.from[e];
    const d = s.from[e + 1], h = i.from[e + 1];
    for (; c < d || l < h; ) {
      const m = c < d ? s.user[c] : null, y = l < h ? i.user[l] : null, v = m === null ? y : y === null || m < y ? m : y;
      let g = !1, M = 0;
      for (; c < d && s.user[c] === v; c++)
        de(s.phase[c], n, r) && (g = !0, M += s.a[c]);
      let T = null;
      for (; l < h && i.user[l] === v; l++)
        de(i.phase[l], n, r) && (T || (T = []), T.includes(i.a[l]) || T.push(i.a[l]));
      g ? o += Math.sign(M) : T && a.push({ owner: e, joints: T });
    }
    return { direct: o, ghosts: a };
  }
  /** p's count at phase j before this round places anything: its direct total plus the ghost votes already on under
   *  inS, with the ghost entries still pending pushed onto `pending` (owner p). Allocates only for pending entries. */
  count(e, n, r, s, i, o) {
    const a = this.direct, c = this.ghost;
    let l = 0, d = a.from[e], h = c.from[e];
    const m = a.from[e + 1], y = c.from[e + 1];
    for (; d < m || h < y; ) {
      const v = d < m ? a.user[d] : null, g = h < y ? c.user[h] : null, M = v === null ? g : g === null || v < g ? v : g;
      let T = !1, Z = 0;
      for (; d < m && a.user[d] === M; d++)
        de(a.phase[d], n, r) && (T = !0, Z += a.a[d]);
      const $ = h;
      let B = !1, b = !1;
      for (; h < y && c.user[h] === M; h++)
        if (!(T || !de(c.phase[h], n, r)) && (B = !0, !b))
          if (i === "always") b = !0;
          else for (const O of this.jointMembers[c.a[h]]) O !== e && s[O] && (b = !0);
      if (T) l += Math.sign(Z);
      else if (b) l++;
      else if (B) {
        const O = [];
        for (let u = $; u < h; u++) de(c.phase[u], n, r) && !O.includes(c.a[u]) && O.push(c.a[u]);
        o.push({ owner: e, joints: O });
      }
    }
    return l;
  }
  /** Whether a ghost entry counts given the selection: always, or another member of one of its joints is selected. */
  isOn(e, n, r) {
    if (r === "always") return !0;
    for (const s of e.joints) for (const i of this.jointMembers[s]) if (i !== e.owner && n[i]) return !0;
    return !1;
  }
  /** score(p | S, j) and how much of it is inherited. Walks the same rows as tally, without allocating. */
  score(e, n, r, s, i) {
    const o = this.direct, a = this.ghost;
    let c = 0, l = 0, d = o.from[e], h = a.from[e];
    const m = o.from[e + 1], y = a.from[e + 1];
    for (; d < m || h < y; ) {
      const v = d < m ? o.user[d] : null, g = h < y ? a.user[h] : null, M = v === null ? g : g === null || v < g ? v : g;
      let T = !1, Z = 0;
      for (; d < m && o.user[d] === M; d++)
        de(o.phase[d], r, s) && (T = !0, Z += o.a[d]);
      let $ = !1;
      for (; h < y && a.user[h] === M; h++)
        if (!($ || T || !de(a.phase[h], r, s)))
          if (i === "always") $ = !0;
          else for (const B of this.jointMembers[a.a[h]]) B !== e && n[B] && ($ = !0);
      T ? c += Math.sign(Z) : $ && (c++, l++);
    }
    return { score: c, inherited: l };
  }
}
function Et(t, e, n, r, s, i) {
  const o = new Int32Array(t + 1);
  for (let h = 0; h < e; h++) o[n[h] + 1]++;
  for (let h = 0; h < t; h++) o[h + 1] += o[h];
  const a = new Array(e), c = new Int32Array(e), l = new Int32Array(e), d = o.slice(0, t);
  for (let h = 0; h < e; h++) {
    const m = n[h], y = r[h], v = o[m];
    let g = d[m]++;
    for (; g > v && a[g - 1] > y; )
      a[g] = a[g - 1], c[g] = c[g - 1], l[g] = l[g - 1], g--;
    a[g] = y, c[g] = s[h], l[g] = i[h];
  }
  return { from: o, user: a, a: c, phase: l };
}
function An(t, e, n, r, s) {
  const i = { conflicts: t, book: e, opts: s, nodes: 0, work: 0, branchPoints: 0, approximate: !1 }, o = new Uint8Array(t.length), a = [], c = n.map((l, d) => d);
  if (s.phases === "pool") a.push(...Ct(i, o, c.filter((l) => n[l] <= r), r));
  else {
    const l = /* @__PURE__ */ new Map();
    for (const m of c) n[m] <= r && (l.get(n[m]) ?? l.set(n[m], []).get(n[m])).push(m);
    const d = new Set(l.keys());
    for (const m of e.phases) m <= r && d.add(m);
    let h = [];
    for (const m of [...d].sort((y, v) => y - v)) {
      const y = l.get(m) ?? kt, v = h.length ? Tn(h, y) : y;
      a.push(...Ct(i, o, v, m)), h = [];
      for (const g of v) {
        if (o[g] || !(e.lastPhase[g] > m || e.hasGhost(g))) continue;
        let M = !0;
        for (const T of t[g]) if (o[T]) {
          M = !1;
          break;
        }
        M && h.push(g);
      }
    }
  }
  return { selected: a, approximate: i.approximate, branchPoints: i.branchPoints };
}
const kt = [];
function Tn(t, e) {
  const n = new Array(t.length + e.length);
  let r = 0, s = 0, i = 0;
  for (; r < t.length && s < e.length; ) n[i++] = t[r] < e[s] ? t[r++] : e[s++];
  for (; r < t.length; ) n[i++] = t[r++];
  for (; s < e.length; ) n[i++] = e[s++];
  return n;
}
const Ln = 200, ft = (t) => t.nodes >= t.opts.budget || t.work >= t.opts.budget * Ln;
function Ct(t, e, n, r) {
  const { conflicts: s, book: i, opts: o } = t, a = [];
  for (const b of n) {
    let O = !0;
    for (const u of s[b]) e[u] && (O = !1);
    O && a.push(b);
  }
  if (!a.length) return [];
  const c = new Int32Array(e.length).fill(-1);
  for (let b = 0; b < a.length; b++) c[a[b]] = b;
  const l = new Int32Array(a.length), d = [], h = [];
  for (let b = 0; b < a.length; b++) {
    const O = d.length;
    l[b] = i.count(a[b], r, o.phaseVotes, e, o.ghosts, d);
    for (let u = O; u < d.length; u++) h.push(b);
  }
  const m = new Array(a.length), y = new Int32Array(a.length);
  for (let b = 0; b < a.length; b++) y[b] = b;
  const v = (b) => {
    for (; y[b] !== b; ) b = y[b] = y[y[b]];
    return b;
  }, g = (b, O) => {
    const u = v(b), x = v(O);
    u !== x && (y[Math.max(u, x)] = Math.min(u, x));
  };
  d.forEach((b, O) => {
    const u = h[O];
    for (const x of b.joints)
      for (const I of i.jointMembers[x]) {
        const C = c[I];
        if (C < 0 || I === b.owner) continue;
        const w = m[C] ?? (m[C] = []);
        w.includes(O) || (w.push(O), g(C, u));
      }
  });
  const M = new Array(a.length);
  for (let b = 0; b < a.length; b++) {
    let O = null;
    for (const u of s[a[b]]) {
      const x = c[u];
      x >= 0 && ((O ??= []).push(x), g(b, x));
    }
    M[b] = O ?? kt;
  }
  const T = [], Z = (b) => {
    e[a[b]] = 1, T.push(a[b]);
  };
  if (!o.split) {
    for (const b of Ot(t, a.map((O, u) => u), M, l, h, m)) Z(b);
    return T;
  }
  const $ = new Int32Array(a.length);
  for (let b = 0; b < a.length; b++) $[v(b)]++;
  const B = /* @__PURE__ */ new Map();
  for (let b = 0; b < a.length; b++) {
    const O = y[b];
    if ($[O] > 1) {
      const u = B.get(O);
      u ? u.push(b) : B.set(O, [b]);
    }
  }
  for (let b = 0; b < a.length; b++) {
    if (y[b] !== b) continue;
    if ($[b] === 1) {
      l[b] > 0 && Z(b);
      continue;
    }
    const O = B.get(b);
    if (O.length === 2 && !m[O[0]] && !m[O[1]]) {
      const u = O[0], x = O[1], I = Math.max(l[u], l[x]);
      if (I <= 0) continue;
      l[u] === l[x] && !ft(t) && (t.nodes++, t.branchPoints++), Z(l[u] === I ? u : x);
      continue;
    }
    for (const u of Ot(t, O, M, l, h, m)) Z(u);
  }
  return T;
}
function Ot(t, e, n, r, s, i) {
  const o = e.length, a = /* @__PURE__ */ new Map();
  e.forEach((u, x) => a.set(u, x));
  const c = e.map((u) => n[u].map((x) => a.get(x))), l = /* @__PURE__ */ new Map(), d = [], h = e.map(
    (u) => (i[u] ?? kt).map((x) => {
      let I = l.get(x);
      return I === void 0 && (l.set(x, I = d.length), d.push(a.get(s[x]))), I;
    })
  ), m = e.map(() => []);
  h.forEach((u, x) => {
    for (const I of u) {
      const C = d[I];
      m[x].push(C, I), m[C].push(x, I);
    }
  });
  const y = /* @__PURE__ */ new Map(), v = new Uint8Array(o), g = e.map((u, x) => x), M = (u, x) => {
    u.placed[x] = 1, u.alive[x] = 0;
    for (const I of c[x]) u.alive[I] = 0;
    for (const I of h[x])
      u.on[I] || (u.on[I] = 1, u.score[d[I]]++);
  }, T = (u) => (t.work += o, { placed: u.placed.slice(), alive: u.alive.slice(), score: u.score.slice(), on: u.on.slice() }), Z = (u, x) => {
    let I = x[0], C = 1 / 0;
    for (const w of x) {
      let L = 0;
      for (const P of c[w]) u.alive[P] && L++;
      L < C && (I = w, C = L);
    }
    return I;
  }, $ = (u, x) => {
    if (!t.opts.split) return g;
    const I = [x];
    v[x] = 1;
    for (let C = 0; C < I.length; C++) {
      const w = I[C];
      for (const P of c[w]) u.alive[P] && !v[P] && (v[P] = 1, I.push(P));
      const L = m[w];
      for (let P = 0; P < L.length; P += 2) {
        const Y = L[P];
        u.alive[Y] && !v[Y] && !u.on[L[P + 1]] && (v[Y] = 1, I.push(Y));
      }
    }
    for (const C of I) v[C] = 0;
    return I.sort((C, w) => C - w);
  }, B = (u, x) => {
    let I = "";
    for (const C of x) {
      I += C + (u.alive[C] ? ":" : "d") + u.score[C];
      const w = h[C];
      if (w.length) {
        I += "/";
        for (const L of w) I += u.on[L] ? "1" : u.placed[d[L]] ? "p" : u.alive[d[L]] ? "a" : "0";
      }
      I += ",";
    }
    return I;
  }, b = (u, x) => {
    const I = [], C = [];
    for (; ; ) {
      let w = 0;
      C.length = 0, x !== g && (t.work += x.length);
      for (const D of x) {
        if (!u.alive[D]) continue;
        const Q = u.score[D];
        Q > w ? (w = Q, C.length = 0, C.push(D)) : Q === w && w > 0 && C.push(D);
      }
      if (!C.length) return I;
      let L = -1;
      if (C.length === 1) L = C[0];
      else {
        for (const ee of C) v[ee] = 1;
        let D = -1, Q = !1;
        for (const ee of C)
          c[ee].some((le) => v[le]) ? Q = !0 : D < 0 && (D = ee);
        for (const ee of C) v[ee] = 0;
        L = Q ? D : C[0];
      }
      if (L >= 0) {
        M(u, L), I.push(L);
        continue;
      }
      const P = $(u, C[0]), Y = new Set(P), Ae = C.filter((D) => Y.has(D)), Te = B(u, P);
      let Le = y.get(Te);
      if (t.work += P.length, !Le && ft(t)) {
        t.approximate = !0;
        const D = Z(u, Ae);
        M(u, D), I.push(D);
        continue;
      }
      if (!Le) {
        t.nodes++, t.branchPoints++;
        let D = null;
        const Q = /* @__PURE__ */ new Set(), ee = (le) => {
          Q.add(le);
          const ce = T(u);
          M(ce, le);
          const ln = b(ce, P);
          let We = 0, lt = 0;
          for (let Fe = 0; Fe < o; Fe++) ce.placed[Fe] && (We += ce.score[Fe], lt++);
          (!D || We > D.value || We === D.value && lt > D.count) && (D = { value: We, count: lt, adds: [le, ...ln] });
        };
        for (const le of Ae) {
          if (D && ft(t)) {
            t.approximate = !0;
            const ce = Z(u, Ae);
            Q.has(ce) || ee(ce);
            break;
          }
          ee(le);
        }
        Le = D, y.set(Te, Le);
      }
      for (const D of Le.adds) M(u, D), I.push(D);
    }
  }, O = {
    placed: new Uint8Array(o),
    alive: new Uint8Array(o).fill(1),
    score: Int32Array.from(e, (u) => r[u]),
    on: new Uint8Array(d.length)
  };
  return b(O, g).map((u) => e[u]);
}
var R;
(function(t) {
  t.assertEqual = (s) => s;
  function e(s) {
  }
  t.assertIs = e;
  function n(s) {
    throw new Error();
  }
  t.assertNever = n, t.arrayToEnum = (s) => {
    const i = {};
    for (const o of s)
      i[o] = o;
    return i;
  }, t.getValidEnumValues = (s) => {
    const i = t.objectKeys(s).filter((a) => typeof s[s[a]] != "number"), o = {};
    for (const a of i)
      o[a] = s[a];
    return t.objectValues(o);
  }, t.objectValues = (s) => t.objectKeys(s).map(function(i) {
    return s[i];
  }), t.objectKeys = typeof Object.keys == "function" ? (s) => Object.keys(s) : (s) => {
    const i = [];
    for (const o in s)
      Object.prototype.hasOwnProperty.call(s, o) && i.push(o);
    return i;
  }, t.find = (s, i) => {
    for (const o of s)
      if (i(o))
        return o;
  }, t.isInteger = typeof Number.isInteger == "function" ? (s) => Number.isInteger(s) : (s) => typeof s == "number" && isFinite(s) && Math.floor(s) === s;
  function r(s, i = " | ") {
    return s.map((o) => typeof o == "string" ? `'${o}'` : o).join(i);
  }
  t.joinValues = r, t.jsonStringifyReplacer = (s, i) => typeof i == "bigint" ? i.toString() : i;
})(R || (R = {}));
var mt;
(function(t) {
  t.mergeShapes = (e, n) => ({
    ...e,
    ...n
    // second overwrites first
  });
})(mt || (mt = {}));
const _ = R.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]), re = (t) => {
  switch (typeof t) {
    case "undefined":
      return _.undefined;
    case "string":
      return _.string;
    case "number":
      return isNaN(t) ? _.nan : _.number;
    case "boolean":
      return _.boolean;
    case "function":
      return _.function;
    case "bigint":
      return _.bigint;
    case "symbol":
      return _.symbol;
    case "object":
      return Array.isArray(t) ? _.array : t === null ? _.null : t.then && typeof t.then == "function" && t.catch && typeof t.catch == "function" ? _.promise : typeof Map < "u" && t instanceof Map ? _.map : typeof Set < "u" && t instanceof Set ? _.set : typeof Date < "u" && t instanceof Date ? _.date : _.object;
    default:
      return _.unknown;
  }
}, f = R.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]), In = (t) => JSON.stringify(t, null, 2).replace(/"([^"]+)":/g, "$1:");
class U extends Error {
  constructor(e) {
    super(), this.issues = [], this.addIssue = (r) => {
      this.issues = [...this.issues, r];
    }, this.addIssues = (r = []) => {
      this.issues = [...this.issues, ...r];
    };
    const n = new.target.prototype;
    Object.setPrototypeOf ? Object.setPrototypeOf(this, n) : this.__proto__ = n, this.name = "ZodError", this.issues = e;
  }
  get errors() {
    return this.issues;
  }
  format(e) {
    const n = e || function(i) {
      return i.message;
    }, r = { _errors: [] }, s = (i) => {
      for (const o of i.issues)
        if (o.code === "invalid_union")
          o.unionErrors.map(s);
        else if (o.code === "invalid_return_type")
          s(o.returnTypeError);
        else if (o.code === "invalid_arguments")
          s(o.argumentsError);
        else if (o.path.length === 0)
          r._errors.push(n(o));
        else {
          let a = r, c = 0;
          for (; c < o.path.length; ) {
            const l = o.path[c];
            c === o.path.length - 1 ? (a[l] = a[l] || { _errors: [] }, a[l]._errors.push(n(o))) : a[l] = a[l] || { _errors: [] }, a = a[l], c++;
          }
        }
    };
    return s(this), r;
  }
  static assert(e) {
    if (!(e instanceof U))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, R.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (n) => n.message) {
    const n = {}, r = [];
    for (const s of this.issues)
      s.path.length > 0 ? (n[s.path[0]] = n[s.path[0]] || [], n[s.path[0]].push(e(s))) : r.push(e(s));
    return { formErrors: r, fieldErrors: n };
  }
  get formErrors() {
    return this.flatten();
  }
}
U.create = (t) => new U(t);
const _e = (t, e) => {
  let n;
  switch (t.code) {
    case f.invalid_type:
      t.received === _.undefined ? n = "Required" : n = `Expected ${t.expected}, received ${t.received}`;
      break;
    case f.invalid_literal:
      n = `Invalid literal value, expected ${JSON.stringify(t.expected, R.jsonStringifyReplacer)}`;
      break;
    case f.unrecognized_keys:
      n = `Unrecognized key(s) in object: ${R.joinValues(t.keys, ", ")}`;
      break;
    case f.invalid_union:
      n = "Invalid input";
      break;
    case f.invalid_union_discriminator:
      n = `Invalid discriminator value. Expected ${R.joinValues(t.options)}`;
      break;
    case f.invalid_enum_value:
      n = `Invalid enum value. Expected ${R.joinValues(t.options)}, received '${t.received}'`;
      break;
    case f.invalid_arguments:
      n = "Invalid function arguments";
      break;
    case f.invalid_return_type:
      n = "Invalid function return type";
      break;
    case f.invalid_date:
      n = "Invalid date";
      break;
    case f.invalid_string:
      typeof t.validation == "object" ? "includes" in t.validation ? (n = `Invalid input: must include "${t.validation.includes}"`, typeof t.validation.position == "number" && (n = `${n} at one or more positions greater than or equal to ${t.validation.position}`)) : "startsWith" in t.validation ? n = `Invalid input: must start with "${t.validation.startsWith}"` : "endsWith" in t.validation ? n = `Invalid input: must end with "${t.validation.endsWith}"` : R.assertNever(t.validation) : t.validation !== "regex" ? n = `Invalid ${t.validation}` : n = "Invalid";
      break;
    case f.too_small:
      t.type === "array" ? n = `Array must contain ${t.exact ? "exactly" : t.inclusive ? "at least" : "more than"} ${t.minimum} element(s)` : t.type === "string" ? n = `String must contain ${t.exact ? "exactly" : t.inclusive ? "at least" : "over"} ${t.minimum} character(s)` : t.type === "number" ? n = `Number must be ${t.exact ? "exactly equal to " : t.inclusive ? "greater than or equal to " : "greater than "}${t.minimum}` : t.type === "date" ? n = `Date must be ${t.exact ? "exactly equal to " : t.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(t.minimum))}` : n = "Invalid input";
      break;
    case f.too_big:
      t.type === "array" ? n = `Array must contain ${t.exact ? "exactly" : t.inclusive ? "at most" : "less than"} ${t.maximum} element(s)` : t.type === "string" ? n = `String must contain ${t.exact ? "exactly" : t.inclusive ? "at most" : "under"} ${t.maximum} character(s)` : t.type === "number" ? n = `Number must be ${t.exact ? "exactly" : t.inclusive ? "less than or equal to" : "less than"} ${t.maximum}` : t.type === "bigint" ? n = `BigInt must be ${t.exact ? "exactly" : t.inclusive ? "less than or equal to" : "less than"} ${t.maximum}` : t.type === "date" ? n = `Date must be ${t.exact ? "exactly" : t.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(t.maximum))}` : n = "Invalid input";
      break;
    case f.custom:
      n = "Invalid input";
      break;
    case f.invalid_intersection_types:
      n = "Intersection results could not be merged";
      break;
    case f.not_multiple_of:
      n = `Number must be a multiple of ${t.multipleOf}`;
      break;
    case f.not_finite:
      n = "Number must be finite";
      break;
    default:
      n = e.defaultError, R.assertNever(t);
  }
  return { message: n };
};
let Vt = _e;
function Sn(t) {
  Vt = t;
}
function Je() {
  return Vt;
}
const Qe = (t) => {
  const { data: e, path: n, errorMaps: r, issueData: s } = t, i = [...n, ...s.path || []], o = {
    ...s,
    path: i
  };
  if (s.message !== void 0)
    return {
      ...s,
      path: i,
      message: s.message
    };
  let a = "";
  const c = r.filter((l) => !!l).slice().reverse();
  for (const l of c)
    a = l(o, { data: e, defaultError: a }).message;
  return {
    ...s,
    path: i,
    message: a
  };
}, En = [];
function k(t, e) {
  const n = Je(), r = Qe({
    issueData: e,
    data: t.data,
    path: t.path,
    errorMaps: [
      t.common.contextualErrorMap,
      t.schemaErrorMap,
      n,
      n === _e ? void 0 : _e
      // then global default map
    ].filter((s) => !!s)
  });
  t.common.issues.push(r);
}
class z {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    this.value === "valid" && (this.value = "dirty");
  }
  abort() {
    this.value !== "aborted" && (this.value = "aborted");
  }
  static mergeArray(e, n) {
    const r = [];
    for (const s of n) {
      if (s.status === "aborted")
        return E;
      s.status === "dirty" && e.dirty(), r.push(s.value);
    }
    return { status: e.value, value: r };
  }
  static async mergeObjectAsync(e, n) {
    const r = [];
    for (const s of n) {
      const i = await s.key, o = await s.value;
      r.push({
        key: i,
        value: o
      });
    }
    return z.mergeObjectSync(e, r);
  }
  static mergeObjectSync(e, n) {
    const r = {};
    for (const s of n) {
      const { key: i, value: o } = s;
      if (i.status === "aborted" || o.status === "aborted")
        return E;
      i.status === "dirty" && e.dirty(), o.status === "dirty" && e.dirty(), i.value !== "__proto__" && (typeof o.value < "u" || s.alwaysSet) && (r[i.value] = o.value);
    }
    return { status: e.value, value: r };
  }
}
const E = Object.freeze({
  status: "aborted"
}), ke = (t) => ({ status: "dirty", value: t }), V = (t) => ({ status: "valid", value: t }), gt = (t) => t.status === "aborted", yt = (t) => t.status === "dirty", Ee = (t) => t.status === "valid", Ce = (t) => typeof Promise < "u" && t instanceof Promise;
function et(t, e, n, r) {
  if (typeof e == "function" ? t !== e || !0 : !e.has(t)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return e.get(t);
}
function Ut(t, e, n, r, s) {
  if (typeof e == "function" ? t !== e || !0 : !e.has(t)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return e.set(t, n), n;
}
var A;
(function(t) {
  t.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, t.toString = (e) => typeof e == "string" ? e : e?.message;
})(A || (A = {}));
var Ie, Se;
class K {
  constructor(e, n, r, s) {
    this._cachedPath = [], this.parent = e, this.data = n, this._path = r, this._key = s;
  }
  get path() {
    return this._cachedPath.length || (this._key instanceof Array ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const jt = (t, e) => {
  if (Ee(e))
    return { success: !0, data: e.value };
  if (!t.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const n = new U(t.common.issues);
      return this._error = n, this._error;
    }
  };
};
function j(t) {
  if (!t)
    return {};
  const { errorMap: e, invalid_type_error: n, required_error: r, description: s } = t;
  if (e && (n || r))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: s } : { errorMap: (o, a) => {
    var c, l;
    const { message: d } = t;
    return o.code === "invalid_enum_value" ? { message: d ?? a.defaultError } : typeof a.data > "u" ? { message: (c = d ?? r) !== null && c !== void 0 ? c : a.defaultError } : o.code !== "invalid_type" ? { message: a.defaultError } : { message: (l = d ?? n) !== null && l !== void 0 ? l : a.defaultError };
  }, description: s };
}
class N {
  constructor(e) {
    this.spa = this.safeParseAsync, this._def = e, this.parse = this.parse.bind(this), this.safeParse = this.safeParse.bind(this), this.parseAsync = this.parseAsync.bind(this), this.safeParseAsync = this.safeParseAsync.bind(this), this.spa = this.spa.bind(this), this.refine = this.refine.bind(this), this.refinement = this.refinement.bind(this), this.superRefine = this.superRefine.bind(this), this.optional = this.optional.bind(this), this.nullable = this.nullable.bind(this), this.nullish = this.nullish.bind(this), this.array = this.array.bind(this), this.promise = this.promise.bind(this), this.or = this.or.bind(this), this.and = this.and.bind(this), this.transform = this.transform.bind(this), this.brand = this.brand.bind(this), this.default = this.default.bind(this), this.catch = this.catch.bind(this), this.describe = this.describe.bind(this), this.pipe = this.pipe.bind(this), this.readonly = this.readonly.bind(this), this.isNullable = this.isNullable.bind(this), this.isOptional = this.isOptional.bind(this);
  }
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return re(e.data);
  }
  _getOrReturnCtx(e, n) {
    return n || {
      common: e.parent.common,
      data: e.data,
      parsedType: re(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new z(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: re(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const n = this._parse(e);
    if (Ce(n))
      throw new Error("Synchronous parse encountered promise.");
    return n;
  }
  _parseAsync(e) {
    const n = this._parse(e);
    return Promise.resolve(n);
  }
  parse(e, n) {
    const r = this.safeParse(e, n);
    if (r.success)
      return r.data;
    throw r.error;
  }
  safeParse(e, n) {
    var r;
    const s = {
      common: {
        issues: [],
        async: (r = n?.async) !== null && r !== void 0 ? r : !1,
        contextualErrorMap: n?.errorMap
      },
      path: n?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: re(e)
    }, i = this._parseSync({ data: e, path: s.path, parent: s });
    return jt(s, i);
  }
  async parseAsync(e, n) {
    const r = await this.safeParseAsync(e, n);
    if (r.success)
      return r.data;
    throw r.error;
  }
  async safeParseAsync(e, n) {
    const r = {
      common: {
        issues: [],
        contextualErrorMap: n?.errorMap,
        async: !0
      },
      path: n?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: re(e)
    }, s = this._parse({ data: e, path: r.path, parent: r }), i = await (Ce(s) ? s : Promise.resolve(s));
    return jt(r, i);
  }
  refine(e, n) {
    const r = (s) => typeof n == "string" || typeof n > "u" ? { message: n } : typeof n == "function" ? n(s) : n;
    return this._refinement((s, i) => {
      const o = e(s), a = () => i.addIssue({
        code: f.custom,
        ...r(s)
      });
      return typeof Promise < "u" && o instanceof Promise ? o.then((c) => c ? !0 : (a(), !1)) : o ? !0 : (a(), !1);
    });
  }
  refinement(e, n) {
    return this._refinement((r, s) => e(r) ? !0 : (s.addIssue(typeof n == "function" ? n(r, s) : n), !1));
  }
  _refinement(e) {
    return new X({
      schema: this,
      typeName: S.ZodEffects,
      effect: { type: "refinement", refinement: e }
    });
  }
  superRefine(e) {
    return this._refinement(e);
  }
  optional() {
    return H.create(this, this._def);
  }
  nullable() {
    return oe.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return F.create(this, this._def);
  }
  promise() {
    return Me.create(this, this._def);
  }
  or(e) {
    return Re.create([this, e], this._def);
  }
  and(e) {
    return Ze.create(this, e, this._def);
  }
  transform(e) {
    return new X({
      ...j(this._def),
      schema: this,
      typeName: S.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const n = typeof e == "function" ? e : () => e;
    return new Be({
      ...j(this._def),
      innerType: this,
      defaultValue: n,
      typeName: S.ZodDefault
    });
  }
  brand() {
    return new wt({
      typeName: S.ZodBranded,
      type: this,
      ...j(this._def)
    });
  }
  catch(e) {
    const n = typeof e == "function" ? e : () => e;
    return new ze({
      ...j(this._def),
      innerType: this,
      catchValue: n,
      typeName: S.ZodCatch
    });
  }
  describe(e) {
    const n = this.constructor;
    return new n({
      ...this._def,
      description: e
    });
  }
  pipe(e) {
    return Ye.create(this, e);
  }
  readonly() {
    return Ve.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const Cn = /^c[^\s-]{8,}$/i, On = /^[0-9a-z]+$/, jn = /^[0-9A-HJKMNP-TV-Z]{26}$/, Nn = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, Rn = /^[a-z0-9_-]{21}$/i, Zn = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Pn = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, $n = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let dt;
const Dn = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, qn = /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/, Bn = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, Yt = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", zn = new RegExp(`^${Yt}$`);
function Wt(t) {
  let e = "([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d";
  return t.precision ? e = `${e}\\.\\d{${t.precision}}` : t.precision == null && (e = `${e}(\\.\\d+)?`), e;
}
function Vn(t) {
  return new RegExp(`^${Wt(t)}$`);
}
function Ft(t) {
  let e = `${Yt}T${Wt(t)}`;
  const n = [];
  return n.push(t.local ? "Z?" : "Z"), t.offset && n.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${n.join("|")})`, new RegExp(`^${e}$`);
}
function Un(t, e) {
  return !!((e === "v4" || !e) && Dn.test(t) || (e === "v6" || !e) && qn.test(t));
}
class W extends N {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== _.string) {
      const i = this._getOrReturnCtx(e);
      return k(i, {
        code: f.invalid_type,
        expected: _.string,
        received: i.parsedType
      }), E;
    }
    const r = new z();
    let s;
    for (const i of this._def.checks)
      if (i.kind === "min")
        e.data.length < i.value && (s = this._getOrReturnCtx(e, s), k(s, {
          code: f.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), r.dirty());
      else if (i.kind === "max")
        e.data.length > i.value && (s = this._getOrReturnCtx(e, s), k(s, {
          code: f.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: i.message
        }), r.dirty());
      else if (i.kind === "length") {
        const o = e.data.length > i.value, a = e.data.length < i.value;
        (o || a) && (s = this._getOrReturnCtx(e, s), o ? k(s, {
          code: f.too_big,
          maximum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }) : a && k(s, {
          code: f.too_small,
          minimum: i.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: i.message
        }), r.dirty());
      } else if (i.kind === "email")
        Pn.test(e.data) || (s = this._getOrReturnCtx(e, s), k(s, {
          validation: "email",
          code: f.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "emoji")
        dt || (dt = new RegExp($n, "u")), dt.test(e.data) || (s = this._getOrReturnCtx(e, s), k(s, {
          validation: "emoji",
          code: f.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "uuid")
        Nn.test(e.data) || (s = this._getOrReturnCtx(e, s), k(s, {
          validation: "uuid",
          code: f.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "nanoid")
        Rn.test(e.data) || (s = this._getOrReturnCtx(e, s), k(s, {
          validation: "nanoid",
          code: f.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "cuid")
        Cn.test(e.data) || (s = this._getOrReturnCtx(e, s), k(s, {
          validation: "cuid",
          code: f.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "cuid2")
        On.test(e.data) || (s = this._getOrReturnCtx(e, s), k(s, {
          validation: "cuid2",
          code: f.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "ulid")
        jn.test(e.data) || (s = this._getOrReturnCtx(e, s), k(s, {
          validation: "ulid",
          code: f.invalid_string,
          message: i.message
        }), r.dirty());
      else if (i.kind === "url")
        try {
          new URL(e.data);
        } catch {
          s = this._getOrReturnCtx(e, s), k(s, {
            validation: "url",
            code: f.invalid_string,
            message: i.message
          }), r.dirty();
        }
      else i.kind === "regex" ? (i.regex.lastIndex = 0, i.regex.test(e.data) || (s = this._getOrReturnCtx(e, s), k(s, {
        validation: "regex",
        code: f.invalid_string,
        message: i.message
      }), r.dirty())) : i.kind === "trim" ? e.data = e.data.trim() : i.kind === "includes" ? e.data.includes(i.value, i.position) || (s = this._getOrReturnCtx(e, s), k(s, {
        code: f.invalid_string,
        validation: { includes: i.value, position: i.position },
        message: i.message
      }), r.dirty()) : i.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : i.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : i.kind === "startsWith" ? e.data.startsWith(i.value) || (s = this._getOrReturnCtx(e, s), k(s, {
        code: f.invalid_string,
        validation: { startsWith: i.value },
        message: i.message
      }), r.dirty()) : i.kind === "endsWith" ? e.data.endsWith(i.value) || (s = this._getOrReturnCtx(e, s), k(s, {
        code: f.invalid_string,
        validation: { endsWith: i.value },
        message: i.message
      }), r.dirty()) : i.kind === "datetime" ? Ft(i).test(e.data) || (s = this._getOrReturnCtx(e, s), k(s, {
        code: f.invalid_string,
        validation: "datetime",
        message: i.message
      }), r.dirty()) : i.kind === "date" ? zn.test(e.data) || (s = this._getOrReturnCtx(e, s), k(s, {
        code: f.invalid_string,
        validation: "date",
        message: i.message
      }), r.dirty()) : i.kind === "time" ? Vn(i).test(e.data) || (s = this._getOrReturnCtx(e, s), k(s, {
        code: f.invalid_string,
        validation: "time",
        message: i.message
      }), r.dirty()) : i.kind === "duration" ? Zn.test(e.data) || (s = this._getOrReturnCtx(e, s), k(s, {
        validation: "duration",
        code: f.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "ip" ? Un(e.data, i.version) || (s = this._getOrReturnCtx(e, s), k(s, {
        validation: "ip",
        code: f.invalid_string,
        message: i.message
      }), r.dirty()) : i.kind === "base64" ? Bn.test(e.data) || (s = this._getOrReturnCtx(e, s), k(s, {
        validation: "base64",
        code: f.invalid_string,
        message: i.message
      }), r.dirty()) : R.assertNever(i);
    return { status: r.value, value: e.data };
  }
  _regex(e, n, r) {
    return this.refinement((s) => e.test(s), {
      validation: n,
      code: f.invalid_string,
      ...A.errToObj(r)
    });
  }
  _addCheck(e) {
    return new W({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...A.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...A.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ...A.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...A.errToObj(e) });
  }
  nanoid(e) {
    return this._addCheck({ kind: "nanoid", ...A.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...A.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ...A.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ...A.errToObj(e) });
  }
  base64(e) {
    return this._addCheck({ kind: "base64", ...A.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ...A.errToObj(e) });
  }
  datetime(e) {
    var n, r;
    return typeof e == "string" ? this._addCheck({
      kind: "datetime",
      precision: null,
      offset: !1,
      local: !1,
      message: e
    }) : this._addCheck({
      kind: "datetime",
      precision: typeof e?.precision > "u" ? null : e?.precision,
      offset: (n = e?.offset) !== null && n !== void 0 ? n : !1,
      local: (r = e?.local) !== null && r !== void 0 ? r : !1,
      ...A.errToObj(e?.message)
    });
  }
  date(e) {
    return this._addCheck({ kind: "date", message: e });
  }
  time(e) {
    return typeof e == "string" ? this._addCheck({
      kind: "time",
      precision: null,
      message: e
    }) : this._addCheck({
      kind: "time",
      precision: typeof e?.precision > "u" ? null : e?.precision,
      ...A.errToObj(e?.message)
    });
  }
  duration(e) {
    return this._addCheck({ kind: "duration", ...A.errToObj(e) });
  }
  regex(e, n) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...A.errToObj(n)
    });
  }
  includes(e, n) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: n?.position,
      ...A.errToObj(n?.message)
    });
  }
  startsWith(e, n) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...A.errToObj(n)
    });
  }
  endsWith(e, n) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...A.errToObj(n)
    });
  }
  min(e, n) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...A.errToObj(n)
    });
  }
  max(e, n) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...A.errToObj(n)
    });
  }
  length(e, n) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...A.errToObj(n)
    });
  }
  /**
   * @deprecated Use z.string().min(1) instead.
   * @see {@link ZodString.min}
   */
  nonempty(e) {
    return this.min(1, A.errToObj(e));
  }
  trim() {
    return new W({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new W({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new W({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((e) => e.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((e) => e.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((e) => e.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((e) => e.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((e) => e.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((e) => e.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((e) => e.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((e) => e.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((e) => e.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((e) => e.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((e) => e.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((e) => e.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((e) => e.kind === "ip");
  }
  get isBase64() {
    return !!this._def.checks.find((e) => e.kind === "base64");
  }
  get minLength() {
    let e = null;
    for (const n of this._def.checks)
      n.kind === "min" && (e === null || n.value > e) && (e = n.value);
    return e;
  }
  get maxLength() {
    let e = null;
    for (const n of this._def.checks)
      n.kind === "max" && (e === null || n.value < e) && (e = n.value);
    return e;
  }
}
W.create = (t) => {
  var e;
  return new W({
    checks: [],
    typeName: S.ZodString,
    coerce: (e = t?.coerce) !== null && e !== void 0 ? e : !1,
    ...j(t)
  });
};
function Yn(t, e) {
  const n = (t.toString().split(".")[1] || "").length, r = (e.toString().split(".")[1] || "").length, s = n > r ? n : r, i = parseInt(t.toFixed(s).replace(".", "")), o = parseInt(e.toFixed(s).replace(".", ""));
  return i % o / Math.pow(10, s);
}
class se extends N {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== _.number) {
      const i = this._getOrReturnCtx(e);
      return k(i, {
        code: f.invalid_type,
        expected: _.number,
        received: i.parsedType
      }), E;
    }
    let r;
    const s = new z();
    for (const i of this._def.checks)
      i.kind === "int" ? R.isInteger(e.data) || (r = this._getOrReturnCtx(e, r), k(r, {
        code: f.invalid_type,
        expected: "integer",
        received: "float",
        message: i.message
      }), s.dirty()) : i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (r = this._getOrReturnCtx(e, r), k(r, {
        code: f.too_small,
        minimum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), s.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (r = this._getOrReturnCtx(e, r), k(r, {
        code: f.too_big,
        maximum: i.value,
        type: "number",
        inclusive: i.inclusive,
        exact: !1,
        message: i.message
      }), s.dirty()) : i.kind === "multipleOf" ? Yn(e.data, i.value) !== 0 && (r = this._getOrReturnCtx(e, r), k(r, {
        code: f.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), s.dirty()) : i.kind === "finite" ? Number.isFinite(e.data) || (r = this._getOrReturnCtx(e, r), k(r, {
        code: f.not_finite,
        message: i.message
      }), s.dirty()) : R.assertNever(i);
    return { status: s.value, value: e.data };
  }
  gte(e, n) {
    return this.setLimit("min", e, !0, A.toString(n));
  }
  gt(e, n) {
    return this.setLimit("min", e, !1, A.toString(n));
  }
  lte(e, n) {
    return this.setLimit("max", e, !0, A.toString(n));
  }
  lt(e, n) {
    return this.setLimit("max", e, !1, A.toString(n));
  }
  setLimit(e, n, r, s) {
    return new se({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: n,
          inclusive: r,
          message: A.toString(s)
        }
      ]
    });
  }
  _addCheck(e) {
    return new se({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: A.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: A.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: A.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: A.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: A.toString(e)
    });
  }
  multipleOf(e, n) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: A.toString(n)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: A.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: A.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: A.toString(e)
    });
  }
  get minValue() {
    let e = null;
    for (const n of this._def.checks)
      n.kind === "min" && (e === null || n.value > e) && (e = n.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (const n of this._def.checks)
      n.kind === "max" && (e === null || n.value < e) && (e = n.value);
    return e;
  }
  get isInt() {
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && R.isInteger(e.value));
  }
  get isFinite() {
    let e = null, n = null;
    for (const r of this._def.checks) {
      if (r.kind === "finite" || r.kind === "int" || r.kind === "multipleOf")
        return !0;
      r.kind === "min" ? (n === null || r.value > n) && (n = r.value) : r.kind === "max" && (e === null || r.value < e) && (e = r.value);
    }
    return Number.isFinite(n) && Number.isFinite(e);
  }
}
se.create = (t) => new se({
  checks: [],
  typeName: S.ZodNumber,
  coerce: t?.coerce || !1,
  ...j(t)
});
class ie extends N {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = BigInt(e.data)), this._getType(e) !== _.bigint) {
      const i = this._getOrReturnCtx(e);
      return k(i, {
        code: f.invalid_type,
        expected: _.bigint,
        received: i.parsedType
      }), E;
    }
    let r;
    const s = new z();
    for (const i of this._def.checks)
      i.kind === "min" ? (i.inclusive ? e.data < i.value : e.data <= i.value) && (r = this._getOrReturnCtx(e, r), k(r, {
        code: f.too_small,
        type: "bigint",
        minimum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), s.dirty()) : i.kind === "max" ? (i.inclusive ? e.data > i.value : e.data >= i.value) && (r = this._getOrReturnCtx(e, r), k(r, {
        code: f.too_big,
        type: "bigint",
        maximum: i.value,
        inclusive: i.inclusive,
        message: i.message
      }), s.dirty()) : i.kind === "multipleOf" ? e.data % i.value !== BigInt(0) && (r = this._getOrReturnCtx(e, r), k(r, {
        code: f.not_multiple_of,
        multipleOf: i.value,
        message: i.message
      }), s.dirty()) : R.assertNever(i);
    return { status: s.value, value: e.data };
  }
  gte(e, n) {
    return this.setLimit("min", e, !0, A.toString(n));
  }
  gt(e, n) {
    return this.setLimit("min", e, !1, A.toString(n));
  }
  lte(e, n) {
    return this.setLimit("max", e, !0, A.toString(n));
  }
  lt(e, n) {
    return this.setLimit("max", e, !1, A.toString(n));
  }
  setLimit(e, n, r, s) {
    return new ie({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: n,
          inclusive: r,
          message: A.toString(s)
        }
      ]
    });
  }
  _addCheck(e) {
    return new ie({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: A.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: A.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: A.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: A.toString(e)
    });
  }
  multipleOf(e, n) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: A.toString(n)
    });
  }
  get minValue() {
    let e = null;
    for (const n of this._def.checks)
      n.kind === "min" && (e === null || n.value > e) && (e = n.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (const n of this._def.checks)
      n.kind === "max" && (e === null || n.value < e) && (e = n.value);
    return e;
  }
}
ie.create = (t) => {
  var e;
  return new ie({
    checks: [],
    typeName: S.ZodBigInt,
    coerce: (e = t?.coerce) !== null && e !== void 0 ? e : !1,
    ...j(t)
  });
};
class Oe extends N {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== _.boolean) {
      const r = this._getOrReturnCtx(e);
      return k(r, {
        code: f.invalid_type,
        expected: _.boolean,
        received: r.parsedType
      }), E;
    }
    return V(e.data);
  }
}
Oe.create = (t) => new Oe({
  typeName: S.ZodBoolean,
  coerce: t?.coerce || !1,
  ...j(t)
});
class fe extends N {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== _.date) {
      const i = this._getOrReturnCtx(e);
      return k(i, {
        code: f.invalid_type,
        expected: _.date,
        received: i.parsedType
      }), E;
    }
    if (isNaN(e.data.getTime())) {
      const i = this._getOrReturnCtx(e);
      return k(i, {
        code: f.invalid_date
      }), E;
    }
    const r = new z();
    let s;
    for (const i of this._def.checks)
      i.kind === "min" ? e.data.getTime() < i.value && (s = this._getOrReturnCtx(e, s), k(s, {
        code: f.too_small,
        message: i.message,
        inclusive: !0,
        exact: !1,
        minimum: i.value,
        type: "date"
      }), r.dirty()) : i.kind === "max" ? e.data.getTime() > i.value && (s = this._getOrReturnCtx(e, s), k(s, {
        code: f.too_big,
        message: i.message,
        inclusive: !0,
        exact: !1,
        maximum: i.value,
        type: "date"
      }), r.dirty()) : R.assertNever(i);
    return {
      status: r.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new fe({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, n) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: A.toString(n)
    });
  }
  max(e, n) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: A.toString(n)
    });
  }
  get minDate() {
    let e = null;
    for (const n of this._def.checks)
      n.kind === "min" && (e === null || n.value > e) && (e = n.value);
    return e != null ? new Date(e) : null;
  }
  get maxDate() {
    let e = null;
    for (const n of this._def.checks)
      n.kind === "max" && (e === null || n.value < e) && (e = n.value);
    return e != null ? new Date(e) : null;
  }
}
fe.create = (t) => new fe({
  checks: [],
  coerce: t?.coerce || !1,
  typeName: S.ZodDate,
  ...j(t)
});
class tt extends N {
  _parse(e) {
    if (this._getType(e) !== _.symbol) {
      const r = this._getOrReturnCtx(e);
      return k(r, {
        code: f.invalid_type,
        expected: _.symbol,
        received: r.parsedType
      }), E;
    }
    return V(e.data);
  }
}
tt.create = (t) => new tt({
  typeName: S.ZodSymbol,
  ...j(t)
});
class je extends N {
  _parse(e) {
    if (this._getType(e) !== _.undefined) {
      const r = this._getOrReturnCtx(e);
      return k(r, {
        code: f.invalid_type,
        expected: _.undefined,
        received: r.parsedType
      }), E;
    }
    return V(e.data);
  }
}
je.create = (t) => new je({
  typeName: S.ZodUndefined,
  ...j(t)
});
class Ne extends N {
  _parse(e) {
    if (this._getType(e) !== _.null) {
      const r = this._getOrReturnCtx(e);
      return k(r, {
        code: f.invalid_type,
        expected: _.null,
        received: r.parsedType
      }), E;
    }
    return V(e.data);
  }
}
Ne.create = (t) => new Ne({
  typeName: S.ZodNull,
  ...j(t)
});
class xe extends N {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return V(e.data);
  }
}
xe.create = (t) => new xe({
  typeName: S.ZodAny,
  ...j(t)
});
class he extends N {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return V(e.data);
  }
}
he.create = (t) => new he({
  typeName: S.ZodUnknown,
  ...j(t)
});
class ne extends N {
  _parse(e) {
    const n = this._getOrReturnCtx(e);
    return k(n, {
      code: f.invalid_type,
      expected: _.never,
      received: n.parsedType
    }), E;
  }
}
ne.create = (t) => new ne({
  typeName: S.ZodNever,
  ...j(t)
});
class nt extends N {
  _parse(e) {
    if (this._getType(e) !== _.undefined) {
      const r = this._getOrReturnCtx(e);
      return k(r, {
        code: f.invalid_type,
        expected: _.void,
        received: r.parsedType
      }), E;
    }
    return V(e.data);
  }
}
nt.create = (t) => new nt({
  typeName: S.ZodVoid,
  ...j(t)
});
class F extends N {
  _parse(e) {
    const { ctx: n, status: r } = this._processInputParams(e), s = this._def;
    if (n.parsedType !== _.array)
      return k(n, {
        code: f.invalid_type,
        expected: _.array,
        received: n.parsedType
      }), E;
    if (s.exactLength !== null) {
      const o = n.data.length > s.exactLength.value, a = n.data.length < s.exactLength.value;
      (o || a) && (k(n, {
        code: o ? f.too_big : f.too_small,
        minimum: a ? s.exactLength.value : void 0,
        maximum: o ? s.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: s.exactLength.message
      }), r.dirty());
    }
    if (s.minLength !== null && n.data.length < s.minLength.value && (k(n, {
      code: f.too_small,
      minimum: s.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: s.minLength.message
    }), r.dirty()), s.maxLength !== null && n.data.length > s.maxLength.value && (k(n, {
      code: f.too_big,
      maximum: s.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: s.maxLength.message
    }), r.dirty()), n.common.async)
      return Promise.all([...n.data].map((o, a) => s.type._parseAsync(new K(n, o, n.path, a)))).then((o) => z.mergeArray(r, o));
    const i = [...n.data].map((o, a) => s.type._parseSync(new K(n, o, n.path, a)));
    return z.mergeArray(r, i);
  }
  get element() {
    return this._def.type;
  }
  min(e, n) {
    return new F({
      ...this._def,
      minLength: { value: e, message: A.toString(n) }
    });
  }
  max(e, n) {
    return new F({
      ...this._def,
      maxLength: { value: e, message: A.toString(n) }
    });
  }
  length(e, n) {
    return new F({
      ...this._def,
      exactLength: { value: e, message: A.toString(n) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
F.create = (t, e) => new F({
  type: t,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: S.ZodArray,
  ...j(e)
});
function be(t) {
  if (t instanceof q) {
    const e = {};
    for (const n in t.shape) {
      const r = t.shape[n];
      e[n] = H.create(be(r));
    }
    return new q({
      ...t._def,
      shape: () => e
    });
  } else return t instanceof F ? new F({
    ...t._def,
    type: be(t.element)
  }) : t instanceof H ? H.create(be(t.unwrap())) : t instanceof oe ? oe.create(be(t.unwrap())) : t instanceof J ? J.create(t.items.map((e) => be(e))) : t;
}
class q extends N {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), n = R.objectKeys(e);
    return this._cached = { shape: e, keys: n };
  }
  _parse(e) {
    if (this._getType(e) !== _.object) {
      const l = this._getOrReturnCtx(e);
      return k(l, {
        code: f.invalid_type,
        expected: _.object,
        received: l.parsedType
      }), E;
    }
    const { status: r, ctx: s } = this._processInputParams(e), { shape: i, keys: o } = this._getCached(), a = [];
    if (!(this._def.catchall instanceof ne && this._def.unknownKeys === "strip"))
      for (const l in s.data)
        o.includes(l) || a.push(l);
    const c = [];
    for (const l of o) {
      const d = i[l], h = s.data[l];
      c.push({
        key: { status: "valid", value: l },
        value: d._parse(new K(s, h, s.path, l)),
        alwaysSet: l in s.data
      });
    }
    if (this._def.catchall instanceof ne) {
      const l = this._def.unknownKeys;
      if (l === "passthrough")
        for (const d of a)
          c.push({
            key: { status: "valid", value: d },
            value: { status: "valid", value: s.data[d] }
          });
      else if (l === "strict")
        a.length > 0 && (k(s, {
          code: f.unrecognized_keys,
          keys: a
        }), r.dirty());
      else if (l !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const l = this._def.catchall;
      for (const d of a) {
        const h = s.data[d];
        c.push({
          key: { status: "valid", value: d },
          value: l._parse(
            new K(s, h, s.path, d)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: d in s.data
        });
      }
    }
    return s.common.async ? Promise.resolve().then(async () => {
      const l = [];
      for (const d of c) {
        const h = await d.key, m = await d.value;
        l.push({
          key: h,
          value: m,
          alwaysSet: d.alwaysSet
        });
      }
      return l;
    }).then((l) => z.mergeObjectSync(r, l)) : z.mergeObjectSync(r, c);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return A.errToObj, new q({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (n, r) => {
          var s, i, o, a;
          const c = (o = (i = (s = this._def).errorMap) === null || i === void 0 ? void 0 : i.call(s, n, r).message) !== null && o !== void 0 ? o : r.defaultError;
          return n.code === "unrecognized_keys" ? {
            message: (a = A.errToObj(e).message) !== null && a !== void 0 ? a : c
          } : {
            message: c
          };
        }
      } : {}
    });
  }
  strip() {
    return new q({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new q({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(e) {
    return new q({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...e
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(e) {
    return new q({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: S.ZodObject
    });
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(e, n) {
    return this.augment({ [e]: n });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(e) {
    return new q({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const n = {};
    return R.objectKeys(e).forEach((r) => {
      e[r] && this.shape[r] && (n[r] = this.shape[r]);
    }), new q({
      ...this._def,
      shape: () => n
    });
  }
  omit(e) {
    const n = {};
    return R.objectKeys(this.shape).forEach((r) => {
      e[r] || (n[r] = this.shape[r]);
    }), new q({
      ...this._def,
      shape: () => n
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return be(this);
  }
  partial(e) {
    const n = {};
    return R.objectKeys(this.shape).forEach((r) => {
      const s = this.shape[r];
      e && !e[r] ? n[r] = s : n[r] = s.optional();
    }), new q({
      ...this._def,
      shape: () => n
    });
  }
  required(e) {
    const n = {};
    return R.objectKeys(this.shape).forEach((r) => {
      if (e && !e[r])
        n[r] = this.shape[r];
      else {
        let i = this.shape[r];
        for (; i instanceof H; )
          i = i._def.innerType;
        n[r] = i;
      }
    }), new q({
      ...this._def,
      shape: () => n
    });
  }
  keyof() {
    return Xt(R.objectKeys(this.shape));
  }
}
q.create = (t, e) => new q({
  shape: () => t,
  unknownKeys: "strip",
  catchall: ne.create(),
  typeName: S.ZodObject,
  ...j(e)
});
q.strictCreate = (t, e) => new q({
  shape: () => t,
  unknownKeys: "strict",
  catchall: ne.create(),
  typeName: S.ZodObject,
  ...j(e)
});
q.lazycreate = (t, e) => new q({
  shape: t,
  unknownKeys: "strip",
  catchall: ne.create(),
  typeName: S.ZodObject,
  ...j(e)
});
class Re extends N {
  _parse(e) {
    const { ctx: n } = this._processInputParams(e), r = this._def.options;
    function s(i) {
      for (const a of i)
        if (a.result.status === "valid")
          return a.result;
      for (const a of i)
        if (a.result.status === "dirty")
          return n.common.issues.push(...a.ctx.common.issues), a.result;
      const o = i.map((a) => new U(a.ctx.common.issues));
      return k(n, {
        code: f.invalid_union,
        unionErrors: o
      }), E;
    }
    if (n.common.async)
      return Promise.all(r.map(async (i) => {
        const o = {
          ...n,
          common: {
            ...n.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await i._parseAsync({
            data: n.data,
            path: n.path,
            parent: o
          }),
          ctx: o
        };
      })).then(s);
    {
      let i;
      const o = [];
      for (const c of r) {
        const l = {
          ...n,
          common: {
            ...n.common,
            issues: []
          },
          parent: null
        }, d = c._parseSync({
          data: n.data,
          path: n.path,
          parent: l
        });
        if (d.status === "valid")
          return d;
        d.status === "dirty" && !i && (i = { result: d, ctx: l }), l.common.issues.length && o.push(l.common.issues);
      }
      if (i)
        return n.common.issues.push(...i.ctx.common.issues), i.result;
      const a = o.map((c) => new U(c));
      return k(n, {
        code: f.invalid_union,
        unionErrors: a
      }), E;
    }
  }
  get options() {
    return this._def.options;
  }
}
Re.create = (t, e) => new Re({
  options: t,
  typeName: S.ZodUnion,
  ...j(e)
});
const te = (t) => t instanceof $e ? te(t.schema) : t instanceof X ? te(t.innerType()) : t instanceof De ? [t.value] : t instanceof ae ? t.options : t instanceof qe ? R.objectValues(t.enum) : t instanceof Be ? te(t._def.innerType) : t instanceof je ? [void 0] : t instanceof Ne ? [null] : t instanceof H ? [void 0, ...te(t.unwrap())] : t instanceof oe ? [null, ...te(t.unwrap())] : t instanceof wt || t instanceof Ve ? te(t.unwrap()) : t instanceof ze ? te(t._def.innerType) : [];
class at extends N {
  _parse(e) {
    const { ctx: n } = this._processInputParams(e);
    if (n.parsedType !== _.object)
      return k(n, {
        code: f.invalid_type,
        expected: _.object,
        received: n.parsedType
      }), E;
    const r = this.discriminator, s = n.data[r], i = this.optionsMap.get(s);
    return i ? n.common.async ? i._parseAsync({
      data: n.data,
      path: n.path,
      parent: n
    }) : i._parseSync({
      data: n.data,
      path: n.path,
      parent: n
    }) : (k(n, {
      code: f.invalid_union_discriminator,
      options: Array.from(this.optionsMap.keys()),
      path: [r]
    }), E);
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(e, n, r) {
    const s = /* @__PURE__ */ new Map();
    for (const i of n) {
      const o = te(i.shape[e]);
      if (!o.length)
        throw new Error(`A discriminator value for key \`${e}\` could not be extracted from all schema options`);
      for (const a of o) {
        if (s.has(a))
          throw new Error(`Discriminator property ${String(e)} has duplicate value ${String(a)}`);
        s.set(a, i);
      }
    }
    return new at({
      typeName: S.ZodDiscriminatedUnion,
      discriminator: e,
      options: n,
      optionsMap: s,
      ...j(r)
    });
  }
}
function vt(t, e) {
  const n = re(t), r = re(e);
  if (t === e)
    return { valid: !0, data: t };
  if (n === _.object && r === _.object) {
    const s = R.objectKeys(e), i = R.objectKeys(t).filter((a) => s.indexOf(a) !== -1), o = { ...t, ...e };
    for (const a of i) {
      const c = vt(t[a], e[a]);
      if (!c.valid)
        return { valid: !1 };
      o[a] = c.data;
    }
    return { valid: !0, data: o };
  } else if (n === _.array && r === _.array) {
    if (t.length !== e.length)
      return { valid: !1 };
    const s = [];
    for (let i = 0; i < t.length; i++) {
      const o = t[i], a = e[i], c = vt(o, a);
      if (!c.valid)
        return { valid: !1 };
      s.push(c.data);
    }
    return { valid: !0, data: s };
  } else return n === _.date && r === _.date && +t == +e ? { valid: !0, data: t } : { valid: !1 };
}
class Ze extends N {
  _parse(e) {
    const { status: n, ctx: r } = this._processInputParams(e), s = (i, o) => {
      if (gt(i) || gt(o))
        return E;
      const a = vt(i.value, o.value);
      return a.valid ? ((yt(i) || yt(o)) && n.dirty(), { status: n.value, value: a.data }) : (k(r, {
        code: f.invalid_intersection_types
      }), E);
    };
    return r.common.async ? Promise.all([
      this._def.left._parseAsync({
        data: r.data,
        path: r.path,
        parent: r
      }),
      this._def.right._parseAsync({
        data: r.data,
        path: r.path,
        parent: r
      })
    ]).then(([i, o]) => s(i, o)) : s(this._def.left._parseSync({
      data: r.data,
      path: r.path,
      parent: r
    }), this._def.right._parseSync({
      data: r.data,
      path: r.path,
      parent: r
    }));
  }
}
Ze.create = (t, e, n) => new Ze({
  left: t,
  right: e,
  typeName: S.ZodIntersection,
  ...j(n)
});
class J extends N {
  _parse(e) {
    const { status: n, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== _.array)
      return k(r, {
        code: f.invalid_type,
        expected: _.array,
        received: r.parsedType
      }), E;
    if (r.data.length < this._def.items.length)
      return k(r, {
        code: f.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), E;
    !this._def.rest && r.data.length > this._def.items.length && (k(r, {
      code: f.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), n.dirty());
    const i = [...r.data].map((o, a) => {
      const c = this._def.items[a] || this._def.rest;
      return c ? c._parse(new K(r, o, r.path, a)) : null;
    }).filter((o) => !!o);
    return r.common.async ? Promise.all(i).then((o) => z.mergeArray(n, o)) : z.mergeArray(n, i);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new J({
      ...this._def,
      rest: e
    });
  }
}
J.create = (t, e) => {
  if (!Array.isArray(t))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new J({
    items: t,
    typeName: S.ZodTuple,
    rest: null,
    ...j(e)
  });
};
class Pe extends N {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: n, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== _.object)
      return k(r, {
        code: f.invalid_type,
        expected: _.object,
        received: r.parsedType
      }), E;
    const s = [], i = this._def.keyType, o = this._def.valueType;
    for (const a in r.data)
      s.push({
        key: i._parse(new K(r, a, r.path, a)),
        value: o._parse(new K(r, r.data[a], r.path, a)),
        alwaysSet: a in r.data
      });
    return r.common.async ? z.mergeObjectAsync(n, s) : z.mergeObjectSync(n, s);
  }
  get element() {
    return this._def.valueType;
  }
  static create(e, n, r) {
    return n instanceof N ? new Pe({
      keyType: e,
      valueType: n,
      typeName: S.ZodRecord,
      ...j(r)
    }) : new Pe({
      keyType: W.create(),
      valueType: e,
      typeName: S.ZodRecord,
      ...j(n)
    });
  }
}
class rt extends N {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: n, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== _.map)
      return k(r, {
        code: f.invalid_type,
        expected: _.map,
        received: r.parsedType
      }), E;
    const s = this._def.keyType, i = this._def.valueType, o = [...r.data.entries()].map(([a, c], l) => ({
      key: s._parse(new K(r, a, r.path, [l, "key"])),
      value: i._parse(new K(r, c, r.path, [l, "value"]))
    }));
    if (r.common.async) {
      const a = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const c of o) {
          const l = await c.key, d = await c.value;
          if (l.status === "aborted" || d.status === "aborted")
            return E;
          (l.status === "dirty" || d.status === "dirty") && n.dirty(), a.set(l.value, d.value);
        }
        return { status: n.value, value: a };
      });
    } else {
      const a = /* @__PURE__ */ new Map();
      for (const c of o) {
        const l = c.key, d = c.value;
        if (l.status === "aborted" || d.status === "aborted")
          return E;
        (l.status === "dirty" || d.status === "dirty") && n.dirty(), a.set(l.value, d.value);
      }
      return { status: n.value, value: a };
    }
  }
}
rt.create = (t, e, n) => new rt({
  valueType: e,
  keyType: t,
  typeName: S.ZodMap,
  ...j(n)
});
class me extends N {
  _parse(e) {
    const { status: n, ctx: r } = this._processInputParams(e);
    if (r.parsedType !== _.set)
      return k(r, {
        code: f.invalid_type,
        expected: _.set,
        received: r.parsedType
      }), E;
    const s = this._def;
    s.minSize !== null && r.data.size < s.minSize.value && (k(r, {
      code: f.too_small,
      minimum: s.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: s.minSize.message
    }), n.dirty()), s.maxSize !== null && r.data.size > s.maxSize.value && (k(r, {
      code: f.too_big,
      maximum: s.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: s.maxSize.message
    }), n.dirty());
    const i = this._def.valueType;
    function o(c) {
      const l = /* @__PURE__ */ new Set();
      for (const d of c) {
        if (d.status === "aborted")
          return E;
        d.status === "dirty" && n.dirty(), l.add(d.value);
      }
      return { status: n.value, value: l };
    }
    const a = [...r.data.values()].map((c, l) => i._parse(new K(r, c, r.path, l)));
    return r.common.async ? Promise.all(a).then((c) => o(c)) : o(a);
  }
  min(e, n) {
    return new me({
      ...this._def,
      minSize: { value: e, message: A.toString(n) }
    });
  }
  max(e, n) {
    return new me({
      ...this._def,
      maxSize: { value: e, message: A.toString(n) }
    });
  }
  size(e, n) {
    return this.min(e, n).max(e, n);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
me.create = (t, e) => new me({
  valueType: t,
  minSize: null,
  maxSize: null,
  typeName: S.ZodSet,
  ...j(e)
});
class we extends N {
  constructor() {
    super(...arguments), this.validate = this.implement;
  }
  _parse(e) {
    const { ctx: n } = this._processInputParams(e);
    if (n.parsedType !== _.function)
      return k(n, {
        code: f.invalid_type,
        expected: _.function,
        received: n.parsedType
      }), E;
    function r(a, c) {
      return Qe({
        data: a,
        path: n.path,
        errorMaps: [
          n.common.contextualErrorMap,
          n.schemaErrorMap,
          Je(),
          _e
        ].filter((l) => !!l),
        issueData: {
          code: f.invalid_arguments,
          argumentsError: c
        }
      });
    }
    function s(a, c) {
      return Qe({
        data: a,
        path: n.path,
        errorMaps: [
          n.common.contextualErrorMap,
          n.schemaErrorMap,
          Je(),
          _e
        ].filter((l) => !!l),
        issueData: {
          code: f.invalid_return_type,
          returnTypeError: c
        }
      });
    }
    const i = { errorMap: n.common.contextualErrorMap }, o = n.data;
    if (this._def.returns instanceof Me) {
      const a = this;
      return V(async function(...c) {
        const l = new U([]), d = await a._def.args.parseAsync(c, i).catch((y) => {
          throw l.addIssue(r(c, y)), l;
        }), h = await Reflect.apply(o, this, d);
        return await a._def.returns._def.type.parseAsync(h, i).catch((y) => {
          throw l.addIssue(s(h, y)), l;
        });
      });
    } else {
      const a = this;
      return V(function(...c) {
        const l = a._def.args.safeParse(c, i);
        if (!l.success)
          throw new U([r(c, l.error)]);
        const d = Reflect.apply(o, this, l.data), h = a._def.returns.safeParse(d, i);
        if (!h.success)
          throw new U([s(d, h.error)]);
        return h.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...e) {
    return new we({
      ...this._def,
      args: J.create(e).rest(he.create())
    });
  }
  returns(e) {
    return new we({
      ...this._def,
      returns: e
    });
  }
  implement(e) {
    return this.parse(e);
  }
  strictImplement(e) {
    return this.parse(e);
  }
  static create(e, n, r) {
    return new we({
      args: e || J.create([]).rest(he.create()),
      returns: n || he.create(),
      typeName: S.ZodFunction,
      ...j(r)
    });
  }
}
class $e extends N {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: n } = this._processInputParams(e);
    return this._def.getter()._parse({ data: n.data, path: n.path, parent: n });
  }
}
$e.create = (t, e) => new $e({
  getter: t,
  typeName: S.ZodLazy,
  ...j(e)
});
class De extends N {
  _parse(e) {
    if (e.data !== this._def.value) {
      const n = this._getOrReturnCtx(e);
      return k(n, {
        received: n.data,
        code: f.invalid_literal,
        expected: this._def.value
      }), E;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
De.create = (t, e) => new De({
  value: t,
  typeName: S.ZodLiteral,
  ...j(e)
});
function Xt(t, e) {
  return new ae({
    values: t,
    typeName: S.ZodEnum,
    ...j(e)
  });
}
class ae extends N {
  constructor() {
    super(...arguments), Ie.set(this, void 0);
  }
  _parse(e) {
    if (typeof e.data != "string") {
      const n = this._getOrReturnCtx(e), r = this._def.values;
      return k(n, {
        expected: R.joinValues(r),
        received: n.parsedType,
        code: f.invalid_type
      }), E;
    }
    if (et(this, Ie) || Ut(this, Ie, new Set(this._def.values)), !et(this, Ie).has(e.data)) {
      const n = this._getOrReturnCtx(e), r = this._def.values;
      return k(n, {
        received: n.data,
        code: f.invalid_enum_value,
        options: r
      }), E;
    }
    return V(e.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const e = {};
    for (const n of this._def.values)
      e[n] = n;
    return e;
  }
  get Values() {
    const e = {};
    for (const n of this._def.values)
      e[n] = n;
    return e;
  }
  get Enum() {
    const e = {};
    for (const n of this._def.values)
      e[n] = n;
    return e;
  }
  extract(e, n = this._def) {
    return ae.create(e, {
      ...this._def,
      ...n
    });
  }
  exclude(e, n = this._def) {
    return ae.create(this.options.filter((r) => !e.includes(r)), {
      ...this._def,
      ...n
    });
  }
}
Ie = /* @__PURE__ */ new WeakMap();
ae.create = Xt;
class qe extends N {
  constructor() {
    super(...arguments), Se.set(this, void 0);
  }
  _parse(e) {
    const n = R.getValidEnumValues(this._def.values), r = this._getOrReturnCtx(e);
    if (r.parsedType !== _.string && r.parsedType !== _.number) {
      const s = R.objectValues(n);
      return k(r, {
        expected: R.joinValues(s),
        received: r.parsedType,
        code: f.invalid_type
      }), E;
    }
    if (et(this, Se) || Ut(this, Se, new Set(R.getValidEnumValues(this._def.values))), !et(this, Se).has(e.data)) {
      const s = R.objectValues(n);
      return k(r, {
        received: r.data,
        code: f.invalid_enum_value,
        options: s
      }), E;
    }
    return V(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Se = /* @__PURE__ */ new WeakMap();
qe.create = (t, e) => new qe({
  values: t,
  typeName: S.ZodNativeEnum,
  ...j(e)
});
class Me extends N {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: n } = this._processInputParams(e);
    if (n.parsedType !== _.promise && n.common.async === !1)
      return k(n, {
        code: f.invalid_type,
        expected: _.promise,
        received: n.parsedType
      }), E;
    const r = n.parsedType === _.promise ? n.data : Promise.resolve(n.data);
    return V(r.then((s) => this._def.type.parseAsync(s, {
      path: n.path,
      errorMap: n.common.contextualErrorMap
    })));
  }
}
Me.create = (t, e) => new Me({
  type: t,
  typeName: S.ZodPromise,
  ...j(e)
});
class X extends N {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === S.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: n, ctx: r } = this._processInputParams(e), s = this._def.effect || null, i = {
      addIssue: (o) => {
        k(r, o), o.fatal ? n.abort() : n.dirty();
      },
      get path() {
        return r.path;
      }
    };
    if (i.addIssue = i.addIssue.bind(i), s.type === "preprocess") {
      const o = s.transform(r.data, i);
      if (r.common.async)
        return Promise.resolve(o).then(async (a) => {
          if (n.value === "aborted")
            return E;
          const c = await this._def.schema._parseAsync({
            data: a,
            path: r.path,
            parent: r
          });
          return c.status === "aborted" ? E : c.status === "dirty" || n.value === "dirty" ? ke(c.value) : c;
        });
      {
        if (n.value === "aborted")
          return E;
        const a = this._def.schema._parseSync({
          data: o,
          path: r.path,
          parent: r
        });
        return a.status === "aborted" ? E : a.status === "dirty" || n.value === "dirty" ? ke(a.value) : a;
      }
    }
    if (s.type === "refinement") {
      const o = (a) => {
        const c = s.refinement(a, i);
        if (r.common.async)
          return Promise.resolve(c);
        if (c instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return a;
      };
      if (r.common.async === !1) {
        const a = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return a.status === "aborted" ? E : (a.status === "dirty" && n.dirty(), o(a.value), { status: n.value, value: a.value });
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((a) => a.status === "aborted" ? E : (a.status === "dirty" && n.dirty(), o(a.value).then(() => ({ status: n.value, value: a.value }))));
    }
    if (s.type === "transform")
      if (r.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r
        });
        if (!Ee(o))
          return o;
        const a = s.transform(o.value, i);
        if (a instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: n.value, value: a };
      } else
        return this._def.schema._parseAsync({ data: r.data, path: r.path, parent: r }).then((o) => Ee(o) ? Promise.resolve(s.transform(o.value, i)).then((a) => ({ status: n.value, value: a })) : o);
    R.assertNever(s);
  }
}
X.create = (t, e, n) => new X({
  schema: t,
  typeName: S.ZodEffects,
  effect: e,
  ...j(n)
});
X.createWithPreprocess = (t, e, n) => new X({
  schema: e,
  effect: { type: "preprocess", transform: t },
  typeName: S.ZodEffects,
  ...j(n)
});
class H extends N {
  _parse(e) {
    return this._getType(e) === _.undefined ? V(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
H.create = (t, e) => new H({
  innerType: t,
  typeName: S.ZodOptional,
  ...j(e)
});
class oe extends N {
  _parse(e) {
    return this._getType(e) === _.null ? V(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
oe.create = (t, e) => new oe({
  innerType: t,
  typeName: S.ZodNullable,
  ...j(e)
});
class Be extends N {
  _parse(e) {
    const { ctx: n } = this._processInputParams(e);
    let r = n.data;
    return n.parsedType === _.undefined && (r = this._def.defaultValue()), this._def.innerType._parse({
      data: r,
      path: n.path,
      parent: n
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
Be.create = (t, e) => new Be({
  innerType: t,
  typeName: S.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...j(e)
});
class ze extends N {
  _parse(e) {
    const { ctx: n } = this._processInputParams(e), r = {
      ...n,
      common: {
        ...n.common,
        issues: []
      }
    }, s = this._def.innerType._parse({
      data: r.data,
      path: r.path,
      parent: {
        ...r
      }
    });
    return Ce(s) ? s.then((i) => ({
      status: "valid",
      value: i.status === "valid" ? i.value : this._def.catchValue({
        get error() {
          return new U(r.common.issues);
        },
        input: r.data
      })
    })) : {
      status: "valid",
      value: s.status === "valid" ? s.value : this._def.catchValue({
        get error() {
          return new U(r.common.issues);
        },
        input: r.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
ze.create = (t, e) => new ze({
  innerType: t,
  typeName: S.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...j(e)
});
class st extends N {
  _parse(e) {
    if (this._getType(e) !== _.nan) {
      const r = this._getOrReturnCtx(e);
      return k(r, {
        code: f.invalid_type,
        expected: _.nan,
        received: r.parsedType
      }), E;
    }
    return { status: "valid", value: e.data };
  }
}
st.create = (t) => new st({
  typeName: S.ZodNaN,
  ...j(t)
});
const Wn = Symbol("zod_brand");
class wt extends N {
  _parse(e) {
    const { ctx: n } = this._processInputParams(e), r = n.data;
    return this._def.type._parse({
      data: r,
      path: n.path,
      parent: n
    });
  }
  unwrap() {
    return this._def.type;
  }
}
class Ye extends N {
  _parse(e) {
    const { status: n, ctx: r } = this._processInputParams(e);
    if (r.common.async)
      return (async () => {
        const i = await this._def.in._parseAsync({
          data: r.data,
          path: r.path,
          parent: r
        });
        return i.status === "aborted" ? E : i.status === "dirty" ? (n.dirty(), ke(i.value)) : this._def.out._parseAsync({
          data: i.value,
          path: r.path,
          parent: r
        });
      })();
    {
      const s = this._def.in._parseSync({
        data: r.data,
        path: r.path,
        parent: r
      });
      return s.status === "aborted" ? E : s.status === "dirty" ? (n.dirty(), {
        status: "dirty",
        value: s.value
      }) : this._def.out._parseSync({
        data: s.value,
        path: r.path,
        parent: r
      });
    }
  }
  static create(e, n) {
    return new Ye({
      in: e,
      out: n,
      typeName: S.ZodPipeline
    });
  }
}
class Ve extends N {
  _parse(e) {
    const n = this._def.innerType._parse(e), r = (s) => (Ee(s) && (s.value = Object.freeze(s.value)), s);
    return Ce(n) ? n.then((s) => r(s)) : r(n);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Ve.create = (t, e) => new Ve({
  innerType: t,
  typeName: S.ZodReadonly,
  ...j(e)
});
function Gt(t, e = {}, n) {
  return t ? xe.create().superRefine((r, s) => {
    var i, o;
    if (!t(r)) {
      const a = typeof e == "function" ? e(r) : typeof e == "string" ? { message: e } : e, c = (o = (i = a.fatal) !== null && i !== void 0 ? i : n) !== null && o !== void 0 ? o : !0, l = typeof a == "string" ? { message: a } : a;
      s.addIssue({ code: "custom", ...l, fatal: c });
    }
  }) : xe.create();
}
const Fn = {
  object: q.lazycreate
};
var S;
(function(t) {
  t.ZodString = "ZodString", t.ZodNumber = "ZodNumber", t.ZodNaN = "ZodNaN", t.ZodBigInt = "ZodBigInt", t.ZodBoolean = "ZodBoolean", t.ZodDate = "ZodDate", t.ZodSymbol = "ZodSymbol", t.ZodUndefined = "ZodUndefined", t.ZodNull = "ZodNull", t.ZodAny = "ZodAny", t.ZodUnknown = "ZodUnknown", t.ZodNever = "ZodNever", t.ZodVoid = "ZodVoid", t.ZodArray = "ZodArray", t.ZodObject = "ZodObject", t.ZodUnion = "ZodUnion", t.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", t.ZodIntersection = "ZodIntersection", t.ZodTuple = "ZodTuple", t.ZodRecord = "ZodRecord", t.ZodMap = "ZodMap", t.ZodSet = "ZodSet", t.ZodFunction = "ZodFunction", t.ZodLazy = "ZodLazy", t.ZodLiteral = "ZodLiteral", t.ZodEnum = "ZodEnum", t.ZodEffects = "ZodEffects", t.ZodNativeEnum = "ZodNativeEnum", t.ZodOptional = "ZodOptional", t.ZodNullable = "ZodNullable", t.ZodDefault = "ZodDefault", t.ZodCatch = "ZodCatch", t.ZodPromise = "ZodPromise", t.ZodBranded = "ZodBranded", t.ZodPipeline = "ZodPipeline", t.ZodReadonly = "ZodReadonly";
})(S || (S = {}));
const Xn = (t, e = {
  message: `Input not instance of ${t.name}`
}) => Gt((n) => n instanceof t, e), Ht = W.create, Kt = se.create, Gn = st.create, Hn = ie.create, Jt = Oe.create, Kn = fe.create, Jn = tt.create, Qn = je.create, er = Ne.create, tr = xe.create, nr = he.create, rr = ne.create, sr = nt.create, ir = F.create, ar = q.create, or = q.strictCreate, lr = Re.create, cr = at.create, dr = Ze.create, ur = J.create, hr = Pe.create, pr = rt.create, fr = me.create, mr = we.create, gr = $e.create, yr = De.create, vr = ae.create, br = qe.create, kr = Me.create, Nt = X.create, wr = H.create, _r = oe.create, xr = X.createWithPreprocess, Mr = Ye.create, Ar = () => Ht().optional(), Tr = () => Kt().optional(), Lr = () => Jt().optional(), Ir = {
  string: (t) => W.create({ ...t, coerce: !0 }),
  number: (t) => se.create({ ...t, coerce: !0 }),
  boolean: (t) => Oe.create({
    ...t,
    coerce: !0
  }),
  bigint: (t) => ie.create({ ...t, coerce: !0 }),
  date: (t) => fe.create({ ...t, coerce: !0 })
}, Sr = E;
var p = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  defaultErrorMap: _e,
  setErrorMap: Sn,
  getErrorMap: Je,
  makeIssue: Qe,
  EMPTY_PATH: En,
  addIssueToContext: k,
  ParseStatus: z,
  INVALID: E,
  DIRTY: ke,
  OK: V,
  isAborted: gt,
  isDirty: yt,
  isValid: Ee,
  isAsync: Ce,
  get util() {
    return R;
  },
  get objectUtil() {
    return mt;
  },
  ZodParsedType: _,
  getParsedType: re,
  ZodType: N,
  datetimeRegex: Ft,
  ZodString: W,
  ZodNumber: se,
  ZodBigInt: ie,
  ZodBoolean: Oe,
  ZodDate: fe,
  ZodSymbol: tt,
  ZodUndefined: je,
  ZodNull: Ne,
  ZodAny: xe,
  ZodUnknown: he,
  ZodNever: ne,
  ZodVoid: nt,
  ZodArray: F,
  ZodObject: q,
  ZodUnion: Re,
  ZodDiscriminatedUnion: at,
  ZodIntersection: Ze,
  ZodTuple: J,
  ZodRecord: Pe,
  ZodMap: rt,
  ZodSet: me,
  ZodFunction: we,
  ZodLazy: $e,
  ZodLiteral: De,
  ZodEnum: ae,
  ZodNativeEnum: qe,
  ZodPromise: Me,
  ZodEffects: X,
  ZodTransformer: X,
  ZodOptional: H,
  ZodNullable: oe,
  ZodDefault: Be,
  ZodCatch: ze,
  ZodNaN: st,
  BRAND: Wn,
  ZodBranded: wt,
  ZodPipeline: Ye,
  ZodReadonly: Ve,
  custom: Gt,
  Schema: N,
  ZodSchema: N,
  late: Fn,
  get ZodFirstPartyTypeKind() {
    return S;
  },
  coerce: Ir,
  any: tr,
  array: ir,
  bigint: Hn,
  boolean: Jt,
  date: Kn,
  discriminatedUnion: cr,
  effect: Nt,
  enum: vr,
  function: mr,
  instanceof: Xn,
  intersection: dr,
  lazy: gr,
  literal: yr,
  map: pr,
  nan: Gn,
  nativeEnum: br,
  never: rr,
  null: er,
  nullable: _r,
  number: Kt,
  object: ar,
  oboolean: Lr,
  onumber: Tr,
  optional: wr,
  ostring: Ar,
  pipeline: Mr,
  preprocess: xr,
  promise: kr,
  record: hr,
  set: fr,
  strictObject: or,
  string: Ht,
  symbol: Jn,
  transformer: Nt,
  tuple: ur,
  undefined: Qn,
  union: lr,
  unknown: nr,
  void: sr,
  NEVER: Sr,
  ZodIssueCode: f,
  quotelessJson: In,
  ZodError: U
});
const Qt = ["tree", "court", "playground", "plaza", "path", "road", "building"];
function en(t) {
  const e = /^(remove|move)-([a-z]+)$/.exec(t);
  return !e || !Qt.includes(e[2]) || e[1] === "move" && (e[2] === "road" || e[2] === "building") ? null : { action: e[1], kind: e[2] };
}
const ut = p.tuple([p.number(), p.number(), p.number()]), Rt = p.tuple([p.number(), p.number()]), ue = (t) => t ?? void 0, Er = p.object({
  kind: p.enum(Qt),
  id: p.string().min(1),
  footprint: p.object({ x: p.number(), y: p.number(), radiusM: p.number().positive(), ring: p.array(Rt).nullish().transform(ue), path: p.array(Rt).nullish().transform(ue) }).transform((t) => ({ x: t.x, y: t.y, radiusM: t.radiusM, ...t.ring ? { ring: t.ring } : {}, ...t.path ? { path: t.path } : {} }))
});
p.object({
  id: p.string(),
  kind: p.enum(["point", "line"]),
  typeId: p.string(),
  widthM: p.number(),
  lengthM: p.number().positive().nullish().transform((t) => t ?? void 0),
  shape: p.enum(["circle", "square"]).nullish().transform((t) => t ?? void 0),
  color: p.string(),
  coords: p.array(ut).min(1),
  waypoints: p.array(ut).nullish().transform((t) => t ?? void 0),
  authorId: p.string(),
  authorName: p.string().nullish().transform((t) => t ?? void 0),
  votes: p.array(p.object({ voterId: p.string(), dir: p.union([p.literal(1), p.literal(-1)]), phase: p.number().int().nullish().transform(ue), name: p.string().nullish().transform((t) => t ?? void 0) })),
  phase: p.number().int().nullish().transform(ue),
  createdAt: p.number(),
  note: p.string().nullish(),
  rotationDeg: p.number().nullish().transform((t) => t ?? void 0),
  label: p.string().nullish(),
  othersVoted: p.boolean().nullish().transform((t) => t ?? void 0),
  forkedFrom: p.string().nullish().transform((t) => t ?? void 0),
  existing: Er.nullish().transform(ue),
  from: ut.nullish().transform(ue)
});
p.object({
  id: p.string(),
  members: p.array(p.string()),
  votes: p.array(p.object({
    voterId: p.string(),
    submissionId: p.string(),
    phase: p.number().int().nullish().transform(ue)
  }))
});
p.object({
  authorId: p.string(),
  countingId: p.string(),
  userId: p.string(),
  phase: p.number().int(),
  placements: p.number().int(),
  signedIn: p.boolean(),
  name: p.string().nullable(),
  // admin mode (contract 2): an API from before it says none of these, and that is nobody's admin
  admin: p.boolean().default(!1),
  email: p.string().nullable().default(null),
  votes: p.number().int().default(0)
});
const Cr = new bt();
function Or(t, e, n, r = {}) {
  const s = {
    theta: r.theta ?? ye.theta,
    phaseVotes: r.phaseVotes ?? ye.phaseVotes,
    ghosts: r.ghosts ?? ye.ghosts,
    phases: r.phases ?? ye.phases,
    budget: r.budget ?? ye.budget,
    split: r.split ?? ye.split
  }, i = r.overlaps ?? Cr, o = /* @__PURE__ */ new Map();
  for (const u of t) {
    const x = o.get(u.id);
    (!x || u.createdAt >= x.createdAt) && o.set(u.id, u);
  }
  const a = [...o.values()], c = (u, x) => u.createdAt - x.createdAt || (u.id < x.id ? -1 : u.id > x.id ? 1 : 0);
  let l = !0;
  for (let u = 1; u < a.length && l; u++) c(a[u - 1], a[u]) > 0 && (l = !1);
  l || a.sort(c);
  const d = a.map((u) => u.id), h = /* @__PURE__ */ new Map();
  d.forEach((u, x) => h.set(u, x));
  const m = a.map((u) => typeof u.phase == "number" && u.phase >= 1 ? Math.floor(u.phase) : 1);
  i.sync(a);
  const y = a.map(() => []);
  for (let u = 0; u < a.length; u++) {
    if (a[u].removal) continue;
    const x = i.area(d[u]);
    for (const [I, C] of i.neighbours(d[u])) {
      const w = h.get(I);
      w === void 0 || w <= u || a[w].removal || zt(C, x, i.area(I), s.theta) && (y[u].push(w), y[w].push(u));
    }
  }
  for (const u of y) u.sort((x, I) => x - I);
  const v = new Mn(d, e, n, h);
  let g = 1, M = 1;
  for (let u = 0; u < a.length; u++)
    m[u] > g && (g = m[u]), m[u] > M && v.someoneIsFor(u) && (M = m[u]);
  const T = (u) => typeof u.phase == "number" && u.phase >= 1 ? Math.floor(u.phase) : 1;
  for (const u of e) h.has(u.proposalId) && T(u) > g && (g = T(u));
  for (const u of n) h.has(u.proposalId) && T(u) > g && (g = T(u));
  const Z = Math.min(g, r.phase !== void 0 && Number.isFinite(r.phase) ? Math.max(1, Math.floor(r.phase)) : M), $ = An(y, v, m, Z, s), B = new Uint8Array(a.length);
  for (const u of $.selected) B[u] = 1;
  const b = {}, O = {};
  for (let u = 0; u < a.length; u++) {
    if (m[u] > Z) continue;
    const x = v.score(u, B, Z, s.phaseVotes, s.ghosts);
    b[d[u]] = x.score, O[d[u]] = x.inherited;
  }
  return {
    selected: $.selected.map((u) => d[u]),
    scores: b,
    inherited: O,
    approximate: $.approximate,
    branchPoints: $.branchPoints,
    phase: Z,
    maxPhase: g
  };
}
const ht = (t) => typeof t == "number" && t >= 1 ? Math.floor(t) : 1;
function jr(t, e) {
  const n = [], r = [];
  for (const i of t) {
    n.push({
      id: i.id,
      createdAt: i.createdAt,
      phase: ht(i.phase),
      kind: i.kind,
      shape: i.shape,
      widthM: i.widthM,
      lengthM: i.lengthM,
      rotationDeg: i.rotationDeg,
      coords: i.coords,
      removal: en(i.typeId)?.action === "remove",
      geometryKey: Nr(i)
    });
    for (const o of i.votes) (o.dir === 1 || o.dir === -1) && r.push({ userId: o.voterId, proposalId: i.id, dir: o.dir, phase: ht(o.phase) });
  }
  const s = [];
  for (const i of e)
    for (const o of i.votes) s.push({ userId: o.voterId, proposalId: o.submissionId, jointId: i.id, members: i.members, phase: ht(o.phase) });
  return { proposals: n, votes: r, ghosts: s };
}
function Nr(t) {
  let e = `${t.kind}|${t.shape ?? ""}|${t.widthM}|${t.lengthM ?? ""}|${t.rotationDeg ?? 0}|`;
  for (const n of t.kind === "point" ? t.coords.slice(0, 1) : t.coords) e += `${n[0]},${n[1]};`;
  return e;
}
const Rr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='-80%20-40%20672%20592'%20fill='%23E0A526'%20stroke='none'%3e%3cpath%20d='M192%2096a48%2048%200%201%200%200-96%2048%2048%200%201%200%200%2096zM120.5%20247.2c12.4-4.7%2018.7-18.5%2014-30.9s-18.5-18.7-30.9-14C43.1%20225.1%200%20283.5%200%20352c0%2088.4%2071.6%20160%20160%20160c61.2%200%20114.3-34.3%20141.2-84.7c6.2-11.7%201.8-26.2-9.9-32.5s-26.2-1.8-32.5%209.9C240%20440%20202.8%20464%20160%20464C98.1%20464%2048%20413.9%2048%20352c0-47.9%2030.1-88.8%2072.5-104.8zM259.8%20176l-1.9-9.7c-4.5-22.3-24-38.3-46.8-38.3c-30.1%200-52.7%2027.5-46.8%2057l23.1%20115.5c6%2029.9%2032.2%2051.4%2062.8%2051.4l5.1%200c.4%200%20.8%200%201.3%200l94.1%200c6.7%200%2012.6%204.1%2015%2010.4L402%20459.2c6%2016.1%2023.8%2024.6%2040.1%2019.1l48-16c16.8-5.6%2025.8-23.7%2020.2-40.5s-23.7-25.8-40.5-20.2l-18.7%206.2-25.5-68c-11.7-31.2-41.6-51.9-74.9-51.9l-68.5%200-9.6-48%2063.4%200c17.7%200%2032-14.3%2032-32s-14.3-32-32-32l-76.2%200z'/%3e%3c/svg%3e", Zr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%239B7FD4'%20stroke-width='1.2'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3crect%20x='8'%20y='8'%20width='16'%20height='16'%20rx='2'/%3e%3cline%20x1='12'%20y1='4'%20x2='12'%20y2='8'/%3e%3cline%20x1='16'%20y1='4'%20x2='16'%20y2='8'/%3e%3cline%20x1='20'%20y1='4'%20x2='20'%20y2='8'/%3e%3cline%20x1='12'%20y1='24'%20x2='12'%20y2='28'/%3e%3cline%20x1='16'%20y1='24'%20x2='16'%20y2='28'/%3e%3cline%20x1='20'%20y1='24'%20x2='20'%20y2='28'/%3e%3cline%20x1='4'%20y1='12'%20x2='8'%20y2='12'/%3e%3cline%20x1='4'%20y1='16'%20x2='8'%20y2='16'/%3e%3cline%20x1='4'%20y1='20'%20x2='8'%20y2='20'/%3e%3cline%20x1='24'%20y1='12'%20x2='28'%20y2='12'/%3e%3cline%20x1='24'%20y1='16'%20x2='28'%20y2='16'/%3e%3cline%20x1='24'%20y1='20'%20x2='28'%20y2='20'/%3e%3ccircle%20cx='12'%20cy='12'%20r='1.2'%20fill='%239B7FD4'/%3e%3ccircle%20cx='16'%20cy='12'%20r='1.2'%20fill='%239B7FD4'/%3e%3ccircle%20cx='20'%20cy='12'%20r='1.2'%20fill='%239B7FD4'/%3e%3ccircle%20cx='12'%20cy='16'%20r='1.2'%20fill='%239B7FD4'/%3e%3ccircle%20cx='20'%20cy='16'%20r='1.2'%20fill='%239B7FD4'/%3e%3ccircle%20cx='12'%20cy='20'%20r='1.2'%20fill='%239B7FD4'/%3e%3ccircle%20cx='16'%20cy='20'%20r='1.2'%20fill='%239B7FD4'/%3e%3ccircle%20cx='20'%20cy='20'%20r='1.2'%20fill='%239B7FD4'/%3e%3c/svg%3e", Pr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%2300A651'%20stroke-width='1.2'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3ccircle%20cx='9'%20cy='22'%20r='5.5'/%3e%3ccircle%20cx='23'%20cy='22'%20r='5.5'/%3e%3cpolyline%20points='9,22%2014,14%2020,14%2023,22'/%3e%3cline%20x1='20'%20y1='14'%20x2='20'%20y2='10'/%3e%3ccircle%20cx='17'%20cy='14'%20r='1'%20fill='%2300A651'%20stroke='none'/%3e%3c/svg%3e", $r = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%2300A651'%20stroke-width='1.2'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3cpath%20d='M6%2014%20L6%2025%20C6%2027,%208%2029,%2011%2029%20L19%2029%20C22%2029,%2024%2027,%2024%2025%20L24%2014'/%3e%3cline%20x1='5'%20y1='14'%20x2='25'%20y2='14'/%3e%3cpath%20d='M24%2017%20C28%2017,%2028%2023,%2024%2023'/%3e%3cpath%20d='M11%2010%20C11%208,%2013%208,%2013%206'%20fill='none'/%3e%3cpath%20d='M15%2011%20C15%209,%2017%209,%2017%207'%20fill='none'/%3e%3cpath%20d='M19%2010%20C19%208,%2021%208,%2021%206'%20fill='none'/%3e%3c/svg%3e", Dr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='%238E5AA8'%20stroke='%238E5AA8'%20stroke-width='1.2'%20stroke-linejoin='round'%3e%3cpolygon%20points='19,2.5%208,17.5%2014.5,17.5%2012.5,29.5%2025,13.5%2018,13.5'/%3e%3c/svg%3e", qr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%23A0A0A0'%20stroke-width='1.6'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3ccircle%20cx='12'%20cy='11.3'%20r='4'/%3e%3cpath%20d='M4%2026.7%20C4%2020.3,%207.5%2017.6,%2012%2017.6%20C16.5%2017.6,%2020%2020.3,%2020%2026.7'/%3e%3ccircle%20cx='22.9'%20cy='12.8'%20r='3.2'/%3e%3cpath%20d='M28%2026.7%20C28%2021.9,%2025.9%2019.9,%2022.9%2019.9%20C22%2019.9,%2021.2%2020.1,%2020.5%2020.4'/%3e%3c/svg%3e", Br = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%23A0A0A0'%20stroke-width='1.2'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3crect%20x='4'%20y='8'%20width='6'%20height='20'/%3e%3cline%20x1='5.5'%20y1='11'%20x2='8.5'%20y2='11'/%3e%3cline%20x1='5.5'%20y1='14'%20x2='8.5'%20y2='14'/%3e%3cline%20x1='5.5'%20y1='17'%20x2='8.5'%20y2='17'/%3e%3crect%20x='12'%20y='12'%20width='7'%20height='16'/%3e%3cline%20x1='13.5'%20y1='15'%20x2='17.5'%20y2='15'/%3e%3cline%20x1='13.5'%20y1='18'%20x2='17.5'%20y2='18'/%3e%3cline%20x1='13.5'%20y1='21'%20x2='17.5'%20y2='21'/%3e%3crect%20x='21'%20y='4'%20width='7'%20height='24'/%3e%3cline%20x1='22.5'%20y1='7'%20x2='26.5'%20y2='7'/%3e%3cline%20x1='22.5'%20y1='10'%20x2='26.5'%20y2='10'/%3e%3cline%20x1='22.5'%20y1='13'%20x2='26.5'%20y2='13'/%3e%3cline%20x1='22.5'%20y1='16'%20x2='26.5'%20y2='16'/%3e%3cline%20x1='22.5'%20y1='19'%20x2='26.5'%20y2='19'/%3e%3c/svg%3e", zr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%23A0A0A0'%20stroke-width='1.2'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3cpolyline%20points='4,15%2016,4%2028,15'/%3e%3crect%20x='7'%20y='15'%20width='18'%20height='14'/%3e%3cline%20x1='16'%20y1='19'%20x2='16'%20y2='25'/%3e%3cline%20x1='13'%20y1='22'%20x2='19'%20y2='22'/%3e%3c/svg%3e", Vr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%23E0A526'%20stroke-width='1.2'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3crect%20x='5'%20y='20'%20width='4'%20height='8'/%3e%3crect%20x='11'%20y='16'%20width='4'%20height='12'/%3e%3crect%20x='17'%20y='12'%20width='4'%20height='16'/%3e%3crect%20x='23'%20y='6'%20width='4'%20height='22'/%3e%3c/svg%3e", Ur = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%239B7FD4'%20stroke-width='1.2'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3cpolyline%20points='6,28%206,8%2018,8%2018,28'/%3e%3cpolyline%20points='14,28%2014,14%2026,14%2026,28'/%3e%3crect%20x='8'%20y='11'%20width='3'%20height='3'/%3e%3crect%20x='13'%20y='11'%20width='3'%20height='3'/%3e%3crect%20x='16'%20y='17'%20width='3'%20height='3'/%3e%3crect%20x='21'%20y='17'%20width='3'%20height='3'/%3e%3crect%20x='16'%20y='22'%20width='3'%20height='3'/%3e%3crect%20x='21'%20y='22'%20width='3'%20height='3'/%3e%3cline%20x1='4'%20y1='28'%20x2='28'%20y2='28'/%3e%3c/svg%3e", Yr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%237CB77C'%20stroke-width='1.2'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3ccircle%20cx='16'%20cy='16'%20r='12.5'/%3e%3cline%20x1='16'%20y1='26'%20x2='16'%20y2='14'/%3e%3cline%20x1='16'%20y1='20'%20x2='10'%20y2='14'/%3e%3cline%20x1='16'%20y1='20'%20x2='22'%20y2='14'/%3e%3cline%20x1='16'%20y1='16'%20x2='11'%20y2='10'/%3e%3cline%20x1='16'%20y1='16'%20x2='21'%20y2='10'/%3e%3cline%20x1='16'%20y1='14'%20x2='16'%20y2='8'/%3e%3c/svg%3e", Wr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='%23E0A526'%20stroke='none'%3e%3crect%20x='8.2'%20y='7'%20width='3.2'%20height='18'%20rx='1'/%3e%3crect%20x='14.4'%20y='7'%20width='3.2'%20height='18'%20rx='1'/%3e%3crect%20x='20.6'%20y='7'%20width='3.2'%20height='18'%20rx='1'/%3e%3c/svg%3e", Fr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%2300A651'%20stroke-width='1.2'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3cpolyline%20points='4,10%204,4%2010,4'/%3e%3cpolyline%20points='22,4%2028,4%2028,10'/%3e%3cpolyline%20points='28,22%2028,28%2022,28'/%3e%3cpolyline%20points='10,28%204,28%204,22'/%3e%3cline%20x1='16'%20y1='11'%20x2='16'%20y2='21'/%3e%3cline%20x1='11'%20y1='16'%20x2='21'%20y2='16'/%3e%3c/svg%3e", Xr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%23E07040'%20stroke-width='1.2'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3cpath%20d='M16%203%20L26%208%20L26%2017%20C26%2023,%2021%2027,%2016%2029%20C11%2027,%206%2023,%206%2017%20L6%208%20Z'/%3e%3cline%20x1='16'%20y1='12'%20x2='16'%20y2='22'/%3e%3cline%20x1='11'%20y1='17'%20x2='21'%20y2='17'/%3e%3c/svg%3e", Gr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%238E5AA8'%20stroke-width='1.6'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3ccircle%20cx='12'%20cy='11.3'%20r='4'/%3e%3cpath%20d='M4%2026.7%20C4%2020.3,%207.5%2017.6,%2012%2017.6%20C16.5%2017.6,%2020%2020.3,%2020%2026.7'/%3e%3ccircle%20cx='22.9'%20cy='12.8'%20r='3.2'/%3e%3cpath%20d='M28%2026.7%20C28%2021.9,%2025.9%2019.9,%2022.9%2019.9%20C22%2019.9,%2021.2%2020.1,%2020.5%2020.4'/%3e%3c/svg%3e", Hr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%23E07040'%20stroke-width='1.2'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3ccircle%20cx='16'%20cy='16'%20r='12.5'/%3e%3cline%20x1='16'%20y1='8'%20x2='16'%20y2='22'/%3e%3cpolyline%20points='11,18%2016,24%2021,18'/%3e%3c/svg%3e", Kr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%23E0A526'%20stroke-width='1.2'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3crect%20x='7'%20y='5'%20width='18'%20height='22'%20rx='3.5'/%3e%3crect%20x='10'%20y='8'%20width='12'%20height='7'%20rx='1.5'/%3e%3ccircle%20cx='11.5'%20cy='21'%20r='1.3'%20fill='%23E0A526'%20stroke='none'/%3e%3ccircle%20cx='20.5'%20cy='21'%20r='1.3'%20fill='%23E0A526'%20stroke='none'/%3e%3c/svg%3e", Jr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%237CB77C'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3cpath%20d='M16.0,31.0L16.0,20.0'%20stroke-width='1.3'/%3e%3cpath%20d='M16.0,20.0L12.6,13.7M16.0,20.0L19.4,13.7'%20stroke-width='1.2'/%3e%3cpath%20d='M12.6,13.7L8.8,11.1M12.6,13.7L12.6,9.0M19.4,13.7L19.4,9.0M19.4,13.7L23.2,11.1'%20stroke-width='1.0'/%3e%3cpath%20d='M8.8,11.1L5.8,10.8M8.8,11.1L7.4,8.4M12.6,9.0L11.2,6.4M12.6,9.0L14.1,6.4M19.4,9.0L17.9,6.4M19.4,9.0L20.8,6.4M23.2,11.1L24.6,8.4M23.2,11.1L26.2,10.8'%20stroke-width='0.9'/%3e%3cpath%20d='M5.8,10.8L4.0,11.5M5.8,10.8L4.2,9.7M7.4,8.4L5.7,7.3M7.4,8.4L7.4,6.5M11.2,6.4L9.6,5.3M11.2,6.4L11.2,4.4M14.1,6.4L14.1,4.4M14.1,6.4L15.7,5.3M17.9,6.4L16.3,5.3M17.9,6.4L17.9,4.4M20.8,6.4L20.8,4.4M20.8,6.4L22.4,5.3M24.6,8.4L24.6,6.5M24.6,8.4L26.3,7.3M26.2,10.8L27.8,9.7M26.2,10.8L28.0,11.5'%20stroke-width='0.7'/%3e%3cpath%20d='M4.0,11.5L3.1,12.5M4.0,11.5L2.7,11.4M4.2,9.7L2.9,9.5M4.2,9.7L3.6,8.5M5.7,7.3L4.5,7.2M5.7,7.3L5.1,6.2M7.4,6.5L6.8,5.3M7.4,6.5L8.0,5.3M9.6,5.3L8.3,5.1M9.6,5.3L9.0,4.1M11.2,4.4L10.6,3.3M11.2,4.4L11.8,3.3M14.1,4.4L13.5,3.3M14.1,4.4L14.7,3.3M15.7,5.3L16.3,4.1M15.7,5.3L17.0,5.1M16.3,5.3L15.0,5.1M16.3,5.3L15.7,4.1M17.9,4.4L17.3,3.3M17.9,4.4L18.5,3.3M20.8,4.4L20.2,3.3M20.8,4.4L21.4,3.3M22.4,5.3L23.0,4.1M22.4,5.3L23.7,5.1M24.6,6.5L24.0,5.3M24.6,6.5L25.2,5.3M26.3,7.3L26.9,6.2M26.3,7.3L27.5,7.2M27.8,9.7L28.4,8.5M27.8,9.7L29.1,9.5M28.0,11.5L29.3,11.4M28.0,11.5L28.9,12.5'%20stroke-width='0.6'/%3e%3cpath%20d='M3.1,12.5L3.0,13.3M3.1,12.5L2.4,12.8M2.7,11.4L1.9,11.7M2.7,11.4L2.0,10.9M2.9,9.5L2.1,9.9M2.9,9.5L2.2,9.1M3.6,8.5L2.9,8.1M3.6,8.5L3.6,7.7M4.5,7.2L3.7,7.5M4.5,7.2L3.8,6.7M5.1,6.2L4.5,5.7M5.1,6.2L5.1,5.4M6.8,5.3L6.1,4.9M6.8,5.3L6.8,4.5M8.0,5.3L8.0,4.5M8.0,5.3L8.7,4.9M8.3,5.1L7.6,5.5M8.3,5.1L7.6,4.7M9.0,4.1L8.3,3.7M9.0,4.1L9.0,3.3M10.6,3.3L9.9,2.8M10.6,3.3L10.6,2.5M11.8,3.3L11.8,2.5M11.8,3.3L12.5,2.8M13.5,3.3L12.8,2.8M13.5,3.3L13.5,2.5M14.7,3.3L14.7,2.5M14.7,3.3L15.3,2.8M16.3,4.1L16.3,3.3M16.3,4.1L17.0,3.7M17.0,5.1L17.6,4.7M17.0,5.1L17.7,5.5M15.0,5.1L14.3,5.5M15.0,5.1L14.4,4.7M15.7,4.1L15.0,3.7M15.7,4.1L15.7,3.3M17.3,3.3L16.7,2.8M17.3,3.3L17.3,2.5M18.5,3.3L18.5,2.5M18.5,3.3L19.2,2.8M20.2,3.3L19.5,2.8M20.2,3.3L20.2,2.5M21.4,3.3L21.4,2.5M21.4,3.3L22.1,2.8M23.0,4.1L23.0,3.3M23.0,4.1L23.7,3.7M23.7,5.1L24.4,4.7M23.7,5.1L24.4,5.5M24.0,5.3L23.3,4.9M24.0,5.3L24.0,4.5M25.2,5.3L25.2,4.5M25.2,5.3L25.9,4.9M26.9,6.2L26.9,5.4M26.9,6.2L27.5,5.7M27.5,7.2L28.2,6.7M27.5,7.2L28.3,7.5M28.4,8.5L28.4,7.7M28.4,8.5L29.1,8.1M29.1,9.5L29.8,9.1M29.1,9.5L29.9,9.9M29.3,11.4L30.0,10.9M29.3,11.4L30.1,11.7M28.9,12.5L29.6,12.8M28.9,12.5L29.0,13.3'%20stroke-width='0.4'/%3e%3c/svg%3e", Qr = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%2300A651'%20stroke-width='1.2'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3crect%20x='5'%20y='8'%20width='22'%20height='18'%20rx='1'/%3e%3cpolyline%20points='5,8%2016,18%2027,8'/%3e%3cpolyline%20points='11,16%2015,20%2022,12'%20stroke-width='2'/%3e%3c/svg%3e", es = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%23E0A526'%20stroke-width='1.0'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3cg%20transform='rotate(-12%2011%2022)'%3e%3cellipse%20cx='11'%20cy='22'%20rx='3.5'%20ry='5.5'/%3e%3ccircle%20cx='12.8'%20cy='29'%20r='1.6'/%3e%3c/g%3e%3cg%20transform='rotate(12%2021%2010)'%3e%3cellipse%20cx='21'%20cy='10'%20rx='3.5'%20ry='5.5'/%3e%3ccircle%20cx='19.2'%20cy='17'%20r='1.6'/%3e%3c/g%3e%3c/svg%3e", ts = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%20fill='none'%20stroke='%23E0A526'%20stroke-width='1.2'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3cpath%20d='M3%2010%20C6%206,%2010%206,%2013%2010%20C16%2014,%2020%2014,%2023%2010%20C26%206,%2029%206,%2029%2010'/%3e%3cpath%20d='M3%2017%20C6%2013,%2010%2013,%2013%2017%20C16%2021,%2020%2021,%2023%2017%20C26%2013,%2029%2013,%2029%2017'/%3e%3cpath%20d='M3%2024%20C6%2020,%2010%2020,%2013%2024%20C16%2028,%2020%2028,%2023%2024%20C26%2020,%2029%2020,%2029%2024'/%3e%3c/svg%3e", ns = "riverside-85-120", rs = "Riverside Park, W 85th to W 120th St", ss = "Riverside Park", is = "Place benches, fountains and reports in Riverside Park from W 85th to W 120th St, and vote on what others place.", as = "The second area of the prototype: Riverside Park between W 85th St and W 120th St, from Riverside Drive to the Hudson, for the points Harrison raised. The origin is the middle of the park; the cuts are the two streets' own lines (OpenStreetMap ways named West 85th Street and West 120th Street, read 2026-11-12) extended west across the park.", os = {
  lat: 40.8008,
  lon: -73.9736
}, ls = {
  id: "M071",
  marginM: 150,
  cuts: {
    south: {
      name: "W 85th St",
      from: [
        -73.9755093,
        40.7870011
      ],
      to: [
        -73.9808538,
        40.7892552
      ]
    },
    north: {
      name: "W 120th St",
      from: [
        -73.9621587,
        40.8105801
      ],
      to: [
        -73.9639549,
        40.8113373
      ]
    }
  }
}, cs = {
  south: 40.7875,
  north: 40.8141,
  west: -73.9852,
  east: -73.9619
}, ds = {
  start: {
    x: 293,
    y: 472,
    headingDeg: 209,
    distance: 650
  },
  pilot: {
    x: 293,
    y: 472,
    headingDeg: 209,
    distance: 650
  },
  whole: {
    x: 0,
    y: 0,
    headingDeg: 209,
    distance: 2300
  }
}, us = [
  "ponding-after-rain",
  "tree-wanted",
  "tree-not-doing-well",
  "bathroom-wanted",
  "bathroom-problem",
  "drinking-fountain",
  "add-bench",
  "add-bike-parking",
  "litter-and-recycling-bins",
  "add-planter-boxes",
  "wayfinding-sign"
], hs = !0, ps = !0, fs = [
  {
    id: "ponding-after-rain",
    label: "Ponding after rain",
    description: "Water that stands here after a storm; add a photo to help build the case",
    kind: "point",
    widthM: 2,
    shape: "circle",
    pin: !0,
    photo: !0
  },
  {
    id: "tree-wanted",
    label: "Tree wanted here",
    description: "A place you would like a tree",
    kind: "point",
    widthM: 2,
    shape: "circle",
    pin: !0
  },
  {
    id: "tree-not-doing-well",
    label: "This tree is not doing well",
    description: "A tree that looks sick, dry or damaged",
    kind: "point",
    widthM: 2,
    shape: "circle",
    pin: !0,
    snapToTree: !0
  },
  {
    id: "bathroom-wanted",
    label: "Bathroom wanted near here",
    description: "Somewhere you would like a bathroom",
    kind: "point",
    widthM: 2,
    shape: "circle",
    pin: !0
  },
  {
    id: "bathroom-problem",
    label: "Bathroom problem here",
    description: "A bathroom that is closed, dirty or broken",
    kind: "point",
    widthM: 2,
    shape: "circle",
    pin: !0
  }
], ms = [
  {
    id: "reports",
    label: "Reports",
    hue: 330,
    keywords: [],
    types: {
      "ponding-after-rain": [],
      "bathroom-problem": [],
      "bathroom-wanted": [],
      "tree-not-doing-well": [],
      "tree-wanted": []
    }
  }
], gs = {
  tree: "Old trees' root zones and storm drains limit where trees can go. The landscape architect decides, not the conservancy."
}, ys = {
  key: ns,
  name: rs,
  shortName: ss,
  description: is,
  about: as,
  origin: os,
  park: ls,
  scanBox: cs,
  views: ds,
  placeable: us,
  fixedSizes: hs,
  askName: ps,
  types: fs,
  families: ms,
  help: gs
};
function vs(t, e) {
  return e.__exit12nBoots?.find((n) => n.root + n.info.entry === t) ?? e.__exit12nBoot;
}
const pe = vs(import.meta.url, globalThis);
pe?.info.build;
const bs = pe?.root ?? "/", Ge = pe?.info?.dataRoot;
typeof Ge == "string" && pe?.config.pointer && Ge.startsWith(pe.config.pointer.root) && /^data-[0-9a-f]{32}\/$/.test(Ge.slice(pe.config.pointer.root.length));
pe?.pointer?.seq;
const ks = {}, ws = "".trim(), _s = p.object({ x: p.number(), y: p.number(), headingDeg: p.number(), distance: p.number().positive() }), xs = p.object({
  id: p.string().regex(/^[a-z0-9-]+$/),
  label: p.string(),
  description: p.string(),
  kind: p.literal("point"),
  widthM: p.number().positive(),
  shape: p.enum(["circle", "square"]),
  /** Drawn as a pin (a post with a coloured head) rather than a model. */
  pin: p.boolean().optional(),
  /** Takes one photo (the card's Add a photo; 40-vote-on-proposals/42-keep-the-photos.py). */
  photo: p.boolean().optional(),
  /** Placed on the nearest tree within a few metres, when there is one. */
  snapToTree: p.boolean().optional()
}), Ms = p.object({ id: p.string(), label: p.string(), hue: p.number(), keywords: p.array(p.string()).optional(), types: p.record(p.string(), p.array(p.string())) }), ot = ["panel", "suggestInstead", "accounts", "multiSelect", "jointVotes", "phases", "topMap", "undoFlight", "conditionalMarker", "oneBar"], As = p.object(Object.fromEntries(ot.map((t) => [t, p.boolean().optional()]))).strict(), Ts = p.object({ phaseVotes: p.enum(["upto", "exact"]).optional(), ghosts: p.enum(["after", "always"]).optional(), phases: p.enum(["stack", "pool"]).optional() }).strict(), Ls = p.object({
  key: p.string(),
  name: p.string(),
  /** What the toolbar's logo says (the name, when absent). */
  shortName: p.string().optional(),
  views: p.record(p.string(), _s).refine((t) => "start" in t, "an area's views name a `start`"),
  /** The ids of the proposal types the Add menu offers (40-vote-on-proposals/10-define-proposal-types.ts); absent, all of them. */
  placeable: p.array(p.string()).optional(),
  /** Types of its own, and the families they group under in the hotspots. */
  types: p.array(xs).optional(),
  families: p.array(Ms).optional(),
  /** Whether the things that are one real object (a bench, a fountain, a bin, a sign: the FIXED_SIZE_TYPES of
   *  40-vote-on-proposals/10-define-proposal-types.ts) are placed at the type's own size here, never resized, and read back at
   *  it. Absent, every point is sized by hand and a stored size is never changed: Exit 12N. */
  fixedSizes: p.boolean().optional(),
  /** Whether a first visit is asked what to call it (80-ask-your-name.ts). Absent, nobody is asked: Exit 12N. */
  askName: p.boolean().optional(),
  /** One-line help the page shows where it matters. */
  help: p.record(p.string(), p.string()).optional(),
  /** The panel+phases round's features this area turns on; absent, every one is off (Riverside). Exit 12N has them all. */
  features: As.optional(),
  /** This area's defaults for the top map's switches (absent: Eric's answers). */
  topMap: Ts.optional()
}).passthrough(), Is = /* @__PURE__ */ Object.assign({ "../10-fetch-the-ground/areas/riverside-85-120.json": ys });
function Ss(t, e = Is) {
  if (!t) return null;
  const n = Object.entries(e).find(([s]) => s.endsWith(`/areas/${t}.json`))?.[1];
  if (n === void 0) throw new Error(`VITE_AREA=${t}: no 10-fetch-the-ground/areas/${t}.json`);
  const r = Ls.safeParse(n);
  if (!r.success) throw new Error(`areas/${t}.json does not fit: ${r.error.issues.slice(0, 3).map((s) => `${s.path.join(".") || "(root)"}: ${s.message}`).join("; ")}`);
  return r.data;
}
const ge = Ss(ws), Es = { ...Object.fromEntries(ot.map((t) => [t, !0])), conditionalMarker: !1 };
function Cs(t) {
  const e = t ? Object.fromEntries(ot.map((n) => [n, t.features?.[n] === !0])) : { ...Es };
  return e.multiSelect || (e.jointVotes = !1), e.jointVotes || (e.conditionalMarker = !1), e;
}
function Os(t) {
  return t === "final" ? "final" : "map";
}
const js = Os(ks?.VITE_VIEW);
({ ...Object.fromEntries(ot.map((t) => [t, !1])) });
js === "final" || Cs(ge);
const Ns = {
  vote_types: [
    {
      id: "v01",
      label: "Fix dangerous intersection",
      kind: "point",
      description: "An intersection where crossing, turning or speeding makes it dangerous; make it safer"
    },
    {
      id: "v02",
      label: "Add pedestrian signal",
      kind: "point",
      description: "A walk signal for people crossing where there is none"
    },
    {
      id: "v03",
      label: "Fix signal timing",
      kind: "point",
      description: "Change how a traffic light's phases are timed"
    },
    {
      id: "v04",
      label: "Daylight this corner",
      kind: "point",
      description: "Remove parking at a corner so drivers and walkers can see each other"
    },
    {
      id: "v05",
      label: "Add curb extension",
      kind: "point",
      description: "Extend the sidewalk into the parking lane at a corner to shorten the crossing"
    },
    {
      id: "v06",
      label: "Add raised crosswalk",
      kind: "point",
      description: "A crosswalk raised to sidewalk height so cars slow down"
    },
    {
      id: "v07",
      label: "Add pedestrian refuge island",
      kind: "point",
      description: "A median island where people crossing a wide street can wait"
    },
    {
      id: "v08",
      label: "Ban turn on red",
      kind: "point",
      description: "Stop drivers turning on a red light"
    },
    {
      id: "v09",
      label: "Add intersection lighting",
      kind: "point",
      description: "Street or pedestrian lighting where it is too dark"
    },
    {
      id: "v10",
      label: "Add protected bike lane",
      kind: "route",
      description: "A bike lane separated from cars by a physical barrier"
    },
    {
      id: "v11",
      label: "Add traffic calming",
      kind: "route",
      description: "Slow drivers down on a street: speed bumps, narrower lanes, other physical measures"
    },
    {
      id: "v12",
      label: "Add crosswalk",
      kind: "route",
      description: "A marked crosswalk where people cross"
    },
    {
      id: "v13",
      label: "Widen sidewalk",
      kind: "route",
      description: "More sidewalk width along a street"
    },
    {
      id: "v14",
      label: "Lower speed limit",
      kind: "route",
      description: "A lower posted speed limit on a street"
    },
    {
      id: "v15",
      label: "Add tree",
      kind: "point",
      description: "Plant a street tree"
    },
    {
      id: "v16",
      label: "Add bus lane",
      kind: "route",
      description: "A lane for buses only"
    },
    {
      id: "v17",
      label: "Add pedestrian plaza",
      kind: "point",
      description: "Turn street space into a car-free plaza"
    },
    {
      id: "v18",
      label: "Street redesign",
      kind: "point",
      description: "A broad redesign of a street or corridor"
    },
    {
      id: "v19",
      label: "Add bike lane",
      kind: "route",
      description: "A painted bike lane"
    },
    {
      id: "v20",
      label: "Add bike parking",
      kind: "point",
      description: "Bike racks or bike parking"
    },
    {
      id: "v21",
      label: "Add Citibike station",
      kind: "point",
      description: "A bike-share dock"
    },
    {
      id: "v22",
      label: "Improve sidewalk",
      kind: "route",
      description: "Make a sidewalk better to walk on along a street"
    },
    {
      id: "v23",
      label: "Add pedestrian bridge",
      kind: "point",
      description: "A bridge for people walking over a road, rail or water"
    },
    {
      id: "v24",
      label: "Improve accessibility",
      kind: "route",
      description: "Make a street usable by wheelchair users and people with disabilities"
    },
    {
      id: "v25",
      label: "Fix curb cut",
      kind: "point",
      description: "Repair a broken or missing curb ramp"
    },
    {
      id: "v26",
      label: "Add bench",
      kind: "point",
      description: "A public bench to sit on"
    },
    {
      id: "v27",
      label: "Add bus shelter",
      kind: "point",
      description: "A shelter at a bus stop"
    },
    {
      id: "v28",
      label: "Add tree-lined street",
      kind: "route",
      description: "Plant trees along a whole street"
    },
    {
      id: "v29",
      label: "Add planter boxes",
      kind: "point",
      description: "Planters on the sidewalk or street"
    },
    {
      id: "v30",
      label: "Add curb cut",
      kind: "point",
      description: "A new curb ramp at a crossing"
    },
    {
      id: "v31",
      label: "Add tactile paving",
      kind: "point",
      description: "Textured paving at a crossing for blind people"
    },
    {
      id: "v32",
      label: "Add audible pedestrian signal",
      kind: "point",
      description: "A walk signal that makes sound for blind people"
    },
    {
      id: "v33",
      label: "Extend crossing time",
      kind: "point",
      description: "More time to cross on the walk signal"
    },
    {
      id: "v34",
      label: "Add subway elevator",
      kind: "point",
      description: "An elevator at a subway station"
    },
    {
      id: "v35",
      label: "Fix broken elevator",
      kind: "point",
      description: "Repair an out-of-service elevator"
    },
    {
      id: "v36",
      label: "Add accessible parking space",
      kind: "point",
      description: "A parking space for people with disabilities"
    },
    {
      id: "v37",
      label: "Clear sidewalk obstruction",
      kind: "point",
      description: "Remove something blocking the sidewalk"
    },
    {
      id: "v38",
      label: "Fix broken sidewalk",
      kind: "route",
      description: "Repair cracked or broken sidewalk"
    }
  ]
}, Rs = {
  root: Ns
}, Zs = [
  {
    id: "x01",
    label: "Food truck",
    kind: "point",
    description: "A food truck or a food cart parked here."
  },
  {
    id: "x02",
    label: "Add seating",
    kind: "point",
    description: "Movable tables and chairs."
  },
  {
    id: "x03",
    label: "Ping-pong table",
    kind: "point",
    description: "An outdoor table-tennis table."
  },
  {
    id: "x04",
    label: "Skate park",
    kind: "point",
    description: "A skate park or skate spot."
  },
  {
    id: "x05",
    label: "Add a path",
    kind: "route",
    description: "A footpath for people walking."
  },
  {
    id: "x06",
    label: "Create your own",
    kind: "point",
    description: "Anything else: give it a name."
  },
  {
    id: "x07",
    label: "Public art",
    kind: "point",
    description: "A mural, a sculpture or an art installation."
  },
  {
    id: "x08",
    label: "Rain garden",
    kind: "point",
    description: "A planted hollow that soaks up rain from the street, with wild plants for birds and bees."
  },
  {
    id: "x09",
    label: "Playground",
    kind: "point",
    description: "Swings, slides and climbing things for children."
  },
  {
    id: "x10",
    label: "Market stalls",
    kind: "point",
    description: "A weekly market, a farmers' market or a row of stalls."
  },
  {
    id: "x11",
    label: "Tennis court",
    kind: "point",
    description: "A tennis court."
  },
  {
    id: "x12",
    label: "Basketball court",
    kind: "point",
    description: "A basketball court."
  },
  {
    id: "x13",
    label: "Pickleball court",
    kind: "point",
    description: "A pickleball court with its net: 20 × 44 ft lines on a 30 × 60 ft surface."
  },
  {
    id: "x14",
    label: "Sand volleyball court",
    kind: "point",
    description: "A sand volleyball court: an 8 × 16 m court in a 12 × 20 m sand pit, with its net."
  },
  {
    id: "x15",
    label: "Handball court",
    kind: "point",
    description: "A one-wall handball court: a 20 ft wall and a 34 ft floor."
  },
  {
    id: "x16",
    label: "Bocce court",
    kind: "point",
    description: "A bocce court: a long gravel lane in a timber frame."
  },
  {
    id: "x17",
    label: "Ring trek",
    kind: "point",
    description: "Overhead rings to swing along hand over hand (monkey rings, monkey bars)."
  },
  {
    id: "x18",
    label: "Fitness station",
    kind: "point",
    description: "Outdoor fitness equipment: pull-up and parallel bars, a sit-up bench."
  },
  {
    id: "x19",
    label: "Swings",
    kind: "point",
    description: "A swing set."
  },
  {
    id: "x20",
    label: "Climbing boulder",
    kind: "point",
    description: "A climbing boulder on a soft surface."
  },
  {
    id: "x21",
    label: "Chess tables",
    kind: "point",
    description: "Game tables with stools, for chess, checkers and dominoes."
  },
  {
    id: "x22",
    label: "Spray shower",
    kind: "point",
    description: "A spray shower or splash pad for hot days."
  },
  {
    id: "x23",
    label: "Mini pitch",
    kind: "point",
    description: "A small-sided turf pitch for soccer and other field games."
  },
  {
    id: "x24",
    label: "Jogging loop",
    kind: "route",
    description: "A running path or track."
  },
  {
    id: "x25",
    label: "Picnic area",
    kind: "point",
    description: "Picnic tables with a bin."
  },
  {
    id: "x26",
    label: "Pergola",
    kind: "point",
    description: "A pergola: posts and slatted beams for shade, with a bench under it."
  },
  {
    id: "x27",
    label: "Shade sail",
    kind: "point",
    description: "A shade sail on three posts."
  },
  {
    id: "x28",
    label: "Scenic overlook",
    kind: "point",
    description: "A deck with a railing to look out from, over the park and the river."
  },
  {
    id: "x29",
    label: "Performance stage",
    kind: "point",
    description: "A stage or bandshell for music and performances."
  },
  {
    id: "x30",
    label: "Amphitheater",
    kind: "point",
    description: "Steps in a half ring to sit on, facing a stage or the view."
  },
  {
    id: "x31",
    label: "Community garden",
    kind: "point",
    description: "A community garden of raised beds behind a low fence."
  },
  {
    id: "x32",
    label: "Lawn",
    kind: "point",
    description: "An open lawn."
  },
  {
    id: "x33",
    label: "Pollinator meadow",
    kind: "point",
    description: "A meadow of wildflowers and grasses for bees, butterflies and birds."
  },
  {
    id: "x34",
    label: "Kayak launch",
    kind: "point",
    description: "A floating dock and ramp for kayaks and canoes."
  },
  {
    id: "x35",
    label: "Barbecue area",
    kind: "point",
    description: "Pedestal grills and a picnic table, as in NYC Parks' barbecuing areas."
  },
  {
    id: "x36",
    label: "Cafe kiosk",
    kind: "point",
    description: "A small cafe kiosk with a hatch and an awning."
  },
  {
    id: "x37",
    label: "Bike repair stand",
    kind: "point",
    description: "A fix-it stand with tools and a pump."
  },
  {
    id: "x38",
    label: "Wayfinding sign",
    kind: "point",
    description: "A park sign with a map and directions."
  },
  {
    id: "x39",
    label: "Add stairs",
    kind: "route",
    description: "Steps down a slope."
  },
  {
    id: "x40",
    label: "Boardwalk",
    kind: "route",
    description: "A timber boardwalk."
  },
  {
    id: "x41",
    label: "Comfort station",
    kind: "point",
    description: "A public restroom (NYC Parks' comfort station)."
  },
  {
    id: "x42",
    label: "Drinking fountain",
    kind: "point",
    description: "A drinking fountain with a bottle filler."
  },
  {
    id: "x43",
    label: "Litter and recycling bins",
    kind: "point",
    description: "A pair of litter and recycling baskets."
  },
  {
    id: "x44",
    label: "Dog run",
    kind: "point",
    description: "A fenced dog run."
  },
  {
    id: "x45",
    label: "Granite blocks",
    kind: "point",
    description: "Granite blocks and bollards closing a street to cars, as in NYC's plazas."
  },
  {
    id: "x46",
    label: "Clay Tennis Court",
    kind: "point",
    description: "A tennis court with a red clay surface."
  },
  {
    id: "c01",
    label: "Remove tree",
    kind: "point",
    description: "Take out a tree that is here today.",
    block: "move-remove"
  },
  {
    id: "c02",
    label: "Move tree",
    kind: "point",
    description: "Move a tree that is here today to a new spot.",
    block: "move-remove"
  },
  {
    id: "c03",
    label: "Remove court",
    kind: "point",
    description: "Take out a court that is here today.",
    block: "move-remove"
  },
  {
    id: "c04",
    label: "Move court",
    kind: "point",
    description: "Move a court that is here today to a new spot.",
    block: "move-remove"
  },
  {
    id: "c05",
    label: "Remove playground",
    kind: "point",
    description: "Take out a playground that is here today.",
    block: "move-remove"
  },
  {
    id: "c06",
    label: "Move playground",
    kind: "point",
    description: "Move a playground that is here today to a new spot.",
    block: "move-remove"
  },
  {
    id: "c07",
    label: "Remove plaza",
    kind: "point",
    description: "Take out a plaza that is here today.",
    block: "move-remove"
  },
  {
    id: "c08",
    label: "Move plaza",
    kind: "point",
    description: "Move a plaza that is here today to a new spot.",
    block: "move-remove"
  },
  {
    id: "c09",
    label: "Remove path",
    kind: "point",
    description: "Take out a walk path that is here today.",
    block: "move-remove"
  },
  {
    id: "c10",
    label: "Move path",
    kind: "point",
    description: "Move a walk path that is here today to a new spot.",
    block: "move-remove"
  },
  {
    id: "c11",
    label: "Remove road",
    kind: "point",
    description: 'Close a road that is here today to cars (its removal is labelled "Close the road to cars": + keeps it open, − closes it).',
    block: "move-remove"
  },
  {
    id: "c12",
    label: "Remove building",
    kind: "point",
    description: "Take out a park building that is here today (a park area's; a building is removed, never moved).",
    block: "move-remove"
  }
], Ps = [
  {
    id: "food",
    label: "Food and markets",
    hue: 29,
    keywords: [
      "food",
      "eat",
      "eating",
      "cafe",
      "coffee",
      "restaurant",
      "kiosk",
      "vendor",
      "cart",
      "market",
      "stall",
      "stand",
      "snack",
      "drink",
      "ice cream",
      "bakery"
    ],
    types: {
      "food-truck": [
        "food truck",
        "food cart",
        "taco truck",
        "ice cream truck",
        "street food"
      ],
      "market-stalls": [
        "market",
        "farmers market",
        "greenmarket",
        "flea market",
        "stall",
        "vendor",
        "pop-up shop"
      ],
      "barbecue-area": [
        "barbecue",
        "barbeque",
        "bbq",
        "grill",
        "grills",
        "barbecue area",
        "cookout",
        "grilling"
      ],
      "cafe-kiosk": [
        "cafe",
        "kiosk",
        "coffee kiosk",
        "coffee stand",
        "snack bar",
        "concession",
        "concession stand"
      ]
    }
  },
  {
    id: "walking",
    label: "Walking",
    hue: 59,
    keywords: [
      "walk",
      "walking",
      "pedestrian",
      "foot",
      "sidewalk",
      "path",
      "crossing",
      "crosswalk",
      "promenade",
      "stairs",
      "wayfinding",
      "sign",
      "map"
    ],
    types: {
      "add-a-path": [
        "path",
        "footpath",
        "trail",
        "walkway",
        "promenade"
      ],
      "add-stairs": [
        "stairs",
        "steps",
        "staircase",
        "stairway",
        "stair"
      ],
      boardwalk: [
        "boardwalk",
        "timber walkway",
        "wooden path",
        "decking"
      ],
      "wayfinding-sign": [
        "wayfinding",
        "sign",
        "signs",
        "signage",
        "map sign",
        "signpost",
        "directions"
      ],
      "add-crosswalk": [
        "crosswalk",
        "zebra",
        "crossing"
      ],
      "add-raised-crosswalk": [
        "raised crossing",
        "speed table crossing"
      ],
      "add-curb-extension": [
        "bulb out",
        "neckdown",
        "curb extension"
      ],
      "add-pedestrian-refuge-island": [
        "refuge",
        "median island",
        "pedestrian island"
      ],
      "widen-sidewalk": [
        "wider sidewalk",
        "more sidewalk"
      ],
      "improve-sidewalk": [
        "better sidewalk",
        "repave sidewalk"
      ],
      "fix-broken-sidewalk": [
        "cracked sidewalk",
        "broken pavement",
        "trip hazard"
      ],
      "add-pedestrian-bridge": [
        "footbridge",
        "pedestrian bridge",
        "overpass",
        "skybridge"
      ]
    }
  },
  {
    id: "greening",
    label: "Greening",
    hue: 89,
    keywords: [
      "tree",
      "trees",
      "green",
      "plant",
      "plants",
      "planting",
      "planter",
      "flower",
      "flowers",
      "garden",
      "lawn",
      "grass",
      "hedge",
      "shrub",
      "leafy",
      "orchard"
    ],
    types: {
      "add-tree": [
        "tree",
        "shade tree",
        "street tree",
        "trees",
        "orchard",
        "fruit tree"
      ],
      "add-planter-boxes": [
        "planter",
        "planters",
        "flower box",
        "flower bed",
        "garden",
        "hedge",
        "shrubs",
        "reading garden"
      ],
      "add-tree-lined-street": [
        "tree lined",
        "allee",
        "row of trees",
        "boulevard trees"
      ],
      "community-garden": [
        "community garden",
        "raised beds",
        "raised bed",
        "garden plots",
        "allotment",
        "vegetable garden",
        "greenthumb",
        "urban farm"
      ],
      lawn: [
        "lawn",
        "open lawn",
        "grass",
        "great lawn",
        "green space",
        "turf"
      ]
    }
  },
  {
    id: "cycling",
    label: "Cycling",
    hue: 149,
    keywords: [
      "bike",
      "bikes",
      "bicycle",
      "cycling",
      "cyclist",
      "cycle",
      "citibike",
      "scooter",
      "e-bike",
      "ebike"
    ],
    types: {
      "add-protected-bike-lane": [
        "protected bike lane",
        "separated bike lane",
        "cycle track",
        "two way bike lane"
      ],
      "add-bike-lane": [
        "bike lane",
        "bike route",
        "cycle lane",
        "greenway"
      ],
      "add-bike-parking": [
        "bike rack",
        "bike racks",
        "bike parking",
        "bike corral",
        "bike locker",
        "scooter parking"
      ],
      "add-citibike-station": [
        "citibike",
        "bike share",
        "bikeshare",
        "bike dock"
      ],
      "bike-repair-stand": [
        "bike repair",
        "repair stand",
        "fix it station",
        "fixit station",
        "bike pump",
        "air pump",
        "repair station"
      ]
    }
  },
  {
    id: "nature",
    label: "Nature and water",
    hue: 179,
    keywords: [
      "nature",
      "wild",
      "wildlife",
      "habitat",
      "meadow",
      "pollinator",
      "bird",
      "birds",
      "bees",
      "butterfly",
      "wetland",
      "marsh",
      "pond",
      "river",
      "water",
      "hudson",
      "waterfront",
      "shore",
      "kayak",
      "boat",
      "fishing",
      "swale",
      "stormwater",
      "rain",
      "flood"
    ],
    types: {
      "rain-garden": [
        "rain garden",
        "bioswale",
        "swale",
        "wetland",
        "pond",
        "stormwater garden"
      ],
      "pollinator-meadow": [
        "pollinator meadow",
        "meadow",
        "wildflowers",
        "wildflower",
        "pollinator garden",
        "bird garden",
        "butterfly garden",
        "native plants",
        "habitat",
        "prairie"
      ],
      "kayak-launch": [
        "kayak launch",
        "kayak",
        "kayaks",
        "canoe",
        "canoes",
        "boat launch",
        "kayaking",
        "boathouse",
        "water access",
        "fishing pier",
        "dock"
      ]
    }
  },
  {
    id: "access",
    label: "Access and safety",
    hue: 209,
    keywords: [
      "access",
      "accessible",
      "accessibility",
      "wheelchair",
      "ramp",
      "elevator",
      "lift",
      "railing",
      "handrail",
      "blind",
      "deaf",
      "tactile",
      "light",
      "lights",
      "lighting",
      "lamp",
      "dark",
      "night",
      "safe",
      "safety",
      "camera",
      "emergency"
    ],
    types: {
      "improve-accessibility": [
        "accessible route",
        "wheelchair access",
        "ramp",
        "accessible ramp",
        "handrail",
        "railing"
      ],
      "add-curb-cut": [
        "curb ramp",
        "curb cut",
        "pram ramp"
      ],
      "fix-curb-cut": [
        "broken curb ramp",
        "fix ramp"
      ],
      "add-tactile-paving": [
        "tactile",
        "warning strip",
        "detectable warning"
      ],
      "add-subway-elevator": [
        "elevator",
        "lift",
        "subway elevator"
      ],
      "fix-broken-elevator": [
        "broken elevator",
        "elevator out"
      ],
      "add-accessible-parking-space": [
        "disabled parking",
        "accessible parking",
        "handicap parking"
      ],
      "clear-sidewalk-obstruction": [
        "obstruction",
        "blocked sidewalk",
        "scaffolding",
        "clutter"
      ],
      "add-intersection-lighting": [
        "street light",
        "streetlight",
        "lighting",
        "lamp post",
        "lights",
        "light at night",
        "dark corner"
      ],
      "add-audible-pedestrian-signal": [
        "audible signal",
        "accessible pedestrian signal",
        "talking signal",
        "aps"
      ]
    }
  },
  {
    id: "art",
    label: "Art and culture",
    hue: 239,
    keywords: [
      "art",
      "arts",
      "artist",
      "mural",
      "murals",
      "sculpture",
      "statue",
      "installation",
      "gallery",
      "music",
      "concert",
      "stage",
      "performance",
      "theater",
      "theatre",
      "dance",
      "film",
      "movie",
      "screening",
      "memorial",
      "monument",
      "history",
      "plaque",
      "culture",
      "festival",
      "poetry"
    ],
    types: {
      "public-art": [
        "mural",
        "sculpture",
        "statue",
        "art installation",
        "outdoor movies",
        "memorial",
        "monument",
        "history plaque",
        "light art"
      ],
      "performance-stage": [
        "stage",
        "bandshell",
        "band shell",
        "performance space",
        "concert stage",
        "bandstand",
        "outdoor theater"
      ],
      amphitheater: [
        "amphitheater",
        "amphitheatre",
        "steps to sit on",
        "seating steps",
        "bleachers",
        "tiered seating"
      ]
    }
  },
  {
    id: "sitting",
    label: "Sitting and gathering",
    hue: 269,
    keywords: [
      "sit",
      "sitting",
      "seat",
      "seats",
      "seating",
      "bench",
      "benches",
      "chair",
      "chairs",
      "table",
      "tables",
      "picnic",
      "shade",
      "canopy",
      "umbrella",
      "pergola",
      "gather",
      "gathering",
      "hangout",
      "lounge",
      "plaza",
      "square",
      "meet",
      "rest"
    ],
    types: {
      "add-bench": [
        "bench",
        "benches",
        "park bench"
      ],
      "add-seating": [
        "seating",
        "chairs",
        "tables",
        "cafe tables",
        "lounge chairs",
        "movable chairs",
        "umbrellas",
        "hammock"
      ],
      "add-pedestrian-plaza": [
        "plaza",
        "public square",
        "piazza",
        "gathering space",
        "open street"
      ],
      "picnic-area": [
        "picnic area",
        "picnic tables",
        "picnic table",
        "picnic"
      ],
      pergola: [
        "pergola",
        "arbor",
        "trellis",
        "gazebo"
      ],
      "shade-sail": [
        "shade sail",
        "shade structure",
        "canopy",
        "shade",
        "sun shade"
      ],
      "scenic-overlook": [
        "overlook",
        "lookout",
        "viewing platform",
        "belvedere",
        "viewpoint",
        "view of the river",
        "observation deck"
      ]
    }
  },
  {
    id: "play",
    label: "Play and sport",
    hue: 299,
    keywords: [
      "play",
      "playground",
      "kids",
      "children",
      "sport",
      "sports",
      "game",
      "games",
      "court",
      "courts",
      "basketball",
      "tennis",
      "pickleball",
      "handball",
      "volleyball",
      "bocce",
      "soccer",
      "football",
      "field",
      "pitch",
      "skate",
      "skating",
      "skateboard",
      "bmx",
      "fitness",
      "gym",
      "exercise",
      "workout",
      "run",
      "running",
      "track",
      "climbing",
      "chess",
      "ping pong",
      "table tennis",
      "rings",
      "monkey",
      "swing",
      "swings"
    ],
    types: {
      "skate-park": [
        "skate park",
        "skatepark",
        "skate spot",
        "bmx",
        "pump track",
        "roller rink"
      ],
      "ping-pong-table": [
        "ping pong",
        "table tennis"
      ],
      playground: [
        "playground",
        "play area",
        "swings",
        "slide",
        "jungle gym",
        "play structure"
      ],
      "tennis-court": [
        "tennis court",
        "tennis"
      ],
      "clay-tennis-court": [
        "clay court",
        "clay courts",
        "clay tennis",
        "clay tennis courts",
        "red clay court",
        "red clay"
      ],
      "basketball-court": [
        "basketball court",
        "basketball",
        "hoops"
      ],
      "pickleball-court": [
        "pickleball court",
        "pickleball",
        "pickle ball",
        "pickle ball court"
      ],
      "sand-volleyball-court": [
        "volleyball",
        "beach volleyball",
        "sand volleyball",
        "volleyball court",
        "sand pit",
        "sand court",
        "volleyball pit"
      ],
      "handball-court": [
        "handball court",
        "handball",
        "handball wall",
        "wall ball",
        "wallball",
        "one wall"
      ],
      "bocce-court": [
        "bocce court",
        "bocce",
        "bocce ball",
        "boules",
        "petanque"
      ],
      "ring-trek": [
        "ring trek",
        "monkey bars",
        "monkey rings",
        "overhead rings",
        "overhead ladder",
        "rings"
      ],
      "fitness-station": [
        "fitness station",
        "fitness equipment",
        "outdoor gym",
        "exercise equipment",
        "pull up bars",
        "pullup bars",
        "calisthenics",
        "workout",
        "parallel bars",
        "exercise stations"
      ],
      swings: [
        "swing set",
        "swing",
        "adult swings"
      ],
      "climbing-boulder": [
        "climbing boulder",
        "boulder",
        "climbing wall",
        "bouldering",
        "climbing rocks"
      ],
      "chess-tables": [
        "chess tables",
        "chess table",
        "chess",
        "checkers",
        "game tables",
        "game table",
        "dominoes"
      ],
      "spray-shower": [
        "spray shower",
        "splash pad",
        "sprinkler",
        "sprinklers",
        "water play",
        "spray"
      ],
      "mini-pitch": [
        "mini pitch",
        "soccer field",
        "soccer pitch",
        "futsal",
        "turf field",
        "football pitch",
        "cricket",
        "ball field"
      ],
      "jogging-loop": [
        "jogging loop",
        "running track",
        "track",
        "jogging path",
        "running path",
        "fitness trail"
      ]
    },
    colours: {
      "tennis-court": "#447eaf",
      "clay-tennis-court": "#b5573a",
      "basketball-court": "#af6745",
      "pickleball-court": "#447eaf",
      "sand-volleyball-court": "#d9c6a0",
      "mini-pitch": "#98b27c"
    }
  },
  {
    id: "park",
    label: "Park facilities",
    hue: 119,
    keywords: [
      "restroom",
      "restrooms",
      "bathroom",
      "bathrooms",
      "toilet",
      "toilets",
      "fountain",
      "trash",
      "garbage",
      "litter",
      "bin",
      "bins",
      "dog",
      "dogs",
      "facilities",
      "maintenance",
      "fence",
      "fencing"
    ],
    types: {
      "comfort-station": [
        "comfort station",
        "restroom",
        "restrooms",
        "bathroom",
        "bathrooms",
        "toilet",
        "toilets",
        "public toilet",
        "public restroom"
      ],
      "drinking-fountain": [
        "drinking fountain",
        "water fountain",
        "fountain",
        "bottle filler",
        "hydration station",
        "water bottle refill"
      ],
      "litter-and-recycling-bins": [
        "trash can",
        "trash cans",
        "garbage can",
        "litter basket",
        "recycling",
        "bins",
        "trash",
        "garbage",
        "waste"
      ],
      "dog-run": [
        "dog run",
        "dog park",
        "dogs",
        "dog",
        "off leash"
      ]
    }
  },
  {
    id: "traffic",
    label: "Transit and traffic",
    hue: 359,
    keywords: [
      "bus",
      "buses",
      "transit",
      "subway",
      "train",
      "shelter",
      "stop",
      "car",
      "cars",
      "traffic",
      "speed",
      "speeding",
      "slow",
      "calming",
      "signal",
      "light",
      "turn",
      "intersection",
      "corner",
      "parking",
      "drivers",
      "truck",
      "lane",
      "road",
      "street",
      "redesign",
      "daylight"
    ],
    types: {
      "add-bus-lane": [
        "bus lane",
        "busway",
        "transit lane",
        "bus priority"
      ],
      "add-bus-shelter": [
        "bus shelter",
        "bus stop",
        "shelter",
        "transit stop",
        "bus bench"
      ],
      "add-traffic-calming": [
        "traffic calming",
        "speed bump",
        "speed hump",
        "chicane",
        "road diet",
        "narrow the road"
      ],
      "lower-speed-limit": [
        "speed limit",
        "slow zone",
        "20 mph"
      ],
      "fix-dangerous-intersection": [
        "dangerous intersection",
        "dangerous crossing",
        "safer intersection"
      ],
      "daylight-this-corner": [
        "daylighting",
        "daylight",
        "clear corner"
      ],
      "add-pedestrian-signal": [
        "walk signal",
        "pedestrian signal",
        "leading pedestrian interval"
      ],
      "fix-signal-timing": [
        "signal timing",
        "light timing",
        "green wave"
      ],
      "extend-crossing-time": [
        "more crossing time",
        "longer walk signal"
      ],
      "ban-turn-on-red": [
        "no turn on red",
        "turn ban"
      ],
      "street-redesign": [
        "street redesign",
        "complete street",
        "road redesign",
        "close the ramp",
        "remove the ramp"
      ],
      "granite-blocks": [
        "granite blocks",
        "granite block",
        "bollards",
        "car barrier",
        "close to cars",
        "block cars",
        "jersey barrier",
        "no cars"
      ]
    }
  },
  {
    id: "changes",
    label: "Changes to what's there",
    hue: 329,
    about: "Appended 2026-11-01 by move-remove: proposals about things already on the board (30-draw-proposals/65-pick-what-is-there.ts picks them). Not placeable from Add; each carries the thing in Submission.existing. The presets c01..c11 above are their labels (a road is closed, never moved: remove-road only). Keep this block last.",
    keywords: [],
    types: {
      "remove-tree": [],
      "move-tree": [],
      "remove-court": [],
      "move-court": [],
      "remove-playground": [],
      "move-playground": [],
      "remove-plaza": [],
      "move-plaza": [],
      "remove-path": [],
      "move-path": [],
      "remove-road": [],
      "remove-building": []
    }
  }
], tn = {
  presets: Zs,
  families: Ps
}, it = { id: "other", label: "Other", hue: 0, typeIds: ["create-your-own"] }, $s = "changes", nn = [...ge?.families ?? [], ...tn.families], rn = nn.map((t) => ({ id: t.id, label: t.label, hue: t.hue, typeIds: Object.keys(t.types) }));
new Map([...rn, it].map((t) => [t.id, t]));
const Ds = new Map(rn.flatMap((t) => t.typeIds.map((e) => [e, t]))), qs = new Map(nn.flatMap((t) => Object.entries(t.colours ?? {})));
function _t(t) {
  return Ds.get(t) ?? it;
}
const Bs = 0.72, Zt = 0.5, zs = 0.08, Vs = 0.3;
function Us(t) {
  const e = _t(t), n = e.typeIds.length, r = Math.max(0, e.typeIds.indexOf(t));
  if (n <= 1) return Zt;
  const s = Math.min(zs, Vs / (n - 1));
  return Zt + (r - (n - 1) / 2) * s;
}
function Ys(t, e, n) {
  const r = e * Math.min(n, 1 - n), s = (i) => {
    const o = (i + t / 30) % 12, a = n - r * Math.max(-1, Math.min(o - 3, 9 - o, 1));
    return Math.round(255 * a).toString(16).padStart(2, "0");
  };
  return `#${s(0)}${s(8)}${s(4)}`;
}
function Ws(t) {
  const e = qs.get(t);
  if (e) return e;
  const n = _t(t);
  return Ys(n.hue, n === it ? 0 : Bs, n === it ? 0.62 : Us(t));
}
p.object({
  typeId: p.string(),
  familyId: p.string(),
  confidence: p.number(),
  by: p.enum(["clef", "fallback"]),
  route: p.boolean()
});
function Fs(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
const Xs = {
  // lines (City Edit "route")
  "add-protected-bike-lane": { widthM: 1.8 },
  "add-bike-lane": { widthM: 1.5 },
  "add-bus-lane": { widthM: 3.35 },
  "add-crosswalk": { widthM: 3 },
  "add-traffic-calming": { widthM: 3 },
  "lower-speed-limit": { widthM: 3 },
  "widen-sidewalk": { widthM: 1.5 },
  "improve-sidewalk": { widthM: 1.5 },
  "fix-broken-sidewalk": { widthM: 1.5 },
  "improve-accessibility": { widthM: 1.5 },
  "add-tree-lined-street": { widthM: 1.5 },
  // points
  "add-tree": { widthM: 1.5, shape: "circle" },
  "add-planter-boxes": { widthM: 1, shape: "square" },
  "add-bench": { widthM: 1.8, shape: "square" },
  "add-bus-shelter": { widthM: 4, shape: "square" },
  "add-bike-parking": { widthM: 1, shape: "square" },
  "add-citibike-station": { widthM: 8, shape: "square" },
  "fix-dangerous-intersection": { widthM: 25, shape: "circle" },
  "add-pedestrian-signal": { widthM: 3, shape: "circle" },
  "add-audible-pedestrian-signal": { widthM: 3, shape: "circle" },
  "fix-signal-timing": { widthM: 3, shape: "circle" },
  "extend-crossing-time": { widthM: 3, shape: "circle" },
  "ban-turn-on-red": { widthM: 3, shape: "circle" },
  "add-intersection-lighting": { widthM: 3, shape: "circle" },
  "daylight-this-corner": { widthM: 6, shape: "square" },
  "add-curb-extension": { widthM: 6, shape: "square" },
  "add-raised-crosswalk": { widthM: 6, shape: "square" },
  "add-pedestrian-refuge-island": { widthM: 2, shape: "square" },
  "add-pedestrian-plaza": { widthM: 20, shape: "circle" },
  "street-redesign": { widthM: 30, shape: "circle" },
  "add-pedestrian-bridge": { widthM: 10, shape: "circle" },
  "add-curb-cut": { widthM: 1.5, shape: "square" },
  "fix-curb-cut": { widthM: 1.5, shape: "square" },
  "add-tactile-paving": { widthM: 1.5, shape: "square" },
  "add-subway-elevator": { widthM: 3, shape: "square" },
  "fix-broken-elevator": { widthM: 3, shape: "square" },
  "add-accessible-parking-space": { widthM: 2.5, shape: "square" },
  "clear-sidewalk-obstruction": { widthM: 2, shape: "circle" },
  // Exit 12N's own presets
  "food-truck": { widthM: 7, shape: "square" },
  "add-seating": { widthM: 5, shape: "circle" },
  "ping-pong-table": { widthM: 5, shape: "square" },
  "skate-park": { widthM: 20, shape: "square" },
  "add-a-path": { widthM: 2 },
  "create-your-own": { widthM: 6, shape: "circle" },
  "public-art": { widthM: 4, shape: "circle" },
  "rain-garden": { widthM: 6, shape: "square" },
  playground: { widthM: 15, shape: "square" },
  "market-stalls": { widthM: 12, shape: "square" },
  "tennis-court": { widthM: 16, shape: "square" },
  "clay-tennis-court": { widthM: 16, shape: "square" },
  "basketball-court": { widthM: 20, shape: "square" },
  // the NYC parkitecture of 2026-11-01 (parkitecture-research.md): for a court or a pit the square is the outline and
  // the stamp, the side its envelope's long side; the model paves the real envelope inside it
  "pickleball-court": { widthM: 18.3, shape: "square" },
  "sand-volleyball-court": { widthM: 20, shape: "square" },
  "handball-court": { widthM: 10.4, shape: "square" },
  "bocce-court": { widthM: 18.3, shape: "square" },
  "ring-trek": { widthM: 5, shape: "square" },
  "fitness-station": { widthM: 10, shape: "square" },
  swings: { widthM: 6, shape: "square" },
  "climbing-boulder": { widthM: 4, shape: "circle" },
  "chess-tables": { widthM: 4, shape: "square" },
  "spray-shower": { widthM: 8, shape: "circle" },
  "mini-pitch": { widthM: 25, shape: "square" },
  "jogging-loop": { widthM: 2.5 },
  "picnic-area": { widthM: 8, shape: "square" },
  pergola: { widthM: 6, shape: "square" },
  "shade-sail": { widthM: 8, shape: "circle" },
  "scenic-overlook": { widthM: 8, shape: "square" },
  "performance-stage": { widthM: 10, shape: "square" },
  amphitheater: { widthM: 16, shape: "circle" },
  "community-garden": { widthM: 12, shape: "square" },
  lawn: { widthM: 15, shape: "circle" },
  "pollinator-meadow": { widthM: 12, shape: "circle" },
  "kayak-launch": { widthM: 10, shape: "square" },
  "barbecue-area": { widthM: 8, shape: "square" },
  "cafe-kiosk": { widthM: 5, shape: "square" },
  "bike-repair-stand": { widthM: 1.5, shape: "square" },
  "wayfinding-sign": { widthM: 1.5, shape: "circle" },
  "add-stairs": { widthM: 2.5 },
  boardwalk: { widthM: 3 },
  "comfort-station": { widthM: 10, shape: "square" },
  "drinking-fountain": { widthM: 1.5, shape: "circle" },
  "litter-and-recycling-bins": { widthM: 1.5, shape: "square" },
  "dog-run": { widthM: 24, shape: "square" },
  "granite-blocks": { widthM: 6, shape: "square" },
  // changes to what's there (30-draw-proposals/65-pick-what-is-there.ts): the drawing takes the thing's own size; these only name a shape
  "remove-tree": { widthM: 6, shape: "circle" },
  "move-tree": { widthM: 6, shape: "circle" },
  "remove-court": { widthM: 23, shape: "circle" },
  "move-court": { widthM: 23, shape: "circle" },
  "remove-playground": { widthM: 15, shape: "circle" },
  "move-playground": { widthM: 15, shape: "circle" },
  "remove-plaza": { widthM: 20, shape: "circle" },
  "move-plaza": { widthM: 20, shape: "circle" },
  "remove-path": { widthM: 2.5, shape: "circle" },
  "move-path": { widthM: 2.5, shape: "circle" },
  "remove-road": { widthM: 6.5, shape: "circle" },
  "remove-building": { widthM: 10, shape: "circle" }
}, Gs = tn.presets, Hs = {
  line: { widthM: 3 },
  point: { widthM: 3, shape: "circle" }
}, sn = ge?.types ?? [], Ks = new Map(sn.map((t) => [t.id, { widthM: t.widthM, shape: t.shape }]));
function Js() {
  const t = Rs.root, e = sn.map((n) => ({ id: `r-${n.id}`, label: n.label, kind: "point", description: n.description, slug: n.id }));
  return [...(t.children ?? []).flatMap((n) => n.vote_types), ...t.vote_types ?? [], ...Gs, ...e];
}
const an = Js().map((t) => {
  const e = t.kind === "route" ? "line" : "point", n = t.slug ?? Fs(t.label), r = Xs[n] ?? Ks.get(n) ?? Hs[e];
  return { id: n, cityEditId: t.id, label: t.label, description: t.description, kind: e, defaultWidthM: r.widthM, shape: r.shape ?? "circle", color: Ws(n) };
}), Ue = new Map(an.map((t) => [t.id, t]));
function Qs(t) {
  return an.filter((e) => e.kind === t);
}
const Pt = "create-your-own", $t = [
  "add-tree",
  "add-bench",
  "add-seating",
  "food-truck",
  "ping-pong-table",
  "skate-park",
  "add-planter-boxes",
  "add-intersection-lighting",
  "add-bus-shelter",
  "playground",
  "tennis-court",
  "clay-tennis-court",
  "basketball-court",
  "market-stalls",
  "public-art",
  "rain-garden",
  "pickleball-court",
  "sand-volleyball-court",
  "ring-trek",
  "handball-court",
  "bocce-court",
  "mini-pitch",
  "fitness-station",
  "swings",
  "climbing-boulder",
  "chess-tables",
  "spray-shower",
  "picnic-area",
  "pergola",
  "shade-sail",
  "scenic-overlook",
  "performance-stage",
  "amphitheater",
  "community-garden",
  "lawn",
  "pollinator-meadow",
  "kayak-launch",
  "barbecue-area",
  "cafe-kiosk",
  "bike-repair-stand",
  "wayfinding-sign",
  "comfort-station",
  "drinking-fountain",
  "litter-and-recycling-bins",
  "dog-run",
  "granite-blocks"
];
function on(t) {
  return t.kind === "point" && _t(t.id).id !== $s;
}
function ei(t) {
  return t.map((e) => {
    const n = Ue.get(e);
    if (!n || !on(n)) throw new Error(`the area's menu lists "${e}", which is not a placeable type`);
    return n;
  });
}
const ti = /* @__PURE__ */ new Set([
  "drinking-fountain",
  "litter-and-recycling-bins",
  "wayfinding-sign",
  "bike-repair-stand",
  "add-bench",
  "add-planter-boxes",
  "add-bike-parking",
  "add-curb-cut",
  "fix-curb-cut",
  "add-tactile-paving",
  "add-pedestrian-signal",
  "add-audible-pedestrian-signal",
  "add-intersection-lighting",
  "fix-signal-timing",
  "extend-crossing-time",
  "ban-turn-on-red",
  "add-tree",
  "add-accessible-parking-space",
  "add-subway-elevator",
  "fix-broken-elevator",
  "ping-pong-table"
]);
function ni(t) {
  const e = !!t?.fixedSizes, n = new Set((t?.types ?? []).filter((i) => i.pin).map((i) => i.id)), r = (i) => e && ti.has(i) || n.has(i);
  function s(i) {
    if (i.kind !== "point" || !r(i.typeId)) return i;
    const o = Ue.get(i.typeId)?.defaultWidthM;
    return !o || i.widthM === o && !i.lengthM ? i : { ...i, widthM: o, lengthM: null };
  }
  return { isFixedSize: r, atItsOwnSize: s };
}
ni(ge);
ge?.placeable;
ge?.placeable ? ei(ge.placeable) : [
  ...$t.map((t) => Ue.get(t)).filter(Boolean),
  ...Qs("point").filter((t) => on(t) && !$t.includes(t.id) && t.id !== Pt),
  Ue.get(Pt)
];
function ri(t) {
  return t.label?.trim() ? t.label.trim() : Ue.get(t.typeId)?.label ?? t.typeId.replace(/-/g, " ");
}
Object.fromEntries(
  Object.entries(/* @__PURE__ */ Object.assign({ "./icons/accessibility.svg": Rr, "./icons/ai-urban-planning.svg": Zr, "./icons/bikes.svg": Pr, "./icons/cafes.svg": $r, "./icons/charging.svg": Dr, "./icons/community.svg": qr, "./icons/density.svg": Br, "./icons/housing.svg": zr, "./icons/mapping.svg": Vr, "./icons/mixed-use.svg": Ur, "./icons/parks.svg": Yr, "./icons/pedestrian-streets.svg": Wr, "./icons/public-space.svg": Fr, "./icons/safety.svg": Xr, "./icons/tactical.svg": Gr, "./icons/traffic-reduction.svg": Hr, "./icons/transit.svg": Kr, "./icons/trees.svg": Jr, "./icons/voting.svg": Qr, "./icons/walkways.svg": es, "./icons/waterfront.svg": ts })).map(([t, e]) => [t.replace(/^.*\/(.+)\.svg$/, "$1"), e])
);
const pt = 111320;
class si {
  constructor(e) {
    this.origin = e, this.mPerDegLon = pt * Math.cos(e.lat * Math.PI / 180);
  }
  mPerDegLon;
  toLocal(e, n, r = 0) {
    return [(n - this.origin.lon) * this.mPerDegLon, (e - this.origin.lat) * pt, r];
  }
  toLatLon(e, n) {
    return { lat: this.origin.lat + n / pt, lon: this.origin.lon + e / this.mPerDegLon };
  }
}
const ii = Number.MAX_SAFE_INTEGER;
function ai(t, e = [], n = new bt()) {
  const { proposals: r, votes: s, ghosts: i } = jr(t, e);
  return Or(r, s, i, { phase: ii, phaseVotes: "upto", ghosts: "after", phases: "stack", overlaps: n });
}
const Dt = "park ground (grass, leaf litter)";
function oi(t, e = null, n = [], r = new bt()) {
  const s = ai(t, n, r), i = new Map(t.map((c) => [c.id, c])), o = e ? new si(e.origin) : null, a = [];
  for (const c of s.selected) {
    const l = i.get(c);
    if (!l) continue;
    const d = qt({ kind: l.kind, shape: l.shape, widthM: l.widthM, lengthM: l.lengthM, rotationDeg: l.rotationDeg, coords: l.coords }), h = (l.kind === "point" ? l.coords.slice(0, 1) : l.coords).map((g) => [G(g[0], 2), G(g[1], 2)]), m = d ? [(d.minX + d.maxX) / 2, (d.minY + d.maxY) / 2] : h[0] ?? [0, 0], y = (g, M) => o ? o.toLatLon(g, M) : { lat: NaN, lon: NaN }, v = y(m[0], m[1]);
    a.push({
      id: c,
      title: ri({ typeId: l.typeId, label: l.label ?? null }),
      typeId: l.typeId,
      kind: l.kind,
      change: en(l.typeId)?.action ?? null,
      shape: l.kind === "point" ? l.shape ?? "circle" : null,
      widthM: l.widthM,
      lengthM: l.lengthM ?? null,
      rotationDeg: l.rotationDeg ?? 0,
      coords: h,
      latLon: o ? h.map(([g, M]) => {
        const T = y(g, M);
        return [G(T.lat, 7), G(T.lon, 7)];
      }) : [],
      centre: o ? { lat: G(v.lat, 7), lon: G(v.lon, 7) } : v,
      areaM2: G(r.area(c) || d?.area || 0, 1),
      alongRamp: e?.ramp.length ? li(e.ramp, m) : null,
      landCover: e?.cover && d ? di(d, e.cover) : null,
      votesFor: l.votes.filter((g) => g.dir === 1).length,
      votesAgainst: l.votes.filter((g) => g.dir === -1).length,
      score: s.scores[c] ?? 0,
      createdAt: l.createdAt
    });
  }
  return { selected: s.selected, rows: a, approximate: s.approximate, branchPoints: s.branchPoints, phase: s.phase, proposals: t.length };
}
const G = (t, e) => {
  const n = 10 ** e;
  return Math.round(t * n) / n;
};
function li(t, e) {
  let n = null;
  return t.forEach((r, s) => {
    let i = 0;
    for (let o = 1; o < r.length; o++) {
      const [a, c] = r[o - 1], [l, d] = r[o], h = l - a, m = d - c, y = Math.hypot(h, m);
      if (y === 0) continue;
      const v = Math.max(0, Math.min(1, ((e[0] - a) * h + (e[1] - c) * m) / (y * y))), g = Math.hypot(e[0] - (a + v * h), e[1] - (c + v * m));
      (!n || g < n.offM) && (n = { way: s, alongM: G(i + v * y, 1), offM: G(g, 1) }), i += y;
    }
  }), n;
}
function ci(t, e, n) {
  let r = 0;
  for (let s = 0, i = t.length - 1; s < t.length; i = s++) {
    const [o, a] = t[s], [c, l] = t[i];
    l <= n ? a > n && (o - c) * (n - l) - (e - c) * (a - l) > 0 && r++ : a <= n && (o - c) * (n - l) - (e - c) * (a - l) < 0 && r--;
  }
  return r !== 0;
}
function di(t, e) {
  const n = /* @__PURE__ */ new Map();
  let r = 0;
  const s = (l, d) => {
    const h = l >= 0 && d >= 0 && l < e.cols && d < e.rows ? e.cells[d * e.cols + l] : 255, m = h === 255 ? Dt : e.classes[h] ?? Dt;
    n.set(m, (n.get(m) ?? 0) + 1), r++;
  }, i = Math.floor((t.minX - e.minX) / e.cellM), o = Math.floor((t.maxX - e.minX) / e.cellM), a = Math.floor((t.minY - e.minY) / e.cellM), c = Math.floor((t.maxY - e.minY) / e.cellM);
  for (let l = a; l <= c; l++)
    for (let d = i; d <= o; d++) {
      const h = e.minX + (d + 0.5) * e.cellM, m = e.minY + (l + 0.5) * e.cellM;
      ci(t.poly, h, m) && s(d, l);
    }
  return r === 0 && s(Math.floor(((t.minX + t.maxX) / 2 - e.minX) / e.cellM), Math.floor(((t.minY + t.maxY) / 2 - e.minY) / e.cellM)), [...n].map(([l, d]) => ({ type: l, share: G(d / r, 3) })).sort((l, d) => d.share - l.share || (l.type < d.type ? -1 : 1));
}
const ui = "https://exit12n-api-staging-katze52zaq-uc.a.run.app/api".replace(/\/$/, "");
function pi(t) {
  const e = [];
  for (let s = 0; s < t.cells.length; ) {
    let i = s;
    for (; i < t.cells.length && t.cells[i] === t.cells[s]; ) i++;
    e.push(t.cells[s], i - s), s = i;
  }
  const { cells: n, ...r } = t;
  return { ...r, runs: e };
}
function hi(t) {
  const { runs: e, ...n } = t.cover, r = new Uint8Array(n.cols * n.rows);
  let s = 0;
  for (let i = 0; i < e.length; i += 2)
    r.fill(e[i], s, s + e[i + 1]), s += e[i + 1];
  if (s !== r.length) throw new Error(`final-ground.json: ${s} cells for a ${n.cols} x ${n.rows} grid`);
  return { origin: t.origin, ramp: t.ramp, cover: { ...n, cells: r } };
}
async function fi(t = {}) {
  const e = t.fetch ?? ((...a) => fetch(...a)), n = (t.api ?? ui).replace(/\/$/, "");
  if (!n) throw new Error("topProposals: no votes API (pass { api })");
  const r = t.ground !== void 0 ? Promise.resolve(t.ground) : e(new URL("./final-ground.json", import.meta.url).href).then((a) => a.ok ? a.json().then((c) => hi(c)) : null, () => null), s = (/* @__PURE__ */ new Date()).toISOString(), i = await e(`${n}/submissions`).then((a) => {
    if (!a.ok) throw new Error(`GET ${n}/submissions: ${a.status}`);
    return a.json();
  }), o = await r;
  return { at: s, api: n, placed: !!o, ...oi(i, o) };
}
export {
  ui as BUILT_API,
  hi as decodeGround,
  pi as encodeCover,
  fi as topProposals
};
