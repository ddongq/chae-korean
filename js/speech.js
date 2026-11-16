// 읽어 주기. 한국어 목소리로 빠르기 0.8. 문장마다 소리 파일로 바꿔 끼울 수 있다(setOverride).
const overrides = new Map();
let audio = null;
export const setOverride = (text, url) => overrides.set(text, url);
export const pickVoice = voices => voices.find(v => (v.lang || '').toLowerCase().startsWith('ko')) || null;

// 아이패드 Safari는 누른 순간(손을 뗄 때의 click·touchend) 안에서 읽기를 시작해야 소리를 낸다.
// 그래서 기다림(await) 없이 바로 synth.speak를 부른다. 목소리 목록이 아직 비어 있으면 lang만 정해 기기에 맡긴다.
export function speak(text, {rate = 0.8} = {}){
  const synth = globalThis.speechSynthesis;
  if (overrides.has(text) && typeof Audio !== 'undefined'){
    stopSpeaking();
    audio = new Audio(overrides.get(text));
    const a = audio;
    return a.play().then(() => new Promise(ok => { a.onended = () => ok('ok'); a.onerror = () => ok('error'); }), () => 'error');
  }
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

export function stopSpeaking(){
  try { globalThis.speechSynthesis?.cancel(); } catch {}
  if (audio){ audio.pause(); audio = null; }
}
