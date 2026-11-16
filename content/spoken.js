// 앱이 소리 내어 읽는 모든 글(미리 만든 소리 파일 목록과 맞춰 본다). speak()에 넘기는 글과 똑같아야 한다.
import {UNIT_CONTENT} from './index.js';
import {GRADES} from './dictation.js';
export const VOICE_TEST = '안녕하세요, 채원아. 오늘도 책방에 와 줘서 고마워.';
export function spokenTexts(){
  const t = new Set([VOICE_TEST]);
  GRADES.forEach(g => g.sentences.forEach(s => t.add(s)));
  for (const L of Object.values(UNIT_CONTENT).flatMap(u => u.lessons)){
    for (const s of [...L.steps, L.reward.recall]){
      if (s.kind === 'choose') t.add(s.say || s.prompt);
      if (s.kind === 'talk') t.add(s.lines.filter((_, i) => i !== s.blank).map(l => l.text).join(' '));
      if (s.kind === 'evidence') t.add(s.passage.join(' '));
    }
    L.reward.words.forEach(w => t.add(w));
  }
  return [...t];
}
