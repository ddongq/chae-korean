import {h} from '../ui.js';
// 고르기 버튼 묶음: 누르면 api.check(정답?)를 부르고, 결과에 따라 표시
export function optionButtons(options, answer, api, cls = 'opt'){
  const wrap = h('div', {class: 'opts'});
  let locked = false;
  options.forEach((text, i) => {
    const b = h('button', {class: cls}, text);
    b.onclick = () => {
      if (locked || b.disabled) return;
      const v = api.check(i === answer);
      if (i === answer){ b.classList.add('ok'); locked = true; }
      else { b.classList.add('no'); b.disabled = true; }
      if (v === 'reveal'){ locked = true; wrap.children[answer].classList.add('ok'); }
    };
    wrap.append(b);
  });
  return wrap;
}
export const speakBtn = (text, api) => h('button', {class: 'spk', 'aria-label': '듣기', onclick: () => api.speak(text)}, '듣기');
