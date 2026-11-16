// 진입점: 날짜 정하기, 저장소 열기, 화면 고르기
import {initStage, setScreens, showScreen, $} from './ui.js';
import {openStore} from './store.js';
import {dayKey, effectiveDay} from './day.js';
import {UNITS} from '../content/units.js';
import {UNIT4} from '../content/unit4.js';
import {GRADES} from '../content/dictation.js';
import * as lesson from './screens/lesson.js';
import * as dictation from './screens/dictation.js';
import * as home from './screens/home.js';
import * as map from './screens/map.js';
import * as wrap from './screens/wrap.js';
import * as recall from './screens/recall.js';
import * as reading from './screens/reading.js';
import * as deco from './screens/deco.js';
import * as wardrobe from './screens/wardrobe.js';
import * as words from './screens/words.js';
import * as parent from './screens/parent.js';
import {openStore as _o, memoryBackend} from './store.js';
import {releaseQueued} from './rewards.js';
import {seedDemo} from './seed.js';

const q = new URLSearchParams(location.search);
export const params = {day: q.get('day'), seed: q.get('seed'), screen: q.get('screen'), arg: q.get('arg'), audit: q.has('audit')};
const SCREENS = {lesson, dictation, home, map, wrap, recall, reading, deco, wardrobe, words, parent};
export function registerScreen(id, mod){ SCREENS[id] = mod; }

const WEEK = '일월화수목금토';
async function boot(){
  initStage($('#stage'));
  // ?seed=demo는 시연용 상태를 메모리에만 만든다(기기 기록을 건드리지 않음)
  // ?seed·?day(시험용)는 메모리 저장소로만 연다 — 아이 기기 기록에 시험 날짜가 남지 않게
  const store = await openStore(params.seed || params.day ? memoryBackend() : undefined);
  const day = effectiveDay(store.state, params.day || dayKey(new Date()));
  if (params.seed === 'demo') seedDemo(store.state, day);
  if (releaseQueued(store.state, day).length) await store.save();
  const ctx = {
    store, day,
    content: {units: UNITS, unit: UNIT4, grades: GRADES},
    save: () => store.save(),
    go: (id, arg) => { refreshDay(); $('#btnHome').hidden = id === 'home'; ['btnWardrobe','btnWords','btnParent'].forEach(b => $('#' + b).hidden = id !== 'home'); showScreen(id, arg); },
  };
  window.__ctx = ctx;   // 콘솔 확인용
  setScreens(SCREENS, ctx);
  // 앱을 켜 둔 채 날이 바뀌어도(홈 화면 앱은 다음 날에도 그대로 열릴 수 있다) 화면을 옮길 때마다 오늘을 다시 본다
  function refreshDay(){
    if (!params.day){ const now = effectiveDay(store.state, dayKey(new Date())); if (now !== ctx.day) ctx.day = now; }
    const [y, m, d] = ctx.day.split('-').map(Number);
    $('#barDate').textContent = `${m}월 ${d}일 ${WEEK[new Date(y, m - 1, d).getDay()]}요일`;
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !params.day){ const before = ctx.day; refreshDay(); if (ctx.day !== before) ctx.go('home'); } });
  $('#btnHome').onclick = () => ctx.go('home');
  $('#btnWardrobe').onclick = () => ctx.go('wardrobe');
  $('#btnWords').onclick = () => ctx.go('words');
  // 부모님: 1초 길게 누르기
  let pressT = null;
  const pb = $('#btnParent');
  pb.addEventListener('pointerdown', () => { pb.classList.add('pressing'); pressT = setTimeout(() => { pb.classList.remove('pressing'); ctx.go('parent'); }, 1000); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => pb.addEventListener(t, () => { clearTimeout(pressT); pb.classList.remove('pressing'); }));
  ctx.go(params.screen || 'home', params.arg);
  if (params.audit) import('./audit.js');
}
boot();
