// 읽어 주기. 한국어 목소리로 빠르기 0.8. 문장마다 소리 파일로 바꿔 끼울 수 있다(setOverride).
const overrides = new Map();
let audio = null;
export const setOverride = (text, url) => overrides.set(text, url);
export const pickVoice = voices => voices.find(v => (v.lang || '').toLowerCase().startsWith('ko')) || null;

function voicesReady(synth){
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise(ok => {
    const done = () => ok(synth.getVoices());
    synth.addEventListener?.('voiceschanged', done, {once: true});
    setTimeout(done, 600);
  });
}

export async function speak(text, {rate = 0.8} = {}){
  stopSpeaking();
  if (overrides.has(text) && typeof Audio !== 'undefined'){
    audio = new Audio(overrides.get(text));
    try { await audio.play(); await new Promise(ok => { audio.onended = ok; audio.onerror = ok; }); return 'ok'; }
    catch { return 'error'; }
  }
  const synth = globalThis.speechSynthesis;
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return 'novoice';
  const voices = await voicesReady(synth);
  const voice = pickVoice(voices);
  if (voices.length && !voice) return 'novoice';
  return new Promise(ok => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR'; u.rate = rate; if (voice) u.voice = voice;
    u.onend = () => ok('ok'); u.onerror = () => ok('error');
    synth.speak(u);
  });
}

export function stopSpeaking(){
  try { globalThis.speechSynthesis?.cancel(); } catch {}
  if (audio){ audio.pause(); audio = null; }
}
