// 옷장: 받은 옷만 입힐 수 있고, 못 받은 옷은 실루엣 + 얻는 법.
import {h, say} from '../ui.js';
import {ASSETS} from '../assets.js';
const WHO = [
  {key: 'chaewon', name: '채원', face: 'img/chaewon_happy.webp', owns: id => id.startsWith('cw-') || id === 'hanbok' || id === 'stage-set'},
  {key: 'rupert', name: '루퍼드', face: 'img/rupert_hello.webp', owns: id => id.startsWith('rupert-') || id === 'stage-set'},
  {key: 'cat', name: '고양이', face: null, owns: id => id.startsWith('cat-') || id === 'stage-set'},
];
export function mount(root, ctx){
  const S = ctx.store.state;
  const render = () => {
    root.replaceChildren(h('div', {class: 'bar-sub'}, h('b', {}, '옷장')), h('div', {class: 'closet'}, WHO.map(w => {
      const wearing = S.wearing[w.key];
      const pic = w.face ? h('img', {src: w.face, alt: ''}) : h('img', {src: ASSETS.cat[S.pet.stage - 1], alt: ''});
      const list = ctx.content.units.filter(u => w.owns(u.outfit)).map(u => {
        const got = !!S.outfits[u.outfit], on = wearing === u.outfit;
        return h('button', {class: 'outfit' + (got ? '' : ' locked') + (on ? ' on' : ''), disabled: !got,
          onclick: () => { S.wearing[w.key] = on ? null : u.outfit; ctx.save(); render(); say('chaewon_happy', on ? '원래 옷으로 갈아입었어요.' : `<b>${u.outfitName}</b> 입었어요!`); }},
          h('b', {}, u.outfitName), h('span', {}, got ? (on ? '입는 중' : '입어 보기') : `${u.label === '독서' || u.label === '매체' ? u.label + ' 단원' : u.label + '단원'}을 마치면 받아요`));
      });
      const cur = ctx.content.units.find(u => u.outfit === wearing);
      return h('section', {class: 'panel person'}, h('h2', {}, w.name), h('div', {class: 'wpic'}, pic, cur ? h('span', {class: 'badge'}, cur.outfitName) : null), h('div', {class: 'olist'}, list));
    })), h('p', {class: 'closetnote'}, '옷 입은 전신 그림은 준비 중이에요. 그림이 오면 책방에 선 모습이 입은 옷으로 바뀌어요.'));
  };
  render();
  say('chaewon_happy', Object.keys(S.outfits).length ? '어떤 옷을 입어 볼까?' : '단원을 마치면 <b>새 옷</b>을 받아요!');
}
