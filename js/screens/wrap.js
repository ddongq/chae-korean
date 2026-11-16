// 마무리: 새 소품(젖은 잉크) + 오늘 낱말을 고양이에게 먹이기. 단원 마지막이면 구역이 통째로 되살아나고 옷을 받는다.
import {h, say, dragFrom, josa, later} from '../ui.js';
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

// 고양이 밥그릇(코드 그림): 크림색 도자기, 파란 띠·발바닥 무늬, 사료와 글자 과자. 먹인 낱말의 첫 글자 과자가 쌓인다.
export function bowlSVG(letters = []){
  const cookies = letters.slice(-6).map((ch, i) => {
    const x = 78 + (i % 3) * 38 + (i > 2 ? 18 : 0), y = i > 2 ? 52 : 60, r = (i * 37) % 24 - 12;
    return `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-15" y="-12" width="30" height="24" rx="7" fill="#F2C878" stroke="#B5733A" stroke-width="1.6"/><rect x="-12" y="-9" width="24" height="18" rx="5" fill="none" stroke="#FFF1C8" stroke-width="1.2" opacity=".8"/><text x="0" y="5" text-anchor="middle" font-family="Jua, sans-serif" font-size="15" fill="#7A4A1E">${ch}</text></g>`;
  }).join('');
  const kibble = [[70,64],[92,58],[112,66],[136,57],[158,65],[178,59],[196,64],[84,70],[150,70],[122,61],[170,70],[104,70]]
    .map(([x, y], i) => i % 3 === 0
      ? `<path d="M${x} ${y + 3} c-4 -3 -5 -8 0 -8 c2 0 3 2 3 2 c0 0 1 -2 3 -2 c5 0 4 5 0 8 l-3 2 z" fill="#C98A4B" stroke="#8A5A2B" stroke-width=".8"/>`
      : `<ellipse cx="${x}" cy="${y}" rx="${5 + (i % 2)}" ry="4" fill="${i % 2 ? '#B5733A' : '#D79B5C'}" stroke="#8A5A2B" stroke-width=".8"/>`).join('');
  return `<svg class="bowlsvg" viewBox="0 0 260 160" aria-hidden="true">
    <defs>
      <linearGradient id="glaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF8EC"/><stop offset=".55" stop-color="#F6E7CF"/><stop offset="1" stop-color="#E4CDA8"/></linearGradient>
      <radialGradient id="food" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#EDC48E"/><stop offset="1" stop-color="#C99A5E"/></radialGradient>
    </defs>
    <ellipse cx="130" cy="146" rx="112" ry="11" fill="rgba(90,60,30,.18)"/>
    <path d="M80 128 Q130 142 180 128 L175 138 Q130 152 85 138 Z" fill="#D9C19A" stroke="#8A5A2B" stroke-width="2"/>
    <path d="M18 62 Q22 116 72 130 L188 130 Q238 116 242 62 Z" fill="url(#glaze)" stroke="#8A5A2B" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M24 82 Q130 102 236 82" fill="none" stroke="#6F9BC7" stroke-width="8" stroke-linecap="round"/>
    <path d="M27 93 Q130 112 233 93" fill="none" stroke="#6F9BC7" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    <g fill="#6F9BC7" opacity=".9"><ellipse cx="130" cy="117" rx="9" ry="7"/><circle cx="118" cy="107" r="3.6"/><circle cx="125" cy="102" r="3.6"/><circle cx="135" cy="102" r="3.6"/><circle cx="142" cy="107" r="3.6"/></g>
    <path d="M36 74 Q42 104 66 118" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
    <path d="M214 76 Q212 92 204 102" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>
    <ellipse cx="130" cy="62" rx="112" ry="19" fill="#FFFBF2" stroke="#8A5A2B" stroke-width="2.5"/>
    <ellipse cx="130" cy="64" rx="98" ry="13" fill="url(#food)" stroke="#B88A55" stroke-width="1.2"/>
    ${kibble}${cookies}
    <path d="M40 56 Q80 46 120 45" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>
  </svg>`;
}

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
  const eaten = [];
  const bowl = h('div', {class: 'bowl', html: bowlSVG(eaten)});
  const feedBox = h('div', {class: 'feed'}, h('div', {class: 'mat'}), cat, bowl, bub);
  const chips = h('div', {class: 'words'}, words.map(w => {
    const c = h('span', {class: 'word'}, w);
    c.addEventListener('pointerdown', e => dragFrom(e, () => h('span', {class: 'word'}, w), p => {
      const r = feedBox.getBoundingClientRect(), st = root.closest('#stage').getBoundingClientRect(), k = st.width / 1366;
      const x = (r.left - st.left) / k, y = (r.top - st.top) / k;
      if (p.x < x || p.y < y || p.x > x + r.width / k || p.y > y + r.height / k) return;
      c.classList.add('gone');
      const out = feed(S, [w]);
      eaten.push(w[0]); bowl.innerHTML = bowlSVG(eaten); bowl.classList.remove('plop'); void bowl.offsetWidth; bowl.classList.add('plop');
      cat.classList.remove('hop'); void cat.offsetWidth; cat.classList.add('hop');
      bub.hidden = false; bub.textContent = out.added ? `냠! '${w}' 맛있다` : `'${w}'는 전에 먹어 봤어. 또 먹어도 좋아!`;
      if (out.stageUp){ cat.src = ASSETS.cat[S.pet.stage - 1]; right.querySelectorAll('.stage-dots i').forEach((d, i) => d.classList.toggle('on', i < S.pet.stage)); say('rupert_surprise', `우아, 고양이가 <b>${S.pet.stage === 2 ? '꼬마 고양이' : '다 큰 고양이'}</b>로 자랐어!`); }
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
    later(() => celebrateUnit(root, ctx, unit, out), 600);
    return true;
  }
}

// 단원 마침 축하: 구역이 통째로 색을 찾고 옷을 받는다(마무리 화면, 또는 놓쳤으면 홈에서)
export function celebrateUnit(root, ctx, unit, out){
  const ov = h('div', {class: 'overlay'});
  const shop = shopView(ctx.store.state, ctx.content, {w: 1000, h: 746});
  shop.classList.add('celebrate');
  ov.append(shop, h('div', {class: 'gift'}, h('h2', {}, `${josa(unit.zoneName, '이', '가')} 되살아났어요!`),
    out.outfit ? h('p', {}, '선물: ', h('b', {}, unit.outfitName), ' — 옷장에서 입어 볼 수 있어요.') : null,
    h('button', {class: 'btn go', onclick: () => ctx.go('home')}, '책방으로')));
  root.append(ov);
  say('rupert_cheer', `해냈구나! <b>${unit.zoneName}</b>에 색이 다 돌아왔어.`);
}
