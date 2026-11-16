// 상태 저장. 상태는 객체 하나(키 'state'), 녹음·손글씨는 블롭 저장소.
// 백엔드 모양: {open(): Promise<{get(k), set(k,v), getBlob(id), putBlob(id,blob)}>}
export const newState = () => ({
  v: 1, lastDay: null, days: [], currentUnit: 'u4',
  lessons: {}, units: {}, items: {}, queued: [], placed: [],
  pet: {words: [], stage: 1}, outfits: {}, wearing: {chaewon: null, rupert: null, cat: null},
  reviews: {}, dictation: {}, reading: {}, writings: {}, stamps: [],
  pinHash: null, storageOk: true,
});

export function memoryBackend(){
  const kv = new Map(), blobs = new Map();
  const db = {get: async k => kv.get(k), set: async (k, v) => { kv.set(k, v); }, keys: async () => [...kv.keys()],
              getBlob: async id => blobs.get(id) ?? null, putBlob: async (id, b) => { blobs.set(id, b); }};
  return {open: async () => db};
}

export function idbBackend(name = 'chae_korean'){
  const req = (r) => new Promise((ok, no) => { r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
  return {open: async () => {
    const o = indexedDB.open(name, 1);
    o.onupgradeneeded = () => { o.result.createObjectStore('state'); o.result.createObjectStore('blobs'); };
    const idb = await req(o);
    const tx = (s, m) => idb.transaction(s, m).objectStore(s);
    // 쓰기는 트랜잭션이 끝까지 성공(oncomplete)해야 완료. 용량 초과는 abort로 온다.
    const write = (s, fn) => new Promise((ok, no) => {
      const t = idb.transaction(s, 'readwrite');
      t.oncomplete = () => ok(); t.onabort = () => no(t.error || new Error('abort')); t.onerror = () => no(t.error);
      fn(t.objectStore(s));
    });
    return {
      get: k => req(tx('state', 'readonly').get(k)),
      set: (k, v) => write('state', st => st.put(v, k)),
      keys: () => req(tx('state', 'readonly').getAllKeys()),
      getBlob: async id => (await req(tx('blobs', 'readonly').get(id))) ?? null,
      putBlob: (id, b) => write('blobs', st => st.put(b, id)),
    };
  }};
}

const validShape = s => s && s.v === 1 && Array.isArray(s.days) && s.pet && typeof s.items === 'object';

export async function openStore(backend){
  const be = backend || idbBackend();
  let db, ok = true, recovered = false;
  try { db = await be.open(); }
  catch { ok = false; db = await memoryBackend().open(); }
  let saved = null;
  try { saved = await db.get('state'); } catch { ok = false; }
  if (saved != null && !validShape(saved)){
    // 모양이 다른 기록은 덮어쓰기 전에 따로 보관한다(부모님 화면에서 알림)
    recovered = true;
    try { await db.set('state.bak.' + Date.now(), saved); } catch { ok = false; }
  }
  const state = validShape(saved) ? {...newState(), ...saved} : newState();
  state.storageOk = ok;
  if (ok && typeof navigator !== 'undefined') navigator.storage?.persist?.().catch(() => {});
  let n = 0;
  const memBlobs = new Map();          // 블롭 저장이 실패했을 때 이 세션 동안만 보관
  const fail = () => { store.ok = false; store.state.storageOk = false; };
  // 한 번 실패하면 연결을 다시 열어 한 번 더(Safari가 오래 쉬면 연결이 끊긴다)
  async function retry(fn){
    try { return await fn(db); }
    catch {
      if (!store.ok) throw new Error('storage');
      try { db = await be.open(); return await fn(db); } catch (e) { throw e; }
    }
  }
  const store = {
    state, ok, recovered,
    async save(){ try { await retry(d => d.set('state', JSON.parse(JSON.stringify(store.state)))); } catch { fail(); } },
    async putBlob(blob){
      const id = `b${Date.now().toString(36)}${(n++).toString(36)}`;
      try { await retry(d => d.putBlob(id, blob)); } catch { fail(); memBlobs.set(id, blob); }
      return id;
    },
    getBlob: async id => memBlobs.get(id) ?? await db.getBlob(id).catch(() => null),
    exportJSON: () => JSON.stringify(store.state),
    importJSON(text){
      const s = JSON.parse(text);
      if (!validShape(s)) throw new Error('이 앱의 백업 파일이 아니에요');
      Object.keys(store.state).forEach(k => delete store.state[k]);
      Object.assign(store.state, newState(), s, {storageOk: store.ok});
    },
  };
  return store;
}
