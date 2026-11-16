// 단원 지도: 구역 8곳(내용이 있는 단원은 눌러서 고름)과 고른 단원의 차시 길
import {h, say, josa} from '../ui.js';
import {unitName} from '../../content/index.js';
export function mount(root, ctx, pick){
  const S = ctx.store.state, active = ctx.content.unit;
  let sel = ctx.content.byId[pick] || active;
  const status = u => S.units[u.id] ? '되살림' : ctx.content.byId[u.id] ? (u.id === active.id ? '지금 단원' : '열림') : '곧 열려요';
  const render = () => {
    const meta = ctx.content.units.find(u => u.id === sel.id);
    root.replaceChildren(
      h('section', {class: 'panel units'}, h('h2', {}, '책방 구역 8곳'), ctx.content.units.map(u => {
        const open = !!ctx.content.byId[u.id];
        return h('button', {class: 'unit' + (u.id === sel.id ? ' now' : '') + (open ? '' : ' locked'), disabled: !open, onclick: () => { sel = ctx.content.byId[u.id]; render(); }},
          h('div', {}, h('b', {}, `${u.label} · ${u.title}`), h('small', {}, u.zoneName)), h('span', {class: 'st'}, status(u)));
      })),
      h('section', {class: 'panel path'}, h('h2', {}, `${unitName(sel.id)} · ${meta.title}`), h('div', {class: 'steps'}, sel.lessons.map((l, i) => {
        const done = S.lessons[l.id], next = !done && sel.lessons.slice(0, i).every(x => S.lessons[x.id]);
        return h('button', {class: 'step' + (done ? ' done' : next ? ' today' : ''), onclick: () => ctx.go('lesson', l.id)},
          h('span', {class: 'k'}, `${l.range}${done ? ' · 다 함' : next ? ' · 다음' : ''}`), h('b', {}, l.title),
          h('span', {class: 'r'}, done ? '되살아난 것 ' : '되살아날 것 ', h('i', {}, l.reward.itemName)));
      })), h('p', {class: 'note'}, `${josa(unitName(sel.id), '을', '를')} 다 마치면 ${josa(meta.zoneName, '이', '가')} 통째로 되살아나고 `,
        h('b', {}, josa(meta.outfitName, '을', '를')), ' 받아요.')));
  };
  render();
  say('rupert_explain', '단원을 골라 차시를 눌러 봐. 끝까지 하면 그 구역이 <b>통째로</b> 되살아나.');
}
