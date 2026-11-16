// 날짜 키 'YYYY-MM-DD'(기기 현지 시간). 키끼리는 문자열 비교로 앞뒤를 안다.
const pad = n => String(n).padStart(2, '0');
export const dayKey = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
export const isLater = (a, b) => a > b;
// 기기 날짜가 거꾸로 가면 마지막으로 본 날을 쓴다
export const effectiveDay = (state, nowKey) => state.lastDay && isLater(state.lastDay, nowKey) ? state.lastDay : nowKey;
