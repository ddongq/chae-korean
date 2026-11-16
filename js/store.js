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
  const db = {get: async k => kv.get(k), set: async (k, v) => { kv.set(k, v); },
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
    return {
      get: k => req(tx('state', 'readonly').get(k)),
      set: (k, v) => req(tx('state', 'readwrite').put(v, k)),
      getBlob: async id => (await req(tx('blobs', 'readonly').get(id))) ?? null,
      putBlob: (id, b) => req(tx('blobs', 'readwrite').put(b, id)),
    };
  }};
}

const validShape = s => s && s.v === 1 && Array.isArray(s.days) && s.pet && typeof s.items === 'object';

export async function openStore(backend){
  let db, ok = true;
  try { db = await (backend || idbBackend()).open(); }
  catch { ok = false; db = await memoryBackend().open(); }
  let saved = null;
  try { saved = await db.get('state'); } catch { ok = false; }
  const state = validShape(saved) ? {...newState(), ...saved} : newState();
  state.storageOk = ok;
  if (ok && typeof navigator !== 'undefined') navigator.storage?.persist?.().catch(() => {});
  let n = 0;
  const store = {
    state, ok,
    async save(){ try { await db.set('state', JSON.parse(JSON.stringify(store.state))); } catch { store.ok = false; store.state.storageOk = false; } },
    async putBlob(blob){ const id = `b${Date.now().toString(36)}${(n++).toString(36)}`; await db.putBlob(id, blob); return id; },
    getBlob: id => db.getBlob(id),
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
