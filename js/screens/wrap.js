// 마무리: 새 소품(젖은 잉크) + 오늘 낱말을 고양이에게 먹이기. 단원 마지막이면 구역이 통째로 되살아나고 옷을 받는다.
import {h, say, dragFrom, josa} from '../ui.js';
import {feed, finishUnit} from '../rewards.js';
import {ASSETS} from '../assets.js';
import {lessonById} from '../../content/unit4.js';
import {unitById} from '../../content/units.js';
import {shopView} from './home.js';

export function itemPic(id, cls = ''){
  const a = ASSETS.items[id];
  return a?.src ? h('img', {class: 'pic ' + cls, src: a.src, alt: ''}) : h('div', {class: 'pic ghostpic ' + cls}, '그림 준비 중');
}
export const catImg = S => h('img', {class: 'feedcat', src: ASSETS.cat[S.pet.stage - 1], alt: '책방 고양이'});

export function mount(root, ctx, arg = {}){
  const S = ctx.store.state, L = lessonById(arg.lessonId) || ctx.content.unit.lessons[0], res = arg.res || {};
  const name = L.reward.itemName, words = L.reward.words;
  const left = h('section', {class: 'panel wrapL'});
  if (res.item){
    left.append(h('h2', {}, '새 소품이 생겼어요'), h('div', {class: 'wet'}, itemPic(res.item), h('span', {class: 'drop', style: {left: '46%', top: '58%'}}), h('span', {class: 'drop', style: {left: '58%', top: '50%', animationDelay: '.9s'}})),
      h('h3', {}, name, h('span', {class: 'wetlabel'}, ' · 젖은 잉크')),
      h('p', {}, '아직 잉크가 젖어 있어요. ', h('b', {}, `내일 '${words.join('·')}'를 다시 떠올리면`), ' 잉크가 말라 책방에 놓을 수 있어요. 오늘 못 와도 그대로 기다려요.'));
  } else if (res.queued){
    left.append(h('h2', {}, '오늘은 소품이 가득 찼어요'), h('div', {class: 'wet dim'}, itemPic(res.queued)), h('p', {}, `${josa(name, '은', '는')} `, h('b', {}, '내일 책방에 와 있을'), ' 거예요.'));
  } else {
    left.append(h('h2', {}, '다시 해 봤구나!'), h('div', {class: 'wet dry'}, itemPic(L.reward.item)), h('p', {}, '이미 되살린 차시라 새 소품은 없지만, ', h('b', {}, '낱말이 더 또렷해졌어요.')));
  }
  // 고양이 먹이기
  const cat = catImg(S);
  const bub = h('div', {class: 'pbub', hidden: true});
  const feedBox = h('div', {class: 'feed'}, h('div', {class: 'bowl'}), cat, bub);
  const chips = h('div', {class: 'words'}, words.map(w => {
    const c = h('span', {class: 'word'}, w);
    c.addEventListener('pointerdown', e => dragFrom(e, () => h('span', {class: 'word'}, w), p => {
      const r = feedBox.getBoundingClientRect(), st = root.closest('#stage').getBoundingClientRect(), k = st.width / 1366;
      const x = (r.left - st.left) / k, y = (r.top - st.top) / k;
      if (p.x < x || p.y < y || p.x > x + r.width / k || p.y > y + r.height / k) return;
      c.classList.add('gone');
      const out = feed(S, [w]);
      cat.classList.remove('hop'); void cat.offsetWidth; cat.classList.add('hop');
      bub.hidden = false; bub.textContent = out.added ? `냠! '${w}' 맛있다` : `'${w}'는 전에 먹어 봤어. 또 먹어도 좋아!`;
      if (out.stageUp){ cat.src = ASSETS.cat[S.pet.stage - 1]; say('rupert_surprise', `우아, 고양이가 <b>${S.pet.stage === 2 ? '꼬마 고양이' : '다 큰 고양이'}</b>로 자랐어!`); }
      if ([...chips.children].every(x => x.classList.contains('gone'))) after();
      ctx.save();
    }));
    return c;
  }));
  const right = h('section', {class: 'panel wrapR'}, h('h2', {}, '오늘 배운 낱말을 먹여 주세요'), chips, feedBox,
    h('div', {class: 'stage-dots'}, ['아기', '꼬마', '다 큰'].map((t, i) => h('span', {}, h('i', {class: i < S.pet.stage ? 'on' : ''}), t))));
  let celebrated = false;
  const leave = to => { if (!celebrated && after()) return; ctx.go(to); };
  const btns = h('div', {class: 'wbtns'}, h('button', {class: 'btn', onclick: () => leave('home')}, '책방으로'), h('button', {class: 'btn leaf', onclick: () => leave('deco')}, '꾸미러 가기'));
  root.append(h('div', {class: 'bar-sub'}, h('b', {}, '오늘의 마무리')), left, right, btns);
  say('chaewon_proud', res.repeat ? '한 번 더 했어! <b>복습</b>도 멋져.' : '오늘은 <b>끝까지</b> 했어! 낱말을 고양이에게 줘 볼까?');

  // 단원의 모든 차시를 마쳤으면 구역을 되살리고 축하 장면을 띄운다(한 번만). 띄웠으면 true.
  function after(){
    const U = ctx.content.unit;
    if (celebrated || !U.lessons.every(l => S.lessons[l.id])) return false;
    const unit = unitById(U.id), out = finishUnit(S, unit, ctx.day);
    if (out.repeat) return false;
    celebrated = true;
    ctx.save();
    setTimeout(() => celebrate(unit, out), 600);
    return true;
  }
  function celebrate(unit, out){
    const ov = h('div', {class: 'overlay'});
    const shop = shopView(S, ctx.content, {w: 1000, h: 746});
    shop.classList.add('celebrate');
    ov.append(shop, h('div', {class: 'gift'}, h('h2', {}, `${josa(unit.zoneName, '이', '가')} 되살아났어요!`),
      out.outfit ? h('p', {}, '선물: ', h('b', {}, unit.outfitName), ' — 옷장에서 입어 볼 수 있어요.') : null,
      h('button', {class: 'btn go', onclick: () => ctx.go('home')}, '책방으로')));
    root.append(ov);
    say('rupert_cheer', `해냈구나! <b>${unit.zoneName}</b>에 색이 다 돌아왔어.`);
  }
}
