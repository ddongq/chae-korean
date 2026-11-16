// 보상 규칙(순수). 모두 state를 직접 바꾸고 일어난 일을 돌려준다.
// 정답 수가 아니라 끝까지 하기·다른 날 다시 꺼내 보기·고치기에 준다. 무작위 없음, 잃는 것 없음.
import {DAILY_NEW_ITEMS, PET_STAGES, FAST_MS_PER_CHAR} from './config.js';
import {isLater} from './day.js';

export function markActive(state, day){
  if (!state.days.includes(day)) state.days.push(day);
  state.lastDay = day;
}

const newToday = (state, day) => Object.values(state.items).filter(i => i.day === day).length;

export function finishLesson(state, lesson, day){
  if (state.lessons[lesson.id]) return {repeat: true};
  state.lessons[lesson.id] = {day};
  const item = lesson.reward?.item;
  if (!item || state.items[item] || state.queued.some(q => q.item === item)) return {};
  if (newToday(state, day) >= DAILY_NEW_ITEMS){ state.queued.push({item, unit: lesson.unit}); return {queued: item}; }
  state.items[item] = {state: 'wet', day, unit: lesson.unit};
  return {item};
}

export function releaseQueued(state, day){
  const out = [];
  while (state.queued.length && newToday(state, day) < DAILY_NEW_ITEMS){
    const {item, unit} = state.queued.shift();
    state.items[item] = {state: 'wet', day, unit};
    out.push(item);
  }
  return out;
}

export const wetToDry = (state, day) =>
  Object.entries(state.items).filter(([, i]) => i.state === 'wet' && isLater(day, i.day)).map(([id]) => id);

export function dryItem(state, id, day){
  const i = state.items[id];
  if (!i || i.state !== 'wet' || !isLater(day, i.day)) return false;
  i.state = 'dry'; i.dryDay = day;
  return true;
}

const stageOf = n => PET_STAGES.reduce((st, need, i) => n >= need ? i + 1 : st, 1);
export function feed(state, words){
  const before = state.pet.stage;
  let added = 0;
  for (const w of words) if (w && !state.pet.words.includes(w)){ state.pet.words.push(w); added++; }
  state.pet.stage = stageOf(state.pet.words.length);
  return {added, stageUp: state.pet.stage > before};
}

export function addReview(state, key, kind, ref, day){
  state.reviews[key] = {kind, ref, day, misses: state.reviews[key]?.misses ?? 0};
}
export const dueReviews = (state, day) =>
  Object.entries(state.reviews).filter(([, r]) => isLater(day, r.day))
    .sort((a, b) => a[1].day < b[1].day ? -1 : a[1].day > b[1].day ? 1 : 0).slice(0, 3).map(([k]) => k);

export function reviewAnswered(state, key, correct, day){
  const r = state.reviews[key]; if (!r) return {};
  if (correct){ delete state.reviews[key]; return r.ref?.word ? {feedWord: r.ref.word} : {}; }
  r.misses++; r.day = day;
  return {};
}

export function finishUnit(state, unit, day){
  if (state.units[unit.id]) return {repeat: true};
  state.units[unit.id] = {day};
  if (unit.outfit && !state.outfits[unit.outfit]){ state.outfits[unit.outfit] = {day}; return {outfit: unit.outfit}; }
  return {};
}

export function addStamp(state, kind, ref, day){ state.stamps.push({kind, ref, day, done: false}); }
export function stamp(state, index){ if (state.stamps[index]) state.stamps[index].done = true; }

export const tooFast = (chars, ms) => ms < chars * FAST_MS_PER_CHAR;
