// 오늘의 책방 일(순수): 젖은 잉크 말리기 → 복습 → 받아쓰기 → 차시 → 소리 내어 읽기
import {wetToDry, dueReviews} from './rewards.js';

export function todayTasks(state, day, content){
  const out = [];
  const wet = wetToDry(state, day);
  if (wet.length) out.push({kind: 'dry', ref: wet});
  const due = dueReviews(state, day);
  if (due.length) out.push({kind: 'review', ref: due});
  const grade = content.grades.find(g => !state.dictation[g.id]);
  if (grade) out.push({kind: 'dictation', ref: grade.id});
  const lesson = content.unit.lessons.find(l => !state.lessons[l.id]);
  if (lesson) out.push({kind: 'lesson', ref: lesson.id});
  if (!state.reading[day]) out.push({kind: 'reading', ref: day});
  return out;
}
