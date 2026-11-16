// 단원 지도: 구역 8곳과 지금 단원의 차시 길
import {h, say} from '../ui.js';
export function mount(root, ctx){
  const S = ctx.store.state, U = ctx.content.unit;
  const state = u => S.units[u.id] ? '되살림' : u.id === U.id ? '진행 중' : u.id === S.currentUnit ? '진행 중' : ['u0','u1','u2','u3'].includes(u.id) ? '곧 열려요' : '아직';
  root.append(
    h('section', {class: 'panel units'}, h('h2', {}, '책방 구역 8곳'), ctx.content.units.map(u =>
      h('div', {class: 'unit' + (u.id === U.id ? ' now' : '')}, h('div', {}, h('b', {}, `${u.label} · ${u.title}`), h('small', {}, u.zoneName)), h('span', {class: 'st'}, state(u))))),
    h('section', {class: 'panel path'}, h('h2', {}, `4단원 · ${U.title}`), h('div', {class: 'steps'}, U.lessons.map((l, i) => {
      const done = S.lessons[l.id], next = !done && U.lessons.slice(0, i).every(x => S.lessons[x.id]);
      return h('button', {class: 'step' + (done ? ' done' : next ? ' today' : ''), onclick: () => ctx.go('lesson', l.id)},
        h('span', {class: 'k'}, `${l.range}${done ? ' · 다 함' : next ? ' · 다음' : ''}`), h('b', {}, l.title),
        h('span', {class: 'r'}, done ? '되살아난 것 ' : '되살아날 것 ', h('i', {}, l.reward.itemName)));
    })), h('p', {class: 'note'}, '4단원을 다 마치면 손님 찻상이 통째로 되살아나고 ', h('b', {}, '채원 한복'), '을 받아요. 독서·1·2·3단원은 짧은 복습으로 곧 열려요.')));
  say('rupert_explain', '단원 하나를 끝까지 하면 그 구역이 <b>통째로</b> 되살아나. 아무 차시나 눌러서 다시 해 볼 수도 있어.');
}
