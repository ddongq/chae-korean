// 매일 소리 내어 읽기 10분(학교 매일 과제). 책 제목을 펜으로 쓰고, 읽은 시간을 고르고, 녹음은 고르기.
// 보상은 시간과 상관없이 같다(소품·먹이 없음, 고양이가 들어 준다).
import {h, say} from '../ui.js';
import {createBoard} from '../board.js';
import {startRecording} from '../recorder.js';
import {addStamp, markActive} from '../rewards.js';
import {ASSETS} from '../assets.js';

export function mount(root, ctx){
  const S = ctx.store.state, today = S.reading[ctx.day];
  const left = h('section', {class: 'panel readL'});
  const right = h('section', {class: 'panel readR'}, h('img', {class: 'listencat', src: ASSETS.cat[S.pet.stage - 1], alt: '듣고 있는 고양이'}));
  root.append(h('div', {class: 'bar-sub'}, h('b', {}, '소리 내어 읽기')), left, right);
  if (today){
    left.append(h('h2', {}, '오늘은 벌써 읽었어요!'), h('p', {class: 'rnote'}, `${today.minutes}분 읽었어요. 내일 또 들려줘.`));
    say('rupert_praise', '오늘 읽은 책, <b>고양이가 잘 들었대.</b>'); return;
  }
  const host = h('div', {class: 'titleboard'});
  let minutes = 0, rec = null, recBlob = null;
  const mins = h('div', {class: 'mins'}, [10, 15, 20].map(m => h('button', {class: 'minbtn', onclick: e => { minutes = m; [...mins.children].forEach(b => b.classList.toggle('on', b === e.currentTarget)); }}, m === 20 ? '20분 넘게' : `${m}분`)));
  const recBtn = h('button', {class: 'btn sky'}, '녹음하며 읽기');
  const recState = h('span', {class: 'recstate'}, '녹음은 해도 되고 안 해도 돼요.');
  recBtn.onclick = async () => {
    if (rec){ recBlob = await rec.stop(); rec = null; recBtn.textContent = '다시 녹음하기'; recState.textContent = '녹음했어요. 부모님이 들어 보실 수 있어요.';
      const a = h('audio', {controls: true, src: URL.createObjectURL(recBlob)}); recState.after(a); return; }
    try { rec = await startRecording(); recBtn.textContent = '녹음 멈추기'; recState.textContent = '녹음 중이에요… 천천히 읽어 봐요.'; }
    catch { recState.textContent = '마이크를 쓸 수 없어요. 녹음 없이 읽어도 괜찮아요.'; recBtn.disabled = true; }
  };
  const done = h('button', {class: 'btn go'}, '다 읽었어요');
  left.append(h('h2', {}, '오늘 읽은 책 제목을 써 주세요'), host,
    h('h3', {}, '얼마나 읽었나요?'), mins, h('div', {class: 'recrow'}, recBtn, recState), done);
  const board = createBoard(host, {w: 760, h: 150, mode: 'free'});
  done.onclick = async () => {
    if (board.isEmpty()){ say('rupert_focus', '책 제목을 먼저 <b>써 줄래?</b>'); return; }
    if (!minutes){ say('rupert_focus', '몇 분 읽었는지 <b>골라 줘.</b>'); return; }
    if (rec){ recBlob = await rec.stop(); rec = null; }
    done.disabled = true;
    const titleBlob = await ctx.store.putBlob(await board.toBlob());
    const recId = recBlob ? await ctx.store.putBlob(recBlob) : null;
    S.reading[ctx.day] = {titleBlob, minutes, recBlob: recId};
    if (recId) addStamp(S, 'reading', ctx.day, ctx.day);
    markActive(S, ctx.day);
    await ctx.save();
    right.querySelector('.listencat').classList.add('hop');
    say('rupert_praise', '고양이가 끝까지 들었어. <b>들려줘서 고마워!</b>');
    setTimeout(() => ctx.go('home'), 2200);
  };
  say('rupert_explain', '책을 <b>소리 내어</b> 읽어 봐. 고양이가 옆에서 들을게.');
}
