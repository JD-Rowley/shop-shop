export function pluralize(name, count) {
  if (count === 1) {
    return name
  }
  return name + 's'
}

export function idbPromise(storeName, method, object) {
  return new Promise((resolve, reject) => {
    // open connection to database
    const request = window.indexedDB.open('shop-shop', 1);

    // create variables to hold reference to the database
    let db, tx, store;

    // if version has changed, or first time, run this method to create object stores
    request.onupgradeneeded = function(e) {
      const db = request.result;
      // create object store for each type of data
      db.createObjectStore('products', { keyPath: '_id' });
      db.createObjectStore('categories', { keyPath: '_id' });
      db.createObjectStore('cart', { keyPath: '_id' });
    };

    // handle errors with connecting
    request.onerror = function(e) {
      console.log('There was an error');
    };

    // on database open success
    request.onsuccess = function(e) {
      // save reference of database
      db = request.result;
      tx = db.transaction(storeName, 'readwrite');
      // save reference to that object store
      store = tx.objectStore(storeName);

      // if errors
      db.onerror = function(e) {
        console.log('error', e);
      };

      switch (method) {
        case 'put':
          store.put(object);
          resolve(object);
          break;
        case 'get':
          const all = store.getAll();
          all.onsuccess = function() {
            resolve(all.result);
          };
          break;
        case 'delete':
          store.delete(object._id);
          break;
        default:
          console.log('No valid method');
          break;
      }

      // when transaction complete, close connection
      tx.oncomplete = function() {
        db.close();
      };
    };
  });
}