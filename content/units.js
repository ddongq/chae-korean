// 국어 3-2 단원 8개 = 책방 구역 8곳 (설계 5-2)
export const UNITS = [
  {id:'u0', title:'계획대로 차근차근 읽어요', label:'독서', zone:'shelf',   zoneName:'사다리 책장',       outfit:'rupert-glasses', outfitName:'루퍼드 독서 안경'},
  {id:'u1', title:'경험과 관련지으며 이해해요', label:'1', zone:'frames',  zoneName:'둥근 창 액자 벽',   outfit:'cw-knit',        outfitName:'채원 가을 니트'},
  {id:'u2', title:'유창하게 읽고 발표해요', label:'2',    zone:'reading', zoneName:'초록 방석 낭독 자리', outfit:'cat-bowtie',     outfitName:'고양이 나비넥타이'},
  {id:'u3', title:'정확하게 글을 써요', label:'3',        zone:'board',   zoneName:'안내 게시판',       outfit:'cw-vest',        outfitName:'채원 기자 조끼'},
  {id:'um', title:'온라인 상황에서 글을 써요', label:'매체', zone:'notes', zoneName:'쪽지 벽',           outfit:'rupert-cap',     outfitName:'루퍼드 우체부 모자'},
  {id:'u4', title:'서로 존중하며 대화해요', label:'4',    zone:'tea',     zoneName:'손님 찻상',         outfit:'hanbok',         outfitName:'채원 한복'},
  {id:'u5', title:'사전으로 여는 세상', label:'5',        zone:'drawers', zoneName:'사전 서랍장',       outfit:'cw-apron',       outfitName:'채원 사서 앞치마'},
  {id:'u6', title:'감상과 표현의 즐거움', label:'6',      zone:'stage',   zoneName:'커튼 무대',         outfit:'stage-set',      outfitName:'셋이 함께 입는 무대 의상'},
];
export const unitById = id => UNITS.find(u => u.id === id);
