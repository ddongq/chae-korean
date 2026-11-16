// 그림 목록 — 새 그림이 오면 이 파일만 바꾼다.
// 좌표는 책방 그림을 가로 1400으로 줄인 기준(세로 1045).
export const REF_W = 1400, REF_H = 1045;
export const ASSETS = {
  // 빈 책방(그림 요청 04): 고정 가구만 있는 칠한 판·옅은 판. faded가 null이면 CSS 흑백으로 대신
  shop: {alive: 'img/shop_empty_alive.jpg', faded: 'img/shop_empty_faded.jpg'},
  // 구역 중심과 반지름(기준 좌표). 되살아날 때 이 둘레가 칠한 판으로 바뀐다.
  zones: {
    u0: {x: 321, y: 600, rx: 195, ry: 221},
    u1: {x: 449, y: 216, rx: 195, ry: 156},
    u2: {x: 210, y: 728, rx: 143, ry: 143},
    u3: {x: 824, y: 188, rx: 143, ry: 143},
    um: {x: 1072, y: 252, rx: 169, ry: 143},
    u4: {x: 962, y: 656, rx: 169, ry: 130},
    u5: {x: 596, y: 600, rx: 169, ry: 182},
    u6: {x: 1182, y: 656, rx: 156, ry: 195},
  },
  // 1층 마루 꼭짓점: 그림 세션이 잰 2336px 좌표를, 집이 크게 보이게 (250,100)-(2050,1444)로 자른 판 기준 1400폭으로 환산
  grid: {g: {F: {x: 710.9, y: 1009.6}, L: {x: 108.9, y: 759.9}, R: {x: 1330.8, y: 765.3}, N: 10}},
  // 소품(대역). src가 없으면 이름 실루엣.
  items: {
    'u4-cushions': {src: 'img/item_cushion.png', h: 64}, 'u4-teacart': {src: 'img/item_teatable.png', h: 74},
    'u4-vase': {src: null, h: 90}, 'u4-screen': {src: null, h: 90}, 'u4-guestbook': {src: null, h: 80},
    'u4-umbrella': {src: null, h: 80}, 'u4-lantern': {src: 'img/item_lamp.png', h: 90}, 'u4-plant': {src: 'img/item_plant.png', h: 80},
    'u4-bell': {src: null, h: 80},
    'um-postbox': {src: null, h: 90}, 'um-easel': {src: null, h: 90}, 'um-postcards': {src: null, h: 90},
    'um-mobile': {src: null, h: 100}, 'um-cart': {src: null, h: 80},
  },
  cat: ['img/cat_1.png', 'img/cat_2.png', 'img/cat_3.png'],
  catH: [110, 135, 160],
  chars: {chaewon: {default: null, hanbok: null}, rupert: {default: null}},
};
