// 차시 화면: 활동을 차례로. 첫 오답은 다시 생각, 두 번째 오답은 정답과 이유 + 다른 날 복습.
import {h, say} from '../ui.js';
import {speak} from '../speech.js';
import {finishLesson, addReview, addStamp, markActive} from '../rewards.js';
import {lessonById} from '../../content/unit4.js';
import * as choose from '../activities/choose.js';
import * as fix from '../activities/fix.js';
import * as sort from '../activities/sort.js';
import * as evidence from '../activities/evidence.js';
import * as talk from '../activities/talk.js';
import * as write from '../activities/write.js';
const KINDS = {choose, fix, sort, evidence, talk, write};

export function mount(root, ctx, lessonId){
  const L = lessonById(lessonId) || ctx.content.unit.lessons.find(l => !ctx.store.state.lessons[l.id]) || ctx.content.unit.lessons[0];
  const S = ctx.store.state;
  const panel = h('section', {class: 'panel act'});
  const dots = h('div', {class: 'prog'}, L.steps.map(() => h('i')));
  root.append(h('div', {class: 'bar-sub'}, h('span', {class: 'k'}, `4단원 ${L.range}`), h('b', {}, L.title)), panel);
  let idx = 0;
  const speakSafe = async text => { const r = await speak(text); if (r === 'novoice') say('rupert_comfort', '목소리를 찾지 못했어요. 글을 <b>천천히 읽어</b> 볼까?'); };

  function next(){
    if (idx >= L.steps.length) return finish();
    const step = L.steps[idx];
    [...dots.children].forEach((d, i) => d.className = i < idx ? 'done' : i === idx ? 'on' : '');
    panel.replaceChildren(dots);
    const body = h('div', {class: 'body'}); panel.append(body);
    let tries = 0;
    const advance = () => { idx++; setTimeout(next, 1100); };
    const api = {
      speak: speakSafe,
      say,
      check(correct){
        if (correct){ say('rupert_praise', tries ? '맞아! <b>고쳐서 찾았네.</b>' : '맞아! <b>잘 찾았어.</b>'); advance(); return 'ok'; }
        tries++;
        if (tries === 1){ say('rupert_think', '음, <b>다시 한번</b> 생각해 볼까?'); return 'retry'; }
        say('rupert_comfort', `정답은 이거야. ${step.why} <b>다른 날 다시</b> 만나 보자.`);
        addReview(S, `${L.id}#${idx}`, 'quiz', {lesson: L.id, step: idx, word: L.reward.words[0]}, ctx.day);
        idx++; setTimeout(next, 3200);
        return 'reveal';
      },
      done(firstTry){ say('rupert_praise', firstTry ? '다 했어! <b>훌륭해.</b>' : '끝까지 해냈어! <b>멋져.</b>'); advance(); },
      async saveWriting(blob, checks){
        const id = await ctx.store.putBlob(blob);
        S.writings[`${L.id}#${idx}`] = {day: ctx.day, blob: id, checks};
        addStamp(S, 'writing', `${L.id}#${idx}`, ctx.day);
        await ctx.save();
      },
    };
    say('rupert_explain', idx === 0 ? `오늘은 <b>${L.title}</b>. 하나씩 해 보자.` : '다음 문제야.');
    KINDS[step.kind].render(body, step, api);
  }

  async function finish(){
    markActive(S, ctx.day);
    const res = finishLesson(S, L, ctx.day);
    await ctx.save();
    ctx.go('wrap', {lessonId: L.id, res});
  }
  next();
}
