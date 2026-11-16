import {h} from '../ui.js';
import {optionButtons, speakBtn} from './common.js';
export function render(root, step, api){
  root.append(h('div', {class: 'q'}, h('h2', {}, step.prompt), speakBtn(step.say || step.prompt, api)),
              optionButtons(step.options, step.answer, api));
}
