import {h, dragFrom} from '../ui.js';
// 끌어서 나누기: 카드를 알맞은 바구니로. 잘못 넣으면 돌아오고, 다 나누면 끝.
export function render(root, step, api){
  let wrong = 0, left = step.cards.length;
  const bins = step.bins.map((name, i) => h('div', {class: 'bin', 'data-i': i}, h('b', {}, name), h('div', {class: 'got'})));
  const deck = h('div', {class: 'deck'});
  step.cards.forEach(c => {
    const card = h('div', {class: 'card'}, c.text);
    card.addEventListener('pointerdown', e => dragFrom(e, () => h('div', {class: 'card'}, c.text), p => {
      const hit = bins.find(b => { const r = b.getBoundingClientRect(), s = root.closest('#stage').getBoundingClientRect(), k = s.width / 1366;
        const x = (r.left - s.left) / k, y = (r.top - s.top) / k; return p.x >= x && p.x <= x + r.width / k && p.y >= y && p.y <= y + r.height / k; });
      if (!hit) return;
      if (+hit.dataset.i === c.bin){ hit.querySelector('.got').append(h('span', {class: 'card done'}, c.text)); card.remove(); left--;
        if (!left) api.done(wrong === 0); }
      else { wrong++; card.classList.add('shake'); setTimeout(() => card.classList.remove('shake'), 500);
        api.say('rupert_think', `'${c.text}'는 다른 쪽이야. <b>한 번 더</b> 생각해 볼까?`); }
    }));
    deck.append(card);
  });
  root.append(h('div', {class: 'q'}, h('h2', {}, step.prompt)), deck, h('div', {class: 'bins'}, bins));
}
