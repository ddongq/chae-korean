// 책방 홈: 옅은 책방에서 되살아난 구역만 색, 놓은 소품과 고양이, 오른쪽에 오늘의 책방 일.
import {h, say} from '../ui.js';
import {ASSETS, REF_W, REF_H} from '../assets.js';
import {cellCenter} from '../iso.js';
import {todayTasks} from '../plan.js';
import {unitById} from '../../content/units.js';

const TASK_TEXT = {
  dry: () => ['젖은 잉크 말리기', '어제 만난 낱말을 다시 떠올리면 소품이 책방에 놓여요', 'sky'],
  review: () => ['다시 만나기', '전에 헷갈린 문제를 다시 풀어요', 'sky'],
  dictation: (t, c) => [c.content.grades.find(g => g.id === t.ref).name + ' 받아쓰기', '듣고 원고지에 쓰기', 'berry'],
  lesson: (t, c) => { const l = c.content.unit.lessons.find(x => x.id === t.ref); return [`4단원 ${l.range}`, l.title, 'leaf']; },
  reading: () => ['소리 내어 읽기 10분', '오늘 읽은 책을 적고 고양이에게 들려줘요', 'brown'],
};
export const ROUTE = {dry: 'recall', review: 'recall', dictation: 'dictation', lesson: 'lesson', reading: 'reading'};

export function zoneMask(state, content){
  const parts = [];
  for (const u of content.units){
    const z = ASSETS.zones[u.id]; if (!z) continue;
    let k = state.units[u.id] ? 1 : 0;
    if (!k && u.id === content.unit.id){ const ls = content.unit.lessons; k = ls.filter(l => state.lessons[l.id]).length / ls.length; }
    if (k <= 0) continue;
    const rx = (z.rx * (0.45 + 0.55 * k)) / REF_W * 100, ry = (z.ry * (0.45 + 0.55 * k)) / REF_H * 100;
    parts.push(`radial-gradient(ellipse ${rx.toFixed(1)}% ${ry.toFixed(1)}% at ${(z.x / REF_W * 100).toFixed(1)}% ${(z.y / REF_H * 100).toFixed(1)}%, #000 60%, transparent 100%)`);
  }
  return parts.join(', ');
}

export function shopView(state, content, {w, h: hh, grid = false} = {}){
  const box = h('div', {class: 'shop', style: {width: w + 'px', height: hh + 'px'}});
  const faded = h('img', {class: 'base' + (ASSETS.shop.faded ? '' : ' faded'), src: ASSETS.shop.faded || ASSETS.shop.alive, alt: ''});
  const alive = h('img', {class: 'base alive', src: ASSETS.shop.alive, alt: ''});
  const mask = zoneMask(state, content);
  alive.style.webkitMaskImage = alive.style.maskImage = mask || 'linear-gradient(transparent, transparent)';
  box.append(faded, alive);
  const layer = h('div', {class: 'things'}); box.append(layer);
  const toPct = p => ({left: (p.x / REF_W * 100) + '%', top: (p.y / REF_H * 100) + '%'});
  for (const p of state.placed){
    const c = cellCenter(ASSETS.grid[p.floor] || ASSETS.grid.g, p.a, p.b);
    layer.append(thing(p.itemId, state, toPct(c), c.y));
  }
  if (!state.placed.some(p => p.itemId === 'cat')){
    const c = cellCenter(ASSETS.grid.g, 3, 4);
    layer.append(thing('cat', state, toPct(c), c.y));
  }
  box.refresh = () => {};
  return box;
}

export function thing(id, state, pos, y){
  const isCat = id === 'cat', st = state.pet.stage - 1;
  const a = isCat ? {src: ASSETS.cat[st], h: ASSETS.catH[st]} : ASSETS.items[id] || {src: null, h: 70};
  const el = a.src ? h('img', {class: 'thing', src: a.src, alt: ''}) : h('div', {class: 'thing ghost'}, id.replace(/^u\d-/, ''));
  Object.assign(el.style, pos, {height: a.h + 'px', zIndex: Math.round(y)});
  el.dataset.id = id;
  if (isCat) el.classList.add('cat');
  return el;
}

export function mount(root, ctx){
  const S = ctx.store.state;
  const tasks = todayTasks(S, ctx.day, ctx.content);
  const shop = shopView(S, ctx.content, {w: 1000, h: 746});
  shop.classList.add('home-shop');
  const unit = unitById(S.currentUnit);
  const catBub = h('div', {class: 'pbub'}, tasks[0]?.kind === 'dry' ? '어제 만든 소품, 잉크가 아직 젖어 있어. 같이 말리자!' : tasks.length ? '오늘도 와 줬구나!' : '오늘 책방 일 끝! 꾸미러 갈까?');
  shop.append(catBub);
  const cat = shop.querySelector('.cat');
  if (cat){ catBub.style.left = cat.style.left; catBub.style.top = `calc(${cat.style.top} - ${ASSETS.catH[S.pet.stage - 1] + 70}px)`; }
  const list = tasks.map((t, i) => {
    const [title, sub, color] = TASK_TEXT[t.kind](t, ctx);
    return h('button', {class: 'task', onclick: () => ctx.go(ROUTE[t.kind], t.kind === 'review' || t.kind === 'dry' ? undefined : t.ref)},
      h('span', {class: 'n', style: {background: `var(--${color})`}}, String(i + 1)), h('b', {}, title), h('span', {}, sub));
  });
  const start = tasks.length ? h('button', {class: 'btn go', onclick: () => list[0].click()}, '시작하기')
                             : h('button', {class: 'btn leaf', onclick: () => ctx.go('deco')}, '책방 꾸미기');
  root.append(shop, h('section', {class: 'panel todo'},
    h('h2', {}, '오늘의 책방 일'),
    ...(list.length ? list : [h('p', {class: 'alldone'}, '오늘 할 일을 다 했어요. 내일 또 만나요!')]),
    start,
    h('button', {class: 'btn', onclick: () => ctx.go('map')}, '단원 지도'),
    h('div', {class: 'days'}, '함께 책방을 연 날 ', h('b', {}, `${S.days.length}일`))));
  say('rupert_hello', tasks.length ? `왔구나, 채원아. <b>${unit.zoneName}</b> 쪽이 조금씩 색을 찾고 있어.` : '오늘도 수고했어. <b>책방을 꾸며</b> 볼까?');
}
