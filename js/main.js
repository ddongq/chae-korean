// 진입점: 날짜 정하기, 저장소 열기, 화면 고르기
import {initStage, setScreens, showScreen, $} from './ui.js';

const q = new URLSearchParams(location.search);
export const params = {day: q.get('day'), seed: q.get('seed'), audit: q.has('audit')};

async function boot(){
  initStage($('#stage'));
  const ctx = {store: null, day: params.day, go: (id, arg) => showScreen(id, arg)};
  setScreens({}, ctx);
  $('#barDate').textContent = '';
}
boot();
