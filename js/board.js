// 펜 보드. 수학 앱 board.js의 펜 처리(필압, 펜을 쓰면 손 터치 무시)를 옮겼다.
// mode 'manuscript'면 원고지 칸을 아래 층에 그린다. 칸 위치는 숫자 몇 개(cell, gap, rowGap)로만 계산.
export function manuscriptCells({cols, rows, cell, gap = 0, rowGap = 0}){
  const out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
    out.push({i: r * cols + c, x: c * (cell + gap), y: r * (cell + rowGap), w: cell, h: cell});
  return out;
}

// 원고지 칸에 들어갈 글자들: 쉼표·마침표 뒤의 띄어쓰기는 칸을 비우지 않는다(초등 원고지 쓰기)
export function manuscriptChars(text){
  const out = [];
  [...text].forEach((ch, i, a) => { if (ch === ' ' && /[,.]/.test(a[i - 1] || '')) return; out.push(ch); });
  return out;
}

export function createBoard(host, {w, h, mode = 'free', cols = 12, rows = 2, cell = 98, gap = 6, rowGap = 40, indentFirst = false, ink = '#2F2A26', undo: keepUndo = false} = {}){
  host.style.position = 'relative'; host.style.width = w + 'px'; host.style.height = h + 'px';
  const mkCanvas = () => { const c = document.createElement('canvas'); Object.assign(c.style, {position: 'absolute', inset: '0', width: '100%', height: '100%'}); host.append(c); return c; };
  const bg = mkCanvas(), cv = mkCanvas();
  cv.style.touchAction = 'none';
  const k = Math.min(2, devicePixelRatio || 1);
  for (const c of [bg, cv]){ c.width = w * k; c.height = h * k; c.getContext('2d').setTransform(k, 0, 0, k, 0, 0); }
  const ctx = cv.getContext('2d'); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const cells = mode === 'manuscript' ? manuscriptCells({cols, rows, cell, gap, rowGap}) : [];
  if (cells.length){
    const b = bg.getContext('2d');
    b.fillStyle = '#fff'; b.strokeStyle = '#D9A79A'; b.lineWidth = 2;
    for (const c of cells){ b.fillRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2); b.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2); }
    if (indentFirst){ const c = cells[0]; b.fillStyle = 'rgba(79,127,176,.12)'; b.fillRect(c.x + 3, c.y + 3, c.w - 6, c.h - 6);
      b.fillStyle = 'rgba(79,127,176,.6)'; b.font = '16px sans-serif'; b.textAlign = 'center'; b.fillText('들여쓰기', c.x + c.w / 2, c.y + c.h / 2 + 6); }
  }
  let penSeen = false, drawing = null, last = null, strokes = 0;
  const undoStack = [];
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * w / r.width, (e.clientY - r.top) * h / r.height]; };
  const width = e => e.pointerType === 'pen' ? 2.4 + 4 * (e.pressure || .5) : 5;
  const block = e => e.preventDefault();
  cv.addEventListener('touchstart', block, {passive: false});
  cv.addEventListener('touchmove', block, {passive: false});      // Scribble·스크롤에 획을 뺏기지 않게
  cv.addEventListener('pointerdown', e => {
    if (e.pointerType === 'pen') penSeen = true;
    if (penSeen && e.pointerType === 'touch') return;
    try { cv.setPointerCapture(e.pointerId); } catch {}
    drawing = e.pointerId; last = pos(e);
    if (keepUndo){ undoStack.push(ctx.getImageData(0, 0, cv.width, cv.height)); if (undoStack.length > 10) undoStack.shift(); }   // 되돌리기를 쓸 때만 화면을 복사(메모리)
    ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(last[0], last[1], width(e) / 2, 0, Math.PI * 2); ctx.fill();
  });
  cv.addEventListener('pointermove', e => {
    if (drawing !== e.pointerId) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of (evs.length ? evs : [e])){ const p = pos(ev); ctx.strokeStyle = ink; ctx.lineWidth = width(ev); ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); last = p; }
  });
  const end = e => { if (drawing === e.pointerId){ drawing = null; strokes++; } };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  return {
    cells,
    clear(){ ctx.clearRect(0, 0, w, h); strokes = 0; undoStack.length = 0; },
    undo(){ const d = undoStack.pop(); if (d){ ctx.putImageData(d, 0, 0); strokes = Math.max(0, strokes - 1); } },
    strokes: () => strokes,
    isEmpty: () => strokes === 0,
    toBlob(){ const o = document.createElement('canvas'); o.width = cv.width; o.height = cv.height; const c = o.getContext('2d'); c.drawImage(bg, 0, 0); c.drawImage(cv, 0, 0);
      return new Promise(ok => o.toBlob(ok, 'image/png')); },
  };
}
