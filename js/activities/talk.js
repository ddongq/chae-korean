import {h} from '../ui.js';
import {optionButtons} from './common.js';
// 대화 빈칸: 상대 대사는 읽어 주고, 빈칸에 알맞은 말을 고른다
export function render(root, step, api){
  const lines = step.lines.map((l, i) => h('div', {class: 'line' + (l.who === '채원' ? ' me' : '')},
    h('span', {class: 'who'}, l.who), h('span', {class: 'said'}, i === step.blank ? l.text.replace('___', '') : l.text, i === step.blank ? h('em', {class: 'blank'}, '?') : null)));
  const other = step.lines.filter((_, i) => i !== step.blank).map(l => l.text).join(' ');
  root.append(h('div', {class: 'q'}, h('h2', {}, '빈칸에 알맞은 말을 골라 보세요.'), h('button', {class: 'spk', onclick: () => api.speak(other)}, '듣기')),
    h('div', {class: 'chat'}, lines),
    optionButtons(step.options, step.answer, {...api, check: ok => { const v = api.check(ok); if (ok || v === 'reveal') root.querySelector('.blank').replaceWith(h('b', {}, step.options[step.answer])); return v; }}));
  setTimeout(() => api.speak(other), 300);
}
