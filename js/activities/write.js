import {h} from '../ui.js';
import {createBoard} from '../board.js';
import {CHECKLISTS} from '../../content/checklists.js';
// 펜으로 쓰기 + 스스로 점검. 앱은 글자를 읽지 않는다.
export function render(root, step, api){
  const host = h('div', {class: 'wboard'});
  const checks = CHECKLISTS[step.checklist].map(t => h('label', {class: 'chk'}, h('input', {type: 'checkbox'}), h('span', {}, t)));
  const done = h('button', {class: 'btn go'}, '다 썼어요');
  root.append(h('div', {class: 'q'}, h('h2', {}, step.prompt)), h('div', {class: 'wrow'}, host, h('div', {class: 'checks'}, h('b', {}, '스스로 점검'), checks, done)));
  const board = createBoard(host, {w: 900, h: 560, mode: 'manuscript', cols: 9, rows: 5, cell: 94, gap: 6, rowGap: 22, indentFirst: step.checklist === 'school'});
  done.onclick = async () => {
    if (board.strokes() < step.minStrokes){ api.say('rupert_cheer', '조금만 <b>더 써 볼까?</b> 천천히 써도 괜찮아.'); return; }
    if (!checks.every(c => c.querySelector('input').checked)){ api.say('rupert_focus', '점검표를 하나씩 확인하고 <b>표시</b>해 줘.'); return; }
    done.disabled = true;
    await api.saveWriting(await board.toBlob(), checks.map(c => c.querySelector('input').checked));
    api.done(true);
  };
}
