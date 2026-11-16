// 글쓰기 점검표. SCHOOL은 반 글쓰기 과제 규칙(2026-11-16 주간 안내)에서.
export const SCHOOL = [
  '한 장면만 잡았나요?',
  '글에 어울리는 제목을 지었나요? (글감을 그대로 쓰지 않기)',
  '주고받은 말은 큰따옴표 안에 넣었나요?',
  '들여쓰기와 줄바꾸기를 했나요?',
];
export const U4 = [
  '웃어른께 높임 표현을 썼나요?',
  '상대의 마음을 헤아리는 말을 넣었나요?',
];
export const UM = [
  '그때의 마음을 나타내는 말을 넣었나요?',
  '내 글에 개인 정보(주소·전화번호·학교)가 들어가지 않았나요?',
];
import {UNIT0} from './unit0.js';
import {UNIT1} from './unit1.js';
import {UNIT2} from './unit2.js';
import {UNIT3} from './unit3.js';
import {UNIT5} from './unit5.js';
import {UNIT6} from './unit6.js';
export const CHECKLISTS = {school: SCHOOL, u4: U4, um: UM,
  ...Object.fromEntries([UNIT0, UNIT1, UNIT2, UNIT3, UNIT5, UNIT6].filter(u => u.checklist).map(u => [u.id, u.checklist]))};
