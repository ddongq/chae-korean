// 다시 꺼내 보기: 젖은 잉크 말리기(다른 날 낱말 떠올리기)와 헷갈렸던 문제 다시 풀기.
import {h, say, josa} from '../ui.js';
import {speak} from '../speech.js';
import {dryItem, feed, reviewAnswered, wetToDry, dueReviews, markActive} from '../rewards.js';
import {lessonById, UNIT4} from '../../content/unit4.js';
import {itemPic} from './wrap.js';
import * as choose from '../activities/choose.js';
import * as fix from '../activities/fix.js';
import * as evidence from '../activities/evidence.js';
import * as talk from '../activities/talk.js';
import * as sort from '../activities/sort.js';
const KINDS = {choose, fix, evidence, talk, sort};

export function mount(root, ctx){
  const S = ctx.store.state;
  const queue = [
    ...wetToDry(S, ctx.day).map(id => ({type: 'dry', id, lesson: UNIT4.lessons.find(l => l.reward.item === id)})).filter(q => q.lesson),
    ...dueReviews(S, ctx.day).map(key => ({type: S.reviews[key].kind, key})),
  ];
  const panel = h('section', {class: 'panel act'});
  root.append(h('div', {class: 'bar-sub'}, h('b', {}, '다시 꺼내 보기')), panel);
  let i = 0;
  const next = async () => {
    await ctx.save();
    if (i >= queue.length) return done();
    const q = queue[i++];
    if (q.type === 'dict'){ return ctx.go('dictation', {review: q.key}); }
    panel.replaceChildren();
    const body = h('div', {class: 'body'});
    let step, tries = 0;
    if (q.type === 'dry'){
      step = q.lesson.reward.recall;
      panel.append(h('div', {class: 'recall-item'}, h('div', {class: 'wet small'}, itemPic(q.id)), h('b', {}, q.lesson.reward.itemName), h('span', {}, '잉크를 말리려면 맞혀 봐!')), body);
    } else {
      const r = S.reviews[q.key], L = lessonById(r.ref.lesson);
      step = L.steps[r.ref.step];
      panel.append(body);
    }
    const finishOne = ok => {
      if (q.type === 'dry'){
        if (ok){ dryItem(S, q.id, ctx.day); const f = feed(S, q.lesson.reward.words); markActive(S, ctx.day);
          say('rupert_praise', `잉크가 다 말랐어! <b>${josa(q.lesson.reward.itemName, '이', '가')}</b> 보관함에 들어갔어.${f.stageUp ? ' 고양이도 쑥 자랐어!' : ''}`);
          panel.querySelector('.wet')?.classList.add('dry'); }
        else say('rupert_comfort', `${step.why} 괜찮아, <b>내일 다시</b> 말려 보자.`);
      } else {
        const out = reviewAnswered(S, q.key, ok, ctx.day); markActive(S, ctx.day);
        if (out.feedWord) feed(S, [out.feedWord]);
        say(ok ? 'rupert_praise' : 'rupert_comfort', ok ? '이번엔 맞혔네! <b>기억해 냈어.</b>' : `${step.why} <b>다음에 또</b> 만나 보자.`);
      }
      setTimeout(next, 2200);
    };
    const api = {
      speak: t => speak(t), say,
      check(correct){
        if (correct){ finishOne(true); return 'ok'; }
        tries++;
        if (tries === 1){ say('rupert_think', '음, <b>다시 한번</b> 생각해 볼까?'); return 'retry'; }
        finishOne(false); return 'reveal';
      },
      done(firstTry){ finishOne(true); },
      saveWriting: async () => {},
    };
    say('rupert_explain', q.type === 'dry' ? '어제 만난 낱말, 기억나?' : '전에 헷갈렸던 문제야. 다시 해 볼까?');
    KINDS[step.kind].render(body, step, api);
  };
  const done = () => { say('rupert_hello', '다시 꺼내 보기 끝! <b>오늘 할 일</b>로 가 보자.'); setTimeout(() => ctx.go('home'), 1400); };
  next();
}
