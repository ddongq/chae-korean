// 꾸미기: 마른 소품과 고양이를 책방 바닥 칸에 끌어다 놓기·옮기기·되돌리기. 보관함으로 끌면 빼기.
import {h, say, dragFrom, josa} from '../ui.js';
import {ASSETS, REF_W, REF_H} from '../assets.js';
import {cellAt, cellCenter, place, move, remove, undo} from '../iso.js';
import {shopView} from './home.js';
import {itemPic} from './wrap.js';
import {lessonByItem} from '../../content/index.js';

const BOX = {x: 24, y: 88, w: 1060, h: 792};
const nameOf = id => id === 'cat' ? '고양이' : lessonByItem(id)?.reward.itemName || id;

export function mount(root, ctx){
  const S = ctx.store.state, history = [];
  const toRef = p => ({x: (p.x - BOX.x) / BOX.w * REF_W, y: (p.y - BOX.y) / BOX.h * REF_H});
  const inTray = p => p.x > 1100;
  function drop(id, p){
    if (inTray(p)){ if (remove(S, id, history)) say('rupert_explain', `${josa(nameOf(id), '을', '를')} 보관함에 넣었어.`); render(); ctx.save(); return; }
    const r = toRef(p), c = cellAt(ASSETS.grid.g, r.x, r.y);
    if (!c){ say('rupert_think', '바닥 칸 안에 놓아 볼까?'); return; }
    const ok = S.placed.some(q => q.itemId === id) ? move(S, id, {floor: 'g', ...c}, history) : place(S, {itemId: id, floor: 'g', ...c}, history);
    if (!ok) say('rupert_think', '거기엔 벌써 다른 게 있어. <b>옆 칸</b>은 어때?');
    render(); ctx.save();
  }
  function render(){
    root.replaceChildren();
    const shop = shopView(S, ctx.content, {w: BOX.w, h: BOX.h, defaultCat: false});
    Object.assign(shop.style, {left: BOX.x + 'px', top: BOX.y + 'px'});
    const g = ASSETS.grid.g, P = (a, b) => cellCenter(g, a - .5, b - .5);
    let lines = '';
    for (let i = 0; i <= g.N; i++){ const a = P(i, 0), b = P(i, g.N), c = P(0, i), d = P(g.N, i);
      lines += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><line x1="${c.x}" y1="${c.y}" x2="${d.x}" y2="${d.y}"/>`; }
    shop.insertAdjacentHTML('beforeend', `<svg class="isogrid" viewBox="0 0 ${REF_W} ${REF_H}" aria-hidden="true"><g stroke="rgba(255,250,235,.95)" stroke-width="3.5" stroke-dasharray="12 8">${lines}</g></svg>`);
    shop.querySelector('.things').style.zIndex = 2;
    shop.querySelectorAll('.thing').forEach(t => t.addEventListener('pointerdown', e => dragFrom(e, () => t.cloneNode(true), p => drop(t.dataset.id, p))));
    const stock = [...Object.entries(S.items).filter(([id, i]) => i.state === 'dry' && !S.placed.some(p => p.itemId === id)).map(([id]) => id),
                   ...(S.placed.some(p => p.itemId === 'cat') ? [] : ['cat'])];
    const wet = Object.entries(S.items).filter(([, i]) => i.state === 'wet').map(([id]) => id);
    const tray = h('section', {class: 'panel tray'}, h('h2', {}, '보관함'), h('small', {}, '끌어다 바닥 칸에 놓아요. 놓은 것을 여기로 끌면 다시 넣어요.'),
      ...stock.map(id => { const el = h('div', {class: 'titem'}, h('span', {}, nameOf(id)), id === 'cat' ? h('img', {src: ASSETS.cat[S.pet.stage - 1], alt: ''}) : itemPic(id));
        el.addEventListener('pointerdown', e => dragFrom(e, () => el.lastChild.cloneNode(true), p => drop(id, p))); return el; }),
      ...wet.map(id => h('div', {class: 'titem wetitem'}, h('span', {}, nameOf(id) + ' · 젖은 잉크'), itemPic(id))),
      !stock.length && !wet.length ? h('p', {class: 'empty'}, '차시를 마치고 잉크를 말리면 소품이 여기에 생겨요.') : null,
      h('div', {class: 'trayBtns'}, h('button', {class: 'btn', onclick: () => { if (undo(S, history)){ render(); ctx.save(); } }}, '되돌리기'),
        h('button', {class: 'btn leaf', onclick: () => ctx.go('home')}, '다 꾸몄어요')));
    root.append(shop, tray);
  }
  render();
  say('rupert_explain', '마른 소품을 <b>바닥 칸</b>에 놓아 봐. 언제든 옮기고 되돌릴 수 있어.');
}
