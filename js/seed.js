// 시연 상태(?seed=demo): 차시 3개 끝, 소품 2개 마름·1개 젖음, 고양이 12낱말, 방석 하나 놓음
const prev = (day, n) => { const d = new Date(day + 'T12:00:00'); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
export function seedDemo(S, day){
  S.days = [prev(day, 3), prev(day, 2), prev(day, 1)];
  S.lastDay = prev(day, 1);
  S.lessons = {'u4-1': {day: prev(day, 3)}, 'u4-2': {day: prev(day, 2)}, 'u4-3': {day: prev(day, 1)}};
  S.items = {'u4-cushions': {state: 'dry', day: prev(day, 3), unit: 'u4'}, 'u4-teacart': {state: 'dry', day: prev(day, 2), unit: 'u4'}, 'u4-vase': {state: 'wet', day: prev(day, 1), unit: 'u4'}};
  S.pet.words = ['존중','대화','웃어른','높임 표현','께서','께','드리다','진지','계시다','여쭙다','연세','말씀'];
  S.placed = [{itemId: 'u4-cushions', floor: 'g', a: 2, b: 6}];
  S.dictation = {'u4-g1': {day: prev(day, 2), marks: {}}};
  S.reviews = {'u4-2#1': {kind: 'quiz', ref: {lesson: 'u4-2', step: 1, word: '웃어른'}, day: prev(day, 2), misses: 0}};
}
