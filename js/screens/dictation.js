// 받아쓰기: 듣고 원고지에 쓰고, 정답을 겹쳐 보며 어절마다 O/X를 스스로 표시. X가 있는 문장은 다른 날 다시.
import {h, say, later} from '../ui.js';
import {speak} from '../speech.js';
import {createBoard, manuscriptChars} from '../board.js';
import {addReview, reviewAnswered, markActive} from '../rewards.js';

export function mount(root, ctx, arg){
  const S = ctx.store.state;
  const review = arg && typeof arg === 'object' && arg.review ? S.reviews[arg.review] : null;
  const grade = review ? null : ctx.content.grades.find(g => g.id === arg) || ctx.content.grades.find(g => !S.dictation[g.id]);
  const list = review ? [review.ref.text] : grade.sentences;
  const marks = {};
  let i = 0;
  const head = h('section', {class: 'panel dhead'});
  const sheet = h('section', {class: 'panel sheet'});
  const btns = h('div', {class: 'dbtns'});
  root.append(h('div', {class: 'bar-sub'}, h('b', {}, review ? '받아쓰기 다시 보기' : grade.name)), head, sheet, btns);

  function show(){
    const text = list[i];
    const listen = h('button', {class: 'listen'}, '듣기');
    listen.onclick = async () => { const r = await speak(text); if (r !== 'ok') say('chaewon_think', '목소리가 안 나와요. <b>부모님께 불러 달라고</b> 해 볼까?'); };
    head.replaceChildren(listen, h('div', {}, h('h2', {}, `잘 듣고 원고지에 써 보세요`), h('p', {}, `${i + 1}번 문장 / ${list.length} · 띄어 쓰는 곳은 한 칸 비우고, 문장 끝에는 문장 부호도 써요.`)));
    const host = h('div', {class: 'dgrid'});
    const marksEl = h('div', {class: 'marks'});
    sheet.replaceChildren(host, marksEl);
    const board = createBoard(host, {w: 1242, h: 236, mode: 'manuscript', cols: 12, rows: 2, cell: 98, gap: 6, rowGap: 40});
    const words = text.split(' ');
    const clear = h('button', {class: 'btn'}, '다 지우기');
    const check = h('button', {class: 'btn go'}, '다 썼어요');
    btns.replaceChildren(clear, check);
    clear.onclick = () => board.clear();
    say('chaewon_think', '다 쓰면 정답이 칸 위에 겹쳐 나와요. 낱말마다 <b>맞았는지 내가 표시</b>해요.');
    check.onclick = () => {
      if (board.isEmpty()){ say('rupert_cheer', '먼저 <b>들어 보고</b> 써 볼까?'); return; }
      manuscriptChars(text).forEach((ch, k) => { const c = board.cells[k]; if (c && ch !== ' ') host.append(h('span', {class: 'ans', style: {left: c.x + 'px', top: c.y + 'px'}}, ch)); });
      const m = marks[i] = {};
      marksEl.replaceChildren(...words.map((w, k) => {
        const o = h('button', {class: 'o'}, 'O'), x = h('button', {class: 'x'}, 'X');
        const pick = v => { m[k] = v; o.classList.toggle('on', v === 'o'); x.classList.toggle('on', v === 'x'); ready(); };
        o.onclick = () => pick('o'); x.onclick = () => pick('x');
        return h('div', {class: 'mark'}, h('span', {}, w), o, x);
      }));
      clear.hidden = true; check.hidden = true;
      say('chaewon_think', '정답을 겹쳐 봤어요. 틀린 낱말에 <b>X</b>를 누르면 다른 날 다시 나와요.');
      const nextBtn = h('button', {class: 'btn go', disabled: true}, i < list.length - 1 ? '다음 문장' : '다 했어요');
      btns.append(nextBtn);
      function ready(){ nextBtn.disabled = Object.keys(m).length < words.length; }
      nextBtn.onclick = () => { if (i < list.length - 1){ i++; show(); } else finish(); };
    };
  }

  async function finish(){
    markActive(S, ctx.day);
    if (review){
      const allO = Object.values(marks[0]).every(v => v === 'o');
      reviewAnswered(S, arg.review, allO, ctx.day);
      say(allO ? 'rupert_praise' : 'rupert_comfort', allO ? '이번엔 다 맞았네! <b>기억해 냈어.</b>' : '괜찮아, <b>다음에 또</b> 만나 보자.');
    } else {
      S.dictation[grade.id] = {day: ctx.day, marks};
      list.forEach((t, k) => { if (Object.values(marks[k] || {}).includes('x')) addReview(S, `dict:${grade.id}#${k}`, 'dict', {grade: grade.id, i: k, text: t}, ctx.day); });
      say('rupert_praise', `<b>${grade.name}</b> 끝! 틀린 문장은 다른 날 다시 만나.`);
    }
    await ctx.save();
    later(() => ctx.go('home'), 1600);
  }
  show();
}
