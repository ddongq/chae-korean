// 녹음. 읽어 주기가 끝난 뒤에만 시작한다(iOS 27: 읽어 주기 중 마이크가 무음이 되는 버그).
import {stopSpeaking} from './speech.js';
export function pickMime(isSupported){
  for (const t of ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm']) if (isSupported(t)) return t;
  return '';
}
export async function startRecording(){
  stopSpeaking();
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('녹음을 쓸 수 없어요');
  const stream = await navigator.mediaDevices.getUserMedia({audio: true});
  const mimeType = pickMime(t => MediaRecorder.isTypeSupported(t));
  const rec = new MediaRecorder(stream, mimeType ? {mimeType} : undefined);
  const chunks = [];
  rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  rec.start();
  return {
    stop: () => new Promise(ok => {
      rec.onstop = () => { stream.getTracks().forEach(t => t.stop()); ok(new Blob(chunks, {type: rec.mimeType || mimeType || 'audio/mp4'})); };
      rec.stop();
    }),
    cancel(){ try { rec.stop(); } catch {} stream.getTracks().forEach(t => t.stop()); },
  };
}
