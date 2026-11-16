// 무대 맞추기 · 화면 전환 · 말풍선 · 끌어 놓기. import할 때 DOM을 건드리지 않는다.
import {STAGE_W, STAGE_H} from './config.js';

export function fitScale(viewW, viewH){
  return Math.min(viewW / STAGE_W, viewH / STAGE_H);
}

let stageEl = null;
export function initStage(el){
  stageEl = el;
  const fit = () => {
    const s = fitScale(innerWidth, innerHeight);
    el.style.transform = `translate(${(innerWidth - STAGE_W*s)/2}px, ${(innerHeight - STAGE_H*s)/2}px) scale(${s})`;
  };
  addEventListener('resize', fit); fit();
}

export function toStage(e){
  const r = stageEl.getBoundingClientRect(), s = r.width / STAGE_W;
  return {x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s};
}

export const $ = (sel, root=document) => root.querySelector(sel);
export function h(tag, attrs={}, ...kids){
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs||{})){
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
  return el;
}

// 아래 말풍선: face = 'rupert_explain' 같은 그림 이름, who = '루퍼드'|'채원'
export function say(face, html, who){
  const t = $('#talk'); if (!t) return;
  t.hidden = false;
  $('#talkFace').src = `img/${face}.webp`;
  $('#talkWho').textContent = who || (face.startsWith('chaewon') ? '채원' : '루퍼드');
  $('#talkText').innerHTML = html;
}
export function hideTalk(){ const t = $('#talk'); if (t) t.hidden = true; }

// 끌어 놓기: 누른 자리에서 유령을 만들고 손을 떼면 무대 좌표로 onDrop
export function dragFrom(e, makeGhost, onDrop){
  e.preventDefault();
  const g = makeGhost(); g.classList.add('drag-ghost'); stageEl.append(g);
  const mv = ev => { const p = toStage(ev); g.style.left = p.x + 'px'; g.style.top = p.y + 'px'; };
  const up = ev => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); g.remove(); onDrop(toStage(ev)); };
  mv(e);
  addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
}

// 화면 전환: screens = {id: module(mount)}
let screens = {}, ctxRef = null, current = null;
export function setScreens(map, ctx){ screens = map; ctxRef = ctx; }
export function showScreen(id, arg){
  const root = $('#screen'); root.innerHTML = ''; root.className = 'scr-' + id;
  current = id;
  const m = screens[id];
  if (m) m.mount(root, ctxRef, arg);
}
export const currentScreen = () => current;
