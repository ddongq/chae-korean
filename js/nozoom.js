// 확대·축소 잠금. 아이패드 Safari는 viewport의 user-scalable=no를 무시하므로 손짓을 직접 막는다.
export function lockZoom(doc = document, win = window){
  const stop = e => { e.preventDefault(); };
  // 두 손가락 확대(Safari 전용 gesture 이벤트)
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(t => doc.addEventListener(t, stop, {passive: false}));
  // 두 손가락 이상 움직임
  doc.addEventListener('touchmove', e => { if (e.touches && e.touches.length > 1) e.preventDefault(); }, {passive: false});
  // 두 번 톡 확대: 화면 전체의 touch-action:none(style.css)과 dblclick 막기로 처리한다.
  // (touchend를 막으면 PIN·O/X를 빠르게 연달아 누를 때 두 번째 누름이 사라져서 쓰지 않는다)
  doc.addEventListener('dblclick', stop, {passive: false});
  // 그래도 확대된 채 남으면 viewport를 다시 써서 1배로 되돌린다
  const meta = doc.querySelector('meta[name=viewport]');
  const reset = () => {
    const vv = win.visualViewport;
    if (!meta || !vv || Math.abs(vv.scale - 1) < 0.01) return;
    const c = meta.getAttribute('content');
    meta.setAttribute('content', c + ', minimum-scale=1');
    setTimeout(() => meta.setAttribute('content', c), 60);
  };
  win.visualViewport?.addEventListener('resize', reset);
  win.addEventListener('orientationchange', reset);
}
