def read_state(page, key="learning"):
    return page.evaluate("""async key => {
      const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('fae-design-win',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
      return new Promise((resolve,reject)=>{const tx=db.transaction('state');const r=tx.objectStore('state').get(key);tx.oncomplete=()=>{db.close();resolve(r.result);};tx.onerror=()=>reject(tx.error);});
    }""", key)


def seed_state(page, values):
    page.evaluate("""async values => {
      const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('fae-design-win',1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
      await new Promise((resolve,reject)=>{const tx=db.transaction('state','readwrite');for(const [key,value] of Object.entries(values))tx.objectStore('state').put(value,key);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);});
    }""", values)
    page.reload()
