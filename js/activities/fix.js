import {h} from '../ui.js';
import {optionButtons} from './common.js';
// 잘못된 높임 고치기: 틀린 조각을 빈칸으로 보여 주고 바꿀 말을 고른다
export function render(root, step, api){
  const line = h('p', {class: 'sentence'}, ...step.tokens.map((t, i) => i === step.wrong
    ? h('span', {class: 'slotw'}, h('s', {}, t)) : h('span', {}, t)).flatMap((n, i) => i ? [' ', n] : [n]));
  root.append(h('div', {class: 'q'}, h('h2', {}, '어색한 말을 바르게 고쳐 보세요.')), line,
    optionButtons(step.choices, step.answer, {...api, check: ok => { const v = api.check(ok); if (ok || v === 'reveal'){ line.querySelector('.slotw').replaceChildren(h('b', {}, step.choices[step.answer])); } return v; }}));
}
