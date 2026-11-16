import {h} from '../ui.js';
import {tooFast} from '../rewards.js';
// 근거 문장 누르기: 짧은 글에서 질문에 맞는 문장을 누른다. 너무 빨리 누르면 다시 읽게 한다.
export function render(root, step, api){
  const t0 = Date.now(), chars = step.passage.join('').length;
  let locked = false;
  const sents = step.passage.map((s, i) => {
    const b = h('button', {class: 'sent'}, s);
    b.onclick = () => {
      if (locked || b.disabled) return;
      if (tooFast(chars, Date.now() - t0)){ api.say('rupert_think', '앗, 조금 빨랐어. <b>한 번 더 읽어 볼까?</b>'); return; }
      const v = api.check(i === step.answer);
      if (i === step.answer){ b.classList.add('ok'); locked = true; } else { b.classList.add('no'); b.disabled = true; }
      if (v === 'reveal'){ locked = true; sents[step.answer].classList.add('ok'); }
    };
    return b;
  });
  root.append(h('div', {class: 'q'}, h('h2', {}, step.question), h('button', {class: 'spk', onclick: () => api.speak(step.passage.join(' '))}, '글 듣기')),
    h('div', {class: 'passage'}, sents));
}
