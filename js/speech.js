// 읽어 주기. 미리 만든 소리 파일(구글 Chirp 3 HD Aoede, tools/build-audio.sh)이 있으면 그 파일을,
// 없으면 기기 목소리(한국어, 빠르기 0.8)를 쓴다. setOverride로 문장마다 다른 파일을 끼울 수도 있다.
import {AUDIO} from '../audio/manifest.js';
const overrides = new Map();
let audio = null;      // 지금 재생 중인 소리 파일(멈추기용)
let player = null;     // 아이패드에서 첫 터치로 잠금을 푼 뒤 계속 쓰는 재생기 하나
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
const getPlayer = () => { if (!player && typeof Audio !== 'undefined'){ player = new Audio(); player.preload = 'auto'; } return player; };
export const setOverride = (text, url) => overrides.set(text, url);
export const pickVoice = voices => voices.find(v => (v.lang || '').toLowerCase().startsWith('ko')) || null;

// 아이패드 Safari는 누른 순간(손을 뗄 때의 click·touchend) 안에서 읽기를 시작해야 소리를 낸다.
// 그래서 기다림(await) 없이 바로 synth.speak를 부른다. 목소리 목록이 아직 비어 있으면 lang만 정해 기기에 맡긴다.
export function speak(text, {rate = 0.8} = {}){
  const synth = globalThis.speechSynthesis;
  const file = overrides.get(text) || AUDIO[text];
  const p = file && getPlayer();
  if (p){
    try { if (synth && (synth.speaking || synth.pending)) synth.cancel(); } catch {}
    p.pause(); p.muted = false; p.src = file; audio = p;   // 잠금 풀기용 무음 재생과 겹쳐도 진짜 소리는 켠다
    // 누른 순간 안에서 바로 play(). 막히면(잠금 전) 기기 목소리로 한 번 더 해 본다
    return p.play().then(() => new Promise(ok => { p.onended = () => ok('ok'); p.onerror = () => ok('error'); }),
                         () => file === overrides.get(text) ? 'error' : speakDevice(text, rate));
  }
  return speakDevice(text, rate);
}

function speakDevice(text, rate){
  const synth = globalThis.speechSynthesis;
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return Promise.resolve('novoice');
  const voices = synth.getVoices() || [];
  const voice = pickVoice(voices);
  if (voices.length && !voice) return Promise.resolve('novoice');
  if (audio){ audio.pause(); audio = null; }
  // 읽고 있을 때만 멈춘다(멈추기 바로 뒤의 읽기가 버려지는 WebKit 버그 피하기)
  if (synth.speaking || synth.pending){ try { synth.cancel(); } catch {} }
  return new Promise(ok => {
    let settled = false;
    const end = r => { if (!settled){ settled = true; clearTimeout(t); ok(r); } };
    // 끝 소식이 오지 않는 WebKit 버그 대비: 글 길이에 맞춘 시간이 지나면 timeout
    const t = setTimeout(() => end('timeout'), Math.max(6000, text.length * 350 / rate));
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR'; u.rate = rate; if (voice) u.voice = voice;
    u.onend = () => end('ok'); u.onerror = () => end('error');
    try { synth.speak(u); } catch { end('error'); }
  });
}

// 첫 터치에 한 번: 소리 없는 읽기로 잠금을 풀어 두면, 그 뒤 화면이 스스로 읽는 대사(대화 빈칸)도 소리가 난다
let unlocked = false;
export function unlockSpeech(){
  if (unlocked) return;
  const synth = globalThis.speechSynthesis;
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return;
  unlocked = true;
  try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'ko-KR'; synth.speak(u); } catch {}
}
// 소리 파일 재생기도 첫 터치 때 소리 없는 파일을 한 번 재생해 잠금을 푼다
let playerUnlocked = false;
export function unlockAudio(){
  if (playerUnlocked) return;
  const p = getPlayer(); if (!p) return;
  playerUnlocked = true;
  try { p.muted = true; p.src = SILENT; const r = p.play(); if (r && r.then) r.then(() => { if (p.src === SILENT) p.pause(); p.muted = false; }, () => { p.muted = false; playerUnlocked = false; }); } catch { p.muted = false; }
}

export function stopSpeaking(){
  try { globalThis.speechSynthesis?.cancel(); } catch {}
  if (audio){ audio.pause(); audio = null; }
}
