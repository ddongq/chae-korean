// 그림 목록 — 새 그림이 오면 이 파일만 바꾼다.
// 좌표는 책방 그림을 가로 1400으로 줄인 기준(세로 1045).
export const REF_W = 1400, REF_H = 1045;
export const ASSETS = {
  shop: {alive: 'img/shop_iso.jpg', faded: null},     // faded가 null이면 CSS 흑백으로 대신
  // 구역 중심과 반지름(기준 좌표). 되살아날 때 이 둘레가 칠한 판으로 바뀐다.
  zones: {
    u0: {x: 300, y: 560, rx: 170, ry: 190}, u1: {x: 440, y: 250, rx: 170, ry: 140},
    u2: {x: 270, y: 715, rx: 130, ry: 110}, u3: {x: 810, y: 210, rx: 130, ry: 120},
    um: {x: 1060, y: 270, rx: 150, ry: 120}, u4: {x: 950, y: 640, rx: 150, ry: 110},
    u5: {x: 600, y: 530, rx: 150, ry: 170}, u6: {x: 1160, y: 620, rx: 140, ry: 150},
  },
  grid: {g: {F: {x: 690, y: 1000}, L: {x: 150, y: 792}, R: {x: 1292, y: 748}, N: 10}},
  // 소품(대역). src가 없으면 이름 실루엣.
  items: {
    'u4-cushions': {src: 'img/item_cushion.png', h: 64}, 'u4-teacart': {src: 'img/item_teatable.png', h: 74},
    'u4-vase': {src: null, h: 90}, 'u4-screen': {src: null, h: 90}, 'u4-guestbook': {src: null, h: 80},
    'u4-umbrella': {src: null, h: 80}, 'u4-lantern': {src: 'img/item_lamp.png', h: 90}, 'u4-plant': {src: 'img/item_plant.png', h: 80},
    'u4-bell': {src: null, h: 80},
  },
  cat: ['img/cat_1.png', 'img/cat_2.png', 'img/cat_3.png'],
  catH: [110, 135, 160],
  chars: {chaewon: {default: null, hanbok: null}, rupert: {default: null}},
};
