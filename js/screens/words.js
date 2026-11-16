// 낱말 서랍: 단원별로 되살린 소품과 그 낱말, 고양이가 먹은 낱말. 누르면 읽어 준다.
import {h, say} from '../ui.js';
import {speak} from '../speech.js';
import {itemPic} from './wrap.js';
import {unitName} from '../../content/index.js';
export function mount(root, ctx){
  const S = ctx.store.state;
  const sections = Object.values(ctx.content.byId).map(U => {
    const rows = U.lessons.filter(l => S.lessons[l.id]).map(l => h('div', {class: 'wrow2'},
      h('div', {class: 'wthumb' + (S.items[l.reward.item]?.state === 'wet' ? ' wetthumb' : '')}, itemPic(l.reward.item)),
      h('div', {}, h('b', {}, l.reward.itemName), h('div', {class: 'wchips'}, l.reward.words.map(w => h('button', {class: 'wchip' + (S.pet.words.includes(w) ? ' eaten' : ''), onclick: () => speak(w)}, w))))));
    return rows.length ? [h('h2', {}, `${unitName(U.id)} · ${ctx.content.units.find(u => u.id === U.id).title}`), ...rows] : [];
  }).flat();
  root.append(h('div', {class: 'bar-sub'}, h('b', {}, '낱말 서랍')),
    h('section', {class: 'panel wordbox'}, ...(sections.length ? sections : [h('p', {class: 'empty'}, '차시를 마치면 낱말이 여기에 모여요.')]),
      h('p', {class: 'eatnote'}, '초록 테두리 낱말은 고양이가 먹은 낱말이에요. 지금까지 ', h('b', {}, `${S.pet.words.length}개`), '를 먹었어요.')));
  say('rupert_explain', '낱말을 누르면 <b>읽어 줄게.</b>');
}
