// 단원 내용 목록. 새 단원은 여기 한 줄로 잇는다.
import {UNITS, unitById} from './units.js';
import {UNIT4} from './unit4.js';
export const UNIT_CONTENT = {u4: UNIT4};
const all = (byId = UNIT_CONTENT) => Object.values(byId).flatMap(u => u.lessons);
export const lessonById = id => all().find(l => l.id === id);
export const lessonByItem = item => all().find(l => l.reward?.item === item);
export const unitName = id => { const u = unitById(id); return u && ['독서', '매체'].includes(u.label) ? `${u.label} 단원` : `${u?.label}단원`; };

// 지금 배울 단원: 부모님이 정한 단원(내용이 있고 안 끝났으면) → 아니면 교과서 순서에서 안 끝난 단원 → 아니면 정한 단원
export function activeUnit(state, byId = UNIT_CONTENT){
  const cur = byId[state.currentUnit];
  if (cur && !state.units[cur.id]) return cur;
  const order = UNITS.map(u => byId[u.id]).filter(Boolean);
  return order.find(u => !state.units[u.id]) || cur || order[0];
}
