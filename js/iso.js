// 아이소메트릭 바닥 칸(순수). grid = {F 앞 꼭짓점, L 왼쪽, R 오른쪽, N 칸 수} — 그림 좌표.
// 칸 (a, b): a는 F→L 방향, b는 F→R 방향.
const axes = g => ({ux: (g.L.x - g.F.x) / g.N, uy: (g.L.y - g.F.y) / g.N, vx: (g.R.x - g.F.x) / g.N, vy: (g.R.y - g.F.y) / g.N});

export function cellCenter(g, a, b){
  const {ux, uy, vx, vy} = axes(g);
  return {x: g.F.x + ux * (a + .5) + vx * (b + .5), y: g.F.y + uy * (a + .5) + vy * (b + .5)};
}

export function cellAt(g, x, y){
  const {ux, uy, vx, vy} = axes(g), dx = x - g.F.x, dy = y - g.F.y, det = ux * vy - uy * vx;
  const a = (dx * vy - dy * vx) / det, b = (ux * dy - uy * dx) / det;
  if (a < 0 || b < 0 || a >= g.N || b >= g.N) return null;
  return {a: Math.floor(a), b: Math.floor(b)};
}

// 가구가 서 있는 칸(grid.blocked: 'a,b' 목록)에는 놓지 못한다 — 놓으면 가구 위·벽 앞 공중에 떠 보인다
export const cellFree = (g, a, b) => !(g.blocked || []).includes(`${a},${b}`);

const canPlace = (state, id) => id === 'cat' || state.items[id]?.state === 'dry';
const taken = (state, spot, except) => state.placed.some(p => p.itemId !== except && p.floor === spot.floor && p.a === spot.a && p.b === spot.b);

export function place(state, {itemId, floor, a, b}, history){
  if (!canPlace(state, itemId) || taken(state, {floor, a, b}, itemId)) return false;
  const prev = state.placed.find(p => p.itemId === itemId);
  if (prev) return move(state, itemId, {floor, a, b}, history);
  state.placed.push({itemId, floor, a, b});
  history?.push({itemId, prev: null});
  return true;
}

export function move(state, itemId, spot, history){
  const p = state.placed.find(q => q.itemId === itemId);
  if (!p || taken(state, spot, itemId)) return false;
  history?.push({itemId, prev: {floor: p.floor, a: p.a, b: p.b}});
  Object.assign(p, spot);
  return true;
}

export function remove(state, itemId, history){
  const i = state.placed.findIndex(p => p.itemId === itemId);
  if (i < 0) return false;
  const [p] = state.placed.splice(i, 1);
  history?.push({itemId, prev: {floor: p.floor, a: p.a, b: p.b}, removed: true});
  return true;
}

export function undo(state, history){
  const h = history.pop(); if (!h) return false;
  const i = state.placed.findIndex(p => p.itemId === h.itemId);
  if (h.prev === null){ if (i >= 0) state.placed.splice(i, 1); }
  else if (h.removed) state.placed.push({itemId: h.itemId, ...h.prev});
  else if (i >= 0) Object.assign(state.placed[i], h.prev);
  return true;
}
