// ?audit 로 열고 콘솔에서 await layoutAudit() — 모든 화면과 4단원 모든 활동을 그려 보며
// 글자 넘침, 무대 밖으로 나간 요소, 겹친 버튼을 찾는다(수학 앱 audit.js 방식).
import {h} from './ui.js';
import * as choose from './activities/choose.js';
import * as fix from './activities/fix.js';
import * as sort from './activities/sort.js';
import * as evidence from './activities/evidence.js';
import * as talk from './activities/talk.js';
import * as write from './activities/write.js';
const KINDS = {choose, fix, sort, evidence, talk, write};
const sleep = ms => new Promise(r => setTimeout(r, ms));

function check(where){
  const out = [], stage = document.getElementById('stage'), sr = stage.getBoundingClientRect(), k = sr.width / 1366;
  const els = [...stage.querySelectorAll('button, .bub, .opt, .sent, .card, .task, .chip, h2, h3, p, b, .line .said, .mark, .word, .titem, .outfit, .step, .unit')]
    .filter(e => e.offsetParent !== null && !e.closest('[hidden]'));
  for (const e of els){
    const r = e.getBoundingClientRect(); if (!r.width) continue;
    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible') out.push(`${where}: 글자 넘침(가로) "${e.textContent.trim().slice(0, 30)}"`);
    if (e.scrollHeight > e.clientHeight + 2 && ['hidden', 'clip'].includes(getComputedStyle(e).overflowY)) out.push(`${where}: 글자 넘침(세로) "${e.textContent.trim().slice(0, 30)}"`);
    const x = (r.left - sr.left) / k, y = (r.top - sr.top) / k, x2 = (r.right - sr.left) / k, y2 = (r.bottom - sr.top) / k;
    if (x < -1 || y < -1 || x2 > 1367 || y2 > 1025) out.push(`${where}: 무대 밖 "${e.textContent.trim().slice(0, 30)}" (${x|0},${y|0})-(${x2|0},${y2|0})`);
  }
  // 패널 안 요소가 패널 아래·오른쪽으로 밀려 잘리는지
  for (const p of stage.querySelectorAll('.panel')){
    const pr = p.getBoundingClientRect(); if (!pr.width) continue;
    for (const e of p.querySelectorAll('button, p, h2, .opt, .sent, .line, .card, .bin, .mark, .chk, .wboard, .dgrid, .titem, .outfit, .step, .unit, .task, .stampItem')){
      if (e.offsetParent === null) continue;
      const r = e.getBoundingClientRect();
      if (r.bottom > pr.bottom + 2 && getComputedStyle(p).overflowY !== 'auto') out.push(`${where}: 패널 아래로 잘림 "${e.textContent.trim().slice(0, 30)}"`);
      if (r.right > pr.right + 2) out.push(`${where}: 패널 오른쪽으로 잘림 "${e.textContent.trim().slice(0, 30)}"`);
    }
  }
  // 아래 말풍선 넘침
  const bub = stage.querySelector('.talk:not([hidden]) .bub span');
  if (bub && bub.getBoundingClientRect().height > bub.closest('.bub').getBoundingClientRect().height - 8) out.push(`${where}: 말풍선 넘침 "${bub.textContent.slice(0, 30)}"`);
  const bs = [...stage.querySelectorAll('button')].filter(b => b.offsetParent !== null).map(b => [b, b.getBoundingClientRect()]);
  for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++){
    const [a, ra] = bs[i], [b, rb] = bs[j];
    if (a.contains(b) || b.contains(a)) continue;
    const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
    if (ox > 4 && oy > 4) out.push(`${where}: 버튼 겹침 "${a.textContent.trim().slice(0, 15)}" / "${b.textContent.trim().slice(0, 15)}"`);
  }
  return out;
}

export async function layoutAudit(){
  const ctx = window.__ctx, issues = [];
  // 검사가 실제로 잡는지 먼저 확인(일부러 무대 밖에 둔 단추)
  const probe = h('button', {style: {position: 'absolute', left: '1400px', top: '10px'}}, '검사용'); document.getElementById('stage').append(probe);
  const caught = check('검사용').some(x => x.includes('무대 밖')); probe.remove();
  if (!caught) issues.push('검사 도구가 무대 밖 요소를 잡지 못함');
  for (const [id, arg] of [['home'], ['map'], ['dictation', 'u4-g1'], ['reading'], ['deco'], ['wardrobe'], ['words'], ['recall'],
                           ['wrap', {lessonId: 'u4-4', res: {item: 'u4-screen'}}], ['wrap', {lessonId: 'u4-5', res: {queued: 'u4-guestbook'}}], ['parent']]){
    ctx.go(id, arg); await sleep(250);
    issues.push(...check(id + (arg ? ' ' + JSON.stringify(arg).slice(0, 30) : '')));
  }
  const api = {check: () => 'retry', done(){}, say(){}, speak(){}, saveWriting: async () => {}};
  for (const L of Object.values(ctx.content.byId).flatMap(u => u.lessons)){
    for (const [i, step] of [...L.steps.entries(), [-1, L.reward.recall]]){
      ctx.go('lesson', L.id); await sleep(30);
      const body = document.querySelector('.act .body'); body.replaceChildren();
      KINDS[step.kind].render(body, step, api); await sleep(30);
      issues.push(...check(`${L.id} ${i < 0 ? '되새김' : i + 1 + '번'} ${step.kind}`));
    }
  }
  ctx.go('home');
  console.log(issues.length ? issues.join('\n') : '정렬 검사: 문제 0건');
  return issues;
}
window.layoutAudit = layoutAudit;
