// 받아쓰기 급수 — 4단원 높임말·맞춤법 포인트로 새로 쓴 문장(교과서 문장 아님).
// 반 급수표를 받으면 이 파일을 바꾼다.
import {UNIT0} from './unit0.js';
import {UNIT1} from './unit1.js';
import {UNIT2} from './unit2.js';
import {UNIT3} from './unit3.js';
import {UNIT5} from './unit5.js';
import {UNIT6} from './unit6.js';

const OWN = [
  {id:'u4-g1', unit:'u4', name:'4단원 1급', sentences:[
    '할머니께서 진지를 드세요.',
    '선생님께 편지를 드렸어요.',
    '할아버지께서 주무십니다.',
    '아버지 생신을 축하드려요.',
    '삼촌 댁에 놀러 갈게요.',
  ]},
  {id:'u4-g2', unit:'u4', name:'4단원 2급', sentences:[
    '선생님께 여쭤볼 게 있어요.',
    '할머니, 안녕히 주무세요.',
    '친구 말을 끝까지 들어요.',
    '도서관에서는 조용히 해요.',
    '손님, 어서 오세요!',
  ]},
  // 매체 단원은 공개 급수표에 없어서 단원 낱말·띄어쓰기로 새로 씀
  {id:'um-g1', unit:'um', name:'매체 단원 1급', sentences:[
    '친구 사진은 허락받고 올려요.',
    '개인 정보는 소중하게 지켜요.',
    '전화번호를 알려 주면 안 돼요.',
    '댓글을 읽고 글을 고쳐 썼어요.',
    '내 주소는 올리지 않을게요.',
  ]},
];
// 새 단원은 단원 파일 안에 grades를 둔다. 교과서 순서로 모은다.
const ORDER = ['u0', 'u1', 'u2', 'u3', 'um', 'u4', 'u5', 'u6'];
export const GRADES = [...[UNIT0, UNIT1, UNIT2, UNIT3, UNIT5, UNIT6].flatMap(u => u.grades || []), ...OWN]
  .sort((a, b) => ORDER.indexOf(a.unit) - ORDER.indexOf(b.unit));
