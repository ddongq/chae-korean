// 부모님 화면: 4자리 PIN. 진행표, 도장 기다리는 것(녹음 듣기·글 보기), 복습 대기, 읽기 기록, 지금 단원, 백업.
import {h, say, hideTalk} from '../ui.js';
import {stamp, fixFutureDay} from '../rewards.js';
import {speak} from '../speech.js';
import {dayKey, isLater} from '../day.js';
import {lessonById, unitName} from '../../content/index.js';

export async function hashPin(pin){
  const data = new TextEncoder().encode('chae-korean:' + pin);
  const buf = await globalThis.crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function mount(root, ctx){
  const S = ctx.store.state;
  hideTalk();
  if (!S.pinHash) return pinPad(root, '부모님 PIN 4자리를 정해 주세요', async p1 =>
    pinPad(root, '한 번 더 눌러 주세요', async p2 => { if (p1 !== p2){ mount(root, ctx); return; } S.pinHash = await hashPin(p1); await ctx.save(); dashboard(root, ctx); }));
  pinPad(root, '부모님 PIN을 눌러 주세요', async p => { if (await hashPin(p) === S.pinHash) dashboard(root, ctx); else mount(root, ctx); });
}

function pinPad(root, title, onDone){
  let v = '';
  const dots = h('div', {class: 'pindots'}, [0, 1, 2, 3].map(() => h('i')));
  const show = () => [...dots.children].forEach((d, i) => d.classList.toggle('on', i < v.length));
  const keys = h('div', {class: 'pinkeys'}, [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '지우기'].map(k => k === '' ? h('span') :
    h('button', {class: 'pinkey', onclick: () => { if (k === '지우기') v = v.slice(0, -1); else if (v.length < 4) v += k; show(); if (v.length === 4){ const p = v; v = ''; setTimeout(() => onDone(p), 150); } }}, String(k))));
  root.replaceChildren(h('section', {class: 'panel pinbox'}, h('h2', {}, title), dots, keys));
}

async function dashboard(root, ctx){
  const S = ctx.store.state, U = ctx.content.unit;
  const media = async (id, kind) => { const b = id && await ctx.store.getBlob(id); if (!b) return h('span', {class: 'muted'}, '파일 없음');
    return kind === 'audio' ? h('audio', {controls: true, src: URL.createObjectURL(b)}) : h('img', {class: 'writing', src: URL.createObjectURL(b), alt: '아이가 쓴 글'}); };
  const pending = S.stamps.map((s, i) => ({...s, i})).filter(s => !s.done);
  const pendingEls = await Promise.all(pending.map(async s => {
    const label = s.kind === 'reading' ? `${s.ref} 소리 내어 읽기` : `${lessonById(s.ref.split('#')[0])?.title || s.ref} 글쓰기`;
    const m = s.kind === 'reading' ? await media(S.reading[s.ref]?.recBlob, 'audio') : await media(S.writings[s.ref]?.blob, 'img');
    const b = h('button', {class: 'btn leaf'}, '도장 찍기');
    b.onclick = async () => { stamp(S, s.i); await ctx.save(); dashboard(root, ctx); };
    return h('div', {class: 'stampItem'}, h('b', {}, label), m, b);
  }));
  const reviews = Object.entries(S.reviews).map(([k, r]) => {
    const text = r.kind === 'dict' ? `받아쓰기: ${r.ref.text}` : (() => { const st = lessonById(r.ref.lesson)?.steps[r.ref.step]; return `${lessonById(r.ref.lesson)?.range} · ${st?.prompt || st?.question || '대화 빈칸'}`; })();
    return h('li', {}, text, h('span', {class: 'muted'}, ` (${r.day}${r.misses ? `, 다시 틀림 ${r.misses}` : ''})`));
  });
  const readings = Object.entries(S.reading).sort().reverse().slice(0, 7).map(([d, r]) => h('li', {}, `${d} · ${r.minutes}분${r.recBlob ? ' · 녹음 있음' : ''}`));
  const unitSel = h('select', {id: 'curUnit'}, ctx.content.units.map(u => h('option', {value: u.id, selected: u.id === S.currentUnit}, `${u.label} · ${u.title}${ctx.content.byId[u.id] ? '' : ' (준비 중)'}`)));
  unitSel.onchange = async () => { S.currentUnit = unitSel.value; await ctx.save(); };
  const exportBtn = h('button', {class: 'btn'}, '백업 파일 저장');
  exportBtn.onclick = () => { const a = h('a', {href: URL.createObjectURL(new Blob([ctx.store.exportJSON()], {type: 'application/json'})), download: `가을책방-백업-${ctx.day}.json`}); document.body.append(a); a.click(); a.remove(); };
  const file = h('input', {type: 'file', accept: 'application/json', id: 'importFile'});
  const importMsg = h('span', {class: 'muted'});
  file.onchange = async () => { try { ctx.store.importJSON(await file.files[0].text()); await ctx.save(); importMsg.textContent = '불러왔어요.'; } catch (e){ importMsg.textContent = e.message || '불러오지 못했어요.'; } };
  const progress = Object.values(ctx.content.byId).map(uc => `${unitName(uc.id)} ${uc.lessons.filter(l => S.lessons[l.id]).length}/${uc.lessons.length}묶음`).join(' · ');
  root.replaceChildren(
    h('div', {class: 'bar-sub'}, h('b', {}, '부모님')),
    h('section', {class: 'panel pcol pleft'},
      S.storageOk ? null : h('p', {class: 'warn'}, '이 기기에 기록이 저장되지 않고 있어요. 사생활 보호 모드인지 확인하고, 백업 파일을 저장해 두세요.'),
      ctx.store.recovered ? h('p', {class: 'warn'}, '예전 기록의 모양이 달라 새로 시작했어요. 예전 기록은 기기 안에 따로 보관해 두었어요.') : null,
      S.lastDay && isLater(S.lastDay, dayKey(new Date())) ? h('p', {class: 'warn'}, `마지막 날짜(${S.lastDay})가 오늘보다 뒤예요. 기기 시계를 바꾼 적이 있나요? `,
        h('button', {class: 'btn', onclick: async () => { fixFutureDay(S, dayKey(new Date())); ctx.day = S.lastDay; await ctx.save(); dashboard(root, ctx); }}, '오늘로 맞추기')) : null,
      h('h2', {}, '진행'), h('p', {}, `함께 책방을 연 날 ${S.days.length}일 · ${progress} · 받아쓰기 ${Object.keys(S.dictation).length}/${ctx.content.grades.length}급 · 고양이 ${S.pet.stage}단계(낱말 ${S.pet.words.length}개)`),
      h('ul', {class: 'plist'}, U.lessons.map(l => h('li', {}, `${l.range} ${l.title}`, h('span', {class: 'muted'}, S.lessons[l.id] ? ` · ${S.lessons[l.id].day}` : ' · 아직')))),
      h('h2', {}, '다시 볼 것'), reviews.length ? h('ul', {class: 'plist'}, reviews) : h('p', {class: 'muted'}, '없어요.'),
      h('h2', {}, '소리 내어 읽기'), readings.length ? h('ul', {class: 'plist'}, readings) : h('p', {class: 'muted'}, '아직 없어요.')),
    h('section', {class: 'panel pcol pright'},
      h('h2', {}, `도장 기다리는 것 (${pending.length})`), pendingEls.length ? h('div', {class: 'stamps'}, pendingEls) : h('p', {class: 'muted'}, '없어요. 주말에 몰아서 찍어도 괜찮아요.'),
      h('h2', {}, '지금 배우는 단원'), unitSel,
      h('h2', {}, '백업'), h('div', {class: 'prow'}, exportBtn, file, importMsg),
      h('h2', {}, '목소리 확인'), voiceCheck()));
}

// 읽어 주기 진단: 한국어 목소리 수와 읽기 결과를 보여 준다(아이패드에서 소리가 안 날 때 원인 찾기)
function voiceCheck(){
  const out = h('span', {class: 'muted'});
  const btn = h('button', {class: 'btn sky'}, '목소리 들어 보기');
  btn.onclick = () => {
    const synth = globalThis.speechSynthesis;
    const vs = synth?.getVoices?.() || [];
    const ko = vs.filter(v => (v.lang || '').toLowerCase().startsWith('ko'));
    out.textContent = `읽는 중… (목소리 ${vs.length}개, 한국어 ${ko.length}개${ko.length ? ': ' + ko.map(v => v.name).slice(0, 4).join(', ') : ''})`;
    speak('안녕하세요, 채원아. 오늘도 책방에 와 줘서 고마워.').then(r => {
      const msg = {ok: '잘 읽었어요', novoice: '한국어 목소리가 없어요(설정 > 손쉬운 사용 > 읽기 및 말하기 > 음성에서 한국어 음성을 받아 주세요)', error: '읽다가 오류가 났어요', timeout: '끝 소식이 오지 않았어요(소리가 났는지 알려 주세요)'}[r] || r;
      out.textContent = `결과: ${msg} · 목소리 ${vs.length}개, 한국어 ${ko.length}개${ko.length ? ' (' + ko.map(v => v.name).slice(0, 4).join(', ') + ')' : ''}`;
    });
  };
  return h('div', {class: 'prow'}, btn, out);
}
